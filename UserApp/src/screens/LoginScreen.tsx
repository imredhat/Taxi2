import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { colors, fonts } from '../theme';
import { storage } from '../storage';

const BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrPnFxCPWTFJ3aAkuWGHR57egnTjwvOlW94Q5ZF28C9rqSv2kxyy8WZbBLb_4OB_dqx-q_RnFBBmWJHkbgjgWzDaCpjyBjL8dKIi2oVWeqapPEldC5gHNN2HrGNXP_MKpSxq25HiXFdBngq6T32Cgk-8i7xvtCb-ocKHMEbfSKbhvT52dKtqUW41SDpSmlZHw6rFUWyqTaG5WLU3d1Gf4UpEq7ayB0skAaRr2HLAci2q649DsRkK4Zsg';

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');

  useEffect(() => {
    (async () => {
      const token = await storage.getItem('auth_token');
      if (token) navigation.replace('Home');
    })();
  }, []);

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: BG }} style={styles.bg} blurRadius={2}>
        <View style={styles.bgOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Icon name="local_taxi" size={48} color={colors.primaryContainer} style={styles.logo} />
            <Text style={styles.brand}>پویش تاکسی</Text>
            <Text style={styles.tagline}>سفرهای امن و حرفه‌ای بین شهری</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>خوش آمدید</Text>
              <Text style={styles.cardSub}>
                برای ورود یا ثبت‌نام شماره همراه خود را وارد کنید
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>شماره موبایل</Text>
              <View style={styles.inputWrap}>
                <Icon name="smartphone" size={22} color={colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
                  placeholder="09123456789"
                  placeholderTextColor="rgba(212,196,174,0.4)"
                  keyboardType="phone-pad"
                  maxLength={11}
                  textAlign="right"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Otp', { phone })}
            >
              <Text style={styles.ctaText}>درخواست کد تایید</Text>
              <Icon name="arrow_back" size={22} color={colors.onPrimaryContainer} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.terms} activeOpacity={0.7}>
              <Icon name="gavel" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.termsText}>قوانین و مقررات را می‌پذیرم</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Icon name="verified_user" size={20} color={colors.onSurfaceVariant} />
              <Text style={styles.footerText}>امنیت تضمین شده</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerItem}>
              <Icon name="history_edu" size={20} color={colors.onSurfaceVariant} />
              <Text style={styles.footerText}>پشتیبانی ۲۴ ساعته</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.midnightRoad },
  bg: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  bgOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7,26,35,0.6)',
  },
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 48,
  },
  logo: { marginBottom: 16 },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: 'rgba(212,196,174,0.8)',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(22,37,45,0.8)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 24,
  },
  cardHead: { gap: 8 },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
  },
  cardSub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  field: { gap: 8 },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginRight: 4,
  },
  inputWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(7,26,35,0.5)',
    borderRadius: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(157,143,123,0.3)',
    height: 56,
    overflow: 'hidden',
  },
  inputIcon: { paddingHorizontal: 12 },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.bold,
    fontSize: 18,
    paddingHorizontal: 12,
    textAlign: 'right',
  },
  cta: {
    height: 56,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.onPrimaryContainer,
  },
  terms: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  termsText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingBottom: 40,
    marginTop: 'auto',
    opacity: 0.6,
  },
  footerItem: { alignItems: 'center', gap: 4 },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  footerDivider: { width: 1, height: 28, backgroundColor: 'rgba(157,143,123,0.2)' },
});
