import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { ArrowRight, Compass } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useAuth } from '../../context/useAuth'
import SkillExplorer from './SkillExplorer'

gsap.registerPlugin(useGSAP)

// ─────────────────────────────────────────────────────────────────────────────
// Memphis decorations: all inline SVG, all anchored to a corner.
// Each shape is intentional — not scattered at random.
// ─────────────────────────────────────────────────────────────────────────────

// Top-left: Purple zigzag chevrons radiating from the corner
function DecoTopLeft() {
  const rows = [0, 26, 52, 78, 104, 130]
  return (
    <svg
      width="210"
      height="170"
      viewBox="0 0 210 170"
      fill="none"
      className="pointer-events-none absolute left-0 top-0 select-none"
      aria-hidden="true"
    >
      {rows.map((y) => (
        <polyline
          key={y}
          points={`-10,${y + 26} 26,${y} 62,${y + 26} 98,${y} 134,${y + 26} 170,${y} 206,${y + 26} 242,${y}`}
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinejoin="miter"
        />
      ))}
    </svg>
  )
}

// Top-right: Blue dot grid (7 × 7) anchored to the corner
function DecoTopRight() {
  const COLS = 7
  const ROWS = 7
  const STEP = 20
  const R = 2.8
  return (
    <svg
      width="148"
      height="148"
      viewBox="0 0 148 148"
      fill="none"
      className="pointer-events-none absolute right-0 top-0 select-none"
      aria-hidden="true"
    >
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * STEP + 10}
            cy={row * STEP + 10}
            r={R}
            fill="#2563eb"
          />
        ))
      )}
    </svg>
  )
}

// Bottom-left: purple diagonal hatch lines + blue striped circle overlapping
// a hollow purple circle
function DecoBottomLeft() {
  // 8 parallel diagonal lines at ~45°, going from the bottom edge upward
  const diagonals = [-50, -28, -6, 16, 38, 60, 82, 104]

  // Striped circle: horizontal fill lines clipped to a circle shape
  const CIRCLE_CX = 158
  const CIRCLE_CY = 152
  const CIRCLE_R = 46
  const stripeCount = 18

  return (
    <svg
      width="240"
      height="220"
      viewBox="0 0 240 220"
      fill="none"
      className="pointer-events-none absolute bottom-0 left-0 select-none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="tcn-stripe-clip">
          <circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R} />
        </clipPath>
      </defs>

      {/* Purple diagonal hatch lines */}
      {diagonals.map((x0) => (
        <line
          key={x0}
          x1={x0}
          y1={220}
          x2={x0 + 130}
          y2={90}
          stroke="#7c3aed"
          strokeWidth="2"
        />
      ))}

      {/* Blue horizontal stripes clipped inside circle */}
      {Array.from({ length: stripeCount }, (_, i) => {
        const y = CIRCLE_CY - CIRCLE_R + i * (CIRCLE_R * 2) / (stripeCount - 1)
        return (
          <line
            key={`stripe-${i}`}
            x1={CIRCLE_CX - CIRCLE_R - 2}
            y1={y}
            x2={CIRCLE_CX + CIRCLE_R + 2}
            y2={y}
            stroke="#2563eb"
            strokeWidth="3"
            clipPath="url(#tcn-stripe-clip)"
          />
        )
      })}

      {/* Striped circle border */}
      <circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R} stroke="#2563eb" strokeWidth="2.5" />

      {/* Hollow circle — overlaps the striped one, offset left-up */}
      <circle cx={CIRCLE_CX - 36} cy={CIRCLE_CY - 30} r={32} stroke="#7c3aed" strokeWidth="2.5" />
    </svg>
  )
}

