const { isDepartureOpen } = require('../services/departureWindow');
const pool = require('../models/db');
const { transaction, fail, uuid } = require('../middleware/passenger');

function validate(body) {
  if (body.notes!==undefined&&(typeof body.notes!=='string'||body.notes.length>1000||body.notes.includes('\0'))) return 'توضیحات سفر باید حداکثر ۱۰۰۰ نویسه باشد.';
  const points = [...(Array.isArray(body.starts) ? body.starts : []), ...(Array.isArray(body.ends) ? body.ends : [])];
  if (!Array.isArray(body.starts) || !body.starts.length || !Array.isArray(body.ends) || !body.ends.length || points.length > 50) return 'مبدا و مقصد معتبر انتخاب کنید.';
  if (points.some(p => !p || !Number.isFinite(p.lat) || !Number.isFinite(p.lng) || Math.abs(p.lat) > 90 || Math.abs(p.lng) > 180 || typeof p.address !== 'string' || !p.address.trim() || p.address.length > 2000)) return 'مختصات و آدرس نقاط معتبر نیست.';
  if (!Number.isInteger(body.personCount) || body.personCount < 1 || body.personCount > 8) return 'تعداد مسافران معتبر نیست.';
  if (![body.luggageCount, body.bagCount].every(n => Number.isInteger(n) && n >= 0 && n <= 10)) return 'تعداد بار معتبر نیست.';
  if (typeof body.packageId !== 'string' || !uuid(body.packageId)) return 'پکیج سفر را انتخاب کنید.';
  if (typeof body.clientReference !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(body.clientReference)) return 'شناسه درخواست معتبر نیست.';
  if (typeof body.scheduledAt !== 'string' || !isDepartureOpen(body.scheduledAt)) return 'زمان حرکت گذشته است؛ زمان جدیدی انتخاب کنید.';
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',numberingSystem:'latn' }).formatToParts(new Date(body.scheduledAt));
  const get = type => parts.find(part=>part.type===type)?.value;
  if (body.date !== `${get('year')}-${get('month')}-${get('day')}` || body.time !== `${get('hour')}:${get('minute')}`) return 'تاریخ و ساعت حرکت با زمان ثبت رزرو هماهنگ نیست.';
  if (typeof body.hasAnimals !== 'boolean' || (body.hasAnimals && (typeof body.animalType !== 'string' || !body.animalType.trim() || body.animalType.length > 200))) return 'نوع حیوان همراه را وارد کنید.';
  return null;
}
exports.validate = validate;
exports.createReservation = async (req, res) => {
  if (req.user?.role !== 'passenger' || !uuid(req.user?.userId)) return res.status(403).json({ error: 'ثبت رزرو فقط برای حساب مسافر امکان‌پذیر است.' });
  const body = req.body || {};
  const error = validate(body);
  if (error) return res.status(400).json({ error });
  const first = body.starts[0], last = body.ends[body.ends.length - 1];
  // All stops and luggage details remain attached to the request before driver allocation.
  const details = { starts: body.starts.map(({lat,lng,address})=>({lat,lng,address})), ends: body.ends.map(({lat,lng,address})=>({lat,lng,address})), date: body.date, time: body.time, personCount: body.personCount, luggageCount: body.luggageCount, bagCount: body.bagCount, hasAnimals: body.hasAnimals, animalType: body.hasAnimals ? body.animalType : '', packageId: body.packageId };
  const notes=body.notes?.trim()||'';
  try {
    const result = await transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`${req.user.userId}:${body.clientReference}`]);
      const existing=await client.query('SELECT id,status,scheduled_at,created_at,booking_details FROM ride_requests WHERE passenger_id=$1 AND client_reference=$2',[req.user.userId,body.clientReference]);
      if(existing.rowCount){const previous=existing.rows[0],stored=previous.booking_details;const same=Object.keys(details).every(key=>JSON.stringify(stored?.[key])===JSON.stringify(details[key]))&&(stored?.notes||'')===notes;if(!same||new Date(previous.scheduled_at).getTime()!==Date.parse(body.scheduledAt))fail(409,'این شناسه قبلاً با اطلاعات دیگری ثبت شده است؛ درخواست جدیدی بسازید.');const {booking_details,...reservation}=previous;return{reservation,reused:true};}
      if(!uuid(body.quoteId))fail(400,'ابتدا قیمت سفر را در صفحه انتخاب ناوگان دریافت کنید.');
      const quote=await require('../services/fareQuotes').loadQuote(client,req.user.userId,body);
      const fare = await client.query("SELECT id,car_class FROM base_fares WHERE id=$1 AND is_active=true AND ride_type IN ('intercity','normal')", [body.packageId]);
      if (!fare.rowCount) fail(400,'پکیج انتخابی فعال نیست؛ دوباره ناوگان را انتخاب کنید.');
      if(fare.rows[0].car_class!==quote.fare.car_class)fail(409,'کلاس ناوگان تغییر کرده است؛ قیمت را دوباره دریافت کنید.');
      if(notes)details.notes=notes;
      if(quote.route.legs)details.routeLegs=quote.route.legs;
      details.vehicle = fare.rows[0].car_class;
      details.fare={amount:quote.fare.amount,currency:'IRR',breakdown:quote.fare.breakdown,warnings:quote.fare.warnings,quoteId:body.quoteId};
      const inserted = await client.query(`INSERT INTO ride_requests
        (passenger_id, ride_type, car_class, pickup_location, pickup_address, dropoff_location, dropoff_address, passenger_count, scheduled_at, status, client_reference, booking_details,estimated_fare,distance_km,duration_minutes,route_polyline,surge_multiplier,notes)
        VALUES ($1,$19,$2,ST_SetSRID(ST_MakePoint($3,$4),4326)::geography,$5,ST_SetSRID(ST_MakePoint($6,$7),4326)::geography,$8,$9,$10,'awaiting_deposit',$11,$12::jsonb,$13,$14,$15,$16,$17,$18)
        ON CONFLICT (passenger_id, client_reference) WHERE client_reference IS NOT NULL DO NOTHING
        RETURNING id,status,scheduled_at,created_at`,
        [req.user.userId,fare.rows[0].car_class,first.lng,first.lat,first.address,last.lng,last.lat,last.address,body.personCount,body.scheduledAt,body.clientReference,JSON.stringify(details),quote.fare.amount,quote.route.meters/1000,Math.ceil(quote.route.seconds/60),quote.polyline,quote.fare.breakdown.find(line=>line.type==='surge')?.multiplier||'1',notes||null,quote.route.ride_type]);
      if (!inserted.rowCount) {
        const old = await client.query('SELECT id,status,scheduled_at,created_at FROM ride_requests WHERE passenger_id=$1 AND client_reference=$2 AND booking_details=$3::jsonb AND scheduled_at=$4::timestamptz',[req.user.userId,body.clientReference,JSON.stringify(details),body.scheduledAt]);
        if(!old.rowCount)fail(409,'این شناسه قبلاً با اطلاعات دیگری ثبت شده است؛ درخواست جدیدی بسازید.');
        return {reservation:old.rows[0],reused:true};
      }
      return {reservation:inserted.rows[0],reused:false};
    });
    res.status(result.reused?200:201).json({reservation:result.reservation});
  } catch (err) {
    if(err.status)return res.status(err.status).json({error:err.message});
    console.error('Create passenger reservation error:', err.code);
    res.status(500).json({ error: 'ثبت رزرو انجام نشد؛ لطفاً دوباره تلاش کنید.' });
  }
};

