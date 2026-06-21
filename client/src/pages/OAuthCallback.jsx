import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const OAuthCallback = () => {
  const [params] = useSearchParams()
  const { login, token: contextToken, user, isLoading } = useAuth()
  const navigate = useNavigate()

  const urlToken = params.get('token')
  const oauthError = params.get('error')

  // Trigger login action if token is in URL
  useEffect(() => {
    if (oauthError) {
      navigate(`/login?error=${oauthError}`)
      return
    }
    if (urlToken) {
      login(urlToken)
    } else {
      navigate('/login')
    }
  }, [urlToken, oauthError, login, navigate])

  // Navigate only after the context token has updated and the user fetch is complete
  useEffect(() => {
    if (urlToken && contextToken === urlToken) {
      if (!isLoading) {
        if (user) {
          navigate('/dashboard')
        } else {
          navigate('/login?error=oauth_failed')
        }
      }
    }
  }, [urlToken, contextToken, user, isLoading, navigate])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-syne text-text-2 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}
