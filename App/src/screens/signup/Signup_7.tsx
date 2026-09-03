import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { showToast } from '../../utils';
import styles from './styles/Step7.styles';

interface PhotoFieldProps {
  label: string;
  image: string | null;
  onPick: () => void;
}

function PhotoField({ label, image, onPick }: PhotoFieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.photoBtn} onPress={onPick}>
        {image ? (
          <Image source={{ uri: image }} style={styles.photoImage} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>انتخاب عکس</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function SignupStep7Screen({ route, navigation }: any) {
  const prev = route.params;

  const [frontImg, setFrontImg] = useState<string | null>(null);
  const [backImg, setBackImg] = useState<string | null>(null);
  const [frontSeatImg, setFrontSeatImg] = useState<string | null>(null);
  const [backSeatImg, setBackSeatImg] = useState<string | null>(null);

  const pick = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleNext = () => {
    navigation.navigate('SignupStep8', {
      ...prev,
      carFrontImg: frontImg,
      carBackImg: backImg,
      carFrontSeatImg: frontSeatImg,
      carBackSeatImg: backSeatImg,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always" keyboardDismissMode="interactive" nestedScrollEnabled>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'→'}</Text>
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>مرحله ۷ از ۸</Text>
        </View>

        <Text style={styles.heading}>تصاویر خودرو</Text>
        <Text style={styles.desc}>
          از زوایای مختلف خودرو عکس بگیرید.
        </Text>

        <View style={styles.grid}>
          <PhotoField label="نمای جلو" image={frontImg} onPick={() => pick(setFrontImg)} />
          <PhotoField label="نمای عقب" image={backImg} onPick={() => pick(setBackImg)} />
          <PhotoField label="صندلی جلو" image={frontSeatImg} onPick={() => pick(setFrontSeatImg)} />
          <PhotoField label="صندلی عقب" image={backSeatImg} onPick={() => pick(setBackSeatImg)} />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
          <Text style={styles.primaryBtnText}>مرحله بعد</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
