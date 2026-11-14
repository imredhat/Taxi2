<template>
  <AdminDashboardContent />
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({
  title: 'پویش تاکسی | داشبورد مدیریت',
  meta: [{ name: 'description', content: 'داشبورد مدیریت پویش تاکسی' }],
  link: [
    { rel: 'stylesheet', href: '/assets/vendor/apexcharts/apexcharts.css' }
  ],
  script: [
    { src: '/assets/vendor/apexcharts/apexcharts.min.js', tagPosition: 'bodyClose' }
  ]
})
</script>
