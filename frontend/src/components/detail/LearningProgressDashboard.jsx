import { motion } from 'framer-motion'
import {
  Play,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'

export default function LearningProgressDashboard({
  completedCount = 0,
  totalSteps = 1,
  activeMilestoneTitle = 'Variables & Primitive Types',
  onContinueLearning,
  onResetProgress,
}) {
  const percent = totalSteps > 0 ? Math.min(100, Math.round((completedCount / totalSteps) * 100)) : 0

  const radius = 22
  const circ = 2 * Math.PI * radius
  const offset = circ - (percent / 100) * circ

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 54 54">
              <circle
                cx="27"
                cy="27"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/10"
                fill="transparent"
              />
              <motion.circle
                cx="27"
                cy="27"
                r={radius}
                stroke="url(#deckGrad)"
                strokeWidth="4"
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
            <span className="absolute text-[11px] font-bold text-white font-mono">{percent}%</span>
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                {percent === 100 ? 'Complete' : 'In Progress'}
              </span>
              <span className="font-mono text-xs text-neutral-400">
                • {completedCount}/{totalSteps} milestones
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight truncate">
              {percent === 100 ? 'All Milestones Mastered!' : `Next: ${activeMilestoneTitle}`}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {completedCount > 0 && (
            <button
              type="button"
              onClick={onResetProgress}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/[0.04]"
              title="Reset progress"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onContinueLearning}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
          >
            <Play className="h-3 w-3 fill-black" />
            <span>Continue</span>
            <ArrowRight className="h-3 w-3" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
