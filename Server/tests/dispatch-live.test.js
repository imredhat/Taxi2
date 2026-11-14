const test=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const jwt=require('jsonwebtoken');
const {io}=require('socket.io-client');
require('dotenv').config();

test('live dispatch scopes events, updates Redis offers and commits only one acceptance',{
  skip:process.env.RUN_DISPATCH_LIVE_TESTS!=='1',timeout:30000,
},async(t)=>{
  const pool=require('../app/models/db');
  const base=process.env.DISPATCH_TEST_API_URL||'http://127.0.0.1:3001';
  const secondBase=process.env.DISPATCH_TEST_SECOND_API_URL||base;
  const secret=process.env.JWT_SECRET||'pooyesh_taxi_jwt_secret_2026';
  const tag='d'+randomUUID().replace(/-/g,'').slice(0,12);
  const point={lat:33.4,lng:48.3};
  const sockets=[], users=[];
  let brand,request;
  const auth=(userId,role)=>jwt.sign({userId,role},secret,{expiresIn:'2m'});
  const call=(path,token,body)=>fetch(base+path,{
    method:body?'POST':'GET',
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined,
    signal:AbortSignal.timeout(5000),
  });
  function socket(token,url=base){
    const client=io(url,{
      auth:{token},path:'/dispatch/socket.io',transports:['websocket'],autoConnect:false,reconnection:false,timeout:2500,
    });
    sockets.push(client);
    return client;
  }
  function event(client,name){
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{client.off(name,receive);reject(new Error(`Timed out: ${name}`));},4500);
      function receive(payload){clearTimeout(timer);resolve(payload);}
      client.once(name,receive);
    });
  }
  async function connect(client){
    const outcome=event(client,'connect');
    client.connect();
    await outcome;
  }
  try{
    const {rows}=await pool.query(`INSERT INTO users(phone,role,is_active,is_blocked)
      VALUES($1,'passenger',true,false),($2,'passenger',true,false),($3,'driver',true,false),($4,'driver',true,false)
      RETURNING id,role`,[tag+'p',tag+'q',tag+'d',tag+'e']);
    users.push(...rows);
    const [passenger,other,driver,secondDriver]=users;
    const issued=users.map(user=>auth(user.id,user.role));
    const phone='0'+Date.now();
    await pool.query('UPDATE users SET phone=$2,first_name=$3,last_name=$4 WHERE id=$1',[passenger.id,phone,'مسافر','آزمایشی']);
    brand=(await pool.query('INSERT INTO car_brands(name) VALUES($1) RETURNING id',[tag])).rows[0].id;
    const model=(await pool.query("INSERT INTO car_models(brand_id,name,vehicle_class) VALUES($1,$2,'eco_intercity') RETURNING id",[brand,tag])).rows[0].id;
    const vehicles=[];
    for(const user of [driver,secondDriver]){
      const profile=(await pool.query('INSERT INTO driver_profiles(user_id,is_verified) VALUES($1,true) RETURNING id',[user.id])).rows[0].id;
      const vehicle=(await pool.query(`INSERT INTO vehicles(driver_id,model_id,color,license_plate,year,car_class)
        VALUES($1,$2,'white',$3,1405,'eco_intercity') RETURNING id`,[profile,model,tag+vehicles.length])).rows[0].id;
      await pool.query('UPDATE driver_profiles SET active_vehicle_id=$2 WHERE id=$1',[profile,vehicle]);
      vehicles.push(vehicle);
    }

    const invalid=socket(issued[0]+'invalid');
    const denied=event(invalid,'connect_error');
    invalid.connect();
    assert.equal((await denied).message,'unauthorized');
    assert.equal((await call('/api/ride-requests',issued[2])).status,403);

    const expired=socket(jwt.sign({userId:passenger.id,role:'passenger'},secret,{expiresIn:-1}));
    const expiredDenied=event(expired,'connect_error');
    expired.connect();
    assert.equal((await expiredDenied).message,'unauthorized');

    const ownerSocket=socket(issued[0],secondBase), unrelatedSocket=socket(issued[1],secondBase);
    const driverSocket=socket(issued[2]), otherDriverSocket=socket(issued[3],secondBase);
    await Promise.all([ownerSocket,unrelatedSocket,driverSocket,otherDriverSocket].map(connect));
    let unrelatedEvents=0, farEvents=0;
    unrelatedSocket.on('reservations:changed',()=>unrelatedEvents++);
    otherDriverSocket.on('offers:changed',()=>farEvents++);
    assert.equal(await driverSocket.timeout(2500).emitWithAck('offers:location',point),true);
    assert.equal(await otherDriverSocket.timeout(2500).emitWithAck('offers:location',{lat:36,lng:52}),true);

    const added=event(driverSocket,'offers:changed');
    const ownerEvent=event(ownerSocket,'reservations:changed');
    const insertedAt=Date.now();
    request=(await pool.query(`INSERT INTO ride_requests(passenger_id,ride_type,car_class,pickup_location,dropoff_location,
      pickup_address,dropoff_address,scheduled_at,estimated_fare,client_reference)
      VALUES($1,'normal','eco_city',ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,
      ST_SetSRID(ST_MakePoint($2+0.1,$3+0.1),4326)::geography,'test pickup','test destination',NOW()+INTERVAL '1 day',1234567,$4)
      RETURNING id`,[passenger.id,point.lng,point.lat,tag])).rows[0].id;
    await added;
    assert.ok((await ownerEvent).includes(request));
    t.diagnostic(`Insert to both socket events: ${Date.now()-insertedAt}ms`);
    const url=`/api/driver/offers?lat=${point.lat}&lng=${point.lng}`;
    const items=async()=>((await (await call(url,issued[2])).json()).items);
    assert.ok((await items()).some(item=>item.id===request));
    assert.equal((await call(`/api/passenger/reservations/${request}`,issued[1])).status,404);

    const updated=event(driverSocket,'offers:changed');
    await pool.query('UPDATE ride_requests SET estimated_fare=2345678 WHERE id=$1',[request]);
    await updated;
    assert.equal((await items()).find(item=>item.id===request)?.fare,'2345678');

    const removed=event(driverSocket,'offers:changed');
    const accepted=event(ownerSocket,'reservations:changed');
    const responses=await Promise.all(vehicles.map((vehicle_id,index)=>call(
      `/api/driver/offers/${request}/accept`,issued[index+2],{...point,vehicle_id},
    )));
    assert.deepEqual(responses.map(response=>response.status).sort(),[201,409]);
    await removed;
    assert.ok((await accepted).includes(request));
    assert.ok(!(await items()).some(item=>item.id===request));
    driverSocket.disconnect();
    await connect(driverSocket);
    assert.equal(await driverSocket.timeout(2500).emitWithAck('offers:location',point),true);
    assert.ok(!(await items()).some(item=>item.id===request));
    const winner=responses.findIndex(response=>response.status===201);
    const {ride}=await responses[winner].json();
    const tripRoot=`/api/driver/trips/${ride.id}`;
    const trip=(await (await call(tripRoot,issued[winner+2])).json()).trip;
    assert.deepEqual(trip.starts,[{...point,address:'test pickup'}]);
    assert.equal(trip.ends.length,1);
    assert.equal(trip.can_contact,true);
    assert.equal(trip.passenger_name,'مسافر آزمایشی');
    assert.ok(!Object.hasOwn(trip,'phone'));
    assert.deepEqual(await (await call(tripRoot+'/contact',issued[winner+2])).json(),{phone});
    assert.equal((await call(tripRoot+'/contact',issued[3-winner])).status,404);
    const passengerMessages=`/api/passenger/trips/${ride.id}/messages`;
    const passengerEvent=event(ownerSocket,'chat:message');
    const sent=await call(tripRoot+'/messages',issued[winner+2],{message:'Driver fixture message'});
    assert.equal(sent.status,201);
    const driverMessage=(await sent.json()).message;
    assert.deepEqual(await passengerEvent,{rideId:ride.id,messageId:driverMessage.id});
    const recipientSocket=winner===0?driverSocket:otherDriverSocket;
    const driverEvent=event(recipientSocket,'chat:message');
    const reply=await call(passengerMessages,issued[0],{message:'Passenger fixture reply'});
    assert.equal(reply.status,201);
    const passengerMessage=(await reply.json()).message;
    assert.deepEqual(await driverEvent,{rideId:ride.id,messageId:passengerMessage.id});
    const passengerReservation=`/api/passenger/reservations/${request}`;
    assert.equal((await (await call(passengerReservation,issued[0])).json()).reservation.assigned_ride.unread_count,1);
    assert.equal((await (await call(tripRoot,issued[winner+2])).json()).trip.unread_count,1);
    assert.equal((await call(tripRoot+'/messages/read',issued[3-winner],{ids:[passengerMessage.id]})).status,404);
    assert.equal((await (await call(tripRoot+'/messages/read',issued[winner+2],{ids:[driverMessage.id]})).json()).updated,0);
    assert.equal((await (await call(tripRoot+'/messages/read',issued[winner+2],{ids:[passengerMessage.id]})).json()).updated,1);
    assert.equal((await (await call(passengerMessages+'/read',issued[0],{ids:[driverMessage.id]})).json()).updated,1);
    assert.equal((await (await call(passengerReservation,issued[0])).json()).reservation.assigned_ride.unread_count,0);
    assert.equal((await (await call(tripRoot,issued[winner+2])).json()).trip.unread_count,0);
    const notices=(await (await call('/api/passenger/notifications',issued[0])).json()).items;
    assert.ok(notices.some(notice=>notice.data.message_id===driverMessage.id));
    const thread=await (await call(tripRoot+'/messages',issued[winner+2])).json();
    assert.ok(thread.items.every(item=>item.is_read));
    assert.deepEqual(thread.items.map(item=>[item.message,item.is_mine]),[['Driver fixture message',true],['Passenger fixture reply',false]]);
    assert.equal((await call(tripRoot+'/messages',issued[3-winner])).status,404);
    const received=await (await call(passengerMessages,issued[0])).json();
    assert.deepEqual(received.items.map(item=>item.is_mine),[false,true]);
    const reopened=event(driverSocket,'offers:changed');
    const cancellation=event(ownerSocket,'reservations:changed');
    const cancelled=await call(`/api/driver/trips/${ride.id}/cancel`,issued[winner+2],{reason:'vehicle_issue'});
    assert.equal(cancelled.status,200);
    await reopened;
    assert.ok((await cancellation).includes(request));
    assert.ok((await items()).some(item=>item.id===request));
    const detail=await (await call(`/api/passenger/reservations/${request}`,issued[0])).json();
    assert.equal(detail.reservation.status,'searching');
    assert.equal(detail.reservation.assigned_ride,null);
    assert.equal((await call(tripRoot+'/contact',issued[winner+2])).status,404);
    assert.equal((await (await call(tripRoot,issued[winner+2])).json()).trip.passenger_name,null);
    assert.equal((await call(tripRoot+'/messages',issued[winner+2],{message:'Rejected fixture message'})).status,404);
    assert.equal(unrelatedEvents,0);
    assert.equal(farEvents,0);
  }finally{
    for(const client of sockets)client.disconnect();
    try{
      if(request){
        await pool.query('DELETE FROM rides WHERE request_id=$1',[request]);
        await pool.query('DELETE FROM ride_requests WHERE id=$1',[request]);
      }
      await pool.query('DELETE FROM users WHERE id=ANY($1::uuid[])',[users.map(user=>user.id)]);
      if(brand){
        await pool.query('DELETE FROM car_models WHERE brand_id=$1',[brand]);
        await pool.query('DELETE FROM car_brands WHERE id=$1',[brand]);
      }
    }finally{await pool.end();}
  }
});
