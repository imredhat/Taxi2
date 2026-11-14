<template>
  <AdminPricingPage
    title="قیمت بین شهری"
    subtitle="مبالغ به ریال؛ نام شهرها را مطابق نشان و به فارسی وارد کنید"
    api-endpoint="intercity-pricing"
    :columns="[
      { key: 'origin_city', label: 'مبدأ' },
      { key: 'destination_city', label: 'مقصد' },
      { key: 'car_class', label: 'کلاس خودرو', format: vehiclePackageLabel },
      { key: 'base_fare', label: 'کرایه پایه', format: v => Number(v).toLocaleString('fa-IR') + ' ریال' },
      { key: 'per_km_rate', label: 'هر کیلومتر', format: v => Number(v).toLocaleString('fa-IR') },
      { key: 'min_fare', label: 'حداقل', format: v => Number(v).toLocaleString('fa-IR') }
    ]"
    :form-fields="[
      { key: 'origin_city', label: 'شهر مبدأ', col: 'col-md-6' },
      { key: 'destination_city', label: 'شهر مقصد', col: 'col-md-6' },
      { key: 'car_class', label: 'کلاس خودرو', type: 'select', col: 'col-md-6', options: vehicleClassOptions},
      { key: 'base_fare', label: 'کرایه پایه', type: 'number', col: 'col-md-6' },
      { key: 'per_km_rate', label: 'نرخ هر کیلومتر', type: 'number', col: 'col-md-6' },
      { key: 'min_fare', label: 'حداقل کرایه', type: 'number', col: 'col-md-6' }
    ]"
    :default-form="{ origin_city: '', destination_city: '', car_class: 'eco_intercity', base_fare: 0, per_km_rate: 0, min_fare: 0 }"
  />
</template>

<script setup>
import { vehicleClassOptions, vehiclePackageLabel } from '~/utils/vehicleClasses'
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | قیمت بین شهری' })
</script>
