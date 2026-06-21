<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}

withDefaults(defineProps<Props>(), {
  title: 'ยืนยันการทำรายการ',
  message: 'คุณแน่ใจหรือไม่ที่จะทำรายการนี้?',
  confirmText: 'ตกลง',
  cancelText: 'ยกเลิก',
  type: 'warning'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="emit('cancel')"></div>

        <!-- Modal Box -->
        <div class="relative w-full max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-2xl p-6 text-center transform transition-all duration-300 scale-100 flex flex-col items-center">
          
          <!-- Decorative Background Blurs in Modal -->
          <div class="absolute -top-10 -left-10 w-24 h-24 bg-pink-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>
          <div class="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-100/35 rounded-full blur-xl pointer-events-none -z-10"></div>

          <!-- Icon wrapper -->
          <div class="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
               :class="[
                 type === 'warning' ? 'bg-amber-50 text-amber-500 border border-amber-100/80' :
                 type === 'danger' ? 'bg-rose-50 text-[#FF758F] border border-rose-100/80' :
                 'bg-sky-50 text-sky-500 border border-sky-100/80'
               ]">
            <!-- Door-exit SVG for Danger/Logout -->
            <svg v-if="type === 'danger'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            <!-- Warning SVG -->
            <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <!-- Info SVG -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.063 1.06l-.041.02-.08.04H12v.002h.008a.75.75 0 0 1 1.5 0v.008h-.008v-.008ZM12 3v18M3 12h18" />
            </svg>
          </div>

          <!-- Titles & Message -->
          <div class="relative z-10 mb-6">
            <h4 class="font-fredoka text-base sm:text-lg font-extrabold text-slate-800 leading-snug">{{ title }}</h4>
            <p class="font-nunito text-xs sm:text-sm text-slate-500 font-semibold mt-2 px-1 leading-relaxed">
              {{ message }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="relative z-10 flex w-full gap-3">
            <button 
              @click="emit('cancel')"
              class="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="emit('confirm')"
              :class="[
                'flex-1 px-4 py-2.5 sm:py-3 font-fredoka font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer text-center text-white shadow-md',
                type === 'danger' ? 'bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] hover:from-[#FF4D6D] hover:to-[#FF335c] shadow-pink-100' :
                type === 'warning' ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-amber-100' :
                'bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 shadow-sky-100'
              ]"
            >
              {{ confirmText }}
            </button>
          </div>

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
