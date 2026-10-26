import { useState } from 'react'
import { resetPasswordApi } from '../../services/api'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null)

  const token = new URLSearchParams(window.location.search).get('token')

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
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">Invalid Link</h1>
          <p className="text-neutral-400 text-sm">This password reset link is invalid.</p>
          <button
            onClick={() => { window.location.href = '/' }}
            className="mt-6 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
            <svg className="h-5 w-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">Set New Password</h1>
          <p className="text-neutral-400 text-sm mt-1">Choose a strong password for your account</p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-2">Password Updated</p>
            <p className="text-neutral-400 text-sm mb-6">You can now sign in with your new password.</p>
            <button
              onClick={() => { window.location.href = '/' }}
              className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 px-4 text-sm text-white placeholder-neutral-500 focus:border-white/20 focus:outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 px-4 text-sm text-white placeholder-neutral-500 focus:border-white/20 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-100 transition disabled:opacity-50 cursor-pointer"
            >
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
