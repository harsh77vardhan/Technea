import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Flame,
  Check,
  Code2,
  Trophy,
  Zap,
  Sparkles,
  Bot,
  Layers,
  Terminal,
  Play,
  Share2,
  Lock,
  ChevronRight,
  Target,
  BrainCircuit,
  Lightbulb,
  Bug,
  Calendar,
} from 'lucide-react'

/**
 * DashboardVisualOverview
 *
 * Beginner-friendly, highly visual learning cockpit answering instantly:
 * 1. "What am I learning?" -> Today's Mission & Active Roadmap
 * 2. "What should I do next?" -> Target Milestone with high-contrast Continue Learning CTA
 * 3. "How much progress have I made?" -> Big Progress visualization, Visual Node Journey, Stats widgets
 * 4. "How can AI help me?" -> Compact AI Mentor companion with quick action chips
 *
 * Deep black cinematic Technea theme with subtle soft ambient glows.
 */
function DashboardVisualOverview({
  user,
  currentPath,
  overallPercent = 65,
  streakCount = 7,
  xpPoints = 1240,
  onResumeMilestone = () => {},
  onLaunchWorkspace = () => {},
  onShare = () => {},
  onNavigateTab = () => {},
  onAskMentor = () => {},
}) {
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]

  // Dynamic greeting based on current local time
  const currentHour = new Date().getHours()
  let greetingTime = 'evening'
  if (currentHour >= 5 && currentHour < 12) {
    greetingTime = 'morning'
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingTime = 'afternoon'
  }

  // Active path and milestone details
  const activeRoadmapTitle = currentPath?.title || 'Python Fundamentals & Core Mastery'
  const activeMilestoneTitle =
    currentPath?.next_step_title || 'Building Asynchronous Daemons & CLI Watchers'
  const displayProgress = overallPercent > 0 ? overallPercent : 65
  const activeCategory = currentPath?.category || 'Programming'

  // Interactive node hover state for roadmap circuit
  const [hoveredNode, setHoveredNode] = useState(null)
  const [quickPromptText, setQuickPromptText] = useState('')

  // 6 Visual Milestone Nodes representing the journey
  const milestoneNodes = [
    {
      id: 1,
      title: 'Python Syntax & Logic',
      status: 'completed',
      type: 'Foundation',
      time: '3h done',
      icon: Check,
    },
    {
      id: 2,
      title: 'Data Structures & Collections',
      status: 'completed',
      type: 'Core',
      time: '4.5h done',
      icon: Check,
    },
    {
      id: 3,
      title: 'OOP & Functional Patterns',
      status: 'completed',
      type: 'Architecture',
      time: '5h done',
      icon: Check,
    },
    {
      id: 4,
      title: 'Async Daemons & CLI Watchers',
      status: 'active',
      type: 'Current Target',
      time: '45m remaining',
      icon: Target,
    },
    {
      id: 5,
      title: 'Automated Testing with Pytest',
      status: 'upcoming',
      type: 'Verification',
      time: '3.5h est.',
      icon: Lock,
    },
    {
      id: 6,
      title: 'Capstone CLI Deployment',
      status: 'upcoming',
      type: 'Production',
      time: '6h est.',
      icon: Trophy,
    },
  ]

  // Handlers for quick AI mentor action chips
  const handleQuickAction = (actionKey, defaultPrompt) => {
    onAskMentor(defaultPrompt, actionKey)
  }

  const handlePromptSubmit = (e) => {
    e.preventDefault()
    if (!quickPromptText.trim()) return
    onAskMentor(quickPromptText.trim())
    setQuickPromptText('')
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* ──────────────── TOP TELEMETRY BAR & GREETING ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              Personal Learning OS • Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Good {greetingTime}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Your daily target is ready. 1 milestone away from completing Stage 04.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Streak */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-mono font-medium text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{streakCount}-Day Streak</span>
          </div>

          {/* XP */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-mono font-medium text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
            <Zap className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
            <span>{xpPoints.toLocaleString()} XP</span>
          </div>

          {/* Share Progression */}
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.10] text-neutral-300 hover:text-white px-3.5 py-1.5 text-xs font-mono transition-all cursor-pointer shadow-xs active:scale-95"
            title="Share your learning progression"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ──────────────── 1. TODAY'S MISSION (PRIMARY FOCUS - BIGGEST VISUAL ELEMENT) ──────────────── */}
      <section aria-labelledby="todays-mission-title" className="relative group">
        {/* Subtle Ambient Background Lighting behind the Hero Mission Card */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 opacity-70 blur-xl group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative overflow-hidden rounded-3xl border border-white/[0.14] bg-[#0A0D14]/90 p-6 sm:p-8 lg:p-9 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.7)]">
          {/* Subtle Geometric Memphis corner marks from Hero theme */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Skill Icon + Mission Headline */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  <span>TODAY&apos;S MISSION • PRIMARY FOCUS</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">• {activeCategory}</span>
              </div>

              <div className="flex items-start gap-4">
                {/* Glowing Skill Icon */}
                <div className="relative shrink-0 mt-1">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center">
                    <div className="h-full w-full rounded-[14px] bg-[#0A0D14] flex items-center justify-center">
                      <Terminal className="h-7 w-7 text-indigo-400" />
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#0A0D14] flex items-center justify-center shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                    <Check className="h-3 w-3 text-white stroke-[3]" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2
                    id="todays-mission-title"
                    className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight"
                  >
                    {activeRoadmapTitle}
                  </h2>
                  <p className="text-sm sm:text-base font-medium text-indigo-300 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    Next Target: {activeMilestoneTitle}
                  </p>
                  <p className="text-xs text-neutral-400 hidden sm:block">
                    Build a file system daemon monitoring directory events, hashing files, and triggering automated background pipelines.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onResumeMilestone}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold px-6 py-3 text-sm shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onLaunchWorkspace}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold px-4 py-3 text-sm transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Launch Sandbox</span>
                </button>
              </div>
            </div>

            {/* Right: Big Progress Ring & Milestone Counter */}
            <div className="shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md min-w-[220px]">
              {/* Circular Progress Gauge */}
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-white/[0.08]"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-indigo-500"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * displayProgress) / 100 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {displayProgress}%
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    COMPLETE
                  </span>
                </div>
              </div>

              <div className="text-center mt-3 space-y-0.5">
                <span className="text-xs font-mono font-semibold text-neutral-300">
                  3 of 6 Milestones
                </span>
                <p className="text-[11px] font-mono text-neutral-500">Est. 45 min today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 2. LEARNING JOURNEY (INTERACTIVE VISUAL ROADMAP) ──────────────── */}
      <section aria-labelledby="learning-journey-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <h2
              id="learning-journey-title"
              className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase"
            >
              LEARNING JOURNEY • VISUAL CIRCUIT TRACK
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('roadmaps')}
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Explore 100+ Blueprints</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Visual Roadmap Circuit Track (replacing text tables with visual nodes) */}
        <div className="relative overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-6 backdrop-blur-xl shadow-lg">
          <div className="min-w-[680px] py-4 px-2">
            <div className="relative flex items-center justify-between">
              {/* Connecting Background Circuit Line */}
              <div className="absolute left-6 right-6 top-5 h-[3px] bg-white/[0.10] -z-0" />
              {/* Completed Glowing Circuit Progress */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '58%' }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                className="absolute left-6 top-5 h-[3px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] -z-0"
              />

              {/* 6 Connected Nodes */}
              {milestoneNodes.map((node) => {
                const isCompleted = node.status === 'completed'
                const isActive = node.status === 'active'
                const Icon = node.icon

                return (
                  <div
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => {
                      if (isActive || isCompleted) onResumeMilestone()
                    }}
                    className="relative z-10 flex flex-col items-center gap-2.5 cursor-pointer group/node"
                  >
                    {/* Node Visual Orb */}
                    <div className="relative flex items-center justify-center">
                      {isActive && (
                        <span className="absolute -inset-2.5 rounded-full bg-indigo-500/30 blur-md animate-ping" />
                      )}

                      <div
                        className={`h-11 w-11 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 shadow-md ${
                          isCompleted
                            ? 'bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] group-hover/node:scale-110'
                            : isActive
                            ? 'bg-indigo-900 border-2 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.8)] ring-4 ring-indigo-500/20 group-hover/node:scale-110'
                            : 'bg-[#12151E] border border-white/[0.14] text-neutral-500 group-hover/node:border-white/[0.30] group-hover/node:text-neutral-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Node Title & Status Badge */}
                    <div className="text-center max-w-[105px]">
                      <p
                        className={`text-xs font-semibold tracking-tight truncate ${
                          isActive ? 'text-white font-bold' : isCompleted ? 'text-neutral-200' : 'text-neutral-500'
                        }`}
                      >
                        {node.title}
                      </p>
                      <span
                        className={`text-[10px] font-mono block uppercase ${
                          isActive
                            ? 'text-indigo-400 font-bold'
                            : isCompleted
                            ? 'text-emerald-400'
                            : 'text-neutral-500'
                        }`}
                      >
                        {isActive ? 'CURRENT STEP' : isCompleted ? 'DONE' : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Hover Tooltip / Detail Preview Bar */}
            <AnimatePresence>
              {hoveredNode && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-4 p-3 rounded-xl border border-white/[0.10] bg-black/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">Node {hoveredNode.id}:</span>
                    <span className="text-white font-semibold">{hoveredNode.title}</span>
                    <span className="text-neutral-400">• {hoveredNode.type}</span>
                  </div>
                  <span className="text-neutral-400">{hoveredNode.time}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ──────────────── 3. AI MENTOR COMPANION (SMART COMPANION CARD) ──────────────── */}
      <section aria-labelledby="mentor-companion-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-400" />
            <h2
              id="mentor-companion-title"
              className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase"
            >
              AI MENTOR COMPANION • QUICK ACCELERATORS
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('mentor')}
            className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open Full Console</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0A0D14]/80 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Companion Identity & Status */}
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0A0D14] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Technea AI Engineering Companion</span>
                  <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono text-purple-300">
                    v2.0
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Synchronized with {activeRoadmapTitle}. Instant architectural support.
                </p>
              </div>
            </div>

            {/* Quick Actions (4 Requested Action Chips) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickAction('explain', 'Can you explain the core concepts in my active milestone in simple beginner terms?')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-200 hover:text-white px-3 py-2 text-xs font-mono transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                <span>Explain Concept</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction('debug', 'Can you help me debug a code issue or write unit tests with pytest?')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-200 hover:text-white px-3 py-2 text-xs font-mono transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Bug className="h-3.5 w-3.5 text-red-400" />
                <span>Debug Code</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction('plan', 'Plan my weekly learning schedule to finish Stage 04 efficiently.')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-200 hover:text-white px-3 py-2 text-xs font-mono transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                <span>Plan Week</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction('quiz', 'Generate a quick 3-question mastery quiz on my active milestone.')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white px-3 py-2 text-xs font-mono transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Zap className="h-3.5 w-3.5 text-purple-400" />
                <span>Take Quiz</span>
              </button>
            </div>
          </div>

          {/* Quick Input Bar */}
          <form onSubmit={handlePromptSubmit} className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
            <input
              type="text"
              value={quickPromptText}
              onChange={(e) => setQuickPromptText(e.target.value)}
              placeholder="Ask mentor anything about your milestone (e.g. 'How do daemons run concurrently?')..."
              className="flex-1 rounded-xl border border-white/[0.10] bg-black/40 px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors font-sans"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              <span>Ask Mentor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </section>

      {/* ──────────────── 4. PROJECTS (VISUAL PROJECT CARDS) ──────────────── */}
      <section aria-labelledby="projects-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-blue-400" />
            <h2
              id="projects-title"
              className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase"
            >
              PRODUCTION CAPSTONE PROJECTS
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All Projects</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project 1 */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-5 backdrop-blur-xl shadow-lg hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  80% BUILT • IN PROGRESS
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-mono text-emerald-300">
                  Intermediate
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Automated Multi-Source Data CLI
              </h3>
              <p className="text-xs text-neutral-400">
                Command-line tool that ingests, validates, and audits heterogeneous JSON records concurrently.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Python', 'Click', 'Pytest', 'Ruff'].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <div className="w-24 bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-4/5" />
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('projects')}
                className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <span>Build Project</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Project 2 */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-5 backdrop-blur-xl shadow-lg hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
                  35% BUILT • ACTIVE
                </span>
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-mono text-blue-300">
                  Advanced
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Real-Time Full-Stack Workspace
              </h3>
              <p className="text-xs text-neutral-400">
                Collaborative coding cockpit with WebSocket communication, syntax AST parsing, and state sync.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['React 19', 'FastAPI', 'Tailwind', 'Docker'].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <div className="w-24 bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-1/3" />
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('projects')}
                className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
              >
                <span>Build Project</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Project 3 */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-5 backdrop-blur-xl shadow-lg hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  UP NEXT • QUEUED
                </span>
                <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[9px] font-mono text-purple-300">
                  Capstone
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Cloud Container Orchestrator
              </h3>
              <p className="text-xs text-neutral-400">
                Automated multi-container deployment pipeline with health probes, zero-downtime rolling updates.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Kubernetes', 'Terraform', 'AWS', 'Linux'].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <div className="w-24 bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full w-0" />
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('projects')}
                className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white hover:text-purple-400 transition-colors cursor-pointer"
              >
                <span>Start Project</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 5. STATS (CONVERT TEXT INTO VISUAL WIDGETS) ──────────────── */}
      <section aria-labelledby="stats-title" className="space-y-3">
        <h2
          id="stats-title"
          className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase"
        >
          ENGINEERING TELEMETRY &amp; STATS
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Widget 1: Streak */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-4 sm:p-5 backdrop-blur-xl shadow-lg space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">Active Streak</span>
              <Flame className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {streakCount}
              </span>
              <span className="text-xs font-mono text-neutral-400">Days</span>
            </div>
            {/* 7-Day Visual Flame Track */}
            <div className="flex items-center justify-between pt-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <div key={day + idx} className="flex flex-col items-center gap-1">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      idx < 5 ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-white/[0.10]'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-neutral-500">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: XP Points */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-4 sm:p-5 backdrop-blur-xl shadow-lg space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">XP Earned</span>
              <Zap className="h-4 w-4 text-indigo-400 fill-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {xpPoints.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">+180 today</span>
            </div>
            {/* Level progress bar */}
            <div className="pt-1 space-y-1">
              <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full w-3/4 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>Level 4</span>
                <span>260 XP to Lv 5</span>
              </div>
            </div>
          </div>

          {/* Widget 3: Achievements */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-4 sm:p-5 backdrop-blur-xl shadow-lg space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">Achievements</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                8
              </span>
              <span className="text-xs font-mono text-neutral-400">Unlocked</span>
            </div>
            {/* Visual mini badge icons */}
            <div className="flex items-center gap-1.5 pt-1">
              {['🚀', '⚡', '🏆', '🎯'].map((badge, idx) => (
                <div
                  key={idx}
                  className="h-6 w-6 rounded-lg bg-white/[0.06] border border-white/[0.10] flex items-center justify-center text-xs"
                >
                  {badge}
                </div>
              ))}
              <span className="text-[10px] font-mono text-neutral-500">+4 more</span>
            </div>
          </div>

          {/* Widget 4: Velocity Progress */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-4 sm:p-5 backdrop-blur-xl shadow-lg space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">Weekly Progress</span>
              <BrainCircuit className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                12.4
              </span>
              <span className="text-xs font-mono text-neutral-400">Hours</span>
            </div>
            {/* Mini sparkline bar chart */}
            <div className="flex items-end gap-1.5 h-6 pt-1">
              {[40, 65, 30, 85, 95, 70, 50].map((h, idx) => (
                <div
                  key={idx}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-gradient-to-t from-emerald-500 to-indigo-500 rounded-t-sm shadow-[0_0_4px_rgba(52,211,153,0.5)]"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default memo(DashboardVisualOverview)
