const {options,ratingColumn,rateTrip}=require('../services/rideRating');
const pool=require('../models/db');
const {fail,uuid,text,page,transaction}=require('../middleware/passenger');
const own=(req)=>req.user.userId;
const found=result=>{if(!result.rowCount)fail(404,'موردی پیدا نشد.');return result.rows[0];};
const profileColumns='id,phone,phone_verified,first_name,last_name,email,gender,birth_date::text AS birth_date,avatar_url,created_at';
exports.profile=async(req,res)=>res.json({profile:found(await pool.query(`SELECT ${profileColumns},COALESCE((SELECT AVG(score) FROM ratings WHERE ratee_id=$1 AND target='passenger'),5)::float AS rating FROM users WHERE id=$1`,[own(req)]))});
exports.updateProfile=async(req,res)=>{
 const fields=['first_name','last_name','email','gender','birth_date'];const body=req.body||{};const keys=Object.keys(body);
 if(!keys.length||keys.some(key=>!fields.includes(key)))fail(400,'فیلدهای پروفایل معتبر نیست.');
 for(const key of ['first_name','last_name'])if(key in body&&!text(body[key],0,100))fail(400,'نام معتبر نیست.');
 if(body.email!==undefined&&body.email!==null&&(!text(body.email,3,255)||!/^\S+@\S+\.\S+$/.test(body.email)))fail(400,'ایمیل معتبر نیست.');
 if(body.gender!==undefined&&body.gender!==null&&!['male','female','other'].includes(body.gender))fail(400,'مقدار جنسیت معتبر نیست.');
 if(body.birth_date!==undefined&&body.birth_date!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(body.birth_date)||!Number.isFinite(Date.parse(body.birth_date))||new Date(body.birth_date).toISOString().slice(0,10)!==body.birth_date||Date.parse(body.birth_date)>Date.now()))fail(400,'تاریخ تولد میلادی معتبر نیست.');
 const values=keys.map(key=>typeof body[key]==='string'?body[key].trim():body[key]);values.push(own(req));
 const emailVerification=keys.includes('email')?`,email_verified=CASE WHEN email IS DISTINCT FROM $${keys.indexOf('email')+1}::varchar THEN false ELSE email_verified END`:'';
 res.json({profile:found(await pool.query(`UPDATE users SET ${keys.map((key,index)=>`${key}=$${index+1}`).join(',')}${emailVerification},updated_at=NOW() WHERE id=$${values.length} RETURNING ${profileColumns}`,values))});
};
exports.wallet=async(req,res)=>{
 await pool.query('INSERT INTO wallets(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[own(req)]);
 res.json({wallet:found(await pool.query('SELECT id,balance,frozen_balance,(balance-frozen_balance)::text AS available_balance,currency,is_active FROM wallets WHERE user_id=$1',[own(req)]))});
};
exports.transactions=async(req,res)=>{const p=page(req.query);const result=await pool.query(`SELECT t.id,t.type,t.amount,t.balance_before,t.balance_after,t.ride_id,t.description_fa,t.description,t.created_at FROM transactions t JOIN wallets w ON w.id=t.wallet_id WHERE w.user_id=$1 ORDER BY t.created_at DESC,t.id DESC LIMIT $2 OFFSET $3`,[own(req),p.limit,p.offset]);res.json({items:result.rows,page:p.page,limit:p.limit});};
exports.payments=async(req,res)=>{const p=page(req.query);const result=await pool.query('SELECT id,ride_id,purpose,gateway,amount,status,reference_id,created_at,paid_at FROM payment_gateway_transactions WHERE user_id=$1 ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3',[own(req),p.limit,p.offset]);res.json({items:result.rows,page:p.page,limit:p.limit});};
exports.payment=async(req,res)=>{
 const payment=found(await pool.query('SELECT id,ride_id,purpose,gateway,amount,status,reference_id,created_at,paid_at,authority FROM payment_gateway_transactions WHERE id=$1 AND user_id=$2',[req.params.id,own(req)]));
 const {authority,...safe}=payment;
 res.json({payment:{...safe,...(payment.gateway==='sep_sandbox'?{sandbox:true}:payment.status==='pending'&&authority?{redirect:require('../services/sepGateway').redirect(authority)}:{})}});
};
exports.drafts=async(req,res)=>{const p=page(req.query);res.json({items:(await pool.query('SELECT id,client_reference,trip_data,created_at,updated_at FROM passenger_drafts WHERE user_id=$1 ORDER BY updated_at DESC,id DESC LIMIT $2 OFFSET $3',[own(req),p.limit,p.offset])).rows,page:p.page,limit:p.limit});};
exports.saveDraft=async(req,res)=>{
 const {client_reference,trip_data}=req.body||{};
 if(typeof client_reference!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(client_reference)||!trip_data||typeof trip_data!=='object'||Array.isArray(trip_data)||JSON.stringify(trip_data).length>64000)fail(400,'پیش‌نویس معتبر نیست.');
 if(trip_data.notes!==undefined&&(typeof trip_data.notes!=='string'||trip_data.notes.length>1000||trip_data.notes.includes('\0')))fail(400,'توضیحات سفر باید حداکثر ۱۰۰۰ نویسه باشد.');
 const data=Object.fromEntries(['notes','starts','ends','date','time','personCount','luggageCount','bagCount','hasAnimals','animalType','packageId','vehicle','quoteId','quoteExpiresAt','fare'].filter(key=>key in trip_data).map(key=>[key,trip_data[key]]));
 res.status(201).json({draft:found(await pool.query('INSERT INTO passenger_drafts(user_id,client_reference,trip_data) VALUES($1,$2,$3::jsonb) ON CONFLICT(user_id,client_reference) DO UPDATE SET trip_data=EXCLUDED.trip_data,updated_at=NOW() RETURNING id,client_reference,trip_data,updated_at',[own(req),client_reference,JSON.stringify(data)]))});
};
exports.deleteDraft=async(req,res)=>{found(await pool.query('DELETE FROM passenger_drafts WHERE id=$1 AND user_id=$2 RETURNING id',[req.params.id,own(req)]));res.status(204).end();};
exports.reservation=async(req,res)=>res.json({reservation:found(await pool.query(`SELECT q.id,q.status,q.scheduled_at,q.created_at,q.client_reference,q.booking_details,q.pickup_address,q.dropoff_address,
 CASE WHEN q.status='awaiting_deposit' THEN CEIL(q.estimated_fare::numeric/5)::text END AS deposit_due,
 COALESCE((SELECT SUM(p.amount) FROM payment_gateway_transactions p WHERE p.request_id=q.id AND p.purpose='deposit' AND p.status='completed'),0)::text AS deposit_paid,
 COALESCE((SELECT SUM(p.amount) FROM payment_gateway_transactions p WHERE p.request_id=q.id AND p.purpose='full' AND p.status='completed'),0)::text AS full_paid,
 (SELECT json_build_object('id',r.id,'status',r.status,'fare',r.fare::text,'payment_status',r.payment_status,'driver_first_name',u.first_name,'driver_last_name',u.last_name,'driver_phone',CASE WHEN r.status IN ('accepted','arriving','arrived','in_progress') THEN u.phone ELSE NULL END,'vehicle_model',COALESCE(m.name_fa,m.name),'color',COALESCE(v.color_fa,v.color),'license_plate',v.license_plate,'car_class',r.car_class,'unread_count',(SELECT count(*)::int FROM ride_messages m WHERE m.ride_id=r.id AND m.recipient_id=$2 AND m.is_read IS NOT TRUE))
 FROM rides r LEFT JOIN driver_profiles dp ON dp.id=r.driver_id LEFT JOIN users u ON u.id=dp.user_id
 LEFT JOIN vehicles v ON v.id=r.vehicle_id LEFT JOIN car_models m ON m.id=v.model_id
 WHERE r.request_id=q.id AND r.passenger_id=$2
 AND (r.status<>'cancelled' OR r.cancelled_by IS NULL OR r.cancelled_by IS DISTINCT FROM dp.user_id)
 ORDER BY r.created_at DESC,r.id DESC LIMIT 1) AS assigned_ride
 FROM ride_requests q WHERE q.id=$1 AND q.passenger_id=$2`,[req.params.id,own(req)]))});
exports.cancelReservation=async(req,res)=>{
 const result=await pool.query("UPDATE ride_requests SET status='cancelled',updated_at=NOW() WHERE id=$1 AND passenger_id=$2 AND status IN ('pending','searching') RETURNING id,status",[req.params.id,own(req)]);
 if(!result.rowCount)fail(409,'این درخواست قابل لغو نیست یا در حساب شما وجود ندارد.');res.json({reservation:result.rows[0]});
};
exports.trips=async(req,res)=>{const p=page(req.query);const statuses=['pending','searching','accepted','arriving','arrived','in_progress','completed','cancelled','expired'];if(req.query.status&&!statuses.includes(req.query.status))fail(400,'وضعیت سفر معتبر نیست.');
 const result=await pool.query(`SELECT id,request_id,status,ride_type,car_class,pickup_address,dropoff_address,fare,payment_status,payment_method,started_at,completed_at,created_at FROM rides WHERE passenger_id=$1 ${req.query.status?'AND status=$4':''} ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3`,[own(req),p.limit,p.offset,...(req.query.status?[req.query.status]:[])]);res.json({items:result.rows,page:p.page,limit:p.limit});};
exports.trip=async(req,res)=>res.json({rating_options:options.driver,trip:found(await pool.query(`SELECT ${ratingColumn('driver','$2')},r.id,r.request_id,r.status,r.ride_type,r.car_class,r.pickup_address,r.dropoff_address,r.fare,
 (${require('./passengerPaymentController').paidDeposit})::text AS deposit_paid,
 r.payment_status,r.payment_method,r.started_at,r.completed_at,r.distance_km,r.duration_minutes,r.route_polyline,u.first_name AS driver_first_name,u.last_name AS driver_last_name,v.color_fa,v.license_plate FROM rides r LEFT JOIN driver_profiles dp ON dp.id=r.driver_id LEFT JOIN users u ON u.id=dp.user_id LEFT JOIN vehicles v ON v.id=r.vehicle_id WHERE r.id=$1 AND r.passenger_id=$2`,[req.params.id,own(req)]))});
exports.notifications=async(req,res)=>{const p=page(req.query);if(req.query.unread!==undefined&&!['true','false'].includes(req.query.unread))fail(400,'فیلتر اعلانات معتبر نیست.');const result=await pool.query(`SELECT id,type,title_fa,title,body_fa,body,data,is_read,created_at FROM notifications WHERE user_id=$1 ${req.query.unread==='true'?'AND is_read=false':''} ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3`,[own(req),p.limit,p.offset]);const count=await pool.query('SELECT COUNT(*)::int AS count FROM notifications WHERE user_id=$1 AND is_read=false',[own(req)]);res.json({items:result.rows,unread_count:count.rows[0].count,page:p.page,limit:p.limit});};
exports.readNotification=async(req,res)=>res.json({notification:found(await pool.query('UPDATE notifications SET is_read=true,read_at=COALESCE(read_at,NOW()) WHERE id=$1 AND user_id=$2 RETURNING id,is_read,read_at',[req.params.id,own(req)]))});
exports.readAll=async(req,res)=>{await pool.query('UPDATE notifications SET is_read=true,read_at=NOW() WHERE user_id=$1 AND is_read=false',[own(req)]);res.json({success:true});};
exports.preferences=async(req,res)=>{const result=await pool.query('SELECT activity_notifications FROM passenger_preferences WHERE user_id=$1',[own(req)]);res.json({preferences:result.rows[0]||{activity_notifications:true}});};
exports.updatePreferences=async(req,res)=>{if(typeof req.body?.activity_notifications!=='boolean'||Object.keys(req.body).some(key=>key!=='activity_notifications'))fail(400,'تنظیمات معتبر نیست.');res.json({preferences:found(await pool.query('INSERT INTO passenger_preferences(user_id,activity_notifications) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET activity_notifications=EXCLUDED.activity_notifications,updated_at=NOW() RETURNING activity_notifications',[own(req),req.body.activity_notifications]))});};
exports.favorites=async(req,res)=>res.json({items:(await pool.query('SELECT id,name,name_fa,address,ST_Y(location::geometry) AS lat,ST_X(location::geometry) AS lng FROM favorite_locations WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',[own(req)])).rows});
exports.saveFavorite=async(req,res)=>{
 const {name,address,lat,lng}=req.body||{};if(!text(name,1,50)||!text(address,1,2000)||!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)fail(400,'نشانی معتبر نیست.');
 const result=req.params.id?await pool.query('UPDATE favorite_locations SET name=$1,name_fa=$1,address=$2,location=ST_SetSRID(ST_MakePoint($3,$4),4326)::geography WHERE id=$5 AND user_id=$6 RETURNING id,name,name_fa,address',[name.trim(),address.trim(),lng,lat,req.params.id,own(req)]):await pool.query('INSERT INTO favorite_locations(user_id,name,name_fa,address,location) VALUES($1,$2,$2,$3,ST_SetSRID(ST_MakePoint($4,$5),4326)::geography) RETURNING id,name,name_fa,address',[own(req),name.trim(),address.trim(),lng,lat]);res.status(req.params.id?200:201).json({favorite:found(result)});
};
exports.deleteFavorite=async(req,res)=>{found(await pool.query('DELETE FROM favorite_locations WHERE id=$1 AND user_id=$2 RETURNING id',[req.params.id,own(req)]));res.status(204).end();};
exports.tickets=async(req,res)=>{const p=page(req.query);res.json({items:(await pool.query('SELECT id,ride_id,subject,category,status,created_at,updated_at FROM support_tickets WHERE user_id=$1 ORDER BY updated_at DESC,id DESC LIMIT $2 OFFSET $3',[own(req),p.limit,p.offset])).rows,page:p.page,limit:p.limit});};
exports.createTicket=async(req,res)=>{
 const {subject,message,ride_id}=req.body||{};if(!text(subject,1,255)||!text(message,1,5000)||(ride_id&&!uuid(ride_id)))fail(400,'موضوع و متن پیام معتبر وارد کنید.');
 const ticket=await transaction(async client=>{if(ride_id)found(await client.query('SELECT id FROM rides WHERE id=$1 AND passenger_id=$2',[ride_id,own(req)]));const result=await client.query('INSERT INTO support_tickets(user_id,ride_id,subject,category) VALUES($1,$2,$3,$4) RETURNING id,subject,status',[own(req),ride_id||null,subject.trim(),'passenger']);await client.query('INSERT INTO support_ticket_messages(ticket_id,sender_id,message) VALUES($1,$2,$3)',[result.rows[0].id,own(req),message.trim()]);return result.rows[0];});res.status(201).json({ticket});
};
exports.ticket=async(req,res)=>{const ticket=found(await pool.query('SELECT id,subject,status,category,created_at FROM support_tickets WHERE id=$1 AND user_id=$2',[req.params.id,own(req)]));const p=page(req.query);res.json({ticket,messages:(await pool.query('SELECT id,message,created_at,(sender_id=$2) AS is_mine FROM support_ticket_messages WHERE ticket_id=$1 ORDER BY created_at,id LIMIT $3 OFFSET $4',[ticket.id,own(req),p.limit,p.offset])).rows,page:p.page,limit:p.limit});};
exports.ticketMessage=async(req,res)=>{if(!text(req.body?.message,1,5000))fail(400,'پیام معتبر وارد کنید.');const message=await transaction(async client=>{const ticket=found(await client.query('SELECT id,status FROM support_tickets WHERE id=$1 AND user_id=$2 FOR UPDATE',[req.params.id,own(req)]));if(['closed','resolved'].includes(ticket.status))fail(409,'این تیکت بسته شده است.');const result=await client.query('INSERT INTO support_ticket_messages(ticket_id,sender_id,message) VALUES($1,$2,$3) RETURNING id,message,created_at',[ticket.id,own(req),req.body.message.trim()]);await client.query("UPDATE support_tickets SET status='open',updated_at=NOW() WHERE id=$1",[ticket.id]);return result.rows[0];});res.status(201).json({message});};
exports.closeTicket=async(req,res)=>res.json({ticket:found(await pool.query("UPDATE support_tickets SET status='closed',updated_at=NOW(),resolved_at=COALESCE(resolved_at,NOW()) WHERE id=$1 AND user_id=$2 RETURNING id,status",[req.params.id,own(req)]))});
exports.content=async(req,res)=>{const types=['faq','terms','about','page'];const type=req.query.type||'faq';if(!types.includes(type))fail(400,'نوع محتوا معتبر نیست.');const p=page(req.query);res.json({items:(await pool.query('SELECT slug,title_fa,title,content_fa,content,type FROM cms_pages WHERE is_published=true AND (published_at IS NULL OR published_at<=NOW()) AND type=$1 ORDER BY sort_order,id LIMIT $2 OFFSET $3',[type,p.limit,p.offset])).rows});};
exports.config=async(req,res)=>res.json({settings:(await pool.query('SELECT key,value,type FROM settings WHERE is_public=true ORDER BY key')).rows,currency:'IRR',timezone:'Asia/Tehran'});
exports.rating=rateTrip('driver');
exports.tripMessages=async(req,res)=>{found(await pool.query('SELECT id FROM rides WHERE id=$1 AND passenger_id=$2',[req.params.id,own(req)]));const p=page(req.query);res.json({items:(await pool.query('SELECT id,message,created_at,COALESCE(is_read,false) AS is_read,(sender_id=$2) AS is_mine FROM ride_messages WHERE ride_id=$1 ORDER BY created_at,id LIMIT $3 OFFSET $4',[req.params.id,own(req),p.limit,p.offset])).rows,page:p.page,limit:p.limit});};
exports.sendTripMessage=async(req,res)=>{if(!text(req.body?.message,1,2000))fail(400,'پیام معتبر نیست.');const result=await pool.query("INSERT INTO ride_messages(ride_id,sender_id,message,message_type) SELECT id,$2,$3,'text' FROM rides WHERE id=$1 AND passenger_id=$2 AND status IN ('accepted','arriving','arrived','in_progress') FOR SHARE RETURNING id,message,created_at",[req.params.id,own(req),req.body.message.trim()]);res.status(201).json({message:found(result)});};
exports.registerDevice=async(req,res)=>{
 const {token,platform}=req.body||{};if(!text(token,10,512)||!['android','ios','web'].includes(platform))fail(400,'توکن دستگاه معتبر نیست.');
 const device=await transaction(async client=>{
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`device:${token}`]);
  await client.query('UPDATE device_tokens SET is_active=false WHERE token=$1 AND user_id<>$2',[token,own(req)]);
  const old=await client.query('SELECT id FROM device_tokens WHERE user_id=$1 AND token=$2 ORDER BY created_at LIMIT 1',[own(req),token]);
  return found(old.rowCount?await client.query('UPDATE device_tokens SET platform=$2,is_active=true,last_used_at=NOW() WHERE id=$1 RETURNING id,platform,is_active',[old.rows[0].id,platform]):await client.query('INSERT INTO device_tokens(user_id,token,platform) VALUES($1,$2,$3) RETURNING id,platform,is_active',[own(req),token,platform]));
 });res.status(201).json({device});
};
exports.removeDevice=async(req,res)=>res.json({device:found(await pool.query('UPDATE device_tokens SET is_active=false WHERE id=$1 AND user_id=$2 RETURNING id,is_active',[req.params.id,own(req)]))});
exports.requestRefund=async(req,res)=>{
 if(!text(req.body?.reason,1,1000))fail(400,'دلیل درخواست بازگشت وجه را وارد کنید.');
 const ticket=await transaction(async client=>{
  const payment=found(await client.query("SELECT id,ride_id FROM payment_gateway_transactions WHERE id=$1 AND user_id=$2 AND status='completed'",[req.params.id,own(req)]));
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`refund:${payment.id}`]);
  const subject=`درخواست بازگشت وجه ${payment.id}`;
  const old=await client.query("SELECT id,status FROM support_tickets WHERE user_id=$1 AND subject=$2 AND category='refund' LIMIT 1",[own(req),subject]);if(old.rowCount)return old.rows[0];
  const result=await client.query("INSERT INTO support_tickets(user_id,ride_id,subject,category) VALUES($1,$2,$3,'refund') RETURNING id,status",[own(req),payment.ride_id,subject]);
  await client.query('INSERT INTO support_ticket_messages(ticket_id,sender_id,message) VALUES($1,$2,$3)',[result.rows[0].id,own(req),req.body.reason.trim()]);return result.rows[0];
 });res.status(201).json({ticket,message:'درخواست بررسی ثبت شد؛ بازگشت وجه هنوز انجام نشده است.'});
};
