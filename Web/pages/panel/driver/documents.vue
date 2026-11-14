<template>
  <div>
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">مدارک رانندگان</h4>
            <p class="text-secondary mb-0">مدیریت مدارک رانندگان</p>
          </div>
          <button class="btn btn-primary b-r-22" @click="openAddModal()">
            <i class="ti ti-plus me-1"></i>افزودن مدرک
          </button>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-4">
        <input v-model="searchQuery" autocomplete="off" class="form-control" placeholder="جستجو بر اساس نام، تلفن..." type="search" />
      </div>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else-if="drivers.length === 0" class="text-center py-5"><p class="text-secondary">راننده‌ای یافت نشد</p></div>

    <div v-else>
      <div v-for="d in filteredDrivers" :key="d.id" class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex align-items-center">
              <img v-if="getSelfie(d)" :src="getSelfie(d)" class="h-40 w-40 b-r-50 me-3" style="object-fit: cover;" alt="" />
              <div v-else class="h-40 w-40 d-flex-center b-r-50 bg-light-primary me-3">
                <i class="iconoir-user f-s-18"></i>
              </div>
              <div>
                <h6 class="f-w-600 mb-0">{{ d.first_name || '' }} {{ d.last_name || '' }}</h6>
                <small class="text-secondary" dir="ltr">{{ d.phone }}</small>
              </div>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <span :class="statusBadge(d.status)" class="badge">{{ statusLabel(d.status) }}</span>
              <span class="text-secondary f-s-13">{{ formatDate(d.created_at) }}</span>
              <span v-if="d.license_plate" class="badge bg-dark" dir="ltr">{{ d.license_plate }}</span>
              <span v-if="d.brand_name" class="badge bg-info">{{ d.brand_name }} {{ d.model_name || '' }}</span>
              <button class="btn btn-sm btn-outline-primary b-r-22" @click="openAddModal(d.id)">
                <i class="ti ti-plus f-s-14"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary b-r-22" @click="toggleDocs(d.id)">
                <i class="ti ti-chevron-down f-s-14" :class="{ 'rotate-180': expandedDrivers[d.id] }"></i>
                مدارک ({{ d.doc_count || 0 }})
              </button>
            </div>
          </div>

          <!-- لیست مدارک -->
          <div v-if="expandedDrivers[d.id]" class="mt-3">
            <div v-if="d.documents && d.documents.length === 0" class="text-center py-3 text-secondary f-s-13">
              مدرکی ثبت نشده
            </div>
            <div v-else class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>نوع مدرک</th>
                    <th>فایل</th>
                    <th>وضعیت</th>
                    <th>تاریخ</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="doc in d.documents" :key="doc.id">
                    <td><span class="badge bg-info">{{ docType(doc.document_type) }}</span></td>
                    <td>
                      <a v-if="doc.file_url" :href="doc.file_url" target="_blank" class="btn btn-sm btn-outline-primary b-r-22">
                        <i class="ti ti-download f-s-14"></i>
                      </a>
                      <span v-else class="text-secondary f-s-13">—</span>
                    </td>
                    <td>
                      <button v-if="!doc.is_verified" class="btn btn-sm btn-outline-success b-r-22 me-1" @click="verifyDoc(doc, true)">
                        <i class="ti ti-check f-s-14"></i>
                      </button>
                      <button v-if="doc.is_verified" class="btn btn-sm btn-outline-warning b-r-22 me-1" @click="verifyDoc(doc, false)">
                        <i class="ti ti-x f-s-14"></i>
                      </button>
                      <span :class="doc.is_verified ? 'bg-success' : 'bg-warning'" class="badge f-s-11">{{ doc.is_verified ? 'تأیید' : 'در انتظار' }}</span>
                    </td>
                    <td class="f-s-13 text-secondary">{{ formatDate(doc.created_at) }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger b-r-22" @click="deleteDoc(doc, d.id)">
                        <i class="ti ti-trash f-s-14"></i>
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

    <!-- صفحه‌بندی -->
    <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
      <span class="text-secondary f-s-13">صفحه {{ currentPage }} از {{ totalPages }}</span>
      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }"><a class="page-link" href="#" @click.prevent="fetchDrivers(currentPage - 1)">قبلی</a></li>
        <li v-for="p in visiblePages" :key="p" class="page-item" :class="{ active: p === currentPage }"><a class="page-link" href="#" @click.prevent="fetchDrivers(p)">{{ p }}</a></li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }"><a class="page-link" href="#" @click.prevent="fetchDrivers(currentPage + 1)">بعدی</a></li>
      </ul>
    </div>

    <!-- Modal افزودن مدرک -->
    <div class="modal fade" id="addDocModal" tabindex="-1" ref="addModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">افزودن مدرک جدید</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">راننده</label>
              <select v-model="newDoc.driver_id" class="form-select" :disabled="!!newDoc.driver_id">
                <option disabled value="">انتخاب کنید...</option>
                <option v-for="d in allDrivers" :key="d.id" :value="d.id">{{ d.first_name || '' }} {{ d.last_name || '' }} ({{ d.phone }})</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">نوع مدرک</label>
              <select v-model="newDoc.document_type" class="form-select">
                <option disabled value="">انتخاب کنید...</option>
                <option v-for="dt in docTypes" :key="dt.value" :value="dt.value">{{ dt.label }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">فایل</label>
              <input type="file" class="form-control" accept="image/*" ref="fileInputRef" />
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="doc_verified" v-model="newDoc.is_verified" />
                <label class="form-check-label" for="doc_verified">تأیید شده</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
            <button type="button" class="btn btn-primary" @click="submitDoc" :disabled="docSaving">
              <span v-if="docSaving" class="spinner-border spinner-border-sm me-2"></span>
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | مدارک رانندگان' })

const { apiFetch, errorMessage: apiErrorMessage } = useApi()
const addModalRef = ref(null)
const fileInputRef = ref(null)
let bsModal = null

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value - 2); const e = Math.min(totalPages.value, s + 4)
  for (let i = s; i <= e; i++) pages.push(i); return pages
})

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }
function statusLabel(s) { return { offline: 'آفلاین', online: 'آنلاین', busy: 'در سفر', break: 'استراحت' }[s] || s }
function statusBadge(s) { return { offline: 'bg-secondary', online: 'bg-success', busy: 'bg-danger', break: 'bg-warning' }[s] || 'bg-secondary' }

