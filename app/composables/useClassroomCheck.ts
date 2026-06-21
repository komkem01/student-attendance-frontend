import { ref, computed, onMounted } from 'vue'

export const useClassroomCheck = (showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void) => {
  const route = useRoute()
  const classId = computed(() => route.params.check as string)

  const { session } = useTeacherSession()

  // State Variables
  const isLoading = ref(true)
  const isSaving = ref(false)
  const selectedClassroom = ref<any>(null)
  const editingStudents = ref<any[]>([])
  const studentSearchQuery = ref('')
  const studentFilterStatus = ref<'all' | 'present' | 'absent' | 'late' | 'leave' | 'unchecked'>('all')

  // Thai short date formatter helper
  const formatThaiDateShort = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const day = date.getDate()
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    const month = months[date.getMonth()]
    const thaiYear = (date.getFullYear() + 543).toString().slice(-2)
    return `${day} ${month} ${thaiYear}`
  }

  // Load prefix lookups and classroom attendance data
  const loadCheckInData = async () => {
    isLoading.value = true
    try {
      // Load lookup prefixes
      const prefixRes: any = await $fetch('http://localhost:8080/api/v1/system/prefix')
      const prefixes = prefixRes.data || []

      // Fetch data
      const [classroomsRes, schedulesRes, studentClassroomsRes, studentsRes, attendancesRes]: any = await Promise.all([
        $fetch('http://localhost:8080/api/v1/classrooms'),
        $fetch('http://localhost:8080/api/v1/class-schedules'),
        $fetch('http://localhost:8080/api/v1/student-classrooms'),
        $fetch('http://localhost:8080/api/v1/students'),
        $fetch('http://localhost:8080/api/v1/classroom-attendences')
      ])

      const rawClassrooms = classroomsRes.data || []
      const rawSchedules = schedulesRes.data || []
      const rawStudentClassrooms = studentClassroomsRes.data || []
      const rawStudents = studentsRes.data || []
      const rawAttendances = attendancesRes.data || []

      const matchedClass = rawClassrooms.find((c: any) => c.id.toString() === classId.value.toString())
      if (!matchedClass) {
        showToast('ไม่พบข้อมูลห้องเรียนนี้ กำลังพากลับ...', 'error')
        setTimeout(() => {
          navigateTo('/teachers/classroom')
        }, 1500)
        isLoading.value = false
        return
      }

      // Today's Date YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0]

      // Find active schedule for today or most recent schedule
      let activeSchedule = rawSchedules.find((s: any) => s.classroom_id === matchedClass.id && s.date === todayStr)
      if (!activeSchedule) {
        // Find latest class schedule to copy the time slot from
        const latestSchedule = rawSchedules.filter((s: any) => s.classroom_id === matchedClass.id)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        const startTimeSlot = latestSchedule ? (latestSchedule.start_time || '').slice(0, 5) : '08:15'
        const endTimeSlot = latestSchedule ? (latestSchedule.end_time || '').slice(0, 5) : '09:10'

        // Create a schedule for today
        const newScheduleRes: any = await $fetch('http://localhost:8080/api/v1/class-schedules', {
          method: 'POST',
          body: {
            classroom_id: matchedClass.id,
            teacher_id: session.value.teacher_id,
            date: todayStr,
            start_time: startTimeSlot,
            end_time: endTimeSlot
          }
        })
        activeSchedule = newScheduleRes.data
      }

      // Map enrolled students
      const matchedStudentClassrooms = rawStudentClassrooms.filter((sc: any) => sc.classroom_id === matchedClass.id)
      const enrolledStudents = matchedStudentClassrooms.map((sc: any) => {
        const studentInfo = rawStudents.find((s: any) => s.id === sc.student_id)
        if (!studentInfo) return null

        const matchedPrefixObj = prefixes.find((p: any) => p.id === studentInfo.prefix_id)
        const dbPrefixName = matchedPrefixObj ? matchedPrefixObj.name : 'ด.ช.'
        
        let prefixName = dbPrefixName
        if (dbPrefixName === 'เด็กชาย') prefixName = 'ด.ช.'
        else if (dbPrefixName === 'เด็กหญิง') prefixName = 'ด.ญ.'
        else if (dbPrefixName === 'นางสาว') prefixName = 'น.ส.'

        // Search attendance record under today's schedule
        let status = ''
        let details = ''
        let attendanceId = ''

        if (activeSchedule) {
          const matchedAttendance = rawAttendances.find((a: any) => a.student_id === studentInfo.id && a.schedule_id === activeSchedule.id)
          if (matchedAttendance) {
            status = matchedAttendance.status
            details = matchedAttendance.remark || ''
            attendanceId = matchedAttendance.id
          }
        }

        return {
          id: studentInfo.id,
          no: parseInt(studentInfo.student_no || '0') || 0,
          prefix: prefixName,
          firstName: studentInfo.firstname,
          lastName: studentInfo.lastname,
          status,
          details,
          attendanceId
        }
      }).filter(Boolean)

      enrolledStudents.sort((a: any, b: any) => a.no - b.no)

      const formattedDate = formatThaiDateShort(activeSchedule.date)
      const start = (activeSchedule.start_time || '').slice(0, 5)
      const end = (activeSchedule.end_time || '').slice(0, 5)
      const displayTime = `${start} - ${end} น.`
      const timeText = `${formattedDate} • ${displayTime}`

      selectedClassroom.value = {
        id: matchedClass.id,
        name: matchedClass.class,
        subject: matchedClass.subject,
        studentsCount: enrolledStudents.length,
        time: timeText,
        scheduleId: activeSchedule.id,
        date: activeSchedule.date,
        students: enrolledStudents
      }

      editingStudents.value = JSON.parse(JSON.stringify(enrolledStudents))
    } catch (err) {
      console.error(err)
      showToast('ไม่สามารถดึงข้อมูลเช็คชื่อได้', 'error')
    } finally {
      isLoading.value = false
    }
  }

  onMounted(async () => {
    await loadCheckInData()
  })

  // Filtered students computed list
  const filteredStudents = computed(() => {
    if (!selectedClassroom.value) return []
    return editingStudents.value.filter(student => {
      const fullName = `${student.prefix} ${student.firstName} ${student.lastName}`
      const matchesSearch = fullName.toLowerCase().includes(studentSearchQuery.value.toLowerCase()) || 
                            student.no.toString() === studentSearchQuery.value
                            
      const matchesStatus = studentFilterStatus.value === 'all' ||
                            (studentFilterStatus.value === 'unchecked' && student.status === '') ||
                            (studentFilterStatus.value === 'present' && student.status === 'present') ||
                            (studentFilterStatus.value === 'absent' && student.status === 'absent') ||
                            (studentFilterStatus.value === 'late' && student.status === 'late') ||
                            (studentFilterStatus.value === 'leave' && student.status === 'leave')
                            
      return matchesSearch && matchesStatus
    })
  })

  // Live statistics computed object
  const activeCheckinStats = computed(() => {
    const total = editingStudents.value.length
    const checked = editingStudents.value.filter(s => s.status !== '').length
    const present = editingStudents.value.filter(s => s.status === 'present').length
    const absent = editingStudents.value.filter(s => s.status === 'absent').length
    const late = editingStudents.value.filter(s => s.status === 'late').length
    const leave = editingStudents.value.filter(s => s.status === 'leave').length
    return { total, checked, present, absent, late, leave }
  })

  // Progress percentage
  const activeCheckinProgress = computed(() => {
    if (activeCheckinStats.value.total === 0) return 0
    return Math.round((activeCheckinStats.value.checked / activeCheckinStats.value.total) * 100)
  })

  // Check if all students are marked
  const isAllChecked = computed(() => {
    return activeCheckinStats.value.checked === activeCheckinStats.value.total
  })

  // Thai initial parser
  const getThaiInitial = (word: string) => {
    if (!word) return ''
    const leadingVowels = ['เ', 'แ', 'โ', 'ใ', 'ไ']
    if (leadingVowels.includes(word.charAt(0)) && word.length > 1) {
      return word.charAt(1)
    }
    return word.charAt(0)
  }

  // Quick action: Mark all unchecked students as present
  const markAllPresent = () => {
    editingStudents.value.forEach(s => {
      if (s.status === '') {
        s.status = 'present'
        s.details = ''
      }
    })
    showToast('บันทึก "มาเรียน" สำหรับนักเรียนที่เหลือแล้ว', 'success')
  }

  // Quick action: Clear all selections
  const clearAllStatus = () => {
    editingStudents.value.forEach(s => {
      s.status = ''
      s.details = ''
    })
    showToast('ล้างรายการบันทึกสถานะทั้งหมดแล้ว', 'warning')
  }

  // Set student check-in status (with toggle off if clicking the active status again)
  const setStudentStatus = (studentId: string | number, status: 'present' | 'absent' | 'late' | 'leave') => {
    const student = editingStudents.value.find(s => s.id === studentId)
    if (student) {
      if (student.status === status) {
        student.status = ''
        student.details = ''
      } else {
        student.status = status
        if (status === 'late') {
          student.details = '15' // default late 15 minutes
        } else if (status === 'leave') {
          student.details = 'sick' // default leave reason: sick
        } else {
          student.details = ''
        }
      }
    }
  }

  const setLateMinutes = (studentId: string | number, minutes: string) => {
    const student = editingStudents.value.find(s => s.id === studentId)
    if (student) {
      if (student.details && (student.details.includes('gate check-in by prefect:') || student.details.includes('gate check-in updated by prefect:'))) {
        const prefixPart = student.details.split(' | ')[0]
        student.details = `${prefixPart} | late: ${minutes} mins`
      } else {
        student.details = minutes
      }
    }
  }

  const setLeaveReason = (studentId: string | number, reason: string) => {
    const student = editingStudents.value.find(s => s.id === studentId)
    if (student) {
      student.details = reason
    }
  }

  // Save to database API
  const saveAttendance = async () => {
    if (!selectedClassroom.value) return
    
    isSaving.value = true
    try {
      const scheduleId = selectedClassroom.value.scheduleId
      const dateVal = selectedClassroom.value.date

      for (const s of editingStudents.value) {
        if (s.status === '') {
          // If status is cleared (empty), delete the record from database if it exists
          if (s.attendanceId) {
            await $fetch(`http://localhost:8080/api/v1/classroom-attendences/${s.attendanceId}`, {
              method: 'DELETE'
            })
          }
          continue
        }

        const payload = {
          student_id: s.id,
          schedule_id: scheduleId,
          date: dateVal,
          status: s.status,
          remark: s.details || ''
        }

        if (s.attendanceId) {
          await $fetch(`http://localhost:8080/api/v1/classroom-attendences/${s.attendanceId}`, {
            method: 'PATCH',
            body: payload
          })
        } else {
          await $fetch('http://localhost:8080/api/v1/classroom-attendences', {
            method: 'POST',
            body: payload
          })
        }
      }

      showToast('บันทึกเวลาเรียนเสร็จสมบูรณ์เรียบร้อย', 'success')
      
      setTimeout(() => {
        navigateTo('/teachers/classroom')
      }, 500)
    } catch (err) {
      console.error(err)
      showToast('เกิดข้อผิดพลาดในการบันทึกเวลาเรียน', 'error')
    } finally {
      isSaving.value = false
    }
  }

  const cancelCheckIn = () => {
    showToast('ยกเลิกการแก้ไขข้อมูลเช็คชื่อ', 'info')
    setTimeout(() => {
      navigateTo('/teachers/classroom')
    }, 300)
  }

  return {
    isLoading,
    isSaving,
    selectedClassroom,
    editingStudents,
    studentSearchQuery,
    studentFilterStatus,
    filteredStudents,
    activeCheckinStats,
    activeCheckinProgress,
    isAllChecked,
    getThaiInitial,
    markAllPresent,
    clearAllStatus,
    setStudentStatus,
    setLateMinutes,
    setLeaveReason,
    saveAttendance,
    cancelCheckIn
  }
}
