<template>
  <div class="search-select" ref="selectRef">
    <div class="form-control search-select-input" @click="toggleDropdown">
      <span v-if="selectedLabel" class="selected-text">{{ selectedLabel }}</span>
      <span v-else class="placeholder-text">{{ placeholder }}</span>
      <i class="ti ti-chevron-down ms-auto"></i>
    </div>

    <div v-if="isOpen" class="search-select-dropdown">
      <div class="search-input-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control form-control-sm"
          placeholder="جستجو..."
          @input="filterOptions"
          ref="searchInput"
        />
      </div>
      <div class="options-list">
        <div v-if="filteredOptions.length === 0" class="no-results">نتیجه‌ای یافت نشد</div>
        <div
          v-for="option in filteredOptions"
          :key="option.value"
          class="option-item"
          :class="{ 'selected': option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'انتخاب کنید...' },
  searchable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue'])

const selectRef = ref(null)
const searchInput = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? selected.label : ''
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(query)
  )
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    nextTick(() => {
      if (searchInput.value) searchInput.value.focus()
    })
  }
}

function selectOption(option) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function filterOptions() {
  // Filtering is handled by computed
}

function handleClickOutside(event) {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-select {
  position: relative;
}
.search-select-input {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.selected-text {
  color: #212529;
}
.placeholder-text {
  color: #6c757d;
}
.search-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  margin-top: 4px;
  max-height: 300px;
  overflow: hidden;
}
.search-input-wrapper {
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
}
.options-list {
  max-height: 240px;
  overflow-y: auto;
}
.option-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.option-item:hover {
  background: #f8f9fa;
}
.option-item.selected {
  background: #e9ecef;
  color: #0d6efd;
  font-weight: 500;
}
.no-results {
  padding: 12px;
  text-align: center;
  color: #6c757d;
}
</style>
