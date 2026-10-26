import { useEffect } from 'react'
import { setAuthToken } from '../../services/api'

export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      console.error('OAuth error:', error)
      window.location.href = '/?auth_error=google_failed'
      return
    }

    if (token) {
      setAuthToken(token)
      // Redirect to home — AuthContext will rehydrate
      window.location.href = '/'
    } else {
      window.location.href = '/?auth_error=no_token'
    }
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}
