import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import {colors, fonts, ltrLayout} from '../theme';

const items = [
  { key: 'home', label: 'خانه', icon: 'home', route: 'Home' },
  { key: 'trips', label: 'سفرهای من', icon: 'route', route: 'Trips' },
  { key: 'wallet', label: 'کیف پول', icon: 'account_balance_wallet', route: 'Wallet' },
  { key: 'profile', label: 'پروفایل', icon: 'person', route: 'Profile' },
];

export default function BottomNav({ navigation, active, inFlow = false }: any) {
  return (
    <View style={[styles.bar, inFlow && styles.inFlow]}>
      {items.map((it) => {
        const isActive = active === it.key;
        return (
          <TouchableOpacity
            key={it.key}
            accessibilityRole="button"
            accessibilityLabel={it.label}
            accessibilityState={{ selected: isActive }}
            style={[styles.item, isActive && styles.activeItem]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(it.route)}
          >
            <Icon
              name={it.icon}
              size={24}
              color={isActive ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  inFlow: {
    position: 'relative',
    flexShrink: 0,
  },
  bar: {
    ...ltrLayout,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.asphaltSurface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 12,
    zIndex: 50,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  activeItem: { backgroundColor: colors.secondaryContainer, borderRadius: 18 },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  labelActive: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
});
