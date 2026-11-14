import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { Icon } from '../components/Icon';
import {colors, fonts, ltrLayout} from '../theme';
import { useAppData } from '../state/AppData';
import { apiPost } from '../services/api';
import { saveSessionToken } from '../storage';


const OTP_LENGTH = 5;
const RESEND_SECONDS = 119;

export default function OtpScreen({ route, navigation }: any) {
  const { openAccount } = useAppData();
  const [userId,setUserId]=useState(route?.params?.userId || '');
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const phone = route?.params?.phone || '';
  // Strip non-digits, keep plain ASCII for display (Estedad has no Arabic-Indic glyph)
  const phoneDisplay = phone.replace(/\D/g, '');
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const [success, setSuccess] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleChange = (text: string, index: number) => {
    const v = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[index] = v;
    setCode(next);
    if (v && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verify = async () => {
    if(busy)return;if(code.join('').length!==OTP_LENGTH){setError('کد تأیید را کامل وارد کنید.');return;}
    setBusy(true);setError('');
    try{
      const result=await apiPost('/api/otp/verify',{userId,code:code.join('')});
      if(typeof result.token!=='string')throw new Error('پاسخ ورود معتبر نیست.');
      await saveSessionToken(result.token);
      await openAccount(phone);
      navigation.replace('Home');
    }catch(err){setError(err instanceof Error?err.message:'تأیید کد انجام نشد.');}finally{setBusy(false);}
  };
  const resend = async () => {
    if(busy)return;setBusy(true);setError('');
    try{const result=await apiPost('/api/otp/send',{phone});setUserId(result.userId);setTimeLeft(RESEND_SECONDS);setCode(Array(OTP_LENGTH).fill(''));}
    catch(err){setError(err instanceof Error?err.message:'ارسال مجدد انجام نشد.');}finally{setBusy(false);}
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <View style={styles.root}>

      <SafeAreaView style={styles.flex}>
        <AppHeader navigation={navigation} title="تأیید شماره همراه" guest onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
        <View style={styles.body}>
          <View style={styles.codeTile}><Icon name="smartphone" size={36} color={colors.primary} /></View>
          <Text style={styles.eyebrow}>تأیید شماره همراه</Text>
          <Text style={styles.title}>کد تایید را وارد کنید</Text>
          <Text style={styles.sub}>
            کد ۵ رقمی به شماره <Text style={styles.subBold}>{phoneDisplay}</Text> ارسال شد
          </Text>

          <View style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <TextInput
                key={i}
                accessibilityLabel={`رقم ${i + 1} کد تأیید`}
                ref={(el) => { inputs.current[i] = el; }}
                style={[styles.otpInput, code[i] && styles.otpInputFilled]}
                value={code[i]}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={i === 0}
                textAlign="center"
              />
            ))}
          </View>

          <View style={styles.timerRow}>
            <Icon name="schedule" size={16} color={colors.onSurfaceVariant} />
            {timeLeft > 0 ? (
              <View style={styles.timerWrap}>
                <Text style={styles.timerLabel}>ارسال مجدد کد تا</Text>
                <Text style={styles.timer}>{`${mm}:${ss}`}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={resend} disabled={busy}>
                <Text style={styles.resend}>ارسال مجدد</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          {!!error&&<Text accessibilityRole="alert" style={[styles.sub,{color:colors.errorRed}]}>{error}</Text>}
          <TouchableOpacity style={styles.continue} activeOpacity={0.9} onPress={verify} disabled={busy}>
            <Text style={styles.continueText}>{busy?'لطفاً صبر کنید...':'تأیید و ادامه'}</Text>
            <Icon name="chevron_left" size={22} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </SafeAreaView>

      {success && (
        <Animated.View style={[styles.successOverlay, { opacity: fade }]}>
          <Animated.View style={[styles.successIcon, { transform: [{ scale }] }]}>
            <Icon name="check_circle" size={64} color={colors.safetyTeal} />
          </Animated.View>
          <Text style={styles.successTitle}>ورود موفقیت‌آمیز</Text>
          <Text style={styles.successSub}>در حال انتقال به پنل کاربری...</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollBody: { flexGrow: 1 },
  codeTile: { width: 80, height: 80, borderRadius: 26, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary, backgroundColor: colors.primaryFixed, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  root: { flex: 1, backgroundColor: colors.background },
  bg: StyleSheet.absoluteFill,
  bgOverlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 12,
  },
  subBold: { fontFamily: fonts.bold },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 360,
    gap: 8,
    ...ltrLayout,
    marginTop: 40,
    marginBottom: 32,
  },
  otpInput: {
    flex: 1,
    maxWidth: 56,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.asphaltSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderBottomWidth: 2,
    borderBottomColor: colors.outlineVariant,
    color: colors.primary,
    fontSize: 24,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  otpInputFilled: { borderColor: colors.primary, borderBottomColor: colors.primary, backgroundColor: colors.secondaryContainer },
  timerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    color: colors.onSurfaceVariant,
  },
  timerWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  timerLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.onSurfaceVariant },
  timer: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  resend: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  footer: { paddingHorizontal: 20, paddingBottom: 40 },
  continue: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
  successOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(30,122,101,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
  },
  successSub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
});
