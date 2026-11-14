import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { Icon } from '../components/Icon';
import {colors, fonts, ltrLayout, rightAlignedText} from '../theme';
import { apiPost } from '../services/api';
import { mobileDigits, domesticMobile } from '../utils/phone';
import { isSessionToken, storage } from '../storage';


export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [sending,setSending]=useState(false);const [error,setError]=useState('');
  const send = async () => {
    if(sending)return;const domesticPhone=domesticMobile(phone);if(!domesticPhone){setError('شماره همراه ۱۰ رقمی را بدون صفر وارد کنید.');return;}
    setSending(true);setError('');
    try{const result=await apiPost('/api/otp/send',{phone:domesticPhone});navigation.navigate('Otp',{phone:domesticPhone,userId:result.userId});}
    catch(err){setError(err instanceof Error?err.message:'ارسال کد انجام نشد.');}finally{setSending(false);}
  };

  useEffect(() => {
    (async () => {
      const token = await storage.getItem('auth_token');
      if (isSessionToken(token)) navigation.replace('Home');
    })();
  }, []);

  return (
    <View style={styles.root}>

      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <AppHeader navigation={navigation} title="ورود به حساب کاربری" guest />

          <ScrollView contentContainerStyle={styles.authBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.brandTile}></View>
              <Text style={styles.cardTitle}>شماره موبایل خود را وارد کنید</Text>
              <Text style={styles.cardSub}>
                کد تأیید برای همین شماره ارسال می‌شود.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>شماره موبایل</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.countryCode}>+98</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={(t) => setPhone(mobileDigits(t))}
                  placeholder="9123456789"
                  placeholderTextColor={colors.onSurfaceVariant}
                  keyboardType="phone-pad"
                  maxLength={14}
                  textAlign="left"
                  accessibilityLabel="شماره موبایل"
                />
              </View>
            </View>

            {!!error&&<Text accessibilityRole="alert" style={[styles.cardSub,{color:colors.errorRed}]}>{error}</Text>}
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.9}
              onPress={send}
              disabled={sending}
            >
              <Text style={styles.ctaText}>{sending?'در حال ارسال...':'درخواست کد تایید'}</Text>
              <Icon name="arrow_back" size={22} color={colors.onPrimaryContainer} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.terms} activeOpacity={0.7} onPress={() => navigation.navigate('About', { guest: true })}>
              <Icon name="gavel" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.termsText}>درباره برنامه و حریم خصوصی</Text>
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  authBody: { flexGrow: 1, padding: 24, gap: 32 },
  card: { gap: 24 },
  cardHead: { gap: 12, alignItems: 'stretch', paddingTop: 18 },
  brandTile: { width: 80, height: 80, borderRadius: 26,  alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary, backgroundColor: colors.primaryFixed, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, overflow: 'hidden' },
  cardTitle: { fontFamily: fonts.extraBold, fontSize: 26, lineHeight: 42, color: colors.onSurface, ...rightAlignedText },
  cardSub: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 26, color: colors.onSurfaceVariant, ...rightAlignedText },
  field: { gap: 10, marginTop: 8 },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.onSurfaceVariant, ...rightAlignedText },
  inputWrap: { ...ltrLayout, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.outlineVariant, minHeight: 58, overflow: 'hidden' },
  countryCode: { paddingHorizontal: 16, fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
  input: { flex: 1, color: colors.onSurface, fontFamily: fonts.medium, fontSize: 18, padding: 14, textAlign: 'left', writingDirection: 'ltr' },
  cta: { minHeight: 56, backgroundColor: colors.primary, borderRadius: 18, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
  terms: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  termsText: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  footer: { flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 24, paddingVertical: 16, marginTop: 'auto' },
  footerItem: { alignItems: 'center', gap: 8 },
  footerText: { fontFamily: fonts.regular, fontSize: 11, color: colors.onSurfaceVariant },
  footerDivider: { width: 1, height: 28, backgroundColor: colors.outlineVariant },
});
