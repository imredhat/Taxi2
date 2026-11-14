import LoadingState from '../components/LoadingState';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { BlurView, BlurTargetView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import BottomNav from '../components/BottomNav';
import PointAddress from '../components/PointAddress';
import type { MapPoint } from '../components/NeshanMapPicker';
import AppHeader from '../components/AppHeader';
import { useAppData } from '../state/AppData';
import {colors, fonts, ltrLayout, rightAlignedText} from '../theme';
import { displayJalaliDate, persianDigits } from '../utils/tripDateTime';

import { passengerQuote, packageLabel, packageIcon, packagePrice, type FarePackage, type FareQuote } from '../services/packages';
import { formatRouteDuration } from '../utils/tripRoute';

export default function BookingScreen({ route, navigation }: any) {
  const { saveTrip, syncDraft, registerTrip, loaded } = useAppData();
  const tripData = route?.params || {};
  const draftId = useRef<string | undefined>(tripData.id);
  const blurTarget = useRef<View | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  useEffect(() => { draftId.current=tripData.id;setSubmitError(''); },[tripData.id]);
  const starts: MapPoint[] = tripData.starts || [];
  const ends: MapPoint[] = tripData.ends || [];
  const date = tripData.date || '';
  const time = tripData.time || '09:00';
  const personCount = tripData.personCount || 1;
  const luggageCount = tripData.luggageCount || 0;
  const bagCount = tripData.bagCount || 0;
  const [selected, setSelected] = useState(0);
  const [packages, setPackages] = useState<FarePackage[]>([]);
  const [packageError, setPackageError] = useState('');
  const [packageAttempt, setPackageAttempt] = useState(0);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [quote,setQuote]=useState<(FareQuote & {key:string})|null>(null);
  const quoteKey=JSON.stringify({starts,ends,date,time,personCount,luggageCount,bagCount,hasAnimals:!!tripData.hasAnimals,animalType:tripData.animalType||''});
  useEffect(()=>{
    let live=true;setLoadingPackages(true);setPackageError('');setQuote(null);
    passengerQuote({...tripData,starts,ends,date,time,personCount,luggageCount,bagCount}).then(result=>{if(live){setQuote({...result,key:quoteKey});setPackages(result.packages);const saved=result.packages.findIndex(item=>item.id===tripData.packageId&&item.available);setSelected(saved>=0?saved:Math.max(0,result.packages.findIndex(item=>item.available)));}})
      .catch(error=>{if(live){setPackages([]);setPackageError(error instanceof Error?error.message:'محاسبه قیمت انجام نشد.');}}).finally(()=>{if(live)setLoadingPackages(false);});
    return()=>{live=false;};
  },[quoteKey,packageAttempt]);
  useEffect(()=>{if(!quote)return;const timer=setTimeout(()=>setPackageError('اعتبار قیمت تمام شده است؛ قیمت را دوباره دریافت کنید.'),Math.max(0,Date.parse(quote.expiresAt)-Date.now()));return()=>clearTimeout(timer);},[quote?.quoteId]);
  const validQuote=!!quote&&quote.key===quoteKey&&Date.parse(quote.expiresAt)>Date.now()&&!packageError;
  const routeEstimate = quote?.key === quoteKey ? quote.route : undefined;

  const saveCurrentDraft = () => {
    const draft = { ...tripData, id: draftId.current, starts, ends, date, time, personCount, luggageCount, bagCount, hasAnimals: !!tripData.hasAnimals, vehicle: packages[selected] ? packageLabel(packages[selected]) : tripData.vehicle || '', packageId: packages[selected]?.id, quoteId:quote?.quoteId, quoteExpiresAt:quote?.expiresAt, fare:packages[selected]?.amount?{amount:packages[selected].amount!,currency:'IRR',breakdown:packages[selected].breakdown||[],warnings:packages[selected].warnings||[]}:undefined };
    const id = saveTrip(draft); draftId.current = id;
    return { ...draft, id, createdAt: tripData.createdAt || new Date().toISOString() };
  };
  const reserve = async (purpose:'deposit'|'full') => {
    if (submitting || !validQuote || !packages[selected]?.available) return;
    setSubmitting(true); setSubmitError('');
    const draft = saveCurrentDraft();
    try {
      const requestId=await registerTrip(draft);
      navigation.navigate('TripDetails', { tripId: draft.id });
      navigation.push('Payment',{purpose,requestId,autoCheckout:true});
    }
    catch (error) { setSubmitError(error instanceof Error ? error.message : 'ثبت رزرو انجام نشد.'); }
    finally { setSubmitting(false); }
  };
  const editTrip = () => navigation.navigate('Home', { editTrip: tripData });
  const vehicle = packages[selected];
  const price = vehicle?.amount ? persianDigits(packagePrice(vehicle)!.toLocaleString('en-US')) : null;
  const disabled = !loaded || submitting || !validQuote || !vehicle?.available || !starts.length || !ends.length;
  const saveDraft = async () => {
    if (disabled) return;
    setSubmitting(true);
    setSubmitError('');
    const draft = saveCurrentDraft();
    try {
      await syncDraft(draft);
      navigation.navigate('TripDetails', { tripId: draft.id });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'ذخیرهٔ پیش‌نویس انجام نشد.');
    } finally {
      setSubmitting(false);
    }
  };

  return <View style={styles.root}>
    <BlurTargetView ref={blurTarget} style={styles.flex} accessibilityElementsHidden={loadingPackages} importantForAccessibility={loadingPackages?'no-hide-descendants':'auto'}>
      <SafeAreaView style={styles.flex}>
        <AppHeader navigation={navigation} title="انتخاب ناوگان" onBack={editTrip}/>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backAction} onPress={editTrip}>
            <Icon name="arrow_back" size={18} color={colors.primary}/><Text style={styles.link}>بازگشت به اطلاعات سفر</Text>
          </TouchableOpacity>
          <View style={styles.card}>
            <Text style={styles.title}>خلاصه سفر</Text>
            {([{label:'مبدأ',point:starts[0],icon:'arrow_back'},{label:'مقصد',point:ends.at(-1),icon:'flag'}]).map(item=><View key={item.label} style={styles.addressRow}>
              <Icon name={item.icon} size={20} color={colors.primary}/>
              <View style={styles.flex}><Text style={styles.label}>{item.label}</Text><PointAddress point={item.point}/></View>
            </View>)}
            <View style={styles.infoRow}><Icon name="calendar_month" size={18} color={colors.primary}/><Text style={styles.text}>{date?displayJalaliDate(date):'تاریخ انتخاب نشده'} · {persianDigits(time)}</Text></View>
            <View style={styles.estimate}>
              <Text style={styles.label}>زمان برآوردی مسیر با ترافیک فعلی</Text>
              {!starts.length||!ends.length?<Text style={styles.text}>ابتدا مبدأ و مقصد را انتخاب کنید.</Text>:routeEstimate&&<>
                <Text style={styles.duration}>{formatRouteDuration(routeEstimate.seconds)}</Text>
                <Text style={styles.text}>مسافت: {persianDigits((routeEstimate.meters/1000).toFixed(1)).replace('.','٫')} کیلومتر</Text>
              </>}
            </View>
          </View>
          <View style={styles.sectionHead}><Text style={styles.title}>ناوگان</Text><Text style={styles.label}>قیمت‌ها به تومان</Text></View>
          {!!packageError&&<View>
            <Text accessibilityRole="alert" style={styles.text}>{packageError}</Text>
            <TouchableOpacity onPress={()=>setPackageAttempt(value=>value+1)}><Text style={styles.link}>تلاش مجدد</Text></TouchableOpacity>
            {/وارد|نشست|پیامکی/.test(packageError)&&<TouchableOpacity onPress={()=>navigation.navigate('Login')}><Text style={styles.link}>ورود به حساب</Text></TouchableOpacity>}
          </View>}
          {!loadingPackages&&!packageError&&!packages.length&&<Text style={styles.text}>پکیج فعال برای انتخاب وجود ندارد.</Text>}
          <View style={styles.fleet}>
            {packages.map((item,index)=>{
              const active=selected===index&&item.available;
              return <TouchableOpacity key={item.car_class} disabled={!item.available||submitting} accessibilityRole="button"
                accessibilityLabel={`انتخاب ${packageLabel(item)}`} accessibilityState={{selected:active,disabled:!item.available||submitting}}
                style={[styles.vehicle,active&&styles.vehicleActive]} onPress={()=>setSelected(index)}>
                <View style={styles.infoRow}><Icon name={packageIcon(item)} size={26} color={active?colors.primary:colors.onSurfaceVariant}/><Text style={styles.vehicleName}>{packageLabel(item)}</Text></View>
                <Text style={styles.spec}>{routeEstimate?.ride_type==='normal'?'سفر شهری':'سفر بین‌شهری'}</Text>
                <Text style={styles.vehiclePrice}>{item.amount?`${persianDigits(packagePrice(item)!.toLocaleString('en-US'))} تومان`:(item.warnings?.[0]||'نرخ فعال ندارد')}</Text>
              </TouchableOpacity>;
            })}
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>اطلاعات مسافران و بار</Text>
            <View style={styles.infoRow}><Icon name="person" size={20} color={colors.primary}/><Text style={styles.text}>تعداد مسافران: {persianDigits(personCount)} نفر</Text></View>
            <View style={styles.infoRow}><Icon name="luggage" size={20} color={colors.onSurfaceVariant}/><Text style={styles.text}>بار دستی: {persianDigits(luggageCount)}</Text></View>
            <View style={styles.infoRow}><Icon name="badge" size={20} color={colors.onSurfaceVariant}/><Text style={styles.text}>چمدان: {persianDigits(bagCount)}</Text></View>
            {!!tripData.hasAnimals&&<View style={styles.infoRow}><Icon name="paw" size={20} color={colors.onSurfaceVariant}/><Text style={styles.text}>حیوان همراه{tripData.animalType?`: ${tripData.animalType}`:''}</Text></View>}
            {!!tripData.notes?.trim()&&<View style={styles.addressRow}>
              <Icon name="note-text-outline" size={18} color={colors.onSurfaceVariant}/>
              <View style={styles.flex}><Text style={styles.label}>توضیحات سفر</Text><Text style={styles.text}>{tripData.notes.trim()}</Text></View>
            </View>}
            <TouchableOpacity onPress={editTrip}><Text style={styles.link}>ویرایش در صفحه اطلاعات سفر</Text></TouchableOpacity>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <View><Text style={styles.label}>برآورد کرایه طبق قوانین</Text><Text style={styles.price}>{price?`${price} تومان`:'—'}</Text></View>
          <View style={styles.footerActions}>
            {!!submitError&&<Text accessibilityRole="alert" style={styles.label}>{submitError} پیش‌نویس شما محفوظ است.</Text>}
            {!!submitError&&/وارد|نشست|پیامکی/.test(submitError)&&<TouchableOpacity onPress={()=>navigation.navigate('Login')}><Text style={styles.link}>ورود مجدد برای ثبت رزرو</Text></TouchableOpacity>}
            <TouchableOpacity accessibilityRole="button" style={[styles.reserve,disabled&&styles.disabled]} disabled={disabled} onPress={()=>reserve('deposit')}>
              <Text style={styles.reserveText}>{submitting?'در حال آماده‌سازی…':'پرداخت ۲۰٪ و ثبت رزرو'}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={()=>reserve('full')}><Text style={styles.link}>پرداخت کل کرایه و ثبت رزرو</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={saveDraft}><Text style={styles.link}>ذخیره پیش‌نویس</Text></TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <BottomNav navigation={navigation} active="home" inFlow/>
    </BlurTargetView>
    {loadingPackages&&<View style={styles.loadingOverlay} accessibilityViewIsModal>
      <BlurView {...(Platform.OS==='android'?{blurTarget,blurMethod:'dimezisBlurView' as const}:{})} intensity={55} tint="light" style={StyleSheet.absoluteFill}/>
      <View style={styles.loadingCard}><LoadingState label="در حال دریافت اطلاعات"/></View>
    </View>}
  </View>;
}

