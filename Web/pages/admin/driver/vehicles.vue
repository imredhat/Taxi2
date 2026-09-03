<template>
  <div>
    <!-- Header -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">خودروها</h4>
            <p class="text-secondary mb-0">مدیریت ناوگان</p>
          </div>
          <div>
            <button class="btn btn-primary b-r-22" @click="openAddModal">
              <i class="ti ti-plus me-1"></i>افزودن خودرو
            </button>
            <span class="badge bg-primary f-s-14 ms-2">کل: {{ total }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="row mb-3">
      <div class="col-md-4">
        <input v-model="searchQuery" autocomplete="off" class="form-control" placeholder="جستجوی پلاک، راننده..." type="search" @input="debounceSearch" />
      </div>
      <div class="col-md-3">
        <select v-model="classFilter" class="form-select" @change="fetchData(1)">
          <option value="">همه</option><option value="eco">اقتصادی</option><option value="economy">اکونومی</option>
          <option value="comfort">کامفورت</option><option value="premium">پریمیوم</option><option value="van">ون</option>
          <option value="motorcycle">موتور</option><option value="tuk_tuk">توکتوک</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- Loading -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>

            <!-- Error -->
            <div v-else-if="errorMsg" class="text-center py-5">
              <div class="alert alert-danger d-flex align-items-center justify-content-center">
                <i class="ti ti-alert-circle me-2 f-s-20"></i>
                <span>{{ errorMsg }}</span>
              </div>
              <button class="btn btn-outline-primary b-r-22 mt-2" @click="fetchData(currentPage)">
                <i class="ti ti-refresh me-1"></i>تلاش مجدد
              </button>
            </div>

            <!-- Empty -->
            <div v-else-if="items.length === 0" class="text-center py-5">
              <p class="text-secondary">خودرویی یافت نشد</p>
            </div>

            <!-- Table -->
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>راننده</th>
                    <th>برند</th>
                    <th>مدل</th>
                    <th>رنگ</th>
                    <th>پلاک</th>
                    <th>سال</th>
                    <th>کلاس</th>
                    <th>بیمه</th>
                    <th>معاینه</th>
                    <th>وضعیت</th>
                    <th class="text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in items" :key="r.id">
                    <td>{{ (currentPage - 1) * 20 + i + 1 }}</td>
                    <td>{{ r.first_name || '' }} {{ r.last_name || '' }}<br/><small class="text-secondary" dir="ltr">{{ r.phone }}</small></td>
                    <td>{{ r.brand_name_fa || r.brand_name || '—' }}</td>
                    <td>{{ r.model_name_fa || r.model_name || '—' }}</td>
                    <td>{{ r.color_fa || r.color }}</td>
                    <td class="f-w-600" dir="ltr">{{ r.license_plate }}</td>
                    <td>{{ r.year }}</td>
                    <td><span class="badge bg-info">{{ classLabel(r.car_class) }}</span></td>
                    <td class="f-s-13" :class="isExpired(r.insurance_expiry) ? 'text-danger' : ''">{{ formatDate(r.insurance_expiry) }}</td>
                    <td class="f-s-13" :class="isExpired(r.inspection_expiry) ? 'text-danger' : ''">{{ formatDate(r.inspection_expiry) }}</td>
                    <td><span :class="r.is_active ? 'bg-success' : 'bg-secondary'" class="badge">{{ r.is_active ? 'فعال' : 'غیرفعال' }}</span></td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-primary me-1" @click="openEditModal(r)" :disabled="deletingId === r.id || saving">
                        <i class="ti ti-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(r)" :disabled="deletingId === r.id || saving">
                        <span v-if="deletingId === r.id" class="spinner-border spinner-border-sm"></span>
                        <i v-else class="ti ti-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
              <span class="text-secondary f-s-13">صفحه {{ currentPage }} از {{ totalPages }}</span>
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="fetchData(currentPage - 1)">قبلی</a></li>
                <li v-for="p in visiblePages" :key="p" class="page-item" :class="{ active: p === currentPage }"><a class="page-link" href="#" @click.prevent="fetchData(p)">{{ p }}</a></li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }"><a class="page-link" href="#" @click.prevent="fetchData(currentPage + 1)">بعدی</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-box modal-lg">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="f-w-600 mb-0"><i class="ti ti-car me-2 text-primary"></i>افزودن خودرو جدید</h6>
          <button class="btn-close" @click="closeAddModal"></button>
        </div>

        <div v-if="addModalError" class="alert alert-danger f-s-13 mb-3">{{ addModalError }}</div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">راننده *</label>
            <CommonSearchSelect v-model="newItem.driver_id" :options="driverOptions" placeholder="انتخاب راننده..." />
          </div>
          <div class="col-md-4">
            <label class="form-label">مدل خودرو *</label>
            <CommonSearchSelect v-model="newItem.model_id" :options="modelOptions" placeholder="انتخاب مدل..." />
          </div>
          <div class="col-md-4">
            <label class="form-label">پلاک *</label>
            <input v-model="newItem.license_plate" class="form-control" placeholder=" ۱۲۳ الف ۴۵۶" dir="ltr" />
          </div>
          <div class="col-md-3">
            <label class="form-label">رنگ *</label>
            <input v-model="newItem.color" class="form-control" placeholder=" سفید" />
          </div>
          <div class="col-md-3">
            <label class="form-label">سال *</label>
            <input v-model.number="newItem.year" class="form-control" placeholder=" 1402" type="number" />
          </div>
          <div class="col-md-3">
            <label class="form-label">کلاس خودرو *</label>
            <select v-model="newItem.car_class" class="form-select">
              <option value="">انتخاب کلاس...</option>
              <option value="eco">اقتصادی</option><option value="economy">اکونومی</option>
              <option value="comfort">کامفورت</option><option value="premium">پریمیوم</option>
              <option value="van">ون</option><option value="motorcycle">موتور</option>
              <option value="tuk_tuk">توکتوک</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">بیمه تا تاریخ</label>
            <CommonPersianDatePicker v-model="newItem.insurance_expiry" placeholder="تاریخ بیمه..." />
          </div>
          <div class="col-md-3">
            <label class="form-label">معاینه تا تاریخ</label>
            <CommonPersianDatePicker v-model="newItem.inspection_expiry" placeholder="تاریخ معاینه..." />
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeAddModal" :disabled="saving">انصراف</button>
          <button class="btn btn-success b-r-22" @click="createVehicle" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-check me-1"></i>
            ذخیره
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-box modal-lg">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="f-w-600 mb-0"><i class="ti ti-edit me-2 text-primary"></i>ویرایش خودرو</h6>
          <button class="btn-close" @click="closeEditModal"></button>
        </div>

        <div v-if="editModalError" class="alert alert-danger f-s-13 mb-3">{{ editModalError }}</div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">راننده *</label>
            <CommonSearchSelect v-model="editItem.driver_id" :options="driverOptions" placeholder="انتخاب راننده..." />
          </div>
          <div class="col-md-4">
            <label class="form-label">مدل خودرو *</label>
            <CommonSearchSelect v-model="editItem.model_id" :options="modelOptions" placeholder="انتخاب مدل..." />
          </div>
          <div class="col-md-4">
            <label class="form-label">پلاک *</label>
            <input v-model="editItem.license_plate" class="form-control" placeholder=" ۱۲۳ الف ۴۵۶" dir="ltr" />
          </div>
          <div class="col-md-3">
            <label class="form-label">رنگ *</label>
            <input v-model="editItem.color" class="form-control" placeholder=" سفید" />
          </div>
          <div class="col-md-3">
            <label class="form-label">سال *</label>
            <input v-model.number="editItem.year" class="form-control" placeholder=" 1402" type="number" />
          </div>
          <div class="col-md-3">
            <label class="form-label">کلاس خودرو *</label>
            <select v-model="editItem.car_class" class="form-select">
              <option value="">انتخاب کلاس...</option>
              <option value="eco">اقتصادی</option><option value="economy">اکونومی</option>
              <option value="comfort">کامفورت</option><option value="premium">پریمیوم</option>
              <option value="van">ون</option><option value="motorcycle">موتور</option>
              <option value="tuk_tuk">توکتوک</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">وضعیت</label>
            <select v-model="editItem.is_active" class="form-select">
              <option :value="true">فعال</option>
              <option :value="false">غیرفعال</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">بیمه تا تاریخ</label>
            <CommonPersianDatePicker v-model="editItem.insurance_expiry" placeholder="تاریخ بیمه..." />
          </div>
          <div class="col-md-3">
            <label class="form-label">معاینه تا تاریخ</label>
            <CommonPersianDatePicker v-model="editItem.inspection_expiry" placeholder="تاریخ معاینه..." />
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeEditModal" :disabled="saving">انصراف</button>
          <button class="btn btn-success b-r-22" @click="updateVehicle" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-check me-1"></i>
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-box modal-sm">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="f-w-600 mb-0 text-danger"><i class="ti ti-alert-triangle me-2"></i>حذف خودرو</h6>
          <button class="btn-close" @click="closeDeleteModal"></button>
        </div>

        <p class="mb-3">آیا از حذف خودرو <strong class="text-primary">{{ deleteItem?.license_plate }}</strong> اطمینان دارید؟</p>
        <p class="text-secondary f-s-13 mb-3">این عمل قابل بازگشت نیست.</p>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeDeleteModal" :disabled="deletingId">انصراف</button>
          <button class="btn btn-danger b-r-22" @click="deleteVehicle" :disabled="deletingId">
            <span v-if="deletingId" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-trash me-1"></i>
            حذف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({
  title: 'پویش تاکسی | خودروها',
  meta: [{ name: 'description', content: 'مدیریت ناوگان' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value - 2); const e = Math.min(totalPages.value, s + 4)
  for (let i = s; i <= e; i++) pages.push(i); return pages
})

function formatDate(d) {
  if (!d) return '—'
  try {
    const date = new Date(d)
    const gy = date.getFullYear()
    const gm = date.getMonth() + 1
    const gd = date.getDate()
    // Gregorian to Jalali using day-count algorithm
    const gy2 = gy - 1600
    const gm2 = gm - 1
    const gd2 = gd - 1
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    let days = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + g_d_m[gm2] + gd2
    if (gm2 > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) days++
    // Convert days to Jalali
    let jy = 979 + 33 * Math.floor(days / 12053)
    days %= 12053
    jy += 4 * Math.floor(days / 1461)
    days %= 1461
    if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365 }
    let jm, jd
    if (days < 186) { jm = 1 + Math.floor(days / 31); jd = 1 + (days % 31) }
    else { jm = 7 + Math.floor((days - 186) / 30); jd = 1 + ((days - 186) % 30) }
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
  } catch (e) {
    return '—'
  }
}
function classLabel(c) { return { eco: 'اقتصادی', economy: 'اکونومی', comfort: 'کامفورت', premium: 'پریمیوم', van: 'ون', motorcycle: 'موتور', tuk_tuk: 'توکتوک' }[c] || c }
function isExpired(d) { return d && new Date(d) < new Date() }

