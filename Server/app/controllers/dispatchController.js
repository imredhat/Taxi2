const {departureCutoffSql}=require('../services/departureWindow');
const pool=require('../models/db');
const {fail,uuid,text,page,transaction}=require('../middleware/passenger');
const {vehicleMatchesClass}=require('../services/vehiclePackages');
const {settleDriver}=require('../services/driverRideSettlement');
exports.vehicleMatchesClass=vehicleMatchesClass;
const openStatuses="('accepted','arriving','arrived','in_progress')";
const selectable=`u.role='driver' AND u.is_active=true AND u.is_blocked=false AND v.is_active=true`;
// ponytail: one open assignment per driver/vehicle; replace with time-range scheduling when trip durations are authoritative.
const unoccupied=`NOT EXISTS (SELECT 1 FROM rides occupied WHERE occupied.status IN ${openStatuses} AND occupied.request_id IS DISTINCT FROM $1 AND (occupied.driver_id=dp.id OR occupied.vehicle_id=v.id))`;
function identifier(req){if(!uuid(req.params.id))fail(400,'شناسه درخواست معتبر نیست.');return req.params.id;}
async function requestRow(client,id,lock=false){const result=await client.query(`SELECT *,md5(to_jsonb(ride_requests)::text) AS edit_version FROM ride_requests WHERE id=$1${lock?' FOR UPDATE':''}`,[id]);if(!result.rowCount)fail(404,'درخواست سفر پیدا نشد.');return result.rows[0];}
async function currentRide(client,id,lock=false){const result=await client.query(`SELECT id,driver_id,vehicle_id,status,payment_status FROM rides WHERE request_id=$1 AND status NOT IN ('cancelled','expired') ORDER BY created_at DESC${lock?' FOR UPDATE':''}`,[id]);if(result.rowCount>1)fail(409,'برای این درخواست چند سفر ثبت شده است؛ ابتدا سوابق را بررسی کنید.');return result.rows[0]||null;}
function editable(request,ride){if(!['pending','searching','accepted'].includes(request.status)||ride&&ride.status!=='accepted')fail(409,'این سفر شروع شده یا بسته شده و قابل تغییر نیست.');}
exports.drivers=async(req,res)=>{
 const id=identifier(req),request=await requestRow(pool,id),assignment=await currentRide(pool,id);editable(request,assignment);
 const p=page(req.query),search=typeof req.query.search==='string'?req.query.search.trim():'';
 if(search.length>100)fail(400,'جستجو بیش از حد طولانی است.');
 const result=await pool.query(`SELECT dp.id AS driver_id,dp.status,dp.is_verified,u.first_name,u.last_name,u.phone,
 v.id AS vehicle_id,v.license_plate,v.car_class,v.color_fa,cm.name_fa AS model_name
 FROM driver_profiles dp JOIN users u ON u.id=dp.user_id JOIN vehicles v ON v.driver_id=dp.id LEFT JOIN car_models cm ON cm.id=v.model_id
 WHERE ${selectable} AND ${vehicleMatchesClass('$2')} AND ${unoccupied}
 AND ($3='' OR CONCAT_WS(' ',u.first_name,u.last_name,u.phone,v.license_plate) ILIKE '%'||$3||'%')
 ORDER BY u.last_name NULLS LAST,u.first_name NULLS LAST,dp.id,v.id LIMIT $4 OFFSET $5`,[id,request.car_class,search,p.limit,p.offset]);
 res.json({request:{id,status:request.status,car_class:request.car_class},assignment,items:result.rows,page:p.page,limit:p.limit});
};
exports.assign=(req,res)=>assign(req,res);
exports.accept=(req,res)=>assign(req,res,req.driver);
async function assign(req,res,self){
 const id=identifier(req),body={...req.body};
 if(self){
  if(!Number.isFinite(body.lat)||Math.abs(body.lat)>90||!Number.isFinite(body.lng)||Math.abs(body.lng)>180)fail(400,'موقعیت فعلی معتبر نیست.');
  if(!uuid(body.vehicle_id))fail(400,'خودروی فعال را انتخاب کنید.');
  Object.assign(body,{driver_id:self.id,expected_ride_id:null,expected_driver_id:null});
 }
 if(!uuid(body.driver_id)||!uuid(body.vehicle_id)||!Object.hasOwn(body,'expected_ride_id')||!Object.hasOwn(body,'expected_driver_id')||(body.expected_ride_id!==null&&!uuid(body.expected_ride_id))||(body.expected_driver_id!==null&&!uuid(body.expected_driver_id)))fail(400,'راننده و خودرو و نسخه انتخاب قبلی معتبر نیست.');
 const result=await transaction(async client=>{
  const request=await requestRow(client,id,true),old=await currentRide(client,id,true);editable(request,old);
  if(old?.driver_id===body.driver_id&&old?.vehicle_id===body.vehicle_id)return{ride:old,reused:true};
  if(old?.payment_status==='completed'&&old.driver_id!==body.driver_id)fail(409,'برای تغییر رانندهٔ سفر پرداخت‌شده با پشتیبانی هماهنگ کنید.');
  if((old?.id||null)!==body.expected_ride_id||(old?.driver_id||null)!==body.expected_driver_id)fail(409,'تخصیص این درخواست تغییر کرده است؛ فهرست را دوباره دریافت کنید.');
  const lockedDriver=await client.query('SELECT * FROM driver_profiles WHERE id=$1 FOR UPDATE',[body.driver_id]);
  if(self){
   const profile=lockedDriver.rows[0];
   if(!profile?.is_verified||profile.active_vehicle_id!==body.vehicle_id)fail(409,'حساب تأییدشده و خودروی فعال لازم است.');
   const nearby=await client.query(`SELECT 1 FROM ride_requests WHERE id=$1 AND (ride_type='intercity' OR (ride_type='normal' AND client_reference IS NOT NULL))
    AND status IN ('pending','searching') AND scheduled_at>${departureCutoffSql} AND estimated_fare IS NOT NULL
    AND ST_DWithin(pickup_location,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,10000)`,[id,body.lng,body.lat]);
   if(!nearby.rowCount)fail(409,'این سفر دیگر در فهرست سفرهای قابل قبول شما نیست.');
  }
  await client.query('SELECT id FROM vehicles WHERE id=$1 FOR UPDATE',[body.vehicle_id]);
  const candidate=await client.query(`SELECT dp.id,u.id AS user_id,${unoccupied} AS available FROM driver_profiles dp JOIN users u ON u.id=dp.user_id JOIN vehicles v ON v.driver_id=dp.id WHERE dp.id=$3 AND v.id=$4 AND ${vehicleMatchesClass('$2')} AND ${selectable} FOR SHARE OF u`,[id,request.car_class,body.driver_id,body.vehicle_id]);
  if(!candidate.rowCount)fail(409,'حساب یا خودرو فعال نیست، یا کلاس خودرو با سفر هم‌خوانی ندارد.');
  if(!candidate.rows[0].available)fail(409,'راننده یا خودرو سفر باز دارد. پس از تکمیل سفر جاری می‌توانید سفر دیگری بپذیرید.');
  let ride;
  if(old){ride=(await client.query('UPDATE rides SET driver_id=$2,vehicle_id=$3,updated_at=NOW() WHERE id=$1 RETURNING id,driver_id,vehicle_id,status',[old.id,body.driver_id,body.vehicle_id])).rows[0];}
  else{
   ride=(await client.query(`INSERT INTO rides(request_id,passenger_id,driver_id,vehicle_id,ride_type,car_class,status,pickup_location,pickup_address,dropoff_location,dropoff_address,route_polyline,distance_km,duration_minutes,fare,fare_breakdown)
    SELECT id,passenger_id,$2,$3,ride_type,car_class,'accepted',pickup_location,pickup_address,dropoff_location,dropoff_address,route_polyline,distance_km,duration_minutes,estimated_fare,booking_details->'fare' FROM ride_requests WHERE id=$1 RETURNING id,driver_id,vehicle_id,status`,[id,body.driver_id,body.vehicle_id])).rows[0];
   const points=[...(request.booking_details?.starts||[]),...(request.booking_details?.ends||[])].slice(1,-1);
   for(const [index,point] of points.entries())await client.query('INSERT INTO ride_stops(ride_id,stop_order,location,address) VALUES($1,$2,ST_SetSRID(ST_MakePoint($3,$4),4326)::geography,$5)',[ride.id,index+1,point.lng,point.lat,point.address]);
   const {rows:[prepaid]}=await client.query("SELECT id,amount FROM payment_gateway_transactions WHERE request_id=$1 AND purpose='full' AND status='completed'",[id]);
   if(prepaid){
    await settleDriver(client,ride.id,prepaid.amount);
    await client.query("UPDATE rides SET payment_status='completed',payment_method='gateway' WHERE id=$1",[ride.id]);
    await client.query('UPDATE payment_gateway_transactions SET ride_id=$2 WHERE id=$1',[prepaid.id,ride.id]);
   }
  }
  await client.query("UPDATE ride_requests SET status='accepted',updated_at=NOW() WHERE id=$1",[id]);
  const recipients=[request.passenger_id,candidate.rows[0].user_id];
  const driverName=self?[self.first_name,self.last_name].filter(Boolean).join(' '):'';
  const noticeBody=self?(driverName?`${driverName} سفر شما را پذیرفت.`:'راننده سفر شما را پذیرفت.'):'اطلاعات تخصیص سفر در سامانه به‌روزرسانی شد.';
  if(old&&old.driver_id!==body.driver_id){const previous=await client.query('SELECT user_id FROM driver_profiles WHERE id=$1',[old.driver_id]);if(previous.rowCount)recipients.push(previous.rows[0].user_id);}
  for(const userId of new Set(recipients))await client.query("INSERT INTO notifications(user_id,type,title,title_fa,body,body_fa,data) VALUES($1,'ride',$2,$2,$3,$3,$4::jsonb)",[userId,old?'راننده سفر تغییر کرد':'راننده سفر مشخص شد',noticeBody,JSON.stringify({ride_id:ride.id,reservation_id:id})]);
  return{ride,reused:false};
 });res.status(result.reused?200:201).json(result);
}
const cancellationReasons={
 vehicle_issue:'خرابی خودرو',
 emergency:'شرایط اضطراری شخصی',
 illness:'بیماری یا مشکل جسمی',
 road_blocked:'مسدود بودن مسیر',
 schedule_conflict:'تداخل برنامهٔ کاری',
 cannot_reach_pickup:'امکان رسیدن به مبدأ را ندارم',
};
const cancellableStatuses=['accepted','arriving','arrived'];
const activeGatewayPayment="status IN ('initializing','pending','unknown')";
const canCancel=ride=>cancellableStatuses.includes(ride.status)&&[null,'pending','failed'].includes(ride.payment_status)&&!ride.has_active_payment;
exports.activeGatewayPayment=activeGatewayPayment;
exports.cancellationDetails=ride=>({
 cancellation_label:Object.hasOwn(cancellationReasons,ride.cancellation_reason)?cancellationReasons[ride.cancellation_reason]:null,
 cancellation_options:canCancel(ride)?Object.entries(cancellationReasons).map(([id,label])=>({id,label})):[],
});
exports.cancelDriverTrip=async(req,res)=>{
 const id=identifier(req),reason=req.body?.reason;
 if(typeof reason!=='string'||!Object.hasOwn(cancellationReasons,reason))fail(400,'یکی از دلایل لغو را انتخاب کنید.');
 const result=await transaction(async client=>{
  const values=[id,req.driver.id];
  const find='SELECT id,request_id,passenger_id,status,payment_status,cancelled_by,cancellation_reason FROM rides WHERE id=$1 AND driver_id=$2';
  const candidate=(await client.query(find,values)).rows[0];
  if(!candidate)fail(404,'سفر پیدا نشد.');
  if(candidate.request_id)await requestRow(client,candidate.request_id,true);
  const ride=(await client.query(find+' FOR UPDATE',values)).rows[0];
  if(!ride)fail(404,'سفر پیدا نشد.');
  if(ride.status==='cancelled'&&ride.cancelled_by===req.user.userId&&ride.cancellation_reason===reason)return {id,status:'cancelled'};
  if(!canCancel(ride))fail(409,'در وضعیت فعلی امکان لغو سفر توسط راننده وجود ندارد.');
  const payment=await client.query(`SELECT 1 FROM payment_gateway_transactions WHERE ride_id=$1 AND ${activeGatewayPayment} LIMIT 1`,[id]);
  if(payment.rowCount)fail(409,'پرداخت کرایه در جریان است. پس از مشخص شدن نتیجه دوباره بررسی کنید.');
  await client.query("UPDATE rides SET status='cancelled',cancelled_by=$2,cancellation_reason=$3,cancelled_at=NOW(),updated_at=NOW() WHERE id=$1",[id,req.user.userId,reason]);
  const request=ride.request_id&&(await client.query(`UPDATE ride_requests
   SET status=CASE WHEN scheduled_at>${departureCutoffSql} THEN 'searching'::ride_status ELSE 'cancelled'::ride_status END,updated_at=NOW()
   WHERE id=$1 AND status='accepted' RETURNING status`,[ride.request_id])).rows[0];
  const notice=request?.status==='searching'?'راننده سفر را لغو کرد. درخواست شما دوباره برای رانندگان قابل پذیرش است.':'راننده سفر را لغو کرد.';
  await client.query("INSERT INTO notifications(user_id,type,title,title_fa,body,body_fa,data) VALUES($1,'ride',$2,$2,$3,$3,$4::jsonb)",[
   ride.passenger_id,'لغو سفر توسط راننده',notice,JSON.stringify({ride_id:id,reservation_id:ride.request_id}),
  ]);
  return {id,status:'cancelled'};
 });
 res.json({trip:result});
};
function proposedTrip(request,body){return {...request.booking_details,scheduledAt:body.scheduled_at,personCount:body.passenger_count};}
const sameCarClass = (first, second) => first === second;

