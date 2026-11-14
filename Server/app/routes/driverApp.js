const router = require('express').Router();
const {options,ratingColumn,rateTrip}=require('../services/rideRating');
const fs=require('node:fs/promises');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const pool = require('../models/db');
const { verifyToken } = require('../middleware/auth');
const { handler, fail, uuid, text, page, transaction } = require('../middleware/passenger');
const { accept, cancelDriverTrip, cancellationDetails, vehicleMatchesClass, activeGatewayPayment } = require('../controllers/dispatchController');
const {paidDeposit}=require('../controllers/passengerPaymentController');
const {companyPortion}=require('../services/driverRideSettlement');
const offerStopTimes = require('../services/dispatchRouteMetrics');
const {offerColumns,availableOffer,offerFromRow}=require('../services/driverOffers');
const basket=require('../services/offerBasket');

router.use(verifyToken, handler(async (req, res, next) => {
  if (req.user.role !== 'driver' || !uuid(req.user.userId)) fail(403, 'با حساب راننده وارد شوید.');
  const result = await pool.query(`SELECT dp.id, dp.is_verified, COALESCE(dp.rating,5)::float AS rating, dp.active_vehicle_id, v.car_class AS active_class, u.first_name, u.last_name
    FROM driver_profiles dp JOIN users u ON u.id=dp.user_id
    LEFT JOIN vehicles v ON v.id=dp.active_vehicle_id AND v.driver_id=dp.id AND v.is_active
    WHERE u.id=$1 AND u.role='driver' AND u.is_active AND NOT u.is_blocked`, [req.user.userId]);
  if (!result.rowCount) fail(403, 'حساب راننده در دسترس نیست.');
  req.driver = result.rows[0];
  next();
}));

const {registerDevice,removeDevice}=require('../controllers/passengerController');
router.post('/devices',handler(registerDevice));
router.delete('/devices/:id',handler(removeDevice));

router.get('/profile-photo',handler(async (req,res)=>{
  const {rows:[photo]}=await pool.query(`SELECT avatar_url,(SELECT file_url FROM driver_documents WHERE driver_id=$2
    AND document_type='selfie' ORDER BY created_at DESC,id DESC LIMIT 1) AS selfie FROM users WHERE id=$1`,[req.user.userId,req.driver.id]);
  if(/^data:image\/(jpeg|png);base64,/.test(photo?.avatar_url??''))return res.json({image:photo.avatar_url});
  const file=photo?.avatar_url?.match(localUploadImage)??photo?.selfie?.match(localUploadImage);
  if(!file)return res.json({image:null});
  return sendDriverImage(res,path.resolve(__dirname,'../../uploads'),file);
}));

router.put('/profile-photo',handler(async (req,res)=>{
  const {bytes,extension}=uploadedImage(req.body?.base64);
  const image=`data:image/${extension==='jpg'?'jpeg':extension};base64,${bytes.toString('base64')}`;
  await pool.query('UPDATE users SET avatar_url=$1 WHERE id=$2',[image,req.user.userId]);
  res.json({image});
}));

router.get('/dashboard', handler(async (req, res) => {
  const vehicles = await pool.query(`SELECT v.id,v.license_plate,v.car_class,v.color,v.year,v.is_active,v.approval_pending,
    COALESCE(m.name_fa,m.name) AS model, COALESCE(b.name_fa,b.name) AS brand,
    (SELECT d.id FROM driver_documents d WHERE ${vehicleDocumentScope} AND d.document_type='vehicle_front'
      ORDER BY (d.vehicle_id IS NOT NULL) DESC,d.created_at DESC,d.id LIMIT 1) AS front_document_id
    FROM vehicles v LEFT JOIN car_models m ON m.id=v.model_id LEFT JOIN car_brands b ON b.id=m.brand_id
    WHERE v.driver_id=$1 ORDER BY v.created_at DESC,v.id`, [req.driver.id]);
  const assigned = await pool.query(`SELECT r.id,r.status,r.pickup_address,r.dropoff_address,r.fare,q.scheduled_at
    FROM rides r LEFT JOIN ride_requests q ON q.id=r.request_id WHERE r.driver_id=$1
    AND r.status IN ('accepted','arriving','arrived','in_progress') ORDER BY q.scheduled_at NULLS LAST LIMIT 20`, [req.driver.id]);
  res.json({ driver: req.driver, vehicles: vehicles.rows, assigned: assigned.rows });
}));

