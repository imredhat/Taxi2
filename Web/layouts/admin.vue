<template>
  <div class="app-wrapper">
    <AdminSidebar />
    <div class="app-content">
      <div class="">
        <AdminHeader />
        <main>
          <div class="container-fluid mt-3">
            <slot />
          </div>
        </main>
      </div>
    </div>
    <div class="go-top"><span class="progress-value"><i class="ti ti-chevron-up"></i></span></div>
    <AdminFooter />
  </div>
</template>

<script setup>
// Auth check - redirect to login if no token
onMounted(() => {
  if (process.client) {
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/')
      return
    }
  }
})

useHead({
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
  bodyAttrs: { class: 'rtl' },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/assets/images/logo/favicon.png' },
    { rel: 'stylesheet', href: '/assets/fonts/estedad/fontface.css' },
    { rel: 'stylesheet', href: '/assets/vendor/ionio-icon/css/iconoir.css' },
    { rel: 'stylesheet', href: '/assets/vendor/tabler-icons/tabler-icons.css' },
    { rel: 'stylesheet', href: '/assets/vendor/fontawesome/css/all.css' },
    { rel: 'stylesheet', href: '/assets/vendor/phosphor/phosphor-bold.css' },
    { rel: 'stylesheet', href: '/assets/vendor/simplebar/simplebar.css' },
    { rel: 'stylesheet', href: '/assets/vendor/bootstrap/bootstrap.min.css' },
    { rel: 'stylesheet', href: '/assets/css/style.101.css' },
    { rel: 'stylesheet', href: '/assets/css/admin-fix.css' },
    { rel: 'stylesheet', href: '/assets/css/responsive.101.css' }
  ],
  script: [
    { src: '/assets/js/jquery-3.6.3.min.js', tagPosition: 'bodyClose' },
    { src: '/assets/vendor/bootstrap/bootstrap.bundle.min.js', tagPosition: 'bodyClose' },
    { src: '/assets/vendor/simplebar/simplebar.js', tagPosition: 'bodyClose' }
  ]
})

</script>
