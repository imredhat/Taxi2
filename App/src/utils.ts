import {Platform} from 'react-native';
import axios from 'axios';
import { showToast } from './components/Toast';

export { showToast };

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || (Platform.OS==='android'?'http://10.0.2.2:3001':'http://localhost:3001')).replace(/\/$/,'');

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.message ||
      'خطا در ارتباط با سرور';
    showToast(msg, 'error');
    return Promise.reject(err);
  },
);
