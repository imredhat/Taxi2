import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export default function LoadingState({ label = 'در حال بارگذاری…' }: { label?: string }) {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.timing(rotation, { toValue: 1, duration: 1150, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
    animation.start(); return () => animation.stop();
  }, [rotation]);
  return <View style={styles.root} accessibilityRole="progressbar" accessibilityLabel={label}>
    <View style={styles.radar}>
      <View style={[styles.ring, { width: 104, height: 104, borderRadius: 52 }]} /><View style={[styles.ring, { width: 72, height: 72, borderRadius: 36 }]} />
      <Animated.View style={[styles.scan, { transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}><View style={styles.beam} /></Animated.View>
      <View style={styles.dot} />
    </View>
    <Text style={styles.label}>{label}</Text>
  </View>;
}
const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 18 },
  radar: { width: 128, height: 128, borderRadius: 64, backgroundColor: '#eefaf6', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 2, borderColor: 'rgba(7,132,108,0.2)' },
  scan: { position: 'absolute', width: 120, height: 120, alignItems: 'flex-start', justifyContent: 'center' },
  beam: { width: 60, height: 2, borderRadius: 2, backgroundColor: 'rgba(7,132,108,0.6)' },
  dot: { width: 34, height: 34, borderWidth: 7, borderColor: '#ffffff', borderRadius: 17, backgroundColor: colors.primary },
  label: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 28, color: colors.onSurface, textAlign: 'center' },
});
