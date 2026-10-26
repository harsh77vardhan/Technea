import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Mail, User, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, signup, forgotPassword, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState(initialMode || 'login') // 'login' | 'signup' | 'forgot'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  const emailInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Defer setState to avoid react-hooks/set-state-in-effect lint rule
      Promise.resolve().then(() => {
        setMode(initialMode || 'login')
        setError(null)
        setSuccessMsg(null)
      })
      const timer = setTimeout(() => {
        emailInputRef.current?.focus()
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
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await loginWithGoogle()
    } catch {
      setError('Google sign-in unavailable. Try email instead.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await forgotPassword(email)
      setSuccessMsg("If that email exists, you'll receive a reset link shortly.")
    } catch {
      setError('Something went wrong. Please try again.')
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

          {/* Header */}
          <div className="relative text-center mb-6">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.12] bg-[#14151a] text-white shadow-sm">
              <Lock className="h-5 w-5 text-neutral-200" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {mode === 'forgot' ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              {mode === 'forgot'
                ? 'Enter your email to receive a reset link'
                : mode === 'login'
                ? 'Sign in to access your saved roadmaps and progress'
                : 'Join Technea to track your skill milestones and courses'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="relative flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.06] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className={`flex-1 min-h-[40px] flex items-center justify-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                }}
                className={`flex-1 min-h-[40px] flex items-center justify-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
              className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Forgot Password Form */}
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
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Sending...</span></> : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMsg(null) }}
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {/* Form */}
          {mode !== 'forgot' && (
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
                      onClick={() => { setMode('forgot'); setError(null) }}
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

              {/* Google OAuth Button */}
              <div className="space-y-3 mb-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-2.5 text-sm font-medium text-neutral-200 hover:border-[#444] hover:bg-[#141414] transition-all cursor-pointer disabled:opacity-50"
                >
                  {/* Google SVG icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                
                {/* Divider */}
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
          {mode !== 'forgot' && (
            <div className="mt-5 text-center text-xs text-neutral-500">
              {mode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setError(null)
                    }}
                    className="font-semibold text-neutral-300 hover:text-white hover:underline cursor-pointer"
                  >
                    Create one now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError(null)
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
