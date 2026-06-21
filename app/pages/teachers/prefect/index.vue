<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

useHead({
  title: "จัดการสารวัตรนักเรียน | Student Attendance System",
  meta: [
    {
      name: "description",
      content:
        "หน้าจัดการบัญชีสารวัตรนักเรียน สำหรับคุณครูเพื่อเพิ่ม แก้ไข หรือลบบัญชีผู้ใช้สารวัตร",
    },
  ],
});

// State for Mobile Sidebar Toggle
const isMobileSidebarOpen = ref(false);

const { teacherProfile, requireAuth } = useTeacherSession();
requireAuth();

const currentDateText = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date().toLocaleDateString("th-TH", options);
});

const {
  prefects,
  classrooms,
  isFetching,
  isSubmitting,
  toasts,
  activeTab,
  searchQuery,
  
  // Dropdowns
  selectedClassroomId,
  selectedStudentId,
  isClassroomDropdownOpen,
  isStudentDropdownOpen,
  filteredStudentsForClass,
  selectedClassroomLabel,
  selectedStudentLabel,
  selectClassroom,
  selectStudent,

  // Form
  form,
  showFormPassword,
  showFormConfirm,

  // Prefect lists / stats
  filteredPrefects,
  totalActive,
  totalToday,

  // Modals
  isAddModalOpen,
  isEditModalOpen,
  isDeleteModalOpen,
  selectedPrefect,
  openAddModal,
  openEditModal,
  openDeleteModal,
  handleAdd,
  handleEdit,
  handleDelete,
  toggleStatus,

  // Logout
  isLogoutModalOpen,
  handleLogout,
  confirmLogout
} = usePrefectList();

// Click-outside handler
const closeDropdowns = () => {
  isClassroomDropdownOpen.value = false;
  isStudentDropdownOpen.value = false;
};
onMounted(() => document.addEventListener("click", closeDropdowns));
onUnmounted(() => document.removeEventListener("click", closeDropdowns));

