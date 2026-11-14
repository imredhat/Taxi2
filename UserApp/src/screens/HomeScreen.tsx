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
import AppHeader from '../components/AppHeader';
import {colors, fonts, ltrLayout, rightAlignedText} from '../theme';
import SplashScreen from '../components/SplashScreen';
import SaveAddressDialog from '../components/SaveAddressDialog';
import { isSessionToken, storage } from '../storage';
import NeshanMapPicker, { MapPoint } from '../components/NeshanMapPicker';
import { Coordinates, reverseAddress, NESHAN_SERVICE_KEY } from '../services/neshan';
import JalaliDatePicker from '../components/JalaliDatePicker';
import TimePicker from '../components/TimePicker';
import PointAddress from '../components/PointAddress';
import { currentDeparture, persianDigits } from '../utils/tripDateTime';

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
  notes: string;
}

const NESHAN_API_KEY = NESHAN_SERVICE_KEY;

export default function HomeScreen({ navigation, route }: any) {
  const [step, setStep] = useState<Step>('start');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<TripFormData>({
    starts: [],
    ends: [],
    date: '',
    time: '',
    personCount: 1,
    luggageCount: 1,
    bagCount: 0,
    hasAnimals: false,
    animalType: '',
    notes: '',
  });

  const [focusCoordinates, setFocusCoordinates] = useState<Coordinates | null>(null);
  const [savingAddress, setSavingAddress] = useState<MapPoint | null>(null);

  useEffect(() => {
    let live = true;
    void storage.getItem('auth_token').then(token => {
      if (!live) return;
      if (isSessionToken(token)) setLoading(false);
      else navigation.replace('Login');
    });
    return () => { live = false; };
  }, [navigation]);

  useEffect(() => {
    const trip = route?.params?.editTrip;
    if (!trip) return;
    setFormData(previous => ({ ...previous, ...trip, notes: trip.notes ?? '' }));
    setStep('details');
    navigation.setParams?.({ editTrip: undefined });
  }, [route?.params?.editTrip]);

  useEffect(() => {
    if (!route?.params?.newTrip) return;
    setFormData({ starts: [], ends: [], date: '', time: '', personCount: 1, luggageCount: 1, bagCount: 0, hasAnimals: false, animalType: '', notes: '' });
    setStep('start');
    navigation.setParams?.({ newTrip: undefined, editTrip: undefined });
  }, [route?.params?.newTrip]);

  useEffect(() => {
    const address = route?.params?.savedAddress;
    if (!address) return;
    const kind = address.kind === 'end' ? 'ends' : 'starts';
    setFocusCoordinates({ lat: address.lat, lng: address.lng });
    setFormData(previous => ({ ...previous, [kind]: [...previous[kind], {
      id: `favorite-${address.selectionId}`, lat: address.lat, lng: address.lng,
      address: address.address, addressStatus: 'ready', label: `${kind === 'starts' ? 'مبدا' : 'مقصد'} ${previous[kind].length + 1}`,
    }] }));
    setStep(address.kind === 'end' ? 'end' : 'start');
    navigation.setParams?.({ savedAddress: undefined });
  }, [route?.params?.savedAddress]);

  if (loading) return <SplashScreen />;

  const addStartPoint = (point: MapPoint) => {
    setFormData((prev) => ({ ...prev, starts: [...prev.starts, point] }));
  };

  const addEndPoint = (point: MapPoint) => {
    setFormData((prev) => ({ ...prev, ends: [...prev.ends, point] }));
  };

  const updatePoint = (id: string, patch: Partial<MapPoint>, expectedCoordinates?: Coordinates) => {
    const update = (point: MapPoint) => {
      if (point.id !== id) return point;
      if (expectedCoordinates && (point.lat !== expectedCoordinates.lat || point.lng !== expectedCoordinates.lng)) return point;
      return { ...point, ...patch };
    };
    setFormData(prev => ({
      ...prev,
      starts: prev.starts.map(update),
      ends: prev.ends.map(update),
    }));
  };

  const editPoints = (kind: 'starts' | 'ends', index: number, action: 'delete' | 'up' | 'down') => {
    setFormData(prev => {
      const points = [...prev[kind]];
      if (action === 'delete') points.splice(index, 1);
      else {
        const target = index + (action === 'up' ? -1 : 1);
        if (target < 0 || target >= points.length) return prev;
        [points[index], points[target]] = [points[target], points[index]];
      }
      return { ...prev, [kind]: points.map((point, i) => ({
        ...point, label: `${kind === 'starts' ? 'مبدا' : 'مقصد'} ${i + 1}`,
      })) };
    });
  };

  const retryAddress = async (point: MapPoint) => {
    updatePoint(point.id, { addressStatus: 'loading', addressError: undefined });
    try {
      const address = await reverseAddress(point, NESHAN_API_KEY);
      updatePoint(point.id, { address, addressStatus: 'ready' }, point);
    } catch (error) {
      updatePoint(point.id, { addressStatus: 'error', addressError: error instanceof Error ? error.message : 'دریافت آدرس ناموفق بود.' }, point);
    }
  };

  const renderPointRows = (kind: 'starts' | 'ends') => formData[kind].map((point, index) => (
    <View key={point.id} style={styles.pointRow}>
      <View style={[styles.pointNumber,kind==='ends'&&styles.endNumber]}><Text style={styles.pointNumberText}>{persianDigits(index+1)}</Text></View>
      <View style={styles.pointDescription}>
        <Text style={styles.pointTitle}>{kind==='starts'?'مبدأ':'مقصد'}</Text>
        {point.addressStatus!=='error'&&<Text style={styles.pointAddress}>{point.address ? persianDigits(point.address) : 'در حال دریافت آدرس…'}</Text>}
        {point.addressStatus === 'error' && <TouchableOpacity onPress={() => retryAddress(point)}>
          <Text style={styles.pointError}>{point.addressError} تلاش مجدد</Text>
        </TouchableOpacity>}
      </View>
      <View style={styles.pointActions}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`ذخیره ${point.label} در آدرس‌های من`} disabled={!point.address || point.addressStatus === 'loading'} style={[styles.pointAction, (!point.address || point.addressStatus === 'loading') && styles.doneBtnDisabled]} onPress={() => setSavingAddress(point)}>
          <Icon name="bookmark-plus-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel={`انتقال ${point.label} به بالا`} disabled={index === 0}
          style={[styles.pointAction, index === 0 && styles.doneBtnDisabled]} onPress={() => editPoints(kind, index, 'up')}>
          <Text style={styles.pointTitle}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel={`انتقال ${point.label} به پایین`} disabled={index === formData[kind].length - 1}
          style={[styles.pointAction, index === formData[kind].length - 1 && styles.doneBtnDisabled]} onPress={() => editPoints(kind, index, 'down')}>
          <Text style={styles.pointTitle}>↓</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel={`حذف ${point.label}`} style={styles.pointAction} onPress={() => editPoints(kind, index, 'delete')}>
          <Icon name="close" size={17} color={colors.errorRed} />
        </TouchableOpacity>
      </View>
    </View>
  ));

  const canProceed = step === 'start' ? formData.starts.length > 0 : formData.ends.length > 0;

  const goNext = () => {
    if (step === 'start' && formData.starts.length > 0) setStep('end');
    else if (step === 'end' && formData.starts.length > 0 && formData.ends.length > 0) {
      if (!formData.date || !formData.time) {
        const current = currentDeparture();
        setFormData(previous => ({ ...previous, date: previous.date || current.date, time: previous.time || current.time }));
      }
      setStep('details');
    }
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

  if (step === 'start' || step === 'end') {
    const pickingStart=step==='start';
    const points=pickingStart?formData.starts:formData.ends;
    return (
      <View style={[styles.root, styles.mapRoot]}>
        <SafeAreaView style={styles.safeArea}>
          <AppHeader navigation={navigation} title="انتخاب مسیر" onBack={!pickingStart?()=>setStep('start'):undefined} />
          <View style={styles.routeTabs}>
            {(['start','end'] as const).map(kind=>{
              const active=kind===step;
              const count=kind==='start'?formData.starts.length:formData.ends.length;
              const locked=kind==='end'&&!formData.starts.length;
              return <TouchableOpacity key={kind} accessibilityRole="tab" accessibilityState={{selected:active,disabled:locked}}
                disabled={locked} onPress={()=>setStep(kind)} style={[styles.routeTab,active&&styles.routeTabActive,locked&&styles.routeTabLocked]}>
                <Icon name={kind==='start'?'location_on':'flag'} size={19} color={active?'#c4f0dd':kind==='start'?'#086d58':'#92510f'}/>
                <Text style={[styles.routeTabText,active&&styles.routeTabTextActive]}>{kind==='start'?'مبدأ':'مقصد'}</Text>
                {!!count&&<Text style={[styles.routeTabCount,active&&styles.routeTabCountActive]}>{persianDigits(count)}</Text>}
              </TouchableOpacity>;
            })}
          </View>
          <View style={styles.mapArea}>
            <NeshanMapPicker
              focusCoordinates={focusCoordinates}
              points={step === 'start' ? formData.starts : formData.ends}
              onPointUpdate={updatePoint}
              onPointAdd={step === 'start' ? addStartPoint : addEndPoint}
              currentStep={step}
              apiToken={NESHAN_API_KEY}
              previousPoints={step === 'end' ? formData.starts : []}
            />
          </View>

          <View style={styles.mapFooter}>
            <View style={styles.sheetHeading}>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetTitle}>{pickingStart?'انتخاب مبدأ':'انتخاب مقصد'}</Text>
                {!points.length&&<Text style={styles.sheetHint}>روی نقشه بزنید یا آدرس را جستجو کنید.</Text>}
              </View>
              <TouchableOpacity accessibilityRole="button" style={styles.addressesButton} onPress={()=>navigation.navigate('Addresses',{selection:step})}>
                <Icon name="bookmark-outline" color="#086d58" size={18}/>
                <Text style={styles.addressesText}>آدرس‌های من</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="مشاهده کیف پول" style={styles.walletBadge} onPress={()=>navigation.navigate('Wallet')}>
                <Icon name="account_balance_wallet" color="#6e4b00" size={19}/>
              </TouchableOpacity>
            </View>
            {!!points.length&&<ScrollView style={styles.pointList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {renderPointRows(pickingStart?'starts':'ends')}
            </ScrollView>}
            <TouchableOpacity accessibilityRole="button" accessibilityState={{disabled:!canProceed}}
              style={[styles.doneBtn,!canProceed&&styles.doneBtnDisabled]} activeOpacity={0.85} onPress={goNext} disabled={!canProceed}>
              <Text style={styles.doneBtnText}>{pickingStart?'ادامه به انتخاب مقصد':'ادامه به اطلاعات سفر'}</Text>
              <Icon name="chevron_left" size={20} color="#b8efda"/>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <SaveAddressDialog point={savingAddress} onClose={() => setSavingAddress(null)} />
        <BottomNav navigation={navigation} active="home" inFlow />
      </View>
    );
  }

  // Details step
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <AppHeader navigation={navigation} title="اطلاعات سفر" onBack={() => setStep('end')} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Route summary */}
          <View style={styles.routeSummary}>
            <Text style={styles.routeSummaryTitle}>خلاصه سفر</Text>
            {[...formData.starts.map(point => ({ point, origin: true })), ...formData.ends.map(point => ({ point, origin: false }))].map(({ point, origin }) => (
              <View key={point.id} style={styles.routeRow}>
                <Icon name={origin ? 'arrow_back' : 'flag'} size={18} color={colors.primary} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.routeText}>{persianDigits(point.label)}</Text>
                  <PointAddress point={point} />
                </View>
              </View>
            ))}
          </View>

          <JalaliDatePicker
            label="📅 تاریخ حرکت"
            value={formData.date}
            onChange={(d) => setFormData((prev) => ({ ...prev, date: d }))}
          />

          <TimePicker value={formData.time} onChange={time => setFormData(prev => ({ ...prev, time }))} />

          {/* Passengers */}
          <View style={styles.counterRow}>
            <Icon name="person" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.counterLabel}>تعداد مسافران</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setFormData((prev) => ({ ...prev, personCount: Math.max(1, prev.personCount - 1) }))}>
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{persianDigits(formData.personCount)}</Text>
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
              <Text style={styles.counterValue}>{persianDigits(formData.luggageCount)}</Text>
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
              <Text style={styles.counterValue}>{persianDigits(formData.bagCount)}</Text>
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
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>
          )}

          <View style={styles.animalTypeField}>
            <Text style={styles.fieldLabel}>توضیحات سفر (اختیاری)</Text>
            <TextInput accessibilityLabel="توضیحات سفر" multiline maxLength={1000} style={[styles.animalTextInput,styles.notesInput]}
              value={formData.notes} onChangeText={notes=>setFormData(previous=>({...previous,notes}))}
              placeholder="مثلاً محل دقیق سوار شدن یا توضیحی دربارهٔ بار" placeholderTextColor={colors.onSurfaceVariant}/>
          </View>

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