const row={...ltrLayout,flexDirection:'row-reverse' as const,alignItems:'center' as const};
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.background},
  flex:{flex:1,minWidth:0},
  body:{padding:24,gap:18},
  backAction:{...row,gap:8},
  card:{backgroundColor:colors.surfaceContainerLow,borderRadius:22,padding:16,gap:14,borderWidth:1,borderColor:colors.outlineVariant},
  title:{fontFamily:fonts.bold,fontSize:17,color:colors.onSurface,...rightAlignedText},
  label:{fontFamily:fonts.medium,fontSize:12,lineHeight:22,color:colors.onSurfaceVariant,...rightAlignedText},
  text:{fontFamily:fonts.regular,fontSize:14,lineHeight:24,color:colors.onSurface,...rightAlignedText,flexShrink:1},
  addressRow:{...row,alignItems:'flex-start',gap:10},
  infoRow:{...row,gap:8},
  estimate:{borderTopWidth:1,borderTopColor:colors.outlineVariant,paddingTop:12,gap:6},
  duration:{fontFamily:fonts.bold,fontSize:19,color:colors.primary,...rightAlignedText},
  link:{fontFamily:fonts.medium,fontSize:13,color:colors.primary,paddingVertical:8,...rightAlignedText},
  sectionHead:{...row,justifyContent:'space-between'},
  fleet:{...row,alignItems:'stretch',flexWrap:'wrap',gap:10},
  vehicle:{width:'48%',flexGrow:1,backgroundColor:colors.surfaceContainerLow,borderRadius:18,padding:12,gap:6,borderWidth:1,borderColor:colors.outlineVariant},
  vehicleActive:{borderColor:colors.primary,backgroundColor:colors.secondaryContainer},
  vehicleName:{fontFamily:fonts.bold,fontSize:14,color:colors.onSurface},
  spec:{fontFamily:fonts.regular,fontSize:11,color:colors.onSurfaceVariant,...rightAlignedText},
  vehiclePrice:{fontFamily:fonts.bold,fontSize:14,color:colors.primary,...rightAlignedText},
  footer:{...row,justifyContent:'space-between',flexWrap:'wrap',gap:12,padding:16,backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:colors.outlineVariant,borderTopLeftRadius:28,borderTopRightRadius:28,flexShrink:0},
  footerActions:{flex:1,gap:8},
  price:{fontFamily:fonts.bold,fontSize:21,color:colors.primary,...rightAlignedText},
  reserve:{backgroundColor:colors.primary,paddingHorizontal:20,paddingVertical:14,borderRadius:18},
  reserveText:{fontFamily:fonts.bold,color:colors.onPrimary,fontSize:16},
  disabled:{opacity:0.4},
  loadingOverlay:{...StyleSheet.absoluteFill,zIndex:100,alignItems:'center',justifyContent:'center',padding:24,backgroundColor:'rgba(248,250,249,0.18)'},
  loadingCard:{width:'100%',maxWidth:340,minHeight:310,justifyContent:'center',backgroundColor:'rgba(255,255,255,0.86)',borderWidth:1,borderColor:'rgba(255,255,255,0.95)',borderRadius:28,padding:24},
});
