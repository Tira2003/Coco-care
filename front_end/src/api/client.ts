import axios from 'axios'

const TOKEN_KEY = 'coco_token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear the session on real auth failures from the API —
    // not on network/backend-down errors (those would log users out unfairly).
    const status = error.response?.status
    if (status === 401) {
      const url = String(error.config?.url ?? '')
      const isAuthLogin = url.includes('/auth/login') || url.includes('/auth/register')
      if (!isAuthLogin) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('coco_user')
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export { TOKEN_KEY }
