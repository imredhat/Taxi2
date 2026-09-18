import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../storage';
import { showToast } from '../utils';

export default function HomeScreen({ navigation }: any) {
  const handleLogout = async () => {
    await storage.removeItem('auth_token');
    await storage.removeItem('user_role');
    showToast('از حساب خارج شدید', 'success');
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>خانه</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>خروج</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontFamily: 'Estedad-Bold', color: '#063c34' },
  logoutBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Estedad-Bold',
    color: '#dc2626',
  },
});
