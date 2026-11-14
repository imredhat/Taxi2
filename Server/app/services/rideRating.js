const {fail,text,transaction,uuid}=require('../middleware/passenger');

const options={
 driver:['رانندگی ایمن','خودروی تمیز','خوش‌رفتاری','وقت‌شناسی','رانندگی نامناسب','تأخیر'],
 passenger:['خوش‌رفتاری','وقت‌شناسی','هماهنگی خوب','رعایت نظافت','تأخیر','رفتار نامناسب'],
};
const ratingColumn=(target,userParam)=>`(SELECT json_build_object('score',score,'comment',comment,'tags',tags)
 FROM ratings WHERE ride_id=r.id AND rater_id=${userParam} AND target='${target}') AS my_rating`;

const rateTrip=target=>async(req,res)=>{
 const {id}=req.params;
 const {score,comment,tags=[]}=req.body||{};
 if(!uuid(id)||!Number.isInteger(score)||score<1||score>5||(comment!==undefined&&!text(comment,0,2000))
   ||!Array.isArray(tags)||tags.length>options[target].length||new Set(tags).size!==tags.length||tags.some(tag=>!options[target].includes(tag)))
  fail(400,'امتیاز یا جزئیات آن معتبر نیست.');
 const user=req.user.userId;
 const rating=await transaction(async client=>{
  const {rows:[ride]}=await client.query(`SELECT ${target==='driver'?'dp.user_id':'r.passenger_id'} AS ratee
   FROM rides r JOIN driver_profiles dp ON dp.id=r.driver_id WHERE r.id=$1 AND r.status='completed'
   AND ${target==='driver'?'r.passenger_id':'dp.user_id'}=$2 FOR SHARE OF r`,[id,user]);
  if(!ride)fail(404,'سفر تکمیل‌شده پیدا نشد.');
  if(target==='driver')await client.query('SELECT id FROM driver_profiles WHERE user_id=$1 FOR NO KEY UPDATE',[ride.ratee]);
  const {rows:[saved]}=await client.query(`INSERT INTO ratings(ride_id,rater_id,ratee_id,target,score,comment,tags)
   VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(ride_id,rater_id,target) DO UPDATE SET
   score=EXCLUDED.score,comment=EXCLUDED.comment,tags=EXCLUDED.tags RETURNING id,score,comment,tags`,
   [id,user,ride.ratee,target,score,comment?.trim()||null,JSON.stringify(tags)]);
  if(target==='driver')await client.query(`UPDATE driver_profiles SET rating=(SELECT AVG(score) FROM ratings
   WHERE ratee_id=$1 AND target='driver') WHERE user_id=$1`,[ride.ratee]);
  return saved;
 });
 res.json({rating});
};
module.exports={options,ratingColumn,rateTrip};
