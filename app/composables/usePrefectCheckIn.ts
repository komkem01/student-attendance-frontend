import { ref, computed, onMounted } from "vue";
import { usePrefectSession } from "./usePrefectSession";

export const usePrefectCheckIn = (
  showToast: (msg: string, type?: "success" | "error" | "warning") => void,
) => {
  const { prefectProfile } = usePrefectSession();
  const studentsList = ref<any[]>([]);
  const classroomsList = ref<any[]>([]);
  const studentClassroomsList = ref<any[]>([]);
  const schedulesList = ref<any[]>([]);
  const attendancesList = ref<any[]>([]);
  const prefixesList = ref<any[]>([]);

  const isFetching = ref(false);
  const isSubmitting = ref(false);

  // Modals state
  const isConfirmOpen = ref(false);
  const confirmStudent = ref<any | null>(null);

  const isEditModalOpen = ref(false);
  const editRecord = ref<any | null>(null);

  const fetchData = async () => {
    isFetching.value = true;
    try {
      // 🟢 อัปเดต: ใช้ useCustomFetch ทั้งหมด
      const [
        studentsRes,
        classroomsRes,
        studentClassroomsRes,
        schedulesRes,
        attendancesRes,
        prefixesRes,
      ]: any = await Promise.all([
        useCustomFetch("/students"),
        useCustomFetch("/classrooms"),
        useCustomFetch("/student-classrooms"),
        useCustomFetch("/class-schedules"),
        useCustomFetch("/classroom-attendences"),
        useCustomFetch("/system/prefix"),
      ]);

      studentsList.value = studentsRes.data || [];
      classroomsList.value = classroomsRes.data || [];
      studentClassroomsList.value = studentClassroomsRes.data || [];
      schedulesList.value = schedulesRes.data || [];
      attendancesList.value = attendancesRes.data || [];
      prefixesList.value = prefixesRes.data || [];
    } catch (err) {
      console.error("Failed to fetch prefect check-in data:", err);
      showToast("ไม่สามารถโหลดข้อมูลห้องเรียนและนักเรียนได้", "error");
    } finally {
      isFetching.value = false;
    }
  };

  onMounted(() => {
    fetchData();
  });

  // Lookup helper to match student prefix name
  const getPrefixName = (prefixId: string) => {
    const matched = prefixesList.value.find((p) => p.id === prefixId);
    return matched ? matched.name : "ด.ช.";
  };

  // Lookup helper to match student classroom name
  const getClassroomName = (studentId: string) => {
    const mapping = studentClassroomsList.value.find(
      (sc) => sc.student_id === studentId,
    );
    if (!mapping) return "ม.ทั่วไป";
    const cls = classroomsList.value.find((c) => c.id === mapping.classroom_id);
    if (!cls) return "ม.ทั่วไป";
    return cls.class
      .replace(/มัธยมศึกษา\s*ปีที่\s*/g, "ม.")
      .replace(/ประถมศึกษา\s*ปีที่\s*/g, "ป.")
      .trim();
  };

  // Mapped students array for search and display
  const allStudents = computed(() => {
    return studentsList.value.map((s) => {
      return {
        id: s.id,
        code: s.code,
        prefix: getPrefixName(s.prefix_id),
        firstName: s.firstname,
        lastName: s.lastname,
        classLabel: getClassroomName(s.id),
        studentNo: s.student_no,
      };
    });
  });

  // Checked In Set containing student IDs that are checked in today
  const checkedInIds = computed(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayAttendances = attendancesList.value.filter(
      (a) =>
        a.date === todayStr && (a.status === "present" || a.status === "late"),
    );
    return new Set(todayAttendances.map((a) => a.student_id));
  });

  // History checklist records (calculated from database attendances list - show ONLY late students)
  const checkInHistory = computed(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    // Filter attendances recorded today that have status 'late'
    const todayAttendances = attendancesList.value.filter(
      (a) => a.date === todayStr && a.status === "late",
    );

    // Map to the format needed by UI list
    const records = todayAttendances
      .map((a) => {
        const student = allStudents.value.find((s) => s.id === a.student_id);
        if (!student) return null;

        const timeVal = a.updated_at ? new Date(a.updated_at) : new Date();
        const timeStr = timeVal.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const matchMins = (a.remark || "").match(/late:\s*(\d+)\s*mins/);
        const lateMinutes = matchMins ? matchMins[1] : "15";

        return {
          id: a.id, // DB attendance ID
          studentId: student.code,
          dbStudentId: student.id,
          fullName: `${student.prefix}${student.firstName} ${student.lastName}`,
          classLabel: student.classLabel,
          initials: `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`,
          time: timeStr,
          status: a.status as "present" | "late",
          lateMinutes,
        };
      })
      .filter(Boolean) as any[];

    // Sort by updated time desc (newest first)
    return records.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
  });

  const presentCount = computed(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return attendancesList.value.filter(
      (a) => a.date === todayStr && a.status === "present",
    ).length;
  });

  const lateCount = computed(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return attendancesList.value.filter(
      (a) => a.date === todayStr && a.status === "late",
    ).length;
  });

  const totalCheckedCount = computed(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return attendancesList.value.filter(
      (a) =>
        a.date === todayStr && (a.status === "present" || a.status === "late"),
    ).length;
  });

  // Actions for confirm modal
  const openConfirm = (student: any) => {
    if (checkedInIds.value.has(student.id)) {
      showToast(`${student.firstName} เช็คชื่อแล้วในวันนี้`, "warning");
      return;
    }
    confirmStudent.value = student;
    isConfirmOpen.value = true;
  };

  const confirmCheckIn = async (status: "present" | "late") => {
    if (!confirmStudent.value) return;
    isSubmitting.value = true;

    const s = confirmStudent.value;
    // 1. Find classroom ID
    const mapping = studentClassroomsList.value.find(
      (sc) => sc.student_id === s.id,
    );
    if (!mapping) {
      showToast("ไม่พบข้อมูลห้องเรียนของนักเรียนคนนี้", "error");
      isSubmitting.value = false;
      return;
    }

    // 2. Find schedule today for this classroom
    const todayStr = new Date().toISOString().split("T")[0];
    const schedule = schedulesList.value.find(
      (sc) => sc.classroom_id === mapping.classroom_id && sc.date === todayStr,
    );
    if (!schedule) {
      showToast(
        "ห้องเรียนนี้ไม่มีตารางเรียนในวันนี้ จึงไม่สามารถเช็คชื่อได้",
        "warning",
      );
      isSubmitting.value = false;
      return;
    }

    try {
      const prefectCode = prefectProfile.value.code || "unknown";
      const prefectName = prefectProfile.value.name || "";

      let lateMinutes = 0;
      if (status === "late" && schedule && schedule.start_time) {
        const nowTime = new Date();
        const currentMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();
        const [sh, sm] = schedule.start_time.split(":").map(Number);
        const startMinutes = sh * 60 + sm;
        if (currentMinutes > startMinutes) {
          lateMinutes = currentMinutes - startMinutes;
        } else {
          const gateThreshold = 7 * 60 + 45; // 07:45
          if (currentMinutes > gateThreshold) {
            lateMinutes = currentMinutes - gateThreshold;
          } else {
            lateMinutes = 5; // fallback
          }
        }
      }

      // 🟢 อัปเดต: ใช้ useCustomFetch
      const res: any = await useCustomFetch("/classroom-attendences", {
        method: "POST",
        body: {
          student_id: s.id,
          schedule_id: schedule.id,
          date: todayStr,
          status: status,
          remark:
            status === "late"
              ? `gate check-in by prefect: ${prefectName} (${prefectCode}) | late: ${lateMinutes} mins`
              : `gate check-in by prefect: ${prefectName} (${prefectCode})`,
        },
      });

      if (res.data) {
        // Reload attendances
        // 🟢 อัปเดต: ใช้ useCustomFetch
        const attendancesRes: any = await useCustomFetch(
          "/classroom-attendences",
        );
        attendancesList.value = attendancesRes.data || [];

        isConfirmOpen.value = false;
        confirmStudent.value = null;
        showToast(
          status === "present"
            ? `✅ บันทึก ${s.prefix}${s.firstName} (${s.classLabel}) มาเรียนตรงเวลา`
            : `⚠️ บันทึก ${s.prefix}${s.firstName} (${s.classLabel}) มาสาย`,
          status === "present" ? "success" : "warning",
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast("ไม่สามารถบันทึกเวลาเรียนได้", "error");
    } finally {
      isSubmitting.value = false;
    }
  };

  // Edit / update actions
  const openEditRecord = (record: any) => {
    editRecord.value = { ...record };
    isEditModalOpen.value = true;
  };

  const applyEditStatus = async (newStatus: "present" | "late") => {
    if (!editRecord.value) return;
    isSubmitting.value = true;
    const rec = editRecord.value;

    try {
      // Find the existing DB record to get schedule ID
      const dbRecord = attendancesList.value.find((a) => a.id === rec.id);
      if (!dbRecord) {
        showToast("ไม่พบข้อมูลบันทึกเวลาเรียนในระบบ", "error");
        isSubmitting.value = false;
        return;
      }

      const prefectCode = prefectProfile.value.code || "unknown";
      const prefectName = prefectProfile.value.name || "";

      let lateMinutes = 0;
      if (newStatus === "late") {
        const schedule = schedulesList.value.find(
          (s) => s.id === dbRecord.schedule_id,
        );
        if (schedule && schedule.start_time) {
          const nowTime = new Date();
          const currentMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();
          const [sh, sm] = schedule.start_time.split(":").map(Number);
          const startMinutes = sh * 60 + sm;
          if (currentMinutes > startMinutes) {
            lateMinutes = currentMinutes - startMinutes;
          } else {
            const gateThreshold = 7 * 60 + 45; // 07:45
            if (currentMinutes > gateThreshold) {
              lateMinutes = currentMinutes - gateThreshold;
            } else {
              lateMinutes = 5;
            }
          }
        }
      }

      // 🟢 อัปเดต: ใช้ useCustomFetch
      const res: any = await useCustomFetch(
        `/classroom-attendences/${rec.id}`,
        {
          method: "PATCH",
          body: {
            student_id: dbRecord.student_id,
            schedule_id: dbRecord.schedule_id,
            date: dbRecord.date,
            status: newStatus,
            remark:
              newStatus === "late"
                ? `gate check-in updated by prefect: ${prefectName} (${prefectCode}) | late: ${lateMinutes} mins`
                : `gate check-in updated by prefect: ${prefectName} (${prefectCode})`,
          },
        },
      );

      if (res.data) {
        // 🟢 อัปเดต: ใช้ useCustomFetch
        const attendancesRes: any = await useCustomFetch(
          "/classroom-attendences",
        );
        attendancesList.value = attendancesRes.data || [];

        isEditModalOpen.value = false;
        editRecord.value = null;
        showToast(
          newStatus === "present"
            ? `✅ แก้ไขเป็น “ตรงเวลา” สำเร็จแล้ว`
            : `⚠️ แก้ไขเป็น “มาสาย” สำเร็จแล้ว`,
          newStatus === "present" ? "success" : "warning",
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast("ไม่สามารถแก้ไขสถานะได้", "error");
    } finally {
      isSubmitting.value = false;
    }
  };

  const deleteRecord = async () => {
    if (!editRecord.value) return;
    isSubmitting.value = true;
    const rec = editRecord.value;

    try {
      // 🟢 อัปเดต: ใช้ useCustomFetch
      await useCustomFetch(`/classroom-attendences/${rec.id}`, {
        method: "DELETE",
      });

      // 🟢 อัปเดต: ใช้ useCustomFetch
      const attendancesRes: any = await useCustomFetch(
        "/classroom-attendences",
      );
      attendancesList.value = attendancesRes.data || [];

      isEditModalOpen.value = false;
      editRecord.value = null;
      showToast(`❌ ยกเลิกการเช็คชื่อ ${rec.fullName} แล้ว`, "warning");
    } catch (err: any) {
      console.error(err);
      showToast("ไม่สามารถยกเลิกการเช็คชื่อได้", "error");
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    allStudents,
    checkedInIds,
    checkInHistory,
    presentCount,
    lateCount,
    totalCheckedCount,
    isFetching,
    isSubmitting,
    isConfirmOpen,
    confirmStudent,
    isEditModalOpen,
    editRecord,
    openConfirm,
    confirmCheckIn,
    openEditRecord,
    applyEditStatus,
    deleteRecord,
    fetchData,
  };
};
