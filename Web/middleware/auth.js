export default defineNuxtRouteMiddleware((to, from) => {
  // Skip auth check for login page and public routes
  if (to.path === '/' || to.path === '/login' || to.path.startsWith('/_nuxt') || to.path.startsWith('/assets')) {
    return
  }

  // Check if user is logged in (has token)
  if (process.client) {
    const token = localStorage.getItem('token')
    if (!token) {
      return navigateTo('/')
    }
  }
})
