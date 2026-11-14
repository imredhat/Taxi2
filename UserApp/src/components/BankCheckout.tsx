import React,{useEffect,useRef} from 'react';
import {Text,TouchableOpacity} from 'react-native';
import {ui} from './ScreenPage';
export interface BankRedirect {method:string;url:string;fields:Record<string,string>}
export function validBankRedirect(value:BankRedirect){return value?.method==='POST'&&value.url==='https://sep.shaparak.ir/OnlinePG/OnlinePG'&&typeof value.fields?.Token==='string'&&!!value.fields.Token;}
export default function BankCheckout({redirect,onError,autoOpen=false}:{redirect:BankRedirect;onDone:()=>void;onError:(message:string)=>void;autoOpen?:boolean}){
 const opened=useRef(false);
 const open=(target:string)=>{if(!validBankRedirect(redirect)){onError('آدرس درگاه معتبر نیست.');return;}const form=document.createElement('form');form.method='POST';form.action=redirect.url;form.target=target;form.rel='noopener noreferrer';const input=document.createElement('input');input.type='hidden';input.name='Token';input.value=redirect.fields.Token;form.appendChild(input);document.body.appendChild(form);form.submit();form.remove();};
 useEffect(()=>{
  if(!autoOpen||opened.current)return;
  opened.current=true;
  open('_self');
 },[autoOpen]);
 return <TouchableOpacity style={ui.button} onPress={()=>open('_blank')}><Text style={ui.buttonText}>ورود به درگاه سامان</Text></TouchableOpacity>;
}
