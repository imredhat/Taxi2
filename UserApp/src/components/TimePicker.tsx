import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { padTwo, persianDigits } from '../utils/tripDateTime';
import DragTimeWheel from './DragTimeWheel';
import { pickerStyles as styles } from './pickerStyles';

export default function TimePicker({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const open = () => {
    const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    setHour(match ? Number(match[1]) : 9); setMinute(match ? Number(match[2]) : 0); setVisible(true);
  };
  return <>
    <TouchableOpacity style={styles.field} onPress={open} accessibilityRole="button" accessibilityLabel="انتخاب ساعت حرکت">
      <Text style={styles.label}>⏰ ساعت حرکت (۲۴ ساعته)</Text>
      <Text style={[styles.value, { writingDirection: 'ltr' }]}>{persianDigits(value || '09:00')}</Text>
    </TouchableOpacity>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={() => setVisible(false)} accessibilityLabel="بستن انتخاب ساعت" />
        <View style={styles.dialog} accessibilityViewIsModal>
          <Text style={styles.title}>انتخاب ساعت حرکت</Text>
          <Text style={[styles.title, { writingDirection: 'ltr' }]}>{persianDigits(`${padTwo(hour)}:${padTwo(minute)}`)}</Text>
          <View style={styles.timeColumns}>
            <DragTimeWheel label="ساعت" count={24} value={hour} onChange={setHour} />
            <DragTimeWheel label="دقیقه" count={60} value={minute} onChange={setMinute} />
          </View>
          <Text style={styles.dragHint}>برای تغییر، عددها را بالا یا پایین بکشید</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.confirm} onPress={() => { onChange(`${padTwo(hour)}:${padTwo(minute)}`); setVisible(false); }}><Text style={styles.confirmText}>تأیید ساعت</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={() => setVisible(false)}><Text style={styles.cancelText}>انصراف</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </>;
}
