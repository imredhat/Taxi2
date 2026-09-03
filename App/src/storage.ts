import AsyncStorage from '@react-native-async-storage/async-storage';

// ponytail: on web the AsyncStorage native module can be null; fall back to localStorage
// so auth state still works in the browser. Ceiling: no namespacing/encryption.
const webStorage =
  typeof localStorage !== 'undefined' ? localStorage : null;

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
};
