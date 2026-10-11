import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, RotateCcw } from 'lucide-react'

export default function LearningSnapshotCard({
  path,
  metrics,
  completedStepCount: propCompletedStepCount,
  totalSteps: propTotalSteps,
  projectsCount = 3,
  onContinueLearning = () => {},
  onResetProgress,
}) {
  const pathTitle = path?.title || 'Python Fundamentals'
  const isPython = pathTitle.toLowerCase().includes('python') || !path?.title

  // Subtitle matching user specification
  const subtitle = isPython
    ? 'Your path from beginner to confident Python developer'
    : `Your path from beginner to confident ${pathTitle} developer`

  // Essential specs
  const level = path?.level || 'Beginner'
  const duration = path?.duration || '4 Weeks'

  const totalSteps =
    propTotalSteps > 0
      ? propTotalSteps
      : path?.roadmap_steps?.length > 0
      ? path.roadmap_steps.length
      : metrics?.stepsCount || 7

  const resolvedProjectsCount = projectsCount > 0 ? projectsCount : 3

  // Resolve completed count from prop or fallback to localStorage
  const completedCount = useMemo(() => {
    if (propCompletedStepCount !== undefined && propCompletedStepCount !== null) {
      return propCompletedStepCount
    }
    try {
      if (path?.id) {
        const saved = localStorage.getItem(`technea_completed_steps_${path.id}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          return Array.isArray(parsed) ? parsed.length : 0
        }
      }
    } catch {
      // ignore
    }
    return 0
  }, [propCompletedStepCount, path])

  const progressPercent =
    totalSteps > 0 ? Math.min(100, Math.round((completedCount / totalSteps) * 100)) : 0

  // "Next Step" determination (Variables & Data Types by default)
  const activeStepTitle = useMemo(() => {
    if (completedCount === 0 || !path?.roadmap_steps || path.roadmap_steps.length === 0) {
      return 'Variables & Data Types'
    }
    if (completedCount < path.roadmap_steps.length) {
      return path.roadmap_steps[completedCount]?.title || 'Variables & Data Types'
    }
    return 'All Milestones Mastered'
  }, [path, completedCount])

  const activeStepDescription = useMemo(() => {
    if (completedCount === 0 || !path?.roadmap_steps || path.roadmap_steps.length === 0) {
      return 'Build your first programming foundation.'
    }
    if (completedCount < path.roadmap_steps.length) {
      const step = path.roadmap_steps[completedCount]
      return step?.description || step?.topics || 'Build your first programming foundation.'
    }
    return 'Great work! You have finished all curriculum milestones.'
  }, [path, completedCount])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative rounded-none border border-white/[0.08] bg-[#13151e]/95 p-5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden group"
    >


      {/* Hairline top gradient border with faint Python blue/yellow accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/25 to-amber-300/20"
        aria-hidden="true"
      />

      <div className="relative space-y-4 sm:space-y-4.5">
        {/* ── 1. TOP HEADER & SUBTITLE ────────────────────────────────────────── */}
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
            {pathTitle}
          </h2>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* ── 2. IMPORTANT INFORMATION ONLY (Level, Duration, Milestones, Projects) ── */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06]">
          <div className="rounded-none border border-white/[0.05] bg-white/[0.02] p-2.5 transition-colors hover:border-white/10">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              Level
            </span>
            <span className="block text-xs sm:text-sm font-medium text-neutral-200 mt-0.5">
              {level}
            </span>
          </div>

          <div className="rounded-none border border-white/[0.05] bg-white/[0.02] p-2.5 transition-colors hover:border-white/10">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              Duration
            </span>
            <span className="block text-xs sm:text-sm font-medium text-neutral-200 mt-0.5">
              {duration}
            </span>
          </div>

          <div className="rounded-none border border-white/[0.05] bg-white/[0.02] p-2.5 transition-colors hover:border-white/10">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              Milestones
            </span>
            <span className="block text-xs sm:text-sm font-medium text-neutral-200 mt-0.5">
              {totalSteps}
            </span>
          </div>

          <div className="rounded-none border border-white/[0.05] bg-white/[0.02] p-2.5 transition-colors hover:border-white/10">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              Projects
            </span>
            <span className="block text-xs sm:text-sm font-medium text-neutral-200 mt-0.5">
              {resolvedProjectsCount}
            </span>
          </div>
        </div>

        {/* ── 3. BEAUTIFUL PROGRESS AREA ───────────────────────────────────────── */}
        <div className="space-y-2 pt-1 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              Progress
            </span>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-neutral-200">
                {progressPercent}%
              </span>

              {completedCount > 0 && onResetProgress && (
                <button
                  type="button"
                  onClick={onResetProgress}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 hover:text-neutral-300 transition-colors cursor-pointer"
                  title="Reset progress"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Elegant Linear Progress Bar */}
          <div className="relative h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-sky-300 to-amber-300 relative"
            />
          </div>
        </div>

        {/* ── 4. "NEXT STEP" SECTION ───────────────────────────────────────────── */}
        <div className="rounded-none border border-white/[0.07] bg-white/[0.02] p-3 space-y-1 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.035] group/step">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>{completedCount > 0 ? 'CURRENT MILESTONE' : 'START HERE'}</span>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-white tracking-tight">
            {activeStepTitle}
          </div>

          <p className="text-[11px] sm:text-xs text-neutral-400 font-light leading-relaxed">
            {activeStepDescription}
          </p>
        </div>

        {/* ── 5. MAIN CTA: CONTINUE LEARNING ──────────────────────────────────── */}
        <div className="pt-1">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={onContinueLearning}
            className="relative group w-full inline-flex items-center justify-center gap-2 rounded-none bg-white px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-black transition-all cursor-pointer shadow-sm hover:bg-neutral-100 overflow-hidden"
          >
            {/* Smooth hover shimmer light */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/[0.08] to-transparent" />

            <span>Continue Learning</span>
            <ArrowRight className="h-3.5 w-3.5 text-black/70 group-hover:text-black group-hover:translate-x-0.5 transition-transform duration-200" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