router.get('/trips', handler(async (req, res) => {
  const pagination = page(req.query);
  const result = await pool.query(`SELECT r.id,r.status,r.pickup_address,r.dropoff_address,r.fare::text,
    q.scheduled_at,r.created_at FROM rides r LEFT JOIN ride_requests q ON q.id=r.request_id
    WHERE r.driver_id=$1 ORDER BY r.created_at DESC,r.id DESC LIMIT $2 OFFSET $3`,
    [req.driver.id,pagination.limit+1,pagination.offset]);
  res.json({items:result.rows.slice(0,pagination.limit),has_more:result.rows.length>pagination.limit});
}));

const activeTrip = "r.status IN ('accepted','arriving','arrived','in_progress')";
const bookedStarts = "CASE WHEN jsonb_typeof(q.booking_details->'starts')='array' THEN jsonb_array_length(q.booking_details->'starts') ELSE 0 END";
const bookedEnds = "CASE WHEN jsonb_typeof(q.booking_details->'ends')='array' THEN jsonb_array_length(q.booking_details->'ends') ELSE 0 END";
const startCount = `GREATEST(1,${bookedStarts})`;
const endCount = `GREATEST(1,${bookedEnds})`;
const reachedCount = `COALESCE(r.driver_stops_reached,CASE WHEN r.status IN ('arrived','in_progress') THEN ${startCount} ELSE 0 END)`;

router.get('/trips/:id', handler(async (req, res) => {
  if(!uuid(req.params.id))fail(400,'شناسه سفر معتبر نیست.');
  const {rows}=await pool.query(`SELECT r.id,r.status,r.pickup_address,r.dropoff_address,r.fare::text,${reachedCount} AS stops_reached,
    ${ratingColumn('passenger','$3')},
    ${paidDeposit} AS deposit_paid,
    r.created_at,r.car_class,r.distance_km,r.duration_minutes,r.payment_status,r.cancellation_reason,q.scheduled_at,q.passenger_count,
    EXISTS(SELECT 1 FROM payment_gateway_transactions WHERE ride_id=r.id AND ${activeGatewayPayment}) AS has_active_payment,
    q.booking_details->'luggageCount' AS luggage_count,q.booking_details->'bagCount' AS bag_count,
    q.booking_details->'hasAnimals' AS has_animals,
    CASE WHEN ${activeTrip} THEN q.booking_details->>'notes' END AS passenger_notes,
    q.booking_details,COALESCE(r.route_polyline,q.route_polyline) AS route_polyline,(${activeTrip}) AS can_contact,
    (SELECT count(*)::int FROM ride_messages m WHERE m.ride_id=r.id AND m.recipient_id=$3 AND m.is_read IS NOT TRUE) AS unread_count,
    CASE WHEN ${activeTrip} THEN NULLIF(CONCAT_WS(' ',NULLIF(TRIM(u.first_name),''),NULLIF(TRIM(u.last_name),'')),'') END AS passenger_name,
    ST_Y(r.pickup_location::geometry) AS pickup_lat,ST_X(r.pickup_location::geometry) AS pickup_lng,
    ST_Y(r.dropoff_location::geometry) AS dropoff_lat,ST_X(r.dropoff_location::geometry) AS dropoff_lng,
    (SELECT json_agg(json_build_object('lat',ST_Y(s.location::geometry),'lng',ST_X(s.location::geometry),'address',s.address)
      ORDER BY s.stop_order) FROM ride_stops s WHERE s.ride_id=r.id) AS waypoints
    FROM rides r LEFT JOIN ride_requests q ON q.id=r.request_id LEFT JOIN users u ON u.id=r.passenger_id
    WHERE r.id=$1 AND r.driver_id=$2`,[req.params.id,req.driver.id,req.user.userId]);
  if(!rows.length)fail(404,'سفر پیدا نشد.');
  const {payment_status,has_active_payment,deposit_paid,cancellation_reason,booking_details,route_polyline,pickup_lat,pickup_lng,dropoff_lat,dropoff_lng,waypoints,...trip}=rows[0];
  const {starts,ends,coordinates}=offerFromRow({
    booking_details,route_polyline,pickup_lat,pickup_lng,dropoff_lat,dropoff_lng,
    pickup_address:trip.pickup_address,dropoff_address:trip.dropoff_address,
  });
  const intermediate=booking_details?.starts?.length&&booking_details?.ends?.length?[]:waypoints||[];
  const route_metrics=offerStopTimes.storedRouteMetrics({...trip,routeLegs:booking_details?.routeLegs},starts.length+intermediate.length+ends.length-1);
  const displayedPaymentStatus=has_active_payment&&[null,'pending','failed'].includes(payment_status)?'processing':payment_status;
  const fare=BigInt(trip.fare??0);
  const deposit=BigInt(deposit_paid);
  const driver_share=payment_status!=='completed'&&payment_status!=='refunded'&&deposit>0n&&deposit<fare
    ?(fare-companyPortion(fare)).toString():null;
  res.json({trip:{...trip,rating_options:options.passenger,payment_status:displayedPaymentStatus,driver_share,starts,ends,coordinates,waypoints:intermediate,route_metrics,...cancellationDetails(rows[0])}});
}));

