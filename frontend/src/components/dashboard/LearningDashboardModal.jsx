import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  Compass,
  TrendingUp,
  Award,
  LogOut,
  ChevronRight,
  Clock,
  Sparkles,
  Bot,
  Flame,
  CheckCircle2,
  Check,
  Target,
  ListVideo,
  Layers,
  Code2,
  Calendar,
  Send,
  Share2,
  Bookmark,
  AlertTriangle,
  Lightbulb,
  Trophy,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
  getDashboardSummaryApi,
  getMyRoadmapsApi,
  toggleDailyTaskApi,
} from '../../services/api'

/* ─────────────────────────────────────────
   Animated counter component
───────────────────────────────────────── */
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const from = 0

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}

function AnimatedStat({ value, suffix = '' }) {
  const animated = useAnimatedNumber(value)
  return <span>{animated}{suffix}</span>
}

/* ─────────────────────────────────────────
   Minimal Progress Bar
───────────────────────────────────────── */
function MinimalProgressBar({ percent = 0, delay = 0, height = 4 }) {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100)
  return (
    <div
      className="w-full overflow-hidden"
      style={{ height, background: '#1A1A1A', borderRadius: height / 2 }}
    >
      <motion.div
        style={{ height: '100%', background: '#EDEDED', borderRadius: height / 2 }}
        initial={{ width: 0 }}
        animate={{ width: `${safePercent}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────
   Weekly Activity 7-Day Component
───────────────────────────────────────── */
function WeeklyActivityStrip({ weeklyHistory = [], streakCount = 1 }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#888888]" />
          7-Day Activity Velocity
        </span>
        <span className="text-amber-400 font-semibold flex items-center gap-1">
          <Flame className="h-3 w-3" />
          {streakCount} Day Streak Active
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weeklyHistory.map((day, idx) => {
          const isToday = idx === weeklyHistory.length - 1
          return (
            <div
              key={day.date || idx}
              className={`rounded-[6px] border p-2.5 text-center flex flex-col items-center justify-between gap-1 transition-all ${
                isToday
                  ? 'border-[#383838] bg-[#141414] ring-1 ring-white/10'
                  : 'border-[#1C1C1C] bg-[#0A0A0A]'
              }`}
            >
              <span className="text-[10px] font-mono text-[#666666] uppercase">
                {day.day_name}
              </span>
              <span
                className={`h-3 w-3 rounded-full flex items-center justify-center transition-all ${
                  day.is_active
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : 'bg-[#1F1F1F]'
                }`}
              >
                {day.is_active && <Check className="h-2 w-2 text-black stroke-[3]" />}
              </span>
              <span className="text-[9px] font-mono text-[#555555]">
                {day.completed_tasks_count > 0 ? `${day.completed_tasks_count} done` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main Dashboard Modal Component
───────────────────────────────────────── */
export default function LearningDashboardModal({
  isOpen,
  onClose,
  onSelectPath = () => {},
  onOpenExplorer = () => {},
}) {
  const { user, logout, openRoadmapBuilder } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'roadmaps' | 'profile'
  const [toastMessage, setToastMessage] = useState(null)
  const toastTimeoutRef = useRef(null)

  // Interactive Checklist State
  const [tasks, setTasks] = useState([
    { id: 'lesson', text: 'Complete 1 video lesson or milestone module', done: true },
    { id: 'code', text: 'Practice 30 minutes of hands-on coding', done: false },
    { id: 'review', text: 'Review system architecture notes & quiz', done: false },
  ])

  // AI Buddy interaction state
  const [aiCustomQuestion, setAiCustomQuestion] = useState('')
  const [aiAdvice, setAiAdvice] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Toggle Daily Goal Task
  const toggleTask = async (id) => {
    const targetTask = tasks.find((t) => t.id === id)
    if (!targetTask) return
    const nextDone = !targetTask.done

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t))
    )

    try {
      const updated = await toggleDailyTaskApi({
        task_id: String(id),
        is_completed: nextDone,
      })
      if (updated?.today_checklist) {
        setTasks(
          updated.today_checklist.map((item) => ({
            id: item.id,
            text: item.label,
            done: item.completed,
          }))
        )
      }
    } catch (e) {
      console.warn('Failed to sync daily task toggle:', e)
    }
  }

  // Fetch Dashboard & Roadmaps data
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    const fetchAllData = async () => {
      if (isMounted) {
        setLoading(true)
        setError(null)
      }
      try {
        const [dashData, roadmapsData] = await Promise.allSettled([
          getDashboardSummaryApi(),
          getMyRoadmapsApi(),
        ])

        if (isMounted) {
          if (dashData.status === 'fulfilled') {
            setDashboardData(dashData.value)
            // Sync tasks checklist if provided
            if (dashData.value.daily_activity?.today_checklist?.length > 0) {
              setTasks(
                dashData.value.daily_activity.today_checklist.map((item) => ({
                  id: item.id,
                  text: item.label,
                  done: item.completed,
                }))
              )
            }
          }
          if (roadmapsData.status === 'fulfilled' && Array.isArray(roadmapsData.value)) {
            setSavedRoadmaps(roadmapsData.value)
          } else {
            // Check guest roadmaps fallback
            try {
              const localGuest = JSON.parse(
                localStorage.getItem('technea_guest_saved_roadmaps') || '[]'
              )
              setSavedRoadmaps(localGuest)
            } catch {
              setSavedRoadmaps([])
            }
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load dashboard:', err)
          setError(err.message || 'Unable to load dashboard details.')
          setLoading(false)
        }
      }
    }

    fetchAllData()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // User details
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]
  const initials = fullName.slice(0, 2).toUpperCase()
  const userEmail = user?.email || 'harshvsvardhan22@gmail.com'

  const currentPath = dashboardData?.current_path || null
  const enrolledPaths = dashboardData?.enrolled_paths || []
  const skillsOverview = dashboardData?.skills_overview || []
  const aiBuddy = dashboardData?.ai_buddy || null
  const dailyActivity = dashboardData?.daily_activity || null

  // Core metrics
  const overallPercent = dashboardData?.overall_progress_percent || 0
  const completedMilestones = dashboardData?.total_completed_milestones || 0
  const completedLessons = dashboardData?.total_completed_lessons || 0
  const activePathsCount = dashboardData?.total_active_paths || (currentPath ? 1 : 0)
  const streakCount = dailyActivity?.streak_count || dashboardData?.streak_count || 1

  // Curated Popular Tracks
  const curatedRoadmaps = [
    {
      id: 'python',
      title: 'Python Fundamentals',
      category: 'Backend & Data',
      level: 'Foundation',
      modules: '8 / 16 modules',
      progress: 50,
    },
    {
      id: 'aiml',
      title: 'AI / Machine Learning',
      category: 'Applied AI',
      level: 'Intermediate',
      modules: '4 / 20 modules',
      progress: 20,
    },
    {
      id: 'webdev',
      title: 'Full-Stack Web Development',
      category: 'Frontend & APIs',
      level: 'Intermediate',
      modules: '14 / 22 modules',
      progress: 64,
    },
    {
      id: 'dsa',
      title: 'Data Structures & Algorithms',
      category: 'Computer Science',
      level: 'Advanced',
      modules: '10 / 18 modules',
      progress: 55,
    },
    {
      id: 'sysdesign',
      title: 'System Design & Scalability',
      category: 'Architecture',
      level: 'Senior',
      modules: '6 / 15 modules',
      progress: 40,
    },
  ]

  const handleAskAi = (promptText) => {
    const query = promptText || aiCustomQuestion || 'How to optimize study plan'
    if (query.toLowerCase().includes('pitfall')) {
      setAiAdvice(
        'Common production pitfall: Mutating state directly without immutable spreads, causing silent render drops and race conditions in concurrent loops.'
      )
    } else if (query.toLowerCase().includes('interview')) {
      setAiAdvice(
        '1. How does the event loop prioritize microtasks vs macrotasks? 2. When would you opt for optimistic UI rollbacks over blocking loaders? 3. Explain how SQL indexing affects write latency.'
      )
    } else if (query.toLowerCase().includes('milestone')) {
      setAiAdvice(
        `Next milestone focuses on ${aiBuddy?.next_milestone || 'Architectural Patterns'}. Deliver a clean working implementation before abstracting into custom hooks or services.`
      )
    } else {
      setAiAdvice(
        `Mentor guidance for "${query}": Dedicate 25 minutes to hands-on coding with zero AI autocomplete to build resilient retrieval memory.`
      )
    }
    setAiCustomQuestion('')
  }

  const handleCopyProfileLink = () => {
    if (navigator.clipboard) {
      const url = `https://technea.dev/@${firstName.toLowerCase()}`
      navigator.clipboard.writeText(url)
      showToast('Public profile link copied to clipboard!')
    }
  }

  const completedTasksCount = tasks.filter((t) => t.done).length

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Personal AI Engineering Workspace"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      >
        {/* Deep Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Shell — Deep Black #050505 canvas with #1F1F1F subtle borders */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col w-full max-w-6xl h-[92vh] max-h-[940px] rounded-[10px] border border-[#1F1F1F] bg-[#050505] shadow-[0_30px_100px_rgba(0,0,0,0.98)] overflow-hidden"
        >
          {/* ──────────────── Top Header Bar ──────────────── */}
          <header className="relative z-20 flex items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-5 py-3 shrink-0">
            {/* Left: Premium Profile Section */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#242424] bg-[#141414] text-xs font-bold text-[#EDEDED] font-mono shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#EDEDED] tracking-tight">
                    {fullName}
                  </span>
                  <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-1.5 py-0.5 text-[9px] font-mono font-medium text-[#A1A1A1] uppercase tracking-wider">
                    AI Explorer
                  </span>
                </div>
                <p className="text-[10px] text-[#666666] font-mono truncate hidden sm:block">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Middle: Tab Switcher (Overview • Roadmaps • Profile) */}
            <nav className="flex items-center rounded-[6px] border border-[#1F1F1F] bg-[#0D0D0D] p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`rounded-[4px] px-3 py-1 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#1C1C1C] text-[#EDEDED] font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('roadmaps')}
                className={`rounded-[4px] px-3 py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'roadmaps'
                    ? 'bg-[#1C1C1C] text-[#EDEDED] font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                <span>Roadmaps</span>
                {savedRoadmaps.length > 0 && (
                  <span className="rounded-full bg-[#262626] px-1 text-[9px] text-[#A1A1A1]">
                    {savedRoadmaps.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`rounded-[4px] px-3 py-1 transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#1C1C1C] text-[#EDEDED] font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                Profile & Mastery
              </button>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 rounded-[6px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-xs font-mono text-[#D4D4D4]">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>{streakCount} Day Streak</span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-[6px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-xs font-medium text-[#737373] hover:text-[#EDEDED] hover:bg-[#171717] hover:border-[#333333] transition-colors cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#222222] bg-[#111111] text-[#737373] hover:text-[#EDEDED] hover:bg-[#171717] hover:border-[#333333] transition-colors cursor-pointer"
                aria-label="Close dashboard"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* Toast Banner */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 rounded-[6px] border border-[#2E2E2E] bg-[#141414] px-3.5 py-1.5 text-xs font-mono text-[#EDEDED] shadow-xl"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────── Scrollable Dashboard Canvas (#050505) ──────────────── */}
          <div className="relative z-10 flex-1 overflow-y-auto bg-[#050505] p-5 sm:p-8 space-y-7">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#222222] border-t-[#EDEDED]" />
                <p className="text-xs text-[#737373] font-mono">
                  Loading your engineering workspace…
                </p>
              </div>
            ) : error ? (
              <div className="rounded-[8px] border border-red-900/40 bg-[#0E0E0E] p-6 text-center text-xs text-red-400">
                <p>{error}</p>
              </div>
            ) : (
              <>
                {/* ══════════════ TAB 1: OVERVIEW ══════════════ */}
                {activeTab === 'overview' && (
                  <>
                    {/* Welcome Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-5">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDEDED] flex items-center gap-2">
                          Welcome back, {firstName} <span className="text-xl">👋</span>
                        </h1>
                        <p className="mt-1 text-xs text-[#737373]">
                          Personalized Engineering Journey • AI Buddy Active
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            openRoadmapBuilder()
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          <span>Build My Roadmap</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onOpenExplorer()
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#242424] bg-[#0E0E0E] px-3.5 py-2 text-xs font-semibold text-[#D4D4D4] hover:bg-[#171717] hover:text-white transition-colors cursor-pointer"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>Browse Catalog</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Hero Card: Learning Journey */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 shadow-sm">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-4">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5 text-[#A1A1A1]" />
                          Your Learning Journey
                        </span>
                        <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-2 py-0.5 text-[9px] text-[#A1A1A1]">
                          Engine v2.4
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Radial Progress Ring */}
                        <div className="lg:col-span-5 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-[#1C1C1C] pb-5 lg:pb-0 lg:pr-5">
                          <div className="relative shrink-0 flex items-center justify-center w-24 h-24">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="transparent"
                                stroke="#1A1A1A"
                                strokeWidth="7"
                              />
                              <motion.circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="transparent"
                                stroke="#EDEDED"
                                strokeWidth="7"
                                strokeLinecap="round"
                                strokeDasharray="264"
                                strokeDashoffset={264 - (264 * Math.max(overallPercent, 3)) / 100}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                              <span className="text-xl font-black text-[#EDEDED] font-mono tracking-tight">
                                <AnimatedStat value={overallPercent} suffix="%" />
                              </span>
                              <span className="text-[9px] font-mono text-[#737373] uppercase">
                                Mastery
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                              Platform Progress
                            </span>
                            <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
                              Engineering Progression
                            </h3>
                            <p className="text-xs text-[#737373] leading-relaxed">
                              Autonomous competency tracking across roadmaps, lessons, and hands-on deliverables.
                            </p>
                          </div>
                        </div>

                        {/* Current Focus Card */}
                        <div className="lg:col-span-7 flex flex-col justify-between">
                          {currentPath ? (
                            <div className="space-y-3.5">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block mb-1">
                                  Current Focus
                                </span>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-base font-bold text-[#EDEDED] tracking-tight">
                                    {currentPath.title}
                                  </h4>
                                  <span className="rounded-[4px] border border-[#262626] bg-[#121212] px-2 py-0.5 text-[9px] font-mono text-[#A1A1A1]">
                                    {currentPath.category}
                                  </span>
                                </div>

                                {currentPath.next_step_title && (
                                  <p className="text-xs text-[#A1A1A1] flex items-center gap-1.5 mt-1.5">
                                    <span className="text-[#737373] font-mono text-[11px]">Next:</span>
                                    <span className="font-medium text-[#EDEDED]">
                                      {currentPath.next_step_title}
                                    </span>
                                  </p>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
                                  <span>Milestone Progress</span>
                                  <span className="text-[#EDEDED]">
                                    {currentPath.completed_steps_count} of {currentPath.total_steps_count} completed ({currentPath.progress_percent}%)
                                  </span>
                                </div>
                                <MinimalProgressBar percent={currentPath.progress_percent} height={5} delay={0.1} />
                              </div>

                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose()
                                    onSelectPath(currentPath)
                                  }}
                                  className="inline-flex items-center gap-2 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                                >
                                  <span>Continue Learning</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#A1A1A1]" />
                                <h4 className="text-sm font-bold text-[#EDEDED] tracking-tight">
                                  Your engineering journey starts here.
                                </h4>
                              </div>
                              <p className="text-xs text-[#737373] leading-relaxed max-w-lg">
                                Synthesize an AI career roadmap or select an engineering path to activate your personalized mentor loop.
                              </p>
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose()
                                    openRoadmapBuilder()
                                  }}
                                  className="inline-flex items-center gap-2 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                                >
                                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Build My Roadmap</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose()
                                    onOpenExplorer()
                                  }}
                                  className="inline-flex items-center gap-2 rounded-[6px] border border-[#262626] bg-[#121212] px-4 py-2 text-xs font-semibold text-[#D4D4D4] hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
                                >
                                  <span>Explore Roadmaps</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Metric Cards (4 Cards) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 hover:border-[#2D2D2D] transition-colors">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5 mb-2">
                          <Flame className="h-3.5 w-3.5 text-amber-500" />
                          Streak
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-[#EDEDED] font-mono">
                            {streakCount} Days
                          </span>
                        </div>
                        <p className="text-[10px] text-[#737373] mt-1">
                          Consistency loop 🔥
                        </p>
                      </div>

                      <div className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 hover:border-[#2D2D2D] transition-colors">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5 mb-2">
                          <Target className="h-3.5 w-3.5 text-[#737373]" />
                          Milestones
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-[#EDEDED] font-mono">
                            <AnimatedStat value={completedMilestones} />
                          </span>
                          <span className="text-[10px] text-[#737373] font-mono">done</span>
                        </div>
                        <p className="text-[10px] text-[#737373] mt-1">
                          Competencies unlocked
                        </p>
                      </div>

                      <div className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 hover:border-[#2D2D2D] transition-colors">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5 mb-2">
                          <ListVideo className="h-3.5 w-3.5 text-[#737373]" />
                          Lessons
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-[#EDEDED] font-mono">
                            <AnimatedStat value={completedLessons} />
                          </span>
                          <span className="text-[10px] text-[#737373] font-mono">mastered</span>
                        </div>
                        <p className="text-[10px] text-[#737373] mt-1">
                          Knowledge modules
                        </p>
                      </div>

                      <div className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 hover:border-[#2D2D2D] transition-colors">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5 mb-2">
                          <Layers className="h-3.5 w-3.5 text-[#737373]" />
                          Roadmaps
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-[#EDEDED] font-mono">
                            <AnimatedStat value={savedRoadmaps.length || activePathsCount} />
                          </span>
                          <span className="text-[10px] text-[#737373] font-mono">tracks</span>
                        </div>
                        <p className="text-[10px] text-[#737373] mt-1">
                          Active career goals
                        </p>
                      </div>
                    </div>

                    {/* ──────────────── PHASE 2: TECHNEA AI LEARNING BUDDY ──────────────── */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#262626] bg-[#141414] text-[#EDEDED]">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EDEDED]">
                              Technea AI Learning Buddy
                            </h4>
                            <span className="text-[10px] font-mono text-[#666666]">
                              Contextual Pedagogical Mentor
                            </span>
                          </div>
                        </div>

                        <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active Copilot
                        </span>
                      </div>

                      {/* AI Mentor Card Body */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Left: Current Goal & Recommended Next Step */}
                        <div className="md:col-span-8 rounded-[8px] border border-[#222222] bg-[#111111] p-4 text-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">
                              Target Role: {aiBuddy?.current_goal || 'Full Stack Developer'}
                            </span>
                            <span className="text-[10px] font-mono text-[#555555]">
                              {aiBuddy?.last_activity || 'Fundamentals Verified'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase text-[#A1A1A1] block">
                              Next Recommended Milestone:
                            </span>
                            <h5 className="text-sm font-bold text-[#EDEDED]">
                              {aiBuddy?.next_milestone || 'Component Lifecycle & Reactive Streams'}
                            </h5>
                            <p className="text-[11px] text-[#A1A1A1] leading-relaxed pt-1">
                              {aiBuddy?.reasoning ||
                                'Solidifying asynchronous state handling is the critical prerequisite before orchestrating modular client architecture.'}
                            </p>
                          </div>

                          {/* Weak Area Detection Flag */}
                          {aiBuddy?.weak_areas?.length > 0 && (
                            <div className="pt-2 border-t border-[#1C1C1C] flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-semibold">
                                <AlertTriangle className="h-3 w-3 text-amber-400" />
                                Recommended Reinforcement:
                              </span>
                              {aiBuddy.weak_areas.map((area, i) => (
                                <span
                                  key={i}
                                  className="rounded-[3px] border border-amber-900/40 bg-amber-950/20 px-2 py-0.5 text-[10px] font-mono text-amber-300"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Mentor Tip & Action CTA */}
                        <div className="md:col-span-4 rounded-[8px] border border-[#222222] bg-[#111111] p-4 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono uppercase text-[#737373] flex items-center gap-1">
                              <Lightbulb className="h-3 w-3 text-amber-400" />
                              Mentor Study Tip:
                            </span>
                            <p className="text-[11px] text-[#CCCCCC] leading-relaxed">
                              {aiBuddy?.mentor_tip ||
                                'Spend 20 minutes writing code without reference documentation to solidify neuromuscular retrieval.'}
                            </p>
                          </div>

                          <div className="pt-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (currentPath) {
                                  onClose()
                                  onSelectPath(currentPath)
                                } else {
                                  onClose()
                                  openRoadmapBuilder()
                                }
                              }}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-[#EDEDED] py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                            >
                              <span>Continue Milestone</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Ask AI mentor */}
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            value={aiCustomQuestion}
                            onChange={(e) => setAiCustomQuestion(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAskAi(aiCustomQuestion)
                            }}
                            placeholder="Ask your AI mentor about this roadmap step or concepts…"
                            className="w-full flex-1 rounded-[6px] border border-[#242424] bg-[#0E0E0E] px-3 py-2 text-xs text-[#EDEDED] placeholder-[#555555] focus:border-[#444444] focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleAskAi(aiCustomQuestion)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            <span>Ask Mentor</span>
                          </button>
                        </div>

                        {/* Quick Prompts Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {(aiBuddy?.quick_prompts || [
                            'Summarize next milestone',
                            'What are common production pitfalls?',
                            'Generate 3 practice interview questions',
                          ]).map((prompt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleAskAi(prompt)}
                              className="rounded-[4px] border border-[#222222] bg-[#111111] px-2 py-1 text-[10px] font-mono text-[#737373] hover:text-[#EDEDED] hover:border-[#383838] transition-colors cursor-pointer"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>

                        {aiAdvice && (
                          <div className="mt-2 rounded-[6px] border border-[#292929] bg-[#141414] p-3 text-xs text-[#EDEDED] font-mono leading-relaxed">
                            <span className="text-amber-400 font-bold block mb-1">
                              AI Mentor Response:
                            </span>
                            {aiAdvice}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ──────────────── PHASE 3: DAILY LEARNING TRACKER ──────────────── */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          Daily Productivity Tracker
                        </span>
                        <span className="text-[11px] font-mono text-[#555555]">
                          Database Persisted
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: 7-Day Velocity Strip & Progress (7 cols) */}
                        <div className="lg:col-span-7 rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 space-y-4">
                          <WeeklyActivityStrip
                            weeklyHistory={dailyActivity?.weekly_history || []}
                            streakCount={streakCount}
                          />

                          <div className="border-t border-[#1C1C1C] pt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-[#737373]">
                                Daily Goal: 60 minutes
                              </span>
                              <span className="text-[#EDEDED] font-semibold">
                                {dailyActivity?.minutes_spent || (completedTasksCount * 25)} / 60 min
                              </span>
                            </div>
                            <MinimalProgressBar
                              percent={Math.min(
                                100,
                                Math.round(
                                  ((dailyActivity?.minutes_spent || completedTasksCount * 25) / 60) * 100
                                )
                              )}
                              height={4}
                            />
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#555555] pt-0.5">
                              <span>🔥 Keep your streak alive</span>
                              <span>Auto-synced</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Today's Checklist (5 cols) */}
                        <div className="lg:col-span-5 rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                Today&apos;s Checklist
                              </h4>
                              <span className="text-[10px] font-mono text-[#737373]">
                                {completedTasksCount} / {tasks.length} Done
                              </span>
                            </div>

                            <div className="space-y-2">
                              {tasks.map((task) => (
                                <button
                                  key={task.id}
                                  type="button"
                                  onClick={() => toggleTask(task.id)}
                                  className={`w-full flex items-center gap-2.5 rounded-[6px] border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                                    task.done
                                      ? 'border-[#262626] bg-[#121212] text-[#A1A1A1]'
                                      : 'border-[#1C1C1C] bg-[#080808] text-[#EDEDED] hover:border-[#2D2D2D]'
                                  }`}
                                >
                                  <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                                      task.done
                                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                                        : 'border-[#333333] bg-[#111111]'
                                    }`}
                                  >
                                    {task.done && <Check className="h-2.5 w-2.5" />}
                                  </span>
                                  <span
                                    className={`truncate ${
                                      task.done ? 'line-through text-[#666666]' : ''
                                    }`}
                                  >
                                    {task.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#1C1C1C] mt-3 flex items-center justify-between text-[10px] font-mono text-[#555555]">
                            <span>Click to toggle items</span>
                            <span>Stored in DB</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Curated Catalog Roadmaps Strip */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-2">
                          <Code2 className="h-3.5 w-3.5" />
                          Curated Engineering Tracks
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onOpenExplorer()
                          }}
                          className="text-xs text-[#737373] hover:text-[#EDEDED] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          View all catalog <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {curatedRoadmaps.map((rm) => (
                          <div
                            key={rm.id}
                            className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 flex flex-col justify-between hover:border-[#2D2D2D] transition-colors"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#737373] mb-1.5">
                                <span>{rm.category}</span>
                                <span className="text-[#EDEDED] font-semibold font-mono">
                                  {rm.progress}%
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-[#EDEDED] tracking-tight mb-1">
                                {rm.title}
                              </h5>
                              <p className="text-[11px] text-[#666666] font-mono">
                                {rm.modules}
                              </p>
                            </div>

                            <div className="mt-3 pt-3 border-t border-[#1C1C1C] flex items-center justify-between gap-3">
                              <div className="flex-1">
                                <MinimalProgressBar percent={rm.progress} height={3} />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  onClose()
                                  onOpenExplorer()
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4D4D4] hover:text-white transition-colors cursor-pointer shrink-0"
                              >
                                <span>Explore</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ══════════════ TAB 2: AI ROADMAPS ══════════════ */}
                {activeTab === 'roadmaps' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#EDEDED]">
                          Your Career Roadmaps
                        </h2>
                        <p className="text-xs text-[#737373]">
                          AI-generated blueprints and enrolled catalog journeys.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          openRoadmapBuilder()
                        }}
                        className="inline-flex items-center gap-2 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>Build New Roadmap</span>
                      </button>
                    </div>

                    {/* Saved AI Roadmaps List */}
                    {savedRoadmaps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedRoadmaps.map((roadmap) => {
                          const progress = roadmap.progress_percent || 0
                          const completedCount =
                            roadmap.completed_milestone_ids?.length || 0

                          return (
                            <div
                              key={roadmap.id}
                              className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 flex flex-col justify-between hover:border-[#2D2D2D] transition-colors"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-2 py-0.5 text-[9px] font-mono text-amber-400 uppercase">
                                    {roadmap.target_role || 'Career Blueprint'}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#737373]">
                                    {roadmap.estimated_duration || '18 Weeks'}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-[#EDEDED]">
                                  {roadmap.title}
                                </h4>
                                <p className="text-xs text-[#737373] line-clamp-2">
                                  Goal: &quot;{roadmap.goal}&quot;
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-[#1C1C1C] space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
                                  <span>{completedCount} milestones completed</span>
                                  <span className="text-[#EDEDED] font-bold">
                                    {progress}%
                                  </span>
                                </div>
                                <MinimalProgressBar percent={progress} height={4} />

                                <div className="pt-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose()
                                      openRoadmapBuilder(roadmap.goal)
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#2B2B2B] bg-[#141414] px-3 py-1.5 text-xs font-mono text-[#EDEDED] hover:bg-white hover:text-black transition-colors cursor-pointer"
                                  >
                                    <span>Open Roadmap</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0A0A0A] p-8 text-center space-y-3">
                        <Bookmark className="h-8 w-8 text-[#555555] mx-auto" />
                        <h4 className="text-sm font-bold text-[#EDEDED]">
                          No AI Career Roadmaps Generated Yet
                        </h4>
                        <p className="text-xs text-[#737373] max-w-sm mx-auto">
                          Tell Technea what you want to become (e.g. Full Stack Developer, DevOps Engineer) and synthesize your personalized curriculum.
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose()
                              openRoadmapBuilder()
                            }}
                            className="inline-flex items-center gap-2 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>Launch Roadmap Builder</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Catalog Enrolled Journeys */}
                    {enrolledPaths.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-[#1C1C1C]">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#737373] flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" />
                          <span>Catalog Enrolled Journeys ({enrolledPaths.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {enrolledPaths.map((path) => (
                            <div
                              key={path.id}
                              className="flex items-center justify-between rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-3.5 hover:border-[#2D2D2D] transition-colors cursor-pointer"
                              onClick={() => {
                                onClose()
                                onSelectPath(path)
                              }}
                            >
                              <div className="min-w-0 pr-3">
                                <span className="text-[10px] font-mono text-[#737373] block">
                                  {path.category}
                                </span>
                                <h5 className="text-xs font-bold text-[#EDEDED] truncate">
                                  {path.title}
                                </h5>
                                <span className="text-[10px] text-[#555555] font-mono">
                                  {path.completed_steps_count} / {path.total_steps_count} milestones
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-mono font-bold text-[#EDEDED]">
                                  {path.progress_percent}%
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-[#555555]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════ TAB 3: PROFILE & MASTERY ══════════════ */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Profile Header Identity Card */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[10px] border border-[#262626] bg-[#141414] text-xl font-bold text-[#EDEDED] font-mono">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-[#EDEDED]">
                              {fullName}
                            </h3>
                            <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                              Verified Learner
                            </span>
                          </div>
                          <p className="text-xs text-[#737373] font-mono mt-0.5">
                            {userEmail} • Level: AI Explorer
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyProfileLink}
                          className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#262626] bg-[#141414] px-3 py-1.5 text-xs font-mono text-[#D4D4D4] hover:text-white hover:border-[#383838] transition-colors cursor-pointer"
                        >
                          <Share2 className="h-3 w-3" />
                          <span>Share Portfolio</span>
                        </button>
                      </div>
                    </div>

                    {/* Skill Mastery Breakdown */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#EDEDED] font-mono flex items-center gap-2">
                          <Award className="h-4 w-4 text-[#A1A1A1]" />
                          Engineering Skill Mastery Breakdown
                        </span>
                        <span className="text-[10px] font-mono text-[#666666]">
                          Continuous Evaluation
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {skillsOverview.map((skill, i) => (
                          <div
                            key={i}
                            className="rounded-[6px] border border-[#1C1C1C] bg-[#090909] p-3 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-[#EDEDED] font-bold">
                                {skill.skill_name}
                              </span>
                              <span className="text-emerald-400 font-bold">
                                {skill.mastery_percent}%
                              </span>
                            </div>
                            <MinimalProgressBar
                              percent={skill.mastery_percent}
                              height={3}
                              delay={0.05 * i}
                            />
                            <span className="text-[9px] font-mono text-[#555555] block">
                              {skill.completed_milestones} milestones validated
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Achievements & Badges Earned */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#EDEDED] font-mono flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-400" />
                          Earned Achievement Badges
                        </span>
                        <span className="text-[10px] font-mono text-[#666666]">
                          4 Badges Available
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="rounded-[8px] border border-emerald-900/30 bg-[#0A100C] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">
                              Early Adopter
                            </span>
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Joined Technea during autonomous developer release.
                          </p>
                          <span className="text-[9px] font-mono text-emerald-500/80 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-[8px] border border-amber-900/30 bg-[#120D08] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400">
                              Consistent Coder
                            </span>
                            <Flame className="h-3.5 w-3.5 text-amber-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Maintained active study streak for consecutive days.
                          </p>
                          <span className="text-[9px] font-mono text-amber-500/80 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-[8px] border border-purple-900/30 bg-[#0F0B14] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-400">
                              Milestone Conqueror
                            </span>
                            <Target className="h-3.5 w-3.5 text-purple-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Completed verified hands-on engineering milestones.
                          </p>
                          <span className="text-[9px] font-mono text-purple-500/80 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-[8px] border border-blue-900/30 bg-[#090D14] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-400">
                              Roadmap Architect
                            </span>
                            <Layers className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Synthesized personalized career roadmap with AI.
                          </p>
                          <span className="text-[9px] font-mono text-blue-500/80 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
