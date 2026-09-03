<template>
  <main class="pt-passenger" dir="rtl">
    <section class="phone-shell" :class="`screen-${screen}`" aria-label="پویش تاکسی">
      <div v-if="screen === 'splash'" class="splash-screen">
        <div class="brand-mark">
          <span class="brand-car"></span>
        </div>
        <h1>پویش تاکسی</h1>
        <p>سفر شهری و بین‌شهری، دقیق و امن</p>
        <div class="moving-road">
          <span></span>
          <span></span>
          <i></i>
        </div>
      </div>

      <div v-else-if="screen === 'onboarding'" class="auth-screen onboarding-screen">
        <div class="auth-top">
          <div class="mini-logo">
            <span class="brand-car small"></span>
            <strong>پویش تاکسی</strong>
          </div>
          <button class="ghost-link" type="button" @click="screen = 'login'">رد کردن</button>
        </div>

        <div class="onboard-card">
          <div class="map-preview">
            <span class="pin origin"></span>
            <span class="pin destination"></span>
            <span class="route-line"></span>
            <span class="floating-car"></span>
          </div>
          <h2>{{ onboardingSlides[activeSlide].title }}</h2>
          <p>{{ onboardingSlides[activeSlide].text }}</p>
        </div>

        <div class="slide-dots" aria-label="اسلایدها">
          <button
            v-for="(_, index) in onboardingSlides"
            :key="index"
            :class="{ active: activeSlide === index }"
            type="button"
            @click="activeSlide = index"
          ></button>
        </div>

        <button class="primary-action" type="button" @click="screen = 'login'">
          ورود با شماره موبایل
        </button>
      </div>

      <div v-else-if="screen === 'login'" class="auth-screen">
        <div class="auth-top">
          <div class="mini-logo">
            <span class="brand-car small"></span>
            <strong>پویش تاکسی</strong>
          </div>
          <button class="icon-button" type="button" aria-label="بازگشت" @click="screen = 'onboarding'">
            ‹
          </button>
        </div>

        <div class="auth-copy">
          <span>ورود مسافر</span>
          <h2>شماره موبایل خود را وارد کنید</h2>
          <p>کد تایید برای همین شماره ارسال می‌شود.</p>
        </div>

        <label class="field-label" for="mobile">شماره موبایل</label>
        <div class="mobile-field">
          <span>+98</span>
          <input
            id="mobile"
            v-model="mobile"
            inputmode="tel"
            maxlength="11"
            placeholder="09xxxxxxxxx"
            type="tel"
          />
        </div>

        <button class="primary-action" type="button" @click="screen = 'otp'">
          دریافت کد تایید
        </button>
        <button class="secondary-action" type="button">ورود با کلمه عبور</button>

        <p class="signup-copy">
          حساب کاربری نداری؟
          <button type="button">ثبت‌نام</button>
        </p>
      </div>

      <div v-else-if="screen === 'otp'" class="auth-screen">
        <div class="auth-top">
          <div class="mini-logo">
            <span class="brand-car small"></span>
            <strong>کد تایید</strong>
          </div>
          <button class="icon-button" type="button" aria-label="بازگشت" @click="screen = 'login'">
            ‹
          </button>
        </div>

        <div class="auth-copy compact">
          <span>ارسال شد</span>
          <h2>کد ۴ رقمی را وارد کنید</h2>
          <p>{{ mobile || '09123456789' }}</p>
        </div>

        <div class="otp-row" dir="ltr">
          <input
            v-for="(_, index) in otp"
            :key="index"
            v-model="otp[index]"
            inputmode="numeric"
            maxlength="1"
            type="text"
            @input="handleOtpInput(index, $event)"
            @keydown.backspace="handleOtpBackspace(index, $event)"
          />
        </div>

        <button class="primary-action" type="button" @click="screen = 'home'">
          تایید و ورود
        </button>
        <button class="ghost-action" type="button">ارسال دوباره کد تا ۰۰:۴۵</button>
      </div>

      <div v-else class="home-screen">
        <div class="map-canvas">
          <div class="map-grid"></div>
          <svg class="roads" viewBox="0 0 390 760" aria-hidden="true">
            <path d="M-30 180 C90 150 125 270 245 248 C320 235 360 178 430 190" />
            <path d="M80 -20 C142 130 97 214 152 344 C210 482 198 590 130 800" />
            <path d="M410 18 C300 92 292 200 278 300 C260 425 312 560 232 790" />
            <path d="M-20 545 C92 493 153 512 230 542 C306 572 350 548 420 500" />
          </svg>
          <span class="user-location"></span>
          <span class="driver-dot one"></span>
          <span class="driver-dot two"></span>
          <span class="driver-dot three"></span>
        </div>

        <header class="home-header">
          <div class="home-actions">
            <button class="round-button" type="button" aria-label="پروفایل">☰</button>
            <button class="round-button" type="button" aria-label="اعلان‌ها">•</button>
          </div>
          <div class="home-logo">
            <span class="brand-car tiny"></span>
            <strong>پویش تاکسی</strong>
          </div>
        </header>

        <button class="destination-search" type="button" @click="searchOpen = true">
          <span class="search-pin"></span>
          <span>{{ destination || 'کجا می‌روی؟' }}</span>
          <i>جستجو</i>
        </button>

        <div v-if="searchOpen" class="address-overlay">
          <div class="address-panel">
            <div class="panel-grip"></div>
            <div class="address-title">
              <button class="icon-button dark" type="button" aria-label="بستن" @click="searchOpen = false">×</button>
              <strong>انتخاب مقصد</strong>
            </div>
            <label class="address-input">
              <span></span>
              <input v-model="addressQuery" autofocus placeholder="نام خیابان، محله یا مقصد" type="text" />
            </label>
            <button
              v-for="place in filteredPlaces"
              :key="place.name"
              class="place-item"
              type="button"
              @click="choosePlace(place.name)"
            >
              <span>{{ place.icon }}</span>
              <div>
                <strong>{{ place.name }}</strong>
                <small>{{ place.detail }}</small>
              </div>
            </button>
          </div>
        </div>

        <section class="ride-sheet" :class="{ searching: rideMode === 'searching' }">
          <div class="panel-grip"></div>

          <template v-if="rideMode !== 'searching'">
            <div class="sheet-head">
              <div>
                <span>مبدأ شما</span>
                <strong>تهران، میدان ولیعصر</strong>
              </div>
              <button class="cash-badge" type="button">کیف پول</button>
            </div>

            <div class="route-summary">
              <span></span>
              <div>
                <small>مقصد</small>
                <strong>{{ destination || 'مقصد را انتخاب کنید' }}</strong>
              </div>
            </div>

            <div class="vehicle-strip" aria-label="کلاس خودرو">
              <button
                v-for="vehicle in vehicleClasses"
                :key="vehicle.id"
                :class="{ active: selectedVehicle.id === vehicle.id }"
                type="button"
                @click="selectedVehicleId = vehicle.id"
              >
                <span class="vehicle-icon">{{ vehicle.symbol }}</span>
                <strong>{{ vehicle.name }}</strong>
                <small>{{ vehicle.eta }}</small>
              </button>
            </div>

            <div class="fare-card">
              <div>
                <span>{{ selectedVehicle.subtitle }}</span>
                <strong>{{ selectedVehicle.price }}</strong>
              </div>
              <small>{{ selectedVehicle.note }}</small>
            </div>

            <div class="sheet-actions">
              <button class="option-button" type="button">کد تخفیف</button>
              <button class="option-button" type="button">پرداخت نقدی</button>
            </div>

            <button class="request-button" type="button" @click="requestRide">
              درخواست {{ selectedVehicle.name }}
            </button>
          </template>

          <template v-else>
            <div class="searching-state">
              <div class="radar">
                <span></span>
                <i></i>
              </div>
              <h3>در جستجوی نزدیک‌ترین راننده...</h3>
              <p>{{ selectedVehicle.name }} برای {{ destination || 'مقصد انتخابی' }}</p>
              <button class="secondary-action danger" type="button" @click="rideMode = 'selecting'">
                لغو درخواست
              </button>
            </div>
          </template>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
