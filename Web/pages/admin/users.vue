<template>
  <div>
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">مدیریت کاربران</h4>
            <p class="text-secondary mb-0">لیست مسافران و کاربران سیستم</p>
          </div>
          <div>
            <button class="btn btn-primary b-r-22" @click="openModal()"><i class="ti ti-plus me-1"></i>افزودن کاربر</button>
            <span class="badge bg-primary f-s-14 ms-2">کل: {{ total }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-4">
        <input v-model="searchQuery" autocomplete="false" class="form-control" placeholder="جستجوی نام، تلفن، ایمیل..." type="search" @input="debounceSearch" />
      </div>
      <div class="col-md-3">
        <select v-model="roleFilter" class="form-select" @change="fetchData(1)">
          <option value="">همه نقشها</option>
          <option value="passenger">مسافر</option>
          <option value="admin">مدیر</option>
          <option value="support">پشتیبانی</option>
          <option value="super_admin">سوپر ادمین</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
            <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">کاربری یافت نشد</p></div>
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr><th>#</th><th>نام</th><th>تلفن</th><th>ایمیل</th><th>نقش</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(r,i) in items" :key="r.id">
                    <td>{{ (currentPage-1)*20+i+1 }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="h-35 w-35 d-flex-center b-r-50 bg-light-primary me-2"><i class="iconoir-user f-s-16"></i></div>
                        <span class="f-w-500">{{ r.first_name||'' }} {{ r.last_name||'' }}<span v-if="!r.first_name" class="text-secondary">بدون نام</span></span>
                      </div>
                    </td>
                    <td dir="ltr">{{ r.phone }}</td>
                    <td>{{ r.email || '—' }}</td>
                    <td><span :class="roleBadge(r.role)" class="badge">{{ roleLabel(r.role) }}</span></td>
                    <td><span v-if="r.is_blocked" class="badge bg-danger">مسدود</span><span v-else-if="r.is_active" class="badge bg-success">فعال</span><span v-else class="badge bg-secondary">غیرفعال</span></td>
                    <td class="f-s-13 text-secondary">{{ formatDate(r.created_at) }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-info b-r-22 me-1" @click="viewUser(r)"><i class="ti ti-eye f-s-14"></i></button>
                      <button class="btn btn-sm btn-outline-primary b-r-22 me-1" @click="openModal(r)"><i class="ti ti-pencil f-s-14"></i></button>
                      <button v-if="r.is_active&&!r.is_blocked" class="btn btn-sm btn-outline-warning b-r-22" @click="blockUser(r)"><i class="ti ti-ban f-s-14"></i></button>
                      <button v-if="r.is_blocked" class="btn btn-sm btn-outline-success b-r-22" @click="unblockUser(r)"><i class="ti ti-check f-s-14"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="totalPages>1" class="d-flex justify-content-between align-items-center mt-3">
              <span class="text-secondary f-s-13">صفحه {{ currentPage }} از {{ totalPages }}</span>
              <ul class="pagination mb-0">
                <li class="page-item" :class="{disabled:currentPage===1}"><a class="page-link" href="#" @click.prevent="fetchData(currentPage-1)">قبلی</a></li>
                <li v-for="p in visiblePages" :key="p" class="page-item" :class="{active:p===currentPage}"><a class="page-link" href="#" @click.prevent="fetchData(p)">{{ p }}</a></li>
                <li class="page-item" :class="{disabled:currentPage===totalPages}"><a class="page-link" href="#" @click.prevent="fetchData(currentPage+1)">بعدی</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div class="modal fade" id="viewUserModal" tabindex="-1" ref="viewModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">اطلاعات کاربر</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body" v-if="viewData">
            <div class="row g-3">
              <div class="col-md-6"><strong>نام:</strong> {{ viewData.first_name || '—' }} {{ viewData.last_name || '' }}</div>
              <div class="col-md-6"><strong>تلفن:</strong> <span dir="ltr">{{ viewData.phone }}</span></div>
              <div class="col-md-6"><strong>ایمیل:</strong> {{ viewData.email || '—' }}</div>
              <div class="col-md-6"><strong>نقش:</strong> <span :class="roleBadge(viewData.role)" class="badge">{{ roleLabel(viewData.role) }}</span></div>
              <div class="col-md-6"><strong>جنسیت:</strong> {{ viewData.gender === 'male' ? 'مرد' : viewData.gender === 'female' ? 'زن' : viewData.gender || '—' }}</div>
              <div class="col-md-6"><strong>تولد:</strong> {{ viewData.birth_date ? new Date(viewData.birth_date).toLocaleDateString('fa-IR') : '—' }}</div>
              <div class="col-md-6"><strong>وضعیت:</strong> <span v-if="viewData.is_blocked" class="badge bg-danger">مسدود</span><span v-else-if="viewData.is_active" class="badge bg-success">فعال</span><span v-else class="badge bg-secondary">غیرفعال</span></div>
              <div class="col-md-6"><strong>تاریخ ثبت‌نام:</strong> {{ formatDate(viewData.created_at) }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
            <button type="button" class="btn btn-primary" @click="openModal(viewData)">ویرایش</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="editUserModal" tabindex="-1" ref="editModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">{{ editItem ? 'ویرایش کاربر' : 'افزودن کاربر' }}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label">نام</label><input v-model="form.first_name" class="form-control" placeholder="نام" /></div>
              <div class="col-md-6"><label class="form-label">نام خانوادگی</label><input v-model="form.last_name" class="form-control" placeholder="نام خانوادگی" /></div>
              <div class="col-md-6"><label class="form-label">تلفن *</label><input v-model="form.phone" class="form-control" placeholder="تلفن" dir="ltr" required /></div>
              <div class="col-md-6"><label class="form-label">ایمیل</label><input v-model="form.email" class="form-control" placeholder="ایمیل" dir="ltr" /></div>
              <div class="col-md-6" v-if="!editItem"><label class="form-label">رمز عبور *</label><input v-model="form.password" class="form-control" type="password" placeholder="رمز عبور" /></div>
              <div class="col-md-6">
                <label class="form-label">نقش</label>
                <select v-model="form.role" class="form-select">
                  <option value="passenger">مسافر</option>
                  <option value="admin">مدیر</option>
                  <option value="support">پشتیبانی</option>
                  <option value="super_admin">سوپر ادمین</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">جنسیت</label>
                <select v-model="form.gender" class="form-select">
                  <option value="">انتخاب...</option>
                  <option value="male">مرد</option>
                  <option value="female">زن</option>
                </select>
              </div>
              <div class="col-md-6"><label class="form-label">تاریخ تولد</label><input v-model="form.birth_date" type="date" class="form-control" /></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
            <button type="button" class="btn btn-primary" @click="saveUser" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
useHead({ title: 'پویش تاکسی | مدیریت کاربران' })

const { apiFetch, errorMessage: apiErrorMessage } = useApi()
const viewModalRef = ref(null); const editModalRef = ref(null)
let bsViewModal = null; let bsEditModal = null

const visiblePages = computed(() => { const pages = []; const s = Math.max(1, currentPage.value-2); const e = Math.min(totalPages.value, s+4); for (let i=s;i<=e;i++) pages.push(i); return pages })
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

const items = ref([]); const loading = ref(false); const searchQuery = ref(''); const roleFilter = ref('')
const currentPage = ref(1); const total = ref(0); const totalPages = ref(0)
const viewData = ref(null); const editItem = ref(null); const saving = ref(false)
const form = ref({ first_name:'', last_name:'', phone:'', email:'', password:'', role:'passenger', gender:'', birth_date:'' })
let searchTimeout = null

function roleLabel(r) { return {passenger:'مسافر',driver:'راننده',admin:'مدیر',support:'پشتیبانی',super_admin:'سوپر ادمین'}[r]||r }
function roleBadge(r) { return {passenger:'bg-info',driver:'bg-primary',admin:'bg-warning',support:'bg-success',super_admin:'bg-danger'}[r]||'bg-secondary' }
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(()=>fetchData(1),500) }

async function fetchData(page=1) {
  if(page<1) return; loading.value=true
  try {
    const p = new URLSearchParams({page,limit:20})
    if(roleFilter.value) p.append('role',roleFilter.value)
    if(searchQuery.value) p.append('search',searchQuery.value)
    const res = await apiFetch(`/api/users?${p}`); const data = await res.json()
    items.value=data.users||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/20)
  } catch(e){console.error(e)} finally{loading.value=false}
}

async function viewUser(r) {
  try { const res = await apiFetch(`/api/users/${r.id}`); viewData.value = await res.json(); if(!bsViewModal) bsViewModal = new bootstrap.Modal(viewModalRef.value); bsViewModal.show() } catch(e){console.error(e)}
}

function openModal(item=null) {
  editItem.value = item
  form.value = item ? { first_name:item.first_name||'', last_name:item.last_name||'', phone:item.phone||'', email:item.email||'', password:'', role:item.role||'passenger', gender:item.gender||'', birth_date:item.birth_date||'' } : { first_name:'', last_name:'', phone:'', email:'', password:'', role:'passenger', gender:'', birth_date:'' }
  if(!bsEditModal) bsEditModal = new bootstrap.Modal(editModalRef.value); bsEditModal.show()
}

async function saveUser() {
  if(!form.value.phone) return alert('تلفن الزامی است')
  if(!editItem.value && !form.value.password) return alert('رمز عبور الزامی است')
  saving.value=true
  try {
    if(editItem.value) {
      const payload = { ...form.value }; delete payload.password
      await apiFetch(`/api/users/${editItem.value.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    } else {
      await apiFetch('/api/users', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form.value) })
    }
    bsEditModal.hide(); fetchData(currentPage.value)
  } catch(e){alert(apiErrorMessage(e))} finally{saving.value=false}
}

async function blockUser(u) {
  if(!confirm(`آیا از مسدود کردن ${u.first_name||u.phone} اطمینان دارید؟`)) return
  await apiFetch(`/api/users/${u.id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_blocked:true,is_active:false})}); fetchData(currentPage.value)
}
async function unblockUser(u) {
  await apiFetch(`/api/users/${u.id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_blocked:false,is_active:true,block_reason:null})}); fetchData(currentPage.value)
}
onMounted(()=>fetchData(1))
</script>
