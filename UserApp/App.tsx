import {listenToChatPush} from './src/services/devices';
import {passengerApi} from './src/services/passenger';
import React, { useEffect, useState } from 'react';
import { I18nManager, Platform, View } from 'react-native';
import { createNavigationContainerRef, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import { colors, fonts } from './src/theme';
import { pageTitle } from './src/navigationTitles';
import AddressesScreen from './src/screens/AddressesScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import DriverChatScreen from './src/screens/DriverChatScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import TripsScreen from './src/screens/TripsScreen';
import TripDetailsScreen from './src/screens/TripDetailsScreen';
import WalletScreen from './src/screens/WalletScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SupportScreen from './src/screens/SupportScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';
import TicketScreen from './src/screens/TicketScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import { AppDataProvider } from './src/state/AppData';

const Stack = createNativeStackNavigator();

const passengerNavigation=createNavigationContainerRef<any>();
function AppContent() {
  useEffect(()=>listenToChatPush(id=>{
    void passengerApi.trip(id).then(()=>{
      if(passengerNavigation.isReady())passengerNavigation.navigate('DriverChat',{rideId:id});
    }).catch(()=>{});
  }),[]);
  return (
    <NavigationContainer ref={passengerNavigation} theme={{ ...DefaultTheme, fonts: { regular: { fontFamily: fonts.regular, fontWeight: '400' }, medium: { fontFamily: fonts.medium, fontWeight: '500' }, bold: { fontFamily: fonts.bold, fontWeight: '700' }, heavy: { fontFamily: fonts.black, fontWeight: '900' } }, colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.onSurface, border: colors.outlineVariant, notification: colors.errorRed } }} documentTitle={{ formatter: (_, route) => pageTitle(route?.name) }}>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="DriverChat" component={DriverChatScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Addresses" component={AddressesScreen} />
        <Stack.Screen name="Trips" component={TripsScreen} />
        <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Ticket" component={TicketScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded] = useFonts({
    'Estedad-Regular': require('./assets/fonts/Estedad-Regular.ttf'),
    'Estedad-Medium': require('./assets/fonts/Estedad-Medium.ttf'),
    'Estedad-SemiBold': require('./assets/fonts/Estedad-SemiBold.ttf'),
    'Estedad-Bold': require('./assets/fonts/Estedad-Bold.ttf'),
    'Estedad-ExtraBold': require('./assets/fonts/Estedad-ExtraBold.ttf'),
    'Estedad-Black': require('./assets/fonts/Estedad-Black.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    const timer = setTimeout(() => setSplashDone(true), 1400);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

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
      const typography = document.createElement('style');
      typography.textContent = "html,body,button,input,textarea { font-family: 'Estedad-Regular', sans-serif; }";
      document.head.appendChild(typography);
      return () => { link.remove(); typography.remove(); };
    }
  }, []);

  if (!fontsLoaded || !splashDone) {
    return <View style={containerStyle as any}><StatusBar style="light" /><SplashScreen /></View>;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppDataProvider>
      <View style={containerStyle as any}>
        <AppContent />
      </View>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const containerStyle = Platform.select({
  web: {
    width: '100%',
    maxWidth: 390,
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  default: { flex: 1 },
});