definePageMeta({
  layout: false
})

useHead({
  title: 'پویش تاکسی | اپلیکیشن مسافر',
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
  meta: [
    { name: 'description', content: 'رابط موبایل اپلیکیشن مسافر پویش تاکسی' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
  ],
  link: [
    { rel: 'stylesheet', href: '/assets/fonts/estedad/fontface.css' }
  ]
})

const screen = ref('splash')
const activeSlide = ref(0)
const mobile = ref('09')
const otp = ref(['', '', '', ''])
const searchOpen = ref(false)
const addressQuery = ref('')
const destination = ref('')
const selectedVehicleId = ref('eco-city')
const rideMode = ref('normal')

const onboardingSlides = [
  { title: 'سفری امن', text: 'رانندگان تاییدشده، مسیر زنده و پشتیبانی همیشه فعال.' },
  { title: 'قیمت‌گذاری شفاف', text: 'قبل از درخواست، هزینه هر کلاس خودرو را دقیق ببین.' },
  { title: 'پشتیبانی ۲۴ ساعته', text: 'از شروع سفر تا پایان، تیم پویش همراه توست.' }
]

const vehicleClasses = [
  { id: 'eco-city', name: 'ECO شهری', subtitle: 'اقتصادی برای سفرهای روزمره', price: '۸۵,۰۰۰ تومان', eta: '۳ دقیقه', note: 'پیشنهاد محبوب امروز', symbol: 'E' },
  { id: 'eco-road', name: 'ECO بین‌شهری', subtitle: 'گزینه اقتصادی مسیرهای خارج شهر', price: '۴۸۰,۰۰۰ تومان', eta: '۹ دقیقه', note: 'مناسب رزرو و سفر جاده‌ای', symbol: 'R' },
  { id: 'eco-plus', name: 'ECO+', subtitle: 'خودروی تمیزتر با راننده منتخب', price: '۱۰۸,۰۰۰ تومان', eta: '۴ دقیقه', note: 'تعادل قیمت و کیفیت', symbol: '+' },
  { id: 'vip', name: 'VIP', subtitle: 'سدان راحت با سرویس ممتاز', price: '۱۷۵,۰۰۰ تومان', eta: '۶ دقیقه', note: 'مناسب جلسه و فرودگاه', symbol: 'V' },
  { id: 'vip-plus', name: 'VIP+', subtitle: 'خودروی لوکس و تجربه آرام‌تر', price: '۲۴۵,۰۰۰ تومان', eta: '۸ دقیقه', note: 'بالاترین امتیاز رانندگان', symbol: 'P' },
  { id: 'suv', name: 'SUV', subtitle: 'فضای بیشتر برای خانواده و بار', price: '۲۲۵,۰۰۰ تومان', eta: '۷ دقیقه', note: 'ظرفیت و راحتی بیشتر', symbol: 'S' },
  { id: 'van', name: 'ون', subtitle: 'گروهی تا ۱۰ نفر', price: '۳۴۰,۰۰۰ تومان', eta: '۱۲ دقیقه', note: 'بهترین گزینه برای گروه‌ها', symbol: 'W' }
]

const places = [
  { name: 'فرودگاه امام خمینی', detail: 'اتوبان تهران قم، ترمینال خروجی', icon: '✈' },
  { name: 'ایستگاه راه‌آهن تهران', detail: 'میدان راه‌آهن، ورودی اصلی', icon: '⌂' },
  { name: 'برج میلاد', detail: 'بزرگراه حکیم، ورودی پارکینگ', icon: '⌁' },
  { name: 'بیمارستان میلاد', detail: 'بزرگراه همت، جنب برج میلاد', icon: '+' }
]

const selectedVehicle = computed(() => {
  return vehicleClasses.find((vehicle) => vehicle.id === selectedVehicleId.value) || vehicleClasses[0]
})

const filteredPlaces = computed(() => {
  const query = addressQuery.value.trim()

  if (!query) {
    return places
  }

  return places.filter((place) => `${place.name} ${place.detail}`.includes(query))
})

onMounted(() => {
  window.setTimeout(() => {
    if (screen.value === 'splash') {
      screen.value = 'onboarding'
    }
  }, 1400)
})

watch(otp, (value) => {
  if (value.every(Boolean)) {
    window.setTimeout(() => {
      screen.value = 'home'
    }, 260)
  }
}, { deep: true })

function handleOtpInput(index, event) {
  const input = event.target
  otp.value[index] = input.value.replace(/\D/g, '').slice(0, 1)

  if (otp.value[index] && input.nextElementSibling) {
    input.nextElementSibling.focus()
  }
}

function handleOtpBackspace(index, event) {
  if (!otp.value[index] && event.target.previousElementSibling) {
    event.target.previousElementSibling.focus()
  }
}

function choosePlace(place) {
  destination.value = place
  searchOpen.value = false
  rideMode.value = 'selecting'
}

function requestRide() {
  rideMode.value = 'searching'
}
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

.pt-passenger {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 0;
  background: #ffffff;
  color: #14211f;
  font-family: "Vazirmatn", "IRANSans", "Estedad-VF", Tahoma, sans-serif;
}

.phone-shell {
  width: min(100vw, 390px);
  height: 100dvh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #f6f8f6;
  box-shadow: none;
}

@media (min-width: 520px) {
  .pt-passenger {
    min-height: 100vh;
  }

  .phone-shell {
    width: 390px;
    height: 100vh;
    min-height: 100vh;
    border: 0;
    border-radius: 0;
  }
}

button,
input {
  font: inherit;
}

button {
  border: 0;
  cursor: pointer;
}

.splash-screen,
.auth-screen {
  min-height: 100%;
  padding: 28px 24px;
}

.splash-screen {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 14px;
  text-align: center;
  color: #ffffff;
  background:
    linear-gradient(160deg, rgba(2, 78, 66, 0.88), rgba(10, 126, 100, 0.92)),
    #063c34;
}

.brand-mark {
  width: 106px;
  height: 106px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.13);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 24px 60px rgba(0, 0, 0, 0.2);
}

