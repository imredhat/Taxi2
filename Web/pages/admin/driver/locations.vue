<template>

            <div class="row mb-3"><div class="col-12"><div class="d-flex justify-content-between align-items-center">
              <div><h4 class="f-w-600 text-dark">موقعیت رانندگان</h4><p class="text-secondary mb-0">ردیابی لحظه‌ای</p></div>
              <span class="badge bg-primary f-s-14">کل: {{ total }}</span>
            </div></div></div>
            <div class="row"><div class="col-12"><div class="card"><div class="card-body">
              <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
              <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">موقعیتی یافت نشد</p></div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead><tr><th>#</th><th>راننده</th><th>تلفن</th><th>وضعیت</th><th>امتیاز</th><th>عرض</th><th>طول</th><th>سرعت</th><th>جهت</th><th>دقت</th><th>بروزرسانی</th></tr></thead>
                  <tbody><tr v-for="(r,i) in items" :key="r.id">
                    <td>{{ (currentPage-1)*50+i+1 }}</td>
                    <td class="f-w-500">{{ r.first_name||'' }} {{ r.last_name||'' }}</td>
                    <td dir="ltr">{{ r.phone }}</td>
                    <td><span :class="statusBadge(r.driver_status)" class="badge">{{ statusLabel(r.driver_status) }}</span></td>
                    <td class="text-warning"><i class="iconoir-star-solid me-1"></i>{{ r.rating }}</td>
                    <td dir="ltr">{{ r.lat }}</td><td dir="ltr">{{ r.lng }}</td>
                    <td>{{ r.speed ? r.speed+' km/h' : '—' }}</td>
                    <td>{{ r.heading ? r.heading+'°' : '—' }}</td>
                    <td>{{ r.accuracy ? r.accuracy+'m' : '—' }}</td>
                    <td class="f-s-13 text-secondary">{{ formatDate(r.updated_at) }}</td>
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
  title: 'پویش تاکسی | موقعیت رانندگان',
  meta: [{ name: 'description', content: 'ردیابی لحظه‌ای' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value-2); const e = Math.min(totalPages.value, s+4)
  for (let i=s;i<=e;i++) pages.push(i); return pages
})
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

const items = ref([]); const loading = ref(false)
const currentPage = ref(1); const total = ref(0); const totalPages = ref(0)
function statusLabel(s) { return {offline:'آفلاین',online:'آنلاین',busy:'در سفر',break:'استراحت'}[s]||s }
function statusBadge(s) { return {offline:'bg-secondary',online:'bg-success',busy:'bg-danger',break:'bg-warning'}[s]||'bg-secondary' }
async function fetchData(page=1) {
  if(page<1) return; loading.value=true
  try {
    const res = await fetch(`/api/driver-locations?page=${page}&limit=50`); const data = await res.json()
    items.value=data.locations||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/50)
  } catch(e){console.error(e)} finally{loading.value=false}
}
onMounted(()=>fetchData(1))

</script>
