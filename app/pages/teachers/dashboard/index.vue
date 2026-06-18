<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'แดชบอร์ดคุณครู - Student Attendance System',
  meta: [
    { name: 'description', content: 'ระบบจัดการห้องเรียน บันทึกเวลาเรียน และตรวจสอบรายงานการเข้าเรียนสำหรับคุณครู' }
  ]
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

// State for Mobile Sidebar Toggle
const isMobileSidebarOpen = ref(false)

// State for User Profile Dropdown
const isProfileDropdownOpen = ref(false)

// Mock Teacher Profile Data
const teacherProfile = ref({
  name: 'สมชาย ใจดี',
  title: 'คุณครูประจำวิชาคณิตศาสตร์',
  school: 'โรงเรียนสตรีวิทยา',
  subject: 'คณิตศาสตร์',
  email: 'somchai.jai@email.com',
  avatarInitials: 'สช'
})

// Stats Summary Card Data
const stats = computed(() => [
  {
    title: 'อัตราการเข้าเรียนเฉลี่ย',
    value: '94.2%',
    desc: 'เพิ่มขึ้น 1.5% จากสัปดาห์ที่แล้ว',
    trend: 'up',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    iconPath: 'M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z'
  },
  {
    title: 'เช็คชื่อนักเรียนวันนี้',
    value: '80 / 120 คน',
    desc: 'เช็คชื่อแล้ว 2 จาก 3 ห้องเรียน',
    trend: 'neutral',
    colorClass: 'text-sky-600 bg-sky-50 border-sky-100',
    iconBg: 'bg-sky-500/10 text-sky-600',
    iconPath: 'M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.11.786.291 1.13.074.14.16.268.254.386.09.112.194.21.306.298a2.66 2.66 0 0 0 .386.254c.344.18.716.29 1.13.29.23 0 .454-.034.664-.1a3.774 3.774 0 0 1-.664 1.1c-.074.14-.16.268-.254.386a2.66 2.66 0 0 1-.306.298 2.66 2.66 0 0 1-.386.254 3.774 3.774 0 0 1-1.13.29c-.23 0-.454-.034-.664-.1a3.774 3.774 0 0 1 .1 2.314c.065-.21.1-.433.1-.664 0-.414-.11-.786-.291-1.13a2.66 2.66 0 0 0-.254-.386 2.66 2.66 0 0 0-.306-.298 2.66 2.66 0 0 0-.386-.254 3.774 3.774 0 0 0-1.13-.29c-.23 0-.454.034-.664.1a3.774 3.774 0 0 0 .664-1.1c.074-.14.16-.268.254-.386a2.66 2.66 0 0 0 .306-.298c.112-.089.21-.193.298-.306.09-.112.194-.21.306-.298a2.66 2.66 0 0 0 .386-.254 3.774 3.774 0 0 0 1.13-.29c.23 0 .454.035.664.1a3.774 3.774 0 0 0-.1-2.314Z'
  },
  {
    title: 'ขาดเรียนวันนี้',
    value: '5 คน',
    desc: 'ม.1/1 (2 คน), ม.2/3 (3 คน)',
    trend: 'down',
    colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
    iconBg: 'bg-rose-500/10 text-rose-600',
    iconPath: 'M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.11A5.98 5.98 0 0 1 10.375 21 5.98 5.98 0 0 1 4 19.235Z'
  },
  {
    title: 'สาย / ลาเรียน',
    value: '2 คน',
    desc: 'มาสาย 1 คน, ลาป่วย 1 คน',
    trend: 'warning',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
    iconBg: 'bg-amber-500/10 text-amber-600',
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
  }
])

// Classrooms details list
const classrooms = ref([
  {
    id: 1,
    name: 'ชั้นมัธยมศึกษาปีที่ 1/1',
    subject: 'คณิตศาสตร์พื้นฐาน (ค21101)',
    studentsCount: 40,
    checkedCount: 40,
    status: 'completed',
    attendanceRate: 95.0,
    time: '08:15 - 09:10 น.',
    checkedTime: 'เช็คชื่อเมื่อ 08:30 น.'
  },
  {
    id: 2,
    name: 'ชั้นมัธยมศึกษาปีที่ 1/2',
    subject: 'คณิตศาสตร์พื้นฐาน (ค21101)',
    studentsCount: 40,
    checkedCount: 40,
    status: 'completed',
    attendanceRate: 97.5,
    time: '09:10 - 10:05 น.',
    checkedTime: 'เช็คชื่อเมื่อ 09:20 น.'
  },
  {
    id: 3,
    name: 'ชั้นมัธยมศึกษาปีที่ 2/3',
    subject: 'คณิตศาสตร์เพิ่มเติม (ค22201)',
    studentsCount: 40,
    checkedCount: 0,
    status: 'pending',
    attendanceRate: 0,
    time: '13:00 - 13:55 น.',
    checkedTime: 'ยังไม่ได้เช็คชื่อ'
  }
])

