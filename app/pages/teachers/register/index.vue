<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";

useHead({
  title: "สมัครสมาชิกครู - Student Attendance System",
  meta: [
    {
      name: "description",
      content:
        "ลงทะเบียนสมัครสมาชิกสำหรับครู เพื่อเข้าใช้งานระบบบันทึกเวลาเรียนและเช็คชื่อนักเรียน",
    },
  ],
});

// Wizard Steps State
const currentStep = ref(1);
const isLoading = ref(false);
const isSuccess = ref(false);
const hasError = ref(false);

// SweetAlert-style Toast Notifications State
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

// Form Registration State
const form = reactive({
  // Step 1: Personal Info
  prefix: "",
  gender: "",
  firstName: "",
  lastName: "",
  dob: "",
  email: "",
  phone: "",
  password: "",

  // Step 2: Home Address
  address: "",
  province: "",
  district: "",
  subdistrict: "",
  postalCode: "",

  // Step 3: School Info
  schoolName: "",
  subjectTaught: "",
  schoolAddress: "",
  schoolProvince: "",
  schoolDistrict: "",
  schoolSubdistrict: "",
  schoolPostalCode: "",
});

// Custom Dropdowns States
const isGenderDropdownOpen = ref(false);
const isPrefixDropdownOpen = ref(false);

// Custom Address Dropdowns States
const isProvinceDropdownOpen = ref(false);
const isDistrictDropdownOpen = ref(false);
const isSubdistrictDropdownOpen = ref(false);

const isSchoolProvinceDropdownOpen = ref(false);
const isSchoolDistrictDropdownOpen = ref(false);
const isSchoolSubdistrictDropdownOpen = ref(false);

// Backend states
const gendersList = ref<{ id: string; name: string }[]>([]);
const prefixesList = ref<{ id: string; name: string }[]>([]);
const provincesList = ref<{ id: string; name: string }[]>([]);

// Reference IDs
const selectedGenderID = ref("");
const selectedPrefixID = ref("");

// Location composables
const homeAddress = useAddressSelector();
const schoolAddress = useAddressSelector();

