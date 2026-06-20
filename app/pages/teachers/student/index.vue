<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'ระบบรายชื่อนักเรียน | Student Attendance System',
  meta: [
    { name: 'description', content: 'หน้าจัดการรายชื่อนักเรียน ค้นหา จัดการข้อมูลห้องเรียน และแก้ไขข้อมูลประวัตินักเรียนในระบบ' }
  ]
})

// State for Mobile Sidebar Toggle
const isMobileSidebarOpen = ref(false)

// State for Logout Confirmation Modal
const isLogoutModalOpen = ref(false)

const { teacherProfile, requireAuth, logout } = useTeacherSession()
requireAuth()

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

// Flat student mapper attaching parent metadata
const allStudentsMapped = computed(() => {
  return classrooms.value.flatMap(cls => {
    return cls.students.map(s => ({
      ...s,
      classId: cls.id,
      className: cls.name,
      classSubject: cls.subject
    }))
  })
})

// Statistics computed helpers
const totalStudentsCount = computed(() => allStudentsMapped.value.length)
const boysCount = computed(() => {
  return allStudentsMapped.value.filter(s => s.prefix === 'ด.ช.' || s.prefix === 'นาย').length
})
const girlsCount = computed(() => {
  return allStudentsMapped.value.filter(s => s.prefix === 'ด.ญ.' || s.prefix === 'น.ส.' || s.prefix === 'นางสาว').length
})
const totalClassroomsCount = computed(() => classrooms.value.length)

// Dynamic avatar style based on student name hash
const getAvatarStyle = (firstName: string, lastName: string) => {
  const combined = firstName + lastName
  const palettes = [
    'bg-[#FFEBEF] text-[#FF4D6D] border-[#FFCCD5]',
    'bg-[#EBF8FF] text-[#2B6CB0] border-[#BEE3F8]',
    'bg-[#E6FFFA] text-[#319795] border-[#B2F5EA]',
    'bg-[#FFFFF0] text-[#B7791F] border-[#FEFCBF]',
    'bg-[#FAF5FF] text-[#6B46C1] border-[#E9D8FD]',
    'bg-[#F0FFF4] text-[#2F855A] border-[#C6F6D5]'
  ]
  let sum = 0
  for (let i = 0; i < combined.length; i++) {
    sum += combined.charCodeAt(i)
  }
  return palettes[sum % palettes.length]
}

// Filters and search states
const searchQuery = ref('')
const selectedClassFilterId = ref<number | 'all'>('all')
const showClassFilterPopover = ref(false)

const selectedClassroomFilterObj = computed(() => {
  if (selectedClassFilterId.value === 'all') return null
  return classrooms.value.find(c => c.id === selectedClassFilterId.value)
})

