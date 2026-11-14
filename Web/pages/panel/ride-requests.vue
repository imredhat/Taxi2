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
              <div v-else-if="errorMsg" class="alert alert-danger" role="alert">{{ errorMsg }} <button class="btn btn-sm btn-outline-danger" @click="fetchData(currentPage)">تلاش مجدد</button></div>
              <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">درخواستی یافت نشد</p></div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead><tr><th>#</th><th>مسافر</th><th>مسیر</th><th>نوع</th><th>کلاس</th><th>مسافت</th><th>هزینه</th><th>وضعیت</th><th>راننده</th><th>زمان حرکت</th><th>عملیات</th></tr></thead>
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
                      <td><template v-if="r.driver_id">{{ [r.driver_first_name,r.driver_last_name].filter(Boolean).join(' ') || 'راننده' }}<br><small dir="ltr">{{ r.driver_phone }}</small><br><small>{{ r.license_plate }}</small></template><span v-else>تخصیص داده نشده</span></td>
                      <td class="f-s-13 text-secondary">{{ formatDate(r.scheduled_at || r.created_at) }}</td>
                      <td><div class="d-flex gap-2 flex-wrap"><button class="btn btn-sm btn-primary" :disabled="!canEdit(r)" @click="openAssignment(r)">{{ r.ride_id ? 'ویرایش راننده' : 'اختصاص راننده' }}</button><button class="btn btn-sm btn-outline-primary" :disabled="!canEdit(r)" @click="openEdit(r)">ویرایش درخواست</button></div></td>
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

  <Teleport to="body">
    <div v-if="modal" class="dispatch-backdrop" @click.self="closeModal" @keydown.esc="closeModal">
      <section class="dispatch-modal" role="dialog" aria-modal="true" aria-labelledby="dispatch-title" dir="rtl" tabindex="-1">
        <div class="d-flex justify-content-between align-items-center mb-3"><h5 id="dispatch-title" class="mb-0">{{ modal==='assign' ? (selectedRequest.ride_id ? 'ویرایش راننده سفر' : 'اختصاص راننده به سفر') : 'ویرایش درخواست سفر' }}</h5><button class="btn btn-light" aria-label="بستن پنجره" :disabled="saving" @click="closeModal">×</button></div>
        <p class="text-secondary">{{ selectedRequest.pickup_address }} ← {{ selectedRequest.dropoff_address }}</p>
        <p>کلاس خودرو: <strong>{{ carClass(selectedRequest.car_class) }}</strong> · مسافر: {{ Number(selectedRequest.passenger_count).toLocaleString('fa-IR') }}</p>
        <div v-if="modalError" class="alert alert-danger" role="alert">{{ modalError }}</div>
        <template v-if="modal==='assign'">
          <label class="form-label" for="driver-search">جستجوی راننده یا پلاک</label><div class="d-flex gap-2 mb-3"><input id="driver-search" v-model="driverSearch" class="form-control" placeholder="نام، تلفن یا پلاک" :disabled="saving" @keyup.enter="loadDrivers(1)"><button class="btn btn-outline-primary" :disabled="saving||driversLoading" @click="loadDrivers(1)">جستجو</button></div>
          <p class="text-secondary small">راننده‌های فعال با خودروی فعال از همین کلاس نمایش داده می‌شوند. راننده یا خودروی دارای سفر باز دیگر قابل انتخاب نیست.</p>
          <div v-if="driversLoading" class="text-center p-4"><span class="spinner-border text-primary" role="status" aria-label="دریافت راننده‌ها"></span></div>
          <template v-else>
            <p v-if="!drivers.length" class="alert alert-light">راننده‌ای متناسب با این کلاس و شرایط پیدا نشد. کلاس و فعال بودن خودرو را در بخش رانندگان بررسی کنید.</p>
            <label v-for="driver in drivers" :key="driver.vehicle_id" class="driver-option" :class="{'driver-selected':selectedVehicle===driver.vehicle_id}"><input v-model="selectedVehicle" type="radio" name="dispatch-driver" :value="driver.vehicle_id" :disabled="saving"><span><strong>{{ [driver.first_name,driver.last_name].filter(Boolean).join(' ') || 'راننده بدون نام' }}</strong><small class="d-block"><span dir="ltr">{{ driver.phone }}</span> · {{ driver.model_name || 'خودرو' }} · {{ driver.color_fa }} · {{ carClass(driver.car_class) }}</small><small class="d-block">پلاک: {{ driver.license_plate }} · {{ driver.is_verified ? 'راننده تأییدشده' : 'هنوز تأیید نشده' }}</small></span></label>
            <div class="d-flex justify-content-between my-3"><button class="btn btn-sm btn-light" :disabled="driverPage===1||saving" @click="loadDrivers(driverPage-1)">قبلی</button><span>{{ driverPage.toLocaleString('fa-IR') }}</span><button class="btn btn-sm btn-light" :disabled="drivers.length<20||saving" @click="loadDrivers(driverPage+1)">بعدی</button></div>
          </template>
          <button class="btn btn-primary w-100" :disabled="saving||driversLoading||!selectedVehicle" @click="saveAssignment">{{ saving ? 'در حال ثبت…' : 'تأیید و ثبت راننده' }}</button>
        </template>
        <form v-else @submit.prevent="saveEdit">
          <label class="form-label" for="request-passengers">تعداد مسافر</label><input id="request-passengers" v-model.number="editForm.passenger_count" type="number" min="1" max="8" required class="form-control mb-3" :disabled="saving">
          <label class="form-label">تاریخ و ساعت حرکت</label><ClientOnly><DatePicker v-model="editForm.departure" type="datetime" format="YYYY-MM-DD HH:mm" display-format="jYYYY/jMM/jDD HH:mm" :disabled="saving" :auto-submit="false" /></ClientOnly>
          <label class="form-label mt-3" for="request-notes">یادداشت</label><textarea id="request-notes" v-model="editForm.notes" class="form-control mb-3" maxlength="2000" :disabled="saving"></textarea>
          <div v-if="editPrice&&editPrice.key===priceKey()" class="alert alert-info">کرایه جدید: {{ (Number(editPrice.amount)/10).toLocaleString('fa-IR') }} تومان. برای ثبت، تأیید کنید.</div>
          <button type="submit" class="btn btn-primary w-100" :disabled="saving">{{ saving ? 'در حال بررسی…' : editPrice&&editPrice.key===priceKey() ? 'تأیید کرایه جدید و ذخیره' : 'ذخیره ویرایش' }}</button>
        </form>
        <button class="btn btn-light w-100 mt-2" :disabled="saving" @click="closeModal">انصراف</button>
      </section>
    </div>
  </Teleport>

