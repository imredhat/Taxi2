import React,{useCallback,useRef,useState} from 'react';
import * as ImagePicker from 'expo-image-picker';
import {ActivityIndicator,Image,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DriverShell,{logoutDriver} from '../components/DriverShell';
import {carClassLabel,Dashboard,driverApi,errorText,numberFa,tripTime} from '../driverApi';
import VehiclePlate from '../components/VehiclePlate';
import {row,ui} from '../driverStyles';
import {showToast} from '../utils';

const shortcuts=[
 {route:'Vehicles',label:'خودروهای من',icon:'car-outline'},
 {route:'Trips',label:'سفرهای من',icon:'routes'},
 {route:'Finance',label:'کیف پول و تراکنش‌ها',icon:'wallet-outline'},
] as const;

const gaugeTicks=[-75,-45,-15,15,45,75];

export default function DriverProfileScreen({navigation}:any){
 const [data,setData]=useState<Dashboard|null>(null);
 const [photo,setPhoto]=useState('');
 const [avatar,setAvatar]=useState<string|null>(null);
 const [updatingAvatar,setUpdatingAvatar]=useState(false);
 const avatarRevision=useRef(0);
 const [error,setError]=useState('');
 const [attempt,setAttempt]=useState(0);
 useFocusEffect(useCallback(()=>{
  let live=true;
  setError('');
  const revision=avatarRevision.current;
  void driverApi.profilePhoto().then(({image})=>{if(live&&revision===avatarRevision.current)setAvatar(image);}).catch(()=>{});
  driverApi.dashboard().then(result=>{
   if(!live)return;
   setData(result);setPhoto('');
   const active=result.vehicles.find(item=>item.id===result.driver.active_vehicle_id&&item.is_active);
   if(active?.front_document_id)void driverApi.vehicleDocument(active.id,active.front_document_id)
    .then(({image})=>{if(live)setPhoto(image);}).catch(()=>{});
  }).catch(err=>{if(live)setError(errorText(err));});
  return()=>{live=false;};
 },[attempt]));

 const updateAvatar=async()=>{
  if(updatingAvatar)return;
  setUpdatingAvatar(true);
  try{
   const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[1,1],quality:0.5,base64:true});
   if(result.canceled)return;
   const base64=result.assets[0].base64;
   if(!base64||base64.length>1_200_000){showToast('عکس قابل ارسال نیست. تصویر کوچک‌تری انتخاب کنید.');return;}
   const {image}=await driverApi.updateProfilePhoto(base64);
   avatarRevision.current++;
   setAvatar(image);
   showToast('عکس پروفایل به‌روز شد.','success');
  }catch(err){showToast(errorText(err));}
  finally{setUpdatingAvatar(false);}
 };

 const name=[data?.driver.first_name,data?.driver.last_name].filter(Boolean).join(' ')||'راننده';
 const vehicle=data?.vehicles.find(item=>item.id===data.driver.active_vehicle_id&&item.is_active);
 const verified=data?.driver.is_verified;
 const rating=data?.driver.rating??5;

 return <DriverShell navigation={navigation} title="پروفایل" active="Profile">
  <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
   {!data&&!error&&<ActivityIndicator accessibilityLabel="بارگذاری پروفایل" color="#07846c"/>}
   {!!error&&<View style={ui.card}>
    <Text accessibilityRole="alert" style={ui.error}>{error}</Text>
    <TouchableOpacity accessibilityRole="button" onPress={()=>setAttempt(value=>value+1)}><Text style={ui.link}>تلاش مجدد</Text></TouchableOpacity>
   </View>}
   {data&&<>
    <View style={styles.identity}>
     <View style={styles.identityHeader}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="تغییر عکس پروفایل" accessibilityState={{busy:updatingAvatar,disabled:updatingAvatar}}
       disabled={updatingAvatar} onPress={updateAvatar} style={styles.avatar}>
       {avatar?<Image accessibilityLabel="عکس پروفایل راننده" source={{uri:avatar}} style={StyleSheet.absoluteFill}
        resizeMode="cover" onError={()=>setAvatar(null)}/>:<Text style={styles.avatarText}>{name.slice(0,1)}</Text>}
       <View style={styles.avatarEdit}>{updatingAvatar?<ActivityIndicator size="small" color="#fff"/>:<Icon name="camera-outline" size={13} color="#fff"/>}</View>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`امتیاز ${numberFa(rating)} از ۵، دیدن بازخورد مسافران`}
       onPress={()=>navigation.navigate('DriverReviews')} style={[styles.avatar,styles.gauge]}>
       <View accessible={false} style={styles.dial}>
        {gaugeTicks.map((angle,index)=><View key={angle} style={[styles.dialSpoke,{transform:[{rotate:`${angle}deg`}]}]}>
         <View style={[styles.tick,index<=rating&&styles.tickLit]}/>
        </View>)}
        <View style={[styles.dialSpoke,{transform:[{rotate:`${rating*30-75}deg`}]}]}><View style={styles.needle}/></View>
        <View style={styles.hub}/>
       </View>
       <Text style={styles.gaugeStart}>۰</Text><Text style={styles.gaugeEnd}>۵</Text>
       <Text style={styles.gaugeScore}>{numberFa(rating)}</Text>
      </TouchableOpacity>
     </View>
     <Text accessibilityRole="header" style={styles.name}>{name}</Text>
     <View style={styles.identityFooter}>
      <View style={[styles.badge,!verified&&styles.pending]}>
       <Icon name={verified?'shield-check-outline':'shield-outline'} size={16} color={verified?'#c0f3da':'#ffe3a3'}/>
       <Text style={[styles.badgeText,!verified&&styles.pendingText]}>{verified?'حساب تأییدشده':'حساب تأیید نشده'}</Text>
      </View>
      <Text style={styles.identityText}>{numberFa(data.vehicles.length)} خودرو</Text>
     </View>
    </View>

    <TouchableOpacity accessibilityRole="button" style={styles.vehicle} onPress={()=>navigation.navigate('Vehicles')}>
     <View style={styles.vehicleVisual}>
      {photo?<Image source={{uri:photo}} style={StyleSheet.absoluteFill} resizeMode="cover" onError={()=>setPhoto('')}/>
       :<Icon name="car-side" size={48} color="#42645b"/>}
     </View>
     <View style={styles.vehicleCopy}>
      <Text style={styles.vehicleLabel}>خودروی فعال</Text>
      <View style={styles.vehicleTitle}>
       <Text style={styles.vehicleName}>{vehicle?[vehicle.brand,vehicle.model].filter(Boolean).join(' ')||'خودرو':'خودرویی انتخاب نشده'}</Text>
       {vehicle&&<Text style={styles.package}>{carClassLabel(vehicle.car_class)}</Text>}
      </View>
      {vehicle&&<VehiclePlate value={vehicle.license_plate}/>}
     </View>
     <Icon name="chevron-left" size={18} color="#416259"/>
    </TouchableOpacity>
   </>}

   <View style={styles.shortcuts}>
    {shortcuts.map(item=><TouchableOpacity key={item.route} accessibilityRole="button" style={styles.shortcut}
     onPress={()=>navigation.navigate(item.route,undefined,{pop:true})}>
     <View style={styles.shortcutIcon}><Icon name={item.icon} size={20} color="#086d58"/></View>
     <Text style={styles.shortcutLabel}>{item.label}</Text>
     <Icon name="chevron-left" size={18} color="#416259"/>
    </TouchableOpacity>)}
    <TouchableOpacity accessibilityRole="button" style={[styles.shortcut,styles.logout]} onPress={()=>logoutDriver(navigation)}>
     <View style={[styles.shortcutIcon,styles.logoutIcon]}><Icon name="logout" size={20} color="#b42318"/></View>
     <Text style={[styles.shortcutLabel,styles.logoutText]}>خروج از حساب</Text>
    </TouchableOpacity>
   </View>
  </ScrollView>
 </DriverShell>;
}

