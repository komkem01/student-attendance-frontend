<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'รายงานการเข้าเรียน | Student Attendance System',
  meta: [
    { name: 'description', content: 'รายงานและสถิติการเข้าเรียนสำหรับคุณครู ตรวจสอบรายงานรายวันและรายเดือนแยกตามห้องเรียนและชั้นเรียน' }
  ]
})

// State for Mobile Sidebar Toggle
const isMobileSidebarOpen = ref(false)

// State for Logout Confirmation Modal
const isLogoutModalOpen = ref(false)

// Mock Teacher Profile Data
const teacherProfile = ref({
  name: 'สมชาย ใจดี',
  title: 'คุณครูประจำวิชาคณิตศาสตร์',
  school: 'โรงเรียนสตรีวิทยา',
  subject: 'คณิตศาสตร์',
  email: 'somchai.jai@email.com',
  avatarInitials: 'สช'
})

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

// Shared Classrooms state
const classrooms = useState<any[]>('classrooms', () => [
  {
    id: 1,
    name: 'ชั้นมัธยมศึกษาปีที่ 1/1',
    subject: 'คณิตศาสตร์พื้นฐาน (ค21101)',
    studentsCount: 15,
    status: 'completed',
    time: '08:15 - 09:10 น.',
    checkedTime: 'เช็คชื่อเมื่อ 08:30 น.',
    students: [
      { id: 101, no: 1, prefix: 'ด.ช.', firstName: 'นันทวัฒน์', lastName: 'สมบูรณ์', status: 'absent', details: '' },
      { id: 102, no: 2, prefix: 'ด.ช.', firstName: 'กิตติพงษ์', lastName: 'แก้วมณี', status: 'present', details: '' },
      { id: 103, no: 3, prefix: 'ด.ช.', firstName: 'จิรภัทร', lastName: 'ดีใจ', status: 'present', details: '' },
      { id: 104, no: 4, prefix: 'ด.ช.', firstName: 'ธนากร', lastName: 'รักสงบ', status: 'present', details: '' },
      { id: 105, no: 5, prefix: 'ด.ช.', firstName: 'ปกรณ์', lastName: 'งามสมบูรณ์', status: 'late', details: '15' },
      { id: 106, no: 6, prefix: 'ด.ญ.', firstName: 'กรกนก', lastName: 'สุขใจ', status: 'present', details: '' },
      { id: 107, no: 7, prefix: 'ด.ญ.', firstName: 'ชนิกานต์', lastName: 'รุ่งเรือง', status: 'present', details: '' },
      { id: 108, no: 8, prefix: 'ด.ญ.', firstName: 'ณิชชา', lastName: 'พาณิชย์', status: 'leave', details: 'sick' },
      { id: 109, no: 9, prefix: 'ด.ญ.', firstName: 'ธนัญชนก', lastName: 'แสงทอง', status: 'present', details: '' },
      { id: 110, no: 10, prefix: 'ด.ญ.', firstName: 'ปรียาภรณ์', lastName: 'ทิพย์สุวรรณ', status: 'present', details: '' },
      { id: 111, no: 11, prefix: 'ด.ญ.', firstName: 'วรินดา', lastName: 'ยอดรัก', status: 'present', details: '' },
      { id: 112, no: 12, prefix: 'ด.ญ.', firstName: 'สุภัสสรา', lastName: 'ทองคำ', status: 'present', details: '' },
      { id: 113, no: 13, prefix: 'ด.ช.', firstName: 'พีรพงษ์', lastName: 'มั่นคง', status: 'present', details: '' },
      { id: 114, no: 14, prefix: 'ด.ช.', firstName: 'อัครพงษ์', lastName: 'เจริญกุล', status: 'present', details: '' },
      { id: 115, no: 15, prefix: 'ด.ญ.', firstName: 'อารียา', lastName: 'ทิพย์สุวรรณ', status: 'present', details: '' }
    ]
  },
  {
    id: 2,
    name: 'ชั้นมัธยมศึกษาปีที่ 1/2',
    subject: 'คณิตศาสตร์พื้นฐาน (ค21101)',
    studentsCount: 12,
    status: 'completed',
    time: '09:10 - 10:05 น.',
    checkedTime: 'เช็คชื่อเมื่อ 09:20 น.',
    students: [
      { id: 201, no: 1, prefix: 'ด.ช.', firstName: 'กิตติพงษ์', lastName: 'รักดี', status: 'late', details: '15' },
      { id: 202, no: 2, prefix: 'ด.ช.', firstName: 'ชยุต', lastName: 'สุวรรณ', status: 'present', details: '' },
      { id: 203, no: 3, prefix: 'ด.ช.', firstName: 'ณัฐกร', lastName: 'ใจกว้าง', status: 'present', details: '' },
      { id: 204, no: 4, prefix: 'ด.ช.', firstName: 'ทศพล', lastName: 'ประเสริฐ', status: 'present', details: '' },
      { id: 205, no: 5, prefix: 'ด.ช.', firstName: 'นนทพัทธ์', lastName: 'จันทร์โอชา', status: 'present', details: '' },
      { id: 206, no: 6, prefix: 'ด.ญ.', firstName: 'กมลชนก', lastName: 'พุ่มพวง', status: 'present', details: '' },
      { id: 207, no: 7, prefix: 'ด.ญ.', firstName: 'จิราภรณ์', lastName: 'เพ็ญดี', status: 'present', details: '' },
      { id: 208, no: 8, prefix: 'ด.ญ.', firstName: 'ชลดา', lastName: 'ศรีทอง', status: 'leave', details: 'business' },
      { id: 209, no: 9, prefix: 'ด.ญ.', firstName: 'ณัฐณิชา', lastName: 'สุขเสมอ', status: 'present', details: '' },
      { id: 210, no: 10, prefix: 'ด.ญ.', firstName: 'ทิพวรรณ', lastName: 'สมควร', status: 'present', details: '' },
      { id: 211, no: 11, prefix: 'ด.ช.', firstName: 'ภานุเดช', lastName: 'รักไทย', status: 'present', details: '' },
      { id: 212, no: 12, prefix: 'ด.ญ.', firstName: 'มุทิตา', lastName: 'สง่างาม', status: 'present', details: '' }
    ]
  },
  {
    id: 3,
    name: 'ชั้นมัธยมศึกษาปีที่ 2/3',
    subject: 'คณิตศาสตร์เพิ่มเติม (ค22201)',
    studentsCount: 15,
    status: 'pending',
    time: '13:00 - 13:55 น.',
    checkedTime: 'ยังไม่ได้เช็คชื่อ',
    students: [
      { id: 301, no: 1, prefix: 'ด.ช.', firstName: 'เกริกเกียรติ', lastName: 'มานะดี', status: '', details: '' },
      { id: 302, no: 2, prefix: 'ด.ช.', firstName: 'จักรกฤษณ์', lastName: 'เรียนเก่ง', status: '', details: '' },
      { id: 303, no: 3, prefix: 'ด.ช.', firstName: 'ชานนท์', lastName: 'ปัญญาดี', status: '', details: '' },
      { id: 304, no: 4, prefix: 'ด.ช.', firstName: 'เดชาพล', lastName: 'มั่นคง', status: '', details: '' },
      { id: 305, no: 5, prefix: 'ด.ช.', firstName: 'ทรงพล', lastName: 'ทองแท้', status: '', details: '' },
      { id: 306, no: 6, prefix: 'ด.ญ.', firstName: 'กนิษฐา', lastName: 'สวยงาม', status: '', details: '' },
      { id: 307, no: 7, prefix: 'ด.ญ.', firstName: 'จารุวรรณ', lastName: 'สายสมร', status: '', details: '' },
      { id: 308, no: 8, prefix: 'ด.ญ.', firstName: 'ชนิตา', lastName: 'พึ่งธรรม', status: '', details: '' },
      { id: 309, no: 9, prefix: 'ด.ญ.', firstName: 'ณิชนันทน์', lastName: 'เก่งการค้า', status: '', details: '' },
      { id: 310, no: 10, prefix: 'ด.ญ.', firstName: 'ณิชาภัทร', lastName: 'ว่องไว', status: '', details: '' },
      { id: 311, no: 11, prefix: 'ด.ญ.', firstName: 'ดลลชา', lastName: 'มีโชค', status: '', details: '' },
      { id: 312, no: 12, prefix: 'ด.ญ.', firstName: 'ทักษอร', lastName: 'เปี่ยมสุข', status: '', details: '' },
      { id: 313, no: 13, prefix: 'ด.ช.', firstName: 'นพคุณ', lastName: 'ขยันตั้งใจ', status: '', details: '' },
      { id: 314, no: 14, prefix: 'ด.ญ.', firstName: 'เบญจวรรณ', lastName: 'สมบัติพูน', status: '', details: '' },
      { id: 315, no: 15, prefix: 'ด.ญ.', firstName: 'พิมลภัส', lastName: 'วรโชติ', status: '', details: '' }
    ]
  }
])


