<template>
  <AdminPricingPage
    title="قوانین عوارض"
    subtitle="مبالغ به ریال؛ شهر مبدا و مقصد را برای اعمال عوارض در مسیر مشخص کنید"
    api-endpoint="toll-rules"
    :columns="[
      { key: 'origin_city', label: 'شهر مبدا' }, { key: 'destination_city', label: 'شهر مقصد' },
      { key: 'name', label: 'نام' },
      { key: 'name_fa', label: 'نام فارسی' },
      { key: 'amount', label: 'مبلغ', format: v => Number(v).toLocaleString('fa-IR') + ' ریال' },
      { key: 'toll_type', label: 'نوع عوارض' }
    ]"
    :form-fields="[
      { key: 'origin_city', label: 'شهر مبدا مسیر (فارسی)', col: 'col-md-6' },
      { key: 'destination_city', label: 'شهر مقصد مسیر (فارسی)', col: 'col-md-6' },
      { key: 'name', label: 'نام (انگلیسی)', col: 'col-md-6' },
      { key: 'name_fa', label: 'نام (فارسی)', col: 'col-md-6' },
      { key: 'amount', label: 'مبلغ (ریال)', type: 'number', col: 'col-md-6' },
      { key: 'toll_type', label: 'نوع عوارض', type: 'select', col: 'col-md-6', options: [
        { value: 'highway', label: 'بزرگراه' }, { value: 'bridge', label: 'پل' },
        { value: 'airport', label: 'فرودگاه' }, { value: 'city_entry', label: 'ورودی شهر' }
      ]}
    ]"
    :default-form="{ origin_city: '', destination_city: '', name: '', name_fa: '', amount: 0, toll_type: 'highway' }"
  />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | قوانین عوارض' })
</script>
