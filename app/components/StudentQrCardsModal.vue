<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import QRCode from "qrcode";

interface Student {
  id: string | number;
  code: string;
  no: number;
  prefix: string;
  firstName: string;
  lastName: string;
}

interface Props {
  isOpen: boolean;
  classroomName: string;
  subjectName: string;
  students: Student[];
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  classroomName: "",
  subjectName: "",
  students: () => [],
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

const qrDataUrls = ref<Record<string, string>>({});
const isGenerating = ref(false);

// Group students into chunks of exactly 10 items for page layout
const studentChunks = computed(() => {
  const chunks = [];
  for (let i = 0; i < props.students.length; i += 10) {
    chunks.push(props.students.slice(i, i + 10));
  }
  return chunks;
});

const generateAllQrs = async () => {
  if (props.students.length === 0) return;
  isGenerating.value = true;
  try {
    const urls: Record<string, string> = {};
    for (const student of props.students) {
      // Use student.code or fallback to no / id
      const payload = student.code || `NO-${student.no}`;
      urls[student.id] = await QRCode.toDataURL(payload, {
        margin: 2,
        width: 180,
        color: {
          dark: "#1E293B", // slate-800
          light: "#FFFFFF",
        },
      });
    }
    qrDataUrls.value = urls;
  } catch (err) {
    console.error("Error generating QR Codes", err);
  } finally {
    isGenerating.value = false;
  }
};

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      await nextTick();
      await generateAllQrs();
    }
  },
  { immediate: true }
);

