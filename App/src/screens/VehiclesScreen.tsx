import React,{useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Image,Modal,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DriverShell from '../components/DriverShell';
import VehiclePlate from '../components/VehiclePlate';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {carClassLabel,Dashboard,driverApi,errorText,numberFa,VehicleDetails} from '../driverApi';
import {row,ui} from '../driverStyles';

const packageIcons:Record<string,React.ComponentProps<typeof Icon>['name']>={
 eco_city:'car-hatchback',eco_intercity:'car-side',eco_plus:'car-estate',
 vip:'car-sports',vip_plus:'car-limousine',suv:'car-pickup',van:'van-passenger',
};
const documentLabels:Record<string,string>={
 vehicle_registration_front:'روی کارت خودرو',vehicle_registration_back:'پشت کارت خودرو',insurance:'بیمه‌نامه',
 insurance_addendum:'الحاقیهٔ بیمه',vehicle_front:'نمای جلو',vehicle_back:'نمای عقب',
 vehicle_interior_front:'داخل خودرو، جلو',vehicle_interior_back:'داخل خودرو، عقب',
};
export default function VehiclesScreen({navigation}:any){
 const [data,setData]=useState<Dashboard|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [frontPhotos,setFrontPhotos]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<Dashboard['vehicles'][number]|null>(null);
 const [details,setDetails]=useState<VehicleDetails|null>(null),[detailError,setDetailError]=useState('');
 const [document,setDocument]=useState<VehicleDetails['documents'][number]|null>(null);
 const [image,setImage]=useState(''),[imageError,setImageError]=useState('');
 const selectedId=selected?.id;
 const documentId=document?.id;
 useEffect(()=>{
  if(!selectedId||!documentId)return;
  let live=true;
  driverApi.vehicleDocument(selectedId,documentId).then(result=>{if(live)setImage(result.image);})
   .catch(()=>{if(live)setImageError('تصویر مدرک در دسترس نیست.');});
  return()=>{live=false;};
 },[selectedId,documentId]);
 const closeDetails=()=>{if(document)setDocument(null);else setSelected(null);};
 useEffect(()=>{
  if(!selectedId)return;
  let live=true;
  driverApi.vehicle(selectedId).then(({vehicle})=>{if(live)setDetails(vehicle);})
   .catch(err=>{if(live)setDetailError(errorText(err));});
  return()=>{live=false;};
 },[selectedId]);
 useFocusEffect(useCallback(()=>{
  let live=true;
  driverApi.dashboard().then(result=>{
   if(!live)return;
   setData(result);setError('');setFrontPhotos({});
   for(const vehicle of result.vehicles){
    const id=vehicle.front_document_id;
    if(id)void driverApi.vehicleDocument(vehicle.id,id).then(({image})=>{
     if(live)setFrontPhotos(current=>({...current,[id]:image}));
    }).catch(()=>{});
   }
  }).catch(err=>{if(live)setError(errorText(err));});
  return()=>{live=false;};
 },[]));
 const activate=async(id:string)=>{
  setBusy(true);setError('');
  try{await driverApi.activate(id);setData(previous=>previous?{...previous,driver:{...previous.driver,active_vehicle_id:id}}:previous);}
  catch(err){setError(errorText(err));}finally{setBusy(false);}
 };
 return <DriverShell navigation={navigation} title="خودرو های من" back>
  <ScrollView contentContainerStyle={ui.body}>
   {!!error&&<Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
   {!data&&!error&&<ActivityIndicator color="#07846c"/>}
   {data&&!data.vehicles.length&&<Text style={ui.text}>خودرویی ثبت نشده است.</Text>}
   <View style={styles.grid}>
    {data?.vehicles.map(vehicle=>{
     const active=vehicle.id===data.driver.active_vehicle_id&&vehicle.is_active;
     const name=[vehicle.brand,vehicle.model].filter(Boolean).join(' ')||'خودرو';
     const frontId=vehicle.front_document_id;
     const photo=frontId?frontPhotos[frontId]:undefined;
     return <View key={vehicle.id} style={styles.column}>
      <View style={[styles.card,active&&styles.activeCard]}>
       <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${name}، ${carClassLabel(vehicle.car_class)}`}
       accessibilityHint={vehicle.is_active&&!active?'انتخاب به‌عنوان خودروی فعال':undefined}
       accessibilityState={{selected:active,disabled:!vehicle.is_active||busy}} disabled={active||busy||!vehicle.is_active}
       onPress={()=>activate(vehicle.id)}>
       <View style={styles.visual}>
        {photo&&frontId?<Image source={{uri:photo}} resizeMode="cover" style={StyleSheet.absoluteFill}
         onError={()=>setFrontPhotos(current=>current[frontId]===photo?{...current,[frontId]:''}:current)}/>
         :<Icon name={packageIcons[vehicle.car_class]||'car'} size={42} color={active?'#08745e':'#42645b'}/>}
        {active&&<View style={styles.check}><Icon name="check" size={15} color="#fff"/></View>}
       </View>
       <Text style={styles.package}>{carClassLabel(vehicle.car_class)}</Text>
       <Text style={styles.name}>{name}</Text>
       </TouchableOpacity>
       <TouchableOpacity accessibilityRole="button" accessibilityLabel={`جزئیات و مدارک، پلاک ${vehicle.license_plate}`} onPress={()=>{
        setDetails(null);setDetailError('');setSelected(vehicle);
       }}><VehiclePlate value={vehicle.license_plate}/></TouchableOpacity>
       {vehicle.approval_pending?<Text style={styles.pendingApproval}>در انتظار تأیید</Text>:!vehicle.is_active&&<Text style={ui.muted}>غیرفعال</Text>}
      </View>
     </View>;
    })}
    <View style={styles.column}>
     <TouchableOpacity accessibilityRole="button" style={[styles.card,styles.addCard]} onPress={()=>navigation.navigate('AddVehicle')}>
      <Icon name="plus" size={34} color="#07846c"/><Text style={ui.link}>افزودن خودرو</Text>
     </TouchableOpacity>
    </View>
   </View>
  </ScrollView>
  <Modal visible={!!selected} transparent animationType="fade" onRequestClose={closeDetails}>
   <SafeAreaView style={styles.modalBackdrop}>
   {selected&&<View accessibilityViewIsModal style={styles.modalCard}><ScrollView contentContainerStyle={ui.body}>
    <View style={[row,styles.detailHeader]}>
     <Text style={ui.title}>{document?(documentLabels[document.type]||'مدرک خودرو'):([selected.brand,selected.model].filter(Boolean).join(' ')||'جزئیات خودرو')}</Text>
     <TouchableOpacity accessibilityRole="button" accessibilityLabel={document?'بازگشت به جزئیات خودرو':'بستن جزئیات خودرو'} onPress={closeDetails}><Icon name={document?'chevron-left':'close'} size={26} color="#385d52"/></TouchableOpacity>
    </View>
    {document?<>
     {!!image&&!imageError&&<Image source={{uri:image}} resizeMode="contain" style={styles.document} onError={()=>setImageError('تصویر مدرک باز نشد.')}/>}
     {!image&&!imageError&&<ActivityIndicator color="#07846c"/>}
     {!!imageError&&<Text accessibilityRole="alert" style={ui.error}>{imageError}</Text>}
    </>:<>
    <View style={ui.card}>
     <VehiclePlate value={selected.license_plate}/>
     <Text style={ui.text}>{selected.color} · {numberFa(selected.year)} · {carClassLabel(selected.car_class)}</Text>
     {!!details?.owner_name&&<Text style={ui.text}>مالک: {details.owner_name}</Text>}
     {!!details?.fuel_type&&<Text style={ui.text}>سوخت: {details.fuel_type}</Text>}
     {!!details?.vin&&<Text style={ui.text}>شماره شاسی: {details.vin}</Text>}
     {!!details?.insurance_expiry&&<Text style={ui.text}>اعتبار بیمه: {details.insurance_expiry}</Text>}
    </View>
    <Text style={ui.title}>مدارک خودرو</Text>
    {!details&&!detailError&&<ActivityIndicator color="#07846c"/>}
    {!!detailError&&<Text accessibilityRole="alert" style={ui.error}>{detailError}</Text>}
    {details?.documents.length===0&&<Text style={ui.muted}>مدرکی برای این خودرو در دسترس نیست.</Text>}
    {details?.documents.map(doc=>{
     const label=documentLabels[doc.type]||'مدرک خودرو';
     return <TouchableOpacity key={doc.id} accessibilityRole="button" style={ui.card}
      onPress={()=>{setImage('');setImageError('');setDocument(doc);}}>
      <Text style={ui.text}>{label}</Text>
     </TouchableOpacity>;
    })}
    </>}
   </ScrollView></View>}
   </SafeAreaView>
  </Modal>
 </DriverShell>;
}

const styles=StyleSheet.create({
 grid:{...row,flexWrap:'wrap',marginHorizontal:-5,rowGap:10},
 column:{width:'50%',paddingHorizontal:5},
 card:{...ui.card,flex:1,padding:10,gap:4},
 activeCard:{backgroundColor:'#f3fbf7',borderColor:'#07846c'},
 pendingApproval:{...ui.muted,alignSelf:'flex-end',color:'#9f231b',backgroundColor:'#ffebe8',fontFamily:'Estedad-Bold',borderRadius:7,paddingHorizontal:7,paddingVertical:2},
 addCard:{minHeight:145,alignItems:'center',justifyContent:'center',borderStyle:'dashed',borderColor:'#07846c',backgroundColor:'#f3fbf7'},
 detailHeader:{alignItems:'center',justifyContent:'space-between'},
 modalBackdrop:{flex:1,justifyContent:'center',alignItems:'center',paddingHorizontal:16,backgroundColor:'rgba(13,35,29,0.5)'},
 modalCard:{width:'100%',maxWidth:398,maxHeight:'85%',borderRadius:20,backgroundColor:'#fff',overflow:'hidden'},
 document:{width:'100%',aspectRatio:1,backgroundColor:'#f3fbf7',borderRadius:8},
 visual:{height:88,borderRadius:12,overflow:'hidden',backgroundColor:'#eaf4ef',alignItems:'center',justifyContent:'center'},
 check:{position:'absolute',end:7,top:7,width:23,height:23,borderRadius:12,backgroundColor:'#07846c',alignItems:'center',justifyContent:'center'},
 package:{...ui.muted,color:'#385d52'},
 name:{...ui.title,fontSize:15},
});
