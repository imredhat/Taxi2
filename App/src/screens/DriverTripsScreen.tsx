import React,{useCallback,useRef,useState} from 'react';
import {ActivityIndicator,Linking,Modal,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import OfferMap from '../components/OfferMap';
import {onDriverChatMessage} from '../driverChatEvents';
import {useFocusEffect} from '@react-navigation/native';
import DriverShell from '../components/DriverShell';
import {Coordinates,DriverTrip,DriverTripDetails,Point,carClassLabel,driverApi,errorText,numberFa,toman,tripTime} from '../driverApi';
import {row,ui} from '../driverStyles';

const statuses:Record<string,[string,string,string]> = {
 accepted:['پذیرفته‌شده','#07846c','#eaf8f4'],arriving:['در مسیر مبدأ','#1d4ed8','#eff6ff'],
 arrived:['رسیده به مبدأ','#1d4ed8','#eff6ff'],in_progress:['در حال انجام','#1d4ed8','#eff6ff'],
 completed:['تکمیل‌شده','#166534','#ecfdf3'],cancelled:['لغوشده','#b42318','#fff1f0'],
 expired:['منقضی‌شده','#52615e','#eef3f1'],pending:['در انتظار','#92400e','#fff5d6'],
};
const paymentStatuses:Record<NonNullable<DriverTripDetails['payment_status']>,[string,string,string]>={
 pending:['پرداخت‌نشده','#92400e','#fff5d6'],processing:['در حال پردازش','#1d4ed8','#eff6ff'],
 completed:['پرداخت‌شده','#166534','#dcfce7'],failed:['پرداخت ناموفق','#b42318','#fff1f0'],
 refunded:['بازپرداخت‌شده','#6b21a8','#f3e8ff'],
};
export default function DriverTripsScreen({navigation}:any){
 const [page,setPage]=useState(1),[attempt,setAttempt]=useState(0);
 const [data,setData]=useState<{items:DriverTrip[];has_more:boolean}|null>(null),[error,setError]=useState('');
 useFocusEffect(useCallback(()=>{
  let live=true;setData(null);setError('');
  driverApi.trips(page).then(result=>{if(live)setData(result);}).catch(err=>{if(live)setError(errorText(err));});
  return()=>{live=false;};
 },[page,attempt]));
 return <DriverShell navigation={navigation} title="سفرهای من" active="Trips">
  <ScrollView contentContainerStyle={ui.body}>
   {!data&&!error&&<ActivityIndicator color="#07846c"/>}
   {!!error&&<View style={ui.card}><Text accessibilityRole="alert" style={ui.error}>{error}</Text><TouchableOpacity onPress={()=>setAttempt(value=>value+1)}><Text style={ui.link}>تلاش مجدد</Text></TouchableOpacity></View>}
   {data&&!data.items.length&&<View style={ui.card}><Text style={ui.title}>سفری ثبت نشده است</Text><TouchableOpacity onPress={()=>navigation.navigate('Home',undefined,{pop:true})}><Text style={ui.link}>مشاهده سفرهای نزدیک</Text></TouchableOpacity></View>}
   {data?.items.map(trip=>{
    const [label,color,backgroundColor]=statuses[trip.status]||['در حال بررسی','#52615e','#eef3f1'];
    const cancelled=trip.status==='cancelled';
    return <View key={trip.id} style={listStyles.card}>
     <View style={listStyles.header}>
      <Text style={[listStyles.badge,{color,backgroundColor}]}>{label}</Text>
      <Text style={ui.muted}>{tripTime(trip.scheduled_at||trip.created_at)}</Text>
     </View>
     <View style={listStyles.route}>
      <View style={listStyles.stop}>
       <Icon name="map-marker-outline" size={20} color="#086d58"/>
       <View style={listStyles.address}><Text style={listStyles.stopLabel}>مبدأ</Text><Text style={ui.text}>{trip.pickup_address||'ثبت نشده'}</Text></View>
      </View>
      <View style={listStyles.stop}>
       <Icon name="flag-variant-outline" size={20} color="#92510f"/>
       <View style={listStyles.address}><Text style={listStyles.stopLabel}>مقصد</Text><Text style={ui.text}>{trip.dropoff_address||'ثبت نشده'}</Text></View>
      </View>
     </View>
     <View style={listStyles.footer}>
      <Text style={ui.title}>{trip.fare==null?'کرایه تعیین نشده':`${toman(trip.fare)} تومان`}</Text>
      {!cancelled&&<TouchableOpacity accessibilityRole="button" style={listStyles.details} onPress={()=>navigation.navigate('DriverTripDetails',{id:trip.id})}>
       <Text style={ui.link}>جزئیات سفر</Text><Icon name="chevron-left" size={18} color="#07846c"/>
      </TouchableOpacity>}
     </View>
    </View>;
   })}
   {data&&<View style={{...row,gap:16}}>{page>1&&<TouchableOpacity onPress={()=>setPage(page-1)}><Text style={ui.link}>صفحهٔ قبل</Text></TouchableOpacity>}{data.has_more&&<TouchableOpacity onPress={()=>setPage(page+1)}><Text style={ui.link}>صفحهٔ بعد</Text></TouchableOpacity>}</View>}
  </ScrollView>
 </DriverShell>;
}

const listStyles=StyleSheet.create({
 card:{...ui.card,padding:0,gap:0,overflow:'hidden',borderRadius:20},
 header:{...row,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6,backgroundColor:'#f0f6f3',paddingHorizontal:14,paddingVertical:10},
 badge:{...ui.muted,fontFamily:'Estedad-Bold',borderRadius:9,paddingHorizontal:9,paddingVertical:3},
 route:{padding:14,gap:10},
 stop:{...row,alignItems:'center',gap:9},
 address:{flex:1},
 stopLabel:{...ui.muted,fontFamily:'Estedad-Bold'},
 footer:{...row,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6,borderTopWidth:1,borderTopColor:'#e1ebe7',paddingHorizontal:14,minHeight:52},
 details:{...row,alignItems:'center',gap:3,minHeight:44},
});

export function DriverTripDetailsScreen({navigation,route}:any){
 const [trip,setTrip]=useState<DriverTripDetails|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const id=route.params?.id;
 const [position,setPosition]=useState<Coordinates|null>(route.params?.position??null);
 const [pickupMetrics,setPickupMetrics]=useState<{id:string;minutes:number|null;meters:number|null}|null>(null);
 const approachingPickup=trip?.id===id&&trip?.stops_reached===0&&trip.can_contact;
 const [actionError,setActionError]=useState(''),[calling,setCalling]=useState(false);
 const [reaching,setReaching]=useState(false);
 const mutation=useRef(false), revision=useRef(0);
 useFocusEffect(useCallback(()=>{
  let live=true;
  if(!route.params?.position){
   Location.getForegroundPermissionsAsync().then(async permission=>{
    if(!live||!permission.granted)return null;
    const last=await Location.getLastKnownPositionAsync({maxAge:120000,requiredAccuracy:500});
    return last??(live&&approachingPickup?Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}):null);
   }).then(fix=>{if(live&&fix)setPosition({lat:fix.coords.latitude,lng:fix.coords.longitude});}).catch(()=>{});
  }
  return()=>{live=false;};
 },[id,route.params?.position,approachingPickup]));
 useFocusEffect(useCallback(()=>{
  if(!approachingPickup||!position)return;
  let live=true;
  driverApi.pickupMetrics(id,position).then(({minutes,meters})=>{
   if(live)setPickupMetrics({id,minutes:minutes[0],meters:meters[0]});
  }).catch(()=>{if(live)setPickupMetrics(null);});
  return()=>{live=false;};
 },[id,approachingPickup,position]));
 const callPassenger=async()=>{
  if(!trip?.can_contact||calling)return;
  setCalling(true);setActionError('');
  try{
   const {phone}=await driverApi.contact(trip.id);
   await Linking.openURL(`tel:${phone}`);
  }catch(err){setActionError(errorText(err));}
  finally{setCalling(false);}
 };
 const directions=async(point:Point)=>{
  setActionError('');
  try{
   const target=encodeURIComponent(`${point.lat},${point.lng}`);
   await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${target}&travelmode=driving&dir_action=navigate`);
  }catch{setActionError('باز کردن مسیریاب انجام نشد.');}
 };
 const [choosing,setChoosing]=useState(false),[reason,setReason]=useState('');
 const [cancelling,setCancelling]=useState(false),[cancelError,setCancelError]=useState('');
 const cancelTrip=async()=>{
  if(mutation.current||!reason||!trip)return;
  mutation.current=true;
  setCancelling(true);setCancelError('');
  try{
   await driverApi.cancelTrip(trip.id,reason);
   revision.current++;
   setChoosing(false);
   navigation.navigate('Trips',undefined,{pop:true});
  }catch(err){setCancelError(errorText(err));}
  finally{mutation.current=false;setCancelling(false);}
 };
 useFocusEffect(useCallback(()=>{
  let live=true;
  let sequence=0;
  setTrip(null);setError('');setActionError('');setChoosing(false);setReason('');setCancelError('');
  const load=()=>{
   const current=++sequence;
   const requestedRevision=revision.current;
   void driverApi.trip(id).then(({trip})=>{
    if(!live||current!==sequence||requestedRevision!==revision.current)return;
    if(trip.status==='cancelled'){
     setTrip(null);
     navigation.navigate('Trips',undefined,{pop:true});
     return;
    }
    setTrip(trip);setError('');
   })
    .catch(err=>{if(live&&current===sequence)setError(errorText(err));});
  };
  load();
  const unsubscribe=onDriverChatMessage(rideId=>{if(live&&(rideId===null||rideId===id))load();});
  return()=>{live=false;unsubscribe();};
 },[id,attempt,navigation]));
 const [label,color,background]=statuses[trip?.status||'']||['در حال بررسی','#52615e','#eef3f1'];
 const [paymentLabel,paymentColor,paymentBackground]=(trip?.payment_status&&paymentStatuses[trip.payment_status])||['نامشخص','#52615e','#eef3f1'];
 const stops=trip?[
  ...trip.starts.map((point,index)=>({point,kind:'pickup',label:trip.starts.length>1?`مبدأ ${numberFa(index+1)}`:'مبدأ'})),
  ...(trip.waypoints||[]).map((point,index)=>({point,kind:'waypoint',label:`توقف ${numberFa(index+1)}`})),
  ...trip.ends.map((point,index)=>({point,kind:'destination',label:trip.ends.length>1?`مقصد ${numberFa(index+1)}`:'مقصد'})),
 ]:[];
 const activeIndex=trip?.can_contact?trip.stops_reached:-1;
 const showStopMetrics=trip?.status!=='completed'&&trip?.status!=='cancelled';
 const nextStop=stops[activeIndex];
 const canNavigate=nextStop&&Number.isFinite(nextStop.point.lat)&&Number.isFinite(nextStop.point.lng)
  &&Math.abs(nextStop.point.lat)<=90&&Math.abs(nextStop.point.lng)<=180;
 const finishing=nextStop?.kind==='destination'&&activeIndex===stops.length-1;
 const actionLabel=finishing?'پایان سفر':`رسیدم به ${nextStop?.label}`;
 const reachStop=async()=>{
  if(mutation.current||!trip||!nextStop)return;
  mutation.current=true;
  setReaching(true);setActionError('');
  try{
   const {trip:progress}=await driverApi.reachStop(trip.id,activeIndex);
   revision.current++;
   setTrip(current=>current?.id===trip.id?{...current,...progress,
    ...(progress.status==='completed'?{can_contact:false,passenger_name:null,passenger_notes:null,cancellation_options:[]}:{}),
   }:current);
  }catch(err){setActionError(errorText(err));}
  finally{mutation.current=false;setReaching(false);}
 };
 return <DriverShell navigation={navigation} title="جزئیات سفر" active="Trips" back
  onCancel={!reaching&&trip?.cancellation_options?.length?()=>setChoosing(true):undefined}>
  <ScrollView style={detailStyles.scroll} contentContainerStyle={detailStyles.body}>
   {!!trip&&<View pointerEvents="none" style={detailStyles.map}><OfferMap fixed position={position} offer={nextStop?{
    starts:nextStop.kind==='pickup'?[nextStop.point]:[],
    ends:nextStop.kind==='destination'?[nextStop.point]:[],
    waypoints:nextStop.kind==='waypoint'?[nextStop.point]:[],coordinates:[],activeStopLabel:nextStop.label,
   }:trip} fitRoute/></View>}
   {!trip&&!error&&<ActivityIndicator color="#07846c"/>}
   {!!error&&<View style={ui.card}><Text accessibilityRole="alert" style={ui.error}>{error}</Text>
    <TouchableOpacity onPress={()=>setAttempt(value=>value+1)}><Text style={ui.link}>تلاش مجدد</Text></TouchableOpacity>
   </View>}
   {trip&&<>
    <View style={detailStyles.summary}>
     <View style={detailStyles.summaryTop}>
      <View style={detailStyles.summaryTop}>
       <Text style={[detailStyles.statusBadge,{color,backgroundColor:background}]}>{label}</Text>
       <Text style={[detailStyles.statusBadge,{color:paymentColor,backgroundColor:paymentBackground}]}>{paymentLabel}</Text>
      </View>
      <Text style={detailStyles.schedule}>{tripTime(trip.scheduled_at||trip.created_at)}</Text>
     </View>
     <View style={detailStyles.summaryTop}>
      <Text style={detailStyles.fare}>{trip.fare==null?'کرایه تعیین نشده':`${toman(trip.fare)} تومان`}</Text>
      <Text style={detailStyles.schedule}>{carClassLabel(trip.car_class)}</Text>
     </View>
     {trip.driver_share!=null&&<Text style={detailStyles.schedule}>سهم شما: {toman(trip.driver_share)} تومان</Text>}
    </View>
    {trip.can_contact&&<View style={detailStyles.passenger}>
     <View style={detailStyles.passengerAvatar}><Icon name="account-outline" size={21} color="#c1ebdb"/></View>
     <View style={detailStyles.passengerIdentity}>
      {!!trip.passenger_name&&<Text style={detailStyles.passengerRole}>مسافر</Text>}
      <Text style={detailStyles.passengerName}>{trip.passenger_name||'مسافر'}</Text>
     </View>
     <TouchableOpacity accessibilityRole="button" accessibilityLabel="تماس با مسافر" disabled={calling}
      accessibilityState={{disabled:calling,busy:calling}} style={detailStyles.passengerAction} onPress={callPassenger}>
      {calling?<ActivityIndicator size="small" color="#e5f8ee"/>:<Icon name="phone-outline" size={20} color="#e5f8ee"/>}
     </TouchableOpacity>
     <TouchableOpacity accessibilityRole="button" accessibilityLabel={trip.unread_count>0?"چت با مسافر، پیام خوانده‌نشده":"چت با مسافر"} style={detailStyles.passengerAction}
      onPress={()=>navigation.navigate('PassengerChat',{id:trip.id})}>
      <Icon name="message-text-outline" size={20} color="#e5f8ee"/>
      {trip.unread_count>0&&<View style={detailStyles.unreadDot}/>}
     </TouchableOpacity>
    </View>}
    <View style={detailStyles.itinerary}>
     {stops.map(({point,kind,label},index)=>{
      const destination=kind==='destination';
      const pickup=pickupMetrics?.id===trip.id?pickupMetrics:null;
      const minutes=index===0?pickup?.minutes:trip.route_metrics?.minutes[index-1];
      const meters=index===0?pickup?.meters:trip.route_metrics?.meters[index-1];
      return <View key={label} style={detailStyles.stop}>
       <View style={detailStyles.track}>
        {index<stops.length-1&&<View style={detailStyles.trackLine}/>}
        <View style={[detailStyles.pin,destination&&detailStyles.endPin]}>
         <Icon name={trip.status==='completed'||(activeIndex>=0&&index<activeIndex)?'check':destination?'flag-variant-outline':kind==='pickup'?'map-marker-outline':'circle-small'} size={16} color={destination?'#92510f':'#08745e'}/>
        </View>
       </View>
       <View style={detailStyles.stopCopy}>
        <Text style={[detailStyles.stopLabel,destination&&detailStyles.endLabel]}>{label}</Text>
        <Text style={ui.text}>
         {point.address||'آدرس ثبت نشده'}
         {showStopMetrics&&minutes!=null&&<Text style={detailStyles.stopMetric}>{` (${numberFa(minutes)} دقیقه)`}</Text>}
         {showStopMetrics&&meters!=null&&<Text style={detailStyles.stopMetric}>{` (${numberFa(Math.round(meters/10)/100)} کیلومتر)`}</Text>}
        </Text>
       </View>
      </View>;
     })}
    </View>
    <View style={detailStyles.facts}>
     {trip.passenger_count!=null&&<TripFact icon="account-multiple-outline" label={`${numberFa(trip.passenger_count)} مسافر`}/>}
     {trip.luggage_count!=null&&<TripFact icon="bag-personal-outline" label={`${numberFa(trip.luggage_count)} بار دستی`}/>}
     {trip.bag_count!=null&&<TripFact icon="bag-suitcase-outline" label={`${numberFa(trip.bag_count)} چمدان`}/>}
     {trip.has_animals===true&&<TripFact icon="paw" label="حیوان همراه"/>}
     {trip.distance_km!=null&&<TripFact icon="map-marker-distance" label={`${numberFa(Number(trip.distance_km))} کیلومتر`}/>}
    </View>
    {!!trip.passenger_notes&&<View style={ui.card}><Text style={ui.muted}>توضیحات مسافر</Text><Text style={ui.text}>{trip.passenger_notes}</Text></View>}
    {trip.status==='completed'&&<PassengerRating key={trip.id} trip={trip}/>}
    {!!trip.cancellation_label&&<View style={ui.card}><Text style={ui.text}>دلیل لغو · {trip.cancellation_label}</Text></View>}
    <Modal visible={choosing&&!!trip.cancellation_options?.length} transparent animationType="fade"
     onRequestClose={()=>{if(!cancelling){setChoosing(false);setReason('');setCancelError('');}}}>
     <View style={detailStyles.modalBackdrop}>
      <View accessibilityViewIsModal style={detailStyles.modalCard}>
       <ScrollView contentContainerStyle={detailStyles.modalBody}>
     <Text style={ui.title}>دلیل لغو سفر</Text>
     {trip.cancellation_options.map(option=><TouchableOpacity key={option.id} accessibilityRole="radio"
      accessibilityState={{checked:reason===option.id,disabled:cancelling}} disabled={cancelling}
      style={{...row,gap:10,alignItems:'center',paddingHorizontal:11,minHeight:44,borderRadius:11,
       backgroundColor:reason===option.id?'#fff1f0':'#f4f7f5'}}
      onPress={()=>{setReason(option.id);setCancelError('');}}>
      <View style={{width:16,height:16,borderRadius:8,borderWidth:reason===option.id?5:1,borderColor:reason===option.id?'#b42318':'#52615e'}}/>
      <Text style={ui.text}>{option.label}</Text>
     </TouchableOpacity>)}
     {!!cancelError&&<Text accessibilityRole="alert" style={ui.error}>{cancelError}</Text>}
     <View style={{...row,alignItems:'center',gap:12}}>
      <TouchableOpacity accessibilityRole="button" disabled={!reason||cancelling} onPress={cancelTrip}
       style={[ui.button,{flex:1,backgroundColor:'#b42318',opacity:reason&&!cancelling?1:0.5}]}>
       <Text style={ui.buttonText}>{cancelling?'در حال لغو…':'تأیید لغو سفر'}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={cancelling} onPress={()=>{setChoosing(false);setReason('');setCancelError('');}}>
       <Text style={ui.link}>بازگشت</Text>
      </TouchableOpacity>
     </View>
       </ScrollView>
      </View>
     </View>
    </Modal>
   </>}
  </ScrollView>
  {!!actionError&&<Text accessibilityRole="alert" style={detailStyles.actionError}>{actionError}</Text>}
  {nextStop&&<View style={detailStyles.footer}>
   <View style={detailStyles.footerRow}>
    <View style={detailStyles.stopCopy}>
     <Text style={detailStyles.stopLabel}>{nextStop.label}</Text>
     <Text style={ui.text} numberOfLines={2}>{nextStop.point.address||'آدرس ثبت نشده'}</Text>
    </View>
    {canNavigate&&<TouchableOpacity accessibilityRole="button" accessibilityLabel={`مسیریابی تا ${nextStop.label}`}
     style={detailStyles.navigate} onPress={()=>directions(nextStop.point)}>
     <Icon name="navigation-variant-outline" size={20} color="#086d58"/>
    </TouchableOpacity>}
   </View>
   <TouchableOpacity accessibilityRole="button" accessibilityState={{busy:reaching,disabled:reaching}}
    disabled={reaching} style={[ui.button,detailStyles.reachButton]} onPress={reachStop}>
    {reaching?<ActivityIndicator color="#fff"/>:<Text style={ui.buttonText}>{actionLabel}</Text>}
   </TouchableOpacity>
  </View>}
 </DriverShell>;
}

function PassengerRating({trip}:{trip:DriverTripDetails}){
 const [savedScore,setSavedScore]=useState(trip.my_rating?.score);
 const [score,setScore]=useState(trip.my_rating?.score??5);
 const [tags,setTags]=useState(trip.my_rating?.tags??[]);
 const [comment,setComment]=useState(trip.my_rating?.comment??'');
 const [feedback,setFeedback]=useState('');
 const [saving,setSaving]=useState(false);
 const pending=useRef(false);
 const save=async()=>{
  if(pending.current)return;
  pending.current=true;setSaving(true);setFeedback('');
  try{await driverApi.rateTrip(trip.id,score,comment,tags);setSavedScore(score);setFeedback('امتیاز ثبت شد.');}
  catch(err){setFeedback(errorText(err));}
  finally{pending.current=false;setSaving(false);}
 };
 return <View style={[ui.card,detailStyles.ratingCard]}>
  <View style={detailStyles.ratingHeader}>
   <Text style={detailStyles.ratingTitle}>امتیاز به مسافر</Text>
   {savedScore!=null&&<Text style={ui.muted}>{numberFa(savedScore)} از ۵</Text>}
  </View>
  <View style={detailStyles.facts}>{[1,2,3,4,5].map(value=><TouchableOpacity key={value} accessibilityRole="radio" accessibilityLabel={`${numberFa(value)} ستاره`}
   accessibilityState={{checked:value===score}} disabled={saving} style={detailStyles.ratingStar} onPress={()=>setScore(value)}>
   <Icon name={value<=score?'star':'star-outline'} color="#92510f" size={22}/>
  </TouchableOpacity>)}</View>
  <View style={detailStyles.facts}>{trip.rating_options?.map(tag=><TouchableOpacity key={tag} accessibilityRole="checkbox" accessibilityState={{checked:tags.includes(tag)}}
   disabled={saving} style={[detailStyles.ratingChoice,tags.includes(tag)&&{backgroundColor:'#c8eddb'}]}
   onPress={()=>setTags(current=>current.includes(tag)?current.filter(item=>item!==tag):[...current,tag])}><Text style={ui.muted}>{tag}</Text></TouchableOpacity>)}</View>
  <TextInput style={detailStyles.ratingInput} accessibilityLabel="توضیحات سفر" placeholder="توضیحات اختیاری" multiline maxLength={2000}
   editable={!saving} value={comment} onChangeText={setComment}/>
  <TouchableOpacity accessibilityRole="button" style={[ui.button,detailStyles.ratingSubmit]} disabled={saving} onPress={save}><Text style={ui.buttonText}>{saving?'در حال ثبت…':'ثبت امتیاز'}</Text></TouchableOpacity>
  {!!feedback&&<Text style={ui.text} accessibilityRole="alert">{feedback}</Text>}
 </View>;
}

function TripFact({icon,label}:{icon:React.ComponentProps<typeof Icon>['name'];label:string}){
 return <View style={detailStyles.fact}><Icon name={icon} size={15} color="#08745e"/><Text style={ui.muted}>{label}</Text></View>;
}

const detailStyles=StyleSheet.create({
 map:{height:224,overflow:'hidden',borderRadius:22,backgroundColor:'#deeee6',borderWidth:1,borderColor:'#cfdfd5'},
 unreadDot:{position:'absolute',top:7,right:7,width:9,height:9,borderRadius:5,backgroundColor:'#ffbd78',borderWidth:1,borderColor:'#235247'},
 scroll:{flex:1,minHeight:0,backgroundColor:'#f4f8f5'},
 body:{padding:12,gap:9},
 summary:{backgroundColor:'#10392f',borderRadius:17,paddingHorizontal:13,paddingVertical:9,gap:5},
 summaryTop:{...row,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6},
 statusBadge:{...ui.muted,borderRadius:8,paddingHorizontal:8,paddingVertical:2},
 schedule:{...ui.muted,color:'#c1ebdb'},
 fare:{...ui.title,color:'#fff',fontFamily:'Estedad-ExtraBold',fontSize:20},
 itinerary:{backgroundColor:'#fff',borderColor:'#e0ebe4',borderWidth:1,borderRadius:17,paddingVertical:5,paddingHorizontal:9},
 stop:{...row,alignItems:'center',gap:7,minHeight:52},
 track:{width:28,alignSelf:'stretch',alignItems:'center',paddingTop:10},
 trackLine:{position:'absolute',width:1,top:30,bottom:-12,backgroundColor:'#c7ddd1'},
 pin:{width:26,height:26,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:'#e0f4e9'},
 endPin:{backgroundColor:'#fff0d9'},
 stopCopy:{flex:1,minWidth:0,paddingVertical:6},
 stopLabel:{...ui.muted,color:'#086d58',fontFamily:'Estedad-Bold'},
 stopMetric:{color:'#086d58',fontFamily:'Estedad-Bold'},
 endLabel:{color:'#92510f'},
 navigate:{width:44,height:44,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:'#edf6ef'},
 passenger:{...row,alignItems:'center',gap:8,backgroundColor:'#10392f',borderRadius:17,padding:9},
 passengerAvatar:{width:37,height:37,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#235247'},
 passengerIdentity:{flex:1,minWidth:0},
 passengerRole:{...ui.muted,color:'#c1ebdb',fontSize:10,lineHeight:15},
 passengerName:{...ui.title,color:'#fff',fontSize:14},
 passengerAction:{width:44,height:44,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:'#235247'},
 modalBackdrop:{flex:1,alignItems:'center',justifyContent:'center',padding:18,backgroundColor:'rgba(13,35,29,0.5)'},
 modalCard:{width:'100%',maxWidth:400,maxHeight:'90%',backgroundColor:'#fff',borderRadius:20,overflow:'hidden'},
 modalBody:{gap:8,padding:14},
 facts:{...row,flexWrap:'wrap',gap:5},
 ratingStar:{minHeight:44,minWidth:44,alignItems:'center',justifyContent:'center'},
 ratingChoice:{minHeight:36,minWidth:44,paddingHorizontal:7,borderRadius:8,backgroundColor:'#edf6ef',alignItems:'center',justifyContent:'center'},
 ratingCard:{padding:9,gap:5},
 ratingHeader:{...row,alignItems:'center',gap:5},
 ratingTitle:{...ui.text,flex:1,fontFamily:'Estedad-Bold'},
 ratingInput:{...ui.text,minHeight:48,paddingHorizontal:8,paddingVertical:5,borderWidth:1,borderColor:'#e0ebe4',borderRadius:8,textAlignVertical:'top'},
 ratingSubmit:{alignSelf:'flex-end',paddingHorizontal:12,minHeight:44,borderRadius:9},
 fact:{...row,alignItems:'center',gap:4,backgroundColor:'#e9f3ed',paddingHorizontal:8,paddingVertical:4,borderRadius:9},
 actionError:{...ui.error,paddingHorizontal:12,paddingTop:4},
 footer:{backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#e0ebe4',paddingHorizontal:12,paddingBottom:8,gap:3},
 footerRow:{...row,alignItems:'center',gap:8},
 reachButton:{minHeight:52},
});
