import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const OAuthCallback = () => {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')
    if (error) {
      navigate('/login?error=oauth_failed')
      return
    }
    if (token) {
      login(token)
      navigate('/dashboard')
      return
    }
    navigate('/login')
  }, [params, login, navigate])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-syne text-text-2 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}
