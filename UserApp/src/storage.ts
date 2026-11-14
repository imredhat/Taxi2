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
      if (webStorage) webStorage.setItem(key, value);
      else if (key === 'auth_token') throw new Error('ذخیرهٔ نشست روی دستگاه انجام نشد. نسخهٔ اپ را به‌روز کنید و دوباره وارد شوید.');
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

export function isSessionToken(value:string|null):value is string {
  return typeof value==='string' && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
}

export async function saveSessionToken(token:string) {
  if (!isSessionToken(token)) throw new Error('پاسخ ورود معتبر نیست.');
  await storage.setItem('auth_token', token);
  if (await storage.getItem('auth_token') !== token) {
    throw new Error('نشست روی دستگاه ذخیره نشد؛ دوباره تلاش کنید.');
  }
}
