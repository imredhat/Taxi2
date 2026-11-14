import React,{useCallback,useState} from 'react';
import {ActivityIndicator,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import DriverShell from '../components/DriverShell';
import {useFocusEffect} from '@react-navigation/native';
import {carClassLabel,Dashboard,driverApi,errorText,numberFa} from '../driverApi';
import {ui} from '../driverStyles';
export default function VehiclesScreen({navigation}:any){
 const [data,setData]=useState<Dashboard|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useFocusEffect(useCallback(()=>{
  let live=true;
  driverApi.dashboard().then(result=>{if(live){setData(result);setError('');}}).catch(err=>{if(live)setError(errorText(err));});
  return()=>{live=false;};
 },[]));
 const activate=async(id:string)=>{
  setBusy(true);setError('');
  try{await driverApi.activate(id);setData(previous=>previous?{...previous,driver:{...previous.driver,active_vehicle_id:id}}:previous);}
  catch(err){setError(errorText(err));}finally{setBusy(false);}
 };
 return <DriverShell navigation={navigation} title="خودروهای من" back>
  <ScrollView contentContainerStyle={ui.body}>
   <TouchableOpacity style={ui.button} onPress={()=>navigation.navigate('AddVehicle')}><Text style={ui.buttonText}>افزودن خودرو</Text></TouchableOpacity>
   {!!error&&<Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
   {!data&&!error&&<ActivityIndicator color="#07846c"/>}
   {data&&!data.vehicles.length&&<Text style={ui.text}>خودرویی ثبت نشده است.</Text>}
   {data?.vehicles.map(vehicle=>{const active=vehicle.id===data.driver.active_vehicle_id&&vehicle.is_active;return <View key={vehicle.id} style={[ui.card,active&&{backgroundColor:'#eaf8f4',borderColor:'#07846c'}]}>
    <Text style={ui.title}>{[vehicle.brand,vehicle.model].filter(Boolean).join(' ')||'خودرو'}</Text>
    <Text style={ui.text}>{vehicle.license_plate}</Text><Text style={ui.muted}>{vehicle.color} · {numberFa(vehicle.year)} · {carClassLabel(vehicle.car_class)}</Text>
    {active?<Text style={ui.link}>خودروی فعال</Text>:<TouchableOpacity accessibilityRole="button" disabled={busy||!vehicle.is_active} onPress={()=>activate(vehicle.id)}><Text style={vehicle.is_active?ui.link:ui.muted}>{vehicle.is_active?'انتخاب به‌عنوان خودروی فعال':'غیرفعال'}</Text></TouchableOpacity>}
   </View>;})}
  </ScrollView>
 </DriverShell>;
}