const fetchGenders = async () => {
  try {
    const res: any = await useCustomFetch("/system/gender");
    gendersList.value = res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const fetchPrefixes = async (genderID: string) => {
  try {
    const res: any = await useCustomFetch(
      `/system/prefix?gender_id=${genderID}`,
    );
    prefixesList.value = res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const fetchProvinces = async () => {
  try {
    const res: any = await useCustomFetch("/system/province");
    provincesList.value = res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const genderOptions = computed(() => {
  return gendersList.value.map((g) => ({ label: g.name, value: g.id }));
});

const selectGender = (genderID: string) => {
  const g = gendersList.value.find((item) => item.id === genderID);
  if (g) {
    form.gender = g.name;
    selectedGenderID.value = g.id;
    form.prefix = "";
    selectedPrefixID.value = "";
    prefixesList.value = [];
    isGenderDropdownOpen.value = false;
    fetchPrefixes(g.id);
  }
};

const prefixOptions = computed(() => {
  return prefixesList.value;
});

const selectPrefix = (pref: { id: string; name: string }) => {
  form.prefix = pref.name;
  selectedPrefixID.value = pref.id;
  isPrefixDropdownOpen.value = false;
};

const togglePrefixDropdown = () => {
  if (form.gender) {
    isPrefixDropdownOpen.value = !isPrefixDropdownOpen.value;
    isGenderDropdownOpen.value = false;
  } else {
    showToast("กรุณาเลือกเพศก่อนระบุคำนำหน้าชื่อ", "warning");
  }
};

// Watch gender changes to reset selected prefix
watch(
  () => form.gender,
  () => {
    form.prefix = "";
    isPrefixDropdownOpen.value = false;
  },
);

// Custom Address Select Handlers
const selectProvince = (prov: { id: string; name: string }) => {
  form.province = prov.name;
  form.district = "";
  form.subdistrict = "";
  form.postalCode = "";
  homeAddress.reset();
  isProvinceDropdownOpen.value = false;
  homeAddress.fetchDistricts(prov.id);
};

const selectDistrict = (dist: { id: string; name: string }) => {
  form.district = dist.name;
  form.subdistrict = "";
  form.postalCode = "";
  homeAddress.subdistrictsList.value = [];
  isDistrictDropdownOpen.value = false;
  homeAddress.fetchSubdistricts(dist.id);
};

const selectSubdistrict = async (sub: { id: string; name: string }) => {
  form.subdistrict = sub.name;
  form.postalCode = "";
  isSubdistrictDropdownOpen.value = false;
  form.postalCode = await homeAddress.fetchZipcode(sub.id);
};

const selectSchoolProvince = (prov: { id: string; name: string }) => {
  form.schoolProvince = prov.name;
  form.schoolDistrict = "";
  form.schoolSubdistrict = "";
  form.schoolPostalCode = "";
  schoolAddress.reset();
  isSchoolProvinceDropdownOpen.value = false;
  schoolAddress.fetchDistricts(prov.id);
};

const selectSchoolDistrict = (dist: { id: string; name: string }) => {
  form.schoolDistrict = dist.name;
  form.schoolSubdistrict = "";
  form.schoolPostalCode = "";
  schoolAddress.subdistrictsList.value = [];
  isSchoolDistrictDropdownOpen.value = false;
  schoolAddress.fetchSubdistricts(dist.id);
};

const selectSchoolSubdistrict = async (sub: { id: string; name: string }) => {
  form.schoolSubdistrict = sub.name;
  form.schoolPostalCode = "";
  isSchoolSubdistrictDropdownOpen.value = false;
  form.schoolPostalCode = await schoolAddress.fetchZipcode(sub.id);
};

// Wizard Navigations Validation
const handleNextStep = () => {
  if (currentStep.value === 1) {
    if (!form.gender) return showToast("กรุณาระบุเพศ", "warning");
    if (!form.prefix) return showToast("กรุณาเลือกคำนำหน้าชื่อ", "warning");
    if (!form.firstName.trim())
      return showToast("กรุณากรอกชื่อจริง", "warning");
    if (!form.lastName.trim()) return showToast("กรุณากรอกนามสกุล", "warning");
    if (!form.dob) return showToast("กรุณาระบุวันเดือนปีเกิด", "warning");
    if (!form.email.trim() || !form.email.includes("@"))
      return showToast("กรุณากรอกอีเมลให้ถูกต้อง", "warning");
    if (!form.phone.trim())
      return showToast("กรุณากรอกเบอร์โทรศัพท์", "warning");
    if (!form.password || form.password.length < 6)
      return showToast("กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร", "warning");

    currentStep.value = 2;
  } else if (currentStep.value === 2) {
    if (!form.address.trim())
      return showToast("กรุณากรอกรายละเอียดที่อยู่ติดต่อ", "warning");
    if (!form.province) return showToast("กรุณาเลือกจังหวัด", "warning");
    if (!form.district) return showToast("กรุณาเลือกอำเภอ/เขต", "warning");
    if (!form.subdistrict) return showToast("กรุณาเลือกตำบล/แขวง", "warning");
    if (!form.postalCode || form.postalCode.length !== 5)
      return showToast("กรุณากรอกรหัสไปรษณีย์ 5 หลักให้ถูกต้อง", "warning");

    currentStep.value = 3;
  }
};

const handlePrevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Submit Form Registration
const handleRegister = async () => {
  if (!form.schoolName.trim())
    return showToast("กรุณากรอกชื่อโรงเรียน", "warning");
  if (!form.subjectTaught.trim())
    return showToast("กรุณากรอกวิชาที่รับผิดชอบสอน", "warning");
  if (!form.schoolAddress.trim())
    return showToast("กรุณากรอกที่ตั้งโรงเรียน", "warning");
  if (!form.schoolProvince)
    return showToast("กรุณาเลือกจังหวัดของโรงเรียน", "warning");
  if (!form.schoolDistrict)
    return showToast("กรุณาเลือกอำเภอ/เขตของโรงเรียน", "warning");
  if (!form.schoolSubdistrict)
    return showToast("กรุณาเลือกตำบล/แขวงของโรงเรียน", "warning");
  if (!form.schoolPostalCode || form.schoolPostalCode.length !== 5)
    return showToast(
      "กรุณากรอกรหัสไปรษณีย์โรงเรียน 5 หลักให้ถูกต้อง",
      "warning",
    );

  isLoading.value = true;
  try {
    const response: any = await useCustomFetch(
      "/auth/register",
      {
        method: "POST",
        body: {
          prefix: form.prefix,
          gender: form.gender,
          firstName: form.firstName,
          lastName: form.lastName,
          dob: form.dob,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          address: form.address,
          province: form.province,
          district: form.district,
          subdistrict: form.subdistrict,
          postalCode: form.postalCode,
          schoolName: form.schoolName,
          subjectTaught: form.subjectTaught,
          schoolAddress: form.schoolAddress,
          schoolProvince: form.schoolProvince,
          schoolDistrict: form.schoolDistrict,
          schoolSubdistrict: form.schoolSubdistrict,
          schoolPostalCode: form.schoolPostalCode,
        },
      },
    );

    isSuccess.value = true;
    showToast(
      `ลงทะเบียนบัญชีสำเร็จ! รหัสครูของคุณคือ ${response.data?.code || ""}`,
      "success",
    );

    setTimeout(() => {
      navigateTo("/teachers/login");
    }, 3000);
  } catch (err: any) {
    const errorMsg =
      err.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง";
    showToast(errorMsg, "error");
  } finally {
    isLoading.value = false;
  }
};

// Close dropdowns on click away
const closeAllDropdowns = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target) return;
  if (!target.closest(".gender-dropdown-container")) {
    isGenderDropdownOpen.value = false;
  }
  if (!target.closest(".prefix-dropdown-container")) {
    isPrefixDropdownOpen.value = false;
  }
  if (!target.closest(".province-dropdown-container")) {
    isProvinceDropdownOpen.value = false;
  }
  if (!target.closest(".district-dropdown-container")) {
    isDistrictDropdownOpen.value = false;
  }
  if (!target.closest(".subdistrict-dropdown-container")) {
    isSubdistrictDropdownOpen.value = false;
  }
  if (!target.closest(".school-province-dropdown-container")) {
    isSchoolProvinceDropdownOpen.value = false;
  }
  if (!target.closest(".school-district-dropdown-container")) {
    isSchoolDistrictDropdownOpen.value = false;
  }
  if (!target.closest(".school-subdistrict-dropdown-container")) {
    isSchoolSubdistrictDropdownOpen.value = false;
  }
};

onMounted(async () => {
  window.addEventListener("click", closeAllDropdowns);
  await fetchGenders();
  await fetchProvinces();
});

onUnmounted(() => {
  window.removeEventListener("click", closeAllDropdowns);
});
</script>

<template>
  <div
    class="bg-gradient-to-br from-[#FFF0F3] via-[#FFF6E6] to-[#E6F0FA] min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans select-none"
  >
    <!-- Toast Notification Container (Top Right - SweetAlert style) -->
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
            <!-- SweetAlert animated style bar -->
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

            <!-- Professional Vector SVGs instead of Emojis -->
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

    <!-- Floating background decorative blur bubbles -->
    <div
      class="absolute top-[5%] left-[5%] w-48 h-48 bg-pink-300/20 rounded-full blur-3xl animate-float-slow pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[8%] right-[5%] w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute top-[35%] right-[15%] w-36 h-36 bg-amber-300/20 rounded-full blur-2xl animate-float-medium pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[5%] left-[10%] w-60 h-60 bg-purple-300/20 rounded-full blur-3xl animate-drift pointer-events-none"
    ></div>

    <!-- Background clouds -->
    <div
      class="absolute top-[10%] left-[15%] text-6xl opacity-15 animate-drift pointer-events-none"
    >
      ☁️
    </div>
    <div
      class="absolute top-[40%] right-[20%] text-5xl opacity-10 animate-float pointer-events-none"
    >
      ☁️
    </div>
    <div
      class="absolute bottom-[25%] left-[5%] text-7xl opacity-10 animate-float-slow pointer-events-none"
    >
      ☁️
    </div>

    <!-- Main Container Card -->
    <div
      :class="[
        'max-w-2xl w-full bg-white/85 backdrop-blur-2xl border border-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative z-10 flex flex-col items-stretch transition-all duration-300',
        { 'animate-shake': hasError },
      ]"
    >
      <!-- Card Header -->
      <div class="text-center mb-8">
        <span
          class="bg-[#FFE5D9] text-[#E07A5F] text-[10px] font-bold font-fredoka tracking-wider px-3 py-1.5 rounded-full uppercase"
        >
          TEACHER PORTAL
        </span>
        <h1
          class="font-fredoka text-3xl font-extrabold text-[#2F3E46] mt-3 mb-1.5"
        >
          สมัครสมาชิกครู
        </h1>
        <p class="font-nunito text-[#596A7A] text-xs sm:text-sm font-semibold">
          กรุณากรอกข้อมูลเพื่อสมัครเข้าใช้งานระบบบันทึกเวลาเรียน
        </p>
      </div>

      <!-- Steps Progress Indicators -->
      <div
        class="relative flex items-center justify-between w-full max-w-md mx-auto mb-8 pl-4 pr-4"
      >
        <!-- Connector line -->
        <div
          class="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded -z-10"
        >
          <div
            class="h-full bg-[#FF758F] transition-all duration-300"
            :style="{
              width:
                currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
            }"
          ></div>
        </div>

        <!-- Step 1 -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border shadow-sm',
              currentStep >= 1
                ? 'bg-[#FF758F] text-white border-[#FF758F]'
                : 'bg-white text-slate-400 border-slate-200',
            ]"
          >
            1
          </div>
          <span
            :class="[
              'text-[11px] font-bold mt-1.5',
              currentStep >= 1 ? 'text-[#FF758F]' : 'text-slate-400',
            ]"
            >ข้อมูลส่วนตัว</span
          >
        </div>

        <!-- Step 2 -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border shadow-sm',
              currentStep >= 2
                ? 'bg-[#FF758F] text-white border-[#FF758F]'
                : 'bg-white text-slate-400 border-slate-200',
            ]"
          >
            2
          </div>
          <span
            :class="[
              'text-[11px] font-bold mt-1.5',
              currentStep >= 2 ? 'text-[#FF758F]' : 'text-slate-400',
            ]"
            >ที่อยู่ติดต่อ</span
          >
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border shadow-sm',
              currentStep >= 3
                ? 'bg-[#FF758F] text-white border-[#FF758F]'
                : 'bg-white text-slate-400 border-slate-200',
            ]"
          >
            3
          </div>
          <span
            :class="[
              'text-[11px] font-bold mt-1.5',
              currentStep >= 3 ? 'text-[#FF758F]' : 'text-slate-400',
            ]"
            >ข้อมูลโรงเรียน</span
          >
        </div>
      </div>

      <!-- Success Alert Banner -->
      <div
        v-if="isSuccess"
        class="mb-6 bg-teal-50 border-2 border-teal-200 text-teal-800 p-5 rounded-2xl flex items-center gap-3 animate-fade-in-up"
      >
        <span class="text-3xl">🎉</span>
        <div class="text-left">
          <h3 class="font-bold text-sm">ลงทะเบียนเสร็จเรียบร้อย</h3>
          <p class="text-xs text-teal-600 mt-0.5">
            ระบบกำลังนำท่านไปยังหน้าเข้าสู่ระบบ...
          </p>
        </div>
      </div>

      <!-- Form Content -->
      <form
        @submit.prevent="handleRegister"
        class="space-y-6 flex-1 text-left"
        v-if="!isSuccess"
      >
        <!-- STEP 1: Personal Info -->
        <div v-if="currentStep === 1" class="space-y-5 animate-fade-in-up">
          <!-- Grid of Custom Gender and Prefix dropdowns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <!-- Custom Gender Dropdown -->
            <div
              :class="[
                'space-y-1.5 relative gender-dropdown-container',
                { 'z-40': isGenderDropdownOpen },
              ]"
            >
              <label
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                เพศ <span class="text-rose-500">*</span>
              </label>

              <div class="relative">
                <button
                  type="button"
                  @click="
                    isGenderDropdownOpen = !isGenderDropdownOpen;
                    isPrefixDropdownOpen = false;
                  "
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30 cursor-pointer"
                >
                  <span>{{ form.gender || "เลือกเพศ" }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    :class="[
                      'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1',
                      { 'rotate-180': isGenderDropdownOpen },
                    ]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                <!-- Custom Dropdown list for Gender -->
                <transition name="dropdown">
                  <div
                    v-if="isGenderDropdownOpen"
                    class="absolute z-40 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="gen in genderOptions"
                      :key="gen.value"
                      type="button"
                      @click="selectGender(gen.value)"
                      class="w-full text-left font-nunito text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                    >
                      {{ gen.label }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Custom Prefix Dropdown -->
            <div
              :class="[
                'space-y-1.5 relative prefix-dropdown-container',
                { 'z-40': isPrefixDropdownOpen },
              ]"
            >
              <label
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                คำนำหน้าชื่อ <span class="text-rose-500">*</span>
              </label>

              <div class="relative">
                <button
                  type="button"
                  @click="togglePrefixDropdown"
                  :class="[
                    'w-full bg-slate-50 border rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30',
                    form.gender
                      ? 'border-slate-200 cursor-pointer'
                      : 'border-slate-100 cursor-not-allowed opacity-60',
                  ]"
                >
                  <span class="truncate">{{
                    form.prefix || "เลือกคำนำหน้า"
                  }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    :class="[
                      'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1',
                      { 'rotate-180': isPrefixDropdownOpen },
                    ]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                <!-- Custom Dropdown list for Prefix -->
                <transition name="dropdown">
                  <div
                    v-if="isPrefixDropdownOpen && form.gender"
                    class="absolute z-40 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="pref in prefixOptions"
                      :key="pref.id"
                      type="button"
                      @click="selectPrefix(pref)"
                      class="w-full text-left font-nunito text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                    >
                      {{ pref.name }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- Grid of First Name, Last Name -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- First Name Input -->
            <div class="space-y-1.5">
              <label
                for="firstName"
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                ชื่อจริง <span class="text-rose-500">*</span>
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                placeholder="เช่น สมศรี"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>

            <!-- Last Name Input -->
            <div class="space-y-1.5">
              <label
                for="lastName"
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                นามสกุล <span class="text-rose-500">*</span>
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                placeholder="เช่น ใจดี"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <!-- Date of Birth Input (BaseDatePicker Component) -->
          <div class="space-y-1.5 relative">
            <label
              class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
            >
              วันเกิด <span class="text-rose-500">*</span>
            </label>
            <BaseDatePicker v-model="form.dob" />
          </div>

          <!-- Grid of Email and Phone Number -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Email Input -->
            <div class="space-y-1.5">
              <label
                for="email"
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                อีเมลติดต่อ <span class="text-rose-500">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="เช่น somchai@email.com"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>

            <!-- Phone Input -->
            <div class="space-y-1.5">
              <label
                for="phone"
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                เบอร์โทรศัพท์ <span class="text-rose-500">*</span>
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="เช่น 0812345678"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
                :maxlength="10"
                :minlength="10"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="space-y-1.5">
            <label
              for="password"
              class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
            >
              รหัสผ่าน <span class="text-rose-500">*</span>
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
            />
          </div>
        </div>

        <!-- STEP 2: Home Address Info -->
        <div v-if="currentStep === 2" class="space-y-4 animate-fade-in-up">
          <!-- Address Detail -->
          <div class="space-y-1.5">
            <label
              for="address"
              class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
            >
              ที่อยู่ติดต่อ (บ้านเลขที่ ถนน ซอย)
              <span class="text-rose-500">*</span>
            </label>
            <textarea
              id="address"
              v-model="form.address"
              rows="2"
              placeholder="กรอกรายละเอียดที่ตั้งที่อยู่ติดต่อคุณครู เช่น 99/9 ถ.สุเทพ ซ.5"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm resize-none"
            ></textarea>
          </div>

          <!-- Province / District Synced Dropdowns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Province Custom Dropdown -->
            <div
              :class="[
                'space-y-1.5 relative province-dropdown-container',
                { 'z-40': isProvinceDropdownOpen },
              ]"
            >
              <label
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                จังหวัด <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <button
                  type="button"
                  @click="
                    isProvinceDropdownOpen = !isProvinceDropdownOpen;
                    isDistrictDropdownOpen = false;
                    isSubdistrictDropdownOpen = false;
                  "
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30 cursor-pointer"
                >
                  <span>{{ form.province || "กรุณาเลือกจังหวัด" }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    :class="[
                      'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1',
                      { 'rotate-180': isProvinceDropdownOpen },
                    ]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="isProvinceDropdownOpen"
                    class="absolute z-40 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="prov in provincesList"
                      :key="prov.id"
                      type="button"
                      @click="selectProvince(prov)"
                      class="w-full text-left font-nunito text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                    >
                      {{ prov.name }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- District Custom Dropdown -->
            <div
              :class="[
                'space-y-1.5 relative district-dropdown-container',
                { 'z-40': isDistrictDropdownOpen },
              ]"
            >
              <label
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                อำเภอ / เขต <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <button
                  type="button"
                  :disabled="!form.province"
                  @click="
                    isDistrictDropdownOpen = !isDistrictDropdownOpen;
                    isProvinceDropdownOpen = false;
                    isSubdistrictDropdownOpen = false;
                  "
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{{ form.district || "กรุณาเลือกอำเภอ" }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    :class="[
                      'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1',
                      { 'rotate-180': isDistrictDropdownOpen },
                    ]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="isDistrictDropdownOpen"
                    class="absolute z-40 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="dist in homeAddress.districtsList.value"
                      :key="dist.id"
                      type="button"
                      @click="selectDistrict(dist)"
                      class="w-full text-left font-nunito text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                    >
                      {{ dist.name }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- Subdistrict / Postal Code Dropdowns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Subdistrict Custom Dropdown -->
            <div
              :class="[
                'space-y-1.5 relative subdistrict-dropdown-container',
                { 'z-40': isSubdistrictDropdownOpen },
              ]"
            >
              <label
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                ตำบล / แขวง <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <button
                  type="button"
                  :disabled="!form.district"
                  @click="
                    isSubdistrictDropdownOpen = !isSubdistrictDropdownOpen;
                    isProvinceDropdownOpen = false;
                    isDistrictDropdownOpen = false;
                  "
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{{ form.subdistrict || "กรุณาเลือกตำบล" }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    :class="[
                      'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1',
                      { 'rotate-180': isSubdistrictDropdownOpen },
                    ]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="isSubdistrictDropdownOpen"
                    class="absolute z-40 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="sub in homeAddress.subdistrictsList.value"
                      :key="sub.id"
                      type="button"
                      @click="selectSubdistrict(sub)"
                      class="w-full text-left font-nunito text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                    >
                      {{ sub.name }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Postal Code Input (Readonly) -->
            <div class="space-y-1.5">
              <label
                for="postalCode"
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                รหัสไปรษณีย์ <span class="text-rose-500">*</span>
              </label>
              <input
                id="postalCode"
                v-model="form.postalCode"
                type="text"
                placeholder="กรอกข้อมูลอัตโนมัติ"
                readonly
                class="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:outline-none transition-all duration-200 text-sm cursor-not-allowed opacity-80"
              />
            </div>
          </div>
        </div>

        <!-- STEP 3: School Info -->
        <div v-if="currentStep === 3" class="space-y-4 animate-fade-in-up">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- School Name Input -->
            <div class="space-y-1.5">
              <label
                for="schoolName"
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                ชื่อโรงเรียน <span class="text-rose-500">*</span>
              </label>
              <input
                id="schoolName"
                v-model="form.schoolName"
                type="text"
                placeholder="เช่น โรงเรียนสตรีวิทยา"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>

            <!-- Subject Taught Input -->
            <div class="space-y-1.5">
              <label
                for="subjectTaught"
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                วิชาที่สอน <span class="text-rose-500">*</span>
              </label>
              <input
                id="subjectTaught"
                v-model="form.subjectTaught"
                type="text"
                placeholder="เช่น คณิตศาสตร์ ม.1"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <!-- School Address Detail -->
          <div class="space-y-1.5">
            <label
              for="schoolAddress"
              class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
            >
              ที่ตั้งโรงเรียน (เลขที่ ถนน ซอย)
              <span class="text-rose-500">*</span>
            </label>
            <textarea
              id="schoolAddress"
              v-model="form.schoolAddress"
              rows="2"
              placeholder="กรอกที่อยู่โรงเรียนของคุณครู"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:bg-white focus:border-[#FF758F] focus:ring-4 focus:ring-pink-100/50 focus:outline-none transition-all duration-200 text-sm resize-none"
            ></textarea>
          </div>

          <!-- School Province / District Synced Dropdowns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- School Province Custom Dropdown -->
            <div
              :class="[
                'space-y-1.5 relative school-province-dropdown-container',
                { 'z-40': isSchoolProvinceDropdownOpen },
              ]"
            >
              <label
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                จังหวัด (โรงเรียน) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <button
                  type="button"
                  @click="
                    isSchoolProvinceDropdownOpen =
                      !isSchoolProvinceDropdownOpen;
                    isSchoolDistrictDropdownOpen = false;
                    isSchoolSubdistrictDropdownOpen = false;
                  "
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30 cursor-pointer"
                >
                  <span>{{
                    form.schoolProvince || "กรุณาเลือกจังหวัดโรงเรียน"
                  }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    :class="[
                      'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1',
                      { 'rotate-180': isSchoolProvinceDropdownOpen },
                    ]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="isSchoolProvinceDropdownOpen"
                    class="absolute z-40 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="prov in provincesList"
                      :key="prov.id"
                      type="button"
                      @click="selectSchoolProvince(prov)"
                      class="w-full text-left font-nunito text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                    >
                      {{ prov.name }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- School District Custom Dropdown -->
            <div
              :class="[
                'space-y-1.5 relative school-district-dropdown-container',
                { 'z-40': isSchoolDistrictDropdownOpen },
              ]"
            >
              <label
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                อำเภอ / เขต (โรงเรียน) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <button
                  type="button"
                  :disabled="!form.schoolProvince"
                  @click="
                    isSchoolDistrictDropdownOpen =
                      !isSchoolDistrictDropdownOpen;
                    isSchoolProvinceDropdownOpen = false;
                    isSchoolSubdistrictDropdownOpen = false;
                  "
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{{
                    form.schoolDistrict || "กรุณาเลือกอำเภอโรงเรียน"
                  }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    :class="[
                      'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1',
                      { 'rotate-180': isSchoolDistrictDropdownOpen },
                    ]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="isSchoolDistrictDropdownOpen"
                    class="absolute z-40 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="dist in schoolAddress.districtsList.value"
                      :key="dist.id"
                      type="button"
                      @click="selectSchoolDistrict(dist)"
                      class="w-full text-left font-nunito text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                    >
                      {{ dist.name }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- School Subdistrict / Postal Code Dropdowns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- School Subdistrict Custom Dropdown -->
            <div
              :class="[
                'space-y-1.5 relative school-subdistrict-dropdown-container',
                { 'z-40': isSchoolSubdistrictDropdownOpen },
              ]"
            >
              <label
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                ตำบล / แขวง (โรงเรียน) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <button
                  type="button"
                  :disabled="!form.schoolDistrict"
                  @click="
                    isSchoolSubdistrictDropdownOpen =
                      !isSchoolSubdistrictDropdownOpen;
                    isSchoolProvinceDropdownOpen = false;
                    isSchoolDistrictDropdownOpen = false;
                  "
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] text-left text-sm flex items-center justify-between focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-100/50 relative z-30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{{
                    form.schoolSubdistrict || "กรุณาเลือกตำบลโรงเรียน"
                  }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    :class="[
                      'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1',
                      { 'rotate-180': isSchoolSubdistrictDropdownOpen },
                    ]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="isSchoolSubdistrictDropdownOpen"
                    class="absolute z-40 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="sub in schoolAddress.subdistrictsList.value"
                      :key="sub.id"
                      type="button"
                      @click="selectSchoolSubdistrict(sub)"
                      class="w-full text-left font-nunito text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-2 text-slate-700 hover:bg-pink-50/50 hover:text-[#FF758F] transition-all duration-150 cursor-pointer"
                    >
                      {{ sub.name }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- School Postal Code Input (Readonly) -->
            <div class="space-y-1.5">
              <label
                for="schoolPostalCode"
                class="block font-fredoka text-xs font-bold text-[#4A5759] pl-1"
              >
                รหัสไปรษณีย์ (โรงเรียน) <span class="text-rose-500">*</span>
              </label>
              <input
                id="schoolPostalCode"
                v-model="form.schoolPostalCode"
                type="text"
                placeholder="กรอกข้อมูลอัตโนมัติ"
                readonly
                class="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-[#2F3E46] placeholder-slate-400 focus:outline-none transition-all duration-200 text-sm cursor-not-allowed opacity-80"
              />
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center gap-4 pt-4 border-t border-slate-100/60">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="handlePrevStep"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-fredoka font-bold text-sm py-3 px-5 rounded-2xl transition-all duration-200 cursor-pointer active:scale-98"
            :disabled="isLoading"
          >
            ย้อนกลับ
          </button>

          <button
            v-if="currentStep < 3"
            type="button"
            @click="handleNextStep"
            class="flex-1 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] text-white font-fredoka font-bold text-sm py-3 px-5 rounded-2xl shadow-md transition-all duration-200 cursor-pointer active:scale-98 hover:shadow-lg hover:shadow-pink-100"
          >
            ขั้นตอนถัดไป
          </button>

          <button
            v-if="currentStep === 3"
            type="submit"
            class="flex-1 bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] text-white font-fredoka font-bold text-sm py-3.5 px-5 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer active:scale-98 hover:shadow-xl hover:shadow-pink-200 flex items-center justify-center gap-2"
            :disabled="isLoading"
          >
            <template v-if="isLoading">
              <svg
                class="animate-spin h-5 w-5 text-white"
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
              <span>กำลังบันทึกข้อมูล...</span>
            </template>
            <template v-else>
              <span>ลงทะเบียน</span>
            </template>
          </button>
        </div>
      </form>

      <!-- Bottom Redirect Link to Login -->
      <div
        class="mt-6 text-center border-t border-slate-100 pt-4"
        v-if="!isSuccess"
      >
        <p class="text-xs sm:text-sm font-semibold text-slate-400">
          มีบัญชีผู้ใช้งานอยู่แล้วใช่ไหม?
          <NuxtLink
            to="/teachers/login"
            class="text-[#FF758F] font-bold hover:text-[#FF4D6D] underline ml-1 cursor-pointer"
          >
            เข้าสู่ระบบที่นี่
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
