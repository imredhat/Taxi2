import AsyncStorage from '@react-native-async-storage/async-storage';

const webStorage = typeof localStorage !== 'undefined' ? localStorage : null;

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return webStorage?.getItem(key) ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      webStorage?.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      webStorage?.removeItem(key);
    }
  },
};
