import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import type { MapPoint } from './NeshanMapPicker';
import { reverseAddress, NESHAN_SERVICE_KEY } from '../services/neshan';
import { persianDigits } from '../utils/tripDateTime';
import { fonts, colors } from '../theme';

export default function PointAddress({ point }: { point?: MapPoint }) {
  const [result, setResult] = useState({ key: '', address: '', error: '' });
  const [attempt, setAttempt] = useState(0);
  const key = point ? `${point.id}:${point.lat}:${point.lng}` : '';
  useEffect(() => {
    if (!point || point.address) return;
    const controller = new AbortController();
    setResult({ key, address: '', error: '' });
    reverseAddress(point, NESHAN_SERVICE_KEY, controller.signal).then(address => {
      if (!controller.signal.aborted) setResult({ key, address, error: '' });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ key, address: '', error: error instanceof Error ? error.message : 'دریافت آدرس ناموفق بود.' });
    });
    return () => controller.abort();
  }, [key, point?.address, attempt]);
  const address = point?.address || (result.key === key ? result.address : '');
  const error = result.key === key ? result.error : '';
  return <View style={{ flex: 1 }}>
    <Text style={styles.address}>{!point ? 'انتخاب نشده' : address ? persianDigits(address) : error || 'در حال دریافت آدرس...'}</Text>
    {!!point && !address && !!error && <TouchableOpacity onPress={() => setAttempt(value => value + 1)}><Text style={styles.retry}>دریافت دوباره آدرس</Text></TouchableOpacity>}
  </View>;
}
const styles = StyleSheet.create({
  address: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 24, color: colors.onSurface, textAlign: 'right', writingDirection: 'rtl' },
  retry: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary, textAlign: 'right', paddingVertical: 6 },
});
