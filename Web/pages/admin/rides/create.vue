<template>
  <div class="row mb-3">
    <div class="col-12">
      <h4 class="f-w-600 text-dark">افزودن سفر جدید</h4>
      <p class="text-secondary mb-0">پر کردن فرم زیر برای ثبت یک سفر جدید.</p>
    </div>
  </div>
  <form @submit.prevent="onSubmit">
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">مسافر</label>
        <select v-model="form.passenger_id" class="form-select" required>
          <option value="" disabled>انتخاب مسافر</option>
          <option v-for="u in users" :key="u.id" :value="u.id">{{ u.first_name }} {{ u.last_name }} ({{ u.phone }})</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">راننده</label>
        <select v-model="form.driver_id" class="form-select" required>
          <option value="" disabled>انتخاب راننده</option>
          <option v-for="d in drivers" :key="d.id" :value="d.id">{{ d.first_name }} {{ d.last_name }} ({{ d.phone }})</option>
        </select>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-4">
        <label class="form-label">نوع سفر</label>
        <select v-model="form.ride_type" class="form-select" required>
          <option value="" disabled>انتخاب نوع</option>
          <option v-for="t in rideTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">کلاس خودرو</label>
        <select v-model="form.car_class" class="form-select" required>
          <option value="" disabled>انتخاب کلاس</option>
          <option v-for="c in carClasses" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">وضعیت</label>
        <select v-model="form.status" class="form-select" required>
          <option value="" disabled>انتخاب وضعیت</option>
          <option v-for="s in rideStatuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-3">
        <label class="form-label">کرایه (ریال)</label>
        <input v-model.number="form.fare" type="number" class="form-control" placeholder="مثال: 50000" />
      </div>
      <div class="col-md-3">
        <label class="form-label">مسافت (km)</label>
        <input v-model.number="form.distance_km" type="number" class="form-control" placeholder="مثال: 12.5" />
      </div>
      <div class="col-md-3">
        <label class="form-label">مدت (دقیقه)</label>
        <input v-model.number="form.duration_minutes" type="number" class="form-control" placeholder="مثال: 25" />
      </div>
      <div class="col-md-3">
        <label class="form-label">روش پرداخت</label>
        <select v-model="form.payment_method" class="form-select">
          <option value="" disabled>انتخاب روش</option>
          <option v-for="p in paymentMethods" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">آدرس مبدا</label>
        <input v-model="form.pickup_address" type="text" class="form-control" placeholder="آدرس مبدا" />
      </div>
      <div class="col-md-6">
        <label class="form-label">آدرس مقصد</label>
        <input v-model="form.dropoff_address" type="text" class="form-control" placeholder="آدرس مقصد" />
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-4">
        <label class="form-label">زمان شروع</label>
        <input v-model="form.started_at" type="datetime-local" class="form-control" />
      </div>
      <div class="col-md-4">
        <label class="form-label">زمان اتمام</label>
        <input v-model="form.completed_at" type="datetime-local" class="form-control" />
      </div>
      <div class="col-md-4">
        <label class="form-label">زمان لغو</label>
        <input v-model="form.cancelled_at" type="datetime-local" class="form-control" />
      </div>
    </div>
    <div class="d-flex justify-content-end">
      <button type="submit" class="btn btn-primary">ذخیره</button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from '#app';

definePageMeta({ layout: 'admin' });
useHead({ title: 'پویش تاکسی | افزودن سفر جدید' });

const router = useRouter();

const users = ref([]);
const drivers = ref([]);

const rideTypes = ['normal', 'intercity', 'shared', 'scheduled', 'airport'];
const carClasses = ['eco', 'economy', 'comfort', 'premium', 'van', 'motorcycle', 'tuk_tuk'];
const rideStatuses = ['pending', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress', 'completed', 'cancelled', 'expired'];
const paymentMethods = ['cash', 'card', 'wallet', 'gateway'];

const form = ref({
  passenger_id: '',
  driver_id: '',
  ride_type: 'pending',
  car_class: 'economy',
  status: 'pending',
  fare: 0,
  distance_km: 0,
  duration_minutes: 0,
  payment_method: 'cash',
  payment_status: 'pending',
  pickup_address: '',
  dropoff_address: '',
  started_at: '',
  completed_at: '',
  cancelled_at: ''
});

async function loadUsers() {
  const res = await fetch('/api/users?limit=1000');
  const data = await res.json();
  users.value = data.users || [];
}

async function loadDrivers() {
  const res = await fetch('/api/drivers?limit=1000');
  const data = await res.json();
  drivers.value = data.drivers || [];
}

onMounted(() => {
  loadUsers();
  loadDrivers();
});

async function onSubmit() {
  const payload = { ...form.value };
  // Convert empty strings to null for optional fields
  Object.keys(payload).forEach(k => {
    if (payload[k] === '' || payload[k] === undefined) payload[k] = null;
  });
  const res = await fetch('/api/rides', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    const created = await res.json();
    alert('سفر ثبت شد! ID: ' + created.id);
    router.push('/admin/rides');
  } else {
    const err = await res.json();
    alert('خطا: ' + (err.error || 'خطای سرور'));
  }
}
</script>

<style scoped>
/* No custom styles – rely on admin layout */
</style>