// Filtered Students List
const filteredStudents = computed(() => {
  return allStudentsMapped.value.filter(s => {
    const matchesSearch = 
      s.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      s.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      `${s.prefix}${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.no.toString() === searchQuery.value.trim()
      
    const matchesClass = selectedClassFilterId.value === 'all' || s.classId === selectedClassFilterId.value
    
    return matchesSearch && matchesClass
  }).sort((a, b) => {
    // Sort by class ID first, then by Student No
    if (a.classId !== b.classId) {
      return a.classId - b.classId
    }
    return a.no - b.no
  })
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

// Add Student states & logic
const isAddModalOpen = ref(false)
const newStudentPrefix = ref('ด.ช.')
const newStudentFirstName = ref('')
const newStudentLastName = ref('')
const newStudentClassId = ref<number | null>(null)
const newStudentNo = ref<number | null>(null)
const showAddClassPopover = ref(false)
const isSubmitting = ref(false)

const newStudentSelectedClass = computed(() => {
  if (!newStudentClassId.value) return null
  return classrooms.value.find(c => c.id === newStudentClassId.value)
})

const openAddModal = () => {
  newStudentPrefix.value = 'ด.ช.'
  newStudentFirstName.value = ''
  newStudentLastName.value = ''
  
  // Default to first class if available
  newStudentClassId.value = classrooms.value.length > 0 ? classrooms.value[0].id : null
  
  // Propose next student number
  calculateNextStudentNo()
  
  showAddClassPopover.value = false
  isAddModalOpen.value = true
}

const calculateNextStudentNo = () => {
  if (!newStudentClassId.value) {
    newStudentNo.value = 1
    return
  }
  const targetClass = classrooms.value.find(c => c.id === newStudentClassId.value)
  if (targetClass && targetClass.students.length > 0) {
    const maxNo = Math.max(...targetClass.students.map(s => s.no))
    newStudentNo.value = maxNo + 1
  } else {
    newStudentNo.value = 1
  }
}

// Watch selected class to update next student no suggestion
watch(newStudentClassId, () => {
  calculateNextStudentNo()
})

const handleAddStudent = async () => {
  if (!newStudentFirstName.value.trim() || !newStudentLastName.value.trim() || !newStudentClassId.value || !newStudentNo.value) {
    showToast('กรุณากรอกข้อมูลส่วนตัวของนักเรียนให้ครบถ้วน', 'warning')
    return
  }
  
  isSubmitting.value = true
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const targetClass = classrooms.value.find(c => c.id === newStudentClassId.value)
  if (targetClass) {
    // Check if number already taken
    const noTaken = targetClass.students.some(s => s.no === newStudentNo.value)
    if (noTaken) {
      showToast(`เลขที่ ${newStudentNo.value} ถูกใช้งานในห้องเรียนนี้แล้ว`, 'warning')
      isSubmitting.value = false
      return
    }

    const nextId = Math.max(...allStudentsMapped.value.map(s => s.id), 0) + 1
    targetClass.students.push({
      id: nextId,
      no: newStudentNo.value,
      prefix: newStudentPrefix.value,
      firstName: newStudentFirstName.value.trim(),
      lastName: newStudentLastName.value.trim(),
      status: '', // initially empty status
      details: ''
    })
    
    // Sort array by student No
    targetClass.students.sort((a, b) => a.no - b.no)
    targetClass.studentsCount = targetClass.students.length
    
    showToast(`เพิ่ม ${newStudentFirstName.value} เรียบร้อยแล้ว!`, 'success')
  }
  
  isSubmitting.value = false
  isAddModalOpen.value = false
}

// Edit Student states & logic
const isEditModalOpen = ref(false)
const editingStudentObj = ref<any | null>(null)
const editStudentPrefix = ref('ด.ช.')
const editStudentFirstName = ref('')
const editStudentLastName = ref('')
const editStudentClassId = ref<number | null>(null)
const editStudentNo = ref<number | null>(null)
const showEditClassPopover = ref(false)

const editStudentSelectedClass = computed(() => {
  if (!editStudentClassId.value) return null
  return classrooms.value.find(c => c.id === editStudentClassId.value)
})

const openEditModal = (student: any) => {
  editingStudentObj.value = student
  editStudentPrefix.value = student.prefix
  editStudentFirstName.value = student.firstName
  editStudentLastName.value = student.lastName
  editStudentClassId.value = student.classId
  editStudentNo.value = student.no
  
  showEditClassPopover.value = false
  isEditModalOpen.value = true
}

const handleUpdateStudent = async () => {
  if (!editStudentFirstName.value.trim() || !editStudentLastName.value.trim() || !editStudentClassId.value || !editStudentNo.value) {
    showToast('กรุณากรอกข้อมูลส่วนตัวของนักเรียนให้ครบถ้วน', 'warning')
    return
  }
  
  isSubmitting.value = true
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const currentClass = classrooms.value.find(c => c.id === editingStudentObj.value.classId)
  const targetClass = classrooms.value.find(c => c.id === editStudentClassId.value)
  
  if (currentClass && targetClass) {
    // Check if moving to new class, and number is taken in new class
    if (editingStudentObj.value.classId !== editStudentClassId.value || editingStudentObj.value.no !== editStudentNo.value) {
      const noTaken = targetClass.students.some(s => s.id !== editingStudentObj.value.id && s.no === editStudentNo.value)
      if (noTaken) {
        showToast(`เลขที่ ${editStudentNo.value} ถูกใช้งานในห้องเรียนนี้แล้ว`, 'warning')
        isSubmitting.value = false
        return
      }
    }

    // Remove from current class
    currentClass.students = currentClass.students.filter(s => s.id !== editingStudentObj.value.id)
    currentClass.studentsCount = currentClass.students.length
    
    // Add to target class (with updated details)
    targetClass.students.push({
      id: editingStudentObj.value.id,
      no: editStudentNo.value,
      prefix: editStudentPrefix.value,
      firstName: editStudentFirstName.value.trim(),
      lastName: editStudentLastName.value.trim(),
      status: editingStudentObj.value.status || '',
      details: editingStudentObj.value.details || ''
    })
    
    // Sort array by student No
    targetClass.students.sort((a, b) => a.no - b.no)
    targetClass.studentsCount = targetClass.students.length
    
    showToast(`แก้ไขข้อมูลประวัตินักเรียนเรียบร้อยแล้ว!`, 'success')
  }
  
  isSubmitting.value = false
  isEditModalOpen.value = false
}

// Delete Student states & logic
const isDeleteModalOpen = ref(false)
const deletingStudentObj = ref<any | null>(null)

const confirmDeleteStudent = (student: any) => {
  deletingStudentObj.value = student
  isDeleteModalOpen.value = true
}

const handleDeleteStudent = async () => {
  if (!deletingStudentObj.value) return
  
  isSubmitting.value = true
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const targetClass = classrooms.value.find(c => c.id === deletingStudentObj.value.classId)
  if (targetClass) {
    targetClass.students = targetClass.students.filter(s => s.id !== deletingStudentObj.value.id)
    targetClass.studentsCount = targetClass.students.length
    showToast(`ลบข้อมูลนักเรียนออกจากห้อง ${targetClass.name} สำเร็จ`, 'info')
  }
  
  isSubmitting.value = false
  isDeleteModalOpen.value = false
}

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
    <div class="fixed top-0 right-0 w-[400px] h-[400px] bg-sky-100/35 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <!-- Sidebar Layout Component -->
    <Sidebar 
      v-model:isOpen="isMobileSidebarOpen" 
      activeItem="students" 
      @logout="handleLogout" 
    />

    <!-- MAIN PAGE CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Component -->
      <Topbar 
        title="จัดการรายชื่อนักเรียน" 
        :currentDateText="currentDateText" 
        :teacherProfile="teacherProfile" 
        @toggleSidebar="isMobileSidebarOpen = true" 
        @logout="handleLogout" 
      />

      <!-- MAIN SCROLLABLE CONTENT -->
      <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">

        <div class="space-y-6">
          
          <!-- Directory Header Card -->
          <section class="bg-gradient-to-br from-[#4EA8DE] to-[#4361EE] rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-100/50">
            <div class="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <span class="bg-white/20 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase inline-block">
                  STUDENT DIRECTORY
                </span>
                <h2 class="font-fredoka text-2xl sm:text-3xl font-extrabold leading-tight">
                  ทะเบียนรายชื่อนักเรียนทั้งหมด
                </h2>
                <p class="font-nunito text-xs sm:text-sm text-blue-50/90 font-medium">
                  คุณครูสามารถตรวจสอบรายชื่อนักเรียนทั้งหมดในห้องเรียนที่รับผิดชอบ ทำการค้นหาประวัติ เพิ่มรายชื่อนักเรียนเข้าสู่ชั้นเรียน หรือทำการปรับปรุงแก้ไขข้อมูลให้ถูกต้องได้จากหน้านี้
                </p>
              </div>

              <!-- Quick Actions -->
              <div class="flex-shrink-0 w-full lg:w-auto">
                <button 
                  @click="openAddModal"
                  class="w-full lg:w-auto bg-white text-[#4361EE] hover:bg-blue-50 font-fredoka font-bold text-xs px-5 py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4.5 h-4.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                  <span>เพิ่มนักเรียนใหม่</span>
                </button>
              </div>
            </div>
          </section>

          <!-- STATS CARDS -->
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Students -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">นักเรียนทั้งหมด</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5">{{ totalStudentsCount }} คน</span>
              </div>
            </div>

            <!-- Boys Count -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">นักเรียนชาย (ด.ช./นาย)</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5 text-sky-600">{{ boysCount }} คน</span>
              </div>
            </div>

            <!-- Girls Count -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">นักเรียนหญิง (ด.ญ./น.ส.)</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5 text-pink-600">{{ girlsCount }} คน</span>
              </div>
            </div>

            <!-- Total Classes -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">ห้องเรียนที่สอน</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5 text-indigo-600">{{ totalClassroomsCount }} ห้อง</span>
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
                v-model="searchQuery"
                placeholder="ค้นหาตามชื่อ นามสกุล หรือเลขที่..."
                class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#4EA8DE] focus:bg-white transition-all duration-200"
              />
            </div>

            <!-- Custom classroom filter dropdown -->
            <div class="relative w-full md:w-64">
              <button 
                type="button"
                @click="showClassFilterPopover = !showClassFilterPopover"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#4EA8DE] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer"
              >
                <span class="truncate">
                  {{ selectedClassroomFilterObj ? selectedClassroomFilterObj.name : 'นักเรียนทั้งหมด ทุกห้องเรียน' }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180 text-[#4EA8DE]': showClassFilterPopover }">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <transition name="pop-up">
                <div 
                  v-if="showClassFilterPopover" 
                  class="absolute right-0 left-0 md:left-auto md:w-72 z-30 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100/80 rounded-2xl shadow-xl p-1.5 space-y-1"
                >
                  <!-- All Students option -->
                  <button
                    type="button"
                    @click="selectedClassFilterId = 'all'; showClassFilterPopover = false"
                    :class="[
                      'w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer',
                      selectedClassFilterId === 'all' 
                        ? 'bg-blue-500/5 text-[#4361EE]' 
                        : 'hover:bg-slate-50 text-slate-700'
                    ]"
                  >
                    <span class="flex flex-col">
                      <span class="font-fredoka font-bold text-xs sm:text-sm" :class="selectedClassFilterId === 'all' ? 'text-[#4361EE]' : 'text-slate-800'">นักเรียนทั้งหมด ทุกห้องเรียน</span>
                      <span class="text-[10px]" :class="selectedClassFilterId === 'all' ? 'text-blue-400' : 'text-slate-400'">แสดงรายชื่อนักเรียนรวมกันทุกชั้นเรียน</span>
                    </span>
                    <svg v-if="selectedClassFilterId === 'all'" class="w-4.5 h-4.5 text-[#4361EE]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>

                  <!-- Class options -->
                  <button
                    v-for="cls in classrooms"
                    :key="cls.id"
                    type="button"
                    @click="selectedClassFilterId = cls.id; showClassFilterPopover = false"
                    :class="[
                      'w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer',
                      selectedClassFilterId === cls.id 
                        ? 'bg-blue-500/5 text-[#4361EE]' 
                        : 'hover:bg-slate-50 text-slate-700'
                    ]"
                  >
                    <span class="flex flex-col">
                      <span class="font-fredoka font-bold text-xs sm:text-sm" :class="selectedClassFilterId === cls.id ? 'text-[#4361EE]' : 'text-slate-800'">{{ cls.name }}</span>
                      <span class="text-[10px]" :class="selectedClassFilterId === cls.id ? 'text-blue-400' : 'text-slate-400'">{{ cls.subject }}</span>
                    </span>
                    <svg v-if="selectedClassFilterId === cls.id" class="w-4.5 h-4.5 text-[#4361EE]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>
                </div>
              </transition>
            </div>
          </section>

          <!-- STUDENTS LIST TABLE -->
          <section class="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div class="overflow-x-auto w-full">
              <table class="w-full border-collapse text-left text-slate-600">
                <thead class="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th scope="col" class="py-4 px-6 text-center w-20">เลขที่</th>
                    <th scope="col" class="py-4 px-4">นักเรียน</th>
                    <th scope="col" class="py-4 px-4">ห้องเรียนเป้าหมาย</th>
                    <th scope="col" class="py-4 px-4 text-center w-28">สถานะเข้าแถว</th>
                    <th scope="col" class="py-4 px-6 text-center w-32">จัดการข้อมูล</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-xs sm:text-sm font-semibold">
                  
                  <tr 
                    v-for="student in filteredStudents" 
                    :key="student.id"
                    class="hover:bg-slate-50/40 transition-colors"
                  >
                    <!-- Student No. -->
                    <td class="py-4.5 px-6 text-center font-fredoka font-bold text-slate-800">
                      {{ student.no }}
                    </td>

                    <!-- Student Profile & Avatar -->
                    <td class="py-4.5 px-4">
                      <div class="flex items-center gap-3">
                        <div 
                          :class="[
                            'w-9.5 h-9.5 rounded-full flex items-center justify-center font-fredoka font-extrabold text-[11px] sm:text-xs border flex-shrink-0 shadow-xs uppercase',
                            getAvatarStyle(student.firstName, student.lastName)
                          ]"
                        >
                          {{ student.firstName.slice(0, 2) }}
                        </div>
                        <div>
                          <p class="font-fredoka font-bold text-slate-800 text-sm">
                            {{ student.prefix }} {{ student.firstName }} {{ student.lastName }}
                          </p>
                          <span class="text-[10px] text-slate-400 block mt-0.5">รหัสประจำตัว: #{{ student.id }}</span>
                        </div>
                      </div>
                    </td>

                    <!-- Classroom -->
                    <td class="py-4.5 px-4">
                      <span class="bg-[#EBF8FF] text-[#2B6CB0] text-[10px] font-bold font-fredoka px-2.5 py-1 rounded-full border border-[#BEE3F8]">
                        {{ student.className }}
                      </span>
                      <span class="text-[10px] text-slate-400 block mt-1 truncate max-w-[180px]">{{ student.classSubject }}</span>
                    </td>

                    <!-- Latest Attendance Status -->
                    <td class="py-4.5 px-4 text-center">
                      <span 
                        v-if="student.status" 
                        :class="[
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block w-20',
                          student.status === 'present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          student.status === 'absent' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                          student.status === 'late' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                          'bg-indigo-50 border-indigo-100 text-indigo-500'
                        ]"
                      >
                        {{ 
                          student.status === 'present' ? 'มาเรียน' :
                          student.status === 'absent' ? 'ขาดเรียน' :
                          student.status === 'late' ? 'สาย' : 'ลา'
                        }}
                      </span>
                      <span v-else class="text-[10px] text-slate-400 font-medium">ไม่มีข้อมูลวันนี้</span>
                    </td>

                    <!-- Actions -->
                    <td class="py-4.5 px-6 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button 
                          @click="openEditModal(student)"
                          class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-[#4EA8DE] border border-slate-100 hover:border-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                          title="แก้ไขรายชื่อ"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button 
                          @click="confirmDeleteStudent(student)"
                          class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-100 hover:border-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                          title="ลบรายชื่อ"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty state -->
                  <tr v-if="filteredStudents.length === 0">
                    <td colspan="5" class="py-12 px-6 text-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-12 h-12 text-slate-300 mx-auto mb-2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      <h5 class="font-fredoka text-sm font-bold text-slate-600">ไม่พบรายชื่อนักเรียนที่ค้นหา</h5>
                      <p class="font-nunito text-[11px] text-slate-400">กรุณาลองป้อนคำค้นหาอื่นๆ หรือเลือกตัวกรองห้องเรียนใหม่</p>
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

      <!-- Delete Confirmation Modal -->
      <ConfirmModal 
        :isOpen="isDeleteModalOpen"
        title="ลบข้อมูลนักเรียน"
        :message="deletingStudentObj ? `ต้องการลบข้อมูล ${deletingStudentObj.prefix}${deletingStudentObj.firstName} ${deletingStudentObj.lastName} ออกจากชั้นเรียน ${deletingStudentObj.className} ใช่หรือไม่?` : 'คุณครูแน่ใจว่าต้องการลบข้อมูลนักเรียนคนนี้หรือไม่?'"
        confirmText="ลบรายชื่อ"
        cancelText="ยกเลิก"
        type="danger"
        @confirm="handleDeleteStudent"
        @cancel="isDeleteModalOpen = false"
      />

      <!-- Cute Loading Overlay -->
      <LoadingOverlay :show="isSubmitting" text="กำลังดำเนินการบันทึกข้อมูล..." />

      <!-- Add Student Modal -->
      <Teleport to="body">
        <transition name="modal-fade">
          <div v-if="isAddModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="isAddModalOpen = false"></div>

            <div class="relative w-full max-w-md bg-white rounded-[2.2rem] border border-slate-100 shadow-2xl p-6 sm:p-8 transform transition-all duration-300 scale-100 flex flex-col z-10 overflow-hidden">
              <!-- Background decorations -->
              <div class="absolute -top-10 -left-10 w-24 h-24 bg-blue-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>
              <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-pink-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>

              <!-- Header -->
              <div class="mb-6 text-center flex flex-col items-center">
                <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#4EA8DE] flex items-center justify-center mb-3 shadow-inner shadow-blue-200/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                </div>
                <h4 class="font-fredoka text-lg font-extrabold text-slate-800 leading-snug">เพิ่มนักเรียนใหม่</h4>
                <p class="font-nunito text-xs text-slate-500 font-semibold mt-1">ป้อนข้อมูลโปรไฟล์นักเรียนและระบุห้องเรียนหลัก</p>
              </div>

              <!-- Form Body -->
              <div class="space-y-4 mb-6">
                
                <!-- Target Class Selector -->
                <div class="space-y-1 relative">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">เข้าเรียนที่ห้องเรียน</label>
                  
                  <!-- Custom Dropdown Button -->
                  <button 
                    type="button"
                    @click="showAddClassPopover = !showAddClassPopover"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-100 hover:border-[#4EA8DE] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <span>
                      <span v-if="newStudentSelectedClass" class="flex flex-col">
                        <span class="font-fredoka font-bold text-slate-800 text-xs sm:text-sm">{{ newStudentSelectedClass.name }}</span>
                        <span class="text-[10px] text-slate-400 mt-0.5">{{ newStudentSelectedClass.subject }}</span>
                      </span>
                      <span v-else class="text-slate-400">เลือกห้องเรียน</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180 text-[#4EA8DE]': showAddClassPopover }">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <!-- Custom Dropdown Options Popover -->
                  <transition name="pop-up">
                    <div 
                      v-if="showAddClassPopover" 
                      class="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100/80 rounded-2xl shadow-xl p-1.5 space-y-1"
                    >
                      <button
                        v-for="cls in classrooms"
                        :key="cls.id"
                        type="button"
                        @click="newStudentClassId = cls.id; showAddClassPopover = false"
                        :class="[
                          'w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer',
                          newStudentClassId === cls.id 
                            ? 'bg-blue-500/5 text-[#4361EE]' 
                            : 'hover:bg-slate-50 text-slate-700'
                        ]"
                      >
                        <span class="flex flex-col">
                          <span class="font-fredoka font-bold text-xs sm:text-sm" :class="newStudentClassId === cls.id ? 'text-[#4361EE]' : 'text-slate-800'">{{ cls.name }}</span>
                          <span class="text-[10px]" :class="newStudentClassId === cls.id ? 'text-blue-400' : 'text-slate-400'">{{ cls.subject }}</span>
                        </span>
                        
                        <svg v-if="newStudentClassId === cls.id" class="w-4.5 h-4.5 text-[#4361EE]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </button>
                    </div>
                  </transition>
                </div>

                <!-- Prefix selection -->
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">คำนำหน้าชื่อ</label>
                  <div class="grid grid-cols-4 gap-2">
                    <button 
                      v-for="pref in ['ด.ช.', 'ด.ญ.', 'นาย', 'น.ส.']" 
                      :key="pref"
                      type="button"
                      @click="newStudentPrefix = pref"
                      :class="[
                        'py-2 text-center rounded-xl font-fredoka font-bold text-xs cursor-pointer transition-all border',
                        newStudentPrefix === pref 
                          ? 'bg-blue-500/10 border-blue-200 text-[#4361EE] shadow-sm' 
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                      ]"
                    >
                      {{ pref }}
                    </button>
                  </div>
                </div>

                <!-- Student First & Last Names -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">ชื่อจริง</label>
                    <input 
                      type="text" 
                      v-model="newStudentFirstName"
                      placeholder="เช่น ธนวัตร"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#4EA8DE] focus:bg-white transition-all duration-200"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">นามสกุล</label>
                    <input 
                      type="text" 
                      v-model="newStudentLastName"
                      placeholder="เช่น สิทธิมงคล"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#4EA8DE] focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                <!-- Student Number -->
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">เลขที่นักเรียน</label>
                  <input 
                    type="text" 
                    v-model="newStudentNo"
                    placeholder="เช่น 16"
                    min="1"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#4EA8DE] focus:bg-white transition-all duration-200 font-fredoka font-bold"
                  />
                </div>

              </div>

              <!-- Footer Actions -->
              <div class="flex gap-3 mt-2">
                <button 
                  @click="isAddModalOpen = false"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
                >
                  ยกเลิก
                </button>
                <button 
                  @click="handleAddStudent"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#4EA8DE] to-[#4361EE] hover:from-[#4361EE] hover:to-[#4EA8DE] text-white font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center shadow-md shadow-blue-100"
                >
                  เพิ่มรายชื่อ
                </button>
              </div>

            </div>
          </div>
        </transition>
      </Teleport>

      <!-- Edit Student Modal -->
      <Teleport to="body">
        <transition name="modal-fade">
          <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="isEditModalOpen = false"></div>

            <div class="relative w-full max-w-md bg-white rounded-[2.2rem] border border-slate-100 shadow-2xl p-6 sm:p-8 transform transition-all duration-300 scale-100 flex flex-col z-10 overflow-hidden">
              <!-- Background decorations -->
              <div class="absolute -top-10 -left-10 w-24 h-24 bg-blue-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>
              <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-pink-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>

              <!-- Header -->
              <div class="mb-6 text-center flex flex-col items-center">
                <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#4EA8DE] flex items-center justify-center mb-3 shadow-inner shadow-blue-200/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </div>
                <h4 class="font-fredoka text-lg font-extrabold text-slate-800 leading-snug">แก้ไขประวัตินักเรียน</h4>
                <p class="font-nunito text-xs text-slate-500 font-semibold mt-1">ทำการปรับปรุงแก้ไขข้อมูลทั่วไปและห้องเรียนของนักเรียน</p>
              </div>

              <!-- Form Body -->
              <div class="space-y-4 mb-6">
                
                <!-- Target Class Selector -->
                <div class="space-y-1 relative">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">เข้าเรียนที่ห้องเรียน</label>
                  
                  <!-- Custom Dropdown Button -->
                  <button 
                    type="button"
                    @click="showEditClassPopover = !showEditClassPopover"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-100 hover:border-[#4EA8DE] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <span>
                      <span v-if="editStudentSelectedClass" class="flex flex-col">
                        <span class="font-fredoka font-bold text-slate-800 text-xs sm:text-sm">{{ editStudentSelectedClass.name }}</span>
                        <span class="text-[10px] text-slate-400 mt-0.5">{{ editStudentSelectedClass.subject }}</span>
                      </span>
                      <span v-else class="text-slate-400">เลือกห้องเรียน</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180 text-[#4EA8DE]': showEditClassPopover }">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <!-- Custom Dropdown Options Popover -->
                  <transition name="pop-up">
                    <div 
                      v-if="showEditClassPopover" 
                      class="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100/80 rounded-2xl shadow-xl p-1.5 space-y-1"
                    >
                      <button
                        v-for="cls in classrooms"
                        :key="cls.id"
                        type="button"
                        @click="editStudentClassId = cls.id; showEditClassPopover = false"
                        :class="[
                          'w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer',
                          editStudentClassId === cls.id 
                            ? 'bg-blue-500/5 text-[#4361EE]' 
                            : 'hover:bg-slate-50 text-slate-700'
                        ]"
                      >
                        <span class="flex flex-col">
                          <span class="font-fredoka font-bold text-xs sm:text-sm" :class="editStudentClassId === cls.id ? 'text-[#4361EE]' : 'text-slate-800'">{{ cls.name }}</span>
                          <span class="text-[10px]" :class="editStudentClassId === cls.id ? 'text-blue-400' : 'text-slate-400'">{{ cls.subject }}</span>
                        </span>
                        
                        <svg v-if="editStudentClassId === cls.id" class="w-4.5 h-4.5 text-[#4361EE]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </button>
                    </div>
                  </transition>
                </div>

                <!-- Prefix selection -->
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">คำนำหน้าชื่อ</label>
                  <div class="grid grid-cols-4 gap-2">
                    <button 
                      v-for="pref in ['ด.ช.', 'ด.ญ.', 'นาย', 'น.ส.']" 
                      :key="pref"
                      type="button"
                      @click="editStudentPrefix = pref"
                      :class="[
                        'py-2 text-center rounded-xl font-fredoka font-bold text-xs cursor-pointer transition-all border',
                        editStudentPrefix === pref 
                          ? 'bg-blue-500/10 border-blue-200 text-[#4361EE] shadow-sm' 
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                      ]"
                    >
                      {{ pref }}
                    </button>
                  </div>
                </div>

                <!-- Student First & Last Names -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">ชื่อจริง</label>
                    <input 
                      type="text" 
                      v-model="editStudentFirstName"
                      placeholder="เช่น ธนวัตร"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#4EA8DE] focus:bg-white transition-all duration-200"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">นามสกุล</label>
                    <input 
                      type="text" 
                      v-model="editStudentLastName"
                      placeholder="เช่น สิทธิมงคล"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#4EA8DE] focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                <!-- Student Number -->
                <div class="space-y-1">
                  <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">เลขที่นักเรียน</label>
                  <input 
                    type="number" 
                    v-model="editStudentNo"
                    placeholder="เช่น 16"
                    min="1"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#4EA8DE] focus:bg-white transition-all duration-200 font-fredoka font-bold"
                  />
                </div>

              </div>

              <!-- Footer Actions -->
              <div class="flex gap-3 mt-2">
                <button 
                  @click="isEditModalOpen = false"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
                >
                  ยกเลิก
                </button>
                <button 
                  @click="handleUpdateStudent"
                  class="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#4EA8DE] to-[#4361EE] hover:from-[#4361EE] hover:to-[#4EA8DE] text-white font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center shadow-md shadow-blue-100"
                >
                  บันทึกข้อมูล
                </button>
              </div>

            </div>
          </div>
        </transition>
      </Teleport>

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
