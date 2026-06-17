<script setup lang="ts">
import { ref, reactive } from 'vue'

useHead({
  title: 'เข้าสู่ระบบสำหรับคุณครู | Student Attendance System',
  meta: [
    { name: 'description', content: 'หน้าเข้าสู่ระบบสำหรับคุณครู เพื่อเข้าใช้งานระบบเช็คชื่อและบันทึกเวลาเรียนของนักเรียน ตรีมน่ารักและใช้งานง่าย' }
  ]
})

// Form State
const form = reactive({
  emailOrId: '',
  password: '',
  rememberMe: false
})

// UI State
const isPasswordVisible = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const hasError = ref(false)
const isSuccess = ref(false)

// Handle Form Submission
const handleLogin = async () => {
  // Reset error states
  errorMessage.value = ''
  hasError.value = false
  
  // Basic Validation
  if (!form.emailOrId.trim()) {
    triggerError('กรุณากรอกอีเมลหรือรหัสประจำตัวคุณครูด้วยนะคะ ✏️')
    return
  }
  
  if (!form.password) {
    triggerError('กรุณากรอกรหัสผ่านด้วยนะคะ 🔑')
    return
  }
  
  if (form.password.length < 6) {
    triggerError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรค่ะ 🔒')
    return
  }
  
  // Mock login process
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    isSuccess.value = true
    // Simulate navigation/dashboard redirect here in real implementation
  } catch (err) {
    triggerError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้งค่ะ ❌')
  } finally {
    isLoading.value = false
  }
}

// Visual error feedback (shake effect)
const triggerError = (msg: string) => {
  errorMessage.value = msg
  hasError.value = true
  
  // Reset shake class after animation ends so it can shake again
  setTimeout(() => {
    hasError.value = false
  }, 500)
}
</script>

