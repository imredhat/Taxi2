import React, { useEffect } from 'react';
import { I18nManager, Platform, View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignupStep1Screen from './src/screens/signup/Signup_1';
import SignupStep2Screen from './src/screens/signup/Signup_2';
import SignupStep3Screen from './src/screens/signup/Signup_3';
import SignupStep4Screen from './src/screens/signup/Signup_4';
import SignupStep5Screen from './src/screens/signup/Signup_5';
import SignupStep6Screen from './src/screens/signup/Signup_6';
import SignupStep7Screen from './src/screens/signup/Signup_7';
import SignupStep8Screen from './src/screens/signup/Signup8';
import Toast from './src/components/Toast';

const Stack = createNativeStackNavigator();

function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="SignupStep1" component={SignupStep1Screen} />
        <Stack.Screen name="SignupStep2" component={SignupStep2Screen} />
        <Stack.Screen name="SignupStep3" component={SignupStep3Screen} />
        <Stack.Screen name="SignupStep4" component={SignupStep4Screen} />
        <Stack.Screen name="SignupStep5" component={SignupStep5Screen} />
        <Stack.Screen name="SignupStep6" component={SignupStep6Screen} />
        <Stack.Screen name="SignupStep7" component={SignupStep7Screen} />
        <Stack.Screen name="SignupStep8" component={SignupStep8Screen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Estedad-Regular': require('./assets/fonts/Estedad-Regular.ttf'),
    'Estedad-Medium': require('./assets/fonts/Estedad-Medium.ttf'),
    'Estedad-SemiBold': require('./assets/fonts/Estedad-SemiBold.ttf'),
    'Estedad-Bold': require('./assets/fonts/Estedad-Bold.ttf'),
    'Estedad-ExtraBold': require('./assets/fonts/Estedad-ExtraBold.ttf'),
    'Estedad-Black': require('./assets/fonts/Estedad-Black.ttf'),
  });

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
    if (Platform.OS === 'web') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'fa';
      const style = document.createElement('style');
      style.textContent = `#root { direction: rtl; text-align: right; } input, textarea { outline: none !important; border-color: #dfe8e4 !important; box-shadow: none !important; }`;
      document.head.appendChild(style);
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#07846c" />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={webStyles.outer}>
        <View style={webStyles.phone}>
          <Toast />
          <AppContent />
        </View>
      </View>
    );
  }

  return (
    <>
      <Toast />
      <AppContent />
    </>
  );
}

const loadingStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#063c34' },
});

const webStyles = StyleSheet.create({
  outer: {
    width: '100vw' as any,
    height: '100vh' as any,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: '100%' as any,
    maxWidth: 430,
    height: '100vh' as any,
    backgroundColor: '#ffffff',
    overflow: 'hidden' as any,
  },
});
