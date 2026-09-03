<template>
  <AdminPricingPage
    title="قیمت آب و هوا"
    subtitle="افزایش قیمت بر اساس شرایط آب و هوایی"
    api-endpoint="weather-pricing"
    :columns="[
      { key: 'name', label: 'نام' },
      { key: 'weather_condition', label: 'شرایط آب و هوا' },
      { key: 'multiplier', label: 'ضریب', format: v => v + 'x' },
      { key: 'car_class', label: 'کلاس خودرو', format: v => v === 'all' ? 'همه کلاس‌ها' : v }
    ]"
    :form-fields="[
      { key: 'name', label: 'نام قانون', col: 'col-md-6' },
      { key: 'weather_condition', label: 'شرایط آب و هوا', type: 'select', col: 'col-md-6', options: [
        { value: 'rain', label: 'باران' }, { value: 'snow', label: 'برف' }, { value: 'fog', label: 'مه' },
        { value: 'extreme_heat', label: 'گرمای شدید' }, { value: 'storm', label: 'طوفان' }
      ]},
      { key: 'multiplier', label: 'ضریب افزایش', type: 'number', col: 'col-md-6' },
      { key: 'car_class', label: 'کلاس خودرو', type: 'select', col: 'col-md-6', options: [
        { value: 'all', label: 'همه کلاس‌ها' }, { value: 'eco', label: 'اقتصادی' }, { value: 'economy', label: 'اکونومی' },
        { value: 'comfort', label: 'کامفورت' }, { value: 'premium', label: 'پریمیوم' }
      ]}
    ]"
    :default-form="{ name: '', weather_condition: 'rain', multiplier: 1.0, car_class: '' }"
  />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | قیمت آب و هوا' })
</script>
