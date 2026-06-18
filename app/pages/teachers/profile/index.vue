<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'ข้อมูลส่วนตัวคุณครู - Student Attendance System',
  meta: [
    { name: 'description', content: 'ดูและจัดการข้อมูลส่วนตัวของคุณครูผู้สอน' }
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

// State for Logout Modal
const isLogoutModalOpen = ref(false)

// State for Teacher Profile Data
const teacherProfile = ref({
  name: 'สมชาย ใจดี',
  title: 'คุณครูประจำวิชาคณิตศาสตร์',
  school: 'โรงเรียนสตรีวิทยา',
  subject: 'คณิตศาสตร์',
  email: 'somchai.jai@email.com',
  phone: '081-234-5678',
  avatarInitials: 'สช',
  academicYear: '2569',
  joinedDate: '1 พฤษภาคม 2565',
  status: 'active'
})

// Stats display cards
const teacherStats = computed(() => [
  { label: 'ห้องเรียนที่ดูแล', value: '3 ห้อง', icon: '🏫', bg: 'bg-[#FFF0F3] text-[#FF758F] border-[#FFCCD5]/60' },
  { label: 'นักเรียนทั้งหมด', value: '120 คน', icon: '🎒', bg: 'bg-[#EBF8FF] text-sky-600 border-[#BEE3F8]/60' },
  { label: 'อัตราเข้าเรียนเฉลี่ย', value: '94.2%', icon: '📈', bg: 'bg-[#EAFDF8] text-[#1E7D65] border-[#A8EEDD]/60' }
])

// Edit Mode States
const isEditing = ref(false)
const isSaving = ref(false)
const editForm = ref({ ...teacherProfile.value })

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

// Toggle edit mode and copy profile values
const startEditing = () => {
  editForm.value = { ...teacherProfile.value }
  isEditing.value = true
}

// Cancel edit and revert values
const cancelEditing = () => {
  isEditing.value = false
  showToast('ยกเลิกการแก้ไขข้อมูล', 'info')
}

// Save edited profile details
const saveProfile = async () => {
  // Simple validation
  if (!editForm.value.name.trim()) {
    showToast('กรุณากรอกชื่อ-นามสกุล', 'error')
    return
  }
  if (!editForm.value.email.trim() || !editForm.value.email.includes('@')) {
    showToast('กรุณากรอกอีเมลให้ถูกต้อง', 'error')
    return
  }
  if (!editForm.value.phone.trim()) {
    showToast('กรุณากรอกเบอร์โทรศัพท์', 'error')
    return
  }

  isSaving.value = true
  // Mock API Save request delay
  await new Promise(resolve => setTimeout(resolve, 1200))

  // Update original profile details
  teacherProfile.value = { ...editForm.value }
  
  // Dynamically update initials if name changed (skipping Thai leading vowels)
  const getThaiInitial = (word: string) => {
    if (!word) return ''
    const leadingVowels = ['เ', 'แ', 'โ', 'ใ', 'ไ']
    if (leadingVowels.includes(word.charAt(0)) && word.length > 1) {
      return word.charAt(1)
    }
    return word.charAt(0)
  }

  const nameParts = teacherProfile.value.name.trim().split(' ')
  if (nameParts.length >= 2) {
    const firstInitial = getThaiInitial(nameParts[0])
    const lastInitial = getThaiInitial(nameParts[nameParts.length - 1])
    teacherProfile.value.avatarInitials = firstInitial + lastInitial
  } else if (nameParts.length === 1) {
    teacherProfile.value.avatarInitials = nameParts[0].substring(0, 2)
  }

  isSaving.value = false
  isEditing.value = false
  showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success')
}

// Handle Logout flow
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
            <!-- SweetAlert animated progress bar -->
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
      activeItem="profile" 
      @logout="handleLogout" 
    />

    <!-- MAIN PAGE CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Component -->
      <Topbar 
        title="ข้อมูลส่วนตัว" 
        :currentDateText="currentDateText" 
        :teacherProfile="teacherProfile" 
        @toggleSidebar="isMobileSidebarOpen = true" 
        @logout="handleLogout" 
      />

      <!-- MAIN SCROLLABLE CONTENT -->
      <main class="flex-1 p-6 overflow-y-auto max-w-5xl w-full mx-auto space-y-6">

        <!-- PROFILE WRAPPER GRID -->
        <div class="grid grid-cols-12 gap-6 items-start">
          
          <!-- Profile Card Banner & Header (Span 12) -->
          <div class="col-span-12 bg-white border border-slate-100 rounded-[2rem] shadow-xs overflow-hidden relative">
            <!-- Cover image placeholder (Premium Gradient Banner) -->
            <div class="h-44 sm:h-52 bg-gradient-to-br from-[#FF758F] via-[#FF4D6D] to-[#FF758F] relative">
              <!-- Decorative shapes -->
              <div class="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
              <div class="absolute left-1/3 bottom-0 w-60 h-60 bg-pink-300/20 rounded-full blur-2xl pointer-events-none -mb-20"></div>
            </div>

            <!-- Avatar & Details Block -->
            <div class="px-6 sm:px-8 pb-8 pt-0 flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20 relative z-10">
              <!-- Avatar Circle -->
              <div class="relative group">
                <div class="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-pink-50 to-pink-100 border-4 border-white shadow-lg flex items-center justify-center text-[#FF758F] font-fredoka font-extrabold text-3xl sm:text-4xl">
                  {{ teacherProfile.avatarInitials }}
                </div>
                <!-- Edit badge -->
                <div class="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 rounded-full bg-white border border-slate-100 text-slate-500 shadow-md flex items-center justify-center hover:text-[#FF758F] hover:scale-105 transition-all cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
              </div>

              <!-- Title details -->
              <div class="text-center sm:text-left space-y-1 mb-2">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 class="font-fredoka text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">
                    {{ teacherProfile.name }}
                  </h2>
                  <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 text-[10px] font-bold self-center">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    กำลังใช้งาน
                  </span>
                </div>
                <p class="font-nunito text-xs sm:text-sm text-slate-400 font-bold tracking-wide">
                  {{ teacherProfile.title }} • {{ teacherProfile.school }}
                </p>
              </div>
            </div>
          </div>

          <!-- LEFT COLUMN: DETAILED INFO / FORM (Col span 12 on mobile, 8 on desktop) -->
          <div class="col-span-12 lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-xs">
            
            <div class="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
              <div>
                <h3 class="font-fredoka text-base sm:text-lg font-extrabold text-slate-800 leading-none">
                  {{ isEditing ? 'แก้ไขข้อมูลส่วนตัว' : 'ประวัติข้อมูลส่วนตัวคุณครู' }}
                </h3>
                <span class="text-[10px] text-slate-400 font-bold block mt-1.5 uppercase">
                  {{ isEditing ? 'EDIT PROFILE DETAILS' : 'TEACHER PROFILE PROFILE DETAILS' }}
                </span>
              </div>

              <!-- Edit toggler button -->
              <button 
                v-if="!isEditing"
                @click="startEditing"
                class="bg-[#FF758F] hover:bg-[#FF4D6D] text-white font-fredoka font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-pink-100 flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                <span>แก้ไขข้อมูล</span>
              </button>
            </div>

            <!-- Profile View & Edit form container -->
            <form @submit.prevent="saveProfile" class="space-y-6">
              
              <!-- SECTION 1: Personal info -->
              <div class="space-y-4">
                <span class="text-[11px] text-[#FF758F] font-extrabold uppercase tracking-wider block">ข้อมูลเบื้องต้น</span>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Name Field -->
                  <div class="space-y-1.5">
                    <label class="text-xs text-slate-400 font-bold">ชื่อ-นามสกุล</label>
                    <div v-if="!isEditing" class="p-3 bg-slate-50 rounded-xl font-nunito text-xs sm:text-sm font-semibold border border-transparent text-slate-700">
                      {{ teacherProfile.name }}
                    </div>
                    <input 
                      v-else
                      type="text"
                      v-model="editForm.name"
                      class="w-full p-3 bg-slate-50 border border-slate-100 focus:border-[#FF758F] focus:bg-white rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-200"
                    />
                  </div>

                  <!-- Title Field -->
                  <div class="space-y-1.5">
                    <label class="text-xs text-slate-400 font-bold">ตำแหน่งหน้าที่</label>
                    <div v-if="!isEditing" class="p-3 bg-slate-50 rounded-xl font-nunito text-xs sm:text-sm font-semibold border border-transparent text-slate-700">
                      {{ teacherProfile.title }}
                    </div>
                    <input 
                      v-else
                      type="text"
                      v-model="editForm.title"
                      class="w-full p-3 bg-slate-50 border border-slate-100 focus:border-[#FF758F] focus:bg-white rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-200"
                    />
                  </div>

                  <!-- Email Field -->
                  <div class="space-y-1.5">
                    <label class="text-xs text-slate-400 font-bold">อีเมลติดต่อ</label>
                    <div v-if="!isEditing" class="p-3 bg-slate-50 rounded-xl font-nunito text-xs sm:text-sm font-semibold border border-transparent text-slate-700">
                      {{ teacherProfile.email }}
                    </div>
                    <input 
                      v-else
                      type="email"
                      v-model="editForm.email"
                      class="w-full p-3 bg-slate-50 border border-slate-100 focus:border-[#FF758F] focus:bg-white rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-200"
                    />
                  </div>

                  <!-- Phone Field -->
                  <div class="space-y-1.5">
                    <label class="text-xs text-slate-400 font-bold">เบอร์โทรศัพท์</label>
                    <div v-if="!isEditing" class="p-3 bg-slate-50 rounded-xl font-nunito text-xs sm:text-sm font-semibold border border-transparent text-slate-700">
                      {{ teacherProfile.phone }}
                    </div>
                    <input 
                      v-else
                      type="text"
                      v-model="editForm.phone"
                      class="w-full p-3 bg-slate-50 border border-slate-100 focus:border-[#FF758F] focus:bg-white rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <!-- SECTION 2: School info -->
              <div class="space-y-4 pt-4 border-t border-slate-100/60">
                <span class="text-[11px] text-[#FF758F] font-extrabold uppercase tracking-wider block">ข้อมูลสถาบันการศึกษา</span>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- School Name -->
                  <div class="space-y-1.5">
                    <label class="text-xs text-slate-400 font-bold">โรงเรียน / สถาบัน</label>
                    <div v-if="!isEditing" class="p-3 bg-slate-50 rounded-xl font-nunito text-xs sm:text-sm font-semibold border border-transparent text-slate-700">
                      {{ teacherProfile.school }}
                    </div>
                    <input 
                      v-else
                      type="text"
                      v-model="editForm.school"
                      class="w-full p-3 bg-slate-50 border border-slate-100 focus:border-[#FF758F] focus:bg-white rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-200"
                    />
                  </div>

                  <!-- Subject Taught -->
                  <div class="space-y-1.5">
                    <label class="text-xs text-slate-400 font-bold">กลุ่มสาระการเรียนรู้</label>
                    <div v-if="!isEditing" class="p-3 bg-slate-50 rounded-xl font-nunito text-xs sm:text-sm font-semibold border border-transparent text-slate-700">
                      {{ teacherProfile.subject }}
                    </div>
                    <input 
                      v-else
                      type="text"
                      v-model="editForm.subject"
                      class="w-full p-3 bg-slate-50 border border-slate-100 focus:border-[#FF758F] focus:bg-white rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <!-- Edit mode action footer buttons -->
              <div v-if="isEditing" class="pt-6 border-t border-slate-100/60 flex items-center justify-end gap-3.5">
                <button 
                  type="button"
                  @click="cancelEditing"
                  :disabled="isSaving"
                  class="px-6 py-2.5 border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  :disabled="isSaving"
                  class="bg-[#FF758F] hover:bg-[#FF4D6D] text-white font-fredoka font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-pink-100 flex items-center justify-center gap-2 disabled:bg-pink-400"
                >
                  <svg v-if="isSaving" class="animate-spin -ml-1 mr-1.5 h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูล' }}</span>
                </button>
              </div>

            </form>

          </div>

          <!-- RIGHT COLUMN: STATS AND METADATA (Col span 12 on mobile, 4 on desktop) -->
          <div class="col-span-12 lg:col-span-4 space-y-6">
            
            <!-- Quick Stats -->
            <div class="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-xs space-y-4">
              <h3 class="font-fredoka text-sm sm:text-base font-extrabold text-slate-800 leading-none">สถิติการสอน</h3>
              
              <div class="space-y-3">
                <div 
                  v-for="(stat, idx) in teacherStats" 
                  :key="idx" 
                  :class="['p-4 rounded-2xl border flex items-center justify-between', stat.bg]"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl flex-shrink-0">{{ stat.icon }}</span>
                    <span class="font-nunito text-xs font-bold">{{ stat.label }}</span>
                  </div>
                  <span class="font-fredoka text-sm sm:text-base font-extrabold">{{ stat.value }}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      <!-- Loading Overlay -->
      <LoadingOverlay :show="isSaving" text="กำลังบันทึกข้อมูล..." />

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
