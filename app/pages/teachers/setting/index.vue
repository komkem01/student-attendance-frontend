<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

useHead({
  title: 'ตั้งค่าระบบ | Student Attendance System',
  meta: [
    { name: 'description', content: 'ตั้งค่าการเข้าใช้ระบบ ตั้งค่าเวลาและเกณฑ์การเช็คชื่อเข้าแถว และแก้ไขข้อมูลประวัติของคุณครู' }
  ]
})

// State for Mobile Sidebar Toggle
const isMobileSidebarOpen = ref(false)

// State for Logout Confirmation Modal
const isLogoutModalOpen = ref(false)

const { session, teacherProfile, logout } = useTeacherSession()

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

// Settings Form Composable
const {
  activeTab,
  isSaving,
  formProfile,
  formPassword,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  lateLimitTime,
  passingRateThreshold,
  passwordStrength,
  isLengthValid,
  hasNumber,
  hasUppercase,
  hasLowercase,
  hasSpecial,
  passwordStrengthScore,
  passwordStrengthDetails,
  incrementHour,
  decrementHour,
  incrementMinute,
  decrementMinute,
  loadSettings,
  saveSettings,
  changePassword
} = useSettingForm(showToast)

// Fetch settings on load
onMounted(() => {
  loadSettings()
})

