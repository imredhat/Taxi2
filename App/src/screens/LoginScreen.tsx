import React, { useState, useEffect } from 'react';
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
import styles from '../styles/LoginScreen.styles';

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('09');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await storage.getItem('auth_token');
      if (token) {
        navigation.replace('Home');
      }
    })();
  }, []);

  const fullPhone = phone;

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      showToast('شماره موبایل را وارد کنید');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/otp/send`, {
        phone: fullPhone,
      });
      navigation.navigate('Otp', { phone: fullPhone, userId: res.data.userId });
    } catch {
      // interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!phone || !password) {
      showToast('شماره موبایل و رمز عبور را وارد کنید');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        username: fullPhone,
        password,
      });
      const { token, role } = res.data;
      await storage.setItem('auth_token', token);
      await storage.setItem('user_role', role || 'passenger');
      showToast(`خوش آمدید ${res.data.firstName || ''}`, 'success');
      navigation.replace('Home');
    } catch {
      // interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.miniLogo}>
              <View style={styles.carIcon}>
                <View style={styles.carRoof} />
              </View>
              <Text style={styles.brandName}>پویش تاکسی</Text>
            </View>
          </View>

          <View style={styles.authCopy}>
            <Text style={styles.heading}>شماره موبایل خود را وارد کنید</Text>
            <Text style={styles.desc}>
              {usePassword
                ? 'رمز عبور خود را وارد کنید.'
                : 'کد تایید برای همین شماره ارسال می‌شود.'}
            </Text>
          </View>

          <Text style={styles.label}>شماره موبایل</Text>
          <View style={styles.phoneField}>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(text) => setPhone(text)}
              keyboardType="phone-pad"
              maxLength={11}
              placeholder="09xxxxxxxxx"
              placeholderTextColor="#aaa"
            />
          </View>

          {usePassword && (
            <>
              <Text style={styles.label}>رمز عبور</Text>
              <View style={styles.phoneField}>
                <TextInput
                  style={styles.phoneInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="رمز عبور"
                  placeholderTextColor="#aaa"
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabledBtn]}
            onPress={usePassword ? handlePasswordLogin : handleSendOtp}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading
                ? 'در حال ارسال...'
                : usePassword
                  ? 'ورود'
                  : 'دریافت کد تایید'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setUsePassword(!usePassword)}
          >
            <Text style={styles.secondaryBtnText}>
              {usePassword ? 'ورود با کد تایید' : 'ورود با کلمه عبور'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>حساب کاربری نداری؟ </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignupStep3')}>
              <Text style={styles.signupLink}>ثبت‌نام</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
