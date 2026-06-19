<script setup lang="ts">
import { ref, computed, watch } from 'vue'

useHead({
  title: 'เช็คชื่อนักเรียน | Student Attendance System',
  meta: [
    { name: 'description', content: 'ระบบเช็คชื่อนักเรียนจากชื่อสำหรับสารวัตรนักเรียน' }
  ]
})

// Current time & date
const now = ref(new Date())
setInterval(() => { now.value = new Date() }, 1000)

const currentDateText = computed(() => {
  return now.value.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})
const currentTimeText = computed(() => {
  return now.value.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})
const isLateTime = computed(() => {
  const h = now.value.getHours()
  const m = now.value.getMinutes()
  return h > 7 || (h === 7 && m >= 45)
})

// Inspector info
const inspectorName = ref('กิตติพงษ์ แก้วสะอาด')
const inspectorId = ref('S55204')

// ===== MOCK STUDENT DATABASE =====
const allStudents = [
  // ม.1
  { id: 'STD-1001', prefix: 'เด็กชาย', firstName: 'กิตติศักดิ์', lastName: 'สุขสวัสดิ์', grade: 'ม.1', room: '1' },
  { id: 'STD-1002', prefix: 'เด็กหญิง', firstName: 'ปาริชาต', lastName: 'แก้วใส', grade: 'ม.1', room: '1' },
  { id: 'STD-1003', prefix: 'เด็กชาย', firstName: 'ธนกฤต', lastName: 'มีสุข', grade: 'ม.1', room: '2' },
  { id: 'STD-1004', prefix: 'เด็กหญิง', firstName: 'อรนภา', lastName: 'ดวงดี', grade: 'ม.1', room: '2' },
  { id: 'STD-1005', prefix: 'เด็กชาย', firstName: 'ณัฐภัทร', lastName: 'ทองคำ', grade: 'ม.1', room: '3' },
  // ม.2
  { id: 'STD-2001', prefix: 'เด็กชาย', firstName: 'สมหมาย', lastName: 'ยิ้มแย้ม', grade: 'ม.2', room: '1' },
  { id: 'STD-2002', prefix: 'เด็กหญิง', firstName: 'อารียา', lastName: 'ใจดี', grade: 'ม.2', room: '1' },
  { id: 'STD-2003', prefix: 'เด็กชาย', firstName: 'ปกรณ์', lastName: 'สุขใจ', grade: 'ม.2', room: '2' },
  { id: 'STD-2004', prefix: 'เด็กหญิง', firstName: 'สุภาวดี', lastName: 'เจริญพร', grade: 'ม.2', room: '2' },
  { id: 'STD-2005', prefix: 'เด็กชาย', firstName: 'ณรงค์ศักดิ์', lastName: 'รักเรียน', grade: 'ม.2', room: '3' },
  // ม.3
  { id: 'STD-3001', prefix: 'เด็กชาย', firstName: 'พิพัฒน์', lastName: 'ศรีสุข', grade: 'ม.3', room: '1' },
  { id: 'STD-3002', prefix: 'เด็กหญิง', firstName: 'นันทิดา', lastName: 'แก้วมณี', grade: 'ม.3', room: '1' },
  { id: 'STD-3003', prefix: 'เด็กชาย', firstName: 'วรวุฒิ', lastName: 'เพชรงาม', grade: 'ม.3', room: '2' },
  { id: 'STD-3004', prefix: 'เด็กหญิง', firstName: 'ภาวิณี', lastName: 'สุวรรณ', grade: 'ม.3', room: '2' },
  { id: 'STD-3005', prefix: 'เด็กชาย', firstName: 'ชัยวัฒน์', lastName: 'สมบูรณ์', grade: 'ม.3', room: '3' },
  // ม.4
  { id: 'STD-4001', prefix: 'นาย', firstName: 'ธนวัฒน์', lastName: 'ศรีสุข', grade: 'ม.4', room: '1' },
  { id: 'STD-4002', prefix: 'นางสาว', firstName: 'พัชราภา', lastName: 'ทองดี', grade: 'ม.4', room: '1' },
  { id: 'STD-4003', prefix: 'นาย', firstName: 'ณัฐพงษ์', lastName: 'มานะ', grade: 'ม.4', room: '2' },
  { id: 'STD-4004', prefix: 'นางสาว', firstName: 'สุทธิดา', lastName: 'แสงเพชร', grade: 'ม.4', room: '2' },
  { id: 'STD-4005', prefix: 'นาย', firstName: 'อภิชาติ', lastName: 'รักไทย', grade: 'ม.4', room: '3' },
  // ม.5
  { id: 'STD-5001', prefix: 'นาย', firstName: 'วีรภัทร', lastName: 'สุขสวัสดิ์', grade: 'ม.5', room: '1' },
  { id: 'STD-5002', prefix: 'นางสาว', firstName: 'ปิยะรัตน์', lastName: 'แก้วประเสริฐ', grade: 'ม.5', room: '1' },
  { id: 'STD-5003', prefix: 'นาย', firstName: 'ชาญวิทย์', lastName: 'ดวงดี', grade: 'ม.5', room: '2' },
  { id: 'STD-5004', prefix: 'นางสาว', firstName: 'นภัสสร', lastName: 'สุวรรณ', grade: 'ม.5', room: '2' },
  { id: 'STD-5005', prefix: 'นาย', firstName: 'ปรมินทร์', lastName: 'วงศ์ใหญ่', grade: 'ม.5', room: '3' },
  // ม.6
  { id: 'STD-6001', prefix: 'นาย', firstName: 'กฤตภัค', lastName: 'นิยมดี', grade: 'ม.6', room: '1' },
  { id: 'STD-6002', prefix: 'นางสาว', firstName: 'ณัฐวดี', lastName: 'มีสุข', grade: 'ม.6', room: '1' },
  { id: 'STD-6003', prefix: 'นาย', firstName: 'ภูมิพัฒน์', lastName: 'เจริญสุข', grade: 'ม.6', room: '2' },
  { id: 'STD-6004', prefix: 'นางสาว', firstName: 'อาภัสรา', lastName: 'สว่างใจ', grade: 'ม.6', room: '2' },
  { id: 'STD-6005', prefix: 'นาย', firstName: 'ศุภวิชญ์', lastName: 'หมื่นไวย', grade: 'ม.6', room: '3' },
]

