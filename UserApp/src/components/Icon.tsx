import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

// Maps Google Material icon names (used in screens) → MaterialCommunityIcons equivalents
const MAP: Record<string, string> = {
  // navigation
  local_taxi: 'taxi',
  arrow_back: 'arrow-left',
  arrow_forward: 'arrow-right',
  chevron_left: 'chevron-left',
  route: 'routes',
  notifications: 'bell-outline',
  logout: 'exit-to-app',

  // contact / user
  smartphone: 'cellphone',
  verified_user: 'account-check',
  account_balance_wallet: 'wallet-outline',
  person: 'account',
  menu: 'menu',
  close: 'close',

  // action / utility
  gavel: 'gavel',
  shield_person: 'shield-account',
  history_edu: 'school-outline',
  call: 'phone',
  emergency_home: 'medical-bag',
  schedule: 'clock-outline',
  settings: 'cog',
  support_agent: 'chat-processing',
  location_on: 'map-marker-outline',
  flag: 'flag',
  trending_flat: 'trending-up',
  home: 'home',
  distance: 'ruler',
  luggage: 'luggage',
  calendar_month: 'calendar-month',
  verified: 'check-decil-circle',
  chat: 'chat',
  shield_with_heart: 'shield-heart',
  share: 'share',
  commute: 'car-side',
  add_card: 'credit-card-plus',
  check_circle: 'check-circle',
  // extra icons used across screens
  trip: 'map-marker-route',
  security: 'shield-check',
  date_range: 'calendar-range',
  paw: 'paw-print',
  timer_sand: 'timer-sand-full',
  calendar_clock: 'calendar-clock',
  luggage_check: 'luggage-perfect',
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
