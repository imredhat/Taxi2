const {isDepartureOpen}=require('./departureWindow');
const pool=require('../models/db');
const {offerColumns,availableOffer,offerFromRow,offerClass}=require('./driverOffers');

const prefix='{taxi2:dispatch:v1}:';
const geo=prefix+'geo', data=prefix+'data', expiry=prefix+'expiry', ready=prefix+'ready';
let redis, healthy=false;
const channel='taxi2:dispatch:v1:changes';
const sql=`SELECT ${offerColumns}, q.passenger_id FROM ride_requests q WHERE ${availableOffer}`;
const maxGeoLatitude=85.05112878;
const validPoint=point=>typeof point?.lat==='number'&&typeof point.lng==='number'&&Number.isFinite(point.lat)
  &&Number.isFinite(point.lng)&&Math.abs(point.lat)<=maxGeoLatitude&&Math.abs(point.lng)<=180;
const cell=(lat,lng)=>`${Math.floor(lat*10)}:${lng===180?-1800:Math.floor(lng*10)}`;
const room=(carClass,point)=>`offers:${offerClass(carClass)}:${cell(point.lat,point.lng)}`;

function roomsFor(carClass,point){
  if(!carClass||!validPoint(point))return [];
  const {lat,lng}=point;
  const latCells=2;
  const lngCells=Math.ceil(1/Math.cos((Math.abs(lat)+0.1)*Math.PI/180))+1;
  const y=Math.floor(lat*10),x=Math.floor(lng*10),rooms=[];
  for(let dy=-latCells;dy<=latCells;dy++){
    for(let dx=-lngCells;dx<=lngCells;dx++){
      const column=((x+dx+1800)%3600+3600)%3600-1800;
      rooms.push(`offers:${offerClass(carClass)}:${y+dy}:${column}`);
    }
  }
  return rooms;
}

function writeOffer(batch,row,keys=[geo,data,expiry]){
  const [geoKey,dataKey,expiryKey]=keys;
  const {passenger_id,car_class,...fields}=row;
  const offer=offerFromRow(fields);
  batch.addCommand(['GEOADD',geoKey,String(row.pickup_lng),String(row.pickup_lat),row.id]);
  batch.hSet(dataKey,row.id,JSON.stringify({carClass:offerClass(car_class),offer}));
  batch.zAdd(expiryKey,{score:Date.parse(offer.offer_expires_at),value:row.id});
}

function removeOffer(batch,id){
  batch.zRem(geo,id).hDel(data,id).zRem(expiry,id);
}

async function rebuild(client){
  const result=await client.query(sql);
  const temp=[geo,data,expiry].map(key=>key+':loading');
  await redis.del(temp);
  for(let start=0;start<result.rows.length;start+=250){
    const batch=redis.multi();
    for(const row of result.rows.slice(start,start+250)){
      if(validPoint({lat:row.pickup_lat,lng:row.pickup_lng}))writeOffer(batch,row,temp);
    }
    await batch.exec();
  }
  const batch=redis.multi();
  for(const [index,key] of [geo,data,expiry].entries()){
    if(await redis.exists(temp[index]))batch.rename(temp[index],key);
    else batch.del(key);
  }
  await batch.set(ready,'1').exec();
}

async function nearby(carClass,point){
  if(!isReady()||!validPoint(point))return null;
  try{
    const rows=await redis.withCommandOptions({signal:AbortSignal.timeout(750)}).eval(`
      if redis.call('EXISTS', KEYS[1]) == 0 then return false end
      local ids = redis.call('GEOSEARCH', KEYS[2], 'FROMLONLAT', ARGV[1], ARGV[2], 'BYRADIUS', '10', 'km')
      local rows = {}
      for _, id in ipairs(ids) do
        local row = redis.call('HGET', KEYS[3], id)
        if row then rows[#rows+1] = row end
      end
      return rows
    `,{keys:[ready,geo,data],arguments:[String(point.lng),String(point.lat)]});
    if(!rows)return null;
    const now=Date.now();
    return rows.filter(Boolean).map(JSON.parse)
      .filter(item=>item.carClass===offerClass(carClass)&&isDepartureOpen(item.offer.scheduled_at,now))
      .map(item=>item.offer).sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||'')||b.id.localeCompare(a.id));
  }catch(error){
    return null;
  }
}

