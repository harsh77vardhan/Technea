import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  Lock,
  ChevronDown,
  Clock,
  Zap,
  Terminal,
} from 'lucide-react'
import { getMilestoneMeta } from '../../utils/trackThemes'

function getShortDescription(text) {
  if (!text) return ''
  const first = text.split('.')[0]?.trim()
  return first ? `${first}.` : text
}

export default function InteractiveRoadmap({
  steps = [],
  completedStepIds = [],
  onToggleStep,
  theme,
  trackTitle = '',
}) {
  const [expandedStepId, setExpandedStepId] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'unlocked' | 'completed'

  const toggleExpand = useCallback((stepId) => {
    setExpandedStepId((prev) => (prev === stepId ? null : stepId))
  }, [])

  // Find index of the first incomplete milestone to determine the active one
  const firstIncompleteIndex = steps.findIndex((s) => !completedStepIds.includes(s.id || s.num))
  const activeMilestoneIndex = firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex

  return (
    <section id="roadmap-timeline" className="space-y-6">
      {/* ── HEADER & NAVIGATION CONTROLS ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: theme.accentHue }}
            />
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-semibold">
              Guided Mastery Journey
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-400 font-light">
            Interactive progression path. Complete milestones sequentially to level up your engineering skills.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1 self-start sm:self-auto backdrop-blur-md">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Journey ({steps.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Completed ({completedStepIds.length})
          </button>
        </div>
      </div>

      {/* ── GAME PROGRESSION TIMELINE ────────────────────────────────────── */}
      <div className="relative pl-6 sm:pl-10 space-y-6">
        {/* Continuous Connecting Energy Line */}
        <div className="absolute left-[15px] sm:left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

        {steps.map((step, idx) => {
          const stepKey = step.id || step.num
          const isCompleted = completedStepIds.includes(stepKey)
          const isCurrentActive = idx === activeMilestoneIndex && !isCompleted
          // Step is locked if not completed and not the current active milestone (game progression)
          const isLocked = idx > activeMilestoneIndex && !isCompleted

          if (filter === 'completed' && !isCompleted) return null
          if (filter === 'unlocked' && isCompleted) return null

          const isExpanded = expandedStepId === stepKey
          const meta = getMilestoneMeta(step, idx, steps.length, trackTitle)
          const shortDesc = getShortDescription(step.topics)

          return (
            <motion.div
              key={stepKey}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="relative group"
            >
              {/* ── INTERACTIVE NODE STATE ─────────────────────────────────── */}
              <button
                type="button"
                onClick={() => onToggleStep(stepKey)}
                aria-label={
                  isCompleted
                    ? 'Mark milestone incomplete'
                    : isLocked
                    ? 'Unlock and complete milestone'
                    : 'Mark milestone complete'
                }
                className={`absolute -left-[31px] sm:-left-[39px] top-4.5 flex h-7 w-7 items-center justify-center rounded-full border transition-all cursor-pointer z-10 ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-black shadow-[0_0_15px_#10b981]'
                    : isCurrentActive
                    ? 'border-sky-400 bg-[#08090d] text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] ring-2 ring-sky-400/30'
                    : 'border-white/15 bg-[#0a0c10] text-neutral-500 hover:border-white/40 hover:text-neutral-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : isCurrentActive ? (
                  <span className="font-mono text-[10px] font-bold text-sky-400">{step.num}</span>
                ) : isLocked ? (
                  <Lock className="h-3 w-3 text-neutral-500" />
                ) : (
                  <span className="font-mono text-[10px] font-medium">{step.num}</span>
                )}
              </button>

              {/* ── MILESTONE CARD BODY ────────────────────────────────────── */}
              <div
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                    : isCurrentActive
                    ? 'border-sky-400/30 bg-white/[0.03] shadow-[0_0_20px_-8px_rgba(56,189,248,0.15)]'
                    : isLocked
                    ? 'border-white/[0.06] bg-white/[0.01] opacity-75'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.03]'
                }`}
              >
                {/* Header Row - Minimal Clean Timeline Card */}
                <div
                  onClick={() => toggleExpand(stepKey)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-neutral-400">
                        {step.num}
                      </span>
                      <h3
                        className={`text-sm sm:text-base font-semibold tracking-tight transition-colors truncate ${
                          isCompleted
                            ? 'text-neutral-400 line-through decoration-emerald-500/50'
                            : isCurrentActive
                            ? 'text-white'
                            : 'text-neutral-200 group-hover:text-white'
                        }`}
                      >
                        {step.title}
                      </h3>
                      {isCompleted && (
                        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Done
                        </span>
                      )}
                      {isCurrentActive && (
                        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                          <Zap className="h-2.5 w-2.5" />
                          Current
                        </span>
                      )}
                    </div>

                    {/* One-line description */}
                    <p className="text-xs text-neutral-400 font-light truncate">
                      {shortDesc}
                    </p>
                  </div>

                  {/* Right Actions: Expand Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden md:inline font-mono text-[11px] text-neutral-500 group-hover:text-neutral-400 transition-colors">
                      {isExpanded ? 'Collapse' : 'Details'}
                    </span>
                    <div className="h-7 w-7 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* ── EXPANDABLE IN-DEPTH SYLLABUS ─────────────────────────── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-white/[0.06] bg-black/40 p-4 sm:p-5 space-y-4"
                    >
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-neutral-300 border border-white/10 bg-white/[0.04] px-2 py-0.5 rounded">
                          {meta.difficulty}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-neutral-400 border border-white/10 bg-white/[0.04] px-2 py-0.5 rounded">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{meta.hours}</span>
                        </span>
                      </div>

                      {/* Mini-Project Highlight */}
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 flex items-center gap-2.5 text-xs text-neutral-300">
                        <Terminal className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="font-mono text-[11px] text-amber-300/90 font-medium shrink-0">Mini-Project:</span>
                        <span className="font-light truncate text-neutral-200">{meta.miniProject}</span>
                      </div>

                      {/* Concepts Covered */}
                      {meta.concepts && (
                        <div className="space-y-1.5">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                            Concepts Covered:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {meta.concepts.map((concept) => (
                              <span
                                key={concept}
                                className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] text-neutral-300"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
                        <span className="text-[11px] font-mono text-neutral-500">
                          Estimated time: {meta.hours} • Hands-on lab
                        </span>

                        <button
                          type="button"
                          onClick={() => onToggleStep(stepKey)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            isCompleted
                              ? 'border border-white/10 bg-white/[0.05] text-neutral-300 hover:bg-white/10'
                              : 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_15px_-3px_#34d399]'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>{isCompleted ? 'Mark as Incomplete' : 'Complete Milestone'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
