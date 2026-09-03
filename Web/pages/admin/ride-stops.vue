<template>

            <div class="row mb-3"><div class="col-12"><div class="d-flex justify-content-between align-items-center">
              <div><h4 class="f-w-600 text-dark">توقفهای سفر</h4><p class="text-secondary mb-0">توقفات میانی سفرها</p></div>
              <div>
                <button class="btn btn-primary b-r-22" @click="showAdd=!showAdd"><i class="ti ti-plus me-1"></i>افزودن توقف</button>
                <span class="badge bg-primary f-s-14 ms-2">کل: {{ total }}</span>
              </div>
            </div></div></div>

            <div v-if="showAdd" class="row mb-3"><div class="col-12"><div class="card"><div class="card-body">
              <h6 class="f-w-600 mb-3">افزودن توقف جدید</h6>
              <div class="row g-2">
                <div class="col-md-3"><input v-model="newItem.ride_id" class="form-control" placeholder="شناسه سفر (UUID)" /></div>
                <div class="col-md-1"><input v-model.number="newItem.stop_order" class="form-control" placeholder="ترتیب" type="number" /></div>
                <div class="col-md-3"><input v-model="newItem.address" class="form-control" placeholder="آدرس" /></div>
                <div class="col-md-2"><input v-model="newItem.lat" class="form-control" placeholder="عرض جغرافیایی" /></div>
                <div class="col-md-2"><input v-model="newItem.lng" class="form-control" placeholder="طول جغرافیایی" /></div>
                <div class="col-md-1"><button class="btn btn-success w-100" @click="createStop"><i class="ti ti-check"></i></button></div>
              </div>
            </div></div></div></div>

            <div class="row mb-3"><div class="col-md-4"><input v-model="rideIdFilter" class="form-control" placeholder="شناسه سفر..." type="text" @input="debounceSearch" /></div></div>
            <div class="row"><div class="col-12"><div class="card"><div class="card-body">
              <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
              <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">توقفی یافت نشد</p></div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead><tr><th>#</th><th>شناسه سفر</th><th>ترتیب</th><th>آدرس</th><th>عرض</th><th>طول</th><th>رسیدن</th><th>حرکت</th></tr></thead>
                  <tbody><tr v-for="(r,i) in items" :key="r.id">
                    <td>{{ (currentPage-1)*50+i+1 }}</td><td><code class="f-s-12">{{ r.ride_id }}</code></td>
                    <td><span class="badge bg-primary">{{ r.stop_order }}</span></td><td>{{ r.address||'—' }}</td>
                    <td dir="ltr">{{ r.lat }}</td><td dir="ltr">{{ r.lng }}</td>
                    <td class="f-s-13 text-secondary">{{ formatDate(r.arrival_time) }}</td>
                    <td class="f-s-13 text-secondary">{{ formatDate(r.departure_time) }}</td>
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
  title: 'پویش تاکسی | توقفهای سفر',
  meta: [{ name: 'description', content: 'توقفات میانی سفرها' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value-2); const e = Math.min(totalPages.value, s+4)
  for (let i=s;i<=e;i++) pages.push(i); return pages
})
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

const items = ref([]); const loading = ref(false); const rideIdFilter = ref(''); const showAdd = ref(false)
const newItem = ref({ride_id:'',stop_order:1,address:'',lat:'',lng:''})
const currentPage = ref(1); const total = ref(0); const totalPages = ref(0)
let searchTimeout = null
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(()=>fetchData(1),500) }
async function fetchData(page=1) {
  if(page<1) return; loading.value=true
  try {
    const p = new URLSearchParams({page,limit:50})
    if(rideIdFilter.value) p.append('ride_id',rideIdFilter.value)
    const res = await fetch(`/api/ride-stops?${p}`); const data = await res.json()
    items.value=data.stops||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/50)
  } catch(e){console.error(e)} finally{loading.value=false}
}
async function createStop() {
  if(!newItem.value.ride_id) return alert('شناسه سفر الزامی است')
  try {
    await fetch('/api/ride-stops',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newItem.value)})
    newItem.value={ride_id:'',stop_order:1,address:'',lat:'',lng:''}; showAdd.value=false; fetchData(1)
  } catch(e){console.error(e)}
}
onMounted(()=>fetchData(1))

</script>
