import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import BottomNav from '../components/BottomNav';
import { colors, fonts } from '../theme';

const vehicles = [
  {
    name: 'ECO',
    price: '۱,۲۵۰,۰۰۰',
    persons: 4,
    luggage: 2,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVpTSbAhhyKSVDZmztAvPo50BKNznwW2uMtwYsr7j5u6vaQAiXALUxoCfhZmwDJ2loYspd_SEbK1HKUYmaMZwizTAJzfVBdShcrE0RRK1WaZ-0eV4jtlYbyJZ8WPAdmyjpjnuAUg3pAfSdNV22bU6xButZ284yfZwI67RwljMePSBqziwZ3u5aRAFZZmH048nvbove0YVwS6vgcK5o8BlRx05SeoThe4C1anH2VQiDbwqyeiW4do2jPQ',
  },
  {
    name: 'ECO+',
    price: '۱,۴۸۰,۰۰۰',
    persons: 4,
    luggage: 3,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArrS5ruMhnkdgBKVqTmuPhfvNsSZi2LhMGLJwT33u9pYbpzQL6d4K8GHcSJvxvRX5GtrWvlSHNv8QL8l2NpXT1hWxUsRmIqpavWD3X7av55dowQd5axMtKRIQjPDcvlsbsiw0c2Ud7-olVjdGk-gqisriyYJ2YF6_6lnBACkPtQQTxzl8CH2TJR9HQDOhy2wFrPk9J_RRKQshVQVRKTcPfs27uNCKSX4ANGILYpdNvvyxVc8MVDKD25Q',
  },
  {
    name: 'VIP',
    price: '۲,۱۰۰,۰۰۰',
    persons: 3,
    luggage: 3,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8TeK__1xKSVmDmuXeKUSctG99WmcrlWSu0ALuqPr9-mdCgGp8md6s35zCitwtxf6N9E4aqYlr82NjrylxaElOPvxdh1KSSiQnf87R524PZDwQNkXATZ8suJZWBJNAYwg6zDE09fcYViSTcVdgCddJZ--X3ud58jzx0OO1fXnvYVVyMePH0-zplWx1MCmpIFjfRr16F2lcYv1xdz-QlF1VYTJuC_XHwZXnELD8i_lFfYYxOU55BekMNA',
  },
  {
    name: 'VIP SUV',
    price: '۳,۵۰۰,۰۰۰',
    persons: 6,
    luggage: 5,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzWZ5iqkSMYD8doB0ElymGt88ogJZi1F7nKhAiIVLxKcbvj_CXqDMvXG9hlHYB2zJ4QmyLDu8oaoCGJ6Xc5tRFhWlWt-wPahFn8xMxbwdtJucjh-_iE-bhs5Uoc2xVNe5k2UKCm8MkK6IQMhGlTGx77G4Bf486hACkp786B6MZdtLwKj18XXWlmkBnsw0nFIT-EYr5XU5yAVzzCKznomACo3jRCiKOtrkaQX9-jRM9fnhfyDozB_bcYA',
  },
];