watch(
  () => props.students,
  async () => {
    if (props.isOpen) {
      await generateAllQrs();
    }
  },
  { deep: true }
);

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 print-cards-portal">
        <!-- Backdrop (hidden on print) -->
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity no-print" @click="emit('close')"></div>

        <!-- Modal Card Container -->
        <div class="relative w-full max-w-4xl h-[90vh] bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col transform transition-all duration-300 scale-100 overflow-hidden print-cards-modal-container">
          
          <!-- Decorative Blurs (hidden on print) -->
          <div class="absolute -top-24 -left-24 w-64 h-64 bg-pink-100/35 rounded-full blur-3xl pointer-events-none -z-10 no-print"></div>
          <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-100/35 rounded-full blur-3xl pointer-events-none -z-10 no-print"></div>

          <!-- Header (hidden on print) -->
          <header class="p-6 border-b border-slate-100 flex items-center justify-between no-print flex-shrink-0">
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">QR Code Print System</span>
              <h3 class="font-fredoka text-base sm:text-lg font-extrabold text-slate-800 mt-1">
                การ์ด QR Code สำหรับเช็คชื่อนักเรียน
              </h3>
              <p class="font-nunito text-xs text-slate-400 font-semibold mt-0.5">
                {{ classroomName }} • {{ subjectName }}
              </p>
            </div>
            
            <button 
              @click="emit('close')"
              class="w-9 h-9 bg-slate-50 border border-slate-100/70 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <!-- Top Toolbar (hidden on print) -->
          <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print flex-shrink-0">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-emerald-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.821 12.001 8.5l5.28 5.321m0 0a.75.75 0 0 1-1.06 1.06l-4.22-4.26-4.22 4.26a.75.75 0 0 1-1.06-1.06Z" />
              </svg>
              <span class="font-nunito text-xs text-slate-500 font-bold">
                จำนวนนักเรียนทั้งหมด {{ students.length }} คน (จัดหน้าพิมพ์แผ่นละ 10 คนสำหรับกระดาษ A4)
              </span>
            </div>

            <button 
              @click="handlePrint"
              :disabled="isGenerating || students.length === 0"
              class="w-full sm:w-auto bg-[#FF758F] hover:bg-[#FF4D6D] text-white font-fredoka font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-pink-100 flex items-center justify-center gap-2 disabled:bg-pink-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.821 12.001 8.5l5.28 5.321m0 0a.75.75 0 0 1-1.06 1.06l-4.22-4.26-4.22 4.26a.75.75 0 0 1-1.06-1.06Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.64 16.521c.21.03.42.06.63.1a2.25 2.25 0 0 1 1.94 2.245v.235A2.25 2.25 0 0 1 19 21.35H5a2.25 2.25 0 0 1-2.21-1.75v-.235A2.25 2.25 0 0 1 4.73 17.12c.21-.04.42-.07.63-.1m13.28-7.5V6a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 5.12 6v3.62" />
              </svg>
              <span>พิมพ์การ์ด QR Code</span>
            </button>
          </div>

          <!-- Cards Grid Panel (Main print-area) -->
          <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50 print:p-0 print:bg-white print:overflow-visible" id="print-area-qr">
            <!-- Loading indicator -->
            <div v-if="isGenerating" class="h-full flex flex-col items-center justify-center space-y-3 no-print">
              <svg class="animate-spin h-8 w-8 text-[#FF758F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="font-fredoka text-xs text-slate-500 font-bold">กำลังสร้างรูปภาพ QR Code นักเรียน...</span>
            </div>

            <!-- Empty state -->
            <div v-else-if="students.length === 0" class="h-full flex flex-col items-center justify-center space-y-2 text-slate-400 no-print">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-12 h-12 text-slate-300">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <h5 class="font-fredoka text-sm font-bold text-slate-600">ไม่พบรายชื่อนักเรียนในห้องเรียนนี้</h5>
            </div>

            <!-- Badges cards layout grouped in chunks of 10 for print -->
            <div v-else class="space-y-8 print:space-y-0 print:m-0">
              <div 
                v-for="(chunk, chunkIdx) in studentChunks" 
                :key="chunkIdx"
                class="qr-page-container bg-white rounded-3xl p-6 border border-slate-100 shadow-xs print:p-0 print:border-none print:shadow-none"
              >
                <!-- Page Indicator (hidden on print) -->
                <div class="mb-4 text-xs font-bold text-[#FF758F] font-fredoka flex items-center gap-2 no-print">
                  <span>หน้าพิมพ์ที่ {{ chunkIdx + 1 }}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span class="text-slate-400 font-semibold">
                    นักเรียนลำดับที่ {{ chunkIdx * 10 + 1 }} - {{ Math.min((chunkIdx + 1) * 10, students.length) }}
                  </span>
                </div>

                <!-- Grid container: 3 cols on screen, custom 2x5 grid on print -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:qr-grid-layout">
                  <div 
                    v-for="student in chunk" 
                    :key="student.id"
                    class="student-qr-card-item bg-white border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col items-center relative overflow-hidden shadow-xs hover:border-[#FF758F] transition-colors print:shadow-none"
                  >
                    <!-- Badge Watermarks (hidden on print) -->
                    <div class="absolute -top-8 -right-8 w-16 h-16 bg-slate-50 rounded-full blur-md -z-10 no-print"></div>
                    
                    <!-- Badge Header -->
                    <div class="w-full text-center pb-2 border-b border-slate-100 flex flex-col items-center qr-card-header print:pb-1">
                      <span class="text-[9px] font-fredoka font-black text-rose-400 tracking-wider uppercase leading-none print:text-[8px]">
                        Student Check-in Card
                      </span>
                      <span class="text-[10px] font-nunito font-extrabold text-slate-700 leading-snug mt-1 print:text-[9px]">
                        {{ classroomName }}
                      </span>
                    </div>

                    <!-- QR Image code frame -->
                    <div class="my-4 w-32 h-32 flex items-center justify-center border border-slate-100 rounded-xl p-1 bg-slate-50/50 qr-code-img-wrapper print:border-none print:p-0 print:my-0">
                      <img 
                        v-if="qrDataUrls[student.id]" 
                        :src="qrDataUrls[student.id]" 
                        alt="Student QR Code" 
                        class="w-full h-full object-contain"
                      />
                      <div v-else class="w-8 h-8 rounded-full border-2 border-t-transparent border-[#FF758F] animate-spin"></div>
                    </div>

                    <!-- Badge Info Footer -->
                    <div class="w-full text-center flex flex-col items-center student-details-wrapper">
                      <span class="font-fredoka text-[10px] font-bold text-slate-400 leading-none print:text-[9px]">
                        เลขที่ {{ student.no }}
                      </span>
                      <h4 class="font-nunito text-xs sm:text-sm font-extrabold text-slate-800 mt-1 leading-snug truncate max-w-full print:text-xs">
                        {{ student.prefix }}{{ student.firstName }} {{ student.lastName }}
                      </h4>
                      <span class="font-fredoka text-[9px] text-[#FF758F] font-bold mt-1 px-2.5 py-0.5 bg-pink-50 border border-pink-100/50 rounded-full print:text-[8px] print:bg-white print:border-slate-300 print:mt-0.5">
                        รหัส: {{ student.code || `NO-${student.no}` }}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- Bottom Footer Info (hidden on print) -->
          <footer class="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-nunito font-bold text-slate-400 no-print flex-shrink-0">
            ระบบเช็คชื่อนักเรียนด้วยเทคโนโลยี QR Code • ข้อมูลความปลอดภัยถูกเก็บเข้ารหัส
          </footer>

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
  transform: scale(0.95) translateY(15px);
  opacity: 0;
}

