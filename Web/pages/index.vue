<template>
  <main class="journey" dir="rtl">
    <a class="skip-link" href="#main-content">رفتن به محتوای اصلی</a>

    <header class="site-header">
      <nav class="nav-shell" aria-label="ناوبری اصلی">
        <a class="brand" href="#top" aria-label="پویش تاکسی، صفحه اصلی">
          <span class="brand-road" aria-hidden="true"><i></i></span>
          <span><strong>پویش</strong><small>تاکسی بین‌شهری</small></span>
        </a>

        <div id="main-navigation" class="nav-links" :class="{ open: menuOpen }">
          <a href="#experience" @click="closeMenu">تجربه سفر</a>
          <a href="#fleet" @click="closeMenu">انتخاب خودرو</a>
          <a href="#safety" @click="closeMenu">امنیت سفر</a>
          <a href="#process" @click="closeMenu">مراحل رزرو</a>
        </div>

        <div class="nav-actions">
          <button class="partner-link" type="button" @click="loginOpen = true">ورود همکاران</button>
          <a class="header-cta" href="#booking">استعلام سفر</a>
          <button class="menu-button" type="button" :aria-expanded="menuOpen" aria-controls="main-navigation" aria-label="نمایش منو" @click="menuOpen = !menuOpen">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </nav>
    </header>

    <section id="top" class="hero" aria-labelledby="hero-title">
      <img class="hero-image" src="/images/pooyesh/hero-daylight.png" width="1915" height="821" alt="جاده کوهستانی روشن در مسیر یک شهر ایرانی" fetchpriority="high">
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>

      <div id="main-content" class="hero-content">
        <motion.div class="hero-copy" :initial="reduceMotion ? false : { opacity: 0, y: 24 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.7 }">
          <span class="scene-label"><i></i> فصل اول · پیش از حرکت</span>
          <h1 id="hero-title">مسیرت را بگو.<br><em>تا رسیدن، همراهت هستیم.</em></h1>
          <p>سواری دربست بین‌شهری با راننده تاییدشده، خودروی متناسب و پشتیبانی واقعی؛ از در خانه تا مقصد.</p>
          <div class="hero-proof" aria-label="مزیت‌های اصلی">
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg> بیمه قانونی سفر</span>
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg> قیمت شفاف</span>
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg> همراهی تا مقصد</span>
          </div>
        </motion.div>

        <motion.form id="booking" class="quick-booking" aria-label="شروع استعلام سفر" :initial="reduceMotion ? false : { opacity: 0, y: 28 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.7, delay: 0.15 }" @submit.prevent="startQuote">
          <div class="booking-head">
            <div><small>استعلام سریع</small><strong>سفرت از کجا شروع می‌شود؟</strong></div>
            <span>پاسخ‌گویی ۷ تا ۲۱</span>
          </div>

          <div class="route-inputs">
            <div class="route-rail" aria-hidden="true"><i></i><span></span><b></b></div>
            <label><span>مبدا</span><input v-model.trim="trip.origin" name="origin" autocomplete="address-level2" placeholder="مثلاً تهران، سعادت‌آباد" required></label>
            <label><span>مقصد</span><input v-model.trim="trip.destination" name="destination" autocomplete="address-level2" placeholder="مثلاً رشت" required></label>
          </div>

          <div class="booking-meta">
            <label><span>زمان حرکت</span><input v-model="trip.date" type="date" name="date" required></label>
            <label><span>تعداد مسافر</span><select v-model="trip.passengers" name="passengers"><option v-for="count in 4" :key="count" :value="count">{{ toFa(count) }} نفر</option></select></label>
          </div>

          <button class="primary-button" type="submit">ادامه استعلام <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg></button>
          <p v-if="quoteMessage" class="form-message" role="status">{{ quoteMessage }}</p>
        </motion.form>
      </div>

      <a class="scroll-cue" href="#experience"><span>ادامه مسیر</span><i aria-hidden="true"></i></a>
    </section>

    <section id="experience" class="journey-intro">
      <div class="section-shell intro-grid">
        <div class="chapter-copy">
          <span class="scene-label dark"><i></i> فصل دوم · سفر شکل می‌گیرد</span>
          <h2>یک سفر خوب،<br>پیش از حرکت آغاز می‌شود.</h2>
        </div>
        <div class="intro-text">
          <p>مسیر، تعداد همراهان و بار شما را می‌پرسیم تا خودرو و هزینه از ابتدا روشن باشد. نه خودروی نامتناسب، نه قیمت مبهم و نه انتظار بی‌خبر.</p>
          <div class="experience-note"><span>۰۱</span><p>هر تصمیم در زمان رزرو، برای آرامش بیشتر در جاده گرفته می‌شود.</p></div>
        </div>
      </div>
      <div class="route-map section-shell" aria-label="نمایش مسیر نمونه تهران تا شیراز">
        <div class="map-copy"><span>هر سفر، مسیر خودش را دارد</span><strong>تهران <i>مبدا</i></strong><strong>شیراز <i>مقصد</i></strong></div>
        <svg class="map-svg" viewBox="0 0 1000 300" aria-hidden="true">
          <path class="terrain-line" d="M0 226C126 173 178 223 284 159s173 48 270-14 132-31 223-67 146 28 223-5" />
          <motion.path class="glowing-route" d="M38 225C153 175 212 246 311 165s175 50 270-18 155-15 220-74 119-3 168-32" :initial="reduceMotion ? false : { pathLength: 0 }" :whileInView="{ pathLength: 1 }" :viewport="{ once: true, amount: 0.5 }" :transition="{ duration: 2.2, ease: 'easeInOut' }" />
          <circle cx="38" cy="225" r="9" class="map-origin"/><circle cx="969" cy="41" r="11" class="map-destination"/>
        </svg>
        <motion.div class="map-car" :initial="reduceMotion ? false : { x: 0, y: 0, opacity: 0 }" :whileInView="{ x: -520, y: -82, opacity: [0, 1, 1] }" :viewport="{ once: true, amount: 0.5 }" :transition="{ duration: 2.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }">
          <svg viewBox="0 0 70 26" aria-hidden="true"><path d="M5 19h59l-6-9-14-5H25l-9 9H8l-3 5Z"/><circle cx="19" cy="20" r="4"/><circle cx="53" cy="20" r="4"/></svg>
        </motion.div>
      </div>
    </section>

    <section ref="luxuryRef" class="luxury-drive" aria-label="تجربه خودروی ممتاز در مسیر">
      <motion.img class="luxury-drive-image" src="/images/pooyesh/fleet-vip-daylight.png" width="1893" height="829" alt="خودروی اجرایی با نمایش فضای کابین و صندوق بار" loading="lazy" :style="reduceMotion ? undefined : { x: luxuryCarX, scale: luxuryCarScale }" />
      <div class="luxury-drive-shade" aria-hidden="true"></div>
      <motion.div class="light-sweep" aria-hidden="true" :style="reduceMotion ? undefined : { x: lightX }"></motion.div>
      <div class="luxury-drive-content section-shell">
        <motion.div class="luxury-statement" :initial="reduceMotion ? false : { opacity: 0, y: 42 }" :whileInView="{ opacity: 1, y: 0 }" :viewport="{ once: true, amount: 0.45 }" :transition="{ duration: 0.8 }">
          <span class="scene-label"><i></i> سکوت کابین · امتداد جاده</span>
          <p class="luxury-overline">EXECUTIVE JOURNEY</p>
          <h2>آرامش،<br><em>در حرکت.</em></h2>
          <div class="material-specs"><span><i>01</i> کابین آرام</span><span><i>02</i> انتخاب ممتاز</span><span><i>03</i> هماهنگی اختصاصی</span></div>
        </motion.div>
      </div>
      <div class="drive-meter" aria-hidden="true"><span></span><i></i><b></b></div>
    </section>

    <section class="road-story" aria-label="روایت مراحل سفر">
      <div class="road-line" aria-hidden="true"><span></span><i></i></div>
      <div class="section-shell story-grid">
        <motion.article v-for="(item, index) in story" :key="item.title" class="story-card" :initial="reduceMotion ? false : { opacity: 0, y: 24 }" :whileInView="{ opacity: 1, y: 0 }" :viewport="{ once: true, amount: 0.35 }" :transition="{ duration: 0.45, delay: index * 0.08 }">
          <span>{{ toFa(index + 1).padStart(2, '۰') }}</span>
          <div class="story-icon" v-html="item.icon"></div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </motion.article>
      </div>
    </section>

    <section id="fleet" class="fleet-section">
      <div class="section-shell">
        <div class="section-heading">
          <div><span class="scene-label dark"><i></i> فصل سوم · انتخاب مطمئن</span><h2>خودروی مناسب،<br>برای شکل سفر شما.</h2></div>
          <p>مدل خودرو تضمین نمی‌شود؛ اما کلاس، ظرفیت و سطح آسایشی که انتخاب می‌کنید از ابتدا مشخص است.</p>
        </div>

        <div class="fleet-layout">
          <div class="fleet-tabs" role="tablist" aria-label="کلاس‌های خودرو">
            <button v-for="(vehicle, index) in vehicles" :id="`vehicle-tab-${index}`" :key="vehicle.name" type="button" role="tab" :aria-selected="activeVehicle === index" :aria-controls="`vehicle-panel-${index}`" :class="{ active: activeVehicle === index }" @click="activeVehicle = index">
              <span>{{ vehicle.code }}</span><strong>{{ vehicle.name }}</strong><small>{{ vehicle.short }}</small>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div :id="`vehicle-panel-${activeVehicle}`" :key="activeVehicle" class="vehicle-panel" role="tabpanel" :aria-labelledby="`vehicle-tab-${activeVehicle}`" :initial="reduceMotion ? false : { opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }" :exit="{ opacity: 0, x: 14 }" :transition="{ duration: 0.28 }">
              <img class="vehicle-photo" src="/images/pooyesh/fleet-vip-daylight.png" alt="نمای خودروی کلاس ممتاز و فضای داخلی آن" loading="lazy">
              <div class="vehicle-horizon" aria-hidden="true"><svg viewBox="0 0 620 220"><path d="M30 171h560M174 161l36-72h188l67 72M226 89l39-45h111l45 45M176 161h289"/><circle cx="238" cy="171" r="31"/><circle cx="411" cy="171" r="31"/></svg></div>
              <div class="vehicle-info">
                <span>{{ vehicles[activeVehicle].code }}</span>
                <h3>{{ vehicles[activeVehicle].name }}</h3>
                <p>{{ vehicles[activeVehicle].description }}</p>
                <ul><li v-for="feature in vehicles[activeVehicle].features" :key="feature">{{ feature }}</li></ul>
                <small>نمونه خودرو: {{ vehicles[activeVehicle].examples }}</small>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>

    <section id="safety" class="safety-section">
      <div class="safety-glow" aria-hidden="true"></div>
      <div class="section-shell safety-grid">
        <div class="safety-copy">
          <span class="scene-label"><i></i> فصل چهارم · امنیت قابل دیدن</span>
          <h2>اطمینان، یک جمله تبلیغاتی نیست.</h2>
          <p>پیش از حرکت می‌دانید چه کسی، با چه خودرویی و تحت چه پوششی همراه شماست. پویش تاکسی هماهنگی سفر را تا رسیدن پیگیری می‌کند.</p>
          <a href="tel:09229247081" class="text-link">گفت‌وگو با پشتیبانی <span>←</span></a>
        </div>
        <div class="evidence-list">
          <article v-for="(item, index) in evidence" :key="item.title">
            <span>{{ toFa(index + 1).padStart(2, '۰') }}</span>
            <div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
          </article>
        </div>
      </div>
    </section>

    <section id="process" class="process-section">
      <div class="section-shell">
        <div class="section-heading centered">
          <div><span class="scene-label dark"><i></i> فصل پنجم · همراهی در راه</span><h2>از درخواست تا رسیدن،<br>مسیر روشن است.</h2></div>
        </div>
        <div class="process-road" aria-hidden="true">
          <motion.div class="moving-car" :initial="reduceMotion ? false : { x: '38vw', opacity: 0 }" :whileInView="{ x: '-38vw', opacity: [0, 1, 1, 0] }" :viewport="{ once: true, amount: 0.6 }" :transition="{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }">
            <svg viewBox="0 0 96 34"><path d="M8 24h78l-7-12-17-6H35L23 17H12l-4 7Z"/><circle cx="25" cy="25" r="6"/><circle cx="72" cy="25" r="6"/><path d="m31 17 8-8h21l14 8H31Z"/></svg>
            <span></span>
          </motion.div>
        </div>
        <ol class="process-track">
          <li v-for="(step, index) in process" :key="step.title"><span>{{ toFa(index + 1) }}</span><div><strong>{{ step.title }}</strong><small>{{ step.text }}</small></div></li>
        </ol>
      </div>
    </section>

    <section class="arrival-section">
      <div class="arrival-road" aria-hidden="true"><span></span><i></i></div>
      <div class="section-shell arrival-content">
        <span class="scene-label light"><i></i> فصل آخر · رسیدن</span>
        <h2>آماده‌ای<br>راه بیفتیم؟</h2>
        <p>مبدا و مقصد را بگویید؛ برای انتخاب خودرو و استعلام کرایه همراهتان هستیم.</p>
        <div class="arrival-actions"><a class="primary-button amber" href="#booking">شروع استعلام</a><a class="phone-button" href="tel:09229247081">۰۹۲۲ ۹۲۴ ۷۰۸۱</a></div>
        <small>پاسخ‌گویی تلفنی هر روز از ساعت ۷ تا ۲۱</small>
      </div>
    </section>

    <footer class="footer">
      <div class="section-shell footer-grid">
        <div class="footer-brand"><a class="brand" href="#top"><span class="brand-road" aria-hidden="true"><i></i></span><span><strong>پویش</strong><small>تاکسی بین‌شهری</small></span></a><p>سواری دربست بین‌شهری، ترانسفر فرودگاهی و سرویس سازمانی با انتخاب اقتصادی تا VIP.</p></div>
        <div><strong>خدمات</strong><a href="#fleet">انتخاب خودرو</a><a href="#safety">امنیت سفر</a><a href="#process">مراحل رزرو</a></div>
        <div><strong>تماس</strong><a href="tel:09229247081">۰۹۲۲ ۹۲۴ ۷۰۸۱</a><a href="tel:02177901635">۰۲۱ ۷۷۹۰۱۶۳۵</a><a href="mailto:PooyeshTak30@gmail.com">PooyeshTak30@gmail.com</a></div>
        <div><strong>همراه ما</strong><a href="https://ble.ir/pooyesh_tak30" rel="noopener">بله</a><a href="https://eitaa.com/pooyeshtaK30" rel="noopener">ایتا</a><button type="button" @click="loginOpen = true">ورود همکاران</button></div>
      </div>
      <div class="section-shell footer-bottom"><span>© ۱۴۰۵ پویش تاکسی</span><span>سفر امن، با تصمیم روشن.</span></div>
    </footer>

    <AnimatePresence>
      <motion.div v-if="loginOpen" class="modal-backdrop" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }" @click.self="loginOpen = false">
        <motion.div class="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title" :initial="reduceMotion ? false : { opacity: 0, scale: 0.97, y: 16 }" :animate="{ opacity: 1, scale: 1, y: 0 }" :exit="{ opacity: 0, scale: 0.98 }">
          <button class="close-button" type="button" aria-label="بستن پنجره ورود" @click="loginOpen = false">×</button>
          <span class="modal-kicker">پنل همکاران</span><h2 id="login-title">ورود به سامانه</h2><p>برای رانندگان، پشتیبانان و مدیران پویش تاکسی</p>
          <form @submit.prevent="handleLogin">
            <label for="username">نام کاربری</label><input id="username" v-model="username" autocomplete="username" required>
            <label for="password">رمز عبور</label><input id="password" v-model="password" type="password" autocomplete="current-password" required>
            <p v-if="errorMsg" class="form-error" role="alert">{{ errorMsg }}</p>
            <button type="submit" :disabled="loading">{{ loading ? 'در حال ورود…' : 'ورود به پنل' }}</button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </main>
