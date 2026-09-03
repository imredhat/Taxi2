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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { showToast } from '../../utils';
import JalaliDatePicker from '../../components/JalaliDatePicker';
import styles from './styles/Step3.styles';

const GENDERS = [
  { label: 'مرد', value: 'مرد' },
  { label: 'زن', value: 'زن' },
];

const EDUCATION_LEVELS = ['زیر دیپلم', 'دیپلم', 'کاردانی', 'کارشناسی', 'کارشناسی ارشد', 'دکترا'];
const LANGUAGES = ['انگلیسی', 'فرانسوی', 'عربی', 'ترکی', 'آلمانی', 'سایر'];
const PROFICIENCY_LEVELS = ['متوسط', 'خوب', 'عالی'];

interface PickerModalProps {
  visible: boolean;
  title: string;
  data: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}

function PickerModal({ visible, title, data, selected, onSelect, onClose }: PickerModalProps) {
  const [search, setSearch] = useState('');
  const filtered = data.filter((d) => d.includes(search));

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          {data.length > 3 && (
            <TextInput
              style={styles.modalSearch}
              value={search}
              onChangeText={setSearch}
              placeholder="جستجو..."
              placeholderTextColor="#aaa"
            />
          )}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, selected === item && styles.modalItemActive]}
                onPress={() => { onSelect(item); setSearch(''); onClose(); }}
              >
                <Text style={[styles.modalItemText, selected === item && styles.modalItemTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function SignupStep3Screen({ route, navigation }: any) {
  const prev = route.params;

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [gender, setGender] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [mobile2, setMobile2] = useState('');
  const [password, setPassword] = useState('');
  const [education, setEducation] = useState('');
  const [language, setLanguage] = useState('');
  const [languageLevel, setLanguageLevel] = useState('');

  const [modalField, setModalField] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!firstName.trim()) { showToast('نام را وارد کنید'); return; }
    if (!lastName.trim()) { showToast('نام خانوادگی را وارد کنید'); return; }
    if (!nationalCode.trim() || nationalCode.length < 10) { showToast('کد ملی ۱۰ رقمی را وارد کنید'); return; }
    if (!password.trim() || password.length < 4) { showToast('رمز عبور حداقل ۴ کاراکتر باشد'); return; }
    if (!gender) { showToast('جنسیت را انتخاب کنید'); return; }

    navigation.navigate('SignupStep4', {
      ...prev,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      national_id: nationalCode.trim(),
      gender,
      birth_date: birthDate,
      mobile_2: mobile2.trim() || null,
      password,
      education_level: education || null,
      foreign_language: language || null,
      foreign_language_proficiency: languageLevel || null,
      profileImage,
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
            <Text style={styles.stepBadgeText}>مرحله ۳ از ۸</Text>
          </View>

          <Text style={styles.heading}>اطلاعات شخصی</Text>

          {/* Profile Picture */}
          <TouchableOpacity style={styles.avatarBtn} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarIcon}>📷</Text>
                <Text style={styles.avatarText}>انتخاب عکس پروفایل</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Gender */}
          <Text style={styles.label}>جنسیت</Text>
          <View style={styles.radioRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.radioBtn, gender === g.value && styles.radioBtnActive]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[styles.radioText, gender === g.value && styles.radioTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={styles.label}>نام</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="نام"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>نام خانوادگی</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="نام خانوادگی"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>کد ملی</Text>
          <TextInput
            style={styles.input}
            value={nationalCode}
            onChangeText={(t) => setNationalCode(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="کد ملی ۱۰ رقمی"
            placeholderTextColor="#aaa"
          />

          {/* Birthday */}
          <Text style={styles.label}>تاریخ تولد</Text>
          <JalaliDatePicker
            value={birthDate}
            onChange={(greg) => setBirthDate(greg)}
            placeholder="انتخاب تاریخ تولد"
            minimumYear={1320}
            maximumYear={1410}
          />

          <Text style={styles.label}>موبایل دوم (اختیاری)</Text>
          <TextInput
            style={styles.input}
            value={mobile2}
            onChangeText={setMobile2}
            keyboardType="phone-pad"
            placeholder="09xxxxxxxxx"
            placeholderTextColor="#aaa"
            writingDirection="ltr"
          />

          <Text style={styles.label}>رمز عبور</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="حداقل ۴ کاراکتر"
            placeholderTextColor="#aaa"
          />

          {/* Education */}
          <Text style={styles.label}>سطح تحصیلات</Text>
          <TouchableOpacity style={styles.select} onPress={() => setModalField('education')}>
            <Text style={[styles.selectText, !education && styles.placeholder]}>
              {education || 'انتخاب کنید'}
            </Text>
            <Text style={styles.selectArrow}>◀</Text>
          </TouchableOpacity>

          {/* Language */}
          <Text style={styles.label}>زبان خارجی</Text>
          <TouchableOpacity style={styles.select} onPress={() => setModalField('language')}>
            <Text style={[styles.selectText, !language && styles.placeholder]}>
              {language || 'انتخاب کنید'}
            </Text>
            <Text style={styles.selectArrow}>◀</Text>
          </TouchableOpacity>

          {/* Language Level */}
          {language ? (
            <>
              <Text style={styles.label}>سطح تسلط</Text>
              <TouchableOpacity style={styles.select} onPress={() => setModalField('level')}>
                <Text style={[styles.selectText, !languageLevel && styles.placeholder]}>
                  {languageLevel || 'انتخاب کنید'}
                </Text>
                <Text style={styles.selectArrow}>◀</Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>مرحله بعد</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={modalField === 'education'}
        title="سطح تحصیلات"
        data={EDUCATION_LEVELS}
        selected={education}
        onSelect={setEducation}
        onClose={() => setModalField(null)}
      />
      <PickerModal
        visible={modalField === 'language'}
        title="زبان خارجی"
        data={LANGUAGES}
        selected={language}
        onSelect={setLanguage}
        onClose={() => setModalField(null)}
      />
      <PickerModal
        visible={modalField === 'level'}
        title="سطح تسلط"
        data={PROFICIENCY_LEVELS}
        selected={languageLevel}
        onSelect={setLanguageLevel}
        onClose={() => setModalField(null)}
      />
    </SafeAreaView>
  );
}
