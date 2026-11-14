const {fail}=require('../middleware/passenger');
const ROOT='https://sep.shaparak.ir';
function configuration(){
 const terminal=process.env.SEP_TERMINAL_ID,base=process.env.PUBLIC_API_URL;
 if(!terminal||!/^\d{1,15}$/.test(terminal)||!base)fail(503,'درگاه سامان هنوز تنظیم نشده است.');
 let url;try{url=new URL(base);}catch{fail(503,'دامنه بازگشت پرداخت تنظیم نشده است.');}
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)fail(503,'دامنه عمومی HTTPS برای پرداخت لازم است.');
 return {terminal,base:base.replace(/\/$/,'')};
}
async function post(path,body){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(`${ROOT}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal,redirect:'error'});
 if(!response.ok)fail(502,'پاسخ درگاه سامان در دسترس نیست.');return await response.json();
 }catch(error){if(error.status)throw error;fail(502,'ارتباط با سامان کامل نشد؛ وضعیت پرداخت را دوباره بررسی کنید.');}finally{clearTimeout(timer);}
}
exports.configuration=configuration;
exports.token=body=>post('/onlinepg/onlinepg',body);
exports.verify=body=>post('/verifyTxnRandomSessionkey/ipg/VerifyTransaction',body);
exports.redirect=token=>({method:'POST',url:`${ROOT}/OnlinePG/OnlinePG`,fields:{Token:token}});
exports.matches=(result,payment)=>{
 const detail=result?.TransactionDetail;
 return result?.Success===true&&[0,2].includes(result.ResultCode)&&detail&&String(detail.RefNum)===payment.reference_id&&String(detail.TerminalNumber)===payment.terminal_id&&String(detail.OrginalAmount)===String(payment.amount);
};
