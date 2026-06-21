import { ref, computed, watch, onMounted } from "vue";

export const usePrefectList = () => {
  const { session, logout } = useTeacherSession();

  // State lists
  const prefects = ref<any[]>([]);
  const classroomsList = ref<any[]>([]);
  const studentClassroomsList = ref<any[]>([]);
  const students = ref<any[]>([]);

  // UI state variables
  const isFetching = ref(false);
  const isSubmitting = ref(false);
  const toasts = ref<
    {
      id: number;
      message: string;
      type: "success" | "error" | "warning" | "info";
    }[]
  >([]);
  let toastId = 0;

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "success",
  ) => {
    const id = toastId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 3000);
  };

  // Parse classroom class strings like "ชั้นมัธยมศึกษาปีที่ 1/1" or "ม.4/1"
  const parseClassroomDetails = (className: string) => {
    let grade = className;
    let room = "";
    if (className.includes("มัธยมศึกษาปีที่")) {
      const match = className.match(/มัธยมศึกษาปีที่\s*(\d+)\s*\/\s*(\d+)/);
      if (match) {
        grade = `ม.${match[1]}`;
        room = match[2];
      } else {
        const gradeOnlyMatch = className.match(/มัธยมศึกษาปีที่\s*(\d+)/);
        if (gradeOnlyMatch) {
          grade = `ม.${gradeOnlyMatch[1]}`;
        }
      }
    } else if (className.includes("/")) {
      const parts = className.split("/");
      if (parts.length === 2) {
        grade = parts[0].trim();
        room = parts[1].trim();
      }
    }

    // If still long, shorten it to first 4 chars for UI display badge
    if (grade.length > 6 && !grade.includes("/")) {
      grade = grade.substring(0, 4);
    }

    return { grade, room };
  };

  // Fetch all database records
  const fetchPrefectsData = async () => {
    if (!session.value || !session.value.teacher_id) return;
    isFetching.value = true;
    try {
      const [
        classroomsRes,
        studentClassroomsRes,
        studentsRes,
        prefectsRes,
        attendancesRes,
        schedulesRes,
      ]: any = await Promise.all([
        $fetch("http://localhost:8080/api/v1/classrooms"),
        $fetch("http://localhost:8080/api/v1/student-classrooms"),
        $fetch("http://localhost:8080/api/v1/students"),
        $fetch("http://localhost:8080/api/v1/prefects"),
        $fetch("http://localhost:8080/api/v1/classroom-attendences"),
        $fetch("http://localhost:8080/api/v1/class-schedules"),
      ]);

      const rawClassrooms = classroomsRes.data || [];
      const rawStudentClassrooms = studentClassroomsRes.data || [];
      const rawStudents = studentsRes.data || [];
      const rawPrefects = prefectsRes.data || [];
      const rawAttendances = attendancesRes.data || [];
      const rawSchedules = schedulesRes.data || [];

      studentClassroomsList.value = rawStudentClassrooms;
      students.value = rawStudents;

      // Filter classrooms by this teacher
      const teacherClassrooms = rawClassrooms.filter(
        (c: any) => c.teacher_id === session.value.teacher_id,
      );
      const teacherClassroomIds = teacherClassrooms.map((c: any) => c.id);

      classroomsList.value = teacherClassrooms.map((cls: any) => {
        const { grade, room } = parseClassroomDetails(cls.class);
        const studentsCount = rawStudentClassrooms.filter(
          (sc: any) => sc.classroom_id === cls.id,
        ).length;
        return {
          id: cls.id,
          name: cls.class,
          grade,
          room,
          studentsCount,
        };
      });

      // Filter prefects by this teacher's classrooms
      const teacherPrefects = rawPrefects.filter((p: any) =>
        teacherClassroomIds.includes(p.classroom_id),
      );

      // คำนวณวันที่ปัจจุบันแบบ Local (เพื่อป้องกันบักเรื่อง Timezone ของ .toISOString)
      const today = new Date();
      const tzOffset = today.getTimezoneOffset() * 60000;
      const localDateStr = new Date(today.getTime() - tzOffset)
        .toISOString()
        .split("T")[0];

      prefects.value = teacherPrefects.map((pref: any) => {
        const studentInfo = rawStudents.find(
          (s: any) => s.id === pref.student_id,
        );
        const firstName = studentInfo ? studentInfo.firstname : "ไม่พบข้อมูล";
        const lastName = studentInfo ? studentInfo.lastname : "";

        const classroomInfo = rawClassrooms.find(
          (c: any) => c.id === pref.classroom_id,
        );
        const className = classroomInfo ? classroomInfo.class : "";
        const { grade, room } = parseClassroomDetails(className);

        // กรองการเช็คชื่อที่ถูกบันทึกโดย "สารวัตรคนนี้" ในวันนี้
        const prefectAttendances = rawAttendances.filter((a: any) => {
          const isToday = a.date && a.date.startsWith(localDateStr);

          // สมมติว่าเก็บรหัสของสารวัตร (เช่น PRC-123456) ไว้ใน details ของการเช็คชื่อ
          const isCheckedByThisPrefect =
            a.details && a.details.includes(pref.code);

          return isToday && isCheckedByThisPrefect;
        });

        return {
          id: pref.id,
          firstName,
          lastName,
          inspectorId: pref.code,
          className,
          grade,
          room,
          phone: pref.phone,
          status: pref.is_active ? "active" : "inactive",
          isActive: pref.is_active,
          lastLogin: pref.last_login
            ? new Date(pref.last_login).toLocaleString("th-TH")
            : "ยังไม่เคยเข้าสู่ระบบ",
          checksToday: prefectAttendances.length, // เปลี่ยนมาใช้จำนวนที่กรองแล้ว
          classroomId: pref.classroom_id,
          studentId: pref.student_id,
        };
      });
    } catch (err) {
      console.error(err);
      showToast("ไม่สามารถดึงข้อมูลบัญชีสารวัตรนักเรียนได้", "error");
    } finally {
      isFetching.value = false;
    }
  };

  // Active tab
  const activeTab = ref("prefect");

  // Search query
  const searchQuery = ref("");

  // Modal states
  const isAddModalOpen = ref(false);
  const isEditModalOpen = ref(false);
  const isDeleteModalOpen = ref(false);
  const selectedPrefect = ref<any>(null);

  // Form selected classroom & student
  const selectedClassroomId = ref("");
  const selectedStudentId = ref("");

  // Dropdown open states
  const isClassroomDropdownOpen = ref(false);
  const isStudentDropdownOpen = ref(false);

  const filteredStudentsForClass = computed(() => {
    if (!selectedClassroomId.value) return [];
    const mappings = studentClassroomsList.value.filter(
      (sc: any) => sc.classroom_id === selectedClassroomId.value,
    );
    return mappings
      .map((sc: any) => {
        const s = students.value.find(
          (student: any) => student.id === sc.student_id,
        );
        if (!s) return null;
        return {
          id: s.id,
          firstName: s.firstname,
          lastName: s.lastname,
        };
      })
      .filter(Boolean);
  });

  // Display labels
  const selectedClassroomLabel = computed(() => {
    const cls = classroomsList.value.find(
      (c) => c.id === selectedClassroomId.value,
    );
    if (cls) return cls.name;
    if (
      selectedPrefect.value &&
      selectedClassroomId.value === selectedPrefect.value.classroomId
    ) {
      const g = selectedPrefect.value.grade;
      const r = selectedPrefect.value.room;
      if (g.startsWith("ม.")) {
        const gradeNum = g.substring(2);
        return r
          ? `ชั้นมัธยมศึกษาปีที่ ${gradeNum}/${r}`
          : `ชั้นมัธยมศึกษาปีที่ ${gradeNum}`;
      }
      return r ? `ชั้นเรียน ${g}/${r}` : `ชั้นเรียน ${g}`;
    }
    return "";
  });

  const selectedStudentLabel = computed(() => {
    if (
      selectedPrefect.value &&
      selectedStudentId.value === selectedPrefect.value.studentId
    ) {
      return `${selectedPrefect.value.firstName} ${selectedPrefect.value.lastName}`;
    }
    const stu = filteredStudentsForClass.value.find(
      (s) => s.id === selectedStudentId.value,
    );
    return stu ? `${stu.firstName} ${stu.lastName}` : "";
  });

  // Form state
  const form = ref({
    firstName: "",
    lastName: "",
    inspectorId: "",
    password: "",
    confirmPassword: "",
    grade: "",
    room: "",
    phone: "",
  });
  const showFormPassword = ref(false);
  const showFormConfirm = ref(false);

  // Select Classroom handler
  const selectClassroom = (cls: any) => {
    selectedClassroomId.value = cls.id;
    isClassroomDropdownOpen.value = false;
    selectedStudentId.value = "";
    form.value.firstName = "";
    form.value.lastName = "";
    form.value.grade = cls.grade;
    form.value.room = cls.room;
  };

  // Select Student handler
  const selectStudent = (stu: any) => {
    selectedStudentId.value = stu.id;
    isStudentDropdownOpen.value = false;
    form.value.firstName = stu.firstName;
    form.value.lastName = stu.lastName;
  };

  // Filtered prefects computed
  const filteredPrefects = computed(() => {
    if (!searchQuery.value.trim()) return prefects.value;
    const q = searchQuery.value.toLowerCase();
    return prefects.value.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.inspectorId.toLowerCase().includes(q) ||
        (p.className && p.className.toLowerCase().includes(q)) ||
        `${p.grade}/${p.room}`.includes(q),
    );
  });

  const totalActive = computed(
    () => prefects.value.filter((p) => p.isActive).length,
  );
  // แก้ไขตรงนี้เพื่อป้องกันค่า NaN ตอนรวมจำนวนเช็คชื่อ
  const totalToday = computed(() =>
    prefects.value.reduce((sum, p) => sum + (Number(p.checksToday) || 0), 0),
  );

  // Open add modal
  const openAddModal = () => {
    selectedPrefect.value = null;
    form.value = {
      firstName: "",
      lastName: "",
      inspectorId: "",
      password: "",
      confirmPassword: "",
      grade: "",
      room: "",
      phone: "",
    };
    selectedClassroomId.value = "";
    selectedStudentId.value = "";
    isClassroomDropdownOpen.value = false;
    isStudentDropdownOpen.value = false;
    showFormPassword.value = false;
    showFormConfirm.value = false;
    isAddModalOpen.value = true;
  };

  // Open edit modal
  const openEditModal = (prefect: any) => {
    selectedPrefect.value = prefect;
    selectedClassroomId.value = prefect.classroomId;
    selectedStudentId.value = prefect.studentId;
    form.value = {
      firstName: prefect.firstName,
      lastName: prefect.lastName,
      inspectorId: prefect.inspectorId,
      password: "",
      confirmPassword: "",
      grade: prefect.grade,
      room: prefect.room,
      phone: prefect.phone,
    };
    showFormPassword.value = false;
    showFormConfirm.value = false;
    isClassroomDropdownOpen.value = false;
    isStudentDropdownOpen.value = false;
    isEditModalOpen.value = true;
  };

  // Open delete modal
  const openDeleteModal = (prefect: any) => {
    selectedPrefect.value = prefect;
    isDeleteModalOpen.value = true;
  };

  // Add prefect execution
  const handleAdd = async () => {
    if (!selectedClassroomId.value) {
      showToast("กรุณาเลือกชั้นเรียน", "warning");
      return;
    }
    if (!selectedStudentId.value) {
      showToast("กรุณาเลือกนักเรียน", "warning");
      return;
    }
    if (form.value.password.length < 6) {
      showToast("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", "warning");
      return;
    }
    if (form.value.password !== form.value.confirmPassword) {
      showToast("รหัสผ่านไม่ตรงกัน", "error");
      return;
    }

    isSubmitting.value = true;
    try {
      await $fetch("http://localhost:8080/api/v1/prefects", {
        method: "POST",
        body: {
          classroom_id: selectedClassroomId.value,
          student_id: selectedStudentId.value,
          phone: form.value.phone,
          password: form.value.password,
        },
      });

      showToast(
        `เพิ่มสารวัตร ${form.value.firstName} ${form.value.lastName} เรียบร้อยแล้ว`,
        "success",
      );
      isAddModalOpen.value = false;
      await fetchPrefectsData();
    } catch (err: any) {
      console.error(err);
      const msg = err.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลสารวัตร";
      showToast(msg, "error");
    } finally {
      isSubmitting.value = false;
    }
  };

  // Edit prefect execution
  const handleEdit = async () => {
    if (!selectedClassroomId.value) {
      showToast("กรุณาเลือกชั้นเรียน", "warning");
      return;
    }
    if (!selectedStudentId.value) {
      showToast("กรุณาเลือกนักเรียน", "warning");
      return;
    }
    if (form.value.password && form.value.password.length < 6) {
      showToast("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", "warning");
      return;
    }
    if (
      form.value.password &&
      form.value.password !== form.value.confirmPassword
    ) {
      showToast("รหัสผ่านไม่ตรงกัน", "error");
      return;
    }

    isSubmitting.value = true;
    try {
      const payload: any = {
        classroom_id: selectedClassroomId.value,
        student_id: selectedStudentId.value,
        phone: form.value.phone,
        code: selectedPrefect.value.inspectorId,
        is_active: selectedPrefect.value.isActive,
      };
      if (form.value.password) {
        payload.password = form.value.password;
      }

      await $fetch(
        `http://localhost:8080/api/v1/prefects/${selectedPrefect.value.id}`,
        {
          method: "PATCH",
          body: payload,
        },
      );

      showToast("อัปเดตข้อมูลสารวัตรเรียบร้อยแล้ว", "success");
      isEditModalOpen.value = false;
      await fetchPrefectsData();
    } catch (err: any) {
      console.error(err);
      const msg = err.data?.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูลสารวัตร";
      showToast(msg, "error");
    } finally {
      isSubmitting.value = false;
    }
  };

  // Delete prefect execution
  const handleDelete = async () => {
    if (!selectedPrefect.value) return;
    isSubmitting.value = true;
    try {
      await $fetch(
        `http://localhost:8080/api/v1/prefects/${selectedPrefect.value.id}`,
        {
          method: "DELETE",
        },
      );
      showToast(`ลบบัญชีสารวัตรเรียบร้อยแล้ว`, "success");
      isDeleteModalOpen.value = false;
      await fetchPrefectsData();
    } catch (err: any) {
      console.error(err);
      const msg = err.data?.message || "เกิดข้อผิดพลาดในการลบบัญชีสารวัตร";
      showToast(msg, "error");
    } finally {
      isSubmitting.value = false;
    }
  };

  // Toggle active status
  const toggleStatus = async (prefect: any) => {
    try {
      await $fetch(`http://localhost:8080/api/v1/prefects/${prefect.id}`, {
        method: "PATCH",
        body: {
          classroom_id: prefect.classroomId,
          student_id: prefect.studentId,
          phone: prefect.phone,
          code: prefect.inspectorId,
          is_active: !prefect.isActive,
        },
      });
      showToast(
        !prefect.isActive
          ? `เปิดใช้งานบัญชีของ ${prefect.firstName} แล้ว`
          : `ระงับบัญชีของ ${prefect.firstName} แล้ว`,
        !prefect.isActive ? "success" : "warning",
      );
      await fetchPrefectsData();
    } catch (err) {
      console.error(err);
      showToast("ไม่สามารถเปลี่ยนสถานะบัญชีได้", "error");
    }
  };

  // State for Logout Confirmation Modal
  const isLogoutModalOpen = ref(false);

  const handleLogout = () => {
    isLogoutModalOpen.value = true;
  };

  const confirmLogout = () => {
    isLogoutModalOpen.value = false;
    showToast("กำลังออกจากระบบ...", "success");
    logout();
  };

  onMounted(async () => {
    await fetchPrefectsData();
  });

  return {
    prefects,
    classrooms: classroomsList,
    isFetching,
    isSubmitting,
    toasts,
    showToast,
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
    confirmLogout,
  };
};
