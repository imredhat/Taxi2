<template>
  <div>
    <!-- Header -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">مدلهای خودرو</h4>
            <p class="text-secondary mb-0">مدیریت مدلها</p>
          </div>
          <button class="btn btn-primary b-r-22" @click="openAddModal">
            <i class="ti ti-plus me-1"></i>افزودن مدل
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- Loading -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
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
              <i class="ti ti-car f-s-40 text-secondary"></i>
              <p class="text-secondary mt-2">مدلی یافت نشد</p>
            </div>

            <!-- Table -->
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>برند</th>
                    <th>نام</th>
                    <th>نام فارسی</th>
                    <th>کلاس</th>
                    <th>وضعیت</th>
                    <th>تاریخ</th>
                    <th class="text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in items" :key="r.id">
                    <td>{{ (currentPage - 1) * 50 + i + 1 }}</td>
                    <td>{{ r.brand_name_fa || r.brand_name || '—' }}</td>
                    <td class="f-w-500">{{ r.name }}</td>
                    <td>{{ r.name_fa || '—' }}</td>
                    <td><span class="badge bg-info">{{ classLabel(r.vehicle_class) }}</span></td>
                    <td>
                      <span :class="r.is_active ? 'bg-success' : 'bg-secondary'" class="badge">
                        {{ r.is_active ? 'فعال' : 'غیرفعال' }}
                      </span>
                    </td>
                    <td class="f-s-13 text-secondary">{{ formatDate(r.created_at) }}</td>
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
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-box">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="f-w-600 mb-0"><i class="ti ti-car me-2 text-primary"></i>افزودن مدل جدید</h6>
          <button class="btn-close" @click="closeAddModal"></button>
        </div>

        <!-- Error -->
        <div v-if="addModalError" class="alert alert-danger f-s-13 mb-3">{{ addModalError }}</div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label">برند *</label>
            <CommonSearchSelect v-model="newItem.brand_id" :options="brandOptions" placeholder="انتخاب برند..." />
          </div>
          <div class="col-md-6">
            <label class="form-label">نام انگلیسی *</label>
            <input v-model="newItem.name" class="form-control" placeholder="e.g. Corolla" />
          </div>
          <div class="col-md-6">
            <label class="form-label">نام فارسی</label>
            <input v-model="newItem.name_fa" class="form-control" placeholder="مثال: کرولا" />
          </div>
          <div class="col-md-6">
            <label class="form-label">کلاس خودرو *</label>
            <select v-model="newItem.vehicle_class" class="form-select">
              <option value="">انتخاب کلاس...</option>
              <option value="eco">اقتصادی</option>
              <option value="economy">اکونومی</option>
              <option value="comfort">کامفورت</option>
              <option value="premium">پریمیوم</option>
              <option value="van">ون</option>
              <option value="motorcycle">موتور</option>
              <option value="tuk_tuk">توکتوک</option>
            </select>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeAddModal" :disabled="saving">انصراف</button>
          <button class="btn btn-success b-r-22" @click="createModel" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="ti ti-check me-1"></i>
            ذخیره
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-box">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="f-w-600 mb-0"><i class="ti ti-edit me-2 text-primary"></i>ویرایش مدل</h6>
          <button class="btn-close" @click="closeEditModal"></button>
        </div>

        <!-- Error -->
        <div v-if="editModalError" class="alert alert-danger f-s-13 mb-3">{{ editModalError }}</div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label">برند *</label>
            <CommonSearchSelect v-model="editItem.brand_id" :options="brandOptions" placeholder="انتخاب برند..." />
          </div>
          <div class="col-md-6">
            <label class="form-label">نام انگلیسی *</label>
            <input v-model="editItem.name" class="form-control" placeholder="e.g. Corolla" />
          </div>
          <div class="col-md-6">
            <label class="form-label">نام فارسی</label>
            <input v-model="editItem.name_fa" class="form-control" placeholder="مثال: کرولا" />
          </div>
          <div class="col-md-6">
            <label class="form-label">کلاس خودرو *</label>
            <select v-model="editItem.vehicle_class" class="form-select">
              <option value="">انتخاب کلاس...</option>
              <option value="eco">اقتصادی</option>
              <option value="economy">اکونومی</option>
              <option value="comfort">کامفورت</option>
              <option value="premium">پریمیوم</option>
              <option value="van">ون</option>
              <option value="motorcycle">موتور</option>
              <option value="tuk_tuk">توکتوک</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">وضعیت</label>
            <select v-model="editItem.is_active" class="form-select">
              <option :value="true">فعال</option>
              <option :value="false">غیرفعال</option>
            </select>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeEditModal" :disabled="saving">انصراف</button>
          <button class="btn btn-success b-r-22" @click="updateModel" :disabled="saving">
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
          <h6 class="f-w-600 mb-0 text-danger"><i class="ti ti-alert-triangle me-2"></i>حذف مدل</h6>
          <button class="btn-close" @click="closeDeleteModal"></button>
        </div>

        <p class="mb-3">آیا از حذف مدل <strong class="text-primary">{{ deleteItem?.name }}</strong> اطمینان دارید؟</p>
        <p class="text-secondary f-s-13 mb-3">این عمل قابل بازگشت نیست و تمام اطلاعات مرتبط با این مدل حذف خواهد شد.</p>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeDeleteModal" :disabled="deletingId">انصراف</button>
          <button class="btn btn-danger b-r-22" @click="deleteModel" :disabled="deletingId">
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
  title: 'پویش تاکسی | مدلهای خودرو',
  meta: [{ name: 'description', content: 'مدیریت مدلها' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value - 2); const e = Math.min(totalPages.value, s + 4)
  for (let i = s; i <= e; i++) pages.push(i); return pages
})

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

