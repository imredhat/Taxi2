<template>
  <AdminPricingPage
    title="قیمت وضعیت جاده"
    subtitle="قانون فعال برای مسیر مشخص؛ شهر مبدا و مقصد را تعیین کنید"
    api-endpoint="road-condition-pricing"
    :columns="[
      { key: 'origin_city', label: 'شهر مبدا' }, { key: 'destination_city', label: 'شهر مقصد' },
      { key: 'name', label: 'نام' },
      { key: 'condition_type', label: 'نوع وضعیت' },
      { key: 'multiplier', label: 'ضریب', format: v => v + 'x' }
    ]"
    :form-fields="[
      { key: 'origin_city', label: 'شهر مبدا مسیر (فارسی)', col: 'col-md-6' },
      { key: 'destination_city', label: 'شهر مقصد مسیر (فارسی)', col: 'col-md-6' },
      { key: 'name', label: 'نام قانون', col: 'col-md-6' },
      { key: 'condition_type', label: 'نوع وضعیت', type: 'select', col: 'col-md-6', options: [
        { value: 'traffic_heavy', label: 'ترافیک سنگین' }, { value: 'construction', label: 'جاده در دست ساخت' },
        { value: 'flooding', label: 'سیل' }, { value: 'accident', label: 'تصادف' }, { value: 'road_closed', label: 'بسته بودن جاده' }
      ]},
      { key: 'multiplier', label: 'ضریب افزایش', type: 'number', col: 'col-md-6' }
    ]"
    :default-form="{ origin_city: '', destination_city: '', name: '', condition_type: 'traffic_heavy', multiplier: 1.0 }"
  />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | قیمت وضعیت جاده' })
</script>
