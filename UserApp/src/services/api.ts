import { Platform } from 'react-native';
import { isSessionToken, storage } from '../storage';
const developmentApiUrl = Platform.OS === 'web' && typeof location !== 'undefined'
  ? `${location.protocol}//${location.hostname}:3001`
  : Platform.OS === 'android' ? 'http://172.20.10.11:3001' : 'http://localhost:3001';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL?.trim() || developmentApiUrl).replace(/\/$/, '');
async function apiRequest(path: string, body: unknown, authenticated = false, method?: string) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const token = authenticated ? await storage.getItem('auth_token') : null;
    if (authenticated && !isSessionToken(token)) throw new Error('برای ادامه، دوباره با کد پیامکی وارد حساب شوید.');
    const response = await fetch(`${API_URL}${path}`, { method: method || (body === undefined ? 'GET' : 'POST'), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (authenticated && response.status === 401 && token === await storage.getItem('auth_token')) await storage.removeItem('auth_token');
    if (!response.ok) throw new Error(response.status === 401 ? 'نشست شما منقضی شده است؛ دوباره وارد شوید.' : data.error || 'درخواست انجام نشد؛ دوباره تلاش کنید.');
    return data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('پاسخ سرور طول کشید؛ با همین درخواست دوباره تلاش کنید.');
    if (error instanceof TypeError) throw new Error('ارتباط با سرور برقرار نشد؛ اتصال اینترنت را بررسی کنید.');
    throw error;
  } finally { clearTimeout(timer); }
}

export const apiPost = (path: string, body: unknown, authenticated = false) => apiRequest(path, body, authenticated);
export const apiGet = (path: string, authenticated = true) => apiRequest(path, undefined, authenticated);

export const apiPatch = (path: string, body: unknown) => apiRequest(path, body, true, 'PATCH');
export const apiPut = (path: string, body: unknown) => apiRequest(path, body, true, 'PUT');
export const apiDelete = (path: string) => apiRequest(path, undefined, true, 'DELETE');
