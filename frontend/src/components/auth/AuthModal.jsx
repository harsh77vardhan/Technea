import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Mail, User, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  const emailInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, mode])

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
          {/* Faint Radial Glow */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.15),transparent_70%)]"
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
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              {mode === 'login'
                ? 'Sign in to access your saved roadmaps and progress'
                : 'Join Technea to track your skill milestones and courses'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
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

          {/* Form */}
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
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
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
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
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
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition cursor-pointer disabled:opacity-50 mt-2"
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

          {/* Footer note */}
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
                  className="font-semibold text-blue-400 hover:underline cursor-pointer"
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
                  className="font-semibold text-blue-400 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
