<template>

            <div class="row mb-3"><div class="col-12"><div class="d-flex justify-content-between align-items-center">
              <div><h4 class="f-w-600 text-dark">برنامهریزی سفرها</h4><p class="text-secondary mb-0">سفرهای زمانبندی شده</p></div>
              <span class="badge bg-primary f-s-14">کل: {{ total }}</span>
            </div></div></div>
            <div class="row mb-3"><div class="col-md-3">
              <select v-model="activeFilter" class="form-select" @change="fetchData(1)">
                <option value="">همه</option><option value="true">فعال</option><option value="false">غیرفعال</option>
              </select>
            </div></div>
            <div class="row"><div class="col-12"><div class="card"><div class="card-body">
              <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
              <div v-else-if="items.length===0" class="text-center py-5"><p class="text-secondary">برنامه‌ای یافت نشد</p></div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead><tr><th>#</th><th>کاربر</th><th>تکرار</th><th>روزها</th><th>اجلای بعدی</th><th>آخرین اجرا</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
                  <tbody><tr v-for="(r,i) in items" :key="r.id">
                    <td>{{ (currentPage-1)*20+i+1 }}</td>
                    <td>{{ r.first_name||'' }} {{ r.last_name||'' }}<br/><small class="text-secondary" dir="ltr">{{ r.phone }}</small></td>
                    <td><span class="badge bg-info">{{ recurrenceLabel(r.recurrence) }}</span></td>
                    <td>{{ formatDays(r.recurrence_days) }}</td>
                    <td class="f-s-13">{{ formatDate(r.next_trigger_at) }}</td>
                    <td class="f-s-13 text-secondary">{{ formatDate(r.last_triggered_at) }}</td>
                    <td><span :class="r.is_active?'bg-success':'bg-secondary'" class="badge">{{ r.is_active?'فعال':'غیرفعال' }}</span></td>
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
  title: 'پویش تاکسی | برنامهریزی سفرها',
  meta: [{ name: 'description', content: 'سفرهای زمانبندی شده' }]
})

const visiblePages = computed(() => {
  const pages = []; const s = Math.max(1, currentPage.value-2); const e = Math.min(totalPages.value, s+4)
  for (let i=s;i<=e;i++) pages.push(i); return pages
})
function formatDate(d) { return d ? new Date(d).toLocaleDateString('fa-IR') : '—' }

const items = ref([]); const loading = ref(false); const activeFilter = ref('')
const currentPage = ref(1); const total = ref(0); const totalPages = ref(0)
const dayNames = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه']
function formatDays(d) { return d ? d.map(x=>dayNames[x]||x).join('، ') : '—' }
function recurrenceLabel(r) { return {daily:'روزانه',weekly:'هفتگی',weekdays:'روزهای کاری',custom:'سفارشی'}[r]||r||'—' }
async function fetchData(page=1) {
  if(page<1) return; loading.value=true
  try {
    const p = new URLSearchParams({page,limit:20})
    if(activeFilter.value!=='') p.append('is_active',activeFilter.value)
    const res = await fetch(`/api/ride-schedules?${p}`); const data = await res.json()
    items.value=data.schedules||[]; total.value=data.total||0; currentPage.value=data.page||1; totalPages.value=Math.ceil(data.total/20)
  } catch(e){console.error(e)} finally{loading.value=false}
}
onMounted(()=>fetchData(1))

</script>
