<template>
  <main class="landing" dir="rtl">
    <a class="skip-link" href="#main-content">رفتن به محتوای اصلی</a>

    <header class="site-header">
      <nav class="nav-shell" aria-label="ناوبری اصلی">
        <a class="brand" href="#top" aria-label="پویش تاکسی، صفحه اصلی">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48"><path d="M9 28.5 13.5 18A5 5 0 0 1 18 15h12a5 5 0 0 1 4.5 3L39 28.5M12 28h24a3 3 0 0 1 3 3v7h-5v-4H14v4H9v-7a3 3 0 0 1 3-3Z"/><path d="M15 27h18l-2.2-6H17.2L15 27Z"/><circle cx="16" cy="32" r="2"/><circle cx="32" cy="32" r="2"/></svg>
          </span>
          <span><strong>پویش</strong><small>تاکسی بین‌شهری</small></span>
        </a>

        <div class="nav-links" :class="{ open: menuOpen }">
          <a href="#services" @click="menuOpen = false">خدمات</a>
          <a href="#fleet" @click="menuOpen = false">ناوگان</a>
          <a href="#how" @click="menuOpen = false">نحوه رزرو</a>
          <a href="#support" @click="menuOpen = false">پشتیبانی</a>
        </div>

        <div class="nav-actions">
          <button class="login-button" type="button" @click="loginOpen = true">ورود همکاران</button>
          <a class="nav-cta" href="tel:09229247081">رزرو تلفنی</a>
          <button class="menu-button" type="button" :aria-expanded="menuOpen" aria-label="نمایش منو" @click="menuOpen = !menuOpen">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </nav>
    </header>

    <section id="top" class="hero">
      <div class="hero-glow glow-one" aria-hidden="true"></div>
      <div class="hero-glow glow-two" aria-hidden="true"></div>
      <div id="main-content" class="hero-grid">
        <motion.div class="hero-copy" :initial="{ opacity: 0, y: 24 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.6 }">
          <div class="eyebrow"><span></span> سفر بین‌شهری، از درب منزل تا مقصد</div>
          <h1>مسیر طولانی،<br><em>سفری آسوده.</em></h1>
          <p class="hero-lead">با خودروهای اقتصادی و VIP، راننده‌های تأییدشده و پشتیبانی همراه؛ سفر شما از هر شهر به هر مقصد، امن و بی‌دردسر انجام می‌شود.</p>
          <div class="hero-actions">
            <a class="primary-button" href="tel:09229247081">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/></svg>
              استعلام کرایه و رزرو
            </a>
            <a class="secondary-button" href="#how">روند رزرو <span aria-hidden="true">←</span></a>
          </div>
          <div class="trust-row" aria-label="مزیت‌های سرویس">
            <span><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg> بیمه کامل سفر</span>
            <span><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg> پوشش سراسری</span>
            <span><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg> پشتیبانی تا مقصد</span>
          </div>
        </motion.div>

        <motion.div class="booking-visual" :initial="{ opacity: 0, scale: 0.96, x: -24 }" :animate="{ opacity: 1, scale: 1, x: 0 }" :transition="{ duration: 0.7, delay: 0.12 }">
          <div class="route-card">
            <div class="route-card-head">
              <div><span class="live-dot"></span> درخواست سفر</div>
              <span>۲۴ ساعته</span>
            </div>
            <div class="route-fields">
              <div class="route-line" aria-hidden="true"><i></i><span></span><i></i></div>
              <div class="route-field"><small>مبدأ سفر</small><strong>تهران، درب منزل</strong></div>
              <div class="route-field"><small>مقصد</small><strong>هر نقطه از ایران</strong></div>
            </div>
            <div class="vehicle-choice">
              <button class="vehicle active" type="button"><span class="car-icon">اقتصادی</span><small>مقرون‌به‌صرفه</small></button>
              <button class="vehicle" type="button"><span class="car-icon">VIP</span><small>آسایش بیشتر</small></button>
            </div>
            <a class="quote-button" href="tel:09229247081">دریافت قیمت سفر <span>←</span></a>
          </div>
          <motion.div class="floating-badge badge-driver" :animate="{ y: [0, -8, 0] }" :transition="{ duration: 4, repeat: Infinity }">
            <span class="avatar">م</span><span><strong>راننده تأییدشده</strong><small>امتیاز ۴.۹ از ۵</small></span>
          </motion.div>
          <motion.div class="floating-badge badge-safe" :animate="{ y: [0, 7, 0] }" :transition="{ duration: 4.8, repeat: Infinity }">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
            <span><strong>سفر امن</strong><small>پایش مسیر تا مقصد</small></span>
          </motion.div>
        </motion.div>
      </div>
      <div class="hero-stats">
        <div><strong>سراسر ایران</strong><span>پوشش مسیرها</span></div>
        <div><strong>۲۴ / ۷</strong><span>پاسخگویی و رزرو</span></div>
        <div><strong>اقتصادی و VIP</strong><span>انتخاب متناسب با شما</span></div>
        <div><strong>درب تا درب</strong><span>بدون جابه‌جایی اضافه</span></div>
      </div>
    </section>

    <section id="services" class="section services-section">
      <div class="section-heading">
        <span class="eyebrow"><span></span> انتخابی برای هر نوع سفر</span>
        <h2>همه‌چیز برای یک سفر<br>بین‌شهری مطمئن</h2>
        <p>از رزرو تا رسیدن به مقصد، جزئیات سفر شما با دقت هماهنگ و پشتیبانی می‌شود.</p>
      </div>
      <div class="bento-grid">
        <article class="bento-card bento-large dark-card">
          <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M3 11 12 2l9 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z"/><path d="M9 22V12h6v10"/></svg></div>
          <div><span class="card-kicker">درب تا درب</span><h3>سفر از نشانی شما شروع می‌شود.</h3><p>بدون رفتن به ترمینال و بدون تعویض خودرو؛ در مبدأ سوار شوید و مستقیم در مقصد پیاده شوید.</p></div>
          <div class="route-art" aria-hidden="true"><i></i><span></span><i></i></div>
        </article>
        <article class="bento-card amber-card">
          <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg></div>
          <span class="card-kicker">امنیت</span><h3>خودرو و راننده تأییدشده</h3><p>همراه با بیمه کامل و پیگیری مسیر تا پایان سرویس.</p>
        </article>
        <article class="bento-card light-card">
          <div class="support-orbit" aria-hidden="true"><span>۲۴</span><i></i><i></i><i></i></div>
          <span class="card-kicker">همراه شما</span><h3>پشتیبانی واقعی، نه ربات</h3><p>از لحظه رزرو تا رسیدن، یک تیم پاسخگوی شماست.</p>
          <a href="tel:02177901635">۰۲۱-۷۷۹۰۱۶۳۵ <span>←</span></a>
        </article>
        <article class="bento-card bento-wide white-card">
          <div><span class="card-kicker">انتخاب آزادانه</span><h3>خودروی متناسب با بودجه و سلیقه شما</h3><p>سفر اقتصادی برای رفت‌وآمدهای روزمره، یا گزینه VIP برای آسایش بیشتر در مسیرهای طولانی.</p></div>
          <div class="mini-fleet"><span>اقتصادی<small>سمند، پژو و هم‌رده</small></span><span>VIP<small>پریوس، کمری و هم‌رده</small></span></div>
        </article>
      </div>
    </section>

    <section id="fleet" class="section fleet-section">
      <div class="fleet-copy">
        <span class="eyebrow"><span></span> ناوگان متنوع</span>
        <h2>سفر شما،<br>انتخاب شما.</h2>
        <p>برای یک سفر خانوادگی، کاری یا تشریفاتی، گزینه مناسب خود را انتخاب کنید.</p>
      </div>
      <div class="fleet-cards">
        <motion.article class="fleet-card" :whileHover="{ y: -6 }" :transition="{ duration: 0.2 }">
          <div class="fleet-number">۰۱</div><span class="fleet-tag">به‌صرفه</span><h3>کلاس اقتصادی</h3><p>خودروهای سالم و راحت برای سفرهای روزمره با هزینه منطقی.</p><ul><li>تهویه مناسب</li><li>بیمه سفر</li><li>ظرفیت تا ۴ نفر</li></ul>
        </motion.article>
        <motion.article class="fleet-card featured" :whileHover="{ y: -6 }" :transition="{ duration: 0.2 }">
          <div class="fleet-number">۰۲</div><span class="fleet-tag">پیشنهاد ویژه</span><h3>کلاس VIP</h3><p>خودروهای سطح بالاتر برای مسیرهای طولانی و سفرهای تشریفاتی.</p><ul><li>کابین آرام و راحت</li><li>رانندگان منتخب</li><li>هماهنگی اختصاصی</li></ul>
        </motion.article>
      </div>
    </section>

    <section id="how" class="section how-section">
      <div class="section-heading centered"><span class="eyebrow"><span></span> ساده و سریع</span><h2>سه قدم تا شروع سفر</h2><p>بدون فرم‌های طولانی؛ با یک تماس، سفر شما هماهنگ می‌شود.</p></div>
      <div class="steps">
        <article><span class="step-number">۱</span><div class="step-icon"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7"/></svg></div><h3>تماس و اعلام مسیر</h3><p>مبدأ، مقصد، زمان حرکت و کلاس خودرو را اعلام کنید.</p></article>
        <article><span class="step-number">۲</span><div class="step-icon"><svg viewBox="0 0 24 24"><path d="M20 7 10 17l-5-5"/><path d="M21 12a9 9 0 1 1-5.3-8.2"/></svg></div><h3>تأیید قیمت و راننده</h3><p>هزینه شفاف و مشخصات هماهنگی سفر را دریافت کنید.</p></article>
        <article><span class="step-number">۳</span><div class="step-icon"><svg viewBox="0 0 24 24"><path d="M3 17h18M5 17l2-7h10l2 7M7 10l2-4h6l2 4M7 17v3M17 17v3"/></svg></div><h3>حرکت از درب منزل</h3><p>راننده در زمان مقرر حاضر می‌شود و مستقیم راهی مقصد می‌شوید.</p></article>
      </div>
    </section>

    <section id="support" class="section cta-section">
      <div class="cta-panel">
        <div class="cta-glow" aria-hidden="true"></div>
        <div><span class="eyebrow light"><span></span> آماده حرکتید؟</span><h2>مسیر را بگویید؛<br>بقیه‌اش با ما.</h2><p>برای استعلام کرایه و رزرو سفر بین‌شهری، همین حالا تماس بگیرید.</p></div>
        <div class="cta-actions"><a class="primary-button light-button" href="tel:09229247081">۰۹۲۲ ۹۲۴ ۷۰۸۱</a><a href="tel:02177901635">خط ثابت: ۰۲۱ ۷۷۹۰۱۶۳۵</a></div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-grid">
        <div><a class="brand footer-brand" href="#top"><span class="brand-mark"><svg viewBox="0 0 48 48"><path d="M9 28.5 13.5 18A5 5 0 0 1 18 15h12a5 5 0 0 1 4.5 3L39 28.5M12 28h24a3 3 0 0 1 3 3v7h-5v-4H14v4H9v-7a3 3 0 0 1 3-3Z"/></svg></span><span><strong>پویش</strong><small>تاکسی بین‌شهری</small></span></a><p>سرویس دربستی بین‌شهری با پوشش سراسری، خودروهای اقتصادی و VIP.</p></div>
        <div><strong>دسترسی سریع</strong><a href="#services">خدمات ما</a><a href="#fleet">ناوگان</a><a href="#how">نحوه رزرو</a></div>
        <div><strong>تماس با ما</strong><a href="tel:09229247081">۰۹۲۲ ۹۲۴ ۷۰۸۱</a><a href="tel:02177901635">۰۲۱ ۷۷۹۰۱۶۳۵</a><span>پاسخگویی شبانه‌روزی</span></div>
      </div>
      <div class="footer-bottom"><span>© ۱۴۰۵ پویش تاکسی؛ همه حقوق محفوظ است.</span><button type="button" @click="loginOpen = true">ورود همکاران</button></div>
    </footer>

    <AnimatePresence>
      <motion.div v-if="loginOpen" class="modal-backdrop" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }" @click.self="loginOpen = false">
        <motion.div class="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title" :initial="{ opacity: 0, scale: 0.96, y: 20 }" :animate="{ opacity: 1, scale: 1, y: 0 }" :exit="{ opacity: 0, scale: 0.98 }">
          <button class="close-button" type="button" aria-label="بستن" @click="loginOpen = false">×</button>
          <span class="modal-mark brand-mark"><svg viewBox="0 0 48 48"><path d="M9 28.5 13.5 18A5 5 0 0 1 18 15h12a5 5 0 0 1 4.5 3L39 28.5M12 28h24a3 3 0 0 1 3 3v7h-5v-4H14v4H9v-7a3 3 0 0 1 3-3Z"/></svg></span>
          <h2 id="login-title">ورود به پنل همکاران</h2><p>اطلاعات حساب کاربری خود را وارد کنید.</p>
          <form @submit.prevent="handleLogin">
            <div v-if="errorMsg" class="form-error" role="alert">{{ errorMsg }}</div>
            <label for="username">نام کاربری</label><input id="username" v-model="username" name="username" autocomplete="username" :disabled="loading" required>
            <label for="password">رمز عبور</label><input id="password" v-model="password" name="password" type="password" autocomplete="current-password" :disabled="loading" required>
            <button type="submit" :disabled="loading">{{ loading ? 'در حال ورود…' : 'ورود به پنل' }}</button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </main>
