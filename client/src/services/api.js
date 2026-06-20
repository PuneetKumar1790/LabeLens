import axios from 'axios'

const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const api = axios.create({ baseURL: apiBase })

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ll_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ll_token')
      window.dispatchEvent(new Event('ll:logout'))
    }
    return Promise.reject(err)
  }
)

export default api