const row={...ltrLayout,flexDirection:'row-reverse' as const,alignItems:'center' as const};

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:colors.background},
  safeArea:{flex:1},
  mapRoot:{backgroundColor:'#eff5f0'},
  routeTabs:{...row,gap:7,paddingHorizontal:12,paddingVertical:8},
  routeTab:{...row,flex:1,minHeight:41,gap:6,paddingHorizontal:10,borderRadius:12,borderWidth:1,borderColor:'#dbe7df',backgroundColor:'#fff'},
  routeTabActive:{backgroundColor:'#10392f',borderColor:'#10392f'},
  routeTabLocked:{opacity:0.58},
  routeTabText:{flex:1,fontFamily:fonts.bold,fontSize:13,color:'#10392f',...rightAlignedText},
  routeTabTextActive:{color:'#fff'},
  routeTabCount:{fontFamily:fonts.bold,fontSize:11,color:'#0e6552',paddingHorizontal:7,borderRadius:7,backgroundColor:'#e5f1e9'},
  routeTabCountActive:{color:'#dcf6e9',backgroundColor:'#28584b'},
  mapArea:{flex:1,minWidth:0,minHeight:126,marginHorizontal:12,overflow:'hidden',borderRadius:22,borderWidth:1,borderColor:'#cfded4',backgroundColor:'#e2eee6'},
  sheetHeading:{...row,gap:7},
  sheetCopy:{flex:1,minWidth:0},
  sheetTitle:{fontFamily:fonts.extraBold,fontSize:14,lineHeight:23,color:'#10392f',...rightAlignedText},
  sheetHint:{fontFamily:fonts.regular,fontSize:10,lineHeight:18,color:'#4f655d',...rightAlignedText},
  addressesButton:{...row,gap:4,minHeight:40,paddingHorizontal:7,borderRadius:10,backgroundColor:'#e8f2eb'},
  addressesText:{fontFamily:fonts.bold,fontSize:10,color:'#086d58'},
  walletBadge:{width:40,height:40,borderRadius:11,backgroundColor:'#fff1cf',alignItems:'center',justifyContent:'center'},
  pointList:{maxHeight:104,flexGrow:0},
  pointRow:{...row,gap:6,paddingVertical:5,borderBottomWidth:1,borderBottomColor:'#e4ede7'},
  pointNumber:{width:23,height:23,borderRadius:8,backgroundColor:'#dff0e5',alignItems:'center',justifyContent:'center'},
  endNumber:{backgroundColor:'#fff0d9'},
  pointNumberText:{fontFamily:fonts.bold,fontSize:11,color:'#10392f'},
  pointDescription:{flex:1,minWidth:0,gap:1},
  pointTitle:{fontFamily:fonts.bold,color:'#10392f',fontSize:12,...rightAlignedText},
  pointAddress:{fontFamily:fonts.regular,color:'#4f655d',fontSize:11,lineHeight:19,...rightAlignedText},
  pointError:{fontFamily:fonts.medium,color:colors.errorRed,fontSize:11,...rightAlignedText},
  pointActions:{...row,gap:1},
  pointAction:{width:28,height:36,alignItems:'center',justifyContent:'center'},
  notesInput:{minHeight:76,textAlignVertical:'top'},
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  routeSummary: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: 16,
  },
  routeSummaryTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    ...rightAlignedText,
  },
  routeRow: { ...ltrLayout, flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, marginTop: 12 },
  routeText: { fontFamily: fonts.medium, fontSize: 14, color: colors.onSurfaceVariant, ...rightAlignedText },
  fieldLabel: { ...rightAlignedText, fontFamily: fonts.medium, fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 8 },
  counterRow: {
    ...ltrLayout,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: 12,
  },
  counterLabel: { ...rightAlignedText, flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.onSurface },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  counterValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.onSurface, minWidth: 24, textAlign: 'center' },
  animalsRow: {
    ...ltrLayout,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: 12,
  },
  animalsLabel: { ...rightAlignedText, flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.onSurface },
  animalTypeField: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: 16,
  },
  animalTextInput: {
    fontFamily: fonts.regular, fontSize: 16, color: colors.onSurface,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
    paddingVertical: 8,
    ...rightAlignedText,
  },
  continueBtn: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  continueBtnText: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },
  mapFooter:{flexShrink:0,paddingHorizontal:12,paddingVertical:8,gap:7,backgroundColor:'#eff5f0'},
  doneBtn:{...row,justifyContent:'space-between',height:44,paddingHorizontal:12,borderRadius:12,backgroundColor:'#10392f'},
  doneBtnDisabled:{opacity:0.45},
  doneBtnText:{fontFamily:fonts.bold,fontSize:13,color:'#fff'},
});
