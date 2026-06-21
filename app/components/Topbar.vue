<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  title: string
  currentDateText: string
  teacherProfile: {
    name: string
    school: string
    email: string
    avatarInitials: string
  }
}>()

const emit = defineEmits<{
  (e: 'toggleSidebar'): void
  (e: 'logout'): void
}>()

const isProfileDropdownOpen = ref(false)

const handleLogout = () => {
  isProfileDropdownOpen.value = false
  emit('logout')
}

const goToProfile = () => {
  isProfileDropdownOpen.value = false
  navigateTo('/teachers/setting')
}

// Close dropdown on click away
const closeDropdown = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target) return
  if (!target.closest('.profile-dropdown-container')) {
    isProfileDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <header class="bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <!-- Mobile Menu Toggle Button -->
      <button 
        @click="emit('toggleSidebar')" 
        class="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-50 text-slate-500 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <div>
        <h1 class="font-fredoka text-lg sm:text-xl font-extrabold text-slate-800 leading-tight">{{ title }}</h1>
        <p class="font-nunito text-[11px] sm:text-xs text-slate-400 font-semibold">{{ currentDateText }}</p>
      </div>
    </div>

    <!-- Right Side: User Profile / Notifications -->
    <div class="flex items-center gap-4 relative profile-dropdown-container">
      <!-- School info text -->
      <div class="hidden sm:flex flex-col text-right">
        <span class="text-xs font-bold text-slate-700 leading-none">{{ teacherProfile.name }}</span>
        <span class="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{{ teacherProfile.school }}</span>
      </div>

      <!-- Profile Dropdown Button -->
      <div class="relative">
        <button 
          @click="isProfileDropdownOpen = !isProfileDropdownOpen"
          class="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-50 to-pink-100 border border-pink-200/50 flex items-center justify-center text-[#FF758F] font-fredoka font-extrabold text-sm shadow-sm cursor-pointer"
        >
          {{ teacherProfile.avatarInitials }}
        </button>

        <!-- Profile Dropdown Panel -->
        <transition name="dropdown">
          <div 
            v-if="isProfileDropdownOpen"
            class="absolute right-0 mt-2.5 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 space-y-1 z-30"
          >
            <div class="px-3.5 py-2.5 border-b border-slate-50">
              <p class="text-xs font-bold text-slate-800 leading-none">{{ teacherProfile.name }}</p>
              <span class="text-[10px] text-slate-400 block mt-1.5 truncate">{{ teacherProfile.email }}</span>
            </div>
            <div class="py-1">
              <button @click="goToProfile" class="w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">ข้อมูลส่วนตัว</button>
              <button @click="handleLogout" class="w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50/50 transition-colors cursor-pointer">ออกจากระบบ</button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Dropdown animation */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
