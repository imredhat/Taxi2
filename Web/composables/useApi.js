// fetch با timeout — جلوی اسپینر بی‌پایان رو می‌گیره
// اگه سرور پایین باشه یا دیر جواب بده، بعد از timeoutMs AbortController می‌زنه
import { readAdminSession, clearAdminSession } from '~/utils/adminSession'

export const useApi = () => {
  async function apiFetch(url, opts = {}, timeoutMs = 15000) {
    const token = readAdminSession()?.token
    if (!token) {
      window.location.href = '/login'
      throw new Error('برای استفاده از پنل با حساب مدیر وارد شوید.')
    }
    const headers = { ...opts.headers }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData (browser sets it automatically with boundary)
    if (opts.body instanceof FormData) {
      delete headers['Content-Type']
    }
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...opts, headers, signal: ctrl.signal })
      // If 401, redirect to login
      if (res.status === 401) {
        clearAdminSession(localStorage, token)
        window.location.href = '/login'
        return res
      }
      return res
    } finally {
      clearTimeout(timer)
    }
  }

  // تبدیل خطای fetch به پیام فارسی خوانا
  function errorMessage(err) {
    if (err?.message === 'برای استفاده از پنل با حساب مدیر وارد شوید.') return err.message
    if (err?.name === 'AbortError') {
      return 'پاسخی از سرور دریافت نشد. مطمئن شوید سرور روی پورت ۳۰۰۱ در حال اجراست.'
    }
    return 'خطا در اتصال به سرور. دوباره تلاش کنید.'
  }

  return { apiFetch, errorMessage }
}
