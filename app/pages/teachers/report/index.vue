<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'รายงานการเข้าเรียน | Student Attendance System',
  meta: [
    { name: 'description', content: 'รายงานและสถิติการเข้าเรียนสำหรับคุณครู ตรวจสอบรายงานรายวันและรายเดือนแยกตามห้องเรียนและชั้นเรียน' }
  ]
})

// State for Mobile Sidebar Toggle
const isMobileSidebarOpen = ref(false)

// State for Logout Confirmation Modal
const isLogoutModalOpen = ref(false)

const { teacherProfile, logout } = useTeacherSession()

// Current date display in Thai format
const currentDateText = computed(() => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return new Date().toLocaleDateString('th-TH', options)
})

const {
  classrooms,
  selectedClassroomId,
  selectedClassroom,
  isFetching,
  isExporting,
  startDateStr,
  endDateStr,
  showClassSelectPopover,
  showStartDatePopover,
  showEndDatePopover,
  currentCalendarYear,
  currentCalendarMonth,
  thaiMonthNames,
  calendarDays,
  nextMonth,
  prevMonth,
  selectStartDate,
  selectEndDate,
  formatDateThaiShort,
  studentsReportData,
  aggregateStats,
  activeReports,
  toasts,
  showToast,
  handleExport,
  handleExportAllClassrooms
} = useAttendanceReport()

const handleLogout = () => {
  isLogoutModalOpen.value = true
}

