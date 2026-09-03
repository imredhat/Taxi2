import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL, showToast } from '../../utils';
import JalaliDatePicker from '../../components/JalaliDatePicker';
import styles from './styles/Step6.styles';

const FUEL_TYPES = ['بنزین', 'گاز', 'هیبریدی', 'برقی'];
const PLATE_LETTERS = ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'];

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
          {data.length > 5 && (
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

interface BrandPickerProps {
  visible: boolean;
  brands: any[];
  selected: string;
  onSelect: (b: any) => void;
  onClose: () => void;
}

function BrandPickerModal({ visible, brands, selected, onSelect, onClose }: BrandPickerProps) {
  const [search, setSearch] = useState('');
  const filtered = brands.filter((b) => {
    const name = (b.name_fa || b.name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
          <Text style={styles.modalTitle}>برند خودرو</Text>
          <TextInput
            style={styles.modalSearch}
            value={search}
            onChangeText={setSearch}
            placeholder="جستجوی برند..."
            placeholderTextColor="#aaa"
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); setSearch(''); onClose(); }}>
                <Text style={styles.modalItemText}>{item.name_fa || item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

interface ModelPickerProps {
  visible: boolean;
  models: any[];
  selected: string;
  loading: boolean;
  onSelect: (m: any) => void;
  onClose: () => void;
}

function ModelPickerModal({ visible, models, selected, loading, onSelect, onClose }: ModelPickerProps) {
  const [search, setSearch] = useState('');
  const filtered = models.filter((m) => {
    const name = (m.name_fa || m.name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
          <Text style={styles.modalTitle}>مدل خودرو</Text>
          {!loading && (
            <TextInput
              style={styles.modalSearch}
              value={search}
              onChangeText={setSearch}
              placeholder="جستجوی مدل..."
              placeholderTextColor="#aaa"
            />
          )}
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#6a7673', fontFamily: 'Estedad-Regular' }}>در حال بارگذاری...</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); setSearch(''); onClose(); }}>
                  <Text style={styles.modalItemText}>{item.name_fa || item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function SignupStep6Screen({ route, navigation }: any) {
  const prev = route.params;

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [plate1, setPlate1] = useState('');
  const [plate2, setPlate2] = useState('');
  const [plate3, setPlate3] = useState('');
  const [plateLetter, setPlateLetter] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [insuranceDate, setInsuranceDate] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const [modalField, setModalField] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/car-brands`).then((r) => setBrands(r.data.brands || [])).catch(() => {});
  }, []);

  const selectBrand = async (b: any) => {
    setSelectedBrand(b.name_fa || b.name);
    setSelectedModel('');
    setLoadingModels(true);
    try {
      const res = await axios.get(`${API_URL}/api/car-models`, { params: { brand_id: b.id } });
      setModels(res.data.models || []);
    } catch {
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleNext = () => {
    if (!selectedBrand) { showToast('برند خودرو را انتخاب کنید'); return; }
    if (!plate1 || !plate2 || !plate3 || !plateLetter) { showToast('پلاک خودرو را کامل وارد کنید'); return; }

    navigation.navigate('SignupStep7', {
      ...prev,
      brand: selectedBrand,
      model_id: selectedModel || null,
      year: year || null,
      vin: vin.trim() || null,
      plate_part1: plate1,
      plate_part2: plate2,
      plate_part3: plate3,
      plate_letter: plateLetter,
      color: color.trim() || null,
      fuel_type: fuelType || null,
      insurance_expiry_date: insuranceDate || null,
      owner_name: ownerName.trim() || null,
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
            <Text style={styles.stepBadgeText}>مرحله ۶ از ۸</Text>
          </View>

          <Text style={styles.heading}>اطلاعات خودرو</Text>

          {/* Brand */}
          <Text style={styles.label}>برند خودرو</Text>
          <TouchableOpacity style={styles.select} onPress={() => setModalField('brand')}>
            <Text style={[styles.selectText, !selectedBrand && styles.placeholder]}>
              {selectedBrand || 'انتخاب کنید'}
            </Text>
            <Text style={styles.selectArrow}>◀</Text>
          </TouchableOpacity>

          {/* Model */}
          <Text style={styles.label}>مدل خودرو</Text>
          <TouchableOpacity style={styles.select} onPress={() => setModalField('model')}>
            <Text style={[styles.selectText, !selectedModel && styles.placeholder]}>
              {selectedModel || 'انتخاب کنید'}
            </Text>
            <Text style={styles.selectArrow}>◀</Text>
          </TouchableOpacity>

          <Text style={styles.label}>سال ساخت</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={(t) => setYear(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="مثلاً ۱۴۰۲"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>شماره VIN</Text>
          <TextInput
            style={[styles.input, styles.ltr]}
            value={vin}
            onChangeText={setVin}
            placeholder="VIN"
            placeholderTextColor="#aaa"
          />

          {/* Plate */}
          <Text style={styles.label}>شماره پلاک</Text>
          <View style={styles.plateRow}>
            <TextInput
              style={[styles.plateInput, styles.platePart]}
              value={plate3}
              onChangeText={(t) => setPlate3(t.replace(/\D/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="۳"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={[styles.plateInput, styles.plateLetter]} onPress={() => setModalField('plate')}>
              <Text style={[styles.plateLetterText, !plateLetter && styles.placeholder]}>
                {plateLetter || ' ح'}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.plateInput, styles.platePart]}
              value={plate2}
              onChangeText={(t) => setPlate2(t.replace(/\D/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="۲"
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={[styles.plateInput, styles.platePart]}
              value={plate1}
              onChangeText={(t) => setPlate1(t.replace(/\D/g, '').slice(0, 3))}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="۱۲۳"
              placeholderTextColor="#aaa"
            />
          </View>

          <Text style={styles.label}>رنگ خودرو</Text>
          <TextInput
            style={styles.input}
            value={color}
            onChangeText={setColor}
            placeholder="مثلاً سفید"
            placeholderTextColor="#aaa"
          />

          {/* Fuel Type */}
          <Text style={styles.label}>نوع سوخت</Text>
          <TouchableOpacity style={styles.select} onPress={() => setModalField('fuel')}>
            <Text style={[styles.selectText, !fuelType && styles.placeholder]}>
              {fuelType || 'انتخاب کنید'}
            </Text>
            <Text style={styles.selectArrow}>◀</Text>
          </TouchableOpacity>

          {/* Insurance Expiry */}
          <Text style={styles.label}>تاریخ انقضای بیمه</Text>
          <JalaliDatePicker
            value={insuranceDate}
            onChange={(greg) => setInsuranceDate(greg)}
            placeholder="انتخاب تاریخ"
          />

          <Text style={styles.label}>نام مالک خودرو</Text>
          <TextInput
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="نام مالک"
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>مرحله بعد</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <BrandPickerModal
        visible={modalField === 'brand'}
        brands={brands}
        selected={selectedBrand}
        onSelect={selectBrand}
        onClose={() => setModalField(null)}
      />
      <ModelPickerModal
        visible={modalField === 'model'}
        models={models}
        selected={selectedModel}
        loading={loadingModels}
        onSelect={(m) => setSelectedModel(m.name_fa || m.name)}
        onClose={() => setModalField(null)}
      />
      <PickerModal
        visible={modalField === 'fuel'}
        title="نوع سوخت"
        data={FUEL_TYPES}
        selected={fuelType}
        onSelect={setFuelType}
        onClose={() => setModalField(null)}
      />
      <PickerModal
        visible={modalField === 'plate'}
        title="حرف پلاک"
        data={PLATE_LETTERS}
        selected={plateLetter}
        onSelect={setPlateLetter}
        onClose={() => setModalField(null)}
      />
    </SafeAreaView>
  );
}