function classLabel(c) {
  return { eco: 'اقتصادی', economy: 'اکونومی', comfort: 'کامفورت', premium: 'پریمیوم', van: 'ون', motorcycle: 'موتور', tuk_tuk: 'توکتوک' }[c] || c
}

// State
const items = ref([])
const loading = ref(false)
const errorMsg = ref('')
const brands = ref([])
const currentPage = ref(1)
const total = ref(0)
const totalPages = ref(0)

// Computed options for searchable selects
const brandOptions = computed(() => {
  return brands.value.map(b => ({
    value: b.id,
    label: `${b.name_fa || ''} ${b.name || ''}`.trim() || '—'
  }))
})

// Add Modal
const showAddModal = ref(false)
const saving = ref(false)
const addModalError = ref('')
const newItem = ref({ brand_id: '', name: '', name_fa: '', vehicle_class: '' })

// Edit Modal
const showEditModal = ref(false)
const editModalError = ref('')
const editItem = ref({ id: '', brand_id: '', name: '', name_fa: '', vehicle_class: '', is_active: true })

// Delete Modal
const showDeleteModal = ref(false)
const deleteItem = ref(null)
const deletingId = ref(null)

// Modal functions
function openAddModal() {
  newItem.value = { brand_id: '', name: '', name_fa: '', vehicle_class: '' }
  addModalError.value = ''
  showAddModal.value = true
}

function closeAddModal() { showAddModal.value = false }

function openEditModal(item) {
  editItem.value = { ...item }
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
    const res = await fetch(`/api/car-models?page=${page}&limit=50`)
    const data = await res.json()
    items.value = data.models || []
    total.value = data.total || 0
    currentPage.value = data.page || 1
    totalPages.value = Math.ceil(data.total / 50)
  } catch (e) {
    console.error(e)
    errorMsg.value = 'خطا در دریافت اطلاعات'
  } finally {
    loading.value = false
  }
}

async function loadBrands() {
  try {
    const res = await fetch('/api/car-brands?limit=100')
    const data = await res.json()
    brands.value = data.brands || []
  } catch (e) { console.error(e) }
}

async function createModel() {
  if (!newItem.value.brand_id || !newItem.value.name || !newItem.value.vehicle_class) {
    addModalError.value = 'فیلدهای ستاره‌دار الزامی هستند'
    return
  }
  saving.value = true
  addModalError.value = ''
  try {
    const res = await fetch('/api/car-models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem.value)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      addModalError.value = data.error || 'خطا در ثبت مدل'
      return
    }
    closeAddModal()
    fetchData(1)
  } catch (e) {
    console.error(e)
    addModalError.value = 'خطا در ثبت مدل'
  } finally {
    saving.value = false
  }
}

async function updateModel() {
  if (!editItem.value.brand_id || !editItem.value.name || !editItem.value.vehicle_class) {
    editModalError.value = 'فیلدهای ستاره‌دار الزامی هستند'
    return
  }
  saving.value = true
  editModalError.value = ''
  try {
    const res = await fetch(`/api/car-models/${editItem.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editItem.value)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      editModalError.value = data.error || 'خطا در بروزرسانی مدل'
      return
    }
    closeEditModal()
    fetchData(currentPage.value)
  } catch (e) {
    console.error(e)
    editModalError.value = 'خطا در بروزرسانی مدل'
  } finally {
    saving.value = false
  }
}

async function deleteModel() {
  if (!deleteItem.value) return
  deletingId.value = deleteItem.value.id
  try {
    const res = await fetch(`/api/car-models/${deleteItem.value.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'خطا در حذف مدل')
      return
    }
    closeDeleteModal()
    fetchData(currentPage.value)
  } catch (e) {
    console.error(e)
    alert('خطا در حذف مدل')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => { fetchData(1); loadBrands() })
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
.modal-sm {
  max-width: 400px;
}
</style>