const confirmLogout = () => {
  isLogoutModalOpen.value = false
  showToast('กำลังออกจากระบบ...', 'success')
  logout()
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex font-sans text-[#2F3E46]">
    
    <!-- Toast Notification Container (Top Right) -->
    <Teleport to="body">
      <div class="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none max-w-sm w-full">
        <TransitionGroup name="toast">
          <div 
            v-for="toast in toasts" 
            :key="toast.id"
            :class="[
              'pointer-events-auto py-5 px-5 rounded-2xl shadow-xl flex items-center gap-3.5 border transition-all duration-300 transform scale-100 hover:scale-[1.02] relative overflow-hidden',
              toast.type === 'success' ? 'bg-[#EAFDF8] border-[#A8EEDD] text-[#1E7D65]' : 
              toast.type === 'error' ? 'bg-[#FFF0F3] border-[#FFCCD5] text-[#A3001E]' : 
              toast.type === 'info' ? 'bg-[#EBF8FF] border-[#BEE3F8] text-[#2B6CB0]' :
              'bg-[#FFF9E6] border-[#FFE29A] text-[#805B00]'
            ]"
          >
            <!-- SweetAlert animated style progress bar -->
            <div 
              :class="[
                'absolute bottom-0 left-0 h-1 animate-toast-progress w-full',
                toast.type === 'success' ? 'bg-[#1E7D65]' : 
                toast.type === 'error' ? 'bg-[#A3001E]' : 
                toast.type === 'info' ? 'bg-[#2B6CB0]' :
                'bg-[#805B00]'
              ]"
            ></div>

            <div class="flex-shrink-0">
              <svg v-if="toast.type === 'success'" class="w-5.5 h-5.5 text-[#1E7D65]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <svg v-else-if="toast.type === 'error'" class="w-5.5 h-5.5 text-[#A3001E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              <svg v-else-if="toast.type === 'info'" class="w-5.5 h-5.5 text-[#2B6CB0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25.041-.02a.75.75 0 1 1 1.063 1.06l-.041.02-.08.04H12v.002h.008a.75.75 0 0 1 1.5 0v.008h-.008v-.008ZM12 3v18M3 12h18" />
              </svg>
              <svg v-else class="w-5.5 h-5.5 text-[#805B00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <span class="font-nunito text-xs sm:text-sm font-bold flex-1 pr-1">{{ toast.message }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- BACKGROUND BLUR DECORATIONS -->
    <div class="fixed top-0 right-0 w-[400px] h-[400px] bg-emerald-100/35 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <!-- Sidebar Layout Component -->
    <Sidebar 
      class="print:hidden"
      v-model:isOpen="isMobileSidebarOpen" 
      activeItem="reports" 
      @logout="handleLogout" 
    />

    <!-- MAIN PAGE CONTAINER -->
    <div class="flex-1 flex flex-col min-w-0 print:p-0 print:m-0 print:w-full print:bg-white">
      
      <!-- Topbar Component -->
      <Topbar 
        class="print:hidden"
        title="รายงานการเข้าเรียน" 
        :currentDateText="currentDateText" 
        :teacherProfile="teacherProfile" 
        @toggleSidebar="isMobileSidebarOpen = true" 
        @logout="handleLogout" 
      />

      <!-- MAIN SCROLLABLE CONTENT -->
      <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6 print:p-0 print:m-0 print:max-w-full print:space-y-4 print:overflow-visible">

        <div class="space-y-6 print:space-y-4">


          <!-- Welcome Header Card -->
          <section class="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-100/50 print:hidden">
            <div class="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <span class="bg-white/20 text-white text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-full uppercase inline-block">
                  ATTENDANCE REPORTS
                </span>
                <h2 class="font-fredoka text-2xl sm:text-3xl font-extrabold leading-tight">
                  รายงานและสถิติเวลาเรียน
                </h2>
                <p class="font-nunito text-xs sm:text-sm text-emerald-50/90 font-medium">
                  คุณครูสามารถตรวจสอบเปอร์เซ็นต์การเข้าเรียน สถิติการสาย ขาดเรียน และลาของนักเรียนแบบรายบุคคลหรือภาพรวมชั้นเรียนตามช่วยเวลาที่กำหนด
                </p>
              </div>

              <!-- Quick Actions -->
              <div class="flex flex-wrap gap-2.5 flex-shrink-0 w-full lg:w-auto">
                <button 
                  @click="handleExportAllClassrooms"
                  class="flex-1 lg:flex-initial bg-white/15 hover:bg-white/25 border border-white/20 text-white font-fredoka font-bold text-xs px-4 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ส่งออก Excel ทุกห้องเรียน</span>
                </button>
                <button 
                  @click="handleExport('excel')"
                  class="flex-1 lg:flex-initial bg-white/15 hover:bg-white/25 border border-white/20 text-white font-fredoka font-bold text-xs px-4 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ส่งออก Excel ห้องนี้</span>
                </button>
                <button 
                  @click="handleExport('pdf')"
                  class="flex-1 lg:flex-initial bg-white text-[#059669] hover:bg-emerald-50 font-fredoka font-bold text-xs px-4 py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>พิมพ์รายงาน PDF</span>
                </button>
              </div>
            </div>
          </section>

          <!-- FILTERS PANEL -->
          <section class="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between print:hidden">
            <div class="flex flex-col sm:flex-row gap-4 w-full items-center">
              
              <!-- Custom Classroom Selector -->
              <div class="relative w-full sm:w-64">
                <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1 pl-1">เลือกห้องเรียน</label>
                <button 
                  type="button"
                  @click="showClassSelectPopover = !showClassSelectPopover; showStartDatePopover = false; showEndDatePopover = false"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#10B981] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer"
                >
                  <span class="truncate">{{ selectedClassroom ? selectedClassroom.name : 'เลือกห้องเรียน' }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180 text-[#10B981]': showClassSelectPopover }">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <transition name="pop-up">
                  <div 
                    v-if="showClassSelectPopover" 
                    class="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100/80 rounded-2xl shadow-xl p-1.5 space-y-1"
                  >
                    <!-- ทุกห้องเรียน Option -->
                    <button
                      type="button"
                      @click="selectedClassroomId = 'all'; showClassSelectPopover = false"
                      :class="[
                        'w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer border-b border-slate-100 pb-2.5 mb-1',
                        selectedClassroomId === 'all' 
                          ? 'bg-[#EAFDF8] text-[#059669]' 
                          : 'hover:bg-slate-50 text-slate-700'
                      ]"
                    >
                      <span class="flex flex-col">
                        <span class="font-fredoka font-bold text-xs sm:text-sm" :class="selectedClassroomId === 'all' ? 'text-[#059669]' : 'text-slate-800'">ทุกห้องเรียน</span>
                        <span class="text-[10px]" :class="selectedClassroomId === 'all' ? 'text-emerald-400' : 'text-slate-400'">แสดงรายงานและสถิติสรุปของทุกห้องเรียน</span>
                      </span>
                      <svg v-if="selectedClassroomId === 'all'" class="w-4.5 h-4.5 text-[#059669]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>

                    <button
                      v-for="cls in classrooms"
                      :key="cls.id"
                      type="button"
                      @click="selectedClassroomId = cls.id; showClassSelectPopover = false"
                      :class="[
                        'w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer',
                        selectedClassroomId === cls.id 
                          ? 'bg-emerald-500/5 text-[#059669]' 
                          : 'hover:bg-slate-50 text-slate-700'
                      ]"
                    >
                      <span class="flex flex-col">
                        <span class="font-fredoka font-bold text-xs sm:text-sm" :class="selectedClassroomId === cls.id ? 'text-[#059669]' : 'text-slate-800'">{{ cls.name }}</span>
                        <span class="text-[10px]" :class="selectedClassroomId === cls.id ? 'text-emerald-400' : 'text-slate-400'">{{ cls.subject }}</span>
                      </span>
                      <svg v-if="selectedClassroomId === cls.id" class="w-4.5 h-4.5 text-[#059669]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>
                  </div>
                </transition>
              </div>

              <!-- Start Date Picker -->
              <div class="relative w-full sm:w-48">
                <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1 pl-1">ตั้งแต่วันที่</label>
                <button 
                  type="button"
                  @click="showStartDatePopover = !showStartDatePopover; showClassSelectPopover = false; showEndDatePopover = false"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#10B981] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer"
                >
                  <span>{{ formatDateThaiShort(startDateStr) }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-slate-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </button>

                <transition name="pop-up">
                  <div v-if="showStartDatePopover" class="absolute left-0 z-30 mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 w-72">
                    <div class="flex items-center justify-between mb-3">
                      <button @click="prevMonth" class="p-1 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">◀</button>
                      <span class="font-fredoka text-xs sm:text-sm font-bold text-slate-800">{{ thaiMonthNames[currentCalendarMonth] }} {{ currentCalendarYear + 543 }}</span>
                      <button @click="nextMonth" class="p-1 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">▶</button>
                    </div>
                    <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                      <span class="text-rose-500">อา</span><span>จ</span><span>อ</span><span>พ</span><span>พฤ</span><span>ศ</span><span class="text-sky-500">ส</span>
                    </div>
                    <div class="grid grid-cols-7 gap-1">
                      <button 
                        v-for="(dayObj, index) in calendarDays" 
                        :key="index"
                        @click="selectStartDate(dayObj)"
                        :class="[
                          'py-1 rounded-lg text-center font-fredoka text-xs font-bold transition-all cursor-pointer',
                          dayObj.isCurrentMonth ? 'text-slate-700 hover:bg-emerald-50 hover:text-[#059669]' : 'text-slate-300',
                          startDateStr === `${dayObj.year}-${String(dayObj.month+1).padStart(2,'0')}-${String(dayObj.day).padStart(2,'0')}` ? 'bg-[#059669] text-white hover:bg-[#059669] hover:text-white' : ''
                        ]"
                      >
                        {{ dayObj.day }}
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- End Date Picker -->
              <div class="relative w-full sm:w-48">
                <label class="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1 pl-1">ถึงวันที่</label>
                <button 
                  type="button"
                  @click="showEndDatePopover = !showEndDatePopover; showClassSelectPopover = false; showStartDatePopover = false"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-[#10B981] rounded-xl font-nunito text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer"
                >
                  <span>{{ formatDateThaiShort(endDateStr) }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-slate-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </button>

                <transition name="pop-up">
                  <div v-if="showEndDatePopover" class="absolute left-0 z-30 mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 w-72">
                    <div class="flex items-center justify-between mb-3">
                      <button @click="prevMonth" class="p-1 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">◀</button>
                      <span class="font-fredoka text-xs sm:text-sm font-bold text-slate-800">{{ thaiMonthNames[currentCalendarMonth] }} {{ currentCalendarYear + 543 }}</span>
                      <button @click="nextMonth" class="p-1 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">▶</button>
                    </div>
                    <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                      <span class="text-rose-500">อา</span><span>จ</span><span>อ</span><span>พ</span><span>พฤ</span><span>ศ</span><span class="text-sky-500">ส</span>
                    </div>
                    <div class="grid grid-cols-7 gap-1">
                      <button 
                        v-for="(dayObj, index) in calendarDays" 
                        :key="index"
                        @click="selectEndDate(dayObj)"
                        :class="[
                          'py-1 rounded-lg text-center font-fredoka text-xs font-bold transition-all cursor-pointer',
                          dayObj.isCurrentMonth ? 'text-slate-700 hover:bg-emerald-50 hover:text-[#059669]' : 'text-slate-300',
                          endDateStr === `${dayObj.year}-${String(dayObj.month+1).padStart(2,'0')}-${String(dayObj.day).padStart(2,'0')}` ? 'bg-[#059669] text-white hover:bg-[#059669] hover:text-white' : ''
                        ]"
                      >
                        {{ dayObj.day }}
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

            </div>
          </section>

          <!-- Loop over activeReports to render each classroom report section -->
          <div 
            v-for="report in activeReports" 
            :key="report.classId" 
            class="classroom-report-section space-y-6 print:space-y-4 print:mb-0 print:break-after-page"
          >
            <!-- PRINT-ONLY REPORT HEADER -->
            <div class="hidden print:block border-b-2 border-slate-800 pb-4 mb-4">
              <h1 class="print-title text-[20pt] font-bold text-center mb-1">รายงานสรุปรายชื่อและการเข้าเรียนของนักเรียน</h1>
              <div class="print-subtitle text-center text-[14pt] font-semibold mb-3">ห้องเรียน {{ report.className }} | วิชา {{ report.subjectName }}</div>
              <div class="grid grid-cols-3 gap-y-2 mt-4 text-[14pt] font-semibold text-slate-700">
                <div><strong>ครูผู้สอน:</strong> {{ teacherProfile ? teacherProfile.name : '-' }}</div>
                <div><strong>โรงเรียน:</strong> {{ teacherProfile && teacherProfile.school ? teacherProfile.school : '-' }}</div>
                <div><strong>วันที่ออกรายงาน:</strong> {{ currentDateText }}</div>
                <div class="col-span-3"><strong>ช่วงเวลารายงาน:</strong> {{ formatDateThaiShort(startDateStr) }} ถึง {{ formatDateThaiShort(endDateStr) }}</div>
              </div>
            </div>

            <!-- PRINT-ONLY SUMMARY TABLE -->
            <div class="hidden print:block mb-4">
              <table class="w-full border-collapse border border-slate-800 text-center text-[14pt] font-semibold">
                <thead>
                  <tr class="bg-slate-100/80">
                    <th class="border border-slate-800 py-1.5 px-3">อัตราเข้าเรียนเฉลี่ย</th>
                    <th class="border border-slate-800 py-1.5 px-3 text-emerald-700">มาเรียน (ร้อยละ)</th>
                    <th class="border border-slate-800 py-1.5 px-3 text-amber-600">สาย (ร้อยละ)</th>
                    <th class="border border-slate-800 py-1.5 px-3 text-indigo-700">ลา (ร้อยละ)</th>
                    <th class="border border-slate-800 py-1.5 px-3 text-rose-700">ขาดเรียน (ร้อยละ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-slate-800 py-1.5 px-3 font-bold">{{ report.aggregateStats.avgRate }}%</td>
                    <td class="border border-slate-800 py-1.5 px-3 font-bold text-emerald-700">{{ report.aggregateStats.presentPct }}%</td>
                    <td class="border border-slate-800 py-1.5 px-3 font-bold text-amber-600">{{ report.aggregateStats.latePct }}%</td>
                    <td class="border border-slate-800 py-1.5 px-3 font-bold text-indigo-700">{{ report.aggregateStats.leavePct }}%</td>
                    <td class="border border-slate-800 py-1.5 px-3 font-bold text-rose-700">{{ report.aggregateStats.absentPct }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Heading badge for Screen UI when showing all classrooms -->
            <div v-if="selectedClassroomId === 'all'" class="bg-emerald-50 border border-emerald-100/60 rounded-2xl px-5 py-3.5 print:hidden">
              <h3 class="font-fredoka text-sm sm:text-base font-extrabold text-emerald-800 flex items-center gap-2">
                <span>📚 รายงานสรุปสำหรับ:</span>
                <span class="bg-emerald-600 text-white font-fredoka px-3 py-1 rounded-full text-xs font-extrabold">{{ report.className }}</span>
                <span class="text-slate-400 text-xs font-nunito font-semibold">วิชา: {{ report.subjectName }}</span>
              </h3>
            </div>

            <!-- OVERVIEW PROGRESS SVG CHART -->
            <section class="grid grid-cols-1 md:grid-cols-12 gap-6 print:hidden">
              
              <!-- Circular Progress Card -->
              <div class="md:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4 print:col-span-4 print:border print:border-slate-100 print:shadow-none print:p-4 print:rounded-2xl">
                <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">อัตราเข้าเรียนเฉลี่ย</span>
                
                <!-- Circular Progress SVG -->
                <div class="relative w-36 h-36 flex items-center justify-center">
                  <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <!-- Background Track -->
                    <circle cx="50" cy="50" r="40" stroke="#F1F5F9" stroke-width="8" fill="transparent" />
                    <!-- Progress Path -->
                    <circle cx="50" cy="50" r="40" stroke="#10B981" stroke-width="8" fill="transparent" 
                            stroke-dasharray="251.2" 
                            :stroke-dashoffset="251.2 - (251.2 * report.aggregateStats.avgRate) / 100" 
                            stroke-linecap="round"
                            class="transition-all duration-1000" />
                  </svg>
                  <div class="absolute flex flex-col items-center justify-center">
                    <span class="font-fredoka text-3xl font-extrabold text-slate-800 leading-none">{{ report.aggregateStats.avgRate }}%</span>
                    <span class="text-[9px] text-emerald-600 font-extrabold tracking-wide uppercase mt-1">Excellent</span>
                  </div>
                </div>

                <div class="text-xs text-slate-400 font-semibold leading-relaxed">
                  ภาพรวมอัตราการเข้าแถวและคาบเรียนของนักเรียนห้อง {{ report.className }}
                </div>
              </div>

              <!-- Breakdown Bars Card -->
              <div class="md:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between print:col-span-8 print:border print:border-slate-100 print:shadow-none print:p-4 print:rounded-2xl">
                <div>
                  <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-4">สัดส่วนสรุปเวลารวม</span>
                  
                  <div class="space-y-4.5">
                    <!-- Present Bar -->
                    <div class="space-y-1.5">
                      <div class="flex justify-between text-xs font-bold text-slate-700">
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>มาเรียน</span>
                        <span>{{ report.aggregateStats.presentPct }}%</span>
                      </div>
                      <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500 rounded-full transition-all duration-700" :style="{ width: `${report.aggregateStats.presentPct}%` }"></div>
                      </div>
                    </div>

                    <!-- Late Bar -->
                    <div class="space-y-1.5">
                      <div class="flex justify-between text-xs font-bold text-slate-700">
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>สาย</span>
                        <span>{{ report.aggregateStats.latePct }}%</span>
                      </div>
                      <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div class="h-full bg-amber-400 rounded-full transition-all duration-700" :style="{ width: `${report.aggregateStats.latePct}%` }"></div>
                      </div>
                    </div>

                    <!-- Leave Bar -->
                    <div class="space-y-1.5">
                      <div class="flex justify-between text-xs font-bold text-slate-700">
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>ลา</span>
                        <span>{{ report.aggregateStats.leavePct }}%</span>
                      </div>
                      <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-400 rounded-full transition-all duration-700" :style="{ width: `${report.aggregateStats.leavePct}%` }"></div>
                      </div>
                    </div>

                    <!-- Absent Bar -->
                    <div class="space-y-1.5">
                      <div class="flex justify-between text-xs font-bold text-slate-700">
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>ขาดเรียน</span>
                        <span>{{ report.aggregateStats.absentPct }}%</span>
                      </div>
                      <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div class="h-full bg-rose-500 rounded-full transition-all duration-700" :style="{ width: `${report.aggregateStats.absentPct}%` }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            <!-- DETAILED ATTENDANCE BREAKDOWN TABLE -->
            <section class="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden print:border-none print:shadow-none print:overflow-visible">
              <div class="p-5 border-b border-slate-50 flex items-center justify-between print:hidden">
                <h4 class="font-fredoka text-sm sm:text-base font-extrabold text-slate-800">
                  รายละเอียดการเข้าเรียนรายบุคคล
                </h4>
                <span class="text-[10px] text-slate-400 font-bold">ห้องเรียน: {{ report.className }}</span>
              </div>

              <div class="overflow-x-auto w-full">
                <table class="w-full border-collapse text-left text-slate-600">
                  <thead class="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th scope="col" class="py-4 px-6 text-center w-20">เลขที่</th>
                      <th scope="col" class="py-4 px-4">ชื่อ - นามสกุล</th>
                      <th scope="col" class="py-4 px-4 text-center w-24 text-emerald-600">มาเรียน (วัน)</th>
                      <th scope="col" class="py-4 px-4 text-center w-24 text-amber-500">สาย (วัน)</th>
                      <th scope="col" class="py-4 px-4 text-center w-24 text-indigo-500">ลา (วัน)</th>
                      <th scope="col" class="py-4 px-4 text-center w-24 text-rose-500">ขาด (วัน)</th>
                      <th scope="col" class="py-4 px-4 text-center w-36">คิดเป็นเปอร์เซ็นต์</th>
                      <th scope="col" class="py-4 px-6 text-center w-28">ผลการประเมิน</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50 text-xs sm:text-sm font-semibold">
                    <tr 
                      v-for="student in report.students" 
                      :key="student.id"
                      class="hover:bg-slate-50/40 transition-colors"
                    >
                      <!-- Student No -->
                      <td class="py-4 px-6 text-center font-fredoka font-bold text-slate-800">
                        {{ student.no }}
                      </td>

                      <!-- Student Name -->
                      <td class="py-4 px-4">
                        <div class="font-fredoka font-bold text-slate-800 text-sm">
                          {{ student.prefix }}{{ student.firstName }} {{ student.lastName }}
                        </div>
                        <span class="text-[9px] text-slate-400 font-bold block mt-0.5">รหัสนักเรียน: {{ student.studentCode }}</span>
                      </td>

                      <!-- Present -->
                      <td class="py-4 px-4 text-center text-emerald-600 font-bold font-fredoka">
                        {{ student.presentCount }}
                      </td>

                      <!-- Late -->
                      <td class="py-4 px-4 text-center text-amber-500 font-bold font-fredoka">
                        {{ student.lateCount }}
                      </td>

                      <!-- Leave -->
                      <td class="py-4 px-4 text-center text-indigo-500 font-bold font-fredoka">
                        {{ student.leaveCount }}
                      </td>

                      <!-- Absent -->
                      <td class="py-4 px-4 text-center text-rose-500 font-bold font-fredoka">
                        {{ student.absentCount }}
                      </td>

                      <!-- Percent rate -->
                      <td class="py-4 px-4 text-center font-fredoka font-bold text-slate-800">
                        {{ student.attendanceRate }}%
                      </td>

                      <!-- Result assessment based on 80% threshold -->
                      <td class="py-4 px-6 text-center">
                        <span 
                          :class="[
                            'text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block w-20',
                            student.attendanceRate >= 80 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                              : 'bg-rose-50 border-rose-100 text-rose-500'
                          ]"
                        >
                          {{ student.attendanceRate >= 80 ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์' }}
                        </span>
                      </td>

                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

        </div>

      </main>

      <!-- Logout Confirmation Modal -->
      <ConfirmModal 
        :isOpen="isLogoutModalOpen"
        title="ออกจากระบบ"
        message="คุณครูต้องการออกจากระบบระบบเช็คชื่อนักเรียนใช่หรือไม่?"
        confirmText="ออกจากระบบ"
        cancelText="ยกเลิก"
        type="danger"
        @confirm="confirmLogout"
        @cancel="isLogoutModalOpen = false"
      />

      <!-- Preload TH Sarabun PSK font to force browser download on page load -->
      <div style="font-family: 'TH Sarabun PSK'; position: absolute; visibility: hidden; opacity: 0; pointer-events: none;">
        Preload TH Sarabun PSK
      </div>

      <!-- Cute Loading Overlay -->
      <LoadingOverlay :show="isFetching || isExporting" :text="isExporting ? 'กำลังสร้างและส่งออกรายงานประมวลผล...' : 'กำลังโหลดข้อมูลรายงานการเข้าเรียน...'" />

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');

/* Toast animations (SweetAlert End style slide) */
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
  from { width: 100%; }
  to { width: 0%; }
}
.animate-toast-progress {
  animation: toastProgress 3s linear forwards;
}

/* Pop-up animation */
.pop-up-enter-active, .pop-up-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-up-enter-from, .pop-up-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

@media print {
  /* Set layout parameters */
  @page {
    size: A4 landscape;
    margin: 10mm 15mm 10mm 15mm;
  }
  
  /* Reset page backgrounds and text colors */
  body, html, #__nuxt, #main-wrapper, main {
    background: #ffffff !important;
    color: #000000 !important;
  }

  /* Force TH Sarabun font and background colors during printing (override Tailwind font classes specifically to apply to numbers too) */
  *, .font-fredoka, .font-nunito, .font-sans, .font-mono, [class*="font-"] {
    font-family: 'TH Sarabun PSK', 'THSarabunPSK', 'THSarabunNew', 'TH Sarabun New', 'Sarabun', sans-serif !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Document main title size: 14pt bold */
  .print-title {
    font-size: 14pt !important;
    font-weight: bold !important;
    color: #000000 !important;
  }

  /* Document subtitle size: 12pt bold */
  .print-subtitle {
    font-size: 12pt !important;
    font-weight: bold !important;
    color: #000000 !important;
  }

  /* Force all print text to normal weight by default (not bold) and 10pt size */
  *, th, td, div, span, p, strong, b, [class*="font-"], .text-\[14pt\], .text-\[20pt\] {
    font-weight: normal !important;
    font-size: 10pt !important;
    line-height: 1.25 !important;
    color: #000000 !important;
  }

  /* Keep the title and subtitle bold (override the normal weight rule) */
  .print-title, .print-subtitle {
    font-weight: bold !important;
  }

  /* Table layout and borders for high quality prints */
  table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin-top: 10px !important;
  }
  
  th, td {
    border: 1px solid #475569 !important; /* Darker border for clean print grid lines */
    padding: 4px 6px !important; /* Slightly reduced padding to match 10pt text size */
    font-size: 10pt !important;
  }
  
  th {
    background-color: #f1f5f9 !important;
    color: #000000 !important;
    text-align: center !important;
  }

  /* Separate classrooms when printing */
  .classroom-report-section {
    page-break-after: always !important;
    break-after: page !important;
  }
  .classroom-report-section:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  /* Hide custom background blur circles */
  div.fixed.top-0, div.fixed.bottom-0 {
    display: none !important;
  }
}
</style>
