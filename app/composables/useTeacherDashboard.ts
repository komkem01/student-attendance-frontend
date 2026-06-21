import { ref, computed, onMounted } from "vue";

export const useTeacherDashboard = () => {
  const { session, teacherProfile, logout } = useTeacherSession();

  // State Variables
  const classrooms = ref<any[]>([]);
  const exceptions = ref<any[]>([]);
  const isFetching = ref(false);

  // Lookups cache
  const prefixes = ref<any[]>([]);

  // SweetAlert-style Toast Notifications State
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

  // Load prefix lookups
  const loadLookups = async () => {
    if (prefixes.value.length > 0) return;
    try {
      // 🟢 แก้ไข: ใช้ useCustomFetch
      const res: any = await useCustomFetch("/system/prefix");
      prefixes.value = res.data || [];
    } catch (err) {
      console.error("Failed to load prefixes:", err);
    }
  };

  // Fetch dashboard data from backend and calculate statistics
  const fetchDashboardData = async () => {
    if (!session.value || !session.value.teacher_id) return;
    isFetching.value = true;
    try {
      await loadLookups();

      // Fetch classrooms, class schedules, students, mappings, and attendance
      // 🟢 แก้ไข: ใช้ useCustomFetch ทั้งหมด
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

      const todayStr = new Date().toISOString().split("T")[0];

      // Format classrooms list
      const formattedClassrooms = teacherClassrooms.map((cls: any) => {
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

            // Prefix name mapping
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

        // Sort by student number
        enrolledStudents.sort((a: any, b: any) => a.no - b.no);

        // Find schedule for today or the most recent schedule
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

        // Format date and time
        let timeText = "08:15 - 09:10 น.";
        let checkedTimeText = "ยังไม่ได้เช็คชื่อ";
        let status: "completed" | "pending" = "pending";
        let attendanceRate = 0;

        if (activeSchedule) {
          const start = (activeSchedule.start_time || "").slice(0, 5);
          const end = (activeSchedule.end_time || "").slice(0, 5);
          timeText = `${start} - ${end} น.`;

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

            // Calculate attendance rate for this schedule
            const presentOrLate = scheduleAttendances.filter(
              (a: any) => a.status === "present" || a.status === "late",
            ).length;
            attendanceRate = Math.round(
              (presentOrLate / enrolledStudents.length) * 100,
            );

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
          checkedCount:
            status === "completed"
              ? enrolledStudents.length
              : enrolledStudents.filter((s: any) => s.status !== "").length,
          status,
          attendanceRate,
          time: timeText,
          checkedTime: checkedTimeText,
          students: enrolledStudents,
          scheduleId: activeSchedule?.id || "",
          rawDate: activeSchedule?.date || "",
        };
      });

      classrooms.value = formattedClassrooms;

      // Compile live exceptions (lates, leaves, absents today)
      const todayExceptions: any[] = [];
      formattedClassrooms.forEach((room: any) => {
        // Only collect exceptions from active schedules today
        if (room.rawDate === todayStr) {
          room.students.forEach((std: any) => {
            if (
              std.status === "absent" ||
              std.status === "leave" ||
              std.status === "late"
            ) {
              let statusText = "ขาดเรียน";
              let badgeClass = "bg-rose-50 border-rose-100 text-rose-600";
              if (std.status === "leave") {
                const reason =
                  std.details === "sick"
                    ? "ลาป่วย"
                    : std.details === "business"
                      ? "ลากิจ"
                      : std.details;
                statusText = reason ? `ลา (${reason})` : "ลา";
                badgeClass = "bg-amber-50 border-amber-100 text-amber-600";
              } else if (std.status === "late") {
                if (
                  std.details &&
                  (std.details.includes("gate check-in by prefect:") ||
                    std.details.includes("gate check-in updated by prefect:"))
                ) {
                  const matchName = std.details.match(/prefect:\s*([^|]*)/);
                  const matchMins = std.details.match(/late:\s*(\d+)\s*mins/);
                  const name = matchName
                    ? matchName[1].trim()
                    : "สารวัตรนักเรียน";
                  const minsText = matchMins ? `${matchMins[1]} นาที ` : "";
                  statusText = `มาสาย ${minsText}(สารวัตร: ${name})`;
                } else {
                  statusText = std.details
                    ? `มาสาย (${std.details} นาที)`
                    : "มาสาย";
                }
                badgeClass = "bg-sky-50 border-sky-100 text-sky-600";
              }

              todayExceptions.push({
                id: std.id,
                name: `${std.prefix}${std.firstName} ${std.lastName}`,
                room: room.name.replace("ชั้นมัธยมศึกษาปีที่ ", "ม."),
                status: std.status,
                statusText,
                badgeClass,
                time: room.time.split(" - ")[0] + " น.",
              });
            }
          });
        }
      });

      exceptions.value = todayExceptions;
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      showToast("เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด", "error");
    } finally {
      isFetching.value = false;
    }
  };

  // Derived dynamic statistics from fetched classrooms
  const stats = computed(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    // Filter rooms that have class scheduled today
    const todayRooms = classrooms.value.filter(
      (r: any) => r.rawDate === todayStr,
    );

    let totalStudentsToday = 0;
    let totalCheckedToday = 0;
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let checkedRoomsCount = 0;

    todayRooms.forEach((room: any) => {
      totalStudentsToday += room.studentsCount;
      if (room.status === "completed") {
        checkedRoomsCount++;
      }

      room.students.forEach((std: any) => {
        if (std.status !== "") {
          totalCheckedToday++;
          if (std.status === "present") totalPresent++;
          else if (std.status === "late") totalLate++;
          else if (std.status === "absent") totalAbsent++;
          else if (std.status === "leave") totalLeave++;
        }
      });
    });

    // 1. Average Attendance Rate
    const avgAttendanceRateVal =
      totalCheckedToday > 0
        ? Math.round(((totalPresent + totalLate) / totalCheckedToday) * 1000) /
          10
        : 100.0; // default to 100% if no students checked yet

    // 2. Absentees description
    const absenteesByRoom: string[] = [];
    todayRooms.forEach((room: any) => {
      const roomAbsents = room.students.filter(
        (s: any) => s.status === "absent",
      ).length;
      if (roomAbsents > 0) {
        const roomNameShort = room.name.replace("ชั้นมัธยมศึกษาปีที่ ", "ม.");
        absenteesByRoom.push(`${roomNameShort} (${roomAbsents} คน)`);
      }
    });
    const absenteesDesc =
      absenteesByRoom.length > 0
        ? absenteesByRoom.join(", ")
        : "ไม่มีนักเรียนขาดเรียนวันนี้";

    // 3. Lates / Leaves description
    const latesCount = totalLate;
    const leavesCount = totalLeave;
    const latesLeavesDesc = `มาสาย ${latesCount} คน, ลา ${leavesCount} คน`;

    return [
      {
        title: "อัตราการเข้าเรียนเฉลี่ย",
        value: `${avgAttendanceRateVal}%`,
        desc:
          todayRooms.length > 0
            ? "คำนวณจากคาบเรียนวันนี้"
            : "ไม่มีคาบเรียนวันนี้",
        trend: avgAttendanceRateVal >= 80 ? "up" : "down",
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
        iconBg: "bg-emerald-500/10 text-emerald-600",
        iconPath:
          "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
      },
      {
        title: "เช็คชื่อนักเรียนวันนี้",
        value: `${totalCheckedToday} / ${totalStudentsToday} คน`,
        desc: `เช็คชื่อแล้ว ${checkedRoomsCount} จาก ${todayRooms.length} ห้องเรียน`,
        trend: "neutral",
        colorClass: "text-sky-600 bg-sky-50 border-sky-100",
        iconBg: "bg-sky-500/10 text-sky-600",
        iconPath:
          "M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.11.786.291 1.13.074.14.16.268.254.386.09.112.194.21.306.298a2.66 2.66 0 0 0 .386.254c.344.18.716.29 1.13.29.23 0 .454-.034.664-.1a3.774 3.774 0 0 1-.664 1.1c-.074.14-.16.268-.254.386a2.66 2.66 0 0 1-.306.298 2.66 2.66 0 0 1-.386.254 3.774 3.774 0 0 1-1.13.29c-.23 0-.454-.034-.664-.1a3.774 3.774 0 0 1 .1 2.314c.065-.21.1-.433.1-.664 0-.414-.11-.786-.291-1.13a2.66 2.66 0 0 0-.254-.386 2.66 2.66 0 0 0-.306-.298 2.66 2.66 0 0 0-.386-.254 3.774 3.774 0 0 0-1.13-.29c-.23 0-.454.034-.664.1a3.774 3.774 0 0 0 .664-1.1c.074-.14.16-.268.254-.386a2.66 2.66 0 0 0 .306-.298c.112-.089.21-.193.298-.306.09-.112.194-.21.306-.298a2.66 2.66 0 0 0 .386-.254 3.774 3.774 0 0 0 1.13-.29c.23 0 .454.035.664.1a3.774 3.774 0 0 0-.1-2.314Z",
      },
      {
        title: "ขาดเรียนวันนี้",
        value: `${totalAbsent} คน`,
        desc: absenteesDesc,
        trend: "down",
        colorClass: "text-rose-600 bg-rose-50 border-rose-100",
        iconBg: "bg-rose-500/10 text-rose-600",
        iconPath:
          "M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.11A5.98 5.98 0 0 1 10.375 21 5.98 5.98 0 0 1 4 19.235Z",
      },
      {
        title: "สาย / ลาเรียน",
        value: `${totalLate + totalLeave} คน`,
        desc: latesLeavesDesc,
        trend: "warning",
        colorClass: "text-amber-600 bg-amber-50 border-amber-100",
        iconBg: "bg-amber-500/10 text-amber-600",
        iconPath: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      },
    ];
  });

  const todayClassesCount = computed(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return classrooms.value.filter((r: any) => r.rawDate === todayStr).length;
  });

  const todayStudentsCount = computed(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayRooms = classrooms.value.filter(
      (r: any) => r.rawDate === todayStr,
    );
    return todayRooms.reduce((acc, room) => acc + room.studentsCount, 0);
  });

  const handleStartCheck = (cls: any) => {
    showToast(`กำลังเข้าสู่ระบบเช็คชื่อสำหรับ ${cls.name}`, "success");
    setTimeout(() => {
      navigateTo({
        path: "/teachers/classroom",
        query: { classId: cls.id },
      });
    }, 800);
  };

  onMounted(() => {
    fetchDashboardData();
  });

  return {
    teacherProfile,
    classrooms,
    exceptions,
    isFetching,
    stats,
    todayClassesCount,
    todayStudentsCount,
    toasts,
    showToast,
    fetchDashboardData,
    handleStartCheck,
    logout,
  };
};
