<template>
  <div>
    <!-- Header -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">برندهای خودرو</h4>
            <p class="text-secondary mb-0">مدیریت برندها</p>
          </div>
          <button class="btn btn-primary b-r-22" @click="openAddModal">
            <i class="ti ti-plus me-1"></i>افزودن برند
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
              <p class="text-secondary mt-2">برندی یافت نشد</p>
            </div>

            <!-- Table -->
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>لوگو</th>
                    <th>نام</th>
                    <th>نام فارسی</th>
                    <th>وضعیت</th>
                    <th>تاریخ</th>
                    <th class="text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in items" :key="r.id">
                    <td>{{ (currentPage - 1) * 50 + i + 1 }}</td>
                    <td><img v-if="r.logo_url" :src="r.logo_url" class="h-30" alt="" /><span v-else>—</span></td>
                    <td class="f-w-500">{{ r.name }}</td>
                    <td>{{ r.name_fa || '—' }}</td>
                    <td><span :class="r.is_active ? 'bg-success' : 'bg-secondary'" class="badge">{{ r.is_active ? 'فعال' : 'غیرفعال' }}</span></td>
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
          <h6 class="f-w-600 mb-0"><i class="ti ti-car me-2 text-primary"></i>افزودن برند جدید</h6>
          <button class="btn-close" @click="closeAddModal"></button>
        </div>

        <!-- Error -->
        <div v-if="addModalError" class="alert alert-danger f-s-13 mb-3">{{ addModalError }}</div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">نام انگلیسی *</label>
            <input v-model="newItem.name" class="form-control" placeholder="e.g. Toyota" />
          </div>
          <div class="col-md-4">
            <label class="form-label">نام فارسی</label>
            <input v-model="newItem.name_fa" class="form-control" placeholder="مثال: تویوتا" />
          </div>
          <div class="col-md-4">
            <label class="form-label">لوگو</label>
            <div class="upload-wrapper">
              <input type="file" ref="addFileInput" @change="handleAddFile" accept="image/*" class="d-none" />
              <div v-if="addPreview" class="upload-preview">
                <img :src="addPreview" alt="Preview" />
                <button type="button" class="btn-remove" @click="removeAddFile"><i class="ti ti-x"></i></button>
              </div>
              <div v-else class="upload-box" @click="$refs.addFileInput.click()">
                <i class="ti ti-upload f-s-24 text-secondary"></i>
                <span class="f-s-12 text-secondary">انتخاب فایل</span>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeAddModal" :disabled="saving">انصراف</button>
          <button class="btn btn-success b-r-22" @click="createBrand" :disabled="saving || uploading">
            <span v-if="saving || uploading" class="spinner-border spinner-border-sm me-1"></span>
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
          <h6 class="f-w-600 mb-0"><i class="ti ti-edit me-2 text-primary"></i>ویرایش برند</h6>
          <button class="btn-close" @click="closeEditModal"></button>
        </div>

        <!-- Error -->
        <div v-if="editModalError" class="alert alert-danger f-s-13 mb-3">{{ editModalError }}</div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">نام انگلیسی *</label>
            <input v-model="editItem.name" class="form-control" placeholder="e.g. Toyota" />
          </div>
          <div class="col-md-4">
            <label class="form-label">نام فارسی</label>
            <input v-model="editItem.name_fa" class="form-control" placeholder="مثال: تویوتا" />
          </div>
          <div class="col-md-4">
            <label class="form-label">لوگو</label>
            <div class="upload-wrapper">
              <input type="file" ref="editFileInput" @change="handleEditFile" accept="image/*" class="d-none" />
              <div v-if="editPreview || editItem.logo_url" class="upload-preview">
                <img :src="editPreview || editItem.logo_url" alt="Preview" />
                <button type="button" class="btn-remove" @click="removeEditFile"><i class="ti ti-x"></i></button>
              </div>
              <div v-else class="upload-box" @click="$refs.editFileInput.click()">
                <i class="ti ti-upload f-s-24 text-secondary"></i>
                <span class="f-s-12 text-secondary">انتخاب فایل</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label">وضعیت</label>
            <select v-model="editItem.is_active" class="form-select">
              <option :value="true">فعال</option>
              <option :value="false">غیرفعال</option>
            </select>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeEditModal" :disabled="saving">انصراف</button>
          <button class="btn btn-success b-r-22" @click="updateBrand" :disabled="saving || uploading">
            <span v-if="saving || uploading" class="spinner-border spinner-border-sm me-1"></span>
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
          <h6 class="f-w-600 mb-0 text-danger"><i class="ti ti-alert-triangle me-2"></i>حذف برند</h6>
          <button class="btn-close" @click="closeDeleteModal"></button>
        </div>

        <p class="mb-3">آیا از حذف برند <strong class="text-primary">{{ deleteItem?.name }}</strong> اطمینان دارید؟</p>
        <p class="text-secondary f-s-13 mb-3">این عمل قابل بازگشت نیست و تمام مدل‌های مرتبط با این برند حذف خواهند شد.</p>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary b-r-22" @click="closeDeleteModal" :disabled="deletingId">انصراف</button>
          <button class="btn btn-danger b-r-22" @click="deleteBrand" :disabled="deletingId">
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
  title: 'پویش تاکسی | برندهای خودرو',
  meta: [{ name: 'description', content: 'مدیریت برندها' }]
})

const { apiFetch, errorMessage: apiErrorMessage } = useApi()

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

// State
const items = ref([])
const loading = ref(false)
const errorMsg = ref('')
const currentPage = ref(1)
const total = ref(0)
const totalPages = ref(0)
const uploading = ref(false)