.modal-fade-leave-to > div:last-child {
  transform: scale(0.98);
  opacity: 0;
}
</style>

<style>
/* Global print styles */
@media print {
  /* Hide the entire Nuxt app wrapper and background elements */
  #__nuxt {
    display: none !important;
  }
  
  /* Hide portal backdrops and other teleports on body, except our active print portal */
  body > *:not(.print-cards-portal) {
    display: none !important;
  }

  /* Make target portal container absolute full page */
  .print-cards-portal {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 210mm !important;
    height: auto !important;
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
    overflow: visible !important;
    z-index: 99999 !important;
  }

  /* Expand modal card container to normal block container and hide scrollbar */
  .print-cards-modal-container {
    position: static !important;
    width: 210mm !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    transform: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Hide screen-only modal components */
  .no-print {
    display: none !important;
  }

  #print-area-qr {
    position: static !important;
    width: 210mm !important;
    height: auto !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }

  /* Format exactly 10 cards per page (2 columns x 5 rows) with tight margins */
  .qr-page-container {
    page-break-after: always !important;
    break-after: page !important;
    width: 210mm !important;
    height: 297mm !important;
    padding: 8mm 6mm !important; /* tight margins to maximize space and save paper */
    box-sizing: border-box !important;
    background: white !important;
    overflow: hidden !important;
  }

  .qr-page-container:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .qr-grid-layout {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    grid-template-rows: repeat(5, 1fr) !important;
    grid-gap: 3mm !important; /* tighter gap between cards to save paper */
    width: 100% !important;
    height: 100% !important;
    box-sizing: border-box !important;
  }

  /* Card styling tailored to horizontal fit exactly 10 cards per A4 page */
  .student-qr-card-item {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    height: 50mm !important; /* horizontal height to fit 5 rows easily on 297mm A4 */
    width: 95mm !important;
    border: 1.2px dashed #475569 !important; /* Slate 600 dashed cut-lines */
    border-radius: 8px !important;
    padding: 2.5mm !important;
    box-sizing: border-box !important;
    page-break-inside: avoid !important;
    background: white !important;
    box-shadow: none !important;
  }

  .student-qr-card-item .qr-card-header {
    display: none !important; /* hide redundant header on print to save space */
  }

  .student-qr-card-item .qr-code-img-wrapper {
    width: 42mm !important;
    height: 42mm !important;
    margin: 0 3mm 0 0 !important;
    border: none !important;
    padding: 0 !important;
    background: white !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
  }

  .student-qr-card-item .qr-code-img-wrapper img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }

  .student-qr-card-item .student-details-wrapper {
    flex: 1 !important;
    text-align: left !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: flex-start !important;
  }

  .student-qr-card-item .student-details-wrapper h4 {
    font-size: 11pt !important;
    font-weight: 800 !important;
    margin: 1mm 0 0.5mm 0 !important;
    line-height: 1.3 !important;
    color: #0f172a !important; /* slate-900 */
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    width: 100% !important;
  }

  .student-qr-card-item .student-details-wrapper span {
    font-size: 8.5pt !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    color: #475569 !important; /* slate-600 */
  }

  /* Specific style for student code badge under print */
  .student-qr-card-item .student-details-wrapper span.font-fredoka {
    font-size: 8pt !important;
    color: #0f172a !important;
    background: #f1f5f9 !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 4px !important;
    padding: 0.5mm 2mm !important;
    margin-top: 1mm !important;
    display: inline-block !important;
  }
}
</style>