let searchTimeout = null
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => fetchData(1), 500) }

// State
const items = ref([])
const loading = ref(false)
const errorMsg = ref('')
const searchQuery = ref('')
const classFilter = ref('')
const currentPage = ref(1)
const total = ref(0)
const totalPages = ref(0)
const models = ref([])
const drivers = ref([])

// Computed options for searchable selects
const driverOptions = computed(() => {
  return drivers.value.map(d => ({
    value: d.id,
    label: `${d.first_name || ''} ${d.last_name || ''} (${d.phone || ''})`.trim()
  }))
})

const modelOptions = computed(() => {
  return models.value.map(m => ({
    value: m.id,
    label: `${m.brand_name_fa || m.brand_name || ''} - ${m.name_fa || m.name || ''}`
  }))
})

// Add Modal
const showAddModal = ref(false)
const saving = ref(false)
const addModalError = ref('')
const newItem = ref({ driver_id: '', license_plate: '', color: '', year: '', car_class: '', model_id: '', insurance_expiry: '', inspection_expiry: '' })

// Edit Modal
const showEditModal = ref(false)
const editModalError = ref('')
const editItem = ref({ id: '', driver_id: '', license_plate: '', color: '', year: '', car_class: '', model_id: '', is_active: true, insurance_expiry: '', inspection_expiry: '' })

