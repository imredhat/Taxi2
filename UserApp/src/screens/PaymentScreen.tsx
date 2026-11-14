import React,{useEffect,useRef,useState} from 'react';
import {AppState,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {ScreenPage,ui} from '../components/ScreenPage';
import ApiFeedback from '../components/ApiFeedback';
import BankCheckout from '../components/BankCheckout';
import {passengerApi} from '../services/passenger';
import {useRemote} from '../services/useRemote';
import {statusLabel,toman} from '../utils/display';
export default function PaymentScreen({navigation,route}:any){
 const [id,setId]=useState(route?.params?.paymentId||''),[payment,setPayment]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[reason,setReason]=useState('');
 const reference=useRef(`payment-${Date.now()}-${Math.random().toString(36).slice(2)}`),inFlight=useRef(false);
 const autoCheckout=route.params?.autoCheckout===true;
 const purpose=payment?.purpose??route.params?.purpose;
 const paymentTitle=purpose==='deposit'?'پیش‌پرداخت رزرو':purpose==='full'?'پرداخت کامل رزرو':purpose==='ride'?'پرداخت ماندهٔ کرایه':'پرداخت سامان';
 const autoStarted=useRef(false);
 const remote=useRemote(async()=>id?(await passengerApi.payment(id)).payment:null,id);
 useEffect(()=>{if(remote.data)setPayment(remote.data);},[remote.data]);
 useEffect(()=>{const listener=AppState.addEventListener('change',state=>{if(state==='active')remote.reload();});return()=>listener.remove();},[remote.reload]);
 const act=async(verify=false,sandboxAction?:'complete'|'cancel')=>{if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');try{const result=verify?await passengerApi.verifyPayment(id,sandboxAction):await passengerApi.createPayment({purpose:route.params.purpose,amount:route.params.amount,ride_id:route.params.rideId,request_id:route.params.requestId,client_reference:reference.current});setId(result.payment.id);setPayment(result.payment);}catch(err){setError((err as Error).message);}finally{inFlight.current=false;setBusy(false);}};
 useEffect(()=>{
  if(!autoCheckout||autoStarted.current||id)return;
  autoStarted.current=true;
  void act();
 },[autoCheckout,id]);
 const refund=async()=>{if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');try{const result=await passengerApi.refundRequest(id,reason);navigation.navigate('Ticket',{ticketId:result.ticket.id});}catch(err){setError((err as Error).message);}finally{inFlight.current=false;setBusy(false);}};
 if(payment?.sandbox)return <ScreenPage navigation={navigation} title="درگاه آزمایشی سامان" active="wallet">
  <ApiFeedback loading={false} error={error||remote.error} retry={()=>{setError('');remote.reload();}} navigation={navigation}/>
  <View style={ui.card}>
   <Text style={ui.text}>{paymentTitle}</Text>
   <Text style={ui.title}>{toman(payment.amount)} تومان</Text>
   <Text style={ui.muted}>تراکنش در محیط آزمایشی ثبت می‌شود و مبلغی از کارت بانکی کسر نمی‌شود.</Text>
   {payment.status==='pending'?<>
    <TouchableOpacity accessibilityRole="button" disabled={busy} style={ui.button} onPress={()=>act(true,'complete')}><Text style={ui.buttonText}>{busy?'در حال ثبت…':'شبیه‌سازی پرداخت موفق'}</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={()=>act(true,'cancel')}><Text style={ui.link}>شبیه‌سازی انصراف</Text></TouchableOpacity>
   </>:<><Text accessibilityRole="alert" style={ui.text}>{payment.status==='completed'?'پرداخت آزمایشی موفق بود.':'پرداخت آزمایشی لغو شد.'}</Text><TouchableOpacity onPress={()=>navigation.goBack()}><Text style={ui.link}>بازگشت</Text></TouchableOpacity></>}
  </View>
 </ScreenPage>;
 return <ScreenPage navigation={navigation} title={paymentTitle} active="wallet"><ApiFeedback loading={!!id&&remote.loading} error={error||remote.error} retry={()=>{setError('');remote.reload();}} navigation={navigation}/>
 {!id?<View style={ui.card}><Text style={ui.title}>{route.params.purpose==='topup'?`شارژ کیف پول: ${toman(route.params.amount)} تومان`:'پرداخت هزینه سفر'}</Text><TouchableOpacity disabled={busy} style={ui.button} onPress={()=>act()}><Text style={ui.buttonText}>{busy?'در حال آماده‌سازی…':'ایجاد درخواست پرداخت'}</Text></TouchableOpacity></View>:payment&&<View style={ui.card}><Text style={ui.title}>{toman(payment.amount)} تومان</Text><Text style={ui.text}>{statusLabel(payment.status)}</Text><Text selectable style={ui.muted}>کد پیگیری: {payment.reference_id||payment.id}</Text>
 {payment.redirect&&payment.status==='pending'&&<BankCheckout redirect={payment.redirect} autoOpen={autoCheckout} onDone={()=>act(true)} onError={setError}/>}
 {!['completed','failed','cancelled'].includes(payment.status)&&<TouchableOpacity disabled={busy} style={ui.button} onPress={()=>act(true)}><Text style={ui.buttonText}>{busy?'در حال بررسی…':'بررسی نتیجه پرداخت'}</Text></TouchableOpacity>}
 {payment.status==='completed'&&<><Text style={ui.link}>پرداخت در سرور تأیید شده است.</Text><TextInput style={ui.input} placeholder="دلیل درخواست بازگشت وجه" accessibilityLabel="دلیل بازگشت وجه" value={reason} onChangeText={setReason} multiline maxLength={1000}/><TouchableOpacity disabled={busy||!reason.trim()} onPress={refund}><Text style={ui.link}>ثبت درخواست بررسی بازگشت وجه</Text></TouchableOpacity></>}
 </View>}
 <TouchableOpacity onPress={()=>navigation.navigate('Wallet')}><Text style={ui.link}>کیف پول و سوابق پرداخت</Text></TouchableOpacity></ScreenPage>;
}
