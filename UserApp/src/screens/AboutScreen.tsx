import React,{useState} from 'react';
import {Text,TouchableOpacity,View} from 'react-native';
import {ScreenPage,EmptyState,ui} from '../components/ScreenPage';
import ApiFeedback from '../components/ApiFeedback';
import {useRemote} from '../services/useRemote';
import {passengerApi} from '../services/passenger';
export default function AboutScreen({navigation,route}:any){
 const [type,setType]=useState<'about'|'terms'>('about');const remote=useRemote(()=>passengerApi.content(type),type);
 return <ScreenPage navigation={navigation} title="درباره و قوانین" guest={!!route?.params?.guest}><View style={ui.row}>{(['about','terms'] as const).map(value=><TouchableOpacity key={value} onPress={()=>setType(value)}><Text style={type===value?ui.title:ui.link}>{value==='about'?'درباره ما':'قوانین سفر'}</Text></TouchableOpacity>)}</View><ApiFeedback {...remote} retry={remote.reload} navigation={navigation}/>{remote.data?.items.map((item:any)=><View key={item.slug} style={ui.card}><Text style={ui.title}>{item.title_fa||item.title}</Text><Text style={ui.text}>{item.content_fa||item.content}</Text></View>)}{remote.data&&!remote.data.items.length&&<EmptyState title="محتوایی منتشر نشده است" message="اطلاعات منتشرشده مجموعه در این صفحه قرار می‌گیرد."/>}</ScreenPage>;
}
