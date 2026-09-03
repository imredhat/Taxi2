// fetch با timeout — جلوی اسپینر بی‌پایان رو می‌گیره
// اگه سرور پایین باشه یا دیر جواب بده، بعد از timeoutMs AbortController می‌زنه
export const useApi = () => {
  async function apiFetch(url, opts = {}, timeoutMs = 15000) {
    const token = localStorage.getItem('token')
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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
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
    if (err?.name === 'AbortError') {
      return 'پاسخی از سرور دریافت نشد. مطمئن شوید سرور روی پورت ۳۰۰۱ در حال اجراست.'
    }
    return 'خطا در اتصال به سرور. دوباره تلاش کنید.'
  }

  return { apiFetch, errorMessage }
}
