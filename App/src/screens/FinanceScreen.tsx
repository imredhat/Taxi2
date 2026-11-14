import React,{useCallback,useState} from 'react';
import {ActivityIndicator,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DriverShell from '../components/DriverShell';
import {DriverFinance,driverApi,errorText,toman,tripTime} from '../driverApi';
import {row,ui} from '../driverStyles';

export default function FinanceScreen({navigation}:any){
 const [data,setData]=useState<DriverFinance|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useFocusEffect(useCallback(()=>{
  let live=true;setError('');
  driverApi.finance().then(result=>{if(live)setData(result);}).catch(err=>{if(live)setError(errorText(err));});
  return()=>{live=false;};
 },[attempt]));
 return <DriverShell navigation={navigation} title="مالی" active="Finance">
  <ScrollView contentContainerStyle={ui.body}>
   {!data&&!error&&<ActivityIndicator color="#07846c"/>}
   {!!error&&<View style={ui.card}><Text accessibilityRole="alert" style={ui.error}>{error}</Text><TouchableOpacity onPress={()=>setAttempt(value=>value+1)}><Text style={ui.link}>تلاش مجدد</Text></TouchableOpacity></View>}
   {data&&<>
    <View style={[ui.card,{backgroundColor:'#07846c',borderColor:'#07846c',padding:22}]}>
     <View style={{...row,alignItems:'center',gap:8}}><MaterialCommunityIcons name="wallet-outline" size={23} color="#fff"/><Text style={[ui.text,{color:'#fff'}]}>موجودی کیف پول</Text></View>
     <Text style={[ui.title,{color:'#fff',fontSize:25}]}>{toman(data.balance||'0')} تومان</Text>
    </View>
    <Text style={ui.title}>آخرین تراکنش‌ها</Text>
    {!data.transactions?.length&&<View style={ui.card}><Text style={ui.text}>هنوز تراکنشی ثبت نشده است.</Text></View>}
    {data.transactions?.map(item=><View key={item.id} style={ui.card}>
     <View style={{...row,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
      <Text style={ui.text}>{item.description_fa}</Text>
      <Text style={[ui.text,{color:item.type==='commission'?'#b42318':'#07846c'}]}>{toman(item.amount)} تومان</Text>
     </View>
     {!!item.ride_id&&<Text selectable style={ui.muted}>شناسهٔ سفر · {`\u2066${item.ride_id}\u2069`}</Text>}
     <Text style={ui.muted}>{tripTime(item.created_at)}</Text>
    </View>)}
   </>}
  </ScrollView>
 </DriverShell>;
}
