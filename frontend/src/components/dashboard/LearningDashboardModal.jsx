import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  Compass,
  Award,
  LogOut,
  Sparkles,
  Bot,
  Flame,
  Check,
  Target,
  Layers,
  Send,
  Share2,
  Bookmark,
  Trophy,
  FolderGit2,
  Users,
  ExternalLink,
  Zap,
  Copy,
  CheckCheck,
  Edit3,
  RotateCcw,
  Activity,
  Terminal,
  Radio,
  Clock,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
  getDashboardSummaryApi,
  getMyRoadmapsApi,
  toggleDailyTaskApi,
  getProjectsApi,
  getRecommendedProjectsApi,
  getMyProjectsApi,
  updateProjectStatusApi,
  getCommunityRoomsApi,
  toggleRoomJoinApi,
  sendAiChatApi,
  getUserProfileApi,
  getAvatarUrl,
} from '../../services/api'
import SpaceGardenAtmosphere from './SpaceGardenAtmosphere'
import AIMessageRenderer from './AIMessageRenderer'

let messageCounter = 1000
function getNextMentorMsgId() {
  messageCounter += 1
  return `msg-${messageCounter}`
}

function getMentorTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const AI_MENTOR_SESSION_STORAGE_KEY = 'technea_ai_mentor_session_history_v1'

function createDefaultMentorGreeting(user) {
  const userName = user?.full_name ? user.full_name.split(' ')[0] : 'there'
  return {
    id: 'msg-default-1',
    conversation_id: null,
    sender: 'mentor',
    text: `Hello ${userName}, how can I help you today?`,
    suggestions: [
      'What should I learn next based on my roadmaps?',
      'How do I build full-stack projects that get hired?',
      'Can you review my learning progression?',
    ],
    related_actions: [],
    timestamp: getMentorTimeString(),
  }
}

function loadSavedMentorSession() {
  if (typeof window === 'undefined' || !window.sessionStorage) return null
  try {
    const raw = window.sessionStorage.getItem(AI_MENTOR_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { conversation_id: null, messages: parsed }
    }
    if (parsed && typeof parsed === 'object') {
      const messages = Array.isArray(parsed.messages) ? parsed.messages : null
      if (messages && messages.length > 0) {
        return {
          conversation_id: typeof parsed.conversation_id === 'string' ? parsed.conversation_id : null,
          messages,
        }
      }
    }
    return null
  } catch (err) {
    console.warn('Failed to load mentor session from sessionStorage:', err)
    return null
  }
}

