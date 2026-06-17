<template>
  <div class="min-h-screen bg-gradient-to-br from-[#FFE5D9] via-[#FAF0CA] to-[#D8E2DC] flex items-center justify-center p-4 font-sans">
    <div class="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-8 max-w-md w-full text-center shadow-xl">
      <h1 class="font-fredoka text-2xl font-bold text-[#FF758F] mb-2">หน้าสมัครสมาชิกสำหรับคุณครู ✏️</h1>
      <p class="font-nunito text-slate-600 text-sm mb-6">กำลังอยู่ระหว่างการพัฒนาคู่ขนานกับหน้าเข้าสู่ระบบค่ะ</p>
      
      <NuxtLink 
        to="/teachers/login" 
        class="inline-block bg-[#FF758F] hover:bg-[#FF4D6D] text-white font-fredoka font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all duration-200"
      >
        กลับสู่หน้าเข้าสู่ระบบ 🏫
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'สมัครสมาชิกสำหรับคุณครู - Student Attendance System'
})
</script>
