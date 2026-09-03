import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL, showToast } from '../../utils';
import styles from './styles/Step1.styles';

export default function SignupStep1Screen({ navigation }: any) {
  const [phone, setPhone] = useState('9');
  const [loading, setLoading] = useState(false);

  const fullPhone = '0' + phone;

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
      navigation.navigate('SignupStep2', {
        phone: fullPhone,
        userId: res.data.userId,
      });
    } catch {
      // interceptor handles toast
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
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{'→'}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.miniLogo}>
              <View style={styles.carIcon}>
                <View style={styles.carRoof} />
              </View>
              <Text style={styles.brandName}>پویش تاکسی</Text>
            </View>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>مرحله ۱ از ۸</Text>
          </View>

          <Text style={styles.heading}>ثبت‌نام راننده</Text>

          <View style={styles.agreementBox}>
            <Text style={styles.agreementText}>
              با قوانین پویش تاکسی موافقم و درخواست ثبت‌نام در سیستم رانندگی را دارم.
            </Text>
          </View>

          <Text style={styles.label}>شماره موبایل</Text>
          <View style={styles.phoneField}>
            <Text style={styles.countryCode}>98+</Text>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/^0+/, ''))}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="9xxxxxxxxx"
              placeholderTextColor="#aaa"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabledBtn]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'در حال ارسال...' : 'دریافت کد تایید'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>حساب کاربری دارید؟ ورود</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
