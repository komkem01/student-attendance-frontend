import { computed } from 'vue'

export const useTeacherSession = () => {
  const session = useCookie<any>('teacher_session')
  const token = useCookie<any>('teacher_token')

  const teacherProfile = computed(() => {
    if (!session.value) {
      return {
        name: 'ไม่พบข้อมูล',
        title: '',
        school: '',
        subject: '',
        email: '',
        avatarInitials: 'คร'
      }
    }
    const prefix = session.value.prefix || ''
    const fname = session.value.firstname || ''
    const lname = session.value.lastname || ''
    const fullName = `${prefix}${fname} ${lname}`.trim()
    const initials = fname ? fname.slice(0, 2) : 'คร'

    return {
      name: fullName,
      title: `คุณครูประจำวิชา${session.value.subject_taught || ''}`,
      school: session.value.school_name || 'โรงเรียนทั่วไป',
      subject: session.value.subject_taught || '',
      email: session.value.email || '',
      avatarInitials: initials
    }
  })

  const requireAuth = () => {
    if (!session.value) {
      navigateTo('/teachers/login')
    }
  }

  const logout = () => {
    session.value = null
    token.value = null
    navigateTo('/teachers/login')
  }

  return {
    session,
    teacherProfile,
    requireAuth,
    logout
  }
}
