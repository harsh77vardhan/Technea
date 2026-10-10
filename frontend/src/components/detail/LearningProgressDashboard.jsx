import { motion } from 'framer-motion'
import {
  Flame,
  Award,
  Play,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'

export default function LearningProgressDashboard({
  completedCount = 0,
  totalSteps = 1,
  activeMilestoneTitle = 'Variables & Primitive Types',
  onContinueLearning,
  onResetProgress,
  theme,
}) {
  const percent = totalSteps > 0 ? Math.min(100, Math.round((completedCount / totalSteps) * 100)) : 0

  // SVG ring math
  const radius = 28
  const circ = 2 * Math.PI * radius
  const offset = circ - (percent / 100) * circ

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl shadow-xl overflow-hidden group">
      {/* Subtle Ambient Radial Lighting */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-15"
        style={{ backgroundColor: theme.accentHue }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* LEFT: Circular Progress Ring + Status Info */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="relative h-18 w-18 shrink-0 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke="currentColor"
                strokeWidth="5"
                className="text-white/10"
                fill="transparent"
              />
              <motion.circle
                cx="36"
                cy="36"
                r={radius}
                stroke="url(#deckGrad)"
                strokeWidth="5"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="deckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-white tracking-tight">{percent}%</span>
              <span className="text-[8px] font-mono uppercase text-neutral-400">Done</span>
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {percent === 100 ? 'Curriculum Complete' : 'Active Journey'}
              </span>
              <span className="font-mono text-xs text-neutral-400">
                {completedCount} of {totalSteps} milestones
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
              {percent === 100 ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> All Milestones Mastered!
                </span>
              ) : (
                <span>Next Up: {activeMilestoneTitle}</span>
              )}
            </h3>

            <p className="text-xs text-neutral-400 font-light truncate">
              {percent === 100
                ? 'Your credential is fully ready for verification.'
                : 'Complete interactive milestone exercises to build verifiable muscle memory.'}
            </p>
          </div>
        </div>

        {/* MIDDLE: Streak & Certificate Trackers */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
          {/* Daily Streak */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]">
              <Flame className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-white">
                <span>3-Day Streak</span>
                <span className="text-[10px] text-amber-400 font-mono">Active</span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400">
                15 mins daily habit goal
              </p>
            </div>
          </div>

          {/* Certificate Progress */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-[0_0_12px_-3px_rgba(56,189,248,0.3)]">
              <Award className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-white">
                <span>Skill Certificate</span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400">
                {completedCount}/{totalSteps} criteria unlocked
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Primary Action CTA & Reset option */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 lg:pt-0">
          {completedCount > 0 && (
            <button
              type="button"
              onClick={onResetProgress}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/[0.05]"
              title="Reset progress to 0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onContinueLearning}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
          >
            <Play className="h-3.5 w-3.5 fill-black" />
            <span>{percent === 0 ? 'Start First Lesson' : 'Continue Learning'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
