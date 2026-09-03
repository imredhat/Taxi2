<template>
  <main class="driver-app" dir="rtl">
    <section class="driver-shell" aria-label="اپلیکیشن راننده پویش تاکسی">
      <div class="map-layer">
        <div class="map-grid"></div>
        <svg class="roads" viewBox="0 0 390 780" aria-hidden="true">
          <path d="M-40 190 C80 158 132 268 246 246 C322 232 360 178 430 198" />
          <path d="M82 -30 C142 128 102 230 154 356 C213 498 198 610 136 820" />
          <path d="M410 22 C300 90 294 202 278 308 C258 434 316 570 226 812" />
          <path d="M-25 552 C92 492 154 516 232 546 C312 576 350 548 424 502" />
        </svg>
        <span class="hot-zone one">پردرخواست</span>
        <span class="hot-zone two">کرایه بالا</span>
        <span class="driver-marker"></span>
        <span class="pickup-pin"></span>
        <span class="drop-pin"></span>
      </div>

      <header class="top-bar">
        <button class="round-btn" type="button" aria-label="منو">☰</button>
        <div class="driver-id">
          <strong>علی رضایی</strong>
          <span>سمند EF7 • ۲۵ ع ۷۳۴ ایران ۲۲</span>
        </div>
        <button class="round-btn alert-dot" type="button" aria-label="اعلان‌ها"></button>
      </header>

      <section class="status-card">
        <div>
          <span>{{ isOnline ? 'آماده دریافت سفر' : 'آفلاین' }}</span>
          <strong>{{ isOnline ? 'در محدوده ولیعصر فعال هستی' : 'برای شروع، آنلاین شو' }}</strong>
        </div>
        <button class="online-toggle" :class="{ active: isOnline }" type="button" @click="toggleOnline">
          <i></i>
          {{ isOnline ? 'آنلاین' : 'آفلاین' }}
        </button>
      </section>

      <section class="stats-strip">
        <article>
          <span>درآمد امروز</span>
          <strong>۲,۵۸۰,۰۰۰</strong>
          <small>تومان</small>
        </article>
        <article>
          <span>سفرها</span>
          <strong>۸</strong>
          <small>امروز</small>
        </article>
        <article>
          <span>امتیاز</span>
          <strong>۴.۸</strong>
          <small>از ۵</small>
        </article>
      </section>

      <section class="bottom-panel" :class="panelState">
        <div class="panel-grip"></div>

        <template v-if="panelState === 'idle'">
          <div class="idle-state">
            <h1>{{ isOnline ? 'منتظر درخواست سفر' : 'فعلاً آفلاین هستی' }}</h1>
            <p>
              {{ isOnline ? 'درخواست‌های نزدیک روی همین صفحه نمایش داده می‌شوند.' : 'با آنلاین شدن، نزدیک‌ترین درخواست‌ها را دریافت می‌کنی.' }}
            </p>
            <div class="quick-actions">
              <button type="button">کیف پول</button>
              <button type="button">برنامه کاری</button>
              <button type="button">پشتیبانی</button>
            </div>
          </div>
        </template>

        <template v-else-if="panelState === 'request'">
          <div class="request-head">
            <div>
              <span>درخواست جدید</span>
              <strong>{{ activeRequest.className }}</strong>
            </div>
            <b>{{ countdown }} ثانیه</b>
          </div>

          <div class="fare-row">
            <strong>{{ activeRequest.fare }}</strong>
            <span>{{ activeRequest.distance }} تا مبدأ • {{ activeRequest.duration }}</span>
          </div>

          <div class="route-card">
            <div class="route-line"></div>
            <div>
              <span class="dot origin"></span>
              <p>
                <small>مبدأ</small>
                <strong>{{ activeRequest.pickup }}</strong>
              </p>
            </div>
            <div>
              <span class="dot dest"></span>
              <p>
                <small>مقصد</small>
                <strong>{{ activeRequest.dropoff }}</strong>
              </p>
            </div>
          </div>

          <div class="decision-row">
            <button class="reject-btn" type="button" @click="rejectRide">رد کردن</button>
            <button class="accept-btn" type="button" @click="acceptRide">قبول سفر</button>
          </div>
        </template>

        <template v-else>
          <div class="trip-state">
            <span class="trip-badge">{{ tripStarted ? 'در مسیر مقصد' : 'حرکت به سمت مسافر' }}</span>
            <h2>{{ tripStarted ? activeRequest.dropoff : activeRequest.pickup }}</h2>
            <p>{{ tripStarted ? 'مسافر سوار شده و مسیر شروع شده است.' : 'تا رسیدن به مسافر ۴ دقیقه زمان باقی مانده.' }}</p>

            <div class="passenger-card">
              <span>م</span>
              <div>
                <strong>مهدی محمدی</strong>
                <small>امتیاز ۴.۹ • پرداخت آنلاین</small>
              </div>
              <button type="button">تماس</button>
            </div>

            <button v-if="!tripStarted" class="accept-btn wide" type="button" @click="tripStarted = true">
              مسافر سوار شد
            </button>
            <button v-else class="finish-btn" type="button" @click="finishRide">
              پایان سفر و دریافت کرایه
            </button>
          </div>
        </template>
      </section>

      <nav class="driver-nav">
        <button class="active" type="button">خانه</button>
        <button type="button">درآمد</button>
        <button type="button">سفرها</button>
        <button type="button">حساب</button>
      </nav>
    </section>
  </main>