</template>

<script setup>
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion-v'

useHead({
  title: 'پویش تاکسی | سواری دربست بین‌شهری امن و راحت',
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
  bodyAttrs: { class: 'pooyesh-landing' },
  meta: [
    { name: 'description', content: 'رزرو سواری دربست بین‌شهری، ترانسفر فرودگاهی و سرویس سازمانی با خودروهای اقتصادی و VIP، رانندگان تاییدشده و پشتیبانی تا مقصد.' },
    { property: 'og:title', content: 'پویش تاکسی | تا رسیدن، همراهت هستیم' },
    { property: 'og:description', content: 'سفر بین‌شهری امن و راحت، از در خانه تا مقصد.' },
    { property: 'og:image', content: '/images/pooyesh/hero-road.png' }
  ],
  link: [{ rel: 'stylesheet', href: '/assets/fonts/estedad/fontface.css' }]
})

const reduceMotion = useReducedMotion()
const luxuryRef = ref(null)
const { scrollYProgress: luxuryProgress } = useScroll({ target: luxuryRef, offset: ['start end', 'end start'] })
const luxuryCarX = useTransform(luxuryProgress, [0, 1], ['4%', '-4%'])
const luxuryCarScale = useTransform(luxuryProgress, [0, 0.5, 1], [1.08, 1, 1.08])
const lightX = useTransform(luxuryProgress, [0, 1], ['65%', '-65%'])
const menuOpen = ref(false)
const loginOpen = ref(false)
const activeVehicle = ref(1)
const quoteMessage = ref('')
const trip = reactive({ origin: '', destination: '', date: '', passengers: 1 })
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const story = [
  { title: 'جزئیات مسیر', text: 'مبدا، مقصد، زمان، تعداد همراهان و میزان بار را دقیق می‌پرسیم.', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="3"/><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/></svg>' },
  { title: 'انتخاب متناسب', text: 'کلاس خودرو براساس آسایش، ظرفیت و بودجه سفر انتخاب می‌شود.', icon: '<svg viewBox="0 0 24 24"><path d="m3 16 2-6h14l2 6M5 10l2-4h10l2 4M5 16h14v4h-3v-2H8v2H5v-4Z"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>' },
  { title: 'هماهنگی روشن', text: 'قیمت و مشخصات سفر پیش از حرکت تایید و اطلاعات راننده اعلام می‌شود.', icon: '<svg viewBox="0 0 24 24"><path d="M20 7 10 17l-5-5"/><circle cx="12" cy="12" r="10"/></svg>' }
]

const vehicles = [
  { code: 'ECO', name: 'اقتصادی', short: 'ساده و کاربردی', description: 'انتخابی منطقی برای سفرهای روزمره بین‌شهری؛ با خودروی سالم و شرایط قانونی سفر.', features: ['مناسب تا ۴ مسافر', 'تهویه مناسب', 'هزینه متعادل'], examples: 'سمند، پژو ۴۰۵ یا هم‌رده' },
  { code: 'ECO+', name: 'اقتصادی پلاس', short: 'فضای بهتر', description: 'فضای کابین و آسایش بیشتر، بدون عبور از بودجه یک سفر اقتصادی.', features: ['کابین جادارتر', 'مناسب مسیرهای متوسط', 'تعادل هزینه و راحتی'], examples: 'آریو، برلیانس یا هم‌رده' },
  { code: 'VIP', name: 'وی‌آی‌پی', short: 'آرامش مسیر بلند', description: 'برای مسیرهای طولانی، سفر کاری یا زمانی که کیفیت کابین اولویت بیشتری دارد.', features: ['کابین آرام و راحت', 'رانندگان منتخب', 'هماهنگی اختصاصی'], examples: 'اکسنت، پریوس، فلوئنس یا هم‌رده' },
  { code: 'VIP+', name: 'وی‌آی‌پی پلاس', short: 'سفر ممتاز', description: 'سطح بالاتر آسایش و کیفیت برای سفر تشریفاتی یا مسیرهای طولانی.', features: ['خودروهای سطح بالاتر', 'مناسب سفر تشریفاتی', 'آسایش بیشتر'], examples: 'کمری، کرولا، سفران یا هم‌رده' },
  { code: 'SUV', name: 'شاسی‌بلند', short: 'فضا و توان بیشتر', description: 'برای بار بیشتر، خانواده یا نیازهای خاص مسیر با هماهنگی قبلی.', features: ['فضای بار بیشتر', 'کابین جادار', 'رزرو با هماهنگی'], examples: 'RAV4 یا هم‌رده' }
]

const evidence = [
  { title: 'راننده تاییدشده', text: 'همکاری پس از بررسی مدارک و گواهی‌های لازم انجام می‌شود.' },
  { title: 'بیمه قانونی بین‌شهری', text: 'خودرو باید شرایط و پوشش قانونی حمل مسافر بین‌شهری را داشته باشد.' },
  { title: 'قیمت پیش از حرکت', text: 'شرایط و هزینه سفر پیش از نهایی‌شدن رزرو با شما تایید می‌شود.' },
  { title: 'پشتیبانی تا پایان', text: 'تیم پویش تاکسی هماهنگی سفر را از رزرو تا رسیدن پیگیری می‌کند.' }
]

const process = [
  { title: 'مسیرت را بگو', text: 'مبدا، مقصد و زمان' },
  { title: 'خودرو را انتخاب کن', text: 'اقتصادی تا VIP' },
  { title: 'جزئیات را تایید کن', text: 'قیمت و مشخصات راننده' },
  { title: 'از در خانه حرکت کن', text: 'مستقیم تا مقصد' },
  { title: 'با خیال راحت برس', text: 'همراهی تا پایان' }
]

const roleDashboardMap = { super_admin: '/admin/dashboard', admin: '/admin/dashboard', support: '/support/dashboard', driver: '/driver/dashboard', passenger: '/passenger/dashboard' }
const toFa = value => new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value)
const closeMenu = () => { menuOpen.value = false }