const getInitials = (first: string, last: string) =>
  `${first[0] ?? ""}${last[0] ?? ""}`;
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex font-sans text-[#2F3E46]">
    <!-- Toast Notifications -->
    <Teleport to="body">
      <div
        class="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none max-w-sm w-full"
      >
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="[
              'pointer-events-auto py-4 px-5 rounded-2xl shadow-xl flex items-center gap-3 border relative overflow-hidden',
              toast.type === 'success'
                ? 'bg-[#EAFDF8] border-[#A8EEDD] text-[#1E7D65]'
                : toast.type === 'error'
                  ? 'bg-[#FFF0F3] border-[#FFCCD5] text-[#A3001E]'
                  : toast.type === 'info'
                    ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]'
                    : 'bg-[#FFF9E6] border-[#FFE29A] text-[#805B00]',
            ]"
          >
            <div
              :class="[
                'absolute bottom-0 left-0 h-1 animate-toast-progress w-full',
                toast.type === 'success'
                  ? 'bg-[#1E7D65]'
                  : toast.type === 'error'
                    ? 'bg-[#A3001E]'
                    : toast.type === 'info'
                      ? 'bg-[#4338CA]'
                      : 'bg-[#805B00]',
              ]"
            ></div>
            <span class="font-nunito text-xs sm:text-sm font-bold flex-1">{{
              toast.message
            }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- BACKGROUND BLUR DECORATIONS -->
    <div class="fixed top-0 right-0 w-[400px] h-[400px] bg-[#6C5DD3]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-50/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <!-- Sidebar Layout Component -->
    <Sidebar
      v-model:isOpen="isMobileSidebarOpen"
      activeItem="prefect"
      @logout="handleLogout"
    />

    <!-- MAIN PAGE CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar Component -->
      <Topbar
        title="จัดการสารวัตรนักเรียน"
        :currentDateText="currentDateText"
        :teacherProfile="teacherProfile"
        @toggleSidebar="isMobileSidebarOpen = true"
        @logout="handleLogout"
      />

      <!-- MAIN SCROLLABLE CONTENT -->
      <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
        <div class="space-y-6">
          <!-- Directory Header Card -->
          <section class="bg-gradient-to-br from-[#6C5DD3] to-[#4361EE] rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-100/50">
            <div class="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <span class="bg-white/20 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase inline-block">
                  PREFECT MANAGEMENT
                </span>
                <h2 class="font-fredoka text-2xl sm:text-3xl font-extrabold leading-tight">
                  จัดการบัญชีสารวัตรนักเรียน
                </h2>
                <p class="font-nunito text-xs sm:text-sm text-indigo-50/90 font-medium">
                  คุณครูสามารถจัดการบัญชีผู้ใช้งานสำหรับสารวัตรนักเรียน โดยสามารถเพิ่มบัญชีใหม่ กำหนดรหัสผ่าน แก้ไขข้อมูล หรือเปิด/ปิดการใช้งานบัญชีเพื่อความปลอดภัยในการเช็คชื่อได้จากหน้านี้
                </p>
              </div>

              <!-- Quick Actions -->
              <div class="flex-shrink-0 w-full lg:w-auto">
                <button 
                  @click="openAddModal"
                  class="w-full lg:w-auto bg-white text-[#4361EE] hover:bg-indigo-50 font-fredoka font-bold text-xs px-5 py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4.5 h-4.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>เพิ่มสารวัตรนักเรียน</span>
                </button>
              </div>
            </div>
          </section>

          <!-- STATS CARDS -->
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Prefects -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">สารวัตรทั้งหมด</span>
                <span class="font-fredoka text-lg font-extrabold text-slate-800 leading-none block mt-0.5">{{ prefects.length }} คน</span>
              </div>
            </div>

            <!-- Active Prefects -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">ใช้งานอยู่</span>
                <span class="font-fredoka text-lg font-extrabold text-emerald-600 leading-none block mt-0.5">{{ totalActive }} คน</span>
              </div>
            </div>

            <!-- Today's Checks -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h3.75a.75.75 0 0 1 .75.75v17.25a.75.75 0 0 1-.75.75h-3.75a.75.75 0 0 1-.75-.75V3a.75.75 0 0 1 .75-.75ZM9 6H5.625a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 .75.75H9V6Zm15 0h-3.375a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 .75.75H24V6Z" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">เช็คชื่อวันนี้</span>
                <span class="font-fredoka text-lg font-extrabold text-blue-600 leading-none block mt-0.5">{{ totalToday }} ครั้ง</span>
              </div>
            </div>

            <!-- Suspended Prefects -->
            <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5.5 h-5.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">ระงับบัญชี</span>
                <span class="font-fredoka text-lg font-extrabold text-rose-600 leading-none block mt-0.5">{{ prefects.length - totalActive }} คน</span>
              </div>
            </div>
          </section>

          <!-- SEARCH AND FILTER CONTROLS -->
          <section class="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <!-- Search bar -->
            <div class="relative w-full">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </span>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="ค้นหาด้วยชื่อ, รหัสประจำตัว หรือชั้น/ห้อง..."
                class="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-[#6C5DD3] focus:bg-white transition-all duration-200"
              />
              <span
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
              >
                ล้าง
              </span>
            </div>
          </section>

          <!-- Prefect Table -->
          <section class="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <!-- Table Header -->
            <div class="hidden sm:grid grid-cols-12 gap-2 px-6 py-4 bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div class="col-span-4">สารวัตรนักเรียน</div>
              <div class="col-span-2">รหัสประจำตัว</div>
              <div class="col-span-2">ชั้น</div>
              <div class="col-span-2">เข้าระบบล่าสุด</div>
              <div class="col-span-1 text-center">สถานะ</div>
              <div class="col-span-1 text-center">จัดการ</div>
            </div>

            <!-- Empty State -->
            <div
              v-if="filteredPrefects.length === 0"
              class="flex flex-col items-center justify-center py-16 text-center"
            >
              <div class="text-5xl mb-4">🔍</div>
              <p class="font-fredoka text-slate-400 font-bold text-lg">
                ไม่พบข้อมูลสารวัตร
              </p>
              <p class="font-nunito text-slate-400 text-xs mt-1">
                ลองเปลี่ยนคำค้นหา หรือเพิ่มสารวัตรใหม่
              </p>
            </div>

            <!-- Table Rows -->
            <TransitionGroup name="list">
              <div
                v-for="(prefect, idx) in filteredPrefects"
                :key="prefect.id"
                :class="[
                  'grid grid-cols-1 sm:grid-cols-12 gap-2 items-center px-6 py-4.5 border-b border-slate-50 hover:bg-slate-50/40 transition-colors font-semibold text-xs sm:text-sm text-slate-600',
                  idx === filteredPrefects.length - 1 ? 'border-b-0' : '',
                ]"
              >
                <!-- Name + avatar -->
                <div class="col-span-4 flex items-center gap-3">
                  <div
                    class="w-9.5 h-9.5 rounded-full bg-gradient-to-tr from-[#6C5DD3] to-[#4361EE] text-white font-fredoka font-extrabold text-[11px] sm:text-xs flex items-center justify-center flex-shrink-0 shadow-xs uppercase"
                  >
                    {{ getInitials(prefect.firstName, prefect.lastName) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-fredoka font-bold text-slate-800 text-sm leading-tight">
                      {{ prefect.firstName }} {{ prefect.lastName }}
                    </p>
                    <p class="font-nunito text-[10px] text-slate-400 block mt-0.5 sm:hidden">
                      รหัส: #{{ prefect.inspectorId }} • {{ prefect.room ? `${prefect.grade}/${prefect.room}` : prefect.grade }}
                    </p>
                  </div>
                </div>

                <!-- Inspector ID -->
                <div class="hidden sm:block col-span-2">
                  <span
                    class="bg-indigo-50 text-indigo-700 border border-indigo-100 font-fredoka font-bold text-[10px] px-2.5 py-1 rounded-full"
                  >
                    {{ prefect.inspectorId }}
                  </span>
                </div>

                <!-- Grade/Room -->
                <div class="hidden sm:block col-span-2">
                  <span
                    class="bg-[#EBF8FF] text-[#2B6CB0] text-[10px] font-bold font-fredoka px-2.5 py-1 rounded-full border border-[#BEE3F8]"
                  >
                    {{ prefect.className || (prefect.room ? `${prefect.grade}/${prefect.room}` : prefect.grade) }}
                  </span>
                </div>

                <!-- Last Login -->
                <div class="hidden sm:block col-span-2">
                  <p class="font-nunito text-[11px] text-slate-500 font-semibold">
                    {{ prefect.lastLogin }}
                  </p>
                  <p
                    v-if="prefect.checksToday > 0"
                    class="font-nunito text-[10px] text-emerald-600 font-bold mt-0.5"
                  >
                    เช็คชื่อแล้ว {{ prefect.checksToday }} ครั้งวันนี้
                  </p>
                </div>

                <!-- Status toggle -->
                <div class="col-span-1 flex justify-start sm:justify-center">
                  <button
                    @click="toggleStatus(prefect)"
                    :class="[
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer',
                      prefect.status === 'active'
                        ? 'bg-[#4361EE]'
                        : 'bg-slate-200',
                    ]"
                    :title="
                      prefect.status === 'active'
                        ? 'คลิกเพื่อระงับบัญชี'
                        : 'คลิกเพื่อเปิดใช้งาน'
                    "
                  >
                    <span
                      :class="[
                        'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform duration-300',
                        prefect.status === 'active'
                          ? 'translate-x-4.5'
                          : 'translate-x-0.5',
                      ]"
                    ></span>
                  </button>
                </div>

                <!-- Actions -->
                <div
                  class="col-span-1 flex items-center justify-start sm:justify-center gap-2"
                >
                  <button
                    @click="openEditModal(prefect)"
                    class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-[#4EA8DE] border border-slate-100 hover:border-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                    title="แก้ไขข้อมูล"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </button>
                  <button
                    @click="openDeleteModal(prefect)"
                    class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-100 hover:border-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                    title="ลบบัญชี"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </section>

          <!-- Footer note -->
          <p class="text-center font-nunito text-xs text-slate-400">
            แสดง {{ filteredPrefects.length }} จาก {{ prefects.length }} รายการ
            <span v-if="searchQuery">
              • ผลการค้นหา "<strong>{{ searchQuery }}</strong>"
            </span>
          </p>
        </div>
      </main>
    </div>

    <!-- ======= ADD MODAL ======= -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isAddModalOpen"
          class="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          @click.self="isAddModalOpen = false"
        >
          <div
            class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-pop-up max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <!-- Header -->
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center text-lg shadow-md flex-shrink-0"
              >
                🛡️
              </div>
              <div>
                <h2 class="font-fredoka text-xl font-extrabold text-[#2F3E46]">
                  เพิ่มสารวัตรนักเรียน
                </h2>
                <p class="font-nunito text-slate-400 text-xs">
                  เลือกชั้นเรียนและนักเรียนเพื่อสร้างบัญชีใหม่
                </p>
              </div>
              <button
                @click="isAddModalOpen = false"
                class="ml-auto w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Step 1: เลือกชั้นเรียน (Custom Dropdown) -->
              <div>
                <label
                  class="font-fredoka text-xs font-bold text-slate-600 block mb-1.5 pl-1"
                >
                  <span
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-extrabold mr-1"
                    >1</span
                  >
                  เลือกชั้นเรียน <span class="text-rose-400">*</span>
                </label>
                <div class="relative" @click.stop>
                  <!-- Trigger -->
                  <button
                    type="button"
                    @click="
                      isClassroomDropdownOpen = !isClassroomDropdownOpen;
                      isStudentDropdownOpen = false;
                    "
                    :class="[
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer',
                      isClassroomDropdownOpen
                        ? 'bg-white border-indigo-400 ring-2 ring-indigo-100 text-slate-700'
                        : selectedClassroomId
                          ? 'bg-white border-indigo-200 text-slate-700 hover:border-indigo-300'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300',
                    ]"
                  >
                    <span
                      v-if="selectedClassroomLabel"
                      class="flex items-center gap-2"
                    >
                      <span
                        class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M12 13.49v.01" />
                        </svg>
                      </span>
                      <span class="text-slate-700">{{
                        selectedClassroomLabel
                      }}</span>
                    </span>
                    <span v-else>-- เลือกชั้นเรียน --</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke="currentColor"
                      :class="[
                        'w-4 h-4 transition-transform duration-200 flex-shrink-0',
                        isClassroomDropdownOpen
                          ? 'rotate-180 text-indigo-500'
                          : 'text-slate-400',
                      ]"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  <!-- Dropdown Panel -->
                  <Transition name="dropdown">
                    <div
                      v-if="isClassroomDropdownOpen"
                      class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-indigo-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div class="p-1.5 max-h-52 overflow-y-auto">
                        <button
                          v-for="cls in classrooms"
                          :key="cls.id"
                          type="button"
                          @click="selectClassroom(cls)"
                          :class="[
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left',
                            selectedClassroomId === cls.id
                              ? 'bg-indigo-500 text-white'
                              : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700',
                          ]"
                        >
                          <div
                            :class="[
                              'px-2 py-1 min-w-[2rem] h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-fredoka font-bold',
                              selectedClassroomId === cls.id
                                ? 'bg-white/20 text-white'
                                : 'bg-indigo-100 text-indigo-600',
                            ]"
                          >
                            {{ cls.room ? `${cls.grade}/${cls.room}` : cls.grade }}
                          </div>
                          <span class="font-fredoka font-bold"
                            >{{ cls.name }}</span
                          >
                          <span
                            :class="[
                              'ml-auto text-xs font-nunito',
                              selectedClassroomId === cls.id
                                ? 'text-indigo-100'
                                : 'text-slate-400',
                            ]"
                          >
                            {{ cls.studentsCount ?? 0 }} คน
                          </span>
                          <svg
                            v-if="selectedClassroomId === cls.id"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="3"
                            stroke="currentColor"
                            class="w-3.5 h-3.5 text-white flex-shrink-0"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Step 2: เลือกนักเรียน (Custom Dropdown) -->
              <div>
                <label
                  class="font-fredoka text-xs font-bold block mb-1.5 pl-1"
                  :class="
                    selectedClassroomId ? 'text-slate-600' : 'text-slate-300'
                  "
                >
                  <span
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-extrabold mr-1"
                    :class="
                      selectedClassroomId ? 'bg-indigo-500' : 'bg-slate-200'
                    "
                    >2</span
                  >
                  เลือกนักเรียนในชั้นเรียน <span class="text-rose-400">*</span>
                </label>
                <div class="relative" @click.stop>
                  <!-- Trigger -->
                  <button
                    type="button"
                    :disabled="!selectedClassroomId"
                    @click="
                      isStudentDropdownOpen = !isStudentDropdownOpen;
                      isClassroomDropdownOpen = false;
                    "
                    :class="[
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200',
                      !selectedClassroomId
                        ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                        : isStudentDropdownOpen
                          ? 'bg-white border-indigo-400 ring-2 ring-indigo-100 text-slate-700 cursor-pointer'
                          : selectedStudentId
                            ? 'bg-white border-indigo-200 text-slate-700 hover:border-indigo-300 cursor-pointer'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 cursor-pointer',
                    ]"
                  >
                    <span
                      v-if="selectedStudentLabel"
                      class="flex items-center gap-2.5"
                    >
                      <span
                        class="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-fredoka font-extrabold text-[10px] flex items-center justify-center"
                      >
                        {{
                          getInitials(form.firstName, form.lastName)
                        }}
                      </span>
                      <span class="text-slate-700">{{
                        selectedStudentLabel
                      }}</span>
                    </span>
                    <span v-else>{{
                      selectedClassroomId
                        ? "-- เลือกนักเรียน --"
                        : "-- เลือกชั้นเรียนก่อน --"
                    }}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke="currentColor"
                      :class="[
                        'w-4 h-4 transition-transform duration-200 flex-shrink-0',
                        isStudentDropdownOpen
                          ? 'rotate-180 text-indigo-500'
                          : 'text-slate-400',
                      ]"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  <!-- Dropdown Panel -->
                  <Transition name="dropdown">
                    <div
                      v-if="isStudentDropdownOpen && selectedClassroomId"
                      class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-indigo-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div class="p-1.5 max-h-52 overflow-y-auto">
                        <button
                          v-for="stu in filteredStudentsForClass"
                          :key="stu.id"
                          type="button"
                          @click="selectStudent(stu)"
                          :class="[
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left',
                            selectedStudentId === stu.id
                              ? 'bg-indigo-500 text-white'
                              : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700',
                          ]"
                        >
                          <span
                            :class="[
                              'w-8 h-8 rounded-xl font-fredoka font-extrabold text-xs flex items-center justify-center flex-shrink-0',
                              selectedStudentId === stu.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600',
                            ]"
                          >
                            {{
                              getInitials(stu.firstName, stu.lastName)
                            }}
                          </span>
                          <div class="flex flex-col min-w-0">
                            <span class="font-fredoka font-bold leading-tight"
                              >{{ stu.firstName }} {{ stu.lastName }}</span
                            >
                          </div>
                          <svg
                            v-if="selectedStudentId === stu.id"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="3"
                            stroke="currentColor"
                            class="w-3.5 h-3.5 text-white flex-shrink-0 ml-auto"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Auto-filled name preview -->
                <div
                  v-if="form.firstName"
                  class="mt-2 flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-fredoka font-extrabold text-xs flex items-center justify-center flex-shrink-0"
                  >
                    {{ (form.firstName[0] ?? "") + (form.lastName[0] ?? "") }}
                  </div>
                  <span class="font-fredoka text-indigo-700 text-sm font-bold"
                    >{{ form.firstName }} {{ form.lastName }}</span
                  >
                  <span class="text-indigo-400 text-xs ml-auto"
                    >{{ form.grade }}/{{ form.room }}</span
                  >
                </div>
              </div>

              <!-- Step 3: เบอร์โทรศัพท์ -->
              <div>
                <label
                  class="font-fredoka text-xs font-bold block mb-1.5 pl-1"
                  :class="
                    selectedStudentId ? 'text-slate-600' : 'text-slate-300'
                  "
                >
                  <span
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-extrabold mr-1"
                    :class="
                      selectedStudentId ? 'bg-indigo-500' : 'bg-slate-200'
                    "
                    >3</span
                  >
                  เบอร์โทรศัพท์
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  :disabled="!selectedStudentId"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              <!-- Step 4: รหัสผ่าน -->
              <div>
                <label
                  class="font-fredoka text-xs font-bold block mb-1.5 pl-1"
                  :class="
                    selectedStudentId ? 'text-slate-600' : 'text-slate-300'
                  "
                >
                  <span
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-extrabold mr-1"
                    :class="
                      selectedStudentId ? 'bg-indigo-500' : 'bg-slate-200'
                    "
                    >4</span
                  >
                  รหัสผ่าน <span class="text-rose-400">*</span>
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <div class="relative">
                    <input
                      v-model="form.password"
                      :type="showFormPassword ? 'text' : 'password'"
                      placeholder="รหัสผ่าน (≥ 6 ตัว)"
                      :disabled="!selectedStudentId"
                      class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      @click="showFormPassword = !showFormPassword"
                      :disabled="!selectedStudentId"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <svg
                        v-if="showFormPassword"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.808 7.808 3.192 3.192m-3.192-3.192-2.036-2.036M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div class="relative">
                    <input
                      v-model="form.confirmPassword"
                      :type="showFormConfirm ? 'text' : 'password'"
                      placeholder="ยืนยันรหัสผ่าน"
                      :disabled="!selectedStudentId"
                      class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      @click="showFormConfirm = !showFormConfirm"
                      :disabled="!selectedStudentId"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <svg
                        v-if="showFormConfirm"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.808 7.808 3.192 3.192m-3.192-3.192-2.036-2.036M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- Password match indicator -->
                <div
                  v-if="form.password && form.confirmPassword"
                  class="mt-1.5 flex items-center gap-1.5 pl-1"
                >
                  <svg
                    v-if="form.password === form.confirmPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    stroke="currentColor"
                    class="w-3.5 h-3.5 text-emerald-500"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    stroke="currentColor"
                    class="w-3.5 h-3.5 text-rose-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                  <span
                    class="font-nunito text-xs font-semibold"
                    :class="
                      form.password === form.confirmPassword
                        ? 'text-emerald-500'
                        : 'text-rose-400'
                    "
                  >
                    {{
                      form.password === form.confirmPassword
                        ? "รหัสผ่านตรงกัน"
                        : "รหัสผ่านไม่ตรงกัน"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
              <button
                @click="isAddModalOpen = false"
                class="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-fredoka font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                @click="handleAdd"
                class="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-fredoka font-bold text-sm shadow-md hover:shadow-indigo-100 transition-all cursor-pointer"
              >
                เพิ่มสารวัตร
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ======= EDIT MODAL ======= -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isEditModalOpen"
          class="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          @click.self="isEditModalOpen = false"
        >
          <div
            class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-pop-up max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center text-lg shadow-md"
              >
                ✏️
              </div>
              <div>
                <h2 class="font-fredoka text-xl font-extrabold text-[#2F3E46]">
                  แก้ไขข้อมูลสารวัตร
                </h2>
                <p class="font-nunito text-slate-400 text-xs">
                  {{ form.firstName }}
                  {{ form.lastName }}
                </p>
              </div>
              <button
                @click="isEditModalOpen = false"
                class="ml-auto w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Step 1: เลือกชั้นเรียน (Custom Dropdown) -->
              <div>
                <label
                  class="font-fredoka text-xs font-bold text-slate-600 block mb-1.5 pl-1"
                >
                  <span
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-extrabold mr-1"
                    >1</span
                  >
                  เลือกชั้นเรียน <span class="text-rose-400">*</span>
                </label>
                <div class="relative" @click.stop>
                  <!-- Trigger -->
                  <button
                    type="button"
                    @click="
                      isClassroomDropdownOpen = !isClassroomDropdownOpen;
                      isStudentDropdownOpen = false;
                    "
                    :class="[
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer',
                      isClassroomDropdownOpen
                        ? 'bg-white border-indigo-400 ring-2 ring-indigo-100 text-slate-700'
                        : selectedClassroomId
                          ? 'bg-white border-indigo-200 text-slate-700 hover:border-indigo-300'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300',
                    ]"
                  >
                    <span
                      v-if="selectedClassroomLabel"
                      class="flex items-center gap-2"
                    >
                      <span
                        class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M12 13.49v.01" />
                        </svg>
                      </span>
                      <span class="text-slate-700">{{
                        selectedClassroomLabel
                      }}</span>
                    </span>
                    <span v-else>-- เลือกชั้นเรียน --</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke="currentColor"
                      :class="[
                        'w-4 h-4 transition-transform duration-200 flex-shrink-0',
                        isClassroomDropdownOpen
                          ? 'rotate-180 text-indigo-500'
                          : 'text-slate-400',
                      ]"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  <!-- Dropdown Panel -->
                  <Transition name="dropdown">
                    <div
                      v-if="isClassroomDropdownOpen"
                      class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-indigo-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div class="p-1.5 max-h-52 overflow-y-auto">
                        <button
                          v-for="cls in classrooms"
                          :key="cls.id"
                          type="button"
                          @click="selectClassroom(cls)"
                          :class="[
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left',
                            selectedClassroomId === cls.id
                              ? 'bg-indigo-500 text-white'
                              : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700',
                          ]"
                        >
                          <div
                            :class="[
                              'px-2 py-1 min-w-[2rem] h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-fredoka font-bold',
                              selectedClassroomId === cls.id
                                ? 'bg-white/20 text-white'
                                : 'bg-indigo-100 text-indigo-600',
                            ]"
                          >
                            {{ cls.room ? `${cls.grade}/${cls.room}` : cls.grade }}
                          </div>
                          <span class="font-fredoka font-bold"
                            >{{ cls.name }}</span
                          >
                          <span
                            :class="[
                              'ml-auto text-xs font-nunito',
                              selectedClassroomId === cls.id
                                ? 'text-indigo-100'
                                : 'text-slate-400',
                            ]"
                          >
                            {{ cls.studentsCount ?? 0 }} คน
                          </span>
                          <svg
                            v-if="selectedClassroomId === cls.id"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="3"
                            stroke="currentColor"
                            class="w-3.5 h-3.5 text-white flex-shrink-0"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Step 2: เลือกนักเรียน (Custom Dropdown) -->
              <div>
                <label
                  class="font-fredoka text-xs font-bold block mb-1.5 pl-1"
                  :class="
                    selectedClassroomId ? 'text-slate-600' : 'text-slate-300'
                  "
                >
                  <span
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-extrabold mr-1"
                    :class="
                      selectedClassroomId ? 'bg-indigo-500' : 'bg-slate-200'
                    "
                    >2</span
                  >
                  เลือกนักเรียนในชั้นเรียน <span class="text-rose-400">*</span>
                </label>
                <div class="relative" @click.stop>
                  <!-- Trigger -->
                  <button
                    type="button"
                    :disabled="!selectedClassroomId"
                    @click="
                      isStudentDropdownOpen = !isStudentDropdownOpen;
                      isClassroomDropdownOpen = false;
                    "
                    :class="[
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200',
                      !selectedClassroomId
                        ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                        : isStudentDropdownOpen
                          ? 'bg-white border-indigo-400 ring-2 ring-indigo-100 text-slate-700 cursor-pointer'
                          : selectedStudentId
                            ? 'bg-white border-indigo-200 text-slate-700 hover:border-indigo-300 cursor-pointer'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 cursor-pointer',
                    ]"
                  >
                    <span
                      v-if="selectedStudentLabel"
                      class="flex items-center gap-2.5"
                    >
                      <span
                        class="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-fredoka font-extrabold text-[10px] flex items-center justify-center"
                      >
                        {{
                          getInitials(form.firstName, form.lastName)
                        }}
                      </span>
                      <span class="text-slate-700">{{
                        selectedStudentLabel
                      }}</span>
                    </span>
                    <span v-else>{{
                      selectedClassroomId
                        ? "-- เลือกนักเรียน --"
                        : "-- เลือกชั้นเรียนก่อน --"
                    }}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke="currentColor"
                      :class="[
                        'w-4 h-4 transition-transform duration-200 flex-shrink-0',
                        isStudentDropdownOpen
                          ? 'rotate-180 text-indigo-500'
                          : 'text-slate-400',
                      ]"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  <!-- Dropdown Panel -->
                  <Transition name="dropdown">
                    <div
                      v-if="isStudentDropdownOpen && selectedClassroomId"
                      class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-indigo-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div class="p-1.5 max-h-52 overflow-y-auto">
                        <button
                          v-for="stu in filteredStudentsForClass"
                          :key="stu.id"
                          type="button"
                          @click="selectStudent(stu)"
                          :class="[
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left',
                            selectedStudentId === stu.id
                              ? 'bg-indigo-500 text-white'
                              : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700',
                          ]"
                        >
                          <span
                            :class="[
                              'w-8 h-8 rounded-xl font-fredoka font-extrabold text-xs flex items-center justify-center flex-shrink-0',
                              selectedStudentId === stu.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600',
                            ]"
                          >
                            {{
                              getInitials(stu.firstName, stu.lastName)
                            }}
                          </span>
                          <div class="flex flex-col min-w-0">
                            <span class="font-fredoka font-bold leading-tight"
                              >{{ stu.firstName }} {{ stu.lastName }}</span
                            >
                          </div>
                          <svg
                            v-if="selectedStudentId === stu.id"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="3"
                            stroke="currentColor"
                            class="w-3.5 h-3.5 text-white flex-shrink-0 ml-auto"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Auto-filled name preview -->
                <div
                  v-if="form.firstName"
                  class="mt-2 flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-fredoka font-extrabold text-xs flex items-center justify-center flex-shrink-0"
                  >
                    {{ (form.firstName[0] ?? "") + (form.lastName[0] ?? "") }}
                  </div>
                  <span class="font-fredoka text-indigo-700 text-sm font-bold"
                    >{{ form.firstName }} {{ form.lastName }}</span
                  >
                  <span class="text-indigo-400 text-xs ml-auto"
                    >{{ form.grade }}/{{ form.room }}</span
                  >
                </div>
              </div>

              <!-- รหัสประจำตัว (ใช้เข้าสู่ระบบ) (อ่านอย่างเดียว) -->
              <div>
                <label
                  class="font-fredoka text-xs font-bold text-slate-600 block mb-1.5 pl-1"
                  >รหัสประจำตัว (ใช้เข้าสู่ระบบ)</label
                >
                <input
                  v-model="form.inspectorId"
                  type="text"
                  disabled
                  class="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed outline-none transition-all"
                />
              </div>

              <!-- Step 3: เบอร์โทรศัพท์ -->
              <div>
                <label
                  class="font-fredoka text-xs font-bold block mb-1.5 pl-1"
                  :class="
                    selectedStudentId ? 'text-slate-600' : 'text-slate-300'
                  "
                >
                  <span
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-extrabold mr-1"
                    :class="
                      selectedStudentId ? 'bg-indigo-500' : 'bg-slate-200'
                    "
                    >3</span
                  >
                  เบอร์โทรศัพท์
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  :disabled="!selectedStudentId"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:bg-white outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              <!-- เปลี่ยนรหัสผ่าน (ไม่บังคับ) -->
              <div class="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p class="font-fredoka text-xs font-bold text-amber-700 mb-2">
                  🔑 เปลี่ยนรหัสผ่าน (ไม่บังคับ)
                </p>
                <div class="grid grid-cols-2 gap-3">
                  <div class="relative">
                    <input
                      v-model="form.password"
                      :type="showFormPassword ? 'text' : 'password'"
                      placeholder="รหัสผ่านใหม่"
                      class="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      @click="showFormPassword = !showFormPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <svg
                        v-if="showFormPassword"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.808 7.808 3.192 3.192m-3.192-3.192-2.036-2.036M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div class="relative">
                    <input
                      v-model="form.confirmPassword"
                      :type="showFormConfirm ? 'text' : 'password'"
                      placeholder="ยืนยันรหัสผ่าน"
                      class="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      @click="showFormConfirm = !showFormConfirm"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <svg
                        v-if="showFormConfirm"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.808 7.808 3.192 3.192m-3.192-3.192-2.036-2.036M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- Password match indicator -->
                <div
                  v-if="form.password && form.confirmPassword"
                  class="mt-1.5 flex items-center gap-1.5 pl-1"
                >
                  <svg
                    v-if="form.password === form.confirmPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    stroke="currentColor"
                    class="w-3.5 h-3.5 text-emerald-500"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    stroke="currentColor"
                    class="w-3.5 h-3.5 text-rose-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                  <span
                    class="font-nunito text-xs font-semibold"
                    :class="
                      form.password === form.confirmPassword
                        ? 'text-emerald-500'
                        : 'text-rose-400'
                    "
                  >
                    {{
                      form.password === form.confirmPassword
                        ? "รหัสผ่านตรงกัน"
                        : "รหัสผ่านไม่ตรงกัน"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                @click="isEditModalOpen = false"
                class="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-fredoka font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                @click="handleEdit"
                class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-fredoka font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ======= DELETE CONFIRM MODAL ======= -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isDeleteModalOpen"
          class="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          @click.self="isDeleteModalOpen = false"
        >
          <div
            class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 text-center animate-pop-up"
          >
            <div
              class="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-3xl mx-auto mb-4"
            >
              🗑️
            </div>
            <h2 class="font-fredoka text-xl font-extrabold text-[#2F3E46] mb-2">
              ยืนยันการลบบัญชี
            </h2>
            <p class="font-nunito text-slate-500 text-sm leading-relaxed mb-6">
              คุณต้องการลบบัญชีของ<br />
              <strong class="text-rose-500"
                >{{ selectedPrefect?.firstName }}
                {{ selectedPrefect?.lastName }}</strong
              ><br />
              ({{ selectedPrefect?.inspectorId }}) ออกจากระบบหรือไม่?<br />
              <span class="text-xs text-slate-400 mt-1 inline-block"
                >การกระทำนี้ไม่สามารถเรียกคืนได้</span
              >
            </p>
            <div class="flex gap-3">
              <button
                @click="isDeleteModalOpen = false"
                class="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-fredoka font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                @click="handleDelete"
                class="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-fredoka font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                ลบบัญชี
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ======= LOGOUT MODAL ======= -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isLogoutModalOpen"
          class="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          @click.self="isLogoutModalOpen = false"
        >
          <div
            class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 text-center animate-pop-up"
          >
            <div
              class="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-2xl"
            >
              👋
            </div>
            <h2 class="font-fredoka text-xl font-extrabold text-[#2F3E46] mb-2">
              ออกจากระบบ?
            </h2>
            <p class="font-nunito text-slate-400 text-sm mb-6">
              คุณต้องการออกจากระบบในตอนนี้ใช่หรือไม่?
            </p>
            <div class="flex gap-3">
              <button
                @click="isLogoutModalOpen = false"
                class="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-fredoka font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                @click="confirmLogout"
                class="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-fredoka font-bold text-sm cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Toast */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(50px, 0) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(0, -15px) scale(0.9);
}

@keyframes toastProgress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
.animate-toast-progress {
  animation: toastProgress 3s linear forwards;
}

/* Modal */
.modal-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active {
  transition: all 0.2s ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Pop-up */
.animate-pop-up {
  animation: popUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes popUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* List animation */
.list-enter-active {
  transition: all 0.3s ease;
}
.list-leave-active {
  transition: all 0.2s ease;
  position: absolute;
  width: 100%;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Custom dropdown animation */
.dropdown-enter-active {
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dropdown-leave-active {
  transition: all 0.12s ease-in;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
