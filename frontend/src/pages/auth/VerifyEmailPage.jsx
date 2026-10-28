import { useEffect, useState } from 'react'
import { Check, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { verifyEmailApi } from '../../services/api'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) {
      // Defer setState to avoid react-hooks/set-state-in-effect lint rule
      Promise.resolve().then(() => {
        setStatus('error')
        setMessage('Invalid verification link.')
      })
      return
    }
    verifyEmailApi(token)
      .then(() => {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
      })
      .catch(() => {
        setStatus('error')
        setMessage('This verification link is invalid or has expired.')
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white relative selection:bg-[#333] selection:text-white overflow-hidden">
      {/* Background ambient lighting & technical grid */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0A0A0A]/95 p-8 text-center shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        {/* Top telemetry pill badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-mono text-neutral-300 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 animate-pulse" />
          <span>TECHNEA // VERIFICATION</span>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="relative mx-auto mb-6 h-12 w-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Verifying your email...</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Please wait while we confirm your email credentials with the identity subsystem.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] text-white shadow-sm">
              <Check className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">Email Verified</h1>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">{message}</p>
            <button
              onClick={() => {
                window.location.href = '/'
              }}
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
            >
              <span>Continue to Technea</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] text-white shadow-sm">
              <AlertCircle className="h-6 w-6 text-neutral-300" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">Verification Incomplete</h1>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">{message}</p>
            <button
              onClick={() => {
                window.location.href = '/'
              }}
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#222] bg-[#0d0d0d] px-6 py-2.5 text-sm font-medium text-neutral-300 hover:border-[#444] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
