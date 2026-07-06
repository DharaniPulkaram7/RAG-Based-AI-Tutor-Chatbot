import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartedu_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartedu_token')
      localStorage.removeItem('smartedu_user')
    }
    return Promise.reject(error)
  },
)
export const errorMessage = (error) => error.response?.data?.detail || error.message || 'Something went wrong'
export default api

