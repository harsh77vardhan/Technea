import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const SYNTHESIS_STEPS = [
  'Analyzing your background and goals...',
  'Mapping prerequisite skill dependencies...',
  'Sequencing learning milestones...',
  'Curating verified course references...',
  'Finalizing project blueprints...',
]

export default function RoadmapGenerationScreen({ goal = 'Full Stack Developer', onCompleteAnimation }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [progressPercent, setProgressPercent] = useState(20)

  useEffect(() => {
    const stepDuration = 650
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
        }, 500)
        return prev
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [onCompleteAnimation])

  return (
    <div data-lenis-prevent className="w-full py-12 sm:py-16 text-left">
      {/* Overline */}
      <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-4">Generating roadmap</p>

      {/* Goal */}
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-8 leading-tight">{goal}</h2>

      {/* Progress Track */}
      <div className="mb-8">
        <div className="h-px w-full bg-[#1a1a1a] relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-white"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs font-mono text-[#444] mt-2">{progressPercent}%</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {SYNTHESIS_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIdx
          const isCurrent = idx === currentStepIdx
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3"
            >
              <span
                className={`h-1 w-1 rounded-full flex-shrink-0 ${
                  isDone || isCurrent ? 'bg-white' : 'bg-[#333]'
                }`}
              />
              <span
                className={`text-xs font-mono ${
                  isDone ? 'text-[#888]' : isCurrent ? 'text-white' : 'text-[#333]'
                }`}
              >
                {step}
              </span>
              {isDone && <span className="text-[10px] font-mono text-[#444] ml-auto">done</span>}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
