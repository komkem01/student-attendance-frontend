<script setup lang="ts">
import { ref, computed } from 'vue'

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

// Settings Active Tab state
const activeTab = ref<'profile' | 'rules' | 'notifications'>('profile')

// Form States
const formProfile = ref({
  name: 'สมชาย ใจดี',
  title: 'คุณครูประจำวิชาคณิตศาสตร์',
  school: 'โรงเรียนสตรีวิทยา',
  email: 'somchai.jai@email.com'
})

const lateLimitTime = ref('08:30')
const passingRateThreshold = ref(80)

const notifyLineToken = ref('line_notify_token_placeholder_xxxx')
const enableLineNotify = ref(true)
const notifyAbsentToParents = ref(true)
const notifyLateToParents = ref(false)

// Custom Time Adjustment increments
const incrementHour = () => {
  const parts = lateLimitTime.value.split(':')
  let val = (parseInt(parts[0]) + 1) % 24
  lateLimitTime.value = `${String(val).padStart(2, '0')}:${parts[1]}`
}
const decrementHour = () => {
  const parts = lateLimitTime.value.split(':')
  let val = (parseInt(parts[0]) - 1 + 24) % 24
  lateLimitTime.value = `${String(val).padStart(2, '0')}:${parts[1]}`
}
const incrementMinute = () => {
  const parts = lateLimitTime.value.split(':')
  let val = (parseInt(parts[1]) + 5) % 60
  lateLimitTime.value = `${parts[0]}:${String(val).padStart(2, '0')}`
}
const decrementMinute = () => {
  const parts = lateLimitTime.value.split(':')
  let val = (parseInt(parts[1]) - 5 + 60) % 60
  lateLimitTime.value = `${parts[0]}:${String(val).padStart(2, '0')}`
}

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

const isSaving = ref(false)