// Active classroom selection filter
const selectedClassroomId = ref<number>(classrooms.value && classrooms.value.length > 0 ? classrooms.value[0].id : 1)
const showClassSelectPopover = ref(false)

const selectedClassroom = computed(() => {
  if (!classrooms.value) return null
  return classrooms.value.find(c => c.id === selectedClassroomId.value) || classrooms.value[0]
})

// Date range states
const startDateStr = ref('2026-06-01')
const endDateStr = ref('2026-06-18')

const showStartDatePopover = ref(false)
const showEndDatePopover = ref(false)

// Calendar parameters
const currentCalendarYear = ref(new Date().getFullYear())
const currentCalendarMonth = ref(new Date().getMonth())
const thaiMonthNames = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

// Calendar generator
const calendarDays = computed(() => {
  const year = currentCalendarYear.value
  const month = currentCalendarMonth.value
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  const days = []
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, month: month === 0 ? 11 : month - 1, year: month === 0 ? year - 1 : year, isCurrentMonth: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month: month, year: year, isCurrentMonth: true })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, month: month === 11 ? 0 : month + 1, year: month === 11 ? year + 1 : year, isCurrentMonth: false })
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

const selectStartDate = (dayObj: any) => {
  const yyyy = dayObj.year
  const mm = String(dayObj.month + 1).padStart(2, '0')
  const dd = String(dayObj.day).padStart(2, '0')
  startDateStr.value = `${yyyy}-${mm}-${dd}`
  showStartDatePopover.value = false
}