</template>

<script setup>
definePageMeta({
  layout: false
})

useHead({
  title: 'پویش تاکسی | اپلیکیشن راننده',
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
  meta: [
    { name: 'description', content: 'رابط موبایل اپلیکیشن راننده پویش تاکسی' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
  ],
  link: [
    { rel: 'stylesheet', href: '/assets/fonts/estedad/fontface.css' }
  ]
})

const isOnline = ref(true)
const panelState = ref('request')
const countdown = ref(18)
const tripStarted = ref(false)

const activeRequest = {
  className: 'ECO شهری',
  fare: '۱۲۸,۰۰۰ تومان',
  distance: '۱.۸ کیلومتر',
  duration: '۲۲ دقیقه',
  pickup: 'خیابان ولیعصر، بالاتر از میدان ونک',
  dropoff: 'سعادت‌آباد، میدان کاج'
}

let timer

onMounted(() => {
  timer = window.setInterval(() => {
    if (panelState.value === 'request' && countdown.value > 0) {
      countdown.value -= 1
    }
  }, 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

function toggleOnline() {
  isOnline.value = !isOnline.value
  panelState.value = isOnline.value ? 'request' : 'idle'
  countdown.value = 18
  tripStarted.value = false
}

function acceptRide() {
  panelState.value = 'trip'
}

function rejectRide() {
  panelState.value = 'idle'
}

function finishRide() {
  panelState.value = 'idle'
  tripStarted.value = false
}
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

.driver-app {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  background: #ffffff;
  color: #17212a;
  font-family: "Vazirmatn", "IRANSans", "Estedad-VF", Tahoma, sans-serif;
}

.driver-shell {
  width: min(100vw, 390px);
  height: 100dvh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #dfe9e5;
}

@media (min-width: 520px) {
  .driver-shell {
    width: 390px;
    height: 100vh;
    min-height: 100vh;
  }
}

button {
  border: 0;
  cursor: pointer;
  font: inherit;
}

.map-layer,
.map-grid,
.roads {
  position: absolute;
  inset: 0;
}

.map-layer {
  background:
    radial-gradient(circle at 42% 36%, rgba(255, 255, 255, 0.7), transparent 18%),
    linear-gradient(150deg, #d8eee6 0%, #eef2e9 48%, #ffe2ae 100%);
}

.map-grid {
  opacity: 0.7;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.7) 1px, transparent 1px) 0 0 / 48px 48px,
    linear-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px) 0 0 / 48px 48px;
}

.roads path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.95);
  stroke-width: 27;
  stroke-linecap: round;
  filter: drop-shadow(0 4px 0 rgba(7, 40, 35, 0.05));
}

