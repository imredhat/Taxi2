<template>
  <div>
    <!-- هدر -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">پروفایل رانندگان</h4>
            <p class="text-secondary mb-0">مدیریت رانندگان</p>
          </div>
          <div>
            <button class="btn btn-primary b-r-22" @click="$router.push('/admin/driver/profiles/create')">
              <i class="ti ti-plus me-1"></i>افزودن راننده
            </button>
            <span class="badge bg-primary f-s-14 ms-2">کل: {{ total }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- جستجو و فیلتر -->
    <div class="row mb-3">
      <div class="col-md-4">
        <input v-model="searchQuery" autocomplete="off" class="form-control" placeholder="جستجو..." type="search" @input="debounceSearch" />
      </div>
      <div class="col-md-3">
        <select v-model="statusFilter" class="form-select" @change="fetchData(1)">
          <option value="">همه</option>
          <option value="offline">آفلاین</option>
          <option value="online">آنلاین</option>
          <option value="busy">در سفر</option>
          <option value="break">استراحت</option>
        </select>
      </div>
    </div>

    <!-- جدول -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- اسپینر -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
            </div>

            <!-- خطا -->
            <div v-else-if="errorMsg" class="text-center py-5">
              <div class="alert alert-danger d-flex align-items-center justify-content-center">
                <i class="ti ti-alert-circle me-2 f-s-20"></i>
                <span>{{ errorMsg }}</span>
              </div>
              <button class="btn btn-outline-primary b-r-22 mt-2" @click="fetchData(currentPage)">
                <i class="ti ti-refresh me-1"></i>تلاش مجدد
              </button>
            </div>

            <!-- خالی -->
            <div v-else-if="items.length === 0" class="text-center py-5">
              <i class="ti ti-users f-s-40 text-secondary"></i>
              <p class="text-secondary mt-2">راننده‌ای یافت نشد</p>
            </div>

            <!-- جدول -->
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>راننده</th>
                    <th>تلفن</th>
                    <th>وضعیت</th>
                    <th>امتیاز</th>
                    <th>سفرها</th>
                    <th>درآمد</th>
                    <th>گواهینامه</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in items" :key="r.id">
                    <td>{{ (currentPage - 1) * 20 + i + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <img v-if="r.selfie_url" :src="r.selfie_url" class="h-35 w-35 b-r-50 me-2" style="object-fit: cover;" alt="" />
                        <div v-else class="h-35 w-35 d-flex-center b-r-50 bg-light-primary me-2">
                          <i class="iconoir-user f-s-16"></i>
                        </div>
                        <span class="f-w-500">{{ r.first_name || '' }} {{ r.last_name || '' }}</span>
                      </div>
                    </td>
                    <td dir="ltr">{{ r.phone }}</td>
                    <td>
                      <span :class="statusBadge(r.status)" class="badge">{{ statusLabel(r.status) }}</span>
                    </td>
                    <td class="f-w-600 text-warning">
                      <i class="iconoir-star-solid me-1"></i>{{ r.rating }}
                    </td>
                    <td>{{ r.total_rides }}</td>
                    <td class="f-w-600">{{ r.total_earnings ? Number(r.total_earnings).toLocaleString('fa-IR') : '0' }}</td>
                    <td dir="ltr">{{ r.license_number || '—' }}</td>
                    <td>
                      <span :class="r.is_verified ? 'bg-success' : 'bg-warning'" class="badge">
                        {{ r.is_verified ? 'تأیید' : 'در انتظار' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-info b-r-22 me-1" @click="viewDriver(r)">
                        <i class="ti ti-eye f-s-14"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-primary b-r-22 me-1" @click="$router.push(`/admin/driver/profiles/create?id=${r.id}`)">
                        <i class="ti ti-pencil f-s-14"></i>
                      </button>
                      <button v-if="!r.is_verified" class="btn btn-sm btn-outline-success b-r-22 me-1" @click="verifyDriver(r, true)">
                        <i class="ti ti-check f-s-14"></i>
                      </button>
                      <button v-if="r.is_verified" class="btn btn-sm btn-outline-warning b-r-22 me-1" @click="verifyDriver(r, false)">
                        <i class="ti ti-x f-s-14"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger b-r-22" @click="deleteDriver(r)">
                        <i class="ti ti-trash f-s-14"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- صفحه‌بندی -->
            <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
              <span class="text-secondary f-s-13">صفحه {{ currentPage }} از {{ totalPages }}</span>
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="fetchData(currentPage - 1)">قبلی</a>
                </li>
                <li v-for="p in visiblePages" :key="p" class="page-item" :class="{ active: p === currentPage }">
                  <a class="page-link" href="#" @click.prevent="fetchData(p)">{{ p }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="fetchData(currentPage + 1)">بعدی</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal مشاهده راننده -->
    <div class="modal fade" id="viewDriverModal" tabindex="-1" ref="viewModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">اطلاعات راننده</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="viewData">
            <div v-if="viewData.selfie_url" class="text-center mb-3">
              <img :src="viewData.selfie_url" class="b-r-10" style="max-height: 150px; object-fit: cover;" alt="سلفی راننده" />
            </div>
            <div class="row g-3">
              <div class="col-md-4"><strong>نام:</strong> {{ viewData.first_name || '—' }} {{ viewData.last_name || '' }}</div>
              <div class="col-md-4"><strong>تلفن:</strong> <span dir="ltr">{{ viewData.phone }}</span></div>
              <div class="col-md-4"><strong>ایمیل:</strong> {{ viewData.email || '—' }}</div>
              <div class="col-md-4"><strong>جنسیت:</strong> {{ viewData.gender === 'male' ? 'مرد' : viewData.gender === 'female' ? 'زن' : viewData.gender || '—' }}</div>
              <div class="col-md-4"><strong>تولد:</strong> {{ viewData.birth_date ? new Date(viewData.birth_date).toLocaleDateString('fa-IR') : '—' }}</div>
              <div class="col-md-4"><strong>موبایل:</strong> <span dir="ltr">{{ viewData.mobile || '—' }}</span></div>
              <div class="col-md-4"><strong>وضعیت:</strong> <span :class="statusBadge(viewData.status)" class="badge">{{ statusLabel(viewData.status) }}</span></div>
              <div class="col-md-4"><strong>تأیید:</strong> <span :class="viewData.is_verified ? 'bg-success' : 'bg-warning'" class="badge">{{ viewData.is_verified ? 'تأیید' : 'در انتظار' }}</span></div>
              <div class="col-md-4"><strong>امتیاز:</strong> {{ viewData.rating }}</div>
              <div class="col-md-4"><strong>سفرها:</strong> {{ viewData.total_rides }}</div>
              <div class="col-md-4"><strong>درآمد:</strong> {{ viewData.total_earnings ? Number(viewData.total_earnings).toLocaleString('fa-IR') : '0' }}</div>
              <div class="col-md-4"><strong>گواهینامه:</strong> {{ viewData.license_number || '—' }}</div>
              <div class="col-md-4"><strong>بیمه:</strong> {{ viewData.insurance_number || '—' }}</div>
              <div class="col-md-4"><strong>بانک:</strong> {{ viewData.bank_name || '—' }}</div>
              <div class="col-md-6"><strong>آدرس:</strong> {{ viewData.address || '—' }}</div>
              <div class="col-md-6"><strong>یادداشت:</strong> {{ viewData.notes || '—' }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
            <button type="button" class="btn btn-primary" @click="navigateTo(`/admin/driver/profiles/create?id=${viewData.id}`)">ویرایش</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({
  title: 'پویش تاکسی | پروفایل رانندگان',
  meta: [{ name: 'description', content: 'مدیریت رانندگان' }]
})

const { apiFetch, errorMessage: apiErrorMessage } = useApi()

const visiblePages = computed(() => {
  const pages = []
  const s = Math.max(1, currentPage.value - 2)
  const e = Math.min(totalPages.value, s + 4)
  for (let i = s; i <= e; i++) pages.push(i)
  return pages
})

const items = ref([])
const loading = ref(false)
const errorMsg = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const total = ref(0)
const totalPages = ref(0)
const viewModalRef = ref(null)
const viewData = ref(null)
let bsViewModal = null

let searchTimeout = null

function statusLabel(s) { return { offline: 'آفلاین', online: 'آنلاین', busy: 'در سفر', break: 'استراحت' }[s] || s }
function statusBadge(s) { return { offline: 'bg-secondary', online: 'bg-success', busy: 'bg-danger', break: 'bg-warning' }[s] || 'bg-secondary' }
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => fetchData(1), 500) }

async function viewDriver(r) {
  try {
    const res = await apiFetch(`/api/driver-profiles/${r.id}`)
    const data = await res.json()
    viewData.value = data
    if (!bsViewModal) bsViewModal = new bootstrap.Modal(viewModalRef.value)
    bsViewModal.show()
  } catch (err) { console.error(err) }
}

async function deleteDriver(r) {
  if (!confirm(`آیا از حذف راننده ${r.first_name || ''} ${r.last_name || ''} اطمینان دارید؟`)) return
  try {
    await apiFetch(`/api/driver-profiles/${r.id}/delete`, { method: 'PATCH' })
    fetchData(currentPage.value)
  } catch (err) { console.error(err) }
}

async function fetchData(page = 1) {
  if (page < 1) return
  loading.value = true
  errorMsg.value = ''
  try {
    const p = new URLSearchParams({ page, limit: 20 })
    if (statusFilter.value) p.append('status', statusFilter.value)
    if (searchQuery.value) p.append('search', searchQuery.value)
    const res = await apiFetch(`/api/driver-profiles?${p}`)
    const data = await res.json()
    if (!res.ok) { errorMsg.value = data.error || 'خطا در دریافت اطلاعات'; return }
    items.value = data.drivers || []
    total.value = data.total || 0
    currentPage.value = data.page || 1
    totalPages.value = Math.ceil(data.total / 20)
  } catch (err) {
    errorMsg.value = apiErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function verifyDriver(d, val) {
  if (!confirm(`آیا از ${val ? 'تأیید' : 'لغو تأیید'} راننده ${d.first_name || d.phone} اطمینان دارید؟`)) return
  try {
    await apiFetch(`/api/driver-profiles/${d.id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_verified: val })
    })
    fetchData(currentPage.value)
  } catch (err) {
    errorMsg.value = apiErrorMessage(err)
  }
}

onMounted(() => fetchData(1))
</script>
