import { useEffect, useState } from 'react'
import { setAuthToken } from '../../services/api'
import { AlertCircle, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react'

export default function AuthCallbackPage() {
  const [authData] = useState(() => {
    if (typeof window === 'undefined') {
      return { token: null, error: null, errorDescription: null }
    }
    const params = new URLSearchParams(window.location.search)
    return {
      token: params.get('token'),
      error: params.get('error'),
      errorDescription: params.get('error_description') || params.get('message'),
    }
  })

  useEffect(() => {
    if (authData.token) {
      setAuthToken(authData.token)
      const timer = setTimeout(() => {
        window.location.replace('/dashboard')
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [authData.token])

  // Derive human-readable error explanation matching luxury design tone
  const getErrorExplanation = () => {
    if (authData.errorDescription) {
      return authData.errorDescription
    }
    const err = String(authData.error || '').toLowerCase()
    if (err === 'access_denied' || err === 'consent_denied') {
      return 'Google sign-in was canceled or access was denied.'
    }
    if (err === 'google_failed') {
      return 'Google authentication encountered an issue while verifying your credentials.'
    }
    if (err === 'no_token') {
      return 'Authentication could not be completed because no access token was received.'
    }
    if (authData.error) {
      return `Google sign-in was canceled or encountered an issue (${authData.error}).`
    }
    return 'Google sign-in was canceled or encountered an issue.'
  }

  // State 1: Token Present -> Sleek Technea Luxury Loading State
  if (authData.token) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white selection:bg-[#333] selection:text-white">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0a0c10]/95 p-8 text-center shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
          {/* Subtle Ambient Lighting */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* Sleek Monochrome Loading Spinner */}
            <div className="relative mx-auto mb-6 h-12 w-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white mb-2">
              Signing you in with Google...
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Verifying your session and redirecting directly to your dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // State 2: Error Present -> Luxury Monochrome Error Card
  if (authData.error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white selection:bg-[#333] selection:text-white">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0a0c10]/95 p-8 text-center shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
          {/* Subtle Ambient Lighting */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* Monochrome Warning Icon Container */}
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#14151a] text-white shadow-sm">
              <AlertCircle className="h-6 w-6 text-neutral-300" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white mb-2">
              Sign In Notice
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              {getErrorExplanation()}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href="/?open_auth=1"
                className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/"
                className="w-full inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-2.5 text-xs font-medium text-neutral-300 hover:border-[#444] hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // State 3: No Token & No Error -> Fallback Card
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white selection:bg-[#333] selection:text-white">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0a0c10]/95 p-8 text-center shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        {/* Subtle Ambient Lighting */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#14151a] text-white shadow-sm">
            <HelpCircle className="h-6 w-6 text-neutral-300" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            Authentication Link Inactive
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6">
            No authentication credentials or error parameters were found. Please sign in again or return home.
          </p>

          <div className="space-y-3">
            <a
              href="/"
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <span>Return to Home</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="/?open_auth=1"
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-2.5 text-xs font-medium text-neutral-300 hover:border-[#444] hover:text-white transition-all cursor-pointer"
            >
              <span>Sign In with Existing Account</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
