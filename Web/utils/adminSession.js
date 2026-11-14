export const isAdminRole = role => ['admin', 'super_admin'].includes(role)

function claims(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')))
    return isAdminRole(payload.role) && typeof payload.userId === 'string' && Number.isFinite(payload.exp) && payload.exp * 1000 > Date.now() ? payload : null
  } catch { return null }
}

// This check only controls client navigation; the server still verifies the JWT signature.
export function readAdminSession(storage = localStorage) {
  for (const [tokenKey, userKey] of [['admin_token', 'admin_user'], ['token', 'user']]) {
    const token = storage.getItem(tokenKey), payload = token && claims(token)
    if (!payload) continue
    let user = {}
    try { user = JSON.parse(storage.getItem(userKey) || '{}') || {} } catch {}
    if (user.userId !== payload.userId) user = {}
    user = { ...user, userId: payload.userId, role: payload.role }
    storage.setItem('admin_token', token)
    storage.setItem('admin_user', JSON.stringify(user))
    return { token, user }
  }
  storage.removeItem('admin_token'); storage.removeItem('admin_user')
  return null
}

export function saveAdminSession(data, storage = localStorage) {
  const payload = claims(data.token || '')
  if (!payload || payload.role !== data.role || payload.userId !== data.userId) throw new Error('این حساب دسترسی مدیریت ندارد. با حساب مدیر وارد شوید.')
  const user = Object.fromEntries(['userId', 'role', 'firstName', 'lastName', 'phone', 'email'].map(key => [key, data[key]]))
  storage.setItem('admin_token', data.token); storage.setItem('admin_user', JSON.stringify(user))
}

export function clearAdminSession(storage = localStorage, expectedToken) {
  const token = storage.getItem('admin_token')
  if (expectedToken && token !== expectedToken) return
  storage.removeItem('admin_token'); storage.removeItem('admin_user')
  // Retire only the matching legacy staff session, preserving passenger sessions.
  if (token && storage.getItem('token') === token) { storage.removeItem('token'); storage.removeItem('user') }
}