.brand-car,
.floating-car {
  width: 54px;
  height: 28px;
  position: relative;
  display: inline-block;
  border-radius: 14px 18px 10px 10px;
  background: #ffbe4d;
}

.brand-car::before,
.floating-car::before {
  content: "";
  position: absolute;
  width: 24px;
  height: 12px;
  top: -8px;
  right: 15px;
  border-radius: 12px 12px 3px 3px;
  background: #ffffff;
}

.brand-car::after,
.floating-car::after {
  content: "";
  position: absolute;
  right: 8px;
  bottom: -5px;
  width: 38px;
  height: 10px;
  background:
    radial-gradient(circle at 6px 5px, #17212a 0 5px, transparent 6px),
    radial-gradient(circle at 32px 5px, #17212a 0 5px, transparent 6px);
}

.brand-car.small {
  width: 35px;
  height: 19px;
}

.brand-car.small::before {
  width: 17px;
  height: 8px;
  top: -5px;
  right: 9px;
}

.brand-car.small::after {
  width: 25px;
  height: 7px;
  right: 5px;
  bottom: -4px;
  background:
    radial-gradient(circle at 4px 4px, #17212a 0 3px, transparent 4px),
    radial-gradient(circle at 21px 4px, #17212a 0 3px, transparent 4px);
}

.brand-car.tiny {
  width: 29px;
  height: 16px;
}

.brand-car.tiny::before {
  width: 14px;
  height: 7px;
  top: -5px;
  right: 8px;
}

.brand-car.tiny::after {
  display: none;
}

.splash-screen h1 {
  margin: 16px 0 0;
  font-size: 34px;
  font-weight: 900;
}

.splash-screen p {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
}

.moving-road {
  width: 180px;
  height: 56px;
  margin-top: 28px;
  position: relative;
  overflow: hidden;
}

.moving-road span {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.28);
}

.moving-road span:first-child {
  top: 20px;
}

.moving-road span:nth-child(2) {
  bottom: 18px;
}

.moving-road i {
  width: 34px;
  height: 18px;
  position: absolute;
  top: 18px;
  right: -44px;
  border-radius: 9px;
  background: #ffffff;
  animation: drive 1.4s infinite linear;
}

@keyframes drive {
  to {
    right: 205px;
  }
}

.auth-screen {
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: #f8faf9;
}

.auth-top,
.home-header,
.address-title,
.sheet-head,
.sheet-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mini-logo,
.home-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.mini-logo strong,
.home-logo strong {
  font-weight: 900;
}

.ghost-link,
.ghost-action,
.signup-copy button {
  color: #07846c;
  background: transparent;
}

.icon-button,
.round-button {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #ffffff;
  color: #13201d;
  box-shadow: 0 10px 24px rgba(18, 32, 29, 0.08);
}

.icon-button {
  font-size: 28px;
}

.icon-button.dark {
  width: 38px;
  height: 38px;
  font-size: 22px;
  color: #ffffff;
  background: #17212a;
}

.onboard-card {
  margin-top: 18px;
}

.map-preview {
  height: 290px;
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.56) 1px, transparent 1px) 0 0 / 44px 44px,
    linear-gradient(rgba(255, 255, 255, 0.56) 1px, transparent 1px) 0 0 / 44px 44px,
    linear-gradient(145deg, #d9f1ea, #f3f5ec 52%, #ffe1a6);
}

.route-line {
  width: 210px;
  height: 118px;
  position: absolute;
  right: 72px;
  top: 78px;
  border: 5px dashed rgba(5, 127, 104, 0.72);
  border-bottom: 0;
  border-left: 0;
  border-radius: 0 70px 0 0;
  transform: rotate(-9deg);
}

.pin {
  width: 22px;
  height: 22px;
  position: absolute;
  z-index: 2;
  border: 5px solid #ffffff;
  border-radius: 50% 50% 50% 0;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.15);
  transform: rotate(-45deg);
}

.pin.origin {
  right: 58px;
  top: 68px;
  background: #07846c;
}

.pin.destination {
  left: 74px;
  bottom: 72px;
  background: #ff9f1a;
}

.floating-car {
  position: absolute;
  right: 170px;
  top: 138px;
  transform: scale(0.9) rotate(-8deg);
}

.onboard-card h2,
.auth-copy h2 {
  margin: 28px 0 8px;
  font-size: 26px;
  font-weight: 950;
}

.onboard-card p,
.auth-copy p {
  margin: 0;
  color: #6a7673;
  line-height: 1.9;
}

.slide-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: auto;
}

