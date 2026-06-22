<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
import { Html5Qrcode } from "html5-qrcode";

interface Student {
  id: string | number;
  code: string;
  no: number;
  prefix: string;
  firstName: string;
  lastName: string;
  status: string;
}

interface Props {
  isOpen: boolean;
  students: Student[];
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  students: () => [],
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "markPresent", studentId: string | number): void;
}>();

// State management
const html5QrCodeInstance = ref<Html5Qrcode | null>(null);
const cameras = ref<any[]>([]);
const selectedCameraId = ref<string>("");
const isScanningActive = ref(false);
const errorMessage = ref("");
const successToastText = ref("");
const errorToastText = ref("");
const toastTimeout = ref<any>(null);

interface ScanLog {
  id: number;
  studentNo: number;
  name: string;
  time: string;
  code: string;
}
const scanHistory = ref<ScanLog[]>([]);
const lastScannedStudent = ref<Student | null>(null);
const lastScanTime = ref(0);

// Sound synth helper using browser AudioContext
const playSuccessBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Quick pleasant double-beep
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now); // A5 note
    gain.gain.setValueAtTime(0.06, now);
    osc.start(now);
    
    // Second brief beep offset
    osc.frequency.setValueAtTime(1109.73, now + 0.08); // C#6 note
    osc.stop(now + 0.16);
  } catch (e) {
    console.error("Audio beep failed", e);
  }
};

const playErrorBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Low flat error tone
    osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 note
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio error beep failed", e);
  }
};

// Start camera stream & initialization
const startScanning = async () => {
  try {
    errorMessage.value = "";
    // Wait for DOM to register reader div
    await nextTick();

    const devices = await Html5Qrcode.getCameras();
    cameras.value = devices;

    if (devices.length > 0) {
      // Find back/environment camera first
      const backCam = devices.find(
        (d: any) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("environment") ||
          d.label.toLowerCase().includes("rear")
      );
      selectedCameraId.value = backCam ? backCam.id : devices[0].id;
      await startCamera(selectedCameraId.value);
    } else {
      errorMessage.value = "ไม่พบโมดูลกล้องบนอุปกรณ์เครื่องนี้";
    }
  } catch (err: any) {
    errorMessage.value = `ไม่สามารถสแกนกล้องได้: โปรดยอมรับสิทธิ์การเข้าใช้งานกล้อง (${err.message || err})`;
    console.error(err);
  }
};

const startCamera = async (cameraId: string) => {
  try {
    if (html5QrCodeInstance.value) {
      await stopCamera();
    }

    const scanner = new Html5Qrcode("qr-reader-canvas");
    html5QrCodeInstance.value = scanner;
    isScanningActive.value = true;
    errorMessage.value = "";

    await scanner.start(
      cameraId,
      {
        fps: 10,
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.7;
          return { width: size, height: size };
        },
      },
      (decodedText) => {
        handleQrScanSuccess(decodedText);
      },
      () => {
        // Skip verbose frame errors
      }
    );
  } catch (err: any) {
    errorMessage.value = `ไม่สามารถเริ่มกล้องนี้ได้: ${err.message || err}`;
    isScanningActive.value = false;
    console.error(err);
  }
};

const stopCamera = async () => {
  if (html5QrCodeInstance.value) {
    try {
      if (html5QrCodeInstance.value.isScanning) {
        await html5QrCodeInstance.value.stop();
      }
    } catch (err) {
      console.error("Error stopping camera", err);
    } finally {
      html5QrCodeInstance.value = null;
      isScanningActive.value = false;
    }
  }
};