router.post('/trips/:id/cancel', handler(cancelDriverTrip));
router.put('/trips/:id/rating',handler(rateTrip('passenger')));

router.get('/trips/:id/pickup-metrics',handler(async (req,res)=>{
  if(!uuid(req.params.id))fail(400,'شناسه سفر معتبر نیست.');
  const position=driverPosition(req.query);
  const {rows:[ride]}=await pool.query(`SELECT q.booking_details->'starts'->0 AS pickup,
    ST_Y(r.pickup_location::geometry) AS lat,ST_X(r.pickup_location::geometry) AS lng
    FROM rides r LEFT JOIN ride_requests q ON q.id=r.request_id
    WHERE r.id=$1 AND r.driver_id=$2 AND r.status IN ('accepted','arriving')`,[req.params.id,req.driver.id]);
  if(!ride)fail(404,'مسیر تا مبدأ در دسترس نیست.');
  res.json(await offerStopTimes.approachMetrics(position,ride.pickup??ride));
}));

router.post('/trips/:id/reach-stop', handler(async (req,res)=>{
  const {id}=req.params;
  const expected=req.body?.stops_reached;
  if(!uuid(id)||!Number.isSafeInteger(expected)||expected<0||expected>=2147483647)fail(400,'مرحلهٔ سفر معتبر نیست.');
  const trip=await transaction(async client=>{
    const {rows:[ride]}=await client.query(`SELECT r.status,${reachedCount} AS stops_reached,${startCount} AS starts,
      ${startCount}+${endCount}+CASE WHEN (${bookedStarts})>0 AND (${bookedEnds})>0 THEN 0
      ELSE (SELECT count(*)::int FROM ride_stops WHERE ride_id=r.id) END AS total
      FROM rides r LEFT JOIN ride_requests q ON q.id=r.request_id
      WHERE r.id=$1 AND r.driver_id=$2 FOR UPDATE OF r`,[id,req.driver.id]);
    if(!ride)fail(404,'سفر پیدا نشد.');
    if(ride.status!=='cancelled'&&ride.stops_reached>expected)return {status:ride.status,stops_reached:ride.stops_reached};
    if(!['accepted','arriving','arrived','in_progress'].includes(ride.status)||ride.stops_reached!==expected||expected>=ride.total)
      fail(409,'مرحلهٔ سفر تغییر کرده است. جزئیات سفر را دوباره باز کنید.');
    const reached=expected+1;
    const status=reached===ride.total?'completed':reached>=ride.starts?'in_progress':'arriving';
    const {rows:[updated]}=await client.query(`UPDATE rides SET driver_stops_reached=$2,status=$3::ride_status,
      arrived_at=COALESCE(arrived_at,NOW()),
      started_at=CASE WHEN $3::ride_status IN ('in_progress','completed') THEN COALESCE(started_at,NOW()) ELSE started_at END,
      completed_at=CASE WHEN $3::ride_status='completed' THEN NOW() ELSE completed_at END,updated_at=NOW()
      WHERE id=$1 RETURNING status,driver_stops_reached AS stops_reached`,[id,reached,status]);
    return updated;
  });
  res.json({trip});
}));