exports.previewFare=async(req,res)=>{
 const request=await requestRow(pool,identifier(req)),ride=await currentRide(pool,request.id);editable(request,ride);
 if(!request.booking_details?.fare)fail(400,'برای این درخواست استعلام کرایه ثبت نشده است.');
 const quote=await require('../services/fareQuotes').createQuote(request.passenger_id,proposedTrip(request,req.body||{}),request.ride_type==='normal'?'normal':'intercity');
 const fare=quote.packages.find(item=>sameCarClass(item.car_class,request.car_class)&&item.available);
 if(!fare)fail(409,'نرخ فعال این کلاس پیدا نشد.');
 res.json({quoteId:quote.quoteId,packageId:fare.id,amount:fare.amount,breakdown:fare.breakdown,warnings:fare.warnings,expiresAt:quote.expiresAt});
};
exports.edit=async(req,res)=>{
 const id=identifier(req),body=req.body||{};
 if(Object.keys(body).some(key=>!['passenger_count','scheduled_at','notes','expected_version','quoteId','packageId'].includes(key))||!Number.isInteger(body.passenger_count)||body.passenger_count<1||body.passenger_count>8||!text(body.notes,0,2000)||typeof body.expected_version!=='string'||!/^[0-9a-f]{32}$/.test(body.expected_version))fail(400,'اطلاعات ویرایش معتبر نیست.');
 if(body.scheduled_at!==null&&(!Number.isFinite(Date.parse(body.scheduled_at))||Date.parse(body.scheduled_at)<=Date.now()))fail(400,'زمان حرکت باید در آینده باشد.');
 const updated=await transaction(async client=>{
  const request=await requestRow(client,id,true),ride=await currentRide(client,id,true);editable(request,ride);
  if(request.edit_version!==body.expected_version)fail(409,'اطلاعات درخواست تغییر کرده است؛ فهرست را دوباره دریافت کنید.');
  if(request.scheduled_at&&body.scheduled_at===null)fail(400,'زمان حرکت رزرو را مشخص کنید.');
  const details=request.booking_details?{...request.booking_details,personCount:body.passenger_count}:null;
  let quote=null;
  if(details?.fare&&(new Date(request.scheduled_at).getTime()!==Date.parse(body.scheduled_at)||request.passenger_count!==body.passenger_count)){
   const deposit=await client.query("SELECT 1 FROM payment_gateway_transactions WHERE request_id=$1 AND purpose IN ('deposit','full') AND status='completed'",[id]);
   if(deposit.rowCount)fail(409,'برای تغییر زمان یا تعداد مسافران رزروی که پیش‌پرداخت دارد، با پشتیبانی هماهنگ کنید.');
   if(!uuid(body.quoteId)||!uuid(body.packageId))fail(409,'ابتدا کرایه جدید ویرایش را دریافت و تأیید کنید.');
   quote=await require('../services/fareQuotes').loadQuote(client,request.passenger_id,{...proposedTrip(request,body),quoteId:body.quoteId,packageId:body.packageId});
   if(quote.route.ride_type!==(request.ride_type==='normal'?'normal':'intercity')||!sameCarClass(quote.fare.car_class,request.car_class))fail(409,'کلاس استعلام با درخواست هماهنگ نیست.');
   if(quote.route.legs)details.routeLegs=quote.route.legs;
   details.packageId=body.packageId;details.fare={amount:quote.fare.amount,currency:'IRR',breakdown:quote.fare.breakdown,warnings:quote.fare.warnings,quoteId:body.quoteId};
   if(ride)await client.query('UPDATE rides SET fare=$2,fare_breakdown=$3::jsonb WHERE id=$1',[ride.id,quote.fare.amount,JSON.stringify(details.fare)]);
  }
  if(details&&body.scheduled_at){const parts=new Intl.DateTimeFormat('en-US-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',numberingSystem:'latn'}).formatToParts(new Date(body.scheduled_at));const get=type=>parts.find(p=>p.type===type).value;details.date=`${get('year')}-${get('month')}-${get('day')}`;details.time=`${get('hour')}:${get('minute')}`;}
  return(await client.query('UPDATE ride_requests SET passenger_count=$2,scheduled_at=$3,notes=$4,booking_details=$5::jsonb,estimated_fare=COALESCE($6,estimated_fare),updated_at=NOW() WHERE id=$1 RETURNING id,status,passenger_count,scheduled_at,notes,updated_at,estimated_fare',[id,body.passenger_count,body.scheduled_at,body.notes.trim(),details?JSON.stringify(details):null,quote?.fare.amount||null])).rows[0];
 });res.json({request:updated});
};
