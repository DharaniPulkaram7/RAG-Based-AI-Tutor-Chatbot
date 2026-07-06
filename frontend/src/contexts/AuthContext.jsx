import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('smartedu_user') || 'null'))
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('smartedu_token')))

  useEffect(() => {
    if (!localStorage.getItem('smartedu_token')) return setLoading(false)
    api.get('/auth/me').then(({ data }) => {
      setUser(data)
      localStorage.setItem('smartedu_user', JSON.stringify(data))
    }).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  const authenticate = (payload) => {
    localStorage.setItem('smartedu_token', payload.access_token)
    localStorage.setItem('smartedu_user', JSON.stringify(payload.user))
    setUser(payload.user)
  }
  const logout = async () => {
    try { await api.post('/auth/logout') } catch { /* token cleanup still applies */ }
    localStorage.removeItem('smartedu_token')
    localStorage.removeItem('smartedu_user')
    setUser(null)
  }
  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>
}

