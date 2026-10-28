import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  AtSign,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Upload,
  Loader2,
  Sparkles,
  Camera,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { uploadAvatarApi, getAuthToken } from '../../services/api'

// 6 Luxury Monochrome Geometric SVG Avatars
const PRESET_AVATARS = [
  {
    id: 'monolith',
    label: 'Monolith',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%230D0D0D"/><circle cx="50" cy="50" r="38" stroke="%23333333" stroke-width="1.5"/><circle cx="50" cy="50" r="26" stroke="%23555555" stroke-width="1" stroke-dasharray="3 3"/><polygon points="50,22 74,36 74,64 50,78 26,64 26,36" stroke="%23FFFFFF" stroke-width="1.8" fill="%23141414"/><circle cx="50" cy="50" r="6" fill="%23FFFFFF"/></svg>`,
  },
  {
    id: 'hypercube',
    label: 'Hypercube',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%230D0D0D"/><circle cx="50" cy="50" r="38" stroke="%23262626" stroke-width="1"/><polygon points="50,24 75,38 50,52 25,38" stroke="%23FFFFFF" stroke-width="1.5" fill="%23181818"/><polygon points="25,38 50,52 50,78 25,64" stroke="%23D4D4D4" stroke-width="1.5" fill="%23121212"/><polygon points="50,52 75,38 75,64 50,78" stroke="%23A3A3A3" stroke-width="1.5" fill="%230A0A0A"/></svg>`,
  },
  {
    id: 'neural-matrix',
    label: 'Neural Matrix',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%230D0D0D"/><circle cx="50" cy="50" r="36" stroke="%23333333" stroke-width="1"/><circle cx="50" cy="50" r="22" stroke="%23666666" stroke-width="1"/><line x1="14" y1="50" x2="86" y2="50" stroke="%23404040" stroke-width="1" stroke-dasharray="2 2"/><line x1="50" y1="14" x2="50" y2="86" stroke="%23404040" stroke-width="1" stroke-dasharray="2 2"/><polygon points="50,32 68,50 50,68 32,50" stroke="%23FFFFFF" stroke-width="1.6" fill="%231A1A1A"/><circle cx="50" cy="50" r="4" fill="%23FFFFFF"/></svg>`,
  },
  {
    id: 'apex-delta',
    label: 'Apex Delta',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%230D0D0D"/><circle cx="50" cy="50" r="38" stroke="%232B2B2B" stroke-width="1"/><polygon points="50,22 76,68 24,68" stroke="%23FFFFFF" stroke-width="1.8" fill="%23161616"/><polygon points="50,42 64,68 36,68" stroke="%23888888" stroke-width="1.2" fill="%230D0D0D"/><line x1="50" y1="22" x2="50" y2="42" stroke="%23FFFFFF" stroke-width="1.5"/><circle cx="50" cy="54" r="3" fill="%23FFFFFF"/></svg>`,
  },
  {
    id: 'zenith-star',
    label: 'Zenith Star',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%230D0D0D"/><circle cx="50" cy="50" r="38" stroke="%23262626" stroke-width="1"/><circle cx="50" cy="50" r="28" stroke="%23404040" stroke-width="1" stroke-dasharray="4 2"/><path d="M50 20 L53 43 L76 43 L57 55 L64 77 L50 63 L36 77 L43 55 L24 43 L47 43 Z" stroke="%23FFFFFF" stroke-width="1.6" fill="%23171717"/><circle cx="50" cy="50" r="3" fill="%23FFFFFF"/></svg>`,
  },
  {
    id: 'solar-eclipse',
    label: 'Solar Eclipse',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%230D0D0D"/><circle cx="50" cy="50" r="32" stroke="%23333333" stroke-width="1"/><path d="M22 50 A28 28 0 0 1 78 50" stroke="%23FFFFFF" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="52" r="24" fill="%230D0D0D" stroke="%23525252" stroke-width="1.2"/><circle cx="50" cy="22" r="2.5" fill="%23FFFFFF"/></svg>`,
  },
]

