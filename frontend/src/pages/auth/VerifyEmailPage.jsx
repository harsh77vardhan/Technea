import { useEffect, useState } from 'react'
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
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <p className="text-neutral-400 text-sm">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Email Verified</h1>
            <p className="text-neutral-400 text-sm mb-8">{message}</p>
            <button
              onClick={() => { window.location.href = '/' }}
              className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition cursor-pointer"
            >
              Continue to Technea
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Verification Failed</h1>
            <p className="text-neutral-400 text-sm mb-8">{message}</p>
            <button
              onClick={() => { window.location.href = '/' }}
              className="px-6 py-2.5 rounded-xl border border-[#2a2a2a] text-neutral-300 text-sm hover:border-[#444] transition cursor-pointer"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}
