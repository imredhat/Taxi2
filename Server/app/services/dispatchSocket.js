const {Server}=require('socket.io');
const {createClient}=require('redis');
const {verifyAccessToken}=require('../middleware/auth');
const {uuid}=require('../middleware/passenger');
const pool=require('../models/db');
const basket=require('./offerBasket');

async function account({userId,role}){
  const {rows}=await pool.query(`SELECT u.id, v.car_class
    FROM users u LEFT JOIN driver_profiles dp ON dp.user_id=u.id AND dp.is_verified
    LEFT JOIN vehicles v ON v.id=dp.active_vehicle_id AND v.driver_id=dp.id AND v.is_active
    WHERE u.id=$1 AND u.role=$2 AND u.is_active AND NOT u.is_blocked`,[userId,role]);
  return rows[0];
}

function attachDispatch(server){
  if(!process.env.DISPATCH_REDIS_URL)return;
  const allowedOrigins=new Set((process.env.DISPATCH_WEB_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean));
  const io=new Server(server,{
    path:'/dispatch/socket.io',
    transports:['websocket'],
    maxHttpBufferSize:4096,
    allowRequest:(req,done)=>{
      const origin=req.headers.origin;
      const local=process.env.NODE_ENV!=='production'&&/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin||'');
      done(null,!origin||local||allowedOrigins.has(origin));
    },
  });
  const redis=createClient({url:process.env.DISPATCH_REDIS_URL,disableOfflineQueue:true,socket:{connectTimeout:3000,socketTimeout:10000}});
  const subscriber=redis.duplicate({socket:{connectTimeout:3000}});
  for(const client of [redis,subscriber]){
    client.on('error',()=>{
      if(!client.isReady)io.local.disconnectSockets(true);
    });
    client.on('reconnecting',()=>io.local.disconnectSockets(true));
  }
  Promise.all([redis.connect(),subscriber.connect()]).then(async()=>{
    await subscriber.subscribe(basket.channel,message=>{
      try{
        const {rebuilt,rooms,passengers,messages=[]}=JSON.parse(message);
        for(const {recipient_id,ride_id,message_id,reservation_id} of messages){
          io.local.to(`chat-user:${recipient_id}`).emit('chat:message',{rideId:ride_id,messageId:message_id});
          if(reservation_id)io.local.to(`passenger:${recipient_id}`).emit('reservations:changed',[reservation_id]);
        }
        if(rebuilt)io.local.to('drivers:available').emit('offers:changed');
        if(rooms.length)io.local.to(rooms).emit('offers:changed');
        for(const [id,ids] of passengers)io.local.to(`passenger:${id}`).emit('reservations:changed',ids);
      }catch{
        console.error('Invalid dispatch event');
      }
    });
    basket.start(redis,io,()=>subscriber.isReady);
  })
    .catch(error=>console.error('Dispatch Redis:',error.code||error.name));

  io.use(async(socket,next)=>{
    try{
      if(!basket.isReady()||!subscriber.isReady)return next(new Error('unavailable'));
      const token=socket.handshake.auth?.token;
      if(typeof token!=='string'||token.length>2048)throw new Error('invalid token');
      const claims=verifyAccessToken(token);
      if(!uuid(claims.userId)||!['driver','passenger'].includes(claims.role)||!Number.isFinite(claims.exp))throw new Error('invalid claims');
      const profile=await account(claims);
      if(!profile)throw new Error('account unavailable');
      socket.data={claims,carClass:profile.car_class};
      next();
    }catch{
      next(new Error('unauthorized'));
    }
  });

  io.on('connection',socket=>{
    const {claims}=socket.data;
    socket.join(`chat-user:${claims.userId}`);
    if(claims.role==='passenger')socket.join(`passenger:${claims.userId}`);
    else socket.join('drivers:available');
    let room,lastPosition=0;
    if(claims.role==='driver')socket.on('offers:location',async(point,ack)=>{
      if(typeof ack!=='function')return;
      if(!socket.data.carClass||!basket.isReady()||Date.now()>=claims.exp*1000||!basket.validPoint(point))return ack(false);
      const now=Date.now();
      if(now-lastPosition<750)return ack(false);
      lastPosition=now;
      const nextRoom=basket.room(socket.data.carClass,point);
      if(nextRoom!==room){
        if(room)await socket.leave(room);
        room=nextRoom;
        await socket.join(room);
      }
      ack(true);
    });
    const timeout=setTimeout(()=>socket.disconnect(true),Math.max(0,Math.min(2147483647,claims.exp*1000-Date.now())));
    const revalidate=setInterval(async()=>{
      try{
        if(!basket.isReady()||!subscriber.isReady)return socket.disconnect(true);
        const profile=await account(claims);
        if(!basket.isReady()||!subscriber.isReady||!profile||profile.car_class!==socket.data.carClass)socket.disconnect(true);
      }catch{
        socket.disconnect(true);
      }
    },45000+Math.random()*30000);
    socket.on('disconnect',()=>{clearTimeout(timeout);clearInterval(revalidate);});
  });
}

module.exports=attachDispatch;
