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
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getDashboardSummaryApi } from '../../services/api'

/* ─────────────────────────────────────────
   Animated counter hook & component
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
   Activity Heatmap Component (GitHub-style)
───────────────────────────────────────── */
function ActivityHeatmap() {
  const [hoveredDay, setHoveredDay] = useState(null)

  // Generate 14 weeks x 7 days mock contribution data for calendar consistency
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Static realistic activity matrix
  const activityMatrix = [
    [1, 2, 0, 3, 2, 4, 1],
    [0, 1, 2, 0, 3, 1, 0],
    [2, 3, 1, 4, 2, 0, 2],
    [1, 0, 2, 1, 3, 2, 1],
    [3, 4, 2, 3, 1, 2, 3],
    [0, 1, 3, 2, 4, 1, 2],
    [2, 2, 0, 1, 3, 3, 1],
    [1, 3, 4, 2, 1, 0, 2],
    [3, 2, 1, 3, 2, 4, 3],
    [2, 0, 2, 4, 3, 1, 2],
    [1, 2, 3, 1, 2, 3, 1],
    [4, 3, 2, 3, 4, 2, 3],
    [2, 3, 1, 2, 3, 4, 2],
    [3, 4, 2, 3, 2, 1, 3],
  ]

  const getColor = (level) => {
    switch (level) {
      case 1:
        return '#1F1F1F'
      case 2:
        return '#383838'
      case 3:
        return '#737373'
      case 4:
        return '#EDEDED'
      default:
        return '#121212'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#888888]" />
          Weekly Consistency Graph
        </span>
        <span className="text-[10px] text-[#555555]">
          {hoveredDay ? hoveredDay : 'Hover over day to inspect'}
        </span>
      </div>

      <div className="flex items-start gap-2 overflow-x-auto pb-1">
        {/* Days label */}
        <div className="flex flex-col gap-[3px] text-[9px] font-mono text-[#555555] pt-0.5 select-none">
          <span>M</span>
          <span>W</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
          {activityMatrix.map((col, colIdx) =>
            col.map((level, rowIdx) => {
              const dayName = daysOfWeek[rowIdx]
              const hours = level === 0 ? 0 : level === 1 ? 0.8 : level === 2 ? 1.5 : level === 3 ? 2.5 : 4
              const tip = `${hours} hrs logged on ${dayName} (Week ${colIdx + 1})`

              return (
                <div
                  key={`${colIdx}-${rowIdx}`}
                  onMouseEnter={() => setHoveredDay(tip)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="h-2.5 w-2.5 rounded-[2px] transition-colors cursor-pointer hover:ring-1 hover:ring-white/40"
                  style={{ background: getColor(level) }}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[9px] font-mono text-[#555555]">
        <span>Less</span>
        <span className="h-2 w-2 rounded-[2px] bg-[#121212]" />
        <span className="h-2 w-2 rounded-[2px] bg-[#1F1F1F]" />
        <span className="h-2 w-2 rounded-[2px] bg-[#383838]" />
        <span className="h-2 w-2 rounded-[2px] bg-[#737373]" />
        <span className="h-2 w-2 rounded-[2px] bg-[#EDEDED]" />
        <span>More</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function LearningDashboardModal({
  isOpen,
  onClose,
  onSelectPath = () => {},
  onOpenExplorer = () => {},
}) {
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAllPaths, setShowAllPaths] = useState(false)

  // Interactive Checklist State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete coding practice', done: true },
    { id: 2, text: 'Watch learning lesson', done: true },
    { id: 3, text: 'Build project module', done: false },
    { id: 4, text: 'Read documentation & specs', done: false },
    { id: 5, text: 'Revise core concepts', done: false },
  ])

  // AI Buddy interaction state
  const [aiCustomQuestion, setAiCustomQuestion] = useState('')
  const [aiAdvice, setAiAdvice] = useState(null)

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    const fetchDashboard = async () => {
      if (isMounted) {
        setLoading(true)
        setError(null)
        setDashboardData(null)
      }
      try {
        const data = await getDashboardSummaryApi()
        if (isMounted) {
          setDashboardData(data)
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

    fetchDashboard()

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

  // Core metrics
  const overallPercent = dashboardData?.overall_progress_percent || 0
  const completedMilestones = dashboardData?.total_completed_milestones || 0
  const completedLessons = dashboardData?.total_completed_lessons || 0
  const activePathsCount = dashboardData?.total_active_paths || (currentPath ? 1 : 0)

  // Curated Popular Engineering Tracks for the Roadmaps section
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
    setAiAdvice(
      `Analyzing "${query}" on ${currentPath?.title || 'Engineering Fundamentals'}: Prioritize completing hands-on code modules. Spend 20 minutes on practical implementation to reinforce concept retention.`
    )
    setAiCustomQuestion('')
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
          <header className="relative z-20 flex items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-6 py-3.5 shrink-0">
            {/* Left: Premium Profile Section */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#242424] bg-[#141414] text-xs font-bold text-[#EDEDED] font-mono shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#EDEDED] tracking-tight">
                    {fullName}
                  </span>
                  <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-2 py-0.5 text-[9px] font-mono font-medium text-[#A1A1A1] uppercase tracking-wider">
                    AI Explorer
                  </span>
                </div>
                <p className="text-[11px] text-[#666666] font-mono truncate">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 rounded-[6px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-xs font-mono text-[#D4D4D4]">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>7 Day Streak</span>
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

          {/* ──────────────── Scrollable Dashboard Canvas (#050505) ──────────────── */}
          <div className="relative z-10 flex-1 overflow-y-auto bg-[#050505] p-6 sm:p-8 space-y-8">
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
                {/* ──────────────── Header Welcome Section ──────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDEDED] flex items-center gap-2">
                      Welcome back, {firstName} <span className="text-xl">👋</span>
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-[#737373]">
                      Your personalized engineering journey • AI Copilot Active
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onOpenExplorer()
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#242424] bg-[#0E0E0E] px-4 py-2 text-xs font-semibold text-[#D4D4D4] hover:bg-[#171717] hover:text-white transition-colors cursor-pointer"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>Browse Roadmaps</span>
                    </button>
                  </div>
                </div>

                {/* ──────────────── Main Hero Card: Your Learning Journey ──────────────── */}
                <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-5">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-[#A1A1A1]" />
                      Your Learning Journey
                    </span>
                    <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-2 py-0.5 text-[9px] text-[#A1A1A1]">
                      Engine v2.4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left: Big Circular / Metric Visualizer */}
                    <div className="lg:col-span-5 flex items-center gap-6 border-b lg:border-b-0 lg:border-r border-[#1C1C1C] pb-6 lg:pb-0 lg:pr-6">
                      {/* Radial Progress Ring */}
                      <div className="relative shrink-0 flex items-center justify-center w-28 h-28">
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
                          <span className="text-2xl font-black text-[#EDEDED] font-mono tracking-tight">
                            <AnimatedStat value={overallPercent} suffix="%" />
                          </span>
                          <span className="text-[9px] font-mono text-[#737373] uppercase">
                            Mastery
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                          Overall Progress
                        </span>
                        <h3 className="text-lg font-bold text-[#EDEDED] tracking-tight">
                          Engineering Mastery
                        </h3>
                        <p className="text-xs text-[#737373] leading-relaxed">
                          Autonomous skills tracking across roadmaps, challenges, and code specifications.
                        </p>
                      </div>
                    </div>

                    {/* Right: Current Focus or Premium Onboarding Card */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      {currentPath ? (
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block mb-1">
                              Current Focus
                            </span>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base sm:text-lg font-bold text-[#EDEDED] tracking-tight">
                                {currentPath.title}
                              </h4>
                              <span className="rounded-[4px] border border-[#262626] bg-[#121212] px-2 py-0.5 text-[9px] font-mono text-[#A1A1A1]">
                                {currentPath.category}
                              </span>
                            </div>

                            {currentPath.next_step_title && (
                              <p className="text-xs text-[#A1A1A1] flex items-center gap-1.5 mt-2">
                                <span className="text-[#737373] font-mono text-[11px]">Next:</span>
                                <span className="font-medium text-[#EDEDED]">
                                  {currentPath.next_step_title}
                                </span>
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
                              <span>Milestone Progress</span>
                              <span className="text-[#EDEDED]">
                                {currentPath.completed_steps_count} of {currentPath.total_steps_count} completed ({currentPath.progress_percent}%)
                              </span>
                            </div>
                            <MinimalProgressBar percent={currentPath.progress_percent} height={5} delay={0.1} />
                          </div>

                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClose()
                                onSelectPath(currentPath)
                              }}
                              className="inline-flex items-center gap-2 rounded-[6px] bg-[#EDEDED] px-5 py-2.5 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                            >
                              <span>Continue Learning</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Premium Onboarding Empty State */
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#A1A1A1]" />
                            <h4 className="text-base font-bold text-[#EDEDED] tracking-tight">
                              Your engineering journey starts here.
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-lg">
                            Choose a roadmap and Technea will track your progress, recommend your next step, and help you build production-ready software skills.
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClose()
                                onOpenExplorer()
                              }}
                              className="inline-flex items-center gap-2 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                            >
                              <Compass className="h-3.5 w-3.5" />
                              <span>Explore Roadmaps</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onClose()
                                onOpenExplorer()
                              }}
                              className="inline-flex items-center gap-2 rounded-[6px] border border-[#262626] bg-[#121212] px-4 py-2 text-xs font-semibold text-[#D4D4D4] hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
                            >
                              <span>Build Your Path</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ──────────────── Stats Cards (4 Premium Cards) ──────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Card 1: Learning Streak */}
                  <div className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 sm:p-5 hover:border-[#2D2D2D] transition-colors">
                    <div className="flex items-center justify-between text-[#737373] mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        Learning Streak
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-[#EDEDED] font-mono tracking-tight">
                        7 Days
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1.5">
                      Keep your momentum alive 🔥
                    </p>
                  </div>

                  {/* Card 2: Milestones */}
                  <div className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 sm:p-5 hover:border-[#2D2D2D] transition-colors">
                    <div className="flex items-center justify-between text-[#737373] mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-[#737373]" />
                        Milestones
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-[#EDEDED] font-mono tracking-tight">
                        <AnimatedStat value={completedMilestones} />
                      </span>
                      <span className="text-xs text-[#737373] font-mono">completed</span>
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1.5">
                      Engineering progress
                    </p>
                  </div>

                  {/* Card 3: Lessons */}
                  <div className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 sm:p-5 hover:border-[#2D2D2D] transition-colors">
                    <div className="flex items-center justify-between text-[#737373] mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5">
                        <ListVideo className="h-3.5 w-3.5 text-[#737373]" />
                        Lessons
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-[#EDEDED] font-mono tracking-tight">
                        <AnimatedStat value={completedLessons} />
                      </span>
                      <span className="text-xs text-[#737373] font-mono">mastered</span>
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1.5">
                      Knowledge unlocked
                    </p>
                  </div>

                  {/* Card 4: Active Paths */}
                  <div className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 sm:p-5 hover:border-[#2D2D2D] transition-colors">
                    <div className="flex items-center justify-between text-[#737373] mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-[#737373]" />
                        Active Paths
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-[#EDEDED] font-mono tracking-tight">
                        <AnimatedStat value={activePathsCount} />
                      </span>
                      <span className="text-xs text-[#737373] font-mono">journeys</span>
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1.5">
                      Currently learning
                    </p>
                  </div>
                </div>

                {/* ──────────────── Daily Learning Tracker ──────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Daily Learning Tracker
                    </span>
                    <span className="text-[11px] font-mono text-[#555555]">
                      Habit Retention Loop
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Calendar Heatmap & Goal Progress (7 cols) */}
                    <div className="lg:col-span-7 rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-5">
                      {/* Heatmap Widget */}
                      <ActivityHeatmap />

                      <div className="border-t border-[#1C1C1C] pt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#737373]">Daily Goal: 60 minutes</span>
                          <span className="text-[#EDEDED] font-semibold">35 / 60 min</span>
                        </div>
                        <MinimalProgressBar percent={58} height={4} delay={0.2} />

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-amber-400 font-medium flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5" />
                            Keep going, your streak is alive 🔥
                          </span>
                          <span className="text-[10px] font-mono text-[#555555]">
                            25 min remaining
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Today's Goals Checklist (5 cols) */}
                    <div className="lg:col-span-5 rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 flex flex-col justify-between">
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

                      <div className="pt-4 border-t border-[#1C1C1C] mt-4 flex items-center justify-between text-[10px] font-mono text-[#555555]">
                        <span>Click to toggle items</span>
                        <span>Auto-saved</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ──────────────── AI Learning Companion Card: Technea AI Buddy ──────────────── */}
                <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#262626] bg-[#141414] text-[#EDEDED]">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#EDEDED]">
                          Technea AI Buddy
                        </h4>
                        <span className="text-[10px] font-mono text-[#666666]">
                          Personalized Engineering Mentor
                        </span>
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Agent
                    </span>
                  </div>

                  {/* AI Message Bubble */}
                  <div className="rounded-[8px] border border-[#222222] bg-[#111111] p-4 text-xs text-[#CCCCCC] leading-relaxed space-y-2">
                    <p className="font-medium text-[#EDEDED]">
                      Good morning {firstName} 👋
                    </p>
                    <p className="text-[#A1A1A1]">
                      You are currently exploring{' '}
                      <span className="text-[#EDEDED] font-semibold">
                        {currentPath ? currentPath.title : 'Python & Engineering Systems'}
                      </span>
                      .
                    </p>
                    <div className="pt-1 text-[11px] text-[#A1A1A1] border-t border-[#1C1C1C]">
                      <span className="text-[#737373] font-mono uppercase text-[10px] block mb-0.5">
                        Next recommendation:
                      </span>
                      {aiAdvice || (
                        <span>
                          Complete {currentPath?.next_step_title || 'Functions & Modules'} before advancing to asynchronous patterns or web frameworks.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Query Row */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        value={aiCustomQuestion}
                        onChange={(e) => setAiCustomQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAskAi(aiCustomQuestion)
                        }}
                        placeholder="Ask your AI mentor about this roadmap step…"
                        className="w-full rounded-[6px] border border-[#242424] bg-[#0E0E0E] px-3 py-2 text-xs text-[#EDEDED] placeholder-[#555555] focus:border-[#444444] focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleAskAi(aiCustomQuestion)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                      >
                        <Send className="h-3 w-3" />
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleAskAi('Explain the upcoming milestone in 3 key takeaways')
                      }
                      className="rounded-[4px] border border-[#222222] bg-[#111111] px-2 py-1 text-[10px] font-mono text-[#737373] hover:text-[#EDEDED] hover:border-[#383838] transition-colors cursor-pointer"
                    >
                      Summarize next milestone
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAskAi('What are common production pitfalls for this concept?')
                      }
                      className="rounded-[4px] border border-[#222222] bg-[#111111] px-2 py-1 text-[10px] font-mono text-[#737373] hover:text-[#EDEDED] hover:border-[#383838] transition-colors cursor-pointer"
                    >
                      Production pitfalls
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAskAi('Generate 3 practice interview questions')
                      }
                      className="rounded-[4px] border border-[#222222] bg-[#111111] px-2 py-1 text-[10px] font-mono text-[#737373] hover:text-[#EDEDED] hover:border-[#383838] transition-colors cursor-pointer"
                    >
                      Practice interview challenge
                    </button>
                  </div>
                </div>

                {/* ──────────────── Curated Engineering Roadmaps Grid ──────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1A1] flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5" />
                      Roadmap Progress
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {curatedRoadmaps.map((rm) => (
                      <div
                        key={rm.id}
                        className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-4 flex flex-col justify-between hover:border-[#2D2D2D] transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#737373] mb-2">
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

                        <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex items-center justify-between gap-3">
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
                            <span>Continue</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ──────────────── Enrolled Roadmaps (Preserved) ──────────────── */}
                {enrolledPaths.length > 0 && (
                  <div className="border-t border-[#1A1A1A] pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#737373] flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5" />
                        All Enrolled Journeys ({enrolledPaths.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAllPaths(!showAllPaths)}
                        className="text-xs text-[#A1A1A1] hover:text-[#EDEDED] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {showAllPaths ? 'Collapse' : 'Expand list'}
                        <ChevronRight
                          className={`h-3 w-3 transition-transform ${
                            showAllPaths ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {showAllPaths && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
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
                    )}
                  </div>
                )}

                {/* ──────────────── Skill Track Mastery Badges (Preserved) ──────────────── */}
                {skillsOverview.length > 0 && (
                  <div className="border-t border-[#1A1A1A] pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-3.5 w-3.5 text-[#737373]" />
                      <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">
                        Skill Track Mastery ({skillsOverview.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      {skillsOverview.map((skill, idx) => (
                        <div
                          key={idx}
                          className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-3 text-center"
                        >
                          <span className="text-[11px] font-bold text-[#EDEDED] block truncate mb-1">
                            {skill.skill_name}
                          </span>
                          <span className="text-xs font-black font-mono text-[#A1A1A1] block mb-1.5">
                            {skill.mastery_percent}%
                          </span>
                          <MinimalProgressBar percent={skill.mastery_percent} delay={0.1 + idx * 0.05} />
                          <span className="text-[9px] text-[#555555] font-mono mt-1.5 block">
                            {skill.completed_milestones} steps
                          </span>
                        </div>
                      ))}
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