.slide-dots button {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #c6d4d0;
  transition: 0.2s ease;
}

.slide-dots button.active {
  width: 28px;
  background: #07846c;
}

.primary-action,
.secondary-action,
.request-button,
.option-button {
  width: 100%;
  min-height: 54px;
  border-radius: 18px;
  font-weight: 850;
}

.primary-action,
.request-button {
  color: #ffffff;
  background: linear-gradient(135deg, #07846c, #05a987);
  box-shadow: 0 18px 34px rgba(7, 132, 108, 0.27);
}

.secondary-action {
  color: #17212a;
  background: #e9efed;
}

.secondary-action.danger {
  margin-top: 18px;
  color: #b42318;
  background: #fff1f0;
  box-shadow: none;
}

.auth-copy span {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 999px;
  color: #07846c;
  background: #e1f6f0;
  font-size: 12px;
  font-weight: 900;
}

.auth-copy.compact {
  margin-top: 42px;
}

.field-label {
  margin-top: 22px;
  color: #52615e;
  font-size: 13px;
  font-weight: 800;
}

.mobile-field,
.address-input {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 0 16px;
  border: 1px solid #dfe8e4;
  border-radius: 18px;
  background: #ffffff;
}

.mobile-field span {
  color: #07846c;
  font-weight: 900;
}

.mobile-field input,
.address-input input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #17212a;
}

