<script setup lang="ts">
interface Props {
  show: boolean
  text?: string
}

withDefaults(defineProps<Props>(), {
  show: false,
  text: 'กำลังบันทึกข้อมูล'
})
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <!-- Backdrop with soft blur -->
        <div class="fixed inset-0 bg-slate-900/20 backdrop-blur-md"></div>

        <!-- Center Cute Card Box -->
        <div class="relative bg-white/95 backdrop-blur-lg border-2 border-pink-100 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center max-w-xs w-full text-center transform scale-100 transition-transform duration-300">
          
          <!-- Cute background decorative pink & yellow blur blobs -->
          <div class="absolute -top-10 -left-10 w-28 h-28 bg-pink-200/40 rounded-full blur-xl pointer-events-none -z-10 animate-pulse"></div>
          <div class="absolute -bottom-10 -right-10 w-28 h-28 bg-amber-100/40 rounded-full blur-xl pointer-events-none -z-10"></div>
          
          <!-- Little floating background stars -->
          <div class="absolute top-4 right-8 text-sm opacity-50 animate-float">⭐</div>
          <div class="absolute bottom-6 left-6 text-sm opacity-40 animate-float-slow">✨</div>

          <!-- Playful Bouncing Mascot/School Items Row -->
          <div class="flex items-end justify-center gap-3.5 h-20 mb-3">
            <!-- Pencil -->
            <div class="text-3xl animate-bounce-pencil">✏️</div>
            <!-- School Backpack -->
            <div class="text-4xl animate-bounce-backpack relative">
              🎒
              <!-- Small cute eyes overlay on backpack for cuteness -->
              <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1.5 pointer-events-none opacity-90 select-none">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              </span>
            </div>
            <!-- Book stack -->
            <div class="text-3xl animate-bounce-book">📚</div>
          </div>

          <!-- Shadow indicator below bouncing items -->
          <div class="w-24 h-1.5 bg-slate-100 rounded-full blur-[1px] mb-6 animate-shadow-scale"></div>

          <!-- Cute pulsing text with bouncing dots -->
          <div class="space-y-1">
            <h4 class="font-fredoka text-sm sm:text-base font-extrabold text-slate-700 leading-snug">
              {{ text }}
            </h4>
            <!-- Bouncing dots -->
            <div class="flex justify-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[#FF758F] animate-dot-1"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-pink-400 animate-dot-2"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-dot-3"></span>
            </div>
          </div>

        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active > div:last-child,
.fade-leave-active > div:last-child {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from > div:last-child {
  transform: scale(0.9);
}

.fade-leave-to > div:last-child {
  transform: scale(0.95);
}

/* Cute squishy bounce animation for Pencil */
@keyframes bouncePencil {
  0%, 100% {
    transform: translateY(0) rotate(-10deg);
  }
  50% {
    transform: translateY(-22px) rotate(15deg);
  }
}
.animate-bounce-pencil {
  animation: bouncePencil 1.2s ease-in-out infinite;
  animation-delay: 0s;
}

/* Cute squishy bounce animation for Backpack */
@keyframes bounceBackpack {
  0%, 100% {
    transform: translateY(0) scale(1, 1);
  }
  50% {
    transform: translateY(-28px) scale(0.95, 1.05);
  }
}
.animate-bounce-backpack {
  animation: bounceBackpack 1.2s ease-in-out infinite;
  animation-delay: 0.2s;
}

/* Cute squishy bounce animation for Books */
@keyframes bounceBook {
  0%, 100% {
    transform: translateY(0) rotate(10deg);
  }
  50% {
    transform: translateY(-18px) rotate(-15deg);
  }
}
.animate-bounce-book {
  animation: bounceBook 1.2s ease-in-out infinite;
  animation-delay: 0.4s;
}

/* Shadow scaling underneath the bounce */
@keyframes shadowScale {
  0%, 100% {
    transform: scaleX(1);
    opacity: 0.6;
  }
  50% {
    transform: scaleX(0.5);
    opacity: 0.15;
    filter: blur(2px);
  }
}
.animate-shadow-scale {
  animation: shadowScale 1.2s ease-in-out infinite;
  animation-delay: 0.2s;
  margin: 0 auto;
}

/* Floating animation for decorative stars */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(10deg); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(-15deg); }
}
.animate-float-slow {
  animation: floatSlow 5s ease-in-out infinite;
}

/* Cute loading dots bounce */
@keyframes dotBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-dot-1 {
  animation: dotBounce 1s infinite ease-in-out;
  animation-delay: 0s;
}
.animate-dot-2 {
  animation: dotBounce 1s infinite ease-in-out;
  animation-delay: 0.2s;
}
.animate-dot-3 {
  animation: dotBounce 1s infinite ease-in-out;
  animation-delay: 0.4s;
}
</style>
