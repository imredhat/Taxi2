import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import BottomNav from '../components/BottomNav';
import { colors, fonts } from '../theme';
import { storage } from '../storage';
import NeshanMapPicker, { MapPoint } from '../components/NeshanMapPicker';
import JalaliDatePicker from '../components/JalaliDatePicker';

type Step = 'start' | 'end' | 'details';

interface TripFormData {
  starts: MapPoint[];
  ends: MapPoint[];
  date: string;
  time: string;
  personCount: number;
  luggageCount: number;
  bagCount: number;
  hasAnimals: boolean;
  animalType: string;
}

const NESHAN_API_KEY = 'service.9c50629218df44e6bd12b34e4e6e8545';

export default function HomeScreen({ navigation, route }: any) {
  const [step, setStep] = useState<Step>('start');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<TripFormData>({
    starts: [],
    ends: [],
    date: '',
    time: '09:00',
    personCount: 1,
    luggageCount: 1,
    bagCount: 0,
    hasAnimals: false,
    animalType: '',
  });

  useEffect(() => {
    let cancelled = false;
    // Fast path: OTP flow passed verification flag directly via params
    if (route?.params?.otpVerified) {
      setLoading(false);
      return;
    }
    const initAuth = async () => {
      const token = await storage.getItem('auth_token');
      if (cancelled) return;
      if (!token) {
        // Retry once — AsyncStorage may be slow on first write
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) return;
        const token2 = await storage.getItem('auth_token');
        if (!token2) navigation.replace('Login');
        else setLoading(false);
      } else {
        setLoading(false);
      }
    };
    initAuth();
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;

  const handleLogout = async () => {
    await storage.removeItem('auth_token');
    await storage.removeItem('user_role');
    navigation.replace('Login');
  };

  const addStartPoint = (point: MapPoint) => {
    setFormData((prev) => ({ ...prev, starts: [...prev.starts, point] }));
  };

  const addEndPoint = (point: MapPoint) => {
    setFormData((prev) => ({ ...prev, ends: [...prev.ends, point] }));
  };

  const canProceed = step === 'start' ? formData.starts.length > 0 : formData.ends.length > 0;

  const goNext = () => {
    if (step === 'start') setStep('end');
    else if (step === 'end') setStep('details');
  };

  const goToBooking = () => {
    navigation.navigate('Booking', {
      ...formData,
      personCount: formData.personCount,
      luggageCount: formData.luggageCount,
      bagCount: formData.bagCount,
      hasAnimals: formData.hasAnimals,
    });
  };

  // Map selection steps — fullscreen map, minimal UI
  if (step === 'start' || step === 'end') {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setStep('start')} disabled={step === 'start'}>
              <Icon
                name="arrow_back"
                size={24}
                color={step === 'start' ? 'rgba(255,255,255,0.3)' : colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.brand}>پویش تاکسی</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Icon name="logout" size={24} color={colors.errorRed} />
            </TouchableOpacity>
          </View>

          {/* Map area — grows to fill available space */}
          <View style={styles.mapArea}>
            <NeshanMapPicker
              points={step === 'start' ? formData.starts : formData.ends}
              onPointAdd={step === 'start' ? addStartPoint : addEndPoint}
              currentStep={step}
              apiToken={NESHAN_API_KEY}
              height={600}
            />
          </View>

          {/* Bottom action bar — sits between map and nav */}
          <View style={styles.mapFooter}>
            <View style={styles.stepLabel}>
              <View style={[styles.dot, { backgroundColor: step === 'start' ? colors.primary : '#1e7a65' }]} />
              <Text style={styles.stepLabelText}>
                {step === 'start'
                  ? `${formData.starts.length > 0 ? `نقطه ${formData.starts.length}` : 'نقطه شروع'} را انتخاب کنید`
                  : `${formData.ends.length > 0 ? `نقطه ${formData.ends.length}` : 'نقطه پایان'} را انتخاب کنید`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.doneBtn, !canProceed && styles.doneBtnDisabled]}
              activeOpacity={canProceed ? 0.8 : 1}
              onPress={goNext}
              disabled={!canProceed}
            >
              <Text style={styles.doneBtnText}>
                {step === 'start' ? 'انتهای نقاط شروع' : 'انتهای نقاط پایان'}
              </Text>
              <Icon name="chevron_left" size={20} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <BottomNav navigation={navigation} active="home" />
      </View>
    );
  }

  // Details step
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('end')}>
            <Icon name="arrow_back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.brand}>پویش تاکسی</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="logout" size={24} color={colors.errorRed} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Route summary */}
          <View style={styles.routeSummary}>
            <Text style={styles.routeSummaryTitle}>خلاصه سفر</Text>
            <View style={styles.routeRow}>
              {formData.starts.map((p) => (
                <Text key={p.id} style={styles.routeText}>{p.label}</Text>
              ))}
              <Icon name="arrow_forward" size={16} color={colors.onSurfaceVariant} />
              {formData.ends.map((p) => (
                <Text key={p.id} style={styles.routeText}>{p.label}</Text>
              ))}
            </View>
          </View>

          <JalaliDatePicker
            label="📅 تاریخ سفر"
            value={formData.date}
            onChange={(d) => setFormData((prev) => ({ ...prev, date: d }))}
          />

          <View style={styles.timeInput}>
            <Text style={styles.fieldLabel}>⏰ ساعت حرکت</Text>
            <TextInput
              style={styles.timeText}
              value={formData.time}
              onChangeText={(t) => setFormData((prev) => ({ ...prev, time: t }))}
              placeholder="09:00"
              placeholderTextColor="rgba(212,196,174,0.4)"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>

          {/* Passengers */}
          <View style={styles.counterRow}>
            <Icon name="person" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.counterLabel}>تعداد مسافران</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setFormData((prev) => ({ ...prev, personCount: Math.max(1, prev.personCount - 1) }))}>
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{formData.personCount}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setFormData((prev) => ({ ...prev, personCount: Math.min(8, prev.personCount + 1) }))}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Luggage */}
          <View style={styles.counterRow}>
            <Icon name="luggage" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.counterLabel}>بار دستی</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setFormData((prev) => ({ ...prev, luggageCount: Math.max(0, prev.luggageCount - 1) }))}>
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{formData.luggageCount}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setFormData((prev) => ({ ...prev, luggageCount: Math.min(5, prev.luggageCount + 1) }))}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bags */}
          <View style={styles.counterRow}>
            <Icon name="badge" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.counterLabel}>چمدان / بار</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setFormData((prev) => ({ ...prev, bagCount: Math.max(0, prev.bagCount - 1) }))}>
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{formData.bagCount}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setFormData((prev) => ({ ...prev, bagCount: Math.min(10, prev.bagCount + 1) }))}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Animals */}
          <View style={styles.animalsRow}>
            <Icon name="paw" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.animalsLabel}>حیوان همراه؟</Text>
            <Switch
              value={formData.hasAnimals}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, hasAnimals: v }))}
              trackColor={{ false: colors.surfaceVariant, true: colors.safetyTeal }}
              thumbColor={colors.white}
            />
          </View>

          {formData.hasAnimals && (
            <View style={styles.animalTypeField}>
              <Text style={styles.fieldLabel}>نوع حیوان</Text>
              <TextInput
                style={styles.animalTextInput}
                value={formData.animalType}
                onChangeText={(t) => setFormData((prev) => ({ ...prev, animalType: t }))}
                placeholder="مثال: سگ، گربه..."
                placeholderTextColor="rgba(212,196,174,0.4)"
              />
            </View>
          )}

          <TouchableOpacity style={styles.continueBtn} activeOpacity={0.9} onPress={goToBooking}>
            <Text style={styles.continueBtnText}>ادامه و انتخاب خودرو</Text>
            <Icon name="chevron_left" size={22} color={colors.onPrimary} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <BottomNav navigation={navigation} active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  mapArea: { flex: 1, minWidth: 0 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(3,21,30,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 10,
  },
  brand: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, letterSpacing: -0.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  routeSummary: {
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  routeSummaryTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  routeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  routeText: { fontFamily: fonts.medium, fontSize: 14, color: colors.onSurface },
  timeInput: {
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 8 },
  timeText: {
    fontFamily: fonts.bold, fontSize: 20, color: colors.primary,
    textAlign: 'left',
  },
  counterRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  counterLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.onSurface },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  counterValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.onSurface, minWidth: 24, textAlign: 'center' },
  animalsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  animalsLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.onSurface },
  animalTypeField: {
    backgroundColor: 'rgba(11,30,39,0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  animalTextInput: {
    fontFamily: fonts.regular, fontSize: 16, color: colors.onSurface,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
  },
  continueBtn: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  continueBtnText: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },
  // Map step footer — flows naturally between map and nav, no jumping
  mapFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(3,21,30,0.9)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stepLabel: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(3,21,30,0.85)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stepLabelText: { fontFamily: fonts.medium, fontSize: 13, color: '#fff', flex: 1 },
  doneBtn: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  doneBtnDisabled: { opacity: 0.4 },
  doneBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
});