// Today exceptions logs (Absentees / Leaves)
const exceptions = ref([
  {
    id: 1,
    name: 'ด.ช. นันทวัฒน์ สมบูรณ์',
    room: 'ม.1/1',
    status: 'absent',
    statusText: 'ขาดเรียน',
    badgeClass: 'bg-rose-50 border-rose-100 text-rose-600',
    time: '08:15 น.'
  },
  {
    id: 2,
    name: 'ด.ญ. วรินดา แก้วมณี',
    room: 'ม.2/3',
    status: 'leave',
    statusText: 'ลาป่วย',
    badgeClass: 'bg-amber-50 border-amber-100 text-amber-600',
    time: '08:20 น.'
  },
  {
    id: 3,
    name: 'ด.ช. กิตติพงษ์ รักดี',
    room: 'ม.1/2',
    status: 'late',
    statusText: 'มาสาย (15 นาที)',
    badgeClass: 'bg-sky-50 border-sky-100 text-sky-600',
    time: '09:25 น.'
  },
  {
    id: 4,
    name: 'ด.ช. พีรพงษ์ สุขใจ',
    room: 'ม.1/1',
    status: 'absent',
    statusText: 'ขาดเรียน',
    badgeClass: 'bg-rose-50 border-rose-100 text-rose-600',
    time: '08:15 น.'
  }
])

const activeTab = ref('dashboard')

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

const handleStartCheck = (cls: any) => {
  showToast(`กำลังเข้าสู่ระบบเช็คชื่อสำหรับ ${cls.name}`, 'success')
  setTimeout(() => {
    navigateTo({
      path: '/teachers/classroom',
      query: { classId: cls.id }
    })
  }, 800)
}

