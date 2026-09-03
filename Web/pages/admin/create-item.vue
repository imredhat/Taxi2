<template>
  <div class="container-fluid mt-3">
    <h4 class="f-w-600 text-dark mb-3">افزودن آیتم جدید</h4>
    <div v-if="!selectedEntity" class="mb-4">
      <label class="form-label">نوع آیتم را انتخاب کنید</label>
      <select class="form-select" v-model="selectedEntity">
        <option value="" disabled>--- انتخاب کنید ---</option>
        <option value="users">مسافر / کاربر</option>
        <option value="drivers">راننده</option>
        <option value="vehicles">خودرو</option>
        <option value="rides">سفر</option>
        <!-- اضافه کنید گزینه‌های دیگر به‌نیاز -->
      </select>
    </div>

    <div v-else-if="step === 1" class="mb-4">
      <h5 class="mb-2">اطلاعات {{ entityLabel }}</h5>
      <form @submit.prevent="nextStep">
        <!-- فیلدهای عمومی برای همه (مثلاً نام، توضیح) -->
        <div v-if="selectedEntity === 'users'" class="mb-3">
          <label class="form-label">نام</label>
          <input class="form-control" v-model="form.first_name" required />
        </div>
        <div v-if="selectedEntity === 'users'" class="mb-3">
          <label class="form-label">نام خانوادگی</label>
          <input class="form-control" v-model="form.last_name" required />
        </div>
        <div v-if="selectedEntity === 'users'" class="mb-3">
          <label class="form-label">شماره تلفن</label>
          <input class="form-control" v-model="form.phone" required />
        </div>
        <!-- Drivers: basic info -->
        <div v-if="selectedEntity === 'drivers'" class="mb-3">
          <label class="form-label">شناسه کاربر (User ID)</label>
          <input class="form-control" v-model="form.user_id" required />
        </div>
        <!-- Vehicles: basic info -->
        <div v-if="selectedEntity === 'vehicles'" class="mb-3">
          <label class="form-label">شناسه راننده (Driver ID)</label>
          <input class="form-control" v-model="form.driver_id" required />
        </div>
        <div v-if="selectedEntity === 'vehicles'" class="mb-3">
          <label class="form-label">کلاس خودرو</label>
          <select class="form-select" v-model="form.class" required>
            <option value="" disabled>--- انتخاب کنید ---</option>
            <option value="eco">اقتصادی</option>
            <option value="economy">اکونومی</option>
            <option value="comfort">کامفورت</option>
            <option value="premium">پریمیوم</option>
            <option value="van">ون</option>
            <option value="motorcycle">موتور</option>
            <option value="tuk_tuk">توک‌توک</option>
          </select>
        </div>
        <!-- Rides: detailed info -->
        <div v-if="selectedEntity === 'rides'" class="mb-3">
          <label class="form-label">شناسه مسافر</label>
          <input class="form-control" v-model="form.passenger_id" required />
        </div>
        <div v-if="selectedEntity === 'rides'" class="mb-3">
          <label class="form-label">شناسه راننده</label>
          <input class="form-control" v-model="form.driver_id" required />
        </div>
        <div v-if="selectedEntity === 'rides'" class="mb-3">
          <label class="form-label">نوع سفر</label>
          <select class="form-select" v-model="form.type" required>
            <option value="" disabled>--- انتخاب کنید ---</option>
            <option value="normal">نرمال</option>
            <option value="intercity">بین شهری</option>
            <option value="shared">اشتراکی</option>
            <option value="scheduled">زمانبندی شده</option>
            <option value="airport">فرودگاه</option>
          </select>
        </div>
        <div v-if="selectedEntity === 'rides'" class="mb-3">
          <label class="form-label">کلاس خودرو</label>
          <select class="form-select" v-model="form.car_class" required>
            <option value="" disabled>--- انتخاب کنید ---</option>
            <option value="eco">اقتصادی</option>
            <option value="economy">اکونومی</option>
            <option value="comfort">کامفورت</option>
            <option value="premium">پریمیوم</option>
            <option value="van">ون</option>
            <option value="motorcycle">موتور</option>
            <option value="tuk_tuk">توک‌توک</option>
          </select>
        </div>
        <div v-if="selectedEntity === 'rides'" class="mb-3">
          <label class="form-label">آدرس مبدا</label>
          <input class="form-control" v-model="form.pickup_address" required />
        </div>
        <div v-if="selectedEntity === 'rides'" class="mb-3">
          <label class="form-label">آدرس مقصد</label>
          <input class="form-control" v-model="form.dropoff_address" required />
        </div>
        <button type="submit" class="btn btn-primary">بعدی</button>
        <button type="button" class="btn btn-secondary ms-2" @click="reset">لغو</button>
      </form>
    </div>

    <div v-else-if="step === 2" class="mb-4">
      <h5 class="mb-2">بازبینی و ارسال</h5>
      <pre class="bg-light p-3 rounded">{{ JSON.stringify(form, null, 2) }}</pre>
      <button class="btn btn-success" @click="submitForm">ارسال</button>
      <button type="button" class="btn btn-outline-secondary ms-2" @click="step = 1">بازگشت</button>
    </div>

    <div v-else-if="step === 3" class="mb-4">
      <div class="alert alert-success" role="alert">
        {{ entityLabel }} با موفقیت افزوده شد.
      </div>
      <button class="btn btn-primary" @click="reset">افزودن مورد دیگر</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '#app'

const router = useRouter()

const selectedEntity = ref('')
const step = ref(1)
const form = ref({})

const entityLabel = computed(() => {
  switch (selectedEntity.value) {
    case 'users': return 'کاربر'
    case 'drivers': return 'راننده'
    case 'vehicles': return 'خودرو'
    case 'rides': return 'سفر'
    default: return ''
  }
})

function nextStep() {
  // Basic validation – ensure all required keys are present
  // For brevity we trust HTML required attributes
  step.value = 2
}

function reset() {
  selectedEntity.value = ''
  step.value = 1
  form.value = {}
}

async function submitForm() {
  const endpointMap = {
    users: '/api/users',
    drivers: '/api/drivers',
    vehicles: '/api/vehicles',
    rides: '/api/rides',
  }
  const url = endpointMap[selectedEntity.value]
  if (!url) {
    alert('پشتیبانی از این نوع آیتم هنوز اضافه نشده')
    return
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (!res.ok) {
      const txt = await res.text()
      alert('خطا در ارسال: ' + txt)
      return
    }
    step.value = 3
  } catch (e) {
    alert('خطا در ارتباط: ' + e.message)
  }
}

useHead({
  title: 'افزودن آیتم جدید | پویش تاکسی',
  meta: [
    { name: 'description', content: 'فرم افزودن آیتم جدید به سیستم' },
  ],
})
</script>

<style scoped>
.container-fluid { max-width: 800px; }
</style>