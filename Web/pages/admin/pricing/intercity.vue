<template>
  <AdminPricingPage
    title="قیمت بین شهری"
    subtitle="مدیریت نرخ‌های بین شهری"
    api-endpoint="intercity-pricing"
    :columns="[
      { key: 'origin_city', label: 'مبدأ' },
      { key: 'destination_city', label: 'مقصد' },
      { key: 'car_class', label: 'کلاس خودرو' },
      { key: 'base_fare', label: 'کرایه پایه', format: v => Number(v).toLocaleString('fa-IR') + ' تومان' },
      { key: 'per_km_rate', label: 'هر کیلومتر', format: v => Number(v).toLocaleString('fa-IR') },
      { key: 'min_fare', label: 'حداقل', format: v => Number(v).toLocaleString('fa-IR') }
    ]"
    :form-fields="[
      { key: 'origin_city', label: 'شهر مبدأ', col: 'col-md-6' },
      { key: 'destination_city', label: 'شهر مقصد', col: 'col-md-6' },
      { key: 'car_class', label: 'کلاس خودرو', type: 'select', col: 'col-md-6', options: [
        { value: 'eco', label: 'اقتصادی' }, { value: 'economy', label: 'اکونومی' }, { value: 'comfort', label: 'کامفورت' },
        { value: 'premium', label: 'پریمیوم' }, { value: 'van', label: 'ون' }
      ]},
      { key: 'base_fare', label: 'کرایه پایه', type: 'number', col: 'col-md-6' },
      { key: 'per_km_rate', label: 'نرخ هر کیلومتر', type: 'number', col: 'col-md-6' },
      { key: 'min_fare', label: 'حداقل کرایه', type: 'number', col: 'col-md-6' }
    ]"
    :default-form="{ origin_city: '', destination_city: '', car_class: 'economy', base_fare: 0, per_km_rate: 0, min_fare: 0 }"
  />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | قیمت بین شهری' })
</script>
