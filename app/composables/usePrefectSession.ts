import { computed } from 'vue'

export const usePrefectSession = () => {
  const session = useCookie<any>('prefect_session')
  const token = useCookie<any>('prefect_token')

  const prefectProfile = computed(() => {
    if (!session.value) {
      return {
        name: 'ไม่พบข้อมูล',
        code: '',
        phone: '',
        classroomId: '',
        studentId: '',
        avatarInitials: 'สว'
      }
    }
    const prefix = session.value.prefix || ''
    const fname = session.value.firstname || ''
    const lname = session.value.lastname || ''
    const fullName = `${prefix}${fname} ${lname}`.trim()
    const initials = fname ? fname.slice(0, 2) : 'สว'

    return {
      name: fullName,
      code: session.value.code || '',
      phone: session.value.phone || '',
      classroomId: session.value.classroom_id || '',
      studentId: session.value.student_id || '',
      avatarInitials: initials
    }
  })

  const requireAuth = () => {
    if (!session.value) {
      navigateTo('/prefect/login')
    }
  }

  const logout = () => {
    session.value = null
    token.value = null
    navigateTo('/prefect/login')
  }

  return {
    session,
    prefectProfile,
    requireAuth,
    logout
  }
}
