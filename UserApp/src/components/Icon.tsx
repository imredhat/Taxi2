import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

const MAP: Record<string, string> = {
  call: 'phone',
  emergency_home: 'medical-bag',
  verified_user: 'verified',
  account_balance_wallet: 'wallet',
  location_on: 'map-marker',
  shield_person: 'shield',
};

export function Icon({
  name,
  size = 24,
  color = '#ffffff',
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  const mc = MAP[name] || name.replace(/_/g, '-');
  return <MaterialCommunityIcons name={mc as any} size={size} color={color} style={style} />;
}
