<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useClassroomList } from '~/composables/useClassroomList'

useHead({
  title: 'จัดการชั้นเรียนและเช็คชื่อ - Student Attendance System',
  meta: [
    { name: 'description', content: 'ระบบจัดการห้องเรียน บันทึกเวลาเรียน และตรวจสอบรายงานการเข้าเรียนสำหรับคุณครู' }
  ]
})

const route = useRoute()

// State for Mobile Sidebar Toggle
const isMobileSidebarOpen = ref(false)

// State for Logout Modal
const isLogoutModalOpen = ref(false)

const { teacherProfile, logout } = useTeacherSession()

// Current date display in Thai format
const currentDateText = computed(() => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return new Date().toLocaleDateString('th-TH', options)
})

// SweetAlert-style Toast Notifications State
const toasts = ref<{ id: number; message: string; type: 'success' | 'error' | 'warning' | 'info' }[]>([])
let toastId = 0

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

// Call classroom composable
const {
  classrooms,
  isFetching,
  isImporting,
  fetchClassroomsData,

  // Modal adding states
  isAddClassModalOpen,
  newClassName,
  newClassSubject,
  newClassDate,
  newClassStartTime,
  newClassEndTime,
  openAddClassModal,
  createClassroom,

  // Filters
  classSearchQuery,
  classFilterStatus,
  filteredClassrooms,
  totalClassesCount,
  completedClassesCount,
  pendingClassesCount,
  averageAttendanceRate,

  // Imports
  isImportModalOpen,
  importSelectedClassId,
  showClassSelectPopover,
  importFileName,
  importStudentsFile,
  isImportLoading,
  openImportModal,
  importSelectedClassroom,
  simulateImportFile,
  handleFileUpload,
  downloadTemplate,
  removeImportFile,
  executeImport,

  // Editing states & actions
  isEditClassModalOpen,
  editClassroomId,
  editScheduleId,
  editClassName,
  editClassSubject,
  editClassDate,
  editClassStartTime,
  editClassEndTime,
  showEditDatePickerPopover,
  showEditStartTimePopover,
  showEditEndTimePopover,
  openEditClassModal,
  selectDateFromCalendarEdit,
  editClassDateFormattedText,
  incrementEditStartHour,
  decrementEditStartHour,
  incrementEditStartMinute,
  decrementEditStartMinute,
  incrementEditEndHour,
  decrementEditEndHour,
  incrementEditEndMinute,
  decrementEditEndMinute,
  updateClassroom,

  // Deleting states & actions
  isDeleteModalOpen,
  classToDelete,
  openDeleteClassModal,
  confirmDeleteClassroom
} = useClassroomList(showToast)

// Local UI States for Popovers
const showDatePickerPopover = ref(false)
const showStartTimePopover = ref(false)
const showEndTimePopover = ref(false)

// Custom Calendar states
const currentCalendarYear = ref(new Date().getFullYear())
const currentCalendarMonth = ref(new Date().getMonth()) // 0-11
const thaiMonthNames = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

// Calendar Days grid generator
const calendarDays = computed(() => {
  const year = currentCalendarYear.value
  const month = currentCalendarMonth.value
  
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  const days = []
  
  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true
    })
  }
  
  // Next month padding to reach 42 grid cells
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    })
  }
  
  return days
})

const nextMonth = () => {
  if (currentCalendarMonth.value === 11) {
    currentCalendarMonth.value = 0
    currentCalendarYear.value++
  } else {
    currentCalendarMonth.value++
  }
}

const prevMonth = () => {
  if (currentCalendarMonth.value === 0) {
    currentCalendarMonth.value = 11
    currentCalendarYear.value--
  } else {
    currentCalendarMonth.value--
  }
}

const selectDateFromCalendar = (dayObj: { day: number; month: number; year: number }) => {
  const yyyy = dayObj.year
  const mm = String(dayObj.month + 1).padStart(2, '0')
  const dd = String(dayObj.day).padStart(2, '0')
  newClassDate.value = `${yyyy}-${mm}-${dd}`
  showDatePickerPopover.value = false
}

const newClassDateFormattedText = computed(() => {
  if (!newClassDate.value) return 'เลือกวันที่เรียน'
  const date = new Date(newClassDate.value)
  const day = date.getDate()
  const month = thaiMonthNames[date.getMonth()]
  const year = date.getFullYear() + 543
  return `${day} ${month} ${year}`
})

// Time increment/decrement counter functions
const incrementStartHour = () => {
  const parts = newClassStartTime.value.split(':')
  let val = (parseInt(parts[0]) + 1) % 24
  newClassStartTime.value = `${String(val).padStart(2, '0')}:${parts[1]}`
}
const decrementStartHour = () => {
  const parts = newClassStartTime.value.split(':')
  let val = (parseInt(parts[0]) - 1 + 24) % 24
  newClassStartTime.value = `${String(val).padStart(2, '0')}:${parts[1]}`
}
const incrementStartMinute = () => {
  const parts = newClassStartTime.value.split(':')
  let val = (parseInt(parts[1]) + 5) % 60
  newClassStartTime.value = `${parts[0]}:${String(val).padStart(2, '0')}`
}
const decrementStartMinute = () => {
  const parts = newClassStartTime.value.split(':')
  let val = (parseInt(parts[1]) - 5 + 60) % 60
  newClassStartTime.value = `${parts[0]}:${String(val).padStart(2, '0')}`
}