// Helper
const getFullName = (s: typeof allStudents[0]) => `${s.prefix}${s.firstName} ${s.lastName}`
const getClassLabel = (s: typeof allStudents[0]) => `${s.grade}/${s.room}`
const getInitials = (s: typeof allStudents[0]) => `${s.firstName[0] ?? ''}${s.lastName[0] ?? ''}`

// ===== SEARCH =====
const searchQuery = ref('')
const isSearchFocused = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allStudents.filter(s => {
    const full = `${s.prefix}${s.firstName}${s.lastName}`.toLowerCase()
    const nameOnly = `${s.firstName}${s.lastName}`.toLowerCase()
    return full.includes(q) || nameOnly.includes(q) || s.id.toLowerCase().includes(q)
  }).slice(0, 8)
})

const showResults = computed(() => isSearchFocused.value && searchQuery.value.trim().length > 0 && searchResults.value.length > 0)

// ===== CHECK-IN HISTORY =====
const checkedInIds = ref<Set<string>>(new Set(['STD-2001', 'STD-3001']))

interface CheckInRecord {
  id: number
  studentId: string
  fullName: string
  classLabel: string
  initials: string
  time: string
  status: 'present' | 'late'
}

const checkInHistory = ref<CheckInRecord[]>([
  {
    id: Date.now() - 20000,
    studentId: 'STD-2001',
    fullName: 'เด็กชายสมหมาย ยิ้มแย้ม',
    classLabel: 'ม.2/1',
    initials: 'สย',
    time: '07:38',
    status: 'present'
  },
  {
    id: Date.now() - 10000,
    studentId: 'STD-3001',
    fullName: 'เด็กชายพิพัฒน์ ศรีสุข',
    classLabel: 'ม.3/1',
    initials: 'พศ',
    time: '07:52',
    status: 'present'
  }
])

