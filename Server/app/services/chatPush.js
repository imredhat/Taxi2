const fs=require('node:fs');
const jwt=require('jsonwebtoken');
const {transaction}=require('../middleware/passenger');

function startChatPush(){
 const file=process.env.FCM_SERVICE_ACCOUNT_FILE;
 if(!file)return;
 let config;
 try{
  config=JSON.parse(fs.readFileSync(file,'utf8'));
  if(!/^[a-z0-9-]{5,40}$/.test(config.project_id)||!config.client_email||!config.private_key)throw new Error('invalid config');
 }catch{
  console.error('Chat push: invalid FCM service account configuration');
  return;
 }
 let accessToken,expiresAt=0;
 async function token(){
  if(accessToken&&Date.now()<expiresAt)return accessToken;
  const audience='https://oauth2.googleapis.com/token';
  const assertion=jwt.sign({scope:'https://www.googleapis.com/auth/firebase.messaging'},config.private_key,{
   algorithm:'RS256',issuer:config.client_email,audience,expiresIn:3600,
  });
  const response=await fetch(audience,{method:'POST',body:new URLSearchParams({
   grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion,
  }),signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw new Error('FCM authentication failed');
  const result=await response.json();
  accessToken=result.access_token;expiresAt=Date.now()+(result.expires_in-60)*1000;
  return accessToken;
 }
 async function deliver(){
  await transaction(async db=>{
   const {rows}=await db.query(`SELECT e.message_id,e.ride_id,e.recipient_id
    FROM chat_events e WHERE e.pushed_at IS NULL AND e.created_at>NOW()-INTERVAL '5 minutes'
    ORDER BY e.created_at,e.message_id LIMIT 1 FOR UPDATE SKIP LOCKED`);
   const item=rows[0];
   if(!item)return;
   const devices=await db.query(`SELECT t.id,t.token FROM device_tokens t
    JOIN users u ON u.id=t.user_id
    JOIN rides r ON r.id=$2
    LEFT JOIN driver_profiles dp ON dp.id=r.driver_id
    LEFT JOIN passenger_preferences pp ON pp.user_id=u.id
    WHERE t.user_id=$1 AND t.platform='android' AND t.is_active AND u.is_active AND NOT u.is_blocked
      AND r.status IN ('accepted','arriving','arrived','in_progress')
      AND (r.passenger_id=u.id OR dp.user_id=u.id)
      AND (u.role='driver' OR pp.activity_notifications IS DISTINCT FROM false)
      AND EXISTS(SELECT 1 FROM ride_messages m WHERE m.id=$3 AND m.is_read IS NOT TRUE)`,
    [item.recipient_id,item.ride_id,item.message_id]);
   if(devices.rows.length){
    const auth=await token();
    await Promise.all(devices.rows.map(async device=>{
     const response=await fetch(`https://fcm.googleapis.com/v1/projects/${config.project_id}/messages:send`,{
      method:'POST',headers:{Authorization:`Bearer ${auth}`,'Content-Type':'application/json'},
      body:JSON.stringify({message:{token:device.token,
       notification:{title:'پیام جدید سفر',body:'در گفت‌وگوی سفر پیام تازه دارید.'},
       data:{kind:'ride_chat',rideId:item.ride_id,messageId:item.message_id},
       android:{priority:'HIGH',ttl:'300s',notification:{channel_id:'trip-chat',sound:'default',tag:`chat-${item.ride_id}`}},
      }}),signal:AbortSignal.timeout(7000),
     });
     if(response.ok)return;
     const problem=await response.json().catch(()=>null);
     if(problem?.error?.details?.some(detail=>detail.errorCode==='UNREGISTERED')){
      await db.query('UPDATE device_tokens SET is_active=false WHERE id=$1 AND token=$2',[device.id,device.token]);
      return;
     }
     if(response.status===401){accessToken=undefined;expiresAt=0;}
     if(response.status===429||response.status>=500||response.status===401||response.status===403)throw new Error('FCM delivery unavailable');
    }));
   }
   await db.query('UPDATE chat_events SET pushed_at=NOW() WHERE message_id=$1',[item.message_id]);
  });
 }
 let failureDelay=1000;
 async function tick(){
  try{await deliver();failureDelay=1000;}
  catch{
   if(failureDelay===1000)console.error('Chat push delivery temporarily unavailable');
   failureDelay=Math.min(failureDelay*2,30000);
  }
  setTimeout(tick,failureDelay).unref();
 }
 void tick();
}
module.exports=startChatPush;
