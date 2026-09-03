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
import { showToast } from '../../utils';
import styles from './styles/Step5.styles';

export default function SignupStep5Screen({ route, navigation }: any) {
  const prev = route.params;

  const [cardNumber, setCardNumber] = useState('');
  const [iban, setIban] = useState('');
  const [holderName, setHolderName] = useState('');

  const handleNext = () => {
    if (!cardNumber.trim() || cardNumber.length < 16) {
      showToast('شماره کارت ۱۶ رقمی را وارد کنید');
      return;
    }
    if (!iban.trim()) { showToast('شماره شبا را وارد کنید'); return; }
    if (!holderName.trim()) { showToast('نام صاحب حساب را وارد کنید'); return; }

    navigation.navigate('SignupStep6', {
      ...prev,
      bank_card_number: cardNumber.trim(),
      iban: iban.trim(),
      bank_account_holder: holderName.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always" keyboardDismissMode="interactive" nestedScrollEnabled>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{'→'}</Text>
          </TouchableOpacity>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>مرحله ۵ از ۸</Text>
          </View>

          <Text style={styles.heading}>اطلاعات بانکی</Text>
          <Text style={styles.desc}>
            اطلاعات حساب بانکی خود را برای واریز درآمد وارد کنید.
          </Text>

          <Text style={styles.label}>شماره کارت بانکی</Text>
          <TextInput
            style={[styles.input, styles.ltr]}
            value={cardNumber}
            onChangeText={(t) => setCardNumber(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={16}
            placeholder="xxxx xxxx xxxx xxxx"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>شماره شبا (IBAN)</Text>
          <TextInput
            style={[styles.input, styles.ltr]}
            value={iban}
            onChangeText={setIban}
            placeholder="IR..."
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>نام صاحب حساب</Text>
          <TextInput
            style={styles.input}
            value={holderName}
            onChangeText={setHolderName}
            placeholder="نام و نام خانوادگی"
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>مرحله بعد</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