const incrementEndHour = () => {
  const parts = newClassEndTime.value.split(':')
  let val = (parseInt(parts[0]) + 1) % 24
  newClassEndTime.value = `${String(val).padStart(2, '0')}:${parts[1]}`
}
const decrementEndHour = () => {
  const parts = newClassEndTime.value.split(':')
  let val = (parseInt(parts[0]) - 1 + 24) % 24
  newClassEndTime.value = `${String(val).padStart(2, '0')}:${parts[1]}`
}
const incrementEndMinute = () => {
  const parts = newClassEndTime.value.split(':')
  let val = (parseInt(parts[1]) + 5) % 60
  newClassEndTime.value = `${parts[0]}:${String(val).padStart(2, '0')}`
}
const decrementEndMinute = () => {
  const parts = newClassEndTime.value.split(':')
  let val = (parseInt(parts[1]) - 5 + 60) % 60
  newClassEndTime.value = `${parts[0]}:${String(val).padStart(2, '0')}`
}

// Redirect to dynamic check-in page
const startCheckIn = (cls: any) => {
  showToast(`เริ่มเช็คชื่อสำหรับ ${cls.name}`, 'success')
  setTimeout(() => {
    navigateTo(`/teachers/classroom/${cls.id}`)
  }, 500)
}

// Handle query parameters (e.g. from Dashboard click redirects)
const handleQuery = () => {
  const qClassId = route.query.classId
  if (qClassId) {
    navigateTo(`/teachers/classroom/${qClassId}`)
  }
}

onMounted(async () => {
  handleQuery()
  await fetchClassroomsData()
})

watch(() => route.query.classId, () => {
  handleQuery()
})

const handleLogout = () => {
  isLogoutModalOpen.value = true
}

