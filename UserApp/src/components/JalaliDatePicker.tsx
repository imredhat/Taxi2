import { jalaaliMonthLength } from 'jalaali-js';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { JALALI_MONTHS, calendarDays, displayJalaliDate, parseJalaliDate, persianDigits, serializeJalaliDate, todayInTehran } from '../utils/tripDateTime';
import { pickerStyles as styles } from './pickerStyles';

interface JalaliDatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  label?: string;
  purpose?: 'departure' | 'birthday';
  disabled?: boolean;
}

export default function JalaliDatePicker({ value, onChange, label, purpose = 'departure', disabled = false }: JalaliDatePickerProps) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(() => parseJalaliDate(value) || todayInTehran());
  const [month, setMonth] = useState(() => ({ year: draft.jy, month: draft.jm }));
  const today = todayInTehran();
  const birthday = purpose === 'birthday';
  const title = birthday ? 'انتخاب تاریخ تولد' : 'انتخاب تاریخ حرکت';
  const [choosing, setChoosing] = useState<'day'|'month'|'year'>('day');
  const days = calendarDays(month.year, month.month);
  const open = () => {
    const selected = parseJalaliDate(value) || (birthday ? { jy: today.jy - 30, jm: today.jm, jd: 1 } : todayInTehran());
    setChoosing(birthday && !value ? 'year' : 'day');
    setDraft(selected); setMonth({ year: selected.jy, month: selected.jm }); setVisible(true);
  };
  const moveMonth = (delta: number) => setMonth(previous => {
    const date = new Date(Date.UTC(previous.year, previous.month - 1 + delta, 1));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
  });
  const chooseYear = (year:number) => { setMonth(previous=>({...previous,year})); setDraft(previous=>({...previous,jy:year,jd:Math.min(previous.jd,jalaaliMonthLength(year,previous.jm))})); setChoosing('month'); };
  const chooseMonth = (value:number) => { setMonth(previous=>({...previous,month:value})); setDraft(previous=>({...previous,jm:value,jd:Math.min(previous.jd,jalaaliMonthLength(previous.jy,value))})); setChoosing('day'); };
  const future = birthday && serializeJalaliDate(draft) > serializeJalaliDate(today);
  return (
    <>
      {birthday ? <View style={[styles.field,styles.clearableField]}>
        <TouchableOpacity style={styles.fieldContent} disabled={disabled} onPress={open} accessibilityRole="button" accessibilityLabel={title}>
          <Text style={styles.label}>{label ?? 'تاریخ تولد'}</Text>
          <Text style={styles.value}>{value?displayJalaliDate(value):title}</Text>
        </TouchableOpacity>
        {!!value&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="پاک کردن تاریخ تولد" disabled={disabled} style={styles.clearDate} onPress={()=>onChange('')}><Text style={styles.navText}>×</Text></TouchableOpacity>}
      </View> : <>
      <TouchableOpacity style={styles.field} disabled={disabled} onPress={open} accessibilityRole="button" accessibilityLabel={title}>
        <Text style={styles.label}>{label ?? (birthday ? 'تاریخ تولد' : '📅 تاریخ حرکت')}</Text>
        <Text style={styles.value}>{value?displayJalaliDate(value):title}</Text>
      </TouchableOpacity>
      </>}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropPress} onPress={() => setVisible(false)} accessibilityLabel="بستن تقویم" />
          <View style={styles.dialog} accessibilityViewIsModal>
            <Text style={styles.title}>{title}</Text>
            <ScrollView key={choosing} style={[styles.calendarScroll,birthday&&choosing==='year'&&styles.yearScroll]} contentContainerStyle={styles.calendarContent} showsVerticalScrollIndicator={birthday&&choosing==='year'}>
              {birthday && choosing === 'year' ? Array.from({length:31},(_,row)=><View key={row} style={styles.optionRow}>{Array.from({length:4},(_,column)=>{
                const year=today.jy-row*4-column;
                return year<today.jy-120?<View key={column} style={styles.optionCell}/>:<TouchableOpacity key={year} accessibilityRole="button" accessibilityLabel={`سال ${persianDigits(year)}`} style={[styles.optionCell,year===month.year&&styles.selected]} onPress={()=>chooseYear(year)}><Text style={[styles.dayText,year===month.year&&styles.selectedText]}>{persianDigits(year)}</Text></TouchableOpacity>;
              })}</View>) : birthday && choosing === 'month' ? Array.from({length:4},(_,row)=><View key={row} style={styles.optionRow}>{Array.from({length:3},(_,column)=>{
                const index=row*3+column,name=JALALI_MONTHS[index];
                return <TouchableOpacity key={name} accessibilityRole="button" accessibilityLabel={`ماه ${name}`} style={styles.optionCell} onPress={()=>chooseMonth(index+1)}><Text style={styles.dayText}>{name}</Text></TouchableOpacity>;
              })}</View>) : <>
              <View style={styles.nav}>
                <TouchableOpacity style={styles.navButton} onPress={() => moveMonth(-1)} accessibilityLabel="ماه قبل"><Text style={styles.navText}>‹</Text></TouchableOpacity>
                {birthday?<TouchableOpacity accessibilityRole="button" accessibilityLabel="انتخاب سال و ماه تولد" style={[styles.navButton,{flex:1,width:undefined}]} onPress={()=>setChoosing('year')}><Text style={styles.value}>{JALALI_MONTHS[month.month-1]} {persianDigits(month.year)}</Text></TouchableOpacity>:<Text style={styles.title}>{JALALI_MONTHS[month.month - 1]} {persianDigits(month.year)}</Text>}
                <TouchableOpacity style={styles.navButton} onPress={() => moveMonth(1)} accessibilityLabel="ماه بعد"><Text style={styles.navText}>›</Text></TouchableOpacity>
              </View>
              <View style={styles.row}>{['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => <View key={index} style={styles.day}><Text style={styles.weekday}>{day}</Text></View>)}</View>
              {Array.from({ length: 6 }, (_, week) => <View key={week} style={styles.row}>
                {days.slice(week * 7, week * 7 + 7).map((day, index) => {
                  const selected = day === draft.jd && month.year === draft.jy && month.month === draft.jm;
                  const unavailable = birthday && day !== null && serializeJalaliDate({jy:month.year,jm:month.month,jd:day}) > serializeJalaliDate(today);
                  const isToday = day === today.jd && month.year === today.jy && month.month === today.jm;
                  return day === null ? <View key={index} style={styles.day} /> : <TouchableOpacity key={index}
                    accessibilityRole="button" disabled={unavailable} accessibilityState={{ selected, disabled:unavailable }} accessibilityLabel={displayJalaliDate(serializeJalaliDate({ jy: month.year, jm: month.month, jd: day }))}
                    style={[styles.day, isToday && styles.today, selected && styles.selected, unavailable && {opacity:0.3}]}
                    onPress={() => setDraft({ jy: month.year, jm: month.month, jd: day })}>
                    <Text style={[styles.dayText, selected && styles.selectedText]}>{persianDigits(day)}</Text>
                  </TouchableOpacity>;
                })}
              </View>)}
              {!birthday&&<TouchableOpacity style={styles.cancel} onPress={() => { setDraft(today); setMonth({ year: today.jy, month: today.jm }); }}><Text style={styles.cancelText}>امروز</Text></TouchableOpacity>}
              </>}
            </ScrollView>
            <View style={styles.actions}>
              <TouchableOpacity disabled={future||choosing!=='day'} style={[styles.confirm,(future||choosing!=='day')&&{opacity:0.4}]} onPress={() => { onChange(serializeJalaliDate(draft)); setVisible(false); }}><Text style={styles.confirmText}>تأیید تاریخ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancel} onPress={() => setVisible(false)}><Text style={styles.cancelText}>انصراف</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