const handleSaveSettings = async () => {
  if (activeTab.value === 'profile' && (!formProfile.value.name.trim() || !formProfile.value.school.trim())) {
    showToast('กรุณากรอกข้อมูลโปรไฟล์ส่วนตัวให้ครบถ้วน', 'warning')
    return
  }

  isSaving.value = true
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Update local profile mockup
  teacherProfile.value.name = formProfile.value.name
  teacherProfile.value.school = formProfile.value.school
  teacherProfile.value.email = formProfile.value.email
  
  // Generate new initials
  if (formProfile.value.name.length >= 2) {
    teacherProfile.value.avatarInitials = formProfile.value.name.slice(0, 2)
  }
  
  isSaving.value = false
  showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!', 'success')
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
    <div class="fixed top-0 right-0 w-[400px] h-[400px] bg-slate-100/35 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-slate-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

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
      <main class="flex-1 p-6 overflow-y-auto max-w-5xl w-full mx-auto space-y-6">

        <div class="space-y-6">
          
          <!-- Header card -->
          <section class="bg-gradient-to-br from-[#64748B] to-[#475569] rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-slate-100/50">
            <div class="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <span class="bg-white/20 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase inline-block">
                  APP SETTINGS
                </span>
                <h2 class="font-fredoka text-2xl sm:text-3xl font-extrabold leading-tight">
                  ตั้งค่าการใช้งานระบบ
                </h2>
                <p class="font-nunito text-xs sm:text-sm text-slate-100/90 font-medium">
                  แก้ไขข้อมูลประวัติผู้ใช้งาน ตั้งเวลาการมาเรียนสาย เกณฑ์การผ่านประเมินรายวิชา และเปิดปิดการแจ้งเตือนไปยังผู้ปกครองของนักเรียน
                </p>
              </div>
            </div>
          </section>

          <!-- SETTINGS INTERFACE CONTAINER -->
          <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- Left Navigation Tabs -->
            <div class="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-3 shadow-xs space-y-1">
              <button 
                @click="activeTab = 'profile'"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-fredoka font-bold text-xs sm:text-sm transition-colors text-left cursor-pointer',
                  activeTab === 'profile' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-5 h-5 text-slate-400" :class="{ 'text-slate-700': activeTab === 'profile' }">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span>ข้อมูลผู้ใช้งาน</span>
              </button>

              <button 
                @click="activeTab = 'rules'"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-fredoka font-bold text-xs sm:text-sm transition-colors text-left cursor-pointer',
                  activeTab === 'rules' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-5 h-5 text-slate-400" :class="{ 'text-slate-700': activeTab === 'rules' }">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>เกณฑ์เวลาและการประเมิน</span>
              </button>

              <button 
                @click="activeTab = 'notifications'"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-fredoka font-bold text-xs sm:text-sm transition-colors text-left cursor-pointer',
                  activeTab === 'notifications' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-5 h-5 text-slate-400" :class="{ 'text-slate-700': activeTab === 'notifications' }">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a9.04 9.04 0 0 1-1.683-1.325A9.04 9.04 0 0 1 12 15M12 15a9.04 9.04 0 0 1-1.174-2.082M12 15H3.75M12 15a9.04 9.04 0 0 0 1.174-2.082M12 15h8.25" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a9.04 9.04 0 0 1-1.683-1.325A9.04 9.04 0 0 1 12 15M12 15a9.04 9.04 0 0 1-1.174-2.082M12 15H3.75M12 15a9.04 9.04 0 0 0 1.174-2.082M12 15h8.25M9.75 8.25a2.25 2.25 0 1 1 4.5 0M9.75 8.25a2.25 2.25 0 0 0-4.5 0M14.25 8.25a2.25 2.25 0 0 1 4.5 0m-4.5 0a2.25 2.25 0 0 0-4.5 0" />
                </svg>
                <span>ระบบแจ้งเตือน Line</span>
              </button>
            </div>

            <!-- Right Content Panels -->
            <div class="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
              <form @submit.prevent="handleSaveSettings" class="space-y-6">
                
                <!-- PROFILE TAB -->
                <div v-if="activeTab === 'profile'" class="space-y-4">
                  <h3 class="font-fredoka text-sm sm:text-base font-extrabold text-slate-800 border-b border-slate-50 pb-2">ข้อมูลประวัติส่วนตัว</h3>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">ชื่อ-นามสกุลคุณครู</label>
                      <input 
                        type="text" 
                        v-model="formProfile.name"
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all duration-200"
                      />
                    </div>

                    <div class="space-y-1">
                      <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">ตำแหน่ง / วิชาที่รับผิดชอบ</label>
                      <input 
                        type="text" 
                        v-model="formProfile.title"
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">สถาบันการศึกษา / โรงเรียน</label>
                    <input 
                      type="text" 
                      v-model="formProfile.school"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all duration-200"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">อีเมลที่ผูกกับระบบ</label>
                    <input 
                      type="email" 
                      v-model="formProfile.email"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                <!-- RULES TAB -->
                <div v-if="activeTab === 'rules'" class="space-y-6">
                  <h3 class="font-fredoka text-sm sm:text-base font-extrabold text-slate-800 border-b border-slate-50 pb-2">เกณฑ์เวลาและการประเมิน</h3>
                  
                  <!-- Time Setter -->
                  <div class="space-y-2">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">กำหนดเวลามาเรียนสาย (นาที)</label>
                    <div class="flex items-center gap-4">
                      <!-- Display -->
                      <div class="px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-fredoka font-extrabold text-lg text-slate-700 flex items-center justify-center min-w-[120px]">
                        {{ lateLimitTime }} น.
                      </div>
                      <!-- Dials increment decrement -->
                      <div class="flex gap-2">
                        <button 
                          type="button" 
                          @click="decrementHour" 
                          class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 font-fredoka font-extrabold text-xs cursor-pointer flex items-center justify-center"
                        >
                          H-
                        </button>
                        <button 
                          type="button" 
                          @click="incrementHour" 
                          class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 font-fredoka font-extrabold text-xs cursor-pointer flex items-center justify-center"
                        >
                          H+
                        </button>
                        <button 
                          type="button" 
                          @click="decrementMinute" 
                          class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 font-fredoka font-extrabold text-xs cursor-pointer flex items-center justify-center"
                        >
                          M-
                        </button>
                        <button 
                          type="button" 
                          @click="incrementMinute" 
                          class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 font-fredoka font-extrabold text-xs cursor-pointer flex items-center justify-center"
                        >
                          M+
                        </button>
                      </div>
                    </div>
                    <span class="text-[10px] text-slate-400 font-medium leading-relaxed block mt-1">หลังจากพ้นเวลาที่กำหนด ระบบจะปรับสถานะการเช็คชื่อเข้าเรียนจาก 'มาเรียน' เป็น 'สาย' ทันที</span>
                  </div>

                  <!-- Threshold rate slider -->
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">เกณฑ์อัตราเข้าเรียนขั้นต่ำเพื่อผ่านการประเมิน</label>
                      <span class="font-fredoka text-sm font-extrabold text-slate-800">{{ passingRateThreshold }}%</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <input 
                        type="range" 
                        v-model="passingRateThreshold" 
                        min="50" 
                        max="100" 
                        step="5"
                        class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-600 focus:outline-hidden"
                      />
                    </div>
                    <span class="text-[10px] text-slate-400 font-medium block mt-1">นักเรียนที่มีเวลาเรียนต่ำกว่าอัตราเปอร์เซ็นต์นี้ จะปรากฏสถานะการประเมินเป็น 'ต่ำกว่าเกณฑ์' ในหน้าต่างรายงานข้อมูล</span>
                  </div>
                </div>

                <!-- NOTIFICATIONS TAB -->
                <div v-if="activeTab === 'notifications'" class="space-y-4">
                  <h3 class="font-fredoka text-sm sm:text-base font-extrabold text-slate-800 border-b border-slate-50 pb-2">ระบบเชื่อมต่อ Line Notify</h3>
                  
                  <div class="space-y-1">
                    <label class="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Line Notify Token (สำหรับกลุ่มรายงานผู้ปกครอง)</label>
                    <input 
                      type="text" 
                      v-model="notifyLineToken"
                      placeholder="ใส่โทเค็นเพื่อเปิดใช้งานแจ้งเตือนไลน์..."
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all duration-200"
                    />
                  </div>

                  <!-- Toggles -->
                  <div class="space-y-3 pt-3">
                    <label class="flex items-center gap-3 cursor-pointer group text-slate-600 select-none">
                      <div class="relative">
                        <input 
                          type="checkbox" 
                          v-model="enableLineNotify"
                          class="sr-only peer"
                        />
                        <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </div>
                      <span class="text-xs font-semibold group-hover:text-slate-800 transition-colors">เปิดการแจ้งเตือนสรุปรายชื่อผู้มาเรียนส่งเข้าไลน์กลุ่มคุณครู</span>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer group text-slate-600 select-none">
                      <div class="relative">
                        <input 
                          type="checkbox" 
                          v-model="notifyAbsentToParents"
                          class="sr-only peer"
                        />
                        <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </div>
                      <span class="text-xs font-semibold group-hover:text-slate-800 transition-colors">ส่งการแจ้งเตือน Line ทันทีเมื่อนักเรียนขาดเรียนไปยังกลุ่มผู้ปกครอง</span>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer group text-slate-600 select-none">
                      <div class="relative">
                        <input 
                          type="checkbox" 
                          v-model="notifyLateToParents"
                          class="sr-only peer"
                        />
                        <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </div>
                      <span class="text-xs font-semibold group-hover:text-slate-800 transition-colors">ส่งการแจ้งเตือน Line เมื่อนักเรียนมาสาย</span>
                    </label>
                  </div>
                </div>

                <!-- Footer Buttons -->
                <div class="pt-4 border-t border-slate-50 flex items-center justify-end">
                  <button 
                    type="submit"
                    class="w-full sm:w-auto bg-gradient-to-r from-[#64748B] to-[#475569] hover:from-[#475569] hover:to-[#64748B] text-white font-fredoka font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md text-center"
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