export function DriverReviewsScreen({navigation}:any){
 const [page,setPage]=useState(1),[attempt,setAttempt]=useState(0);
 const [data,setData]=useState<Awaited<ReturnType<typeof driverApi.reviews>>|null>(null);
 const [error,setError]=useState('');
 useFocusEffect(useCallback(()=>{
  let live=true;
  setData(null);setError('');
  driverApi.reviews(page).then(result=>{if(live)setData(result);}).catch(err=>{if(live)setError(errorText(err));});
  return()=>{live=false;};
 },[page,attempt]));
 return <DriverShell navigation={navigation} title="بازخورد مسافران" active="Profile" back>
  <ScrollView contentContainerStyle={styles.body}>
   {!data&&!error&&<ActivityIndicator accessibilityLabel="بارگذاری بازخورد" color="#07846c"/>}
   {!!error&&<View style={ui.card}><Text accessibilityRole="alert" style={ui.error}>{error}</Text>
    <TouchableOpacity accessibilityRole="button" onPress={()=>setAttempt(value=>value+1)}><Text style={ui.link}>تلاش مجدد</Text></TouchableOpacity>
   </View>}
   {data&&<>
    <View style={ui.card}>
     <Text accessibilityRole="header" style={ui.title}>بیشترین انتخاب‌ها</Text>
     {data.tags.length?data.tags.map(({tag,count})=><View key={tag} style={styles.reviewRow}>
      <Text style={styles.shortcutLabel}>{tag}</Text><Text style={styles.package}>{numberFa(count)} بار</Text>
     </View>):<Text style={ui.muted}>هنوز گزینه‌ای انتخاب نشده است.</Text>}
    </View>
    <Text accessibilityRole="header" style={ui.title}>توضیحات مسافران</Text>
    {!data.comments.length&&<View style={ui.card}><Text style={ui.muted}>هنوز توضیحی ثبت نشده است.</Text></View>}
    {data.comments.map(comment=><View key={comment.id} style={ui.card}>
     <View style={styles.reviewRow}><Text style={styles.package}>★ {numberFa(comment.score)} از ۵</Text><Text style={ui.muted}>{tripTime(comment.created_at)}</Text></View>
     <Text style={ui.text}>{comment.comment}</Text>
    </View>)}
    <View style={styles.reviewRow}>
     {page>1&&<TouchableOpacity accessibilityRole="button" onPress={()=>setPage(value=>value-1)}><Text style={ui.link}>صفحهٔ قبل</Text></TouchableOpacity>}
     {data.has_more&&<TouchableOpacity accessibilityRole="button" onPress={()=>setPage(value=>value+1)}><Text style={ui.link}>صفحهٔ بعد</Text></TouchableOpacity>}
    </View>
   </>}
  </ScrollView>
 </DriverShell>;
}