<template>
  <div class="bg-gradient-to-br from-[#FFF0F3] via-[#FFF6E6] to-[#E6F0FA] min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
    <!-- Floating background decorative blur bubbles -->
    <div class="absolute top-[5%] left-[5%] w-48 h-48 bg-pink-300/20 rounded-full blur-3xl animate-float-slow pointer-events-none"></div>
    <div class="absolute bottom-[8%] right-[5%] w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-[35%] right-[15%] w-36 h-36 bg-amber-300/20 rounded-full blur-2xl animate-float-medium pointer-events-none"></div>
    <div class="absolute bottom-[5%] left-[10%] w-60 h-60 bg-purple-300/20 rounded-full blur-3xl animate-drift pointer-events-none"></div>

    <!-- Background clouds -->
    <div class="absolute top-[10%] left-[15%] text-6xl opacity-15 animate-drift pointer-events-none">☁️</div>
    <div class="absolute top-[40%] right-[20%] text-5xl opacity-10 animate-float pointer-events-none">☁️</div>
    <div class="absolute bottom-[25%] left-[5%] text-7xl opacity-10 animate-float-slow pointer-events-none">☁️</div>

    <!-- Small Emojis Floating in the background -->
    <div class="absolute top-10 right-20 text-4xl opacity-35 animate-float hidden sm:block">🎒</div>
    <div class="absolute bottom-20 left-12 text-4xl opacity-35 animate-float-slow hidden sm:block">📚</div>
    <div class="absolute top-[60%] left-24 text-3xl opacity-35 animate-float-medium hidden sm:block">✏️</div>
    <div class="absolute top-[25%] left-[35%] text-3xl opacity-25 animate-float hidden sm:block">⭐</div>
    <div class="absolute bottom-40 right-[35%] text-4xl opacity-35 animate-float-slow hidden sm:block">🎈</div>

    <!-- Main Container -->
    <div class="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/85 backdrop-blur-2xl border border-white rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-2xl relative z-10">
      
      <!-- Left Column - Cute Hero (Hidden on Mobile) -->
      <div class="col-span-12 md:col-span-5 hidden md:flex flex-col items-center text-center justify-center p-4">
        <div class="bg-white/80 border border-white/70 rounded-3xl p-6 shadow-md max-w-sm mb-4 transform -rotate-2">
          <h2 class="font-fredoka text-2xl font-bold text-[#FF758F] mb-1">ยินดีต้อนรับค่ะคุณครู! 👩‍🏫</h2>
          <p class="font-nunito text-[#596A7A] text-sm leading-relaxed">
            ระบบเช็คชื่อและบันทึกเวลาเรียนนักเรียน เข้ามาจัดการชั้นเรียนด้วยความสนุกและสะดวกสบายกันนะคะ ✨
          </p>
        </div>
        
        <img 
          src="/images/teacher_illustration.png" 
          alt="Cute Teacher Illustration" 
          class="w-72 h-72 object-contain my-4 drop-shadow-xl animate-float-medium"
        />

        <div class="text-[#FF758F] font-fredoka text-sm font-semibold tracking-wider flex items-center gap-1.5 mt-2 bg-pink-50 border border-pink-100 px-4 py-2 rounded-full shadow-inner animate-pulse">
          <span class="inline-block w-2.5 h-2.5 bg-pink-400 rounded-full"></span>
          Let's make teaching delightful!
        </div>
      </div>

      <!-- Right Column - Login Card -->
      <div 
        :class="['col-span-12 md:col-span-7 bg-white/95 rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl border border-pink-100/50 transition-all duration-300', { 'animate-shake': hasError }]"
      >
        <!-- Mobile Logo Header (Only Visible on Mobile) -->
        <div class="flex flex-col items-center text-center md:hidden mb-6">
          <img 
            src="/images/teacher_illustration.png" 
            alt="Cute Teacher Illustration" 
            class="w-24 h-24 object-contain mb-3 drop-shadow-md animate-float"
          />
          <h2 class="font-fredoka text-2xl font-bold text-[#FF758F] mb-1">เข้าสู่ระบบคุณครู 🏫</h2>
          <p class="font-nunito text-slate-500 text-xs">ระบบเช็คชื่อและบันทึกเวลาเรียนนักเรียน</p>
        </div>

        <div class="hidden md:block mb-8">
          <span class="bg-[#FFE5D9] text-[#E07A5F] text-xs font-bold font-fredoka tracking-wider px-3 py-1.5 rounded-full uppercase">
            TEACHER PORTAL
          </span>
          <h1 class="font-fredoka text-3xl font-extrabold text-[#2F3E46] mt-3 mb-2">
            ลงชื่อเข้าใช้งานกันเถอะ! ✨
          </h1>
          <p class="font-nunito text-slate-500 text-sm">
            กรุณาใช้บัญชีคุณครูเพื่อเข้าดูแลชั้นเรียนและการเช็คชื่อนักเรียน
          </p>
        </div>

        <!-- Success Alert -->
        <div v-if="isSuccess" class="mb-6 bg-teal-50 border-2 border-teal-200 text-teal-800 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up">
          <span class="text-2xl">🎉</span>
          <div>
            <h3 class="font-bold text-sm">เข้าสู่ระบบสำเร็จแล้วค่ะ!</h3>
            <p class="text-xs text-teal-600 mt-0.5">ระบบกำลังนำคุณครูเข้าสู่หน้าแดชบอร์ดจัดการชั้นเรียน...</p>
          </div>
        </div>

        <!-- Error Banner -->
        <div v-if="errorMessage && !hasError" class="mb-6 bg-rose-50 border-2 border-rose-100 text-rose-800 p-4 rounded-2xl flex items-start gap-3 relative transition-all duration-300">
          <span class="text-xl">⚠️</span>
          <div class="flex-1">
            <h3 class="font-bold text-sm font-fredoka text-rose-700">มีข้อผิดพลาดบางอย่างเกิดขึ้นนะคะ</h3>
            <p class="text-xs text-rose-600 font-nunito mt-0.5">{{ errorMessage }}</p>
          </div>
          <button @click="errorMessage = ''" class="text-rose-400 hover:text-rose-700 text-sm font-semibold absolute top-2 right-3 transition-colors">
            ✕
          </button>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Username/Email Field -->
          <div class="space-y-1.5">
            <label for="emailOrId" class="block font-fredoka text-sm font-bold text-[#4A5759] flex items-center gap-1.5 pl-1">
              <span>📧</span> อีเมล หรือ รหัสประจำตัวคุณครู
            </label>
            <div class="relative">
              <input 
                id="emailOrId"
                v-model="form.emailOrId"
                type="text" 
                placeholder="เช่น sornsiri.k@school.mail หรือ T1024"
                class="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3.5 pl-12 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
                :disabled="isLoading || isSuccess"
              />
              <span class="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </span>
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center pl-1">
              <label for="password" class="block font-fredoka text-sm font-bold text-[#4A5759] flex items-center gap-1.5">
                <span>🔑</span> รหัสผ่าน
              </label>
              <NuxtLink 
                to="/teachers/forgot-password" 
                class="text-xs text-[#FF758F] font-bold hover:underline hover:text-[#FF4D6D] transition-colors"
              >
                ลืมรหัสผ่านใช่ไหม? 🤔
              </NuxtLink>
            </div>
            <div class="relative">
              <input 
                id="password"
                v-model="form.password"
                :type="isPasswordVisible ? 'text' : 'password'" 
                placeholder="••••••••"
                class="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3.5 pl-12 pr-12 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
                :disabled="isLoading || isSuccess"
              />
              <span class="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </span>
              
              <!-- Toggle Password Button -->
              <button 
                type="button" 
                @click="isPasswordVisible = !isPasswordVisible" 
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                :disabled="isLoading || isSuccess"
              >
                <svg v-if="isPasswordVisible" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.808 7.808 3.192 3.192m-3.192-3.192-2.036-2.036M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center justify-between pl-1">
            <label class="flex items-center gap-2 cursor-pointer group text-slate-600 select-none">
              <div class="relative">
                <input 
                  type="checkbox" 
                  v-model="form.rememberMe"
                  class="sr-only peer"
                  :disabled="isLoading || isSuccess"
                />
                <div class="w-5 h-5 bg-slate-100 border-2 border-slate-200/80 rounded-md transition-all duration-200 peer-checked:bg-[#FF758F] peer-checked:border-[#FF758F] flex items-center justify-center">
                  <!-- Checkmark icon -->
                  <svg v-if="form.rememberMe" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="white" class="w-3.5 h-3.5 transition-opacity duration-200">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <span class="text-xs font-semibold group-hover:text-slate-800 transition-colors">จดจำการเข้าสู่ระบบ 🍪</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="w-full bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF758F] text-white font-fredoka font-bold text-base py-4 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-pink-100 active:scale-[0.98] focus:ring-4 focus:ring-pink-200/80 focus:outline-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            :disabled="isLoading || isSuccess"
          >
            <template v-if="isLoading">
              <svg class="animate-spin h-5.5 w-5.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>กำลังตรวจสอบข้อมูล...</span>
            </template>
            <template v-else>
              <span>เข้าสู่ระบบระบบเช็คชื่อ 🚀</span>
            </template>
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-8 text-center border-t border-slate-100 pt-6">
          <p class="text-sm font-semibold text-slate-500">
            ยังไม่มีบัญชีสำหรับคุณครูใช่ไหม? 
            <NuxtLink 
              to="/teachers/register" 
              class="text-[#FF758F] font-extrabold hover:text-[#FF4D6D] underline hover:underline transition-colors ml-1.5 inline-block group"
            >
              สมัครสมาชิกคุณครูที่นี่ ✏️
              <span class="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </NuxtLink>
          </p>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
