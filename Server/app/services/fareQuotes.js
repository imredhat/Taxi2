const pool=require('../models/db');
const {fail}=require('../middleware/passenger');
const calculator=require('./fareCalculator');
const contextProvider=require('./fareContext');
const {offerClass}=require('./vehiclePackages');
function unavailableReason(carClass,rideType){
 if(carClass==='eco_city'&&rideType==='intercity')return 'این پکیج مخصوص سفرهای شهری است.';
 if(carClass==='eco_intercity'&&rideType==='normal')return 'این پکیج مخصوص سفرهای بین‌شهری است.';
 return null;
}
async function catalog(db=pool,origin,rideType){
 const fares=(await db.query("SELECT id,car_class,ride_type,city,base_fare,per_km_rate,per_minute_rate,min_fare,max_fare,waiting_per_minute,updated_at FROM base_fares WHERE is_active=true AND ride_type IN ('intercity','normal') ORDER BY updated_at DESC,id")).rows;
 return Object.entries(calculator.names).map(([car_class,label])=>{
  const cityOnly=car_class==='eco_city';
  const preferredType=rideType||(cityOnly?'normal':'intercity');
  const matching=unavailableReason(car_class,rideType)?[]:fares.filter(row=>row.car_class===car_class
    &&(preferredType!=='normal'||row.ride_type==='normal')
    &&(!row.city||row.city==='default'||origin&&calculator.city(row.city)===calculator.city(origin)))
    .sort((a,b)=>Number(!!b.city&&b.city!=='default')-Number(!!a.city&&a.city!=='default')||Number(b.ride_type===preferredType)-Number(a.ride_type===preferredType));
  const fare=matching[0];
  return{...(fare||{id:car_class,car_class}),label,available:!!fare,rate_source:fare?.ride_type||null};
 });
}
async function createQuote(userId,body,forcedType){
 const points=calculator.validateInput(body),context=await contextProvider.route(points,body.scheduledAt);
 const rideType=forcedType||(context.sameCity?'normal':'intercity');
 const db=pool;
 const categories={intercity:'intercity_pricing',surge:'surge_rules',time:'time_pricing_rules',weather:'weather_pricing_rules',road:'road_condition_pricing',tolls:'toll_rules'},rules={};
 for(const [key,table] of Object.entries(categories)){
  if(key==='intercity'&&rideType==='normal'){rules[key]=[];continue;}
  const geo=['road','tolls'].includes(key);
  const query=geo?`SELECT *,CASE WHEN region IS NOT NULL AND $1::text IS NOT NULL THEN ST_Intersects(region::geometry,ST_SetSRID(ST_GeomFromGeoJSON($1),4326)) ELSE false END AS region_matches FROM ${table} WHERE is_active=true`:`SELECT * FROM ${table} WHERE is_active=true`;
  rules[key]=(await db.query(query,geo?[context.geometry?JSON.stringify(context.geometry):null]:[])).rows;
 }
 const supply=(await db.query(`SELECT v.car_class,COUNT(DISTINCT dp.id)::int AS count FROM driver_profiles dp JOIN users u ON u.id=dp.user_id JOIN vehicles v ON v.driver_id=dp.id AND v.id=dp.active_vehicle_id JOIN driver_locations l ON l.driver_id=dp.id
 WHERE dp.status='online' AND u.is_active=true AND u.is_blocked=false AND v.is_active=true AND l.updated_at>NOW()-INTERVAL '15 minutes' AND ST_DWithin(l.location,ST_SetSRID(ST_MakePoint($1,$2),4326)::geography,30000)
 AND NOT EXISTS(SELECT 1 FROM rides r WHERE r.driver_id=dp.id AND r.status IN ('accepted','arriving','arrived','in_progress')) GROUP BY v.car_class`,[points[0].lng,points[0].lat])).rows;
 context.supply={};
 for(const row of supply){const key=offerClass(row.car_class);context.supply[key]=(context.supply[key]||0)+row.count;}
 if(rideType==='normal')context.supply.eco_city=context.supply.eco_intercity||0;
 const packages=(await catalog(db,context.origin_city,rideType)).map(fare=>fare.available?{...fare,...calculator.calculate(fare,rules,context)}:{...fare,amount:null,breakdown:[],warnings:[unavailableReason(fare.car_class,rideType)||'برای این کلاس نرخ فعال ثبت نشده است.']});
 const result={packages,currency:'IRR',route:{ride_type:rideType,meters:context.meters,seconds:context.seconds,legs:context.legs,origin_city:context.origin_city,destination_city:context.destination_city},context:{weather_available:context.weather_available,weather_conditions:context.weather_conditions,weather_source:'Open-Meteo',weather_scope:'origin_destination',supply_as_of:new Date().toISOString()},polyline:context.polyline};
 const quote=(await db.query("INSERT INTO passenger_fare_quotes(user_id,request_hash,result,expires_at) VALUES($1,$2,$3::jsonb,NOW()+INTERVAL '10 minutes') RETURNING id,expires_at",[userId,calculator.fingerprint(body),JSON.stringify(result)])).rows[0];
 return{...result,quoteId:quote.id,expiresAt:quote.expires_at};
}
async function loadQuote(db,userId,body){
 const record=(await db.query('SELECT result,request_hash,expires_at FROM passenger_fare_quotes WHERE id=$1 AND user_id=$2',[body.quoteId,userId])).rows[0];
 if(!record||new Date(record.expires_at).getTime()<=Date.now())fail(409,'اعتبار قیمت تمام شده است؛ دوباره صفحه انتخاب ناوگان را باز کنید.');
 if(record.request_hash!==calculator.fingerprint(body))fail(409,'اطلاعات سفر با استعلام قیمت مطابقت ندارد؛ قیمت را دوباره دریافت کنید.');
 const fare=record.result.packages.find(p=>p.id===body.packageId&&p.available&&p.amount);
 if(!fare)fail(400,'کلاس خودرو در این استعلام قابل رزرو نیست.');
 if(BigInt(fare.amount)%10000n!==0n)fail(409,'قیمت به‌روزرسانی شده است؛ دوباره صفحه انتخاب ناوگان را باز کنید.');
 return{fare,route:{ride_type:'intercity',...record.result.route},polyline:record.result.polyline};
}
module.exports={catalog,createQuote,loadQuote};
