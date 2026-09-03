import axios from 'axios';
import { showToast } from './components/Toast';

export { showToast };

export const API_URL = 'http://192.168.1.106:3001';

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