// Stats
const presentCount = computed(() => checkInHistory.value.filter(r => r.status === 'present').length)
const lateCount = computed(() => checkInHistory.value.filter(r => r.status === 'late').length)

// ===== CONFIRM MODAL =====
const confirmStudent = ref<typeof allStudents[0] | null>(null)
const isConfirmOpen = ref(false)

const openConfirm = (student: typeof allStudents[0]) => {
  if (checkedInIds.value.has(student.id)) {
    showToast(`${student.firstName} เช็คชื่อแล้วในวันนี้`, 'warning')
    return
  }
  confirmStudent.value = student
  isConfirmOpen.value = true
  searchQuery.value = ''
  isSearchFocused.value = false
}

const confirmCheckIn = (status: 'present' | 'late') => {
  if (!confirmStudent.value) return
  const s = confirmStudent.value
  const record = {
    id: Date.now(),
    studentId: s.id,
    fullName: getFullName(s),
    classLabel: getClassLabel(s),
    initials: getInitials(s),
    time: now.value.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    status
  }
  checkInHistory.value.unshift(record)
  checkedInIds.value.add(s.id)
  isConfirmOpen.value = false
  confirmStudent.value = null
  showToast(
    status === 'present'
      ? `✅ บันทึก ${record.fullName} (${record.classLabel}) มาเรียนตรงเวลา`
      : `⚠️ บันทึก ${record.fullName} (${record.classLabel}) มาสาย`,
    status === 'present' ? 'success' : 'warning'
  )
}

// ===== EDIT RECORD =====
const editRecord = ref<CheckInRecord | null>(null)
const isEditModalOpen = ref(false)

const openEditRecord = (record: CheckInRecord) => {
  editRecord.value = { ...record }
  isEditModalOpen.value = true
}

const applyEditStatus = (newStatus: 'present' | 'late') => {
  if (!editRecord.value) return
  const idx = checkInHistory.value.findIndex(r => r.id === editRecord.value!.id)
  if (idx >= 0) {
    const item = checkInHistory.value[idx]
    if (item) {
      item.status = newStatus
      showToast(
        newStatus === 'present'
          ? `✅ แก้ไขเป็น “ตรงเวลา” สำเร็จแล้ว`
          : `⚠️ แก้ไขเป็น “มาสาย” สำเร็จแล้ว`,
        newStatus === 'present' ? 'success' : 'warning'
      )
    }
  }
  isEditModalOpen.value = false
  editRecord.value = null
}

const deleteRecord = () => {
  if (!editRecord.value) return
  const rec = editRecord.value
  checkInHistory.value = checkInHistory.value.filter(r => r.id !== rec.id)
  checkedInIds.value.delete(rec.studentId)
  isEditModalOpen.value = false
  editRecord.value = null
  showToast(`❌ ยกเลิกการเช็คชื่อ ${rec.fullName} แล้ว`, 'warning')
}

// ===== TOAST =====
const toasts = ref<{ id: number; message: string; type: 'success' | 'error' | 'warning' }[]>([])
let toastId = 0
const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}

const isLogoutModalOpen = ref(false)

const handleLogout = () => {
  isLogoutModalOpen.value = true
}

const confirmLogout = () => {
  isLogoutModalOpen.value = false
  showToast('กำลังออกจากระบบ...', 'success')
  setTimeout(() => navigateTo('/prefect/login'), 1000)
}

// Highlight matching text
const highlight = (text: string, query: string) => {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-indigo-100 text-indigo-700 rounded px-0.5 not-italic font-extrabold">$1</mark>')
}
</script>

