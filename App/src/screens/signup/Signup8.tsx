import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../../storage';
import axios from 'axios';
import { API_URL, showToast } from '../../utils';
import styles from './styles/Step8.styles';

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

export default function SignupStep8Screen({ route, navigation }: any) {
  const data = route.params;
  const [loading, setLoading] = useState(false);

  const [regFrontImg, setRegFrontImg] = useState<string | null>(null);
  const [regBackImg, setRegBackImg] = useState<string | null>(null);
  const [insuranceImg, setInsuranceImg] = useState<string | null>(null);
  const [insuranceAddImg, setInsuranceAddImg] = useState<string | null>(null);

  const pick = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const buildFormData = () => {
    const fd = new FormData();

    // User fields
    fd.append('phone', data.phone);
    fd.append('password', data.password);
    if (data.national_id) fd.append('national_id', data.national_id);
    if (data.first_name) fd.append('first_name', data.first_name);
    if (data.last_name) fd.append('last_name', data.last_name);
    if (data.gender) fd.append('gender', data.gender);
    if (data.birth_date) fd.append('birth_date', data.birth_date);
    if (data.mobile_2) fd.append('mobile_2', data.mobile_2);
    if (data.education_level) fd.append('education_level', data.education_level);
    if (data.foreign_language) fd.append('foreign_language', data.foreign_language);
    if (data.foreign_language_proficiency) fd.append('foreign_language_proficiency', data.foreign_language_proficiency);

    // Address fields
    if (data.address) fd.append('address', data.address);
    if (data.postal_code) fd.append('postal_code', data.postal_code);
    if (data.home_phone) fd.append('home_phone', data.home_phone);

    // Bank fields
    if (data.bank_card_number) fd.append('bank_card_number', data.bank_card_number);
    if (data.iban) fd.append('iban', data.iban);
    if (data.bank_account_holder) fd.append('bank_account_holder', data.bank_account_holder);

    // Car fields
    if (data.brand) fd.append('brand', data.brand);
    if (data.model_id) fd.append('model_id', data.model_id);
    if (data.year) fd.append('year', data.year);
    if (data.vin) fd.append('vin', data.vin);
    if (data.plate_part1) fd.append('plate_part1', data.plate_part1);
    if (data.plate_part2) fd.append('plate_part2', data.plate_part2);
    if (data.plate_part3) fd.append('plate_part3', data.plate_part3);
    if (data.plate_letter) fd.append('plate_letter', data.plate_letter);
    if (data.color) fd.append('color', data.color);
    if (data.fuel_type) fd.append('fuel_type', data.fuel_type);
    if (data.insurance_expiry_date) fd.append('insurance_expiry_date', data.insurance_expiry_date);
    if (data.owner_name) fd.append('owner', data.owner_name);

    // Profile image
    if (data.profileImage) {
      fd.append('ax', { uri: data.profileImage, type: 'image/jpeg', name: 'ax.jpg' } as any);
    }

    // Document images
    if (data.nationalCardImg) {
      fd.append('scan_melli', { uri: data.nationalCardImg, type: 'image/jpeg', name: 'scan_melli.jpg' } as any);
    }
    if (data.licenseImg) {
      fd.append('scan_govahiname', { uri: data.licenseImg, type: 'image/jpeg', name: 'scan_govahiname.jpg' } as any);
    }
    if (data.backgroundImg) {
      fd.append('scan_so_pishineh', { uri: data.backgroundImg, type: 'image/jpeg', name: 'scan_so_pishineh.jpg' } as any);
    }
    if (data.healthImg) {
      fd.append('scan_salamat', { uri: data.healthImg, type: 'image/jpeg', name: 'scan_salamat.jpg' } as any);
    }

    // Car images
    if (data.carFrontImg) {
      fd.append('pic_front', { uri: data.carFrontImg, type: 'image/jpeg', name: 'pic_front.jpg' } as any);
    }
    if (data.carBackImg) {
      fd.append('pic_back', { uri: data.carBackImg, type: 'image/jpeg', name: 'pic_back.jpg' } as any);
    }
    if (data.carFrontSeatImg) {
      fd.append('pic_in_front', { uri: data.carFrontSeatImg, type: 'image/jpeg', name: 'pic_in_front.jpg' } as any);
    }
    if (data.carBackSeatImg) {
      fd.append('pic_in_back', { uri: data.carBackSeatImg, type: 'image/jpeg', name: 'pic_in_back.jpg' } as any);
    }

    // Car document images
    if (regFrontImg) {
      fd.append('scan_car_card', { uri: regFrontImg, type: 'image/jpeg', name: 'scan_car_card.jpg' } as any);
    }
    if (regBackImg) {
      fd.append('scan_car_card_back', { uri: regBackImg, type: 'image/jpeg', name: 'scan_car_card_back.jpg' } as any);
    }
    if (insuranceImg) {
      fd.append('scan_insurance', { uri: insuranceImg, type: 'image/jpeg', name: 'scan_insurance.jpg' } as any);
    }
    if (insuranceAddImg) {
      fd.append('scan_insurance_Addendum', { uri: insuranceAddImg, type: 'image/jpeg', name: 'scan_insurance_Addendum.jpg' } as any);
    }

    return fd;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = buildFormData();
      const res = await axios.post(`${API_URL}/api/driver-profiles`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Store auth info
      if (data.token) {
        await storage.setItem('auth_token', data.token);
        await storage.setItem('user_role', 'driver');
      }

      showToast('ثبت‌نام با موفقیت انجام شد', 'success');
      navigation.navigate('Login');
    } catch {
      // interceptor handles toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always" keyboardDismissMode="interactive" nestedScrollEnabled>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'→'}</Text>
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>مرحله ۸ از ۸</Text>
        </View>

        <Text style={styles.heading}>مدارک خودرو</Text>
        <Text style={styles.desc}>
          تصاویر مدارک خودرو را بارگذاری کنید.
        </Text>

        <DocField label="سند خودرو (رو)" image={regFrontImg} onPick={() => pick(setRegFrontImg)} />
        <DocField label="سند خودرو (پشت)" image={regBackImg} onPick={() => pick(setRegBackImg)} />
        <DocField label="بیمه نامه" image={insuranceImg} onPick={() => pick(setInsuranceImg)} />
        <DocField label="الصاقیه بیمه" image={insuranceAddImg} onPick={() => pick(setInsuranceAddImg)} />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>ثبت‌نام</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
