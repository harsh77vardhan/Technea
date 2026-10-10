import { motion } from 'framer-motion'
import {
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Clock,
  Compass,
  Sparkles,
} from 'lucide-react'

export default function PathCommandCard({
  path,
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

  return (
    <aside className="lg:col-span-4 lg:sticky lg:top-20 self-start space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl space-y-5"
      >
        {/* Card Header & Title */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
              Track Progress
            </h2>
          </div>

          <span className="font-mono text-xs text-neutral-400">
            {progressPercent}%
          </span>
        </div>

        {/* Linear-style Progress Bar */}
        <div className="space-y-2">
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-emerald-400 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              {completedStepCount === totalSteps && totalSteps > 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All Milestones Mastered
                </span>
              ) : (
                <span>{completedStepCount} of {totalSteps} Milestones</span>
              )}
            </span>

            {completedStepCount > 0 && (
              <button
                type="button"
                onClick={onResetProgress}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimal Specs */}
        <div className="space-y-2 font-mono text-xs pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between py-1 text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-neutral-500" />
              <span>Estimated Time</span>
            </span>
            <span className="text-neutral-200">~{metrics?.estimatedHours || 18} hrs</span>
          </div>

          <div className="flex items-center justify-between py-1 text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Compass className="h-3 w-3 text-neutral-500" />
              <span>Level</span>
            </span>
            <span className="text-neutral-200">{path?.level || 'Beginner'}</span>
          </div>

          <div className="flex items-center justify-between py-1 text-neutral-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3 w-3 text-neutral-500" />
              <span>Courses</span>
            </span>
            <span className="text-neutral-200">
              {coursesCount > 0 ? `${coursesCount} Classes` : 'Curated'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-neutral-500" />
              <span>Capstones</span>
            </span>
            <span className="text-neutral-200">{projectsCount} Projects</span>
          </div>
        </div>

        {/* Primary Start CTA */}
        <div className="pt-2 border-t border-white/[0.06]">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={onStartLearning}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-black transition-all cursor-pointer shadow-sm hover:bg-neutral-200"
          >
            <Play className="h-3.5 w-3.5 fill-black text-black" />
            <span>{completedStepCount > 0 ? 'Continue Learning' : 'Start Track'}</span>
            <ArrowRight className="h-3.5 w-3.5 text-black" />
          </motion.button>
        </div>
      </motion.div>
    </aside>
  )
}
