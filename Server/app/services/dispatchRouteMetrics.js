const {createHash}=require('node:crypto');
const pool=require('../models/db');
const {transaction}=require('../middleware/passenger');
const {stopTimes}=require('./fareContext');

async function cachedMetrics(scope,points,ttl){
 const coordinates=points.map(({lat,lng},index)=>scope==='approach'&&index===0
  ?[lat.toFixed(3),lng.toFixed(3)]:[lat,lng]);
 const key=createHash('sha256').update(JSON.stringify([scope,coordinates])).digest('hex');
 const lookup=async db=>(await db.query('SELECT metrics FROM dispatch_route_cache WHERE key=$1 AND expires_at>NOW()',[key])).rows[0]?.metrics;
 const hit=await lookup(pool);
 if(hit)return hit;
 return transaction(async client=>{
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[key]);
  const cached=await lookup(client);
  if(cached)return cached;
  const metrics=await stopTimes(points);
  await client.query(`INSERT INTO dispatch_route_cache(key,metrics,expires_at) VALUES($1,$2,NOW()+$3*INTERVAL '1 second')
   ON CONFLICT(key) DO UPDATE SET metrics=EXCLUDED.metrics,expires_at=EXCLUDED.expires_at`,[key,JSON.stringify(metrics),ttl]);
  await client.query('DELETE FROM dispatch_route_cache WHERE key IN (SELECT key FROM dispatch_route_cache WHERE expires_at<=NOW() ORDER BY expires_at LIMIT 30 FOR UPDATE SKIP LOCKED)');
  return metrics;
 });
}

async function availableMetrics(promise,count){
 try{return await promise;}
 catch(error){
  if(![502,503].includes(error.status))throw error;
  return {minutes:Array(count).fill(null),meters:Array(count).fill(null)};
 }
}

function storedRouteMetrics(offer,count){
 const legs=offer.routeLegs;
 const stored=Array.isArray(legs)&&legs.length===count&&legs.every(leg=>Number.isFinite(leg?.seconds)&&Number.isFinite(leg?.meters));
 return stored?{minutes:legs.map(leg=>Math.ceil(leg.seconds/60)),meters:legs.map(leg=>leg.meters)}
  :count===1&&offer.duration_minutes!=null&&offer.distance_km!=null
   ?{minutes:[offer.duration_minutes],meters:[Math.round(Number(offer.distance_km)*1000)]}
   :null;
}

async function offerStopTimes(offer,position){
 const points=[...offer.starts,...offer.ends];
 const count=points.length-1;
 const trip=storedRouteMetrics(offer,count)??cachedMetrics('itinerary',points,30*86400);
 const [approach,route]=await Promise.all([
  approachMetrics(position,points[0]),
  availableMetrics(trip,count),
 ]);
 return {minutes:[...approach.minutes,...route.minutes],meters:[...approach.meters,...route.meters]};
}
const approachMetrics=(position,pickup)=>availableMetrics(cachedMetrics('approach',[position,pickup],600),1);
module.exports=offerStopTimes;
module.exports.storedRouteMetrics=storedRouteMetrics;
module.exports.approachMetrics=approachMetrics;
