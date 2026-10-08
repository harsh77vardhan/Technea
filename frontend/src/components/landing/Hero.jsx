import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import SkillExplorer from './SkillExplorer'

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
  const [isExplorerOpen, setIsExplorerOpen] = useState(false)

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f2f3f5]">

      {/* Four corner decorations — each anchored precisely, never scattered */}
      <DecoTopLeft />
      <DecoTopRight />
      <DecoBottomLeft />
      <DecoBottomRight />

      {/* ── Center content ───────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 text-center">

        {/* Eyebrow label */}
        <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Built for beginners starting their tech journey
        </p>

        {/* Primary headline — the entire visual weight of the page rests here */}
        <h1
          style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)', lineHeight: '0.93', letterSpacing: '-0.02em' }}
          className="font-black uppercase text-[#0f172a]"
        >
          Learn Technology.
          <br />
          Without Feeling Lost.
        </h1>

        {/* Editorial divider */}
        <div className="mx-auto mt-10 h-px w-10 bg-slate-300" />

        {/* Subtitle — restrained, one line of thought */}
        <p className="mx-auto mt-7 max-w-sm text-base leading-relaxed text-slate-500">
          AI-guided learning paths that help beginners know what to learn next.
        </p>

        {/* CTA — sharp-cornered, editorial weight, no rounded pill */}
        <div className="mt-10">
          <button
            type="button"
            onClick={() => setIsExplorerOpen(true)}
            className="inline-flex items-center gap-3 bg-[#0f172a] px-9 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-4 focus:ring-offset-[#f2f3f5] cursor-pointer"
          >
            Build My Roadmap
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Full-Screen Skill Explorer Interface */}
      <SkillExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
      />

    </section>
  )
}
