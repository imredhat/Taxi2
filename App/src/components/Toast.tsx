import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, Platform, StatusBar } from 'react-native';

type ToastType = 'error' | 'success' | 'info';

interface ToastMessage {
  text: string;
  type: ToastType;
}

let _show: ((msg: ToastMessage) => void) | null = null;

export function showToast(text: string, type: ToastType = 'error') {
  _show?.({ text, type });
}

const BG: Record<ToastType, string> = {
  error: '#dc3545',
  success: '#07846c',
  info: '#3b82f6',
};

const TOP_OFFSET = Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight ?? 0) + 20;

export default function Toast() {
  const [msg, setMsg] = useState<ToastMessage | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    _show = (m: ToastMessage) => {
      clearTimeout(timer.current);
      setMsg(m);
      opacity.setValue(0);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setMsg(null));
    };
    return () => { _show = null; };
  }, []);

  if (!msg) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: TOP_OFFSET,
          opacity,
          backgroundColor: BG[msg.type],
          transform: [{
            translateY: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{msg.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    ...Platform.select({
      android: { elevation: 6 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8 },
    }),
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Estedad-Bold',
    textAlign: 'center',
  },
});
