import {vehicleClassLabel} from '../services/packages';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import LoadingState from './LoadingState';
import { colors, fonts, ltrLayout } from '../theme';
import { statusLabel } from '../utils/display';
import { persianDigits } from '../utils/tripDateTime';

export interface AssignedRide {
 id: string; status: string; driver_first_name?: string; driver_last_name?: string; driver_phone?: string | null;
 vehicle_model?: string; color?: string; license_plate?: string; car_class?: string; unread_count?: number;
}
export default function ReservationStatus({ status, ride, vehicle, onTrack, onCall }: { status: string; ride?: AssignedRide | null; vehicle: string; onTrack: () => void; onCall?: () => void }) {
 const callable = !!onCall && /^\+?[0-9]{8,15}$/.test(ride?.driver_phone || '');
 const searching = !ride && ['pending', 'searching'].includes(status);
 const awaitingDeposit = status === 'awaiting_deposit';
 const ended = ['cancelled', 'expired', 'failed'].includes(status);
 const className = vehicleClassLabel(ride?.car_class || vehicle);
 return <>
  <View style={[styles.hero, ended && styles.ended]}>
   <View style={styles.badge}><Icon name={ended||awaitingDeposit ? 'information-outline' : 'check-circle-outline'} size={16} color={ended ? colors.errorRed : colors.primary}/><Text style={[styles.badgeText, ended && { color: colors.errorRed }]}>{ended ? statusLabel(status) : awaitingDeposit?'تکمیل رزرو':'رزرو شما ثبت شد'}</Text></View>
   {searching ? <LoadingState label="در حال جستجوی راننده"/> : <View style={styles.state}><View style={styles.stateIcon}><Icon name={ended ? 'close-circle-outline' : status === 'completed' ? 'check-circle-outline' : 'car-connected'} size={48} color={ended ? colors.errorRed : colors.primary}/></View><Text style={styles.title}>{statusLabel(status)}</Text></View>}
   <Text style={styles.description}>{awaitingDeposit?'پس از تأیید پیش‌پرداخت، درخواست برای رانندگان نمایش داده می‌شود.':searching ? 'درخواست شما ثبت شده؛ در انتظار پذیرش راننده هستیم.' : ended ? 'برای برنامه‌ریزی دوباره، از سفرهای من درخواست جدیدی ثبت کنید.' : ride ? 'اطلاعات راننده و خودرو در ادامه نمایش داده می‌شود.' : 'پس از تخصیص راننده، مشخصات او همین‌جا نمایش داده می‌شود.'}</Text>
   {searching && <View style={styles.live}><View style={styles.liveDot}/><Text style={styles.liveText}>وضعیت به‌صورت خودکار به‌روز می‌شود</Text></View>}
  </View>
  {!ended && (ride ? <View style={styles.driverCard}>
   <View style={styles.row}><View style={styles.avatar}><Icon name="person" size={32} color={colors.primary}/></View><View style={{flex:1,gap:4}}><Text style={styles.caption}>رانندهٔ سفر شما</Text><Text style={styles.driverName}>{[ride.driver_first_name,ride.driver_last_name].filter(Boolean).join(' ') || 'در حال دریافت مشخصات راننده'}</Text></View><Text style={styles.classBadge}>{className}</Text></View>
   <View style={styles.vehicleRow}><Icon name="car-side" size={28} color={colors.primary}/><View style={{flex:1}}><Text style={styles.vehicleName}>{ride.vehicle_model || 'مدل خودرو هنوز اعلام نشده'}</Text><Text style={styles.caption}>{ride.color || 'رنگ خودرو هنوز اعلام نشده'}</Text></View></View>
   {!!ride.license_plate && <View style={styles.plate}><Text style={styles.plateText}>{persianDigits(ride.license_plate)}</Text></View>}
   <View style={styles.contactActions}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="گفتگو با راننده" style={styles.trackButton} onPress={onTrack}><Icon name="chat-outline" size={19} color={colors.primary}/><Text style={styles.trackText}>گفتگو{(ride.unread_count||0)>0?` (${persianDigits(ride.unread_count!)})`:null}</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={callable?'تماس با راننده':'شماره تماس راننده در دسترس نیست'} accessibilityState={{disabled:!callable}} disabled={!callable} style={[styles.trackButton,!callable&&{opacity:0.4}]} onPress={onCall}><Icon name="call" size={19} color={colors.primary}/><Text style={styles.trackText}>تماس</Text></TouchableOpacity>
   </View>
  </View> : <View style={styles.placeholder}><View style={styles.placeholderIcon}><Icon name="car-side" size={28} color={colors.onSurfaceVariant}/></View><View style={{flex:1,gap:4}}><Text style={styles.vehicleName}>راننده و خودروی سفر</Text><Text style={styles.caption}>پس از پذیرش، مشخصات راننده، خودرو و کلاس آن اینجا ظاهر می‌شود.</Text></View></View>)}
 </>;
}
const styles=StyleSheet.create({
 hero:{backgroundColor:'#eaf8f4',borderWidth:1,borderColor:'#d7eee6',borderRadius:28,padding:22,alignItems:'center'},
 ended:{backgroundColor:colors.surfaceDim,borderColor:colors.outlineVariant},
 badge:{flexDirection:'row-reverse',gap:6,alignItems:'center',paddingHorizontal:12,paddingVertical:7,backgroundColor:colors.surface,borderRadius:20},
 badgeText:{fontFamily:fonts.medium,fontSize:11,color:colors.primary},
 title:{fontFamily:fonts.bold,fontSize:20,color:colors.onSurface,textAlign:'center'},
 description:{fontFamily:fonts.regular,fontSize:12,lineHeight:24,color:colors.onSurfaceVariant,textAlign:'center'},
 live:{flexDirection:'row-reverse',gap:6,alignItems:'center',marginTop:16},liveDot:{width:6,height:6,borderRadius:3,backgroundColor:colors.primary},liveText:{fontFamily:fonts.regular,fontSize:10,color:colors.primary},
 state:{alignItems:'center',gap:16,paddingVertical:24},stateIcon:{width:88,height:88,borderRadius:32,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},
 placeholder:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',gap:12,padding:16,borderWidth:1,borderStyle:'dashed',borderColor:colors.outline,borderRadius:20},placeholderIcon:{width:44,height:44,alignItems:'center',justifyContent:'center'},
 driverCard:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.outlineVariant,borderRadius:24,padding:18,gap:14},
 row:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',gap:10},avatar:{width:52,height:52,borderRadius:18,backgroundColor:colors.secondaryContainer,alignItems:'center',justifyContent:'center'},
 driverName:{fontFamily:fonts.bold,fontSize:16,color:colors.onSurface,textAlign:'right'},caption:{fontFamily:fonts.regular,fontSize:11,lineHeight:21,color:colors.onSurfaceVariant,textAlign:'right'},
 classBadge:{fontFamily:fonts.bold,fontSize:11,color:colors.primary,backgroundColor:colors.secondaryContainer,borderRadius:10,padding:8,overflow:'hidden'},
 vehicleRow:{...ltrLayout,flexDirection:'row-reverse',alignItems:'center',gap:12,paddingTop:14,borderTopWidth:1,borderTopColor:colors.outlineVariant},vehicleName:{fontFamily:fonts.medium,fontSize:13,color:colors.onSurface,textAlign:'right'},
 plate:{alignSelf:'center',borderWidth:1,borderColor:colors.outline,borderRadius:8,paddingVertical:8,paddingHorizontal:24},plateText:{fontFamily:fonts.bold,fontSize:18,color:colors.onSurface,textAlign:'center'},
 contactActions:{...ltrLayout,flexDirection:'row-reverse',gap:10},
 trackButton:{flex:1,...ltrLayout,flexDirection:'row-reverse',alignItems:'center',justifyContent:'center',gap:8,minHeight:44,backgroundColor:colors.secondaryContainer,borderRadius:14},trackText:{fontFamily:fonts.bold,fontSize:12,color:colors.primary},
});
