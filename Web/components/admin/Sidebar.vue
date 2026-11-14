<template>
  <nav>
    <div class="app-logo">
      <a class="logo d-inline-block" href="/panel/dashboard">
        <img alt="پویش تاکسی" src="/assets/images/logo/1.png" />
      </a>
      <span class="bg-light-primary toggle-semi-nav">
        <i class="ti ti-chevrons-right f-s-20"></i>
      </span>
    </div>
    <div class="app-nav" id="app-simple-bar">
      <ul class="main-nav p-0 mt-2 pb-xl-4">
        <!-- داشبورد -->
        <li class="menu-title">
          <span>منوی اصلی</span>
        </li>
        <li class="no-sub">
          <a class="" href="/panel/dashboard">
            <i class="iconoir-home-alt"></i>
            داشبورد
          </a>
        </li>

        <!-- مدیریت سفرها -->
        <li>
          <a :class="{ 'active': isActive('/panel/dashboard') }" @click="toggleMenu('rides-menu')" href="#rides-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-pin-alt"></i>
            مدیریت سفرها
          </a>
          <ul :class="{ 'show': openMenus.has('rides-menu'), 'collapse': true }" id="rides-menu">
            <li><a :class="{ 'active': isActive('/panel/rides') }" @click="linkClick('/panel/rides')" href="/panel/rides">لیست سفرها</a></li>
            <li><a :class="{ 'active': isActive('/panel/ride-requests') }" @click="linkClick('/panel/ride-requests')" href="/panel/ride-requests">درخواست‌های سفر</a></li>
            <li><a :class="{ 'active': isActive('/panel/ride-locations') }" @click="linkClick('/panel/ride-locations')" href="/panel/ride-locations">موقعیت‌های سفر</a></li>
            <li><a :class="{ 'active': isActive('/panel/ride-stops') }" @click="linkClick('/panel/ride-stops')" href="/panel/ride-stops">توقف‌های سفر</a></li>
            <li><a :class="{ 'active': isActive('/panel/ride-schedules') }" @click="linkClick('/panel/ride-schedules')" href="/panel/ride-schedules">برنامه‌ریزی سفرها</a></li>
            <li><a :class="{ 'active': isActive('/panel/ride-messages') }" @click="linkClick('/panel/ride-messages')" href="/panel/ride-messages">پیام‌های سفر</a></li>
          </ul>
        </li>

        <!-- مدیریت رانندگان -->
        <li>
          <a :class="{ 'active': isActive('/panel/driver-profiles') }" @click="toggleMenu('drivers-menu')" href="#drivers-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-user"></i>
            مدیریت رانندگان
          </a>
          <ul :class="{ 'show': openMenus.has('drivers-menu'), 'collapse': true }" id="drivers-menu">
            <li><a :class="{ 'active': isActive('/panel/driver/profiles') }" @click="linkClick('/panel/driver/profiles')" href="/panel/driver/profiles"> رانندگان</a></li>
            <li><a :class="{ 'active': isActive('/panel/driver/documents') }" @click="linkClick('/panel/driver/documents')" href="/panel/driver/documents">مدارک رانندگان</a></li>
            <li><a :class="{ 'active': isActive('/panel/driver/locations') }" @click="linkClick('/panel/driver/locations')" href="/panel/driver/locations">موقعیت رانندگان</a></li>
            <li><a :class="{ 'active': isActive('/panel/driver/schedules') }" @click="linkClick('/panel/driver/schedules')" href="/panel/driver/schedules">رانندگان در سفر</a></li>
            <li><a :class="{ 'active': isActive('/panel/driver/vehicles') }" @click="linkClick('/panel/driver/vehicles')" href="/panel/driver/vehicles">خودروها</a></li>
            <li><a :class="{ 'active': isActive('/panel/driver/car-brands') }" @click="linkClick('/panel/driver/car-brands')" href="/panel/driver/car-brands">برندهای خودرو</a></li>
            <li><a :class="{ 'active': isActive('/panel/driver/car-models') }" @click="linkClick('/panel/driver/car-models')" href="/panel/driver/car-models">مدل‌های خودرو</a></li>
          </ul>
        </li>

        <!-- مدیریت مسافران -->
        <li>
          <a :class="{ 'active': isActive('/panel/users') }" @click="toggleMenu('passengers-menu')" href="#passengers-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-group"></i>
            مدیریت مسافران
          </a>
          <ul :class="{ 'show': openMenus.has('passengers-menu'), 'collapse': true }" id="passengers-menu">
            <li><a :class="{ 'active': isActive('/panel/users') }" @click="linkClick('/panel/users')" href="/panel/users">لیست مسافران</a></li>
            <li><a :class="{ 'active': isActive('/panel/passenger-locations') }" @click="linkClick('/panel/passenger-locations')" href="/panel/passenger-locations">موقعیت مسافران</a></li>
            <li><a :class="{ 'active': isActive('/panel/favorite-locations') }" @click="linkClick('/panel/favorite-locations')" href="/panel/favorite-locations">مکان‌های مورد علاقه</a></li>
          </ul>
        </li>

        <!-- مالی -->
        <li>
          <a :class="{ 'active': isActive('/panel/wallets') }" @click="toggleMenu('finance-menu')" href="#finance-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-wallet"></i>
            مالی
          </a>
          <ul :class="{ 'show': openMenus.has('finance-menu'), 'collapse': true }" id="finance-menu">
            <li><a :class="{ 'active': isActive('/panel/wallets') }" @click="linkClick('/panel/wallets')" href="/panel/wallets">کیف پول‌ها</a></li>
            <li><a :class="{ 'active': isActive('/panel/transactions') }" @click="linkClick('/panel/transactions')" href="/panel/transactions">تراکنش‌ها</a></li>
            <li><a :class="{ 'active': isActive('/panel/withdrawals') }" @click="linkClick('/panel/withdrawals')" href="/panel/withdrawals">برداشت‌ها</a></li>
            <li><a :class="{ 'active': isActive('/panel/payment-gateway') }" @click="linkClick('/panel/payment-gateway')" href="/panel/payment-gateway">درگاه پرداخت</a></li>
            <li><a :class="{ 'active': isActive('/panel/revenue-shares') }" @click="linkClick('/panel/revenue-shares')" href="/panel/revenue-shares">سهم درآمد</a></li>
          </ul>
        </li>

        <!-- قیمت‌گذاری -->
        <li>
          <a :class="{ 'active': isActive('/panel/pricing/base-fares') }" @click="toggleMenu('pricing-menu')" href="#pricing-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-dollar"></i>
            قیمت‌گذاری
          </a>
          <ul :class="{ 'show': openMenus.has('pricing-menu'), 'collapse': true }" id="pricing-menu">
            <li><a :class="{ 'active': isActive('/panel/pricing/base-fares') }" @click="linkClick('/panel/pricing/base-fares')" href="/panel/pricing/base-fares">نرخ پایه</a></li>
            <li><a :class="{ 'active': isActive('/panel/pricing/intercity') }" @click="linkClick('/panel/pricing/intercity')" href="/panel/pricing/intercity">قیمت بین شهری</a></li>
            <li><a :class="{ 'active': isActive('/panel/pricing/surge') }" @click="linkClick('/panel/pricing/surge')" href="/panel/pricing/surge">قوانین افزایش قیمت</a></li>
            <li><a :class="{ 'active': isActive('/panel/pricing/time-pricing') }" @click="linkClick('/panel/pricing/time-pricing')" href="/panel/pricing/time-pricing">قیمت زمانی</a></li>
            <li><a :class="{ 'active': isActive('/panel/pricing/toll-rules') }" @click="linkClick('/panel/pricing/toll-rules')" href="/panel/pricing/toll-rules">قوانین عوارض</a></li>
            <li><a :class="{ 'active': isActive('/panel/pricing/weather') }" @click="linkClick('/panel/pricing/weather')" href="/panel/pricing/weather">قیمت آب و هوا</a></li>
            <li><a :class="{ 'active': isActive('/panel/pricing/road-condition') }" @click="linkClick('/panel/pricing/road-condition')" href="/panel/pricing/road-condition">قیمت وضعیت جاده</a></li>
          </ul>
        </li>

        <!-- پشتیبانی -->
        <li>
          <a :class="{ 'active': isActive('/panel/support-tickets') }" @click="toggleMenu('support-menu')" href="#support-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-chat-bubble-question"></i>
            پشتیبانی
          </a>
          <ul :class="{ 'show': openMenus.has('support-menu'), 'collapse': true }" id="support-menu">
            <li><a :class="{ 'active': isActive('/panel/support-tickets') }" @click="linkClick('/panel/support-tickets')" href="/panel/support-tickets">تیکت‌های پشتیبانی</a></li>
            <li><a :class="{ 'active': isActive('/panel/ratings') }" @click="linkClick('/panel/ratings')" href="/panel/ratings">امتیازدهی‌ها</a></li>
            <li><a :class="{ 'active': isActive('/panel/feedback-questions') }" @click="linkClick('/panel/feedback-questions')" href="/panel/feedback-questions">سوالات بازخورد</a></li>
            <li><a :class="{ 'active': isActive('/panel/feedback-responses') }" @click="linkClick('/panel/feedback-responses')" href="/panel/feedback-responses">پاسخ‌های بازخورد</a></li>
          </ul>
        </li>

        <!-- بازاریابی -->
        <li>
          <a aria-expanded="false" class="" data-bs-toggle="collapse" href="#marketing-menu">
            <i class="iconoir-megaphone"></i>
            بازاریابی
          </a>
          <ul class="collapse" id="marketing-menu">
            <li><a href="/panel/promotions">کدهای تخفیف</a></li>
            <li><a href="/panel/user-promotions">تخفیف‌های کاربران</a></li>
            <li><a href="/panel/packages">بسته‌ها</a></li>
          </ul>
        </li>

        <!-- محتوا (CMS) -->
        <li>
          <a aria-expanded="false" class="" data-bs-toggle="collapse" href="#cms-menu">
            <i class="iconoir-page"></i>
            محتوا
          </a>
          <ul class="collapse" id="cms-menu">
            <li><a href="/panel/cms-banners">بنرها</a></li>
            <li><a href="/panel/cms-pages">صفحات</a></li>
            <li><a href="/panel/cms-translations">ترجمه‌ها</a></li>
          </ul>
        </li>

        <!-- تنظیمات -->
        <li>
          <a aria-expanded="false" class="" data-bs-toggle="collapse" href="#settings-menu">
            <i class="iconoir-settings"></i>
            تنظیمات
          </a>
          <ul class="collapse" id="settings-menu">
            <li><a href="/panel/settings">تنظیمات عمومی</a></li>
            <li><a href="/panel/app-configs">تنظیمات اپلیکیشن</a></li>
            <li><a href="/panel/banks">بانک‌ها</a></li>
            <li><a href="/panel/companies">شرکت‌ها</a></li>
            <li><a href="/panel/company-drivers">رانندگان شرکت</a></li>
            <li><a href="/panel/notifications">اعلان‌ها</a></li>
          </ul>
        </li>

       
      </ul>
    </div>

    <div class="menu-navs">
      <span class="menu-previous"><i class="ti ti-chevron-left rtl-icon-flipped"></i></span>
      <span class="menu-next"><i class="ti ti-chevron-right rtl-icon-flipped"></i></span>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'

const route = useRoute()
const router = useRouter()

// Keep track of which submenu ids are open
const openMenus = ref(new Set())

// Determine the current active path
const currentPath = computed(() => route.path)

// Helper to check if a given href is active
function isActive(href) {
  return currentPath.value === href
}

// Helper to check if a submenu contains the active path
function submenuContainsActive(id) {
  const submenu = document.getElementById(id)
  if (!submenu) return false
  const links = submenu.querySelectorAll('a[href]')
  return Array.from(links).some(link => link.getAttribute('href') === currentPath.value)
}

// Initialize open menus based on current route
onMounted(() => {
  // Open any submenu that contains the active route
  const submenuIds = ['rides-menu','drivers-menu','passengers-menu','finance-menu','pricing-menu','support-menu','marketing-menu','cms-menu','settings-menu','reports-menu']
  submenuIds.forEach(id => {
    if (submenuContainsActive(id)) {
      openMenus.value.add(id)
    }
  })
})

function toggleMenu(id) {
  if (openMenus.value.has(id)) {
    openMenus.value.delete(id)
  } else {
    openMenus.value.add(id)
  }
}

function linkClick(href) {
  router.push(href)
}
</script>