</template>

<script setup>
import { vehiclePackageLabel } from '~/utils/vehicleClasses'
const { apiFetch, errorMessage } = useApi()
definePageMeta({ layout: 'admin' })
useHead({
  title: 'پویش تاکسی | درخواستهای سفر',
  meta: [{ name: 'description', content: 'درخواستهای سفر' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value-2); const e = Math.min(totalPages.value, s+4)
  for (let i=s;i<=e;i++) pages.push(i); return pages
})
function formatDate(d) { return d ? new Date(d).toLocaleString('fa-IR',{timeZone:'Asia/Tehran',dateStyle:'short',timeStyle:'short'}) : '—' }

const items = ref([]); const loading = ref(false); const searchQuery = ref(''); const statusFilter = ref('')
const currentPage = ref(1); const total = ref(0); const totalPages = ref(0)
const errorMsg = ref('')
let requestVersion = 0
let searchTimeout = null

function rideType(t) { return {normal:'عادی',intercity:'بین شهری',shared:'اشتراکی',scheduled:'زمانبندی',airport:'فرودگاهی'}[t]||t }
function carClass(c) { return vehiclePackageLabel(c) }
function statusLabel(s) { return {pending:'در انتظار',searching:'در جستجو',accepted:'پذیرفته',cancelled:'لغو',expired:'منقضی'}[s]||s }
function statusBadge(s) { return {pending:'bg-warning',searching:'bg-info',accepted:'bg-success',cancelled:'bg-danger',expired:'bg-secondary'}[s]||'bg-secondary' }
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(()=>fetchData(1),500) }

async function fetchData(page=1) {
  if(page<1) return; const version=++requestVersion; loading.value=true; errorMsg.value=''
  try {
    const p = new URLSearchParams({page,limit:20})
    if(statusFilter.value) p.append('status',statusFilter.value)
    if(searchQuery.value) p.append('search',searchQuery.value)
    const res = await apiFetch(`/api/ride-requests?${p}`); const data = await res.json()
    if(version!==requestVersion) return
    if(!res.ok) { errorMsg.value=data.error||'دریافت درخواست‌های سفر انجام نشد.'; return }
    if(!Array.isArray(data.requests)) { errorMsg.value='پاسخ درخواست‌های سفر معتبر نیست.'; return }
    items.value=data.requests||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/20)
  } catch(e){if(version===requestVersion)errorMsg.value=errorMessage(e)} finally{if(version===requestVersion)loading.value=false}
}
onMounted(()=>fetchData(1))
onBeforeUnmount(()=>{clearTimeout(searchTimeout);requestVersion++})

