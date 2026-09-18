import React, { useEffect } from 'react';
import { I18nManager, Platform, View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
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
    // Inject Leaflet CSS for web maps
    if (Platform.OS === 'web') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#ffd899" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={containerStyle as any}>
        <AppContent />
      </View>
    </SafeAreaProvider>
  );
}

const containerStyle = Platform.select({
  web: {
    width: '100%',
    maxWidth: 430,
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  default: { flex: 1 },
});

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#03151e',
  },
});