// Handle QR scan matching
const handleQrScanSuccess = (decodedText: string) => {
  const now = Date.now();
  // Filter out immediate repeating scans of the same code
  if (
    lastScannedStudent.value &&
    lastScannedStudent.value.code === decodedText &&
    now - lastScanTime.value < 2200
  ) {
    return;
  }

  // Clean decoded text
  const cleanedText = decodedText.trim();

  // Find match
  const student = props.students.find(
    (s) =>
      s.code === cleanedText ||
      `NO-${s.no}` === cleanedText ||
      s.id.toString() === cleanedText
  );

  if (toastTimeout.value) clearTimeout(toastTimeout.value);
  successToastText.value = "";
  errorToastText.value = "";

  if (!student) {
    playErrorBeep();
    errorToastText.value = `ไม่พบข้อมูลรหัสนักเรียน: ${cleanedText}`;
    toastTimeout.value = setTimeout(() => {
      errorToastText.value = "";
    }, 2500);
    return;
  }

  // Update check-in status (mark as present)
  emit("markPresent", student.id);
  lastScannedStudent.value = student;
  lastScanTime.value = now;

  // Add to scan logs
  scanHistory.value.unshift({
    id: now,
    studentNo: student.no,
    name: `${student.prefix}${student.firstName} ${student.lastName}`,
    time: new Date().toLocaleTimeString("th-TH"),
    code: student.code || `NO-${student.no}`,
  });

  if (scanHistory.value.length > 5) {
    scanHistory.value.pop();
  }

  playSuccessBeep();
  successToastText.value = `เช็คชื่อสำเร็จ: ${student.prefix}${student.firstName} (เลขที่ ${student.no})`;
  toastTimeout.value = setTimeout(() => {
    successToastText.value = "";
  }, 2500);
};

// Watch modal state transitions
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      scanHistory.value = [];
      lastScannedStudent.value = null;
      successToastText.value = "";
      errorToastText.value = "";
      await startScanning();
    } else {
      await stopCamera();
    }
  }
);

onBeforeUnmount(async () => {
  await stopCamera();
});