function GithubIcon({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

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
   Minimal Hairline Progress Bar
───────────────────────────────────────── */
function MinimalProgressBar({ percent = 0, delay = 0, height = 3, className = '' }) {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100)
  return (
    <div
      className={`w-full overflow-hidden bg-white/[0.06] rounded-full relative ${className}`}
      style={{ height }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-neutral-300 via-white to-neutral-200 rounded-full relative"
        initial={{ width: 0 }}
        animate={{ width: `${safePercent}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px] opacity-75" />
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Overview Component 1: Orbital Progression Circle
───────────────────────────────────────── */
function OrbitalProgressGauge({
  percent = 0,
  level = 'Code Initiate',
  completedMilestones = 0,
  completedLessons = 0,
}) {
  const radius = 58
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const safePercent = Math.min(Math.max(percent || 0, 0), 100)
  const offset = circumference - (safePercent / 100) * circumference

  return (
    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/30 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#05070d]/85 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between h-full group hover:border-cyan-500/30 transition-all duration-300">
      {/* Gauge Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            ORBITAL PROGRESSION
          </span>
        </div>
        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">
          MASTERY GAUGE
        </span>
      </div>

      {/* SVG Circular Dial */}
      <div className="relative flex items-center justify-center my-3">
        <div className="relative h-44 w-44 flex items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="orbitalCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="60%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <filter id="orbitalGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background concentric reference rings */}
            <circle
              cx="80"
              cy="80"
              r={radius + 12}
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
            />

            {/* Glowing animated progress stroke */}
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#orbitalCyanGlow)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
              filter="url(#orbitalGlowEffect)"
            />
          </svg>

          {/* Center Telemetry Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/90 font-medium">
              MASTERY
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight my-0.5 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              <AnimatedStat value={safePercent} suffix="%" />
            </div>
            <span className="text-[9px] font-mono text-neutral-300 font-semibold px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] truncate max-w-[120px]">
              {level}
            </span>
          </div>
        </div>
      </div>

      {/* Micro Telemetry Indicators */}
      <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-center font-mono">
        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-2">
          <span className="text-xs font-bold text-white block">
            <AnimatedStat value={completedMilestones} />
          </span>
          <span className="text-[9px] text-neutral-400 uppercase tracking-wider">
            Milestones
          </span>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-2">
          <span className="text-xs font-bold text-white block">
            <AnimatedStat value={completedLessons} />
          </span>
          <span className="text-[9px] text-neutral-400 uppercase tracking-wider">
            Lesson Units
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Overview Component 2: Active Mission Directive Launchpad
───────────────────────────────────────── */
function ActiveMissionLaunchpad({
  currentPath,
  onEngage,
}) {
  const currentTitle = currentPath?.title || 'Python Fundamentals & System Architecture'
  const nextStepTitle = currentPath?.next_step_title || 'Object Oriented Architecture & Design Patterns'
  const category = currentPath?.category || 'CORE ENGINEERING'
  const duration = currentPath?.duration || '12-14 WEEKS'
  const progressPercent = currentPath?.progress_percent ?? 80

  return (
    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-[#05070d]/85 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between h-full group hover:border-white/25 transition-all duration-300">
      {/* Header telemetry status */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            DIRECTIVE STATUS: ENGAGED
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[9px] font-mono text-neutral-300 uppercase">
            {category}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-mono text-neutral-400 uppercase hidden sm:inline-block">
            {duration}
          </span>
        </div>
      </div>

      {/* Main Directive Info */}
      <div className="my-4 space-y-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
            CURRENT TARGET DIRECTIVE
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-cyan-200 transition-colors">
            {nextStepTitle}
          </h3>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Active milestone in <span className="text-neutral-200 font-medium">{currentTitle}</span>
          </p>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Milestone Progress</span>
            <span className="text-white font-bold font-mono">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden bg-white/[0.06] rounded-full relative">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-white rounded-full relative shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px] opacity-90" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* High-Impact CTA button */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-cyan-400" />
          <span>EST. TIME: ~45 MIN DIRECTIVE</span>
        </span>

        <button
          type="button"
          onClick={onEngage}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_14px_rgba(255,255,255,0.2)] hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] group/btn shrink-0"
        >
          <span>ENGAGE DIRECTIVE</span>
          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Overview Component 3: Avionics Telemetry Grid
───────────────────────────────────────── */
function AvionicsTelemetryGrid({
  completedMilestones = 0,
  completedTasksCount = 0,
  totalTasks = 3,
  completedProjectsCount = 0,
  streakCount = 1,
}) {
  const animatedMilestones = useAnimatedNumber(completedMilestones)
  const animatedProjects = useAnimatedNumber(completedProjectsCount)
  const animatedStreak = useAnimatedNumber(streakCount)

  const items = [
    {
      label: 'VERIFIED MILESTONES',
      value: animatedMilestones,
      suffix: '',
      subtext: '+2 This Week // 100% Integrity',
      icon: Target,
      iconColor: 'text-cyan-400',
      badgeColor: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    },
    {
      label: 'DAILY VELOCITY',
      value: `${completedTasksCount}/${totalTasks}`,
      suffix: '',
      subtext: "Today's Flight Cadence",
      icon: Zap,
      iconColor: 'text-emerald-400',
      badgeColor: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    {
      label: 'CODE BUILDS',
      value: animatedProjects || 1,
      suffix: ' Repos',
      subtext: 'Production Deliverables',
      icon: FolderGit2,
      iconColor: 'text-sky-400',
      badgeColor: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    },
    {
      label: 'STREAK MULTIPLIER',
      value: animatedStreak,
      suffix: 'x Ignition',
      subtext: `${streakCount} Active Days`,
      icon: Flame,
      iconColor: 'text-amber-400',
      badgeColor: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
      {items.map((it, idx) => {
        const IconComponent = it.icon
        return (
          <div
            key={idx}
            className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-4 sm:p-4.5 flex flex-col justify-between hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300 group shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                {it.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${it.badgeColor}`}>
                <IconComponent className={`h-3.5 w-3.5 ${it.iconColor}`} />
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight group-hover:text-cyan-100 transition-colors">
                {it.value}
                {it.suffix}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span className="truncate">{it.subtext}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────
   Overview Component 4: Circuit Progression Map
───────────────────────────────────────── */
function CircuitProgressionMap({ currentPath, onEngage }) {
  const activeMilestone = currentPath?.next_step_title || 'Object Oriented Architecture & Design Patterns'

  const circuitNodes = [
    {
      step: '01',
      title: 'Language Syntax & Primitives',
      category: 'RUNTIME FOUNDATIONS',
      status: 'completed',
    },
    {
      step: '02',
      title: 'Data Structures & Algorithms',
      category: 'CORE COMPUTATION',
      status: 'completed',
    },
    {
      step: '03',
      title: activeMilestone,
      category: 'ACTIVE MISSION DIRECTIVE',
      status: 'active',
    },
    {
      step: '04',
      title: 'Asynchronous I/O & Microservice APIs',
      category: 'DISTRIBUTED SYSTEMS',
      status: 'upcoming',
    },
    {
      step: '05',
      title: 'Cloud Orchestration & CI/CD Telemetry',
      category: 'PRODUCTION RELEASE',
      status: 'upcoming',
    },
  ]

  return (
    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/30 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#05070d]/85 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-5">
      {/* Circuit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Circuit Progression Map
            </h3>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono text-cyan-300">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Interconnected milestone circuit tracing completed competencies into active directives.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
            CIRCUIT TOPOLOGY
          </span>
          <span className="text-xs font-mono text-neutral-300">
            5 Milestone Nodes Synchronized
          </span>
        </div>
      </div>

      {/* Visual Circuit Timeline Track */}
      <div className="relative pt-2 pb-2">
        <div className="overflow-x-auto pb-4 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="min-w-[720px] relative">
            {/* The Conductive Copper / Cyan Trace Line */}
            <div className="absolute top-[26px] left-8 right-8 h-[2px] bg-white/[0.08] z-0">
              {/* Completed part of trace */}
              <div className="h-full w-1/2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </div>

            {/* Circuit Nodes */}
            <div className="grid grid-cols-5 gap-3 relative z-10">
              {circuitNodes.map((node) => {
                const isCompleted = node.status === 'completed'
                const isActive = node.status === 'active'

                return (
                  <div
                    key={node.step}
                    onClick={() => {
                      if (isActive || isCompleted) onEngage()
                    }}
                    className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'border-cyan-400/50 bg-cyan-950/30 shadow-[0_0_24px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                        : isCompleted
                        ? 'border-emerald-500/20 bg-emerald-950/15 hover:border-emerald-500/40'
                        : 'border-white/[0.06] bg-black/40 opacity-70 hover:opacity-100 hover:border-white/20'
                    }`}
                  >
                    {/* Node Solder Pad / Indicator */}
                    <div className="relative mb-3 flex items-center justify-center">
                      {isActive && (
                        <span className="animate-ping absolute h-8 w-8 rounded-full bg-cyan-400 opacity-60" />
                      )}
                      <div
                        className={`relative h-8 w-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-transform duration-300 ${
                          isActive
                            ? 'bg-cyan-400 text-black shadow-[0_0_16px_rgba(6,182,212,0.9)] scale-110'
                            : isCompleted
                            ? 'bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : 'bg-black/60 border border-white/20 text-neutral-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                        ) : (
                          node.step
                        )}
                      </div>
                    </div>

                    {/* Node Status Badge */}
                    <span
                      className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5 ${
                        isActive
                          ? 'bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/40 animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                          : 'bg-white/[0.04] text-neutral-400 border border-white/[0.06]'
                      }`}
                    >
                      {isActive ? 'ACTIVE DIRECTIVE' : isCompleted ? 'VERIFIED' : 'QUEUED'}
                    </span>

                    {/* Node Title & Category */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">
                        {node.category}
                      </span>
                      <h4
                        className={`text-xs font-bold leading-tight ${
                          isActive ? 'text-white' : isCompleted ? 'text-neutral-200' : 'text-neutral-400'
                        }`}
                      >
                        {node.title}
                      </h4>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Overview Component 5: Floating Neural AI Copilot Command Bar
───────────────────────────────────────── */
function FloatingNeuralCopilotBar({
  mentorInput,
  setMentorInput,
  onSubmit,
  isMentorTyping,
  onChipClick,
  copilotInputRef,
}) {
  const chips = [
    'What should I learn next based on my roadmaps?',
    'How do I build full-stack projects that get hired?',
    'Review my learning progression & velocity',
    'Explain Python async/await and concurrency',
  ]

  return (
    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/30 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#05070d]/85 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-4">
      {/* Copilot Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight font-mono">
            NEURAL COPILOT COMMAND BAR
          </h3>
          <span className="text-neutral-500 font-mono text-xs hidden sm:inline">•</span>
          <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
            Direct Autonomous Interface
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[9px] font-mono text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            REASONING ONLINE
          </span>
        </div>
      </div>

      {/* Monospace Prompt Bar */}
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <Terminal className="h-4 w-4 text-cyan-400" />
          </div>
          <input
            ref={copilotInputRef}
            type="text"
            value={mentorInput}
            onChange={(e) => setMentorInput(e.target.value)}
            placeholder="Ask Technea AI anything... ⌘K"
            className="w-full min-h-[46px] rounded-xl border border-white/[0.1] bg-black/60 pl-10 pr-16 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 focus:outline-none font-mono transition-all duration-300 shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 border border-white/10 bg-white/[0.04] px-1.5 py-0.5 rounded text-[9px] font-mono text-neutral-400">
            <span>⌘K</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!mentorInput.trim() || isMentorTyping}
          className={`min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer ${
            mentorInput.trim() && !isMentorTyping
              ? 'bg-white text-black hover:bg-neutral-200 shadow-[0_2px_12px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
              : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06] cursor-not-allowed'
          }`}
        >
          <span>Query Copilot</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Quick Prompt Chips */}
      <div className="pt-1 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Quick Prompts:</span>
        </span>
        {chips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChipClick(chip)}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:border-cyan-400/40 hover:bg-white/[0.08] hover:text-white px-3 py-1 text-xs text-neutral-300 font-mono transition-all duration-300 cursor-pointer shadow-xs"
          >
            <span className="text-cyan-400">↳</span>
            <span>{chip}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Overview Component 6: Daily Flight Tracker
───────────────────────────────────────── */
function DailyFlightTracker({
  weeklyHistory = [],
  streakCount = 1,
  tasks = [],
  onToggleTask,
}) {
  const defaultDays = [
    { day_name: 'Mon', is_active: true, completed_tasks_count: 2 },
    { day_name: 'Tue', is_active: true, completed_tasks_count: 3 },
    { day_name: 'Wed', is_active: true, completed_tasks_count: 1 },
    { day_name: 'Thu', is_active: true, completed_tasks_count: 2 },
    { day_name: 'Fri', is_active: true, completed_tasks_count: 3 },
    { day_name: 'Sat', is_active: true, completed_tasks_count: 2 },
    { day_name: 'Sun', is_active: false, completed_tasks_count: 0 },
  ]
  const days = weeklyHistory.length === 7 ? weeklyHistory : defaultDays
  const completedTasksCount = tasks.filter((t) => t.done).length

  return (
    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Daily Flight Tracker & Checklist
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Maintain daily coding cadence and synchronize verified completion telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300 font-bold">
            <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>{streakCount}d Ignition Velocity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Checklist Goals (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
            <span className="uppercase tracking-wider">Today&apos;s Flight Objectives</span>
            <span className="text-white font-semibold">
              {completedTasksCount} / {tasks.length} Complete
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                role="checkbox"
                aria-checked={task.done}
                aria-label={`Task: ${task.text}, ${task.done ? 'completed' : 'incomplete'}`}
                onClick={() => onToggleTask(task.id)}
                className={`w-full min-h-[46px] flex items-center justify-between rounded-xl border px-4 py-3 text-left text-xs transition-all duration-300 cursor-pointer ${
                  task.done
                    ? 'border-emerald-500/20 bg-emerald-950/10 text-neutral-400'
                    : 'border-white/[0.08] bg-black/40 text-neutral-200 hover:border-white/[0.2] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-all ${
                      task.done
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : 'border-white/25 bg-white/[0.04]'
                    }`}
                  >
                    {task.done && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </span>
                  <span
                    className={`truncate font-mono text-xs ${
                      task.done ? 'line-through text-neutral-400' : 'text-neutral-200 font-medium'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    task.done
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/[0.04] text-neutral-400'
                  }`}
                >
                  {task.done ? 'DONE' : 'PENDING'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Circular 7-Day Radar Gauge (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-black/40 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              7-Day Radar Velocity
            </span>
            <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Cadence
            </span>
          </div>

          {/* 7-Day Circular Radar Nodes */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {days.map((day, idx) => {
              const isToday = idx === days.length - 1
              return (
                <div
                  key={day.date || idx}
                  className={`rounded-xl border p-2 text-center flex flex-col items-center justify-between gap-2 transition-all ${
                    isToday
                      ? 'border-white/30 bg-white/[0.08] shadow-[0_2px_16px_rgba(255,255,255,0.08)] ring-1 ring-white/20'
                      : day.is_active
                      ? 'border-emerald-500/20 bg-emerald-950/15'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wider ${
                      isToday ? 'text-white font-bold' : 'text-neutral-400'
                    }`}
                  >
                    {day.day_name?.slice(0, 3)}
                  </span>

                  {/* Circular Radar Indicator */}
                  <div className="relative flex items-center justify-center my-0.5">
                    {isToday && (
                      <span className="animate-ping absolute h-4 w-4 rounded-full bg-white opacity-40" />
                    )}
                    <div
                      className={`h-3 w-3 rounded-full transition-all ${
                        isToday
                          ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] ring-2 ring-white/30'
                          : day.is_active
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                          : 'bg-white/10'
                      }`}
                      title={`${day.completed_tasks_count || 0} tasks finished`}
                    />
                  </div>

                  <span className="text-[9px] font-mono text-neutral-400">
                    {day.completed_tasks_count > 0 ? `${day.completed_tasks_count}` : '—'}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>WEEKLY CONSISTENCY</span>
            <span className="text-white font-semibold">100% Target Met</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main Dashboard Modal Component (Spatial Learning OS)
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
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'roadmaps' | 'projects' | 'mentor' | 'community' | 'profile'
  const [toastMessage, setToastMessage] = useState(null)
  const [failedProfileAvatarUrl, setFailedProfileAvatarUrl] = useState(null)
  const [failedShareAvatarUrl, setFailedShareAvatarUrl] = useState(null)
  const toastTimeoutRef = useRef(null)
  const modalRef = useRef(null)
  const copilotInputRef = useRef(null)

  const profileAvatarError = failedProfileAvatarUrl === user?.avatar_url && Boolean(user?.avatar_url)
  const shareAvatarError = failedShareAvatarUrl === user?.avatar_url && Boolean(user?.avatar_url)

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  // Projects State
  const [projectsList, setProjectsList] = useState([])
  const [recommendedProjects, setRecommendedProjects] = useState([])
  const [userProjectsMap, setUserProjectsMap] = useState({})
  const [projectFilter, setProjectFilter] = useState('all') // 'all' | 'recommended' | 'Beginner' | 'Intermediate' | 'Advanced'
  const [editingGithubProject, setEditingGithubProject] = useState(null)
  const [githubUrlInput, setGithubUrlInput] = useState('')

  // AI Mentor Chat State
  const [mentorConversationId, setMentorConversationId] = useState(() => {
    const saved = loadSavedMentorSession()
    return saved?.conversation_id || null
  })
  const [mentorMessages, setMentorMessages] = useState(() => {
    const saved = loadSavedMentorSession()
    if (saved?.messages && saved.messages.length > 0) {
      return saved.messages
    }
    return [createDefaultMentorGreeting(user)]
  })
  const [mentorInput, setMentorInput] = useState('')
  const [isMentorTyping, setIsMentorTyping] = useState(false)
  const isClearingChatRef = useRef(false)
  const chatBottomRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'mentor') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeTab, mentorMessages, isMentorTyping])

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    if (!isOpen) return
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (activeTab !== 'overview') {
          setActiveTab('overview')
        }
        setTimeout(() => {
          copilotInputRef.current?.focus()
        }, 50)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isOpen, activeTab])

  // Persist mentor conversation state to sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.sessionStorage) return

    if (isClearingChatRef.current) {
      isClearingChatRef.current = false
      return
    }

    const isSingleDefault =
      mentorMessages.length === 1 &&
      mentorMessages[0].id === 'msg-default-1' &&
      mentorMessages[0].sender === 'mentor'

    if (isSingleDefault) {
      return
    }

    try {
      const payload = {
        conversation_id: mentorConversationId || null,
        messages: mentorMessages,
      }
      window.sessionStorage.setItem(AI_MENTOR_SESSION_STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      console.warn('Failed to persist mentor session to sessionStorage:', err)
    }
  }, [mentorMessages, mentorConversationId])

  // Community Rooms State
  const [communityRooms, setCommunityRooms] = useState([])
  const [joinedRoomIds, setJoinedRoomIds] = useState(new Set())
  const [roomFilter, setRoomFilter] = useState('all') // 'all' | 'joined'

  // User Profile & Portfolio Details
  const [profileData, setProfileData] = useState(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Interactive Checklist State
  const [tasks, setTasks] = useState([
    { id: 'lesson', text: 'Complete one lesson', done: true },
    { id: 'milestone', text: 'Finish one milestone', done: false },
    { id: 'build', text: 'Build something', done: false },
  ])

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

  // Project Actions
  const handleStartProject = async (projectId) => {
    setUserProjectsMap((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), status: 'in_progress' },
    }))
    showToast('Project initialized! Track your progress and push code.')
    try {
      await updateProjectStatusApi(projectId, { status: 'in_progress' })
    } catch (e) {
      console.warn('Failed to start project:', e)
    }
  }

  const handleCompleteProject = async (projectId) => {
    setUserProjectsMap((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), status: 'completed' },
    }))
    showToast('Project marked as completed! +150 XP awarded to your developer profile.')
    try {
      await updateProjectStatusApi(projectId, { status: 'completed' })
    } catch (e) {
      console.warn('Failed to complete project:', e)
    }
  }

  const handleSaveGithubUrl = async (projectId, url) => {
    const currentStatus = userProjectsMap[projectId]?.status || 'in_progress'
    setUserProjectsMap((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), github_url: url, status: currentStatus },
    }))
    setEditingGithubProject(null)
    setGithubUrlInput('')
    showToast('GitHub repository URL saved to your portfolio!')
    try {
      await updateProjectStatusApi(projectId, { status: currentStatus, github_url: url })
    } catch (e) {
      console.warn('Failed to update github url:', e)
    }
  }

  // AI Mentor Chat Action
  const handleSendMentorMessage = async (msgText) => {
    const textToSend = (msgText || mentorInput || '').trim()
    if (!textToSend || isMentorTyping) return

    const userMsg = {
      id: getNextMentorMsgId(),
      conversation_id: mentorConversationId || null,
      sender: 'user',
      text: textToSend,
      timestamp: getMentorTimeString(),
    }

    setMentorMessages((prev) => [...prev, userMsg])
    setMentorInput('')
    setIsMentorTyping(true)

    try {
      const conversationHistory = mentorMessages
        .filter((m) => m.text && !m.isError)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }))

      const response = await sendAiChatApi({
        message: textToSend,
        conversation_history: conversationHistory,
      })

      if (response?.conversation_id) {
        setMentorConversationId(response.conversation_id)
      }

      const mentorMsg = {
        id: getNextMentorMsgId(),
        conversation_id: response?.conversation_id || mentorConversationId || null,
        sender: 'mentor',
        text: response?.response || response?.reply || 'Here to assist you on your engineering journey.',
        suggestions: Array.isArray(response?.suggestions)
          ? response.suggestions
          : (Array.isArray(response?.quick_prompts) ? response.quick_prompts : []),
        related_actions: Array.isArray(response?.related_actions) ? response.related_actions : [],
        provider_used: response?.provider_used,
        timestamp: getMentorTimeString(),
      }

      setMentorMessages((prev) => [...prev, mentorMsg])
    } catch (err) {
      console.error('Failed to get AI mentor response:', err)
      const errorMsg = {
        id: getNextMentorMsgId(),
        conversation_id: mentorConversationId || null,
        sender: 'mentor',
        text: 'I encountered an issue connecting to Technea AI. Please check your network or try again.',
        suggestions: [
          'What should I learn next based on my roadmaps?',
          'How do I build full-stack projects that get hired?',
        ],
        related_actions: [],
        timestamp: getMentorTimeString(),
        isError: true,
      }
      setMentorMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsMentorTyping(false)
    }
  }

  // Clear Chat and reset AI Mentor conversation
  const handleClearMentorChat = () => {
    isClearingChatRef.current = true
    const defaultGreeting = createDefaultMentorGreeting(user)
    setMentorConversationId(null)
    setMentorMessages([defaultGreeting])
    setMentorInput('')
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(AI_MENTOR_SESSION_STORAGE_KEY)
      } catch (err) {
        console.warn('Failed to clear mentor session from sessionStorage:', err)
      }
    }
    showToast('Conversation reset')
  }

  // Handle Interactive Related Action Pills from AI responses
  const handleRelatedAction = (action) => {
    if (!action) return
    const { action_type, payload } = action

    if (action_type === 'view_roadmap') {
      if (payload?.path_id) {
        onSelectPath({ id: payload.path_id, title: payload.title, slug: payload.slug })
        onClose()
      } else {
        setActiveTab('roadmaps')
      }
    } else if (action_type === 'view_project') {
      setActiveTab('projects')
    } else if (action_type === 'explore_skill' || action_type === 'browse_catalog') {
      if (typeof onOpenExplorer === 'function') {
        onOpenExplorer(payload?.skill || payload?.skill_id)
        onClose()
      }
    } else if (action_type === 'external_link' && typeof payload === 'string') {
      window.open(payload, '_blank', 'noopener,noreferrer')
    } else {
      const titleLower = (action.title || '').toLowerCase()
      if (titleLower.includes('roadmap')) {
        setActiveTab('roadmaps')
      } else if (titleLower.includes('project')) {
        setActiveTab('projects')
      } else if (titleLower.includes('skill') || titleLower.includes('catalog')) {
        if (typeof onOpenExplorer === 'function') {
          onOpenExplorer()
          onClose()
        }
      }
    }
  }

  // Community Room Action
  const handleToggleRoom = async (roomId) => {
    const isCurrentlyJoined = joinedRoomIds.has(roomId)
    const nextSet = new Set(joinedRoomIds)
    if (isCurrentlyJoined) {
      nextSet.delete(roomId)
    } else {
      nextSet.add(roomId)
    }
    setJoinedRoomIds(nextSet)

    setCommunityRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            is_joined: !isCurrentlyJoined,
            active_learners_count: r.active_learners_count + (!isCurrentlyJoined ? 1 : -1),
          }
        }
        return r
      })
    )

    try {
      const res = await toggleRoomJoinApi(roomId)
      showToast(res.message || (!isCurrentlyJoined ? 'Joined learning room!' : 'Left room.'))
    } catch (e) {
      console.warn('Failed to toggle room join:', e)
    }
  }

  // Fetch Dashboard & Ecosystem data
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    const fetchAllData = async () => {
      if (isMounted) {
        setLoading(true)
        setError(null)
      }
      try {
        const [
          dashData,
          roadmapsData,
          projsData,
          recProjsData,
          myProjsData,
          roomsData,
          profileRes,
        ] = await Promise.allSettled([
          getDashboardSummaryApi(),
          getMyRoadmapsApi(),
          getProjectsApi(),
          getRecommendedProjectsApi(),
          getMyProjectsApi(),
          getCommunityRoomsApi(),
          getUserProfileApi(),
        ])

        if (isMounted) {
          if (dashData.status === 'fulfilled') {
            setDashboardData(dashData.value)
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
            try {
              const localGuest = JSON.parse(
                localStorage.getItem('technea_guest_saved_roadmaps') || '[]'
              )
              setSavedRoadmaps(localGuest)
            } catch {
              setSavedRoadmaps([])
            }
          }
          if (projsData.status === 'fulfilled' && Array.isArray(projsData.value)) {
            setProjectsList(projsData.value)
          }
          if (recProjsData.status === 'fulfilled' && Array.isArray(recProjsData.value)) {
            setRecommendedProjects(recProjsData.value)
          }
          if (myProjsData.status === 'fulfilled' && Array.isArray(myProjsData.value)) {
            const map = {}
            myProjsData.value.forEach((p) => {
              map[p.project_id] = { status: p.status, github_url: p.github_url }
            })
            setUserProjectsMap(map)
          }
          if (roomsData.status === 'fulfilled' && Array.isArray(roomsData.value)) {
            setCommunityRooms(roomsData.value)
            setJoinedRoomIds(new Set(roomsData.value.filter((r) => r.is_joined).map((r) => r.id)))
          }
          if (profileRes.status === 'fulfilled') {
            setProfileData(profileRes.value)
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load dashboard ecosystem:', err)
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

  // Body scroll lock and focus trap
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const modalEl = modalRef.current
    const focusableSelectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const timer = setTimeout(() => {
      if (!modalEl) return
      const activeTabEl = modalEl.querySelector('[role="tab"][aria-selected="true"]')
      if (activeTabEl) {
        activeTabEl.focus()
      } else {
        const first = modalEl.querySelector(focusableSelectors)
        first?.focus()
      }
    }, 50)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && modalEl) {
        const focusable = Array.from(modalEl.querySelectorAll(focusableSelectors))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
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
  const dailyActivity = dashboardData?.daily_activity || null

  // Core metrics & Gamification Progression
  const overallPercent = dashboardData?.overall_progress_percent || 0
  const completedMilestones = dashboardData?.total_completed_milestones || 0
  const completedLessons = dashboardData?.total_completed_lessons || 0
  const streakCount = dailyActivity?.streak_count || dashboardData?.streak_count || 1
  const developerLevel = dashboardData?.developer_level || profileData?.developer_level || 'Code Initiate'
  const xpPoints = dashboardData?.xp_points ?? profileData?.xp_points ?? 50
  const nextLevelXp = dashboardData?.next_level_xp ?? profileData?.next_level_xp ?? 250
  const levelProgressPercent = dashboardData?.level_progress_percent ?? profileData?.level_progress_percent ?? 20
  const completedProjectsCount = dashboardData?.completed_projects_count ?? 0
  const activeProjectsCount = dashboardData?.active_projects_count ?? 0
  const joinedRoomsCount = dashboardData?.joined_rooms_count ?? joinedRoomIds.size ?? 0

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
        aria-label="Technea Autonomous Spatial Learning OS"
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden"
      >
        {/* Deep Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Shell — Spatial Glass Cockpit Layout */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          data-lenis-prevent
          className="relative z-10 flex flex-col w-full max-w-7xl h-[94vh] max-h-[1020px] rounded-3xl border border-white/[0.12] bg-[#030408]/90 backdrop-blur-3xl shadow-[0_30px_120px_rgba(0,0,0,0.98)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"
        >
          {/* Futuristic Immersive Cosmic Atmosphere & Starfield */}
          {isOpen && <SpaceGardenAtmosphere />}

          {/* ──────────────── Top Header Bar (VisionOS Floating Telemetry Header) ──────────────── */}
          <header className="relative z-20 flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl px-4 sm:px-6 py-3.5 gap-3.5 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            {/* Left: Technea OS System Status Badge */}
            <div className="flex items-center justify-between xl:justify-start gap-3 min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* System Status Pill */}
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 shadow-inner">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  </span>
                  <span className="text-xs font-mono font-bold text-white tracking-wider">
                    TECHNEA OS // v2.6.0
                  </span>
                  <span className="text-white/20 font-mono hidden sm:inline">|</span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-widest hidden sm:inline">
                    STATUS: ONLINE
                  </span>
                </div>

                {/* User Developer Level Badge */}
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-mono font-medium text-neutral-300 uppercase tracking-wider shrink-0 hidden sm:inline-block">
                  {developerLevel}
                </span>
              </div>

              {/* Mobile-only Close Button */}
              <div className="flex items-center gap-1.5 xl:hidden">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
                  aria-label="Close dashboard"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Center: Floating VisionOS Segmented Pill Bar (6 Tabs) */}
            <nav
              role="tablist"
              aria-label="Dashboard views"
              data-lenis-prevent
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-2xl flex items-center overflow-x-auto max-w-full scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 shadow-inner"
            >
              {[
                { id: 'overview', label: 'Overview', icon: null, badge: null },
                { id: 'roadmaps', label: 'Roadmaps', icon: Compass, badge: savedRoadmaps.length > 0 ? savedRoadmaps.length : null },
                { id: 'projects', label: 'Projects', icon: FolderGit2, badge: recommendedProjects.length > 0 ? recommendedProjects.length : null },
                { id: 'mentor', label: 'AI Mentor', icon: Bot, badge: null },
                { id: 'community', label: 'Guilds', icon: Users, badge: joinedRoomIds.size > 0 ? joinedRoomIds.size : null },
                { id: 'profile', label: 'Portfolio', icon: Award, badge: null },
              ].map((tab) => {
                const isSelected = activeTab === tab.id
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-xl px-3.5 py-2 sm:px-3 sm:py-1.5 min-h-[44px] sm:min-h-[38px] flex items-center justify-center gap-1.5 text-xs font-mono transition-all duration-300 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-white/[0.12] text-white font-semibold shadow-inner border border-white/20'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    {TabIcon && (
                      <TabIcon className={`h-3 w-3 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                    )}
                    <span>{tab.label}</span>
                    {tab.badge !== null && (
                      <span
                        className={`rounded-full px-1.5 text-[9px] font-mono ${
                          isSelected ? 'bg-white/20 text-white font-bold' : 'bg-white/10 text-neutral-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Right: Telemetry Strip (XP + Streak + Sign Out + Close) */}
            <div className="hidden xl:flex items-center gap-2 shrink-0">
              {/* XP Telemetry Pill */}
              <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-neutral-200 shadow-inner">
                <Zap className="h-3 w-3 text-cyan-400" />
                <span className="font-mono">{xpPoints} XP</span>
              </div>

              {/* Streak Ignition Pill */}
              <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-neutral-200 shadow-inner">
                <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span className="font-mono">{streakCount}d</span>
              </div>

              {/* Sign Out */}
              <button
                type="button"
                onClick={logout}
                className="flex min-h-[44px] sm:min-h-[38px] items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] px-3 py-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-all duration-300 cursor-pointer"
                title="Sign out of account"
                aria-label="Sign out of account"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign Out</span>
              </button>

              {/* Close Modal */}
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-[38px] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Close dashboard"
              >
                <X className="h-4 w-4" />
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
                className="absolute top-16 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl px-4 py-2 text-xs font-mono text-white shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────── Scrollable Dashboard Canvas ──────────────── */}
          <div data-lenis-prevent className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden bg-transparent p-4 sm:p-6 md:p-8 space-y-7">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
                <p className="text-xs text-neutral-400 font-mono">
                  Loading your engineering workspace…
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-950/20 backdrop-blur-xl p-6 text-center text-xs text-red-300 font-mono">
                <p>{error}</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* ══════════════ TAB 1: OVERVIEW (AI ENGINEERING COMMAND CENTER) ══════════════ */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-7"
                  >
                    {/* ── SECTION 1: Hero Command Header ── */}
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-[#05070d]/85 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/20 transition-all duration-300">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                            TECHNEA COMMAND CENTER // COCKPIT ACTIVE
                          </span>
                          <span className="text-white/20">•</span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono text-neutral-300 uppercase">
                            {developerLevel}
                          </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                          WELCOME BACK, {firstName}
                        </h1>

                        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-400">
                          <span className="text-cyan-400 font-semibold">ACTIVE MISSION:</span>
                          <span className="text-white font-bold uppercase tracking-wider">
                            {currentPath?.title || 'PYTHON FULL STACK DEVELOPER'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            openRoadmapBuilder()
                          }}
                          className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-all duration-300 px-5 py-2.5 text-xs cursor-pointer shadow-[0_2px_16px_rgba(255,255,255,0.2)] hover:shadow-[0_0_24px_rgba(255,255,255,0.4)]"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>Build My Roadmap</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onOpenExplorer()
                          }}
                          className="min-h-[44px] inline-flex items-center justify-center gap-2 border border-white/[0.12] bg-white/[0.03] text-neutral-200 hover:text-white hover:bg-white/[0.08] hover:border-white/25 rounded-xl transition-all duration-300 px-5 py-2.5 text-xs cursor-pointer shadow-inner"
                        >
                          <Compass className="h-4 w-4" />
                          <span>Browse Catalog</span>
                        </button>
                      </div>
                    </div>

                    {/* ── SECTION 2: Spatial Instrument Deck (3-Column Layout: Left Orbital, Center Active Directive, Right Avionics) ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                      {/* Left: Orbital Progression Circle (3 cols) */}
                      <div className="lg:col-span-3">
                        <OrbitalProgressGauge
                          percent={overallPercent}
                          level={developerLevel}
                          completedMilestones={completedMilestones}
                          completedLessons={completedLessons}
                        />
                      </div>

                      {/* Center: Active Mission Directive Launchpad (5 cols) */}
                      <div className="lg:col-span-5">
                        <ActiveMissionLaunchpad
                          currentPath={currentPath}
                          onEngage={() => {
                            onClose()
                            if (currentPath) {
                              onSelectPath(currentPath)
                            } else {
                              openRoadmapBuilder()
                            }
                          }}
                        />
                      </div>

                      {/* Right: Avionics Telemetry Grid (4 cols) */}
                      <div className="lg:col-span-4">
                        <AvionicsTelemetryGrid
                          completedMilestones={completedMilestones}
                          completedTasksCount={completedTasksCount}
                          totalTasks={tasks.length}
                          completedProjectsCount={completedProjectsCount}
                          activeProjectsCount={activeProjectsCount}
                          streakCount={streakCount}
                        />
                      </div>
                    </div>

                    {/* ── SECTION 3: Circuit Progression Map (Replacing standard list) ── */}
                    <CircuitProgressionMap
                      currentPath={currentPath}
                      onEngage={() => {
                        onClose()
                        if (currentPath) {
                          onSelectPath(currentPath)
                        } else {
                          openRoadmapBuilder()
                        }
                      }}
                    />

                    {/* ── SECTION 4: Floating Neural AI Copilot Command Bar ── */}
                    <FloatingNeuralCopilotBar
                      mentorInput={mentorInput}
                      setMentorInput={setMentorInput}
                      onSubmit={(e) => {
                        e.preventDefault()
                        const q = mentorInput.trim()
                        if (!q || isMentorTyping) return
                        handleSendMentorMessage(q)
                        setActiveTab('mentor')
                      }}
                      isMentorTyping={isMentorTyping}
                      onChipClick={(chip) => {
                        handleSendMentorMessage(chip)
                        setActiveTab('mentor')
                      }}
                      copilotInputRef={copilotInputRef}
                    />

                    {/* ── SECTION 5: Daily Flight Tracker ── */}
                    <DailyFlightTracker
                      weeklyHistory={dailyActivity?.weekly_history || []}
                      streakCount={streakCount}
                      tasks={tasks}
                      onToggleTask={toggleTask}
                    />
                  </motion.div>
                )}

                {/* ══════════════ TAB 2: AI ROADMAPS ══════════════ */}
                {activeTab === 'roadmaps' && (
                  <motion.div
                    key="roadmaps"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Your Career Roadmaps
                          </h2>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                            {savedRoadmaps.length} Custom Blueprints
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          AI-generated blueprints and enrolled catalog journeys tailored to your career trajectory.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          openRoadmapBuilder()
                        }}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
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
                              className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-5 sm:p-6 hover:border-white/[0.18] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between group"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono text-neutral-300 uppercase tracking-wider">
                                    {roadmap.target_role || 'Career Blueprint'}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    {roadmap.estimated_duration || '18 Weeks'}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-white truncate">
                                  {roadmap.title}
                                </h4>
                                <p className="text-xs text-neutral-400 line-clamp-2">
                                  Goal: &quot;{roadmap.goal}&quot;
                                </p>
                              </div>

                              <div className="mt-4 pt-3.5 border-t border-white/[0.06] space-y-2.5">
                                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                                  <span>{completedCount} milestones completed</span>
                                  <span className="text-white font-bold">
                                    {progress}%
                                  </span>
                                </div>
                                <MinimalProgressBar percent={progress} height={3} />

                                <div className="pt-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose()
                                      openRoadmapBuilder(roadmap.goal)
                                    }}
                                    className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl bg-white text-black font-semibold px-3.5 py-1.5 text-xs hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
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
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-8 sm:p-10 text-center space-y-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                        <Bookmark className="h-8 w-8 text-neutral-500 mx-auto" />
                        <h4 className="text-sm font-bold text-white">
                          No AI Career Roadmaps Generated Yet
                        </h4>
                        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                          Tell Technea what you want to become (e.g. Full Stack Developer, DevOps Engineer) and synthesize your personalized curriculum.
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose()
                              openRoadmapBuilder()
                            }}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Launch Roadmap Builder</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Catalog Enrolled Journeys */}
                    {enrolledPaths.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" />
                          <span>Catalog Enrolled Journeys ({enrolledPaths.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {enrolledPaths.map((path) => (
                            <div
                              key={path.id}
                              className="flex min-h-[44px] items-center justify-between rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-4 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300 cursor-pointer group"
                              onClick={() => {
                                onClose()
                                onSelectPath(path)
                              }}
                            >
                              <div className="min-w-0 pr-3">
                                <span className="text-[10px] font-mono text-neutral-400 block">
                                  {path.category}
                                </span>
                                <h5 className="text-xs font-bold text-white truncate">
                                  {path.title}
                                </h5>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {path.completed_steps_count} / {path.total_steps_count} milestones
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-mono font-bold text-white">
                                  {path.progress_percent}%
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ══════════════ TAB 3: PROJECTS (PROJECT CATALOG) ══════════════ */}
                {activeTab === 'projects' && (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Projects Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Engineering Project Catalog
                          </h2>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                            {projectsList.length} Real-World Builds
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Bridge theory into production deliverables. Connect code repositories to your developer portfolio.
                        </p>
                      </div>

                      {/* Filter Pills */}
                      <div data-lenis-prevent className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                        {[
                          { id: 'all', label: 'All Projects' },
                          { id: 'recommended', label: `Recommended (${recommendedProjects.length})` },
                          { id: 'Beginner', label: 'Beginner' },
                          { id: 'Intermediate', label: 'Intermediate' },
                          { id: 'Advanced', label: 'Advanced' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setProjectFilter(f.id)}
                            className={`rounded-xl border px-3 py-1.5 min-h-[44px] sm:min-h-[36px] flex items-center justify-center text-xs font-mono transition-all duration-300 cursor-pointer shrink-0 ${
                              projectFilter === f.id
                                ? 'border-white/20 bg-white text-black font-semibold shadow-[0_2px_10px_rgba(255,255,255,0.12)]'
                                : 'border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(projectFilter === 'all'
                        ? projectsList
                        : projectFilter === 'recommended'
                        ? recommendedProjects
                        : projectsList.filter((p) => p.difficulty === projectFilter)
                      ).map((proj) => {
                        const userStatus = userProjectsMap[proj.id]?.status || 'not_started'
                        const githubUrl = userProjectsMap[proj.id]?.github_url
                        const isRec = recommendedProjects.some((r) => r.id === proj.id)

                        return (
                          <div
                            key={proj.id}
                            className={`relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-300 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
                              userStatus === 'completed'
                                ? 'border-emerald-500/30 bg-[#05070d]/90 shadow-[0_8px_32px_rgba(16,185,129,0.08)]'
                                : userStatus === 'in_progress'
                                ? 'border-white/20 bg-[#05070d]/95 hover:border-white/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
                                : 'border-white/[0.08] bg-[#05070d]/85 hover:border-white/[0.18] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider ${
                                      proj.difficulty === 'Beginner'
                                        ? 'text-neutral-300'
                                        : proj.difficulty === 'Intermediate'
                                        ? 'text-neutral-200'
                                        : 'text-white'
                                    }`}
                                  >
                                    {proj.difficulty}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    {proj.duration_weeks || '2 Weeks'}
                                  </span>
                                  {isRec && (
                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono text-neutral-300">
                                      ★ Recommended
                                    </span>
                                  )}
                                </div>

                                {/* Status Badge */}
                                <span
                                  className={`text-[10px] font-mono font-semibold ${
                                    userStatus === 'completed'
                                      ? 'text-emerald-400 flex items-center gap-1'
                                      : userStatus === 'in_progress'
                                      ? 'text-neutral-200'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {userStatus === 'completed' && <Check className="h-3 w-3" />}
                                  {userStatus === 'completed'
                                    ? 'Completed'
                                    : userStatus === 'in_progress'
                                    ? 'In Progress'
                                    : 'Not Started'}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-white break-words">{proj.title}</h3>
                                <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                                  {proj.description}
                                </p>
                              </div>

                              {/* Tech stack */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {(proj.tech_stack || []).map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>

                              {/* Architectural requirements */}
                              {proj.architecture_spec?.length > 0 && (
                                <div className="rounded-xl border border-white/[0.08] bg-black/50 p-3 text-[11px] font-mono text-neutral-400 space-y-1">
                                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">
                                    Key Architectural Specifications:
                                  </span>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {proj.architecture_spec.slice(0, 2).map((spec, sIdx) => (
                                      <li key={sIdx} className="truncate">{spec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Bottom Actions */}
                            <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {githubUrl ? (
                                  <a
                                    href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 hover:text-white hover:underline truncate"
                                  >
                                    <GithubIcon className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingGithubProject(proj)
                                      setGithubUrlInput('')
                                    }}
                                    className="min-h-[44px] sm:min-h-[36px] text-[11px] font-mono text-neutral-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <GithubIcon className="h-3.5 w-3.5" />
                                    <span>Link GitHub Repo</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {userStatus === 'not_started' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartProject(proj.id)}
                                    className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                                  >
                                    <span>Start Project</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                                {userStatus === 'in_progress' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingGithubProject(proj)
                                        setGithubUrlInput(githubUrl || '')
                                      }}
                                      className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] p-2 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                      title="Update repo URL"
                                      aria-label={`Update GitHub repository URL for ${proj.title}`}
                                    >
                                      <GithubIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCompleteProject(proj.id)}
                                      className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                                    >
                                      <Check className="h-3 w-3" />
                                      <span>Complete (+150 XP)</span>
                                    </button>
                                  </>
                                )}
                                {userStatus === 'completed' && (
                                  <span className="text-[11px] font-mono text-emerald-400 font-medium flex items-center gap-1">
                                    ✓ Verified (+150 XP)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ══════════════ TAB 4: AI MENTOR (CONVERSATIONAL INTERFACE) ══════════════ */}
                {activeTab === 'mentor' && (
                  <motion.div
                    key="mentor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-4xl mx-auto w-full flex flex-col min-h-[580px] sm:min-h-[640px]"
                  >
                    {/* Top: Header with Engine Telemetry */}
                    <div className="border-b border-white/[0.08] pb-4 mb-6 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          Technea AI Mentor
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                          Your personal engineering companion & codebase advisor
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleClearMentorChat}
                          className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 border border-white/[0.1] bg-white/[0.03] text-neutral-300 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-300 cursor-pointer"
                          title="Reset conversation"
                          aria-label="Clear chat conversation"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Clear Chat</span>
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                          <span className="text-[11px] font-mono text-neutral-300">Neural Engine Online</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Conversation Area */}
                    <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-6 max-h-[480px] min-h-[360px]">
                      {mentorMessages.map((msg, idx) => {
                        const isLatestMentor =
                          msg.sender === 'mentor' &&
                          !mentorMessages.slice(idx + 1).some((m) => m.sender === 'mentor')

                        return msg.sender === 'user' ? (
                          <div key={msg.id} className="flex justify-end ml-auto">
                            <div className="max-w-xl rounded-2xl bg-white/[0.08] border border-white/[0.14] backdrop-blur-xl px-4 py-3 text-xs sm:text-sm text-white leading-relaxed whitespace-pre-wrap break-words shadow-sm">
                              {msg.text}
                            </div>
                          </div>
                        ) : (
                          <div key={msg.id} className="flex items-start gap-3.5 max-w-2xl mr-auto w-full">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white shrink-0 mt-0.5 shadow-sm">
                              <Bot className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div className="flex-1 space-y-2 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-white font-mono">
                                  Technea AI Mentor
                                </span>
                                {msg.timestamp && (
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    {msg.timestamp}
                                  </span>
                                )}
                              </div>

                              {/* AI Markdown & Code Blocks */}
                              <AIMessageRenderer content={msg.text} />

                              {/* Interactive Related Action Pills */}
                              {Array.isArray(msg.related_actions) && msg.related_actions.length > 0 && (
                                <div className="pt-2">
                                  <div className="flex flex-wrap gap-2">
                                    {msg.related_actions.map((act, actIdx) => (
                                      <button
                                        key={actIdx}
                                        type="button"
                                        onClick={() => handleRelatedAction(act)}
                                        className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white transition-all duration-300 cursor-pointer shadow-xs group"
                                      >
                                        {act.action_type === 'view_roadmap' && (
                                          <Compass className="h-3.5 w-3.5 text-neutral-400 group-hover:scale-110 transition-transform" />
                                        )}
                                        {act.action_type === 'view_project' && (
                                          <FolderGit2 className="h-3.5 w-3.5 text-neutral-400 group-hover:scale-110 transition-transform" />
                                        )}
                                        {act.action_type === 'explore_skill' && (
                                          <Layers className="h-3.5 w-3.5 text-neutral-400 group-hover:scale-110 transition-transform" />
                                        )}
                                        {act.action_type === 'browse_catalog' && (
                                          <Compass className="h-3.5 w-3.5 text-neutral-400 group-hover:scale-110 transition-transform" />
                                        )}
                                        {!['view_roadmap', 'view_project', 'explore_skill', 'browse_catalog'].includes(act.action_type) && (
                                          <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                                        )}
                                        <span>{act.title}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Follow-up Suggestion Chips */}
                              {Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && isLatestMentor && (
                                <div className="pt-2.5">
                                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                                    <Sparkles className="h-2.5 w-2.5 text-cyan-300" />
                                    <span>Follow-up Suggestions</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {msg.suggestions.map((suggestion, sIdx) => (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        disabled={isMentorTyping}
                                        onClick={() => handleSendMentorMessage(suggestion)}
                                        className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white transition-all duration-300 cursor-pointer text-left shadow-xs disabled:opacity-50 disabled:cursor-not-allowed group"
                                      >
                                        <span className="text-cyan-400 group-hover:text-cyan-200 transition-colors">↳</span>
                                        <span>{suggestion}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {isMentorTyping && (
                        <div className="flex items-start gap-3.5 max-w-2xl mr-auto">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white shrink-0 mt-0.5">
                            <Bot className="h-4 w-4 animate-pulse text-cyan-400" />
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-neutral-400 pt-1.5">
                            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-duration:900ms]" />
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-duration:900ms] [animation-delay:200ms]" />
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-duration:900ms] [animation-delay:400ms]" />
                            </div>
                            <span className="text-xs text-neutral-400 font-mono">Technea AI is thinking…</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Bottom: Monospace Input Bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMentorMessage()
                      }}
                      className="pt-4 border-t border-white/[0.08] flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2.5 mt-6"
                    >
                      <div className="relative flex-1 w-full">
                        <input
                          type="text"
                          value={mentorInput}
                          onChange={(e) => setMentorInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMentorMessage()
                            }
                          }}
                          placeholder="Ask Technea AI anything..."
                          className="w-full min-h-[44px] rounded-xl border border-white/[0.08] bg-black/60 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300 font-mono shadow-inner"
                          disabled={isMentorTyping}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!mentorInput.trim() || isMentorTyping}
                        className={`w-full min-[420px]:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold transition-all duration-300 shrink-0 cursor-pointer ${
                          mentorInput.trim() && !isMentorTyping
                            ? 'bg-white text-black hover:bg-neutral-200 shadow-[0_2px_12px_rgba(255,255,255,0.12)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]'
                            : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06] cursor-not-allowed'
                        }`}
                      >
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* ══════════════ TAB 5: GUILDS (COMMUNITY) ══════════════ */}
                {activeTab === 'community' && (
                  <motion.div
                    key="community"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Community Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Peer Learning Guilds
                          </h2>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                            {communityRooms.length} Active Guilds
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Join focused engineering circles. Ask questions, compare code implementations, and stay accountable with peers.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setRoomFilter('all')}
                          className={`min-h-[44px] sm:min-h-[36px] flex items-center justify-center rounded-xl border px-3.5 py-1.5 text-xs font-mono transition-all duration-300 cursor-pointer ${
                            roomFilter === 'all'
                              ? 'border-white/20 bg-white text-black font-semibold shadow-[0_2px_10px_rgba(255,255,255,0.12)]'
                              : 'border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          All Rooms ({communityRooms.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoomFilter('joined')}
                          className={`min-h-[44px] sm:min-h-[36px] flex items-center justify-center rounded-xl border px-3.5 py-1.5 text-xs font-mono transition-all duration-300 cursor-pointer ${
                            roomFilter === 'joined'
                              ? 'border-white/20 bg-white text-black font-semibold shadow-[0_2px_10px_rgba(255,255,255,0.12)]'
                              : 'border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          My Joined ({joinedRoomIds.size})
                        </button>
                      </div>
                    </div>

                    {/* Rooms Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {communityRooms
                        .filter((r) => (roomFilter === 'joined' ? joinedRoomIds.has(r.id) : true))
                        .map((room) => {
                          const isJoined = joinedRoomIds.has(room.id)
                          return (
                            <div
                              key={room.id}
                              className={`relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-300 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
                                isJoined
                                  ? 'border-white/20 bg-[#05070d]/95 hover:border-white/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
                                  : 'border-white/[0.08] bg-[#05070d]/85 hover:border-white/[0.18] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
                              }`}
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono text-neutral-300 uppercase">
                                    {room.category}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                    {room.active_learners_count} peers
                                  </span>
                                </div>

                                <div>
                                  <h3 className="text-sm font-bold text-white">{room.title}</h3>
                                  <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                                    {room.description}
                                  </p>
                                </div>

                                {/* Weekly Topics */}
                                {room.topics_covered?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {room.topics_covered.map((t, idx) => (
                                      <span
                                        key={idx}
                                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                                <span className="text-[10px] font-mono text-neutral-400">
                                  {isJoined ? 'Connected Room' : 'Public Room'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRoom(room.id)}
                                  className={`inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer ${
                                    isJoined
                                      ? 'border border-white/20 bg-white/10 text-white hover:bg-white/15'
                                      : 'bg-white text-black hover:bg-neutral-200 shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]'
                                  }`}
                                >
                                  {isJoined ? (
                                    <>
                                      <Check className="h-3 w-3 text-white" />
                                      <span>Joined Room</span>
                                    </>
                                  ) : (
                                    <>
                                      <Users className="h-3 w-3" />
                                      <span>Join Room</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </motion.div>
                )}

                {/* ══════════════ TAB 6: DEVELOPER PORTFOLIO & MASTERY ══════════════ */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Profile Header Identity Card with Level & XP Meter */}
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-6 sm:p-7 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {user?.avatar_url && !profileAvatarError ? (
                            <img
                              src={getAvatarUrl(user.avatar_url)}
                              alt={fullName}
                              onError={() => setFailedProfileAvatarUrl(user?.avatar_url)}
                              className="h-14 w-14 rounded-2xl object-cover border border-white/10 shadow-inner shrink-0"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-bold text-white font-mono shadow-inner shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-white">{fullName}</h3>
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono font-medium text-neutral-300 uppercase tracking-wider">
                                {developerLevel}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono text-neutral-400">
                                Verified Developer
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate max-w-full">
                              {userEmail} • Technea Developer ID: #{user?.id ? String(user.id).slice(0, 8) : 'eng-core'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsShareModalOpen(true)}
                            className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-2 text-xs font-mono text-neutral-200 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer shadow-xs"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share Portfolio</span>
                          </button>
                        </div>
                      </div>

                      {/* Developer XP & Tier Progression Bar */}
                      <div className="pt-4 border-t border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Developer Level Progress</span>
                          </span>
                          <span className="text-white font-bold">
                            {xpPoints} / {nextLevelXp} XP ({Math.max(0, nextLevelXp - xpPoints)} XP to next tier)
                          </span>
                        </div>
                        <MinimalProgressBar percent={levelProgressPercent} height={4} />
                      </div>
                    </div>

                    {/* Developer Metrics Quick Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Milestones</span>
                        <div className="text-lg font-bold text-white font-mono">{completedMilestones}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Verified mastery</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Lessons</span>
                        <div className="text-lg font-bold text-white font-mono">{completedLessons}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Completed units</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Projects</span>
                        <div className="text-lg font-bold text-white font-mono">{completedProjectsCount}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">{activeProjectsCount} in progress</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Coding Streak</span>
                        <div className="text-lg font-bold text-white font-mono">{streakCount}d</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Active velocity</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Active Paths</span>
                        <div className="text-lg font-bold text-white font-mono">{currentPath ? 1 : 0}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Enrolled curricula</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Guilds Joined</span>
                        <div className="text-lg font-bold text-white font-mono">{joinedRoomsCount}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Peer study rooms</span>
                      </div>
                    </div>

                    {/* Verified Hands-on Engineering Projects Portfolio */}
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-6 sm:p-7 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-2">
                          <FolderGit2 className="h-4 w-4 text-white" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                            Hands-On Engineering Projects & Deliverables
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('projects')}
                          className="min-h-[44px] sm:min-h-0 text-xs font-mono text-neutral-400 hover:text-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Explore project catalog</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      {(() => {
                        const activeOrCompletedProjects = projectsList.filter(
                          (p) =>
                            userProjectsMap[p.id]?.status === 'completed' ||
                            userProjectsMap[p.id]?.status === 'in_progress'
                        )

                        if (activeOrCompletedProjects.length === 0) {
                          const topProj = recommendedProjects[0] || projectsList[0]
                          return (
                            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5 space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-white">
                                  No hands-on projects linked to your portfolio yet
                                </h5>
                                <p className="text-[11px] text-neutral-400 max-w-md">
                                  Engineering recruiters evaluate production artifacts. Start building hands-on projects to showcase live code and linked GitHub repos.
                                </p>
                              </div>
                              {topProj && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleStartProject(topProj.id)
                                    setActiveTab('projects')
                                  }}
                                  className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shrink-0 mt-3 sm:mt-0 shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                                >
                                  <span>Start {topProj.title}</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeOrCompletedProjects.map((proj) => {
                              const uData = userProjectsMap[proj.id] || {}
                              const isComplete = uData.status === 'completed'
                              const repoUrl = uData.github_url

                              return (
                                <div
                                  key={proj.id}
                                  className="rounded-xl border border-white/[0.08] bg-black/40 p-4.5 flex flex-col justify-between space-y-3 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300"
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <h5 className="text-xs font-bold text-white truncate">
                                        {proj.title}
                                      </h5>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-medium uppercase shrink-0 ${
                                          isComplete
                                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                            : 'bg-white/[0.03] border border-white/10 text-neutral-300'
                                        }`}
                                      >
                                        {isComplete ? '✓ Completed' : 'In Progress'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 line-clamp-2">
                                      {proj.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {(proj.tech_stack || []).map((tech) => (
                                        <span
                                          key={tech}
                                          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono text-neutral-300"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                                    <span className="text-[10px] text-neutral-400">
                                      {proj.difficulty} • +150 XP
                                    </span>

                                    {repoUrl ? (
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={repoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors"
                                        >
                                          <GithubIcon className="h-3 w-3" />
                                          <span className="truncate max-w-[140px]">
                                            {repoUrl.replace('https://github.com/', '')}
                                          </span>
                                          <ExternalLink className="h-2.5 w-2.5" />
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingGithubProject(proj)
                                            setGithubUrlInput(repoUrl)
                                          }}
                                          title="Update repository URL"
                                          aria-label={`Update repository URL for ${proj.title}`}
                                          className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                          <Edit3 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingGithubProject(proj)
                                          setGithubUrlInput('')
                                        }}
                                        className="inline-flex min-h-[44px] sm:min-h-[32px] items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                      >
                                        <GithubIcon className="h-3 w-3" />
                                        <span>Link GitHub Repo</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>

                    {/* Skill Mastery Breakdown */}
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-6 sm:p-7 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                          <Award className="h-4 w-4 text-cyan-400" />
                          Engineering Skill Mastery Breakdown
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Continuous Evaluation
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {skillsOverview.map((skill, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-2 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-white font-bold">
                                {skill.skill_name}
                              </span>
                              <span className="text-white font-bold">
                                {skill.mastery_percent}%
                              </span>
                            </div>
                            <MinimalProgressBar
                              percent={skill.mastery_percent}
                              height={3}
                              delay={0.05 * i}
                            />
                            <span className="text-[9px] font-mono text-neutral-400 block">
                              {skill.completed_milestones} milestones validated
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Achievements & Badges Earned */}
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#05070d]/85 backdrop-blur-2xl p-6 sm:p-7 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-400" />
                          Earned Developer Achievements
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          6 Badges Available
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Early Adopter
                            </span>
                            <Sparkles className="h-3.5 w-3.5 text-neutral-300" />
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            Joined Technea during autonomous developer release.
                          </p>
                          <span className="text-[9px] font-mono text-neutral-400 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Consistent Coder
                            </span>
                            <Flame className="h-3.5 w-3.5 text-amber-400" />
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            Maintained active study streak for consecutive days.
                          </p>
                          <span className="text-[9px] font-mono text-neutral-400 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Milestone Conqueror
                            </span>
                            <Target className="h-3.5 w-3.5 text-cyan-400" />
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            Completed verified hands-on engineering milestones.
                          </p>
                          <span className="text-[9px] font-mono text-neutral-400 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Roadmap Architect
                            </span>
                            <Layers className="h-3.5 w-3.5 text-neutral-300" />
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            Synthesized personalized career roadmap with AI.
                          </p>
                          <span className="text-[9px] font-mono text-neutral-400 block pt-1">
                            {savedRoadmaps.length > 0 ? '✓ Unlocked' : 'In Progress'}
                          </span>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Project Deliverable
                            </span>
                            <FolderGit2 className="h-3.5 w-3.5 text-sky-400" />
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            Started and shipped hands-on technical projects.
                          </p>
                          <span className="text-[9px] font-mono text-neutral-400 block pt-1">
                            {completedProjectsCount > 0 || activeProjectsCount > 0
                              ? '✓ Unlocked'
                              : 'Locked (Start a project)'}
                          </span>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Guild Contributor
                            </span>
                            <Users className="h-3.5 w-3.5 text-neutral-300" />
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            Joined peer learning community rooms on Technea.
                          </p>
                          <span className="text-[9px] font-mono text-neutral-400 block pt-1">
                            {joinedRoomsCount > 0 ? '✓ Unlocked' : 'Locked (Join a room)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* ══════════════ MODAL: LINK GITHUB REPOSITORY ══════════════ */}
          {editingGithubProject && (
            <div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Link GitHub Repository"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#05070d]/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_32px_96px_rgba(0,0,0,0.85)] space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <GithubIcon className="h-4 w-4 text-white" />
                    <h4 className="text-sm font-bold text-white">Link GitHub Repository</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingGithubProject(null)}
                    className="flex min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06] cursor-pointer transition-all duration-300"
                    aria-label="Close dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-neutral-400">
                    Project:{' '}
                    <span className="text-white font-semibold">
                      {editingGithubProject.title}
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Connect your repository to showcase your code deliverables on your developer portfolio.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-neutral-400 block">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={githubUrlInput}
                    onChange={(e) => setGithubUrlInput(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full min-h-[44px] rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:outline-none font-mono transition-all duration-300 shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setEditingGithubProject(null)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveGithubUrl(editingGithubProject.id, githubUrlInput)
                    }
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                  >
                    Save to Portfolio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ MODAL: SHARE DEVELOPER PORTFOLIO ══════════════ */}
          {isShareModalOpen && (
            <div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Share Developer Portfolio"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#05070d]/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_32px_96px_rgba(0,0,0,0.85)] space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-white" />
                    <h4 className="text-sm font-bold text-white">Share Developer Portfolio</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="flex min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06] cursor-pointer transition-all duration-300"
                    aria-label="Close share modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your verified engineering portfolio showcases your developer tier, completed milestones, and hands-on GitHub projects to engineering teams and recruiters.
                </p>

                {/* Live Portfolio Card Preview */}
                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user?.avatar_url && !shareAvatarError ? (
                        <img
                          src={getAvatarUrl(user.avatar_url)}
                          alt={fullName}
                          onError={() => setFailedShareAvatarUrl(user?.avatar_url)}
                          className="h-10 w-10 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold text-white font-mono shrink-0">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">{fullName}</span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono text-neutral-300">
                            {developerLevel}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400 truncate">
                          {xpPoints} XP • Verified Learner
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-300 border border-white/10 bg-white/[0.03] px-2.5 py-0.5 rounded-full">
                      Public Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center">
                    <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06]">
                      <span className="text-xs font-bold text-white font-mono block">
                        {completedMilestones}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">Milestones</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06]">
                      <span className="text-xs font-bold text-white font-mono block">
                        {completedProjectsCount}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">Projects</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06]">
                      <span className="text-xs font-bold text-white font-mono block">
                        {streakCount}d
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">Streak</span>
                    </div>
                  </div>
                </div>

                {/* Share Link Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 block">
                    Public Portfolio URL
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs font-mono text-neutral-300 truncate shadow-inner">
                      https://technea.dev/@{(firstName || 'developer').toLowerCase()}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleCopyProfileLink()
                        setCopiedLink(true)
                        setTimeout(() => setCopiedLink(false), 2000)
                      }}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shrink-0 shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                      aria-label={copiedLink ? "Public portfolio link copied" : "Copy public portfolio link"}
                    >
                      {copiedLink ? (
                        <>
                          <CheckCheck className="h-3.5 w-3.5 text-black" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] px-5 py-2 text-xs font-mono text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
