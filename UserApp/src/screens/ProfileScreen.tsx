import React,{useEffect,useState} from 'react';
import {Text,TextInput,TouchableOpacity,View,StyleSheet} from 'react-native';
import {toGregorian,toJalaali} from 'jalaali-js';
import JalaliDatePicker from '../components/JalaliDatePicker';
import {Icon} from '../components/Icon';
import {colors,fonts,ltrLayout} from '../theme';
import {ScreenPage,MenuRow,ui} from '../components/ScreenPage';
import ApiFeedback from '../components/ApiFeedback';
import {passengerApi} from '../services/passenger';
import {useRemote} from '../services/useRemote';
import {useAppData} from '../state/AppData';
import {persianDigits,parseJalaliDate,serializeJalaliDate,padTwo} from '../utils/tripDateTime';
import {asciiDigits} from '../utils/display';
export default function ProfileScreen({navigation}:any){
 const {updateProfile}=useAppData(),remote=useRemote(()=>passengerApi.profile());
 const [first,setFirst]=useState(''),[last,setLast]=useState(''),[email,setEmail]=useState(''),[gender,setGender]=useState<string|null>(null),[birth,setBirth]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 useEffect(()=>{if(!remote.data)return;const p=remote.data.profile;setFirst(p.first_name||'');setLast(p.last_name||'');setEmail(p.email||'');setGender(p.gender);if(p.birth_date){const [y,m,d]=p.birth_date.slice(0,10).split('-').map(Number);setBirth(serializeJalaliDate(toJalaali(y,m,d)));}else setBirth('');},[remote.data]);
 const save=async()=>{if(busy)return;setBusy(true);setError('');setSaved(false);try{let birth_date=null;if(birth.trim()){const date=parseJalaliDate(asciiDigits(birth));if(!date)throw new Error('تاریخ تولد را از تقویم انتخاب کنید.');const g=toGregorian(date.jy,date.jm,date.jd);birth_date=`${g.gy}-${padTwo(g.gm)}-${padTwo(g.gd)}`;}const result=await passengerApi.updateProfile({first_name:first.trim(),last_name:last.trim(),email:email.trim()||null,gender,birth_date});remote.setData({...result,profile:{...result.profile,rating:remote.data?.profile.rating}});updateProfile([first.trim(),last.trim()].filter(Boolean).join(' '));setSaved(true);}catch(err){setError((err as Error).message);}finally{setBusy(false);}};
 return <ScreenPage navigation={navigation} title="حساب کاربری" active="profile"><ApiFeedback loading={remote.loading} error={remote.error} retry={remote.reload} navigation={navigation}/>{remote.data&&<View style={ui.card}><Text style={ui.title}>اطلاعات شخصی</Text><Text style={ui.text}>امتیاز مسافر · ★ {persianDigits(remote.data.profile.rating??5)} از ۵</Text><View style={styles.phoneCard}><View style={styles.phoneIcon}><Icon name="smartphone" size={24} color={colors.primary}/></View><View style={{flex:1,gap:4}}><Text style={ui.muted}>شماره همراه</Text><Text selectable style={styles.phoneNumber}>{persianDigits(remote.data.profile.phone)}</Text></View></View><TextInput style={ui.input} accessibilityLabel="نام" placeholder="نام" value={first} onChangeText={setFirst} maxLength={100}/><TextInput style={ui.input} accessibilityLabel="نام خانوادگی" placeholder="نام خانوادگی" value={last} onChangeText={setLast} maxLength={100}/><TextInput style={ui.input} accessibilityLabel="ایمیل" placeholder="ایمیل" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} maxLength={255}/><JalaliDatePicker label="تاریخ تولد" purpose="birthday" disabled={busy} value={birth} onChange={setBirth}/>
 <View accessibilityRole="radiogroup" style={styles.genderGroup}>{[{value:'male',label:'آقا',icon:'gender-male'},{value:'female',label:'خانم',icon:'gender-female'},{value:null,label:'مشخص نشده',icon:'minus-circle-outline'}].map(option=><TouchableOpacity key={option.value||'none'} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{checked:gender===option.value}} disabled={busy} style={[styles.genderOption,gender===option.value&&styles.genderSelected]} onPress={()=>setGender(option.value)}><Icon name={option.icon} size={20} color={gender===option.value?colors.primary:colors.onSurfaceVariant}/><Text style={[styles.genderText,gender===option.value&&styles.genderTextSelected]}>{option.label}</Text></TouchableOpacity>)}</View>{!!error&&<Text accessibilityRole="alert" style={styles.saveError}>{error}</Text>}<TouchableOpacity disabled={busy||!first.trim()} style={[ui.button,(busy||!first.trim())&&{opacity:0.5}]} onPress={save}><Text style={ui.buttonText}>{busy?'در حال ذخیره…':'ذخیره اطلاعات'}</Text></TouchableOpacity>{saved&&<Text style={ui.link}>اطلاعات ذخیره شد.</Text>}</View>}<View style={ui.card}><MenuRow label="آدرس‌های من" icon="bookmark-outline" onPress={()=>navigation.navigate('Addresses')}/><MenuRow label="سفرهای من" icon="route" onPress={()=>navigation.navigate('Trips')}/><MenuRow label="کیف پول" icon="account_balance_wallet" onPress={()=>navigation.navigate('Wallet')}/><MenuRow label="تنظیمات" icon="settings" onPress={()=>navigation.navigate('Settings')}/></View></ScreenPage>;
}

const styles=StyleSheet.create({
 saveError:{fontFamily:fonts.regular,fontSize:12,lineHeight:22,color:colors.errorRed,textAlign:'right'},
 phoneCard:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',gap:12,backgroundColor:colors.secondaryContainer,borderRadius:18,padding:16},
 phoneIcon:{width:44,height:44,borderRadius:15,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},
 phoneNumber:{fontFamily:fonts.bold,fontSize:20,color:colors.onSurface,textAlign:'right',writingDirection:'ltr'},
 genderGroup:{...ltrLayout,flexDirection:'row-reverse',gap:6,padding:4,borderRadius:16,backgroundColor:colors.surfaceDim},
 genderOption:{flex:1,minHeight:64,borderRadius:12,alignItems:'center',justifyContent:'center',gap:6,borderWidth:1,borderColor:'transparent'},
 genderSelected:{backgroundColor:colors.surface,borderColor:colors.primary},genderText:{fontFamily:fonts.medium,fontSize:11,color:colors.onSurfaceVariant},genderTextSelected:{color:colors.primary,fontFamily:fonts.bold},
});
