<template>
  <header class="header-main">
    <div class="container-fluid">
      <div class="row">
        <div class="col-6 col-sm-4 d-flex align-items-center header-left p-0">
          <span class="header-toggle me-3">
            <i class="iconoir-view-grid"></i>
          </span>
          <div class="header-search d-none d-sm-block">
            <form class="app-form app-icon-form">
              <div class="position-relative">
                <input aria-label="جستجو" class="form-control search-filter" placeholder="جستجوی سفر، راننده، مسافر..."
                  type="search" autocomplete="off" />
                <i class="ti ti-search text-dark"></i>
              </div>
            </form>
          </div>
        </div>

        <div class="col-6 col-sm-8 d-flex align-items-center justify-content-end header-right p-0">
          <ul class="d-flex align-items-center">
            <!-- Weather -->
            <li class="header-cloud">
              <a class="head-icon" href="#" role="button" @click.prevent="showWeather = !showWeather">
                <i class="iconoir-dew-point text-primary f-s-26 me-1"></i>
                <span class="f-w-600">
                  {{ weather.temp }}<sup class="f-s-10">°C</sup>
                </span>
              </a>

              <div class="offcanvas offcanvas-start header-cloud-canvas" :class="{ show: showWeather }" :style="{ display: showWeather ? 'block' : 'none' }">
                <div class="offcanvas-body p-0">
                  <div class="cloud-body">
                    <div class="cloud-content-box">
                      <div v-for="(day, i) in forecast" :key="i" class="cloud-box" :class="cloudBoxClass(i)">
                        <p class="mb-3" :class="{ 'fw-semibold': i === 0 }">{{ day.name }}</p>
                        <h6 class="mt-4 f-s-13">{{ day.temp }}°C</h6>
                        <span>
                          <i :class="day.icon" class="text-white f-s-25"></i>
                        </span>
                        <p class="f-s-13 mt-3">
                          <i class="wi wi-raindrop"></i>
                          {{ day.humidity }}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <!-- Dark Mode -->
            <li class="header-dark">
              <div class="sun-logo head-icon" @click="toggleDarkMode">
                <i class="iconoir-sun-light"></i>
              </div>
              <div class="moon-logo head-icon" @click="toggleDarkMode">
                <i class="iconoir-half-moon"></i>
              </div>
            </li>

            <!-- Notifications -->
            <li class="header-notification">
              <a aria-controls="notificationcanvasRight" class="d-block head-icon position-relative"
                data-bs-target="#notificationcanvasRight" data-bs-toggle="offcanvas" href="#" role="button">
                <i class="iconoir-bell f-s-20"></i>
                <!-- <span class="position-absolute translate-middle badge rounded-pill bg-danger badge-notification">
                  {{ notifications.count }}
                </span> -->

                <span class="position-absolute translate-middle p-1 bg-success border border-light rounded-circle animate__animated animate__fadeIn animate__infinite animate__slower"></span>
              </a>

              <div aria-labelledby="notificationcanvasRightLabel" class="offcanvas offcanvas-start header-notification-canvas"
                id="notificationcanvasRight" tabindex="-1">
                <div class="offcanvas-header">
                  <h5 class="offcanvas-title">اعلان‌ها</h5>
                  <button aria-label="بستن" class="btn-close" data-bs-dismiss="offcanvas" type="button"></button>
                </div>
                <div class="offcanvas-body notification-offcanvas-body app-scroll p-0">
                  <div class="head-container notification-head-container">
                    <div v-for="(n, i) in notifications.items" :key="i" class="notification-message head-box">
                      <div class="message-images">
                        <span class="bg-secondary h-35 w-35 d-flex-center b-r-10">
                          <i :class="n.icon" class="f-s-18"></i>
                        </span>
                      </div>
                      <div class="message-content-box flex-grow-1 ps-2">
                        <p class="f-s-15 text-secondary mb-0">{{ n.text }}</p>
                        <span class="badge text-light-primary mt-2">{{ n.time }}</span>
                      </div>
                    </div>
                    <div v-if="notifications.items.length === 0" class="hidden-massage py-4 px-3">
                      <div>
                        <h6 class="mb-0">اعلانی یافت نشد</h6>
                        <p class="text-secondary">وقتی اعلانی داشته باشید، اینجا نمایش داده خواهد شد.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <!-- Profile -->
            <li class="header-profile">
              <a aria-controls="profilecanvasRight" class="d-block head-icon" data-bs-target="#profilecanvasRight"
                data-bs-toggle="offcanvas" href="#" role="button">
                <img v-if="admin.avatar" :alt="admin.name" class="b-r-50 h-35 w-35 bg-dark" :src="admin.avatar" />
                <div v-else class="h-35 w-35 d-flex-center b-r-50 bg-primary text-white f-s-14 fw-bold">
                  {{ adminInitials }}
                </div>
              </a>

              <div aria-labelledby="profilecanvasRight" class="offcanvas offcanvas-start header-profile-canvas"
                id="profilecanvasRight" tabindex="-1">
                <div class="offcanvas-body app-scroll">
                  <ul class="profile-list">
                    <li class="d-flex gap-3 mb-3">
                      <div class="d-flex-center">
                        <span class="h-45 w-45 d-flex-center b-r-10 position-relative">
                          <img v-if="admin.avatar" alt="" class="img-fluid b-r-10" :src="admin.avatar">
                          <div v-else class="h-45 w-45 d-flex-center b-r-10 bg-primary text-white f-s-18 fw-bold">
                            {{ adminInitials }}
                          </div>
                        </span>
                      </div>
                      <div class="mt-2">
                        <h6 class="mb-0">
                          <span class="admin">{{ admin.name }}</span>
                        </h6>
                        <p class="f-s-12 mb-0 text-secondary">{{ admin.email }}</p>
                      </div>
                    </li>
                    <li>
                      <a class="f-w-500" href="/admin/profile">
                        <i class="iconoir-user-star pe-1 f-s-20"></i>
                        پروفایل من
                      </a>
                    </li>
                    <li>
                      <a class="f-w-500" href="/admin/settings">
                        <i class="iconoir-settings pe-1 f-s-20"></i>
                        تنظیمات
                      </a>
                    </li>
                    <li class="app-divider-v dotted py-1"></li>
                    <li>
                      <a class="f-w-500" href="/admin/support-tickets">
                        <i class="iconoir-chat-bubble-question pe-1 f-s-20"></i>
                        پشتیبانی
                      </a>
                    </li>
                    <li class="mx-0">
                      <a class="mb-0 btn btn-light-danger btn-sm justify-content-center" href="/" role="button" @click="logout">
                        <i class="ph-duotone ph-sign-out pe-1 f-s-20"></i>
                        خروج
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const config = useRuntimeConfig()
const WEATHER_API_KEY = config.public.weatherApiKey
const CITY = 'Tehran'

