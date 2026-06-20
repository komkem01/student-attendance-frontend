import { ref, reactive } from 'vue'

export const useLoginForm = (showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void) => {
  const form = reactive({
    emailOrId: '',
    password: '',
    rememberMe: false
  })

  const isLoading = ref(false)
  const isSuccess = ref(false)
  const hasError = ref(false)

  const handleLogin = async () => {
    hasError.value = false

    if (!form.emailOrId.trim()) {
      showToast('กรุณากรอกอีเมลหรือรหัสประจำตัวครู', 'warning')
      return
    }

    if (!form.password) {
      showToast('กรุณากรอกรหัสผ่าน', 'warning')
      return
    }

    if (form.password.length < 6) {
      showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'warning')
      return
    }

    isLoading.value = true
    try {
      const res: any = await $fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        body: {
          emailOrId: form.emailOrId.trim(),
          password: form.password
        }
      })

      // Store Token in cookie
      const tokenCookie = useCookie('teacher_token', {
        maxAge: form.rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 days
        path: '/'
      })
      tokenCookie.value = res.data.token

      // Store Session in cookie
      const sessionCookie = useCookie('teacher_session', {
        maxAge: form.rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 days
        path: '/'
      })
      sessionCookie.value = res.data

      isSuccess.value = true
      showToast('เข้าสู่ระบบสำเร็จ', 'success')
      setTimeout(() => {
        navigateTo('/teachers/dashboard')
      }, 1500)
    } catch (err: any) {
      hasError.value = true
      const errorMsg = err.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง'
      showToast(errorMsg, 'error')
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    isLoading,
    isSuccess,
    hasError,
    handleLogin
  }
}
