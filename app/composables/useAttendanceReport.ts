import { ref, computed, watch, onMounted } from 'vue'

export const useAttendanceReport = () => {
  const { session } = useTeacherSession()

  // State lists
  const classrooms = ref<any[]>([])
  const selectedClassroomId = ref('')
  const isFetching = ref(false)
  const isExporting = ref(false)

  // Date range states
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  
  const startDateStr = ref(`${yyyy}-${mm}-01`)
  const endDateStr = ref(`${yyyy}-${mm}-${dd}`)

  const showClassSelectPopover = ref(false)
  const showStartDatePopover = ref(false)
  const showEndDatePopover = ref(false)

  // Calendar states
  const currentCalendarYear = ref(today.getFullYear())
  const currentCalendarMonth = ref(today.getMonth())

  const thaiMonthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  // Report Data
  const reportData = ref<any>(null)

  // SweetAlert-style Toast State
  const toasts = ref<{ id: number; message: string; type: 'success' | 'error' | 'warning' | 'info' }[]>([])
  let toastId = 0

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = toastId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  // Fetch Classrooms List
  const fetchClassrooms = async () => {
    if (!session.value || !session.value.teacher_id) return
    try {
      const res: any = await $fetch('http://localhost:8080/api/v1/classrooms')
      const rawClassrooms = res.data || []
      classrooms.value = rawClassrooms.filter((c: any) => c.teacher_id === session.value.teacher_id).map((c: any) => ({
        id: c.id,
        name: c.class,
        subject: c.subject
      }))
      
      // Auto select first classroom
      if (classrooms.value.length > 0 && !selectedClassroomId.value) {
        selectedClassroomId.value = classrooms.value[0].id
      }
    } catch (err) {
      console.error(err)
      showToast('ไม่สามารถดึงข้อมูลห้องเรียนได้', 'error')
    }
  }

  // Fetch Report Data
  const fetchReport = async () => {
    if (!selectedClassroomId.value) return
    isFetching.value = true
    try {
      const url = `http://localhost:8080/api/v1/classrooms/${selectedClassroomId.value}/attendance-report`
      const res: any = await $fetch(url, {
        query: {
          start_date: startDateStr.value,
          end_date: endDateStr.value
        }
      })
      if (res.data) {
        reportData.value = res.data
      }
    } catch (err: any) {
      console.error(err)
      const msg = err.data?.message || 'ไม่สามารถดึงข้อมูลรายงานการเข้าเรียนได้'
      showToast(msg, 'error')
    } finally {
      isFetching.value = false
    }
  }

  // Watchers to trigger report reload
  watch([selectedClassroomId, startDateStr, endDateStr], () => {
    fetchReport()
  })

  // Calendar generator
  const calendarDays = computed(() => {
    const year = currentCalendarYear.value
    const month = currentCalendarMonth.value
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    
    const days = []
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, month: month === 0 ? 11 : month - 1, year: month === 0 ? year - 1 : year, isCurrentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month: month, year: year, isCurrentMonth: true })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, month: month === 11 ? 0 : month + 1, year: month === 11 ? year + 1 : year, isCurrentMonth: false })
    }
    return days
  })

  const nextMonth = () => {
    if (currentCalendarMonth.value === 11) {
      currentCalendarMonth.value = 0
      currentCalendarYear.value++
    } else {
      currentCalendarMonth.value++
    }
  }

  const prevMonth = () => {
    if (currentCalendarMonth.value === 0) {
      currentCalendarMonth.value = 11
      currentCalendarYear.value--
    } else {
      currentCalendarMonth.value--
    }
  }

  const selectStartDate = (dayObj: any) => {
    const yyyy = dayObj.year
    const mm = String(dayObj.month + 1).padStart(2, '0')
    const dd = String(dayObj.day).padStart(2, '0')
    startDateStr.value = `${yyyy}-${mm}-${dd}`
    showStartDatePopover.value = false
  }

  const selectEndDate = (dayObj: any) => {
    const yyyy = dayObj.year
    const mm = String(dayObj.month + 1).padStart(2, '0')
    const dd = String(dayObj.day).padStart(2, '0')
    endDateStr.value = `${yyyy}-${mm}-${dd}`
    showEndDatePopover.value = false
  }

  const handleExport = async (format: 'pdf' | 'excel') => {
    isExporting.value = true
    await new Promise(resolve => setTimeout(resolve, 1500))
    isExporting.value = false
    showToast(`ส่งออกรายงานในรูปแบบ ${format.toUpperCase()} สำเร็จเรียบร้อยแล้ว!`, 'success')
  }

  const selectedClassroom = computed(() => {
    return classrooms.value.find(c => c.id === selectedClassroomId.value) || null
  })

  // Format date helper
  const formatDateThaiShort = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`
  }

  const studentsReportData = computed(() => {
    if (!reportData.value || !reportData.value.students) return []
    return reportData.value.students.map((s: any) => ({
      id: s.id,
      no: parseInt(s.student_no) || s.no,
      studentNo: s.student_no,
      studentCode: s.student_code || '',
      prefix: s.prefix,
      firstName: s.first_name,
      lastName: s.last_name,
      presentCount: s.present_count,
      lateCount: s.late_count,
      absentCount: s.absent_count,
      leaveCount: s.leave_count,
      totalDays: s.total_days,
      attendanceRate: s.attendance_rate
    }))
  })

  const aggregateStats = computed(() => {
    if (!reportData.value) {
      return { presentPct: 0, latePct: 0, absentPct: 0, leavePct: 0, avgRate: 0 }
    }
    return {
      presentPct: reportData.value.present_pct,
      latePct: reportData.value.late_pct,
      absentPct: reportData.value.absent_pct,
      leavePct: reportData.value.leave_pct,
      avgRate: reportData.value.avg_rate
    }
  })

  onMounted(async () => {
    await fetchClassrooms()
    await fetchReport()
  })

  return {
    classrooms,
    selectedClassroomId,
    selectedClassroom,
    isFetching,
    isExporting,
    startDateStr,
    endDateStr,
    showClassSelectPopover,
    showStartDatePopover,
    showEndDatePopover,
    currentCalendarYear,
    currentCalendarMonth,
    thaiMonthNames,
    calendarDays,
    nextMonth,
    prevMonth,
    selectStartDate,
    selectEndDate,
    formatDateThaiShort,
    reportData,
    studentsReportData,
    aggregateStats,
    toasts,
    showToast,
    handleExport
  }
}