.signup-copy {
  margin: auto 0 0;
  color: #6a7673;
  text-align: center;
}

.signup-copy button {
  font-weight: 900;
}

.otp-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 26px 0 10px;
}

.otp-row input {
  width: 100%;
  height: 64px;
  border: 1px solid #dbe6e2;
  border-radius: 20px;
  outline: 0;
  background: #ffffff;
  color: #17212a;
  text-align: center;
  font-size: 25px;
  font-weight: 950;
}

.otp-row input:focus {
  border-color: #07846c;
  box-shadow: 0 0 0 4px rgba(7, 132, 108, 0.12);
}

.home-screen {
  min-height: 100%;
  position: relative;
  background: #dbe7e2;
}

.map-canvas,
.map-grid,
.roads {
  position: absolute;
  inset: 0;
}

.map-canvas {
  overflow: hidden;
  background:
    radial-gradient(circle at 45% 42%, rgba(255, 255, 255, 0.65), transparent 18%),
    linear-gradient(150deg, #d6ece4 0%, #edf1e9 46%, #f7dfae 100%);
}

.map-grid {
  opacity: 0.72;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.7) 1px, transparent 1px) 0 0 / 48px 48px,
    linear-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px) 0 0 / 48px 48px;
}

.roads path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.92);
  stroke-width: 28;
  stroke-linecap: round;
  filter: drop-shadow(0 4px 0 rgba(7, 40, 35, 0.04));
}

