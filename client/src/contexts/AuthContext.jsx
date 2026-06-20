import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('ll_token'))
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  const fetchMe = useCallback(async (t) => {
    try {
      const res = await api.get('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      setUser(res.data.data)
    } catch {
      localStorage.removeItem('ll_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/user/profile')
      setUserProfile(res.data.data)
      return res.data.data
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (token) fetchMe(token)
    else setIsLoading(false)
  }, [token, fetchMe])

  useEffect(() => {
    if (user) fetchProfile()
  }, [user, fetchProfile])

  const login = useCallback((newToken) => {
    localStorage.setItem('ll_token', newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ll_token')
    setToken(null)
    setUser(null)
    setUserProfile(null)
  }, [])

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('ll:logout', handler)
    return () => window.removeEventListener('ll:logout', handler)
  }, [logout])

  const getUserContext = useCallback(() => {
    if (!userProfile) return null
    return {
      goals: userProfile.prefs?.healthGoals || [],
      dietaryPreferences: userProfile.prefs?.dietaryPreferences || [],
      allergies: {
        commonAllergens: userProfile.allergy?.commonAllergens || [],
        customAllergens: userProfile.allergy?.customAllergens || [],
      },
      avoided: userProfile.avoided?.ingredients || [],
    }
  }, [userProfile])

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, userProfile, login, logout, fetchProfile, getUserContext }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
