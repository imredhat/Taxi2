import React, { useEffect, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import ApiFeedback from '../components/ApiFeedback';
import { passengerApi, allPages } from '../services/passenger';
import { useRemote } from '../services/useRemote';
import { colors, fonts, ltrLayout, rtlLayout } from '../theme';

type Message = { id: string; message: string; created_at: string; is_mine: boolean; is_read?: boolean };
const day = (value: string) => new Date(value).toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran' });
const time = (value: string) => new Date(value).toLocaleTimeString('fa-IR', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit' });
export default function DriverChatScreen({ navigation, route }: any) {
 const id = route?.params?.rideId;
 const [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
 const [inputHeight, setInputHeight] = useState(48);
 const focused = useIsFocused(), list = useRef<ScrollView>(null), nearBottom = useRef(true), sending = useRef(false);
 const remote = useRemote(async () => {
  if (!id) throw new Error('گفتگو پیدا نشد؛ دوباره از صفحه رزرو وارد شوید.');
  const [result, items] = await Promise.all([passengerApi.trip(id), allPages(page => passengerApi.messages(id, page))]);
  return { trip: result.trip, items: items as Message[] };
 }, id || '');
 const latest = useRef(remote.data); latest.current = remote.data;
 useEffect(() => {
  if (!focused || !id) return;
  let live = true; let timer: ReturnType<typeof setTimeout>;
  const poll = async () => {
   try {
    if(AppState.currentState==='background')return;
    const current = latest.current;
    if (current) {
     const items: Message[] = []; let page = Math.max(1, Math.floor((current.items.length - 1) / 20) + 1);
     for (;;) { const result = await passengerApi.messages(id, page++); if (!live) return; items.push(...result.items); if (result.items.length < 20) break; }
     const result = await passengerApi.trip(id);
     if (live) remote.setData(previous => previous ? { trip: result.trip, items: [...new Map([...previous.items, ...items].map(item => [item.id, item])).values()].sort((a,b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)) } : previous);
    }
   } catch (err) { if (live) setError(err instanceof Error ? err.message : 'دریافت پیام‌ها انجام نشد.'); }
   finally { if (live) timer = setTimeout(poll, 5000); }
  };
  timer = setTimeout(poll, 5000); return () => { live = false; clearTimeout(timer); };
 }, [focused, id, remote.setData]);
 useEffect(()=>{
  if(!focused||!id||AppState.currentState==='background')return;
  const ids=remote.data?.items.filter(item=>!item.is_mine&&!item.is_read).map(item=>item.id)||[];
  if(!ids.length)return;
  let live=true;
  void (async()=>{
   for(let start=0;start<ids.length;start+=100)await passengerApi.markMessagesRead(id,ids.slice(start,start+100));
   if(live)remote.setData(previous=>previous?{...previous,items:previous.items.map(item=>ids.includes(item.id)?{...item,is_read:true}:item)}:previous);
  })().catch(()=>{});
  return()=>{live=false;};
 },[focused,id,remote.data?.items,remote.setData]);
 const writable = !!remote.data && ['accepted', 'arriving', 'arrived', 'in_progress'].includes(remote.data.trip.status);
 const send = async () => {
  const body = message.trim(); if (!body || !writable || sending.current) return;
  sending.current = true; setBusy(true); setError('');
  try {
   const result = await passengerApi.sendMessage(id, body);
   nearBottom.current = true;
   remote.setData(previous => previous ? { ...previous, items: [...previous.items.filter(item => item.id !== result.message.id), { ...result.message, is_mine: true }] } : previous);
   setMessage(''); setInputHeight(48);
  } catch (err) { setError(err instanceof Error ? err.message : 'پیام ارسال نشد؛ دوباره تلاش کنید.'); }
  finally { sending.current = false; setBusy(false); }
 };
 useEffect(() => { setMessage(''); setError(''); nearBottom.current = true; }, [id]);
 const driver = [remote.data?.trip.driver_first_name, remote.data?.trip.driver_last_name].filter(Boolean).join(' ');
 return <SafeAreaView style={styles.root} edges={['top','bottom','left','right']}>
  <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
   <View style={styles.header}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="بازگشت" style={styles.headerButton} onPress={() => navigation.goBack()}><Icon name="chevron-right" color={colors.primary}/></TouchableOpacity>
    <View style={styles.avatar}><Icon name="person" size={28} color={colors.primary}/></View>
    <View style={styles.heading}><Text style={styles.name}>{driver || 'رانندهٔ شما'}</Text><Text style={styles.subtitle}>گفتگو با راننده</Text></View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="پشتیبانی گفتگو" style={styles.headerButton} onPress={() => navigation.navigate('Support',{rideId:id})}><Icon name="support_agent" size={23} color={colors.primary}/></TouchableOpacity>
   </View>
   <ScrollView ref={list} style={styles.messages} contentContainerStyle={styles.messageBody} keyboardShouldPersistTaps="handled" onContentSizeChange={() => { if (nearBottom.current) list.current?.scrollToEnd({animated:true}); }} onScroll={({nativeEvent:e}) => { nearBottom.current = e.contentSize.height - e.layoutMeasurement.height - e.contentOffset.y < 80; }} scrollEventThrottle={100}>
    <ApiFeedback loading={remote.loading} error={remote.error} retry={remote.reload} navigation={navigation}/>
    {remote.data && !remote.data.items.length && <View style={styles.empty}><View style={styles.emptyIcon}><Icon name="chat-outline" size={36} color={colors.primary}/></View><Text style={styles.emptyTitle}>شروع گفتگو</Text><Text style={styles.emptyText}>پیامت را برای راننده بنویس.</Text></View>}
    {remote.data?.items.map((item,index,items) => <View key={item.id}>
     {(index===0 || day(items[index-1].created_at)!==day(item.created_at)) && <Text style={styles.date}>{day(item.created_at)}</Text>}
     <View style={[styles.bubble,item.is_mine?styles.mine:styles.theirs]}><Text style={[styles.messageText,item.is_mine&&styles.mineText]}>{item.message}</Text><Text style={[styles.time,item.is_mine&&styles.mineTime]}>{time(item.created_at)}</Text></View>
    </View>)}
   </ScrollView>
   {!!error && <View style={styles.error}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text><TouchableOpacity accessibilityLabel="بستن خطا" onPress={()=>setError('')} style={styles.headerButton}><Icon name="close" size={18} color={colors.errorRed}/></TouchableOpacity></View>}
   {remote.data && !writable && <Text style={styles.closed}>امکان ارسال پیام برای این گفتگو فعال نیست؛ پیام‌های قبلی قابل مشاهده‌اند.</Text>}
   <View style={styles.composer}><TextInput accessibilityLabel="پیام به راننده" placeholder="‏پیام شما…" {...(Platform.OS === 'web' ? { dir: 'rtl', lang: 'fa', rows: 1 } : {})} placeholderTextColor={colors.onSurfaceVariant} style={[styles.input,{height:inputHeight}]} onContentSizeChange={({nativeEvent})=>setInputHeight(Math.min(120,Math.max(48,nativeEvent.contentSize.height)))} value={message} onChangeText={value=>{setMessage(value);if(!value)setInputHeight(48);}} multiline maxLength={2000} editable={writable&&!busy}/><TouchableOpacity accessibilityRole="button" accessibilityLabel="ارسال پیام" disabled={!writable||busy||!message.trim()} style={[styles.send,(!writable||busy||!message.trim())&&styles.disabled]} onPress={send}><View style={!busy?styles.sendGlyph:undefined}><Icon name={busy?'dots-horizontal':'send'} size={23} color={colors.onPrimary}/></View></TouchableOpacity></View>
  </KeyboardAvoidingView>
 </SafeAreaView>;
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.background},header:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',gap:10,paddingHorizontal:12,paddingVertical:12,backgroundColor:colors.surface,borderBottomWidth:1,borderBottomColor:colors.outlineVariant},headerButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},avatar:{width:44,height:44,borderRadius:16,backgroundColor:colors.secondaryContainer,alignItems:'center',justifyContent:'center'},heading:{flex:1,gap:4},name:{fontFamily:fonts.bold,fontSize:15,color:colors.onSurface,textAlign:'right'},subtitle:{fontFamily:fonts.regular,fontSize:11,color:colors.onSurfaceVariant,textAlign:'right'},
 messages:{flex:1},messageBody:{...ltrLayout,flexGrow:1,padding:16,gap:12,paddingBottom:20},bubble:{maxWidth:'84%',paddingHorizontal:14,paddingVertical:10,borderRadius:20,gap:6},mine:{alignSelf:'flex-end',backgroundColor:colors.primary,borderBottomRightRadius:5},theirs:{alignSelf:'flex-start',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.outlineVariant,borderBottomLeftRadius:5},messageText:{fontFamily:fonts.regular,fontSize:14,lineHeight:25,color:colors.onSurface,textAlign:'right'},mineText:{color:colors.onPrimary},time:{fontFamily:fonts.regular,fontSize:10,color:colors.onSurfaceVariant,textAlign:'left'},mineTime:{color:'#d6f2e9'},date:{fontFamily:fonts.regular,fontSize:10,color:colors.onSurfaceVariant,textAlign:'center',marginVertical:12},
 composer:{...rtlLayout,flexDirection:'row',alignItems:'center',gap:10,padding:12,backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:colors.outlineVariant},input:{flex:1,minHeight:48,maxHeight:120,backgroundColor:colors.surfaceDim,borderRadius:18,paddingHorizontal:14,paddingVertical:12,fontFamily:fonts.regular,fontSize:14,lineHeight:22,color:colors.onSurface,textAlign:'right',writingDirection:'rtl',textAlignVertical:'center'},sendGlyph:{transform:[{rotate:'180deg'}]},send:{width:48,height:48,borderRadius:17,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},disabled:{opacity:0.4},empty:{flex:1,minHeight:220,alignItems:'center',justifyContent:'center',gap:12},emptyIcon:{width:76,height:76,borderRadius:28,backgroundColor:colors.secondaryContainer,alignItems:'center',justifyContent:'center'},emptyTitle:{fontFamily:fonts.bold,fontSize:17,color:colors.onSurface},emptyText:{fontFamily:fonts.regular,fontSize:12,color:colors.onSurfaceVariant},error:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',paddingHorizontal:16,backgroundColor:colors.errorContainer},errorText:{flex:1,fontFamily:fonts.regular,fontSize:12,lineHeight:22,color:colors.errorRed,textAlign:'right'},closed:{fontFamily:fonts.regular,fontSize:11,lineHeight:22,color:colors.onSurfaceVariant,textAlign:'center',padding:12},
});
