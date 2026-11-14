import React, {useEffect,useRef,useState} from 'react';
import {AppState,Text,TouchableOpacity,View,StyleSheet,Linking} from 'react-native';
import {ScreenPage,EmptyState,ui} from '../components/ScreenPage';
import PointAddress from '../components/PointAddress';
import {useAppData} from '../state/AppData';
import {displayJalaliDate,persianDigits} from '../utils/tripDateTime';
import {passengerApi} from '../services/passenger';
import ApiFeedback from '../components/ApiFeedback';
import ReservationStatus from '../components/ReservationStatus';
import {Icon} from '../components/Icon';
import {colors,fonts,ltrLayout} from '../theme';
import {useIsFocused} from '@react-navigation/native';
import {io} from 'socket.io-client';
import {API_URL} from '../services/api';
import {storage} from '../storage';
import {toman} from '../utils/display';
export default function TripDetailsScreen({navigation,route}:any){
 const {data,removeTrip,registerTrip,refresh,syncDraft}=useAppData();const [confirm,setConfirm]=useState(false);const [cancel,setCancel]=useState(false);const trip=data.trips.find(item=>item.id===route?.params?.tripId);
 const [submitting,setSubmitting]=useState(false);const [error,setError]=useState('');
 const reserved=trip?.status==='reserved';
 const reservationId=trip?.reservationId;
 const [snapshot,setSnapshot]=useState<{id:string;reservation:any}>();
 const reservation=snapshot?.id===reservationId?snapshot?.reservation:undefined;
 const ride=reservation?.assigned_ride;
 const fare=reservation?.booking_details?.fare||trip?.fare;
 const rideFare=ride?.fare??fare?.amount;
 const hasFare=/^[1-9]\d*$/.test(String(rideFare));
 const canPay=['accepted','arriving','arrived','in_progress','completed'].includes(ride?.status)
  &&['pending','failed'].includes(ride?.payment_status)&&/^[1-9]\d*$/.test(String(ride?.fare));
 const status=ride?.status||reservation?.status||trip?.serverStatus||'pending';
 const depositPaid=BigInt(reservation?.deposit_paid||0);
 const fullPaid=BigInt(reservation?.full_paid||0);
 const remaining=hasFare?BigInt(String(rideFare))-depositPaid-fullPaid:0n;
 const reloadReservation=useRef<()=>void>(()=>{});
 const screenFocused=useIsFocused();
 const [foreground,setForeground]=useState(AppState.currentState!=='background');
 const focused=screenFocused&&foreground;
 useEffect(()=>{const listener=AppState.addEventListener('change',state=>setForeground(state==='active'));return()=>listener.remove();},[]);
 const [pollError,setPollError]=useState('');
 const updating=reserved&&['pending','searching','accepted','arriving','arrived','in_progress'].includes(status);
 useEffect(()=>{
  const id=reservationId;
  if(!focused||!id)return;
  let live=true, loading=false, dirty=false;
  let retry:ReturnType<typeof setTimeout>|undefined, retryDelay=2000;
  let refreshRetry:ReturnType<typeof setTimeout>|undefined, refreshFailures=0;
  const socket=io(API_URL,{path:'/dispatch/socket.io',transports:['websocket'],autoConnect:false,timeout:6000});
  const refresh=async()=>{
   if(!live)return;
   if(loading){dirty=true;return;}
   clearTimeout(refreshRetry);
   loading=true;
   try{
    const result=await passengerApi.reservation(id);
    refreshFailures=0;
    if(live){setSnapshot({id,reservation:result.reservation});setPollError('');}
   }catch(err){
    if(live){
     setPollError(err instanceof Error?err.message:'به‌روزرسانی وضعیت انجام نشد.');
     if(refreshFailures<3)refreshRetry=setTimeout(refresh,1000*2**(++refreshFailures)+Math.random()*400);
    }
   }finally{
    loading=false;
    if(dirty){dirty=false;void refresh();}
   }
  };
  reloadReservation.current=()=>{refreshFailures=0;void refresh();};
  if(!updating){
   void refresh();
   return()=>{live=false;reloadReservation.current=()=>{};clearTimeout(refreshRetry);};
  }
  socket.on('connect',()=>{retryDelay=2000;void refresh();});
  socket.on('reservations:changed',(ids:string[])=>{if(ids.includes(id))void refresh();});
  const disconnected=()=>{
   if(!live||socket.active||retry)return;
   retry=setTimeout(()=>{retry=undefined;if(live)socket.connect();},retryDelay+Math.random()*1000);
   retryDelay=Math.min(retryDelay*2,60000);
  };
  socket.on('disconnect',disconnected).on('connect_error',disconnected);
  void storage.getItem('auth_token').then(token=>{
   if(live&&token){socket.auth={token};socket.connect();}
  }).catch(()=>{});
  const fallback=setInterval(()=>{if(!socket.connected)void refresh();},15000);
  void refresh();
  return()=>{live=false;reloadReservation.current=()=>{};clearInterval(fallback);clearTimeout(retry);clearTimeout(refreshRetry);socket.disconnect();};
 },[focused,updating,reservationId]);
 const payForDraft=async(purpose:'deposit'|'full')=>{
  if(submitting||!trip)return;
  setSubmitting(true);setError('');
  try{
   const requestId=await registerTrip(trip);
   navigation.push('Payment',{purpose,requestId,autoCheckout:true});
  }catch(err){setError(err instanceof Error?err.message:'ثبت رزرو انجام نشد.');}
  finally{setSubmitting(false);}
 };
 return <ScreenPage navigation={navigation} title="جزئیات سفر" active="trips">
  {!trip?<EmptyState title="سفر پیدا نشد" message="این پیش‌نویس ممکن است حذف شده باشد. از سفرهای من، سفر دیگری را انتخاب کنید." />:<>
   {reserved?<>
    <ApiFeedback loading={false} error={pollError} retry={()=>{setPollError('');reloadReservation.current();}} navigation={navigation}/>
    <ReservationStatus status={status} ride={ride} vehicle={trip.vehicle} onTrack={()=>navigation.navigate('DriverChat',{rideId:ride?.id})} onCall={()=>{if(!/^\+?[0-9]{8,15}$/.test(ride?.driver_phone||''))return;Linking.openURL(`tel:${ride.driver_phone}`).catch(()=>setError('شماره‌گیر باز نشد؛ دوباره تلاش کنید.'));}}/>
    {ride?.status==='completed'&&<TouchableOpacity accessibilityRole="button" style={ui.button} onPress={()=>navigation.push('Tracking',{rideId:ride.id})}><Text style={ui.buttonText}>امتیاز به راننده</Text></TouchableOpacity>}
    {hasFare&&<View style={ui.card}>
     <View style={styles.metaRow}><Text style={ui.title}>کرایه سفر</Text><Text style={ui.title}>{toman(rideFare)} تومان</Text></View>
     {status==='awaiting_deposit'&&reservation?.deposit_due&&<>
      <View style={styles.metaRow}><Text style={ui.text}>پیش‌پرداخت ۲۰٪</Text><Text style={ui.text}>{toman(reservation.deposit_due)} تومان</Text></View>
      <TouchableOpacity accessibilityRole="button" style={ui.button} onPress={()=>navigation.push('Payment',{purpose:'deposit',requestId:reservationId,autoCheckout:true})}>
       <Text style={ui.buttonText}>پرداخت پیش‌پرداخت</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" onPress={()=>navigation.push('Payment',{purpose:'full',requestId:reservationId,autoCheckout:true})}><Text style={ui.link}>پرداخت کل کرایه</Text></TouchableOpacity>
     </>}
     {depositPaid>0n&&<>
      <View style={styles.metaRow}><Text style={ui.text}>پیش‌پرداخت پرداخت‌شده</Text><Text style={ui.text}>{toman(depositPaid.toString())} تومان</Text></View>
      <View style={styles.metaRow}><Text style={ui.text}>ماندهٔ کرایه</Text><Text style={ui.text}>{toman(ride?.payment_status==='completed'?'0':remaining.toString())} تومان</Text></View>
     </>}
     {fullPaid>0n&&<View style={styles.metaRow}><Text style={ui.text}>پرداخت کامل رزرو</Text><Text style={ui.text}>{toman(fullPaid.toString())} تومان</Text></View>}
     {fullPaid>0n||ride?.payment_status==='completed'?<Text style={ui.muted}>کرایه کامل پرداخت شده</Text>:canPay&&remaining>0n&&
      <TouchableOpacity accessibilityRole="button" style={ui.button}
       onPress={()=>navigation.push('Payment',{purpose:'ride',rideId:ride.id,autoCheckout:true})}>
       <Text style={ui.buttonText}>پرداخت آنلاین</Text>
      </TouchableOpacity>}
    </View>}
    <View style={styles.summary}>
     <View style={styles.summaryHeading}><Icon name="file-document-outline" size={18} color={colors.onSurfaceVariant}/><Text style={styles.summaryTitle}>جزئیات رزرو</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="به‌روزرسانی وضعیت رزرو" style={styles.refresh} onPress={()=>reloadReservation.current()}><Icon name="refresh" size={20} color={colors.primary}/></TouchableOpacity></View>
     <View style={styles.metaRow}><Text style={styles.meta}>{trip.date?displayJalaliDate(trip.date):'تاریخ تعیین نشده'} · {persianDigits(trip.time)}</Text><Text style={styles.meta}>{persianDigits(trip.personCount)} مسافر · {trip.vehicle}</Text></View>
     {[...trip.starts.map((point,index)=>({point,label:`مبدأ ${persianDigits(index+1)}`,origin:true})),...trip.ends.map((point,index)=>({point,label:`مقصد ${persianDigits(index+1)}`,origin:false}))].map(({point,label,origin})=><View key={label} style={styles.addressRow}><View style={[styles.routeDot,!origin&&{backgroundColor:'#ff9f1a'}]}/><View style={{flex:1}}><Text style={styles.addressLabel}>{label}</Text><Text style={styles.address}>{persianDigits(point.address||'آدرس ثبت‌شده')}</Text></View></View>)}
     <Text style={styles.meta}>بار دستی: {persianDigits(trip.luggageCount)} · چمدان: {persianDigits(trip.bagCount)}{trip.hasAnimals?` · حیوان همراه: ${trip.animalType||'دارد'}`:''}</Text>
     {!!trip.notes?.trim()&&<View><Text style={styles.addressLabel}>توضیحات سفر</Text><Text style={styles.address}>{trip.notes}</Text></View>}
     <View style={styles.reference}><Text style={styles.referenceLabel}>کد پیگیری</Text><Text selectable style={styles.referenceValue}>{trip.reservationId}</Text></View>
    </View>
   {['pending','searching'].includes(status)&&(cancel?<View style={ui.card}><Text style={ui.text}>رزرو لغو شود؟</Text><TouchableOpacity disabled={submitting} onPress={async()=>{setSubmitting(true);setError('');try{await passengerApi.cancelReservation(trip.reservationId!);setCancel(false);reloadReservation.current();await refresh();}catch(err){setError((err as Error).message);}finally{setSubmitting(false);}}}><Text style={[ui.link,{color:colors.errorRed}]}>تأیید لغو رزرو</Text></TouchableOpacity><TouchableOpacity disabled={submitting} onPress={()=>setCancel(false)}><Text style={ui.link}>انصراف</Text></TouchableOpacity></View>:<TouchableOpacity onPress={()=>setCancel(true)}><Text style={styles.cancel}>لغو رزرو</Text></TouchableOpacity>)}
   </>:<>
   <View style={ui.card}><Text style={ui.title}>پیش‌نویس سفر</Text><Text style={ui.muted}>این سفر هنوز رزرو نشده است.</Text><Text style={ui.text}>{trip.date?displayJalaliDate(trip.date):'تاریخ تعیین نشده'} · {persianDigits(trip.time)}</Text><Text style={ui.text}>{persianDigits(trip.personCount)} مسافر · ناوگان {trip.vehicle}</Text></View>
   {[...trip.starts.map((point,index)=>({point,label:`مبدأ ${persianDigits(index+1)}`})),...trip.ends.map((point,index)=>({point,label:`مقصد ${persianDigits(index+1)}`}))].map(({point,label})=><View key={label} style={ui.card}><Text style={ui.title}>{label}</Text><PointAddress point={point}/></View>)}
   {!!trip.notes?.trim()&&<View style={ui.card}><Text style={ui.muted}>توضیحات سفر</Text><Text style={ui.text}>{trip.notes}</Text></View>}
   </>}
   {!reserved&&!!fare?.amount&&<View style={ui.card}><Text style={ui.title}>کرایه رزرو: {persianDigits((Number(fare.amount)/10).toLocaleString('en-US'))} تومان</Text></View>}
   {!reserved&&<>
    <TouchableOpacity disabled={submitting} style={[ui.button,submitting&&{opacity:0.5}]} onPress={()=>payForDraft('deposit')}><Text style={ui.buttonText}>{submitting?'در حال آماده‌سازی…':'پرداخت پیش‌پرداخت ۲۰٪'}</Text></TouchableOpacity>
    <TouchableOpacity disabled={submitting} onPress={()=>payForDraft('full')}><Text style={ui.link}>پرداخت کل کرایه</Text></TouchableOpacity>
   </>}
   {!!error&&<Text accessibilityRole="alert" style={ui.text}>{error}</Text>}
   {!!error&&/وارد|نشست|پیامکی/.test(error)&&<TouchableOpacity onPress={()=>navigation.navigate('Login')}><Text style={ui.link}>ورود مجدد برای ثبت رزرو</Text></TouchableOpacity>}
   {!reserved&&<TouchableOpacity disabled={submitting} onPress={()=>navigation.navigate('Home',{editTrip:trip})}><Text style={ui.link}>ویرایش اطلاعات سفر</Text></TouchableOpacity>}
   {!reserved&&<TouchableOpacity disabled={submitting} onPress={async()=>{setSubmitting(true);setError('');try{await syncDraft(trip);}catch(err){setError((err as Error).message);}finally{setSubmitting(false);}}}><Text style={ui.link}>{trip.draftId?'ذخیره مجدد پیش‌نویس در حساب':'ذخیره پیش‌نویس در حساب'}</Text></TouchableOpacity>}
   <TouchableOpacity onPress={()=>navigation.navigate('Support')}><Text style={ui.link}>راهنمای سفر</Text></TouchableOpacity>
   {!reserved&&!submitting&&(confirm?<View style={ui.card}><Text style={ui.text}>این پیش‌نویس حذف شود؟</Text><TouchableOpacity onPress={async()=>{setSubmitting(true);try{await removeTrip(trip.id);navigation.replace('Trips');}catch(err){setError((err as Error).message);}finally{setSubmitting(false);}}}><Text style={ui.link}>بله، حذف پیش‌نویس</Text></TouchableOpacity><TouchableOpacity onPress={()=>setConfirm(false)}><Text style={ui.text}>انصراف</Text></TouchableOpacity></View>:<TouchableOpacity onPress={()=>setConfirm(true)}><Text style={ui.link}>حذف پیش‌نویس</Text></TouchableOpacity>)}
  </>}
 </ScreenPage>;
}