export default function BookingScreen({ route, navigation }: any) {
  const tripData = route?.params || {};
  const starts = tripData.starts || [];
  const ends = tripData.ends || [];
  const date = tripData.date || '';
  const time = tripData.time || '09:00';
  const personCount = tripData.personCount || 1;
  const luggageCount = tripData.luggageCount || 1;
  const bagCount = tripData.bagCount || 0;
  const hasAnimals = tripData.hasAnimals || false;

  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(personCount);
  const price = vehicles[selected].price;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <View style={styles.avatar}>
              <Icon name="person" size={20} color={colors.primary} />
            </View>
            <TouchableOpacity>
              <Icon name="notifications" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.brand}>پویش تاکسی</Text>
          <TouchableOpacity>
            <Icon name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.journeyCard}>
            <View style={styles.journeyTop}>
              <Text style={styles.journeyEnd}>مبدأ: {starts.length > 0 ? starts.map((p: any) => p.label).join(' • ') : '—'}</Text>
              <Text style={styles.journeyEnd}>مقصد: {ends.length > 0 ? ends.map((p: any) => p.label).join(' • ') : '—'}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '35%' }]} />
              <View style={[styles.progressDot, { right: 0 }]} />
              <View style={[styles.progressPulse, { right: '35%' }]} />
              <View style={[styles.progressDot, { left: 0 }]} />
            </View>
            <View style={styles.journeyMeta}>
              <View style={styles.metaItem}>
                <Icon name="schedule" size={16} color={colors.primary} />
                <Text style={styles.metaText}>{time}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="calendar_month" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.metaText}>{date || 'تاریخ انتخاب نشده'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>انتخاب ناوگان</Text>
              <Text style={styles.sectionUnit}>واحد: تومان</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fleet}>
              {vehicles.map((v, i) => (
                <TouchableOpacity
                  key={v.name}
                  style={[styles.vehicle, selected === i && styles.vehicleActive]}
                  activeOpacity={0.9}
                  onPress={() => setSelected(i)}
                >
                  <Image source={{ uri: v.img }} style={styles.vehicleImg} resizeMode="contain" />
                  <Text style={styles.vehicleName}>{v.name}</Text>
                  <View style={styles.vehicleSpecs}>
                    <View style={styles.spec}>
                      <Icon name="person" size={14} color={colors.onSurfaceVariant} />
                      <Text style={styles.specText}>{v.persons}</Text>
                    </View>
                    <View style={styles.spec}>
                      <Icon name="luggage" size={14} color={colors.onSurfaceVariant} />
                      <Text style={styles.specText}>{v.luggage}</Text>
                    </View>
                  </View>
                  <Text style={styles.vehiclePrice}>{v.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.details}>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>تاریخ و ساعت حرکت</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailValue}>{date ? `${date} - ${time}` : time}</Text>
                <Icon name="calendar_month" size={20} color={colors.primary} />
              </View>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>تعداد مسافران</Text>
              <View style={styles.detailRow}>
                <TouchableOpacity
                  style={styles.countBtn}
                  onPress={() => setCount((c) => Math.max(1, c - 1))}
                >
                  <Text style={styles.countSign}>-</Text>
                </TouchableOpacity>
                <Text style={styles.countValue}>{count}</Text>
                <TouchableOpacity
                  style={styles.countBtn}
                  onPress={() => setCount((c) => Math.min(8, c + 1))}
                >
                  <Text style={styles.countSign}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            {(luggageCount > 0 || bagCount > 0 || hasAnimals) && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>مشخصات بار و حیوان</Text>
                <Text style={styles.detailValue}>
                  {luggageCount > 0 && `بار دستی: ${luggageCount}`}
                  {luggageCount > 0 && bagCount > 0 && ' | '}
                  {bagCount > 0 && `چمدان: ${bagCount}`}
                  {hasAnimals && (
                    <>
                      {luggageCount > 0 || bagCount > 0 ? ' | ' : ''}
                      {`حیوان همراه`}
                    </>
                  )}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.safetyBanner}>
            <View style={styles.safetyIcon}>
              <Icon name="verified_user" size={20} color={colors.white} />
            </View>
            <View style={styles.safetyText}>
              <Text style={styles.safetyTitle}>امنیت شما اولویت ماست</Text>
              <Text style={styles.safetySub}>
                تمامی رانندگان احراز هویت شده و خودروها دارای بیمه کامل سفر هستند.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.reserveFooter}>
          <View style={styles.reservePrice}>
            <Text style={styles.reserveLabel}>مبلغ نهایی</Text>
            <View style={styles.reserveAmount}>
              <Text style={styles.reserveValue}>{price}</Text>
              <Text style={styles.reserveUnit}>تومان</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.reserveBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Tracking')}
          >
            <Text style={styles.reserveText}>تایید و رزرو</Text>
            <Icon name="chevron_left" size={22} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        <BottomNav navigation={navigation} active="trips" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(3,21,30,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  brand: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, letterSpacing: -0.5 },
  body: { paddingTop: 20, paddingBottom: 200, paddingHorizontal: 20 },
  journeyCard: {
    backgroundColor: colors.asphaltSurface,
    borderRadius: 12,
    padding: 24,
    gap: 16,
    marginBottom: 32,
  },
  journeyTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    fontFamily: fonts.regular,
  },
  journeyEnd: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  progressTrack: {
    position: 'relative',
    height: 8,
    width: '100%',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    marginTop: 8,
  },
  progressFill: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressDot: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  progressPulse: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.background,
  },
  journeyMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: fonts.regular, fontSize: 16, color: colors.onSurface },
  section: { marginBottom: 32 },
  sectionHead: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.onSurface },
  sectionUnit: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  fleet: { gap: 16, paddingHorizontal: 4 },
  vehicle: {
    width: 160,
    backgroundColor: colors.asphaltSurface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  vehicleActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(246,183,60,0.08)',
  },
  vehicleImg: { height: 96, width: '100%' },
  vehicleName: { fontFamily: fonts.bold, fontSize: 16, color: colors.onSurface },
  vehicleSpecs: { flexDirection: 'row-reverse', gap: 8 },
  spec: { flexDirection: 'row-reverse', alignItems: 'center', gap: 2 },
  specText: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  vehiclePrice: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
  details: { flexDirection: 'row-reverse', gap: 16, marginBottom: 32 },
  detailCard: {
    flex: 1,
    backgroundColor: colors.asphaltSurface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  detailLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailValue: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,216,153,0.3)',
    paddingBottom: 8,
  },
  countBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countSign: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  countValue: { fontFamily: fonts.bold, fontSize: 24, color: colors.onSurface },
  safetyBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(30,122,101,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(30,122,101,0.3)',
    borderRadius: 12,
    padding: 16,
  },
  safetyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.safetyTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyText: { flex: 1 },
  safetyTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.onSurface },
  safetySub: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  reserveFooter: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: colors.asphaltSurface,
    paddingHorizontal: 20,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    zIndex: 50,
  },
  reservePrice: { flexDirection: 'column' },
  reserveLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  reserveAmount: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 },
  reserveValue: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary },
  reserveUnit: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryFixedDim },
  reserveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 28,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  reserveText: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },
});
