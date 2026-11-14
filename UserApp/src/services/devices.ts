import {storage} from '../storage';
import {passengerApi} from './passenger';
export async function enableDeviceNotifications():Promise<void>{throw new Error('اعلان دستگاه در نسخه اندروید و iOS فعال می‌شود؛ اعلانات داخل برنامه در دسترس هستند.');}
export async function restoreDeviceNotifications():Promise<void>{}
export async function unregisterDeviceNotifications(){const key=`push_device_id:${await storage.getItem('account_phone')||''}`;const id=await storage.getItem(key);if(id)await passengerApi.removeDevice(id);await storage.removeItem(key);}

export function listenToChatPush(_open:(id:string)=>void){return ()=>{};}
