import {useEffect} from 'react';
import {AppState} from 'react-native';
import {createAudioPlayer} from 'expo-audio';
import {io} from 'socket.io-client';
import {API_URL} from './utils';
import {storage} from './storage';
import {driverApi} from './driverApi';
import {connectDriverPush} from './driverPush';

const listeners=new Set<(id:string|null)=>void>();
export function onDriverChatMessage(listener:(id:string|null)=>void){
 listeners.add(listener);
 return()=>{listeners.delete(listener);};
}

export function useDriverChatEvents(active:boolean,navigation:any){
 useEffect(()=>{
  if(!active)return;
  let live=true, retry:ReturnType<typeof setTimeout>|undefined,delay=1500;
  const seen=new Set<string>();
  const player=createAudioPlayer(require('../assets/chat-chime.wav'));
  const socket=io(API_URL,{path:'/dispatch/socket.io',transports:['websocket'],autoConnect:false,timeout:6000});
  const open=(id:string)=>{
   if(live&&navigation.isReady()&&navigation.getCurrentRoute()?.name!=='PassengerChat'){
    navigation.navigate('PassengerChat',{id});
   }
  };
  const receive=({rideId,messageId}:{rideId:string;messageId:string})=>{
   if(!live||typeof rideId!=='string'||typeof messageId!=='string'||seen.has(messageId))return;
   seen.add(messageId);
   if(seen.size>150)seen.delete(seen.values().next().value!);
   for(const listener of listeners)listener(rideId);
   if(AppState.currentState==='background'||AppState.currentState==='inactive')return;
   void player.seekTo(0).then(()=>{if(live)player.play();}).catch(()=>{});
   open(rideId);
  };
  const stopPush=connectDriverPush(id=>{
   if(!live)return;
   void driverApi.trip(id).then(({trip})=>{if(trip.can_contact)open(id);}).catch(()=>{});
  },receive);
  socket.on('chat:message',receive);
  const reconnect=()=>{
   if(!live||socket.active||retry)return;
   retry=setTimeout(()=>{retry=undefined;if(live)socket.connect();},delay+Math.random()*800);
   delay=Math.min(delay*2,60000);
  };
  socket.on('connect',()=>{delay=1500;for(const listener of listeners)listener(null);});
  socket.on('disconnect',reconnect).on('connect_error',reconnect);
  void storage.getItem('auth_token').then(token=>{
   if(live&&token){socket.auth={token};socket.connect();}
  }).catch(()=>{});
  return()=>{live=false;clearTimeout(retry);socket.disconnect();stopPush();player.remove();};
 },[active,navigation]);
}
