import { ref, computed } from "vue";

export const useSettingForm = (
  showToast: (
    msg: string,
    type?: "success" | "error" | "warning" | "info",
  ) => void,
) => {
  const session = useCookie<any>("teacher_session");

  const activeTab = ref<"profile" | "rules" | "security">("profile");
  const isSaving = ref(false);

  // Form States
  const formProfile = ref({
    firstName: "",
    lastName: "",
    title: "",
    school: "",
    email: "",
    phone: "",
  });

  const formPassword = ref({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility toggle states
  const showCurrentPassword = ref(false);
  const showNewPassword = ref(false);
  const showConfirmPassword = ref(false);

  const lateLimitTime = ref("08:30");
  const passingRateThreshold = ref(80);

  // Password complexity/strength computed evaluator
  const passwordStrength = computed(() => {
    const pw = formPassword.value.newPassword;
    if (!pw)
      return {
        score: 0,
        text: "ยังไม่ได้ระบุ",
        color: "text-slate-400",
        barColor: "bg-slate-100",
        width: "0%",
      };
    if (pw.length < 6)
      return {
        score: 1,
        text: "สั้นเกินไป",
        color: "text-rose-500",
        barColor: "bg-rose-500",
        width: "25%",
      };

    // Check complexity
    const hasLetters = /[a-zA-Z]/.test(pw);
    const hasNumbers = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);

    if (hasLetters && hasNumbers && hasSpecial && pw.length >= 8) {
      return {
        score: 3,
        text: "แข็งแกร่งมาก",
        color: "text-emerald-500",
        barColor: "bg-emerald-500",
        width: "100%",
      };
    }
    if ((hasLetters && hasNumbers) || pw.length >= 8) {
      return {
        score: 2,
        text: "ปานกลาง",
        color: "text-amber-500",
        barColor: "bg-amber-500",
        width: "60%",
      };
    }
    return {
      score: 1,
      text: "ง่ายเกินไป",
      color: "text-rose-400",
      barColor: "bg-rose-400",
      width: "35%",
    };
  });

  // Detailed validation checking for requirements list
  const isLengthValid = computed(
    () => formPassword.value.newPassword.length >= 6,
  );
  const hasNumber = computed(() =>
    /[0-9]/.test(formPassword.value.newPassword),
  );
  const hasUppercase = computed(() =>
    /[A-Z]/.test(formPassword.value.newPassword),
  );
  const hasLowercase = computed(() =>
    /[a-z]/.test(formPassword.value.newPassword),
  );
  const hasSpecial = computed(() =>
    /[!@#$%^&*(),.?":{}|<>]/.test(formPassword.value.newPassword),
  );

  const passwordStrengthScore = computed(() => {
    const pw = formPassword.value.newPassword;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
    return score;
  });

  const passwordStrengthDetails = computed(() => {
    const score = passwordStrengthScore.value;
    const pw = formPassword.value.newPassword;
    if (!pw) {
      return {
        text: "ยังไม่ได้ระบุรหัสผ่านใหม่",
        color: "text-slate-400",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200/60",
        textColor: "text-slate-500",
        barColor: "bg-slate-200",
        width: "0%",
        emoji: "🔒",
      };
    }
    if (score <= 2) {
      return {
        text: "ความปลอดภัยต่ำ (ควรปรับปรุง)",
        color: "text-rose-500",
        bgColor: "bg-rose-50/50",
        borderColor: "border-rose-100/70",
        textColor: "text-rose-600",
        barColor: "bg-rose-500",
        width: `${score * 20}%`,
        emoji: "⚠️",
      };
    }
    if (score <= 4) {
      return {
        text: "ความปลอดภัยปานกลาง",
        color: "text-[#D08200]",
        bgColor: "bg-[#FFF9E6]",
        borderColor: "border-[#FFE29A]",
        textColor: "text-[#805B00]",
        barColor: "bg-[#FFB000]",
        width: `${score * 20}%`,
        emoji: "🛡️",
      };
    }
    return {
      text: "ความปลอดภัยระดับดีเยี่ยม!",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-100/70",
      textColor: "text-emerald-600",
      barColor: "bg-emerald-500",
      width: "100%",
      emoji: "💪✨",
    };
  });

  // Clock dials
  const incrementHour = () => {
    const [h, m] = lateLimitTime.value.split(":").map(Number);
    const val = (h + 1) % 24;
    lateLimitTime.value = `${String(val).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  const decrementHour = () => {
    const [h, m] = lateLimitTime.value.split(":").map(Number);
    const val = (h - 1 + 24) % 24;
    lateLimitTime.value = `${String(val).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  const incrementMinute = () => {
    const [h, m] = lateLimitTime.value.split(":").map(Number);
    const val = (m + 5) % 60;
    lateLimitTime.value = `${String(h).padStart(2, "0")}:${String(val).padStart(2, "0")}`;
  };
  const decrementMinute = () => {
    const [h, m] = lateLimitTime.value.split(":").map(Number);
    const val = (m - 5 + 60) % 60;
    lateLimitTime.value = `${String(h).padStart(2, "0")}:${String(val).padStart(2, "0")}`;
  };

  // Load settings from backend
  const loadSettings = async () => {
    if (!session.value || !session.value.teacher_id) return;
    try {
      // 🟢 แก้ไข: ใช้ useCustomFetch
      const res: any = await useCustomFetch(
        `/auth/settings/${session.value.teacher_id}`,
      );
      if (res.data) {
        formProfile.value.firstName = res.data.first_name || "";
        formProfile.value.lastName = res.data.last_name || "";
        formProfile.value.email = res.data.email || "";
        formProfile.value.phone = res.data.phone || "";
        formProfile.value.school = res.data.school_name || "";
        formProfile.value.title = res.data.subject_taught
          ? `คุณครูประจำวิชา${res.data.subject_taught}`
          : "";
        lateLimitTime.value = res.data.late_time || "08:30";
        passingRateThreshold.value = res.data.passing_rate || 80;
      }
    } catch (err: any) {
      showToast("ไม่สามารถดึงข้อมูลการตั้งค่าได้", "error");
    }
  };

  // Save profile and rules
  const saveSettings = async () => {
    if (!session.value || !session.value.teacher_id) return;

    if (activeTab.value === "profile") {
      if (
        !formProfile.value.firstName.trim() ||
        !formProfile.value.lastName.trim() ||
        !formProfile.value.school.trim()
      ) {
        showToast("กรุณากรอกข้อมูลโปรไฟล์ส่วนตัวให้ครบถ้วน", "warning");
        return;
      }
    }

    isSaving.value = true;
    try {
      const subjectClean = formProfile.value.title
        .replace("คุณครูประจำวิชา", "")
        .trim();

      // 🟢 แก้ไข: ใช้ useCustomFetch
      await useCustomFetch(`/auth/settings/${session.value.teacher_id}`, {
        method: "PATCH",
        body: {
          first_name: formProfile.value.firstName.trim(),
          last_name: formProfile.value.lastName.trim(),
          email: formProfile.value.email.trim(),
          phone: formProfile.value.phone.trim(),
          school_name: formProfile.value.school.trim(),
          subject_taught: subjectClean,
          late_time: lateLimitTime.value,
          passing_rate: Number(passingRateThreshold.value),
        },
      });

      // Sync local cookie values
      session.value = {
        ...session.value,
        firstname: formProfile.value.firstName.trim(),
        lastname: formProfile.value.lastName.trim(),
        email: formProfile.value.email.trim(),
        school_name: formProfile.value.school.trim(),
        subject_taught: subjectClean,
      };

      showToast("บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!", "success");
    } catch (err: any) {
      const errorMsg =
        err.data?.message || "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า";
      showToast(errorMsg, "error");
    } finally {
      isSaving.value = false;
    }
  };

  // Change password
  const changePassword = async () => {
    if (!session.value || !session.value.teacher_id) return;

    if (
      !formPassword.value.currentPassword ||
      !formPassword.value.newPassword ||
      !formPassword.value.confirmPassword
    ) {
      showToast("กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน", "warning");
      return;
    }

    if (formPassword.value.newPassword.length < 6) {
      showToast("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร", "warning");
      return;
    }

    if (formPassword.value.newPassword !== formPassword.value.confirmPassword) {
      showToast("รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน", "error");
      return;
    }

    isSaving.value = true;
    try {
      // 🟢 แก้ไข: ใช้ useCustomFetch
      await useCustomFetch(
        `/auth/settings/${session.value.teacher_id}/password`,
        {
          method: "PATCH",
          body: {
            current_password: formPassword.value.currentPassword,
            new_password: formPassword.value.newPassword,
          },
        },
      );

      formPassword.value.currentPassword = "";
      formPassword.value.newPassword = "";
      formPassword.value.confirmPassword = "";
      showToast("เปลี่ยนรหัสผ่านสำเร็จ!", "success");
    } catch (err: any) {
      const errorMsg = err.data?.message || "รหัสผ่านปัจจุบันไม่ถูกต้อง";
      showToast(errorMsg, "error");
    } finally {
      isSaving.value = false;
    }
  };

  return {
    activeTab,
    isSaving,
    formProfile,
    formPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    lateLimitTime,
    passingRateThreshold,
    passwordStrength,
    isLengthValid,
    hasNumber,
    hasUppercase,
    hasLowercase,
    hasSpecial,
    passwordStrengthScore,
    passwordStrengthDetails,
    incrementHour,
    decrementHour,
    incrementMinute,
    decrementMinute,
    loadSettings,
    saveSettings,
    changePassword,
  };
};