router.get('/trips/:id/contact', handler(async (req,res)=>{
  if(!uuid(req.params.id))fail(400,'شناسه سفر معتبر نیست.');
  const {rows}=await pool.query(`SELECT u.phone FROM rides r JOIN users u ON u.id=r.passenger_id
    WHERE r.id=$1 AND r.driver_id=$2 AND ${activeTrip}`,[req.params.id,req.driver.id]);
  const phone=rows[0]?.phone;
  if(typeof phone!=='string'||!/^\+?[0-9]{7,15}$/.test(phone))fail(404,'تماس برای این سفر در دسترس نیست.');
  res.json({phone});
}));

router.get('/trips/:id/messages', handler(async (req,res)=>{
  if(!uuid(req.params.id))fail(400,'شناسه سفر معتبر نیست.');
  const p=page(req.query);
  const {rows}=await pool.query(`SELECT COALESCE(m.items,'[]'::json) AS items
    FROM rides r LEFT JOIN LATERAL (
      SELECT json_agg(x ORDER BY x.created_at DESC,x.id DESC) AS items FROM (
        SELECT id,message,created_at,COALESCE(is_read,false) AS is_read,(sender_id=$3) AS is_mine FROM ride_messages
        WHERE ride_id=r.id AND ($3=sender_id OR $3=recipient_id) ORDER BY created_at DESC,id DESC LIMIT $4 OFFSET $5
      ) x
    ) m ON true WHERE r.id=$1 AND r.driver_id=$2 AND ${activeTrip}`,
    [req.params.id,req.driver.id,req.user.userId,p.limit+1,p.offset]);
  if(!rows.length)fail(404,'گفتگو در دسترس نیست.');
  const items=rows[0].items;
  res.json({items:items.slice(0,p.limit).reverse(),has_more:items.length>p.limit});
}));

router.post('/trips/:id/messages', handler(async (req,res)=>{
  if(!uuid(req.params.id))fail(400,'شناسه سفر معتبر نیست.');
  if(!text(req.body?.message,1,2000))fail(400,'پیام معتبر وارد کنید.');
  const message=await transaction(async client=>{
    const ride=await client.query(`SELECT r.id FROM rides r WHERE r.id=$1 AND r.driver_id=$2 AND ${activeTrip} FOR SHARE`,[req.params.id,req.driver.id]);
    if(!ride.rowCount)fail(404,'گفتگو در دسترس نیست.');
    const {rows}=await client.query("INSERT INTO ride_messages(ride_id,sender_id,message,message_type) VALUES($1,$2,$3,'text') RETURNING id,message,created_at",
      [req.params.id,req.user.userId,req.body.message.trim()]);
    return {...rows[0],is_mine:true};
  });
  res.status(201).json({message});
}));