.roads path:nth-child(2),
.roads path:nth-child(3) {
  stroke-width: 22;
}

.user-location {
  width: 26px;
  height: 26px;
  position: absolute;
  right: 48%;
  top: 37%;
  border: 6px solid #ffffff;
  border-radius: 50%;
  background: #07846c;
  box-shadow: 0 0 0 12px rgba(7, 132, 108, 0.17), 0 12px 26px rgba(0, 0, 0, 0.16);
}

.driver-dot {
  width: 34px;
  height: 22px;
  position: absolute;
  border-radius: 12px 14px 8px 8px;
  background: #17212a;
  box-shadow: 0 12px 18px rgba(23, 33, 42, 0.18);
}

.driver-dot::after {
  content: "";
  position: absolute;
  inset: auto 6px -3px 6px;
  height: 6px;
  background:
    radial-gradient(circle at 4px 3px, #ffffff 0 3px, transparent 4px),
    radial-gradient(circle at 18px 3px, #ffffff 0 3px, transparent 4px);
}

.driver-dot.one {
  right: 64px;
  top: 252px;
  transform: rotate(18deg);
}

.driver-dot.two {
  left: 82px;
  top: 178px;
  transform: rotate(-25deg);
}

.driver-dot.three {
  left: 74px;
  bottom: 310px;
  transform: rotate(12deg);
}

.home-header {
  position: relative;
  z-index: 3;
  padding: 18px 18px 0;
}

.home-actions {
  display: flex;
  gap: 10px;
}

.round-button {
  font-size: 22px;
  font-weight: 900;
}

.home-logo {
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 30px rgba(20, 33, 31, 0.09);
  backdrop-filter: blur(14px);
}

.destination-search {
  width: calc(100% - 36px);
  min-height: 60px;
  position: relative;
  z-index: 3;
  margin: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-radius: 20px;
  color: #17212a;
  background: #ffffff;
  text-align: right;
  box-shadow: 0 16px 40px rgba(20, 33, 31, 0.12);
}

.destination-search span:nth-child(2) {
  flex: 1;
  font-weight: 900;
}

.destination-search i {
  color: #07846c;
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
}

.search-pin,
.route-summary span,
.address-input span {
  width: 14px;
  height: 14px;
  display: inline-block;
  border: 4px solid #07846c;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}

.ride-sheet,
.address-panel {
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 4;
  padding: 10px 18px 22px;
  border-radius: 28px 28px 0 0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -18px 42px rgba(18, 32, 29, 0.12);
  backdrop-filter: blur(18px);
}

.panel-grip {
  width: 42px;
  height: 5px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: #d4ded9;
}

.sheet-head span,
.route-summary small,
.fare-card span {
  display: block;
  color: #71817d;
  font-size: 12px;
  font-weight: 750;
}

.sheet-head strong,
.route-summary strong,
.fare-card strong {
  display: block;
  margin-top: 4px;
  color: #17212a;
  font-weight: 950;
}

.cash-badge {
  padding: 9px 12px;
  border-radius: 999px;
  color: #6e4b00;
  background: #fff1cf;
  font-size: 12px;
  font-weight: 900;
}

.route-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0 16px;
  padding: 13px;
  border-radius: 18px;
  background: #f4f7f5;
}

.route-summary span {
  border-color: #ff9f1a;
}

.vehicle-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 0 14px;
  scrollbar-width: none;
}

.vehicle-strip::-webkit-scrollbar {
  display: none;
}

.vehicle-strip button {
  min-width: 106px;
  padding: 11px 10px;
  border: 1px solid #e1ebe7;
  border-radius: 18px;
  background: #ffffff;
  color: #17212a;
  text-align: center;
}

.vehicle-strip button.active {
  border-color: #07846c;
  background: #eefaf6;
  box-shadow: inset 0 0 0 1px rgba(7, 132, 108, 0.18);
}

.vehicle-icon {
  width: 36px;
  height: 28px;
  margin: 0 auto 8px;
  display: grid;
  place-items: center;
  border-radius: 12px 14px 8px 8px;
  color: #ffffff;
  background: #17212a;
  font-size: 12px;
  font-weight: 950;
}

.vehicle-strip strong,
.vehicle-strip small {
  display: block;
}

.vehicle-strip strong {
  font-size: 12px;
  font-weight: 950;
}

.vehicle-strip small {
  margin-top: 3px;
  color: #71817d;
  font-size: 11px;
}

.fare-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border: 1px solid #e0ebe7;
  border-radius: 18px;
  background: #ffffff;
}