// Bottom-right: 4 bold blue right-pointing chevrons as a solid block,
// with a small purple square and triangle accent
function DecoBottomRight() {
  const chevrons = [0, 30, 60, 90]
  return (
    <svg
      width="200"
      height="180"
      viewBox="0 0 200 180"
      fill="none"
      className="pointer-events-none absolute bottom-0 right-0 select-none"
      aria-hidden="true"
    >
      {/* 4 heavy right-pointing chevrons anchored to the right edge */}
      {chevrons.map((offset) => (
        <polyline
          key={offset}
          points={`${offset + 18},22 ${offset + 58},90 ${offset + 18},158`}
          stroke="#2563eb"
          strokeWidth="20"
          strokeLinejoin="miter"
          strokeLinecap="square"
        />
      ))}

      {/* Purple filled square — top-left of the decoration block */}
      <rect x="4" y="4" width="16" height="16" fill="#7c3aed" />

      {/* Small blue square */}
      <rect x="26" y="8" width="10" height="10" fill="#2563eb" opacity="0.55" />

      {/* Purple right triangle anchored bottom-left */}
      <polygon points="0,180 32,142 0,142" fill="#7c3aed" opacity="0.65" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { openRoadmapBuilder } = useAuth()
  const [isExplorerOpen, setIsExplorerOpen] = useState(false)
  const [scrollFade, setScrollFade] = useState(1)
  const lenis = useLenis()

  const heroRef = useRef(null)
  const decoTopLeftRef = useRef(null)
  const decoTopRightRef = useRef(null)
  const decoBottomLeftRef = useRef(null)
  const decoBottomRightRef = useRef(null)
  const centerContentRef = useRef(null)

  // ── GSAP Cinematic Landing Entrance Timeline ─────────────────────────────
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 1. Memphis corner accents bloom into position
      tl.from('.deco-corner', {
        opacity: 0,
        scale: 0.84,
        duration: 1.15,
        stagger: 0.08,
        ease: 'power3.out',
      })

      // 2. Eyebrow badge descends cleanly
      tl.from(
        '.hero-eyebrow',
        {
          opacity: 0,
          y: -22,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.9'
      )

      // 3. Primary headline reveals with smooth luxury power4 ease
      tl.from(
        '.hero-headline',
        {
          opacity: 0,
          y: 45,
          scale: 0.98,
          duration: 1.0,
          ease: 'power4.out',
        },
        '-=0.6'
      )

      // 4. Precision editorial divider unfolds horizontally from center
      tl.from(
        '.hero-divider',
        {
          scaleX: 0,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.inOut',
        },
        '-=0.65'
      )

      // 5. Subtitle eases upward
      tl.from(
        '.hero-subtitle',
        {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.45'
      )

      // 6. Action buttons pop in with confident spring
      tl.from(
        '.hero-cta-btn',
        {
          opacity: 0,
          y: 20,
          scale: 0.94,
          stagger: 0.12,
          duration: 0.75,
          ease: 'back.out(1.6)',
        },
        '-=0.45'
      )

      // 7. Scroll indicator enters smoothly
      tl.from(
        '.hero-scroll-prompt',
        {
          opacity: 0,
          y: 16,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.3'
      )
    },
    { scope: heroRef }
  )

  useLenis(({ scroll }) => {
    // Only apply continuous parallax while hero is visible on screen
    if (scroll < 1000) {
      if (decoTopLeftRef.current) {
        decoTopLeftRef.current.style.transform = `translate3d(${-scroll * 0.14}px, ${-scroll * 0.26}px, 0)`
      }
      if (decoTopRightRef.current) {
        decoTopRightRef.current.style.transform = `translate3d(${scroll * 0.16}px, ${-scroll * 0.32}px, 0)`
      }
      if (decoBottomLeftRef.current) {
        decoBottomLeftRef.current.style.transform = `translate3d(${-scroll * 0.12}px, ${scroll * 0.22}px, 0)`
      }
      if (decoBottomRightRef.current) {
        decoBottomRightRef.current.style.transform = `translate3d(${scroll * 0.18}px, ${scroll * 0.28}px, 0)`
      }
      if (centerContentRef.current) {
        const opacity = Math.max(0, 1 - scroll / 520)
        centerContentRef.current.style.transform = `translate3d(0, ${scroll * 0.18}px, 0)`
        centerContentRef.current.style.opacity = String(opacity)
      }
    }
    setScrollFade(Math.max(0, 1 - scroll / 220))
  })

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f2f3f5]"
    >
      {/* Four corner decorations — each anchored precisely with continuous scroll parallax */}
      <div
        ref={decoTopLeftRef}
        className="pointer-events-none absolute left-0 top-0 will-change-transform z-0"
      >
        <div className="deco-corner">
          <DecoTopLeft />
        </div>
      </div>
      <div
        ref={decoTopRightRef}
        className="pointer-events-none absolute right-0 top-0 will-change-transform z-0"
      >
        <div className="deco-corner">
          <DecoTopRight />
        </div>
      </div>
      <div
        ref={decoBottomLeftRef}
        className="pointer-events-none absolute bottom-0 left-0 will-change-transform z-0"
      >
        <div className="deco-corner">
          <DecoBottomLeft />
        </div>
      </div>
      <div
        ref={decoBottomRightRef}
        className="pointer-events-none absolute bottom-0 right-0 will-change-transform z-0"
      >
        <div className="deco-corner">
          <DecoBottomRight />
        </div>
      </div>

      {/* ── Center content with continuous scroll depth & fade ──────────── */}
      <div
        ref={centerContentRef}
        className="relative z-10 px-6 text-center will-change-transform"
      >
        {/* Eyebrow label */}
        <p className="hero-eyebrow mb-8 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Built for beginners starting their tech journey
        </p>

        {/* Primary headline — the entire visual weight of the page rests here */}
        <h1
          style={{
            fontSize: 'clamp(2.6rem, 7vw, 5.5rem)',
            lineHeight: '0.93',
            letterSpacing: '-0.02em',
          }}
          className="hero-headline font-black uppercase text-[#0f172a]"
        >
          Learn Technology.
          <br />
          Without Feeling Lost.
        </h1>

        {/* Editorial divider */}
        <div className="hero-divider mx-auto mt-10 h-px w-10 bg-slate-300 origin-center" />

        {/* Subtitle — restrained, one line of thought */}
        <p className="hero-subtitle mx-auto mt-7 max-w-sm text-base leading-relaxed text-slate-500">
          AI-guided learning paths that help beginners know what to learn next.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => openRoadmapBuilder()}
            className="hero-cta-btn inline-flex items-center gap-3 bg-[#0f172a] px-9 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-4 focus:ring-offset-[#f2f3f5] cursor-pointer"
          >
            Build My Roadmap
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsExplorerOpen(true)}
            className="hero-cta-btn inline-flex items-center gap-2 border border-slate-300 bg-white/80 backdrop-blur-xs px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 transition-colors hover:bg-white hover:text-slate-900 cursor-pointer"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Explore Catalog</span>
          </button>
        </div>
      </div>

      {/* Full-Screen Skill Explorer Interface */}
      <SkillExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
      />

      {/* ── Minimal Scroll Indicator (Connected to Lenis) ───────────── */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollFade }}
        transition={{ delay: 0.9, duration: 0.8 }}
        onClick={() =>
          lenis?.scrollTo('#career-showcase', { offset: -60, duration: 1.2 })
        }
        className="hero-scroll-prompt absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1.5 select-none group cursor-pointer"
        style={{ pointerEvents: scrollFade > 0.05 ? 'auto' : 'none' }}
        aria-label="Scroll to next section"
      >
        <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-slate-400 group-hover:text-slate-700 transition-colors">
          SCROLL
        </span>
        <div className="w-3.5 h-6 rounded-full border border-slate-300 group-hover:border-slate-500 transition-colors flex items-start justify-center p-0.5">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-1 rounded-full bg-slate-500"
          />
        </div>
      </motion.button>
    </section>
  )
}
