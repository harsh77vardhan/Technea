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
} from 'lucide-react'
import LearningSnapshotCard from './LearningSnapshotCard'

function getConciseDescription(path) {
  const title = (path?.title || '').toLowerCase()
  if (title.includes('python')) {
    return 'Learn Python fundamentals, problem solving, and real-world programming.'
  }
  if (title.includes('react')) {
    return 'Build modern web applications with React components, hooks, and state.'
  }
  if (title.includes('machine learning') || title.includes('ai')) {
    return 'Master machine learning models, data pipelines, and predictive algorithms.'
  }
  if (title.includes('data')) {
    return 'Analyze, clean, and visualize datasets to derive actionable insights.'
  }
  if (title.includes('javascript') || title.includes('web')) {
    return 'Build responsive, full-stack web applications and modern APIs.'
  }
  if (title.includes('java')) {
    return 'Master object-oriented programming, modern Java APIs, and backend systems.'
  }
  if (title.includes('c++')) {
    return 'Understand low-level systems programming, memory architecture, and modern C++.'
  }
  if (title.includes('algorithm') || title.includes('data structure')) {
    return 'Master essential data structures and algorithms to solve complex problems.'
  }

  const raw = path?.description || ''
  if (raw) {
    const firstSentence = raw.split('.')[0]
    return firstSentence ? `${firstSentence.trim()}.` : raw
  }
  return 'Step-by-step curriculum designed for rapid, practical mastery.'
}

export default function PathDetailHero({
  path,
  theme,
  metrics,
  coursesCount = 0,
  projectsCount = 3,
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
  const description = getConciseDescription(path)
  const level = path?.level || 'Beginner'
  const duration = path?.duration || '4 Weeks'

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pb-14 border-b border-white/[0.06]">

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
            {/* Compact Metadata Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-mono text-neutral-300">
                <Terminal className="h-3 w-3 text-neutral-400" />
                <span>{theme.domain}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-mono text-neutral-300">
                <span>{level}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-mono text-neutral-300">
                <Clock className="h-3 w-3 text-neutral-400" />
                <span>{duration}</span>
              </span>
            </div>

            {/* Bold Headline & Concise Editorial Voice */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                {title}
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed max-w-xl line-clamp-2">
                {description}
              </p>
            </div>

            {/* Primary Action CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onStartLearning}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-black transition-all cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:bg-neutral-200"
              >
                <Play className="h-3.5 w-3.5 fill-black text-black" />
                <span>Start Learning</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-black group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              <button
                type="button"
                onClick={onExploreTimeline}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>View Roadmap</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Premium Learning Snapshot Card */}
          <div className="lg:col-span-5">
            <LearningSnapshotCard
              path={path}
              theme={theme}
              metrics={metrics}
              coursesCount={coursesCount}
              projectsCount={projectsCount}
              onContinueLearning={onStartLearning}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
