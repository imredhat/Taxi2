<template>
  <div class="jalali-datepicker-wrapper">
    <DatePicker
      v-model="dateValue"
      :type="type"
      :format="format"
      :display-format="displayFormat"
      :placeholder="placeholder"
      :editable="false"
      :auto-submit="true"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'انتخاب تاریخ...' },
  type: { type: String, default: 'date' },
  format: { type: String, default: 'YYYY-MM-DD' },
  displayFormat: { type: String, default: 'jYYYY/jMM/jDD' }
})

const emit = defineEmits(['update:modelValue'])

const dateValue = computed({
  get() {
    return props.modelValue || ''
  },
  set(val) {
    emit('update:modelValue', val || '')
  }
})
</script>

<style>
.VPDatepicker .vpd-input-group input {
  border-radius: 0.375rem;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}
.VPDatepicker .vpd-toggle-btn {
  background: transparent;
  border: 1px solid #dee2e6;
  border-left: 0;
  border-radius: 0 0.375rem 0.375rem 0;
  padding: 0.375rem 0.75rem;
}
.VPDatepicker .vpd-toggle-btn:hover {
  background: #f8f9fa;
}
</style>
