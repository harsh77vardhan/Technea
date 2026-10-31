import { memo } from 'react'

/**
 * MemphisCornerDecorations
 *
 * Geometric anchors matching Technea's aesthetic, styled in the
 * premium Burnt Orange & Warm Ivory palette.
 */
function DecoTopLeft() {
  const rows = [0, 26, 52, 78, 104, 130]
  return (
    <svg
      width="210"
      height="170"
      viewBox="0 0 210 170"
      fill="none"
      className="pointer-events-none absolute left-0 top-0 select-none opacity-30 xl:opacity-45 transition-opacity"
      aria-hidden="true"
    >
      {rows.map((y) => (
        <polyline
          key={y}
          points={`-10,${y + 26} 26,${y} 62,${y + 26} 98,${y} 134,${y + 26} 170,${y} 206,${y + 26} 242,${y}`}
          stroke="#c25e2e"
          strokeWidth="2.5"
          strokeLinejoin="miter"
        />
      ))}
    </svg>
  )
}

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
      className="pointer-events-none absolute right-0 top-0 select-none opacity-30 xl:opacity-45 transition-opacity"
      aria-hidden="true"
    >
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * STEP + 10}
            cy={row * STEP + 10}
            r={R}
            fill="#d97b48"
          />
        ))
      )}
    </svg>
  )
}

function DecoBottomLeft() {
  const diagonals = [-50, -28, -6, 16, 38, 60, 82, 104]
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
      className="pointer-events-none absolute bottom-0 left-0 select-none opacity-30 xl:opacity-45 transition-opacity"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="tcn-dash-stripe-clip">
          <circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R} />
        </clipPath>
      </defs>

      {/* Burnt Orange diagonal hatch lines */}
      {diagonals.map((x0) => (
        <line
          key={x0}
          x1={x0}
          y1={220}
          x2={x0 + 130}
          y2={90}
          stroke="#c25e2e"
          strokeWidth="2"
        />
      ))}

      {/* Terracotta horizontal stripes clipped inside circle */}
      {Array.from({ length: stripeCount }, (_, i) => {
        const y = CIRCLE_CY - CIRCLE_R + (i * (CIRCLE_R * 2)) / (stripeCount - 1)
        return (
          <line
            key={`stripe-${i}`}
            x1={CIRCLE_CX - CIRCLE_R - 2}
            y1={y}
            x2={CIRCLE_CX + CIRCLE_R + 2}
            y2={y}
            stroke="#d97b48"
            strokeWidth="3"
            clipPath="url(#tcn-dash-stripe-clip)"
          />
        )
      })}

      {/* Striped circle border */}
      <circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R} stroke="#d97b48" strokeWidth="2.5" />

      {/* Hollow circle — overlaps the striped one */}
      <circle cx={CIRCLE_CX - 36} cy={CIRCLE_CY - 30} r={32} stroke="#c25e2e" strokeWidth="2.5" />
    </svg>
  )
}

function DecoBottomRight() {
  const chevrons = [0, 30, 60, 90]
  return (
    <svg
      width="200"
      height="180"
      viewBox="0 0 200 180"
      fill="none"
      className="pointer-events-none absolute bottom-0 right-0 select-none opacity-30 xl:opacity-45 transition-opacity"
      aria-hidden="true"
    >
      {/* 4 heavy right-pointing chevrons anchored to the right edge */}
      {chevrons.map((offset) => (
        <polyline
          key={offset}
          points={`${offset + 18},22 ${offset + 58},90 ${offset + 18},158`}
          stroke="#d97b48"
          strokeWidth="20"
          strokeLinejoin="miter"
          strokeLinecap="square"
        />
      ))}

      {/* Burnt Orange filled square */}
      <rect x="4" y="4" width="16" height="16" fill="#c25e2e" />

      {/* Small terracotta square */}
      <rect x="26" y="8" width="10" height="10" fill="#d97b48" opacity="0.55" />

      {/* Burnt Orange right triangle anchored bottom-left */}
      <polygon points="0,180 32,142 0,142" fill="#c25e2e" opacity="0.65" />
    </svg>
  )
}

function MemphisCornerDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <DecoTopLeft />
      <DecoTopRight />
      <DecoBottomLeft />
      <DecoBottomRight />
    </div>
  )
}

export default memo(MemphisCornerDecorations)
