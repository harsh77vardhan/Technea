import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const SYNTHESIS_STEPS = [
  'Analyzing engineering profile...',
  'Mapping prerequisite skills...',
  'Calculating optimal progression...',
  'Synthesizing personalized curriculum...',
  'Preparing learning milestones...',
]

export default function RoadmapGenerationScreen({ goal, onCompleteAnimation }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [progressPercent, setProgressPercent] = useState(14)

  useEffect(() => {
    // Calibrated synthesis sequence (~3.8s total)
    const stepDuration = 720
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = prev + 1
        if (next < SYNTHESIS_STEPS.length) {
          setProgressPercent(Math.round(((next + 1) / SYNTHESIS_STEPS.length) * 100))
          return next
        }
        clearInterval(interval)
        setProgressPercent(100)
        setTimeout(() => {
          onCompleteAnimation?.()
        }, 450)
        return prev
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [onCompleteAnimation])

  return (
    <div className="w-full max-w-lg mx-auto py-8 sm:py-12 space-y-7 select-none">
      {/* ── Status Header ── */}
      <div className="space-y-1.5 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1 text-[10px] font-mono tracking-[0.24em] uppercase text-neutral-400">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#0084FF] animate-pulse" />
          <span>AUTONOMOUS ENGINE ACTIVE</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Synthesizing Roadmap
        </h3>
        <p className="text-xs font-mono text-[#0084FF] truncate">
          Target: {goal}
        </p>
      </div>

      {/* ── Precision Laser Progress Track ── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400 text-[11px] tracking-wider uppercase">CALIBRATING CURRICULUM</span>
          <span className="text-white font-bold">{progressPercent}%</span>
        </div>
        <div className="relative h-[3px] w-full rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#0084FF] to-[#FF0055]"
            style={{
              boxShadow: '0 0 10px rgba(0, 132, 255, 0.5), 0 0 16px rgba(255, 0, 85, 0.3)',
            }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Progression Sequence Checklist ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#070709]/80 backdrop-blur-xl p-5 space-y-3 shadow-xl">
        {SYNTHESIS_STEPS.map((stepText, idx) => {
          const isDone = idx < currentStepIdx
          const isCurrent = idx === currentStepIdx

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center justify-between text-xs font-mono transition-colors ${
                isDone
                  ? 'text-neutral-300'
                  : isCurrent
                  ? 'text-white font-semibold'
                  : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    isDone
                      ? 'bg-[#0084FF]/20 text-[#0084FF] border border-[#0084FF]/40'
                      : isCurrent
                      ? 'border border-[#FF0055] text-[#FF0055] animate-pulse'
                      : 'border border-white/10 text-neutral-600'
                  }`}
                >
                  {isDone ? (
                    <Check className="h-2.5 w-2.5 text-[#0084FF] stroke-[2.5]" />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-current" />
                  )}
                </span>
                <span className="tracking-wide">{stepText}</span>
              </div>

              {isDone && (
                <span className="text-[10px] text-[#0084FF] tracking-widest uppercase">
                  READY
                </span>
              )}
              {isCurrent && (
                <span className="text-[10px] text-[#FF0055] tracking-widest uppercase animate-pulse">
                  COMPUTING
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
