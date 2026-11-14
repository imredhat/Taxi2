const {departureCutoffSql,isDepartureOpen}=require('../services/departureWindow');
const crypto=require('node:crypto');
const pool=require('../models/db');
const {fail,uuid,transaction}=require('../middleware/passenger');
const sep=require('../services/sepGateway');
const {companyPortion,settleDriver}=require('../services/driverRideSettlement');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const safePayment=row=>({id:row.id,status:row.status,amount:row.amount,currency:'IRR',purpose:row.purpose,
 ...(row.gateway==='sep_sandbox'?{sandbox:true}:row.status==='pending'&&row.authority?{redirect:sep.redirect(row.authority)}:{})});
function amount(value){const text=String(value);if(!/^\d{1,12}$/.test(text)||BigInt(text)<=0n)fail(400,'مبلغ صحیح و مثبت به ریال وارد کنید.');return BigInt(text).toString();}
const depositAmount=value=>companyPortion(amount(value)).toString();
const paidDeposit="COALESCE((SELECT SUM(p.amount) FROM payment_gateway_transactions p WHERE p.request_id=r.request_id AND p.purpose='deposit' AND p.status='completed'),0)";
const remainingFare=`r.fare-${paidDeposit}`;
exports.paidDeposit=paidDeposit;
exports.create=async(req,res)=>{
 const {purpose,ride_id,request_id,client_reference}=req.body||{};
 const bookingPayment=purpose==='deposit'||purpose==='full';
 if(!['topup','ride','deposit','full'].includes(purpose)||typeof client_reference!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(client_reference)||(purpose==='ride'&&!uuid(ride_id))||(bookingPayment&&!uuid(request_id)))fail(400,'درخواست پرداخت معتبر نیست.');
 const requested=purpose==='topup'?amount(req.body.amount):null;
 const sandbox=process.env.SEP_SANDBOX==='true';
 if(sandbox&&process.env.NODE_ENV==='production')fail(503,'حالت آزمایشی پرداخت در محیط توسعه در دسترس است.');
 const gateway=sandbox?'sep_sandbox':'sep';
 const config=sandbox?{terminal:'0'}:sep.configuration();
 const secret=crypto.randomBytes(32).toString('hex'),session=String(crypto.randomInt(1,2147483647));
 const payment=await transaction(async client=>{
  // Serialize one client's retries before creating an intent, even across app processes.
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`${req.user.userId}:${client_reference}`]);
  const previous=await client.query('SELECT * FROM payment_gateway_transactions WHERE user_id=$1 AND client_reference=$2',[req.user.userId,client_reference]);
  if(previous.rowCount){const row=previous.rows[0];if(row.gateway!==gateway||row.purpose!==purpose||(purpose==='topup'&&row.amount!==requested)||(purpose==='ride'&&row.ride_id!==ride_id)||(bookingPayment&&row.request_id!==request_id))fail(409,'شناسه پرداخت قبلاً با اطلاعات دیگری استفاده شده است.');return {...row,reused:true};}
  let total=requested,walletId=null;
  if(purpose==='ride'){
   const ride=await client.query(`SELECT r.id,r.payment_status,${remainingFare} AS fare FROM rides r WHERE r.id=$1 AND r.passenger_id=$2 AND r.status IN ('accepted','arriving','arrived','in_progress','completed') FOR UPDATE`,[ride_id,req.user.userId]);
   if(!ride.rowCount)fail(404,'سفر قابل پرداخت پیدا نشد.');
   if(ride.rows[0].payment_status!=='pending'&&ride.rows[0].payment_status!=='failed')fail(409,'این سفر قبلاً پرداخت شده یا در حال پرداخت است.');
   if(!sandbox&&(await client.query("SELECT 1 FROM rides r JOIN payment_gateway_transactions p ON p.request_id=r.request_id WHERE r.id=$1 AND p.purpose='deposit' AND p.gateway='sep_sandbox' AND p.status='completed'",[ride_id])).rowCount)
    fail(409,'این رزرو با پیش‌پرداخت آزمایشی ثبت شده است.');
   total=amount(ride.rows[0].fare);
   const active=await client.query("SELECT * FROM payment_gateway_transactions WHERE ride_id=$1 AND user_id=$2 AND status IN ('initializing','pending','unknown','completed') LIMIT 1",[ride_id,req.user.userId]);
   if(active.rowCount){
    if(active.rows[0].gateway!==gateway)fail(409,'ابتدا وضعیت پرداخت قبلی را بررسی کنید.');
    return {...active.rows[0],reused:true};
   }
  }else if(bookingPayment){
   const {rows:[booking]}=await client.query("SELECT status,estimated_fare,scheduled_at FROM ride_requests WHERE id=$1 AND passenger_id=$2 FOR UPDATE",[request_id,req.user.userId]);
   if(!booking||booking.status!=='awaiting_deposit'||!isDepartureOpen(booking.scheduled_at))fail(409,'این رزرو در انتظار پیش‌پرداخت نیست.');
   const {rows:[active]}=await client.query("SELECT * FROM payment_gateway_transactions WHERE request_id=$1 AND user_id=$2 AND purpose IN ('deposit','full') AND status IN ('initializing','pending','unknown','completed')",[request_id,req.user.userId]);
   if(active){
    if(active.gateway!==gateway)fail(409,'ابتدا وضعیت پرداخت قبلی را بررسی کنید.');
    return {...active,reused:true};
   }
   total=purpose==='full'?amount(booking.estimated_fare):depositAmount(booking.estimated_fare);
  }else{
   await client.query('INSERT INTO wallets(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[req.user.userId]);
   const wallet=await client.query('SELECT id FROM wallets WHERE user_id=$1 AND is_active=true',[req.user.userId]);if(!wallet.rowCount)fail(409,'کیف پول فعال نیست.');walletId=wallet.rows[0].id;
  }
  return(await client.query("INSERT INTO payment_gateway_transactions(user_id,ride_id,wallet_id,gateway,amount,status,purpose,client_reference,callback_secret_hash,terminal_id,session_key,request_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *",[req.user.userId,purpose==='ride'?ride_id:null,walletId,gateway,total,sandbox?'pending':'initializing',purpose,client_reference,hash(secret),config.terminal,session,bookingPayment?request_id:null])).rows[0];
 });
 if(payment.reused)return res.status(200).json({payment:safePayment(payment)});
 if(sandbox)return res.status(201).json({payment:safePayment(payment)});
 try{
  const result=await sep.token({action:'token',TerminalId:config.terminal,Amount:Number(payment.amount),ResNum:payment.id,RedirectUrl:`${config.base}/api/payments/sep/callback/${payment.id}?secret=${secret}`,CellNumber:req.passenger.phone.replace(/^\+98/,'0'),TxnRandomSessionKey:Number(payment.session_key)});
  if(result.status!==1||typeof result.token!=='string'||result.token.length>255){await pool.query("UPDATE payment_gateway_transactions SET status='failed' WHERE id=$1",[payment.id]);fail(502,'دریافت توکن پرداخت سامان انجام نشد.');}
  await pool.query("UPDATE payment_gateway_transactions SET status='pending',authority=$2 WHERE id=$1",[payment.id,result.token]);
  res.status(201).json({payment:safePayment({...payment,authority:result.token,status:'pending'})});
 }catch(error){await pool.query("UPDATE payment_gateway_transactions SET status='unknown' WHERE id=$1 AND status='initializing'",[payment.id]);throw error;}
};
async function verifyPayment(id,sandboxAction){
 return transaction(async client=>{
  const record=await client.query('SELECT * FROM payment_gateway_transactions WHERE id=$1 FOR UPDATE',[id]);if(!record.rowCount)fail(404,'پرداخت پیدا نشد.');const payment=record.rows[0];
  if(payment.status==='completed')return safePayment(payment);
  const sandbox=payment.gateway==='sep_sandbox';
  if(sandbox){
   if(process.env.NODE_ENV==='production'||process.env.SEP_SANDBOX!=='true'||!['complete','cancel'].includes(sandboxAction)||payment.status!=='pending')fail(409,'این پرداخت آزمایشی قابل تأیید نیست.');
   if(sandboxAction==='cancel'){
    await client.query("UPDATE payment_gateway_transactions SET status='cancelled' WHERE id=$1",[payment.id]);
    return safePayment({...payment,status:'cancelled'});
   }
  }else if(sandboxAction!==undefined)fail(400,'شبیه‌سازی فقط برای پرداخت آزمایشی مجاز است.');
  let result;
  if(!sandbox){
   if(!payment.reference_id||!['pending','unknown'].includes(payment.status))fail(409,'این پرداخت هنوز قابل تأیید نیست.');
   result=await sep.verify({RefNum:payment.reference_id,TerminalNumber:Number(payment.terminal_id),TxnRandomSessionKey:Number(payment.session_key)});
   if(!sep.matches(result,payment))fail(409,'تأیید معتبر مبلغ و رسید از سامان دریافت نشد. موجودی تغییر نکرده است.');
  }
  if(payment.purpose==='topup'){
   const wallet=await client.query('SELECT id,balance FROM wallets WHERE id=$1 AND user_id=$2 AND is_active=true FOR UPDATE',[payment.wallet_id,payment.user_id]);if(!wallet.rowCount)fail(409,'کیف پول فعال نیست؛ پرداخت نیاز به بررسی دارد.');
   const before=wallet.rows[0].balance,after=(BigInt(before)+BigInt(payment.amount)).toString();
   await client.query('UPDATE wallets SET balance=$2,updated_at=NOW() WHERE id=$1',[payment.wallet_id,after]);
   await client.query("INSERT INTO transactions(wallet_id,type,amount,balance_before,balance_after,reference_id,reference_type,description_fa) VALUES($1,'wallet_topup',$2,$3,$4,$5,'gateway_topup','شارژ کیف پول با سامان')",[payment.wallet_id,payment.amount,before,after,payment.id]);
  }else if(['deposit','full'].includes(payment.purpose)){
   const {rows:[booking]}=await client.query('SELECT status,estimated_fare,scheduled_at FROM ride_requests WHERE id=$1 AND passenger_id=$2 FOR UPDATE',[payment.request_id,payment.user_id]);
   if(!booking||booking.status!=='awaiting_deposit'||(payment.purpose==='full'?amount(booking.estimated_fare):depositAmount(booking.estimated_fare))!==String(payment.amount))fail(409,'وضعیت رزرو تغییر کرده است؛ پرداخت نیاز به بررسی دارد.');
   if(sandbox&&!isDepartureOpen(booking.scheduled_at))fail(409,'زمان حرکت این رزرو گذشته است.');
   await client.query(`UPDATE ride_requests SET status=CASE WHEN scheduled_at>${departureCutoffSql} THEN 'pending'::ride_status ELSE 'expired'::ride_status END WHERE id=$1`,[payment.request_id]);
  }else{
   const ride=await client.query(`SELECT r.id,${remainingFare} AS fare,r.payment_status FROM rides r WHERE r.id=$1 AND r.passenger_id=$2 FOR UPDATE`,[payment.ride_id,payment.user_id]);
   if(!ride.rowCount||String(ride.rows[0].fare)!==String(payment.amount)||ride.rows[0].payment_status==='completed')fail(409,'وضعیت کرایه تغییر کرده است؛ پرداخت نیاز به بررسی دارد.');
   await client.query("UPDATE rides SET payment_status='completed',payment_method='gateway' WHERE id=$1",[payment.ride_id]);
   await settleDriver(client,payment.ride_id,payment.amount);
  }
  const detail=result?.TransactionDetail;const masked=typeof detail?.MaskedPan==='string'&&detail.MaskedPan.includes('*')?detail.MaskedPan.slice(0,20):null;
  await client.query("UPDATE payment_gateway_transactions SET status='completed',paid_at=NOW(),card_number_masked=$2,rrn=$3,raw_response=$4::jsonb WHERE id=$1",[payment.id,masked,String(detail?.RRN||'').slice(0,20),JSON.stringify({sandbox,ResultCode:result?.ResultCode,amount:payment.amount,terminal:payment.terminal_id})]);
  const message=sandbox?'پرداخت آزمایشی ثبت شد.':'تراکنش سامان با موفقیت تأیید شد.';
  await client.query("INSERT INTO notifications(user_id,type,title,title_fa,body,body_fa,data) VALUES($1,'payment','پرداخت تأیید شد','پرداخت تأیید شد',$2,$2,$3::jsonb)",[payment.user_id,message,JSON.stringify({payment_id:payment.id,reservation_id:payment.request_id})]);
  return safePayment({...payment,status:'completed'});
 });
}
exports.verifyPayment=verifyPayment;
exports.verify=async(req,res)=>{const result=await pool.query('SELECT id FROM payment_gateway_transactions WHERE id=$1 AND user_id=$2',[req.params.id,req.user.userId]);if(!result.rowCount)fail(404,'پرداخت پیدا نشد.');res.json({payment:await verifyPayment(req.params.id,req.body?.sandbox_action)});};
exports.callback=async(req,res)=>{
 if(!uuid(req.params.id)||typeof req.query.secret!=='string'||!/^[a-f0-9]{64}$/.test(req.query.secret))fail(400,'بازگشت پرداخت معتبر نیست.');
 const record=await pool.query('SELECT id,callback_secret_hash,authority,terminal_id FROM payment_gateway_transactions WHERE id=$1',[req.params.id]);if(!record.rowCount)fail(404,'پرداخت پیدا نشد.');const payment=record.rows[0];
 const received=Buffer.from(hash(req.query.secret),'hex'),expected=Buffer.from(payment.callback_secret_hash||'','hex');
 if(received.length!==expected.length||!crypto.timingSafeEqual(received,expected))fail(403,'بازگشت پرداخت معتبر نیست.');
 const body=req.method==='GET'?req.query:req.body||{};
 if(payment.terminal_id==='0'||String(body.ResNum)!==payment.id||String(body.TerminalId)!==payment.terminal_id||(body.Token&&body.Token!==payment.authority))fail(400,'شناسه بازگشت پرداخت هماهنگ نیست.');
 if(body.State!=='OK'||String(body.Status)!=='2'||typeof body.RefNum!=='string'||!body.RefNum.trim()||body.RefNum.length>255)return res.status(202).json({payment:{id:payment.id,status:'pending'},message:'پرداخت تأیید نشده است؛ وضعیت را از برنامه بررسی کنید.'});
 const result=await pool.query('UPDATE payment_gateway_transactions SET reference_id=$2 WHERE id=$1 AND (reference_id IS NULL OR reference_id=$2) RETURNING id',[payment.id,body.RefNum]);if(!result.rowCount)fail(409,'رسید دیگری به این پرداخت متصل شده است.');
 res.json({payment:await verifyPayment(payment.id),message:'نتیجه ثبت شد. به برنامه بازگردید.'});
};
exports.walletPay=async(req,res)=>{
 const result=await transaction(async client=>{
  const ride=await client.query(`SELECT r.id,${remainingFare} AS fare,r.payment_status,r.payment_method FROM rides r WHERE r.id=$1 AND r.passenger_id=$2 AND r.status='completed' FOR UPDATE`,[req.params.id,req.user.userId]);if(!ride.rowCount)fail(404,'سفر قابل پرداخت پیدا نشد.');const trip=ride.rows[0];
  if(trip.payment_status==='completed'){if(trip.payment_method==='wallet')return{id:trip.id,payment_status:'completed',reused:true};fail(409,'این سفر قبلاً پرداخت شده است.');}
  const active=await client.query("SELECT id FROM payment_gateway_transactions WHERE ride_id=$1 AND status IN ('initializing','pending','unknown','completed') LIMIT 1",[trip.id]);if(active.rowCount)fail(409,'پرداخت درگاهی فعالی برای این سفر وجود دارد.');
  const total=amount(trip.fare);const wallet=await client.query('SELECT id,balance,frozen_balance FROM wallets WHERE user_id=$1 AND is_active=true FOR UPDATE',[req.user.userId]);if(!wallet.rowCount||BigInt(wallet.rows[0].balance)-BigInt(wallet.rows[0].frozen_balance||0)<BigInt(total))fail(409,'موجودی قابل استفاده کیف پول کافی نیست.');
  const row=wallet.rows[0],after=(BigInt(row.balance)-BigInt(total)).toString();
  await client.query('UPDATE wallets SET balance=$2,updated_at=NOW() WHERE id=$1',[row.id,after]);
  await client.query("INSERT INTO transactions(wallet_id,type,amount,balance_before,balance_after,ride_id,reference_id,reference_type,description_fa) VALUES($1,'ride_payment',$2,$3,$4,$5,$5,'ride','پرداخت کرایه از کیف پول')",[row.id,`-${total}`,row.balance,after,trip.id]);
  await client.query("UPDATE rides SET payment_status='completed',payment_method='wallet' WHERE id=$1",[trip.id]);
  await settleDriver(client,trip.id,total);
  return{id:trip.id,payment_status:'completed'};
 });res.json({trip:result});
};
