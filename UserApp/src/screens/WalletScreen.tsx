import React,{useState} from 'react';
import {Text,TextInput,TouchableOpacity,View,StyleSheet} from 'react-native';
import {ScreenPage,EmptyState,ui} from '../components/ScreenPage';
import ApiFeedback from '../components/ApiFeedback';
import {Icon} from '../components/Icon';
import {colors,fonts, ltrLayout} from '../theme';
import {passengerApi} from '../services/passenger';
import {useRemote} from '../services/useRemote';
import {asciiDigits,localDate,statusLabel,toman} from '../utils/display';
export default function WalletScreen({navigation}:any){
 const [page,setPage]=useState(1),[amount,setAmount]=useState(''),[tab,setTab]=useState<'transactions'|'payments'>('transactions');
 const remote=useRemote(async()=>({wallet:(await passengerApi.wallet()).wallet,...await(tab==='payments'?passengerApi.payments(page):passengerApi.transactions(page))}),`${page}:${tab}`);
 return <ScreenPage navigation={navigation} title="کیف پول" active="wallet"><ApiFeedback {...remote} retry={remote.reload} navigation={navigation}/>
 {remote.data&&<View style={ui.hero}><Text style={ui.heroText}>موجودی قابل استفاده</Text><Text style={ui.heroTitle}>{toman(remote.data.wallet.available_balance)} تومان</Text><Text style={ui.heroText}>موجودی کل: {toman(remote.data.wallet.balance)} تومان</Text><Text style={ui.heroText}>مبلغ مسدود: {toman(remote.data.wallet.frozen_balance)} تومان</Text></View>}
 <View style={ui.card}><Text style={ui.title}>شارژ کیف پول با سامان</Text><TextInput style={ui.input} accessibilityLabel="مبلغ شارژ به تومان" placeholder="مبلغ به تومان" keyboardType="number-pad" value={amount.replace(/\B(?=(\d{3})+(?!\d))/g,',')} onChangeText={value=>setAmount(asciiDigits(value).replace(/\D/g,'').replace(/^0+(?=\d)/,'').slice(0,10))}/><TouchableOpacity disabled={!/^[1-9]\d*$/.test(amount)} style={ui.button} onPress={()=>navigation.navigate('Payment',{purpose:'topup',amount:(BigInt(amount)*10n).toString()})}><Text style={ui.buttonText}>ادامه پرداخت</Text></TouchableOpacity></View>
 <View style={styles.tabs}>{([
  {key:'transactions',label:'تراکنش‌ها',icon:'swap-horizontal'},
  {key:'payments',label:'پرداخت‌های بانکی',icon:'credit-card-outline'},
 ] as const).map(item=><TouchableOpacity key={item.key} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{selected:tab===item.key}} style={[styles.tab,tab===item.key&&styles.activeTab]} onPress={()=>{setTab(item.key);setPage(1);}}><Icon name={item.icon} size={20} color={tab===item.key?colors.primary:colors.onSurfaceVariant}/><Text style={[styles.tabText,tab===item.key&&styles.activeText]}>{item.label}</Text></TouchableOpacity>)}</View>
 {remote.data?.items.map((item:any)=><TouchableOpacity key={item.id} disabled={tab==='transactions'} style={ui.card} onPress={()=>navigation.navigate('Payment',{paymentId:item.id})}><Text style={ui.title}>{toman(item.amount)} تومان</Text><Text style={ui.text}>{tab==='payments'?`${item.purpose==='topup'?'شارژ کیف پول':item.purpose==='deposit'?'پیش‌پرداخت رزرو':item.purpose==='full'?'پرداخت کامل رزرو':'پرداخت سفر'} · ${statusLabel(item.status)}`:item.description_fa||item.description||'تراکنش کیف پول'}</Text><Text style={ui.muted}>{localDate(item.created_at)}</Text></TouchableOpacity>)}
 {remote.data&&!remote.data.items.length&&<EmptyState title="موردی ثبت نشده است" message="سوابق مالی حساب شما در این بخش نمایش داده می‌شوند."/>}
 <View style={ui.row}>{page>1&&<TouchableOpacity onPress={()=>setPage(p=>p-1)}><Text style={ui.link}>صفحه قبل</Text></TouchableOpacity>}{remote.data?.items.length===20&&<TouchableOpacity onPress={()=>setPage(p=>p+1)}><Text style={ui.link}>صفحه بعد</Text></TouchableOpacity>}</View>
 </ScreenPage>;
}

const styles=StyleSheet.create({
 tabs:{...ltrLayout,flexDirection:'row-reverse',backgroundColor:colors.surfaceContainerHigh,borderRadius:16,padding:4,gap:4},
 tab:{flex:1,minHeight:48,borderRadius:12,flexDirection:'row-reverse',alignItems:'center',justifyContent:'center',gap:6,paddingHorizontal:8},
 activeTab:{backgroundColor:colors.surface},
 tabText:{fontFamily:fonts.medium,fontSize:12,color:colors.onSurfaceVariant},
 activeText:{fontFamily:fonts.bold,color:colors.primary},
});
