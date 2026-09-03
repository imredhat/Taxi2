<template>
  <div>
    <!-- هدر -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="f-w-600 text-dark">{{ isEdit ? 'ویرایش راننده' : 'افزودن راننده جدید' }}</h4>
            <p class="text-secondary mb-0">{{ isEdit ? 'اطلاعات راننده را ویرایش کنید.' : 'اطلاعات کامل راننده را وارد کنید. موارد ستاره‌دار (*) الزامی هستند.' }}</p>
          </div>
          <button class="btn btn-outline-secondary b-r-22" @click="goBack">
            <i class="ti ti-arrow-right me-1"></i>بازگشت
          </button>
        </div>
      </div>
    </div>

    <!-- پیام موفقیت -->
    <div v-if="successMsg" class="row mb-3">
      <div class="col-12">
        <div class="alert alert-success d-flex align-items-center" role="alert">
          <i class="ti ti-circle-check me-2 f-s-20"></i>
          <div class="flex-grow-1">{{ successMsg }}</div>
          <button class="btn btn-sm btn-outline-success ms-2" @click="resetForm">افزودن راننده دیگر</button>
          <button class="btn btn-sm btn-success ms-1" @click="goBack">بازگشت به لیست</button>
        </div>
      </div>
    </div>

    <form v-if="!successMsg" @submit.prevent="onSubmit">
      <!-- بخش ۱: اطلاعات حساب کاربری -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0 f-w-600"><i class="ti ti-user me-2 text-primary"></i>اطلاعات حساب کاربری</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">شماره تلفن *</label>
                  <input v-model="form.phone" class="form-control" placeholder="مثال: 09123456789" dir="ltr" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">رمز عبور {{ isEdit ? '' : '*' }}</label>
                  <input v-model="form.password" class="form-control" type="password" :placeholder="isEdit ? 'برای تغییر رمز وارد کنید' : 'حداقل ۴ کاراکتر'" :required="!isEdit" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">کد ملی</label>
                  <input v-model="form.national_id" class="form-control" placeholder="۱۰ رقم" dir="ltr" maxlength="10" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">نام</label>
                  <input v-model="form.first_name" class="form-control" placeholder="نام راننده" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">نام خانوادگی</label>
                  <input v-model="form.last_name" class="form-control" placeholder="نام خانوادگی" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">ایمیل</label>
                  <input v-model="form.email" class="form-control" type="email" placeholder="email@example.com" dir="ltr" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">جنسیت</label>
                  <select v-model="form.gender" class="form-select">
                    <option value="">انتخاب کنید...</option>
                    <option value="مرد">مرد</option>
                    <option value="زن">زن</option>
                    <option value="other">سایر</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">تاریخ تولد</label>
                  <ClientOnly><CommonPersianDatePicker v-model="form.birth_date" placeholder="تاریخ تولد" /></ClientOnly>
                </div>
                <div class="col-md-4">
                  <label class="form-label">موبایل ۱</label>
                  <input v-model="form.mobile" class="form-control" placeholder="موبایل" dir="ltr" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">موبایل ۲</label>
                  <input v-model="form.mobile_2" class="form-control" placeholder="موبایل" dir="ltr" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تلفن منزل</label>
                  <input v-model="form.landline" class="form-control" placeholder="021XXXXXXXXX" dir="ltr" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">میزان تحصیلات</label>
                  <select v-model="form.education_level" class="form-select">
                    <option value="بدون تحصیلات">بدون تحصیلات</option>
                    <option value="سیکل">سیکل</option>
                    <option value="دیپلم">دیپلم</option>
                    <option value="کاردانی">کاردانی</option>
                    <option value="کارشناسی">کارشناسی</option>
                    <option value="کارشناسی ارشد">کارشناسی ارشد</option>
                    <option value="دکترا">دکترا</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">زبان خارجی</label>
                  <input v-model="form.foreign_language" class="form-control" placeholder="زبان خارجی" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">میزان آشنایی با زبان خارجه</label>
                  <select v-model="form.foreign_language_proficiency" class="form-select">
                    <option value="-">-</option>
                    <option value="مبتدی">مبتدی</option>
                    <option value="متوسط">متوسط</option>
                    <option value="پیشرفته">پیشرفته</option>
                    <option value="مسلط">مسلط</option>
                  </select>
                </div>
                <div class="col-md-8">
                  <label class="form-label">آدرس</label>
                  <input v-model="form.address" class="form-control" placeholder="آدرس" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">کد پستی</label>
                  <input v-model="form.postal_code" class="form-control" placeholder="کد پستی" dir="ltr" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش ۲: گواهینامه و بیمه -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0 f-w-600"><i class="ti ti-id-badge-2 me-2 text-primary"></i>گواهینامه و بیمه</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">شماره گواهینامه</label>
                  <input v-model="form.license_number" class="form-control" placeholder="شماره گواهینامه رانندگی" dir="ltr" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تاریخ انقضای گواهینامه</label>
                  <ClientOnly><CommonPersianDatePicker v-model="form.license_expiry" placeholder="تاریخ انقضا" /></ClientOnly>
                </div>
                <div class="col-md-4">
                  <label class="form-label">شماره بیمه</label>
                  <input v-model="form.insurance_number" class="form-control" placeholder="شماره بیمه شخص ثالث" dir="ltr" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تاریخ انقضای بیمه</label>
                  <ClientOnly><CommonPersianDatePicker v-model="form.insurance_expiry" placeholder="تاریخ انقضا" /></ClientOnly>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش ۳: اطلاعات بانکی -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0 f-w-600"><i class="ti ti-credit-card me-2 text-primary"></i>اطلاعات بانکی</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">نام بانک</label>
                  <input v-model="form.bank_name" class="form-control" placeholder="مثال: بانک ملت" list="bank-list" />
                  <datalist id="bank-list">
                    <option v-for="b in bankList" :key="b" :value="b"></option>
                  </datalist>
                </div>
                <div class="col-md-4">
                  <label class="form-label">شماره شبا / حساب</label>
                  <input v-model="form.bank_account_number" class="form-control" placeholder="شماره حساب یا شبا" dir="ltr" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">شماره کارت</label>
                  <input v-model="form.bank_card_number" class="form-control" placeholder="۱۶ رقم" dir="ltr" maxlength="19" />
                </div>
                <div class="col-md-12">
                  <label class="form-label">نام صاحب حساب</label>
                  <input v-model="form.bank_account_holder" class="form-control" placeholder="نام و نام خانوادگی صاحب حساب" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">شماره شبا</label>
                  <input v-model="form.iban" class="form-control" placeholder="با IR بنویسید" dir="ltr" />
                </div>
                <div class="col-md-12">
                  <label class="form-label">یادداشت</label>
                  <textarea v-model="form.notes" class="form-control" placeholder="یادداشت..." rows="3"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش ۴: وضعیت و تأیید -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0 f-w-600"><i class="ti ti-settings me-2 text-primary"></i>وضعیت و تأیید</h6>
            </div>
            <div class="card-body">
              <div class="row g-3 align-items-center">
                <div class="col-md-4">
                  <label class="form-label">وضعیت اولیه</label>
                  <select v-model="form.status" class="form-select">
                    <option value="offline">آفلاین</option>
                    <option value="online">آنلاین</option>
                    <option value="busy">در سفر</option>
                    <option value="break">استراحت</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <div class="form-check mt-4">
                    <input class="form-check-input" type="checkbox" id="is_verified" v-model="form.is_verified" />
                    <label class="form-check-label" for="is_verified">راننده تأیید شده است</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-check mt-4">
                    <input class="form-check-input" type="checkbox" id="training_completed" v-model="form.training_completed" />
                    <label class="form-check-label" for="training_completed">آموزش‌ها تکمیل شده</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش ۵: اطلاعات خودرو -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0 f-w-600"><i class="ti ti-car me-2 text-primary"></i>اطلاعات خودرو</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">پلاک خودرو</label>
                  <div class="d-flex gap-1 align-items-end">
                    <input v-model="form.plate_part1" class="form-control text-center" placeholder="--" dir="ltr" style="max-width: 50px; letter-spacing: 2px;" />
                    <select v-model="form.plate_letter" class="form-select text-center" style="max-width: 70px;">
                      <option v-for="letter in plateLetters" :key="letter" :value="letter">{{ letter }}</option>
                    </select>
                    <input v-model="form.plate_part2" class="form-control text-center" placeholder="---" dir="ltr" style="max-width: 60px; letter-spacing: 3px;" />
                    <span class="fw-bold fs-5 mx-1">ایران</span>
                    <input v-model="form.plate_part3" class="form-control text-center" placeholder="--" dir="ltr" style="max-width: 50px; letter-spacing: 2px;" />
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">نام مالک خودرو</label>
                  <input v-model="form.owner" class="form-control" placeholder="نام مالک" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">برند خودرو</label>
                  <select v-model="form.brand" class="form-select">
                    <option disabled selected value="">انتخاب کنید...</option>
                    <option v-for="b in carBrandsList" :key="b" :value="b">{{ b }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">تیپ خودرو</label>
                  <select v-model="form.car_type" class="form-select">
                    <option disabled selected value="">انتخاب کنید...</option>
                    <option v-for="m in carModelsList" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">سال ساخت</label>
                  <input v-model="form.year" class="form-control" placeholder="سال ساخت" dir="ltr" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">رنگ خودرو</label>
                  <input v-model="form.color" class="form-control" placeholder="رنگ خودرو" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">نوع سوخت</label>
                  <select v-model="form.fuel_type" class="form-select">
                    <option value="بنزینی">بنزینی</option>
                    <option value="گاز سوز">گاز سوز</option>
                    <option value="گازوئیل">گازوئیل</option>
                    <option value="دوگانه سوز">دوگانه سوز</option>
                    <option value="هیبریدی">هیبریدی</option>
                    <option value="برقی">برقی</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">شناسه VIN</label>
                  <input v-model="form.vin" class="form-control" placeholder="شناسه VIN" dir="ltr" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">تاریخ اعتبار بیمه</label>
                  <ClientOnly><CommonPersianDatePicker v-model="form.insurance_expiry_date" placeholder="تاریخ اعتبار بیمه" /></ClientOnly>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش ۶: اسکن مدارک -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0 f-w-600"><i class="ti ti-file me-2 text-primary"></i>اسکن مدارک</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">تصویر سلفی از چهره</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'ax')" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تصویر کارت ملی</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'scan_melli')" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تصویر گواهینامه</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'scan_govahiname')" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تصویر کارت ماشین</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'scan_car_card')" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تصویر پشت کارت ماشین</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'scan_car_card_back')" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تصویر برگه بیمه</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'scan_insurance')" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تصویر الحاقیه برگه بیمه</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'scan_insurance_Addendum')" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تصویر گواهی عدم سوء پیشینه</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'scan_so_pishineh')" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">تصویر گواهی سلامت</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'scan_salamat')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش ۷: تصاویر خودرو -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0 f-w-600"><i class="ti ti-camera me-2 text-primary"></i>تصاویر خودرو</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">تصویر جلوی خودرو</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'pic_front')" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">تصویر پشت خودرو</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'pic_back')" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">تصویر داخلی جلو</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'pic_in_front')" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">تصویر داخلی پشت</label>
                  <input type="file" class="form-control" accept="image/*" @change="e => handleFile(e, 'pic_in_back')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- خطا -->
      <div v-if="errorMsg" class="row mb-3">
        <div class="col-12">
          <div class="alert alert-danger d-flex align-items-center">
            <i class="ti ti-alert-circle me-2 f-s-20"></i>
            <div>{{ errorMsg }}</div>
          </div>
        </div>
      </div>

      <!-- دکمه‌ها -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary b-r-22" @click="goBack" :disabled="loading">انصراف</button>
            <button type="submit" class="btn btn-success b-r-22" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="ti ti-check me-1"></i>
              {{ loading ? 'در حال ذخیره...' : (isEdit ? 'بروزرسانی' : 'ذخیره راننده') }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const route = useRoute()
const { apiFetch, errorMessage: apiErrorMessage } = useApi()

const editId = computed(() => route.query.id || null)
const isEdit = computed(() => !!editId.value)

useHead({
  title: computed(() => isEdit.value ? 'پویش تاکسی | ویرایش راننده' : 'پویش تاکسی | افزودن راننده'),
  meta: [{ name: 'description', content: computed(() => isEdit.value ? 'ویرایش راننده' : 'فرم افزودن راننده جدید') }]
})

const plateLetters = ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'د', 'ز', 'س', 'ش', 'ص', 'ط', 'ع', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی', 'معلولین', 'تشریفات']

const carBrandsList = ref([])

const bankList = [
  'بانک ملی', 'بانک سپه', 'بانک تجارت', 'بانک ملت', 'بانک صادرات',
  'بانک کشاورزی', 'بانک مسکن', 'بانک رفاه', 'بانک پارسیان', 'بانک پاسارگاد',
  'بانک سامان', 'بانک آینده', 'بانک اقتصاد نوین', 'بانک دی', 'بانک سرمایه'
]

function emptyForm() {
  return {
    phone: '', password: '', national_id: '',
    first_name: '', last_name: '', email: '',
    gender: 'مرد', birth_date: '',
    mobile: '', mobile_2: '', landline: '',
    education_level: 'بدون تحصیلات', foreign_language: '', foreign_language_proficiency: '-',
    address: '', postal_code: '',
    license_number: '', license_expiry: '',
    insurance_number: '', insurance_expiry: '',
    bank_name: '', bank_account_number: '', bank_card_number: '', bank_account_holder: '',
    iban: '', notes: '',
    plate_part1: '', plate_part2: '', plate_letter: 'ب', plate_part3: '',
    owner: '', brand: '', car_type: '', year: '', color: '',
    fuel_type: 'بنزینی', vin: '', insurance_expiry_date: '',
    status: 'offline', is_verified: false, training_completed: false,
    ax: null, scan_melli: null, scan_govahiname: null,
    scan_car_card: null, scan_car_card_back: null, scan_insurance: null,
    scan_insurance_Addendum: null, scan_so_pishineh: null, scan_salamat: null,
    pic_front: null, pic_back: null, pic_in_front: null, pic_in_back: null
  }
}

const form = ref(emptyForm())
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const carModelsList = ref([])

watch(() => form.value.brand, async (newBrand) => {
  if (!newBrand) { carModelsList.value = []; return }
  try {
    const res = await apiFetch('/api/car-models?limit=1000')
    const data = await res.json()
    const models = data.models || []
    carModelsList.value = models
      .filter(m => m.brand_name === newBrand || m.brand_name_fa === newBrand)
      .map(m => m.name_fa || m.name)
  } catch (err) { console.error(err) }
})

function goBack() { navigateTo('/admin/driver/profiles') }

function handleFile(e, fieldName) {
  form.value[fieldName] = e.target.files[0] || null
}

function resetForm() {
  form.value = emptyForm()
  errorMsg.value = ''
  successMsg.value = ''
}

function validate() {
  const f = form.value
  if (!f.phone) { errorMsg.value = 'شماره تلفن الزامی است'; return false }
  if (!isEdit.value) {
    if (!f.password) { errorMsg.value = 'رمز عبور الزامی است'; return false }
    if (f.password.length < 4) { errorMsg.value = 'رمز عبور حداقل ۴ کاراکتر است'; return false }
  }
  if (!/^09\d{9}$/.test(f.phone)) { errorMsg.value = 'شماره تلفن باید با ۰۹ شروع و ۱۱ رقم باشد'; return false }
  if (f.national_id && !/^\d{10}$/.test(f.national_id)) { errorMsg.value = 'کد ملی باید ۱۰ رقم باشد'; return false }
  if (f.bank_card_number && f.bank_card_number.replace(/\D/g, '').length !== 16) { errorMsg.value = 'شماره کارت باید ۱۶ رقم باشد'; return false }
  return true
}

async function fetchDriver() {
  if (!editId.value) return
  loading.value = true
  try {
    const res = await apiFetch(`/api/driver-profiles/${editId.value}`)
    const data = await res.json()
    if (!res.ok) { errorMsg.value = data.error || 'خطا'; return }
    const revGender = { male: 'مرد', female: 'زن', other: 'سایر' }
    Object.keys(form.value).forEach(k => {
      if (k === 'gender') { form.value.gender = revGender[data.gender] || data.gender || 'مرد' }
      else if (k === 'password') { form.value.password = '' }
      else if (k === 'national_id') { form.value.national_id = data.national_code || '' }
      else if (k.endsWith('_part1') || k.endsWith('_part2') || k.endsWith('_part3')) { }
      else if (data[k] !== undefined && data[k] !== null && typeof data[k] !== 'object') {
        form.value[k] = data[k]
      }
    })
  } catch (err) { errorMsg.value = apiErrorMessage(err) }
  finally { loading.value = false }
}

async function onSubmit() {
  errorMsg.value = ''
  if (!validate()) return

  loading.value = true
  try {
    if (isEdit.value) {
      const payload = {}
      Object.keys(form.value).forEach(k => {
        if (k === 'password' && !form.value[k]) return
        if (form.value[k] !== null && form.value[k] !== '' && typeof form.value[k] !== 'object') {
          payload[k] = form.value[k]
        }
      })
      const res = await apiFetch(`/api/driver-profiles/${editId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { errorMsg.value = data.error || 'خطا'; return }
      successMsg.value = 'راننده با موفقیت بروزرسانی شد.'
    } else {
      const formData = new FormData()
      Object.keys(form.value).forEach(key => {
        if (form.value[key] !== null && form.value[key] !== '') {
          formData.append(key, form.value[key])
        }
      })
      const res = await apiFetch('/api/driver-profiles', { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { errorMsg.value = data.error || 'خطا'; return }
      successMsg.value = `راننده ${form.value.first_name || ''} ${form.value.last_name || ''} با شماره ${form.value.phone} با موفقیت ثبت شد.`
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) { errorMsg.value = apiErrorMessage(err) }
  finally { loading.value = false }
}

async function fetchBrands() {
  try {
    const res = await apiFetch('/api/car-brands?limit=1000')
    const data = await res.json()
    carBrandsList.value = (data.brands || []).map(b => b.name_fa || b.name)
  } catch (err) { console.error(err) }
}

onMounted(() => { fetchBrands(); if (isEdit.value) fetchDriver() })
</script>
