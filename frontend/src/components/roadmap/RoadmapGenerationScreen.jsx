import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Terminal, Cpu } from 'lucide-react'

const SYNTHESIS_STEPS = [
  {
    title: 'Analyzing role competencies & industry benchmarks',
    detail: 'Traversing ontology of production engineering skills',
    latency: '180ms',
  },
  {
    title: 'Constructing prerequisite dependency DAG & skill ontology',
    detail: 'Resolving topological order and prerequisite constraints',
    latency: '420ms',
  },
  {
    title: 'Indexing verified catalog courses & production labs',
    detail: 'Matching high-signal learning paths and video modules',
    latency: '310ms',
  },
  {
    title: 'Synthesizing progressive milestones & practical deliverables',
    detail: 'Structuring phased timeline from core concepts to systems',
    latency: '540ms',
  },
  {
    title: 'Compiling end-to-end capstone architecture blueprint',
    detail: 'Generating production project specifications and tech stack',
    latency: '390ms',
  },
  {
    title: 'Finalizing holographic learning matrix & timeline',
    detail: 'Assembling interactive tracking nodes and telemetry',
    latency: '260ms',
  },
]

export default function RoadmapGenerationScreen({
  goal = 'Full Stack Architect',
  onCompleteAnimation,
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [progressPercent, setProgressPercent] = useState(12)
  const [terminalLogs, setTerminalLogs] = useState([
    '[INIT] Initializing Technea Autonomous Neural Compiler...',
    `[TARGET] Setting optimization target: "${goal}"`,
    '[DAG] Loading global engineering skill graph (1,480 nodes)...',
  ])

  useEffect(() => {
    // Calibrated progression sequence (~3.6s total)
    const stepDuration = 600
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = prev + 1
        if (next < SYNTHESIS_STEPS.length) {
          setProgressPercent(Math.round(((next + 1) / SYNTHESIS_STEPS.length) * 100))
          setTerminalLogs((logs) => [
            ...logs.slice(-5),
            `[SOLVER] Resolved tier ${next}: ${SYNTHESIS_STEPS[next].title.slice(0, 42)}...`,
          ])
          return next
        }
        clearInterval(interval)
        setProgressPercent(100)
        setTerminalLogs((logs) => [
          ...logs.slice(-5),
          '[SUCCESS] Neural roadmap compilation converged successfully (100%).',
        ])
        setTimeout(() => {
          onCompleteAnimation?.()
        }, 500)
        return prev
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [goal, onCompleteAnimation])

  return (
    <div
      data-lenis-prevent
      className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-6 select-none"
    >
      {/* ── Status Header ── */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00A3FF]/30 bg-[#00A3FF]/[0.08] px-4 py-1 text-[11px] font-mono tracking-[0.25em] uppercase text-[#00A3FF]">
          <span className="flex h-2 w-2 rounded-full bg-[#00A3FF] animate-pulse" />
          <span>SYS.NEURAL_SYNTHESIS // COMPUTING OPTIMAL GRAPH</span>
        </div>

        <h2
          className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          COMPILING <span className="text-[#00A3FF]">ROADMAP</span>{' '}
          <span className="text-[#FF0055]">MATRIX</span>
        </h2>

        <div className="flex items-center justify-center gap-2 text-xs font-mono text-neutral-400">
          <span>Target Trajectory:</span>
          <span className="text-white font-bold px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 truncate max-w-xs sm:max-w-md">
            {goal}
          </span>
        </div>
      </div>

      {/* ── Precision Glowing Laser Progress Track ── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400 text-[11px] tracking-wider uppercase flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-[#00A3FF]" />
            <span>NEURAL GRAPH COMPILATION</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 font-mono uppercase">
              {progressPercent === 100 ? 'READY' : 'IN_PROGRESS'}
            </span>
            <span className="text-white font-bold font-mono text-sm">{progressPercent}%</span>
          </div>
        </div>

        <div className="relative h-2 w-full rounded-full bg-white/[0.08] overflow-hidden p-[1px]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#00A3FF] via-[#0084FF] to-[#FF0055]"
            style={{
              boxShadow:
                '0 0 16px rgba(0, 163, 255, 0.7), 0 0 24px rgba(255, 0, 85, 0.4)',
            }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── High-End Telemetry Terminal Console ── */}
      <div className="relative rounded-2xl border border-white/[0.1] bg-[#050609]/95 backdrop-blur-2xl overflow-hidden shadow-2xl">
        {/* Subtle Sweeping Scanning Beam */}
        <motion.div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00A3FF]/50 to-transparent pointer-events-none z-10"
          animate={{ y: [0, 240, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-black/50 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF0055]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <span className="text-neutral-400 text-[11px] pl-2">technea-compiler://neural-v3.4</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:flex">
            <span>MEM: 148MB</span>
            <span>•</span>
            <span className="text-[#00A3FF]">NODES: 86</span>
          </div>
        </div>

        {/* Synthesis Step Sequence */}
        <div className="p-4 sm:p-5 space-y-3">
          {SYNTHESIS_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx
            const isCurrent = idx === currentStepIdx

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-start justify-between gap-3 text-xs font-mono transition-colors rounded-xl p-2.5 border ${
                  isDone
                    ? 'border-white/[0.06] bg-white/[0.015] text-neutral-300'
                    : isCurrent
                    ? 'border-[#00A3FF]/40 bg-[#00A3FF]/[0.06] text-white shadow-[0_0_15px_rgba(0,163,255,0.1)]'
                    : 'border-transparent text-neutral-600'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-lg text-[10px] shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40'
                        : isCurrent
                        ? 'border border-[#FF0055] text-[#FF0055] bg-[#FF0055]/10 animate-pulse'
                        : 'border border-white/10 text-neutral-600'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3 w-3 text-[#00A3FF] stroke-[2.5]" />
                    ) : isCurrent ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#FF0055]" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-current" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="font-semibold truncate">{step.title}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 truncate hidden sm:block">
                      {step.detail}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isDone && (
                    <span className="text-[10px] font-mono text-[#00A3FF] px-2 py-0.5 rounded bg-[#00A3FF]/10 uppercase tracking-wider">
                      RESOLVED
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-[#FF0055] px-2 py-0.5 rounded bg-[#FF0055]/10 uppercase tracking-wider animate-pulse">
                      COMPUTING
                    </span>
                  )}
                  {!isDone && !isCurrent && (
                    <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                      QUEUED
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Micro Shell Log Stream */}
        <div className="px-4 py-3 bg-black/60 border-t border-white/[0.06] text-[11px] font-mono text-neutral-400 space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <Terminal className="h-3 w-3 text-[#00A3FF]" />
            <span className="text-[10px] uppercase tracking-wider">COMPILER LOG STREAM</span>
          </div>
          {terminalLogs.slice(-3).map((log, lIdx) => (
            <div key={lIdx} className="text-neutral-400 truncate font-mono text-[10px]">
              <span className="text-[#00A3FF] mr-1.5">›</span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
