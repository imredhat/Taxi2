import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors, fonts } from '../theme';

const items = [
  { key: 'home', label: 'خانه', icon: 'home', route: 'Home' },
  { key: 'trips', label: 'سفرهای من', icon: 'route', route: 'Booking' },
  { key: 'profile', label: 'پروفایل', icon: 'person', route: 'Profile' },
];

export default function BottomNav({ navigation, active }: any) {
  return (
    <View style={styles.bar}>
      {items.map((it) => {
        const isActive = active === it.key;
        return (
          <TouchableOpacity
            key={it.key}
            style={styles.item}
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
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.asphaltSurface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
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
  },
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
