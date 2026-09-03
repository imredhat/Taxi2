import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../storage';
import axios from 'axios';
import { API_URL, showToast } from '../utils';
import styles from '../styles/OtpScreen.styles';

const OTP_LENGTH = 5;

export default function OtpScreen({ route, navigation }: any) {
  const { phone, userId } = route.params;
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleChange = (text: string, index: number) => {
    text = text.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - '۰'.charCodeAt(0)));
    if (text.length > 1) text = text.slice(-1);
    const next = [...code];
    next[index] = text;
    setCode(next);
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length < OTP_LENGTH) {
      showToast('کد تایید را کامل وارد کنید');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/otp/verify`, {
        userId,
        code: otp,
      });
      const { token } = res.data;
      await storage.setItem('auth_token', token);
      await storage.setItem('user_role', 'passenger');
      showToast('ورود موفق — خوش آمدید', 'success');
      navigation.replace('Home');
    } catch {
      // interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await axios.post(`${API_URL}/api/otp/send`, { phone });
      setResendTimer(60);
      showToast('کد تایید جدید ارسال شد', 'success');
    } catch {
      // interceptor handles error toast
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{'→'}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.heading}>کد تایید را وارد کنید</Text>
            <Text style={styles.desc}>
              کد {OTP_LENGTH} رقمی به شماره {phone} ارسال شد
            </Text>
          </View>

          <View style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <TextInput
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                style={[styles.otpInput, code[i] ? styles.otpInputFilled : null]}
                value={code[i]}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={i === 0}
                selectionColor="#07846c"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabledBtn]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'در حال تایید...' : 'تایید'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resendBtn, resendTimer > 0 && styles.resendDisabled]}
            onPress={handleResend}
            disabled={resendTimer > 0}
          >
            <Text style={styles.resendText}>
              {resendTimer > 0
                ? `ارسال مجدد بعد از ${resendTimer} ثانیه`
                : 'ارسال مجدد کد تایید'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