const drivers = ref([])
const allDrivers = ref([])
const loading = ref(false)
const currentPage = ref(1)
const total = ref(0)
const totalPages = ref(0)
const expandedDrivers = ref({})
const docSaving = ref(false)
const searchQuery = ref('')
const newDoc = ref({ driver_id: '', document_type: '', is_verified: true })

const filteredDrivers = computed(() => {
  if (!searchQuery.value) return drivers.value
  const q = searchQuery.value.toLowerCase()
  return drivers.value.filter(d =>
    (d.first_name && d.first_name.includes(q)) ||
    (d.last_name && d.last_name.includes(q)) ||
    (d.phone && d.phone.includes(q))
  )
})

function getSelfie(driver) {
  if (!driver.documents) return null
  const doc = driver.documents.find(d => d.document_type === 'selfie')
  return doc ? doc.file_url : null
}

const docTypes = [
  { value: 'selfie', label: 'سلفی از چهره' },
  { value: 'national_card', label: 'کارت ملی' },
  { value: 'driver_license', label: 'گواهینامه' },
  { value: 'vehicle_registration_front', label: 'کارت ماشین (رو)' },
  { value: 'vehicle_registration_back', label: 'کارت ماشین (پشت)' },
  { value: 'insurance', label: 'برگه بیمه' },
  { value: 'insurance_addendum', label: 'الحاقیه بیمه' },
  { value: 'background_check', label: 'گواهی عدم سوء پیشینه' },
  { value: 'health_certificate', label: 'گواهی سلامت' },
  { value: 'vehicle_front', label: 'تصویر جلوی خودرو' },
  { value: 'vehicle_back', label: 'تصویر پشت خودرو' },
  { value: 'vehicle_interior_front', label: 'تصویر داخلی جلو' },
  { value: 'vehicle_interior_back', label: 'تصویر داخلی پشت' }
]

function docType(t) { return docTypes.find(d => d.value === t)?.label || t }

async function fetchDrivers(page = 1) {
  if (page < 1) return; loading.value = true
  try {
    const p = new URLSearchParams({ page, limit: 20 })
    const res = await apiFetch(`/api/driver-profiles?${p}`)
    const data = await res.json()
    const driverList = data.drivers || []
    total.value = data.total || 0; currentPage.value = data.page || 1
    totalPages.value = Math.ceil(data.total / 20)

    // Fetch documents for each driver
    const docsRes = await apiFetch('/api/driver-documents?limit=1000')
    const docsData = await docsRes.json()
    const allDocs = docsData.documents || []

    // Group docs by driver_id and attach vehicle info
    drivers.value = driverList.map(d => {
      const docs = allDocs.filter(doc => doc.driver_id === d.id)
      return { ...d, documents: docs, doc_count: docs.length }
    })
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function fetchAllDrivers() {
  try {
    const res = await apiFetch('/api/drivers?limit=1000')
    const data = await res.json()
    allDrivers.value = data.drivers || []
  } catch (e) { console.error(e) }
}

function toggleDocs(driverId) {
  expandedDrivers.value[driverId] = !expandedDrivers.value[driverId]
}

function openAddModal(driverId) {
  newDoc.value = { driver_id: driverId || '', document_type: '', is_verified: true }
  if (!bsModal) bsModal = new bootstrap.Modal(addModalRef.value)
  bsModal.show()
}

async function submitDoc() {
  if (!newDoc.value.driver_id || !newDoc.value.document_type) { alert('راننده و نوع مدرک الزامی است'); return }
  docSaving.value = true
  try {
    const formData = new FormData()
    formData.append('driver_id', newDoc.value.driver_id)
    formData.append('document_type', newDoc.value.document_type)
    formData.append('is_verified', newDoc.value.is_verified)
    if (fileInputRef.value?.files?.[0]) formData.append('file', fileInputRef.value.files[0])

    const res = await apiFetch('/api/driver-documents', { method: 'POST', body: formData })
    if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.error || 'خطا'); return }
    bsModal.hide()
    fetchDrivers(currentPage.value)
  } catch (e) { alert(apiErrorMessage(e)) }
  finally { docSaving.value = false }
}

async function verifyDoc(d, val) {
  await apiFetch(`/api/driver-documents/${d.id}/verify`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_verified: val })
  })
  fetchDrivers(currentPage.value)
}

async function deleteDoc(d, driverId) {
  if (!confirm('آیا از حذف این مدرک اطمینان دارید؟')) return
  try {
    await apiFetch(`/api/driver-documents/${d.id}`, { method: 'DELETE' })
    fetchDrivers(currentPage.value)
  } catch (e) { alert(apiErrorMessage(e)) }
}

onMounted(() => { fetchDrivers(1); fetchAllDrivers() })
</script>

<style scoped>
.rotate-180 { transform: rotate(180deg); transition: transform 0.2s; }
</style>