router.post('/trips/:id/messages/read',handler(require('../services/chatReceipts').markRead));

router.get('/reviews',handler(async(req,res)=>{
  const {limit,offset}=page(req.query);
  const user=req.user.userId;
  const [tags,comments]=await Promise.all([
    pool.query(`SELECT tag,count(*)::int AS count FROM ratings
      CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(tags)='array' THEN tags ELSE '[]'::jsonb END) AS items(tag)
      WHERE ratee_id=$1 AND target='driver' GROUP BY tag ORDER BY count DESC,tag LIMIT 12`,[user]),
    pool.query(`SELECT id,score,comment,created_at FROM ratings WHERE ratee_id=$1 AND target='driver'
      AND NULLIF(btrim(comment),'') IS NOT NULL ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3`,[user,limit+1,offset]),
  ]);
  res.json({tags:tags.rows,comments:comments.rows.slice(0,limit),has_more:comments.rows.length>limit});
}));

router.get('/finance', handler(async (req, res) => {
  const shares = await pool.query(`SELECT rs.id,rs.ride_id,rs.driver_share::text,rs.created_at,
    SUM(rs.driver_share) OVER ()::text AS total FROM revenue_shares rs JOIN rides r ON r.id=rs.ride_id
    WHERE rs.driver_id=$1 AND r.driver_id=$1
    ORDER BY rs.created_at DESC,rs.id DESC LIMIT 20`, [req.driver.id]);
  const wallet=await pool.query(`SELECT w.balance::text,
    COALESCE((SELECT json_agg(t) FROM (SELECT id,ride_id,type,amount::text,description_fa,created_at
    FROM transactions WHERE wallet_id=w.id AND reference_type='driver_ride'
    ORDER BY created_at DESC,ride_id,type LIMIT 30) t),'[]'::json) AS transactions
    FROM wallets w JOIN driver_profiles d ON d.user_id=w.user_id WHERE d.id=$1`,[req.driver.id]);
  res.json({total:shares.rows[0]?.total||'0',items:shares.rows.map(({total,...item})=>item),
    balance:wallet.rows[0]?.balance||'0',transactions:wallet.rows[0]?.transactions||[]});
}));

const vehicleDocumentTypes=['vehicle_registration_front','vehicle_registration_back','insurance','insurance_addendum',
  'vehicle_front','vehicle_back','vehicle_interior_front','vehicle_interior_back'];
const privateDocuments=path.resolve(__dirname,'../../vehicle-documents');
const localUploadImage=/^(?:https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?)?\/uploads\/([\w.-]+\.(jpe?g|png|webp|gif))$/i;
const vehicleDocumentScope=`d.driver_id=v.driver_id AND d.file_url IS NOT NULL
  AND d.document_type IN (${vehicleDocumentTypes.map(type=>`'${type}'`).join(',')})
  AND (d.vehicle_id=v.id OR (d.vehicle_id IS NULL AND
    NOT EXISTS(SELECT 1 FROM vehicles other WHERE other.driver_id=v.driver_id AND other.id<>v.id)))`;

router.get('/vehicles/:id',handler(async (req,res)=>{
  if(!uuid(req.params.id))fail(400,'شناسه خودرو معتبر نیست.');
  const {rows:[vehicle]}=await pool.query(`SELECT v.vin,v.owner_name,v.fuel_type,v.insurance_expiry::text,
    COALESCE((SELECT json_agg(json_build_object('id',d.id,'type',d.document_type) ORDER BY d.document_type,d.id)
      FROM driver_documents d WHERE ${vehicleDocumentScope}), '[]'::json) AS documents
    FROM vehicles v WHERE v.id=$1 AND v.driver_id=$2`,[req.params.id,req.driver.id]);
  if(!vehicle)fail(404,'خودرو پیدا نشد.');
  res.json({vehicle});
}));

