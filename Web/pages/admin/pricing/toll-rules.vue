<template>
  <AdminPricingPage
    title="قوانین عوارض"
    subtitle="مدیریت عوارض جاده‌ای"
    api-endpoint="toll-rules"
    :columns="[
      { key: 'name', label: 'نام' },
      { key: 'name_fa', label: 'نام فارسی' },
      { key: 'amount', label: 'مبلغ', format: v => Number(v).toLocaleString('fa-IR') + ' تومان' },
      { key: 'toll_type', label: 'نوع عوارض' }
    ]"
    :form-fields="[
      { key: 'name', label: 'نام (انگلیسی)', col: 'col-md-6' },
      { key: 'name_fa', label: 'نام (فارسی)', col: 'col-md-6' },
      { key: 'amount', label: 'مبلغ (تومان)', type: 'number', col: 'col-md-6' },
      { key: 'toll_type', label: 'نوع عوارض', type: 'select', col: 'col-md-6', options: [
        { value: 'highway', label: 'بزرگراه' }, { value: 'bridge', label: 'پل' },
        { value: 'airport', label: 'فرودگاه' }, { value: 'city_entry', label: 'ورودی شهر' }
      ]}
    ]"
    :default-form="{ name: '', name_fa: '', amount: 0, toll_type: 'highway' }"
  />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | قوانین عوارض' })
</script>
