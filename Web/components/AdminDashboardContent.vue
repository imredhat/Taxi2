<template>
  <main>
    <div class="container-fluid mt-3">
      <!-- Page Title -->
      <div class="row mb-3">
        <div class="col-12">
          <h4 class="f-w-600 text-dark">داشبورد مدیریت پویش تاکسی</h4>
          <p class="text-secondary mb-0">خلاصه‌ای از وضعیت سیستم و آمار کلی</p>
        </div>
      </div>

      <!-- Stats Cards Row 1 -->
      <div class="row">
        <!-- Total Rides -->
        <div class="col-sm-6 col-lg-4 col-xxl-2 order--1-lg">
          <div class="card orders-provided-card">
            <div class="card-body">
              <i class="ph-bold ph-circle circle-bg-img"></i>
              <div>
                <p class="f-s-18 f-w-600 text-dark txt-ellipsis-1">🚗 کل سفرها</p>
                <h2 class="text-secondary-dark mb-0">۱۲,۴۵۸</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Drivers -->
        <div class="col-sm-6 col-lg-4 col-xxl-2 order--1-lg">
          <div class="card bg-primary-300 product-sold-card">
            <div class="card-body">
              <div>
                <h5 class="text-primary-dark f-w-600">رانندگان فعال</h5>
                <p class="text-dark f-w-600 mb-0 mt-2 txt-ellipsis-1">
                  <i class="iconoir-calendar f-s-16 align-text-top me-2"></i>
                  اکنون آنلاین
                </p>
              </div>
              <div class="my-4">
                <h4 class="text-primary-dark">۳۴۲</h4>
              </div>
              <div class="custom-progress-container">
                <div class="progress-bar productive"></div>
                <div class="progress-bar middle"></div>
                <div class="progress-bar idle"></div>
              </div>
              <div class="progress-labels">
                <span>در سفر</span>
                <span>در انتظار</span>
                <span>آفلاین</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue -->
        <div class="col-sm-6 col-lg-4 col-xxl-2 order--1-lg">
          <div class="card bg-danger-300 product-sold-card">
            <div class="card-body">
              <div>
                <h5 class="text-danger-dark f-w-600">درآمد امروز</h5>
                <div class="mt-2">
                  <h2 class="text-danger-dark mb-0">۸۵.۵M تومان</h2>
                </div>
              </div>
              <div>
                <p class="mb-0 text-dark f-w-500 txt-ellipsis-1 mt-3">
                  نسبت به دیروز
                  <span class="badge bg-white-300 text-success-dark ms-2">+۱۲٪</span>
                </p>
              </div>
              <a class="bg-danger h-35 w-35 d-flex-center b-r-50 product-sold-icon" href="/admin/transactions">
                <i class="iconoir-arrow-right f-w-600 f-s-18"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Total Users -->
        <div class="col-sm-6 col-lg-4 col-xxl-2 order--1-lg">
          <div class="card bg-success-300 product-sold-card">
            <div class="card-body">
              <div>
                <h5 class="text-success-dark f-w-600">کل مسافران</h5>
                <div class="mt-2">
                  <h2 class="text-success-dark mb-0">۲۸,۹۴۵</h2>
                </div>
              </div>
              <div>
                <p class="mb-0 text-dark f-w-500 txt-ellipsis-1 mt-3">
                  ثبت‌نام جدید امروز
                  <span class="badge bg-white-300 text-success-dark ms-2">۵۶</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Rides Now -->
        <div class="col-sm-6 col-lg-4 col-xxl-2 order--1-lg">
          <div class="card bg-warning-300 product-sold-card">
            <div class="card-body">
              <div>
                <h5 class="text-warning-dark f-w-600">سفرهای فعال</h5>
                <div class="mt-2">
                  <h2 class="text-warning-dark mb-0">۸۷</h2>
                </div>
              </div>
              <div>
                <p class="mb-0 text-dark f-w-500 txt-ellipsis-1 mt-3">
                  در حال انجام
                  <span class="badge bg-white-300 text-warning-dark ms-2">لحظه‌ای</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Requests -->
        <div class="col-sm-6 col-lg-4 col-xxl-2 order--1-lg">
          <div class="card bg-info-300 product-sold-card">
            <div class="card-body">
              <div>
                <h5 class="text-info-dark f-w-600">درخواست‌های در انتظار</h5>
                <div class="mt-2">
                  <h2 class="text-info-dark mb-0">۲۳</h2>
                </div>
              </div>
              <div>
                <p class="mb-0 text-dark f-w-500 txt-ellipsis-1 mt-3">
                  بدون راننده
                  <span class="badge bg-white-300 text-info-dark ms-2">فوری</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mt-3">
        <!-- Ride Overview Chart -->
        <div class="col-md-7 col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="f-w-600 mb-0">نمودار سفرهای هفته اخیر</h6>
              <div class="dropdown">
                <a
                  aria-expanded="false"
                  class="text-dark"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                >
                  <i class="iconoir-align-left f-s-20 f-w-600 text-dark-dark"></i>
                  <i class="ti ti-chevron-down ms-1 f-s-18 align-top"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#">هفته گذشته</a></li>
                  <li><a class="dropdown-item" href="#">ماه گذشته</a></li>
                  <li><a class="dropdown-item" href="#">سه ماه گذشته</a></li>
                </ul>
              </div>
            </div>
            <div class="card-body p-0">
              <div>
                <div id="rideOverviewChart"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Rides -->
        <div class="col-md-5 col-lg-4">
          <div class="card order-detail-card">
            <div class="pt-3">
              <h5 class="pa-s-20">سفرهای اخیر</h5>
            </div>
            <div class="card-body">
              <ul class="order-content-list">
                <li class="bg-success-300">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="text-success-dark f-w-600 mb-0">🚗 #TR-4521</h6>
                    <span class="badge text-light-success me-2">تکمیل شد</span>
                  </div>
                  <div>
                    <p class="text-success mb-0 txt-ellipsis-2">
                      میدان آزادی → ولیعصر - ۳۵,۰۰۰ تومان
                    </p>
                  </div>
                </li>
                <li class="bg-info-300">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="text-info-dark f-w-600 mb-0">🚗 #TR-4520</h6>
                    <span class="badge text-light-info me-2">در حال انجام</span>
                  </div>
                  <div>
                    <p class="text-info mb-0 txt-ellipsis-2">
                      تجریش → انقلاب - در حال حرکت
                    </p>
                  </div>
                </li>
                <li class="bg-success-300">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="text-success-dark f-w-600 mb-0">🚗 #TR-4519</h6>
                    <span class="badge text-light-success me-2">تکمیل شد</span>
                  </div>
                  <div>
                    <p class="text-success mb-0 txt-ellipsis-2">
                      شهرک غرب → فرودگاه امام - ۱۲۰,۰۰۰ تومان
                    </p>
                  </div>
                </li>
                <li class="bg-danger-300">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="text-danger-dark f-w-600 mb-0">🚗 #TR-4518</h6>
                    <span class="badge text-light-danger me-2">لغو شد</span>
                  </div>
                  <div>
                    <p class="text-danger-dark f-w-600 mb-0 txt-ellipsis-1">
                      سفر لغو شد توسط مسافر
                    </p>
                    <p class="text-danger mb-0 txt-ellipsis-1">
                      <span class="f-w-600">زمان</span>: ۵ دقیقه پیش
                    </p>
                  </div>
                </li>
                <li class="bg-success-300">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="text-success-dark f-w-600 mb-0">🚗 #TR-4517</h6>
                    <span class="badge text-light-success me-2">تکمیل شد</span>
                  </div>
                  <div>
                    <p class="text-success mb-0 txt-ellipsis-2">
                      پونک → سعادت‌آباد - ۲۸,۰۰۰ تومان
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Second Row -->
      <div class="row mt-3">
        <!-- Top Drivers -->
        <div class="col-lg-7 col-xxl-5">
          <div class="p-3">
            <h5>رانندگان برتر</h5>
          </div>
          <div class="card">
            <div class="card-body px-0">
              <div class="table-responsive app-scroll">
                <table class="table align-middle top-products-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">راننده</th>
                      <th scope="col">سفرها</th>
                      <th scope="col">درآمد</th>
                      <th scope="col">امتیاز</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          <h6 class="mb-0">احمد محمدی</h6>
                        </div>
                      </td>
                      <td>
                        <span class="badge text-light-success f-s-12 f-w-700">۱۵۶</span>
                      </td>
                      <td class="f-w-600 text-dark">۱۲.۵M</td>
                      <td class="text-warning-dark f-w-600">
                        <i class="iconoir-star-solid text-warning me-1"></i>
                        ۴.۹
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h6 class="mb-0">رضا کریمی</h6>
                      </td>
                      <td>
                        <span class="badge text-light-success f-s-12 f-w-700">۱۴۲</span>
                      </td>
                      <td class="f-w-600 text-dark">۱۱.۸M</td>
                      <td class="text-warning-dark f-w-600">
                        <i class="iconoir-star-solid text-warning me-1"></i>
                        ۴.۸
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h6 class="mb-0">علی رضایی</h6>
                      </td>
                      <td>
                        <span class="badge text-light-primary f-s-12 f-w-700">۱۲۸</span>
                      </td>
                      <td class="f-w-600 text-dark">۱۰.۲M</td>
                      <td class="text-warning-dark f-w-600">
                        <i class="iconoir-star-solid text-warning me-1"></i>
                        ۴.۷
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h6 class="mb-0">حسن عباسی</h6>
                      </td>
                      <td>
                        <span class="badge text-light-danger f-s-12 f-w-700">۱۱۵</span>
                      </td>
                      <td class="f-w-600 text-dark">۹.۵M</td>
                      <td class="text-warning-dark f-w-600">
                        <i class="iconoir-star-solid text-warning me-1"></i>
                        ۴.۶
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Ride Categories -->
        <div class="col-md-6 col-xxl-4">
          <div class="p-3">
            <h5>انواع سفر</h5>
          </div>
          <div class="card product-category-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div class="dropdown">
                  <a
                    aria-expanded="false"
                    class="text-dark"
                    data-bs-toggle="dropdown"
                    href="#"
                    role="button"
                  >
                    <i class="iconoir-align-left f-s-20 f-w-600 text-dark-dark"></i>
                    <i class="ti ti-chevron-down ms-1 f-s-18 align-top"></i>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#">امروز</a></li>
                    <li><a class="dropdown-item" href="#">هفته گذشته</a></li>
                    <li><a class="dropdown-item" href="#">ماه گذشته</a></li>
                  </ul>
                </div>
              </div>
              <ul class="product-category-list mt-3">
                <li class="bg-info-300">
                  <div>
                    <h6 class="text-info-dark mb-0">شهری (عادی)</h6>
                  </div>
                  <div class="text-dark f-w-600 ms-2 flex-shrink-0">
                    ۸,۴۵۰
                    <span class="badge bg-white-300 text-info-dark f-w-700">۶۸٪</span>
                  </div>
                </li>
                <li class="bg-primary-300">
                  <div>
                    <h6 class="text-primary-dark mb-0">بین شهری</h6>
                  </div>
                  <div class="text-dark f-w-600 ms-2 flex-shrink-0">
                    ۲,۱۲۰
                    <span class="badge bg-white-300 text-primary-dark f-w-700">۱۷٪</span>
                  </div>
                </li>
                <li class="bg-warning-300">
                  <div>
                    <h6 class="text-warning-dark mb-0">دربستی</h6>
                  </div>
                  <div class="text-dark f-w-600 ms-2 flex-shrink-0">
                    ۱,۲۵۰
                    <span class="badge bg-white-300 text-warning-dark f-w-700">۱۰٪</span>
                  </div>
                </li>
                <li class="bg-danger-300">
                  <div>
                    <h6 class="text-danger-dark mb-0">اشتراکی</h6>
                  </div>
                  <div class="text-dark f-w-600 ms-2 flex-shrink-0">
                    ۶۳۸
                    <span class="badge bg-white-300 text-danger-dark f-w-700">۵٪</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Financial Summary -->
        <div class="col-md-6 col-xxl-3">
          <div class="p-3">
            <h5>خلاصه مالی</h5>
          </div>
          <div class="card transaction-card">
            <div class="card-body">
              <div class="text-center">
                <h4 class="text-success-dark mb-2">گزارش مالی امروز</h4>
                <p class="mb-0 f-w-600 text-success d-inline transaction-txt">
                  وضعیت مالی سیستم
                </p>
              </div>

              <div class="custom-divider"></div>

              <div class="d-flex justify-content-between mb-3">
                <div>
                  <p class="text-dark f-w-500 mb-0">
                    <i class="iconoir-dollar-circle f-s-16 align-text-top me-2"></i>
                    کل درآمد
                  </p>
                  <h6 class="text-success-dark">۸۵,۵۰۰,۰۰۰ تومان</h6>
                </div>
                <div>
                  <p class="text-dark f-w-500 mb-0">
                    <i class="iconoir-credit-cards f-s-16 align-text-top me-2"></i>
                    سهم رانندگان
                  </p>
                  <h6 class="text-primary-dark">۶۸,۴۰۰,۰۰۰ تومان</h6>
                </div>
              </div>

              <div class="d-flex justify-content-between">
                <div>
                  <p class="text-dark f-w-500 mb-0">
                    <i class="iconoir-wallet f-s-16 align-text-top me-2"></i>
                    سهم سیستم
                  </p>
                  <h6 class="text-warning-dark">۱۷,۱۰۰,۰۰۰ تومان</h6>
                </div>
                <div>
                  <p class="text-dark f-w-500 mb-0">
                    <i class="iconoir-calendar f-s-16 align-text-top me-2"></i>
                    برداشت‌های معلق
                  </p>
                  <h6 class="text-danger-dark">۵,۲۰۰,۰۰۰ تومان</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Third Row -->
      <div class="row mt-3">
        <!-- Support Tickets -->
        <div class="col-md-6 col-xxl-4">
          <div class="p-3">
            <h5>تیکت‌های پشتیبانی اخیر</h5>
          </div>
          <div class="card">
            <div class="card-body">
              <ul class="order-content-list">
                <li class="bg-warning-300">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="text-warning-dark f-w-600 mb-0">📧 #TK-892</h6>
                    <span class="badge text-light-warning me-2">باز</span>
                  </div>
                  <div>
                    <p class="text-warning-dark mb-0 txt-ellipsis-2">
                      مشکل در پرداخت - مسافر: مریم احمدی
                    </p>
                  </div>
                </li>
                <li class="bg-info-300">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="text-info-dark f-w-600 mb-0">📧 #TK-891</h6>
                    <span class="badge text-light-info me-2">در حال بررسی</span>
                  </div>
                  <div>
                    <p class="text-info mb-0 txt-ellipsis-2">
                      شکایت از راننده - مسافر: محمد حسینی
                    </p>
                  </div>
                </li>
                <li class="bg-success-300">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="text-success-dark f-w-600 mb-0">📧 #TK-890</h6>
                    <span class="badge text-light-success me-2">بسته شد</span>
                  </div>
                  <div>
                    <p class="text-success mb-0 txt-ellipsis-2">
                      مشکل در ورود - مسافر: سارا محمدی
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="col-md-6 col-xxl-4">
          <div class="p-3">
            <h5>درآمد ماهانه</h5>
          </div>
          <div class="card">
            <div class="card-body">
              <div>
                <div id="monthlyRevenueChart"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Driver Rating Overview -->
        <div class="col-md-6 col-xxl-4">
          <div class="p-3">
            <h5>توزیع امتیازات رانندگان</h5>
          </div>
          <div class="card">
            <div class="card-body">
              <div>
                <div id="driverRatingChart"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