.roads path:nth-child(2),
.roads path:nth-child(3) {
  stroke-width: 22;
}

.top-bar,
.status-card,
.stats-strip,
.bottom-panel,
.driver-nav {
  position: relative;
  z-index: 2;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 0;
}

.round-btn {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  color: #17212a;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 26px rgba(23, 33, 42, 0.1);
  font-size: 20px;
  font-weight: 900;
}

.alert-dot::before {
  content: "";
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ff9f1a;
  box-shadow: 0 0 0 5px #fff2d6;
}

.driver-id {
  min-width: 0;
  flex: 1;
  padding: 10px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 26px rgba(23, 33, 42, 0.08);
}

.driver-id strong,
.driver-id span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.driver-id strong {
  font-size: 14px;
  font-weight: 950;
}

.driver-id span {
  margin-top: 3px;
  color: #63726f;
  font-size: 11px;
}

.status-card {
  width: calc(100% - 32px);
  margin: 14px 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 36px rgba(23, 33, 42, 0.11);
}

.status-card span,
.stats-strip span,
.route-card small {
  display: block;
  color: #6d7d79;
  font-size: 12px;
  font-weight: 800;
}

.status-card strong {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 950;
}

.online-toggle {
  min-width: 92px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 999px;
  color: #7a2f2a;
  background: #fff1f0;
  font-size: 12px;
  font-weight: 950;
}

.online-toggle.active {
  color: #05745f;
  background: #e7f8f3;
}

.online-toggle i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: currentColor;
}

