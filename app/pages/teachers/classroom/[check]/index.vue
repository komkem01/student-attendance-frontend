<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

useHead({
  title: 'เช็คชื่อนักเรียน - Student Attendance System',
  meta: [
    { name: 'description', content: 'ระบบจัดการห้องเรียน บันทึกเวลาเรียน และตรวจสอบรายงานการเข้าเรียนสำหรับคุณครู' }
  ]
})

const route = useRoute()
const classId = computed(() => parseInt(route.params.check as string))

// State for Mobile Sidebar Toggle
const isMobileSidebarOpen = ref(false)

// State for Logout Modal
const isLogoutModalOpen = ref(false)

// State for Page Loading
const isLoading = ref(true)

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

// Detailed Classrooms List with Nested Students Data shared globally
const classrooms = useState('classrooms', () => [
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

// Target classroom selected from dynamic param ID
const selectedClassroom = computed(() => {
  return classrooms.value.find(cls => cls.id === classId.value) || null
})

// Temporary local copy of students being edited during check-in session
const editingStudents = ref<any[]>([])

// Search & Filter state for students inside active check-in
const studentSearchQuery = ref('')
const studentFilterStatus = ref<'all' | 'present' | 'absent' | 'late' | 'leave' | 'unchecked'>('all')

// Initial layout rendering & redirection if class doesn't exist
onMounted(async () => {
  isLoading.value = true
  // Mock loading delay to demonstrate the cute mascot animation
  await new Promise(resolve => setTimeout(resolve, 800))
  
  if (!selectedClassroom.value) {
    showToast('ไม่พบข้อมูลห้องเรียนนี้ กำลังพากลับ...', 'error')
    setTimeout(() => {
      navigateTo('/teachers/classroom')
    }, 1500)
    isLoading.value = false
    return
  }
  // Deep copy student list so edit is not written directly to main state until saved
  editingStudents.value = JSON.parse(JSON.stringify(selectedClassroom.value.students))
  isLoading.value = false
})

// Filtered students inside active check-in
const filteredStudents = computed(() => {
  if (!selectedClassroom.value) return []
  return editingStudents.value.filter(student => {
    const fullName = `${student.prefix} ${student.firstName} ${student.lastName}`
    const matchesSearch = fullName.toLowerCase().includes(studentSearchQuery.value.toLowerCase()) || 
                          student.no.toString() === studentSearchQuery.value
                          
    const matchesStatus = studentFilterStatus.value === 'all' ||
                          (studentFilterStatus.value === 'unchecked' && student.status === '') ||
                          (studentFilterStatus.value === 'present' && student.status === 'present') ||
                          (studentFilterStatus.value === 'absent' && student.status === 'absent') ||
                          (studentFilterStatus.value === 'late' && student.status === 'late') ||
                          (studentFilterStatus.value === 'leave' && student.status === 'leave')
                          
    return matchesSearch && matchesStatus
  })
})

// Live statistics of active check-in class
const activeCheckinStats = computed(() => {
  const total = editingStudents.value.length
  const checked = editingStudents.value.filter(s => s.status !== '').length
  const present = editingStudents.value.filter(s => s.status === 'present').length
  const absent = editingStudents.value.filter(s => s.status === 'absent').length
  const late = editingStudents.value.filter(s => s.status === 'late').length
  const leave = editingStudents.value.filter(s => s.status === 'leave').length
  return { total, checked, present, absent, late, leave }
})

// Active check-in progress percentage
const activeCheckinProgress = computed(() => {
  if (activeCheckinStats.value.total === 0) return 0
  return Math.round((activeCheckinStats.value.checked / activeCheckinStats.value.total) * 100)
})

// Check if all students are marked
const isAllChecked = computed(() => {
  return activeCheckinStats.value.checked === activeCheckinStats.value.total
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

// Thai initial parser (skipping leading vowels)
const getThaiInitial = (word: string) => {
  if (!word) return ''
  const leadingVowels = ['เ', 'แ', 'โ', 'ใ', 'ไ']
  if (leadingVowels.includes(word.charAt(0)) && word.length > 1) {
    return word.charAt(1)
  }
  return word.charAt(0)
}

// Quick action: Mark all unchecked students as present
const markAllPresent = () => {
  editingStudents.value.forEach(s => {
    if (s.status === '') {
      s.status = 'present'
      s.details = ''
    }
  })
  showToast('บันทึก "มาเรียน" สำหรับนักเรียนที่เหลือแล้ว', 'success')
}

// Quick action: Clear all selections
const clearAllStatus = () => {
  editingStudents.value.forEach(s => {
    s.status = ''
    s.details = ''
  })
  showToast('ล้างรายการบันทึกสถานะทั้งหมดแล้ว', 'warning')
}

// Status selection actions
const setStudentStatus = (studentId: number, status: 'present' | 'absent' | 'late' | 'leave') => {
  const student = editingStudents.value.find(s => s.id === studentId)
  if (student) {
    student.status = status
    if (status === 'late') {
      student.details = '15' // default late 15 minutes
    } else if (status === 'leave') {
      student.details = 'sick' // default leave reason: sick
    } else {
      student.details = ''
    }
  }
}

// Set late minute helper
const setLateMinutes = (studentId: number, minutes: string) => {
  const student = editingStudents.value.find(s => s.id === studentId)
  if (student) {
    student.details = minutes
  }
}

// Set leave reason helper
const setLeaveReason = (studentId: number, reason: string) => {
  const student = editingStudents.value.find(s => s.id === studentId)
  if (student) {
    student.details = reason
  }
}

// Save attendance data back to main classrooms state
const isSaving = ref(false)
const saveAttendance = async () => {
  if (!selectedClassroom.value) return
  
  isSaving.value = true
  // Mock API Call delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const clsIndex = classrooms.value.findIndex(c => c.id === classId.value)
  if (clsIndex !== -1) {
    const targetClass = classrooms.value[clsIndex]
    if (targetClass) {
      // Save state back
      targetClass.students = JSON.parse(JSON.stringify(editingStudents.value))
      targetClass.status = 'completed'
      
      // Set checked time text
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const mins = now.getMinutes().toString().padStart(2, '0')
      targetClass.checkedTime = `เช็คชื่อเมื่อ ${hours}:${mins} น.`
    }
  }
  
  isSaving.value = false
  showToast('บันทึกเวลาเรียนเสร็จสมบูรณ์เรียบร้อย', 'success')
  
  // Return to list view
  setTimeout(() => {
    navigateTo('/teachers/classroom')
  }, 500)
}

// Cancel editing and return to list view
const cancelCheckIn = () => {
  showToast('ยกเลิกการแก้ไขข้อมูลเช็คชื่อ', 'info')
  setTimeout(() => {
    navigateTo('/teachers/classroom')
  }, 300)
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
        title="เช็คชื่อนักเรียน" 
        :currentDateText="currentDateText" 
        :teacherProfile="teacherProfile" 
        @toggleSidebar="isMobileSidebarOpen = true" 
        @logout="handleLogout" 
      />

      <!-- MAIN SCROLLABLE CONTENT -->
      <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">

        <div v-if="!isLoading && selectedClassroom" class="space-y-6">
          
          <!-- Check-in Page Header Card (Back Arrow and Class Details) -->
          <section class="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <!-- Back Button -->
              <button 
                @click="cancelCheckIn"
                class="w-10 h-10 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4.5 h-4.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>

              <div>
                <h3 class="font-fredoka text-base sm:text-lg font-extrabold text-slate-800 leading-none">
                  บันทึกเวลาเรียน: {{ selectedClassroom.name }}
                </h3>
                <span class="text-[10px] text-slate-400 font-bold block mt-1.5 uppercase">
                  {{ selectedClassroom.subject }} • คาบเรียน {{ selectedClassroom.time }}
                </span>
              </div>
            </div>

            <!-- Action button bar -->
            <div class="flex flex-wrap gap-2.5">
              <button 
                @click="markAllPresent"
                class="bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-600 font-fredoka font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                มาเรียนที่เหลือทั้งหมด
              </button>
              <button 
                @click="clearAllStatus"
                class="bg-rose-50/50 hover:bg-rose-50 border border-rose-100 text-rose-500 font-fredoka font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                ล้างสถานะเช็คชื่อ
              </button>
            </div>
          </section>

          <!-- PROGRESS TRACKER AND SUMMARY CARD -->
          <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Attendance progress progress bar (Left: 2/3 width) -->
            <div class="bg-white border border-slate-100 rounded-3xl p-5 md:col-span-2 shadow-xs space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 font-bold uppercase block">ความคืบหน้าการบันทึกข้อมูล</span>
                  <h5 class="font-fredoka text-sm font-bold text-slate-700 mt-1">
                    เช็คชื่อแล้ว {{ activeCheckinStats.checked }} / {{ activeCheckinStats.total }} คน
                  </h5>
                </div>
                <span 
                  :class="[
                    'text-xs font-extrabold px-3 py-1 rounded-full border',
                    isAllChecked ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                  ]"
                >
                  {{ isAllChecked ? 'เช็คชื่อเสร็จสมบูรณ์' : 'อยู่ระหว่างดำเนินการ' }}
                </span>
              </div>

              <!-- Progress bar container -->
              <div class="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden relative">
                <div 
                  class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-300"
                  :style="{ width: `${activeCheckinProgress}%` }"
                ></div>
                <span class="absolute inset-0 flex items-center justify-center font-fredoka text-[9px] font-extrabold text-slate-600/90 leading-none">
                  {{ activeCheckinProgress }}%
                </span>
              </div>
            </div>

            <!-- Attendance Metrics Count Summary (Right: 1/3 width) -->
            <div class="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div class="grid grid-cols-4 gap-2 w-full text-center">
                <!-- Present -->
                <div class="space-y-1">
                  <span class="text-[9px] text-slate-400 font-bold uppercase block">มาเรียน</span>
                  <span class="font-fredoka text-lg font-extrabold text-emerald-500 leading-none bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100/50 block">
                    {{ activeCheckinStats.present }}
                  </span>
                </div>
                <!-- Absent -->
                <div class="space-y-1">
                  <span class="text-[9px] text-slate-400 font-bold uppercase block">ขาดเรียน</span>
                  <span class="font-fredoka text-lg font-extrabold text-rose-500 leading-none bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-100/50 block">
                    {{ activeCheckinStats.absent }}
                  </span>
                </div>
                <!-- Late -->
                <div class="space-y-1">
                  <span class="text-[9px] text-slate-400 font-bold uppercase block">มาสาย</span>
                  <span class="font-fredoka text-lg font-extrabold text-sky-500 leading-none bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-100/50 block">
                    {{ activeCheckinStats.late }}
                  </span>
                </div>
                <!-- Leave -->
                <div class="space-y-1">
                  <span class="text-[9px] text-slate-400 font-bold uppercase block">ลา</span>
                  <span class="font-fredoka text-lg font-extrabold text-amber-500 leading-none bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100/50 block">
                    {{ activeCheckinStats.leave }}
                  </span>
                </div>
              </div>
            </div>

          </section>

          <!-- STUDENT LIST FILTERS AND CONTROLS -->
          <section class="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
            <!-- Search bar -->
            <div class="relative w-full lg:max-w-xs">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </span>
              <input 
                type="text" 
                v-model="studentSearchQuery"
                placeholder="ค้นหาเลขที่ หรือ ชื่อนักเรียน..."
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#FF758F] focus:bg-white transition-all duration-200"
              />
            </div>

            <!-- Filter tabs -->
            <div class="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-100/60 rounded-xl w-full lg:w-auto overflow-x-auto">
              <button 
                @click="studentFilterStatus = 'all'"
                :class="[
                  'flex-1 lg:flex-initial text-center px-3 py-1.5 rounded-lg font-fredoka font-bold text-[11px] sm:text-xs transition-colors cursor-pointer whitespace-nowrap',
                  studentFilterStatus === 'all' ? 'bg-white shadow-xs text-[#FF758F]' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                ทั้งหมด
              </button>
              <button 
                @click="studentFilterStatus = 'unchecked'"
                :class="[
                  'flex-1 lg:flex-initial text-center px-3 py-1.5 rounded-lg font-fredoka font-bold text-[11px] sm:text-xs transition-colors cursor-pointer whitespace-nowrap',
                  studentFilterStatus === 'unchecked' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                ยังไม่ได้เช็คชื่อ
              </button>
              <button 
                @click="studentFilterStatus = 'present'"
                :class="[
                  'flex-1 lg:flex-initial text-center px-3 py-1.5 rounded-lg font-fredoka font-bold text-[11px] sm:text-xs transition-colors cursor-pointer whitespace-nowrap',
                  studentFilterStatus === 'present' ? 'bg-white shadow-xs text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                มาเรียน
              </button>
              <button 
                @click="studentFilterStatus = 'absent'"
                :class="[
                  'flex-1 lg:flex-initial text-center px-3 py-1.5 rounded-lg font-fredoka font-bold text-[11px] sm:text-xs transition-colors cursor-pointer whitespace-nowrap',
                  studentFilterStatus === 'absent' ? 'bg-white shadow-xs text-rose-500' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                ขาด
              </button>
              <button 
                @click="studentFilterStatus = 'late'"
                :class="[
                  'flex-1 lg:flex-initial text-center px-3 py-1.5 rounded-lg font-fredoka font-bold text-[11px] sm:text-xs transition-colors cursor-pointer whitespace-nowrap',
                  studentFilterStatus === 'late' ? 'bg-white shadow-xs text-sky-600' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                สาย
              </button>
              <button 
                @click="studentFilterStatus = 'leave'"
                :class="[
                  'flex-1 lg:flex-initial text-center px-3 py-1.5 rounded-lg font-fredoka font-bold text-[11px] sm:text-xs transition-colors cursor-pointer whitespace-nowrap',
                  studentFilterStatus === 'leave' ? 'bg-white shadow-xs text-amber-500' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                ลา
              </button>
            </div>
          </section>

          <!-- STUDENT ROWS / LIST -->
          <section class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
            
            <div 
              v-for="student in filteredStudents" 
              :key="student.id"
              class="p-4 sm:p-5 transition-colors duration-150 hover:bg-slate-50/50"
            >
              <!-- Main student details and actions row -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <!-- Info (Left) -->
                <div class="flex items-center gap-3.5 min-w-0">
                  <!-- Student Number -->
                  <span class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100/70 text-slate-500 flex items-center justify-center font-fredoka font-extrabold text-[11px] sm:text-xs flex-shrink-0">
                    {{ student.no }}
                  </span>
                  <!-- Initial Avatar -->
                  <div 
                    :class="[
                      'w-10 h-10 rounded-2xl flex items-center justify-center font-fredoka font-extrabold text-xs flex-shrink-0 border',
                      student.status === 'present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      student.status === 'absent' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                      student.status === 'late' ? 'bg-sky-50 border-sky-100 text-sky-600' :
                      student.status === 'leave' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                      'bg-slate-50 border-slate-200/50 text-slate-400'
                    ]"
                  >
                    {{ getThaiInitial(student.firstName) }}{{ getThaiInitial(student.lastName) }}
                  </div>
                  <!-- Name -->
                  <div class="min-w-0">
                    <p class="font-nunito text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                      {{ student.prefix }} {{ student.firstName }} {{ student.lastName }}
                    </p>
                    <span class="text-[9px] text-slate-400 font-bold block mt-0.5">
                      สถานะ: 
                      <span v-if="student.status === 'present'" class="text-emerald-500 font-extrabold">มาเรียน</span>
                      <span v-else-if="student.status === 'absent'" class="text-rose-500 font-extrabold">ขาดเรียน</span>
                      <span v-else-if="student.status === 'late'" class="text-sky-500 font-extrabold">มาสาย ({{ student.details }} นาที)</span>
                      <span v-else-if="student.status === 'leave'" class="text-amber-500 font-extrabold">ลา ({{ student.details === 'sick' ? 'ลาป่วย' : 'ลากิจ' }})</span>
                      <span v-else class="text-slate-400 font-semibold">ยังไม่ได้ระบุ</span>
                    </span>
                  </div>
                </div>

                <!-- Actions (Right) -->
                <div class="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto w-full sm:w-auto">
                  <!-- Present Button -->
                  <button 
                    @click="setStudentStatus(student.id, 'present')"
                    :class="[
                      'flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-fredoka font-extrabold text-[10px] sm:text-xs border transition-all cursor-pointer',
                      student.status === 'present' 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                        : 'bg-white border-slate-200/60 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                    ]"
                  >
                    มาเรียน
                  </button>
                  
                  <!-- Absent Button -->
                  <button 
                    @click="setStudentStatus(student.id, 'absent')"
                    :class="[
                      'flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-fredoka font-extrabold text-[10px] sm:text-xs border transition-all cursor-pointer',
                      student.status === 'absent' 
                        ? 'bg-rose-500 border-rose-500 text-white shadow-xs' 
                        : 'bg-white border-slate-200/60 text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'
                    ]"
                  >
                    ขาด
                  </button>

                  <!-- Late Button -->
                  <button 
                    @click="setStudentStatus(student.id, 'late')"
                    :class="[
                      'flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-fredoka font-extrabold text-[10px] sm:text-xs border transition-all cursor-pointer',
                      student.status === 'late' 
                        ? 'bg-sky-500 border-sky-500 text-white shadow-xs' 
                        : 'bg-white border-slate-200/60 text-slate-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200'
                    ]"
                  >
                    สาย
                  </button>

                  <!-- Leave Button -->
                  <button 
                    @click="setStudentStatus(student.id, 'leave')"
                    :class="[
                      'flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-fredoka font-extrabold text-[10px] sm:text-xs border transition-all cursor-pointer',
                      student.status === 'leave' 
                        ? 'bg-amber-500 border-amber-500 text-white shadow-xs' 
                        : 'bg-white border-slate-200/60 text-slate-500 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200'
                    ]"
                  >
                    ลา
                  </button>
                </div>
              </div>

              <!-- Expanded sub-actions row for 'late' or 'leave' status -->
              <transition name="expand">
                <div 
                  v-if="student.status === 'late' || student.status === 'leave'"
                  class="mt-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center text-xs font-semibold text-slate-600"
                >
                  <!-- Late Time Inputs -->
                  <template v-if="student.status === 'late'">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-sky-500 flex-shrink-0">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span>ระบุเวลาที่สาย:</span>
                      <input 
                        type="number" 
                        :value="student.details"
                        @input="e => setLateMinutes(student.id, (e.target as HTMLInputElement).value)"
                        class="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-fredoka text-xs focus:outline-hidden focus:border-sky-500"
                      />
                      <span>นาที</span>
                    </div>
                    <!-- Quick presets -->
                    <div class="flex items-center gap-1.5">
                      <button 
                        @click="setLateMinutes(student.id, '5')"
                        :class="['px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer', student.details === '5' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-slate-200 hover:bg-sky-50 text-slate-500']"
                      >
                        +5 นาที
                      </button>
                      <button 
                        @click="setLateMinutes(student.id, '15')"
                        :class="['px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer', student.details === '15' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-slate-200 hover:bg-sky-50 text-slate-500']"
                      >
                        +15 นาที
                      </button>
                      <button 
                        @click="setLateMinutes(student.id, '30')"
                        :class="['px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer', student.details === '30' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-slate-200 hover:bg-sky-50 text-slate-500']"
                      >
                        +30 นาที
                      </button>
                    </div>
                  </template>

                  <!-- Leave Reason Inputs -->
                  <template v-if="student.status === 'leave'">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-amber-500 flex-shrink-0">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.11.786.291 1.13.074.14.16.268.254.386.09.112.194.21.306.298a2.66 2.66 0 0 0 .386.254c.344.18.716.29 1.13.29.23 0 .454-.034.664-.1a3.774 3.774 0 0 1-.664 1.1c-.074.14-.16.268-.254.386a2.66 2.66 0 0 1-.306.298 2.66 2.66 0 0 1-.386.254 3.774 3.774 0 0 1-1.13.29c-.23 0-.454-.034-.664-.1a3.774 3.774 0 0 1 .1 2.314c.065-.21.1-.433.1-.664 0-.414-.11-.786-.291-1.13a2.66 2.66 0 0 0-.254-.386 2.66 2.66 0 0 0-.306-.298 2.66 2.66 0 0 0-.386-.254 3.774 3.774 0 0 0-1.13-.29c-.23 0-.454.034-.664.1a3.774 3.774 0 0 0 .664-1.1c.074-.14.16-.268.254-.386a2.66 2.66 0 0 0 .306-.298c.112-.089.21-.193.298-.306.09-.112.194-.21.306-.298a2.66 2.66 0 0 0 .386-.254 3.774 3.774 0 0 0 1.13-.29c.23 0 .454.035.664.1a3.774 3.774 0 0 0-.1-2.314Z" />
                      </svg>
                      <span>ประเภทการลา:</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button 
                        @click="setLeaveReason(student.id, 'sick')"
                        :class="['px-3 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer', student.details === 'sick' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 hover:bg-amber-50 text-slate-500']"
                      >
                        ลาป่วย (Sick Leave)
                      </button>
                      <button 
                        @click="setLeaveReason(student.id, 'business')"
                        :class="['px-3 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer', student.details === 'business' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 hover:bg-amber-50 text-slate-500']"
                      >
                        ลากิจ (Personal Leave)
                      </button>
                    </div>
                  </template>
                </div>
              </transition>
            </div>

            <!-- Empty state inside active student list checkin -->
            <div v-if="filteredStudents.length === 0" class="p-12 text-center text-slate-400 space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-12 h-12 text-slate-300 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <h5 class="font-fredoka text-sm font-bold text-slate-600">ไม่พบข้อมูลนักเรียนที่ต้องการ</h5>
              <p class="font-nunito text-[11px] text-slate-400">ลองใช้คำค้นหาหรือเปลี่ยนแถบตัวกรองอื่น</p>
            </div>

          </section>

          <!-- STICKY ACTION PANEL AT THE BOTTOM -->
          <section class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-4 z-20 backdrop-blur-md bg-white/95">
            <div class="hidden sm:flex flex-col text-left">
              <span class="text-[9px] text-slate-400 font-bold uppercase">CHECK-IN STATUS CONFIRMATION</span>
              <span class="text-xs font-bold text-slate-700 mt-1">
                เช็คชื่อนักเรียนแล้ว: {{ activeCheckinStats.checked }} จากทั้งหมด {{ activeCheckinStats.total }} คน
              </span>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <button 
                @click="cancelCheckIn"
                :disabled="isSaving"
                class="flex-1 sm:flex-initial bg-slate-50 hover:bg-slate-100 border border-slate-100/70 text-slate-500 font-fredoka font-bold text-xs px-6 py-3 rounded-xl transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button 
                @click="saveAttendance"
                :disabled="isSaving"
                class="flex-1 sm:flex-initial bg-[#FF758F] hover:bg-[#FF4D6D] text-white font-fredoka font-bold text-xs px-8 py-3 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-pink-100 flex items-center justify-center gap-2 disabled:bg-pink-400"
              >
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกเวลาเรียน' }}</span>
              </button>
            </div>
          </section>

        </div>

        <!-- Class Not Found View -->
        <div v-else-if="!isLoading" class="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center text-slate-400 space-y-4 max-w-md mx-auto my-10 shadow-xs">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-16 h-16 text-rose-300 mx-auto">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <h4 class="font-fredoka text-base font-extrabold text-slate-700">ไม่พบห้องเรียนที่ต้องการเข้าถึง</h4>
          <p class="font-nunito text-xs text-slate-500 leading-relaxed">
            อาจเกิดจากการกรอกรหัสห้องเรียนไม่ถูกต้อง หรือห้องเรียนนี้ไม่ได้ลงทะเบียนในวิชาที่คุณรับผิดชอบ
          </p>
          <button 
            @click="navigateTo('/teachers/classroom')"
            class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fredoka font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            กลับหน้าชั้นเรียน
          </button>
        </div>

      </main>

      <!-- Cute Loading Overlay -->
      <LoadingOverlay :show="isLoading || isSaving" :text="isSaving ? 'กำลังบันทึกข้อมูล...' : 'กำลังโหลดข้อมูลห้องเรียน...'" />

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

/* Sub-row expand animations */
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease-out;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
