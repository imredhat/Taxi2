import React from 'react';
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
import BottomNav from '../components/BottomNav';
import { colors, fonts } from '../theme';

const BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuADvRARnB2GgTsJ7QmEIWQG9tpF32e7QEggTWdIOjyDaVtxK_GVVHXAyyP2_2YW0SN1eo9h9QoWgudCPRFTAzAGfgluj3shJ_rW-9VC1penVFFpwN5PcmMU8PjxA1LGUg08J5YUKSxWJ3L8kVfcvaUet8HQOEzVvViRKeOHokTmW3RbaKlteKZYr8yIDx4VUUZQXsZ6_Hqf_L9Iqtu8aMfTTvTGPma1-1Pr2wG6gxoWOhRKw7lXxD0nMg';
const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuATruN0_w8MlxU4FiQalcM2r2kh-0zYQn3_79qaaCbppI656p5-Fu_W9XyFIWVaUnoy9bh2JZ-W8gozKsVv97-CBhtG1SlpqIdbZji9Ok-EEfxAb-RGmq05UAeXnDQVL394UMGwasDSxEjKEP_QVEVew3H7tW5p5Ggeu6Z48SW_mRnd-48afa-TA-QhpCuX1Bje0GXH3Q-ztUgIgzvNYWfXIiRJDP-b74DAsHH3jT2fFSnv6Rlbym7jZw';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: BG }} style={styles.bg} blurRadius={2}>
        <View style={styles.bgOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <ImageBackground source={{ uri: AVATAR }} style={styles.avatarImg} />
          </View>
          <Text style={styles.brand}>پویش تاکسی</Text>
          <TouchableOpacity>
            <Icon name="notifications" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              مسیرت را بگو،{'\n'}
              <Text style={styles.heroAccent}>تا رسیدن همراهت هستیم</Text>
            </Text>
            <View style={styles.heroLine} />
          </View>

          <View style={styles.bookingCard}>
            <View style={styles.path}>
              <View style={styles.pathLine}>
                <View style={[styles.dot, styles.dotOrigin]} />
                <View style={[styles.dot, styles.dotDest]} />
              </View>
              <View style={styles.pathInputs}>
                <View style={styles.field}>
                  <Text style={styles.label}>از کجا؟</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="مبدا سفر شما"
                    placeholderTextColor="rgba(212,196,174,0.4)"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>به کجا؟</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="مقصد را انتخاب کنید"
                    placeholderTextColor="rgba(212,196,174,0.4)"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startBtn}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Booking')}
            >
              <Icon name="route" size={22} color={colors.onPrimary} />
              <Text style={styles.startText}>شروع سفر</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.features}>
            <TouchableOpacity style={[styles.feat, styles.featWide]} activeOpacity={0.9}>
              <View style={styles.featWideInner}>
                <View style={[styles.featIcon, { backgroundColor: 'rgba(246,183,60,0.2)' }]}>
                  <Icon name="security" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.featTitle}>سفر بیمه شده</Text>
                  <Text style={styles.featSub}>امنیت شما اولویت ماست</Text>
                </View>
              </View>
              <Icon name="chevron_left" size={22} color="rgba(255,216,153,0.5)" />
            </TouchableOpacity>

            <View style={styles.featRow}>
              <View style={styles.feat}>
                <View style={[styles.featIconSm, { backgroundColor: 'rgba(1,79,108,0.3)' }]}>
                  <Icon name="support_agent" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.featTitleSm}>پشتیبانی ۲۴/۷</Text>
                <Text style={styles.featSubSm}>در هر لحظه همراهتان</Text>
              </View>
              <View style={styles.feat}>
                <View style={[styles.featIconSm, { backgroundColor: 'rgba(99,206,255,0.2)' }]}>
                  <Icon name="verified_user" size={20} color={colors.tertiary} />
                </View>
                <Text style={styles.featTitleSm}>رانندگان حرفه‌ای</Text>
                <Text style={styles.featSubSm}>تایید هویت شده</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <BottomNav navigation={navigation} active="home" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  bg: StyleSheet.absoluteFill,
  bgOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3,21,30,0.5)',
  },
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,216,153,0.2)',
    backgroundColor: colors.asphaltSurface,
  },
  avatarImg: { width: '100%', height: '100%' },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  body: { paddingTop: 24, paddingBottom: 110, paddingHorizontal: 20, alignItems: 'center' },
  hero: { width: '100%', marginBottom: 32, alignItems: 'flex-end' },
  heroTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 44,
    color: colors.onSurface,
    textAlign: 'right',
  },
  heroAccent: { color: colors.primary },
  heroLine: { width: 64, height: 4, backgroundColor: colors.primary, borderRadius: 2, marginTop: 16 },
  bookingCard: {
    width: '100%',
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 32,
  },
  path: { flexDirection: 'row-reverse', gap: 16 },
  pathLine: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  dotOrigin: { backgroundColor: colors.safetyTeal, borderColor: 'rgba(255,255,255,0.2)' },
  dotDest: { backgroundColor: colors.errorRed, borderColor: 'rgba(255,255,255,0.2)' },
  pathInputs: { flex: 1, gap: 24, paddingRight: 8 },
  field: { gap: 4 },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.onSurfaceVariant },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    color: colors.onSurface,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  startBtn: {
    marginTop: 16,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },
  features: { width: '100%', gap: 16 },
  feat: {
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featWide: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  featWideInner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  featIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.onSurface },
  featSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  featRow: { flexDirection: 'row-reverse', gap: 16 },
  featIconSm: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featTitleSm: { fontFamily: fonts.bold, fontSize: 12, color: colors.onSurface },
  featSubSm: { fontFamily: fonts.regular, fontSize: 10, color: colors.onSurfaceVariant },
});
