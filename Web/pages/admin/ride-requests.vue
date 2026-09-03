<template>

            <div class="row mb-3">
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                  <div><h4 class="f-w-600 text-dark">درخواستهای سفر</h4><p class="text-secondary mb-0">لیست درخواستهای ثبت شده</p></div>
                  <span class="badge bg-primary f-s-14">کل: {{ total }}</span>
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4"><input v-model="searchQuery" autocomplete="off" class="form-control" placeholder="جستجو..." type="search" @input="debounceSearch" /></div>
              <div class="col-md-3">
                <select v-model="statusFilter" class="form-select" @change="fetchData(1)">
                  <option value="">همه</option><option value="pending">در انتظار</option><option value="searching">در جستجو</option>
                  <option value="accepted">پذیرفته</option><option value="cancelled">لغو</option><option value="expired">منقضی</option>
                </select>
              </div>
            </div>
            <div class="row"><div class="col-12"><div class="card"><div class="card-body">
              <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
              <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">درخواستی یافت نشد</p></div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead><tr><th>#</th><th>مسافر</th><th>مسیر</th><th>نوع</th><th>کلاس</th><th>مسافت</th><th>هزینه</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
                  <tbody>
                    <tr v-for="(r,i) in items" :key="r.id">
                      <td>{{ (currentPage-1)*20+i+1 }}</td>
                      <td>{{ r.first_name||'' }} {{ r.last_name||'' }}<br/><small class="text-secondary" dir="ltr">{{ r.phone }}</small></td>
                      <td><span class="txt-ellipsis-1 d-block" style="max-width:200px">{{ r.pickup_address||'—' }}</span><small class="text-secondary">→ {{ r.dropoff_address||'—' }}</small></td>
                      <td><span class="badge bg-info">{{ rideType(r.ride_type) }}</span></td>
                      <td>{{ carClass(r.car_class) }}</td>
                      <td>{{ r.distance_km ? r.distance_km+' km' : '—' }}</td>
                      <td class="f-w-600">{{ r.estimated_fare ? Number(r.estimated_fare).toLocaleString('fa-IR')+' ریال' : '—' }}</td>
                      <td><span :class="statusBadge(r.status)" class="badge">{{ statusLabel(r.status) }}</span></td>
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
definePageMeta({ layout: 'admin' })
useHead({
  title: 'پویش تاکسی | درخواستهای سفر',
  meta: [{ name: 'description', content: 'درخواستهای سفر' }]
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
function carClass(c) { return {eco:'اقتصادی',economy:'اکونومی',comfort:'کامفورت',premium:'پریمیوم',van:'ون',motorcycle:'موتور',tuk_tuk:'توکتوک'}[c]||c }
function statusLabel(s) { return {pending:'در انتظار',searching:'در جستجو',accepted:'پذیرفته',cancelled:'لغو',expired:'منقضی'}[s]||s }
function statusBadge(s) { return {pending:'bg-warning',searching:'bg-info',accepted:'bg-success',cancelled:'bg-danger',expired:'bg-secondary'}[s]||'bg-secondary' }
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(()=>fetchData(1),500) }

async function fetchData(page=1) {
  if(page<1) return; loading.value=true
  try {
    const p = new URLSearchParams({page,limit:20})
    if(statusFilter.value) p.append('status',statusFilter.value)
    if(searchQuery.value) p.append('search',searchQuery.value)
    const res = await fetch(`/api/ride-requests?${p}`); const data = await res.json()
    items.value=data.requests||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/20)
  } catch(e){console.error(e)} finally{loading.value=false}
}
onMounted(()=>fetchData(1))

</script>
