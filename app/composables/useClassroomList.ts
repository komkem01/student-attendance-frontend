import { ref, computed } from "vue";

export const useClassroomList = (
  showToast: (
    msg: string,
    type?: "success" | "error" | "warning" | "info",
  ) => void,
) => {
  const session = useCookie<any>("teacher_session");
  const route = useRoute();

  // State Variables
  const classrooms = useState<any[]>("classrooms", () => []);
  const isFetching = ref(false);
  const isImporting = ref(false);

  // Lookups cache
  const prefixes = ref<any[]>([]);
  const genders = ref<any[]>([]);

  // Modal States
  const isAddClassModalOpen = ref(false);
  const newClassName = ref("");
  const newClassSubject = ref("");
  const newClassDate = ref("");
  const newClassStartTime = ref("08:15");
  const newClassEndTime = ref("09:10");

  // Date picker & time popovers
  const showDatePickerPopover = ref(false);
  const showStartTimePopover = ref(false);
  const showEndTimePopover = ref(false);

  // Edit Modal States
  const isEditClassModalOpen = ref(false);
  const editClassroomId = ref("");
  const editScheduleId = ref("");
  const editClassName = ref("");
  const editClassSubject = ref("");
  const editClassDate = ref("");
  const editClassStartTime = ref("08:15");
  const editClassEndTime = ref("09:10");

  // Edit Date picker & time popovers
  const showEditDatePickerPopover = ref(false);
  const showEditStartTimePopover = ref(false);
  const showEditEndTimePopover = ref(false);

  // Delete Modal States
  const isDeleteModalOpen = ref(false);
  const classToDelete = ref<any>(null);

  // Calendar State
  const currentCalendarYear = ref(new Date().getFullYear());
  const currentCalendarMonth = ref(new Date().getMonth());
  const thaiMonthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  // Filters and search state
  const classSearchQuery = ref("");
  const classFilterStatus = ref<"all" | "completed" | "pending">("all");

  // Import student modal states
  const isImportModalOpen = ref(false);
  const importSelectedClassId = ref<string | null>(null);
  const showClassSelectPopover = ref(false);
  const importFileName = ref("");
  const importStudentsFile = ref<any[] | null>(null);
  const isImportLoading = ref(false);

  // Calendar Day generator
  const calendarDays = computed(() => {
    const year = currentCalendarYear.value;
    const month = currentCalendarMonth.value;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev Month Padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }

    // Current Month Days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
      });
    }

    // Next Month Padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }

    return days;
  });

  const nextMonth = () => {
    if (currentCalendarMonth.value === 11) {
      currentCalendarMonth.value = 0;
      currentCalendarYear.value++;
    } else {
      currentCalendarMonth.value++;
    }
  };

  const prevMonth = () => {
    if (currentCalendarMonth.value === 0) {
      currentCalendarMonth.value = 11;
      currentCalendarYear.value--;
    } else {
      currentCalendarMonth.value--;
    }
  };

  const selectDateFromCalendar = (dayObj: {
    day: number;
    month: number;
    year: number;
  }) => {
    const yyyy = dayObj.year;
    const mm = String(dayObj.month + 1).padStart(2, "0");
    const dd = String(dayObj.day).padStart(2, "0");
    newClassDate.value = `${yyyy}-${mm}-${dd}`;
    showDatePickerPopover.value = false;
  };

  const newClassDateFormattedText = computed(() => {
    if (!newClassDate.value) return "เลือกวันที่เรียน";
    const date = new Date(newClassDate.value);
    const day = date.getDate();
    const month = thaiMonthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  });

  // Time dials helpers
  const incrementStartHour = () => {
    const parts = newClassStartTime.value.split(":");
    let val = (parseInt(parts[0]) + 1) % 24;
    newClassStartTime.value = `${String(val).padStart(2, "0")}:${parts[1]}`;
  };
  const decrementStartHour = () => {
    const parts = newClassStartTime.value.split(":");
    let val = (parseInt(parts[0]) - 1 + 24) % 24;
    newClassStartTime.value = `${String(val).padStart(2, "0")}:${parts[1]}`;
  };
  const incrementStartMinute = () => {
    const parts = newClassStartTime.value.split(":");
    let val = (parseInt(parts[1]) + 5) % 60;
    newClassStartTime.value = `${parts[0]}:${String(val).padStart(2, "0")}`;
  };
  const decrementStartMinute = () => {
    const parts = newClassStartTime.value.split(":");
    let val = (parseInt(parts[1]) - 5 + 60) % 60;
    newClassStartTime.value = `${parts[0]}:${String(val).padStart(2, "0")}`;
  };

  const incrementEndHour = () => {
    const parts = newClassEndTime.value.split(":");
    let val = (parseInt(parts[0]) + 1) % 24;
    newClassEndTime.value = `${String(val).padStart(2, "0")}:${parts[1]}`;
  };
  const decrementEndHour = () => {
    const parts = newClassEndTime.value.split(":");
    let val = (parseInt(parts[0]) - 1 + 24) % 24;
    newClassEndTime.value = `${String(val).padStart(2, "0")}:${parts[1]}`;
  };
  const incrementEndMinute = () => {
    const parts = newClassEndTime.value.split(":");
    let val = (parseInt(parts[1]) + 5) % 60;
    newClassEndTime.value = `${parts[0]}:${String(val).padStart(2, "0")}`;
  };
  const decrementEndMinute = () => {
    const parts = newClassEndTime.value.split(":");
    let val = (parseInt(parts[1]) - 5 + 60) % 60;
    newClassEndTime.value = `${parts[0]}:${String(val).padStart(2, "0")}`;
  };

  // Formatting helper
  const formatThaiDateShort = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    const month = months[date.getMonth()];
    const thaiYear = (date.getFullYear() + 543).toString().slice(-2);
    return `${day} ${month} ${thaiYear}`;
  };

  const getFormattedDateTime = (
    dateStr: string,
    startTime: string,
    endTime: string,
  ) => {
    const datePart = formatThaiDateShort(dateStr);
    return `${datePart} • ${startTime} - ${endTime} น.`;
  };

  // Load prefix and gender lookup caches
  const loadLookups = async () => {
    try {
      // 🟢 อัปเดต useCustomFetch
      const prefixRes: any = await useCustomFetch("/system/prefix");
      if (prefixRes.data) {
        prefixes.value = prefixRes.data;
      }
      // 🟢 อัปเดต useCustomFetch
      const genderRes: any = await useCustomFetch("/system/gender");
      if (genderRes.data) {
        genders.value = genderRes.data;
      }
    } catch (err) {
      console.error("Failed to load lookups:", err);
    }
  };

  // Fetch classrooms list from backend
  const fetchClassroomsData = async () => {
    if (!session.value || !session.value.teacher_id) return;
    isFetching.value = true;
    try {
      await loadLookups();

      // Fetch classrooms, class schedules, students, mappings, and attendance
      // 🟢 อัปเดต useCustomFetch ทั้งหมด
      const [
        classroomsRes,
        schedulesRes,
        studentClassroomsRes,
        studentsRes,
        attendancesRes,
      ]: any = await Promise.all([
        useCustomFetch("/classrooms"),
        useCustomFetch("/class-schedules"),
        useCustomFetch("/student-classrooms"),
        useCustomFetch("/students"),
        useCustomFetch("/classroom-attendences"),
      ]);

      const rawClassrooms = classroomsRes.data || [];
      const rawSchedules = schedulesRes.data || [];
      const rawStudentClassrooms = studentClassroomsRes.data || [];
      const rawStudents = studentsRes.data || [];
      const rawAttendances = attendancesRes.data || [];

      // Filter classrooms by this teacher
      const teacherClassrooms = rawClassrooms.filter(
        (c: any) => c.teacher_id === session.value.teacher_id,
      );

      const formatted = teacherClassrooms.map((cls: any) => {
        // Enrolled student mappings
        const matchedStudentClassrooms = rawStudentClassrooms.filter(
          (sc: any) => sc.classroom_id === cls.id,
        );
        const enrolledStudents = matchedStudentClassrooms
          .map((sc: any) => {
            const studentInfo = rawStudents.find(
              (s: any) => s.id === sc.student_id,
            );
            if (!studentInfo) return null;

            // Find prefix string
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

            // Find today's attendance record
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
            };
          })
          .filter(Boolean);

        // Sort by student number ascending
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
        let status: "completed" | "pending" = "pending";

        if (activeSchedule) {
          const formattedDate = formatThaiDateShort(activeSchedule.date);
          const start = (activeSchedule.start_time || "").slice(0, 5);
          const end = (activeSchedule.end_time || "").slice(0, 5);
          timeText = `${formattedDate} • ${start} - ${end} น.`;

          // Find attendance check status for this schedule
          const scheduleAttendances = rawAttendances.filter(
            (a: any) => a.schedule_id === activeSchedule.id,
          );
          if (scheduleAttendances.length > 0 && enrolledStudents.length > 0) {
            // Check if all enrolled students have a status recorded
            const allChecked = enrolledStudents.every((student: any) => {
              const record = scheduleAttendances.find(
                (a: any) => a.student_id === student.id,
              );
              return record && record.status !== "";
            });
            if (allChecked) {
              status = "completed";
              const latestUpdate = scheduleAttendances.reduce(
                (latest: string, current: any) => {
                  return !latest ||
                    new Date(current.updated_at).getTime() >
                      new Date(latest).getTime()
                    ? current.updated_at
                    : latest;
                },
                "",
              );
              if (latestUpdate) {
                const dateObj = new Date(latestUpdate);
                const hours = dateObj.getHours().toString().padStart(2, "0");
                const mins = dateObj.getMinutes().toString().padStart(2, "0");
                checkedTimeText = `เช็คชื่อเมื่อ ${hours}:${mins} น.`;
              } else {
                checkedTimeText = "เช็คชื่อเสร็จสิ้น";
              }
            } else {
              checkedTimeText = "ยังเช็คชื่อไม่ครบ";
            }
          }
        }

        return {
          id: cls.id,
          name: cls.class,
          subject: cls.subject,
          studentsCount: enrolledStudents.length,
          status,
          time: timeText,
          checkedTime: checkedTimeText,
          students: enrolledStudents,
          scheduleId: activeSchedule?.id || "",
          rawDate: activeSchedule?.date || "",
          rawStartTime: (activeSchedule?.start_time || "").slice(0, 5),
          rawEndTime: (activeSchedule?.end_time || "").slice(0, 5),
        };
      });

      classrooms.value = formatted;
    } catch (err) {
      console.error(err);
      showToast("ไม่สามารถดึงข้อมูลห้องเรียนได้", "error");
    } finally {
      isFetching.value = false;
    }
  };

  const openAddClassModal = () => {
    newClassName.value = "";
    newClassSubject.value = "";
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    newClassDate.value = `${yyyy}-${mm}-${dd}`;
    newClassStartTime.value = "08:15";
    newClassEndTime.value = "09:10";
    showDatePickerPopover.value = false;
    showStartTimePopover.value = false;
    showEndTimePopover.value = false;
    isAddClassModalOpen.value = true;
  };

  // Create classroom on backend
  const createClassroom = async () => {
    if (
      !newClassName.value ||
      !newClassSubject.value ||
      !newClassDate.value ||
      !newClassStartTime.value ||
      !newClassEndTime.value
    ) {
      showToast("กรุณากรอกข้อมูลห้องเรียนให้ครบถ้วน", "warning");
      return;
    }

    isImporting.value = true;
    try {
      // 1. Create Classroom record
      // 🟢 อัปเดต useCustomFetch
      const classRes: any = await useCustomFetch("/classrooms", {
        method: "POST",
        body: {
          teacher_id: session.value.teacher_id,
          class: newClassName.value.trim(),
          subject: newClassSubject.value.trim(),
        },
      });

      if (classRes.data && classRes.data.id) {
        const classroomId = classRes.data.id;

        // 2. Create Class Schedule record
        // 🟢 อัปเดต useCustomFetch
        await useCustomFetch("/class-schedules", {
          method: "POST",
          body: {
            classroom_id: classroomId,
            teacher_id: session.value.teacher_id,
            date: newClassDate.value,
            start_time: newClassStartTime.value,
            end_time: newClassEndTime.value,
          },
        });

        showToast("สร้างห้องเรียนสำเร็จ!", "success");
        isAddClassModalOpen.value = false;
        await fetchClassroomsData();
      } else {
        showToast("เกิดข้อผิดพลาดในการสร้างห้องเรียน", "error");
      }
    } catch (err: any) {
      const msg = err.data?.message || "ไม่สามารถสร้างห้องเรียนในฐานข้อมูลได้";
      showToast(msg, "error");
    } finally {
      isImporting.value = false;
    }
  };

  // Edit Classroom actions
  const openEditClassModal = (cls: any) => {
    editClassroomId.value = cls.id;
    editScheduleId.value = cls.scheduleId || "";
    editClassName.value = cls.name;
    editClassSubject.value = cls.subject;
    editClassDate.value = cls.rawDate || "";
    editClassStartTime.value = cls.rawStartTime || "08:15";
    editClassEndTime.value = cls.rawEndTime || "09:10";

    showEditDatePickerPopover.value = false;
    showEditStartTimePopover.value = false;
    showEditEndTimePopover.value = false;
    isEditClassModalOpen.value = true;
  };

  const selectDateFromCalendarEdit = (dayObj: {
    day: number;
    month: number;
    year: number;
  }) => {
    const yyyy = dayObj.year;
    const mm = String(dayObj.month + 1).padStart(2, "0");
    const dd = String(dayObj.day).padStart(2, "0");
    editClassDate.value = `${yyyy}-${mm}-${dd}`;
    showEditDatePickerPopover.value = false;
  };

  const editClassDateFormattedText = computed(() => {
    if (!editClassDate.value) return "เลือกวันที่เรียน";
    const date = new Date(editClassDate.value);
    const day = date.getDate();
    const month = thaiMonthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  });

  // Edit time dials helpers
  const incrementEditStartHour = () => {
    const parts = editClassStartTime.value.split(":");
    let val = (parseInt(parts[0]) + 1) % 24;
    editClassStartTime.value = `${String(val).padStart(2, "0")}:${parts[1]}`;
  };
  const decrementEditStartHour = () => {
    const parts = editClassStartTime.value.split(":");
    let val = (parseInt(parts[0]) - 1 + 24) % 24;
    editClassStartTime.value = `${String(val).padStart(2, "0")}:${parts[1]}`;
  };
  const incrementEditStartMinute = () => {
    const parts = editClassStartTime.value.split(":");
    let val = (parseInt(parts[1]) + 5) % 60;
    editClassStartTime.value = `${parts[0]}:${String(val).padStart(2, "0")}`;
  };
  const decrementEditStartMinute = () => {
    const parts = editClassStartTime.value.split(":");
    let val = (parseInt(parts[1]) - 5 + 60) % 60;
    editClassStartTime.value = `${parts[0]}:${String(val).padStart(2, "0")}`;
  };

  const incrementEditEndHour = () => {
    const parts = editClassEndTime.value.split(":");
    let val = (parseInt(parts[0]) + 1) % 24;
    editClassEndTime.value = `${String(val).padStart(2, "0")}:${parts[1]}`;
  };
  const decrementEditEndHour = () => {
    const parts = editClassEndTime.value.split(":");
    let val = (parseInt(parts[0]) - 1 + 24) % 24;
    editClassEndTime.value = `${String(val).padStart(2, "0")}:${parts[1]}`;
  };
  const incrementEditEndMinute = () => {
    const parts = editClassEndTime.value.split(":");
    let val = (parseInt(parts[1]) + 5) % 60;
    editClassEndTime.value = `${parts[0]}:${String(val).padStart(2, "0")}`;
  };
  const decrementEditEndMinute = () => {
    const parts = editClassEndTime.value.split(":");
    let val = (parseInt(parts[1]) - 5 + 60) % 60;
    editClassEndTime.value = `${parts[0]}:${String(val).padStart(2, "0")}`;
  };

  const updateClassroom = async () => {
    if (
      !editClassName.value ||
      !editClassSubject.value ||
      !editClassDate.value ||
      !editClassStartTime.value ||
      !editClassEndTime.value
    ) {
      showToast("กรุณากรอกข้อมูลห้องเรียนให้ครบถ้วน", "warning");
      return;
    }

    isImporting.value = true;
    try {
      // 1. Update Classroom
      // 🟢 อัปเดต useCustomFetch
      await useCustomFetch(`/classrooms/${editClassroomId.value}`, {
        method: "PATCH",
        body: {
          teacher_id: session.value.teacher_id,
          class: editClassName.value.trim(),
          subject: editClassSubject.value.trim(),
        },
      });

      // 2. Update or Create Schedule
      if (editScheduleId.value) {
        // 🟢 อัปเดต useCustomFetch
        await useCustomFetch(`/class-schedules/${editScheduleId.value}`, {
          method: "PATCH",
          body: {
            classroom_id: editClassroomId.value,
            teacher_id: session.value.teacher_id,
            date: editClassDate.value,
            start_time: editClassStartTime.value,
            end_time: editClassEndTime.value,
          },
        });
      } else {
        // 🟢 อัปเดต useCustomFetch
        await useCustomFetch("/class-schedules", {
          method: "POST",
          body: {
            classroom_id: editClassroomId.value,
            teacher_id: session.value.teacher_id,
            date: editClassDate.value,
            start_time: editClassStartTime.value,
            end_time: editClassEndTime.value,
          },
        });
      }

      showToast("แก้ไขข้อมูลห้องเรียนสำเร็จ!", "success");
      isEditClassModalOpen.value = false;
      await fetchClassroomsData();
    } catch (err: any) {
      const msg = err.data?.message || "ไม่สามารถแก้ไขข้อมูลห้องเรียนได้";
      showToast(msg, "error");
    } finally {
      isImporting.value = false;
    }
  };

  // Delete Classroom actions
  const openDeleteClassModal = (cls: any) => {
    if (cls.studentsCount > 0 || (cls.students && cls.students.length > 0)) {
      showToast("ไม่สามารถลบห้องเรียนที่มีรายชื่อนักเรียนอยู่ได้", "warning");
      return;
    }
    classToDelete.value = cls;
    isDeleteModalOpen.value = true;
  };

  const confirmDeleteClassroom = async () => {
    if (!classToDelete.value) return;
    if (
      classToDelete.value.studentsCount > 0 ||
      (classToDelete.value.students && classToDelete.value.students.length > 0)
    ) {
      showToast("ไม่สามารถลบห้องเรียนที่มีรายชื่อนักเรียนอยู่ได้", "warning");
      return;
    }
    isImporting.value = true;
    try {
      // 🟢 อัปเดต useCustomFetch
      await useCustomFetch(`/classrooms/${classToDelete.value.id}`, {
        method: "DELETE",
      });
      showToast("ลบห้องเรียนสำเร็จ!", "success");
      isDeleteModalOpen.value = false;
      classToDelete.value = null;
      await fetchClassroomsData();
    } catch (err: any) {
      const msg = err.data?.message || "ไม่สามารถลบห้องเรียนได้";
      showToast(msg, "error");
    } finally {
      isImporting.value = false;
    }
  };

  // Import Modal Handlers
  const openImportModal = () => {
    importSelectedClassId.value =
      classrooms.value.length > 0 ? classrooms.value[0].id : null;
    showClassSelectPopover.value = false;
    importFileName.value = "";
    importStudentsFile.value = null;
    isImportModalOpen.value = true;
  };

  const importSelectedClassroom = computed(() => {
    return classrooms.value.find((c) => c.id === importSelectedClassId.value);
  });

  const simulateImportFile = () => {
    importFileName.value = "รายชื่อนักเรียน_ม.2_4.xlsx";
    importStudentsFile.value = [
      { no: 1, prefix: "ด.ช.", firstName: "เกรียงไกร", lastName: "รักสงบ" },
      { no: 2, prefix: "ด.ช.", firstName: "จตุรภัทร", lastName: "ทองดี" },
      { no: 3, prefix: "ด.ช.", firstName: "ณพรรษ", lastName: "แก้วสว่าง" },
      { no: 4, prefix: "ด.ช.", firstName: "ทัตเทพ", lastName: "บุญมี" },
      { no: 5, prefix: "ด.ญ.", firstName: "กานต์พิชชา", lastName: "เจริญกรุง" },
      { no: 6, prefix: "ด.ญ.", firstName: "ชนันชิดา", lastName: "เดชดำรง" },
      { no: 7, prefix: "ด.ญ.", firstName: "ณิชารีย์", lastName: "อินทร์แก้ว" },
      { no: 8, prefix: "ด.ญ.", firstName: "ปpapit", lastName: "พึ่งพิง" }, // mapping standard prefix
      { no: 9, prefix: "ด.ญ.", firstName: "มนัสนันท์", lastName: "บุญรักษา" },
      { no: 10, prefix: "ด.ญ.", firstName: "วรัญญา", lastName: "รักษ์ไทย" },
    ];
    showToast("นำเข้ารายชื่อนักเรียน 10 คน สำเร็จ!", "success");
  };

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    importFileName.value = file.name;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const { read, utils } = await import("xlsx");
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawRows: any[] = utils.sheet_to_json(worksheet, { header: 1 });

        if (rawRows.length < 2) {
          showToast("ไม่พบข้อมูลนักเรียนในไฟล์ หรือไฟล์ไม่มีข้อมูล", "error");
          importFileName.value = "";
          return;
        }

        const headers = rawRows[0].map((h: any) =>
          String(h || "")
            .trim()
            .toLowerCase(),
        );

        const noIdx = headers.findIndex(
          (h: string) =>
            h.includes("เลขที่") || h.includes("no") || h.includes("ลำดับ"),
        );
        const prefixIdx = headers.findIndex(
          (h: string) => h.includes("คำนำหน้า") || h.includes("prefix"),
        );
        const firstNameIdx = headers.findIndex(
          (h: string) =>
            h.includes("ชื่อจริง") ||
            h.includes("ชื่อ") ||
            h.includes("name") ||
            h.includes("firstname"),
        );
        const lastNameIdx = headers.findIndex(
          (h: string) =>
            h.includes("นามสกุล") ||
            h.includes("lastname") ||
            h.includes("สกุล"),
        );

        if (firstNameIdx === -1 || lastNameIdx === -1) {
          showToast(
            "โครงสร้างไฟล์ไม่ถูกต้อง กรุณาตรวจสอบว่ามีคอลัมน์ ชื่อ และ นามสกุล",
            "error",
          );
          importFileName.value = "";
          return;
        }

        const studentsList: any[] = [];
        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;

          let firstName = String(row[firstNameIdx] || "").trim();
          const lastName = String(row[lastNameIdx] || "").trim();

          if (!firstName || !lastName) continue;

          const noVal = noIdx !== -1 ? parseInt(row[noIdx]) : i;
          let prefixVal =
            prefixIdx !== -1 ? String(row[prefixIdx] || "").trim() : "";

          const prefixesToTest = [
            {
              key: "เด็กชาย",
              short: "ด.ช.",
              patterns: ["เด็กชาย", "ด.ช.", "ด.ช"],
            },
            {
              key: "เด็กหญิง",
              short: "ด.ญ.",
              patterns: ["เด็กหญิง", "ด.ญ.", "ด.ญ"],
            },
            {
              key: "นางสาว",
              short: "น.ส.",
              patterns: ["นางสาว", "น.ส.", "น.ส"],
            },
            { key: "นาย", short: "นาย", patterns: ["นาย"] },
            { key: "นาง", short: "นาง", patterns: ["นาง"] },
            { key: "คุณ", short: "คุณ", patterns: ["คุณ"] },
          ];

          // 1. Check if prefix is prepended in firstName
          for (const item of prefixesToTest) {
            let matchedPattern = "";
            for (const pat of item.patterns) {
              if (firstName.startsWith(pat)) {
                matchedPattern = pat;
                if (!prefixVal) {
                  prefixVal = item.short;
                }
                break;
              }
            }
            if (matchedPattern) {
              firstName = firstName.substring(matchedPattern.length).trim();
              if (
                firstName.startsWith(".") ||
                firstName.startsWith("-") ||
                firstName.startsWith(" ")
              ) {
                firstName = firstName.substring(1).trim();
              }
              break;
            }
          }

          // 2. Normalize prefixVal if it was from a column
          if (prefixVal) {
            const cleanPref = prefixVal.replace(/\./g, "").trim();
            if (cleanPref === "ดช" || cleanPref === "เด็กชาย")
              prefixVal = "ด.ช.";
            else if (cleanPref === "ดญ" || cleanPref === "เด็กหญิง")
              prefixVal = "ด.ญ.";
            else if (cleanPref === "นส" || cleanPref === "นางสาว")
              prefixVal = "น.ส.";
            else if (cleanPref === "นาย") prefixVal = "นาย";
            else if (cleanPref === "นาง") prefixVal = "นาง";
            else if (cleanPref === "คุณ") prefixVal = "คุณ";
          } else {
            // Default prefix fallback
            prefixVal = "ด.ช.";
          }

          studentsList.push({
            no: isNaN(noVal) ? i : noVal,
            prefix: prefixVal,
            firstName,
            lastName,
          });
        }

        if (studentsList.length === 0) {
          showToast("ไม่พบข้อมูลรายชื่อนักเรียนในไฟล์", "warning");
          importFileName.value = "";
          return;
        }

        importStudentsFile.value = studentsList;
        showToast(
          `วิเคราะห์ไฟล์รายชื่อนักเรียนสำเร็จ: พบข้อมูล ${studentsList.length} คน`,
          "success",
        );
      } catch (err) {
        console.error(err);
        showToast("เกิดข้อผิดพลาดในการอ่านไฟล์ Excel", "error");
        importFileName.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = async () => {
    const { utils, write } = await import("xlsx");
    const headers = ["เลขที่", "คำนำหน้า", "ชื่อ", "นามสกุล"];
    const data = [
      headers,
      [1, "ด.ช.", "สมชาย", "ใจดี"],
      [2, "ด.ญ.", "สมศรี", "รักสนุก"],
    ];
    const worksheet = utils.aoa_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "รายชื่อนักเรียน");

    const wopts: any = { bookType: "xlsx", bookSST: false, type: "binary" };
    const wbout = write(workbook, wopts);

    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };

    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "รูปแบบไฟล์รายชื่อนักเรียน.xlsx";
    a.click();
    URL.revokeObjectURL(url);
    showToast("ดาวน์โหลดรูปแบบไฟล์ Excel สำเร็จ!", "success");
  };

  const removeImportFile = () => {
    importFileName.value = "";
    importStudentsFile.value = null;
    showToast("ลบไฟล์รายชื่อเรียบร้อยแล้ว", "info");
  };

  // Execute student import, create records and links
  const executeImport = async () => {
    if (!importSelectedClassId.value) {
      showToast("กรุณาเลือกห้องเรียนที่ต้องการนำเข้า", "warning");
      return;
    }
    if (!importStudentsFile.value || importStudentsFile.value.length === 0) {
      showToast("กรุณานำเข้าไฟล์รายชื่อนักเรียนก่อนบันทึก", "warning");
      return;
    }

    isImportLoading.value = true;
    try {
      await loadLookups();

      // Map genders name lookup for default mapping
      const maleGender = genders.value.find(
        (g) => g.name === "ชาย" || g.name.toLowerCase().includes("male"),
      );
      const femaleGender = genders.value.find(
        (g) => g.name === "หญิง" || g.name.toLowerCase().includes("female"),
      );
      const defaultGenderId = maleGender?.id || genders.value[0]?.id;

      const targetClassroom = classrooms.value.find(
        (c) => c.id === importSelectedClassId.value,
      );
      const existingStudents = targetClassroom?.students || [];

      let importCount = 0;
      let skipCount = 0;

      for (const st of importStudentsFile.value) {
        // Check if student already exists in this classroom
        const isDuplicate = existingStudents.some(
          (s: any) =>
            s.firstName.trim().toLowerCase() ===
              st.firstName.trim().toLowerCase() &&
            s.lastName.trim().toLowerCase() ===
              st.lastName.trim().toLowerCase(),
        );

        if (isDuplicate) {
          skipCount++;
          continue;
        }

        // Resolve prefix using robust mapping logic
        const prefixClean = String(st.prefix || "")
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

        let genderId = defaultGenderId;
        if (matchedPrefix) {
          genderId = matchedPrefix.gender_id;
        } else if (
          prefixClean.includes("ญ") ||
          prefixClean.includes("หญิง") ||
          prefixClean.includes("นาง") ||
          prefixClean.includes("นางสาว")
        ) {
          genderId = femaleGender?.id || defaultGenderId;
        }

        // Generate unique code or let backend auto-generate
        const studentNoStr = st.no.toString();
        const randomCode = `ST-${Math.floor(100000 + Math.random() * 900000)}`;

        // 1. Create Student
        // 🟢 อัปเดต useCustomFetch
        const studentRes: any = await useCustomFetch("/students", {
          method: "POST",
          body: {
            gender_id: genderId,
            prefix_id: prefixId,
            firstname: st.firstName.trim(),
            lastname: st.lastName.trim(),
            student_no: studentNoStr,
            code: randomCode,
          },
        });

        if (studentRes.data && studentRes.data.id) {
          const studentId = studentRes.data.id;

          // 2. Link Student to Classroom
          // 🟢 อัปเดต useCustomFetch
          await useCustomFetch("/student-classrooms", {
            method: "POST",
            body: {
              student_id: studentId,
              classroom_id: importSelectedClassId.value,
            },
          });
        }
        importCount++;
      }

      if (skipCount > 0) {
        showToast(
          `นำเข้ารายชื่อสำเร็จ: นำเข้าใหม่ ${importCount} คน, ข้าม ${skipCount} คน (มีรายชื่ออยู่แล้ว)`,
          "success",
        );
      } else {
        showToast(
          `นำเข้ารายชื่อนักเรียนเข้าสู่ห้องสำเร็จเรียบร้อย ${importCount} คน!`,
          "success",
        );
      }
      isImportModalOpen.value = false;
      await fetchClassroomsData();
    } catch (err: any) {
      console.error(err);
      const msg =
        err.data?.message || "เกิดข้อผิดพลาดในการนำเข้ารายชื่อนักเรียน";
      showToast(msg, "error");
    } finally {
      isImportLoading.value = false;
    }
  };

  // Filters computed lists
  const computedClassrooms = computed(() => {
    return classrooms.value.map((cls) => {
      const studentsCount = cls.students.length;
      const checkedCount = cls.students.filter(
        (s: any) => s.status !== "",
      ).length;
      const presentCount = cls.students.filter(
        (s: any) => s.status === "present",
      ).length;
      const attendanceRate =
        checkedCount > 0
          ? Math.round((presentCount / checkedCount) * 1000) / 10
          : 0;
      return {
        ...cls,
        studentsCount,
        checkedCount,
        attendanceRate,
      };
    });
  });

  const filteredClassrooms = computed(() => {
    return computedClassrooms.value.filter((cls) => {
      const matchesSearch =
        cls.name.toLowerCase().includes(classSearchQuery.value.toLowerCase()) ||
        cls.subject
          .toLowerCase()
          .includes(classSearchQuery.value.toLowerCase());

      const matchesStatus =
        classFilterStatus.value === "all" ||
        (classFilterStatus.value === "completed" &&
          cls.status === "completed") ||
        (classFilterStatus.value === "pending" && cls.status === "pending");

      return matchesSearch && matchesStatus;
    });
  });

  const totalClassesCount = computed(() => classrooms.value.length);
  const completedClassesCount = computed(
    () => classrooms.value.filter((c) => c.status === "completed").length,
  );
  const pendingClassesCount = computed(
    () => classrooms.value.filter((c) => c.status === "pending").length,
  );
  const averageAttendanceRate = computed(() => {
    const completed = computedClassrooms.value.filter(
      (c) => c.status === "completed",
    );
    if (completed.length === 0) return "0%";
    const totalRate = completed.reduce((sum, c) => sum + c.attendanceRate, 0);
    return `${(totalRate / completed.length).toFixed(1)}%`;
  });

  return {
    classrooms,
    isFetching,
    isImporting,
    fetchClassroomsData,

    // Modal adding states
    isAddClassModalOpen,
    newClassName,
    newClassSubject,
    newClassDate,
    newClassStartTime,
    newClassEndTime,
    openAddClassModal,
    createClassroom,

    // Popovers
    showDatePickerPopover,
    showStartTimePopover,
    showEndTimePopover,

    // Calendar
    currentCalendarYear,
    currentCalendarMonth,
    calendarDays,
    nextMonth,
    prevMonth,
    selectDateFromCalendar,
    newClassDateFormattedText,

    // Time increments
    incrementStartHour,
    decrementStartHour,
    incrementStartMinute,
    decrementStartMinute,
    incrementEndHour,
    decrementEndHour,
    incrementEndMinute,
    decrementEndMinute,

    // Filters
    classSearchQuery,
    classFilterStatus,
    filteredClassrooms,
    totalClassesCount,
    completedClassesCount,
    pendingClassesCount,
    averageAttendanceRate,

    // Imports
    isImportModalOpen,
    importSelectedClassId,
    showClassSelectPopover,
    importFileName,
    importStudentsFile,
    isImportLoading,
    openImportModal,
    importSelectedClassroom,
    simulateImportFile,
    handleFileUpload,
    downloadTemplate,
    removeImportFile,
    executeImport,

    // Editing states & actions
    isEditClassModalOpen,
    editClassroomId,
    editScheduleId,
    editClassName,
    editClassSubject,
    editClassDate,
    editClassStartTime,
    editClassEndTime,
    showEditDatePickerPopover,
    showEditStartTimePopover,
    showEditEndTimePopover,
    openEditClassModal,
    selectDateFromCalendarEdit,
    editClassDateFormattedText,
    incrementEditStartHour,
    decrementEditStartHour,
    incrementEditStartMinute,
    decrementEditStartMinute,
    incrementEditEndHour,
    decrementEditEndHour,
    incrementEditEndMinute,
    decrementEditEndMinute,
    updateClassroom,

    // Deleting states & actions
    isDeleteModalOpen,
    classToDelete,
    openDeleteClassModal,
    confirmDeleteClassroom,
  };
};