.stats-strip {
  width: calc(100% - 32px);
  margin: 12px 16px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stats-strip article {
  min-height: 82px;
  padding: 11px 10px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(23, 33, 42, 0.08);
}

.stats-strip strong,
.stats-strip small {
  display: block;
}

.stats-strip strong {
  margin-top: 7px;
  font-size: 18px;
  font-weight: 950;
}

.stats-strip small {
  color: #07846c;
  font-size: 11px;
  font-weight: 900;
}

.hot-zone {
  position: absolute;
  z-index: 1;
  padding: 9px 11px;
  border-radius: 999px;
  color: #6b4300;
  background: rgba(255, 190, 77, 0.74);
  font-size: 11px;
  font-weight: 950;
  box-shadow: 0 0 0 16px rgba(255, 190, 77, 0.12);
}

.hot-zone.one {
  right: 38px;
  top: 280px;
}

.hot-zone.two {
  left: 40px;
  top: 354px;
}

.driver-marker,
.pickup-pin,
.drop-pin {
  position: absolute;
  z-index: 1;
}

.driver-marker {
  width: 42px;
  height: 28px;
  right: 44%;
  top: 46%;
  border-radius: 14px 16px 9px 9px;
  background: #17212a;
  box-shadow: 0 0 0 8px rgba(23, 33, 42, 0.08), 0 14px 24px rgba(23, 33, 42, 0.2);
  transform: rotate(-18deg);
}

.driver-marker::after {
  content: "";
  position: absolute;
  right: 7px;
  bottom: -3px;
  width: 28px;
  height: 7px;
  background:
    radial-gradient(circle at 4px 4px, #ffffff 0 3px, transparent 4px),
    radial-gradient(circle at 24px 4px, #ffffff 0 3px, transparent 4px);
}

.pickup-pin,
.drop-pin {
  width: 22px;
  height: 22px;
  border: 5px solid #ffffff;
  border-radius: 50% 50% 50% 0;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.16);
  transform: rotate(-45deg);
}

.pickup-pin {
  right: 78px;
  bottom: 338px;
  background: #07846c;
}

.drop-pin {
  left: 84px;
  bottom: 282px;
  background: #ff9f1a;
}

.bottom-panel {
  position: absolute;
  right: 0;
  left: 0;
  bottom: 64px;
  padding: 10px 18px 18px;
  border-radius: 28px 28px 0 0;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 -18px 44px rgba(23, 33, 42, 0.14);
  backdrop-filter: blur(16px);
}

.panel-grip {
  width: 42px;
  height: 5px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: #d5dfdb;
}

.idle-state h1,
.trip-state h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 950;
}

.idle-state p,
.trip-state p {
  margin: 0;
  color: #6d7d79;
  line-height: 1.8;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;
}

.quick-actions button,
.passenger-card button {
  min-height: 42px;
  border-radius: 14px;
  color: #17212a;
  background: #eef3f1;
  font-size: 12px;
  font-weight: 900;
}

.request-head,
.fare-row,
.decision-row,
.route-card > div,
.passenger-card,
.driver-nav {
  display: flex;
  align-items: center;
}

.request-head,
.fare-row,
.decision-row,
.driver-nav {
  justify-content: space-between;
}

.request-head span {
  display: block;
  color: #07846c;
  font-size: 12px;
  font-weight: 950;
}

.request-head strong {
  display: block;
  margin-top: 4px;
  font-size: 20px;
  font-weight: 950;
}

.request-head b {
  min-width: 70px;
  padding: 10px 12px;
  border-radius: 999px;
  color: #7a2f2a;
  background: #fff1f0;
  text-align: center;
  font-size: 13px;
}

.fare-row {
  margin: 14px 0;
  padding: 13px;
  border-radius: 18px;
  background: #f3f7f5;
}

.fare-row strong {
  font-size: 18px;
  font-weight: 950;
}

.fare-row span {
  color: #6d7d79;
  font-size: 12px;
  font-weight: 800;
}

.route-card {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 15px 12px;
  border: 1px solid #e0ebe7;
  border-radius: 20px;
  background: #ffffff;
}

.route-card > div {
  gap: 10px;
}

.route-card p {
  margin: 0;
}

.route-card strong {
  display: block;
  margin-top: 3px;
  font-size: 13px;
  font-weight: 950;
}

.route-line {
  width: 2px;
  height: 38px;
  position: absolute;
  right: 22px;
  top: 42px;
  border-right: 2px dashed #c6d4d0;
}

.dot {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.dot.origin {
  background: #07846c;
}

.dot.dest {
  background: #ff9f1a;
}

.decision-row {
  gap: 10px;
  margin-top: 14px;
}

.reject-btn,
.accept-btn,
.finish-btn {
  width: 100%;
  min-height: 54px;
  border-radius: 18px;
  font-weight: 950;
}

.reject-btn {
  color: #b42318;
  background: #fff1f0;
}

.accept-btn,
.finish-btn {
  color: #ffffff;
  background: linear-gradient(135deg, #07846c, #05a987);
  box-shadow: 0 16px 34px rgba(7, 132, 108, 0.25);
}

.trip-badge {
  display: inline-block;
  margin-bottom: 10px;
  padding: 7px 12px;
  border-radius: 999px;
  color: #05745f;
  background: #e7f8f3;
  font-size: 12px;
  font-weight: 950;
}

.passenger-card {
  gap: 10px;
  margin: 16px 0;
  padding: 12px;
  border-radius: 18px;
  background: #f3f7f5;
}

.passenger-card > span {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 16px;
  color: #ffffff;
  background: #17212a;
  font-weight: 950;
}

.passenger-card div {
  min-width: 0;
  flex: 1;
}

.passenger-card strong,
.passenger-card small {
  display: block;
}

.passenger-card small {
  margin-top: 4px;
  color: #6d7d79;
  font-size: 12px;
}

.passenger-card button {
  width: 62px;
  flex: 0 0 auto;
  color: #07846c;
  background: #e7f8f3;
}

.wide {
  width: 100%;
}

.driver-nav {
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  height: 64px;
  padding: 8px 16px;
  background: #ffffff;
  box-shadow: 0 -10px 26px rgba(23, 33, 42, 0.08);
}

.driver-nav button {
  width: 25%;
  min-height: 44px;
  border-radius: 14px;
  color: #7b8986;
  background: transparent;
  font-size: 12px;
  font-weight: 950;
}

.driver-nav button.active {
  color: #07846c;
  background: #e7f8f3;
}

@media (max-height: 720px) {
  .stats-strip {
    display: none;
  }

  .hot-zone {
    display: none;
  }
}
</style>
