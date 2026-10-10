import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Share2,
  Check,
  Clock,
  Compass,
  Terminal,
  Layers,
  Sparkles,
} from 'lucide-react'
import InteractiveCodeShowcase from './InteractiveCodeShowcase'

export default function PathDetailHero({
  path,
  theme,
  metrics,
  onBack,
  onStartLearning,
  onExploreTimeline,
}) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }, [])

  const title = path?.title || 'Python Fundamentals'
  const description =
    path?.description ||
    'Master core language mechanics, data structures, and idiomatic architecture through a guided, milestone-driven curriculum.'
  const level = path?.level || 'Beginner'
  const duration = path?.duration || '4 Weeks'

  return (
    <section className="relative overflow-hidden pt-7 pb-12 sm:pb-16 border-b border-white/[0.08]">
      {/* ── VERY SUBTLE DOMAIN-SPECIFIC CODE PARTICLES BACKGROUND ──────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        {/* Subtle Terminal Glow at Top */}
        <div
          className="absolute -top-32 left-1/3 h-80 w-[42rem] rounded-full blur-[140px] opacity-15"
          style={{ backgroundColor: theme.accentHue }}
        />

        {/* Drifting Syntax Fragments */}
        {theme.particles && (
          <div className="absolute inset-0">
            {theme.particles.map((frag, idx) => {
              const xPos = [15, 78, 30, 85, 45, 65, 20, 92][idx % 8]
              const yPos = [20, 35, 70, 80, 45, 15, 88, 60][idx % 8]

              return (
                <motion.span
                  key={frag}
                  initial={{ opacity: 0.05 }}
                  animate={{
                    opacity: [0.03, 0.09, 0.03],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 8 + (idx % 4) * 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: idx * 0.7,
                  }}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                  className="absolute font-mono text-[11px] sm:text-xs text-neutral-400 select-none pointer-events-none"
                >
                  {frag}
                </motion.span>
              )
            })}
          </div>
        )}

        {/* Micro Linear Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        {/* ── TOP BREADCRUMB & UTILITY ROW ─────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer backdrop-blur-md"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-neutral-400" />
              <span>All Learning Paths</span>
            </motion.button>

            <span className="text-neutral-600 hidden sm:inline">/</span>

            <span className="text-xs font-mono text-neutral-400 hidden sm:inline truncate max-w-xs">
              {title}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer backdrop-blur-md"
            title="Share learning track"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-neutral-400" />
                <span className="text-[11px]">Share Track</span>
              </>
            )}
          </motion.button>
        </div>

        {/* ── HERO GRID: EDITORIAL COPY (LEFT) + CODE/TERMINAL EMBLEM (RIGHT) ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT: Typography & Clear Intent */}
          <div className="lg:col-span-7 space-y-6">
            {/* Metadata Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md border ${theme.pillBg}`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>{theme.domain}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-mono text-neutral-300">
                <span className="flex items-center gap-1">
                  {metrics.levelDots.map((isFilled, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        isFilled ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-neutral-600'
                      }`}
                    />
                  ))}
                </span>
                <span>{level}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-mono text-neutral-300">
                <Clock className="h-3 w-3 text-neutral-400" />
                <span>{duration}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-mono text-neutral-400">
                <span>~{metrics.estimatedHours} Hours</span>
              </span>
            </div>

            {/* Bold Headline & Editorial Voice */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.06]">
                {title}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-neutral-300 font-light leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onStartLearning}
                className="group relative inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-xs sm:text-sm font-semibold text-black transition-all cursor-pointer shadow-[0_0_30px_-5px_rgba(255,255,255,0.35)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.55)]"
              >
                <Play className="h-4 w-4 fill-black text-black group-hover:scale-110 transition-transform" />
                <span>Start Learning Track</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onExploreTimeline}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-xs sm:text-sm font-medium text-white hover:bg-white/[0.08] hover:border-white/25 transition-all cursor-pointer backdrop-blur-md"
              >
                <Compass className="h-4 w-4 text-neutral-400" />
                <span>Explore Curriculum</span>
              </motion.button>
            </div>

            {/* In-line Track Stats */}
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-neutral-500" />
                <strong className="text-neutral-200 font-medium">{metrics.stepsCount}</strong> Milestones
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                <strong className="text-neutral-200 font-medium">3</strong> Capstones
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Free Embedded Curriculum</span>
            </div>
          </div>

          {/* RIGHT: Authentic Skill-Aware Interactive Code Showcase */}
          <div className="lg:col-span-5">
            <InteractiveCodeShowcase theme={theme} />
          </div>
        </div>
      </div>
    </section>
  )
}