const styles=StyleSheet.create({
 body:{...ui.body,gap:16},
 identity:{padding:20,gap:18,borderRadius:26,backgroundColor:'#10392f'},
 identityHeader:{...row,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10},
 avatar:{width:62,height:62,borderRadius:22,overflow:'hidden',backgroundColor:'#dbf3e6',alignItems:'center',justifyContent:'center'},
 avatarText:{fontFamily:'Estedad-ExtraBold',fontSize:32,color:'#10392f'},
 avatarEdit:{position:'absolute',bottom:0,end:0,width:24,height:24,borderTopLeftRadius:9,alignItems:'center',justifyContent:'center',backgroundColor:'#086d58'},
 gauge:{backgroundColor:'#245649',borderWidth:1,borderColor:'#527b6d'},
 dial:{position:'absolute',top:5,width:48,height:48,alignItems:'center',justifyContent:'center'},
 dialSpoke:{position:'absolute',width:3,height:46,alignItems:'center'},
 tick:{width:2,height:5,borderRadius:1,backgroundColor:'#77958a'},
 tickLit:{backgroundColor:'#baf0d7'},
 needle:{width:2,height:17,marginTop:7,borderRadius:1,backgroundColor:'#ffd58a'},
 hub:{width:5,height:5,borderRadius:3,backgroundColor:'#ffd58a'},
 gaugeStart:{position:'absolute',left:7,top:26,fontFamily:'Estedad-Medium',fontSize:9,color:'#d4eee2'},
 gaugeEnd:{position:'absolute',right:7,top:26,fontFamily:'Estedad-Medium',fontSize:9,color:'#d4eee2'},
 gaugeScore:{position:'absolute',bottom:3,fontFamily:'Estedad-Bold',fontSize:13,color:'#fff'},
 badge:{...row,alignItems:'center',gap:5,backgroundColor:'#245649',paddingHorizontal:10,paddingVertical:5,borderRadius:12},
 pending:{backgroundColor:'#594922'},
 badgeText:{...ui.muted,color:'#d4f7e5',fontFamily:'Estedad-Bold'},
 pendingText:{color:'#ffe3a3'},
 name:{...ui.title,color:'#fff',fontFamily:'Estedad-ExtraBold',fontSize:28,lineHeight:43},
 identityFooter:{...row,justifyContent:'space-between',flexWrap:'wrap',gap:8,borderTopWidth:1,borderTopColor:'#3f665a',paddingTop:12},
 identityText:{...ui.text,color:'#d4eee2'},
 vehicle:{...ui.card,...row,alignItems:'center',gap:10,padding:10,borderRadius:22},
 vehicleVisual:{width:84,height:80,borderRadius:15,overflow:'hidden',alignItems:'center',justifyContent:'center',backgroundColor:'#e1efe7'},
 vehicleCopy:{flex:1,minWidth:0,gap:3},
 vehicleLabel:{...ui.muted,color:'#086d58',fontFamily:'Estedad-Bold'},
 vehicleName:{...ui.title,fontSize:16},
 vehicleTitle:{...row,alignItems:'center',flexWrap:'wrap',gap:5},
 package:{...ui.muted,color:'#095c46',backgroundColor:'#d9f4e6',fontFamily:'Estedad-Bold',borderRadius:7,paddingHorizontal:6,paddingVertical:2},
 shortcuts:{...ui.card,padding:6,gap:3,borderRadius:22},
 shortcut:{...row,alignItems:'center',gap:10,minHeight:52,paddingHorizontal:8,paddingVertical:6},
 shortcutIcon:{width:35,height:35,borderRadius:12,backgroundColor:'#eaf4ef',alignItems:'center',justifyContent:'center'},
 shortcutLabel:{...ui.text,flex:1,fontFamily:'Estedad-Bold'},
 logout:{borderTopWidth:1,borderTopColor:'#eef0ee',marginTop:3},
 logoutIcon:{backgroundColor:'#fff0ed'},
 logoutText:{color:'#b42318'},
 reviewRow:{...row,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8},
});