const isLogoutModalOpen = ref(false)

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
            <!-- SweetAlert animated style bar -->
            <div 
              :class="[
                'absolute bottom-0 left-0 h-1 animate-toast-progress w-full',
                toast.type === 'success' ? 'bg-[#1E7D65]' : 
                toast.type === 'error' ? 'bg-[#A3001E]' : 
                toast.type === 'info' ? 'bg-[#2B6CB0]' :
                'bg-[#805B00]'
              ]"
            ></div>

            <!-- Professional Vector SVGs instead of Emojis -->
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

    <!-- BACKGROUND LIGHT DECORATIVE BLUR BUBBLES -->
    <div class="fixed top-0 right-0 w-[400px] h-[400px] bg-pink-100/35 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <!-- Sidebar Component (Desktop and Mobile Drawer) -->
    <Sidebar 
      v-model:isOpen="isMobileSidebarOpen" 
      :activeItem="activeTab" 
      @select="activeTab = $event" 
      @logout="handleLogout" 
    />

    <!-- MAIN PAGE CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Component (Title, Date, Mobile Toggle, and Profile Dropdown) -->
      <Topbar 
        title="หน้าแรก" 
        :currentDateText="currentDateText" 
        :teacherProfile="teacherProfile" 
        @toggleSidebar="isMobileSidebarOpen = true" 
        @logout="handleLogout" 
      />

      <!-- MAIN CONTENT -->
      <main class="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto">
        
        <!-- HERO WELCOME BANNER CARD -->
        <section class="bg-gradient-to-br from-[#FF758F] to-[#FF4D6D] rounded-[2rem] p-6 sm:p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-pink-100/50">
          <!-- Background decoration -->
          <div class="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
          <div class="absolute left-1/3 bottom-0 w-60 h-60 bg-pink-300/20 rounded-full blur-2xl pointer-events-none -mb-20"></div>

          <div class="relative z-10 space-y-2 max-w-2xl">
            <span class="bg-white/20 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase inline-block">
              TEACHER DASHBOARD
            </span>
            <h2 class="font-fredoka text-2xl sm:text-3xl font-extrabold leading-tight">
              สวัสดีครับ, ครู{{ teacherProfile.name }}
            </h2>
            <p class="font-nunito text-xs sm:text-sm text-pink-50/90 font-medium">
              วันนี้มีวิชาคณิตศาสตร์ที่ต้องจัดการเช็คชื่อเข้าแถว 3 คาบเรียน ยอดรวมนักเรียนเข้าข่ายประเมิน 120 คน
            </p>
          </div>
        </section>
        <!-- STATISTICS GRID CARD -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="(item, idx) in stats" 
            :key="idx"
            class="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-all duration-200"
          >
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', item.iconBg]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.iconPath" />
              </svg>
            </div>
            
            <div class="min-w-0">
              <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">{{ item.title }}</span>
              <span class="font-fredoka text-xl font-extrabold text-slate-800 leading-snug block mt-0.5">{{ item.value }}</span>
              <span class="text-[10px] text-slate-500 font-medium truncate block">{{ item.desc }}</span>
            </div>
          </div>
        </section>

        <!-- TWO COLUMNS GRID (MAIN WORKSPACE) -->
        <div class="grid grid-cols-12 gap-6">
          
          <!-- LEFT COLUMN: CLASSROOMS (8/12) -->
          <section class="col-span-12 lg:col-span-8 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-fredoka text-base font-extrabold text-slate-800 leading-none">ห้องเรียนของฉัน</h3>
                <span class="text-[10px] text-slate-400 font-bold block mt-1.5 uppercase">MY RESPONSIBLE CLASSES</span>
              </div>
              <button 
                @click="showToast('กำลังโหลดข้อมูลห้องเรียนใหม่ล่าสุด', 'success')"
                class="text-xs font-bold text-[#FF758F] hover:text-[#FF4D6D] transition-colors cursor-pointer"
              >
                ดูทั้งหมด
              </button>
            </div>

            <!-- Class Cards Loop -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="cls in classrooms" 
                :key="cls.id"
                class="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                <!-- Card Header -->
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    <span 
                      :class="[
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        cls.status === 'completed' 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : 'bg-amber-50 border-amber-100 text-amber-600'
                      ]"
                    >
                      {{ cls.status === 'completed' ? 'เช็คชื่อเสร็จสิ้น' : 'รอเช็คชื่อ' }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {{ cls.time }}
                    </span>
                  </div>
                  <h4 class="font-fredoka text-sm font-extrabold text-slate-800 mt-2 truncate">{{ cls.name }}</h4>
                  <p class="font-nunito text-[11px] text-slate-400 font-semibold truncate">{{ cls.subject }}</p>
                </div>

                <!-- Stats / Attendance Progress -->
                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-500 font-medium">ความคืบหน้าการเช็คชื่อ</span>
                    <span class="font-bold text-slate-700">{{ cls.checkedCount }}/{{ cls.studentsCount }} คน</span>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      :class="[
                        'h-full rounded-full transition-all duration-500',
                        cls.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'
                      ]"
                      :style="{ width: `${(cls.checkedCount / cls.studentsCount) * 100}%` }"
                    ></div>
                  </div>

                  <!-- Footer info -->
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

                <!-- Action Button -->
                <div class="mt-5 pt-3 border-t border-slate-50 flex gap-2">
                  <button 
                    @click="showToast('กำลังดาวน์โหลดรายงานเช็คชื่อรายวิชา', 'success')"
                    class="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 font-fredoka font-bold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    รายงาน
                  </button>
                  <button 
                    @click="handleStartCheck(cls)"
                    :class="[
                      'flex-1 font-fredoka font-bold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer',
                      cls.status === 'completed' 
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                        : 'bg-[#FF758F] hover:bg-[#FF4D6D] text-white'
                    ]"
                  >
                    {{ cls.status === 'completed' ? 'เช็คชื่ออีกครั้ง' : 'เริ่มเช็คชื่อ' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- RIGHT COLUMN: RECENT EXCEPTIONS (4/12) -->
          <section class="col-span-12 lg:col-span-4 space-y-4">
            <div>
              <h3 class="font-fredoka text-base font-extrabold text-slate-800 leading-none">นักเรียนที่มาสาย / ลาเรียน</h3>
              <span class="text-[10px] text-slate-400 font-bold block mt-1.5 uppercase">EXCEPTIONS REPORT TODAY</span>
            </div>

            <!-- Exception Student Cards -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-3">
              <div 
                v-for="exp in exceptions" 
                :key="exp.id"
                class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100/60"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div 
                    :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center font-fredoka font-extrabold text-xs flex-shrink-0',
                      exp.status === 'absent' ? 'bg-rose-100/50 text-rose-600' :
                      exp.status === 'leave' ? 'bg-amber-100/50 text-amber-600' :
                      'bg-sky-100/50 text-sky-600'
                    ]"
                  >
                    {{ exp.name.charAt(4) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-[11px] font-bold text-slate-700 truncate leading-snug">{{ exp.name }}</p>
                    <span class="text-[9px] text-slate-400 font-semibold block mt-0.5">ห้อง {{ exp.room }} • {{ exp.time }}</span>
                  </div>
                </div>

                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0', exp.badgeClass]">
                  {{ exp.statusText }}
                </span>
              </div>

              <!-- Empty state mockup -->
              <div v-if="exceptions.length === 0" class="text-center py-6">
                <span class="text-xs text-slate-400 font-medium">ไม่มีข้อมูลยกเว้นสำหรับวันนี้</span>
              </div>
            </div>

            <!-- System Info Alert Box -->
            <div class="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 flex gap-3.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.063 1.06l-.041.02-.08.04H12v.002h.008a.75.75 0 0 1 1.5 0v.008h-.008v-.008ZM12 3v18M3 12h18" />
                </svg>
              </div>
              <div class="min-w-0">
                <h5 class="text-xs font-bold text-slate-700 leading-snug">แจ้งเตือนระบบซิงก์ข้อมูล</h5>
                <p class="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">
                  ระบบทำการอัปเดตข้อมูลนักเรียนและเวลาเรียนเสร็จสมบูรณ์ ทุกรายวิชาได้บันทึกเข้าระบบส่วนกลางเรียบร้อยแล้ว
                </p>
              </div>
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

/* Dropdown animation */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Drawer mobile slide transitions */
.drawer-enter-active, .drawer-leave-active {
  transition: all 0.3s ease-out;
}
.drawer-enter-from, .drawer-leave-to {
  transform: translateX(-100%);
}
</style>
