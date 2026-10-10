import { motion } from 'framer-motion'
import {
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  BookOpen,
  Layers,
  Clock,
  Compass,
} from 'lucide-react'

export default function PathCommandCard({
  path,
  theme,
  metrics,
  completedStepCount = 0,
  totalSteps = 1,
  projectsCount = 3,
  coursesCount = 0,
  onStartLearning,
  onResetProgress,
}) {
  const progressPercent =
    totalSteps > 0 ? Math.min(100, Math.round((completedStepCount / totalSteps) * 100)) : 0

  // SVG Circular Ring parameters
  const ringRadius = 38
  const circumference = 2 * Math.PI * ringRadius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <aside className="lg:col-span-4 lg:sticky lg:top-8 self-start space-y-4">
      {/* ── COMMAND HUB GLASS CARD ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-xl shadow-2xl overflow-hidden group"
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: theme.accentHue }}
        />

        <div className="relative z-10 space-y-6">
          {/* Card Header & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-semibold">
                Your Learning Hub
              </h2>
            </div>

            <span className="font-mono text-[11px] text-neutral-500">
              Interactive
            </span>
          </div>

          {/* ── CIRCULAR PROGRESS RING & SUMMARY ─────────────────────────── */}
          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 flex items-center gap-4">
            {/* Circular Progress Meter */}
            <div className="relative h-22 w-22 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-white/10"
                  fill="transparent"
                />
                {/* Foreground Animated Ring */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  stroke="url(#progressGradient)"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Centered Percentage Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-bold text-white tracking-tight">
                  {progressPercent}%
                </span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase">
                  Complete
                </span>
              </div>
            </div>

            {/* Progress Details */}
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-semibold text-white tracking-tight">
                {completedStepCount === totalSteps && totalSteps > 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Path Completed!
                  </span>
                ) : (
                  <span>
                    {completedStepCount} of {totalSteps} Steps Done
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                {completedStepCount === 0
                  ? 'Click roadmap milestones to track your progress.'
                  : 'Great momentum! Keep mastering modules to finish.'}
              </p>

              {completedStepCount > 0 && (
                <button
                  type="button"
                  onClick={onResetProgress}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors pt-1 cursor-pointer"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>Reset Progress</span>
                </button>
              )}
            </div>
          </div>

          {/* ── METRICS SPEC GRID ────────────────────────────────────────── */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>Estimated Hours:</span>
              </span>
              <span className="text-white font-medium">~{metrics.estimatedHours} hrs</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-neutral-500" />
                <span>Proficiency Level:</span>
              </span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <span className="flex items-center gap-0.5">
                  {metrics.levelDots.map((isFilled, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-2 rounded-xs ${
                        isFilled ? 'bg-emerald-400' : 'bg-neutral-700'
                      }`}
                    />
                  ))}
                </span>
                <span>{path?.level || 'Beginner'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-neutral-500" />
                <span>Roadmap Steps:</span>
              </span>
              <span className="text-white font-medium">{totalSteps} Milestones</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                <span>Capstone Projects:</span>
              </span>
              <span className="text-white font-medium">{projectsCount} Challenges</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-neutral-500" />
                <span>Curated Courses:</span>
              </span>
              <span className="text-white font-medium">
                {coursesCount > 0 ? `${coursesCount} Classes` : 'Curated'}
              </span>
            </div>
          </div>

          {/* ── PRIMARY START LEARNING BUTTON ────────────────────────────── */}
          <div className="space-y-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onStartLearning}
              className="w-full relative group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-black transition-all cursor-pointer shadow-[0_0_25px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_-5px_rgba(255,255,255,0.5)] overflow-hidden"
            >
              {/* Shimmer animation highlight on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/10 to-transparent" />

              <Play className="h-4 w-4 fill-black text-black group-hover:scale-110 transition-transform" />
              <span>Start Learning Track</span>
              <ArrowRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <p className="text-center text-[10px] font-mono text-neutral-500">
              Free YouTube curriculum • Verified embed player
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── REWARD BADGE CARD ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-center gap-3 backdrop-blur-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-xs font-semibold text-white truncate">
            {theme.rewardTitle}
          </h3>
          <p className="text-[11px] font-mono text-neutral-400">
            Earn {theme.xpReward} upon completing all milestones
          </p>
        </div>
      </div>
    </aside>
  )
}
