import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import BottomNav from '../components/BottomNav';
import { colors, fonts } from '../theme';

const MAP = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDspFIxnQtAQPXyVa2m6frgLRARLs-JtLkSN--NAyHYCAEStVgdnlOvYgjggbtRsaPxaBtpW2C_FIEeiA6_zC1gXS400xQjpdTKu0y7yUMfYTBPiulAOdE5JXKrY5W0DODd3k-VFKDVcuY1Pdy9vzwApv8l5PkUmZdRyBBgeYDA7O1hUsrAYnjRJsBjho3Sizpapox4hxnJTcccVyxltE7Zs7n9WJBeLO_2FJ9i40N3nrlRBIIWt1hR6w';
const DRIVER = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGKtcjLHe8CzkvzYRejdWfCeFwpITnhzeHBKCKOVthQdcl8Ya0bvQz6Pfn6vRdcB5wqaZT_OGzUC1gUo631n27KwOquURRAxoxkmdkfBFQG1MDlhrqEVRzQfCh61oEF1ExJiemwf9Zx4u1kMIpCFp4-SPGekVJ_HIIw9ZqX6oQbG3ekvb2InTmDX6phCc7EXtzXrvnzhGji-I4CawneaJzYoiqKDohltt5emRwkT5eFJpPxtHwqU67OA';

export default function TrackingScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="menu" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.brand}>پویش تاکسی</Text>
          <View style={styles.headerRight}>
            <View style={styles.avatar}>
              <Icon name="person" size={20} color={colors.primary} />
            </View>
            <TouchableOpacity>
              <Icon name="notifications" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mapWrap}>
          <ImageBackground
            source={{ uri: MAP }}
            style={styles.map}
            imageStyle={{ opacity: 0.4 }}
          />
          <View style={styles.mapCenter}>
            <View style={styles.ping} />
            <View style={styles.taxi}>
              <Icon name="local_taxi" size={20} color={colors.onPrimaryContainer} />
            </View>
          </View>
          <TouchableOpacity style={styles.sos} activeOpacity={0.9}>
            <View style={styles.sosIcon}>
              <Icon name="emergency_home" size={28} color={colors.error} />
            </View>
            <Text style={styles.sosText}>کمک اضطراری</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.canvas} showsVerticalScrollIndicator={false}>
          <View style={styles.progressBlock}>
            <View style={styles.progressTop}>
              <View style={styles.progressCol}>
                <Text style={styles.progressLabel}>زمان تخمینی رسیدن</Text>
                <Text style={styles.progressValue}>۱۲:۴۵</Text>
              </View>
              <View style={[styles.progressCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.progressLabel}>باقی‌مانده</Text>
                <Text style={[styles.progressValue, { color: colors.onSurface }]}>۱۸ دقیقه</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '65%' }]} />
              <View style={[styles.progressTip, { right: '65%' }]} />
            </View>
            <View style={styles.progressEnds}>
              <View style={styles.endItem}>
                <Icon name="location_on" size={14} color={colors.onSurfaceVariant} />
                <Text style={styles.endText}>میدان ونک</Text>
              </View>
              <View style={styles.endItem}>
                <Text style={styles.endText}>تجریش</Text>
                <Icon name="flag" size={14} color={colors.onSurfaceVariant} />
              </View>
            </View>
          </View>

          <View style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <ImageBackground source={{ uri: DRIVER }} style={styles.driverImg} />
                <View style={styles.verifiedBadge}>
                  <Icon name="verified" size={14} color={colors.white} />
                </View>
              </View>
              <View>
                <Text style={styles.driverName}>علیرضا محمدی</Text>
                <Text style={styles.driverCar}>پژو ۲۰۰۸ • مشکی متالیک</Text>
                <View style={styles.plate}>
                  <Text style={styles.plateText}>۴۴ ب ۳۵۴ | ۱۱</Text>
                </View>
              </View>
            </View>
            <View style={styles.driverActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="call" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="chat" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.safetyGrid}>
            <View style={[styles.safetyCard, styles.safetyWide]}>
              <View style={styles.safetyWideInner}>
                <Icon name="shield_with_heart" size={22} color={colors.safetyTeal} />
                <Text style={styles.safetyWideText}>سفر شما تحت پوشش بیمه است</Text>
              </View>
              <View style={styles.safetyActive}>
                <Text style={styles.safetyActiveText}>فعال</Text>
              </View>
            </View>
            <View style={styles.safetyCard}>
              <Icon name="verified_user" size={32} color={colors.primary} />
              <Text style={styles.safetyLabel}>راننده تایید شده</Text>
            </View>
            <View style={styles.safetyCard}>
              <Icon name="support_agent" size={32} color={colors.primary} />
              <Text style={styles.safetyLabel}>پشتیبانی زنده</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.95}>
            <Icon name="share" size={22} color={colors.onPrimaryContainer} />
            <Text style={styles.shareText}>اشتراک‌گذاری زنده مسیر سفر</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav navigation={navigation} active="trips" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(3,21,30,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 30,
  },
  brand: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapWrap: { height: '50%', position: 'relative', backgroundColor: colors.surfaceContainer },
  map: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  mapCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ping: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,216,153,0.2)',
  },
  taxi: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sos: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    alignItems: 'center',
    gap: 8,
  },
  sosIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.2)',
  },
  sosText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.error,
    backgroundColor: 'rgba(3,21,30,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  canvas: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -48,
    paddingTop: 32,
    paddingBottom: 110,
    paddingHorizontal: 20,
    gap: 24,
    zIndex: 30,
  },
  progressBlock: { gap: 16 },
  progressTop: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  progressCol: { alignItems: 'flex-start' },
  progressLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  progressValue: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary },
  progressTrack: {
    position: 'relative',
    height: 8,
    width: '100%',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { position: 'absolute', right: 0, top: 0, height: '100%', backgroundColor: colors.primary },
  progressTip: {
    position: 'absolute',
    top: '50%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    transform: [{ translateY: -8 }],
  },
  progressEnds: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  endItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  endText: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  driverCard: {
    backgroundColor: colors.asphaltSurface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  driverInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  driverAvatar: { position: 'relative' },
  driverImg: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden' },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.safetyTeal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.asphaltSurface,
  },
  driverName: { fontFamily: fonts.bold, fontSize: 18, color: colors.onSurface },
  driverCar: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  plate: {
    backgroundColor: 'rgba(255,216,153,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,216,153,0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  plateText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, letterSpacing: 2 },
  driverActions: { flexDirection: 'row-reverse', gap: 8 },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  safetyGrid: { flexDirection: 'row-reverse', gap: 12 },
  safetyCard: {
    backgroundColor: colors.asphaltSurface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flex: 1,
  },
  safetyWide: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexBasis: '100%',
    backgroundColor: 'rgba(30,122,101,0.1)',
    borderColor: 'rgba(30,122,101,0.3)',
  },
  safetyWideInner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  safetyWideText: { fontFamily: fonts.bold, fontSize: 16, color: colors.safetyTeal },
  safetyActive: {
    backgroundColor: colors.safetyTeal,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  safetyActiveText: { fontFamily: fonts.regular, fontSize: 12, color: colors.white },
  safetyLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurface, textAlign: 'center' },
  shareBtn: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareText: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimaryContainer },
});
