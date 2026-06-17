<script setup lang="ts">
useHead({
  title: 'ระบบเช็คชื่อและบันทึกเวลาเรียน | Student Attendance System',
  meta: [
    { name: 'description', content: 'ยินดีต้อนรับเข้าสู่ระบบเช็คชื่อและบันทึกเวลาเรียนของนักเรียน ตรีมน่ารัก ใช้งานง่าย' }
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
    <div class="absolute top-[10%] left-[15%] text-6xl opacity-15 animate-drift pointer-events-none">☁️</div>
    <div class="absolute top-[40%] right-[20%] text-5xl opacity-10 animate-float pointer-events-none">☁️</div>
    <div class="absolute bottom-[25%] left-[5%] text-7xl opacity-10 animate-float-slow pointer-events-none">☁️</div>

    <!-- Small Emojis Floating in the background -->
    <div class="absolute top-10 right-20 text-4xl opacity-35 animate-float hidden sm:block">🎒</div>
    <div class="absolute bottom-20 left-12 text-4xl opacity-35 animate-float-slow hidden sm:block">📚</div>
    <div class="absolute top-[60%] left-24 text-3xl opacity-35 animate-float-medium hidden sm:block">✏️</div>
    <div class="absolute top-[25%] left-[35%] text-3xl opacity-25 animate-float hidden sm:block">⭐</div>
    <div class="absolute bottom-40 right-[35%] text-4xl opacity-35 animate-float-slow hidden sm:block">🎈</div>

    <!-- Centered Card Container (Compact sizing) -->
    <div class="max-w-3xl w-full bg-white/85 backdrop-blur-2xl border border-white rounded-[2rem] p-5 sm:p-8 shadow-2xl relative z-10 flex flex-col items-center text-center animate-fade-in-up my-auto">
      
      <!-- Logo Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1 bg-pink-100/60 border border-pink-200/50 rounded-full text-[#FF758F] font-fredoka text-[10px] sm:text-xs font-bold tracking-wider mb-4 animate-pulse">
        <span>🏫</span> STUDENT PORTAL SYSTEM
      </div>

      <!-- School illustration with circular background (compact dimensions) -->
      <div class="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50/50 rounded-full border border-white shadow-inner p-2.5 mb-4 group">
        <img 
          src="/images/school_hero.png" 
          alt="School Mascot" 
          class="w-full h-full object-contain drop-shadow-xl animate-float-medium group-hover:scale-105 transition-transform duration-300"
        />
        <div class="absolute -top-1 -right-1 text-2xl animate-bounce">⭐</div>
        <div class="absolute -bottom-1 -left-1 text-2xl animate-pulse">✨</div>
      </div>

      <!-- Titles (compact sizes) -->
      <h1 class="font-fredoka text-2xl sm:text-3xl font-extrabold text-[#2F3E46] leading-tight mb-1.5">
        Attendance <span class="text-[#FF758F]">System</span>
      </h1>
      <p class="font-nunito text-[#596A7A] text-xs sm:text-sm leading-relaxed max-w-sm mb-6 font-semibold">
        ระบบบันทึกเวลาเรียนและเช็คชื่อนักเรียนแสนน่ารัก ช่วยจัดการชั้นเรียนของห้องเรียนคุณครูให้สดใสและง่ายดายค่ะ 💖
      </p>

      <!-- Portal Selectors (Horizontal Cards Grid, compact spacing) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl mb-5">
        
        <!-- Teacher Portal Card -->
        <NuxtLink 
          to="/teachers/login"
          class="group bg-gradient-to-br from-white to-pink-50/10 hover:to-pink-50/30 border border-slate-100 hover:border-[#FF758F] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left hover:-translate-y-1 active:scale-[0.99] cursor-pointer relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 w-20 h-20 bg-[#FFE5D9]/40 rounded-bl-[3.5rem] group-hover:bg-[#FFD3E0]/40 transition-colors duration-300 pointer-events-none"></div>
          
          <div class="relative">
            <!-- Icon -->
            <div class="w-10 h-10 bg-white text-[#E07A5F] rounded-lg flex items-center justify-center text-xl border border-pink-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 mb-3.5 shadow-sm">
              👩‍🏫
            </div>
            
            <h3 class="font-fredoka text-base sm:text-lg font-bold text-[#2F3E46] group-hover:text-[#FF758F] transition-colors duration-200">
              พอร์ทัลคุณครู (Teacher Portal)
            </h3>
            
            <p class="font-nunito text-[#596A7A] text-xs mt-1 leading-relaxed">
              สำหรับคุณครูเพื่อเข้าเช็คชื่อเด็กนักเรียน บันทึกประวัติเวลาเข้าแถว และตรวจสอบสรุปผล
            </p>
          </div>
          
          <!-- Bottom Action Link -->
          <div class="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-between text-[#FF758F]">
            <span class="text-xs font-bold font-fredoka">เข้าสู่ระบบคุณครู ✏️</span>
            <div class="w-6 h-6 rounded-full bg-white border border-pink-100 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </NuxtLink>

        <!-- Student Portal Card (Coming Soon) -->
        <div 
          class="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm opacity-80 flex flex-col justify-between text-left relative overflow-hidden"
        >
          <!-- Coming Soon Badge -->
          <div class="absolute top-2.5 right-3 bg-[#E3F2FD] border border-blue-200 text-[#1E88E5] text-[8px] font-bold font-fredoka tracking-wider px-2 py-0.5 rounded-full uppercase">
            เร็วๆ นี้ 🧸
          </div>

          <div>
            <!-- Icon -->
            <div class="w-10 h-10 bg-white text-slate-400 rounded-lg flex items-center justify-center text-xl border border-slate-200/50 mb-3.5 shadow-sm">
              🎒
            </div>
            
            <h3 class="font-fredoka text-base sm:text-lg font-bold text-slate-400">
              พอร์ทัลนักเรียน (Student Portal)
            </h3>
            
            <p class="font-nunito text-slate-400/80 text-xs mt-1 leading-relaxed">
              สำหรับนักเรียนและผู้ปกครองเพื่อเข้าตรวจสถิติเวลาเรียน และข้อมูลประวัติการลาเรียน
            </p>
          </div>
          
          <!-- Bottom Action Placeholder -->
          <div class="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-between text-slate-400/70">
            <span class="text-xs font-bold font-fredoka">กำลังอยู่ระหว่างพัฒนา</span>
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
        <span>💡</span>
        <span>มีข้อสงสัยการใช้งาน? ติดต่อฝ่ายสนับสนุนระบบโรงเรียนได้ค่ะ</span>
      </div>

    </div>

    <!-- Footer Copyright -->
    <footer class="pb-2 relative z-10 text-center mt-4">
      <div class="text-[9px] sm:text-xs text-slate-400 font-semibold bg-white/40 border border-white/60 px-4 py-1.5 rounded-full shadow-sm">
        © 2026 Student Attendance System • Design with 💖 for sweet learning
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