</template>

<script setup>
import { AnimatePresence, motion } from 'motion-v'

useHead({
  title: 'پویش تاکسی | رزرو تاکسی بین‌شهری دربستی',
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
  bodyAttrs: { class: 'pooyesh-landing' },
  meta: [
    { name: 'description', content: 'رزرو تاکسی بین‌شهری و سواری دربستی اقتصادی و VIP با بیمه کامل، پوشش سراسری و پشتیبانی تا مقصد.' },
    { property: 'og:title', content: 'پویش تاکسی | سفر بین‌شهری، از درب تا درب' },
    { property: 'og:description', content: 'سفر امن و راحت بین‌شهری با خودروهای اقتصادی و VIP و پشتیبانی شبانه‌روزی.' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/assets/images/logo/favicon.png' },
    { rel: 'stylesheet', href: '/assets/fonts/estedad/fontface.css' }
  ]
})

const menuOpen = ref(false)
const loginOpen = ref(false)
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const roleDashboardMap = { super_admin: '/admin/dashboard', admin: '/admin/dashboard', support: '/support/dashboard', driver: '/driver/dashboard', passenger: '/passenger/dashboard' }

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.value, password: password.value }) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error === 'Invalid credentials' ? 'نام کاربری یا رمز عبور اشتباه است.' : data.error || 'ورود انجام نشد.')
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ userId: data.userId, role: data.role, firstName: data.firstName, lastName: data.lastName, phone: data.phone, email: data.email }))
    localStorage.setItem('name', data.firstName || '')
    localStorage.setItem('email', data.email || '')
    window.location.href = roleDashboardMap[data.role] || '/'
  } catch (error) {
    errorMsg.value = error.message === 'Failed to fetch' ? 'خطا در اتصال به سرور؛ دوباره تلاش کنید.' : error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:global(*){box-sizing:border-box}:global(html){scroll-behavior:smooth}:global(body.pooyesh-landing){margin:0;background:#f8faf8;color:#10231d;font-family:Estedad,Arial,sans-serif}.landing{--ink:#10231d;--green:#0b5d47;--green-2:#168467;--lime:#d9f99d;--cream:#f4f1e8;--line:#dce5df;--muted:#66766f;min-height:100vh;overflow:hidden}.skip-link{position:fixed;top:-100px;right:16px;z-index:100;background:#fff;color:var(--ink);padding:12px 18px;border-radius:12px}.skip-link:focus{top:16px}.site-header{position:absolute;top:0;right:0;left:0;z-index:30;padding:20px 5vw}.nav-shell{max-width:1240px;margin:auto;min-height:72px;padding:10px 12px 10px 18px;border:1px solid rgba(255,255,255,.65);border-radius:22px;background:rgba(255,255,255,.78);box-shadow:0 12px 40px rgba(26,55,44,.08);backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none}.brand-mark{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;background:var(--green);color:white}.brand-mark svg{width:31px;height:31px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.brand>span:last-child{display:flex;flex-direction:column}.brand strong{font-size:20px;line-height:1.1}.brand small{font-size:10px;color:var(--muted);margin-top:4px}.nav-links{display:flex;gap:28px}.nav-links a,.login-button{color:#3e5049;text-decoration:none;font:600 14px Estedad;background:none;border:0;cursor:pointer}.nav-links a:hover,.login-button:hover{color:var(--green)}.nav-actions{display:flex;align-items:center;gap:10px}.nav-cta,.primary-button,.quote-button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:14px;background:var(--green);color:#fff;font-weight:700;transition:transform .2s,background .2s,box-shadow .2s}.nav-cta{min-height:46px;padding:0 20px}.nav-cta:hover,.primary-button:hover,.quote-button:hover{background:#084b3a;transform:translateY(-2px);box-shadow:0 12px 25px rgba(11,93,71,.2)}.menu-button{display:none;width:44px;height:44px;border:0;background:#edf4f0;border-radius:12px}.menu-button svg{width:24px;fill:none;stroke:var(--ink);stroke-width:2}.hero{position:relative;padding:160px 5vw 0;background:linear-gradient(135deg,#f8fbf8 0%,#f1f6ec 55%,#eef5ee 100%)}.hero:before{content:"";position:absolute;inset:0;background-image:radial-gradient(#0b5d4714 1px,transparent 1px);background-size:24px 24px;mask-image:linear-gradient(to bottom,#000,transparent 70%)}.hero-glow{position:absolute;border-radius:50%;filter:blur(1px)}.glow-one{width:460px;height:460px;background:#d9f99d70;top:80px;left:-150px}.glow-two{width:340px;height:340px;background:#7dd3fc40;right:35%;top:-170px}.hero-grid{position:relative;z-index:2;max-width:1240px;margin:auto;display:grid;grid-template-columns:1.05fr .95fr;gap:72px;align-items:center;min-height:600px}.eyebrow{display:inline-flex;align-items:center;gap:9px;color:var(--green);font-size:13px;font-weight:700;letter-spacing:.02em}.eyebrow>span{width:24px;height:2px;background:currentColor}.hero h1{font-size:clamp(48px,6vw,82px);line-height:1.12;letter-spacing:-.04em;margin:24px 0;color:var(--ink);font-weight:850}.hero h1 em{font-style:normal;color:var(--green)}.hero-lead{max-width:625px;color:#53665e;font-size:18px;line-height:2;margin:0}.hero-actions{display:flex;gap:12px;margin:32px 0}.primary-button{min-height:58px;padding:0 24px;gap:10px}.primary-button svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2}.secondary-button{min-height:58px;padding:0 22px;display:inline-flex;align-items:center;gap:12px;color:var(--ink);text-decoration:none;font-weight:700;border:1px solid var(--line);background:rgba(255,255,255,.7);border-radius:14px}.secondary-button:hover{border-color:#9fb8ae}.trust-row{display:flex;flex-wrap:wrap;gap:18px;color:#5c6d66;font-size:12px;font-weight:600}.trust-row span{display:flex;align-items:center;gap:6px}.trust-row svg{width:18px;height:18px;border-radius:50%;padding:3px;background:#dff2e9;fill:none;stroke:var(--green);stroke-width:3}.booking-visual{position:relative;min-height:510px;display:grid;place-items:center}.route-card{position:relative;z-index:2;width:min(100%,440px);padding:26px;border-radius:28px;background:#fff;box-shadow:0 35px 80px rgba(24,66,52,.16);border:1px solid rgba(255,255,255,.9)}.route-card-head{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--muted);margin-bottom:25px}.route-card-head>div{font-weight:700;color:var(--ink)}.live-dot{display:inline-block;width:8px;height:8px;margin-left:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 5px #dcfce7}.route-fields{position:relative;padding-right:34px}.route-line{position:absolute;right:7px;top:18px;bottom:18px;width:12px;display:flex;flex-direction:column;align-items:center}.route-line i{width:11px;height:11px;border-radius:50%;border:3px solid var(--green);background:#fff}.route-line i:last-child{background:var(--green)}.route-line span{width:2px;flex:1;border-right:2px dashed #b8c9c1}.route-field{padding:13px 16px;background:#f5f8f6;border:1px solid #e8eeea;border-radius:13px;margin-bottom:10px}.route-field small,.route-field strong{display:block}.route-field small{font-size:11px;color:#819087;margin-bottom:4px}.route-field strong{font-size:14px}.vehicle-choice{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:22px 0}.vehicle{min-height:72px;border:1px solid var(--line);border-radius:14px;background:#fff;font-family:Estedad;cursor:pointer}.vehicle span,.vehicle small{display:block}.vehicle span{font-weight:800;color:var(--ink)}.vehicle small{color:var(--muted);font-size:10px;margin-top:3px}.vehicle.active{border-color:var(--green);background:#edf8f3;box-shadow:inset 0 0 0 1px var(--green)}.quote-button{min-height:54px;width:100%;justify-content:space-between;padding:0 20px}.floating-badge{position:absolute;z-index:3;display:flex;align-items:center;gap:10px;padding:12px 15px;border-radius:16px;background:rgba(255,255,255,.92);border:1px solid #fff;box-shadow:0 18px 45px rgba(21,60,46,.15);backdrop-filter:blur(12px)}.floating-badge strong,.floating-badge small{display:block}.floating-badge strong{font-size:12px}.floating-badge small{font-size:9px;color:var(--muted);margin-top:2px}.badge-driver{right:-25px;top:82px}.avatar{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#d9f99d;color:#315314;font-weight:800}.badge-safe{left:-20px;bottom:73px}.badge-safe svg{width:37px;height:37px;padding:8px;border-radius:12px;background:#dff2e9;fill:none;stroke:var(--green);stroke-width:2}.hero-stats{position:relative;z-index:2;max-width:1240px;margin:50px auto 0;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #d6e2db}.hero-stats div{padding:26px 24px;border-left:1px solid #d6e2db}.hero-stats div:last-child{border-left:0}.hero-stats strong,.hero-stats span{display:block}.hero-stats strong{font-size:18px}.hero-stats span{font-size:11px;color:var(--muted);margin-top:5px}.section{padding:110px 5vw}.section-heading{max-width:1240px;margin:0 auto 48px}.section-heading h2,.fleet-copy h2,.cta-panel h2{font-size:clamp(36px,4vw,58px);line-height:1.25;letter-spacing:-.03em;margin:18px 0}.section-heading>p,.fleet-copy>p{max-width:560px;color:var(--muted);line-height:1.9}.bento-grid{max-width:1240px;margin:auto;display:grid;grid-template-columns:1.25fr .75fr .75fr;grid-template-rows:310px 245px;gap:18px}.bento-card{position:relative;overflow:hidden;padding:30px;border-radius:25px;border:1px solid var(--line);display:flex;flex-direction:column;justify-content:flex-end;transition:transform .25s,box-shadow .25s}.bento-card:hover{transform:translateY(-4px);box-shadow:0 22px 45px rgba(27,55,45,.09)}.bento-large{grid-row:span 2}.bento-wide{grid-column:span 2;display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:24px}.dark-card{background:var(--ink);color:white}.amber-card{background:#e8f3b2}.light-card{background:#e7f2ef}.white-card{background:white}.card-icon{position:absolute;top:28px;right:30px;width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:rgba(255,255,255,.14)}.card-icon svg,.step-icon svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.amber-card .card-icon{background:#f6f9dc}.card-kicker{font-size:11px;font-weight:700;opacity:.66}.bento-card h3{font-size:22px;line-height:1.55;margin:8px 0}.bento-large h3{font-size:32px;max-width:390px}.bento-card p{font-size:13px;line-height:1.9;opacity:.7;margin:0}.route-art{height:120px;margin:35px 0 10px;display:flex;align-items:center}.route-art i{width:18px;height:18px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 8px #d9f99d20}.route-art span{height:2px;flex:1;border-top:2px dashed #ffffff55}.route-art i:last-child{background:#fff}.support-orbit{position:absolute;top:24px;left:24px;width:100px;height:100px;border:1px dashed #0b5d4740;border-radius:50%;display:grid;place-items:center}.support-orbit span{width:55px;height:55px;border-radius:50%;display:grid;place-items:center;background:var(--green);color:white;font-size:20px;font-weight:800}.support-orbit i{position:absolute;width:9px;height:9px;background:#84cc16;border-radius:50%;top:4px}.support-orbit i:nth-of-type(2){top:auto;bottom:5px;right:14px}.support-orbit i:nth-of-type(3){top:35px;left:-4px}.light-card a{margin-top:16px;color:var(--green);font-weight:800;text-decoration:none;font-size:13px}.mini-fleet{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mini-fleet span{padding:18px;border-radius:16px;background:#f3f7f4;font-weight:800}.mini-fleet small{display:block;color:var(--muted);font-size:9px;margin-top:5px}.fleet-section{max-width:1360px;margin:auto;display:grid;grid-template-columns:.75fr 1.25fr;gap:80px;align-items:center;background:#f0f5f1;border-radius:36px}.fleet-cards{display:grid;grid-template-columns:1fr 1fr;gap:18px}.fleet-card{min-height:400px;padding:30px;border-radius:25px;background:#fff;border:1px solid var(--line);box-shadow:0 14px 40px rgba(29,63,50,.06)}.fleet-card.featured{background:var(--green);color:white;transform:translateY(-24px)}.fleet-number{font-size:64px;font-weight:900;line-height:1;color:#edf1ee}.featured .fleet-number{color:#ffffff1c}.fleet-tag{display:inline-block;padding:6px 10px;border-radius:20px;background:#edf7f2;color:var(--green);font-size:10px;font-weight:800}.featured .fleet-tag{background:#d9f99d;color:#294510}.fleet-card h3{font-size:27px;margin:18px 0 8px}.fleet-card p{font-size:13px;line-height:1.9;color:var(--muted)}.featured p{color:#d2e3dc}.fleet-card ul{padding:0;list-style:none;margin-top:24px}.fleet-card li{padding:10px 0;border-top:1px solid var(--line);font-size:12px}.featured li{border-color:#ffffff20}.centered{text-align:center;margin-left:auto;margin-right:auto}.centered p{margin-left:auto;margin-right:auto}.steps{max-width:1100px;margin:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;counter-reset:steps}.steps article{position:relative;text-align:center;padding:30px}.steps article:not(:last-child):after{content:"";position:absolute;top:67px;left:-40px;width:80px;border-top:2px dashed #bfd0c7}.step-number{position:absolute;top:20px;right:24px;color:#c7d4ce;font-size:13px;font-weight:800}.step-icon{width:74px;height:74px;margin:0 auto 22px;border-radius:24px;display:grid;place-items:center;background:#eaf5ef;color:var(--green)}.steps h3{font-size:19px}.steps p{font-size:12px;line-height:1.8;color:var(--muted)}.cta-section{padding-top:40px}.cta-panel{position:relative;overflow:hidden;max-width:1240px;margin:auto;padding:70px;border-radius:32px;background:var(--ink);color:white;display:flex;justify-content:space-between;align-items:flex-end}.cta-panel>div{position:relative;z-index:2}.cta-panel p{color:#b9c9c2}.eyebrow.light{color:var(--lime)}.cta-glow{position:absolute!important;width:480px;height:480px;border-radius:50%;background:#16846755;filter:blur(10px);left:-100px;bottom:-300px}.cta-actions{display:flex;flex-direction:column;align-items:center;gap:15px}.light-button{background:var(--lime);color:#233f16;min-width:230px}.light-button:hover{background:#c9f36e}.cta-actions>a:last-child{color:#dbe7e1;font-size:12px;text-decoration:none}.footer{padding:60px 5vw 24px;background:#fff}.footer-grid{max-width:1240px;margin:auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:80px}.footer-grid>div{display:flex;flex-direction:column;align-items:flex-start;gap:12px}.footer-grid p{max-width:360px;color:var(--muted);font-size:12px;line-height:1.9}.footer-grid>div>strong{margin-bottom:10px}.footer-grid a,.footer-grid span{color:var(--muted);font-size:12px;text-decoration:none}.footer-brand{margin-bottom:10px}.footer-bottom{max-width:1240px;margin:40px auto 0;padding-top:20px;border-top:1px solid var(--line);display:flex;justify-content:space-between;color:#87958f;font-size:10px}.footer-bottom button{border:0;background:none;color:var(--muted);font-family:Estedad;cursor:pointer;font-size:10px}.modal-backdrop{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:20px;background:rgba(8,25,19,.6);backdrop-filter:blur(10px)}.login-modal{position:relative;width:min(100%,430px);padding:40px;border-radius:28px;background:#fff;box-shadow:0 30px 90px rgba(0,0,0,.24)}.close-button{position:absolute;left:20px;top:18px;width:36px;height:36px;border:0;border-radius:50%;background:#eef3f0;color:var(--ink);font-size:24px;cursor:pointer}.modal-mark{margin-bottom:20px}.login-modal h2{font-size:25px;margin:0}.login-modal>p{color:var(--muted);font-size:12px;margin-bottom:24px}.login-modal form{display:flex;flex-direction:column;gap:9px}.login-modal label{font-size:12px;font-weight:700;margin-top:5px}.login-modal input{height:50px;padding:0 14px;border:1px solid var(--line);border-radius:12px;font:14px Estedad;outline:none}.login-modal input:focus{border-color:var(--green);box-shadow:0 0 0 3px #0b5d4718}.login-modal form button{height:52px;margin-top:12px;border:0;border-radius:13px;background:var(--green);color:white;font:700 14px Estedad;cursor:pointer}.login-modal form button:disabled{opacity:.6;cursor:wait}.form-error{padding:12px;border-radius:10px;background:#fef2f2;color:#b91c1c;font-size:12px}
@media(max-width:980px){.nav-links{position:absolute;top:88px;right:12px;left:12px;padding:15px;display:none;flex-direction:column;background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(20,50,39,.16)}.nav-links.open{display:flex}.login-button{display:none}.menu-button{display:grid;place-items:center}.hero-grid{grid-template-columns:1fr;gap:20px}.hero-copy{text-align:center}.hero-lead{margin:auto}.hero-actions,.trust-row{justify-content:center}.booking-visual{min-height:500px}.badge-driver{right:2%}.badge-safe{left:2%}.bento-grid{grid-template-columns:1fr 1fr;grid-template-rows:auto}.bento-large{grid-row:auto;min-height:460px}.bento-wide{grid-column:span 2}.fleet-section{grid-template-columns:1fr;padding:70px 5vw}.fleet-copy{text-align:center}.fleet-copy p{margin:auto}.footer-grid{grid-template-columns:1.5fr 1fr 1fr;gap:30px}}
@media(max-width:640px){.site-header{padding:12px}.nav-shell{min-height:64px}.brand-mark{width:40px;height:40px}.brand strong{font-size:17px}.nav-cta{display:none}.hero{padding:125px 18px 0}.hero-grid{min-height:auto}.hero h1{font-size:45px}.hero-lead{font-size:15px}.hero-actions{flex-direction:column}.trust-row{gap:9px 14px}.booking-visual{min-height:465px}.route-card{padding:20px}.floating-badge{padding:9px}.badge-driver{top:28px;right:-4px}.badge-safe{bottom:22px;left:-4px}.hero-stats{grid-template-columns:1fr 1fr}.hero-stats div{border-bottom:1px solid #d6e2db}.section{padding:80px 18px}.section-heading{text-align:center}.bento-grid{grid-template-columns:1fr}.bento-card,.bento-large{min-height:300px}.bento-large{min-height:430px}.bento-wide{grid-column:auto;grid-template-columns:1fr}.fleet-section{border-radius:24px}.fleet-cards{grid-template-columns:1fr}.fleet-card{min-height:auto}.fleet-card.featured{transform:none}.steps{grid-template-columns:1fr}.steps article:not(:last-child):after{top:auto;bottom:-10px;left:50%;width:1px;height:30px;border-left:2px dashed #bfd0c7;border-top:0}.cta-panel{padding:45px 24px;display:block;text-align:center}.cta-actions{margin-top:30px}.footer-grid{grid-template-columns:1fr 1fr}.footer-grid>div:first-child{grid-column:span 2}.footer-bottom{gap:20px}.login-modal{padding:32px 24px}}
@media(prefers-reduced-motion:reduce){:global(html){scroll-behavior:auto}.landing *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
</style>