const GOAL_OPTIONS = [
  'Build Production Apps',
  'Master AI & Systems',
  'Land Senior Role',
  'Explore & Tinker',
]

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']

const FOCUS_OPTIONS = [
  'AI & Agents',
  'Full-Stack Web',
  'Systems & Cloud',
  'Rust & Low-Level',
  'Algorithms & Math',
]

export default function ProfileSetupPage() {
  const { user, isLoading, setupProfile, checkUsernameApi, openAuthModal } = useAuth()

  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState(() => user?.full_name || '')
  const [username, setUsername] = useState(() => user?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar_url || PRESET_AVATARS[0].dataUrl)
  const [selectedGoal, setSelectedGoal] = useState(GOAL_OPTIONS[0])
  const [selectedLevel, setSelectedLevel] = useState(LEVEL_OPTIONS[1])
  const [selectedFocus, setSelectedFocus] = useState(['AI & Agents', 'Full-Stack Web'])

  const [usernameStatus, setUsernameStatus] = useState({
    state: 'idle', // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const fileInputRef = useRef(null)
  const nameInputRef = useRef(null)
  const usernameInputRef = useRef(null)

  const fullNameInputId = useId()
  const handleInputId = useId()

  // Initialize fields from existing user if loaded asynchronously
  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        setFullName((prev) => (prev ? prev : user.full_name || ''))
        setUsername((prev) => (prev ? prev : user.username || ''))
        setAvatarUrl((prev) =>
          prev && prev !== PRESET_AVATARS[0].dataUrl ? prev : user.avatar_url || PRESET_AVATARS[0].dataUrl
        )
      })
    }
  }, [user])

  // If user has already completed profile, redirect directly to dashboard
  useEffect(() => {
    if (!isLoading && user && user.profile_completed) {
      window.location.replace('/dashboard')
    }
  }, [user, isLoading])

  // Focus input when entering Step 1 or Step 2
  useEffect(() => {
    if (step === 1) {
      nameInputRef.current?.focus()
    } else if (step === 2) {
      usernameInputRef.current?.focus()
    }
  }, [step])

  // Debounced username availability validation
  useEffect(() => {
    const clean = username.trim().replace(/^@/, '')
    if (!clean) {
      Promise.resolve().then(() => {
        setUsernameStatus({ state: 'idle', message: '' })
      })
      return
    }

    if (clean.length < 3) {
      Promise.resolve().then(() => {
        setUsernameStatus({
          state: 'invalid',
          message: 'Handle must be at least 3 characters',
        })
      })
      return
    }

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(clean)) {
      Promise.resolve().then(() => {
        setUsernameStatus({
          state: 'invalid',
          message: '3–24 characters: letters, numbers, and underscores only',
        })
      })
      return
    }

    // If matches user's current username, it's valid
    if (user?.username && clean.toLowerCase() === user.username.toLowerCase()) {
      Promise.resolve().then(() => {
        setUsernameStatus({
          state: 'available',
          message: 'Your current handle',
        })
      })
      return
    }

    Promise.resolve().then(() => {
      setUsernameStatus({
        state: 'checking',
        message: 'Checking handle availability...',
      })
    })

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameApi(clean)
        if (res && res.available === false) {
          setUsernameStatus({
            state: 'taken',
            message: res.message || 'Handle is already taken',
          })
        } else {
          setUsernameStatus({
            state: 'available',
            message: 'Handle is available',
          })
        }
      } catch (err) {
        const detail = err?.detail || err?.message || ''
        if (
          err?.status === 409 ||
          err?.status === 400 ||
          detail.toLowerCase().includes('taken') ||
          detail.toLowerCase().includes('exists')
        ) {
          setUsernameStatus({
            state: 'taken',
            message: typeof detail === 'string' && detail ? detail : 'Handle is already taken',
          })
        } else {
          // Graceful fallback for non-blocking onboarding
          setUsernameStatus({
            state: 'available',
            message: 'Handle looks good',
          })
        }
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [username, user?.username, checkUsernameApi])

  // Toggle multi-select focus pill
  const handleToggleFocus = (focusItem) => {
    setSelectedFocus((prev) => {
      if (prev.includes(focusItem)) {
        if (prev.length === 1) return prev // keep at least one
        return prev.filter((item) => item !== focusItem)
      }
      return [...prev, focusItem]
    })
  }

  // Handle custom image upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.')
      return
    }

    // Local instant preview via FileReader
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result)
      }
    }
    reader.readAsDataURL(file)

    // Optionally upload to backend storage if authenticated
    try {
      setIsUploadingAvatar(true)
      const res = await uploadAvatarApi(file)
      if (res?.avatar_url) {
        setAvatarUrl(res.avatar_url)
      }
    } catch {
      // Local Data URL preview will be retained and submitted in payload
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Handle final submission
  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    const cleanUsername = username.trim().replace(/^@/, '') || `user_${Date.now().toString(36)}`

    const payload = {
      full_name: fullName.trim() || user?.full_name || cleanUsername || 'Technea Engineer',
      username: cleanUsername,
      avatar_url: avatarUrl,
      learning_goal: selectedGoal,
      goal: selectedGoal,
      current_skill_level: selectedLevel,
      level: selectedLevel,
      experience_level: selectedLevel,
      interests: selectedFocus,
      primary_focus: selectedFocus,
      profile_completed: true,
    }

    try {
      await setupProfile(payload)
      setIsSuccess(true)
      setTimeout(() => {
        window.location.replace('/dashboard')
      }, 700)
    } catch (err) {
      console.error('Profile setup error:', err)
      const msg =
        err?.response?.data?.detail ||
        err?.detail ||
        err?.message ||
        'Unable to complete profile setup. Please try again.'
      setSubmitError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      setIsSubmitting(false)
    }
  }

  // Check if unauthenticated and not loading
  const storedToken = getAuthToken()
  if (!isLoading && !user && !storedToken) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white relative overflow-hidden">
        <div
          className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1a1a1a] bg-[#0A0A0A]/95 p-8 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#14151a]">
            <User className="h-6 w-6 text-neutral-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            Sign In Required
          </h1>
          <p className="text-sm text-neutral-400 mb-6">
            Please authenticate to personalize your Technea developer profile.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <span>Sign In to Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  const isUsernameReady =
    usernameStatus.state === 'available' ||
    (username.trim().length >= 3 && usernameStatus.state !== 'taken' && usernameStatus.state !== 'invalid' && usernameStatus.state !== 'checking')

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#333] selection:text-white">
      {/* Subtle Hairline Grid & Ambient Lighting */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xl">
        {/* Luxury Glass Card Container */}
        <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-2xl p-7 sm:p-10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)]">
          {/* Header Navigation & Step Progress Indicator */}
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm">
                T
              </div>
              <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                Technea Onboarding
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-500 mr-1.5 tabular-nums">
                0{step} / 04
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      s === step
                        ? 'w-7 bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                        : s < step
                        ? 'w-3.5 bg-white/60'
                        : 'w-3.5 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Multi-Step Journey with Framer Motion */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                    Welcome to Technea
                  </h1>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Let&apos;s personalize your learning journey and technical portfolio.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (fullName.trim()) setStep(2)
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor={fullNameInputId}
                      className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
                    >
                      Your Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        id={fullNameInputId}
                        ref={nameInputRef}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Linus Torvalds"
                        required
                        className="w-full rounded-xl border border-white/[0.1] bg-black/40 pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!fullName.trim()}
                      className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                    Choose your handle
                  </h1>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Your unique identity across Technea roadmaps and projects.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (isUsernameReady) setStep(3)
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor={handleInputId}
                      className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
                    >
                      Developer Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-mono text-sm">
                        <AtSign className="h-4 w-4" />
                      </div>
                      <input
                        id={handleInputId}
                        ref={usernameInputRef}
                        type="text"
                        value={username}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24)
                          setUsername(val)
                        }}
                        placeholder="username"
                        required
                        className="w-full rounded-xl border border-white/[0.1] bg-black/40 pl-10 pr-10 py-3 text-sm font-mono text-white placeholder-neutral-600 transition-colors focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                        {usernameStatus.state === 'checking' && (
                          <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
                        )}
                        {usernameStatus.state === 'available' && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                        {(usernameStatus.state === 'taken' || usernameStatus.state === 'invalid') && (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </div>

                    {/* Live handle status message */}
                    {usernameStatus.message && (
                      <p
                        className={`text-xs flex items-center gap-1.5 transition-all ${
                          usernameStatus.state === 'available'
                            ? 'text-neutral-300'
                            : usernameStatus.state === 'checking'
                            ? 'text-neutral-400'
                            : 'text-red-400'
                        }`}
                      >
                        <span>{usernameStatus.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-[#111] px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={!isUsernameReady}
                      className="flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                    Select your avatar
                  </h1>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Choose a minimalist badge or upload your own photo.
                  </p>
                </div>

                {/* Selected Avatar Preview */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full p-1 border border-white/20 bg-black/60 shadow-[0_0_30px_rgba(255,255,255,0.06)] flex items-center justify-center overflow-hidden">
                      <img
                        src={avatarUrl}
                        alt="Selected Avatar Preview"
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload custom photo"
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preset Avatars Grid */}
                <div className="space-y-2.5">
                  <span className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Luxury Monochrome Presets
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected = avatarUrl === preset.dataUrl
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAvatarUrl(preset.dataUrl)}
                          className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-white bg-white/[0.08] shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                              : 'border-white/[0.08] bg-[#0f0f0f] hover:border-white/25 hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center">
                            <img
                              src={preset.dataUrl}
                              alt={preset.label}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {preset.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Photo Upload */}
                <div className="pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="w-full inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-2 text-xs font-medium text-neutral-300 hover:border-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                    <span>
                      {isUploadingAvatar ? 'Processing image...' : 'Upload Custom Image from Computer'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-[#111] px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200 cursor-pointer shadow-lg"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                    Learning preferences
                  </h1>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Tailor your AI roadmap and project challenges.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Primary Goal */}
                  <div className="space-y-2">
                    <span className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Primary Engineering Goal
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {GOAL_OPTIONS.map((goal) => {
                        const isSelected = selectedGoal === goal
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => setSelectedGoal(goal)}
                            className={`p-3 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-white bg-white text-black shadow-md'
                                : 'border-white/[0.08] bg-[#0f0f0f] text-neutral-300 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <span>{goal}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-black" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Current Level */}
                  <div className="space-y-2">
                    <span className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Current Experience Level
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {LEVEL_OPTIONS.map((lvl) => {
                        const isSelected = selectedLevel === lvl
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSelectedLevel(lvl)}
                            className={`py-2.5 px-3 rounded-xl text-center border text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'border-white bg-white text-black shadow-md'
                                : 'border-white/[0.08] bg-[#0f0f0f] text-neutral-300 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {lvl}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Primary Focus */}
                  <div className="space-y-2">
                    <span className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Primary Focus Areas
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {FOCUS_OPTIONS.map((focus) => {
                        const isSelected = selectedFocus.includes(focus)
                        return (
                          <button
                            key={focus}
                            type="button"
                            onClick={() => handleToggleFocus(focus)}
                            className={`py-2 px-3.5 rounded-full border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'border-white/80 bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                                : 'border-white/[0.08] bg-[#0d0d0d] text-neutral-400 hover:border-white/20 hover:text-neutral-200'
                            }`}
                          >
                            <span>{focus}</span>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={isSubmitting}
                    className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-[#111] px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:border-white/20 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || isSuccess}
                    className="flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200 disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        <span>Initializing Workspace...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="h-4 w-4 text-black" />
                        <span>Entering Technea...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Technea</span>
                        <Sparkles className="h-4 w-4 text-black" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
