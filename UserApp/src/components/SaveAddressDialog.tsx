import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { passengerApi } from '../services/passenger';
import { colors, fonts } from '../theme';
import { ui } from './ScreenPage';

export interface FavoriteAddress { id: string; name: string; address: string; lat: number; lng: number }
type AddressPoint = { lat: number; lng: number; address?: string; name?: string };
export default function SaveAddressDialog({ point, favoriteId, onClose, onSaved }: {
  point: AddressPoint | null; favoriteId?: string; onClose: () => void; onSaved?: () => void;
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setName(point?.name || ''); setError(''); }, [point]);
  const save = async () => {
    if (!point?.address || !name.trim() || busy) return;
    setBusy(true); setError('');
    try {
      await passengerApi.saveFavorite({ name: name.trim(), address: point.address, lat: point.lat, lng: point.lng }, favoriteId);
      onSaved?.(); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'ذخیره آدرس انجام نشد.'); }
    finally { setBusy(false); }
  };
  return <Modal visible={!!point} transparent animationType="fade" onRequestClose={() => { if (!busy) onClose(); }}>
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.dialog} accessibilityViewIsModal>
        <Text style={ui.title}>{favoriteId ? 'ویرایش نام آدرس' : 'ذخیره در آدرس‌های من'}</Text>
        <Text style={ui.muted}>{point?.address}</Text>
        <TextInput accessibilityLabel="نام آدرس" placeholder="مثلاً خانه، محل کار یا خانه پدری" placeholderTextColor={colors.onSurfaceVariant} style={ui.input} value={name} onChangeText={setName} maxLength={80} editable={!busy} autoFocus />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <TouchableOpacity accessibilityRole="button" disabled={busy || !name.trim() || !point?.address} style={[ui.button, (busy || !name.trim()) && { opacity: 0.5 }]} onPress={save}><Text style={ui.buttonText}>{busy ? 'در حال ذخیره…' : 'ذخیره آدرس'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={onClose}><Text style={[ui.link, { textAlign: 'center' }]}>انصراف</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(23,33,42,0.32)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 390, padding: 24, borderRadius: 28, backgroundColor: colors.surface, gap: 16 },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.errorRed, textAlign: 'right' },
});
