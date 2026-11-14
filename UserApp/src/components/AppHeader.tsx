import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import {colors, fonts, ltrLayout, rightAlignedText} from '../theme';
import { MENU_ITEMS } from '../navigationItems';
import { useAppData } from '../state/AppData';
import { persianDigits } from '../utils/tripDateTime';

export default function AppHeader({ navigation, title, onBack, guest = false }: {
  navigation: any; title?: string; onBack?: () => void; guest?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data, logout } = useAppData();
  const navigationState = navigation.getState?.();
  const currentRoute = navigationState?.routes?.[navigationState.index]?.name;
  const unread = data.notices.filter(item => !item.read).length;
  const go = (route: string) => { setOpen(false); navigation.navigate(route, { guest }); };
  return <>
    <View style={styles.header}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="باز کردن منو" style={styles.button} onPress={() => setOpen(true)}><Icon name="menu" color={colors.onSurface} /></TouchableOpacity>
      <View style={styles.heading}><Text style={styles.brand}>پویش تاکسی</Text><Text style={styles.subtitle}>{title || 'همراه سفرهای بین‌شهری شما'}</Text></View>
      <View style={styles.actions}>
        {!guest && <TouchableOpacity accessibilityLabel="اعلانات" style={styles.button} onPress={() => go('Notifications')}>
          <Icon name="notifications" color={colors.onSurface} />{!!unread && <View style={styles.badge}><Text style={styles.badgeText}>{persianDigits(unread > 99 ? '99+' : unread)}</Text></View>}
        </TouchableOpacity>}
        {!!onBack && <TouchableOpacity accessibilityLabel="بازگشت به صفحه قبل" style={styles.button} onPress={onBack}><Icon name="arrow_back" color={colors.primary} /></TouchableOpacity>}
      </View>
    </View>
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="بستن منو" />
        <View style={styles.drawerFrame}><SafeAreaView style={styles.drawer} accessibilityViewIsModal>
          <View style={styles.drawerHead}><View style={{ flex: 1 }}><Text style={styles.name}>{guest ? 'به پویش تاکسی خوش آمدید' : data.profile.name || 'مسافر پویش'}</Text><Text style={styles.subtitle}>{guest ? 'سفر بین‌شهری' : persianDigits(data.profile.phone || 'حساب کاربری')}</Text></View>
            <TouchableOpacity style={styles.button} accessibilityLabel="بستن منو" onPress={() => setOpen(false)}><Icon name="close" /></TouchableOpacity></View>
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            {MENU_ITEMS.filter(item => !guest || ['Support', 'About'].includes(item.route)).map(item => <TouchableOpacity key={item.route} style={[styles.item, currentRoute === item.route && styles.activeItem]} accessibilityRole="button" accessibilityState={{ selected: currentRoute === item.route }} onPress={() => go(item.route)}>
              <Icon name={item.icon} size={22} color={colors.primary} /><Text style={styles.itemText}>{item.label}</Text><Icon name="chevron_left" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>)}
          </ScrollView>
          <TouchableOpacity style={styles.item} onPress={async () => { setOpen(false); if (!guest) await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }}>
            <Icon name={guest ? 'person' : 'logout'} color={guest ? colors.primary : colors.errorRed} /><Text style={styles.itemText}>{guest ? 'ورود به حساب' : 'خروج از حساب کاربری'}</Text>
          </TouchableOpacity>
        </SafeAreaView></View>
      </View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  header: { ...ltrLayout, flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, gap: 10, minHeight: 80, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, flexShrink: 0 },
  button: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, paddingHorizontal: 6 }, brand: { fontFamily: fonts.bold, fontSize: 20, color: colors.primary, ...rightAlignedText },
  subtitle: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 22, color: colors.onSurfaceVariant, ...rightAlignedText },
  actions: { ...ltrLayout, flexDirection: 'row-reverse', gap: 8 },
  badge: { position: 'absolute', top: 2, right: 0, backgroundColor: colors.errorRed, minWidth: 17, borderRadius: 10, paddingHorizontal: 3 },
  badgeText: { color: colors.white, fontFamily: fonts.medium, fontSize: 10, textAlign: 'center' },
  overlay: { flex: 1, ...ltrLayout, alignItems: 'center', backgroundColor: 'rgba(23,33,42,0.32)' },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  drawerFrame: { width: '100%', maxWidth: 430, height: '100%', alignItems: 'flex-end', pointerEvents: 'box-none' },
  activeItem: { backgroundColor: colors.secondaryContainer },
  drawer: { borderTopLeftRadius: 28, borderBottomLeftRadius: 28, width: '85%', maxWidth: 340, height: '100%', backgroundColor: colors.surfaceContainerLow },
  drawerHead: { ...ltrLayout, flexDirection: 'row-reverse', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  name: { fontFamily: fonts.bold, color: colors.onSurface, fontSize: 17, textAlign: 'right' },
  item: { ...ltrLayout, flexDirection: 'row-reverse', gap: 12, minHeight: 54, alignItems: 'center', paddingHorizontal: 16, borderRadius: 18 },
  itemText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, textAlign: 'right', color: colors.onSurface },
});
