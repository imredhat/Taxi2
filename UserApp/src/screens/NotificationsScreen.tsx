import React,{useEffect,useState} from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { ScreenPage, EmptyState, ui } from '../components/ScreenPage';
import {Icon} from '../components/Icon';
import {colors,fonts,ltrLayout} from '../theme';
import {localDate} from '../utils/display';
import { useAppData } from '../state/AppData';
export default function NotificationsScreen({navigation}:any){
 const {data,markRead,refresh}=useAppData();
 const [error,setError]=useState('');useEffect(()=>{refresh().catch(err=>setError(err instanceof Error?err.message:'دریافت اعلانات انجام نشد.'));},[]);
 return <ScreenPage navigation={navigation} title="اعلانات">
  {!!error&&<Text style={ui.text}>{error}</Text>}
  <View style={styles.toolbar}>
   {!!data.notices.some(item=>!item.read)&&<TouchableOpacity accessibilityRole="button" style={styles.readAll} onPress={()=>markRead().catch(err=>setError((err as Error).message))}><Icon name="check-all" size={20} color={colors.primary}/><Text style={styles.actionText}>خواندن همه</Text></TouchableOpacity>}
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="به‌روزرسانی اعلانات" style={styles.iconButton} onPress={()=>refresh().then(()=>setError('')).catch(err=>setError((err as Error).message))}><Icon name="refresh" size={21} color={colors.primary}/></TouchableOpacity>
  </View>
  {!data.notices.length?<EmptyState title="اعلان تازه‌ای ندارید" message="پیام‌های مربوط به فعالیت‌ها و سفرهای شما در این بخش نمایش داده می‌شوند." />:data.notices.map(item=><TouchableOpacity key={item.id} accessibilityRole="button" style={[styles.card,!item.read&&styles.unreadCard]} onPress={async()=>{try{await markRead(item.id);if(item.tripId)navigation.navigate('TripDetails',{tripId:item.tripId});}catch(err){setError((err as Error).message);}}}>
   <View style={[styles.noticeIcon,!item.read&&styles.unreadIcon]}><Icon name={item.read?'bell-check-outline':'bell-ring-outline'} size={21} color={item.read?colors.onSurfaceVariant:colors.primary}/></View>
   <View style={styles.content}><View style={styles.heading}><Text style={[styles.title,!item.read&&styles.unreadTitle]}>{item.title}</Text>{!item.read&&<View style={styles.dot}/>}</View><Text style={styles.body}>{item.body}</Text><Text style={styles.date}>{item.createdAt?localDate(item.createdAt):''}</Text></View>
  </TouchableOpacity>)}
  <TouchableOpacity onPress={()=>navigation.navigate('Settings')}><Text style={ui.link}>تنظیم اعلانات</Text></TouchableOpacity>
 </ScreenPage>;
}

const styles=StyleSheet.create({
 toolbar:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between'},readAll:{flexDirection:'row-reverse',alignItems:'center',gap:6,minHeight:44},actionText:{fontFamily:fonts.medium,fontSize:12,color:colors.primary},iconButton:{width:44,height:44,borderRadius:14,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},
 card:{...ltrLayout,flexDirection:'row-reverse',alignItems:'flex-start',gap:10,padding:12,borderRadius:16,borderWidth:1,borderColor:colors.outlineVariant,backgroundColor:colors.surface},unreadCard:{backgroundColor:'#eef8f4',borderColor:'#c5e8dc',borderRightWidth:3,borderRightColor:colors.primary},
 noticeIcon:{width:36,height:36,borderRadius:12,backgroundColor:colors.surfaceDim,alignItems:'center',justifyContent:'center'},unreadIcon:{backgroundColor:'#d8f0e6'},content:{flex:1,gap:5},heading:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',gap:8},title:{flex:1,fontFamily:fonts.bold,fontSize:13,lineHeight:22,color:colors.onSurface,textAlign:'right'},unreadTitle:{color:'#075b4b'},dot:{width:6,height:6,borderRadius:3,backgroundColor:colors.primary},body:{fontFamily:fonts.regular,fontSize:12,lineHeight:21,color:colors.onSurfaceVariant,textAlign:'right'},date:{fontFamily:fonts.regular,fontSize:10,lineHeight:18,color:colors.onSurfaceVariant,textAlign:'right'},
});
