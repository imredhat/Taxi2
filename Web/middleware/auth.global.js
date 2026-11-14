import { readAdminSession } from '~/utils/adminSession'

export default defineNuxtRouteMiddleware((to) => {
  if (!process.client || !/^\/panel(?:\/|$)/.test(to.path)) return

  if (!readAdminSession()) return navigateTo('/login', { replace: true })
  if (to.path.replace(/\/$/, '') === '/panel') return navigateTo('/panel/dashboard', { replace: true })
})