// Delete Modal
const showDeleteModal = ref(false)
const deleteItem = ref(null)
const deletingId = ref(null)

// Modal functions
function openAddModal() {
  newItem.value = { driver_id: '', license_plate: '', color: '', year: '', car_class: '', model_id: '', insurance_expiry: '', inspection_expiry: '' }
  addModalError.value = ''
  showAddModal.value = true
}

function closeAddModal() { showAddModal.value = false }

function openEditModal(item) {
  editItem.value = {
    id: item.id,
    driver_id: item.driver_id || '',
    license_plate: item.license_plate || '',
    color: item.color || '',
    year: item.year || '',
    car_class: item.car_class || '',
    model_id: item.model_id || '',
    is_active: item.is_active,
    insurance_expiry: item.insurance_expiry ? item.insurance_expiry.split('T')[0] : '',
    inspection_expiry: item.inspection_expiry ? item.inspection_expiry.split('T')[0] : ''
  }
  editModalError.value = ''
  showEditModal.value = true
}

function closeEditModal() { showEditModal.value = false }

function confirmDelete(item) {
  deleteItem.value = item
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteItem.value = null
}

// API Functions
async function fetchData(page = 1) {
  if (page < 1) return
  loading.value = true
  errorMsg.value = ''
  try {
    const p = new URLSearchParams({ page, limit: 20 })
    if (classFilter.value) p.append('car_class', classFilter.value)
    if (searchQuery.value) p.append('search', searchQuery.value)
    const res = await fetch(`/api/vehicles?${p}`)
    const data = await res.json()
    items.value = data.vehicles || []
    total.value = data.total || 0
    currentPage.value = data.page || 1
    totalPages.value = Math.ceil(data.total / 20)
  } catch (e) {
    console.error(e)
    errorMsg.value = 'خطا در دریافت اطلاعات'
  } finally {
    loading.value = false
  }
}

