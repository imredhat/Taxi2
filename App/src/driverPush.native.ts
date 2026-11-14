import {isRunningInExpoGo} from 'expo';
import type {NotificationResponse} from 'expo-notifications';
import {Platform} from 'react-native';
import {storage} from './storage';
import {driverApi} from './driverApi';

export function connectDriverPush(open:(id:string)=>void,receive:(event:{rideId:string;messageId:string})=>void){
 if(Platform.OS!=='android'||isRunningInExpoGo())return ()=>{};
 const Notifications:typeof import('expo-notifications')=require('expo-notifications');
 let live=true;
 const seen=new Set<string>();
 const handle=(response:NotificationResponse|null)=>{
  const data=response?.notification.request.content.data;
  if(!live||data?.kind!=='ride_chat'||typeof data.rideId!=='string'||typeof data.messageId!=='string'||seen.has(data.messageId))return;
  seen.add(data.messageId);
  void Notifications.clearLastNotificationResponseAsync().catch(()=>{});
  open(data.rideId);
 };
 const listener=Notifications.addNotificationResponseReceivedListener(handle);
 const foreground=Notifications.addNotificationReceivedListener(notification=>{
  const data=notification.request.content.data;
  if(live&&data?.kind==='ride_chat'&&typeof data.rideId==='string'&&typeof data.messageId==='string')receive({rideId:data.rideId,messageId:data.messageId});
 });
 handle(Notifications.getLastNotificationResponse());
 void (async()=>{
  const auth=await storage.getItem('auth_token');
  await Notifications.setNotificationChannelAsync('trip-chat',{name:'گفت‌وگوی سفر',importance:Notifications.AndroidImportance.HIGH,sound:'default'});
  let permission=await Notifications.getPermissionsAsync();
  if(permission.status!=='granted'&&permission.canAskAgain)permission=await Notifications.requestPermissionsAsync();
  if(!live||!auth||permission.status!=='granted')return;
  const token=await Notifications.getDevicePushTokenAsync();
  if(!live||typeof token.data!=='string'||auth!==await storage.getItem('auth_token'))return;
  const result=await driverApi.registerDevice(token.data);
  if(auth===await storage.getItem('auth_token'))await storage.setItem('driver_push_device',result.device.id);
 })().catch(()=>{});
 return()=>{live=false;listener.remove();foreground.remove();};
}