const selectEndDate = (dayObj: any) => {
  const yyyy = dayObj.year
  const mm = String(dayObj.month + 1).padStart(2, '0')
  const dd = String(dayObj.day).padStart(2, '0')
  endDateStr.value = `${yyyy}-${mm}-${dd}`
  showEndDatePopover.value = false
}

const formatDateThaiShort = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`
}

// Generate deterministic historical data for each student
const studentsReportData = computed(() => {
  if (!selectedClassroom.value) return []
  return selectedClassroom.value.students.map((student: any) => {
    // Deterministic stats simulation based on student ID and selected range
    const seed = student.id
    const present = 12 + (seed % 6)
    const late = seed % 3
    const absent = seed % 2
    const leave = seed % 4
    
    const total = present + late + absent + leave
    const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0
    
    return {
      ...student,
      presentCount: present,
      lateCount: late,
      absentCount: absent,
      leaveCount: leave,
      totalDays: total,
      attendanceRate: rate
    }
  })
})

// Classroom aggregate stats
const aggregateStats = computed(() => {
  const students = studentsReportData.value
  if (students.length === 0) return { presentPct: 0, latePct: 0, absentPct: 0, leavePct: 0, avgRate: 0 }
  
  let totalPresent = 0
  let totalLate = 0
  let totalAbsent = 0
  let totalLeave = 0
  let totalDays = 0
  
  students.forEach(s => {
    totalPresent += s.presentCount
    totalLate += s.lateCount
    totalAbsent += s.absentCount
    totalLeave += s.leaveCount
    totalDays += s.totalDays
  })
  
  return {
    presentPct: totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0,
    latePct: totalDays > 0 ? Math.round((totalLate / totalDays) * 100) : 0,
    absentPct: totalDays > 0 ? Math.round((totalAbsent / totalDays) * 100) : 0,
    leavePct: totalDays > 0 ? Math.round((totalLeave / totalDays) * 100) : 0,
    avgRate: students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length * 10) / 10 : 0
  }
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

const isExporting = ref(false)

const handleExport = async (format: 'pdf' | 'excel') => {
  isExporting.value = true
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  isExporting.value = false
  showToast(`ส่งออกรายงานในรูปแบบ ${format.toUpperCase()} สำเร็จ เรียบร้อยแล้ว!`, 'success')
}

const handleLogout = () => {
  isLogoutModalOpen.value = true
}

const confirmLogout = () => {
  isLogoutModalOpen.value = false
  showToast('กำลังออกจากระบบ...', 'success')
  setTimeout(() => {
    navigateTo('/teachers/login')
  }, 1000)
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
    <div class="fixed top-0 right-0 w-[400px] h-[400px] bg-emerald-100/35 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <!-- Sidebar Layout Component -->
    <Sidebar 
      v-model:isOpen="isMobileSidebarOpen" 
      activeItem="reports" 
      @logout="handleLogout" 
    />

    <!-- MAIN PAGE CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Component -->
      <Topbar 
        title="รายงานการเข้าเรียน" 
        :currentDateText="currentDateText" 
        :teacherProfile="teacherProfile" 
        @toggleSidebar="isMobileSidebarOpen = true" 
        @logout="handleLogout" 
      />

      <!-- MAIN SCROLLABLE CONTENT -->
      <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">

        <div class="space-y-6">
          
          <!-- Welcome Header Card -->
          <section class="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-100/50">
            <div class="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <span class="bg-white/20 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase inline-block">
                  ATTENDANCE REPORTS
                </span>
                <h2 class="font-fredoka text-2xl sm:text-3xl font-extrabold leading-tight">
                  รายงานและสถิติเวลาเรียน
                </h2>
                <p class="font-nunito text-xs sm:text-sm text-emerald-50/90 font-medium">
                  คุณครูสามารถตรวจสอบเปอร์เซ็นต์การเข้าเรียน สถิติการสาย ขาดเรียน และลาของนักเรียนแบบรายบุคคลหรือภาพรวมชั้นเรียนตามช่วยเวลาที่กำหนด
                </p>
              </div>

              <!-- Quick Actions -->
              <div class="flex flex-wrap gap-2.5 flex-shrink-0 w-full lg:w-auto">
                <button 
                  @click="handleExport('excel')"
                  class="flex-1 lg:flex-initial bg-white/15 hover:bg-white/25 border border-white/20 text-white font-fredoka font-bold text-xs px-4 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ส่งออก Excel</span>
                </button>
                <button 
                  @click="handleExport('pdf')"
                  class="flex-1 lg:flex-initial bg-white text-[#059669] hover:bg-emerald-50 font-fredoka font-bold text-xs px-4 py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>พิมพ์รายงาน PDF</span>
                </button>
              </div>
            </div>
          </section>

          <!-- FILTERS PANEL -->
          <section class="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div class="flex flex-col sm:flex-row gap-4 w-full items-center">
              
              <!-- Custom Classroom Selector -->
              <div class="relative w-full sm:w-64">
                <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1 pl-1">เลือกห้องเรียน</label>
                <button 
                  type="button"
                  @click="showClassSelectPopover = !showClassSelectPopover; showStartDatePopover = false; showEndDatePopover = false"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#10B981] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer"
                >
                  <span class="truncate">{{ selectedClassroom ? selectedClassroom.name : 'เลือกห้องเรียน' }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180 text-[#10B981]': showClassSelectPopover }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <transition name="pop-up">
                  <div 
                    v-if="showClassSelectPopover" 
                    class="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100/80 rounded-2xl shadow-xl p-1.5 space-y-1"
                  >
                    <button
                      v-for="cls in classrooms"
                      :key="cls.id"
                      type="button"
                      @click="selectedClassroomId = cls.id; showClassSelectPopover = false"
                      :class="[
                        'w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer',
                        selectedClassroomId === cls.id 
                          ? 'bg-emerald-500/5 text-[#059669]' 
                          : 'hover:bg-slate-50 text-slate-700'
                      ]"
                    >
                      <span class="flex flex-col">
                        <span class="font-fredoka font-bold text-xs sm:text-sm" :class="selectedClassroomId === cls.id ? 'text-[#059669]' : 'text-slate-800'">{{ cls.name }}</span>
                        <span class="text-[10px]" :class="selectedClassroomId === cls.id ? 'text-emerald-400' : 'text-slate-400'">{{ cls.subject }}</span>
                      </span>
                      <svg v-if="selectedClassroomId === cls.id" class="w-4.5 h-4.5 text-[#059669]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>
                  </div>
                </transition>
              </div>

              <!-- Start Date Picker -->
              <div class="relative w-full sm:w-48">
                <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1 pl-1">ตั้งแต่วันที่</label>
                <button 
                  type="button"
                  @click="showStartDatePopover = !showStartDatePopover; showClassSelectPopover = false; showEndDatePopover = false"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#10B981] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer"
                >
                  <span>{{ formatDateThaiShort(startDateStr) }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-slate-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </button>

                <transition name="pop-up">
                  <div v-if="showStartDatePopover" class="absolute left-0 z-30 mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 w-72">
                    <div class="flex items-center justify-between mb-3">
                      <button @click="prevMonth" class="p-1 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">◀</button>
                      <span class="font-fredoka text-xs sm:text-sm font-bold text-slate-800">{{ thaiMonthNames[currentCalendarMonth] }} {{ currentCalendarYear + 543 }}</span>
                      <button @click="nextMonth" class="p-1 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">▶</button>
                    </div>
                    <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                      <span class="text-rose-500">อา</span><span>จ</span><span>อ</span><span>พ</span><span>พฤ</span><span>ศ</span><span class="text-sky-500">ส</span>
                    </div>
                    <div class="grid grid-cols-7 gap-1">
                      <button 
                        v-for="(dayObj, index) in calendarDays" 
                        :key="index"
                        @click="selectStartDate(dayObj)"
                        :class="[
                          'py-1 rounded-lg text-center font-fredoka text-xs font-bold transition-all cursor-pointer',
                          dayObj.isCurrentMonth ? 'text-slate-700 hover:bg-emerald-50 hover:text-[#059669]' : 'text-slate-300',
                          startDateStr === `${dayObj.year}-${String(dayObj.month+1).padStart(2,'0')}-${String(dayObj.day).padStart(2,'0')}` ? 'bg-[#059669] text-white hover:bg-[#059669] hover:text-white' : ''
                        ]"
                      >
                        {{ dayObj.day }}
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- End Date Picker -->
              <div class="relative w-full sm:w-48">
                <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1 pl-1">ถึงวันที่</label>
                <button 
                  type="button"
                  @click="showEndDatePopover = !showEndDatePopover; showClassSelectPopover = false; showStartDatePopover = false"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#10B981] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer"
                >
                  <span>{{ formatDateThaiShort(endDateStr) }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-slate-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </button>

                <transition name="pop-up">
                  <div v-if="showEndDatePopover" class="absolute left-0 z-30 mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 w-72">
                    <div class="flex items-center justify-between mb-3">
                      <button @click="prevMonth" class="p-1 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">◀</button>
                      <span class="font-fredoka text-xs sm:text-sm font-bold text-slate-800">{{ thaiMonthNames[currentCalendarMonth] }} {{ currentCalendarYear + 543 }}</span>
                      <button @click="nextMonth" class="p-1 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">▶</button>
                    </div>
                    <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                      <span class="text-rose-500">อา</span><span>จ</span><span>อ</span><span>พ</span><span>พฤ</span><span>ศ</span><span class="text-sky-500">ส</span>
                    </div>
                    <div class="grid grid-cols-7 gap-1">
                      <button 
                        v-for="(dayObj, index) in calendarDays" 
                        :key="index"
                        @click="selectEndDate(dayObj)"
                        :class="[
                          'py-1 rounded-lg text-center font-fredoka text-xs font-bold transition-all cursor-pointer',
                          dayObj.isCurrentMonth ? 'text-slate-700 hover:bg-emerald-50 hover:text-[#059669]' : 'text-slate-300',
                          endDateStr === `${dayObj.year}-${String(dayObj.month+1).padStart(2,'0')}-${String(dayObj.day).padStart(2,'0')}` ? 'bg-[#059669] text-white hover:bg-[#059669] hover:text-white' : ''
                        ]"
                      >
                        {{ dayObj.day }}
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

            </div>
          </section>

          <!-- OVERVIEW PROGRESS SVG CHART -->
          <section class="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <!-- Circular Progress Card -->
            <div class="md:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
              <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">อัตราเข้าเรียนเฉลี่ย</span>
              
              <!-- Circular Progress SVG -->
              <div class="relative w-36 h-36 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <!-- Background Track -->
                  <circle cx="50" cy="50" r="40" stroke="#F1F5F9" stroke-width="8" fill="transparent" />
                  <!-- Progress Path -->
                  <circle cx="50" cy="50" r="40" stroke="#10B981" stroke-width="8" fill="transparent" 
                          stroke-dasharray="251.2" 
                          :stroke-dashoffset="251.2 - (251.2 * aggregateStats.avgRate) / 100" 
                          stroke-linecap="round"
                          class="transition-all duration-1000" />
                </svg>
                <div class="absolute flex flex-col items-center justify-center">
                  <span class="font-fredoka text-3xl font-extrabold text-slate-800 leading-none">{{ aggregateStats.avgRate }}%</span>
                  <span class="text-[9px] text-emerald-600 font-extrabold tracking-wide uppercase mt-1">Excellent</span>
                </div>
              </div>

              <div class="text-xs text-slate-400 font-semibold leading-relaxed">
                ภาพรวมอัตราการเข้าแถวและคาบเรียนของนักเรียนห้อง {{ selectedClassroom?.name }}
              </div>
            </div>

            <!-- Breakdown Bars Card -->
            <div class="md:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-4">สัดส่วนสรุปเวลารวม</span>
                
                <div class="space-y-4.5">
                  <!-- Present Bar -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-bold text-slate-700">
                      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>มาเรียน</span>
                      <span>{{ aggregateStats.presentPct }}%</span>
                    </div>
                    <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-500 rounded-full transition-all duration-700" :style="{ width: `${aggregateStats.presentPct}%` }"></div>
                    </div>
                  </div>

                  <!-- Late Bar -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-bold text-slate-700">
                      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>สาย</span>
                      <span>{{ aggregateStats.latePct }}%</span>
                    </div>
                    <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-400 rounded-full transition-all duration-700" :style="{ width: `${aggregateStats.latePct}%` }"></div>
                    </div>
                  </div>

                  <!-- Leave Bar -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-bold text-slate-700">
                      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>ลา</span>
                      <span>{{ aggregateStats.leavePct }}%</span>
                    </div>
                    <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-400 rounded-full transition-all duration-700" :style="{ width: `${aggregateStats.leavePct}%` }"></div>
                    </div>
                  </div>

                  <!-- Absent Bar -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-bold text-slate-700">
                      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>ขาดเรียน</span>
                      <span>{{ aggregateStats.absentPct }}%</span>
                    </div>
                    <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div class="h-full bg-rose-500 rounded-full transition-all duration-700" :style="{ width: `${aggregateStats.absentPct}%` }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>

          <!-- DETAILED ATTENDANCE BREAKDOWN TABLE -->
          <section class="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div class="p-5 border-b border-slate-50 flex items-center justify-between">
              <h4 class="font-fredoka text-sm sm:text-base font-extrabold text-slate-800">
                รายละเอียดการเข้าเรียนรายบุคคล
              </h4>
              <span class="text-[10px] text-slate-400 font-bold">ห้องเรียน: {{ selectedClassroom?.name }}</span>
            </div>

            <div class="overflow-x-auto w-full">
              <table class="w-full border-collapse text-left text-slate-600">
                <thead class="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th scope="col" class="py-4 px-6 text-center w-20">เลขที่</th>
                    <th scope="col" class="py-4 px-4">ชื่อ-นามสกุล</th>
                    <th scope="col" class="py-4 px-4 text-center w-24 text-emerald-600">มาเรียน (วัน)</th>
                    <th scope="col" class="py-4 px-4 text-center w-24 text-amber-500">สาย (วัน)</th>
                    <th scope="col" class="py-4 px-4 text-center w-24 text-indigo-500">ลา (วัน)</th>
                    <th scope="col" class="py-4 px-4 text-center w-24 text-rose-500">ขาด (วัน)</th>
                    <th scope="col" class="py-4 px-4 text-center w-36">คิดเป็นเปอร์เซ็นต์</th>
                    <th scope="col" class="py-4 px-6 text-center w-28">ผลการประเมิน</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-xs sm:text-sm font-semibold">
                  <tr 
                    v-for="student in studentsReportData" 
                    :key="student.id"
                    class="hover:bg-slate-50/40 transition-colors"
                  >
                    <!-- Student No -->
                    <td class="py-4 px-6 text-center font-fredoka font-bold text-slate-800">
                      {{ student.no }}
                    </td>

                    <!-- Student Name -->
                    <td class="py-4 px-4">
                      <div class="font-fredoka font-bold text-slate-800 text-sm">
                        {{ student.prefix }}{{ student.firstName }} {{ student.lastName }}
                      </div>
                      <span class="text-[9px] text-slate-400 font-bold block mt-0.5">ID: #{{ student.id }}</span>
                    </td>

                    <!-- Present -->
                    <td class="py-4 px-4 text-center text-emerald-600 font-bold font-fredoka">
                      {{ student.presentCount }}
                    </td>

                    <!-- Late -->
                    <td class="py-4 px-4 text-center text-amber-500 font-bold font-fredoka">
                      {{ student.lateCount }}
                    </td>

                    <!-- Leave -->
                    <td class="py-4 px-4 text-center text-indigo-500 font-bold font-fredoka">
                      {{ student.leaveCount }}
                    </td>

                    <!-- Absent -->
                    <td class="py-4 px-4 text-center text-rose-500 font-bold font-fredoka">
                      {{ student.absentCount }}
                    </td>

                    <!-- Percent rate -->
                    <td class="py-4 px-4 text-center font-fredoka font-bold text-slate-800">
                      {{ student.attendanceRate }}%
                    </td>

                    <!-- Result assessment based on 80% threshold -->
                    <td class="py-4 px-6 text-center">
                      <span 
                        :class="[
                          'text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block w-20',
                          student.attendanceRate >= 80 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                            : 'bg-rose-50 border-rose-100 text-rose-500'
                        ]"
                      >
                        {{ student.attendanceRate >= 80 ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์' }}
                      </span>
                    </td>

                  </tr>
                </tbody>
              </table>
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

      <!-- Cute Loading Overlay -->
      <LoadingOverlay :show="isExporting" text="กำลังสร้างและส่งออกรายงานประมวลผล..." />

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

/* Pop-up animation */
.pop-up-enter-active, .pop-up-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-up-enter-from, .pop-up-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
