import { readAdminSession, clearAdminSession } from '~/utils/adminSession'
// Auth composable — check login state and role
export const useAuth = () => {
  const user = useState('auth_user', () => null)

  const loadUser = () => {
    if (import.meta.client) {
      user.value = readAdminSession()?.user || null
    }
  }

  const isLoggedIn = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
  })

  const logout = () => {
    clearAdminSession()
    user.value = null
    navigateTo('/login')
  }

  const hasRole = (roles) => {
    if (!user.value) return false
    if (typeof roles === 'string') return user.value.role === roles
    return roles.includes(user.value.role)
  }

  return { user, loadUser, isLoggedIn, userRole, userName, logout, hasRole }
}
