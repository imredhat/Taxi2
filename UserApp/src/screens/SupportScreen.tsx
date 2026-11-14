import React,{useState} from 'react';
import {Text,TextInput,TouchableOpacity,View} from 'react-native';
import {ScreenPage,EmptyState,ui} from '../components/ScreenPage';
import ApiFeedback from '../components/ApiFeedback';
import {useRemote} from '../services/useRemote';
import {passengerApi} from '../services/passenger';
import {localDate,statusLabel} from '../utils/display';
export default function SupportScreen({navigation,route}:any){
 const [page,setPage]=useState(1),[subject,setSubject]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const guest=!!route?.params?.guest;
 const remote=useRemote(async()=>({faq:await passengerApi.content('faq'),tickets:guest?{items:[]}:await passengerApi.tickets(page)}),`${page}:${guest}`);
 const create=async()=>{if(busy)return;setBusy(true);setError('');try{const result=await passengerApi.createTicket(subject,message,route?.params?.rideId);setSubject('');setMessage('');navigation.navigate('Ticket',{ticketId:result.ticket.id});remote.reload();}catch(err){setError((err as Error).message);}finally{setBusy(false);}};
 return <ScreenPage navigation={navigation} title="پشتیبانی و راهنما" guest={guest}>
 <ApiFeedback {...remote} retry={remote.reload} navigation={navigation}/>
 <Text style={ui.title}>پرسش‌های متداول</Text>
 {remote.data?.faq.items.map((item:any)=><View key={item.slug} style={ui.card}><Text style={ui.title}>{item.title_fa||item.title}</Text><Text style={ui.text}>{item.content_fa||item.content}</Text></View>)}
 {remote.data&&!remote.data.faq.items.length&&<Text style={ui.muted}>پرسش متداولی منتشر نشده است. برای دریافت راهنمایی تیکت ثبت کنید.</Text>}
 {guest?<TouchableOpacity style={ui.button} onPress={()=>navigation.navigate('Login')}><Text style={ui.buttonText}>ورود برای ارتباط با پشتیبانی</Text></TouchableOpacity>:<>
 <View style={ui.card}><Text style={ui.title}>درخواست پشتیبانی جدید</Text><TextInput accessibilityLabel="موضوع درخواست" style={ui.input} placeholder="موضوع" value={subject} maxLength={255} onChangeText={setSubject}/><TextInput accessibilityLabel="متن درخواست" style={ui.input} placeholder="پیام شما" value={message} multiline maxLength={5000} onChangeText={setMessage}/><ApiFeedback loading={false} error={error} retry={()=>setError('')} navigation={navigation}/><TouchableOpacity disabled={busy||!subject.trim()||!message.trim()} style={[ui.button,{opacity:busy||!subject.trim()||!message.trim()?0.5:1}]} onPress={create}><Text style={ui.buttonText}>{busy?'در حال ارسال…':'ثبت درخواست'}</Text></TouchableOpacity></View>
 <Text style={ui.title}>درخواست‌های من</Text>
 {remote.data?.tickets.items.map((item:any)=><TouchableOpacity key={item.id} style={ui.card} onPress={()=>navigation.navigate('Ticket',{ticketId:item.id})}><Text style={ui.title}>{item.subject}</Text><Text style={ui.muted}>{statusLabel(item.status)} · {localDate(item.updated_at)}</Text></TouchableOpacity>)}
 {remote.data&&!remote.data.tickets.items.length&&<EmptyState title="درخواستی ندارید" message="پیام‌های شما و پاسخ پشتیبانی اینجا نمایش داده می‌شود."/>}
 <View style={ui.row}>{page>1&&<TouchableOpacity onPress={()=>setPage(p=>p-1)}><Text style={ui.link}>صفحه قبل</Text></TouchableOpacity>}{remote.data?.tickets.items.length===20&&<TouchableOpacity onPress={()=>setPage(p=>p+1)}><Text style={ui.link}>صفحه بعد</Text></TouchableOpacity>}</View>
 </>}
 <TouchableOpacity onPress={()=>navigation.navigate('About',{guest})}><Text style={ui.link}>درباره و قوانین</Text></TouchableOpacity>
 </ScreenPage>;
}