// Add Modal
const showAddModal = ref(false)
const saving = ref(false)
const addModalError = ref('')
const newItem = ref({ name: '', name_fa: '', logo_url: '' })
const addFile = ref(null)
const addPreview = ref('')
const addFileInput = ref(null)

// Edit Modal
const showEditModal = ref(false)
const editModalError = ref('')
const editItem = ref({ id: '', name: '', name_fa: '', logo_url: '', is_active: true })
const editFile = ref(null)
const editPreview = ref('')
const editFileInput = ref(null)
const editOriginalLogo = ref('')

// Delete Modal
const showDeleteModal = ref(false)
const deleteItem = ref(null)
const deletingId = ref(null)

// Upload functions
async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch('/api/upload', { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'خطا در آپلود فایل')
  return data.url
}

async function deleteUploadedFile(filename) {
  try {
    await apiFetch(`/api/upload/${filename}`, { method: 'DELETE' })
  } catch (e) { console.error('Failed to delete file:', e) }
}

function getFilenameFromUrl(url) {
  if (!url) return null
  const match = url.match(/\/uploads\/([^/]+)$/)
  return match ? match[1] : null
}

// Add modal file handling
function handleAddFile(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    addModalError.value = 'حجم فایل نباید بیشتر از ۵ مگابایت باشد'
    return
  }
  addFile.value = file
  addPreview.value = URL.createObjectURL(file)
}

function removeAddFile() {
  addFile.value = null
  addPreview.value = ''
  if (addFileInput.value) addFileInput.value.value = ''
}

// Edit modal file handling
function handleEditFile(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    editModalError.value = 'حجم فایل نباید بیشتر از ۵ مگابایت باشد'
    return
  }
  editFile.value = file
  editPreview.value = URL.createObjectURL(file)
}

function removeEditFile() {
  editFile.value = null
  editPreview.value = ''
  editItem.value.logo_url = ''
  if (editFileInput.value) editFileInput.value.value = ''
}

// Modal functions
function openAddModal() {
  newItem.value = { name: '', name_fa: '', logo_url: '' }
  addModalError.value = ''
  addFile.value = null
  addPreview.value = ''
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  addFile.value = null
  addPreview.value = ''
}

function openEditModal(item) {
  editItem.value = { ...item }
  editOriginalLogo.value = item.logo_url || ''
  editModalError.value = ''
  editFile.value = null
  editPreview.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editFile.value = null
  editPreview.value = ''
}

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
    const res = await apiFetch(`/api/car-brands?page=${page}&limit=50`)
    const data = await res.json()
    if (!res.ok) { errorMsg.value = data.error || 'خطا در دریافت اطلاعات'; return }
    items.value = data.brands || []
    total.value = data.total || 0
    currentPage.value = data.page || 1
    totalPages.value = Math.ceil(data.total / 50)
  } catch (err) {
    errorMsg.value = apiErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function createBrand() {
  if (!newItem.value.name) { addModalError.value = 'نام انگلیسی الزامی است'; return }
  saving.value = true
  uploading.value = !!addFile.value
  addModalError.value = ''
  try {
    if (addFile.value) {
      newItem.value.logo_url = await uploadFile(addFile.value)
    }
    const res = await apiFetch('/api/car-brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem.value)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      addModalError.value = data.error || 'خطا در ثبت برند'
      return
    }
    closeAddModal()
    fetchData(1)
  } catch (err) {
    addModalError.value = apiErrorMessage(err)
  } finally {
    saving.value = false
    uploading.value = false
  }
}

async function updateBrand() {
  if (!editItem.value.name) { editModalError.value = 'نام انگلیسی الزامی است'; return }
  saving.value = true
  uploading.value = !!editFile.value
  editModalError.value = ''
  try {
    if (editFile.value) {
      editItem.value.logo_url = await uploadFile(editFile.value)
      if (editOriginalLogo.value && editOriginalLogo.value.startsWith('/uploads/')) {
        const oldFilename = getFilenameFromUrl(editOriginalLogo.value)
        if (oldFilename) await deleteUploadedFile(oldFilename)
      }
    }
    const res = await apiFetch(`/api/car-brands/${editItem.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editItem.value)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      editModalError.value = data.error || 'خطا در بروزرسانی برند'
      return
    }
    closeEditModal()
    fetchData(currentPage.value)
  } catch (err) {
    editModalError.value = apiErrorMessage(err)
  } finally {
    saving.value = false
    uploading.value = false
  }
}

async function deleteBrand() {
  if (!deleteItem.value) return
  deletingId.value = deleteItem.value.id
  try {
    if (deleteItem.value.logo_url && deleteItem.value.logo_url.startsWith('/uploads/')) {
      const filename = getFilenameFromUrl(deleteItem.value.logo_url)
      if (filename) await deleteUploadedFile(filename)
    }
    const res = await apiFetch(`/api/car-brands/${deleteItem.value.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'خطا در حذف برند')
      return
    }
    closeDeleteModal()
    fetchData(currentPage.value)
  } catch (err) {
    alert(apiErrorMessage(err))
  } finally {
    deletingId.value = null
  }
}

onMounted(() => fetchData(1))
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
  max-width: 560px;
  margin: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.modal-sm {
  max-width: 400px;
}
.upload-wrapper {
  width: 100%;
}
.upload-box {
  width: 100%;
  height: 40px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.upload-box:hover {
  border-color: #0d6efd;
  background: #f8f9fa;
}
.upload-preview {
  position: relative;
  width: 100%;
  height: 40px;
}
.upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}
.btn-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc3545;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0;
  cursor: pointer;
}
.btn-remove:hover {
  background: #bb2d3b;
}
</style>