const handleSaveSettings = async () => {
  if (activeTab.value === 'security') {
    await changePassword()
  } else {
    await saveSettings()
  }
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
    <div class="fixed top-0 right-0 w-[400px] h-[400px] bg-[#FF758F]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-50/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <!-- Sidebar Layout Component -->
    <Sidebar 
      v-model:isOpen="isMobileSidebarOpen" 
      activeItem="settings" 
      @logout="handleLogout" 
    />

    <!-- MAIN PAGE CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Component -->
      <Topbar 
        title="ตั้งค่าระบบ" 
        :currentDateText="currentDateText" 
        :teacherProfile="teacherProfile" 
        @toggleSidebar="isMobileSidebarOpen = true" 
        @logout="handleLogout" 
      />

      <!-- MAIN SCROLLABLE CONTENT -->
      <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">

        <div class="space-y-6">
          
          <!-- Header card -->
          <section class="bg-gradient-to-br from-[#FF758F] via-[#FF85A1] to-[#FF4D6D] rounded-[2.5rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-pink-100/50 border border-white/10">
            <!-- Animated shapes and blur circles -->
            <div class="absolute -right-10 -top-10 w-72 h-72 bg-white/15 rounded-full blur-2xl pointer-events-none animate-drift"></div>
            <div class="absolute left-1/3 bottom-0 w-60 h-60 bg-pink-300/20 rounded-full blur-2xl pointer-events-none animate-float-slow"></div>
            
            <!-- Cute decorative small graphics -->
            <div class="absolute right-8 bottom-6 opacity-25 w-24 h-24 hidden md:block animate-float">
              <svg viewBox="0 0 200 200" fill="currentColor" class="w-full h-full text-white">
                <path d="M40.2,-64.7C52,-57.4,61.4,-46.3,69.5,-33.5C77.6,-20.8,84.4,-6.4,83.1,7.4C81.8,21.2,72.4,34.5,62.1,45.8C51.8,57.1,40.7,66.4,27.5,72.4C14.4,78.3,-0.7,80.9,-15.7,78C-30.8,75.1,-45.8,66.6,-57.3,55.1C-68.8,43.5,-76.8,28.9,-81,13.1C-85.2,-2.7,-85.7,-19.7,-79.8,-34.5C-74,-49.3,-61.8,-61.9,-47.9,-68.4C-34.1,-74.9,-17,-75.4,-1.1,-73.4C14.7,-71.4,28.4,-72,40.2,-64.7Z" transform="translate(100, 100)" />
              </svg>
            </div>

            <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="space-y-3 max-w-2xl">
                <span class="bg-white/25 backdrop-blur-xs text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase inline-block border border-white/20">
                  💖 APP SETTINGS
                </span>
                <h2 class="font-fredoka text-2xl sm:text-4xl font-extrabold leading-tight drop-shadow-sm">
                  ตั้งค่าการใช้งานระบบ
                </h2>
                <p class="font-nunito text-xs sm:text-base text-pink-50/90 font-medium">
                  แก้ไขข้อมูลประวัติผู้ใช้งาน ตั้งเกณฑ์การมาเรียนสาย เกณฑ์การประเมินวิชาเรียน และเปลี่ยนรหัสผ่านเพื่อความปลอดภัยบัญชี
                </p>
              </div>
            </div>
          </section>

          <!-- SETTINGS INTERFACE CONTAINER -->
          <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- Left Navigation Tabs -->
            <div class="lg:col-span-4 bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] p-4 shadow-xs space-y-2">
              <div class="px-2 py-1 mb-1">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">เมนูตั้งค่า</span>
              </div>
              
              <button 
                @click="activeTab = 'profile'"
                :class="[
                  'w-full flex items-center justify-between px-4 py-3 rounded-2xl font-fredoka font-bold text-xs sm:text-sm transition-all duration-300 text-left cursor-pointer border',
                  activeTab === 'profile' 
                    ? 'bg-gradient-to-r from-pink-50 to-pink-100/40 border-pink-100/60 text-[#FF758F] shadow-xs' 
                    : 'border-transparent text-slate-500 hover:bg-pink-50/10 hover:text-[#FF758F]'
                ]"
              >
                <div class="flex items-center gap-3">
                  <div :class="['w-8 h-8 rounded-xl flex items-center justify-center transition-all', activeTab === 'profile' ? 'bg-[#FF758F] text-white shadow-xs' : 'bg-slate-100 text-slate-400']">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <span>ข้อมูลส่วนตัว</span>
                </div>
                <svg v-if="activeTab === 'profile'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <button 
                @click="activeTab = 'rules'"
                :class="[
                  'w-full flex items-center justify-between px-4 py-3 rounded-2xl font-fredoka font-bold text-xs sm:text-sm transition-all duration-300 text-left cursor-pointer border',
                  activeTab === 'rules' 
                    ? 'bg-gradient-to-r from-pink-50 to-pink-100/40 border-pink-100/60 text-[#FF758F] shadow-xs' 
                    : 'border-transparent text-slate-500 hover:bg-pink-50/10 hover:text-[#FF758F]'
                ]"
              >
                <div class="flex items-center gap-3">
                  <div :class="['w-8 h-8 rounded-xl flex items-center justify-center transition-all', activeTab === 'rules' ? 'bg-[#FF758F] text-white shadow-xs' : 'bg-slate-100 text-slate-400']">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <span>เกณฑ์เวลาและการประเมิน</span>
                </div>
                <svg v-if="activeTab === 'rules'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <button 
                @click="activeTab = 'security'"
                :class="[
                  'w-full flex items-center justify-between px-4 py-3 rounded-2xl font-fredoka font-bold text-xs sm:text-sm transition-all duration-300 text-left cursor-pointer border',
                  activeTab === 'security' 
                    ? 'bg-gradient-to-r from-pink-50 to-pink-100/40 border-pink-100/60 text-[#FF758F] shadow-xs' 
                    : 'border-transparent text-slate-500 hover:bg-pink-50/10 hover:text-[#FF758F]'
                ]"
              >
                <div class="flex items-center gap-3">
                  <div :class="['w-8 h-8 rounded-xl flex items-center justify-center transition-all', activeTab === 'security' ? 'bg-[#FF758F] text-white shadow-xs' : 'bg-slate-100 text-slate-400']">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <span>เปลี่ยนรหัสผ่าน</span>
                </div>
                <svg v-if="activeTab === 'security'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            <!-- Right Content Panels -->
            <div class="lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-xs">
              <form @submit.prevent="handleSaveSettings" class="space-y-6">
                
                <!-- PROFILE TAB -->
                <div v-if="activeTab === 'profile'" class="space-y-8 animate-pop-up">
                  
                  <!-- Profile Header Details / Avatar Section -->
                  <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-pink-50/30 via-rose-50/15 to-indigo-50/15 border border-pink-100/20 rounded-[2rem] shadow-2xs">
                    <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF758F] to-[#FF4D6D] border-4 border-white flex items-center justify-center text-white font-fredoka font-extrabold text-3xl shadow-md transition-transform duration-300 hover:scale-105 select-none">
                      {{ teacherProfile.avatarInitials }}
                    </div>
                    
                    <div class="text-center sm:text-left space-y-1.5">
                      <h3 class="font-fredoka text-xl font-extrabold text-slate-800">
                        {{ teacherProfile.name }}
                      </h3>
                      <p class="font-nunito text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        {{ teacherProfile.title }}
                      </p>
                      <p class="font-nunito text-[11px] text-slate-400 font-bold block">
                        🏫 {{ teacherProfile.school }}
                      </p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <h4 class="font-fredoka text-xs sm:text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">แก้ไขข้อมูลประวัติ</h4>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <!-- First Name -->
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">ชื่อจริง</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                          </div>
                          <input 
                            type="text" 
                            v-model="formProfile.firstName"
                            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300 shadow-2xs"
                          />
                        </div>
                      </div>

                      <!-- Last Name -->
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">นามสกุล</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                          </div>
                          <input 
                            type="text" 
                            v-model="formProfile.lastName"
                            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <!-- Title -->
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">ตำแหน่ง / วิชาที่รับผิดชอบ</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 0 1 3.75 18.4v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.453.257-.724.257H4.374c-.27 0-.53-.092-.724-.257m0 0a2.18 2.18 0 0 1-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.114 48.114 0 0 1 3.413-.387m11.162 0A48.955 48.955 0 0 0 12 4.5c-2.107 0-4.156.133-6.162.387m12.324 0c.536.069.967.476 1.053.1l.033-.122M18.9 7.5v5.25" />
                            </svg>
                          </div>
                          <input 
                            type="text" 
                            v-model="formProfile.title"
                            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- School -->
                    <div class="space-y-1.5">
                      <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">สถาบันการศึกษา / โรงเรียน</label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18" />
                          </svg>
                        </div>
                        <input 
                          type="text" 
                          v-model="formProfile.school"
                          class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <!-- Email -->
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">อีเมลที่ผูกกับระบบ</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                          </div>
                          <input 
                            type="email" 
                            v-model="formProfile.email"
                            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300 shadow-2xs"
                          />
                        </div>
                      </div>

                      <!-- Phone -->
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">เบอร์โทรศัพท์ติดต่อ</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.28-5.716-4.17-7-7l1.294-.97c.362-.272.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                          </div>
                          <input 
                            type="text" 
                            v-model="formProfile.phone"
                            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300 shadow-2xs"
                            :maxlength="10"
                            :minlength="10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <!-- RULES TAB -->
                <div v-if="activeTab === 'rules'" class="space-y-8 animate-pop-up">
                  
                  <!-- Info alert bubble -->
                  <div class="bg-gradient-to-r from-pink-50/60 to-rose-50/45 border border-pink-100/40 rounded-2xl p-5 flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl bg-pink-100 text-[#FF758F] flex items-center justify-center flex-shrink-0 shadow-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-5.5 h-5.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <div class="space-y-1">
                      <h4 class="font-fredoka font-bold text-xs sm:text-sm text-slate-800">เกณฑ์ประเมินการเข้าแถวเรียนร่วมกัน</h4>
                      <p class="font-nunito text-[11px] text-slate-500 leading-relaxed font-semibold">
                        คุณครูสามารถปรับเกณฑ์เวลาเช็คชื่อเพื่อคำนวณสถานะสาย และเกณฑ์ร้อยละการเข้าเรียนเพื่อประเมินความผ่านเกณฑ์ของนักเรียนแบบรายคนในเทอมนี้ได้โดยตรง
                      </p>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <h4 class="font-fredoka text-xs sm:text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">ตั้งค่าเกณฑ์เวลา</h4>
                    
                    <!-- Time Setter -->
                    <div class="space-y-3 p-6 bg-slate-50/60 border border-slate-100 rounded-3xl">
                      <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">กำหนดเวลามาเรียนสาย (นาที)</label>
                      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                        <!-- Clock bubble Display -->
                        <div class="px-6 py-4 bg-white border-2 border-pink-100/60 rounded-2xl font-fredoka font-extrabold text-2xl text-[#FF758F] flex items-center justify-center gap-3 min-w-[150px] shadow-xs select-none">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 animate-pulse">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          <span>{{ lateLimitTime }} น.</span>
                        </div>
                        
                        <!-- Dials increment decrement -->
                        <div class="flex flex-wrap gap-2">
                          <button 
                            type="button" 
                            @click="decrementHour" 
                            class="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 font-fredoka font-extrabold text-xs text-rose-600 cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <span>ชั่วโมง -</span>
                          </button>
                          <button 
                            type="button" 
                            @click="incrementHour" 
                            class="px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 font-fredoka font-extrabold text-xs text-emerald-600 cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <span>ชั่วโมง +</span>
                          </button>
                          <button 
                            type="button" 
                            @click="decrementMinute" 
                            class="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 font-fredoka font-extrabold text-xs text-rose-600 cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <span>นาที -5</span>
                          </button>
                          <button 
                            type="button" 
                            @click="incrementMinute" 
                            class="px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 font-fredoka font-extrabold text-xs text-emerald-600 cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <span>นาที +5</span>
                          </button>
                        </div>
                      </div>
                      <span class="text-[10px] text-slate-400 font-medium leading-relaxed block">⚠️ หลังจากพ้นเวลาที่กำหนดนี้ ระบบจะเช็คให้สถานะนักเรียนเปลี่ยนจาก "มาเรียน" เป็น "สาย" ทันที</span>
                    </div>

                    <!-- Threshold rate slider -->
                    <div class="space-y-4 p-6 bg-slate-50/60 border border-slate-100 rounded-3xl">
                      <div class="flex justify-between items-center">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">เกณฑ์อัตราเข้าเรียนขั้นต่ำเพื่อผ่านการประเมิน</label>
                        <span class="font-fredoka text-base font-extrabold text-[#FF758F] bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-xl shadow-2xs">{{ passingRateThreshold }}%</span>
                      </div>
                      
                      <div class="space-y-2">
                        <input 
                          type="range" 
                          v-model="passingRateThreshold" 
                          min="50" 
                          max="100" 
                          step="5"
                          class="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF758F] focus:outline-hidden transition-all"
                        />
                        <div class="flex justify-between text-[9px] text-slate-400 font-bold px-1">
                          <span>50%</span>
                          <span>60%</span>
                          <span>70%</span>
                          <span>80%</span>
                          <span>90%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div class="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between text-[10px] font-semibold text-slate-500">
                        <span>สถานะเกณฑ์ผ่าน:</span>
                        <span :class="[passingRateThreshold >= 80 ? 'text-emerald-500 font-extrabold' : 'text-amber-500 font-extrabold']">
                          {{ passingRateThreshold >= 80 ? '👍 เกณฑ์ปกติแนะนำ (ผ่านง่ายตามมาตรฐานการศึกษา)' : '⚠️ เกณฑ์ต่ำผิดปกติ (ตรวจสอบนโยบายวิชาเรียน)' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- SECURITY / CHANGE PASSWORD TAB -->
                <div v-if="activeTab === 'security'" class="space-y-6 animate-pop-up">
                  
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <!-- Left Column: Inputs Form -->
                    <div class="lg:col-span-7 space-y-5">
                      <h4 class="font-fredoka text-xs sm:text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">เปลี่ยนรหัสผ่านใหม่</h4>
                      
                      <!-- Current Password Field -->
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">รหัสผ่านปัจจุบัน</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H3.75v-2.25A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632" />
                            </svg>
                          </div>
                          <input 
                            :type="showCurrentPassword ? 'text' : 'password'" 
                            v-model="formPassword.currentPassword"
                            placeholder="กรอกรหัสผ่านเข้าใช้งานปัจจุบัน..."
                            class="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300 shadow-2xs"
                          />
                          <!-- Visibility toggle -->
                          <button 
                            type="button"
                            @click="showCurrentPassword = !showCurrentPassword"
                            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#FF758F] cursor-pointer transition-colors"
                          >
                            <svg v-if="showCurrentPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-3.957-3.957-1.4 1.4M12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <!-- New Password Field -->
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">รหัสผ่านใหม่</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                          </div>
                          <input 
                            :type="showNewPassword ? 'text' : 'password'" 
                            v-model="formPassword.newPassword"
                            placeholder="ตั้งรหัสผ่านใหม่ความยาวขั้นต่ำ 6 ตัว..."
                            class="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300 shadow-2xs"
                          />
                          <button 
                            type="button"
                            @click="showNewPassword = !showNewPassword"
                            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#FF758F] cursor-pointer transition-colors"
                          >
                            <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-3.957-3.957-1.4 1.4M12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <!-- Confirm Password Field -->
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide pl-1">ยืนยันรหัสผ่านใหม่</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                            </svg>
                          </div>
                          <input 
                            :type="showConfirmPassword ? 'text' : 'password'" 
                            v-model="formPassword.confirmPassword"
                            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
                            class="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF758F] focus:bg-white focus:ring-4 focus:ring-pink-100/40 rounded-2xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden transition-all duration-300 shadow-2xs"
                          />
                          <button 
                            type="button"
                            @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#FF758F] cursor-pointer transition-colors"
                          >
                            <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-3.957-3.957-1.4 1.4M12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4.5 h-4.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Right Column: Security Checklist & Score Dashboard -->
                    <div class="lg:col-span-5 space-y-6">
                      
                      <!-- Password Health Card -->
                      <div :class="['p-6 rounded-[2rem] border transition-all duration-500 flex flex-col items-center text-center shadow-xs', passwordStrengthDetails.bgColor, passwordStrengthDetails.borderColor]">
                        <div class="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm animate-bounce mb-3 select-none">
                          {{ passwordStrengthDetails.emoji }}
                        </div>
                        
                        <div class="space-y-1.5">
                          <span class="text-[10px] text-slate-400 font-bold tracking-wider block uppercase">ผลตรวจความปลอดภัย</span>
                          <h4 class="font-fredoka text-sm font-extrabold" :class="passwordStrengthDetails.color">
                            {{ passwordStrengthDetails.text }}
                          </h4>
                        </div>
                        
                        <!-- Visual score gauge -->
                        <div class="w-full bg-slate-200/60 h-2 rounded-full mt-5 overflow-hidden">
                          <div class="h-full rounded-full transition-all duration-500" :class="[passwordStrengthDetails.barColor]" :style="{ width: passwordStrengthDetails.width }"></div>
                        </div>
                      </div>

                      <!-- Interactive requirements list -->
                      <div class="bg-slate-50/60 border border-slate-100 rounded-[2.0rem] p-5 space-y-3">
                        <span class="text-[10px] text-slate-400 font-bold tracking-wider block uppercase pl-1">เกณฑ์รหัสผ่านที่ปลอดภัย</span>
                        
                        <ul class="space-y-2.5">
                          <!-- Criterion 1: Length -->
                          <li class="flex items-center gap-3 text-xs font-semibold font-nunito transition-colors" :class="isLengthValid ? 'text-slate-800' : 'text-slate-400'">
                            <span :class="['w-5 h-5 rounded-full flex items-center justify-center transition-all', isLengthValid ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-400']">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>อย่างน้อย 6 ตัวอักษร</span>
                          </li>

                          <!-- Criterion 2: Number -->
                          <li class="flex items-center gap-3 text-xs font-semibold font-nunito transition-colors" :class="hasNumber ? 'text-slate-800' : 'text-slate-400'">
                            <span :class="['w-5 h-5 rounded-full flex items-center justify-center transition-all', hasNumber ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-400']">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>มีตัวเลข 0-9 อย่างน้อย 1 ตัว</span>
                          </li>

                          <!-- Criterion 3: Uppercase -->
                          <li class="flex items-center gap-3 text-xs font-semibold font-nunito transition-colors" :class="hasUppercase ? 'text-slate-800' : 'text-slate-400'">
                            <span :class="['w-5 h-5 rounded-full flex items-center justify-center transition-all', hasUppercase ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-400']">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>มีอักษรพิมพ์ใหญ่ (A-Z)</span>
                          </li>

                          <!-- Criterion 4: Lowercase -->
                          <li class="flex items-center gap-3 text-xs font-semibold font-nunito transition-colors" :class="hasLowercase ? 'text-slate-800' : 'text-slate-400'">
                            <span :class="['w-5 h-5 rounded-full flex items-center justify-center transition-all', hasLowercase ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-400']">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>มีอักษรพิมพ์เล็ก (a-z)</span>
                          </li>

                          <!-- Criterion 5: Special -->
                          <li class="flex items-center gap-3 text-xs font-semibold font-nunito transition-colors" :class="hasSpecial ? 'text-slate-800' : 'text-slate-400'">
                            <span :class="['w-5 h-5 rounded-full flex items-center justify-center transition-all', hasSpecial ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-400']">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>มีอักขระพิเศษ (เช่น @, #, $, %)</span>
                          </li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>

                <!-- Footer Buttons -->
                <div class="pt-6 border-t border-slate-100 flex items-center justify-end">
                  <button 
                    type="submit"
                    class="w-full sm:w-auto bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF758F] text-white font-fredoka font-bold text-xs sm:text-sm px-8 py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-pink-100 hover:shadow-lg hover:shadow-pink-200/50 hover:scale-[1.02] active:scale-[0.98] text-center"
                  >
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>

              </form>
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

      <!-- Cute Saving Spinner overlay -->
      <LoadingOverlay :show="isSaving" text="กำลังบันทึกข้อมูลการตั้งค่าเข้าสู่ระบบ..." />

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