const styles=StyleSheet.create({
 summary:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.outlineVariant,borderRadius:20,padding:16,gap:12},
 summaryHeading:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',gap:6},summaryTitle:{flex:1,fontFamily:fonts.bold,fontSize:13,color:colors.onSurface,textAlign:'right'},refresh:{width:44,height:44,alignItems:'center',justifyContent:'center'},
 metaRow:{...ltrLayout,flexDirection:'row-reverse',flexWrap:'wrap',justifyContent:'space-between',gap:6},meta:{fontFamily:fonts.regular,fontSize:11,lineHeight:20,color:colors.onSurfaceVariant,textAlign:'right'},
 addressRow:{...ltrLayout,flexDirection:'row-reverse',gap:10,alignItems:'flex-start'},routeDot:{width:7,height:7,borderRadius:4,backgroundColor:colors.primary,marginTop:7},addressLabel:{fontFamily:fonts.medium,fontSize:10,color:colors.onSurfaceVariant,textAlign:'right'},address:{fontFamily:fonts.regular,fontSize:12,lineHeight:22,color:colors.onSurface,textAlign:'right'},
 reference:{borderTopWidth:1,borderTopColor:colors.outlineVariant,paddingTop:10,gap:4},referenceLabel:{fontFamily:fonts.regular,fontSize:10,color:colors.onSurfaceVariant,textAlign:'right'},referenceValue:{fontFamily:fonts.regular,fontSize:10,color:colors.onSurfaceVariant,textAlign:'left',writingDirection:'ltr'},
 cancel:{fontFamily:fonts.medium,fontSize:12,color:colors.errorRed,textAlign:'center',paddingVertical:12},
});