const admin = reactive({ name: '', email: '', avatar: '' })
const weather = reactive({ temp: '--', desc: '', icon: 'ph-duotone ph-cloud-sun' })
const forecast = ref([])
const showWeather = ref(false)
const notifications = reactive({ count: 0, items: [] })

const adminInitials = computed(() => {
  if (!admin.name) return 'A'
  const parts = admin.name.split(' ').filter(Boolean)
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0]?.[0] || 'A'
})

function cloudBoxClass(i) {
  const classes = ['bg-primary-900', 'bg-primary-800', 'bg-primary-700', 'bg-primary-600', 'bg-primary-500', 'bg-primary-400', 'bg-primary-300']
  return classes[i] || 'bg-primary-500'
}

function weatherIcon(code) {
  if (!code) return 'ph-duotone ph-cloud'
  const id = parseInt(code)
  if (id >= 200 && id < 300) return 'ph-duotone ph-lightning'
  if (id >= 300 && id < 500) return 'ph-duotone ph-cloud-rain'
  if (id >= 500 && id < 600) return 'ph-duotone ph-cloud-rain'
  if (id >= 600 && id < 700) return 'ph-duotone ph-snowflake'
  if (id >= 700 && id < 800) return 'ph-duotone ph-cloud-fog'
  if (id === 800) return 'ph-duotone ph-sun'
  if (id === 801) return 'ph-duotone ph-cloud-sun'
  return 'ph-duotone ph-cloud'
}

const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']

async function fetchWeather() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${WEATHER_API_KEY}&units=metric&lang=fa`)
    const data = await res.json()
    if (data.main) {
      weather.temp = Math.round(data.main.temp)
      weather.desc = data.weather?.[0]?.description || ''
      weather.icon = weatherIcon(data.weather?.[0]?.id)
    }
  } catch (e) {
    console.error('Weather error:', e)
  }
}

async function fetchForecast() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${WEATHER_API_KEY}&units=metric&lang=fa`)
    const data = await res.json()
    if (data.list) {
      const daily = {}
      data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0]
        if (!daily[date]) {
          daily[date] = {
            temp: Math.round(item.main.temp),
            humidity: item.main.humidity,
            icon: weatherIcon(item.weather?.[0]?.id)
          }
        }
      })
      const today = new Date()
      forecast.value = Object.entries(daily).slice(0, 7).map(([date, info], i) => {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        return {
          name: i === 0 ? 'امروز' : dayNames[d.getDay()],
          temp: info.temp,
          humidity: info.humidity,
          icon: info.icon
        }
      })
    }
  } catch (e) {
    console.error('Forecast error:', e)
  }
}

onMounted(() => {
  admin.name = localStorage.getItem('name') || 'مدیر سیستم'
  admin.email = localStorage.getItem('email') || 'admin@pooyeshtak30.ir'
  admin.avatar = localStorage.getItem('avatar') || ''

  // Dark mode init - apply to body, not html
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark')
  }

  fetchWeather()
  fetchForecast()
})

function toggleDarkMode() {
  document.body.classList.toggle('dark')
  localStorage.setItem('darkMode', document.body.classList.contains('dark'))
}

function logout() {
  localStorage.removeItem('name')
  localStorage.removeItem('email')
  localStorage.removeItem('avatar')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('darkMode')
  document.body.classList.remove('dark')
  window.location.href = '/'
}
</script>
