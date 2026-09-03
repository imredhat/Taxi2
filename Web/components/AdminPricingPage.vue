<template>
  <div>
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">{{ title }}</h4>
            <p class="text-secondary mb-0">{{ subtitle }}</p>
          </div>
          <button class="btn btn-primary b-r-22" @click="openModal()">
            <i class="ti ti-plus me-1"></i>افزودن
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else-if="items.length === 0" class="text-center py-5"><p class="text-secondary">آیتمی یافت نشد</p></div>

    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in items" :key="item.id">
                    <td>{{ i + 1 }}</td>
                    <td v-for="col in columns" :key="col.key">
                      <span v-if="col.type === 'badge'" class="badge" :class="col.badgeClass ? col.badgeClass(item[col.key]) : 'bg-info'">
                        {{ col.format ? col.format(item[col.key]) : item[col.key] }}
                      </span>
                      <span v-else>{{ col.format ? col.format(item[col.key]) : (item[col.key] ?? '—') }}</span>
                    </td>
                    <td>
                      <span :class="item.is_active ? 'bg-success' : 'bg-secondary'" class="badge">
                        {{ item.is_active ? 'فعال' : 'غیرفعال' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary b-r-22 me-1" @click="openModal(item)">
                        <i class="ti ti-pencil f-s-14"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger b-r-22" @click="deleteItem(item)">
                        <i class="ti ti-trash f-s-14"></i>
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

    <!-- Modal -->
    <div class="modal fade" ref="modalRef" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingItem ? 'ویرایش' : 'افزودن' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div v-for="field in formFields" :key="field.key" :class="field.col || 'col-md-6'">
                <label class="form-label">{{ field.label }}</label>
                <select v-if="field.type === 'select'" v-model="form[field.key]" class="form-select">
                  <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <input v-else-if="field.type === 'number'" v-model.number="form[field.key]" type="number" class="form-control" :placeholder="field.label" step="any" />
                <input v-else-if="field.type === 'time'" v-model="form[field.key]" type="time" class="form-control" />
                <input v-else v-model="form[field.key]" type="text" class="form-control" :placeholder="field.label" />
              </div>
              <div class="col-md-6">
                <label class="form-label">وضعیت</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="form.is_active" id="is_active_check" />
                  <label class="form-check-label" for="is_active_check">فعال</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
            <button type="button" class="btn btn-primary" @click="saveItem" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  subtitle: String,
  apiEndpoint: String,
  columns: Array,
  formFields: Array,
  defaultForm: Object
})

const { apiFetch, errorMessage: apiErrorMessage } = useApi()
const modalRef = ref(null)
let bsModal = null

const items = ref([])
const loading = ref(true)
const saving = ref(false)
const editingItem = ref(null)
const form = ref({})

function openModal(item = null) {
  editingItem.value = item
  form.value = item ? { ...item } : { ...props.defaultForm, is_active: true }
  if (!bsModal) bsModal = new bootstrap.Modal(modalRef.value)
  bsModal.show()
}

async function fetchData() {
  loading.value = true
  try {
    const res = await apiFetch(`/api/${props.apiEndpoint}`)
    const data = await res.json()
    items.value = data.items || []
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

async function saveItem() {
  saving.value = true
  try {
    const method = editingItem.value ? 'PUT' : 'POST'
    const url = editingItem.value ? `/api/${props.apiEndpoint}/${editingItem.value.id}` : `/api/${props.apiEndpoint}`
    const res = await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.error || 'خطا'); return }
    bsModal.hide()
    fetchData()
  } catch (err) { alert(apiErrorMessage(err)) }
  finally { saving.value = false }
}

async function deleteItem(item) {
  if (!confirm('آیا از حذف اطمینان دارید؟')) return
  try {
    await apiFetch(`/api/${props.apiEndpoint}/${item.id}`, { method: 'DELETE' })
    fetchData()
  } catch (err) { alert(apiErrorMessage(err)) }
}

onMounted(() => fetchData())
</script>
