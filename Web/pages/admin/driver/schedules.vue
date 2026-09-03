<template>

            <div class="row mb-3"><div class="col-12"><div class="d-flex justify-content-between align-items-center">
              <div><h4 class="f-w-600 text-dark">برنامه کاری رانندگان</h4><p class="text-secondary mb-0">شیفت و ساعات کاری</p></div>
              <div>
                <button class="btn btn-primary b-r-22" @click="showAdd=!showAdd"><i class="ti ti-plus me-1"></i>افزودن برنامه</button>
                <span class="badge bg-primary f-s-14 ms-2">کل: {{ total }}</span>
              </div>
            </div></div></div>

            <div v-if="showAdd" class="row mb-3"><div class="col-12"><div class="card"><div class="card-body">
              <h6 class="f-w-600 mb-3">افزودن برنامه کاری</h6>
              <div class="row g-2">
                <div class="col-md-3"><input v-model="newItem.driver_id" class="form-control" placeholder="شناسه راننده (UUID)" /></div>
                <div class="col-md-2">
                  <select v-model="newItem.day_of_week" class="form-select">
                    <option value="0">یکشنبه</option><option value="1">دوشنبه</option><option value="2">سه‌شنبه</option>
                    <option value="3">چهارشنبه</option><option value="4">پنجشنبه</option><option value="5">جمعه</option><option value="6">شنبه</option>
                  </select>
                </div>
                <div class="col-md-2"><input v-model="newItem.start_time" class="form-control" type="time" /></div>
                <div class="col-md-2"><input v-model="newItem.end_time" class="form-control" type="time" /></div>
                <div class="col-md-1"><button class="btn btn-success w-100" @click="createSchedule"><i class="ti ti-check"></i></button></div>
              </div>
            </div></div></div></div>

            <div class="row"><div class="col-12"><div class="card"><div class="card-body">
              <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
              <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">برنامه‌ای یافت نشد</p></div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead><tr><th>#</th><th>راننده</th><th>تلفن</th><th>روز</th><th>شروع</th><th>پایان</th><th>وضعیت</th></tr></thead>
                  <tbody><tr v-for="(r,i) in items" :key="r.id">
                    <td>{{ (currentPage-1)*50+i+1 }}</td>
                    <td class="f-w-500">{{ r.first_name||'' }} {{ r.last_name||'' }}</td>
                    <td dir="ltr">{{ r.phone }}</td>
                    <td><span class="badge bg-primary">{{ dayName(r.day_of_week) }}</span></td>
                    <td dir="ltr">{{ r.start_time }}</td><td dir="ltr">{{ r.end_time }}</td>
                    <td><span :class="r.is_active?'bg-success':'bg-secondary'" class="badge">{{ r.is_active?'فعال':'غیرفعال' }}</span></td>
                  </tr></tbody>
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
  title: 'پویش تاکسی | برنامه کاری رانندگان',
  meta: [{ name: 'description', content: 'شیفت کاری' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value-2); const e = Math.min(totalPages.value, s+4)
  for (let i=s;i<=e;i++) pages.push(i); return pages
})
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

const items = ref([]); const loading = ref(false); const showAdd = ref(false)
const newItem = ref({driver_id:'',day_of_week:'0',start_time:'08:00',end_time:'20:00'})
const currentPage = ref(1); const total = ref(0); const totalPages = ref(0)
const days = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه']
function dayName(d) { return days[d]||d }
async function fetchData(page=1) {
  if(page<1) return; loading.value=true
  try {
    const res = await fetch(`/api/driver-schedules?page=${page}&limit=50`); const data = await res.json()
    items.value=data.schedules||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/50)
  } catch(e){console.error(e)} finally{loading.value=false}
}
async function createSchedule() {
  if(!newItem.value.driver_id) return alert('شناسه راننده الزامی است')
  try {
    await fetch('/api/driver-schedules',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newItem.value)})
    newItem.value={driver_id:'',day_of_week:'0',start_time:'08:00',end_time:'20:00'}; showAdd.value=false; fetchData(1)
  } catch(e){console.error(e)}
}
onMounted(()=>fetchData(1))

</script>
