import { useState, useEffect, useRef } from 'react'
import { BookOpen, CheckSquare, TrendingUp, Calendar } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Your Learning Companion
// Minimal, premium product showcase. Inspired by Linear and Apple.
// Single large rectangular container with a clean 2x2 grid of four feature cards.
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Continue Learning',
    description: 'Pick up right where you left off in your Python roadmap with your next lesson and chapter ready.',
  },
  {
    icon: CheckSquare,
    title: "Today's Mission",
    description: 'A focused daily checklist to complete lessons, practice concepts, and build mini projects consistently.',
  },
  {
    icon: TrendingUp,
    title: 'Learning Progress',
    description: 'Clear visibility into your growing skill capability across Python, React, and Git fundamentals.',
  },
  {
    icon: Calendar,
    title: 'Weekly Reflection',
    description: 'Review your completed lessons and ongoing projects each week to sustain steady momentum.',
  },
]

export default function LearningCompanion() {
  const containerRef = useRef(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0, t: 0 })

  // ── Physics-damped Mouse Parallax & Gentle Continuous Float ───────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    const startTime = performance.now()

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      targetX = x
      targetY = y
    }

    const handleMouseLeave = () => {
      targetX = 0
      targetY = 0
    }

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) * 0.001
      currentX += (targetX - currentX) * 0.035
      currentY += (targetY - currentY) * 0.035
      setParallax({ x: currentX, y: currentY, t: elapsed })
      rafId = requestAnimationFrame(animate)
    }

    container.addEventListener('mousemove', handleMouseMove, { passive: true })
    container.addEventListener('mouseleave', handleMouseLeave)
    rafId = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Subtle 3D tilt and floating transformation
  const dynamicRx = -parallax.y * 2.2
  const dynamicRy = parallax.x * 2.6
  const floatY = Math.sin(parallax.t * 0.4) * 3.5

  // Subtle floating and drifting for the organic wavy ribbon
  const ribbonX = Math.sin(parallax.t * 0.18) * 26 + parallax.x * 12
  const ribbonY = Math.cos(parallax.t * 0.14) * 16 + parallax.y * 8

  return (
    <section
      id="learning-companion"
      ref={containerRef}
      className="relative overflow-hidden bg-[#050505] text-white py-24 sm:py-32 border-t border-b border-neutral-900 select-none"
    >
      {/* ── Creative Agency Dynamic Flowing Ribbon (Rich Purple · Azure Blue · Magenta Pink) ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="absolute -top-[14%] sm:-top-[8%] -left-[22%] w-[148%] will-change-transform opacity-75 sm:opacity-85"
          style={{
            transform: `rotate(-17deg) translate3d(${ribbonX.toFixed(1)}px, ${ribbonY.toFixed(1)}px, 0px)`,
          }}
        >
          <svg
            viewBox="0 0 1600 700"
            className="w-full h-[480px] sm:h-[600px] pointer-events-none select-none"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Rich Multi-Stop Vibrant Gradient */}
              <linearGradient id="rich-ribbon-grad" x1="0%" y1="20%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.9" />
                <stop offset="18%" stopColor="#6d28d9" stopOpacity="0.95" />
                <stop offset="36%" stopColor="#7c3aed" stopOpacity="0.95" />
                <stop offset="52%" stopColor="#2563eb" stopOpacity="0.95" />
                <stop offset="68%" stopColor="#0284c7" stopOpacity="0.9" />
                <stop offset="84%" stopColor="#db2777" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#be185d" stopOpacity="0.9" />
              </linearGradient>

              {/* Deep Underfold Shadow Gradient for 3D Separation */}
              <linearGradient id="ribbon-depth-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e1065" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#1e3a8a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#831843" stopOpacity="0.7" />
              </linearGradient>

              {/* Razor-sharp Specular Crest Highlight Gradient */}
              <linearGradient id="ribbon-specular-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="25%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="55%" stopColor="#93c5fd" stopOpacity="0.75" />
                <stop offset="80%" stopColor="#f472b6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* Controlled Soft Blur Filter for Smooth Edges */}
              <filter id="ribbon-edge-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
              <filter id="ribbon-deep-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>

            {/* 1. Underlying Deep Ambient Shadow / Fold */}
            <path
              d="M -140,430
                 C 160,200 410,510 730,290
                 C 990,120 1280,410 1740,160
                 L 1720,290
                 C 1270,520 1000,230 720,430
                 C 410,610 140,310 -140,560
                 Z"
              fill="url(#ribbon-depth-grad)"
              filter="url(#ribbon-deep-shadow)"
              opacity="0.85"
            />

            {/* 2. Bold Dynamic Flowing Ribbon with Sharper Asymmetric Curves & Beveled Cuts */}
            <path
              d="M -120,370
                 C 140,140 370,470 710,230
                 C 970,70 1260,370 1730,120
                 L 1750,230
                 C 1280,470 1010,180 690,370
                 C 370,550 120,250 -120,490
                 Z"
              fill="url(#rich-ribbon-grad)"
              filter="url(#ribbon-edge-blur)"
            />

            {/* 3. Luminous Sharp Specular Edge / Crest Curve */}
            <path
              d="M -100,375
                 C 150,148 375,472 710,236
                 C 975,76 1260,372 1720,126"
              stroke="url(#ribbon-specular-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#ribbon-edge-blur)"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>

      {/* ── Soft Ambient Studio Lighting & Depth Shadows ─────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 12%, rgba(255, 255, 255, 0.035) 0%, transparent 75%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 10% 90%, rgba(0, 0, 0, 0.8) 0%, transparent 45%), radial-gradient(circle at 90% 90%, rgba(0, 0, 0, 0.8) 0%, transparent 45%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ── Left Column: Editorial Text & Simple Learning Journey Preview ── */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Your Learning Companion
            </h2>

            <p className="mt-5 text-base sm:text-lg text-neutral-400 leading-relaxed max-w-md">
              Stay consistent, track your progress, and always know what to learn next.
            </p>

            {/* Simple Learning Journey Preview */}
            <div className="mt-10 max-w-sm rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                  Currently Learning:
                </span>
                <p className="mt-2 text-base font-semibold text-white tracking-tight">
                  Python for Smart Beginners
                </p>
              </div>

              {/* Progress Bar 68% */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Progress</span>
                  <span className="text-white font-medium">68%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neutral-400 to-white"
                    style={{ width: '68%' }}
                  />
                </div>
              </div>

              {/* Next Step */}
              <div className="mt-5 pt-4 border-t border-neutral-800/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                  Next:
                </span>
                <p className="mt-1 text-sm font-medium text-neutral-300">
                  Functions &amp; Logic
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Large Premium Rectangular Container ────────────── */}
          <div className="lg:col-span-7 [perspective:1400px]">
            <div
              className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-2xl p-5 sm:p-6 lg:p-7 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)] will-change-transform transition-transform duration-300 ease-out"
              style={{
                transform: `rotateX(${dynamicRx.toFixed(2)}deg) rotateY(${dynamicRy.toFixed(2)}deg) translateY(${floatY.toFixed(1)}px)`,
              }}
            >
              {/* Clean 2x2 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.title}
                      className="rounded-lg border border-white/[0.07] bg-[#111115]/75 p-5 sm:p-6 backdrop-blur-md transition-colors duration-200 hover:border-white/[0.14] hover:bg-[#14141a]/85 shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex flex-col justify-start"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] text-neutral-300">
                        <Icon className="h-4 w-4 stroke-[1.8]" />
                      </div>

                      <h3 className="mt-5 text-[15px] sm:text-base font-semibold text-white tracking-tight">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