router.get('/vehicles/:id/documents/:documentId',handler(async (req,res)=>{
  const {id,documentId}=req.params;
  if(!uuid(id)||!uuid(documentId))fail(400,'شناسه مدرک معتبر نیست.');
  const {rows:[document]}=await pool.query(`SELECT d.file_url FROM vehicles v JOIN driver_documents d ON ${vehicleDocumentScope}
    WHERE v.id=$1 AND v.driver_id=$2 AND d.id=$3`,[id,req.driver.id,documentId]);
  const privateFile=document?.file_url.match(/^vehicle-document:([0-9a-f-]+\.(jpg|png))$/i);
  const file=privateFile??document?.file_url.match(localUploadImage);
  if(!file)fail(404,'تصویر مدرک در دسترس نیست.');
  const root=privateFile?privateDocuments:path.resolve(__dirname,'../../uploads');
  return sendDriverImage(res,root,file);
}));

async function sendDriverImage(res,root,file){
  const content=await fs.readFile(path.join(root,file[1])).catch(error=>{
    if(error.code==='ENOENT')fail(404,'تصویر مدرک در دسترس نیست.');
    throw error;
  });
  const extension=file[2].toLowerCase();
  return res.set('Cache-Control','no-store').json({image:`data:image/${extension==='jpg'?'jpeg':extension};base64,${content.toString('base64')}`});
}

function uploadedImage(base64){
  if(typeof base64!=='string'||base64.length>1_200_000||!(/^[A-Za-z0-9+/]+={0,2}$/.test(base64)))fail(400,'تصویر معتبر نیست.');
  const bytes=Buffer.from(base64,'base64');
  const jpeg=bytes.subarray(0,3).toString('hex')==='ffd8ff';
  const png=bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a';
  if(!jpeg&&!png)fail(400,'فرمت تصویر باید JPEG یا PNG باشد.');
  return {bytes,extension:png?'png':'jpg'};
}

router.post('/vehicles', handler(async (req, res) => {
  const {model_id,year,color,plate_part1,plate_part2,plate_part3,plate_letter,vin,owner_name,fuel_type,insurance_expiry_date,documents=[]} = req.body || {};
  if (!uuid(model_id) || !Number.isInteger(Number(year)) || Number(year)<1350 || Number(year)>1500 || !text(color,1,30)
      || !/^\d{2}$/.test(plate_part1) || !/^\d{2}$/.test(plate_part2) || !/^\d{3}$/.test(plate_part3) || !text(plate_letter,1,10)
      || ![ [vin,50], [owner_name,200], [fuel_type,50] ].every(([value,max]) => value == null || text(value,0,max))
      || (insurance_expiry_date && (typeof insurance_expiry_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(insurance_expiry_date)))) fail(400, 'اطلاعات خودرو و پلاک را کامل و صحیح وارد کنید.');
  const plate = [plate_part1,plate_part2,plate_letter.trim(),plate_part3].join(' ');
  if(!Array.isArray(documents)||documents.length>vehicleDocumentTypes.length)fail(400,'مدارک خودرو معتبر نیستند.');
  const seen=new Set();
  const images=documents.map(doc=>{
    if(!vehicleDocumentTypes.includes(doc?.type)||seen.has(doc.type))fail(400,'نوع مدرک معتبر نیست.');
    const {bytes,extension}=uploadedImage(doc.base64);
    seen.add(doc.type);
    return {type:doc.type,bytes,name:`${randomUUID()}.${extension}`};
  });
  const written=[];
  try{
  const vehicle=await transaction(async client=>{
  await client.query('SELECT id FROM driver_profiles WHERE id=$1 FOR UPDATE',[req.driver.id]);
  const result = await client.query(`INSERT INTO vehicles(driver_id,model_id,year,color,license_plate,car_class,vin,owner_name,fuel_type,insurance_expiry,plate_letter,is_active,approval_pending)
    SELECT $1,m.id,$3,$4,$5,m.vehicle_class,$6,$7,$8,$9,$10,FALSE,TRUE FROM car_models m WHERE m.id=$2 AND m.is_active RETURNING id`,
    [req.driver.id,model_id,Number(year),color.trim(),plate,vin||null,owner_name||null,fuel_type||null,insurance_expiry_date||null,plate_letter.trim()]);
  if (!result.rowCount) fail(400,'مدل خودرو معتبر نیست.');
  if(images.length)await fs.mkdir(privateDocuments,{recursive:true});
  for(const image of images){
    const filename=path.join(privateDocuments,image.name);
    written.push(filename);
    await fs.writeFile(filename,image.bytes,{flag:'wx'});
    await client.query('INSERT INTO driver_documents(driver_id,vehicle_id,document_type,file_url) VALUES($1,$2,$3,$4)',
      [req.driver.id,result.rows[0].id,image.type,`vehicle-document:${image.name}`]);
  }
  return result.rows[0];
  });
  res.status(201).json({vehicle});
  }catch(error){
    await Promise.allSettled(written.map(filename=>fs.unlink(filename)));
    if(error.code==='23505')fail(409,'این پلاک قبلاً ثبت شده است.');
    throw error;
  }
}));

