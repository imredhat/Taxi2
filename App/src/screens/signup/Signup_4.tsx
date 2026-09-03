import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { showToast } from '../../utils';
import styles from './styles/Step4.styles';

interface DocFieldProps {
  label: string;
  image: string | null;
  onPick: () => void;
}

function DocField({ label, image, onPick }: DocFieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.docBtn} onPress={onPick}>
        {image ? (
          <Image source={{ uri: image }} style={styles.docImage} />
        ) : (
          <View style={styles.docPlaceholder}>
            <Text style={styles.docIcon}>📷</Text>
            <Text style={styles.docText}>انتخاب عکس</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function SignupStep4Screen({ route, navigation }: any) {
  const prev = route.params;

  const [nationalCardImg, setNationalCardImg] = useState<string | null>(null);
  const [licenseImg, setLicenseImg] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [homePhone, setHomePhone] = useState('');
  const [backgroundImg, setBackgroundImg] = useState<string | null>(null);
  const [healthImg, setHealthImg] = useState<string | null>(null);

  const pick = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleNext = () => {
    if (!postalCode.trim()) { showToast('کد پستی را وارد کنید'); return; }
    if (!address.trim()) { showToast('آدرس را وارد کنید'); return; }

    navigation.navigate('SignupStep5', {
      ...prev,
      address: address.trim(),
      postal_code: postalCode.trim(),
      home_phone: homePhone.trim() || null,
      nationalCardImg,
      licenseImg,
      backgroundImg,
      healthImg,
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
            <Text style={styles.stepBadgeText}>مرحله ۴ از ۸</Text>
          </View>

          <Text style={styles.heading}>مدارک و آدرس</Text>

          <DocField label="عکس کارت ملی" image={nationalCardImg} onPick={() => pick(setNationalCardImg)} />
          <DocField label="عکس گواهینامه" image={licenseImg} onPick={() => pick(setLicenseImg)} />

          <Text style={styles.label}>کد پستی</Text>
          <TextInput
            style={styles.input}
            value={postalCode}
            onChangeText={(t) => setPostalCode(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="کد پستی ۱۰ رقمی"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>آدرس</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            placeholder="آدرس کامل"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>تلفن خانه (اختیاری)</Text>
          <TextInput
            style={styles.input}
            value={homePhone}
            onChangeText={setHomePhone}
            keyboardType="phone-pad"
            placeholder="0xxxxxxxxx"
            placeholderTextColor="#aaa"
            writingDirection="ltr"
          />

          <DocField label="عکس گواهی سوء پیشینه" image={backgroundImg} onPick={() => pick(setBackgroundImg)} />
          <DocField label="عکس گواهی سلامت" image={healthImg} onPick={() => pick(setHealthImg)} />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>مرحله بعد</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
