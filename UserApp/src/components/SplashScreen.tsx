import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import {fonts, ltrLayout} from '../theme';

// Mirrors the splash-screen, brand-car and moving-road in the passenger dashboard.
export default function SplashScreen() {
  const drive = useRef(new Animated.Value(-44)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.timing(drive, { toValue: 205, duration: 1400, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
    animation.start();
    return () => animation.stop();
  }, [drive]);
  return <View style={[styles.root, Platform.OS === 'web' ? { backgroundImage: 'linear-gradient(160deg, rgba(2,78,66,0.88), rgba(10,126,100,0.92))' } as any : { experimental_backgroundImage: 'linear-gradient(160deg, rgba(2,78,66,0.88), rgba(10,126,100,0.92))' }]} accessibilityLabel="در حال بارگذاری پویش تاکسی">
    <View style={styles.mark}>
      <View style={styles.car}><View style={styles.roof} /><View style={[styles.wheel, { left: 8 }]} /><View style={[styles.wheel, { right: 8 }]} /></View>
    </View>
    <Text style={styles.title}>پویش تاکسی</Text>
    <Text style={styles.subtitle}>سفر شهری و بین‌شهری، دقیق و امن</Text>
    <View style={styles.road}>
      <View style={[styles.roadLine, { top: 20 }]} /><View style={[styles.roadLine, { bottom: 18 }]} />
      <Animated.View style={[styles.movingCar, { transform: [{ translateX: drive }] }]} />
    </View>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', backgroundColor: '#063c34', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  mark: { width: 106, height: 106, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.2, shadowRadius: 30 },
  car: { width: 54, height: 28, borderTopLeftRadius: 14, borderTopRightRadius: 18, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#ffbe4d' },
  roof: { position: 'absolute', width: 24, height: 12, top: -8, right: 15, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: '#ffffff' },
  wheel: { position: 'absolute', bottom: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#17212a' },
  title: { fontFamily: fonts.black, fontSize: 34, color: '#ffffff', marginTop: 16, textAlign: 'center' },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.78)', textAlign: 'center' },
  road: { width: 180, height: 56, marginTop: 28, overflow: 'hidden', ...ltrLayout },
  roadLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.28)' },
  movingCar: { position: 'absolute', left: 0, top: 18, width: 34, height: 18, borderRadius: 9, backgroundColor: '#ffffff' },
});
