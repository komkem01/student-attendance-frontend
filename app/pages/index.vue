<script setup lang="ts">
useHead({
  title: 'ระบบเช็คชื่อและบันทึกเวลาเรียน | Student Attendance System',
  meta: [
    { name: 'description', content: 'ยินดีต้อนรับเข้าสู่ระบบเช็คชื่อและบันทึกเวลาเรียนของนักเรียน' }
  ]
})
</script>

<template>
  <div class="bg-gradient-to-br from-[#FFF0F3] via-[#FFF6E6] to-[#E6F0FA] min-h-screen h-screen relative overflow-hidden flex flex-col items-center justify-between p-4 sm:p-6 font-sans select-none">
    
    <!-- Floating background decorative blur bubbles -->
    <div class="absolute top-[5%] left-[5%] w-48 h-48 bg-pink-300/20 rounded-full blur-3xl animate-float-slow pointer-events-none"></div>
    <div class="absolute bottom-[8%] right-[5%] w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-[35%] right-[15%] w-36 h-36 bg-amber-300/20 rounded-full blur-2xl animate-float-medium pointer-events-none"></div>
    <div class="absolute bottom-[5%] left-[10%] w-60 h-60 bg-purple-300/20 rounded-full blur-3xl animate-drift pointer-events-none"></div>

    <!-- Background clouds -->
    <div class="absolute top-[10%] left-[15%] text-6xl opacity-10 animate-drift pointer-events-none">☁️</div>
    <div class="absolute top-[40%] right-[20%] text-5xl opacity-8 animate-float pointer-events-none">☁️</div>
    <div class="absolute bottom-[25%] left-[5%] text-7xl opacity-8 animate-float-slow pointer-events-none">☁️</div>

    <!-- Centered Card Container -->
    <div class="max-w-3xl w-full bg-white/85 backdrop-blur-2xl border border-white rounded-[2rem] p-5 sm:p-8 shadow-2xl relative z-10 flex flex-col items-center text-center animate-fade-in-up my-auto">
      
      <!-- Logo Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1 bg-pink-100/60 border border-pink-200/50 rounded-full text-[#FF758F] font-fredoka text-[10px] sm:text-xs font-bold tracking-wider mb-4 animate-pulse">
        STUDENT PORTAL SYSTEM
      </div>

      <!-- School illustration with circular background -->
      <div class="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50/50 rounded-full border border-white shadow-inner p-2.5 mb-4 group">
        <img 
          src="/images/school_hero.png" 
          alt="School Mascot" 
          class="w-full h-full object-contain drop-shadow-xl animate-float-medium group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <!-- Titles -->
      <h1 class="font-fredoka text-2xl sm:text-3xl font-extrabold text-[#2F3E46] leading-tight mb-1.5">
        Attendance <span class="text-[#FF758F]">System</span>
      </h1>
      <p class="font-nunito text-[#596A7A] text-xs sm:text-sm leading-relaxed max-w-sm mb-6 font-semibold">
        ระบบบันทึกเวลาเรียนและเช็คชื่อนักเรียน เพื่อช่วยจัดการชั้นเรียนของคุณครูอย่างสะดวกและมีประสิทธิภาพ
      </p>

      <!-- Portal Selectors (Cards Grid) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full max-w-3xl mb-5">
        
        <!-- Teacher Portal Card -->
        <NuxtLink 
          to="/teachers/login"
          class="group bg-gradient-to-br from-white to-pink-50/10 hover:to-pink-50/30 border border-slate-100 hover:border-[#FF758F] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left hover:-translate-y-1 active:scale-[0.99] cursor-pointer relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 w-20 h-20 bg-[#FFE5D9]/40 rounded-bl-[3.5rem] group-hover:bg-[#FFD3E0]/40 transition-colors duration-300 pointer-events-none"></div>
          
          <div class="relative">
            <div class="w-10 h-10 bg-white text-[#E07A5F] rounded-lg flex items-center justify-center text-xl border border-pink-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 mb-3.5 shadow-sm">
              👩‍🏫
            </div>
            <h3 class="font-fredoka text-base sm:text-lg font-bold text-[#2F3E46] group-hover:text-[#FF758F] transition-colors duration-200">
              พอร์ทัลคุณครู
            </h3>
            <p class="font-nunito text-[#596A7A] text-xs mt-1 leading-relaxed">
              สำหรับคุณครูเพื่อเช็คชื่อนักเรียน บันทึกเวลาเข้าแถว และตรวจสอบสรุปผล
            </p>
          </div>
          
          <div class="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-between text-[#FF758F]">
            <span class="text-xs font-bold font-fredoka">เข้าสู่ระบบครู</span>
            <div class="w-6 h-6 rounded-full bg-white border border-pink-100 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </NuxtLink>

        <!-- Student Inspector (Prefect) Portal Card -->
        <NuxtLink 
          to="/prefect/login"
          class="group bg-gradient-to-br from-white to-indigo-50/10 hover:to-indigo-50/40 border border-slate-100 hover:border-indigo-400 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left hover:-translate-y-1 active:scale-[0.99] cursor-pointer relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 w-20 h-20 bg-indigo-100/40 rounded-bl-[3.5rem] group-hover:bg-indigo-200/40 transition-colors duration-300 pointer-events-none"></div>

          <div class="relative">
            <div class="w-10 h-10 bg-white text-indigo-500 rounded-lg flex items-center justify-center text-xl border border-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 mb-3.5 shadow-sm">
              🛡️
            </div>
            <h3 class="font-fredoka text-base sm:text-lg font-bold text-[#2F3E46] group-hover:text-indigo-600 transition-colors duration-200">
              สารวัตรนักเรียน
            </h3>
            <p class="font-nunito text-[#596A7A] text-xs mt-1 leading-relaxed">
              สำหรับสารวัตรนักเรียนเพื่อเช็คชื่อนักเรียนหน้าประตูโรงเรียนและบันทึกเวลาเข้าแถว
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-between text-indigo-500">
            <span class="text-xs font-bold font-fredoka">เข้าสู่ระบบสารวัตร</span>
            <div class="w-6 h-6 rounded-full bg-white border border-indigo-100 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </NuxtLink>

        <!-- Student/Parent Portal Card (Coming Soon) -->
        <div 
          class="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm opacity-75 flex flex-col justify-between text-left relative overflow-hidden sm:col-span-2 lg:col-span-1"
        >
          <div class="absolute top-2.5 right-3 bg-[#E3F2FD] border border-blue-200 text-[#1E88E5] text-[8px] font-bold font-fredoka tracking-wider px-2 py-0.5 rounded-full uppercase">
            เร็วๆ นี้
          </div>

          <div>
            <div class="w-10 h-10 bg-white text-slate-400 rounded-lg flex items-center justify-center text-xl border border-slate-200/50 mb-3.5 shadow-sm">
              🎒
            </div>
            <h3 class="font-fredoka text-base sm:text-lg font-bold text-slate-400">
              พอร์ทัลนักเรียน
            </h3>
            <p class="font-nunito text-slate-400/80 text-xs mt-1 leading-relaxed">
              สำหรับนักเรียนและผู้ปกครองตรวจสอบสถิติเวลาเรียนและประวัติการลาเรียน
            </p>
          </div>
          
          <div class="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-between text-slate-400/70">
            <span class="text-xs font-bold font-fredoka">กำลังพัฒนา</span>
            <div class="w-6 h-6 rounded-full bg-white border border-slate-200/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      <!-- Help Info banner -->
      <div class="bg-[#FAF0CA]/20 border border-[#FAF0CA]/50 rounded-xl p-2.5 text-left text-slate-500 font-nunito text-xs flex gap-2 w-full max-w-2xl">
        <span>ข้อมูลเพิ่มเติม: ติดต่อฝ่ายสนับสนุนระบบของโรงเรียน</span>
      </div>

    </div>

    <!-- Footer Copyright -->
    <footer class="pb-2 relative z-10 text-center mt-4">
      <div class="text-[9px] sm:text-xs text-slate-400 font-semibold bg-white/40 border border-white/60 px-4 py-1.5 rounded-full shadow-sm">
        © 2026 Student Attendance System • All rights reserved.
      </div>
    </footer>

  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
