<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  activeItem: string
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', val: boolean): void
  (e: 'select', val: string): void
  (e: 'logout'): void
}>()

const { teacherProfile } = useTeacherSession()

// Navigation Items
const navItems = [
  { id: 'dashboard', label: 'หน้าแรก / แดชบอร์ด', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
  { id: 'classes', label: 'จัดการชั้นเรียน', icon: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25' },
  { id: 'students', label: 'รายชื่อนักเรียน', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A5.98 5.98 0 0 1 11.625 21 5.98 5.98 0 0 1 5 19.237v-.11c0-1.113.285-2.16.786-3.07M15 19.128v.11M5 19.128v-.003c0-1.113.285-2.16.786-3.07M5 19.128v.11m0-.11A4.125 4.125 0 0 0 5 14.14M5 19.128v.109a5.98 5.98 0 0 0 3.375-1.865M15 8.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 2.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5-2.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z' },
  { id: 'prefect', label: 'สารวัตรนักเรียน', icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z' },
  { id: 'reports', label: 'รายงานการเข้าเรียน', icon: 'M3.75 3v16.5M19.5 3v16.5M6.75 6.75h4.5m-4.5 3h4.5m-4.5 3h4.5m-4.5 3h4.5m6.75-9h4.5m-4.5 3h4.5m-4.5 3h4.5m-4.5 3h4.5M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25v-13.5a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25Z' },
  { id: 'settings', label: 'ตั้งค่าระบบ', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28Z' }
]

const closeDrawer = () => {
  emit('update:isOpen', false)
}

const handleSelect = (id: string) => {
  emit('select', id)
  if (id === 'dashboard') {
    navigateTo('/teachers/dashboard')
  } else if (id === 'classes') {
    navigateTo('/teachers/classroom')
  } else if (id === 'students') {
    navigateTo('/teachers/student')
  } else if (id === 'prefect') {
    navigateTo('/teachers/prefect')
  } else if (id === 'reports') {
    navigateTo('/teachers/report')
  } else if (id === 'settings') {
    navigateTo('/teachers/setting')
  }
}
</script>

<template>
  <div>
    <!-- DESKTOP SIDEBAR -->
    <aside class="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 flex-shrink-0 sticky top-0 h-screen z-20">
      <!-- Sidebar Header / Logo -->
      <div class="p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF758F] to-[#FF4D6D] flex items-center justify-center text-white shadow-md shadow-pink-100 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 18 3H6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25V5.25" />
          </svg>
        </div>
        <div>
          <h2 class="font-fredoka text-base font-extrabold text-[#2F3E46] leading-none">Student Portal</h2>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance System</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="handleSelect(item.id)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-fredoka font-bold text-sm transition-all duration-200 cursor-pointer text-left',
            activeItem === item.id 
              ? 'bg-gradient-to-r from-pink-50 to-pink-100/30 text-[#FF758F]' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-[#2F3E46]'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-slate-100">
        <div 
          @click="handleSelect('settings')"
          class="flex items-center gap-3 p-2 bg-slate-50/50 hover:bg-slate-100/50 rounded-2xl mb-3 border border-slate-100/60 cursor-pointer transition-all duration-200"
        >
          <div class="w-10 h-10 rounded-xl bg-pink-100 text-[#FF758F] font-fredoka font-extrabold text-sm flex items-center justify-center flex-shrink-0">
            {{ teacherProfile.avatarInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-slate-700 truncate leading-tight">{{ teacherProfile.name }}</p>
            <span class="text-[10px] text-slate-400 font-bold truncate block">{{ teacherProfile.school }}</span>
          </div>
        </div>

        <button 
          @click="emit('logout')"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-100 bg-rose-50/30 text-rose-500 font-fredoka font-bold text-sm hover:bg-rose-50 transition-all duration-200 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- MOBILE SIDEBAR / DRAWER -->
    <transition name="drawer">
      <div v-if="isOpen" class="lg:hidden fixed inset-0 z-40 flex">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="closeDrawer"></div>

        <!-- Sidebar Content -->
        <div class="relative flex flex-col w-64 max-w-xs bg-white h-full shadow-2xl z-50 animate-slide-in">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF758F] to-[#FF4D6D] flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 18 3H6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25V5.25" />
                </svg>
              </div>
              <span class="font-fredoka text-sm font-extrabold text-[#2F3E46]">Student Portal</span>
            </div>
            
            <button @click="closeDrawer" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
            <button
              v-for="item in navItems"
              :key="item.id"
              @click="handleSelect(item.id); closeDrawer()"
              :class="[
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-fredoka font-bold text-xs transition-all duration-200 cursor-pointer text-left',
                activeItem === item.id 
                  ? 'bg-gradient-to-r from-pink-50 to-pink-100/30 text-[#FF758F]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#2F3E46]'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5 flex-shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <div class="p-4 border-t border-slate-100">
            <button 
              @click="emit('logout'); closeDrawer()"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50/30 text-rose-500 font-fredoka font-bold text-xs hover:bg-rose-50 transition-all duration-200 cursor-pointer"
            >
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Drawer mobile slide transitions */
.drawer-enter-active, .drawer-leave-active {
  transition: all 0.3s ease-out;
}
.drawer-enter-from, .drawer-leave-to {
  transform: translateX(-100%);
}
</style>
