const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash,randomUUID}=require('node:crypto');
const jwt=require('jsonwebtoken');
require('dotenv').config();

test('driver progress persists ordered arrivals, including concurrent retries and the final destination',{
 skip:process.env.RUN_DISPATCH_LIVE_TESTS!=='1',timeout:20000,
},async()=>{
 const pool=require('../app/models/db');
 const tag=randomUUID().slice(0,12);
 const users=[];
 let brand, request, ride, approachKey;
 const uploadedFiles=[];
 let selfieFile;
 try{
  const created=await pool.query(`INSERT INTO users(phone,role,is_active,is_blocked)
   VALUES($1,'passenger',true,false),($2,'driver',true,false),($3,'driver',true,false),($4,'admin',true,false) RETURNING id`,[tag+'p',tag+'d',tag+'e',tag+'a']);
  users.push(...created.rows.map(row=>row.id));
  const [passenger,driver,other,admin]=users;
  const profiles=[];
  for(const user of [driver,other]){
   profiles.push((await pool.query('INSERT INTO driver_profiles(user_id,is_verified) VALUES($1,true) RETURNING id',[user])).rows[0].id);
  }
  brand=(await pool.query('INSERT INTO car_brands(name) VALUES($1) RETURNING id',[tag])).rows[0].id;
  const model=(await pool.query("INSERT INTO car_models(brand_id,name,vehicle_class) VALUES($1,$2,'eco_intercity') RETURNING id",[brand,tag])).rows[0].id;
  const vehicle=(await pool.query(`INSERT INTO vehicles(driver_id,model_id,color,license_plate,year,car_class)
   VALUES($1,$2,'white',$3,1405,'eco_intercity') RETURNING id`,[profiles[0],model,tag])).rows[0].id;
  const stops=[{lat:33.4,lng:48.3,address:'First'},{lat:33.5,lng:48.5,address:'Second'}];
  request=(await pool.query(`INSERT INTO ride_requests(passenger_id,pickup_location,dropoff_location,car_class,booking_details,status)
   VALUES($1,'POINT(48.3 33.4)','POINT(48.5 33.5)','eco_intercity',jsonb_build_object('starts',$2::jsonb,'ends',$2::jsonb,'routeLegs',$3::jsonb),'accepted') RETURNING id`,
   [passenger,JSON.stringify(stops),JSON.stringify([{seconds:61,meters:500},{seconds:180,meters:2500},{seconds:240,meters:3000}])])).rows[0].id;
  ride=(await pool.query(`INSERT INTO rides(request_id,passenger_id,driver_id,vehicle_id,car_class,pickup_location,dropoff_location)
   SELECT id,passenger_id,$2,$3,car_class,pickup_location,dropoff_location FROM ride_requests WHERE id=$1 RETURNING id`,[request,profiles[0],vehicle])).rows[0].id;
  const base=process.env.DISPATCH_TEST_API_URL||'http://127.0.0.1:3001';
  const fs=require('node:fs/promises');
  const filename=`test-selfie-${tag}.jpg`;
  selfieFile=require('node:path').join(__dirname,'../uploads',filename);
  await fs.writeFile(selfieFile,Buffer.from('/9j/','base64'),{flag:'wx'});
  await pool.query("INSERT INTO driver_documents(driver_id,document_type,file_url) VALUES($1,'selfie',$2)",[profiles[0],`http://localhost:3001/uploads/${filename}`]);
  const profilePhoto=userId=>fetch(`${base}/api/driver/profile-photo`,{
   headers:{Authorization:`Bearer ${jwt.sign({userId,role:'driver'},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`},
   signal:AbortSignal.timeout(5000),
  }).then(response=>response.json());
  assert.deepEqual(await profilePhoto(driver),{image:'data:image/jpeg;base64,/9j/'});
  assert.deepEqual(await profilePhoto(other),{image:null});
  const updatePhoto=base64=>fetch(`${base}/api/driver/profile-photo`,{
   method:'PUT',headers:{Authorization:`Bearer ${jwt.sign({userId:driver,role:'driver'},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`,'Content-Type':'application/json'},
   body:JSON.stringify({base64}),signal:AbortSignal.timeout(5000),
  });
  assert.equal((await updatePhoto('invalid')).status,400);
  const replacement='/9j/AA==';
  assert.equal((await updatePhoto(replacement)).status,200);
  assert.deepEqual(await profilePhoto(driver),{image:`data:image/jpeg;base64,${replacement}`});
  assert.deepEqual(await profilePhoto(other),{image:null});
  const vehicleDetails=async (userId,suffix='')=>fetch(`${base}/api/driver/vehicles/${vehicle}${suffix}`,{
   headers:{Authorization:`Bearer ${jwt.sign({userId,role:'driver'},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`},
   signal:AbortSignal.timeout(5000),
  });
  await pool.query("INSERT INTO driver_documents(driver_id,document_type,file_url) VALUES($1,'insurance','http://localhost:3001/uploads/insurance.jpg'),($1,'driver_license','http://localhost:3001/uploads/license.jpg')",[profiles[0]]);
  assert.equal((await vehicleDetails(other)).status,404);
  const {documents}= (await (await vehicleDetails(driver)).json()).vehicle;
  assert.deepEqual(documents,[{id:documents[0]?.id,type:'insurance'}]);
  assert.equal((await vehicleDetails(other,`/documents/${documents[0].id}`)).status,404);
  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII=';
  const registered=await fetch(`${base}/api/driver/vehicles`,{
   method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${jwt.sign({userId:driver,role:'driver'},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`},
   body:JSON.stringify({model_id:model,year:'1405',color:'white',plate_part1:tag.slice(0,2).replace(/[a-f]/g,'1'),
    plate_part2:'27',plate_part3:'318',plate_letter:'ت',documents:[{type:'insurance',base64:'/9j/'},{type:'vehicle_front',base64:png}]}),
   signal:AbortSignal.timeout(5000),
  });
  assert.equal(registered.status,201);
  const added=(await registered.json()).vehicle.id;
  const vehicleAction=(prefix,action,method,userId,role)=>fetch(`${base}${prefix}/vehicles/${added}/${action}`,{
   method,headers:{Authorization:`Bearer ${jwt.sign({userId,role},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`},
   signal:AbortSignal.timeout(5000),
  });
  assert.equal((await vehicleAction('/api/driver','active','PUT',driver,'driver')).status,404);
  assert.equal((await vehicleAction('/api','approve','PATCH',driver,'driver')).status,403);
  assert.equal((await vehicleAction('/api','approve','PATCH',admin,'admin')).status,200);
  assert.equal((await vehicleAction('/api/driver','active','PUT',driver,'driver')).status,200);
  const {rows:uploads}=await pool.query('SELECT id,file_url,document_type FROM driver_documents WHERE vehicle_id=$1',[added]);
  uploadedFiles.push(...uploads.map(doc=>doc.file_url.slice('vehicle-document:'.length)));
  assert.equal(uploads.length,2);
  for(const uploaded of uploads){
  const preview=await fetch(`${base}/api/driver/vehicles/${added}/documents/${uploaded.id}`,{
   headers:{Authorization:`Bearer ${jwt.sign({userId:driver,role:'driver'},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`},
   signal:AbortSignal.timeout(5000),
  });
  assert.deepEqual(await preview.json(),{image:uploaded.file_url.endsWith('.png')?`data:image/png;base64,${png}`:'data:image/jpeg;base64,/9j/'});
  }
  assert.ok(uploadedFiles.some(file=>file.endsWith('.png')));
  const dashboard=await fetch(`${base}/api/driver/dashboard`,{
   headers:{Authorization:`Bearer ${jwt.sign({userId:driver,role:'driver'},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`},
   signal:AbortSignal.timeout(5000),
  });
  assert.equal(dashboard.status,200);
  const {vehicles}=await dashboard.json();
  assert.equal(vehicles.find(item=>item.id===added).front_document_id,uploads.find(doc=>doc.document_type==='vehicle_front').id);
  assert.equal(vehicles.find(item=>item.id===vehicle).front_document_id,null);
  const call=(index,userId=driver,suffix='')=>{
   const token=jwt.sign({userId,role:'driver'},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026',{expiresIn:'2m'});
   const url=base+'/api/driver/trips/'+ride+(index==null?suffix:'/reach-stop');
   return fetch(url,{method:index==null?'GET':'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:index==null?undefined:JSON.stringify({stops_reached:index}),signal:AbortSignal.timeout(5000)});
  };
  const lat=(32+parseInt(tag.slice(0,5),16)/1e6).toFixed(3);
  const lng=(47+parseInt(tag.slice(5,10),16)/1e6).toFixed(3);
  approachKey=createHash('sha256').update(JSON.stringify(['approach',[[lat,lng],[stops[0].lat,stops[0].lng]]])).digest('hex');
  const approach={minutes:[12],meters:[3400]};
  await pool.query("INSERT INTO dispatch_route_cache(key,metrics,expires_at) VALUES($1,$2,NOW()+INTERVAL '1 minute')",[approachKey,JSON.stringify(approach)]);
  const pickupPath=`/pickup-metrics?lat=${lat}&lng=${lng}`;
  assert.equal((await call(null,other,pickupPath)).status,404);
  assert.deepEqual(await (await call(null,driver,pickupPath)).json(),approach);
  assert.equal((await call(0,other)).status,404);
  const rate=(role,userId,score,tags)=>fetch(`${base}/api/${role}/trips/${ride}/rating`,{
   method:'PUT',headers:{Authorization:`Bearer ${jwt.sign({userId,role},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`,'Content-Type':'application/json'},
   body:JSON.stringify({score,tags,comment:'تست'}),signal:AbortSignal.timeout(5000),
  });
  assert.equal((await rate('driver',driver,5,[])).status,404);
  assert.equal((await call(1)).status,409);
  for(const [index,status] of ['arriving','in_progress','in_progress','completed'].entries()){
   for(const response of await Promise.all([call(index),call(index)])){
    assert.equal(response.status,200);
    assert.deepEqual((await response.json()).trip,{status,stops_reached:index+1});
   }
   assert.equal((await (await call()).json()).trip.stops_reached,index+1);
  }
  const details=async()=>{
   const response=await call();
   assert.equal(response.status,200);
   return (await response.json()).trip;
  };
  assert.equal((await rate('driver',other,5,[])).status,404);
  assert.equal((await rate('driver',driver,6,[])).status,400);
  assert.equal((await rate('driver',driver,4,['رفتار نامناسب'])).status,200);
  assert.deepEqual((await details()).my_rating,{score:4,comment:'تست',tags:['رفتار نامناسب']});
  assert.equal((await rate('passenger',passenger,3,['خودروی تمیز'])).status,200);
  assert.equal((await rate('passenger',passenger,2,['تأخیر'])).status,200);
  const reviews=async userId=>{
   const response=await fetch(`${base}/api/driver/reviews`,{
    headers:{Authorization:`Bearer ${jwt.sign({userId,role:'driver'},process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026')}`},
    signal:AbortSignal.timeout(5000),
   });
   assert.equal(response.status,200);
   return response.json();
  };
  const received=await reviews(driver);
  assert.deepEqual(received.tags,[{tag:'تأخیر',count:1}]);
  assert.deepEqual(received.comments.map(({score,comment})=>({score,comment})),[{score:2,comment:'تست'}]);
  assert.deepEqual(await reviews(other),{tags:[],comments:[],has_more:false});
  assert.equal((await pool.query('SELECT rating::float FROM driver_profiles WHERE id=$1',[profiles[0]])).rows[0].rating,2);
  assert.equal((await pool.query('SELECT count(*)::int AS count FROM ratings WHERE ride_id=$1',[ride])).rows[0].count,2);
  assert.equal((await details()).payment_status,'pending');
  assert.deepEqual((await details()).route_metrics,{minutes:[2,3,4],meters:[500,2500,3000]});
  assert.equal((await details()).driver_share,null);
  await pool.query('UPDATE rides SET fare=1000000 WHERE id=$1',[ride]);
  await pool.query(`INSERT INTO payment_gateway_transactions(user_id,request_id,gateway,amount,purpose,status)
   VALUES($1,$2,'sep_sandbox',300000,'deposit','completed')`,[passenger,request]);
  assert.equal((await details()).driver_share,'800000');
  await pool.query(`INSERT INTO payment_gateway_transactions(user_id,ride_id,gateway,amount,purpose)
   VALUES($1,$2,'sep_sandbox',1000,'ride')`,[passenger,ride]);
  assert.equal((await details()).payment_status,'processing');
  await pool.query("UPDATE payment_gateway_transactions SET status='completed' WHERE ride_id=$1",[ride]);
  await pool.query("UPDATE rides SET payment_status='completed' WHERE id=$1",[ride]);
  const paid=await details();
  assert.equal(paid.payment_status,'completed');
  assert.equal(paid.fare,'1000000');
  assert.equal(paid.driver_share,null);
 }finally{
  try{
   if(selfieFile)await require('node:fs/promises').rm(selfieFile,{force:true});
   for(const file of uploadedFiles)await require('node:fs/promises').unlink(require('node:path').join(__dirname,'../vehicle-documents',file));
   if(approachKey)await pool.query('DELETE FROM dispatch_route_cache WHERE key=$1',[approachKey]);
   if(ride)await pool.query('DELETE FROM rides WHERE id=$1',[ride]);
   if(request)await pool.query('DELETE FROM ride_requests WHERE id=$1',[request]);
   if(users.length)await pool.query('DELETE FROM users WHERE id=ANY($1::uuid[])',[users]);
   if(brand){
    await pool.query('DELETE FROM car_models WHERE brand_id=$1',[brand]);
    await pool.query('DELETE FROM car_brands WHERE id=$1',[brand]);
   }
  }finally{await pool.end();}
 }
});
