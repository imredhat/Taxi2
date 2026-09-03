<template>

            <div class="row mb-3"><div class="col-12"><div class="d-flex justify-content-between align-items-center">
              <div><h4 class="f-w-600 text-dark">پیامهای سفر</h4><p class="text-secondary mb-0">چت بین مسافر و راننده</p></div>
              <span class="badge bg-primary f-s-14">کل: {{ total }}</span>
            </div></div></div>
            <div class="row mb-3"><div class="col-md-4"><input v-model="rideIdFilter" class="form-control" placeholder="شناسه سفر..." type="text" @input="debounceSearch" /></div></div>
            <div class="row"><div class="col-12"><div class="card"><div class="card-body">
              <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
              <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">پیامی یافت نشد</p></div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead><tr><th>#</th><th>شناسه سفر</th><th>فرستنده</th><th>نقش</th><th>پیام</th><th>نوع</th><th>خوانده</th><th>زمان</th></tr></thead>
                  <tbody><tr v-for="(r,i) in items" :key="r.id">
                    <td>{{ (currentPage-1)*50+i+1 }}</td><td><code class="f-s-12">{{ r.ride_id }}</code></td>
                    <td>{{ r.first_name||'' }} {{ r.last_name||'' }}<br/><small class="text-secondary" dir="ltr">{{ r.phone }}</small></td>
                    <td><span :class="r.role==='driver'?'bg-primary':'bg-info'" class="badge">{{ r.role==='driver'?'راننده':'مسافر' }}</span></td>
                    <td><span class="txt-ellipsis-1 d-block" style="max-width:300px">{{ r.message }}</span></td>
                    <td>{{ r.message_type||'text' }}</td>
                    <td><span :class="r.is_read?'bg-success':'bg-warning'" class="badge">{{ r.is_read?'خوانده':'نخوانده' }}</span></td>
                    <td class="f-s-13 text-secondary">{{ formatDate(r.created_at) }}</td>
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
  title: 'پویش تاکسی | پیامهای سفر',
  meta: [{ name: 'description', content: 'چت مسافر و راننده' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value-2); const e = Math.min(totalPages.value, s+4)
  for (let i=s;i<=e;i++) pages.push(i); return pages
})
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

const items = ref([]); const loading = ref(false); const rideIdFilter = ref('')
const currentPage = ref(1); const total = ref(0); const totalPages = ref(0)
let searchTimeout = null
function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(()=>fetchData(1),500) }
async function fetchData(page=1) {
  if(page<1) return; loading.value=true
  try {
    const p = new URLSearchParams({page,limit:50})
    if(rideIdFilter.value) p.append('ride_id',rideIdFilter.value)
    const res = await fetch(`/api/ride-messages?${p}`); const data = await res.json()
    items.value=data.messages||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/50)
  } catch(e){console.error(e)} finally{loading.value=false}
}
onMounted(()=>fetchData(1))

</script>
