// One small fetch wrapper for the website and the admin panel.
const TOKEN_KEY = 'aexto_admin_token'

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
export const setToken = token => {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ }
}

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.status = status
    this.fields = fields || {}
  }
}

async function request(path, { method = 'GET', body, auth = false, form = false } = {}) {
  const headers = {}
  if (auth) headers.Authorization = `Bearer ${getToken()}`
  if (body && !form) headers['Content-Type'] = 'application/json'
  let res
  try {
    res = await fetch(path, { method, headers, body: body ? (form ? body : JSON.stringify(body)) : undefined })
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken('')
      window.dispatchEvent(new Event('aexto:signed-out'))
    }
    throw new ApiError(data.error || 'Something went wrong.', res.status, data.fields)
  }
  return data
}

export const api = {
  get: path => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
}

export const adminApi = {
  get: path => request(`/api/admin${path}`, { auth: true }),
  post: (path, body) => request(`/api/admin${path}`, { method: 'POST', body, auth: true }),
  put: (path, body) => request(`/api/admin${path}`, { method: 'PUT', body, auth: true }),
  patch: (path, body) => request(`/api/admin${path}`, { method: 'PATCH', body, auth: true }),
  del: path => request(`/api/admin${path}`, { method: 'DELETE', auth: true }),
  upload: files => {
    const form = new FormData()
    ;[...files].forEach(f => form.append('files', f))
    return request('/api/admin/upload', { method: 'POST', body: form, auth: true, form: true })
  },
}

export const authApi = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me', { auth: true }),
  account: body => request('/api/auth/account', { method: 'POST', body, auth: true }),
}

export const formatPrice = n => (n == null ? '' : `₹${Number(n).toLocaleString('en-IN')}`)
