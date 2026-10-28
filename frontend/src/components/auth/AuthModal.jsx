import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Shield } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

function formatAuthError(err, fallbackMessage) {
  if (!err) return fallbackMessage
  const candidate =
    err?.response?.data?.detail ??
    err?.detail ??
    err?.response?.data?.message ??
    err?.message
  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate
  }
  if (Array.isArray(candidate)) {
    return candidate
      .map((item) => (typeof item === 'string' ? item : item?.msg || JSON.stringify(item)))
      .join(', ')
  }
  if (candidate && typeof candidate === 'object') {
    return candidate.message || JSON.stringify(candidate)
  }
  return fallbackMessage
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, signup, forgotPassword, loginWithGoogle, sendOtp, verifyOtp } = useAuth()
  const [mode, setMode] = useState(initialMode || 'login') // 'otp' | 'otp-verify' | 'login' | 'signup' | 'forgot'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const emailInputRef = useRef(null)
  const otpInputRef = useRef(null)
  const submittingRef = useRef(false)
  const lastAttemptedOtpRef = useRef('')

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Defer setState to avoid react-hooks/set-state-in-effect lint rule
      Promise.resolve().then(() => {
        setMode(initialMode || 'login')
        setError(null)
        setSuccessMsg(null)
        setOtp('')
        setGoogleLoading(false)
        lastAttemptedOtpRef.current = ''
      })
      const timer = setTimeout(() => {
        if (initialMode === 'otp-verify') {
          otpInputRef.current?.focus()
        } else {
          emailInputRef.current?.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, initialMode])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Resend cooldown countdown timer (60s)
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Auto-focus OTP input when entering 'otp-verify' mode
  useEffect(() => {
    if (isOpen && mode === 'otp-verify') {
      const timer = setTimeout(() => {
        otpInputRef.current?.focus()
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [isOpen, mode])

  // Screen 1: Send OTP handler
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError('Please provide a valid email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await sendOtp(cleanEmail)
      setResendCooldown(60)
      setMode('otp-verify')
      setSuccessMsg(`We sent a 6-digit code to ${cleanEmail}`)
      setOtp('')
      lastAttemptedOtpRef.current = ''
    } catch (err) {
      console.error('Send OTP error:', err)
      setError(formatAuthError(err, 'Failed to send verification code. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // Screen 2: Verify OTP handler
  const handleVerifyOtp = useCallback(async (e) => {
    if (e) e.preventDefault()
    if (loading || submittingRef.current) return
    const cleanOtp = otp.trim()
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    lastAttemptedOtpRef.current = cleanOtp
    submittingRef.current = true
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await verifyOtp(email.trim(), cleanOtp)
      setSuccessMsg('Signed in successfully!')
      setTimeout(() => {
        onClose()
      }, 400)
    } catch (err) {
      console.error('OTP verification error:', err)
      setError(formatAuthError(err, 'Invalid or expired verification code. Please try again.'))
      otpInputRef.current?.select()
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }, [email, otp, loading, verifyOtp, onClose])

  // Auto-submit OTP on 6th digit after slight delay (300ms)
  useEffect(() => {
    if (
      mode === 'otp-verify' &&
      otp.length === 6 &&
      !loading &&
      lastAttemptedOtpRef.current !== otp
    ) {
      const timer = setTimeout(() => {
        handleVerifyOtp()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [otp, mode, loading, handleVerifyOtp])

  // Filter non-numeric characters for OTP
  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(val)
    if (error) setError(null)
    if (val !== lastAttemptedOtpRef.current) {
      lastAttemptedOtpRef.current = ''
    }
  }

  // Resend OTP handler in Screen 2
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading || loading) return
    setResendLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await sendOtp(email.trim())
      setResendCooldown(60)
      setSuccessMsg('A new verification code has been sent.')
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError(formatAuthError(err, 'Failed to resend code. Please try again.'))
    } finally {
      setResendLoading(false)
    }
  }

  // Switch back to Screen 1 ('otp') with email preserved
  const handleChangeEmail = () => {
    setMode('otp')
    setError(null)
    setSuccessMsg(null)
    setOtp('')
    lastAttemptedOtpRef.current = ''
    setTimeout(() => {
      emailInputRef.current?.focus()
    }, 100)
  }

  // Password Login / Signup handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!email.trim() || !password) {
      setError('Please provide all required fields.')
      return
    }

    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signup(email.trim(), password, fullName.trim())
        setSuccessMsg('Account created successfully!')
      } else {
        await login(email.trim(), password)
        setSuccessMsg('Welcome back!')
      }
      setTimeout(() => {
        onClose()
      }, 400)
    } catch (err) {
      console.error('Auth error:', err)
      setError(formatAuthError(err, 'Authentication failed. Please check your credentials.'))
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth handler
  const handleGoogleLogin = async () => {
    if (loading || googleLoading) return
    setGoogleLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await loginWithGoogle()
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError(formatAuthError(err, 'Google sign-in is currently unavailable. Please try email instead.'))
      setGoogleLoading(false)
    }
  }

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await forgotPassword(email)
      setSuccessMsg("If that email exists, you'll receive a reset link shortly.")
    } catch (err) {
      console.error('Forgot password error:', err)
      setError(formatAuthError(err, 'Something went wrong. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Account Authentication"
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c10]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          {/* Subtle Ambient Studio Lighting */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]"
            aria-hidden="true"
          />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/[0.06]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Back Navigation for 'forgot' and 'otp-verify' */}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
                setSuccessMsg(null)
              }}
              className="relative inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to sign in</span>
            </button>
          )}

          {mode === 'otp-verify' && (
            <button
              type="button"
              onClick={handleChangeEmail}
              className="relative inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to email</span>
            </button>
          )}

          {/* Header */}
          <div className="relative text-center mb-6">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.12] bg-[#14151a] text-white shadow-sm">
              {mode === 'otp-verify' ? (
                <Shield className="h-5 w-5 text-neutral-200" />
              ) : mode === 'signup' ? (
                <User className="h-5 w-5 text-neutral-200" />
              ) : (
                <Lock className="h-5 w-5 text-neutral-200" />
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {mode === 'otp'
                ? 'Welcome to Technea'
                : mode === 'otp-verify'
                ? 'Enter verification code'
                : mode === 'forgot'
                ? 'Reset Password'
                : mode === 'login'
                ? 'Welcome Back'
                : 'Create Your Account'}
            </h2>
            <div className="mt-1 text-xs text-neutral-400">
              {mode === 'otp' ? (
                <p>Enter your email for instant passwordless sign-in</p>
              ) : mode === 'otp-verify' ? (
                <div className="space-y-1">
                  <p>
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-neutral-200">{email}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Change email
                  </button>
                </div>
              ) : mode === 'forgot' ? (
                <p>Enter your email to receive a reset link</p>
              ) : mode === 'login' ? (
                <p>Sign in to access your saved roadmaps and progress</p>
              ) : (
                <p>Join Technea to track your skill milestones and courses</p>
              )}
            </div>
          </div>

          {/* Mode Switcher Tabs: [Email Code] | [Password] | [Create Account] */}
          {mode !== 'forgot' && mode !== 'otp-verify' && (
            <div className="relative flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.06] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('otp')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className={`flex-1 min-h-[40px] flex items-center justify-center px-2 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'otp'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Email Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className={`flex-1 min-h-[40px] flex items-center justify-center px-2 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className={`flex-1 min-h-[40px] flex items-center justify-center px-2 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              aria-live="polite"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-400 font-medium leading-relaxed break-words"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1 min-w-0 break-words">{error}</div>
            </motion.div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              aria-live="polite"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium leading-relaxed break-words"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 min-w-0 break-words">{successMsg}</div>
            </motion.div>
          )}

          {/* Screen 1: 'otp' Mode Form */}
          {mode === 'otp' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-white/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-100 focus:outline-none transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Email</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-[#1a1a1a]" />
                <span className="text-[11px] text-[#555] font-mono">or</span>
                <div className="flex-1 h-px bg-[#1a1a1a]" />
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2.5 text-sm font-medium text-neutral-200 hover:border-[#333] hover:bg-[#141414] hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M21.35 11.1H12v3.8h5.38c-.46 2.37-2.47 3.8-5.38 3.8-3.32 0-6-2.68-6-6s2.68-6 6-6c1.47 0 2.8.53 3.82 1.41l2.86-2.86C16.96 3.05 14.65 2.2 12 2.2 6.58 2.2 2.2 6.58 2.2 12s4.38 9.8 9.8 9.8c5.66 0 9.4-3.98 9.4-9.56 0-.61-.05-1.08-.05-1.14z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Bottom link: Prefer password */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Prefer password? <span className="underline underline-offset-2 text-neutral-300">Sign in with password</span>
                </button>
              </div>
            </form>
          )}

          {/* Screen 2: 'otp-verify' Mode Form */}
          {mode === 'otp-verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300 text-center">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={loading}
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    className="w-full text-center font-mono text-2xl sm:text-3xl font-bold tracking-[0.4em] sm:tracking-[0.55em] py-3.5 px-4 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white placeholder-neutral-600 focus:border-white/30 focus:bg-white/[0.06] focus:outline-none transition-all select-none disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-100 focus:outline-none transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Resend Cooldown Countdown / Action */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="text-xs text-neutral-400">
                  {resendCooldown > 0 ? (
                    <span className="text-neutral-400 font-mono">
                      Resend code in <span className="font-semibold text-neutral-200">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={resendLoading || loading}
                      onClick={handleResendOtp}
                      className="font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 underline underline-offset-4 disabled:opacity-50"
                    >
                      {resendLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Resend code</span>
                      )}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  Prefer password? <span className="underline underline-offset-2 text-neutral-400 hover:text-white">Sign in with password</span>
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Mode Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-white/20 focus:outline-none transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-100 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {/* Password Login & Signup Forms */}
          {(mode === 'login' || mode === 'signup') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-white/20 focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-white/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-neutral-300">
                    Password
                  </label>
                  {mode === 'signup' && (
                    <span className="text-[11px] text-neutral-500">Min 8 characters</span>
                  )}
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-white/20 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Google OAuth Button & Divider */}
              <div className="space-y-3 mb-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                  className="w-full inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2.5 text-sm font-medium text-neutral-200 hover:border-[#333] hover:bg-[#141414] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M21.35 11.1H12v3.8h5.38c-.46 2.37-2.47 3.8-5.38 3.8-3.32 0-6-2.68-6-6s2.68-6 6-6c1.47 0 2.8.53 3.82 1.41l2.86-2.86C16.96 3.05 14.65 2.2 12 2.2 6.58 2.2 2.2 6.58 2.2 12s4.38 9.8 9.8 9.8c5.66 0 9.4-3.98 9.4-9.56 0-.61-.05-1.08-.05-1.14z" />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#1a1a1a]" />
                  <span className="text-[11px] text-[#444] font-mono">or</span>
                  <div className="flex-1 h-px bg-[#1a1a1a]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-100 focus:outline-none transition cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Technea' : 'Get Started'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="mt-5 text-center text-xs text-neutral-500 space-y-2">
              {mode === 'login' ? (
                <>
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className="font-semibold text-neutral-300 hover:text-white hover:underline cursor-pointer"
                    >
                      Create one now
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('otp')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className="text-neutral-400 hover:text-white underline underline-offset-2 cursor-pointer transition-colors"
                    >
                      Prefer passwordless? Continue with Email Code
                    </button>
                  </p>
                </>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError(null)
                      setSuccessMsg(null)
                    }}
                    className="font-semibold text-neutral-300 hover:text-white hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
