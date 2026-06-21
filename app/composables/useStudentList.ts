import { ref, computed, watch, onMounted } from "vue";

export const useStudentList = () => {
  const { session, logout } = useTeacherSession();
  const classrooms = useState<any[]>("classrooms", () => []);

  // Lookups and mappings
  const prefixes = ref<any[]>([]);
  const genders = ref<any[]>([]);
  const studentClassroomsList = ref<any[]>([]);
  const prefectsList = ref<any[]>([]);

  // Loading / saving states
  const isFetching = ref(false);
  const isSubmitting = ref(false);

  // Toast state
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

  // Load prefix and gender lookups
  const loadLookups = async () => {
    try {
      // 🟢 แก้ไข: ใช้ useCustomFetch
      const prefixRes: any = await useCustomFetch("/system/prefix");
      if (prefixRes.data) {
        prefixes.value = prefixRes.data;
      }
      // 🟢 แก้ไข: ใช้ useCustomFetch
      const genderRes: any = await useCustomFetch("/system/gender");
      if (genderRes.data) {
        genders.value = genderRes.data;
      }
    } catch (err) {
      console.error("Failed to load lookups:", err);
    }
  };

  // Fetch all students, student-classrooms mappings, and classrooms
  const fetchStudentsData = async () => {
    if (!session.value || !session.value.teacher_id) return;
    isFetching.value = true;
    try {
      await loadLookups();

      // 🟢 แก้ไข: ใช้ useCustomFetch ทั้งหมด
      const [
        classroomsRes,
        schedulesRes,
        studentClassroomsRes,
        studentsRes,
        attendancesRes,
        prefectsRes,
      ]: any = await Promise.all([
        useCustomFetch("/classrooms"),
        useCustomFetch("/class-schedules"),
        useCustomFetch("/student-classrooms"),
        useCustomFetch("/students"),
        useCustomFetch("/classroom-attendences"),
        useCustomFetch("/prefects"),
      ]);

      const rawClassrooms = classroomsRes.data || [];
      const rawSchedules = schedulesRes.data || [];
      const rawStudentClassrooms = studentClassroomsRes.data || [];
      const rawStudents = studentsRes.data || [];
      const rawAttendances = attendancesRes.data || [];
      const rawPrefects = prefectsRes.data || [];

      studentClassroomsList.value = rawStudentClassrooms;
      prefectsList.value = rawPrefects;

      // Filter classrooms by logged-in teacher
      const teacherClassrooms = rawClassrooms.filter(
        (c: any) => c.teacher_id === session.value.teacher_id,
      );

      const formattedClassrooms = teacherClassrooms.map((cls: any) => {
        // Find mapped students in this classroom
        const matchedStudentClassrooms = rawStudentClassrooms.filter(
          (sc: any) => sc.classroom_id === cls.id,
        );
        const enrolledStudents = matchedStudentClassrooms
          .map((sc: any) => {
            const studentInfo = rawStudents.find(
              (s: any) => s.id === sc.student_id,
            );
            if (!studentInfo) return null;

            const matchedPrefixObj = prefixes.value.find(
              (p: any) => p.id === studentInfo.prefix_id,
            );
            const dbPrefixName = matchedPrefixObj
              ? matchedPrefixObj.name
              : "ด.ช.";

            let prefixName = dbPrefixName;
            if (dbPrefixName === "เด็กชาย") prefixName = "ด.ช.";
            else if (dbPrefixName === "เด็กหญิง") prefixName = "ด.ญ.";
            else if (dbPrefixName === "นางสาว") prefixName = "น.ส.";

            // Find today's attendance status
            const todayStr = new Date().toISOString().split("T")[0];
            const matchingSchedules = rawSchedules.filter(
              (s: any) => s.classroom_id === cls.id && s.date === todayStr,
            );

            let status = "";
            let details = "";

            if (matchingSchedules.length > 0) {
              const scheduleIds = matchingSchedules.map((ms: any) => ms.id);
              const matchedAttendance = rawAttendances.find(
                (a: any) =>
                  a.student_id === studentInfo.id &&
                  scheduleIds.includes(a.schedule_id),
              );
              if (matchedAttendance) {
                status = matchedAttendance.status;
                details = matchedAttendance.remark || "";
              }
            }

            return {
              id: studentInfo.id,
              no: parseInt(studentInfo.student_no || "0") || 0,
              prefix: prefixName,
              firstName: studentInfo.firstname,
              lastName: studentInfo.lastname,
              status,
              details,
              // Keep DB IDs for editing/updates
              prefixId: studentInfo.prefix_id,
              genderId: studentInfo.gender_id,
              studentNoRaw: studentInfo.student_no,
              code: studentInfo.code,
            };
          })
          .filter(Boolean);

        enrolledStudents.sort((a: any, b: any) => a.no - b.no);

        // Find schedule for today or the most recent schedule
        const todayStr = new Date().toISOString().split("T")[0];
        const todaySchedule = rawSchedules.find(
          (s: any) => s.classroom_id === cls.id && s.date === todayStr,
        );
        const latestSchedule = rawSchedules
          .filter((s: any) => s.classroom_id === cls.id)
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0];

        const activeSchedule = todaySchedule || latestSchedule;

        let timeText = "08:15 - 09:10 น.";
        let checkedTimeText = "ยังไม่ได้เช็คชื่อ";
        let statusVal: "completed" | "pending" = "pending";

        if (activeSchedule) {
          const start = (activeSchedule.start_time || "").slice(0, 5);
          const end = (activeSchedule.end_time || "").slice(0, 5);
          timeText = `${start} - ${end} น.`;

          // Check if today's attendance has been recorded for any student
          const scheduleAttendance = rawAttendances.filter(
            (a: any) => a.schedule_id === activeSchedule.id,
          );
          if (scheduleAttendance.length > 0) {
            statusVal = "completed";
            // Find most recent attendance edit time
            const lastUpdated = scheduleAttendance.reduce(
              (latest: string, curr: any) => {
                return new Date(curr.updated_at).getTime() >
                  new Date(latest).getTime()
                  ? curr.updated_at
                  : latest;
              },
              scheduleAttendance[0].updated_at,
            );

            const timeStr = new Date(lastUpdated).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            });
            checkedTimeText = `เช็คชื่อเมื่อ ${timeStr} น.`;
          }
        }

        return {
          id: cls.id,
          name: cls.class,
          subject: cls.subject,
          studentsCount: enrolledStudents.length,
          status: statusVal,
          time: timeText,
          checkedTime: checkedTimeText,
          students: enrolledStudents,
        };
      });

      classrooms.value = formattedClassrooms;
    } catch (err) {
      console.error("Failed to fetch student data:", err);
      showToast("ไม่สามารถโหลดข้อมูลรายชื่อนักเรียนได้", "error");
    } finally {
      isFetching.value = false;
    }
  };

  // Flat student mapper attaching parent metadata
  const allStudentsMapped = computed(() => {
    return classrooms.value.flatMap((cls) => {
      return cls.students.map((s: any) => ({
        ...s,
        classId: cls.id,
        className: cls.name,
        classSubject: cls.subject,
      }));
    });
  });

  // Statistics computed helpers
  const totalStudentsCount = computed(() => allStudentsMapped.value.length);
  const boysCount = computed(() => {
    const maleGender = genders.value.find(
      (g: any) => g.name === "ชาย" || g.name.toLowerCase().includes("male"),
    );
    if (maleGender) {
      return allStudentsMapped.value.filter(
        (s: any) => s.genderId === maleGender.id,
      ).length;
    }
    return allStudentsMapped.value.filter((s: any) => {
      const p = s.prefix || "";
      return (
        p === "ด.ช." ||
        p === "นาย" ||
        p === "เด็กชาย" ||
        p.includes("ด.ช") ||
        p.includes("เด็กชาย")
      );
    }).length;
  });
  const girlsCount = computed(() => {
    const femaleGender = genders.value.find(
      (g: any) => g.name === "หญิง" || g.name.toLowerCase().includes("female"),
    );
    if (femaleGender) {
      return allStudentsMapped.value.filter(
        (s: any) => s.genderId === femaleGender.id,
      ).length;
    }
    return allStudentsMapped.value.filter((s: any) => {
      const p = s.prefix || "";
      return (
        p === "ด.ญ." ||
        p === "น.ส." ||
        p === "นางสาว" ||
        p === "เด็กหญิง" ||
        p.includes("ด.ญ") ||
        p.includes("เด็กหญิง") ||
        p.includes("นางสาว")
      );
    }).length;
  });
  const totalClassroomsCount = computed(() => classrooms.value.length);

  // Dynamic avatar style based on student name hash
  const getAvatarStyle = (firstName: string, lastName: string) => {
    const combined = firstName + lastName;
    const palettes = [
      "bg-[#FFEBEF] text-[#FF4D6D] border-[#FFCCD5]",
      "bg-[#EBF8FF] text-[#2B6CB0] border-[#BEE3F8]",
      "bg-[#E6FFFA] text-[#319795] border-[#B2F5EA]",
      "bg-[#FFFFF0] text-[#B7791F] border-[#FEFCBF]",
      "bg-[#FAF5FF] text-[#6B46C1] border-[#E9D8FD]",
      "bg-[#F0FFF4] text-[#2F855A] border-[#C6F6D5]",
    ];
    let sum = 0;
    for (let i = 0; i < combined.length; i++) {
      sum += combined.charCodeAt(i);
    }
    return palettes[sum % palettes.length];
  };

  // Filters and search states
  const searchQuery = ref("");
  const selectedClassFilterId = ref<string | "all">("all");
  const showClassFilterPopover = ref(false);

  const selectedClassroomFilterObj = computed(() => {
    if (selectedClassFilterId.value === "all") return null;
    return classrooms.value.find((c) => c.id === selectedClassFilterId.value);
  });

  // Filtered Students List
  const filteredStudents = computed(() => {
    return allStudentsMapped.value
      .filter((s: any) => {
        const matchesSearch =
          s.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          s.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          `${s.prefix}${s.firstName} ${s.lastName}`
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          s.no.toString() === searchQuery.value.trim();

        const matchesClass =
          selectedClassFilterId.value === "all" ||
          s.classId === selectedClassFilterId.value;

        return matchesSearch && matchesClass;
      })
      .sort((a: any, b: any) => {
        // Sort by class name / ID first, then by Student No
        if (a.className !== b.className) {
          return a.className.localeCompare(b.className);
        }
        return a.no - b.no;
      });
  });

  // Add Student states & logic
  const isAddModalOpen = ref(false);
  const newStudentPrefix = ref("ด.ช.");
  const newStudentFirstName = ref("");
  const newStudentLastName = ref("");
  const newStudentClassId = ref<string | null>(null);
  const newStudentNo = ref<number | null>(null);
  const showAddClassPopover = ref(false);

  const newStudentSelectedClass = computed(() => {
    if (!newStudentClassId.value) return null;
    return classrooms.value.find((c) => c.id === newStudentClassId.value);
  });

  const openAddModal = () => {
    newStudentPrefix.value = "ด.ช.";
    newStudentFirstName.value = "";
    newStudentLastName.value = "";

    // Default to first class if available
    newStudentClassId.value =
      classrooms.value.length > 0 ? classrooms.value[0].id : null;

    calculateNextStudentNo();

    showAddClassPopover.value = false;
    isAddModalOpen.value = true;
  };

  const calculateNextStudentNo = () => {
    if (!newStudentClassId.value) {
      newStudentNo.value = 1;
      return;
    }
    const targetClass = classrooms.value.find(
      (c) => c.id === newStudentClassId.value,
    );
    if (targetClass && targetClass.students.length > 0) {
      const maxNo = Math.max(...targetClass.students.map((s: any) => s.no));
      newStudentNo.value = maxNo + 1;
    } else {
      newStudentNo.value = 1;
    }
  };

  // Watch selected class to update next student no suggestion
  watch(newStudentClassId, () => {
    calculateNextStudentNo();
  });

  const handleAddStudent = async () => {
    if (
      !newStudentFirstName.value.trim() ||
      !newStudentLastName.value.trim() ||
      !newStudentClassId.value ||
      !newStudentNo.value
    ) {
      showToast("กรุณากรอกข้อมูลส่วนตัวของนักเรียนให้ครบถ้วน", "warning");
      return;
    }

    isSubmitting.value = true;
    try {
      const targetClass = classrooms.value.find(
        (c) => c.id === newStudentClassId.value,
      );
      if (targetClass) {
        // Check if number already taken
        const noTaken = targetClass.students.some(
          (s: any) => s.no === Number(newStudentNo.value),
        );
        if (noTaken) {
          showToast(
            `เลขที่ ${newStudentNo.value} ถูกใช้งานในห้องเรียนนี้แล้ว`,
            "warning",
          );
          isSubmitting.value = false;
          return;
        }
      }

      // Map prefix and gender using robust mapping
      const prefixClean = String(newStudentPrefix.value || "")
        .trim()
        .replace(/\./g, "");
      let targetPrefixName = "";
      if (prefixClean === "ดช" || prefixClean === "เด็กชาย") {
        targetPrefixName = "เด็กชาย";
      } else if (prefixClean === "ดญ" || prefixClean === "เด็กหญิง") {
        targetPrefixName = "เด็กหญิง";
      } else if (prefixClean === "นาย") {
        targetPrefixName = "นาย";
      } else if (prefixClean === "นางสาว" || prefixClean === "นส") {
        targetPrefixName = "นางสาว";
      } else if (prefixClean === "นาง") {
        targetPrefixName = "นาง";
      } else if (prefixClean === "คุณ") {
        targetPrefixName = "คุณ";
      }

      const matchedPrefix =
        prefixes.value.find((p) => p.name === targetPrefixName) ||
        prefixes.value.find(
          (p) => p.name.includes(prefixClean) || prefixClean.includes(p.name),
        );

      const prefixId = matchedPrefix
        ? matchedPrefix.id
        : prefixes.value[0]?.id || "";
      const genderId = matchedPrefix
        ? matchedPrefix.gender_id
        : genders.value[0]?.id || "";
      const randomCode = `ST-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. POST Student
      // 🟢 แก้ไข: ใช้ useCustomFetch
      const studentRes: any = await useCustomFetch("/students", {
        method: "POST",
        body: {
          gender_id: genderId,
          prefix_id: prefixId,
          firstname: newStudentFirstName.value.trim(),
          lastname: newStudentLastName.value.trim(),
          student_no: newStudentNo.value.toString(),
          code: randomCode,
        },
      });

      if (studentRes.data && studentRes.data.id) {
        // 2. POST student-classrooms association
        // 🟢 แก้ไข: ใช้ useCustomFetch
        await useCustomFetch("/student-classrooms", {
          method: "POST",
          body: {
            student_id: studentRes.data.id,
            classroom_id: newStudentClassId.value,
          },
        });

        showToast(
          `เพิ่ม ${newStudentFirstName.value} เรียบร้อยแล้ว!`,
          "success",
        );
        isAddModalOpen.value = false;
        await fetchStudentsData();
      } else {
        throw new Error("Failed to create student record");
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลนักเรียน";
      showToast(msg, "error");
    } finally {
      isSubmitting.value = false;
    }
  };

  // Edit Student states & logic
  const isEditModalOpen = ref(false);
  const editingStudentObj = ref<any | null>(null);
  const editStudentPrefix = ref("ด.ช.");
  const editStudentFirstName = ref("");
  const editStudentLastName = ref("");
  const editStudentClassId = ref<string | null>(null);
  const editStudentNo = ref<number | null>(null);
  const showEditClassPopover = ref(false);

  const editStudentSelectedClass = computed(() => {
    if (!editStudentClassId.value) return null;
    return classrooms.value.find((c) => c.id === editStudentClassId.value);
  });

  const openEditModal = (student: any) => {
    editingStudentObj.value = student;
    editStudentPrefix.value = student.prefix;
    editStudentFirstName.value = student.firstName;
    editStudentLastName.value = student.lastName;
    editStudentClassId.value = student.classId;
    editStudentNo.value = student.no;

    showEditClassPopover.value = false;
    isEditModalOpen.value = true;
  };

  const handleUpdateStudent = async () => {
    if (
      !editStudentFirstName.value.trim() ||
      !editStudentLastName.value.trim() ||
      !editStudentClassId.value ||
      !editStudentNo.value
    ) {
      showToast("กรุณากรอกข้อมูลส่วนตัวของนักเรียนให้ครบถ้วน", "warning");
      return;
    }

    isSubmitting.value = true;
    try {
      const targetClass = classrooms.value.find(
        (c) => c.id === editStudentClassId.value,
      );
      if (targetClass) {
        // Check if moving to new class or editing no, and number is taken in target class
        if (
          editingStudentObj.value.classId !== editStudentClassId.value ||
          editingStudentObj.value.no !== Number(editStudentNo.value)
        ) {
          const noTaken = targetClass.students.some(
            (s: any) =>
              s.id !== editingStudentObj.value.id &&
              s.no === Number(editStudentNo.value),
          );
          if (noTaken) {
            showToast(
              `เลขที่ ${editStudentNo.value} ถูกใช้งานในห้องเรียนนี้แล้ว`,
              "warning",
            );
            isSubmitting.value = false;
            return;
          }
        }
      }

      // Map prefix and gender using robust mapping
      const prefixClean = String(editStudentPrefix.value || "")
        .trim()
        .replace(/\./g, "");
      let targetPrefixName = "";
      if (prefixClean === "ดช" || prefixClean === "เด็กชาย") {
        targetPrefixName = "เด็กชาย";
      } else if (prefixClean === "ดญ" || prefixClean === "เด็กหญิง") {
        targetPrefixName = "เด็กหญิง";
      } else if (prefixClean === "นาย") {
        targetPrefixName = "นาย";
      } else if (prefixClean === "นางสาว" || prefixClean === "นส") {
        targetPrefixName = "นางสาว";
      } else if (prefixClean === "นาง") {
        targetPrefixName = "นาง";
      } else if (prefixClean === "คุณ") {
        targetPrefixName = "คุณ";
      }

      const matchedPrefix =
        prefixes.value.find((p) => p.name === targetPrefixName) ||
        prefixes.value.find(
          (p) => p.name.includes(prefixClean) || prefixClean.includes(p.name),
        );

      const prefixId = matchedPrefix
        ? matchedPrefix.id
        : prefixes.value[0]?.id || "";
      const genderId = matchedPrefix
        ? matchedPrefix.gender_id
        : genders.value[0]?.id || "";

      // 1. PATCH Student details
      // 🟢 แก้ไข: ใช้ useCustomFetch
      await useCustomFetch(`/students/${editingStudentObj.value.id}`, {
        method: "PATCH",
        body: {
          gender_id: genderId,
          prefix_id: prefixId,
          firstname: editStudentFirstName.value.trim(),
          lastname: editStudentLastName.value.trim(),
          student_no: editStudentNo.value.toString(),
          code: editingStudentObj.value.code,
        },
      });

      // 2. Manage student-classroom mappings if changed
      if (editingStudentObj.value.classId !== editStudentClassId.value) {
        const mappingRecord = studentClassroomsList.value.find(
          (sc) =>
            sc.student_id === editingStudentObj.value.id &&
            sc.classroom_id === editingStudentObj.value.classId,
        );

        if (mappingRecord) {
          // 🟢 แก้ไข: ใช้ useCustomFetch
          await useCustomFetch(`/student-classrooms/${mappingRecord.id}`, {
            method: "PATCH",
            body: {
              student_id: editingStudentObj.value.id,
              classroom_id: editStudentClassId.value,
            },
          });
        } else {
          // Fallback if no mapping record exists
          // 🟢 แก้ไข: ใช้ useCustomFetch
          await useCustomFetch("/student-classrooms", {
            method: "POST",
            body: {
              student_id: editingStudentObj.value.id,
              classroom_id: editStudentClassId.value,
            },
          });
        }
      }

      showToast(`แก้ไขข้อมูลประวัตินักเรียนเรียบร้อยแล้ว!`, "success");
      isEditModalOpen.value = false;
      await fetchStudentsData();
    } catch (err: any) {
      console.error(err);
      const msg =
        err.data?.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูลนักเรียน";
      showToast(msg, "error");
    } finally {
      isSubmitting.value = false;
    }
  };

  // Delete Student states & logic
  const isDeleteModalOpen = ref(false);
  const deletingStudentObj = ref<any | null>(null);

  const confirmDeleteStudent = (student: any) => {
    // Check if the student is a prefect
    const isPrefect = prefectsList.value.some(
      (p: any) => p.student_id === student.id,
    );
    if (isPrefect) {
      showToast(
        "ไม่สามารถลบนักเรียนคนนี้ได้ เนื่องจากมีสถานะเป็นสารวัตรนักเรียน",
        "error",
      );
      return;
    }
    deletingStudentObj.value = student;
    isDeleteModalOpen.value = true;
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudentObj.value) return;

    isSubmitting.value = true;
    try {
      // 1. Delete mapping record
      const mappingRecord = studentClassroomsList.value.find(
        (sc) =>
          sc.student_id === deletingStudentObj.value.id &&
          sc.classroom_id === deletingStudentObj.value.classId,
      );
      if (mappingRecord) {
        // 🟢 แก้ไข: ใช้ useCustomFetch
        await useCustomFetch(`/student-classrooms/${mappingRecord.id}`, {
          method: "DELETE",
        });
      }

      // 2. Delete student record
      // 🟢 แก้ไข: ใช้ useCustomFetch
      await useCustomFetch(`/students/${deletingStudentObj.value.id}`, {
        method: "DELETE",
      });

      showToast(`ลบข้อมูลนักเรียนเรียบร้อยแล้ว`, "info");
      isDeleteModalOpen.value = false;
      await fetchStudentsData();
    } catch (err: any) {
      console.error(err);
      const msg = err.data?.message || "เกิดข้อผิดพลาดในการลบรายชื่อนักเรียน";
      showToast(msg, "error");
    } finally {
      isSubmitting.value = false;
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
    await fetchStudentsData();
  });

  return {
    classrooms,
    isFetching,
    isSubmitting,
    toasts,
    showToast,
    fetchStudentsData,
    allStudentsMapped,
    totalStudentsCount,
    boysCount,
    girlsCount,
    totalClassroomsCount,
    getAvatarStyle,
    searchQuery,
    selectedClassFilterId,
    showClassFilterPopover,
    selectedClassroomFilterObj,
    filteredStudents,

    // Add student
    isAddModalOpen,
    newStudentPrefix,
    newStudentFirstName,
    newStudentLastName,
    newStudentClassId,
    newStudentNo,
    showAddClassPopover,
    newStudentSelectedClass,
    openAddModal,
    handleAddStudent,

    // Edit student
    isEditModalOpen,
    editingStudentObj,
    editStudentPrefix,
    editStudentFirstName,
    editStudentLastName,
    editStudentClassId,
    editStudentNo,
    showEditClassPopover,
    editStudentSelectedClass,
    openEditModal,
    handleUpdateStudent,

    // Delete student
    isDeleteModalOpen,
    deletingStudentObj,
    confirmDeleteStudent,
    handleDeleteStudent,

    // Logout
    isLogoutModalOpen,
    handleLogout,
    confirmLogout,
  };
};
