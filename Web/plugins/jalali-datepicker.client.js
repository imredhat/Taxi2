import VuePersianDatetimePicker from 'vue3-persian-datetime-picker'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('DatePicker', VuePersianDatetimePicker)
})
