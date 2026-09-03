import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import BottomNav from '../components/BottomNav';
import { colors, fonts } from '../theme';

const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqMRFxR1KDm710PPvVcyPhHyA2eLACmN_dUCZ9Y9u6hy22REM-n-9S4xpW21TViYQPbVMpIEDZtLOeKrarlFeYFi98n5d0WiB4zREkvnWPk_1clXy8nQClWbhJ5QBKUF641Yw9GyXbUYlqKTH01JBkfZZUTg65EDuCrGb1Wgk8qot4StgGo_Rxz0iiqIwY7FPtC3em0Tp07HoKf5M8yOFAuQP3YXUQ2W2P5HX2EjTkz5SYSWyK4hRKoA';

export default function ProfileScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.brand}>پویش تاکسی</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headBtn}>
              <Icon name="notifications" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <ImageBackground source={{ uri: AVATAR }} style={styles.avatarImg} />
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.identity}>
            <View style={styles.avatarRing}>
              <ImageBackground source={{ uri: AVATAR }} style={styles.identityImg} />
              <View style={styles.goldBadge}>
                <Text style={styles.goldText}>عضویت طلایی</Text>
              </View>
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name}>کاربر پویش</Text>
              <Text style={styles.phone}>0912 345 6789</Text>
            </View>
          </View>

          <View style={styles.wallet}>
            <View>
              <Text style={styles.walletLabel}>موجودی کیف پول</Text>
              <View style={styles.walletAmount}>
                <Text style={styles.walletValue}>۱,۴۵۰,۰۰۰</Text>
                <Text style={styles.walletUnit}>تومان</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.chargeBtn} activeOpacity={0.9}>
              <Icon name="add_card" size={20} color={colors.onPrimary} />
              <Text style={styles.chargeText}>شارژ کیف پول</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.history}>
            <View style={styles.historyHead}>
              <Text style={styles.historyTitle}>تاریخچه آخرین سفرها</Text>
              <TouchableOpacity>
                <Text style={styles.historyAll}>مشاهده همه</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.trip} activeOpacity={0.9}>
              <View style={styles.tripLeft}>
                <View style={styles.tripIcon}>
                  <Icon name="route" size={22} color={colors.primary} />
                </View>
                <View>
                  <View style={styles.tripCities}>
                    <Text style={styles.tripCity}>تهران</Text>
                    <Icon name="arrow_back" size={14} color={colors.onSurfaceVariant} />
                    <Text style={styles.tripCity}>اصفهان</Text>
                  </View>
                  <Text style={styles.tripDate}>۱۴ اردیبهشت ۱۴۰۳ • ساعت ۱۸:۳۰</Text>
                </View>
              </View>
              <View style={styles.tripRight}>
                <Text style={styles.tripPrice}>۴۵۰,۰۰۰ تومان</Text>
                <View style={styles.tripDone}>
                  <Text style={styles.tripDoneText}>تکمیل شده</Text>
                  <Icon name="check_circle" size={18} color={colors.safetyTeal} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trip} activeOpacity={0.9}>
              <View style={styles.tripLeft}>
                <View style={styles.tripIcon}>
                  <Icon name="commute" size={22} color={colors.primary} />
                </View>
                <View>
                  <View style={styles.tripCities}>
                    <Text style={styles.tripCity}>شیراز</Text>
                    <Icon name="arrow_back" size={14} color={colors.onSurfaceVariant} />
                    <Text style={styles.tripCity}>یزد</Text>
                  </View>
                  <Text style={styles.tripDate}>۰۹ اردیبهشت ۱۴۰۳ • ساعت ۰۷:۱۵</Text>
                </View>
              </View>
              <View style={styles.tripRight}>
                <Text style={styles.tripPrice}>۳۸۰,۰۰۰ تومان</Text>
                <View style={styles.tripDone}>
                  <Text style={styles.tripDoneText}>تکمیل شده</Text>
                  <Icon name="check_circle" size={18} color={colors.safetyTeal} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <Icon name="gavel" size={22} color={colors.onSurfaceVariant} />
                <Text style={styles.menuText}>قوانین و مقررات</Text>
              </View>
              <Icon name="chevron_left" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <Icon name="shield_person" size={22} color={colors.onSurfaceVariant} />
                <Text style={styles.menuText}>حقوق مسافر</Text>
              </View>
              <Icon name="chevron_left" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={[styles.menuItem, styles.logout]} activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <Icon name="logout" size={22} color={colors.errorRed} />
                <Text style={[styles.menuText, { color: colors.errorRed, fontFamily: fonts.bold }]}>
                  خروج از حساب کاربری
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <BottomNav navigation={navigation} active="profile" />
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
    paddingHorizontal: 24,
    height: 64,
    backgroundColor: 'rgba(3,21,30,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  brand: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  headBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.asphaltSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  body: { paddingTop: 24, paddingBottom: 110, paddingHorizontal: 24, gap: 32 },
  identity: { alignItems: 'center', gap: 16 },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 4,
    position: 'relative',
  },
  identityImg: { width: '100%', height: '100%', borderRadius: 52 },
  goldBadge: {
    position: 'absolute',
    bottom: -4,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  goldText: { fontFamily: fonts.bold, fontSize: 10, color: colors.onPrimary },
  identityText: { alignItems: 'center', gap: 4 },
  name: { fontFamily: fonts.bold, fontSize: 24, color: colors.onSurface },
  phone: { fontFamily: fonts.regular, fontSize: 16, color: colors.onSurfaceVariant, letterSpacing: 2 },
  wallet: {
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  walletAmount: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 8 },
  walletValue: { fontFamily: fonts.bold, fontSize: 28, color: colors.primary },
  walletUnit: { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,216,153,0.7)' },
  chargeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  chargeText: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
  history: { gap: 16 },
  historyHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 8 },
  historyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.onSurface },
  historyAll: { fontFamily: fonts.regular, fontSize: 12, color: colors.primary },
  trip: {
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  tripIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCities: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  tripCity: { fontFamily: fonts.bold, fontSize: 16, color: colors.onSurface },
  tripDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  tripRight: { alignItems: 'flex-end', gap: 4 },
  tripPrice: { fontFamily: fonts.bold, fontSize: 16, color: colors.onSurface },
  tripDone: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  tripDoneText: { fontFamily: fonts.regular, fontSize: 12, color: colors.safetyTeal },
  menu: { gap: 8, paddingTop: 16 },
  menuItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  menuLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  menuText: { fontFamily: fonts.regular, fontSize: 16, color: colors.onSurface },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16 },
  logout: { backgroundColor: 'rgba(201,60,55,0.1)' },
});