const modal=ref(''),selectedRequest=ref(null),saving=ref(false),modalError=ref('')
const drivers=ref([]),driversLoading=ref(false),driverSearch=ref(''),driverPage=ref(1),selectedVehicle=ref(''),assignment=ref(null)
const editForm=ref({passenger_count:1,departure:'',notes:''}),editPrice=ref(null)
const priceKey=()=>JSON.stringify([editForm.value.passenger_count,editForm.value.departure])
const candidates=new Map()
let driverVersion=0
function canEdit(r){return ['pending','searching','accepted'].includes(r.status)&&(!r.ride_status||r.ride_status==='accepted')}
function closeModal(){if(saving.value)return;modal.value='';driverVersion++;driversLoading.value=false}
function openAssignment(request){selectedRequest.value=request;modal.value='assign';modalError.value='';driverSearch.value='';selectedVehicle.value=request.vehicle_id||'';assignment.value=null;candidates.clear();loadDrivers(1)}
async function loadDrivers(page=1){
 if(!modal.value||page<1)return
 const version=++driverVersion;driversLoading.value=true;modalError.value=''
 try{const params=new URLSearchParams({page,limit:20,search:driverSearch.value});const response=await apiFetch(`/api/ride-requests/${selectedRequest.value.id}/drivers?${params}`);const data=await response.json();if(version!==driverVersion)return;if(!response.ok)throw new Error(data.error||'دریافت راننده‌ها انجام نشد.');drivers.value=data.items;driverPage.value=data.page;assignment.value=data.assignment;for(const item of data.items)candidates.set(item.vehicle_id,item)}
 catch(err){if(version===driverVersion){drivers.value=[];modalError.value=err.message||errorMessage(err)}}finally{if(version===driverVersion)driversLoading.value=false}
}
async function saveAssignment(){
 if(saving.value||!selectedVehicle.value)return
 const candidate=candidates.get(selectedVehicle.value),current=assignment.value
 const driverId=candidate?.driver_id||(selectedVehicle.value===current?.vehicle_id?current.driver_id:null)
 if(!driverId){modalError.value='راننده را از فهرست انتخاب کنید.';return}
 saving.value=true;modalError.value=''
 try{const response=await apiFetch(`/api/ride-requests/${selectedRequest.value.id}/assignment`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({driver_id:driverId,vehicle_id:selectedVehicle.value,expected_ride_id:current?.id||null,expected_driver_id:current?.driver_id||null})});const data=await response.json();if(!response.ok)throw new Error(data.error||'تخصیص راننده انجام نشد.');modal.value='';await fetchData(currentPage.value)}catch(err){modalError.value=err.message||errorMessage(err)}finally{saving.value=false}
}
function openEdit(request){
 selectedRequest.value=request;modal.value='edit';modalError.value='';editPrice.value=null
 let departure=''
 if(request.scheduled_at){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(request.scheduled_at));const part=type=>parts.find(p=>p.type===type).value;departure=`${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}`}
 editForm.value={passenger_count:request.passenger_count,departure,notes:request.notes||''}
}
async function saveEdit(){
 if(saving.value)return;saving.value=true;modalError.value=''
 try{const form=editForm.value;const scheduled_at=form.departure?new Date(form.departure.replace(' ','T')+':00+03:30').toISOString():null;const needsPrice=selectedRequest.value.booking_details?.fare&&(Date.parse(scheduled_at)!==Date.parse(selectedRequest.value.scheduled_at)||form.passenger_count!==selectedRequest.value.passenger_count);if(needsPrice&&editPrice.value?.key!==priceKey()){const response=await apiFetch(`/api/ride-requests/${selectedRequest.value.id}/fare-preview`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scheduled_at,passenger_count:form.passenger_count})});const result=await response.json();if(!response.ok)throw new Error(result.error||'محاسبه کرایه جدید انجام نشد.');editPrice.value={...result,key:priceKey()};return;} const response=await apiFetch(`/api/ride-requests/${selectedRequest.value.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({passenger_count:form.passenger_count,scheduled_at,notes:form.notes,expected_version:selectedRequest.value.edit_version,...(needsPrice?{quoteId:editPrice.value.quoteId,packageId:editPrice.value.packageId}:{})})});const data=await response.json();if(!response.ok){if(response.status===409)editPrice.value=null;throw new Error(data.error||'ویرایش انجام نشد.');}modal.value='';await fetchData(currentPage.value)}catch(err){modalError.value=err instanceof RangeError?'تاریخ و ساعت معتبر انتخاب کنید.':err.message||errorMessage(err)}finally{saving.value=false}
}
onBeforeUnmount(()=>{driverVersion++})

</script>
<style scoped>
.dispatch-backdrop{position:fixed;inset:0;z-index:1100;background:#0008;display:flex;align-items:center;justify-content:center;padding:20px}.dispatch-modal{background:white;color:#16252d;border-radius:18px;padding:24px;width:100%;max-width:680px;max-height:90vh;overflow:auto;box-shadow:0 20px 70px #0004;font-family:Estedad,Tahoma,sans-serif}.driver-option{display:flex;gap:14px;align-items:center;border:1px solid #dfe8e4;border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer}.driver-selected{border-color:#07846c;background:#f0faf6}.driver-option small{color:#607079;line-height:1.9}
</style>