async function project(rebuildNeeded){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const lock=await client.query('SELECT pg_try_advisory_xact_lock(824627419) AS acquired');
    if(!lock.rows[0].acquired){
      await client.query('ROLLBACK');
      return null;
    }
    const rebuilt=rebuildNeeded||!await redis.exists(ready);
    if(rebuilt)await rebuild(client);
    const {rows}=await client.query('SELECT * FROM dispatch_outbox ORDER BY id LIMIT 200');
    const {rows:messages}=await client.query(`SELECT e.message_id,e.recipient_id,e.ride_id,e.reservation_id,
      (r.status IN ('accepted','arriving','arrived','in_progress') AND (e.recipient_id=r.passenger_id OR e.recipient_id=dp.user_id)) AS eligible
      FROM chat_events e JOIN rides r ON r.id=e.ride_id LEFT JOIN driver_profiles dp ON dp.id=r.driver_id
      WHERE e.broadcast_at IS NULL ORDER BY e.created_at,e.message_id LIMIT 200 FOR UPDATE OF e SKIP LOCKED`);
    const requestIds=[...new Set(rows.map(row=>row.request_id))];
    const latest=requestIds.length?await client.query(sql+' AND q.id=ANY($1::uuid[])',[requestIds]):{rows:[]};
    const byId=new Map(latest.rows.map(row=>[row.id,row]));
    const expired=await redis.zRangeByScore(expiry,0,Date.now(),{LIMIT:{offset:0,count:200}});
    const expiredRows=expired.length?await redis.hmGet(data,expired):[];
    const batch=redis.multi();
    for(const id of expired)removeOffer(batch,id);
    for(const id of requestIds){
      const row=byId.get(id);
      if(row&&validPoint({lat:row.pickup_lat,lng:row.pickup_lng}))writeOffer(batch,row);
      else removeOffer(batch,id);
    }
    if(expired.length||requestIds.length)await batch.exec();
    const changedRooms=new Set();
    const addRooms=(type,lat,lng)=>roomsFor(type,{lat,lng}).forEach(name=>changedRooms.add(name));
    for(const raw of expiredRows.filter(Boolean)){
      const {carClass,offer}=JSON.parse(raw);
      addRooms(carClass,offer.pickup_lat,offer.pickup_lng);
    }
    for(const row of latest.rows)addRooms(row.car_class,row.pickup_lat,row.pickup_lng);
    const passengers=new Map();
    for(const row of rows){
      addRooms(row.previous_class,row.previous_lat,row.previous_lng);
      const ids=passengers.get(row.passenger_id)||new Set();
      ids.add(row.request_id);
      passengers.set(row.passenger_id,ids);
    }
    if(rebuilt||changedRooms.size||passengers.size||messages.length){
      await redis.publish(channel,JSON.stringify({
        rebuilt,messages:messages.filter(message=>message.eligible),rooms:[...changedRooms],passengers:[...passengers].map(([id,ids])=>[id,[...ids]]),
      }));
    }
    if(messages.length)await client.query('UPDATE chat_events SET broadcast_at=NOW() WHERE message_id=ANY($1::uuid[])',[messages.map(message=>message.message_id)]);
    if(rows.length)await client.query('DELETE FROM dispatch_outbox WHERE id=ANY($1::bigint[])',[rows.map(row=>row.id)]);
    await client.query('COMMIT');
    return {more:rows.length===200||expired.length===200||messages.length===200};
  }catch(error){
    await client.query('ROLLBACK').catch(()=>{});
    throw error;
  }finally{
    client.release();
  }
}

function isReady(){return healthy&&redis?.isReady===true;}

function start(client,io,busReady){
  redis=client;
  let lastError,rebuildNeeded=true,running=false,pending=false,wakeQueued=false,timer;
  client.on('reconnecting',()=>{healthy=false;rebuildNeeded=true;});
  function wake(){
    if(running){pending=true;return;}
    if(wakeQueued)return;
    wakeQueued=true;
    clearTimeout(timer);
    timer=setTimeout(tick,20).unref();
  }
  async function listen(){
    let connection;
    const retry=()=>{
      if(!connection)return;
      connection.release(true);
      connection=undefined;
      setTimeout(listen,5000).unref();
    };
    try{
      connection=await pool.connect();
      connection.once('error',retry);
      connection.on('notification',wake);
      await connection.query('LISTEN taxi2_dispatch_changed');
    }catch{
      if(connection)retry();
      else setTimeout(listen,5000).unref();
    }
  }
  async function tick(){
    running=true;
    wakeQueued=false;
    try{
      if(redis.isReady&&busReady()){
        const result=await project(rebuildNeeded);
        if(result){
          if(!healthy)console.info('Dispatch basket ready');
          healthy=true;
          rebuildNeeded=false;
          pending ||= result.more;
        }
        else if(!rebuildNeeded)healthy=Boolean(await redis.exists(ready));
      }else healthy=false;
      lastError=undefined;
    }catch(error){
      healthy=false;
      io.local.disconnectSockets(true);
      const label=error.code||error.name;
      if(lastError!==label)console.error('Dispatch projection:',label);
      lastError=label;
    }finally{
      running=false;
      timer=setTimeout(tick,pending?20:1000).unref();
      pending=false;
    }
  }
  void listen();
  void tick();
}

module.exports={nearby,room,validPoint,start,isReady,channel};
