import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Animated,AppState,Pressable,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DriverShell from '../components/DriverShell';
import {useIsFocused} from '@react-navigation/native';
import * as Location from 'expo-location';
import OfferMap from '../components/OfferMap';
import {Coordinates,Offer,driverApi,errorText,numberFa,toman,tripTime} from '../driverApi';
import {row,ui} from '../driverStyles';
import {io} from 'socket.io-client';
import {driverWorkingKey,storage} from '../storage';
import {updateDriverFix} from '../driverLocation';
import {API_URL} from '../utils';

const holdMs=2000;
const ink='#10392f', green='#08745e', amber='#945411';
const offerExpiry=(offer:Offer)=>{
 const expiry=Date.parse(offer.offer_expires_at??'');
 return Number.isFinite(expiry)?expiry:Infinity;
};

export default function OffersScreen({navigation}:any){
 const screenFocused=useIsFocused();
 const [foreground,setForeground]=useState(AppState.currentState!=='background');
 const [working,setWorking]=useState<boolean|null>(null);
 const [savingWork,setSavingWork]=useState(false);
 const [driverViewOffer,setDriverViewOffer]=useState<string|null>(null);
 useEffect(()=>{
  let live=true;
  storage.getItem(driverWorkingKey).then(value=>{if(live)setWorking(value==='1');})
   .catch(()=>{if(live)setWorking(false);});
  return()=>{live=false;};
 },[]);
 const visible=screenFocused&&foreground;
 const focused=visible&&working;
 useEffect(()=>{const listener=AppState.addEventListener('change',state=>setForeground(state==='active'));return()=>listener.remove();},[]);
 const [position,setPosition]=useState<Coordinates|null>(null),[result,setResult]=useState<{items:Offer[];vehicle_id:string}|null>(null);
 const [selected,setSelected]=useState(''),[error,setError]=useState(''),[locationError,setLocationError]=useState('');
 const [revision,setRevision]=useState(0),[busy,setBusy]=useState(false);
 const location=useRef<Location.LocationObject|null>(null),candidate=useRef<Location.LocationObject|null>(null);
 const accepting=useRef(false),progress=useRef(new Animated.Value(0)).current;
 const heldOffer=useRef<Offer|null>(null);
 const offer=working?(result?.items.find(item=>item.id===selected)||result?.items[0]):undefined;
 useEffect(()=>{
  if(!result?.items.length)return;
  const expiry=result.items.reduce((first,item)=>Math.min(first,offerExpiry(item)),Infinity);
  if(!Number.isFinite(expiry))return;
  const timer=setTimeout(()=>setResult(current=>current&&{
   ...current,items:current.items.filter(item=>offerExpiry(item)>Date.now()),
  }),Math.max(0,Math.min(expiry-Date.now(),2147483647)));
  return()=>clearTimeout(timer);
 },[result]);
 const [times,setTimes]=useState<{key:string;minutes:(number|null)[]|null;meters?:(number|null)[]}>();
 const offerId=offer?.id;
 const fitRoute=!!offerId&&driverViewOffer!==offerId;
 const lat=position?.lat,lng=position?.lng;
 const stopsKey=offer&&JSON.stringify([...offer.starts,...offer.ends].map(({lat,lng})=>[lat,lng]));
 const timesKey=offerId&&lat!=null&&lng!=null?`${offerId}:${lat}:${lng}:${stopsKey}`:'';
 useEffect(()=>{
  if(!focused||!timesKey||!offerId||lat==null||lng==null)return;
  let live=true;
  driverApi.stopTimes(offerId,{lat,lng})
   .then(({minutes,meters})=>{if(live)setTimes({key:timesKey,minutes,meters});})
   .catch(()=>{if(live)setTimes({key:timesKey,minutes:null});});
  return()=>{live=false;};
 },[focused,offerId,lat,lng,timesKey,revision]);
 useEffect(()=>{
  if(!visible)return;
  let live=true;let subscription:Location.LocationSubscription|undefined;
  setLocationError('');
  const update=(fix:Location.LocationObject)=>{
   if(!live)return;
   const next=updateDriverFix(location.current,candidate.current,fix);
   candidate.current=next.pending;
   if(location.current===next.position)return;
   location.current=next.position;
   const {latitude:lat,longitude:lng}=next.position.coords;
   setPosition(previous=>previous?.lat===lat&&previous.lng===lng?previous:{lat,lng});
  };
  (async()=>{
   const permission=await Location.requestForegroundPermissionsAsync();
   if(!permission.granted)throw new Error('برای نمایش سفرهای نزدیک، دسترسی موقعیت لازم است.');
   if(!live)return;
   update(await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High}));
   if(!live||!working)return;
   subscription=await Location.watchPositionAsync({accuracy:Location.Accuracy.High,distanceInterval:100,timeInterval:10000},update);
   if(!live)subscription.remove();
  })().catch(err=>{if(live)setLocationError(errorText(err));});
  return()=>{live=false;subscription?.remove();};
 },[visible,working,revision]);
 const currentPosition=useRef<Coordinates|null>(null);
 const updateSubscription=useRef<()=>void>(()=>{});
 useEffect(()=>{
  if(!focused)return;
  let live=true, subscribed=false, loading=false, dirty=false;
  let refreshTimer:ReturnType<typeof setTimeout>|undefined;
  let retryTimer:ReturnType<typeof setTimeout>|undefined;
  let retryDelay=2000, refreshFailures=0;
  let subscriptionTimer:ReturnType<typeof setTimeout>|undefined;
  const socket=io(API_URL,{path:'/dispatch/socket.io',transports:['websocket'],autoConnect:false,timeout:6000});
  const schedule=(delay=120)=>{
   if(!live||refreshTimer)return;
   refreshTimer=setTimeout(()=>{refreshTimer=undefined;void load();},delay);
  };
  async function load(){
   const point=currentPosition.current;
   if(!live||!point)return;
   if(loading){dirty=true;return;}
   loading=true;
   try{
    const data=await driverApi.offers(point);
    refreshFailures=0;
    if(live&&currentPosition.current===point){setResult(data);setError('');}
   }catch(err){
    if(live&&currentPosition.current===point){
     setResult(null);setError(errorText(err));
     if(refreshFailures<3)schedule(1000*2**(++refreshFailures)+Math.random()*400);
    }
   }finally{
    loading=false;
    if(dirty){dirty=false;schedule();}
   }
  }
  function subscribe(){
   const point=currentPosition.current;
   if(!point)return;
   schedule(0);
   clearTimeout(subscriptionTimer);
   subscribed=false;
   if(!socket.connected)return;
   socket.timeout(4000).emit('offers:location',point,(err:Error|null,ok:boolean)=>{
    if(!live||currentPosition.current!==point)return;
    subscribed=!err&&ok===true;
    if(subscribed)schedule();
    else if(socket.connected)subscriptionTimer=setTimeout(subscribe,1250);
   });
  }
  updateSubscription.current=subscribe;
  socket.on('offers:changed',()=>schedule());
  socket.on('connect',()=>{retryDelay=2000;subscribe();});
  const disconnected=()=>{
   subscribed=false;
   clearTimeout(subscriptionTimer);
   if(!live||socket.active||retryTimer)return;
   retryTimer=setTimeout(()=>{
    retryTimer=undefined;
    if(live)socket.connect();
   },retryDelay+Math.random()*1000);
   retryDelay=Math.min(retryDelay*2,60000);
  };
  socket.on('disconnect',disconnected).on('connect_error',disconnected);
  void storage.getItem('auth_token').then(token=>{
   if(live&&token){socket.auth={token};socket.connect();}
  }).catch(()=>{});
  const fallback=setInterval(()=>{if(!subscribed)schedule(Math.random()*2000);},30000+Math.random()*15000);
  schedule(0);
  return()=>{
   live=false;
   updateSubscription.current=()=>{};
   clearInterval(fallback);
   clearTimeout(refreshTimer);
   clearTimeout(retryTimer);
   clearTimeout(subscriptionTimer);
   socket.disconnect();
  };
 },[focused,revision]);
 useEffect(()=>{currentPosition.current=position;updateSubscription.current();},[position]);
 const resetHold=()=>{progress.stopAnimation();progress.setValue(0);heldOffer.current=null;};
 const accept=async()=>{
  if(!focused||!position||!result||!offer||heldOffer.current?.id!==offer.id||accepting.current)return;
  accepting.current=true;setBusy(true);setError('');
  try{const {ride}=await driverApi.accept(offer.id,result.vehicle_id,position);navigation.navigate('DriverTripDetails',{id:ride.id,position});}
  catch(err){setError(errorText(err));}
  finally{accepting.current=false;setBusy(false);resetHold();}
 };
 const stops=offer?[...offer.starts.map((point,index)=>({point,label:'مبدأ',index,count:offer.starts.length,isPickup:true})),
  ...offer.ends.map((point,index)=>({point,label:'مقصد',index,count:offer.ends.length,isPickup:false}))]:[];
 const currentTimes=times?.key===timesKey?times:undefined;
 return <DriverShell navigation={navigation} title="سفرهای نزدیک" active="Home">
  <View style={styles.workBar}>
   <View style={styles.workStatus}>
    <Icon name="radar" size={17} color={green}/>
    <Text style={styles.mapLabelText}>{working?'در حال دریافت سفرهای نزدیک':'آمادهٔ شروع کار'}</Text>
   </View>
   <TouchableOpacity accessibilityRole="switch" accessibilityState={{checked:working===true,disabled:busy||savingWork||working===null}}
    disabled={busy||savingWork||working===null} style={[styles.workButton,working&&styles.workActive]} onPress={async()=>{
     const next=!working;
     setSavingWork(true);
     try{
      await storage.setItem(driverWorkingKey,next?'1':'0');
      if(!next){resetHold();setResult(null);setError('');setLocationError('');setSelected('');setDriverViewOffer(null);}
      setWorking(next);
     }catch(err){setError(errorText(err));}
     finally{setSavingWork(false);}
    }}>
    <Icon name="power" size={19} color={working?ink:'#fff'}/>
    <Text style={[styles.workText,working&&styles.workActiveText]}>{working?'پایان کار':'شروع کار'}</Text>
   </TouchableOpacity>
  </View>
  <View style={styles.mapStage}>
   <View style={styles.map}><OfferMap position={position} offer={offer} fitRoute={fitRoute}/></View>
   {!!offer&&<TouchableOpacity accessibilityRole="button" style={styles.mapLabel} onPress={()=>setDriverViewOffer(fitRoute?offer.id:null)}>
    <Icon name={fitRoute?'crosshairs-gps':'map-marker-path'} size={17} color={green}/>
    <Text style={styles.mapLabelText}>{fitRoute?'موقعیت من':'نمایش مسیر'}</Text>
   </TouchableOpacity>}
  </View>
  {working&&!!result?.items.length&&<View style={styles.priceBar}>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceScroll} contentContainerStyle={styles.prices}>
    {result.items.map(item=>{
     const active=item.id===offer?.id;
     return <TouchableOpacity key={item.id} accessibilityRole="tab" accessibilityState={{selected:active}}
      disabled={busy} style={[styles.priceTab,active&&styles.activePrice]} onPress={()=>{resetHold();setDriverViewOffer(null);setSelected(item.id);}}>
      <Text style={[styles.priceText,active&&styles.activePriceText]}>{toman(item.fare)} ت</Text>
     </TouchableOpacity>;
    })}
   </ScrollView>
  </View>}
  <ScrollView style={styles.details} contentContainerStyle={styles.detailsBody}>
   {working===false&&<View style={styles.empty}><Icon name="power-standby" size={29} color={green}/>
    <Text style={ui.text}>برای دریافت پیشنهادهای نزدیک، شروع کار را بزنید.</Text>
   </View>}
   {!!(error||(working&&locationError))&&<View style={ui.card}><Text accessibilityRole="alert" style={ui.error}>{error||locationError}</Text>
    <TouchableOpacity onPress={()=>setRevision(value=>value+1)}><Text style={ui.link}>تلاش مجدد</Text></TouchableOpacity>
   </View>}
   {working&&position&&!result&&!error&&!locationError&&<ActivityIndicator color={green}/>}
   {working&&result&&!offer&&<View style={styles.empty}>
    <Icon name="map-search-outline" color={green} size={30}/>
    <Text style={ui.text}>سفر قابل پذیرشی نزدیک موقعیت فعلی پیدا نشد.</Text>
   </View>}
   {offer&&<>
    <View style={styles.summary}>
     <View style={styles.fare}>
      <Text style={styles.fareLabel}>کرایه سفر</Text>
      <View style={styles.fareAmount}><Text style={styles.fareNumber}>{toman(offer.fare)}</Text><Text style={styles.fareLabel}>تومان</Text></View>
     </View>
     <View style={styles.schedule}>
      <Icon name="calendar-clock" size={19} color="#a9edd5"/>
      <Text style={styles.fareLabel}>{tripTime(offer.scheduled_at)}</Text>
     </View>
    </View>
    <View style={styles.route}>
     {stops.map(({point,label,index,count,isPickup},stopIndex)=>{
      const minutes=currentTimes?.minutes?.[stopIndex];
      const meters=currentTimes?.meters?.[stopIndex];
      const distance=meters==null?'':` · ${numberFa(Math.round(meters/10)/100)} کیلومتر`;
      const eta=minutes!=null?`${numberFa(minutes)} دقیقه`:currentTimes?'زمان نامشخص':'در حال محاسبه';
      return <View key={`${label}-${index}`} style={styles.stop}>
       <View style={styles.track}>
        {stopIndex<stops.length-1&&<View style={styles.connector}/>}
        <View style={[styles.marker,!isPickup&&styles.destinationMarker]}>
         <Icon name={isPickup?'arrow-top-left':'flag-variant-outline'} size={15} color={isPickup?green:amber}/>
        </View>
       </View>
       <View style={styles.stopCopy}>
        <View style={styles.stopHeading}>
         <Text style={[styles.stopName,!isPickup&&styles.destinationText]}>{label}{count>1?` ${numberFa(index+1)}`:''}</Text>
         <Text style={styles.eta}>{`(${eta}${distance})`}</Text>
        </View>
        <Text style={styles.address}>{point.address}</Text>
       </View>
      </View>;
     })}
    </View>
    <View style={styles.tags}>
     <Tag icon="account-multiple-outline" label={`${numberFa(offer.passenger_count)} مسافر`}/>
     <Tag icon="bag-personal-outline" label={`${numberFa(offer.luggageCount)} بار دستی`}/>
     <Tag icon="bag-suitcase-outline" label={`${numberFa(offer.bagCount)} چمدان`}/>
     <Tag icon="paw" label={offer.hasAnimals?`حیوان همراه${offer.animalType?' · '+offer.animalType:''}`:'بدون حیوان همراه'}/>
    </View>
    {!!offer.notes&&<View style={styles.note}><Icon name="note-text-outline" color={green} size={17}/><Text style={[ui.text,styles.noteText]}>{offer.notes}</Text></View>}
    {!offer.coordinates.length&&<Text style={ui.muted}>خط مسیر برای این رزرو ثبت نشده است.</Text>}
   </>}
  </ScrollView>
  {offer&&<View style={styles.footer}>
   <Pressable accessibilityRole="button" accessibilityLabel="برای قبول سفر دو ثانیه نگه دارید" disabled={busy}
    delayLongPress={holdMs} onPressIn={()=>{heldOffer.current=offer;progress.setValue(0);Animated.timing(progress,{toValue:1,duration:holdMs,useNativeDriver:false}).start();}}
    onPressOut={resetHold} onLongPress={accept} style={[ui.button,styles.accept]}>
    <Animated.View style={[styles.progress,{width:progress.interpolate({inputRange:[0,1],outputRange:['0%','100%']})}]}/>
    <Icon name="gesture-tap-hold" size={23} color="#c1f4e2"/>
    <View style={styles.acceptCopy}>
     <Text style={ui.buttonText}>{busy?'در حال ثبت پذیرش…':'قبول سفر'}</Text>
     {!busy&&<Text style={styles.acceptHint}>۲ ثانیه نگه دارید</Text>}
    </View>
    <Icon name="arrow-left" size={20} color="#c1f4e2"/>
   </Pressable>
  </View>}
 </DriverShell>;
}
function Tag({icon,label}:{icon:React.ComponentProps<typeof Icon>['name'];label:string}){
 return <View style={styles.tag}><Icon name={icon} size={16} color={green}/><Text style={styles.tagText}>{label}</Text></View>;
}
const styles=StyleSheet.create({
 mapStage:{flex:1,minHeight:146,paddingHorizontal:12,paddingTop:10,backgroundColor:'#eff6f2'},
 map:{flex:1,overflow:'hidden',borderRadius:22,backgroundColor:'#deeee6',borderWidth:1,borderColor:'#cfdfd5'},
 mapLabel:{...row,zIndex:2,elevation:2,position:'absolute',right:23,top:21,alignItems:'center',gap:5,backgroundColor:'#fff',paddingHorizontal:10,paddingVertical:5,borderRadius:20},
 workBar:{...row,alignItems:'center',justifyContent:'space-between',paddingHorizontal:13,paddingTop:8,backgroundColor:'#eff6f2'},
 workStatus:{...row,alignItems:'center',gap:5},
 workButton:{...row,alignItems:'center',gap:6,paddingHorizontal:13,minHeight:38,borderRadius:20,backgroundColor:green},
 workActive:{backgroundColor:'#fff'},
 workText:{...ui.muted,color:'#fff',fontFamily:'Estedad-Bold'},
 workActiveText:{color:ink},
 mapLabelText:{...ui.muted,color:ink,fontFamily:'Estedad-Bold'},
 priceBar:{backgroundColor:'#eff6f2',borderBottomWidth:1,borderBottomColor:'#dce8e1'},
 priceScroll:{direction:'rtl'},
 prices:{...row,flexGrow:1,gap:7,paddingHorizontal:12,paddingVertical:9},
 priceTab:{...row,alignItems:'center',justifyContent:'center',gap:6,minHeight:38,paddingHorizontal:13,borderRadius:13,borderWidth:1,borderColor:'#dce8e1',backgroundColor:'#fff'},
 activePrice:{backgroundColor:ink,borderColor:ink},
 priceText:{...ui.text,fontFamily:'Estedad-Bold',fontSize:12,color:ink},
 activePriceText:{color:'#fff'},
 details:{flex:1,minHeight:0,backgroundColor:'#f4f8f5'},
 detailsBody:{padding:12,gap:9},
 summary:{...row,flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:8,backgroundColor:ink,borderRadius:18,paddingHorizontal:15,paddingVertical:9},
 fare:{gap:0},
 fareAmount:{...row,alignItems:'baseline',gap:5},
 fareNumber:{fontFamily:'Estedad-ExtraBold',fontSize:23,color:'#fff'},
 fareLabel:{...ui.muted,color:'#c1ebdb',lineHeight:18},
 schedule:{...row,alignItems:'center',gap:6,backgroundColor:'#205045',borderRadius:10,paddingHorizontal:9,paddingVertical:5},
 route:{backgroundColor:'#fff',borderColor:'#e0ebe4',borderWidth:1,borderRadius:18,paddingVertical:6,paddingHorizontal:11},
 stop:{...row,gap:9},
 track:{width:28,alignItems:'center',paddingTop:6},
 connector:{position:'absolute',width:1,top:24,bottom:-8,backgroundColor:'#c7ddd1'},
 marker:{width:26,height:26,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:'#e0f4e9'},
 destinationMarker:{backgroundColor:'#fff0d9'},
 stopCopy:{flex:1,paddingVertical:5},
 stopHeading:{...row,alignItems:'baseline',flexWrap:'wrap',gap:6},
 stopName:{...ui.muted,fontFamily:'Estedad-Bold',color:green},
 destinationText:{color:amber},
 eta:{...ui.muted,color:'#52695f',fontFamily:'Estedad-Medium',writingDirection:'rtl'},
 address:{...ui.text,fontFamily:'Estedad-Medium',lineHeight:21,writingDirection:'rtl'},
 tags:{...row,flexWrap:'wrap',gap:6},
 tag:{...row,alignItems:'center',gap:4,backgroundColor:'#e9f3ed',paddingHorizontal:8,paddingVertical:3,borderRadius:9},
 tagText:{...ui.muted,color:ink},
 note:{...row,alignItems:'flex-start',gap:8,padding:9,backgroundColor:'#fff',borderRadius:12},
 noteText:{flex:1},
 empty:{alignItems:'center',padding:20,gap:6},
 footer:{paddingHorizontal:12,paddingVertical:8,backgroundColor:'#f4f8f5'},
 accept:{...row,overflow:'hidden',gap:9,minHeight:49,borderRadius:15,paddingHorizontal:14},
 acceptCopy:{flex:1,alignItems:'flex-end'},
 acceptHint:{fontFamily:'Estedad-Regular',fontSize:10,color:'#c1f4e2'},
 progress:{pointerEvents:'none',position:'absolute',right:0,top:0,bottom:0,backgroundColor:'rgba(255,255,255,0.22)'},
});
