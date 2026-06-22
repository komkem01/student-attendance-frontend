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
  const allReports = ref<any[]>([])

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
      const res: any = await useCustomFetch('/classrooms')
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
      if (selectedClassroomId.value === 'all') {
        const reports: any[] = []
        for (const cls of classrooms.value) {
          const res: any = await useCustomFetch(`/classrooms/${cls.id}/attendance-report`, {
            query: {
              start_date: startDateStr.value,
              end_date: endDateStr.value
            }
          })
          if (res.data) {
            reports.push({
              classId: cls.id,
              className: cls.name,
              subjectName: cls.subject,
              reportData: res.data
            })
          }
        }
        allReports.value = reports
        reportData.value = null
      } else {
        const res: any = await useCustomFetch(`/classrooms/${selectedClassroomId.value}/attendance-report`, {
          query: {
            start_date: startDateStr.value,
            end_date: endDateStr.value
          }
        })
        if (res.data) {
          reportData.value = res.data
          allReports.value = []
        }
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
    if (format === 'pdf') {
      window.print()
      return
    }
    isExporting.value = true
    try {
      const { utils, write } = await import('xlsx-js-style')
      await new Promise(resolve => setTimeout(resolve, 1000))
      const { teacherProfile } = useTeacherSession()

      const className = selectedClassroom.value ? selectedClassroom.value.name : 'ไม่ระบุห้องเรียน'
      const subjectName = selectedClassroom.value ? selectedClassroom.value.subject : 'ไม่ระบุวิชา'
      const teacherName = teacherProfile.value ? teacherProfile.value.name : '-'
      const schoolName = teacherProfile.value ? teacherProfile.value.school : '-'

      // Format date in Thai long style for report printing info
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
      const printDateText = new Date().toLocaleDateString('th-TH', dateOptions)

      // 1. Build layout rows matching the PDF style exactly
      const dataRows = [
        ['รายงานสรุปรายชื่อและการเข้าเรียนของนักเรียน'], // Row 1 (index 0) - Title
        [`ห้องเรียน ${className} | วิชา ${subjectName}`], // Row 2 (index 1) - Subtitle
        [
          `ครูผู้สอน: ${teacherName}`, '', '', 
          `โรงเรียน: ${schoolName}`, '', '', 
          `วันที่ออกรายงาน: ${printDateText}`
        ], // Row 3 (index 2) - Metadata Grid
        [`ช่วงเวลารายงาน: ${formatDateThaiShort(startDateStr.value)} ถึง ${formatDateThaiShort(endDateStr.value)}`], // Row 4 (index 3) - Date Range
        [], // Row 5 (index 4) - Spacer
        // Summary Table: Row 6 (index 5) & Row 7 (index 6)
        ['อัตราเข้าเรียนเฉลี่ย', 'มาเรียน (ร้อยละ)', 'สาย (ร้อยละ)', 'ลา (ร้อยละ)', 'ขาดเรียน (ร้อยละ)'],
        [
          `${aggregateStats.value.avgRate}%`,
          `${aggregateStats.value.presentPct}%`,
          `${aggregateStats.value.latePct}%`,
          `${aggregateStats.value.leavePct}%`,
          `${aggregateStats.value.absentPct}%`
        ],
        [], // Row 8 (index 7) - Spacer
        ['รายละเอียดการเข้าเรียนรายบุคคล'], // Row 9 (index 8) - Section Title
        // Detailed Table Header: Row 10 (index 9)
        [
          'เลขที่',
          'ชื่อ - นามสกุล',
          'มาเรียน (วัน)',
          'สาย (วัน)',
          'ลา (วัน)',
          'ขาด (วัน)',
          'คิดเป็นเปอร์เซ็นต์',
          'ผลการประเมิน'
        ]
      ]

      // 2. Add student records starting from Row 11 (index 10)
      for (const student of studentsReportData.value) {
        const assessmentResult = student.attendanceRate >= 80 ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์'
        const fullName = `${student.prefix}${student.firstName} ${student.lastName}`
        dataRows.push([
          student.no.toString(),
          fullName,
          student.presentCount.toString(),
          student.lateCount.toString(),
          student.leaveCount.toString(),
          student.absentCount.toString(),
          `${student.attendanceRate}%`,
          assessmentResult
        ])
      }

      const worksheet = utils.aoa_to_sheet(dataRows)
      const workbook = utils.book_new()
      utils.book_append_sheet(workbook, worksheet, 'รายงานการเข้าเรียน')

      // Set cell styles to achieve premium look matching PDF
      const borderThin = {
        top: { style: 'thin', color: { rgb: '334155' } },
        bottom: { style: 'thin', color: { rgb: '334155' } },
        left: { style: 'thin', color: { rgb: '334155' } },
        right: { style: 'thin', color: { rgb: '334155' } }
      }

      const fontRegular = { name: 'TH Sarabun PSK', sz: 14 }
      const fontBold = { name: 'TH Sarabun PSK', sz: 14, bold: true }
      const fontTitle = { name: 'TH Sarabun PSK', sz: 18, bold: true }
      const fontHeader = { name: 'TH Sarabun PSK', sz: 14, bold: true }

      // Merge ranges definition (SheetJS uses 0-indexed coordinates)
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Merge Title A1:H1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Merge Subtitle A2:H2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // Merge Teacher A3:C3
        { s: { r: 2, c: 3 }, e: { r: 2, c: 5 } }, // Merge School D3:F3
        { s: { r: 2, c: 6 }, e: { r: 2, c: 7 } }, // Merge Print Date G3:H3
        { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }, // Merge Date Range A4:H4
        { s: { r: 8, c: 0 }, e: { r: 8, c: 7 } }  // Merge Section Title A9:H9
      ]

      for (const cellRef in worksheet) {
        if (cellRef.startsWith('!')) continue // skip metadata properties

        const cell = worksheet[cellRef]
        const parsedRef = utils.decode_cell(cellRef)
        const row = parsedRef.r
        const col = parsedRef.c

        // Default cell layout styling
        cell.s = {
          font: { ...fontRegular },
          alignment: { vertical: 'center' }
        }

        // Title Row Styling (Row 0)
        if (row === 0) {
          cell.s.font = { ...fontTitle }
          cell.s.alignment.horizontal = 'center'
        }
        // Subtitle Row Styling (Row 1)
        else if (row === 1) {
          cell.s.font = { ...fontHeader }
          cell.s.alignment.horizontal = 'center'
        }
        // Metadata Rows Styling (Row 2 & 3)
        else if (row === 2 || row === 3) {
          cell.s.font = { ...fontBold }
          if (row === 2) {
            if (col === 0) cell.s.alignment.horizontal = 'left'
            else if (col === 3) cell.s.alignment.horizontal = 'left'
            else if (col === 6) cell.s.alignment.horizontal = 'right'
          } else {
            cell.s.alignment.horizontal = 'left'
          }
        }
        // Summary Table Header (Row 5)
        else if (row === 5) {
          if (col < 5) {
            cell.s.font = { ...fontBold }
            cell.s.fill = { patternType: 'solid', fgColor: { rgb: 'F1F5F9' } }
            cell.s.border = { ...borderThin }
            cell.s.alignment.horizontal = 'center'
            
            // Apply text colors corresponding to PDF summary headers
            if (col === 1) cell.s.font.color = { rgb: '047857' } // มาเรียน (ร้อยละ) - green
            else if (col === 2) cell.s.font.color = { rgb: 'D97706' } // สาย (ร้อยละ) - amber
            else if (col === 3) cell.s.font.color = { rgb: '4338CA' } // ลา (ร้อยละ) - indigo
            else if (col === 4) cell.s.font.color = { rgb: 'B91C1C' } // ขาดเรียน (ร้อยละ) - rose
          }
        }
        // Summary Table Values (Row 6)
        else if (row === 6) {
          if (col < 5) {
            cell.s.font = { ...fontBold }
            cell.s.border = { ...borderThin }
            cell.s.alignment.horizontal = 'center'
            
            // Text color coding
            if (col === 1) cell.s.font.color = { rgb: '047857' }
            else if (col === 2) cell.s.font.color = { rgb: 'D97706' }
            else if (col === 3) cell.s.font.color = { rgb: '4338CA' }
            else if (col === 4) cell.s.font.color = { rgb: 'B91C1C' }
          }
        }
        // Section Title Styling (Row 8)
        else if (row === 8) {
          cell.s.font = { ...fontHeader }
          cell.s.alignment.horizontal = 'left'
        }
        // Detailed Table Header (Row 9)
        else if (row === 9) {
          cell.s.font = { ...fontBold }
          cell.s.fill = { patternType: 'solid', fgColor: { rgb: 'F1F5F9' } }
          cell.s.border = { ...borderThin }
          cell.s.alignment.horizontal = 'center'

          // Header custom colors matching PDF
          if (col === 2) cell.s.font.color = { rgb: '047857' } // มาเรียน - green
          else if (col === 3) cell.s.font.color = { rgb: 'D97706' } // สาย - amber
          else if (col === 4) cell.s.font.color = { rgb: '4338CA' } // ลา - indigo
          else if (col === 5) cell.s.font.color = { rgb: 'B91C1C' } // ขาด - red
        }
        // Detailed Table Body Rows (Row 10 onwards)
        else if (row >= 10) {
          cell.s.border = { ...borderThin }
          
          if (col === 0) { // เลขที่
            cell.s.alignment.horizontal = 'center'
          } else if (col === 1) { // ชื่อ - นามสกุล
            cell.s.alignment.horizontal = 'left'
            cell.s.font.bold = true
          } else if (col >= 2 && col <= 5) { // มาเรียน, สาย, ลา, ขาด
            cell.s.alignment.horizontal = 'center'
            
            // Style active cells > 0 with their respective alert color
            const valNum = parseInt(cell.v || '0')
            if (valNum > 0) {
              if (col === 3) cell.s.font.color = { rgb: 'D97706' } // สาย - amber
              else if (col === 4) cell.s.font.color = { rgb: '4338CA' } // ลา - indigo
              else if (col === 5) cell.s.font.color = { rgb: 'B91C1C' } // ขาด - red
            }
          } else if (col === 6) { // คิดเป็นเปอร์เซ็นต์
            cell.s.alignment.horizontal = 'center'
            cell.s.font.bold = true
          } else if (col === 7) { // ผลการประเมิน
            cell.s.alignment.horizontal = 'center'
            cell.s.font.bold = true
            
            // Assessment cell badge simulation
            if (cell.v === 'ผ่านเกณฑ์') {
              cell.s.font.color = { rgb: '047857' }
              cell.s.fill = { patternType: 'solid', fgColor: { rgb: 'D1FAE5' } }
            } else {
              cell.s.font.color = { rgb: 'B91C1C' }
              cell.s.fill = { patternType: 'solid', fgColor: { rgb: 'FEE2E2' } }
            }
          }
        }
      }

      // Automatically adjust column widths based on table cell contents only (skipping headers)
      const maxColLen = dataRows.reduce((acc: number[], row: any[], rowIdx: number) => {
        if (rowIdx === 0 || rowIdx === 1 || rowIdx === 2 || rowIdx === 3 || rowIdx === 4 || rowIdx === 7 || rowIdx === 8) {
          return acc
        }
        row.forEach((val, colIdx) => {
          const len = String(val || '').length
          const pad = colIdx === 1 ? 10 : 4 // extra padding for full names in column B
          acc[colIdx] = Math.max(acc[colIdx] || 10, len + pad)
        })
        return acc
      }, [])
      worksheet['!cols'] = maxColLen.map(w => ({ wch: w }))

      const wbout = write(workbook, { bookType: 'xlsx', bookSST: false, type: 'binary' })

      const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length)
        const view = new Uint8Array(buf)
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
      }

      const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `รายงานการเข้าเรียน_${className}.xlsx`
      a.click()
      URL.revokeObjectURL(url)

      showToast('ส่งออกไฟล์ Excel สำเร็จเรียบร้อยแล้ว!', 'success')
    } catch (err) {
      console.error('Failed to export excel:', err)
      showToast('เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel', 'error')
    } finally {
      isExporting.value = false
    }
  }

  const selectedClassroom = computed(() => {
    if (selectedClassroomId.value === 'all') {
      return { id: 'all', name: 'ทุกห้องเรียน', subject: 'ทุกรายวิชา' }
    }
    return classrooms.value.find(c => c.id === selectedClassroomId.value) || null
  })

  // Format date helper
  const formatDateThaiShort = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`
  }

  // Active Reports loops through either all fetched reports or the selected single report
  const activeReports = computed(() => {
    if (selectedClassroomId.value === 'all') {
      return allReports.value.map(item => {
        const report = item.reportData
        const students = (report.students || []).map((s: any) => {
          const dbPrefixName = s.prefix || 'ด.ช.'
          let prefixName = dbPrefixName
          if (dbPrefixName === 'เด็กชาย') prefixName = 'ด.ช.'
          else if (dbPrefixName === 'เด็กหญิง') prefixName = 'ด.ญ.'
          else if (dbPrefixName === 'นางสาว') prefixName = 'น.ส.'

          return {
            id: s.id,
            no: parseInt(s.student_no) || s.no,
            studentNo: s.student_no,
            studentCode: s.student_code || '',
            prefix: prefixName,
            firstName: s.first_name,
            lastName: s.last_name,
            presentCount: s.present_count,
            lateCount: s.late_count,
            absentCount: s.absent_count,
            leaveCount: s.leave_count,
            totalDays: s.total_days,
            attendanceRate: s.attendance_rate
          }
        })

        return {
          classId: item.classId,
          className: item.className,
          subjectName: item.subjectName,
          students,
          aggregateStats: {
            presentPct: report.present_pct,
            latePct: report.late_pct,
            absentPct: report.absent_pct,
            leavePct: report.leave_pct,
            avgRate: report.avg_rate
          }
        }
      })
    } else {
      const cls = classrooms.value.find(c => c.id === selectedClassroomId.value)
      if (!cls || !reportData.value) return []

      const students = (reportData.value.students || []).map((s: any) => {
        const dbPrefixName = s.prefix || 'ด.ช.'
        let prefixName = dbPrefixName
        if (dbPrefixName === 'เด็กชาย') prefixName = 'ด.ช.'
        else if (dbPrefixName === 'เด็กหญิง') prefixName = 'ด.ญ.'
        else if (dbPrefixName === 'นางสาว') prefixName = 'น.ส.'

        return {
          id: s.id,
          no: parseInt(s.student_no) || s.no,
          studentNo: s.student_no,
          studentCode: s.student_code || '',
          prefix: prefixName,
          firstName: s.first_name,
          lastName: s.last_name,
          presentCount: s.present_count,
          lateCount: s.late_count,
          absentCount: s.absent_count,
          leaveCount: s.leave_count,
          totalDays: s.total_days,
          attendanceRate: s.attendance_rate
        }
      })

      return [{
        classId: cls.id,
        className: cls.name,
        subjectName: cls.subject,
        students,
        aggregateStats: {
          presentPct: reportData.value.present_pct,
          latePct: reportData.value.late_pct,
          absentPct: reportData.value.absent_pct,
          leavePct: reportData.value.leave_pct,
          avgRate: reportData.value.avg_rate
        }
      }]
    }
  })

  // Backward compatibility fallback pointers
  const studentsReportData = computed(() => {
    return activeReports.value[0]?.students || []
  })

  const aggregateStats = computed(() => {
    return activeReports.value[0]?.aggregateStats || { presentPct: 0, latePct: 0, absentPct: 0, leavePct: 0, avgRate: 0 }
  })

  // Export report of ALL classrooms into a single Excel workbook
  const handleExportAllClassrooms = async () => {
    if (classrooms.value.length === 0) {
      showToast('ไม่พบข้อมูลห้องเรียนสำหรับคุณครู', 'error')
      return
    }
    isExporting.value = true
    try {
      const { utils, write } = await import('xlsx-js-style')
      const workbook = utils.book_new()
      const { teacherProfile } = useTeacherSession()
      const teacherName = teacherProfile.value ? teacherProfile.value.name : '-'
      const schoolName = teacherProfile.value ? teacherProfile.value.school : '-'

      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
      const printDateText = new Date().toLocaleDateString('th-TH', dateOptions)

      // Fetch all reports in sequence
      for (const cls of classrooms.value) {
        const res: any = await useCustomFetch(`/classrooms/${cls.id}/attendance-report`, {
          query: {
            start_date: startDateStr.value,
            end_date: endDateStr.value
          }
        })
        if (!res.data) continue

        const report = res.data
        const students = report.students || []
        const avgStats = {
          presentPct: report.present_pct,
          latePct: report.late_pct,
          absentPct: report.absent_pct,
          leavePct: report.leave_pct,
          avgRate: report.avg_rate
        }

        const dataRows = [
          ['รายงานสรุปรายชื่อและการเข้าเรียนของนักเรียน'],
          [`ห้องเรียน ${cls.name} | วิชา ${cls.subject}`],
          [
            `ครูผู้สอน: ${teacherName}`, '', '', 
            `โรงเรียน: ${schoolName}`, '', '', 
            `วันที่ออกรายงาน: ${printDateText}`
          ],
          [`ช่วงเวลารายงาน: ${formatDateThaiShort(startDateStr.value)} ถึง ${formatDateThaiShort(endDateStr.value)}`],
          [],
          ['อัตราเข้าเรียนเฉลี่ย', 'มาเรียน (ร้อยละ)', 'สาย (ร้อยละ)', 'ลา (ร้อยละ)', 'ขาดเรียน (ร้อยละ)'],
          [
            `${avgStats.avgRate}%`,
            `${avgStats.presentPct}%`,
            `${avgStats.latePct}%`,
            `${avgStats.leavePct}%`,
            `${avgStats.absentPct}%`
          ],
          [],
          ['รายละเอียดการเข้าเรียนรายบุคคล'],
          [
            'เลขที่',
            'ชื่อ - นามสกุล',
            'มาเรียน (วัน)',
            'สาย (วัน)',
            'ลา (วัน)',
            'ขาด (วัน)',
            'คิดเป็นเปอร์เซ็นต์',
            'ผลการประเมิน'
          ]
        ]

        for (const s of students) {
          const dbPrefixName = s.prefix || 'ด.ช.'
          let prefixName = dbPrefixName
          if (dbPrefixName === 'เด็กชาย') prefixName = 'ด.ช.'
          else if (dbPrefixName === 'เด็กหญิง') prefixName = 'ด.ญ.'
          else if (dbPrefixName === 'นางสาว') prefixName = 'น.ส.'

          const fullName = `${prefixName}${s.first_name} ${s.last_name}`
          const assessmentResult = s.attendance_rate >= 80 ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์'
          const studentNo = parseInt(s.student_no) || s.no

          dataRows.push([
            studentNo.toString(),
            fullName,
            s.present_count.toString(),
            s.late_count.toString(),
            s.leave_count.toString(),
            s.absent_count.toString(),
            `${s.attendance_rate}%`,
            assessmentResult
          ])
        }

        const worksheet = utils.aoa_to_sheet(dataRows)

        worksheet['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
          { s: { r: 2, c: 3 }, e: { r: 2, c: 5 } },
          { s: { r: 2, c: 6 }, e: { r: 2, c: 7 } },
          { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
          { s: { r: 8, c: 0 }, e: { r: 8, c: 7 } }
        ]

        const borderThin = {
          top: { style: 'thin', color: { rgb: '334155' } },
          bottom: { style: 'thin', color: { rgb: '334155' } },
          left: { style: 'thin', color: { rgb: '334155' } },
          right: { style: 'thin', color: { rgb: '334155' } }
        }

        const fontRegular = { name: 'TH Sarabun PSK', sz: 14 }
        const fontBold = { name: 'TH Sarabun PSK', sz: 14, bold: true }
        const fontTitle = { name: 'TH Sarabun PSK', sz: 18, bold: true }
        const fontHeader = { name: 'TH Sarabun PSK', sz: 14, bold: true }

        for (const cellRef in worksheet) {
          if (cellRef.startsWith('!')) continue
          const cell = worksheet[cellRef]
          const parsedRef = utils.decode_cell(cellRef)
          const row = parsedRef.r
          const col = parsedRef.c

          cell.s = {
            font: { ...fontRegular },
            alignment: { vertical: 'center' }
          }

          if (row === 0) {
            cell.s.font = { ...fontTitle }
            cell.s.alignment.horizontal = 'center'
          } else if (row === 1) {
            cell.s.font = { ...fontHeader }
            cell.s.alignment.horizontal = 'center'
          } else if (row === 2 || row === 3) {
            cell.s.font = { ...fontBold }
            if (row === 2) {
              if (col === 0) cell.s.alignment.horizontal = 'left'
              else if (col === 3) cell.s.alignment.horizontal = 'left'
              else if (col === 6) cell.s.alignment.horizontal = 'right'
            } else {
              cell.s.alignment.horizontal = 'left'
            }
          } else if (row === 5) {
            if (col < 5) {
              cell.s.font = { ...fontBold }
              cell.s.fill = { patternType: 'solid', fgColor: { rgb: 'F1F5F9' } }
              cell.s.border = { ...borderThin }
              cell.s.alignment.horizontal = 'center'
              if (col === 1) cell.s.font.color = { rgb: '047857' }
              else if (col === 2) cell.s.font.color = { rgb: 'D97706' }
              else if (col === 3) cell.s.font.color = { rgb: '4338CA' }
              else if (col === 4) cell.s.font.color = { rgb: 'B91C1C' }
            }
          } else if (row === 6) {
            if (col < 5) {
              cell.s.font = { ...fontBold }
              cell.s.border = { ...borderThin }
              cell.s.alignment.horizontal = 'center'
              if (col === 1) cell.s.font.color = { rgb: '047857' }
              else if (col === 2) cell.s.font.color = { rgb: 'D97706' }
              else if (col === 3) cell.s.font.color = { rgb: '4338CA' }
              else if (col === 4) cell.s.font.color = { rgb: 'B91C1C' }
            }
          } else if (row === 8) {
            cell.s.font = { ...fontHeader }
            cell.s.alignment.horizontal = 'left'
          } else if (row === 9) {
            cell.s.font = { ...fontBold }
            cell.s.fill = { patternType: 'solid', fgColor: { rgb: 'F1F5F9' } }
            cell.s.border = { ...borderThin }
            cell.s.alignment.horizontal = 'center'
            if (col === 2) cell.s.font.color = { rgb: '047857' }
            else if (col === 3) cell.s.font.color = { rgb: 'D97706' }
            else if (col === 4) cell.s.font.color = { rgb: '4338CA' }
            else if (col === 5) cell.s.font.color = { rgb: 'B91C1C' }
          } else if (row >= 10) {
            cell.s.border = { ...borderThin }
            if (col === 0) {
              cell.s.alignment.horizontal = 'center'
            } else if (col === 1) {
              cell.s.alignment.horizontal = 'left'
              cell.s.font.bold = true
            } else if (col >= 2 && col <= 5) {
              cell.s.alignment.horizontal = 'center'
              const valNum = parseInt(cell.v || '0')
              if (valNum > 0) {
                if (col === 3) cell.s.font.color = { rgb: 'D97706' }
                else if (col === 4) cell.s.font.color = { rgb: '4338CA' }
                else if (col === 5) cell.s.font.color = { rgb: 'B91C1C' }
              }
            } else if (col === 6) {
              cell.s.alignment.horizontal = 'center'
              cell.s.font.bold = true
            } else if (col === 7) {
              cell.s.alignment.horizontal = 'center'
              cell.s.font.bold = true
              if (cell.v === 'ผ่านเกณฑ์') {
                cell.s.font.color = { rgb: '047857' }
                cell.s.fill = { patternType: 'solid', fgColor: { rgb: 'D1FAE5' } }
              } else {
                cell.s.font.color = { rgb: 'B91C1C' }
                cell.s.fill = { patternType: 'solid', fgColor: { rgb: 'FEE2E2' } }
              }
            }
          }
        }

        const maxColLen = dataRows.reduce((acc: number[], row: any[], rowIdx: number) => {
          if (rowIdx === 0 || rowIdx === 1 || rowIdx === 2 || rowIdx === 3 || rowIdx === 4 || rowIdx === 7 || rowIdx === 8) {
            return acc
          }
          row.forEach((val, colIdx) => {
            const len = String(val || '').length
            const pad = colIdx === 1 ? 10 : 4
            acc[colIdx] = Math.max(acc[colIdx] || 10, len + pad)
          })
          return acc
        }, [])
        worksheet['!cols'] = maxColLen.map(w => ({ wch: w }))

        let sheetName = cls.name.replace(/[\/\\\?\*\[\]\:]/g, '')
        if (sheetName.length > 31) {
          sheetName = sheetName.substring(0, 31)
        }
        utils.book_append_sheet(workbook, worksheet, sheetName || `ห้องเรียน ${cls.id}`)
      }

      const wbout = write(workbook, { bookType: 'xlsx', bookSST: false, type: 'binary' })
      const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length)
        const view = new Uint8Array(buf)
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
      }

      const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `รายงานการเข้าเรียน_ทุกห้องเรียน.xlsx`
      a.click()
      URL.revokeObjectURL(url)

      showToast('ส่งออกไฟล์ Excel ทุกห้องเรียนสำเร็จเรียบร้อยแล้ว!', 'success')
    } catch (err) {
      console.error('Failed to export all excel:', err)
      showToast('เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel ทุกห้องเรียน', 'error')
    } finally {
      isExporting.value = false
    }
  }

  onMounted(async () => {
    const route = useRoute()
    if (route.query.classId) {
      selectedClassroomId.value = route.query.classId as string
    }
    await fetchClassrooms()
    await fetchReport()

    if (route.query.export) {
      setTimeout(() => {
        if (route.query.export === 'excel-all') {
          handleExportAllClassrooms()
        } else {
          handleExport(route.query.export as 'pdf' | 'excel')
        }
      }, 800)
    }
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
    activeReports,
    toasts,
    showToast,
    handleExport,
    handleExportAllClassrooms
  }
}
