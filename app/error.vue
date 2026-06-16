<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

// Clear error and redirect to the home page
const handleError = () => clearError({ redirect: '/' })

// Determine user-friendly content based on status code
const statusCode = computed(() => props.error?.statusCode || props.error?.status || 500)

const errorContent = computed(() => {
  const code = statusCode.value
  if (code === 404) {
    return {
      title: 'ไม่พบหน้าเว็บนี้ (404)',
      description: 'ขออภัย หน้าที่คุณกำลังพยายามเข้าถึงอาจถูกย้าย ลบออก หรือไม่มีอยู่ตั้งแต่แรก กรุณาตรวจสอบความถูกต้องของ URL',
      badge: '404 - Not Found',
      type: 'warning'
    }
  }
  if (code === 403) {
    return {
      title: 'ไม่มีสิทธิ์เข้าถึง (403)',
      description: 'คุณไม่มีสิทธิ์ในการเข้าถึงหน้าเว็บนี้ กรุณาลงชื่อเข้าใช้งานด้วยบัญชีที่มีสิทธิ์ หรือติดต่อผู้ดูแลระบบ',
      badge: '403 - Forbidden',
      type: 'warning'
    }
  }
  return {
    title: 'เกิดข้อผิดพลาดของระบบ',
    description: props.error?.statusMessage || props.error?.message || 'ระบบเกิดข้อผิดพลาดบางประการ โปรดลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ',
    badge: `${code} - System Error`,
    type: 'error'
  }
})

// SweetAlert-style Toast State
const toastVisible = ref(false)
const progressWidth = ref(100)
let timerId: any = null

const triggerToast = () => {
  if (timerId) clearInterval(timerId)
  toastVisible.value = true
  progressWidth.value = 100
  
  const duration = 7000 // 7 seconds
  const interval = 50 // update every 50ms
  const step = (interval / duration) * 100
  
  timerId = setInterval(() => {
    if (progressWidth.value > 0) {
      progressWidth.value -= step
    } else {
      toastVisible.value = false
      clearInterval(timerId)
    }
  }, interval)
}

const closeToast = () => {
  toastVisible.value = false
  if (timerId) {
    clearInterval(timerId)
  }
}

onMounted(() => {
  // Trigger toast with a slight delay for better transition effect
  setTimeout(() => {
    triggerToast()
  }, 300)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

// Tech details toggle for developers
const showTechDetails = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
    
    <!-- Background glow effects -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 left-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- NATIVE SWEETALERT-STYLE TOAST (Top Right) -->
    <div class="fixed top-5 right-5 z-50 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      <transition
        enter-active-class="transition duration-300 ease-out transform"
        enter-from-class="translate-x-12 opacity-0 scale-95"
        enter-to-class="translate-x-0 opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in transform"
        leave-from-class="translate-x-0 opacity-100 scale-100"
        leave-to-class="translate-x-12 opacity-0 scale-95"
      >
        <div 
          v-if="toastVisible" 
          class="pointer-events-auto bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-2xl relative flex items-start gap-4 overflow-hidden"
          role="alert"
        >
          <!-- SweetAlert Error/Warning Icon -->
          <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2"
               :class="errorContent.type === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-500' : 'border-amber-500/30 bg-amber-500/10 text-amber-500'">
            
            <!-- Error Icon (X) -->
            <svg v-if="errorContent.type === 'error'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 animate-pulse">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            
            <!-- Warning Icon (!) -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 animate-pulse">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>

          <!-- Toast Content -->
          <div class="flex-1 min-w-0 pr-4">
            <h3 class="text-sm font-bold text-white tracking-wide">
              {{ errorContent.title }}
            </h3>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
              {{ errorContent.description }}
            </p>
          </div>

          <!-- Close Button -->
          <button 
            @click="closeToast"
            class="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800/50 cursor-pointer"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Animated Progress Bar -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <div 
              class="h-full transition-all duration-75 ease-linear"
              :class="errorContent.type === 'error' ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-amber-500 to-yellow-500'"
              :style="{ width: `${progressWidth}%` }"
            ></div>
          </div>
        </div>
      </transition>
    </div>

    <!-- MAIN PAGE CONTAINER -->
    <div class="max-w-xl w-full backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50 text-center relative z-10 transition-all duration-300 hover:border-slate-800">
      
      <!-- Central Graphic/Illustration -->
      <div class="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
        <!-- Floating circular gradients -->
        <div class="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
        <div class="absolute inset-4 bg-purple-500/10 rounded-full blur-md animate-ping" style="animation-duration: 3s;"></div>
        
        <!-- Big alert symbol -->
        <div class="w-24 h-24 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner flex items-center justify-center relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-indigo-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
      </div>

      <!-- Main fallback heading -->
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
        พบข้อผิดพลาดบางประการ
      </h2>
      
      <p class="text-slate-400 text-sm md:text-base mb-8 leading-relaxed max-w-sm mx-auto">
        ระบบพบปัญหาในการดำเนินการ รายละเอียดของปัญหาได้แสดงขึ้นที่มุมขวาบนของหน้าจอแล้ว
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <button
          @click="handleError"
          class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          กลับหน้าหลัก
        </button>
        
        <button
          v-if="!toastVisible"
          @click="triggerToast"
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all duration-200 cursor-pointer text-sm"
        >
          แสดงการแจ้งเตือนอีกครั้ง
        </button>

        <button
          v-else
          @click="showTechDetails = !showTechDetails"
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all duration-200 cursor-pointer text-sm"
        >
          {{ showTechDetails ? 'ซ่อนข้อมูลเชิงลึก' : 'ดูข้อมูลเชิงลึก' }}
        </button>
      </div>

      <!-- Technical Details Section -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="showTechDetails" class="text-left bg-slate-950/80 border border-slate-800 rounded-2xl p-5 overflow-auto max-h-64 shadow-inner">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Technical Error Log</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded">JSON</span>
          </div>
          <pre class="text-xs font-mono text-emerald-400/90 leading-5 whitespace-pre-wrap break-all">{{ JSON.stringify(error, null, 2) }}</pre>
        </div>
      </transition>
    </div>

    <!-- Footer Copyright -->
    <p class="mt-8 text-xs text-slate-600 tracking-wide z-10 select-none">
      &copy; {{ new Date().getFullYear() }} Student Attendance. All rights reserved.
    </p>
  </div>
</template>