const handleCameraChange = async (event: Event) => {
  const select = event.target as HTMLSelectElement;
  if (select.value) {
    selectedCameraId.value = select.value;
    await startCamera(select.value);
  }
};
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" @click="emit('close')"></div>

        <!-- Modal Container -->
        <div class="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col transform transition-all duration-300 scale-100 overflow-hidden">
          
          <!-- Modal Header -->
          <header class="p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div>
              <span class="text-[10px] text-[#FF758F] font-bold uppercase tracking-wider block">QR Code Scan Attendance</span>
              <h3 class="font-fredoka text-base sm:text-lg font-extrabold text-slate-800 mt-1">
                สแกนกล้องเพื่อเช็คชื่อนักเรียน
              </h3>
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

          <!-- Main Layout -->
          <div class="p-6 grid grid-cols-1 md:grid-cols-5 gap-6 flex-1 max-h-[70vh] overflow-y-auto">
            
            <!-- Left Side: Camera Scanner View -->
            <div class="md:col-span-3 flex flex-col items-center justify-center">
              <div class="w-full relative aspect-square max-w-[280px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center">
                <!-- html5-qrcode canvas element target -->
                <div id="qr-reader-canvas" class="w-full h-full object-cover"></div>

                <!-- Premium Scanner Overlays -->
                <div v-if="isScanningActive" class="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <!-- Custom retro target box corners -->
                  <div class="w-[70%] h-[70%] relative border-2 border-transparent">
                    <span class="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-md"></span>
                    <span class="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-md"></span>
                    <span class="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-md"></span>
                    <span class="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-md"></span>
                    
                    <!-- Pulsing laser line -->
                    <div class="absolute left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-laser shadow-sm shadow-emerald-200"></div>
                  </div>
                </div>

                <!-- Initializing loader overlay -->
                <div v-if="!isScanningActive && !errorMessage" class="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-slate-300 space-y-3 px-4 text-center">
                  <svg class="animate-spin h-7 w-7 text-[#FF758F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="font-fredoka text-[11px] font-bold text-slate-400">กำลังขอเปิดสิทธิ์ใช้งานกล้อง...</span>
                </div>

                <!-- Error panel overlay -->
                <div v-if="errorMessage" class="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-5 space-y-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-rose-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                  </svg>
                  <h6 class="font-fredoka text-xs text-rose-400 font-extrabold leading-snug">เกิดข้อผิดพลาดในการรันกล้อง</h6>
                  <p class="font-nunito text-[10px] text-slate-500 leading-normal">{{ errorMessage }}</p>
                </div>
              </div>

              <!-- Camera selector toolbar -->
              <div v-if="cameras.length > 1" class="w-full max-w-[280px] mt-4 space-y-1">
                <label class="text-[9px] font-fredoka font-bold text-slate-400 block uppercase">เลือกกล้องบันทึกภาพ</label>
                <div class="relative">
                  <select 
                    :value="selectedCameraId"
                    @change="handleCameraChange"
                    class="w-full text-xs font-semibold font-nunito bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-[#FF758F] cursor-pointer appearance-none"
                  >
                    <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
                      {{ camera.label || `Camera ${cameras.indexOf(camera) + 1}` }}
                    </option>
                  </select>
                  <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Side: Scan Logs & Feedback -->
            <div class="md:col-span-2 flex flex-col justify-between space-y-4">
              
              <!-- Scan Success/Error Status Alerts -->
              <div class="space-y-3">
                <h5 class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">สถานะการสแกนสด</h5>
                
                <transition name="expand">
                  <div 
                    v-if="successToastText" 
                    class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-700"
                  >
                    <div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <span class="font-nunito text-xs font-bold leading-normal">{{ successToastText }}</span>
                  </div>
                </transition>

                <transition name="expand">
                  <div 
                    v-if="errorToastText" 
                    class="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-rose-700"
                  >
                    <div class="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span class="font-nunito text-xs font-bold leading-normal">{{ errorToastText }}</span>
                  </div>
                </transition>

                <div 
                  v-if="!successToastText && !errorToastText"
                  class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center text-slate-400 font-nunito text-xs font-semibold py-8"
                >
                  พร้อมสำหรับเช็คชื่อนักเรียน...
                  <p class="text-[10px] text-slate-400/80 mt-1 font-normal">ส่องกล้องไปที่ QR Code ของนักเรียนเพื่อทำรายการ</p>
                </div>
              </div>

              <!-- History Log -->
              <div class="flex-1 flex flex-col min-h-[160px]">
                <h5 class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">ประวัติการสแกนสำเร็จล่าสุด</h5>
                <div class="flex-1 bg-slate-50/50 border border-slate-100/60 rounded-2xl p-3 overflow-y-auto space-y-2.5 max-h-[160px]">
                  <transition-group name="list">
                    <div 
                      v-for="log in scanHistory" 
                      :key="log.id" 
                      class="bg-white border border-slate-100 p-2.5 rounded-xl flex items-center justify-between text-xs transition-all duration-300"
                    >
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="w-5 h-5 rounded-md bg-emerald-50 text-emerald-500 border border-emerald-100/60 flex items-center justify-center font-fredoka font-black text-[9px] flex-shrink-0">
                          {{ log.studentNo }}
                        </span>
                        <div class="min-w-0">
                          <p class="font-nunito font-extrabold text-slate-700 leading-none truncate max-w-[120px]">{{ log.name }}</p>
                          <span class="text-[8px] text-slate-400 block mt-0.5 font-bold">รหัส: {{ log.code }}</span>
                        </div>
                      </div>
                      <span class="font-fredoka text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex-shrink-0 font-bold">
                        {{ log.time }} น.
                      </span>
                    </div>
                  </transition-group>
                  
                  <div 
                    v-if="scanHistory.length === 0" 
                    class="h-full flex items-center justify-center text-center text-slate-300 font-nunito text-[10px] font-bold py-10"
                  >
                    ไม่มีประวัติการเช็คชื่อในรอบนี้
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- Bottom controls footer -->
          <footer class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end no-print flex-shrink-0">
            <button 
              @click="emit('close')"
              class="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border border-slate-200/50 text-slate-700 font-fredoka font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer text-center"
            >
              ปิดเครื่องสแกน
            </button>
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

/* laser scanner line animation */
@keyframes laserSweep {
  0% {
    top: 5%;
  }
  50% {
    top: 95%;
  }
  100% {
    top: 5%;
  }
}
.animate-laser {
  position: absolute;
  animation: laserSweep 3s infinite linear;
}

/* transition animations for scan histories */
.list-enter-active, .list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Toast warning alerts expansion */
.expand-enter-active, .expand-leave-active {
  transition: all 0.2s ease-out;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}
.expand-enter-to, .expand-leave-from {
  max-height: 100px;
}
</style>