const confirmLogout = () => {
  isLogoutModalOpen.value = false
  showToast('กำลังออกจากระบบ...', 'success')
  logout()
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex font-sans text-[#2F3E46]">
    
    <!-- Toast Notification Container (Top Right) -->
    <Teleport to="body">
      <div class="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none max-w-sm w-full">
        <TransitionGroup name="toast">
          <div 
            v-for="toast in toasts" 
            :key="toast.id"
            :class="[
              'pointer-events-auto py-5 px-5 rounded-2xl shadow-xl flex items-center gap-3.5 border transition-all duration-300 transform scale-100 hover:scale-[1.02] relative overflow-hidden',
              toast.type === 'success' ? 'bg-[#EAFDF8] border-[#A8EEDD] text-[#1E7D65]' : 
              toast.type === 'error' ? 'bg-[#FFF0F3] border-[#FFCCD5] text-[#A3001E]' : 
              toast.type === 'info' ? 'bg-[#EBF8FF] border-[#BEE3F8] text-[#2B6CB0]' :
              'bg-[#FFF9E6] border-[#FFE29A] text-[#805B00]'
            ]"
          >
            <!-- SweetAlert animated style progress bar -->
            <div 
              :class="[
                'absolute bottom-0 left-0 h-1 animate-toast-progress w-full',
                toast.type === 'success' ? 'bg-[#1E7D65]' : 
                toast.type === 'error' ? 'bg-[#A3001E]' : 
                toast.type === 'info' ? 'bg-[#2B6CB0]' :
                'bg-[#805B00]'
              ]"
            ></div>

            <div class="flex-shrink-0">
              <svg v-if="toast.type === 'success'" class="w-5.5 h-5.5 text-[#1E7D65]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <svg v-else-if="toast.type === 'error'" class="w-5.5 h-5.5 text-[#A3001E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              <svg v-else-if="toast.type === 'info'" class="w-5.5 h-5.5 text-[#2B6CB0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25.041-.02a.75.75 0 1 1 1.063 1.06l-.041.02-.08.04H12v.002h.008a.75.75 0 0 1 1.5 0v.008h-.008v-.008ZM12 3v18M3 12h18" />
              </svg>
              <svg v-else class="w-5.5 h-5.5 text-[#805B00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <span class="font-nunito text-xs sm:text-sm font-bold flex-1 pr-1">{{ toast.message }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- BACKGROUND BLUR DECORATIONS -->
    <div class="fixed top-0 right-0 w-[400px] h-[400px] bg-pink-100/35 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <!-- Sidebar Layout Component -->
    <Sidebar 
      v-model:isOpen="isMobileSidebarOpen" 
      activeItem="classes" 
      @logout="handleLogout" 
    />

    <!-- MAIN PAGE CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Component -->
      <Topbar 
        title="จัดการห้องเรียนและเช็คชื่อ" 
        :currentDateText="currentDateText" 
        :teacherProfile="teacherProfile" 
        @toggleSidebar="isMobileSidebarOpen = true" 
        @logout="handleLogout" 
      />

      <!-- MAIN SCROLLABLE CONTENT -->
      <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">

        <div class="space-y-6">
          
          <!-- Welcome Header Card -->
          <section class="bg-gradient-to-br from-[#FF758F] to-[#FF4D6D] rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-pink-100/50">
            <div class="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <span class="bg-white/20 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase inline-block">
                  CLASSROOM MANAGEMENT
                </span>
                <h2 class="font-fredoka text-2xl sm:text-3xl font-extrabold leading-tight">
                  รายวิชาและห้องเรียนที่ต้องรับผิดชอบ
                </h2>
                <p class="font-nunito text-xs sm:text-sm text-pink-50/90 font-medium">
                  คุณครูสามารถตรวจสอบความคืบหน้าการเช็คชื่อเข้าแถวและคาบเรียนทั้งหมด รวมถึงเริ่มเข้าเช็ครายชื่อนักเรียนแยกตามรายวิชาและห้องเรียนที่รับผิดชอบได้ทันที
                </p>
              </div>

              <!-- Quick Actions Group -->
              <div class="flex flex-wrap gap-2.5 flex-shrink-0 w-full lg:w-auto">
                <button 
                  @click="openImportModal"
                  class="flex-1 lg:flex-initial bg-white/15 hover:bg-white/25 border border-white/20 text-white font-fredoka font-bold text-xs px-4 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>นำเข้ารายชื่อนักเรียน</span>
                </button>
                <button 
                  @click="openAddClassModal"
                  class="flex-1 lg:flex-initial bg-white text-[#FF758F] hover:bg-pink-50 font-fredoka font-bold text-xs px-4 py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>เพิ่มห้องเรียนใหม่</span>
                </button>
              </div>
            </div>
          </section>

          <!-- STATS OVERVIEW CARDS -->
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Classes -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-pink-500/10 text-[#FF758F] flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">ห้องเรียนทั้งหมด</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5">{{ totalClassesCount }} ห้อง</span>
              </div>
            </div>

            <!-- Completed Check-ins -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">เช็คชื่อแล้ว</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5 text-emerald-600">{{ completedClassesCount }} ห้อง</span>
              </div>
            </div>

            <!-- Pending Check-ins -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">รอเช็คชื่อ</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5 text-amber-600">{{ pendingClassesCount }} ห้อง</span>
              </div>
            </div>

            <!-- Avg Attendance Rate -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">อัตราเข้าเรียนเฉลี่ย</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5 text-[#FF758F]">{{ averageAttendanceRate }}</span>
              </div>
            </div>
          </section>

          <!-- SEARCH AND FILTER CONTROLS -->
          <section class="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <!-- Search bar -->
            <div class="relative w-full md:max-w-md">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </span>
              <input 
                type="text" 
                v-model="classSearchQuery"
                placeholder="ค้นหาชื่อห้องเรียน หรือ รายวิชา..."
                class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#FF758F] focus:bg-white transition-all duration-200"
              />
            </div>

            <!-- Filter tabs -->
            <div class="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-100/60 rounded-xl w-full md:w-auto overflow-x-auto">
              <button 
                @click="classFilterStatus = 'all'"
                :class="[
                  'flex-1 md:flex-initial text-center px-4 py-1.5 rounded-lg font-fredoka font-bold text-xs transition-colors cursor-pointer whitespace-nowrap',
                  classFilterStatus === 'all' ? 'bg-white shadow-xs text-[#FF758F]' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                ทั้งหมด
              </button>
              <button 
                @click="classFilterStatus = 'completed'"
                :class="[
                  'flex-1 md:flex-initial text-center px-4 py-1.5 rounded-lg font-fredoka font-bold text-xs transition-colors cursor-pointer whitespace-nowrap',
                  classFilterStatus === 'completed' ? 'bg-white shadow-xs text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                เช็คชื่อเสร็จสิ้น
              </button>
              <button 
                @click="classFilterStatus = 'pending'"
                :class="[
                  'flex-1 md:flex-initial text-center px-4 py-1.5 rounded-lg font-fredoka font-bold text-xs transition-colors cursor-pointer whitespace-nowrap',
                  classFilterStatus === 'pending' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                ยังไม่ได้เช็คชื่อ
              </button>
            </div>
          </section>

          <!-- CLASS CARDS GRID -->
          <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div 
              v-for="cls in filteredClassrooms" 
              :key="cls.id"
              class="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
            >
              <!-- Card Head -->
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <span 
                    :class="[
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full border',
                      cls.status === 'completed' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-amber-50 border-amber-100 text-amber-600'
                    ]"
                  >
                    {{ cls.status === 'completed' ? 'เช็คชื่อเสร็จสิ้น' : 'ยังไม่ได้เช็คชื่อ' }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button 
                      @click.stop="openEditClassModal(cls)"
                      class="p-1 text-slate-400 hover:text-[#FF758F] hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขห้องเรียน"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button 
                      @click.stop="openDeleteClassModal(cls)"
                      class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบห้องเรียน"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <h4 class="font-fredoka text-base font-extrabold text-slate-800 mt-3">{{ cls.name }}</h4>
                <p class="font-nunito text-xs text-slate-400 font-semibold truncate">{{ cls.subject }}</p>
                
                <div class="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>{{ cls.time }}</span>
                </div>
              </div>

              <!-- Progress indicators -->
              <div class="mt-5 space-y-2">
                <div class="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>การเช็คชื่อเข้าเรียน</span>
                  <span>{{ cls.checkedCount }} / {{ cls.studentsCount }} คน</span>
                </div>
                
                <!-- Progress Bar -->
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    :class="[
                      'h-full rounded-full transition-all duration-500',
                      cls.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'
                    ]"
                    :style="{ width: `${(cls.checkedCount / cls.studentsCount) * 100}%` }"
                  ></div>
                </div>

                <div class="flex items-center justify-between text-[10px] pt-1">
                  <span class="text-slate-400 font-medium">{{ cls.checkedTime }}</span>
                  <span 
                    v-if="cls.status === 'completed'" 
                    class="text-emerald-600 font-bold"
                  >
                    อัตราเข้าเรียน: {{ cls.attendanceRate }}%
                  </span>
                </div>
              </div>

              <!-- Details & Actions -->
              <div class="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                <button 
                  @click="showToast('กำลังดาวน์โหลดรายงานข้อมูลชั้นเรียน...', 'info')"
                  class="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 font-fredoka font-bold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  รายงาน
                </button>
                <button 
                  @click="startCheckIn(cls)"
                  :class="[
                    'flex-1 font-fredoka font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-sm',
                    cls.status === 'completed' 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                      : 'bg-[#FF758F] hover:bg-[#FF4D6D] text-white shadow-pink-100'
                  ]"
                >
                  {{ cls.status === 'completed' ? 'เช็คชื่ออีกครั้ง' : 'เริ่มเช็คชื่อ' }}
                </button>
              </div>

            </div>

            <!-- Empty state for no matched search -->
            <div v-if="filteredClassrooms.length === 0" class="col-span-full bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-12 h-12 text-slate-300 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <h5 class="font-fredoka text-sm font-bold text-slate-600">ไม่พบรายวิชาหรือห้องเรียนที่ค้นหา</h5>
              <p class="font-nunito text-[11px] text-slate-400">กรุณาลองป้อนคำค้นหาอื่นๆ</p>
            </div>

          </section>

        </div>

      </main>

      <!-- Logout Confirmation Modal -->
      <ConfirmModal 
        :isOpen="isLogoutModalOpen"
        title="ออกจากระบบ"
        message="คุณครูต้องการออกจากระบบระบบเช็คชื่อนักเรียนใช่หรือไม่?"
        confirmText="ออกจากระบบ"
        cancelText="ยกเลิก"
        type="danger"
        @confirm="confirmLogout"
        @cancel="isLogoutModalOpen = false"
      />

      <!-- Delete Classroom Confirmation Modal -->
      <ConfirmModal 
        :isOpen="isDeleteModalOpen"
        title="ลบห้องเรียน"
        :message="`คุณครูต้องการลบห้องเรียน '${classToDelete?.name || ''}' ใช่หรือไม่? (การลบห้องเรียนจะไม่สามารถกู้คืนข้อมูลได้)`"
        confirmText="ลบห้องเรียน"
        cancelText="ยกเลิก"
        type="danger"
        @confirm="confirmDeleteClassroom"
        @cancel="isDeleteModalOpen = false"
      />

      <!-- Cute Loading Overlay -->
      <LoadingOverlay :show="isImporting" text="กำลังดำเนินการ..." />

      <!-- Add Classroom Modal -->
      <Teleport to="body">
        <transition name="modal-fade">
          <div v-if="isAddClassModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="isAddClassModalOpen = false"></div>

            <!-- Modal Box -->
            <div class="relative w-full max-w-md bg-white rounded-[2.2rem] border border-slate-100 shadow-2xl p-6 sm:p-8 transform transition-all duration-300 scale-100 flex flex-col z-10 overflow-visible">
              
              <!-- Decorative background blurs inside modal -->
              <div class="absolute -top-10 -left-10 w-24 h-24 bg-pink-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>
              <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>

              <!-- Header -->
              <div class="mb-6 text-center flex flex-col items-center">
                <div class="w-12 h-12 rounded-2xl bg-pink-500/10 text-[#FF758F] flex items-center justify-center mb-3 shadow-inner shadow-pink-200/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h4 class="font-fredoka text-lg font-extrabold text-slate-800 leading-snug">สร้างห้องเรียนใหม่</h4>
                <p class="font-nunito text-xs text-slate-500 font-semibold mt-1">กรอกข้อมูลห้องเรียนและระบุวันเวลาเรียนตามตาราง</p>
              </div>

              <!-- Form Body -->
              <div class="space-y-4 mb-6">
                <!-- Class Name Input -->
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">ชื่อชั้นเรียน / ห้องเรียน</label>
                  <input 
                    type="text" 
                    v-model="newClassName"
                    placeholder="เช่น ชั้นมัธยมศึกษาปีที่ 2/4"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#FF758F] focus:bg-white transition-all duration-200"
                  />
                </div>

                <!-- Subject Name Input -->
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">วิชาเรียน</label>
                  <input 
                    type="text" 
                    v-model="newClassSubject"
                    placeholder="เช่น ภาษาไทยพื้นฐาน (ท22101)"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#FF758F] focus:bg-white transition-all duration-200"
                  />
                </div>

                <!-- Custom Datetime Picker -->
                <div class="space-y-3">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">วันและเวลาเรียน</label>
                  
                  <!-- Date Picker Field -->
                  <div class="relative">
                    <button 
                      type="button"
                      @click="showDatePickerPopover = !showDatePickerPopover; showStartTimePopover = false; showEndTimePopover = false"
                      class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#FF758F] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center transition-all duration-200 cursor-pointer"
                    >
                      <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                      </span>
                      <span>{{ newClassDateFormattedText }}</span>
                    </button>
                    
                    <!-- Cute Custom Calendar Dropdown (Pops Upwards) -->
                    <transition name="pop-up">
                      <div 
                        v-if="showDatePickerPopover" 
                        class="absolute left-0 right-0 bottom-full mb-2 p-4 bg-white border border-slate-100 rounded-3xl shadow-xl z-30 space-y-3"
                      >
                        <!-- Month / Year Selector -->
                        <div class="flex items-center justify-between">
                          <button 
                            type="button"
                            @click="prevMonth"
                            class="w-7.5 h-7.5 flex items-center justify-center rounded-lg bg-pink-50 hover:bg-pink-100 text-[#FF758F] transition-colors cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                          </button>
                          
                          <span class="font-fredoka text-xs sm:text-sm font-extrabold text-slate-700">
                            {{ thaiMonthNames[currentCalendarMonth] }} {{ currentCalendarYear + 543 }}
                          </span>

                          <button 
                            type="button"
                            @click="nextMonth"
                            class="w-7.5 h-7.5 flex items-center justify-center rounded-lg bg-pink-50 hover:bg-pink-100 text-[#FF758F] transition-colors cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </div>

                        <!-- Weekdays Header -->
                        <div class="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                          <span>อา.</span>
                          <span>จ.</span>
                          <span>อ.</span>
                          <span>พ.</span>
                          <span>พฤ.</span>
                          <span>ศ.</span>
                          <span>ส.</span>
                        </div>

                        <!-- Days Grid -->
                        <div class="grid grid-cols-7 gap-1 text-center">
                          <button 
                            v-for="(dayObj, idx) in calendarDays" 
                            :key="idx"
                            type="button"
                            @click="selectDateFromCalendar(dayObj)"
                            :class="[
                              'w-8 h-8 rounded-full flex items-center justify-center font-nunito text-[11px] font-bold transition-all cursor-pointer mx-auto',
                              !dayObj.isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-pink-50 hover:text-[#FF758F]',
                              newClassDate === `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`
                                ? 'bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] text-white shadow-xs' 
                                : ''
                            ]"
                          >
                            {{ dayObj.day }}
                          </button>
                        </div>
                      </div>
                    </transition>
                  </div>

                  <!-- Time Range Pickers -->
                  <div class="grid grid-cols-2 gap-3">
                    <!-- Start Time -->
                    <div class="space-y-1">
                      <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">เวลาเริ่มต้น</label>
                      <div class="relative">
                        <button 
                          type="button"
                          @click="showStartTimePopover = !showStartTimePopover; showDatePickerPopover = false; showEndTimePopover = false"
                          class="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#FF758F] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center transition-all duration-200 cursor-pointer"
                        >
                          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </span>
                          <span>{{ newClassStartTime }} น.</span>
                        </button>

                        <!-- Cute Custom Start Time Popover (Pops Upwards) -->
                        <transition name="pop-up">
                          <div 
                            v-if="showStartTimePopover"
                            class="absolute right-0 left-0 sm:left-auto sm:w-44 bottom-full mb-2 p-3 bg-white border border-slate-100 rounded-3xl shadow-xl z-30 flex flex-col items-center gap-2"
                          >
                            <div class="flex items-center gap-3">
                              <!-- Hour Column -->
                              <div class="flex flex-col items-center">
                                <button type="button" @click="incrementStartHour" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                </button>
                                <span class="font-fredoka text-lg font-bold text-slate-700 py-1">{{ newClassStartTime.split(':')[0] }}</span>
                                <button type="button" @click="decrementStartHour" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              </div>

                              <span class="font-fredoka text-lg font-bold text-slate-400 mb-0.5">:</span>

                              <!-- Minute Column -->
                              <div class="flex flex-col items-center">
                                <button type="button" @click="incrementStartMinute" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                </button>
                                <span class="font-fredoka text-lg font-bold text-slate-700 py-1">{{ newClassStartTime.split(':')[1] }}</span>
                                <button type="button" @click="decrementStartMinute" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <button 
                              type="button" 
                              @click="showStartTimePopover = false"
                              class="mt-1 px-3 py-1 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF335c] text-white text-[9px] font-fredoka font-bold rounded-full transition-all cursor-pointer shadow-xs"
                            >
                              ตกลง
                            </button>
                          </div>
                        </transition>
                      </div>
                    </div>

                    <!-- End Time -->
                    <div class="space-y-1">
                      <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">เวลาสิ้นสุด</label>
                      <div class="relative">
                        <button 
                          type="button"
                          @click="showEndTimePopover = !showEndTimePopover; showDatePickerPopover = false; showStartTimePopover = false"
                          class="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#FF758F] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center transition-all duration-200 cursor-pointer"
                        >
                          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </span>
                          <span>{{ newClassEndTime }} น.</span>
                        </button>

                        <!-- Cute Custom End Time Popover (Pops Upwards) -->
                        <transition name="pop-up">
                          <div 
                            v-if="showEndTimePopover"
                            class="absolute right-0 left-0 sm:left-auto sm:w-44 bottom-full mb-2 p-3 bg-white border border-slate-100 rounded-3xl shadow-xl z-30 flex flex-col items-center gap-2"
                          >
                            <div class="flex items-center gap-3">
                              <!-- Hour Column -->
                              <div class="flex flex-col items-center">
                                <button type="button" @click="incrementEndHour" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                </button>
                                <span class="font-fredoka text-lg font-bold text-slate-700 py-1">{{ newClassEndTime.split(':')[0] }}</span>
                                <button type="button" @click="decrementEndHour" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              </div>

                              <span class="font-fredoka text-lg font-bold text-slate-400 mb-0.5">:</span>

                              <!-- Minute Column -->
                              <div class="flex flex-col items-center">
                                <button type="button" @click="incrementEndMinute" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                </button>
                                <span class="font-fredoka text-lg font-bold text-slate-700 py-1">{{ newClassEndTime.split(':')[1] }}</span>
                                <button type="button" @click="decrementEndMinute" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <button 
                              type="button" 
                              @click="showEndTimePopover = false"
                              class="mt-1 px-3 py-1 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF335c] text-white text-[9px] font-fredoka font-bold rounded-full transition-all cursor-pointer shadow-xs"
                            >
                              ตกลง
                            </button>
                          </div>
                        </transition>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="flex gap-3 mt-2">
                <button 
                  @click="isAddClassModalOpen = false"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
                >
                  ยกเลิก
                </button>
                <button 
                  @click="createClassroom"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF335c] text-white font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center shadow-md shadow-pink-100"
                >
                  สร้างห้องเรียน
                </button>
              </div>

            </div>
          </div>
        </transition>
      </Teleport>

      <!-- Edit Classroom Modal -->
      <Teleport to="body">
        <transition name="modal-fade">
          <div v-if="isEditClassModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="isEditClassModalOpen = false"></div>

            <!-- Modal Box -->
            <div class="relative w-full max-w-md bg-white rounded-[2.2rem] border border-slate-100 shadow-2xl p-6 sm:p-8 transform transition-all duration-300 scale-100 flex flex-col z-10 overflow-visible">
              
              <!-- Decorative background blurs inside modal -->
              <div class="absolute -top-10 -left-10 w-24 h-24 bg-pink-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>
              <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>

              <!-- Header -->
              <div class="mb-6 text-center flex flex-col items-center">
                <div class="w-12 h-12 rounded-2xl bg-pink-500/10 text-[#FF758F] flex items-center justify-center mb-3 shadow-inner shadow-pink-200/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </div>
                <h4 class="font-fredoka text-lg font-extrabold text-slate-800 leading-snug">แก้ไขข้อมูลห้องเรียน</h4>
                <p class="font-nunito text-xs text-slate-500 font-semibold mt-1">แก้ไขรายละเอียดห้องเรียนหรือวันเวลาเรียน</p>
              </div>

              <!-- Form Body -->
              <div class="space-y-4 mb-6">
                <!-- Class Name Input -->
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">ชื่อชั้นเรียน / ห้องเรียน</label>
                  <input 
                    type="text" 
                    v-model="editClassName"
                    placeholder="เช่น ชั้นมัธยมศึกษาปีที่ 2/4"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#FF758F] focus:bg-white transition-all duration-200"
                  />
                </div>

                <!-- Subject Name Input -->
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">วิชาเรียน</label>
                  <input 
                    type="text" 
                    v-model="editClassSubject"
                    placeholder="เช่น ภาษาไทยพื้นฐาน (ท22101)"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#FF758F] focus:bg-white transition-all duration-200"
                  />
                </div>

                <!-- Custom Datetime Picker -->
                <div class="space-y-3">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">วันและเวลาเรียน</label>
                  
                  <!-- Date Picker Field -->
                  <div class="relative">
                    <button 
                      type="button"
                      @click="showEditDatePickerPopover = !showEditDatePickerPopover; showEditStartTimePopover = false; showEditEndTimePopover = false"
                      class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#FF758F] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center transition-all duration-200 cursor-pointer"
                    >
                      <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                      </span>
                      <span>{{ editClassDateFormattedText }}</span>
                    </button>
                    
                    <!-- Cute Custom Calendar Dropdown (Pops Upwards) -->
                    <transition name="pop-up">
                      <div 
                        v-if="showEditDatePickerPopover" 
                        class="absolute left-0 right-0 bottom-full mb-2 p-4 bg-white border border-slate-100 rounded-3xl shadow-xl z-30 space-y-3"
                      >
                        <!-- Month / Year Selector -->
                        <div class="flex items-center justify-between">
                          <button 
                            type="button"
                            @click="prevMonth"
                            class="w-7.5 h-7.5 flex items-center justify-center rounded-lg bg-pink-50 hover:bg-pink-100 text-[#FF758F] transition-colors cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                          </button>
                          
                          <span class="font-fredoka text-xs sm:text-sm font-extrabold text-slate-700">
                            {{ thaiMonthNames[currentCalendarMonth] }} {{ currentCalendarYear + 543 }}
                          </span>

                          <button 
                            type="button"
                            @click="nextMonth"
                            class="w-7.5 h-7.5 flex items-center justify-center rounded-lg bg-pink-50 hover:bg-pink-100 text-[#FF758F] transition-colors cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </div>

                        <!-- Weekdays Header -->
                        <div class="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                          <span>อา.</span>
                          <span>จ.</span>
                          <span>อ.</span>
                          <span>พ.</span>
                          <span>พฤ.</span>
                          <span>ศ.</span>
                          <span>ส.</span>
                        </div>

                        <!-- Days Grid -->
                        <div class="grid grid-cols-7 gap-1 text-center">
                          <button 
                            v-for="(dayObj, idx) in calendarDays" 
                            :key="idx"
                            type="button"
                            @click="selectDateFromCalendarEdit(dayObj)"
                            :class="[
                              'w-8 h-8 rounded-full flex items-center justify-center font-nunito text-[11px] font-bold transition-all cursor-pointer mx-auto',
                              !dayObj.isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-pink-50 hover:text-[#FF758F]',
                              editClassDate === `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`
                                ? 'bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] text-white shadow-xs' 
                                : ''
                            ]"
                          >
                            {{ dayObj.day }}
                          </button>
                        </div>
                      </div>
                    </transition>
                  </div>

                  <!-- Time Range Pickers -->
                  <div class="grid grid-cols-2 gap-3">
                    <!-- Start Time -->
                    <div class="space-y-1">
                      <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">เวลาเริ่มต้น</label>
                      <div class="relative">
                        <button 
                          type="button"
                          @click="showEditStartTimePopover = !showEditStartTimePopover; showEditDatePickerPopover = false; showEditEndTimePopover = false"
                          class="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#FF758F] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center transition-all duration-200 cursor-pointer"
                        >
                          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </span>
                          <span>{{ editClassStartTime }} น.</span>
                        </button>

                        <!-- Cute Custom Start Time Popover (Pops Upwards) -->
                        <transition name="pop-up">
                          <div 
                            v-if="showEditStartTimePopover"
                            class="absolute right-0 left-0 sm:left-auto sm:w-44 bottom-full mb-2 p-3 bg-white border border-slate-100 rounded-3xl shadow-xl z-30 flex flex-col items-center gap-2"
                          >
                            <div class="flex items-center gap-3">
                              <!-- Hour Column -->
                              <div class="flex flex-col items-center">
                                <button type="button" @click="incrementEditStartHour" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                </button>
                                <span class="font-fredoka text-lg font-bold text-slate-700 py-1">{{ editClassStartTime.split(':')[0] }}</span>
                                <button type="button" @click="decrementEditStartHour" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              </div>

                              <span class="font-fredoka text-lg font-bold text-slate-400 mb-0.5">:</span>

                              <!-- Minute Column -->
                              <div class="flex flex-col items-center">
                                <button type="button" @click="incrementEditStartMinute" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                </button>
                                <span class="font-fredoka text-lg font-bold text-slate-700 py-1">{{ editClassStartTime.split(':')[1] }}</span>
                                <button type="button" @click="decrementEditStartMinute" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <button 
                              type="button" 
                              @click="showEditStartTimePopover = false"
                              class="mt-1 px-3 py-1 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF335c] text-white text-[9px] font-fredoka font-bold rounded-full transition-all cursor-pointer shadow-xs"
                            >
                              ตกลง
                            </button>
                          </div>
                        </transition>
                      </div>
                    </div>

                    <!-- End Time -->
                    <div class="space-y-1">
                      <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">เวลาสิ้นสุด</label>
                      <div class="relative">
                        <button 
                          type="button"
                          @click="showEditEndTimePopover = !showEditEndTimePopover; showEditDatePickerPopover = false; showEditStartTimePopover = false"
                          class="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#FF758F] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center transition-all duration-200 cursor-pointer"
                        >
                          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </span>
                          <span>{{ editClassEndTime }} น.</span>
                        </button>

                        <!-- Cute Custom End Time Popover (Pops Upwards) -->
                        <transition name="pop-up">
                          <div 
                            v-if="showEditEndTimePopover"
                            class="absolute right-0 left-0 sm:left-auto sm:w-44 bottom-full mb-2 p-3 bg-white border border-slate-100 rounded-3xl shadow-xl z-30 flex flex-col items-center gap-2"
                          >
                            <div class="flex items-center gap-3">
                              <!-- Hour Column -->
                              <div class="flex flex-col items-center">
                                <button type="button" @click="incrementEditEndHour" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                </button>
                                <span class="font-fredoka text-lg font-bold text-slate-700 py-1">{{ editClassEndTime.split(':')[0] }}</span>
                                <button type="button" @click="decrementEditEndHour" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              </div>

                              <span class="font-fredoka text-lg font-bold text-slate-400 mb-0.5">:</span>

                              <!-- Minute Column -->
                              <div class="flex flex-col items-center">
                                <button type="button" @click="incrementEditEndMinute" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                </button>
                                <span class="font-fredoka text-lg font-bold text-slate-700 py-1">{{ editClassEndTime.split(':')[1] }}</span>
                                <button type="button" @click="decrementEditEndMinute" class="w-7 h-7 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF758F] cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <button 
                              type="button" 
                              @click="showEditEndTimePopover = false"
                              class="mt-1 px-3 py-1 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF335c] text-white text-[9px] font-fredoka font-bold rounded-full transition-all cursor-pointer shadow-xs"
                            >
                              ตกลง
                            </button>
                          </div>
                        </transition>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="flex gap-3 mt-2">
                <button 
                  @click="isEditClassModalOpen = false"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
                >
                  ยกเลิก
                </button>
                <button 
                  @click="updateClassroom"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF335c] text-white font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center shadow-md shadow-pink-100"
                >
                  บันทึก
                </button>
              </div>

            </div>
          </div>
        </transition>
      </Teleport>

      <!-- Import Student List Modal -->
      <Teleport to="body">
        <transition name="modal-fade">
          <div v-if="isImportModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="isImportModalOpen = false"></div>

            <!-- Modal Box -->
            <div class="relative w-full max-w-md bg-white rounded-[2.2rem] border border-slate-100 shadow-2xl p-6 sm:p-8 transform transition-all duration-300 scale-100 flex flex-col z-10 overflow-visible">
              
              <!-- Decorative background blurs inside modal -->
              <div class="absolute -top-10 -left-10 w-24 h-24 bg-pink-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>
              <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>

              <!-- Header -->
              <div class="mb-6 text-center flex flex-col items-center">
                <div class="w-12 h-12 rounded-2xl bg-pink-500/10 text-[#FF758F] flex items-center justify-center mb-3 shadow-inner shadow-pink-200/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <h4 class="font-fredoka text-lg font-extrabold text-slate-800 leading-snug">นำเข้ารายชื่อนักเรียน</h4>
                <p class="font-nunito text-xs text-slate-500 font-semibold mt-1">เลือกห้องเรียนและอัปโหลดไฟล์รายชื่อนักเรียน (.xlsx / .csv)</p>
              </div>

              <!-- Form Body -->
              <div class="space-y-4 mb-6">
                <!-- Classroom Select -->
                <div class="space-y-1 relative">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">ห้องเรียนเป้าหมาย</label>
                  
                  <!-- Custom Dropdown Button -->
                  <button 
                    type="button"
                    @click="showClassSelectPopover = !showClassSelectPopover"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-100 hover:border-[#FF758F] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <span>
                      <span v-if="importSelectedClassroom" class="flex flex-col">
                        <span class="font-fredoka font-bold text-slate-800 text-xs sm:text-sm">{{ importSelectedClassroom.name }}</span>
                        <span class="text-[10px] text-slate-400 mt-0.5">{{ importSelectedClassroom.subject }}</span>
                      </span>
                      <span v-else class="text-slate-400">เลือกห้องเรียน</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180 text-[#FF758F]': showClassSelectPopover }">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <!-- Custom Dropdown Options Popover -->
                  <transition name="pop-up">
                    <div 
                      v-if="showClassSelectPopover" 
                      class="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100/80 rounded-2xl shadow-xl p-1.5 space-y-1"
                    >
                      <button
                        v-for="cls in classrooms"
                        :key="cls.id"
                        type="button"
                        @click="importSelectedClassId = cls.id; showClassSelectPopover = false"
                        :class="[
                          'w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer',
                          importSelectedClassId === cls.id 
                            ? 'bg-pink-500/5 text-[#FF758F]' 
                            : 'hover:bg-slate-50 text-slate-700'
                        ]"
                      >
                        <span class="flex flex-col">
                          <span class="font-fredoka font-bold text-xs sm:text-sm" :class="importSelectedClassId === cls.id ? 'text-[#FF758F]' : 'text-slate-800'">{{ cls.name }}</span>
                          <span class="text-[10px]" :class="importSelectedClassId === cls.id ? 'text-pink-400' : 'text-slate-400'">{{ cls.subject }}</span>
                        </span>
                        
                        <svg v-if="importSelectedClassId === cls.id" class="w-4.5 h-4.5 text-[#FF758F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </button>
                    </div>
                  </transition>
                </div>

                <!-- File Import Zone -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">ไฟล์รายชื่อนักเรียน (.xlsx / .csv)</label>
                    <button 
                      type="button" 
                      @click="downloadTemplate" 
                      class="text-[10px] text-[#FF758F] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      ดาวน์โหลดรูปแบบ Excel
                    </button>
                  </div>
                  
                  <input 
                    type="file" 
                    ref="fileInputRef" 
                    accept=".xlsx,.csv" 
                    class="hidden" 
                    @change="handleFileUpload" 
                  />
                  
                  <div 
                    v-if="!importFileName"
                    @click="$refs.fileInputRef.click()"
                    class="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-pink-300 hover:bg-pink-50/10 transition-colors cursor-pointer group"
                  >
                    <!-- Upload icon -->
                    <div class="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-pink-50 group-hover:text-[#FF758F] transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 16.5 4.5H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    </div>
                    <span class="font-fredoka text-[11px] font-extrabold text-slate-600 group-hover:text-[#FF758F] block">คลิกเพื่อเลือกไฟล์รายชื่อจริง</span>
                    <span class="font-nunito text-[10px] text-slate-400 block mt-1">รองรับเฉพาะนามสกุลไฟล์ Excel หรือ CSV</span>
                  </div>

                  <div class="flex justify-end mt-1" v-if="!importFileName">
                    <button 
                      type="button"
                      @click="simulateImportFile"
                      class="text-[9px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                    >
                      (คลิกที่นี่หากต้องการทดสอบด้วยข้อมูลจำลอง)
                    </button>
                  </div>
                  
                  <!-- Uploaded File details card -->
                  <div 
                    v-else
                    class="space-y-3"
                  >
                    <div class="bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
                        </div>
                        <div class="min-w-0">
                          <p class="font-nunito text-xs font-bold text-slate-700 truncate">{{ importFileName }}</p>
                          <span class="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 block mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3 h-3">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            วิเคราะห์รายชื่อสำเร็จ ({{ importStudentsFile ? importStudentsFile.length : 0 }} คน)
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        @click="removeImportFile"
                        class="w-7.5 h-7.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-100 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>

                    <!-- Scrollable student preview list inside modal -->
                    <div v-if="importStudentsFile && importStudentsFile.length > 0" class="border border-slate-100 rounded-2xl p-3.5 bg-slate-50/50 max-h-48 overflow-y-auto">
                      <p class="text-[10px] text-slate-400 font-bold block mb-2 uppercase tracking-wide">ตัวอย่างข้อมูลที่จะนำเข้า</p>
                      <div class="space-y-1.5">
                        <div 
                          v-for="st in importStudentsFile" 
                          :key="st.no" 
                          class="flex justify-between items-center text-xs font-nunito font-semibold text-slate-600 border-b border-slate-100/50 last:border-0 pb-1.5 last:pb-0"
                        >
                          <div class="flex items-center gap-2 min-w-0">
                            <span class="text-slate-400 font-bold">เลขที่ {{ st.no }}</span>
                            <span class="truncate font-fredoka">{{ st.prefix }}{{ st.firstName }} {{ st.lastName }}</span>
                          </div>
                          <span 
                            :class="[
                              'px-2 py-0.5 rounded-lg text-[9px] font-bold font-fredoka shadow-xs',
                              st.prefix === 'ด.ญ.' || st.prefix === 'เด็กหญิง' || st.prefix === 'นางสาว' || st.prefix === 'นาง' 
                                ? 'bg-pink-50 text-pink-500 border border-pink-100' 
                                : 'bg-blue-50 text-blue-500 border border-blue-100'
                            ]"
                          >
                            {{ st.prefix }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="flex gap-3 mt-2">
                <button 
                  @click="isImportModalOpen = false"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
                >
                  ยกเลิก
                </button>
                <button 
                  @click="executeImport"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF335c] text-white font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center shadow-md shadow-pink-100"
                >
                  นำเข้ารายชื่อ
                </button>
              </div>

            </div>
          </div>
        </transition>
      </Teleport>

      <!-- Cute Loading Overlay for Import -->
      <LoadingOverlay :show="isImportLoading" text="กำลังนำเข้ารายชื่อนักเรียน..." />
    </div>
  </div>
</template>

<style scoped>
/* Toast animations (SweetAlert End style slide) */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(50px, 0) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(0, -15px) scale(0.9);
}

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}
.animate-toast-progress {
  animation: toastProgress 3s linear forwards;
}

/* Modal transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.25s ease-out;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active > div:last-child,
.modal-fade-leave-active > div:last-child {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-enter-from > div:last-child {
  transform: scale(0.9) translateY(10px);
  opacity: 0;
}
.modal-fade-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}

/* Pop-up animation */
.pop-up-enter-active, .pop-up-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-up-enter-from, .pop-up-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
