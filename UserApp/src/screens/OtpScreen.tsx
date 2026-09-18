import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { colors, fonts } from '../theme';
import { storage } from '../storage';

const BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB15KVyMJFMr8W79nmqanmfoucTsNf7hXv5MWVfrVA1w4qm3WQx7ZQAg1LPu6LrVKk-UHTY8GOq7Lmm8aqWf-OXOfkHsDGH1PXWrzOFoQ6wefpYhLNieAX64kZCAqkeAQrkLKxGB4L9OhZSH7MzfIODRo0frVDnibpxu4OY1YdzRJ16PmF1yZih9JAP9NybZaS4v10_M77DYBIgNOVFif81ggkBX5dkeWUvlO33e5ma7BNOSUh1GO6-OA';

const OTP_LENGTH = 5;
const RESEND_SECONDS = 119;

export default function OtpScreen({ route, navigation }: any) {
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
    if (code.join('').length < OTP_LENGTH) return;
    // Store a dummy auth token so HomeScreen auth guard passes
    await storage.setItem('auth_token', 'otp-session-' + Date.now());
    setSuccess(true);
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }, 300);
    setTimeout(() => navigation.replace('Home'), 1600);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: BG }} style={styles.bg} blurRadius={2}>
        <View style={styles.bgOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow_forward" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.brand}>پویش تاکسی</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>کد تایید را وارد کنید</Text>
          <Text style={styles.sub}>
            کد ۵ رقمی به شماره <Text style={styles.subBold}>{phoneDisplay}</Text> ارسال شد
          </Text>

          <View style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <TextInput
                key={i}
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
              <TouchableOpacity onPress={() => setTimeLeft(RESEND_SECONDS)}>
                <Text style={styles.resend}>ارسال مجدد</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.continue} activeOpacity={0.9} onPress={verify}>
            <Text style={styles.continueText}>تایید و ادامه</Text>
            <Icon name="chevron_left" size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
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
  root: { flex: 1, backgroundColor: colors.background },
  bg: StyleSheet.absoluteFill,
  bgOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(3,21,30,0.8)' },
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
    paddingHorizontal: 20,
    paddingTop: 48,
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
    marginTop: 40,
    marginBottom: 32,
  },
  otpInput: {
    width: 56,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.asphaltSurface,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    color: colors.primary,
    fontSize: 24,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  otpInputFilled: { borderBottomColor: colors.primary },
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
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: { fontFamily: fonts.bold, fontSize: 20, color: colors.black },
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
