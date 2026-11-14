import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import {gregorianToJalali,jalaliToGregorian,JALALI_MONTHS,toFa} from '../jalaliDate';

function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Esfand: 29 in leap years, 30 otherwise
  const [gy] = jalaliToGregorian(jy, jm, 1);
  return ((gy + 1) % 4 === 0) ? 30 : 29;
}

// ── Component ──
interface Props {
  value?: string; // 'YYYY-MM-DD' Gregorian
  onChange: (gregorianDate: string, jalaliDisplay: string) => void;
  placeholder?: string;
  minimumYear?: number;
  maximumYear?: number;
}

export default function JalaliDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  minimumYear = 1320,
  maximumYear = 1420,
}: Props) {
  const [visible, setVisible] = useState(false);

  // Initialize from Gregorian value or default to today
  const initJalali = value
    ? (() => {
        const [y, m, d] = value.split('-').map(Number);
        return gregorianToJalali(y, m, d);
      })()
    : (() => {
        const now = new Date();
        return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
      })();

  const [selYear, setSelYear] = useState(initJalali[0]);
  const [selMonth, setSelMonth] = useState(initJalali[1]);
  const [selDay, setSelDay] = useState(initJalali[2]);

  const years = Array.from({ length: maximumYear - minimumYear + 1 }, (_, i) => maximumYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxDay = daysInJalaliMonth(selYear, selMonth);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const confirm = () => {
    const day = Math.min(selDay, maxDay);
    const [gy, gm, gd] = jalaliToGregorian(selYear, selMonth, day);
    const greg = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
    const display = `${toFa(selYear)}/${toFa(selMonth)}/${toFa(day)}`;
    onChange(greg, display);
    setVisible(false);
  };

  const displayText = value
    ? (() => {
        const [y, m, d] = value.split('-').map(Number);
        const [jy, jm, jd] = gregorianToJalali(y, m, d);
        return `${toFa(jy)}/${toFa(jm)}/${toFa(jd)}`;
      })()
    : '';

  return (
    <>
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <Text style={[styles.inputText, !displayText && styles.placeholder]}>
          {displayText || placeholder}
        </Text>
        <Text style={styles.arrow}>◀</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{toFa(selYear)}/{toFa(selMonth)}/{toFa(selDay)}</Text>
            </View>

            <View style={styles.pickerRow}>
              <ColumnPicker
                data={days}
                selected={selDay}
                onSelect={setSelDay}
                label={(n) => toFa(n)}
              />
              <ColumnPicker
                data={months}
                selected={selMonth}
                onSelect={setSelMonth}
                label={(n) => JALALI_MONTHS[n - 1]}
              />
              <ColumnPicker
                data={years}
                selected={selYear}
                onSelect={setSelYear}
                label={(n) => toFa(n)}
              />
            </View>

            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
                <Text style={styles.confirmText}>تایید</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ── Column Picker (simple scroll list) ──
function ColumnPicker({
  data,
  selected,
  onSelect,
  label,
}: {
  data: number[];
  selected: number;
  onSelect: (n: number) => void;
  label: (n: number) => string;
}) {
  const ref = React.useRef<FlatList>(null);

  React.useEffect(() => {
    const idx = data.indexOf(selected);
    if (idx >= 0) {
      setTimeout(() => ref.current?.scrollToIndex({ index: idx, animated: false }), 50);
    }
  }, [selected]);

  return (
    <View style={colStyles.col}>
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(n) => String(n)}
        showsVerticalScrollIndicator={false}
        style={colStyles.list}
        getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[colStyles.item, item === selected && colStyles.itemSelected]}
            onPress={() => onSelect(item)}
          >
            <Text style={[colStyles.itemText, item === selected && colStyles.itemTextSelected]}>
              {label(item)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#dfe8e4',
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Estedad-Regular',
    color: '#17212a',
     textAlign: Platform.OS === 'android' ? 'left' : 'right'
  },
  placeholder: {
    color: '#aaa',
  },
  arrow: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
    ...Platform.select({
      web: { maxWidth: 430, alignSelf: 'center', width: '100%' as any },
    }),
  },
  pickerCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    ...Platform.select({
      android: { elevation: 8 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.15, shadowRadius: 10 },
    }),
  },
  pickerHeader: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f0',
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: 'Estedad-Bold',
    color: '#17212a',
    
  },
  pickerRow: {
    flexDirection: 'row-reverse',
    height: 200,
    paddingHorizontal: 16,
    gap: 8,
  },
  pickerActions: {
    flexDirection: 'row-reverse',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#e9efed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Estedad-Bold',
    color: '#17212a',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#07846c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontFamily: 'Estedad-Bold',
    color: '#fff',
  },
});

const colStyles = StyleSheet.create({
  col: { flex: 1 },
  list: { flex: 1 },
  item: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  itemSelected: {
    backgroundColor: '#e1f6f0',
  },
  itemText: {
    fontSize: 15,
    fontFamily: 'Estedad-Regular',
    color: '#6a7673',
    
  },
  itemTextSelected: {
    color: '#07846c',
    fontFamily: 'Estedad-Bold',
    
  },
});
