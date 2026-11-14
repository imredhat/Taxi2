const pool = require('../models/db');
exports.fail = (status,message) => { const error=new Error(message);error.status=status;throw error; };
exports.uuid = value => typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
exports.text = (value,min=1,max=2000) => typeof value==='string' && value.trim().length>=min && value.length<=max;
exports.page = query => {
 const page=Number(query.page||1),limit=Number(query.limit||20);
 if(!Number.isInteger(page)||page<1||page>100000||!Number.isInteger(limit)||limit<1||limit>100)exports.fail(400,'صفحه‌بندی معتبر نیست.');
 return {page,limit,offset:(page-1)*limit};
};
exports.handler = action => async(req,res,next)=>{try{await action(req,res,next);}catch(error){
 if(error.status)return res.status(error.status).json({error:error.message});
 if(error.code==='23505')return res.status(409).json({error:'این مورد قبلاً ثبت شده است.'});
 if(['22P02','22007','22008','23514'].includes(error.code))return res.status(400).json({error:'اطلاعات ورودی معتبر نیست.'});
 console.error('Passenger API error:',error.code||error.name);res.status(500).json({error:'درخواست انجام نشد؛ دوباره تلاش کنید.'});
}};
exports.transaction=async action=>{const client=await pool.connect();try{await client.query('BEGIN');const result=await action(client);await client.query('COMMIT');return result;}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}};
exports.requirePassenger=async(req,res,next)=>{
 if(req.user?.role!=='passenger'||!exports.uuid(req.user?.userId))return res.status(403).json({error:'این API مخصوص مسافران است.'});
 try{const user=await pool.query('SELECT id,phone FROM users WHERE id=$1 AND role=\'passenger\' AND is_active=true AND is_blocked=false',[req.user.userId]);
 if(!user.rowCount)return res.status(403).json({error:'حساب کاربری فعال نیست.'});req.passenger=user.rows[0];next();
 }catch(error){console.error('Passenger access error:',error.code);res.status(503).json({error:'بررسی حساب فعلاً در دسترس نیست.'});}
};
