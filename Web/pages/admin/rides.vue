<template>

            <div class="row mb-3">
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                  <div><h4 class="f-w-600 text-dark">لیست سفرها</h4><p class="text-secondary mb-0">مدیریت تمام سفرهای سیستم</p></div>
                  <div>
                    <button class="btn btn-success" @click="showAdd=!showAdd"><i class="ti ti-plus me-1"></i>افزودن سفر جدید</button>
                    <span class="badge bg-primary f-s-14 ms-2">کل: {{ total }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="showAdd" class="row mb-3">
              <div class="col-12">
                <div class="card">
                  <div class="card-body">
                    <h6 class="f-w-600 mb-3">افزودن سفر جدید</h6>
                    <div class="row g-2">
                      <div class="col-md-2"><input v-model="newItem.passenger_id" class="form-control" placeholder="شناسه مسافر" /></div>
                      <div class="col-md-2"><input v-model="newItem.driver_id" class="form-control" placeholder="شناسه راننده" /></div>
                      <div class="col-md-2">
                        <select v-model="newItem.type" class="form-select">
                          <option value="">--- انتخاب کنید ---</option>
                          <option value="normal">نرمال</option>
                          <option value="intercity">بین شهری</option>
                          <option value="shared">اشتراکی</option>
                          <option value="scheduled">زمانبندی شده</option>
                          <option value="airport">فرودگاه</option>
                        </select>
                      </div>
                      <div class="col-md-2">
                        <select v-model="newItem.car_class" class="form-select">
                          <option value="">--- انتخاب کنید ---</option>
                          <option value="eco">اقتصادی</option>
                          <option value="economy">اکونومی</option>
                          <option value="comfort">کامفورت</option>
                          <option value="premium">پریمیوم</option>
                          <option value="van">ون</option>
                          <option value="motorcycle">موتور</option>
                          <option value="tuk_tuk">توک‌توک</option>
                        </select>
                      </div>
                      <div class="col-md-2"><input v-model="newItem.pickup_address" class="form-control" placeholder="آدرس مبدا" /></div>
                      <div class="col-md-2"><input v-model="newItem.dropoff_address" class="form-control" placeholder="آدرس مقصد" /></div>
                      <div class="col-md-2"><button class="btn btn-success w-100" @click="createRide"><i class="ti ti-check me-1"></i>ذخیره</button></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4"><input v-model="searchQuery" autocomplete="off" class="form-control" placeholder="جستجوی مسافر، راننده، آدرس..." type="search" @input="debounceSearch" /></div>
              <div class="col-md-3">
                <select v-model="statusFilter" class="form-select" @change="fetchData(1)">
                  <option value="">همه وضعیتها</option>
                  <option value="pending">در انتظار</option><option value="searching">در جستجو</option><option value="accepted">پذیرفته</option>
                  <option value="arriving">در حرکت</option><option value="arrived">رسیده</option><option value="in_progress">در انجام</option>
                  <option value="completed">تکمیل</option><option value="cancelled">لغو</option>
                </select>
              </div>
            </div>
            <div class="row"><div class="col-12"><div class="card"><div class="card-body">
              <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
              <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">سفری یافت نشد</p></div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead><tr><th>#</th><th>مسافر</th><th>راننده</th><th>مسیر</th><th>نوع</th><th>وضعیت</th><th>کرایه</th><th>تاریخ</th></tr></thead>
                  <tbody>
                    <tr v-for="(r,i) in items" :key="r.id">
                      <td>{{ (currentPage-1)*20+i+1 }}</td>
                      <td><span class="f-w-500">{{ r.passenger_first||'' }} {{ r.passenger_last||'' }}</span><br/><small class="text-secondary" dir="ltr">{{ r.passenger_phone }}</small></td>
                      <td><span class="f-w-500">{{ r.driver_first||'' }} {{ r.driver_last||'' }}</span><br/><small class="text-secondary" dir="ltr">{{ r.driver_phone }}</small></td>
                      <td><span class="txt-ellipsis-1 d-block" style="max-width:200px">{{ r.pickup_address||'—' }}</span><small class="text-secondary">→ {{ r.dropoff_address||'—' }}</small></td>
                      <td><span class="badge bg-info">{{ rideType(r.ride_type) }}</span></td>
                      <td><span :class="statusBadge(r.status)" class="badge">{{ statusLabel(r.status) }}</span></td>
                      <td class="f-w-600">{{ r.fare ? Number(r.fare).toLocaleString('fa-IR')+' ریال' : '—' }}</td>
                      <td class="f-s-13 text-secondary">{{ formatDate(r.created_at) }}</td>
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
            </div></div></div></div>

</template>
<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({
  title: 'پویش تاکسی | لیست سفرها',
  meta: [{ name: 'description', content: 'مدیریت سفرها' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value-2); const e = Math.min(totalPages.value, s+4)
  for (let i=s;i<=e;i++) pages.push(i); return pages
})
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

const items = ref([]); const loading = ref(false); const searchQuery = ref(''); const statusFilter = ref('')
const currentPage = ref(1); const total = ref(0); const totalPages = ref(0)
let searchTimeout = null

function rideType(t) { return {normal:'عادی',intercity:'بین شهری',shared:'اشتراکی',scheduled:'زمانبندی',airport:'فرودگاهی'}[t]||t }
function statusLabel(s) { return {pending:'در انتظار',searching:'در جستجو',accepted:'پذیرفته',arriving:'در حرکت',arrived:'رسیده',in_progress:'در انجام',completed:'تکمیل',cancelled:'لغو',expired:'منقضی'}[s]||s }
function statusBadge(s) { return {pending:'bg-warning',searching:'bg-info',accepted:'bg-primary',arriving:'bg-info',arrived:'bg-success',in_progress:'bg-primary',completed:'bg-success',cancelled:'bg-danger',expired:'bg-secondary'}[s]||'bg-secondary' }
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(()=>fetchData(1),500) }

async function fetchData(page=1) {
  if(page<1) return; loading.value=true
  try {
    const p = new URLSearchParams({page,limit:20})
    if(statusFilter.value) p.append('status',statusFilter.value)
    if(searchQuery.value) p.append('search',searchQuery.value)
    const res = await fetch(`/api/rides?${p}`); const data = await res.json()
    items.value=data.rides||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/20)
  } catch(e){console.error(e)} finally{loading.value=false}
}

// Add‑form state
const showAdd = ref(false)
const newItem = ref({passenger_id:'', driver_id:'', type:'', car_class:'', pickup_address:'', dropoff_address:''})
async function createRide() {
  // basic validation
  if(!newItem.value.passenger_id || !newItem.value.driver_id) {
    alert('شناسه مسافر و راننده الزامی است')
    return
  }
  try {
    const res = await fetch('/api/rides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem.value)
    })
    if(!res.ok) {
      const err = await res.text()
      alert('خطا در افزودن سفر: ' + err)
      return
    }
    // reset form
    newItem.value = {passenger_id:'', driver_id:'', type:'', car_class:'', pickup_address:'', dropoff_address:''}
    showAdd.value = false
    fetchData(1)
  } catch(e){
    console.error(e)
    alert('خطا در ارتباط')
  }
}

onMounted(()=>fetchData(1))
</script>
