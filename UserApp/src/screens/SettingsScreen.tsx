import React,{useEffect,useState} from 'react';
import {Text,View,Switch} from 'react-native';
import {ScreenPage,MenuRow,ui} from '../components/ScreenPage';
import {passengerApi} from '../services/passenger';
import {useAppData} from '../state/AppData';
import {colors} from '../theme';
import {useRemote} from '../services/useRemote';
import ApiFeedback from '../components/ApiFeedback';
export default function SettingsScreen({navigation}:any){
 const {data,setActivityNotices}=useAppData();const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const remote=useRemote(async()=>({preferences:(await passengerApi.preferences()).preferences}));
 useEffect(()=>{if(remote.data)setActivityNotices(remote.data.preferences.activity_notifications);},[remote.data]);
 return <ScreenPage navigation={navigation} title="تنظیمات">
  {!!error&&<Text style={ui.text}>{error}</Text>}
  <ApiFeedback {...remote} retry={remote.reload} navigation={navigation}/>
  <View style={ui.card}><Text style={ui.title}>اعلانات فعالیت‌ها</Text><View style={ui.row}><Text style={[ui.text,{flex:1}]}>ذخیره اعلان هنگام ایجاد پیش‌نویس سفر</Text><Switch value={data.activityNotices} disabled={busy} onValueChange={async value=>{setBusy(true);setError('');try{await passengerApi.updatePreferences(value);setActivityNotices(value);}catch(err){setError(err instanceof Error?err.message:'ذخیره تنظیمات انجام نشد.');}finally{setBusy(false);}}} trackColor={{true:colors.safetyTeal,false:colors.surfaceVariant}}/></View><Text style={ui.muted}>این تنظیم مربوط به اعلانات داخل برنامه است.</Text></View>
  <MenuRow label="حساب کاربری" icon="person" onPress={()=>navigation.navigate('Profile')}/><MenuRow label="راهنما و حریم خصوصی" icon="support_agent" onPress={()=>navigation.navigate('About')}/>
 </ScreenPage>;
}