<template>
  <div class="min-h-screen bg-[#F0F2FF] font-sans text-slate-700 flex flex-col" @click="isSearchFocused = false">

    <!-- Toast Notifications -->
    <Teleport to="body">
      <div class="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none max-w-sm w-full">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="[
              'pointer-events-auto py-4 px-5 rounded-2xl shadow-xl flex items-center gap-3 border relative overflow-hidden',
              toast.type === 'success' ? 'bg-[#EAFDF8] border-[#A8EEDD] text-[#1E7D65]' :
              toast.type === 'warning' ? 'bg-[#FFF9E6] border-[#FFE29A] text-[#805B00]' :
                                         'bg-[#FFF0F3] border-[#FFCCD5] text-[#A3001E]'
            ]"
          >
            <div :class="['absolute bottom-0 left-0 h-1 animate-toast-progress w-full',
              toast.type === 'success' ? 'bg-[#1E7D65]' : toast.type === 'warning' ? 'bg-[#805B00]' : 'bg-[#A3001E]'
            ]"></div>
            <span class="font-nunito text-xs sm:text-sm font-bold flex-1">{{ toast.message }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- Header -->
    <header class="bg-white/90 backdrop-blur-sm border-b border-slate-100 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
          🛡️
        </div>
        <div>
          <h1 class="font-fredoka text-base font-extrabold text-slate-800 leading-tight">ระบบเช็คชื่อนักเรียน</h1>
          <span class="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">PREFECT CHECK-IN</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Clock -->
        <div class="hidden sm:flex flex-col items-end">
          <span class="font-fredoka text-sm font-extrabold text-slate-800">{{ currentTimeText }}</span>
          <span class="text-[10px] text-slate-400 font-semibold">{{ currentDateText }}</span>
        </div>
        <!-- Late indicator -->
        <div :class="['hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold border', isLateTime ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100']">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="isLateTime ? 'bg-rose-500' : 'bg-emerald-500'"></span>
          {{ isLateTime ? 'ช่วงสาย' : 'ตรงเวลา' }}
        </div>
        <!-- Inspector -->
        <div class="hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5">
          <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-fredoka font-extrabold text-[10px] flex items-center justify-center">
            {{ inspectorName[0] }}
          </div>
          <div>
            <p class="text-xs font-bold text-slate-700 leading-none">{{ inspectorName }}</p>
            <p class="text-[10px] text-indigo-500 font-bold">{{ inspectorId }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="px-3 py-2 text-xs font-fredoka font-bold text-rose-500 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer">
          ออกจากระบบ
        </button>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" @click.stop>

      <!-- Left: Search Panel -->
      <section class="lg:col-span-5 space-y-4">

        <!-- Search Card -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div>
            <h2 class="font-fredoka text-lg font-extrabold text-slate-800 mb-0.5">ค้นหานักเรียน</h2>
            <p class="font-nunito text-xs text-slate-400 font-semibold">พิมพ์ชื่อ นามสกุล หรือรหัสนักเรียนเพื่อเช็คชื่อ</p>
          </div>

          <!-- Search Input -->
          <div class="relative" @click.stop>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                @focus="isSearchFocused = true"
                @click.stop
                type="text"
                placeholder="ค้นหาชื่อนักเรียน..."
                class="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all duration-200"
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Search Results Dropdown -->
            <Transition name="dropdown">
              <div v-if="showResults" class="absolute top-full left-0 right-0 mt-2 bg-white border border-indigo-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <!-- Header -->
                <div class="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                  <span class="font-fredoka text-xs font-bold text-slate-500">พบ {{ searchResults.length }} รายการ</span>
                  <span class="text-xs font-nunito text-slate-400">คลิกเพื่อเช็คชื่อ</span>
                </div>
                <div class="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
                  <button
                    v-for="student in searchResults"
                    :key="student.id"
                    type="button"
                    @click.stop="openConfirm(student)"
                    :class="[
                      'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left group',
                      checkedInIds.has(student.id)
                        ? 'bg-slate-50 opacity-60 cursor-default'
                        : 'hover:bg-indigo-50 hover:shadow-sm'
                    ]"
                  >
                    <!-- Avatar -->
                    <div :class="[
                      'w-10 h-10 rounded-xl font-fredoka font-extrabold text-sm flex items-center justify-center flex-shrink-0',
                      checkedInIds.has(student.id)
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-sm'
                    ]">
                      {{ getInitials(student) }}
                    </div>

                    <!-- Info -->
                    <div class="grow min-w-0">
                      <p
                        class="font-fredoka font-bold text-sm text-slate-800 leading-tight truncate"
                        v-html="highlight(getFullName(student), searchQuery)"
                      ></p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="bg-indigo-100 text-indigo-700 font-fredoka font-bold text-[10px] px-2 py-0.5 rounded-lg">{{ getClassLabel(student) }}</span>
                        <span class="text-slate-400 text-[10px] font-nunito font-semibold">{{ student.id }}</span>
                      </div>
                    </div>

                    <!-- Already checked or check button -->
                    <div class="flex-shrink-0">
                      <span v-if="checkedInIds.has(student.id)" class="text-[10px] font-fredoka font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        เช็คแล้ว
                      </span>
                      <div v-else class="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </Transition>

            <!-- No results -->
            <Transition name="dropdown">
              <div v-if="isSearchFocused && searchQuery.trim().length > 0 && searchResults.length === 0" class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-6 text-center">
                <div class="text-3xl mb-2">🔍</div>
                <p class="font-fredoka font-bold text-slate-500 text-sm">ไม่พบนักเรียน</p>
                <p class="font-nunito text-xs text-slate-400 mt-1">ลองค้นหาด้วยชื่อหรือรหัสที่แตกต่างกัน</p>
              </div>
            </Transition>
          </div>

          <!-- Quick tip -->
          <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex items-start gap-3">
            <span class="text-lg flex-shrink-0">💡</span>
            <div>
              <p class="font-fredoka text-xs font-bold text-indigo-700 mb-0.5">วิธีใช้งาน</p>
              <p class="font-nunito text-[11px] text-indigo-600 leading-relaxed">พิมพ์ชื่อ นามสกุล หรือรหัสนักเรียน ระบบจะค้นหาจากทุกชั้นเรียน คลิกที่ชื่อนักเรียนเพื่อเช็คชื่อ</p>
            </div>
          </div>
        </div>

        <!-- Stats Card -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <p class="font-fredoka text-2xl font-extrabold text-[#2F3E46]">{{ checkInHistory.length }}</p>
            <p class="font-nunito text-slate-500 text-[11px] font-semibold mt-0.5">เช็คแล้ว</p>
          </div>
          <div class="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 text-center">
            <p class="font-fredoka text-2xl font-extrabold text-emerald-600">{{ presentCount }}</p>
            <p class="font-nunito text-emerald-600 text-[11px] font-semibold mt-0.5">ตรงเวลา</p>
          </div>
          <div class="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 text-center">
            <p class="font-fredoka text-2xl font-extrabold text-amber-600">{{ lateCount }}</p>
            <p class="font-nunito text-amber-600 text-[11px] font-semibold mt-0.5">มาสาย</p>
          </div>
        </div>

      </section>

      <!-- Right: Check-in History -->
      <section class="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
          <div>
            <h2 class="font-fredoka text-lg font-extrabold text-slate-800">ประวัติการเช็คชื่อวันนี้</h2>
            <p class="font-nunito text-xs text-slate-400 font-semibold">{{ currentDateText }}</p>
          </div>
          <div class="bg-indigo-50 border border-indigo-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <span class="font-fredoka text-xs font-bold text-indigo-600">ทั้งหมด</span>
            <span class="font-fredoka text-base font-extrabold text-indigo-700">{{ checkInHistory.length }}</span>
            <span class="font-fredoka text-xs font-bold text-indigo-400">คน</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="checkInHistory.length === 0" class="py-16 flex flex-col items-center text-center">
          <div class="text-5xl mb-4">📋</div>
          <p class="font-fredoka text-slate-400 font-bold text-lg">ยังไม่มีการเช็คชื่อ</p>
          <p class="font-nunito text-slate-400 text-xs mt-1">ใช้ช่องค้นหาด้านซ้ายเพื่อเริ่มเช็คชื่อนักเรียน</p>
        </div>

        <!-- History List -->
        <div v-else class="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          <TransitionGroup name="list">
            <div
              v-for="(record, idx) in checkInHistory"
              :key="record.id"
              @click="openEditRecord(record)"
              :class="[
                'flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.98] select-none group',
                record.status === 'present'
                  ? 'bg-emerald-50/50 border-emerald-100/60 hover:bg-emerald-50 hover:border-emerald-200'
                  : 'bg-amber-50/50 border-amber-100/60 hover:bg-amber-50 hover:border-amber-200'
              ]"
            >
              <!-- Rank -->
              <div class="w-6 text-center font-fredoka text-xs font-bold text-slate-300 flex-shrink-0">
                {{ checkInHistory.length - idx }}
              </div>

              <!-- Avatar -->
              <div :class="[
                'w-9 h-9 rounded-xl font-fredoka font-extrabold text-sm flex items-center justify-center flex-shrink-0',
                record.status === 'present'
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm'
                  : 'bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm'
              ]">
                {{ record.initials }}
              </div>

              <!-- Info -->
              <div class="grow min-w-0">
                <p class="font-fredoka font-bold text-sm text-slate-800 leading-tight truncate">{{ record.fullName }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span :class="[
                    'font-fredoka font-bold text-[10px] px-2 py-0.5 rounded-lg border',
                    record.status === 'present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  ]">{{ record.classLabel }}</span>
                  <span class="text-slate-400 text-[10px] font-nunito font-semibold">{{ record.studentId }}</span>
                </div>
              </div>

              <!-- Time + Status -->
              <div class="text-right flex-shrink-0">
                <p class="font-fredoka font-extrabold text-sm text-slate-700">{{ record.time }} น.</p>
                <span :class="[
                  'text-[10px] font-fredoka font-bold px-2 py-0.5 rounded-full',
                  record.status === 'present' ? 'text-emerald-600 bg-emerald-100' : 'text-amber-600 bg-amber-100'
                ]">
                  {{ record.status === 'present' ? 'ตรงเวลา' : 'สาย' }}
                </span>
              </div>

              <!-- Edit indicator -->
              <div
                class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:bg-indigo-50 flex items-center justify-center transition-all duration-200 shadow-sm flex-shrink-0"
                title="แก้ไขการเช็คชื่อ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </div>
            </div><!-- end record row -->
          </TransitionGroup>
        </div>
      </section>

    </main>

    <!-- ===== EDIT RECORD MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isEditModalOpen && editRecord" class="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" @click.self="isEditModalOpen = false">
          <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-pop-up">

            <!-- Header -->
            <div class="flex items-center gap-3 mb-5">
              <div :class="[
                'w-11 h-11 rounded-2xl font-fredoka font-extrabold text-base flex items-center justify-center flex-shrink-0 shadow-sm',
                editRecord.status === 'present'
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                  : 'bg-gradient-to-br from-amber-400 to-orange-400 text-white'
              ]">
                {{ editRecord.initials }}
              </div>
              <div>
                <h2 class="font-fredoka text-base font-extrabold text-slate-800 leading-tight">{{ editRecord.fullName }}</h2>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="bg-indigo-100 text-indigo-700 font-fredoka font-bold text-[10px] px-2 py-0.5 rounded-lg">{{ editRecord.classLabel }}</span>
                  <span class="font-nunito text-[10px] text-slate-400 font-semibold">เช็คเมื่อ {{ editRecord.time }} น.</span>
                </div>
              </div>
              <button @click="isEditModalOpen = false" class="ml-auto w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <!-- Current status badge -->
            <div :class="[
              'flex items-center gap-3 px-4 py-3 rounded-2xl border mb-4',
              editRecord.status === 'present' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
            ]">
              <span class="text-xl">{{ editRecord.status === 'present' ? '✅' : '⏰' }}</span>
              <div>
                <p class="font-nunito text-xs text-slate-500 font-semibold">สถานะปัจจุบัน</p>
                <p :class="['font-fredoka font-extrabold text-sm', editRecord.status === 'present' ? 'text-emerald-700' : 'text-amber-700']">
                  {{ editRecord.status === 'present' ? 'มาตรงเวลา' : 'มาสาย' }}
                </p>
              </div>
            </div>

            <!-- Change status -->
            <p class="font-fredoka text-xs font-bold text-slate-500 mb-2.5">เปลี่ยนเป็นสถานะใหม่</p>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <button
                @click="applyEditStatus('present')"
                :disabled="editRecord.status === 'present'"
                :class="[
                  'flex flex-col items-center gap-1 py-3.5 rounded-2xl font-fredoka font-bold text-sm transition-all border-2',
                  editRecord.status === 'present'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100 cursor-default'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400 cursor-pointer'
                ]">
                <span class="text-xl">✅</span>
                <span>ตรงเวลา</span>
                <span v-if="editRecord.status === 'present'" class="text-[9px] font-nunito opacity-75">สถานะปัจจุบัน</span>
              </button>
              <button
                @click="applyEditStatus('late')"
                :disabled="editRecord.status === 'late'"
                :class="[
                  'flex flex-col items-center gap-1 py-3.5 rounded-2xl font-fredoka font-bold text-sm transition-all border-2',
                  editRecord.status === 'late'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100 cursor-default'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-400 cursor-pointer'
                ]">
                <span class="text-xl">⏰</span>
                <span>มาสาย</span>
                <span v-if="editRecord.status === 'late'" class="text-[9px] font-nunito opacity-75">สถานะปัจจุบัน</span>
              </button>
            </div>

            <!-- Divider -->
            <div class="flex items-center gap-3 mb-4">
              <div class="flex-1 h-px bg-slate-100"></div>
              <span class="font-nunito text-[10px] text-slate-400 font-semibold">หรือ</span>
              <div class="flex-1 h-px bg-slate-100"></div>
            </div>

            <!-- Delete / Cancel check-in -->
            <button
              @click="deleteRecord"
              class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-rose-200 bg-rose-50 text-rose-600 font-fredoka font-bold text-sm hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              ยกเลิกการเช็คชื่อนี้
            </button>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== CONFIRM CHECK-IN MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isConfirmOpen && confirmStudent" class="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" @click.self="isConfirmOpen = false">
          <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-pop-up">

            <!-- Student Info -->
            <div class="text-center mb-6">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-fredoka font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
                {{ getInitials(confirmStudent) }}
              </div>
              <h2 class="font-fredoka text-xl font-extrabold text-slate-800">{{ getFullName(confirmStudent) }}</h2>
              <div class="flex items-center justify-center gap-2 mt-2">
                <span class="bg-indigo-100 text-indigo-700 font-fredoka font-bold text-xs px-3 py-1 rounded-xl">{{ getClassLabel(confirmStudent) }}</span>
                <span class="text-slate-400 text-xs font-nunito font-semibold">{{ confirmStudent.id }}</span>
              </div>
            </div>

            <!-- Time display -->
            <div class="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-center mb-5">
              <p class="font-nunito text-xs text-slate-400 font-semibold mb-0.5">เวลาเช็คชื่อ</p>
              <p class="font-fredoka text-2xl font-extrabold text-slate-800">{{ currentTimeText }}</p>
              <p :class="['font-fredoka text-xs font-bold mt-0.5', isLateTime ? 'text-rose-500' : 'text-emerald-600']">
                {{ isLateTime ? '⚠️ อยู่ในช่วงเวลาสาย' : '✅ อยู่ในช่วงเวลาปกติ' }}
              </p>
            </div>

            <!-- Action Buttons -->
            <p class="font-fredoka text-xs font-bold text-slate-500 text-center mb-3">เลือกสถานะการมาเรียน</p>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <button
                @click="confirmCheckIn('present')"
                class="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-fredoka font-bold shadow-md hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span class="text-2xl">✅</span>
                <span class="text-sm">มาตรงเวลา</span>
              </button>
              <button
                @click="confirmCheckIn('late')"
                class="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white font-fredoka font-bold shadow-md hover:shadow-lg hover:shadow-amber-100 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span class="text-2xl">⏰</span>
                <span class="text-sm">มาสาย</span>
              </button>
            </div>
            <button @click="isConfirmOpen = false" class="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 font-fredoka font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer">
              ยกเลิก
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== LOGOUT CONFIRM MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isLogoutModalOpen" class="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" @click.self="isLogoutModalOpen = false">
          <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-pop-up">

            <!-- Icon -->
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-100 flex items-center justify-center text-3xl mx-auto mb-4">
              👋
            </div>

            <h2 class="font-fredoka text-xl font-extrabold text-slate-800 mb-1">ออกจากระบบ?</h2>
            <p class="font-nunito text-sm text-slate-500 leading-relaxed mb-1">
              คุณสารวัตร <strong class="text-slate-700">{{ inspectorName }}</strong>
            </p>
            <p class="font-nunito text-xs text-slate-400 leading-relaxed mb-5">
              ต้องการออกจากระบบในตอนนี้ใช่หรือไม่? ข้อมูลที่เช็คชื่อไว้แล้วจะยังคงอยู่ในระบบ
            </p>

            <!-- Stats summary -->
            <div class="flex items-center justify-center gap-3 mb-5">
              <div class="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-center">
                <p class="font-fredoka text-lg font-extrabold text-slate-800">{{ checkInHistory.length }}</p>
                <p class="font-nunito text-[10px] text-slate-400 font-semibold">เช็คแล้ว</p>
              </div>
              <div class="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5 text-center">
                <p class="font-fredoka text-lg font-extrabold text-emerald-600">{{ presentCount }}</p>
                <p class="font-nunito text-[10px] text-emerald-600 font-semibold">ตรงเวลา</p>
              </div>
              <div class="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2.5 text-center">
                <p class="font-fredoka text-lg font-extrabold text-amber-600">{{ lateCount }}</p>
                <p class="font-nunito text-[10px] text-amber-600 font-semibold">มาสาย</p>
              </div>
            </div>

            <!-- Buttons -->
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="isLogoutModalOpen = false"
                class="py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 font-fredoka font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                @click="confirmLogout"
                class="py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-fredoka font-bold text-sm shadow-md hover:shadow-rose-100 transition-all cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
/* Toast */
.toast-enter-active { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-leave-active { transition: all 0.25s ease-in; }
.toast-enter-from { opacity: 0; transform: translate(50px, 0) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translate(0, -15px) scale(0.9); }
@keyframes toastProgress { from { width: 100%; } to { width: 0%; } }
.animate-toast-progress { animation: toastProgress 3.5s linear forwards; }

/* Modal */
.modal-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* Pop-up */
.animate-pop-up { animation: popUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes popUp {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Dropdown */
.dropdown-enter-active { transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dropdown-leave-active { transition: all 0.12s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-6px) scale(0.97); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }

/* List */
.list-enter-active { transition: all 0.3s ease; }
.list-leave-active { transition: all 0.2s ease; }
.list-enter-from { opacity: 0; transform: translateX(-12px); }
.list-leave-to { opacity: 0; transform: translateX(20px); }
</style>
