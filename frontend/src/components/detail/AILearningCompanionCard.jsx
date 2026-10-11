import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function AILearningCompanionCard({
  userName = 'Harsh',
  pathTitle = 'Python Fundamentals',
  onAskMentor = () => {},
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative rounded-none border border-white/[0.08] bg-[#13151e]/95 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group transition-colors duration-300 hover:border-white/[0.14]"
    >
      {/* Hairline subtle top gradient border with faint AI emerald/cyan accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/25 to-cyan-400/20"
        aria-hidden="true"
      />

      <div className="relative space-y-4 sm:space-y-5">
        {/* ── 1. HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xs select-none">✦</span>
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
              AI Learning Companion
            </h2>
          </div>

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* ── 2. GREETING & CONTEXT ─────────────────────────────────────────── */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white">
            Welcome back, {userName}
          </h3>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            You&apos;re learning {pathTitle}
          </p>
        </div>

        {/* ── 3. SECTION: AI INSIGHT ────────────────────────────────────────── */}
        <div className="rounded-none border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1.5 transition-colors duration-200 hover:border-white/[0.12] hover:bg-white/[0.03]">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span>AI Insight</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-200 font-normal leading-relaxed">
            &ldquo;You&apos;re ready for Variables &amp; Data Types as your next step.&rdquo;
          </p>
        </div>

        {/* ── 4. SECTION: YOUR NEXT MOVE ────────────────────────────────────── */}
        <div className="rounded-none border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1.5 transition-colors duration-200 hover:border-white/[0.12] hover:bg-white/[0.03]">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-sky-400 font-medium">
            <span className="h-1 w-1 rounded-full bg-sky-400" />
            <span>Your Next Move</span>
          </div>
          <div className="text-xs sm:text-sm font-medium text-white flex items-center justify-between">
            <span>Continue Lesson 01</span>
            <ArrowRight className="h-3 w-3 text-neutral-400" />
          </div>
        </div>

        {/* ── 5. PRIMARY BUTTON: ASK AI MENTOR ──────────────────────────────── */}
        <div className="pt-1">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={onAskMentor}
            className="relative group w-full inline-flex items-center justify-center gap-2 rounded-none bg-white px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-black transition-all cursor-pointer shadow-sm hover:bg-neutral-100 overflow-hidden"
          >
            {/* Smooth hover shimmer light */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/[0.08] to-transparent" />

            <Sparkles className="h-3.5 w-3.5 text-black/70 group-hover:text-black transition-colors" />
            <span>Ask AI Mentor</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