// Initialize charts after mount
onMounted(() => {
  nextTick(() => {
    if (typeof ApexCharts !== 'undefined') {
      // Ride Overview Chart
      const rideChart = new ApexCharts(document.querySelector('#rideOverviewChart'), {
        series: [{ name: 'سفرها', data: [320, 410, 380, 450, 520, 480, 390] }],
        chart: { type: 'area', height: 350, toolbar: { show: false } },
        colors: ['#6366f1'], dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: { categories: ['شنبه', 'یکشنبه', 'دوشنبه', 'سهشنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'] },
        yaxis: { title: { text: 'تعداد سفر' } },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        tooltip: { y: { formatter: (val) => val + ' سفر' } }
      })
      rideChart.render()

      // Monthly Revenue Chart
      const revenueChart = new ApexCharts(document.querySelector('#monthlyRevenueChart'), {
        series: [{ name: 'درآمد (میلیون تومان)', data: [45, 52, 48, 61, 58, 72, 68, 85, 78, 92, 88, 95] }],
        chart: { type: 'bar', height: 250, toolbar: { show: false } },
        colors: ['#22c55e'], plotOptions: { bar: { borderRadius: 4 } },
        dataLabels: { enabled: false },
        xaxis: { categories: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'] },
        yaxis: { title: { text: 'میلیون تومان' } }
      })
      revenueChart.render()

      // Driver Rating Chart
      const ratingChart = new ApexCharts(document.querySelector('#driverRatingChart'), {
        series: [120, 280, 450, 320, 80],
        chart: { type: 'donut', height: 250 },
        labels: ['۵ ستاره', '۴ ستاره', '۳ ستاره', '۲ ستاره', '۱ ستاره'],
        colors: ['#22c55e', '#6366f1', '#f59e0b', '#f97316', '#ef4444'],
        dataLabels: { enabled: true }, legend: { position: 'bottom' }
      })
      ratingChart.render()
    }
  })
})
</script>
