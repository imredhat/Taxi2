import LoadingState from '../components/LoadingState';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenPage, EmptyState, ui } from '../components/ScreenPage';
import { Icon } from '../components/Icon';
import {colors, fonts, ltrLayout} from '../theme';
import { statusLabel } from '../utils/display';
import { useAppData } from '../state/AppData';
import { persianDigits, displayJalaliDate } from '../utils/tripDateTime';
const statusAppearance: Record<string,{color:string;background:string;icon:string}> = {
 cancelled:{color:'#b42318',background:'#fff1f0',icon:'close-circle-outline'},
 failed:{color:'#b42318',background:'#fff1f0',icon:'alert-circle-outline'},
 completed:{color:'#166534',background:'#ecfdf3',icon:'check-circle-outline'},
 in_progress:{color:'#1d4ed8',background:'#eff6ff',icon:'car-side'},
 accepted:{color:'#07846c',background:'#eaf8f4',icon:'check-decagram-outline'},
 arriving:{color:'#1d4ed8',background:'#eff6ff',icon:'car-clock'},
 arrived:{color:'#1d4ed8',background:'#eff6ff',icon:'map-marker-check-outline'},
 pending:{color:'#92400e',background:'#fff5d6',icon:'clock-outline'},
 awaiting_deposit:{color:'#92400e',background:'#fff5d6',icon:'clock-outline'},
 searching:{color:'#92400e',background:'#fff5d6',icon:'radar'},
 expired:{color:'#64748b',background:'#f1f5f9',icon:'clock-remove-outline'},
 draft:{color:'#64748b',background:'#f1f5f9',icon:'file-document-edit-outline'},
};
export default function TripsScreen({ navigation }: any) {
 const { data, loaded, refresh } = useAppData(); const [error,setError]=useState('');const [query, setQuery] = useState<'all' | 'drafts' | 'reserved'>('all');
 useEffect(()=>{const load=()=>refresh().then(()=>setError('')).catch(err=>setError((err as Error).message));load();return navigation.addListener('focus',load);},[navigation]);
 return <ScreenPage navigation={navigation} title="سفرهای من" active="trips">
  <View style={styles.toolbar}>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="پیگیری سفر و اطلاعات راننده" style={styles.tracking} onPress={()=>navigation.navigate('Tracking')}><Icon name="map-marker-path" size={20} color={colors.primary}/><Text style={styles.trackingText}>پیگیری سفر</Text></TouchableOpacity>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="به‌روزرسانی سفرها" style={styles.refresh} onPress={async()=>{try{await refresh();setError('');}catch(err){setError(err instanceof Error?err.message:'دریافت سفرها انجام نشد.');}}}><Icon name="refresh" size={22} color={colors.primary}/></TouchableOpacity>
  </View>
  {!!error&&<Text accessibilityRole="alert" style={ui.text}>{error}</Text>}
  <View style={styles.tabs}>{([
   {key:'all',label:'همه سفرها',icon:'format-list-bulleted'},
   {key:'drafts',label:'پیش‌نویس',icon:'file-document-edit-outline'},
   {key:'reserved',label:'رزروها',icon:'calendar-check-outline'},
  ] as const).map(tab => <TouchableOpacity key={tab.key} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{selected:query===tab.key}} style={[styles.tab,query===tab.key&&styles.activeTab]} onPress={()=>setQuery(tab.key)}><Icon name={tab.icon} size={19} color={query===tab.key?colors.primary:colors.onSurfaceVariant}/><Text style={[styles.tabText,query===tab.key&&styles.activeText]}>{tab.label}</Text></TouchableOpacity>)}</View>
  {!loaded ? <LoadingState label="در حال دریافت سفرها…" /> : !data.trips.length ? <EmptyState title="هنوز سفری ندارید" message="با انتخاب مبدا و مقصد، اطلاعات اولین سفر بین‌شهری خود را آماده کنید." /> : data.trips.filter(trip=>query==='all'||(query==='reserved'?trip.status==='reserved':trip.status!=='reserved')).map(trip=>{const status=trip.status==='reserved'?(trip.serverStatus||'pending'):'draft';const appearance=statusAppearance[status]||statusAppearance.draft;return <TouchableOpacity key={trip.id} style={[ui.card,{borderRightWidth:3,borderRightColor:appearance.color}]} onPress={()=>navigation.navigate('TripDetails',{tripId:trip.id})}>
   <View style={[styles.statusBadge,{backgroundColor:appearance.background}]}><Icon name={appearance.icon} size={16} color={appearance.color}/><Text style={[styles.statusText,{color:appearance.color}]}>{status==='draft'?'پیش‌نویس':statusLabel(status)}</Text></View>
   <Text style={ui.text}>مبدا: {persianDigits(trip.starts[0]?.address || 'آدرس انتخاب‌شده')}</Text>
   <Text style={ui.text}>مقصد: {persianDigits(trip.ends[trip.ends.length-1]?.address || 'آدرس انتخاب‌شده')}</Text>
   <View style={styles.tripMeta}>
    <View style={styles.metaChip}><Icon name="calendar-month-outline" size={15} color={colors.primary}/><Text style={styles.metaText}>{trip.date?displayJalaliDate(trip.date):'تاریخ تعیین نشده'}</Text></View>
    <View style={styles.metaChip}><Icon name="clock-outline" size={15} color={colors.primary}/><Text style={styles.metaText}>{persianDigits(trip.time)}</Text></View>
    <View style={styles.metaChip}><Icon name="account-outline" size={15} color={colors.primary}/><Text style={styles.metaText}>{persianDigits(trip.personCount)} مسافر</Text></View>
   </View>
  </TouchableOpacity>;})}
  <TouchableOpacity style={ui.button} onPress={()=>navigation.navigate('Home', { newTrip: true })}><Text style={ui.buttonText}>درخواست سفر جدید</Text></TouchableOpacity>
 </ScreenPage>;
}

const styles = StyleSheet.create({
 tripMeta:{...ltrLayout,flexDirection:'row-reverse',flexWrap:'wrap',gap:6},
 metaChip:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',gap:5,paddingHorizontal:8,paddingVertical:7,borderRadius:10,backgroundColor:colors.surfaceDim},
 metaText:{fontFamily:fonts.medium,fontSize:10,color:colors.onSurfaceVariant},
 statusBadge:{...ltrLayout,flexDirection:'row-reverse',alignSelf:'flex-end',alignItems:'center',gap:6,paddingHorizontal:10,paddingVertical:6,borderRadius:12},
 statusText:{fontFamily:fonts.bold,fontSize:12},
 toolbar: { ...ltrLayout, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
 tracking: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, minHeight: 44 },
 trackingText: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
 refresh: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
 tabs: { ...ltrLayout, flexDirection: 'row-reverse', backgroundColor: colors.surfaceContainerHigh, borderRadius: 16, padding: 4, gap: 4 },
 tab: { flex: 1, minHeight: 48, borderRadius: 12, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 4 },
 activeTab: { backgroundColor: colors.surface },
 tabText: { fontFamily: fonts.medium, fontSize: 11, color: colors.onSurfaceVariant },
 activeText: { fontFamily: fonts.bold, color: colors.primary },
});
