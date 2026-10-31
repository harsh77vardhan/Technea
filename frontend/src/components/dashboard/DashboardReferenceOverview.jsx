import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Flame,
  Share2,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  FolderGit2,
  Lock,
  Compass,
  CheckCircle2,
} from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'

function DashboardReferenceOverview({
  onContinueLesson = () => {},
  onExploreCatalog = () => {},
  onNavigateTab = () => {},
  onShare = () => {},
}) {
  const {
    user,
    activeRoadmap,
    allRoadmaps,
    switchActiveRoadmap,
    todayMission,
    dailyActivity,
    toggleDailyTask,
    recommendedProjects,
  } = useDashboard()

  const [isRoadmapSelectorOpen, setIsRoadmapSelectorOpen] = useState(false)

  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Engineer'
  const firstName = fullName.split(' ')[0]

  // Time-aware greeting
  const currentHour = new Date().getHours()
  let greetingTime = 'evening'
  if (currentHour >= 5 && currentHour < 12) {
    greetingTime = 'morning'
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingTime = 'afternoon'
  }

  const streakCount = dailyActivity?.streak_count || 1
  const displayProgress = todayMission?.progress_percent || activeRoadmap?.progress_percent || 0

  // Interactive Learning Journey milestones
  const journeyMilestones = activeRoadmap?.milestones || [
    { id: 'm-1', title: 'HTML Foundations', completed: true },
    { id: 'm-2', title: 'Modern CSS Systems', completed: true },
    { id: 'm-3', title: 'Core JavaScript & DOM', completed: true },
    { id: 'm-4', title: 'Flexbox & Responsive UI', current: true },
    { id: 'm-5', title: 'Next.js & Full-Stack Architecture', locked: true },
  ]

  // Daily workspace plan
  const defaultDailyTasks = [
    { id: 'lesson', label: `Complete ${todayMission?.lesson_title || 'daily lesson'}`, xp: 20 },
    { id: 'practice', label: 'Practice interactive coding challenge', xp: 25 },
    { id: 'quiz', label: 'Complete 5-question knowledge quiz', xp: 15 },
    { id: 'project', label: 'Build or review milestone mini project', xp: 40 },
  ]

  const completedDailyTasks = new Set(dailyActivity?.completed_tasks || [])

  // Featured Project tied to roadmap
  const featuredProject =
    recommendedProjects?.[0] || {
      id: 1,
      title: `${activeRoadmap?.title || 'Modern Web'} Capstone Application`,
      description: 'End-to-end production application implementing your active milestone patterns.',
      difficulty: 'Intermediate',
      technologies: ['React', 'TypeScript', 'Tailwind', 'AI API'],
      status: 'unlocked',
    }

  return (
    <div className="space-y-6 sm:space-y-8 pb-4 select-none text-[#f8fafc]">
      {/* ──────────────── 1. ACTIVE ROADMAP COMMAND HEADER ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400 font-semibold">
              AI Learning Operating System
            </span>
            <span className="h-1 w-1 rounded-full bg-violet-400" />
            <span className="text-[11px] font-mono text-neutral-400">
              Good {greetingTime}, {firstName}
            </span>
          </div>

          {/* Active Roadmap Selector Pill */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsRoadmapSelectorOpen((prev) => !prev)}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-violet-500/40 text-left transition-all duration-200 cursor-pointer backdrop-blur-xl group shadow-lg"
              title="Click to switch active roadmap"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Current Focus
                </span>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{activeRoadmap?.title || 'React & AI Engineering'}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                      isRoadmapSelectorOpen ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </div>
            </button>

            {/* Dropdown Menu for Switching Roadmaps */}
            <AnimatePresence>
              {isRoadmapSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-50 w-80 rounded-2xl bg-[#0c1017]/98 border border-white/15 p-2 shadow-2xl backdrop-blur-2xl text-xs space-y-1"
                >
                  <div className="px-3 py-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider border-b border-white/10 flex items-center justify-between">
                    <span>Your Learning Roadmaps</span>
                    <span>{allRoadmaps?.length || 1} Total</span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 pt-1">
                    {allRoadmaps && allRoadmaps.length > 0 ? (
                      allRoadmaps.map((rm) => {
                        const isCurrent = rm.id === activeRoadmap?.id
                        return (
                          <button
                            key={rm.id}
                            type="button"
                            onClick={() => {
                              switchActiveRoadmap(rm)
                              setIsRoadmapSelectorOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                              isCurrent
                                ? 'bg-violet-600/30 border border-violet-500/40 text-white font-medium'
                                : 'hover:bg-white/5 text-neutral-300 hover:text-white'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="font-semibold truncate">{rm.title}</div>
                              <div className="text-[10px] text-neutral-400 font-mono">
                                {rm.target_role || 'Engineering Track'} • {rm.progress_percent || 0}%
                              </div>
                            </div>
                            {isCurrent && <Check className="h-4 w-4 text-violet-400 shrink-0" />}
                          </button>
                        )
                      })
                    ) : (
                      <div className="p-3 text-neutral-400 text-center font-mono text-[11px]">
                        No other roadmaps yet.
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoadmapSelectorOpen(false)
                        onExploreCatalog()
                      }}
                      className="text-[11px] font-mono text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                    >
                      + Explore 100+ Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoadmapSelectorOpen(false)
                        onNavigateTab('roadmaps')
                      }}
                      className="text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Manage All →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Top Right Quick Stats */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-mono text-neutral-200 backdrop-blur-md shadow-xs">
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>{streakCount}-day streak</span>
          </div>

          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 px-3.5 py-1.5 text-xs font-mono text-neutral-200 transition-all cursor-pointer backdrop-blur-md shadow-xs active:scale-95"
            title="Share learning progress"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ──────────────── 2. SECTION 1: TODAY'S LEARNING MISSION ──────────────── */}
      <section aria-labelledby="section-mission-title" className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400 font-semibold px-0.5">
          <span id="section-mission-title" className="uppercase flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            TODAY&apos;S LEARNING MISSION
          </span>
          <span className="text-violet-400 font-medium">
            Active Skill: {todayMission.skill_name}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 group">
          {/* Subtle radial ambient glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />

          {/* Sequence & Progress Header */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
            <span className="font-semibold text-violet-300">{todayMission.sequence_label}</span>
            <span className="text-emerald-400 font-bold tracking-wider">
              {displayProgress}% complete
            </span>
          </div>

          {/* Lesson Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-3 group-hover:text-violet-200 transition-colors">
            {todayMission.lesson_title}
          </h2>

          {/* Effort & Reward Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 mb-6">
            <span className="inline-flex items-center gap-1.5">
              <span>⏱</span>
              <span>{todayMission.estimated_time}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-violet-300">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>+{todayMission.reward_xp} XP Reward</span>
            </span>
          </div>

          {/* Hairline Animated Progress Bar */}
          <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(8, displayProgress)}%` }}
            />
          </div>

          {/* Actions: Continue Learning opens exact lesson, Explore opens catalog */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onContinueLesson(todayMission)}
              className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-neutral-100 text-black font-semibold px-5 py-3 text-xs sm:text-sm font-sans tracking-tight transition-all duration-150 cursor-pointer shadow-lg hover:shadow-xl active:scale-95 group/btn"
            >
              <span>Continue Learning</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium px-4 py-3 text-xs sm:text-sm font-sans transition-all duration-150 cursor-pointer active:scale-95"
            >
              <Compass className="h-4 w-4 text-neutral-400" />
              <span>Explore Catalog</span>
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────── 3. SECTION 2: INTERACTIVE LEARNING JOURNEY ──────────────── */}
      <section aria-labelledby="section-journey-title" className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400 font-semibold px-0.5">
          <span id="section-journey-title" className="uppercase flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            INTERACTIVE LEARNING JOURNEY
          </span>
          <span className="text-neutral-400 font-normal">Click milestone to inspect</span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 backdrop-blur-xl">
          {/* Visual Step-by-Step Circuit (HTML ✓ -> CSS ✓ -> Flexbox ● -> React ○) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
            {journeyMilestones.map((ms, idx) => {
              const isCompleted = ms.completed
              const isCurrent = ms.current
              const isLocked = ms.locked

              return (
                <div
                  key={ms.id || idx}
                  onClick={() => {
                    if (!isLocked) onContinueLesson(ms)
                  }}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                    isCurrent
                      ? 'border-violet-500/80 bg-violet-950/20 shadow-[0_0_25px_rgba(124,58,237,0.25)] scale-[1.02]'
                      : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/10 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-neutral-400">
                      Step {String(idx + 1).padStart(2, '0')}
                    </span>
                    {isCompleted ? (
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : isCurrent ? (
                      <div className="h-5 w-5 rounded-full bg-violet-500/30 border border-violet-500 flex items-center justify-center text-violet-300 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-violet-400" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                        <Lock className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3
                      className={`text-xs font-semibold font-mono tracking-tight line-clamp-2 ${
                        isCurrent
                          ? 'text-white font-bold'
                          : isCompleted
                          ? 'text-neutral-200'
                          : 'text-neutral-400'
                      }`}
                    >
                      {ms.title}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={
                        isCurrent
                          ? 'text-violet-300 font-bold'
                          : isCompleted
                          ? 'text-emerald-400'
                          : 'text-neutral-500'
                      }
                    >
                      {isCompleted ? 'Completed ✓' : isCurrent ? 'Active Focus ●' : 'Upcoming ○'}
                    </span>
                    {!isLocked && (
                      <ArrowRight className="h-3 w-3 text-neutral-500 group-hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── 4. SECTION 3: DAILY PLAN & CONNECTED PROJECTS ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Plan Workspace (7 Cols) */}
        <section aria-labelledby="section-daily-title" className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400 font-semibold px-0.5">
            <span id="section-daily-title" className="uppercase flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              TODAY&apos;S PLAN &amp; WORKSPACE
            </span>
            <span className="text-neutral-400 font-normal">
              {completedDailyTasks.size} of {defaultDailyTasks.length} done
            </span>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl space-y-3">
            {defaultDailyTasks.map((task) => {
              const isChecked = completedDailyTasks.has(task.id)
              return (
                <div
                  key={task.id}
                  onClick={() => toggleDailyTask(task.id, !isChecked)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-950/15 border-emerald-500/30 text-neutral-300'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-white/20 hover:border-violet-400 text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span
                      className={`text-xs font-mono tracking-tight ${
                        isChecked ? 'line-through text-neutral-500' : 'text-neutral-200'
                      }`}
                    >
                      {task.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-violet-400 shrink-0">
                    +{task.xp} XP
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Connected Projects (5 Cols) */}
        <section aria-labelledby="section-projects-title" className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400 font-semibold px-0.5">
            <span id="section-projects-title" className="uppercase flex items-center gap-1.5">
              <FolderGit2 className="h-3.5 w-3.5 text-blue-400" />
              CONNECTED PROJECT
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="text-violet-400 hover:text-violet-300 font-mono text-[10px] cursor-pointer"
            >
              View All →
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between h-[calc(100%-2rem)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Milestone Deliverable
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {featuredProject.difficulty || 'Intermediate'}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {featuredProject.title}
              </h3>
              <p className="text-xs text-neutral-400 font-sans line-clamp-3 mb-4 leading-relaxed">
                {featuredProject.description}
              </p>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(featuredProject.technologies || ['React', 'CSS3', 'Flexbox']).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-mono text-xs py-2.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Build Project</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default memo(DashboardReferenceOverview)