.fare-card small {
  max-width: 128px;
  color: #07846c;
  line-height: 1.8;
  text-align: left;
}

.sheet-actions {
  gap: 10px;
  margin: 12px 0;
}

.option-button {
  min-height: 44px;
  color: #17212a;
  background: #eef3f1;
  font-size: 13px;
}

.request-button {
  border-radius: 19px;
}

.address-overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
  background: rgba(23, 33, 42, 0.32);
}

.address-panel {
  min-height: 66%;
}

.address-title {
  margin-bottom: 18px;
}

.address-input {
  margin-bottom: 14px;
}

.place-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
  border-bottom: 1px solid #eef3f1;
  color: #17212a;
  background: transparent;
  text-align: right;
}

.place-item > span {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #07846c;
  background: #eaf8f4;
  font-weight: 900;
}

.place-item strong,
.place-item small {
  display: block;
}

.place-item small {
  margin-top: 4px;
  color: #71817d;
}

.ride-sheet.searching {
  min-height: 340px;
}

.searching-state {
  display: grid;
  justify-items: center;
  padding: 12px 0 2px;
  text-align: center;
}

.radar {
  width: 128px;
  height: 128px;
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #eefaf6;
}

.radar::before,
.radar::after {
  content: "";
  position: absolute;
  inset: 12px;
  border: 2px solid rgba(7, 132, 108, 0.2);
  border-radius: 50%;
}

.radar::after {
  inset: 28px;
}

.radar span {
  width: 34px;
  height: 34px;
  border: 7px solid #ffffff;
  border-radius: 50%;
  background: #07846c;
  box-shadow: 0 8px 20px rgba(7, 132, 108, 0.32);
}

.radar i {
  width: 60px;
  height: 2px;
  position: absolute;
  right: 64px;
  top: 63px;
  transform-origin: right center;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(7, 132, 108, 0.85));
  animation: scan 1.15s linear infinite;
}

@keyframes scan {
  to {
    transform: rotate(360deg);
  }
}

.searching-state h3 {
  margin: 18px 0 6px;
  font-size: 19px;
  font-weight: 950;
}

.searching-state p {
  margin: 0;
  color: #71817d;
}

@media (max-width: 360px) {
  .splash-screen,
  .auth-screen {
    padding: 22px 18px;
  }

  .vehicle-strip button {
    min-width: 96px;
  }

  .fare-card {
    display: block;
  }

  .fare-card small {
    max-width: none;
    margin-top: 8px;
    text-align: right;
  }
}
</style>
