import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { colors, fonts } from '../theme';

const BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPEZNFu1GEgNXlENusQltWLY9ZQJEViki89IlA_eFkNpTSLovWqE6aYQTmTFw-hLs4ghiB0-FQWpzbvish717K-lyVKrAaRGrsySmHW7eNj45cqufyRmpGVDjh72zJ4sHCQyuVHfuLImsOXYG_ZADHnPOzOakt0k8JNZ4GzLKl6PFMUrCEQIrp1Oa3oyXEOz-NIKayA3nGt3jZy1g2d8noXki2yHfEzUzDBkOLexv_SX_vg9rmK7IfQQ';

const drawerItems = [
  { icon: 'account_balance_wallet', label: 'کیف پول' },
  { icon: 'support_agent', label: 'پشتیبانی' },
  { icon: 'settings', label: 'تنظیمات' },
  { icon: 'gavel', label: 'قوانین' },
];

export default function LandingScreen({ navigation }: any) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: BG }} style={styles.bg} blurRadius={2}>
        <View style={styles.vignette} />
      </ImageBackground>

      {open && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.overlayDark} />
        </TouchableOpacity>
      )}

      <View style={[styles.drawer, open ? styles.drawerOpen : styles.drawerClosed]}>
        <View style={styles.drawerHead}>
          <View style={styles.drawerProfile}>
            <View style={styles.drawerAvatar}>
              <Icon name="person" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.drawerName}>کاربر پویش</Text>
              <Text style={styles.drawerRole}>عضویت طلایی</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
            <Icon name="close" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
        <View style={styles.drawerNav}>
          {drawerItems.map((it) => (
            <TouchableOpacity key={it.label} style={styles.drawerItem} activeOpacity={0.7}>
              <Icon name={it.icon} size={22} color={colors.onSurfaceVariant} />
              <Text style={styles.drawerItemText}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.drawerItem, styles.logout]} activeOpacity={0.7}>
          <Icon name="logout" size={22} color={colors.errorRed} />
          <Text style={[styles.drawerItemText, { color: colors.errorRed }]}>خروج</Text>
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headBtn} onPress={() => setOpen(true)}>
            <Icon name="menu" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.brand}>پویش تاکسی</Text>
          <View style={styles.headRight}>
            <View style={styles.avatarSm}>
              <Icon name="person" size={18} color={colors.onPrimaryContainer} />
            </View>
            <TouchableOpacity style={styles.headBtn}>
              <Icon name="notifications" size={24} color={colors.onSurfaceVariant} />
              <View style={styles.dot} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              مسیرت را بگو،{'\n'}تا رسیدن همراهت هستیم
            </Text>
            <Text style={styles.heroSub}>
              سفری امن، آرام و حرفه‌ای در جاده‌های ایران با ناوگان اختصاصی پویش
            </Text>
          </View>

          <View style={styles.inquiry}>
            <View style={styles.inquiryGrid}>
              <View style={styles.fieldWrap}>
                <Text style={styles.floatLabel}>مبدا</Text>
                <View style={styles.field}>
                  <Icon name="location_on" size={20} color={colors.onSurfaceVariant} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="کجا هستید؟"
                    placeholderTextColor="rgba(212,196,174,0.4)"
                  />
                </View>
              </View>
              <View style={styles.fieldWrap}>
                <Text style={styles.floatLabel}>مقصد</Text>
                <View style={styles.field}>
                  <Icon name="flag" size={20} color={colors.onSurfaceVariant} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="کجا می‌روید؟"
                    placeholderTextColor="rgba(212,196,174,0.4)"
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.startBtn}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.startText}>شروع سفر</Text>
              <Icon name="trending_flat" size={22} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <View style={styles.navItemActive}>
            <Icon name="home" size={24} color={colors.primary} />
            <Text style={[styles.navLabel, { color: colors.primary, fontFamily: fonts.bold }]}>خانه</Text>
          </View>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Booking')}>
            <Icon name="route" size={24} color={colors.onSurfaceVariant} />
            <Text style={styles.navLabel}>سفرهای من</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
            <Icon name="person" size={24} color={colors.onSurfaceVariant} />
            <Text style={styles.navLabel}>پروفایل</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  bg: StyleSheet.absoluteFill,
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3,21,30,0.85)',
  },
  flex: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, zIndex: 55 },
  overlayDark: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 320,
    backgroundColor: colors.surfaceContainer,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
    zIndex: 60,
    padding: 16,
  },
  drawerOpen: { transform: [{ translateX: 0 }] },
  drawerClosed: { transform: [{ translateX: 320 }] },
  drawerHead: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    padding: 8,
  },
  drawerProfile: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  drawerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.asphaltSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerName: { fontFamily: fonts.bold, fontSize: 16, color: colors.onSurface },
  drawerRole: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  closeBtn: { padding: 8, borderRadius: 20 },
  drawerNav: { flex: 1, gap: 8 },
  drawerItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  drawerItemText: { fontFamily: fonts.regular, fontSize: 16, color: colors.onSurfaceVariant },
  logout: { marginTop: 'auto' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
  },
  headBtn: { padding: 8, position: 'relative' },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  headRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  avatarSm: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.errorRed,
  },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 },
  hero: { alignItems: 'center', marginTop: 32, marginBottom: 40 },
  heroTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 44,
    color: colors.onSurface,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 32,
    color: 'rgba(210,229,242,0.8)',
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 420,
  },
  inquiry: {
    width: '100%',
    backgroundColor: 'rgba(22,37,45,0.9)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inquiryGrid: { gap: 16, marginBottom: 24 },
  fieldWrap: { position: 'relative' },
  floatLabel: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: colors.asphaltSurface,
    paddingHorizontal: 4,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.primary,
  },
  field: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,216,153,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldInput: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  startBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.asphaltSurface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 12,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navItemActive: { flex: 1, alignItems: 'center', gap: 4 },
  navLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.onSurfaceVariant },
});
