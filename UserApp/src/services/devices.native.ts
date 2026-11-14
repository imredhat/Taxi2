import {Platform} from 'react-native';
import {storage} from '../storage';
import {passengerApi} from './passenger';
async function register(prompt:boolean){
 const notifications=await import('expo-notifications');
 if(Platform.OS==='android'){
  await notifications.setNotificationChannelAsync('default',{name:'اعلانات سفر',importance:notifications.AndroidImportance.DEFAULT});
  await notifications.setNotificationChannelAsync('trip-chat',{name:'گفت‌وگوی سفر',importance:notifications.AndroidImportance.HIGH,sound:'default'});
 }
 let permission=await notifications.getPermissionsAsync();
 if(permission.status!=='granted'&&prompt)permission=await notifications.requestPermissionsAsync();
 if(permission.status!=='granted'){if(prompt)throw new Error('اجازه نمایش اعلان داده نشده است؛ دسترسی را در تنظیمات گوشی فعال کنید.');return;}
 const token=await notifications.getDevicePushTokenAsync();
 if(typeof token.data!=='string')throw new Error('توکن اعلان دستگاه دریافت نشد.');
 const account=await storage.getItem('account_phone'),auth=await storage.getItem('auth_token');
 const result=await passengerApi.registerDevice(token.data,Platform.OS==='ios'?'ios':'android');
 if(auth===await storage.getItem('auth_token'))await storage.setItem(`push_device_id:${account||''}`,result.device.id);
}
export async function enableDeviceNotifications(){try{await register(true);}catch(error){if((error as Error).message.includes('اجازه'))throw error;throw new Error('فعال‌سازی اعلان دستگاه انجام نشد. این قابلیت به نسخه نصب‌شده با تنظیمات اعلان نیاز دارد؛ اعلانات داخل برنامه در دسترس هستند.');}}
export const restoreDeviceNotifications=()=>register(false);
export async function unregisterDeviceNotifications(){const key=`push_device_id:${await storage.getItem('account_phone')||''}`;const id=await storage.getItem(key);if(id)await passengerApi.removeDevice(id);await storage.removeItem(key);}

export function listenToChatPush(open:(id:string)=>void){
 if(Platform.OS!=='android')return ()=>{};
 let live=true;
 let remove=()=>{};
 void import('expo-notifications').then(notifications=>{
  if(!live)return;
  notifications.setNotificationHandler({handleNotification:async notification=>{
   const chat=notification.request.content.data?.kind==='ride_chat';
   return {shouldShowBanner:chat,shouldShowList:chat,shouldPlaySound:chat,shouldSetBadge:false};
  }});
  const handle=(response:import('expo-notifications').NotificationResponse|null)=>{
   const data=response?.notification.request.content.data;
   if(!live||data?.kind!=='ride_chat'||typeof data.rideId!=='string')return;
   void notifications.clearLastNotificationResponseAsync().catch(()=>{});
   open(data.rideId);
  };
  const subscription=notifications.addNotificationResponseReceivedListener(handle);
  remove=()=>subscription.remove();
  handle(notifications.getLastNotificationResponse());
 }).catch(()=>{});
 return()=>{live=false;remove();};
}
