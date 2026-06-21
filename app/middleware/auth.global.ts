export default defineNuxtRouteMiddleware((to) => {
  // Teacher authentication and redirection
  if (to.path.startsWith('/teachers')) {
    const token = useCookie('teacher_token')
    const isPublicRoute = to.path === '/teachers/login' || to.path === '/teachers/register'

    if (!token.value && !isPublicRoute) {
      // Not logged in -> redirect to login page
      return navigateTo('/teachers/login')
    }

    if (token.value && isPublicRoute) {
      // Already logged in -> redirect to dashboard page
      return navigateTo('/teachers/dashboard')
    }
  }

  // Prefect authentication and redirection
  if (to.path.startsWith('/prefect')) {
    const token = useCookie('prefect_token')
    const isPublicRoute = to.path === '/prefect/login'

    if (!token.value && !isPublicRoute) {
      // Not logged in -> redirect to login page
      return navigateTo('/prefect/login')
    }

    if (token.value && isPublicRoute) {
      // Already logged in -> redirect to check-in page
      return navigateTo('/prefect/check-in')
    }
  }
})
