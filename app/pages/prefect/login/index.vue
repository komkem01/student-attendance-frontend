<script setup lang="ts">
import { ref } from "vue";

useHead({
  title: "เข้าสู่ระบบสำหรับสารวัตรนักเรียน | Student Attendance System",
  meta: [
    {
      name: "description",
      content:
        "หน้าเข้าสู่ระบบสำหรับสารวัตรนักเรียน เพื่อเข้าเช็คชื่อการเข้าแถวและบันทึกเวลาเรียน",
    },
  ],
});

// UI State
const isPasswordVisible = ref(false);
const toasts = ref<
  { id: number; message: string; type: "success" | "error" | "warning" }[]
>([]);
let toastId = 0;

const showToast = (
  message: string,
  type: "success" | "error" | "warning" = "success",
) => {
  const id = toastId++;
  toasts.value.push({ id, message, type });

  if (type === "error") {
    hasError.value = true;
    setTimeout(() => {
      hasError.value = false;
    }, 500);
  }

  // Remove toast after 3 seconds
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 3000);
};

const { form, isLoading, isSuccess, hasError, handleLogin } =
  usePrefectLogin(showToast);
</script>

<template>
  <div
    class="bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-[#FAF5FF] min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans"
  >
    <NuxtLink
      to="/"
      class="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/60 hover:bg-white/95 backdrop-blur-md border border-white/60 rounded-full shadow-sm hover:shadow text-slate-500 hover:text-indigo-600 transition-all duration-300 font-nunito font-bold text-sm group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        />
      </svg>
      กลับหน้าหลัก
    </NuxtLink>

    <Teleport to="body">
      <div
        class="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none max-w-sm w-full"
      >
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="[
              'pointer-events-auto py-5 px-5 rounded-2xl shadow-xl flex items-center gap-3.5 border transition-all duration-300 transform scale-100 hover:scale-[1.02] relative overflow-hidden',
              toast.type === 'success'
                ? 'bg-[#EAFDF8] border-[#A8EEDD] text-[#1E7D65]'
                : toast.type === 'error'
                  ? 'bg-[#FFF0F3] border-[#FFCCD5] text-[#A3001E]'
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
                    : 'bg-[#805B00]',
              ]"
            ></div>

            <div class="flex-shrink-0">
              <svg
                v-if="toast.type === 'success'"
                class="w-5.5 h-5.5 text-[#1E7D65]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              <svg
                v-else-if="toast.type === 'error'"
                class="w-5.5 h-5.5 text-[#A3001E]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
              <svg
                v-else
                class="w-5.5 h-5.5 text-[#805B00]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <span
              class="font-nunito text-xs sm:text-sm font-bold flex-1 pr-1"
              >{{ toast.message }}</span
            >
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <div
      class="absolute top-[5%] left-[5%] w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl animate-float-slow pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[8%] right-[5%] w-72 h-72 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute top-[35%] right-[15%] w-36 h-36 bg-pink-300/15 rounded-full blur-2xl animate-float-medium pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[5%] left-[10%] w-60 h-60 bg-blue-300/20 rounded-full blur-3xl animate-drift pointer-events-none"
    ></div>

    <div
      class="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/85 backdrop-blur-2xl border border-white rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-2xl relative z-10"
    >
      <div
        class="col-span-12 md:col-span-5 hidden md:flex flex-col items-center text-center justify-center p-4"
      >
        <div
          class="bg-white/80 border border-white/70 rounded-3xl p-6 shadow-md max-w-sm mb-4 transform -rotate-1 hover:rotate-0 transition-transform duration-300"
        >
          <h2 class="font-fredoka text-xl font-bold text-indigo-600 mb-1">
            ระบบลงเวลาสารวัตรนักเรียน
          </h2>
          <p
            class="font-nunito text-slate-500 text-xs sm:text-sm leading-relaxed"
          >
            แผงควบคุมการบันทึกเวลาเข้าเรียนหน้าประตูโรงเรียน
            สำหรับเจ้าหน้าที่สารวัตรเพื่อเช็คชื่อนักเรียน
          </p>
        </div>

        <img
          src="/images/prefect_illustration.png"
          alt="Prefect Illustration"
          class="w-72 h-72 object-contain my-4 drop-shadow-xl animate-float-slow"
        />

        <div
          class="text-indigo-600 font-fredoka text-sm font-semibold tracking-wider flex items-center gap-1.5 mt-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full shadow-inner animate-pulse"
        >
          <span
            class="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"
          ></span>
          Student Prefect Portal
        </div>
      </div>

      <div
        :class="[
          'col-span-12 md:col-span-7 bg-white/95 rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl border border-indigo-100/30 transition-all duration-300',
          { 'animate-shake': hasError },
        ]"
      >
        <div class="flex flex-col items-center text-center md:hidden mb-6">
          <img
            src="/images/prefect_illustration.png"
            alt="Prefect Illustration"
            class="w-24 h-24 object-contain mb-3 drop-shadow-md animate-float"
          />
          <h2 class="font-fredoka text-2xl font-bold text-indigo-600 mb-1">
            ระบบสำหรับสารวัตรนักเรียน
          </h2>
          <p class="font-nunito text-slate-500 text-xs">
            บันทึกเวลาเรียนหน้าประตูโรงเรียน
          </p>
        </div>

        <div class="hidden md:block mb-8">
          <span
            class="bg-indigo-50 text-indigo-600 text-xs font-bold font-fredoka tracking-wider px-3.5 py-1.5 rounded-full uppercase border border-indigo-100/50"
          >
            PREFECT PORTAL
          </span>
          <h1
            class="font-fredoka text-3xl font-extrabold text-slate-800 mt-4 mb-2"
          >
            ลงชื่อเข้าใช้งาน
          </h1>
          <p class="font-nunito text-slate-400 text-sm font-semibold">
            กรุณาเข้าสู่ระบบด้วยบัญชีผู้ใช้งานสารวัตรเพื่อเช็คชื่อนักเรียน
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="space-y-1.5">
            <label
              for="inspectorId"
              class="block font-fredoka text-sm font-bold text-slate-700 flex items-center gap-1.5 pl-1"
            >
              รหัสประจำตัวสารวัตรนักเรียน
            </label>
            <div class="relative">
              <input
                id="inspectorId"
                v-model="form.inspectorId"
                type="text"
                placeholder="เช่น S55204 หรือ Inspector01"
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 pl-12 text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 focus:outline-none transition-all duration-300 text-sm font-semibold"
                :disabled="isLoading || isSuccess"
              />
              <span
                class="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5.5 h-5.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between items-center pl-1">
              <label
                for="password"
                class="block font-fredoka text-sm font-bold text-slate-700 flex items-center gap-1.5"
              >
                รหัสผ่าน
              </label>
              <span
                class="text-xs text-slate-400 font-semibold cursor-not-allowed opacity-60 select-none"
                title="ระบบกู้คืนรหัสผ่านยังไม่เปิดใช้งาน"
              >
                ลืมรหัสผ่าน
              </span>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 pl-12 pr-12 text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 focus:outline-none transition-all duration-300 text-sm font-semibold"
                :disabled="isLoading || isSuccess"
              />
              <span
                class="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5.5 h-5.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </span>

              <button
                type="button"
                @click="isPasswordVisible = !isPasswordVisible"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                :disabled="isLoading || isSuccess"
              >
                <svg
                  v-if="isPasswordVisible"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5.5 h-5.5"
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
                  class="w-5.5 h-5.5"
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

          <div class="flex items-center justify-between pl-1">
            <label
              class="flex items-center gap-2 cursor-pointer group text-slate-600 select-none"
            >
              <div class="relative">
                <input
                  type="checkbox"
                  v-model="form.rememberMe"
                  class="sr-only peer"
                  :disabled="isLoading || isSuccess"
                />
                <div
                  class="w-5 h-5 bg-slate-100 border-2 border-slate-200 rounded-md transition-all duration-200 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center"
                >
                  <svg
                    v-if="form.rememberMe"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    stroke="white"
                    class="w-3.5 h-3.5 transition-opacity duration-200"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              </div>
              <span
                class="text-xs font-semibold group-hover:text-slate-800 transition-colors"
                >จดจำการเข้าสู่ระบบ</span
              >
            </label>
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-indigo-500 text-white font-fredoka font-bold text-base py-4 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-indigo-100 active:scale-[0.98] focus:ring-4 focus:ring-indigo-200 focus:outline-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            :disabled="isLoading || isSuccess"
          >
            <template v-if="isLoading">
              <svg
                class="animate-spin h-5.5 w-5.5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>กำลังตรวจสอบรหัสประจำตัว...</span>
            </template>
            <template v-else>
              <span>เข้าสู่ระบบ</span>
            </template>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
