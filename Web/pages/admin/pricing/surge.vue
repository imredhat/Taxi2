<template>
  <AdminPricingPage
    title="قوانین افزایش قیمت"
    subtitle="مدیریت افزایش قیمت بر اساس عرضه و تقاضا"
    api-endpoint="surge-rules"
    :columns="[
      { key: 'name', label: 'نام' },
      { key: 'car_class', label: 'کلاس خودرو', format: v => v === 'all' ? 'همه کلاس‌ها' : v },
      { key: 'min_drivers', label: 'حداقل رانندگان' },
      { key: 'multiplier', label: 'ضریب', format: v => v + 'x' },
      { key: 'max_multiplier', label: 'حداکثر ضریب', format: v => v + 'x' },
      { key: 'priority', label: 'اولویت' }
    ]"
    :form-fields="[
      { key: 'name', label: 'نام قانون', col: 'col-md-6' },
      { key: 'car_class', label: 'کلاس خودرو', type: 'select', col: 'col-md-6', options: [
        { value: 'all', label: 'همه کلاس‌ها' }, { value: 'eco', label: 'اقتصادی' }, { value: 'economy', label: 'اکونومی' },
        { value: 'comfort', label: 'کامفورت' }, { value: 'premium', label: 'پریمیوم' }
      ]},
      { key: 'min_drivers', label: 'حداقل رانندگان آنلاین', type: 'number', col: 'col-md-6' },
      { key: 'max_wait_seconds', label: 'حداکثر انتظار (ثانیه)', type: 'number', col: 'col-md-6' },
      { key: 'multiplier', label: 'ضریب افزایش', type: 'number', col: 'col-md-6' },
      { key: 'max_multiplier', label: 'حداکثر ضریب', type: 'number', col: 'col-md-6' },
      { key: 'priority', label: 'اولویت', type: 'number', col: 'col-md-6' }
    ]"
    :default-form="{ name: '', car_class: '', min_drivers: 0, max_wait_seconds: 300, multiplier: 1.0, max_multiplier: 3.0, priority: 0 }"
  />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | قوانین افزایش قیمت' })
</script>
