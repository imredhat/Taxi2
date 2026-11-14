import React,{useEffect,useRef,useState} from 'react';
import {Modal,Text,TouchableOpacity,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import {ui} from './ScreenPage';
import {API_URL} from '../services/api';
interface BankRedirect {method:string;url:string;fields:Record<string,string>}
export default function BankCheckout({redirect,onDone,onError,autoOpen=false}:{redirect:BankRedirect;onDone:()=>void;onError:(message:string)=>void;autoOpen?:boolean}){
 const [open,setOpen]=useState(false);
 const opened=useRef(false);
 const enter=()=>{
  if(redirect?.method!=='POST'||redirect.url!=='https://sep.shaparak.ir/OnlinePG/OnlinePG'||!redirect.fields?.Token){onError('آدرس درگاه معتبر نیست.');return;}
  setOpen(true);
 };
 useEffect(()=>{
  if(!autoOpen||opened.current)return;
  opened.current=true;
  enter();
 },[autoOpen]);
 const close=()=>{setOpen(false);onDone();};
 return <><TouchableOpacity style={ui.button} onPress={enter}><Text style={ui.buttonText}>ورود به درگاه سامان</Text></TouchableOpacity><Modal visible={open} onRequestClose={close}><SafeAreaView style={ui.root}><TouchableOpacity onPress={close}><Text style={ui.link}>بازگشت و بررسی نتیجه پرداخت</Text></TouchableOpacity>{open&&<WebView style={{flex:1}} source={{uri:redirect.url,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:`Token=${encodeURIComponent(redirect.fields.Token)}`}} onError={()=>onError('ارتباط با درگاه قطع شد؛ نتیجه را دوباره بررسی کنید.')} onNavigationStateChange={state=>{try{const url=new URL(state.url);if(url.pathname.startsWith('/api/payments/sep/callback/')&&url.origin===new URL(API_URL).origin&&!state.loading)close();}catch{}}} setSupportMultipleWindows={false}/>}</SafeAreaView></Modal></>;
}
