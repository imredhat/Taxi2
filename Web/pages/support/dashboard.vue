<template>
  <div class="app-wrapper">
    <!-- Sidebar Menu -->
    <AdminSidebar />

    <div class="app-content">
      <div class="">
        <!-- Header -->
        <AdminHeader />

        <!-- Support Dashboard Content -->
        <main>
          <div class="container-fluid mt-3">
            <!-- Page Title -->
            <div class="row mb-3">
              <div class="col-12">
                <h4 class="f-w-600 text-dark">داشبورد پشتیبانی پویش تاکسی</h4>
                <p class="text-secondary mb-0">مدیریت تیکتها و درخواستهای پشتیبانی</p>
              </div>
            </div>

            <!-- Stats Cards -->
            <div class="row">
              <div class="col-sm-6 col-lg-3">
                <div class="card bg-warning-300 product-sold-card">
                  <div class="card-body">
                    <div>
                      <h5 class="text-warning-dark f-w-600">تیکتهای باز</h5>
                      <h2 class="text-warning-dark mb-0 mt-2">۲۳</h2>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="card bg-info-300 product-sold-card">
                  <div class="card-body">
                    <div>
                      <h5 class="text-info-dark f-w-600">در حال بررسی</h5>
                      <h2 class="text-info-dark mb-0 mt-2">۱۵</h2>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="card bg-success-300 product-sold-card">
                  <div class="card-body">
                    <div>
                      <h5 class="text-success-dark f-w-600">حل شده امروز</h5>
                      <h2 class="text-success-dark mb-0 mt-2">۴۲</h2>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-3">
                <div class="card bg-danger-300 product-sold-card">
                  <div class="card-body">
                    <div>
                      <h5 class="text-danger-dark f-w-600">فوری</h5>
                      <h2 class="text-danger-dark mb-0 mt-2">۵</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Tickets -->
            <div class="row mt-3">
              <div class="col-12">
                <div class="card">
                  <div class="card-header">
                    <h6 class="f-w-600 mb-0">تیکتهای اخیر پشتیبانی</h6>
                  </div>
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table align-middle">
                        <thead>
                          <tr>
                            <th>شماره</th>
                            <th>موضوع</th>
                            <th>کاربر</th>
                            <th>اولویت</th>
                            <th>وضعیت</th>
                            <th>تاریخ</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>#TK-892</td>
                            <td>مشکل در پرداخت</td>
                            <td>مریم احمدی</td>
                            <td><span class="badge bg-danger">فوری</span></td>
                            <td><span class="badge bg-warning">باز</span></td>
                            <td>۱۴۰۵/۰۴/۰۹</td>
                          </tr>
                          <tr>
                            <td>#TK-891</td>
                            <td>شکایت از راننده</td>
                            <td>محمد حسینی</td>
                            <td><span class="badge bg-info">متوسط</span></td>
                            <td><span class="badge bg-info">در حال بررسی</span></td>
                            <td>۱۴۰۵/۰۴/۰۹</td>
                          </tr>
                          <tr>
                            <td>#TK-890</td>
                            <td>مشکل در ورود</td>
                            <td>سارا محمدی</td>
                            <td><span class="badge bg-success">کم</span></td>
                            <td><span class="badge bg-success">بسته شد</span></td>
                            <td>۱۴۰۵/۰۴/۰۸</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Go to top -->
    <div class="go-top">
      <span class="progress-value">
        <i class="ti ti-chevron-up"></i>
      </span>
    </div>

    <!-- Footer -->
    <AdminFooter />
  </div>
</template>

<script setup>
useHead({
  title: 'پویش تاکسی | داشبورد پشتیبانی',
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
  bodyAttrs: { class: 'rtl' },
  meta: [
    { name: 'description', content: 'داشبورد پشتیبانی پویش تاکسی' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/assets/images/logo/favicon.png' },
    { rel: 'stylesheet', href: '/assets/fonts/estedad/fontface.css' },
    { rel: 'stylesheet', href: '/assets/vendor/ionio-icon/css/iconoir.css' },
    { rel: 'stylesheet', href: '/assets/vendor/tabler-icons/tabler-icons.css' },
    { rel: 'stylesheet', href: '/assets/vendor/fontawesome/css/all.css' },
    { rel: 'stylesheet', href: '/assets/vendor/simplebar/simplebar.css' },
    { rel: 'stylesheet', href: '/assets/vendor/bootstrap/bootstrap.min.css' },
    { rel: 'stylesheet', href: '/assets/css/style.101.css' },
    { rel: 'stylesheet', href: '/assets/css/responsive.101.css' }
  ],
  script: [
    { src: '/assets/js/jquery-3.6.3.min.js', tagPosition: 'bodyClose' },
    { src: '/assets/vendor/bootstrap/bootstrap.bundle.min.js', tagPosition: 'bodyClose' },
    { src: '/assets/vendor/simplebar/simplebar.js', tagPosition: 'bodyClose' }
  ]
})

</script>
