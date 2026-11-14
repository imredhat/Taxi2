const pool=require('../models/db');
const {fail,uuid}=require('../middleware/passenger');

exports.markRead=async(req,res)=>{
 const id=req.params.id,ids=req.body?.ids;
 if(!uuid(id)||!Array.isArray(ids)||!ids.length||ids.length>100||!ids.every(uuid))fail(400,'شناسهٔ پیام‌ها معتبر نیست.');
 const driver=!!req.driver;
 const owner=driver?'driver_id':'passenger_id';
 const ownerId=driver?req.driver.id:req.user.userId;
 const {rows}=await pool.query(`WITH owned AS (
   SELECT id FROM rides WHERE id=$1 AND ${owner}=$2
 ), changed AS (
   UPDATE ride_messages m SET is_read=true FROM owned o
   WHERE m.ride_id=o.id AND m.recipient_id=$3 AND m.id=ANY($4::uuid[]) AND m.is_read IS NOT TRUE
   RETURNING m.id
 ) SELECT EXISTS(SELECT 1 FROM owned) AS allowed,(SELECT count(*)::int FROM changed) AS updated`,
 [id,ownerId,req.user.userId,ids]);
 if(!rows[0].allowed)fail(404,'گفتگو پیدا نشد.');
 res.json({updated:rows[0].updated});
};