exports.getPackages = async (req, res) => {
  if (req.user?.role !== 'passenger') return res.status(403).json({error:'این مسیر مخصوص مسافران است.'});
  try {
    res.json({packages:await require('../services/fareQuotes').catalog(),currency:'IRR'});
  } catch(err) { console.error('Passenger packages error:',err.code);res.status(500).json({error:'دریافت پکیج‌ها انجام نشد.'}); }
};
exports.getReservations = async(req,res)=>{
 const {page}=require('../middleware/passenger');const p=page(req.query);
 const result=await pool.query("SELECT q.id,COALESCE((SELECT r.status::text FROM rides r WHERE r.request_id=q.id AND r.passenger_id=$1 AND NOT (r.status='cancelled' AND EXISTS(SELECT 1 FROM driver_profiles dp WHERE dp.id=r.driver_id AND dp.user_id=r.cancelled_by)) ORDER BY r.created_at DESC,r.id DESC LIMIT 1),q.status::text) AS status,q.scheduled_at,q.created_at,q.client_reference,q.booking_details FROM ride_requests q WHERE q.passenger_id=$1 AND q.client_reference IS NOT NULL ORDER BY q.created_at DESC,q.id DESC LIMIT $2 OFFSET $3",[req.user.userId,p.limit,p.offset]);res.json({reservations:result.rows,page:p.page,limit:p.limit});
};
