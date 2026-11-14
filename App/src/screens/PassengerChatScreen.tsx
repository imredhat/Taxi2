import React,{useCallback,useEffect,useRef,useState} from 'react';
import axios from 'axios';
import {ActivityIndicator,AppState,KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect,useIsFocused} from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import {driverApi,errorText,TripMessage} from '../driverApi';
import {row,ui} from '../driverStyles';
import {onDriverChatMessage} from '../driverChatEvents';

const time=(value:string)=>new Date(value).toLocaleTimeString('fa-IR',{timeZone:'Asia/Tehran',hour:'2-digit',minute:'2-digit'});
const merge=(previous:TripMessage[],items:TripMessage[])=>[...new Map([...previous,...items].map(item=>[item.id,item])).values()]
 .sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)||a.id.localeCompare(b.id));

export default function PassengerChatScreen({navigation,route}:any){
 const id=route.params?.id;
 const [items,setItems]=useState<TripMessage[]>([]),[draft,setDraft]=useState('');
 const [ready,setReady]=useState(false),[closed,setClosed]=useState(false),[busy,setBusy]=useState(false);
 const [page,setPage]=useState(1),[more,setMore]=useState(false),[loadingOlder,setLoadingOlder]=useState(false);
 const [loadError,setLoadError]=useState(''),[sendError,setSendError]=useState('');
 const scroll=useRef<ScrollView>(null),nearBottom=useRef(true),scrollAfterSend=useRef(false),sending=useRef(false),loading=useRef(false);
 useFocusEffect(useCallback(()=>{
  let live=true,timer:ReturnType<typeof setTimeout>,stopped=false,refreshing=false;
  async function refresh(){
   if(!live||refreshing||stopped)return;
   clearTimeout(timer);
   if(AppState.currentState==='background'){timer=setTimeout(refresh,5000);return;}
   refreshing=true;
   try{
    const result=await driverApi.messages(id);
    if(live){
     setItems(previous=>merge(previous,result.items));setReady(true);setClosed(false);setLoadError('');
     setMore(previous=>page===1?result.has_more:previous);
    }
   }catch(err){
    if(live){
     stopped=axios.isAxiosError(err)&&[401,403,404].includes(err.response?.status??0);
     setClosed(stopped);setLoadError(errorText(err));
    }
   }finally{
    refreshing=false;
    if(live&&!stopped)timer=setTimeout(refresh,5000);
   }
  }
  void refresh();
  const unsubscribe=onDriverChatMessage(rideId=>{if(rideId===null||rideId===id)void refresh();});
  return()=>{live=false;clearTimeout(timer);unsubscribe();};
 },[id,page]));
 const focused=useIsFocused();
 useEffect(()=>{
  if(!focused||AppState.currentState==='background')return;
  const ids=items.filter(item=>!item.is_mine&&!item.is_read).map(item=>item.id);
  if(!ids.length)return;
  let live=true;
  void (async()=>{
   for(let start=0;start<ids.length;start+=100)await driverApi.markMessagesRead(id,ids.slice(start,start+100));
   if(live)setItems(previous=>previous.map(item=>ids.includes(item.id)?{...item,is_read:true}:item));
  })().catch(()=>{});
  return()=>{live=false;};
 },[id,focused,items]);
 const loadOlder=async()=>{
  if(loading.current||closed)return;
  loading.current=true;setLoadingOlder(true);nearBottom.current=false;
  try{
   const result=await driverApi.messages(id,page+1);
   setItems(previous=>merge(previous,result.items));setPage(page+1);setMore(result.has_more);
  }catch(err){setLoadError(errorText(err));}
  finally{loading.current=false;setLoadingOlder(false);}
 };
 const send=async()=>{
  const text=draft.trim();
  if(!text||!ready||closed||sending.current)return;
  sending.current=true;setBusy(true);setSendError('');
  try{
   const result=await driverApi.sendMessage(id,text);
   nearBottom.current=true;scrollAfterSend.current=true;
   setItems(previous=>merge(previous,[result.message]));setDraft('');
  }catch(err){
   if(axios.isAxiosError(err)&&[401,403,404].includes(err.response?.status??0))setClosed(true);
   setSendError(errorText(err));
  }finally{sending.current=false;setBusy(false);}
 };
 const disabled=!ready||closed||busy||!draft.trim();
 return <SafeAreaView style={styles.root}>
  <KeyboardAvoidingView style={styles.root} behavior={Platform.OS==='ios'?'padding':undefined}>
   <View style={styles.header}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="بازگشت" onPress={()=>navigation.goBack()} style={styles.back}>
     <Icon name="chevron-right" size={25} color="#08745e"/>
    </TouchableOpacity>
    <View style={styles.avatar}><Icon name="account-outline" size={25} color="#08745e"/></View>
    <Text style={[ui.title,styles.heading]}>چت با مسافر</Text>
   </View>
   <ScrollView ref={scroll} style={styles.messages} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled"
    maintainVisibleContentPosition={{minIndexForVisible:0}}
    onContentSizeChange={()=>{
     if(nearBottom.current||scrollAfterSend.current){
      scrollAfterSend.current=false;
      scroll.current?.scrollToEnd({animated:false});
     }
    }}
    onScroll={({nativeEvent:e})=>{nearBottom.current=e.contentSize.height-e.layoutMeasurement.height-e.contentOffset.y<80;}} scrollEventThrottle={100}>
    {!ready&&!loadError&&<ActivityIndicator color="#07846c"/>}
    {!!loadError&&<Text accessibilityRole="alert" style={ui.error}>{loadError}</Text>}
    {ready&&!items.length&&!closed&&<Text style={ui.muted}>هنوز پیامی ارسال نشده است.</Text>}
    {more&&!closed&&<TouchableOpacity accessibilityRole="button" disabled={loadingOlder} onPress={loadOlder}>
     <Text style={styles.older}>{loadingOlder?'در حال دریافت…':'پیام‌های قبلی'}</Text>
    </TouchableOpacity>}
    {items.map(item=><View key={item.id} style={[styles.bubble,item.is_mine?styles.mine:styles.theirs]}>
     <Text style={[ui.text,item.is_mine&&styles.mineText]}>{item.message}</Text>
     <Text style={[styles.time,item.is_mine&&styles.mineTime]}>{time(item.created_at)}</Text>
    </View>)}
   </ScrollView>
   {!!sendError&&<Text accessibilityRole="alert" style={[ui.error,styles.error]}>{sendError}</Text>}
   <View style={styles.composer}>
    <TextInput accessibilityLabel="پیام به مسافر" placeholder="‏پیام شما…" placeholderTextColor="#52615e"
     style={styles.input} multiline maxLength={2000} editable={ready&&!closed&&!busy} value={draft} onChangeText={setDraft}/>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="ارسال پیام" disabled={disabled}
     style={[styles.send,disabled&&{opacity:0.45}]} onPress={send}>
     <Icon name="send" size={22} color="#fff" style={{transform:[{rotate:'180deg'}]}}/>
    </TouchableOpacity>
   </View>
  </KeyboardAvoidingView>
 </SafeAreaView>;
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:'#f4f8f5'},
 header:{...row,alignItems:'center',gap:9,paddingHorizontal:12,paddingVertical:8,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#e0ebe4'},
 back:{width:44,height:44,alignItems:'center',justifyContent:'center'},
 avatar:{width:39,height:39,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:'#e3f1e9'},
 heading:{flex:1,fontSize:16},
 messages:{flex:1},
 body:{padding:13,gap:8,...row,flexDirection:'column',alignItems:'stretch'},
 bubble:{maxWidth:'84%',paddingHorizontal:12,paddingVertical:7,borderRadius:14,gap:3},
 mine:{alignSelf:'flex-end',backgroundColor:'#14654f',borderBottomRightRadius:4},
 theirs:{alignSelf:'flex-start',backgroundColor:'#fff',borderWidth:1,borderColor:'#e0ebe4',borderBottomLeftRadius:4},
 mineText:{color:'#fff'},
 time:{...ui.muted,textAlign:'left',fontSize:10,lineHeight:15},
 mineTime:{color:'#c1ebdb'},
 older:{...ui.link,textAlign:'center'},
 error:{paddingHorizontal:12,paddingBottom:6},
 composer:{...row,alignItems:'center',gap:8,padding:9,backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#e0ebe4'},
 input:{...ui.text,flex:1,minHeight:46,maxHeight:110,paddingHorizontal:11,paddingVertical:7,borderRadius:13,backgroundColor:'#edf4ef',writingDirection:'rtl',textAlignVertical:'center'},
 send:{width:46,height:46,borderRadius:13,backgroundColor:'#14654f',alignItems:'center',justifyContent:'center'},
});
