<template>
  <AdminPricingPage
    title="نرخ پایه"
    subtitle="مدیریت نرخ‌های پایه سفر"
    api-endpoint="base-fares"
    :columns="[
      { key: 'car_class', label: 'کلاس خودرو' },
      { key: 'ride_type', label: 'نوع سفر' },
      { key: 'base_fare', label: 'کرایه پایه', format: v => Number(v).toLocaleString('fa-IR') + ' تومان' },
      { key: 'per_km_rate', label: 'هر کیلومتر', format: v => Number(v).toLocaleString('fa-IR') },
      { key: 'per_minute_rate', label: 'هر دقیقه', format: v => Number(v).toLocaleString('fa-IR') },
      { key: 'min_fare', label: 'حداقل', format: v => Number(v).toLocaleString('fa-IR') },
      { key: 'city', label: 'شهر' }
    ]"
    :form-fields="[
      { key: 'car_class', label: 'کلاس خودرو', type: 'select', col: 'col-md-6', options: [
        { value: 'eco', label: 'اقتصادی' }, { value: 'economy', label: 'اکونومی' }, { value: 'comfort', label: 'کامفورت' },
        { value: 'premium', label: 'پریمیوم' }, { value: 'van', label: 'ون' }, { value: 'motorcycle', label: 'موتور' }
      ]},
      { key: 'ride_type', label: 'نوع سفر', type: 'select', col: 'col-md-6', options: [
        { value: 'normal', label: 'عادی' }, { value: 'intercity', label: 'بین شهری' }, { value: 'shared', label: 'اشتراکی' },
        { value: 'scheduled', label: 'زمان‌بندی' }, { value: 'airport', label: 'فرودگاهی' }
      ]},
      { key: 'base_fare', label: 'کرایه پایه (تومان)', type: 'number', col: 'col-md-6' },
      { key: 'per_km_rate', label: 'نرخ هر کیلومتر', type: 'number', col: 'col-md-6' },
      { key: 'per_minute_rate', label: 'نرخ هر دقیقه', type: 'number', col: 'col-md-6' },
      { key: 'min_fare', label: 'حداقل کرایه', type: 'number', col: 'col-md-6' },
      { key: 'max_fare', label: 'حداکثر کرایه', type: 'number', col: 'col-md-6' },
      { key: 'waiting_per_minute', label: 'هزینه انتظار', type: 'number', col: 'col-md-6' },
      { key: 'city', label: 'شهر', col: 'col-md-6' }
    ]"
    :default-form="{ car_class: 'economy', ride_type: 'normal', base_fare: 0, per_km_rate: 0, per_minute_rate: 0, min_fare: 0, max_fare: null, waiting_per_minute: 0, city: 'default' }"
  />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | نرخ پایه' })
</script>
