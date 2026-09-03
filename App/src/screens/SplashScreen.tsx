import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { storage } from '../storage';
import styles from '../styles/SplashScreen.styles';

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = await storage.getItem('auth_token');
      navigation.replace(token ? 'Home' : 'Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <View style={styles.carShape}>
          <View style={styles.carRoof} />
        </View>
      </View>
      <Text style={styles.title}>پویش تاکسی</Text>
      <Text style={styles.subtitle}>سفر شهری و بین‌شهری، دقیق و امن</Text>
    </View>
  );
}