function startQuote() {
  quoteMessage.value = `مسیر ${trip.origin} تا ${trip.destination} ثبت شد. برای اعلام کرایه با ۰۹۲۲۹۲۴۷۰۸۱ تماس بگیرید.`
}

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
:global(*){box-sizing:border-box}:global(html){scroll-behavior:smooth}:global(body.pooyesh-landing){margin:0;background:#f3f7f6;color:#071a23;font-family:Estedad,Tahoma,sans-serif}.journey{--night:#071a23;--asphalt:#16252d;--sky:#6fa8c9;--amber:#f6b73c;--safe:#1e7a65;--mist:#f3f7f6;--paper:#fff;--muted:#607079;--line:#d6e0df;min-height:100vh;overflow:hidden}.skip-link{position:fixed;top:-100px;right:16px;z-index:100;padding:12px 18px;background:#fff;color:var(--night);border-radius:8px}.skip-link:focus{top:16px}.site-header{position:absolute;inset:0 0 auto;z-index:30;padding:20px 4vw}.nav-shell{max-width:1320px;min-height:68px;margin:auto;padding:8px 8px 8px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #ffffff2e;color:#fff}.brand{display:flex;align-items:center;gap:11px;color:inherit;text-decoration:none}.brand>span:last-child{display:flex;flex-direction:column}.brand strong{font-size:20px;line-height:1}.brand small{margin-top:5px;font-size:9px;letter-spacing:.02em;opacity:.65}.brand-road{position:relative;width:48px;height:48px;display:grid;place-items:center;border:1px solid #ffffff35;border-radius:50%}.brand-road:before,.brand-road:after{content:"";position:absolute;width:5px;height:5px;border-radius:50%;background:var(--amber)}.brand-road:before{right:11px;bottom:10px}.brand-road:after{left:11px;top:10px}.brand-road i{width:30px;height:20px;border:1.5px dashed currentColor;border-right:0;border-bottom:0;border-radius:100% 0 0;transform:rotate(-20deg);opacity:.8}.nav-links{display:flex;gap:28px}.nav-links a,.partner-link{color:#eaf1f2;text-decoration:none;font:500 13px Estedad;background:none;border:0;cursor:pointer;transition:color .2s}.nav-links a:hover,.partner-link:hover{color:var(--amber)}.nav-actions{display:flex;align-items:center;gap:12px}.header-cta{min-height:44px;padding:0 18px;display:inline-flex;align-items:center;border:1px solid #ffffff55;border-radius:50px;color:#fff;text-decoration:none;font-size:12px;font-weight:700;transition:background .2s,color .2s}.header-cta:hover{background:var(--amber);color:var(--night);border-color:var(--amber)}.menu-button{display:none;width:44px;height:44px;border:1px solid #ffffff40;border-radius:50%;background:#ffffff12}.menu-button svg{width:23px;fill:none;stroke:#fff;stroke-width:1.7}.hero{position:relative;min-height:100svh;display:flex;align-items:center;color:#fff;background:var(--night)}.hero-image,.hero-shade,.hero-grain{position:absolute;inset:0;width:100%;height:100%}.hero-image{object-fit:cover;object-position:50% 50%}.hero-shade{background:linear-gradient(90deg,rgba(7,26,35,.1),rgba(7,26,35,.55) 48%,rgba(7,26,35,.93) 100%),linear-gradient(0deg,rgba(7,26,35,.7),transparent 40%)}.hero-grain{opacity:.09;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")}.hero-content{position:relative;z-index:2;width:min(1320px,92vw);margin:130px auto 80px;display:grid;grid-template-columns:1.05fr .78fr;gap:8vw;align-items:end}.scene-label{display:inline-flex;align-items:center;gap:10px;color:#c9d6d9;font-size:11px;font-weight:650;letter-spacing:.02em}.scene-label i{width:30px;height:1px;background:var(--amber)}.scene-label.dark{color:var(--safe)}.scene-label.light{color:#dce8e7}.hero h1{max-width:760px;margin:24px 0;font-size:clamp(48px,6.4vw,96px);font-weight:830;line-height:1.14;letter-spacing:-.055em}.hero h1 em{color:var(--amber);font-style:normal}.hero-copy>p{max-width:660px;margin:0;color:#d5e0e2;font-size:clamp(15px,1.35vw,19px);line-height:2}.hero-proof{margin-top:30px;display:flex;flex-wrap:wrap;gap:12px 24px;color:#c9d6d8;font-size:11px}.hero-proof span{display:flex;align-items:center;gap:7px}.hero-proof svg{width:17px;height:17px;padding:3px;border:1px solid #f6b73c80;border-radius:50%;fill:none;stroke:var(--amber);stroke-width:3}.quick-booking{padding:26px;background:rgba(8,29,38,.74);border:1px solid #ffffff26;border-radius:22px;box-shadow:0 30px 90px #0006;backdrop-filter:blur(22px)}.booking-head{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:1px solid #ffffff1f}.booking-head div{display:flex;flex-direction:column}.booking-head small{color:var(--amber);font-size:10px}.booking-head strong{margin-top:4px;font-size:16px}.booking-head>span{padding:7px 10px;border-radius:50px;background:#ffffff10;color:#bccacd;font-size:9px}.route-inputs{position:relative;padding-right:34px;margin-top:18px}.route-rail{position:absolute;right:5px;top:30px;bottom:28px;width:14px;display:flex;flex-direction:column;align-items:center}.route-rail i,.route-rail b{width:11px;height:11px;border-radius:50%;border:2px solid var(--amber);background:var(--night)}.route-rail b{background:var(--amber)}.route-rail span{flex:1;border-right:1px dashed #f6b73c88}.quick-booking label{display:block}.quick-booking label>span{display:block;margin-bottom:6px;color:#aebdc0;font-size:10px}.quick-booking input,.quick-booking select{width:100%;height:48px;padding:0 13px;border:1px solid #ffffff20;border-radius:10px;outline:none;background:#ffffff0d;color:#fff;font:500 12px Estedad;color-scheme:dark}.quick-booking input::placeholder{color:#7f9196}.quick-booking input:focus,.quick-booking select:focus{border-color:var(--amber);box-shadow:0 0 0 3px #f6b73c1f}.route-inputs label+label{margin-top:12px}.booking-meta{display:grid;grid-template-columns:1.2fr .8fr;gap:10px;margin:14px 0}.primary-button{width:100%;min-height:52px;padding:0 18px;display:inline-flex;align-items:center;justify-content:center;gap:10px;border:0;border-radius:10px;background:var(--amber);color:var(--night);font:800 13px Estedad;text-decoration:none;cursor:pointer;transition:transform .2s,background .2s}.primary-button:hover{background:#ffc54f;transform:translateY(-2px)}.primary-button svg{width:19px;fill:none;stroke:currentColor;stroke-width:2}.form-message{margin:14px 0 0;padding:11px;border:1px solid #65bda060;border-radius:9px;background:#1e7a6530;color:#d5eee7;font-size:10px;line-height:1.8}.scroll-cue{position:absolute;z-index:2;right:4vw;bottom:25px;display:flex;align-items:center;gap:12px;color:#d4dfe1;text-decoration:none;font-size:9px;writing-mode:vertical-rl}.scroll-cue i{width:1px;height:42px;background:linear-gradient(var(--amber),transparent)}.section-shell{width:min(1240px,90vw);margin:auto}.journey-intro{padding:140px 0 110px;background:var(--mist)}.intro-grid{display:grid;grid-template-columns:1fr .75fr;gap:10vw}.chapter-copy h2,.section-heading h2,.safety-copy h2,.arrival-content h2{margin:22px 0 0;font-size:clamp(38px,5vw,70px);font-weight:790;line-height:1.22;letter-spacing:-.045em}.intro-text>p{margin:42px 0 35px;color:var(--muted);font-size:16px;line-height:2.1}.experience-note{display:flex;gap:18px;padding-top:24px;border-top:1px solid var(--line)}.experience-note span{color:var(--safe);font-weight:800}.experience-note p{margin:0;color:#30464e;font-size:12px;line-height:1.9}.road-story{position:relative;padding:40px 0 135px;background:var(--mist)}.road-line{position:absolute;top:106px;right:0;left:0;height:1px;background:#cbd8d7}.road-line span{position:absolute;right:0;width:50%;border-top:2px dashed var(--safe)}.road-line i{position:absolute;right:50%;top:-7px;width:15px;height:15px;border:3px solid var(--mist);border-radius:50%;background:var(--amber);box-shadow:0 0 0 1px var(--safe)}.story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.story-card{position:relative;min-height:330px;padding:32px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid var(--line);background:#f8fbfa}.story-card>span{position:absolute;top:28px;left:28px;color:#9aabad;font-size:10px}.story-icon{position:absolute;top:25px;right:28px;width:50px;height:50px;display:grid;place-items:center;border-radius:50%;background:#e2efeb;color:var(--safe)}.story-icon :deep(svg){width:24px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.story-card h3{margin:0 0 10px;font-size:22px}.story-card p{margin:0;color:var(--muted);font-size:12px;line-height:1.95}.fleet-section{padding:130px 0;background:#fff}.section-heading{display:flex;justify-content:space-between;align-items:end;gap:50px;margin-bottom:65px}.section-heading>p{max-width:440px;margin:0;color:var(--muted);font-size:13px;line-height:2}.fleet-layout{display:grid;grid-template-columns:.72fr 1.28fr;gap:22px}.fleet-tabs{display:flex;flex-direction:column;border-top:1px solid var(--line)}.fleet-tabs button{min-height:86px;padding:12px 4px;display:grid;grid-template-columns:54px 1fr auto;align-items:center;text-align:right;border:0;border-bottom:1px solid var(--line);background:transparent;color:#8a999e;font-family:Estedad;cursor:pointer}.fleet-tabs button>span{font:700 9px monospace}.fleet-tabs button strong{font-size:15px;color:#506269}.fleet-tabs button small{font-size:9px}.fleet-tabs button.active{color:var(--safe)}.fleet-tabs button.active strong{color:var(--night);font-size:18px}.fleet-tabs button.active>span:before{content:"";display:inline-block;width:16px;margin-left:8px;border-top:2px solid var(--amber);vertical-align:middle}.vehicle-panel{position:relative;min-height:500px;overflow:hidden;background:var(--night);color:#fff}.vehicle-horizon{position:absolute;inset:0;display:grid;place-items:end center;background:radial-gradient(circle at 25% 25%,#244b5a,transparent 48%),linear-gradient(145deg,#0c2732,#06161d)}.vehicle-horizon:after{content:"";position:absolute;inset:auto 0 0;height:42%;background:linear-gradient(165deg,transparent 48%,#ffffff08 49%,#ffffff08 52%,transparent 53%)}.vehicle-horizon svg{width:76%;margin-bottom:40px;fill:none;stroke:#d9e7e7;stroke-width:2;opacity:.28}.vehicle-info{position:relative;z-index:2;width:55%;padding:55px}.vehicle-info>span{color:var(--amber);font:700 10px monospace;letter-spacing:.15em}.vehicle-info h3{margin:12px 0;font-size:39px}.vehicle-info p{color:#bdcbce;font-size:13px;line-height:2}.vehicle-info ul{padding:0;list-style:none}.vehicle-info li{padding:9px 0;border-bottom:1px solid #ffffff17;font-size:11px}.vehicle-info li:before{content:"";display:inline-block;width:5px;height:5px;margin-left:9px;border-radius:50%;background:var(--amber)}.vehicle-info>small{display:block;margin-top:22px;color:#84989e;font-size:9px}.safety-section{position:relative;padding:145px 0;overflow:hidden;background:var(--night);color:#fff}.safety-glow{position:absolute;width:700px;height:700px;left:-200px;bottom:-450px;border-radius:50%;background:#1e7a6540;filter:blur(30px)}.safety-grid{position:relative;display:grid;grid-template-columns:.8fr 1.2fr;gap:10vw;align-items:center}.safety-copy>p{margin:28px 0;color:#b4c4c7;font-size:14px;line-height:2}.text-link{display:inline-flex;gap:12px;color:var(--amber);font-size:12px;font-weight:700;text-decoration:none}.evidence-list{border-top:1px solid #ffffff25}.evidence-list article{min-height:112px;padding:20px 0;display:grid;grid-template-columns:45px 1fr 40px;align-items:center;border-bottom:1px solid #ffffff25}.evidence-list>article>span{color:#7f949a;font:700 10px monospace}.evidence-list h3{margin:0 0 6px;font-size:18px}.evidence-list p{margin:0;color:#98aeb3;font-size:10px;line-height:1.8}.evidence-list svg{width:30px;height:30px;padding:8px;border:1px solid #1e7a65;border-radius:50%;fill:none;stroke:#62b69c;stroke-width:2}.process-section{padding:135px 0;background:#f3f7f6}.section-heading.centered{justify-content:center;text-align:center}.process-track{position:relative;margin:70px 0 0;padding:0;display:grid;grid-template-columns:repeat(5,1fr);list-style:none}.process-track:before{content:"";position:absolute;right:10%;left:10%;top:25px;border-top:1px dashed #91aaa8}.process-track li{position:relative;text-align:center}.process-track li>span{position:relative;z-index:1;width:50px;height:50px;margin:auto;display:grid;place-items:center;border:1px solid #9eb5b2;border-radius:50%;background:var(--mist);color:var(--safe);font-size:12px;font-weight:800}.process-track li:first-child>span,.process-track li:last-child>span{background:var(--safe);color:#fff;border-color:var(--safe)}.process-track div{display:flex;flex-direction:column;margin-top:18px}.process-track strong{font-size:13px}.process-track small{margin-top:6px;color:var(--muted);font-size:9px}.arrival-section{position:relative;min-height:680px;padding:130px 0;display:grid;place-items:center;text-align:center;overflow:hidden;background:linear-gradient(#17313b,#0c2029 60%,#071a23);color:#fff}.arrival-section:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 78%,#f6b73c35,transparent 15%),linear-gradient(170deg,transparent 56%,#ffffff0a 57%,transparent 59%)}.arrival-road{position:absolute;right:50%;bottom:0;width:500px;height:270px;transform:translateX(50%);clip-path:polygon(43% 0,57% 0,100% 100%,0 100%);background:#06141a}.arrival-road:before{content:"";position:absolute;right:50%;height:100%;border-right:3px dashed #f6b73c80}.arrival-road i{position:absolute;right:50%;top:0;width:14px;height:14px;transform:translate(50%,-50%);border-radius:50%;background:var(--amber);box-shadow:0 0 0 12px #f6b73c1b,0 0 45px var(--amber)}.arrival-content{position:relative;z-index:2}.arrival-content h2{font-size:clamp(58px,8vw,108px)}.arrival-content>p{max-width:570px;margin:22px auto;color:#b6c5c8;line-height:2}.arrival-actions{margin:34px 0 18px;display:flex;justify-content:center;gap:12px}.arrival-actions .primary-button{width:auto;min-width:165px}.phone-button{min-height:52px;padding:0 22px;display:inline-flex;align-items:center;border:1px solid #ffffff40;border-radius:10px;color:#fff;text-decoration:none;font-weight:700;direction:ltr}.arrival-content>small{color:#7f959b;font-size:9px}.footer{padding:75px 0 24px;background:#06161d;color:#fff}.footer-grid{display:grid;grid-template-columns:2fr repeat(3,1fr);gap:65px}.footer-grid>div{display:flex;flex-direction:column;align-items:flex-start;gap:11px}.footer-brand p{max-width:360px;color:#82979d;font-size:11px;line-height:2}.footer-grid>div>strong{margin-bottom:8px;color:#d9e4e6;font-size:12px}.footer-grid a,.footer-grid button{padding:0;color:#82979d;text-decoration:none;font:10px Estedad;background:none;border:0;cursor:pointer}.footer-grid a:hover,.footer-grid button:hover{color:var(--amber)}.footer-bottom{margin-top:55px;padding-top:20px;display:flex;justify-content:space-between;border-top:1px solid #ffffff16;color:#61777d;font-size:9px}.modal-backdrop{position:fixed;inset:0;z-index:60;padding:20px;display:grid;place-items:center;background:#020c10c9;backdrop-filter:blur(9px)}.login-modal{position:relative;width:min(420px,100%);padding:38px;border-radius:18px;background:#fff;color:var(--night);box-shadow:0 35px 100px #0008}.close-button{position:absolute;top:16px;left:16px;width:40px;height:40px;border:0;border-radius:50%;background:#edf2f1;color:var(--night);font-size:23px;cursor:pointer}.modal-kicker{color:var(--safe);font-size:10px;font-weight:800}.login-modal h2{margin:7px 0;font-size:27px}.login-modal>p{margin:0 0 24px;color:var(--muted);font-size:10px}.login-modal form{display:flex;flex-direction:column;gap:8px}.login-modal label{margin-top:5px;font-size:11px;font-weight:700}.login-modal input{height:48px;padding:0 12px;border:1px solid var(--line);border-radius:9px;outline:none;font:12px Estedad}.login-modal input:focus{border-color:var(--safe);box-shadow:0 0 0 3px #1e7a6519}.login-modal form>button{height:50px;margin-top:12px;border:0;border-radius:9px;background:var(--safe);color:#fff;font:700 12px Estedad;cursor:pointer}.login-modal form>button:disabled{opacity:.55;cursor:wait}.form-error{padding:10px;border-radius:8px;background:#fff0f0;color:#a72d2d;font-size:10px}
@media(max-width:980px){.nav-links{position:absolute;top:80px;right:4vw;left:4vw;padding:20px;display:none;flex-direction:column;background:#0b222bcc;border:1px solid #ffffff20;backdrop-filter:blur(20px)}.nav-links.open{display:flex}.partner-link{display:none}.menu-button{display:grid;place-items:center}.hero-content{grid-template-columns:1fr;margin-top:145px;gap:45px}.hero-copy{max-width:760px}.quick-booking{max-width:600px}.intro-grid,.safety-grid{grid-template-columns:1fr;gap:45px}.intro-text>p{margin-top:0}.fleet-layout{grid-template-columns:1fr}.fleet-tabs{display:grid;grid-template-columns:repeat(5,1fr);border-top:0}.fleet-tabs button{min-height:78px;display:flex;flex-direction:column;justify-content:center;text-align:center;border-top:1px solid var(--line)}.fleet-tabs button small{display:none}.fleet-tabs button.active>span:before{display:none}.vehicle-panel{min-height:450px}.footer-grid{grid-template-columns:2fr 1fr 1fr}.footer-grid>div:last-child{display:none}}
@media(max-width:680px){.site-header{padding:12px 16px}.nav-shell{min-height:60px;padding:4px 0;border-bottom-color:#ffffff20}.brand-road{width:42px;height:42px}.brand strong{font-size:17px}.header-cta{display:none}.hero{min-height:auto;padding-bottom:80px}.hero-image{object-position:40% 50%}.hero-shade{background:linear-gradient(180deg,#071a2366,#071a23e8 52%,#071a23 100%)}.hero-content{width:calc(100% - 32px);margin:120px auto 0;gap:35px}.hero h1{font-size:45px}.hero-copy>p{font-size:14px}.hero-proof{gap:10px}.quick-booking{padding:20px}.booking-head>span{display:none}.booking-meta{grid-template-columns:1fr}.scroll-cue{display:none}.journey-intro{padding:90px 0 65px}.section-shell{width:calc(100% - 32px)}.intro-grid{gap:28px}.chapter-copy h2,.section-heading h2,.safety-copy h2{font-size:39px}.road-story{padding:20px 0 90px}.road-line{display:none}.story-grid{grid-template-columns:1fr}.story-card{min-height:250px}.fleet-section,.safety-section,.process-section{padding:90px 0}.section-heading{display:block;margin-bottom:45px}.section-heading>p{margin-top:22px}.fleet-tabs{margin:0 -16px;padding:0 16px;display:flex;overflow-x:auto;scrollbar-width:none}.fleet-tabs button{min-width:105px}.vehicle-panel{min-height:560px}.vehicle-info{width:100%;padding:36px 25px}.vehicle-horizon{align-items:end}.vehicle-horizon svg{width:115%;margin-bottom:35px}.evidence-list article{grid-template-columns:34px 1fr 34px}.process-track{margin-top:50px;display:flex;flex-direction:column;gap:0;text-align:right}.process-track:before{right:24px;left:auto;top:25px;bottom:25px;border-top:0;border-right:1px dashed #91aaa8}.process-track li{min-height:90px;display:grid;grid-template-columns:50px 1fr;gap:18px;text-align:right}.process-track li>span{margin:0}.process-track div{margin:3px 0 0}.arrival-section{min-height:620px;padding:95px 0}.arrival-content h2{font-size:64px}.arrival-actions{flex-direction:column;align-items:stretch}.arrival-actions .primary-button{width:100%}.phone-button{justify-content:center}.footer-grid{grid-template-columns:1fr 1fr;gap:40px}.footer-brand{grid-column:span 2}.footer-grid>div:nth-child(3){display:flex}}
@media(prefers-reduced-motion:reduce){:global(html){scroll-behavior:auto}.journey *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
.journey-intro{position:relative;overflow:hidden;background:linear-gradient(135deg,#edf3f2 0%,#fff 42%,#e4eceb 100%)}.journey-intro:before{content:"";position:absolute;inset:-30% 45% -30% -10%;background:repeating-linear-gradient(115deg,transparent 0 68px,#071a2308 69px 70px);transform:skewX(-12deg)}.journey-intro:after{content:"";position:absolute;width:520px;height:520px;left:-260px;top:-180px;border:1px solid #1e7a651c;border-radius:50%;box-shadow:0 0 0 80px #1e7a6508,0 0 0 160px #1e7a6505}.intro-grid{position:relative;z-index:1}.luxury-drive{position:relative;height:760px;overflow:hidden;background:#06161d;color:#fff}.luxury-drive-image{position:absolute;inset:-4% -5%;width:110%;height:108%;object-fit:cover;will-change:transform}.luxury-drive-shade{position:absolute;inset:0;background:linear-gradient(90deg,#06161d00 0%,#06161d35 40%,#06161deb 78%,#06161d 100%),linear-gradient(0deg,#06161d9c 0%,transparent 40%,#06161d3d 100%)}.luxury-drive:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 90px 120px #06161d80,inset 0 -90px 120px #06161d}.luxury-drive-content{position:relative;z-index:3;height:100%;display:flex;align-items:center;justify-content:flex-start}.luxury-statement{width:42%;margin-right:auto;padding:48px 0}.luxury-overline{margin:45px 0 8px;color:#78909a;font:600 9px monospace;letter-spacing:.38em}.luxury-statement h2{margin:0;font-size:clamp(62px,8vw,116px);font-weight:760;line-height:1.03;letter-spacing:-.07em}.luxury-statement h2 em{color:var(--amber);font-style:normal;font-weight:350}.material-specs{margin-top:50px;padding-top:22px;display:flex;gap:25px;border-top:1px solid #ffffff25}.material-specs span{color:#d4dee0;font-size:9px}.material-specs i{margin-left:8px;color:var(--amber);font:600 8px monospace;font-style:normal}.light-sweep{position:absolute;z-index:2;right:40%;bottom:18%;width:55%;height:2px;background:linear-gradient(90deg,transparent,var(--amber),#fff5d1,transparent);filter:blur(2px);box-shadow:0 0 24px #f6b73c;transform:rotate(-2deg);opacity:.65;will-change:transform}.drive-meter{position:absolute;z-index:4;right:5vw;bottom:34px;left:5vw;height:30px;display:flex;align-items:center}.drive-meter:before{content:"";width:100%;border-top:1px solid #ffffff25}.drive-meter span,.drive-meter b{position:absolute;width:7px;height:7px;border-radius:50%;background:#fff}.drive-meter span{right:0}.drive-meter b{left:0;background:var(--amber)}.drive-meter i{position:absolute;right:32%;width:80px;border-top:2px solid var(--amber);box-shadow:0 0 16px #f6b73c}.road-story{background:radial-gradient(circle at 15% 15%,#d8e6e3 0,transparent 30%),linear-gradient(145deg,#eef4f2,#f9fbfa 48%,#dfe9e7)}.story-card{overflow:hidden;border-color:#c8d7d5;background:linear-gradient(145deg,#ffffffdb,#e8f0eedd);box-shadow:0 24px 70px #16343f0a;backdrop-filter:blur(12px)}.story-card:before{content:"";position:absolute;width:200px;height:200px;left:-120px;bottom:-120px;border:1px solid #1e7a6522;border-radius:50%;box-shadow:0 0 0 32px #1e7a6507}.story-card:nth-child(2){transform:translateY(38px);background:linear-gradient(145deg,#0c2732,#071a23);color:#fff;border-color:#29414a;box-shadow:0 30px 80px #071a2330}.story-card:nth-child(2) p{color:#a7b8bc}.story-card:nth-child(2) .story-icon{background:#f6b73c;color:#071a23}.fleet-section{position:relative;overflow:hidden;background:linear-gradient(135deg,#f7faf9 0%,#fff 35%,#e9efee 100%)}.fleet-section:before{content:"VIP";position:absolute;left:-3vw;top:40px;color:#071a2305;font:900 260px Estedad;letter-spacing:-.09em}.fleet-layout{position:relative;z-index:1;box-shadow:0 45px 120px #071a2315}.vehicle-panel{box-shadow:inset 0 0 0 1px #ffffff0d}.vehicle-panel:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 40%,#ffffff0b 50%,transparent 58%);transform:translateX(-120%);animation:metalSweep 7s ease-in-out infinite}.vehicle-horizon svg{filter:drop-shadow(0 16px 22px #000)}.safety-section{background:radial-gradient(circle at 10% 90%,#1e7a6552,transparent 28%),radial-gradient(circle at 85% 10%,#6fa8c91e,transparent 22%),linear-gradient(135deg,#06161d,#0b2732 56%,#06161d)}.safety-section:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(120deg,transparent 0 110px,#ffffff08 111px 112px);mask-image:linear-gradient(90deg,transparent,#000)}.safety-grid{z-index:1}.evidence-list article{position:relative;transition:background .25s,padding .25s}.evidence-list article:hover{padding-right:18px;padding-left:18px;background:linear-gradient(90deg,#ffffff08,transparent)}.process-section{position:relative;overflow:hidden;background:linear-gradient(180deg,#eaf1f0,#fff 46%,#e4ecea)}.process-section:before{content:"";position:absolute;inset:auto -5% -38% -5%;height:70%;background:#071a23;clip-path:polygon(0 100%,18% 47%,35% 73%,51% 30%,70% 70%,84% 41%,100% 100%);opacity:.06}.process-road{position:relative;width:100vw;height:90px;margin:5px calc(50% - 50vw) -20px;overflow:hidden}.process-road:before,.process-road:after{content:"";position:absolute;right:0;left:0}.process-road:before{top:48px;border-top:2px solid #819996}.process-road:after{top:61px;border-top:1px dashed #b4c4c1}.moving-car{position:absolute;z-index:2;right:50%;top:13px;width:96px;color:var(--night);filter:drop-shadow(0 12px 8px #071a2333)}.moving-car svg{width:96px;fill:#0a222c;stroke:#f6b73c;stroke-width:1}.moving-car span{position:absolute;right:4px;top:15px;width:120px;height:2px;background:linear-gradient(90deg,#f6b73c,transparent);filter:blur(1px);transform:translateX(100%)}.arrival-section{background:radial-gradient(circle at 50% 72%,#f6b73c45,transparent 12%),radial-gradient(ellipse at 50% 100%,#1e7a6550,transparent 45%),linear-gradient(#17313b,#0b2029 62%,#06161d)}.arrival-section:after{content:"";position:absolute;inset:0;background:linear-gradient(112deg,transparent 40%,#ffffff08 50%,transparent 58%);animation:arrivalGlow 8s ease-in-out infinite}.arrival-content{z-index:3}.arrival-road{z-index:1;filter:drop-shadow(0 -40px 65px #f6b73c18)}
@keyframes metalSweep{0%,55%{transform:translateX(-120%)}80%,100%{transform:translateX(120%)}}@keyframes arrivalGlow{0%,35%{transform:translateX(-70%)}70%,100%{transform:translateX(70%)}}
@media(max-width:980px){.luxury-drive{height:650px}.luxury-drive-image{object-position:38% 50%}.luxury-drive-shade{background:linear-gradient(90deg,#06161d05,#06161db8 68%,#06161dfa)}.luxury-statement{width:50%}.material-specs{flex-direction:column;gap:10px}}
@media(max-width:680px){.luxury-drive{height:720px}.luxury-drive-image{inset:0;width:100%;height:100%;object-position:35% 50%}.luxury-drive-shade{background:linear-gradient(180deg,#06161d20 0%,#06161d50 36%,#06161df7 70%,#06161d 100%)}.luxury-drive-content{align-items:flex-end}.luxury-statement{width:100%;padding-bottom:90px}.luxury-statement h2{font-size:61px}.material-specs{margin-top:30px;display:grid;grid-template-columns:1fr 1fr}.story-card:nth-child(2){transform:none}.fleet-section:before{font-size:130px;top:100px}.process-road{height:72px}.moving-car{transform:scale(.8)}}
@media(prefers-reduced-motion:reduce){.vehicle-panel:after,.arrival-section:after{animation:none!important}.luxury-drive-image,.light-sweep{transform:none!important}}
/* Daylight travel direction — derived from the approved reference */
.journey{--night:#08283a;--asphalt:#183a48;--amber:#ffb000;--safe:#177d73;--mist:#f8f7f1;--line:#d9e1df;background:#faf9f4}.site-header{color:var(--night)}.nav-shell{border-bottom-color:#08283a22}.nav-links a,.partner-link{color:#163645}.brand-road{border-color:#08283a33}.header-cta{border:0;background:var(--amber);color:var(--night);box-shadow:0 10px 30px #ffb00035}.menu-button{border-color:#08283a22;background:#ffffffaa}.menu-button svg{stroke:var(--night)}.hero{min-height:930px;color:var(--night);background:#eaf4f8}.hero-image{object-position:center}.hero-shade{background:linear-gradient(90deg,transparent 0%,#fff0 48%,#fff9 78%,#ffff 100%),linear-gradient(0deg,#f8f7f1 0%,transparent 28%)}.hero-grain{opacity:.035}.hero-content{margin-top:120px;display:block;align-self:stretch}.hero-copy{width:61%;margin-right:auto}.hero .scene-label{color:var(--safe)}.hero h1{margin-top:20px;font-size:clamp(54px,6vw,92px);color:var(--night)}.hero h1 em{color:var(--night)}.hero-copy>p{color:#526d78}.hero-proof{color:#355563}.quick-booking{width:min(1040px,94%);margin:65px auto 0;padding:22px;background:#fffef8eF;border:1px solid #fff;border-radius:16px;box-shadow:0 28px 70px #16394725;backdrop-filter:blur(18px);color:var(--night)}.booking-head{padding-bottom:14px;border-bottom-color:#08283a16}.booking-head small{color:var(--safe)}.booking-head>span{background:#eef4f2;color:#52706f}.route-inputs{padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}.route-rail{display:none}.route-inputs label+label{margin-top:0}.quick-booking label>span{color:#657982}.quick-booking input,.quick-booking select{height:54px;border-color:#dbe3e1;background:#fff;color:var(--night);color-scheme:light}.quick-booking input::placeholder{color:#84969c}.quick-booking .primary-button{margin-top:4px}.booking-meta{grid-template-columns:1fr 1fr}.scroll-cue{color:var(--night)}.journey-intro{padding-bottom:70px;background:linear-gradient(180deg,#f8f7f1,#f4f5ef)}.route-map{position:relative;height:410px;margin-top:70px;overflow:hidden;border-top:1px solid #16394717;background:radial-gradient(circle at 50% 30%,#fff,transparent 65%),repeating-linear-gradient(25deg,transparent 0 58px,#6f9fa70b 59px 60px)}.route-map:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,#c7dce227,transparent 50%,#efdbab2b)}.map-copy{position:absolute;z-index:3;top:42px;right:35px;display:flex;flex-direction:column;gap:17px}.map-copy>span{font-size:24px;font-weight:800}.map-copy strong{font-size:14px}.map-copy i{display:block;color:#7c9098;font-size:9px;font-style:normal}.map-svg{position:absolute;right:3%;bottom:30px;width:94%;height:300px;overflow:visible}.terrain-line{fill:none;stroke:#6d91992c;stroke-width:70;stroke-linecap:round}.glowing-route{fill:none;stroke:var(--amber);stroke-width:5;stroke-linecap:round;filter:drop-shadow(0 0 6px #ffb000)}.map-origin{fill:var(--safe);stroke:#fff;stroke-width:5}.map-destination{fill:var(--amber);stroke:#fff;stroke-width:5}.map-car{position:absolute;z-index:3;right:45%;bottom:129px}.map-car svg{width:65px;fill:#243d47;stroke:#fff;stroke-width:1;filter:drop-shadow(0 6px 5px #0004)}.luxury-drive{height:760px;background:#f7f4ed;color:var(--night)}.luxury-drive-image{inset:0;width:100%;height:100%;object-position:center}.luxury-drive-shade{background:linear-gradient(90deg,transparent 0 55%,#f9f6efb8 75%,#f9f6eff7 100%),linear-gradient(0deg,#f9f6ef4d,transparent 35%)}.luxury-drive:after{box-shadow:inset 0 75px 100px #fff8,inset 0 -75px 100px #f8f7f1}.luxury-drive .scene-label{color:var(--safe)}.luxury-statement{width:36%}.luxury-overline{color:#8c7450}.luxury-statement h2 em{color:var(--amber)}.material-specs{border-color:#08283a22}.material-specs span{color:#405d68}.drive-meter:before{border-color:#08283a30}.drive-meter span{background:var(--night)}.road-story{background:linear-gradient(180deg,#f7f5ee,#edf3f2)}.fleet-section{background:linear-gradient(180deg,#fff,#f6f3eb)}.fleet-section:before{color:#08283a06}.vehicle-panel{min-height:560px;background:#efece4;color:var(--night)}.vehicle-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.vehicle-horizon{display:none}.vehicle-panel:before{content:"";position:absolute;z-index:1;inset:0;background:linear-gradient(90deg,transparent 0 54%,#fff8 72%,#fffd 100%)}.vehicle-info{width:42%;margin-right:auto;padding:45px 36px;color:var(--night)}.vehicle-info p{color:#526b75}.vehicle-info li{border-color:#08283a18}.vehicle-info>small{color:#647c84}.vehicle-panel:after{z-index:2}.safety-section{background:linear-gradient(180deg,#f5f3eb,#e9f1ef);color:var(--night)}.safety-section:after{opacity:.25}.safety-copy>p{color:#536d75}.evidence-list{border-color:#16394720}.evidence-list article{border-color:#16394720}.evidence-list article:hover{background:#fff8}.evidence-list p{color:#637c83}.process-section{background:linear-gradient(180deg,#edf3f1,#fff9ef)}.arrival-section{background:linear-gradient(180deg,#f7e5bd,#e8c98c 58%,#163b49);color:var(--night)}.arrival-section:before{background:radial-gradient(circle at 50% 72%,#ffb00070,transparent 16%),linear-gradient(170deg,transparent 56%,#ffffff38 57%,transparent 59%)}.arrival-content>p{color:#405d68}.arrival-road{background:#173a46}.arrival-content>small{color:#31515e}
@media(max-width:980px){.hero{min-height:1050px}.hero-copy{width:78%}.quick-booking{width:90%}.luxury-statement{width:45%}.vehicle-info{width:48%}}
@media(max-width:680px){.site-header{background:linear-gradient(#ffffffaa,transparent)}.hero{min-height:auto;padding-bottom:55px}.hero-image{object-position:35% center}.hero-shade{background:linear-gradient(180deg,#ffffff18,#ffff 58%,#f8f7f1 100%)}.hero-content{margin-top:115px}.hero-copy{width:100%;padding-top:210px}.hero h1{font-size:43px}.quick-booking{width:100%;margin-top:35px}.route-inputs,.booking-meta{grid-template-columns:1fr}.route-map{width:100%;height:400px}.map-copy{right:20px}.map-copy>span{font-size:20px}.map-svg{right:-40%;width:140%}.map-car{display:none}.luxury-drive{height:650px}.luxury-drive-image{object-position:38% center}.luxury-drive-shade{background:linear-gradient(180deg,transparent 0 45%,#faf7f0ee 72%,#faf7f0 100%)}.luxury-drive-content{align-items:flex-end}.luxury-statement{width:100%;padding-bottom:70px}.luxury-statement h2{font-size:54px}.material-specs{grid-template-columns:1fr 1fr}.vehicle-panel{min-height:690px}.vehicle-panel:before{background:linear-gradient(180deg,transparent 0 45%,#fff8 60%,#ffff 78%)}.vehicle-info{width:100%;margin:0;padding:390px 24px 28px}.arrival-section{background:linear-gradient(180deg,#f7e5bd,#deb971 62%,#163b49)}}
:global(html.js-scroll-effects){scroll-behavior:auto}.scroll-progress-line{position:fixed;z-index:80;top:0;right:0;width:100%;height:3px;pointer-events:none;background:linear-gradient(90deg,#ffca53,#ffae00,#177d73);transform:scaleX(0);transform-origin:right center;box-shadow:0 0 15px #ffb00080}.scroll-reveal{opacity:0;transform:translate3d(0,45px,0);transition:opacity .8s ease,transform .8s cubic-bezier(.22,1,.36,1)}.scroll-reveal.in{opacity:1;transform:translate3d(0,0,0)}.stagger-reveal-item{opacity:0;transform:translate3d(0,28px,0);transition:opacity .65s ease,transform .65s cubic-bezier(.22,1,.36,1)}.stagger-reveal-item.in{opacity:1;transform:translate3d(0,0,0)}.nav-links a.active{color:var(--amber)}.nav-links a.active:after{content:"";display:block;margin-top:5px;border-top:2px solid currentColor}.route-map,.luxury-drive-image,.arrival-content{translate:0 var(--scroll-parallax-y,0)}
@media(prefers-reduced-motion:reduce){.scroll-reveal,.stagger-reveal-item{opacity:1;transform:none}.scroll-progress-line{display:none}}
</style>
