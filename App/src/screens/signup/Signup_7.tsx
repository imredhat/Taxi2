import React, { useRef, useState } from 'react';
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
import {driverApi,errorText} from '../../driverApi';
import styles from './styles/Step7.styles';

interface PhotoFieldProps {
  label: string;
  image: string | null;
  onPick: () => void;
}

const vehicleDocuments=[
  ['vehicle_registration_front','روی کارت خودرو'],['vehicle_registration_back','پشت کارت خودرو'],
  ['insurance','بیمه‌نامه'],['insurance_addendum','الحاقیهٔ بیمه'],
  ['vehicle_front','نمای جلو'],['vehicle_back','نمای عقب'],
  ['vehicle_interior_front','صندلی جلو'],['vehicle_interior_back','صندلی عقب'],
] as const;

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
  const standalone=!!prev?.standalone;
  const [documents,setDocuments]=useState<Record<string,{uri:string;base64:string}>>({});
  const [saving,setSaving]=useState(false);
  const submitting=useRef(false);

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

  const pickDocument=async(type:string)=>{
    try {
      const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,quality:0.5,base64:true});
      if(result.canceled)return;
      const {uri,base64}=result.assets[0];
      if(!base64||base64.length>1_200_000){showToast('حجم تصویر زیاد است. عکس کوچک‌تری انتخاب کنید.');return;}
      setDocuments(current=>({...current,[type]:{uri,base64}}));
    } catch {showToast('انتخاب تصویر انجام نشد.');}
  };

  const saveVehicle=async()=>{
    if(submitting.current)return;
    submitting.current=true;setSaving(true);
    try {
      await driverApi.addVehicle({...prev,documents:Object.entries(documents).map(([type,{base64}])=>({type,base64}))});
      showToast('خودرو ثبت شد و در انتظار تأیید مدیر است.','success');
      navigation.popTo('Vehicles');
    } catch(error){showToast(errorText(error));}
    finally{submitting.current=false;setSaving(false);}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always" keyboardDismissMode="interactive" nestedScrollEnabled>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'→'}</Text>
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{standalone?'مرحله ۲ از ۲':'مرحله ۷ از ۸'}</Text>
        </View>

        <Text style={styles.heading}>{standalone?'مدارک و تصاویر خودرو':'تصاویر خودرو'}</Text>
        <Text style={styles.desc}>
          {standalone?'عکس مدارک و تصاویر خودرو را انتخاب کنید.':'از زوایای مختلف خودرو عکس بگیرید.'}
        </Text>

        <View style={styles.grid}>
          {standalone?vehicleDocuments.map(([type,label])=><PhotoField key={type} label={label} image={documents[type]?.uri??null} onPick={()=>{if(!submitting.current)void pickDocument(type);}}/>):<>
          <PhotoField label="نمای جلو" image={frontImg} onPick={() => pick(setFrontImg)} />
          <PhotoField label="نمای عقب" image={backImg} onPick={() => pick(setBackImg)} />
          <PhotoField label="صندلی جلو" image={frontSeatImg} onPick={() => pick(setFrontSeatImg)} />
          <PhotoField label="صندلی عقب" image={backSeatImg} onPick={() => pick(setBackSeatImg)} />
          </>}
        </View>

        <TouchableOpacity style={styles.primaryBtn} disabled={saving} onPress={standalone?saveVehicle:handleNext}>
          <Text style={styles.primaryBtnText}>{saving?'در حال ثبت…':standalone?'ثبت خودرو':'مرحله بعد'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
