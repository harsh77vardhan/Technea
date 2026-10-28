import { useState } from 'react'
import { Lock, Check, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { resetPasswordApi } from '../../services/api'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null)

  const token = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('token')
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setStatus('loading')
    setError(null)
    try {
      await resetPasswordApi(token, password)
      setStatus('success')
    } catch {
      setError('This reset link is invalid or has expired. Please request a new one.')
      setStatus('error')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white relative selection:bg-[#333] selection:text-white overflow-hidden">
        <div
          className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0A0A0A]/95 p-8 text-center shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#14151a] text-neutral-300 shadow-sm">
            <AlertCircle className="h-6 w-6 text-neutral-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">Invalid Reset Link</h1>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
            This password reset token is missing or has already expired.
          </p>
          <button
            onClick={() => {
              window.location.href = '/'
            }}
            className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#222] bg-[#0d0d0d] px-5 py-2.5 text-sm font-medium text-neutral-300 hover:border-[#444] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    )
  }

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

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0A0A0A]/95 p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-mono text-neutral-300 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 animate-pulse" />
            <span>TECHNEA // CREDENTIALS</span>
          </div>

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#14151a] text-neutral-300 shadow-sm">
            <Lock className="h-5 w-5 text-neutral-200" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Set New Password</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Choose a secure passphrase for your developer account
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] text-white shadow-sm">
              <Check className="h-6 w-6 text-white" />
            </div>
            <p className="text-white font-bold text-base mb-1">Password Updated</p>
            <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
              Your credentials have been securely refreshed. You may now authenticate.
            </p>
            <button
              onClick={() => {
                window.location.href = '/?open_auth=1'
              }}
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-400 font-mono leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-neutral-400">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-black/60 py-2.5 px-4 text-xs font-mono text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-neutral-400">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-black/60 py-2.5 px-4 text-xs font-mono text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer shadow-md pt-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
