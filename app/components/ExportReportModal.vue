<script setup lang="ts">
interface Props {
  isOpen: boolean
  classroomName: string
  classroomSubject?: string
  classroomId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleSelectFormat = (format: 'excel' | 'pdf' | 'excel-all') => {
  emit('close')
  navigateTo({
    path: '/teachers/report',
    query: { classId: props.classroomId, export: format },
  })
}
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="emit('close')"></div>

        <!-- Modal Box -->
        <div class="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2.2rem] border border-slate-100 shadow-2xl p-6 sm:p-8 transform transition-all duration-300 scale-100 flex flex-col z-10 overflow-visible">
          
          <!-- Decorative Background Blurs in Modal -->
          <div class="absolute -top-10 -left-10 w-24 h-24 bg-pink-100/30 rounded-full blur-xl pointer-events-none -z-10"></div>
          <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-100/30 rounded-full blur-xl pointer-events-none -z-10"></div>

          <!-- Close Icon Button -->
          <button 
            @click="emit('close')"
            class="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header -->
          <div class="mb-6 text-center flex flex-col items-center">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/10 to-emerald-500/10 text-slate-700 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7 text-slate-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h4 class="font-fredoka text-lg font-extrabold text-slate-800 leading-snug">ส่งออกรายงานสรุป</h4>
            <div class="mt-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 inline-block max-w-full">
              <p class="font-nunito text-[11px] text-slate-500 font-bold truncate">
                ห้องเรียน: <span class="text-slate-800">{{ classroomName }}</span>
              </p>
              <p v-if="classroomSubject" class="font-nunito text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                วิชา: <span>{{ classroomSubject }}</span>
              </p>
            </div>
          </div>

          <!-- Options Grid -->
          <div class="space-y-3 mb-6">
            <!-- Excel Option -->
            <button 
              @click="handleSelectFormat('excel')"
              class="w-full p-4 bg-white border border-slate-100 hover:border-emerald-500 rounded-2xl hover:bg-emerald-50/20 text-left transition-all duration-300 flex items-center gap-4 cursor-pointer group shadow-xs hover:shadow-md"
            >
              <div class="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-100/80 text-emerald-600 flex items-center justify-center flex-shrink-0 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v16.5M21 3v16.5M5.25 5.25h13.5m-13.5 4.5h13.5m-13.5 4.5h13.5m-13.5 4.5h13.5" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="font-fredoka text-sm font-extrabold text-slate-800 group-hover:text-emerald-700 block transition-colors">
                  ส่งออกไฟล์ Excel (.xlsx) (เฉพาะห้องนี้)
                </span>
                <span class="font-nunito text-xs text-slate-400 font-semibold block mt-0.5">
                  ตารางรายงานข้อมูล รายชื่อ สถิติ และการเข้าเรียนของห้องนี้
                </span>
              </div>
              <div class="text-slate-300 group-hover:text-emerald-500 transition-colors pr-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>

            <!-- PDF Option -->
            <button 
              @click="handleSelectFormat('pdf')"
              class="w-full p-4 bg-white border border-slate-100 hover:border-[#FF758F] rounded-2xl hover:bg-pink-50/20 text-left transition-all duration-300 flex items-center gap-4 cursor-pointer group shadow-xs hover:shadow-md"
            >
              <div class="w-12 h-12 rounded-xl bg-pink-50 group-hover:bg-pink-100/80 text-[#FF758F] flex items-center justify-center flex-shrink-0 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="font-fredoka text-sm font-extrabold text-slate-800 group-hover:text-[#FF758F] block transition-colors">
                  พิมพ์รายงาน PDF (.pdf) (เฉพาะห้องนี้)
                </span>
                <span class="font-nunito text-xs text-slate-400 font-semibold block mt-0.5">
                  พิมพ์รายงานเฉพาะห้องนี้ในขนาดกระดาษ A4
                </span>
              </div>
              <div class="text-slate-300 group-hover:text-[#FF758F] transition-colors pr-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>

            <!-- Export All Option -->
            <button 
              @click="handleSelectFormat('excel-all')"
              class="w-full p-4 bg-white border border-slate-100 hover:border-indigo-500 rounded-2xl hover:bg-indigo-50/20 text-left transition-all duration-300 flex items-center gap-4 cursor-pointer group shadow-xs hover:shadow-md"
            >
              <div class="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100/80 text-indigo-600 flex items-center justify-center flex-shrink-0 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="font-fredoka text-sm font-extrabold text-slate-800 group-hover:text-indigo-700 block transition-colors">
                  ส่งออก Excel ทุกห้องเรียน (.xlsx)
                </span>
                <span class="font-nunito text-xs text-slate-400 font-semibold block mt-0.5">
                  รวมรายงานสรุปของทุกห้องเรียนที่สอนลงในไฟล์เดียวแยกตามชีต
                </span>
              </div>
              <div class="text-slate-300 group-hover:text-indigo-500 transition-colors pr-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Footer Action -->
          <button 
            @click="emit('close')"
            class="w-full py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
          >
            ยกเลิก
          </button>

        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
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
</style>
