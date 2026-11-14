import React,{useState} from 'react';
import {Text,TextInput,TouchableOpacity,View} from 'react-native';
import {ScreenPage,ui} from '../components/ScreenPage';
import ApiFeedback from '../components/ApiFeedback';
import {useRemote} from '../services/useRemote';
import {passengerApi} from '../services/passenger';
import {localDate,statusLabel} from '../utils/display';
export default function TicketScreen({navigation,route}:any){
 const id=route.params.ticketId;const [page,setPage]=useState(1),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const remote=useRemote(()=>passengerApi.ticket(id,page),`${id}:${page}`);
 const act=async(close=false)=>{if(busy)return;setBusy(true);setError('');try{if(close)await passengerApi.closeTicket(id);else{await passengerApi.ticketMessage(id,message);setMessage('');}remote.reload();}catch(err){setError((err as Error).message);}finally{setBusy(false);}};
 return <ScreenPage navigation={navigation} title="گفتگو با پشتیبانی"><ApiFeedback loading={remote.loading} error={error||remote.error} retry={remote.reload} navigation={navigation}/>{remote.data&&<>
 <Text style={ui.title}>{remote.data.ticket.subject}</Text><Text style={ui.muted}>{statusLabel(remote.data.ticket.status)}</Text>
 {remote.data.messages.map((item:any)=><View key={item.id} style={ui.card}><Text style={ui.link}>{item.is_mine?'شما':'پشتیبانی'}</Text><Text style={ui.text}>{item.message}</Text><Text style={ui.muted}>{localDate(item.created_at)}</Text></View>)}
 <View style={ui.row}>{page>1&&<TouchableOpacity onPress={()=>setPage(p=>p-1)}><Text style={ui.link}>پیام‌های قبلی</Text></TouchableOpacity>}{remote.data.messages.length===20&&<TouchableOpacity onPress={()=>setPage(p=>p+1)}><Text style={ui.link}>پیام‌های بعدی</Text></TouchableOpacity>}</View>
 {!['closed','resolved'].includes(remote.data.ticket.status)&&<><TextInput style={ui.input} accessibilityLabel="پیام به پشتیبانی" placeholder="پیام شما" multiline maxLength={5000} value={message} onChangeText={setMessage}/><TouchableOpacity disabled={busy||!message.trim()} style={ui.button} onPress={()=>act()}><Text style={ui.buttonText}>ارسال پیام</Text></TouchableOpacity><TouchableOpacity disabled={busy} onPress={()=>act(true)}><Text style={ui.link}>بستن درخواست</Text></TouchableOpacity></>}
 </>}</ScreenPage>;
}
