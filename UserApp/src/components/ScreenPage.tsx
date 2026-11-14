import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import { Icon } from './Icon';
import {colors, fonts, ltrLayout} from '../theme';
export function ScreenPage({ navigation, title, active, children, guest = false }: { navigation: any; title: string; active?: string; children: React.ReactNode; guest?: boolean }) {
  return <View style={ui.root}><SafeAreaView style={ui.root} edges={['top', 'left', 'right']}>
    <AppHeader navigation={navigation} title={title} guest={guest} onBack={navigation.canGoBack?.() ? () => navigation.goBack() : undefined} />
    <ScrollView contentContainerStyle={ui.body} keyboardShouldPersistTaps="handled">{children}</ScrollView>
    {!guest && <BottomNav navigation={navigation} active={active} inFlow />}
  </SafeAreaView></View>;
}
export function MenuRow({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" style={ui.menuRow} onPress={onPress}><View style={ui.iconTile}><Icon name={icon} color={colors.primary} /></View><Text style={[ui.text, { flex: 1 }]}>{label}</Text><Icon name="chevron_left" size={18} color={colors.onSurfaceVariant} /></TouchableOpacity>;
}
export function EmptyState({ title, message }: { title: string; message: string }) {
  return <View style={ui.empty}><View style={ui.emptyIcon}><Icon name="route" size={36} color={colors.primary} /></View><Text style={[ui.title, { textAlign: 'center' }]}>{title}</Text><Text style={[ui.muted, { textAlign: 'center' }]}>{message}</Text></View>;
}
export const ui = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, body: { padding: 24, gap: 18, paddingBottom: 32 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 20, gap: 12, borderWidth: 1, borderColor: colors.outlineVariant },
  empty: { backgroundColor: colors.surface, borderRadius: 28, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: 24, paddingVertical: 36, gap: 14, alignItems: 'center' },
  emptyIcon: { width: 80, height: 80, borderRadius: 28, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconTile: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  menuRow: { ...ltrLayout, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 10, minHeight: 62 },
  hero: { backgroundColor: colors.primary, borderRadius: 26, padding: 24, gap: 14 },
  heroText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 24, color: colors.onPrimary, textAlign: 'right' },
  heroTitle: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.onPrimary, textAlign: 'right' },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.onSurface, textAlign: 'right' },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 25, color: colors.onSurface, textAlign: 'right' },
  muted: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 23, color: colors.onSurfaceVariant, textAlign: 'right' },
  row: { ...ltrLayout, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 18, padding: 14, minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
  link: { fontFamily: fonts.medium, color: colors.primary, fontSize: 14, textAlign: 'right', paddingVertical: 8 },
  input: { fontFamily: fonts.regular, color: colors.onSurface, backgroundColor: colors.surface, textAlign: 'right', borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 18, minHeight: 58, padding: 16, fontSize: 14 },
});
