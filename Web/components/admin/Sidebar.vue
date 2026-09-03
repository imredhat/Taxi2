<template>
  <nav>
    <div class="app-logo">
      <a class="logo d-inline-block" href="/admin/dashboard">
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
          <a class="" href="/admin/dashboard">
            <i class="iconoir-home-alt"></i>
            داشبورد
          </a>
        </li>

        <!-- مدیریت سفرها -->
        <li>
          <a :class="{ 'active': isActive('/admin/dashboard') }" @click="toggleMenu('rides-menu')" href="#rides-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-pin-alt"></i>
            مدیریت سفرها
          </a>
          <ul :class="{ 'show': openMenus.has('rides-menu'), 'collapse': true }" id="rides-menu">
            <li><a :class="{ 'active': isActive('/admin/rides') }" @click="linkClick('/admin/rides')" href="/admin/rides">لیست سفرها</a></li>
            <li><a :class="{ 'active': isActive('/admin/ride-requests') }" @click="linkClick('/admin/ride-requests')" href="/admin/ride-requests">درخواست‌های سفر</a></li>
            <li><a :class="{ 'active': isActive('/admin/ride-locations') }" @click="linkClick('/admin/ride-locations')" href="/admin/ride-locations">موقعیت‌های سفر</a></li>
            <li><a :class="{ 'active': isActive('/admin/ride-stops') }" @click="linkClick('/admin/ride-stops')" href="/admin/ride-stops">توقف‌های سفر</a></li>
            <li><a :class="{ 'active': isActive('/admin/ride-schedules') }" @click="linkClick('/admin/ride-schedules')" href="/admin/ride-schedules">برنامه‌ریزی سفرها</a></li>
            <li><a :class="{ 'active': isActive('/admin/ride-messages') }" @click="linkClick('/admin/ride-messages')" href="/admin/ride-messages">پیام‌های سفر</a></li>
          </ul>
        </li>

        <!-- مدیریت رانندگان -->
        <li>
          <a :class="{ 'active': isActive('/admin/driver-profiles') }" @click="toggleMenu('drivers-menu')" href="#drivers-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-user"></i>
            مدیریت رانندگان
          </a>
          <ul :class="{ 'show': openMenus.has('drivers-menu'), 'collapse': true }" id="drivers-menu">
            <li><a :class="{ 'active': isActive('/admin/driver/profiles') }" @click="linkClick('/admin/driver/profiles')" href="/admin/driver/profiles"> رانندگان</a></li>
            <li><a :class="{ 'active': isActive('/admin/driver/documents') }" @click="linkClick('/admin/driver/documents')" href="/admin/driver/documents">مدارک رانندگان</a></li>
            <li><a :class="{ 'active': isActive('/admin/driver/locations') }" @click="linkClick('/admin/driver/locations')" href="/admin/driver/locations">موقعیت رانندگان</a></li>
            <li><a :class="{ 'active': isActive('/admin/driver/schedules') }" @click="linkClick('/admin/driver/schedules')" href="/admin/driver/schedules">رانندگان در سفر</a></li>
            <li><a :class="{ 'active': isActive('/admin/driver/vehicles') }" @click="linkClick('/admin/driver/vehicles')" href="/admin/driver/vehicles">خودروها</a></li>
            <li><a :class="{ 'active': isActive('/admin/driver/car-brands') }" @click="linkClick('/admin/driver/car-brands')" href="/admin/driver/car-brands">برندهای خودرو</a></li>
            <li><a :class="{ 'active': isActive('/admin/driver/car-models') }" @click="linkClick('/admin/driver/car-models')" href="/admin/driver/car-models">مدل‌های خودرو</a></li>
          </ul>
        </li>

        <!-- مدیریت مسافران -->
        <li>
          <a :class="{ 'active': isActive('/admin/users') }" @click="toggleMenu('passengers-menu')" href="#passengers-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-group"></i>
            مدیریت مسافران
          </a>
          <ul :class="{ 'show': openMenus.has('passengers-menu'), 'collapse': true }" id="passengers-menu">
            <li><a :class="{ 'active': isActive('/admin/users') }" @click="linkClick('/admin/users')" href="/admin/users">لیست مسافران</a></li>
            <li><a :class="{ 'active': isActive('/admin/passenger-locations') }" @click="linkClick('/admin/passenger-locations')" href="/admin/passenger-locations">موقعیت مسافران</a></li>
            <li><a :class="{ 'active': isActive('/admin/favorite-locations') }" @click="linkClick('/admin/favorite-locations')" href="/admin/favorite-locations">مکان‌های مورد علاقه</a></li>
          </ul>
        </li>

        <!-- مالی -->
        <li>
          <a :class="{ 'active': isActive('/admin/wallets') }" @click="toggleMenu('finance-menu')" href="#finance-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-wallet"></i>
            مالی
          </a>
          <ul :class="{ 'show': openMenus.has('finance-menu'), 'collapse': true }" id="finance-menu">
            <li><a :class="{ 'active': isActive('/admin/wallets') }" @click="linkClick('/admin/wallets')" href="/admin/wallets">کیف پول‌ها</a></li>
            <li><a :class="{ 'active': isActive('/admin/transactions') }" @click="linkClick('/admin/transactions')" href="/admin/transactions">تراکنش‌ها</a></li>
            <li><a :class="{ 'active': isActive('/admin/withdrawals') }" @click="linkClick('/admin/withdrawals')" href="/admin/withdrawals">برداشت‌ها</a></li>
            <li><a :class="{ 'active': isActive('/admin/payment-gateway') }" @click="linkClick('/admin/payment-gateway')" href="/admin/payment-gateway">درگاه پرداخت</a></li>
            <li><a :class="{ 'active': isActive('/admin/revenue-shares') }" @click="linkClick('/admin/revenue-shares')" href="/admin/revenue-shares">سهم درآمد</a></li>
          </ul>
        </li>

        <!-- قیمت‌گذاری -->
        <li>
          <a :class="{ 'active': isActive('/admin/pricing/base-fares') }" @click="toggleMenu('pricing-menu')" href="#pricing-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-dollar"></i>
            قیمت‌گذاری
          </a>
          <ul :class="{ 'show': openMenus.has('pricing-menu'), 'collapse': true }" id="pricing-menu">
            <li><a :class="{ 'active': isActive('/admin/pricing/base-fares') }" @click="linkClick('/admin/pricing/base-fares')" href="/admin/pricing/base-fares">نرخ پایه</a></li>
            <li><a :class="{ 'active': isActive('/admin/pricing/intercity') }" @click="linkClick('/admin/pricing/intercity')" href="/admin/pricing/intercity">قیمت بین شهری</a></li>
            <li><a :class="{ 'active': isActive('/admin/pricing/surge') }" @click="linkClick('/admin/pricing/surge')" href="/admin/pricing/surge">قوانین افزایش قیمت</a></li>
            <li><a :class="{ 'active': isActive('/admin/pricing/time-pricing') }" @click="linkClick('/admin/pricing/time-pricing')" href="/admin/pricing/time-pricing">قیمت زمانی</a></li>
            <li><a :class="{ 'active': isActive('/admin/pricing/toll-rules') }" @click="linkClick('/admin/pricing/toll-rules')" href="/admin/pricing/toll-rules">قوانین عوارض</a></li>
            <li><a :class="{ 'active': isActive('/admin/pricing/weather') }" @click="linkClick('/admin/pricing/weather')" href="/admin/pricing/weather">قیمت آب و هوا</a></li>
            <li><a :class="{ 'active': isActive('/admin/pricing/road-condition') }" @click="linkClick('/admin/pricing/road-condition')" href="/admin/pricing/road-condition">قیمت وضعیت جاده</a></li>
          </ul>
        </li>

        <!-- پشتیبانی -->
        <li>
          <a :class="{ 'active': isActive('/admin/support-tickets') }" @click="toggleMenu('support-menu')" href="#support-menu" aria-expanded="false" data-bs-toggle="collapse">
            <i class="iconoir-chat-bubble-question"></i>
            پشتیبانی
          </a>
          <ul :class="{ 'show': openMenus.has('support-menu'), 'collapse': true }" id="support-menu">
            <li><a :class="{ 'active': isActive('/admin/support-tickets') }" @click="linkClick('/admin/support-tickets')" href="/admin/support-tickets">تیکت‌های پشتیبانی</a></li>
            <li><a :class="{ 'active': isActive('/admin/ratings') }" @click="linkClick('/admin/ratings')" href="/admin/ratings">امتیازدهی‌ها</a></li>
            <li><a :class="{ 'active': isActive('/admin/feedback-questions') }" @click="linkClick('/admin/feedback-questions')" href="/admin/feedback-questions">سوالات بازخورد</a></li>
            <li><a :class="{ 'active': isActive('/admin/feedback-responses') }" @click="linkClick('/admin/feedback-responses')" href="/admin/feedback-responses">پاسخ‌های بازخورد</a></li>
          </ul>
        </li>

        <!-- بازاریابی -->
        <li>
          <a aria-expanded="false" class="" data-bs-toggle="collapse" href="#marketing-menu">
            <i class="iconoir-megaphone"></i>
            بازاریابی
          </a>
          <ul class="collapse" id="marketing-menu">
            <li><a href="/admin/promotions">کدهای تخفیف</a></li>
            <li><a href="/admin/user-promotions">تخفیف‌های کاربران</a></li>
            <li><a href="/admin/packages">بسته‌ها</a></li>
          </ul>
        </li>

        <!-- محتوا (CMS) -->
        <li>
          <a aria-expanded="false" class="" data-bs-toggle="collapse" href="#cms-menu">
            <i class="iconoir-page"></i>
            محتوا
          </a>
          <ul class="collapse" id="cms-menu">
            <li><a href="/admin/cms-banners">بنرها</a></li>
            <li><a href="/admin/cms-pages">صفحات</a></li>
            <li><a href="/admin/cms-translations">ترجمه‌ها</a></li>
          </ul>
        </li>

        <!-- تنظیمات -->
        <li>
          <a aria-expanded="false" class="" data-bs-toggle="collapse" href="#settings-menu">
            <i class="iconoir-settings"></i>
            تنظیمات
          </a>
          <ul class="collapse" id="settings-menu">
            <li><a href="/admin/settings">تنظیمات عمومی</a></li>
            <li><a href="/admin/app-configs">تنظیمات اپلیکیشن</a></li>
            <li><a href="/admin/banks">بانک‌ها</a></li>
            <li><a href="/admin/companies">شرکت‌ها</a></li>
            <li><a href="/admin/company-drivers">رانندگان شرکت</a></li>
            <li><a href="/admin/notifications">اعلان‌ها</a></li>
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