async function loadModels() {
  try {
    const res = await fetch('/api/car-models?limit=200')
    const data = await res.json()
    models.value = data.models || []
  } catch (e) { console.error(e) }
}

async function loadDrivers() {
  try {
    const res = await fetch('/api/drivers?limit=500')
    const data = await res.json()
    drivers.value = data.drivers || []
  } catch (e) { console.error(e) }
}

async function createVehicle() {
  if (!newItem.value.driver_id || !newItem.value.license_plate) {
    addModalError.value = 'راننده و پلاک الزامی است'
    return
  }
  saving.value = true
  addModalError.value = ''
  try {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem.value)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      addModalError.value = data.error || 'خطا در ثبت خودرو'
      return
    }
    closeAddModal()
    fetchData(1)
  } catch (e) {
    console.error(e)
    addModalError.value = 'خطا در ثبت خودرو'
  } finally {
    saving.value = false
  }
}

async function updateVehicle() {
  if (!editItem.value.driver_id || !editItem.value.license_plate) {
    editModalError.value = 'راننده و پلاک الزامی است'
    return
  }
  saving.value = true
  editModalError.value = ''
  try {
    const res = await fetch(`/api/vehicles/${editItem.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editItem.value)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      editModalError.value = data.error || 'خطا در بروزرسانی خودرو'
      return
    }
    closeEditModal()
    fetchData(currentPage.value)
  } catch (e) {
    console.error(e)
    editModalError.value = 'خطا در بروزرسانی خودرو'
  } finally {
    saving.value = false
  }
}

async function deleteVehicle() {
  if (!deleteItem.value) return
  deletingId.value = deleteItem.value.id
  try {
    const res = await fetch(`/api/vehicles/${deleteItem.value.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'خطا در حذف خودرو')
      return
    }
    closeDeleteModal()
    fetchData(currentPage.value)
  } catch (e) {
    console.error(e)
    alert('خطا در حذف خودرو')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  fetchData(1)
  loadModels()
  loadDrivers()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 600px;
  margin: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.modal-lg {
  max-width: 800px;
}
.modal-sm {
  max-width: 400px;
}
</style>
