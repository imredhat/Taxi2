import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenPage, ui } from '../components/ScreenPage';
import { Icon } from '../components/Icon';
import { colors, fonts } from '../theme';

export default function LandingScreen({ navigation }: any) {
  return <ScreenPage navigation={navigation} title="سفر بین‌شهری" guest>
    <View style={styles.mapPreview}>
      <View style={styles.roadHorizontal} />
      <View style={styles.roadVertical} />
      <View style={styles.routeLine} />
      <View style={styles.origin}><Icon name="location_on" size={30} color={colors.primary} /></View>
      <View style={styles.destination}><Icon name="flag" size={28} color="#ff9f1a" /></View>
      <View style={styles.car}><Icon name="local_taxi" size={48} color="#6e4b00" /></View>
      <View style={styles.safety}><Icon name="verified_user" size={18} color={colors.primary} /><Text style={styles.safetyText}>همراه امن مسیر تو</Text></View>
    </View>
    <Text style={styles.title}>سفرهای دور، با خیال راحت</Text>
    <Text style={ui.muted}>مبدأ و مقصدت را انتخاب کن، زمان حرکت را مشخص کن و با ناوگان مناسب خودت به جاده بزن.</Text>
    <View style={styles.benefits}>
      {[['verified_user', 'سفری امن'], ['route', 'مسیر دلخواه'], ['account_balance_wallet', 'قیمت شفاف']].map(([icon, label]) => <View key={label} style={styles.benefit}><Icon name={icon} size={24} color={colors.primary} /><Text style={styles.benefitText}>{label}</Text></View>)}
    </View>
    <TouchableOpacity style={ui.button} onPress={() => navigation.navigate('Home')}><Text style={ui.buttonText}>شروع درخواست سفر</Text></TouchableOpacity>
  </ScreenPage>;
}
const styles = StyleSheet.create({
  mapPreview: { height: 260, borderRadius: 28, backgroundColor: '#d9f1ea', overflow: 'hidden', position: 'relative' },
  roadHorizontal: { position: 'absolute', left: -20, right: -20, top: 110, height: 28, backgroundColor: '#f3f5ec', transform: [{ rotate: '-18deg' }] },
  roadVertical: { position: 'absolute', top: -30, bottom: -30, left: 110, width: 28, backgroundColor: '#f3f5ec', transform: [{ rotate: '22deg' }] },
  routeLine: { position: 'absolute', top: 60, right: 60, width: 180, height: 115, borderTopWidth: 4, borderRightWidth: 4, borderColor: colors.primary, borderTopRightRadius: 60, borderStyle: 'dashed' },
  origin: { position: 'absolute', right: 45, top: 40, width: 48, height: 48, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  destination: { position: 'absolute', left: 36, bottom: 65, width: 48, height: 48, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  car: { position: 'absolute', left: '45%', top: 110, width: 68, height: 58, backgroundColor: '#ffbe4d', borderRadius: 20, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  safety: { position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row-reverse', gap: 8, alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 20 },
  safetyText: { fontFamily: fonts.medium, fontSize: 11, color: colors.primary },
  title: { fontFamily: fonts.extraBold, fontSize: 26, lineHeight: 42, color: colors.onSurface, textAlign: 'right' },
  benefits: { flexDirection: 'row-reverse', gap: 8, paddingVertical: 8 },
  benefit: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 18, paddingVertical: 16, alignItems: 'center', gap: 10 },
  benefitText: { fontFamily: fonts.medium, fontSize: 11, color: colors.onSurfaceVariant },
});
