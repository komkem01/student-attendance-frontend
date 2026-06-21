<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isDatePickerOpen = ref(false)
const isYearDropdownOpen = ref(false)
const isMonthDropdownOpen = ref(false)
const dpMonth = ref(new Date().getMonth())
const dpYear = ref(new Date().getFullYear())
const datepickerContainer = ref<HTMLElement | null>(null)

const currentYear = new Date().getFullYear()
const dpYears = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i)

const dpMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const dpWeekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const dpGridDays = computed(() => {
  const year = dpYear.value
  const month = dpMonth.value

  const firstDay = new Date(year, month, 1)
  const startDayOfWeek = firstDay.getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const prevMonthTotalDays = new Date(year, month, 0).getDate()

  const days = []

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    days.push({
      day: d,
      monthOffset: -1,
      isToday: false,
      isSelected: false,
      dateString: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const selectedStr = props.modelValue

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      day: d,
      monthOffset: 0,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
      dateString: dateStr
    })
  }

  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    days.push({
      day: d,
      monthOffset: 1,
      isToday: false,
      isSelected: false,
      dateString: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }

  return days
})

const selectDate = (dayItem: { day: number; monthOffset: number; dateString: string }) => {
  emit('update:modelValue', dayItem.dateString)

  const parts = dayItem.dateString.split('-').map(Number)
  if (parts.length === 3) {
    const y = parts[0]
    const m = parts[1]
    if (y !== undefined && m !== undefined) {
      dpYear.value = y
      dpMonth.value = m - 1
    }
  }

  isDatePickerOpen.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const parts = newVal.split('-')
    if (parts.length === 3) {
      const y = parseInt(parts[0] || '', 10)
      const m = parseInt(parts[1] || '', 10) - 1
      if (!isNaN(y) && !isNaN(m)) {
        dpYear.value = y
        dpMonth.value = m
      }
    }
  }
}, { immediate: true })

const displayDob = computed(() => {
  if (!props.modelValue) return 'เลือกวันเกิด'
  const parts = props.modelValue.split('-')
  if (parts.length !== 3) return props.modelValue
  const y = parseInt(parts[0] || '', 10)
  const m = parseInt(parts[1] || '', 10) - 1
  const d = parseInt(parts[2] || '', 10)

  if (isNaN(y) || isNaN(m) || isNaN(d)) return props.modelValue

  const thaiYear = y + 543
  const thaiMonth = dpMonths[m] || ''
  return `${d} ${thaiMonth} ${thaiYear}`
})

const changeMonth = (offset: number) => {
  let newMonth = dpMonth.value + offset
  let newYear = dpYear.value

  if (newMonth < 0) {
    newMonth = 11
    newYear -= 1
  } else if (newMonth > 11) {
    newMonth = 0
    newYear += 1
  }

  dpMonth.value = newMonth
  dpYear.value = newYear
}

const closeDropdown = (e: Event) => {
  const target = e.target as HTMLElement
  if (datepickerContainer.value && !datepickerContainer.value.contains(target)) {
    isDatePickerOpen.value = false
    isYearDropdownOpen.value = false
    isMonthDropdownOpen.value = false
  } else {
    if (target.closest && !target.closest('.year-select-container')) {
      isYearDropdownOpen.value = false
    }
    if (target.closest && !target.closest('.month-select-container')) {
      isMonthDropdownOpen.value = false
    }
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <div ref="datepickerContainer" class="relative">
    <button
      type="button"
      @click="isDatePickerOpen = !isDatePickerOpen"
      class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30 cursor-pointer"
    >
      <span>{{ displayDob }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="w-4 h-4 text-slate-400 flex-shrink-0 ml-1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
        />
      </svg>
    </button>

    <!-- Custom Datepicker Dropdown Card -->
    <transition name="dropdown">
      <div
        v-if="isDatePickerOpen"
        class="absolute z-40 bottom-full left-0 w-full max-w-sm mb-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3"
      >
        <!-- Month/Year selectors -->
        <div class="flex items-center justify-between gap-2">
          <button
            type="button"
            @click="changeMonth(-1)"
            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <div class="flex items-center gap-1.5">
            <!-- Custom Month Select -->
            <div class="relative month-select-container">
              <button
                type="button"
                @click="isMonthDropdownOpen = !isMonthDropdownOpen; isYearDropdownOpen = false"
                class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none flex items-center gap-1 hover:bg-slate-100 transition-colors"
              >
                <span>{{ dpMonths[dpMonth] }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3 text-slate-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <transition name="dropdown">
                <div
                  v-if="isMonthDropdownOpen"
                  class="absolute z-50 top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-0.5 max-h-40 overflow-y-auto w-28 scrollbar-thin"
                >
                  <button
                    v-for="(m, idx) in dpMonths"
                    :key="m"
                    type="button"
                    @click="dpMonth = idx; isMonthDropdownOpen = false"
                    class="w-full text-left font-nunito text-[11px] font-bold rounded-lg px-2 py-1 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                  >
                    {{ m }}
                  </button>
                </div>
              </transition>
            </div>

            <!-- Custom Year Select -->
            <div class="relative year-select-container">
              <button
                type="button"
                @click="isYearDropdownOpen = !isYearDropdownOpen; isMonthDropdownOpen = false"
                class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none flex items-center gap-1 hover:bg-slate-100 transition-colors"
              >
                <span>{{ dpYear + 543 }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3 text-slate-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <transition name="dropdown">
                <div
                  v-if="isYearDropdownOpen"
                  class="absolute z-50 top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-0.5 max-h-40 overflow-y-auto w-24 scrollbar-thin"
                >
                  <button
                    v-for="y in dpYears"
                    :key="y"
                    type="button"
                    @click="dpYear = y; isYearDropdownOpen = false"
                    class="w-full text-left font-nunito text-[11px] font-bold rounded-lg px-2 py-1 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                  >
                    {{ y + 543 }}
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <button
            type="button"
            @click="changeMonth(1)"
            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        <!-- Calendar Grid -->
        <div>
          <!-- Weekday labels -->
          <div class="grid grid-cols-7 gap-1 text-center mb-1">
            <span
              v-for="dayName in dpWeekDays"
              :key="dayName"
              class="text-[10px] font-bold text-slate-400 uppercase py-1"
            >
              {{ dayName }}
            </span>
          </div>

          <!-- Days grid -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="item in dpGridDays"
              :key="item.dateString"
              type="button"
              @click="selectDate(item)"
              :class="[
                'aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-100 cursor-pointer relative',
                item.monthOffset !== 0
                  ? 'text-slate-300'
                  : 'text-slate-700',
                item.isSelected
                  ? 'bg-[#FF758F] text-white font-bold shadow-md shadow-pink-100'
                  : 'hover:bg-pink-50 hover:text-[#FF758F]',
                item.isToday && !item.isSelected
                  ? 'border border-[#FF758F] text-[#FF758F]'
                  : '',
              ]"
            >
              {{ item.day }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Custom thin scrollbar for Webkit browsers (Chrome, Safari) */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 117, 143, 0.6);
}
</style>

