import LoadingState from '../components/LoadingState';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenPage, EmptyState, ui } from '../components/ScreenPage';
import SaveAddressDialog, { FavoriteAddress } from '../components/SaveAddressDialog';
import { passengerApi } from '../services/passenger';
import { Icon } from '../components/Icon';
import {colors, fonts, ltrLayout} from '../theme';

export default function AddressesScreen({ navigation, route }: any) {
  const [items, setItems] = useState<FavoriteAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState<FavoriteAddress | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => navigation.addListener('focus', () => setAttempt(value => value + 1)), [navigation]);
  useEffect(() => {
    let cancelled = false; setLoading(true); setError('');
    passengerApi.favorites().then(result => { if (!cancelled) setItems(result.items.map((item: FavoriteAddress) => ({ ...item, lat: Number(item.lat), lng: Number(item.lng) }))); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'دریافت آدرس‌ها انجام نشد.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [attempt]);
  const select = (item: FavoriteAddress, kind: 'start' | 'end') => navigation.navigate('Home', { savedAddress: { ...item, kind, selectionId: `${Date.now()}-${Math.random().toString(36).slice(2)}` } });
  const remove = async (id: string) => {
    if (busy) return; setBusy(true); setError('');
    try { await passengerApi.deleteFavorite(id); setItems(previous => previous.filter(item => item.id !== id)); setDeleting(null); }
    catch (err) { setError(err instanceof Error ? err.message : 'حذف آدرس انجام نشد.'); }
    finally { setBusy(false); }
  };
  return <ScreenPage navigation={navigation} title="آدرس‌های من">
    <Text style={ui.muted}>برای افزودن آدرس، نقطه‌ای را روی نقشه انتخاب کن و روی آیکن ذخیره کنار آن بزن.</Text>
    <TouchableOpacity style={[ui.button, styles.addButton]} onPress={() => navigation.navigate('Home')}><Text style={ui.buttonText}>انتخاب آدرس جدید از نقشه</Text></TouchableOpacity>
    {!!error && <View style={ui.card}><Text accessibilityRole="alert" style={ui.text}>{error}</Text><TouchableOpacity onPress={() => setAttempt(value => value + 1)}><Text style={ui.link}>تلاش مجدد</Text></TouchableOpacity></View>}
    {loading ? <LoadingState label="در حال دریافت آدرس‌ها…" /> : !error && !items.length ? <EmptyState title="هنوز آدرسی ذخیره نکرده‌ای" message="خانه، محل کار و مقصدهای همیشگی‌ات را ذخیره کن تا سریع‌تر سفر بسازی." /> : <View style={styles.list}>{items.map(item => <View key={item.id} style={styles.card}>
      <View style={styles.heading}>
        <Icon name="bookmark-outline" size={18} color={colors.primary} />
        <Text style={styles.name}>{item.name}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`ویرایش نام ${item.name}`} style={styles.iconButton} onPress={() => setEditing(item)}><Icon name="pencil-outline" size={18} color={colors.onSurfaceVariant} /></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`حذف آدرس ${item.name}`} disabled={busy} style={styles.iconButton} onPress={() => setDeleting(item.id)}><Icon name="trash-can-outline" size={18} color={colors.errorRed} /></TouchableOpacity>
      </View>
      <Text style={styles.address}>{item.address}</Text>
      <View style={styles.actions}>
        {(['start', 'end'] as const).map((kind: 'start' | 'end') => <TouchableOpacity key={kind} accessibilityRole="button" style={styles.selectButton} onPress={() => select(item, kind)}><Text style={styles.selectText}>{kind === 'start' ? 'انتخاب مبدأ' : 'انتخاب مقصد'}</Text></TouchableOpacity>)}
      </View>
      {deleting === item.id && <View><Text style={ui.text}>این آدرس حذف شود؟</Text><View style={styles.actions}><TouchableOpacity disabled={busy} style={styles.confirmButton} onPress={() => remove(item.id)}><Text style={[ui.link, { color: colors.errorRed }]}>{busy ? 'در حال حذف…' : 'بله، حذف آدرس'}</Text></TouchableOpacity><TouchableOpacity disabled={busy} style={styles.confirmButton} onPress={() => setDeleting(null)}><Text style={ui.link}>انصراف</Text></TouchableOpacity></View></View>}
    </View>)}</View>}
    <SaveAddressDialog point={editing} favoriteId={editing?.id} onClose={() => setEditing(null)} onSaved={() => setAttempt(value => value + 1)} />
  </ScreenPage>;
}

const styles = StyleSheet.create({
  addButton: { minHeight: 44, paddingVertical: 10, borderRadius: 14 },
  list: { gap: 10 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 16, padding: 12, gap: 4 },
  heading: { ...ltrLayout, flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.onSurface, textAlign: 'right' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  address: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 21, color: colors.onSurfaceVariant, textAlign: 'right' },
  actions: { ...ltrLayout, flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 8 },
  selectButton: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  selectText: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
  confirmButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
});