router.put('/vehicles/:id/active', handler(async (req, res) => {
  if (!uuid(req.params.id)) fail(400,'شناسه خودرو معتبر نیست.');
  const result = await pool.query(`UPDATE driver_profiles dp SET active_vehicle_id=v.id FROM vehicles v
    WHERE dp.id=$1 AND v.id=$2 AND v.driver_id=dp.id AND v.is_active RETURNING dp.active_vehicle_id`, [req.driver.id,req.params.id]);
  if (!result.rowCount) fail(404,'خودروی فعال متعلق به شما پیدا نشد.');
  res.json(result.rows[0]);
}));

function driverPosition(query){
  const lat=Number(query.lat),lng=Number(query.lng);
  if(typeof query.lat!=='string'||typeof query.lng!=='string'||!query.lat.trim()||!query.lng.trim()||!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)fail(400,'موقعیت فعلی معتبر نیست.');
  return {lat,lng};
}

router.get(['/offers', '/offers/:id/stop-times'], handler(async (req, res) => {
  const {id}=req.params;
  if(id&&!uuid(id))fail(400,'شناسه سفر معتبر نیست.');
  const {lat,lng}=driverPosition(req.query);
  if (!req.driver.is_verified) fail(409,'حساب راننده هنوز تأیید نشده است.');
  if (!req.driver.active_vehicle_id) fail(409,'در خودروهای من یک خودرو را فعال کنید.');
  if(!id&&req.driver.active_class){
    const cached=await basket.nearby(req.driver.active_class,{lat,lng});
    if(cached)return res.json({vehicle_id:req.driver.active_vehicle_id,items:cached});
  }
  const result=await pool.query(`SELECT ${offerColumns}
    FROM ride_requests q JOIN vehicles v ON v.id=$2 AND v.driver_id=$1 AND v.is_active AND ${vehicleMatchesClass('q.car_class')}
    WHERE ${availableOffer}
    AND ST_DWithin(q.pickup_location,ST_SetSRID(ST_MakePoint($3,$4),4326)::geography,10000)
    AND ($5::uuid IS NULL OR q.id=$5)
    ORDER BY q.created_at DESC,q.id DESC`,[req.driver.id,req.driver.active_vehicle_id,lng,lat,id||null]);
  const items=result.rows.map(offerFromRow);
  if(id){
    const offer=items[0];
    if(!offer)fail(404,'این سفر دیگر قابل پذیرش نیست.');
    return res.json(await offerStopTimes({...offer,routeLegs:result.rows[0].booking_details?.routeLegs},{lat,lng}));
  }
  res.json({vehicle_id:req.driver.active_vehicle_id,items});
}));
router.post('/offers/:id/accept', handler(accept));
module.exports=router;
