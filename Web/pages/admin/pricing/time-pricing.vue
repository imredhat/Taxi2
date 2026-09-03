<template>
  <AdminPricingPage
    title="قیمت زمانی"
    subtitle="افزایش قیمت بر اساس روز و ساعت"
    api-endpoint="time-pricing"
    :columns="[
      { key: 'name', label: 'نام' },
      { key: 'day_of_week', label: 'روز هفته', format: v => daysOfWeek[v] || v },
      { key: 'start_time', label: 'از ساعت' },
      { key: 'end_time', label: 'تا ساعت' },
      { key: 'multiplier', label: 'ضریب', format: v => v + 'x' },
      { key: 'car_class', label: 'کلاس خودرو', format: v => v === 'all' ? 'همه کلاس‌ها' : v }
    ]"
    :form-fields="[
      { key: 'name', label: 'نام قانون', col: 'col-md-6' },
      { key: 'day_of_week', label: 'روز هفته', type: 'select', col: 'col-md-6', options: [
        { value: 0, label: 'یکشنبه' }, { value: 1, label: 'دوشنبه' }, { value: 2, label: 'سه‌شنبه' },
        { value: 3, label: 'چهارشنبه' }, { value: 4, label: 'پنجشنبه' }, { value: 5, label: 'جمعه' }, { value: 6, label: 'شنبه' }
      ]},
      { key: 'start_time', label: 'ساعت شروع', type: 'time', col: 'col-md-6' },
      { key: 'end_time', label: 'ساعت پایان', type: 'time', col: 'col-md-6' },
      { key: 'multiplier', label: 'ضریب افزایش', type: 'number', col: 'col-md-6' },
      { key: 'car_class', label: 'کلاس خودرو', type: 'select', col: 'col-md-6', options: [
        { value: 'all', label: 'همه کلاس‌ها' }, { value: 'eco', label: 'اقتصادی' }, { value: 'economy', label: 'اکونومی' },
        { value: 'comfort', label: 'کامفورت' }, { value: 'premium', label: 'پریمیوم' }
      ]}
    ]"
    :default-form="{ name: '', day_of_week: 0, start_time: '00:00', end_time: '23:59', multiplier: 1.0, car_class: '' }"
  />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | قیمت زمانی' })

const daysOfWeek = { 0: 'یکشنبه', 1: 'دوشنبه', 2: 'سه‌شنبه', 3: 'چهارشنبه', 4: 'پنجشنبه', 5: 'جمعه', 6: 'شنبه' }
</script>
