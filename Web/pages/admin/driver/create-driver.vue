<template>
  <div class="container-fluid mt-3">
    <!-- Header -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">فرم ثبت راننده جدید</h4>
            <p class="text-secondary mb-0">لطفاً تمام فیلدهای الزامی را پر کنید</p>
          </div>
          <div>
            <button class="btn btn-outline-secondary b-r-22" @click="goBack">
              <i class="ti ti-arrow-left me-1"></i>بازگشت
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Steps -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-center">
          <div class="step-progress">
            <div 
              v-for="(s, index) in steps" 
              :key="index" 
              class="step" 
              :class="{ active: currentStep === index + 1, completed: currentStep > index + 1 }"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-label">{{ s }}</div>
            </div>
            <div class="progress-bar" :style="{ width: progressWidth }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: Personal Information -->
    <div v-if="currentStep === 1" class="card mb-4">
      <div class="card-body">
        <h5 class="f-w-600 mb-3">
          <i class="ti ti-user me-2"></i>اطلاعات شخصی
        </h5>
        
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">نام <span class="text-danger">*</span></label>
            <input 
              v-model="form.first_name" 
              class="form-control" 
              placeholder="نام خود را وارد کنید"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">نام خانوادگی <span class="text-danger">*</span></label>
            <input 
              v-model="form.last_name" 
              class="form-control" 
              placeholder="نام خانوادگی خود را وارد کنید"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">کد ملی <span class="text-danger">*</span></label>
            <input 
              v-model="form.national_code" 
              class="form-control" 
              placeholder="کد ملی 10 رقمی"
              maxlength="10"
              required
            />
          </div>
          
          <div class="col-md-4">
            <label class="form-label">شماره تلفن <span class="text-danger">*</span></label>
            <input 
              v-model="form.phone" 
              class="form-control" 
              placeholder="09XXXXXXXXX"
              dir="ltr"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">رمز عبور <span class="text-danger">*</span></label>
            <input 
              v-model="form.password" 
              type="password" 
              class="form-control" 
              placeholder="رمز عبور"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">تکرار رمز عبور <span class="text-danger">*</span></label>
            <input 
              v-model="form.confirm_password" 
              type="password" 
              class="form-control" 
              placeholder="تکرار رمز عبور"
              required
            />
          </div>
          
          <div class="col-md-4">
            <label class="form-label">تاریخ تولد</label>
            <input 
              v-model="form.birth_date" 
              type="date" 
              class="form-control" 
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">جنسیت</label>
            <select v-model="form.gender" class="form-select">
              <option value="">انتخاب کنید</option>
              <option value="male">مرد</option>
              <option value="female">زن</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">وضعیت تاهل</label>
            <select v-model="form.marital_status" class="form-select">
              <option value="">انتخاب کنید</option>
              <option value="single">مجرد</option>
              <option value="married">متاهل</option>
            </select>
          </div>
          
          <div class="col-12">
            <label class="form-label">آدرس</label>
            <textarea 
              v-model="form.address" 
              class="form-control" 
              rows="2" 
              placeholder="آدرس کامل خود را وارد کنید"
            ></textarea>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-secondary b-r-22" @click="goBack">
            <i class="ti ti-x me-1"></i>انصراف
          </button>
            <button 
            class="btn btn-primary b-r-22" 
            @click="nextStep" 
            :disabled="!validateStep1"
          >
            <i class="ti ti-arrow-left me-1"></i>مرحله بعدی
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Driver License & Documents -->
    <div v-if="currentStep === 2" class="card mb-4">
      <div class="card-body">
        <h5 class="f-w-600 mb-3">
          <i class="ti ti-file-text me-2"></i>مدارک رانندگی
        </h5>
        
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">شماره گواهینامه <span class="text-danger">*</span></label>
            <input 
              v-model="form.license_number" 
              class="form-control" 
              placeholder="شماره گواهینامه"
              dir="ltr"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">تاریخ صدور گواهینامه</label>
            <input 
              v-model="form.license_issue_date" 
              type="date" 
              class="form-control" 
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">تاریخ انقضا گواهینامه</label>
            <input 
              v-model="form.license_expiry_date" 
              type="date" 
              class="form-control" 
            />
          </div>
          
          <div class="col-md-4">
            <label class="form-label">نوع گواهینامه</label>
            <select v-model="form.license_type" class="form-select">
              <option value="">انتخاب کنید</option>
              <option value="1">پایه 1 (سنگین)</option>
              <option value="2">پایه 2 (نیمه سنگین)</option>
              <option value="3">پایه 3 (عادی)</option>
              <option value="motorcycle">موتور سیکلت</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">کلاس گواهینامه</label>
            <select v-model="form.license_class" class="form-select">
              <option value="">انتخاب کنید</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">شهر صدور گواهینامه</label>
            <input 
              v-model="form.license_issue_city" 
              class="form-control" 
              placeholder="شهر صدور"
            />
          </div>
          
          <div class="col-12">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="f-w-600 mb-3">بارگذاری مدارک</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">عکس گواهینامه (جلو)</label>
                    <input type="file" class="form-control" @change="handleFileUpload($event, 'license_front')" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">عکس گواهینامه (عقب)</label>
                    <input type="file" class="form-control" @change="handleFileUpload($event, 'license_back')" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">عکس کارت ملی (جلو)</label>
                    <input type="file" class="form-control" @change="handleFileUpload($event, 'national_card_front')" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">عکس کارت ملی (عقب)</label>
                    <input type="file" class="form-control" @change="handleFileUpload($event, 'national_card_back')" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">عکس پرسنلی</label>
                    <input type="file" class="form-control" @change="handleFileUpload($event, 'profile_image')" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary b-r-22" @click="prevStep">
            <i class="ti ti-arrow-right me-1"></i>مرحله قبل
          </button>
          <button 
            class="btn btn-primary b-r-22" 
            @click="nextStep" 
            :disabled="!validateStep2"
          >
            <i class="ti ti-arrow-left me-1"></i>مرحله بعدی
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Bank Information -->
    <div v-if="currentStep === 3" class="card mb-4">
      <div class="card-body">
        <h5 class="f-w-600 mb-3">
          <i class="ti ti-credit-card me-2"></i>معلومات بانکی
        </h5>
        
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">نام بانک <span class="text-danger">*</span></label>
            <select v-model="form.bank_name" class="form-select" required>
              <option value="">انتخاب بانک</option>
              <option value="mellat">ملت</option>
              <option value="tejarat">تجارت</option>
              <option value="saderat">صادرات</option>
              <option value="refah">رفاه</option>
              <option value="maskan">مسکن</option>
              <option value="sepah">سپه</option>
              <option value="keshavarzi">کشاورزی</option>
              <option value="sanat_madan">صنعت و معدن</option>
              <option value="post_bank">پست بانک</option>
              <option value="tosee">توسعه</option>
              <option value="other">سایر</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">شماره حساب <span class="text-danger">*</span></label>
            <input 
              v-model="form.account_number" 
              class="form-control" 
              placeholder="شماره حساب"
              dir="ltr"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">شماره کارت <span class="text-danger">*</span></label>
            <input 
              v-model="form.card_number" 
              class="form-control" 
              placeholder="16 رقم کارت"
              dir="ltr"
              maxlength="16"
              required
            />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">شماره شبا</label>
            <input 
              v-model="form.sheba_number" 
              class="form-control" 
              placeholder="IRXXXXXXXXXXXXXXXXXXXXXX"
              dir="ltr"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">نام صاحب حساب</label>
            <input 
              v-model="form.account_owner_name" 
              class="form-control" 
              placeholder="نام صاحب حساب"
            />
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary b-r-22" @click="prevStep">
            <i class="ti ti-arrow-right me-1"></i>مرحله قبل
          </button>
          <button 
            class="btn btn-primary b-r-22" 
            @click="nextStep" 
            :disabled="!validateStep3"
          >
            <i class="ti ti-arrow-left me-1"></i>مرحله بعدی
          </button>
        </div>
      </div>
    </div>

    <!-- Step 4: Vehicle Information -->
    <div v-if="currentStep === 4" class="card mb-4">
      <div class="card-body">
        <h5 class="f-w-600 mb-3">
          <i class="ti ti-car me-2"></i>معلومات خودرو
        </h5>
        
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">نوع خودرو</label>
            <select v-model="form.vehicle_type" class="form-select">
              <option value="">انتخاب کنید</option>
              <option value="sedan">سدان</option>
              <option value="hatchback">هاچبک</option>
              <option value="suv">شاسی بلند</option>
              <option value="van">ون</option>
              <option value="station_wagon">استیشن واگن</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">برند خودرو</label>
            <input 
              v-model="form.vehicle_brand" 
              class="form-control" 
              placeholder="برند خودرو"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">مدل خودرو</label>
            <input 
              v-model="form.vehicle_model" 
              class="form-control" 
              placeholder="مدل خودرو"
            />
          </div>
          
          <div class="col-md-4">
            <label class="form-label">سال ساخت</label>
            <input 
              v-model="form.vehicle_year" 
              type="number" 
              class="form-control" 
              placeholder="سال ساخت"
              min="1300"
              max="1450"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">رنگ خودرو</label>
            <input 
              v-model="form.vehicle_color" 
              class="form-control" 
              placeholder="رنگ خودرو"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">پلاک خودرو</label>
            <input 
              v-model="form.vehicle_plate" 
              class="form-control" 
              placeholder="پلاک خودرو"
              dir="ltr"
            />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">کلاس خودرو</label>
            <select v-model="form.vehicle_class" class="form-select">
              <option value="">انتخاب کنید</option>
              <option value="eco">اقتصادی</option>
              <option value="economy">اکونومی</option>
              <option value="comfort">کامفورت</option>
              <option value="premium">پریمیوم</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">تعداد صندلی</label>
            <input 
              v-model="form.vehicle_seats" 
              type="number" 
              class="form-control" 
              placeholder="تعداد صندلی"
              min="1"
              max="20"
            />
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary b-r-22" @click="prevStep">
            <i class="ti ti-arrow-right me-1"></i>مرحله قبل
          </button>
          <button 
            class="btn btn-primary b-r-22" 
            @click="nextStep" 
            :disabled="!validateStep2"
          >
            <i class="ti ti-arrow-left me-1"></i>مرحله بعدی
          </button>
        </div>
      </div>
    </div>

    <!-- Step 5: Review & Submit -->
    <div v-if="currentStep === 5" class="card mb-4">
      <div class="card-body">
        <h5 class="f-w-600 mb-3">
          <i class="ti ti-check me-2"></i>بررسی و تایید اطلاعات
        </h5>
        
        <div class="alert alert-info mb-4">
          <i class="ti ti-info-circle me-2"></i>
          لطفاً اطلاعات وارد شده را بررسی کرده و در صورت صحت، دکمه ثبت نهایی را بزنید.
        </div>

        <!-- Summary Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">اطلاعات شخصی</h6>
              </div>
              <div class="card-body">
                <p><strong>نام:</strong> {{ form.first_name }} {{ form.last_name }}</p>
                <p><strong>تلفن:</strong> {{ form.phone }}</p>
                <p><strong>کد ملی:</strong> {{ form.national_code }}</p>
                <p><strong>آدرس:</strong> {{ form.address || '—' }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-header bg-success text-white">
                <h6 class="mb-0">مدارک رانندگی</h6>
              </div>
              <div class="card-body">
                <p><strong>شماره گواهینامه:</strong> {{ form.license_number }}</p>
                <p><strong>نوع گواهینامه:</strong> {{ licenseTypeLabel }}</p>
                <p><strong>تاریخ صدور:</strong> {{ form.license_issue_date || '—' }}</p>
                <p><strong>تاریخ انقضا:</strong> {{ form.license_expiry_date || '—' }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-header bg-warning text-dark">
                <h6 class="mb-0">معلومات بانکی</h6>
              </div>
              <div class="card-body">
                <p><strong>بانک:</strong> {{ bankNameLabel }}</p>
                <p><strong>شماره حساب:</strong> {{ form.account_number }}</p>
                <p><strong>شماره کارت:</strong> {{ form.card_number }}</p>
                <p><strong>شبا:</strong> {{ form.sheba_number || '—' }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-header bg-info text-white">
                <h6 class="mb-0">معلومات خودرو</h6>
              </div>
              <div class="card-body">
                <p><strong>نوع خودرو:</strong> {{ vehicleTypeLabel }}</p>
                <p><strong>برند:</strong> {{ form.vehicle_brand || '—' }}</p>
                <p><strong>مدل:</strong> {{ form.vehicle_model || '—' }}</p>
                <p><strong>پلاک:</strong> {{ form.vehicle_plate || '—' }}</p>
                <p><strong>کلاس:</strong> {{ vehicleClassLabel }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary b-r-22" @click="prevStep">
            <i class="ti ti-arrow-right me-1"></i>مرحله قبل
          </button>
          <button 
            class="btn btn-primary b-r-22" 
            @click="nextStep" 
            :disabled="!validateStep3"
          >
            <i class="ti ti-arrow-left me-1"></i>مرحله بعدی
          </button>
        </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="ti ti-check me-2"></i>ثبت موفق
            </h5>
          </div>
          <div class="modal-body text-center py-5">
            <div class="mb-4">
              <i class="ti ti-circle-check text-success f-s-72"></i>
            </div>
            <h4>راننده جدید با موفقیت ثبت شد!</h4>
            <p class="text-secondary">
              اطلاعات راننده ذخیره شده و می‌توانید آن را در لیست رانندگان مشاهده کنید.
            </p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-success b-r-22" @click="goToDriversList">
              <i class="ti ti-list me-1"></i>مشاهده لیست رانندگان
            </button>
            <button class="btn btn-outline-secondary b-r-22 ms-2" @click="resetForm">
              <i class="ti ti-plus me-1"></i>افزودن راننده دیگر
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from '#app'

const router = useRouter()

// Steps
const steps = ref([
  'اطلاعات شخصی',
  'مدارک رانندگی',
  'معلومات بانکی',
  'معلومات خودرو',
  'بررسی و تایید'
])

const currentStep = ref(1)
const submitting = ref(false)
const showSuccess = ref(false)

// Form data
const form = ref({
  // Personal Info
  first_name: '',
  last_name: '',
  national_code: '',
  phone: '',
  password: '',
  confirm_password: '',
  birth_date: '',
  gender: '',
  marital_status: '',
  address: '',
  
  // License Info
  license_number: '',
  license_issue_date: '',
  license_expiry_date: '',
  license_type: '',
  license_class: '',
  license_issue_city: '',
  
  // Bank Info
  bank_name: '',
  account_number: '',
  card_number: '',
  sheba_number: '',
  account_owner_name: '',
  
  // Vehicle Info
  vehicle_type: '',
  vehicle_brand: '',
  vehicle_model: '',
  vehicle_year: '',
  vehicle_color: '',
  vehicle_plate: '',
  vehicle_class: '',
  vehicle_seats: '',
  
  // Files
  files: {}
})

// Computed properties
const progressWidth = computed(() => {
  return `${((currentStep.value - 1) / (steps.value.length - 1)) * 100}%`
})

const validateStep1 = computed(() => {
  return form.value.first_name && 
         form.value.last_name && 
         form.value.national_code && 
         form.value.phone && 
         form.value.password && 
         form.value.confirm_password &&
         form.value.password === form.value.confirm_password
})

const validateStep2 = computed(() => {
  return form.value.license_number
})

const validateStep3 = computed(() => {
  return form.value.bank_name && 
         form.value.account_number && 
         form.value.card_number
})

const licenseTypeLabel = computed(() => {
  const types = {
    '1': 'پایه 1 (سنگین)',
    '2': 'پایه 2 (نیمه سنگین)',
    '3': 'پایه 3 (عادی)',
    'motorcycle': 'موتور سیکلت'
  }
  return types[form.value.license_type] || form.value.license_type || '—'
})

const bankNameLabel = computed(() => {
  const banks = {
    'mellat': 'ملت',
    'tejarat': 'تجارت',
    'saderat': 'صادرات',
    'refah': 'رفاه',
    'maskan': 'مسکن',
    'sepah': 'سپه',
    'keshavarzi': 'کشاورزی',
    'sanat_madan': 'صنعت و معدن',
    'post_bank': 'پست بانک',
    'tosee': 'توسعه',
    'other': 'سایر'
  }
  return banks[form.value.bank_name] || form.value.bank_name || '—'
})

const vehicleTypeLabel = computed(() => {
  const types = {
    'sedan': 'سدان',
    'hatchback': 'هاچبک',
    'suv': 'شاسی بلند',
    'van': 'ون',
    'station_wagon': 'استیشن واگن'
  }
  return types[form.value.vehicle_type] || form.value.vehicle_type || '—'
})

const vehicleClassLabel = computed(() => {
  const classes = {
    'eco': 'اقتصادی',
    'economy': 'اکونومی',
    'comfort': 'کامفورت',
    'premium': 'پریمیوم'
  }
  return classes[form.value.vehicle_class] || form.value.vehicle_class || '—'
})

// Methods
function handleFileUpload(event, field) {
  const file = event.target.files[0]
  if (file) {
    form.value.files[field] = file
  }
}

function nextStep() {
  // Validate current step before proceeding
  if (currentStep.value === 1 && !validateStep1.value) {
    alert('لطفاً تمام فیلدهای الزامی مرحله اول را پر کنید')
    return
  }
  if (currentStep.value === 2 && !validateStep2.value) {
    alert('لطفاً شماره گواهینامه را وارد کنید')
    return
  }
  if (currentStep.value === 3 && !validateStep3.value) {
    alert('لطفاً اطلاعات بانکی را کامل وارد کنید')
    return
  }
  
  if (currentStep.value < steps.value.length) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function goBack() {
  router.go(-1)
}

async function submitForm() {
  submitting.value = true
  
  try {
    // Prepare data for submission
    const submitData = {
      // Personal info
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      national_code: form.value.national_code,
      phone: form.value.phone,
      password: form.value.password,
      birth_date: form.value.birth_date,
      gender: form.value.gender,
      marital_status: form.value.marital_status,
      address: form.value.address,
      role: 'driver',
      
      // Driver profile info
      driver_profile: {
        license_number: form.value.license_number,
        license_issue_date: form.value.license_issue_date,
        license_expiry_date: form.value.license_expiry_date,
        license_type: form.value.license_type,
        license_class: form.value.license_class,
        license_issue_city: form.value.license_issue_city
      },
      
      // Bank info
      bank_info: {
        bank_name: form.value.bank_name,
        account_number: form.value.account_number,
        card_number: form.value.card_number,
        sheba_number: form.value.sheba_number,
        account_owner_name: form.value.account_owner_name
      },
      
      // Vehicle info
      vehicle_info: {
        type: form.value.vehicle_type,
        brand: form.value.vehicle_brand,
        model: form.value.vehicle_model,
        year: form.value.vehicle_year,
        color: form.value.vehicle_color,
        plate: form.value.vehicle_plate,
        class: form.value.vehicle_class,
        seats: form.value.vehicle_seats
      }
    }
    
    // Submit to API
    const response = await fetch('/api/drivers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submitData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'خطا در ثبت راننده')
    }
    
    // Show success
    showSuccess.value = true
    
  } catch (error) {
    alert('خطا در ثبت راننده: ' + error.message)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  currentStep.value = 1
  showSuccess.value = false
  form.value = {
    first_name: '',
    last_name: '',
    national_code: '',
    phone: '',
    password: '',
    confirm_password: '',
    birth_date: '',
    gender: '',
    marital_status: '',
    address: '',
    license_number: '',
    license_issue_date: '',
    license_expiry_date: '',
    license_type: '',
    license_class: '',
    license_issue_city: '',
    bank_name: '',
    account_number: '',
    card_number: '',
    sheba_number: '',
    account_owner_name: '',
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_color: '',
    vehicle_plate: '',
    vehicle_class: '',
    vehicle_seats: '',
    files: {}
  }
}

function goToDriversList() {
  router.push('/admin/driver-profiles')
}

// Page meta
definePageMeta({ layout: 'admin' })

useHead({
  title: 'افزودن راننده جدید | پویش تاکسی',
  meta: [
    { name: 'description', content: 'فرم کامل ثبت راننده جدید' }
  ]
})
</script>

<style scoped>
/* Step Progress */
.step-progress {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #0d6efd;
  color: white;
}

.step.completed .step-number {
  background: #198754;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
}

.step.active .step-label {
  color: #0d6efd;
  font-weight: 600;
}

.step.completed .step-label {
  color: #198754;
}

.progress-bar {
  position: absolute;
  top: 18px;
  left: 0;
  right: 0;
  height: 4px;
  background: #0d6efd;
  z-index: 1;
  transition: width 0.3s ease;
}

/* Modal backdrop */
.modal.fade.show {
  background: rgba(0, 0, 0, 0.5);
}

/* Card styling */
.card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Button styling */
.btn {
  min-width: 120px;
}

/* Responsive */
@media (max-width: 768px) {
  .step-label {
    display: none;
  }
  
  .step-number {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
  
  .progress-bar {
    top: 13px;
  }
}
</style>
