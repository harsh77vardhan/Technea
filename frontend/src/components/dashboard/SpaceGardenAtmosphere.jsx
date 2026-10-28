import { useEffect, useRef } from 'react'

/**
 * SpaceGardenAtmosphere
 * 
 * Provides an authentic futuristic OS cosmic visual atmosphere for the Technea
 * Engineering Workspace / Learning Dashboard:
 * 
 * 1. Deep Space Cosmic Starfield (HTML5 Canvas):
 *    - Tier 1: 120 distant cosmic dust particles (slow, gentle upward/sideways drift).
 *    - Tier 2: 60 mid-field star particles with subtle twinkle via sine modulation.
 *    - Tier 3: 25 prominent celestial glowing nodes with luminous soft halo aura (rgba(220, 235, 255, alpha)).
 *    - Real-time twinkle cycles via sine modulation.
 *    - Smooth coordinate wrapping across canvas bounds.
 *    - Interactive mouse parallax with smooth camera drift without lagging.
 * 
 * 2. Dynamic Volumetric Nebulae:
 *    - Rich multi-layered radial gradients with animated opacity and position breathing:
 *      rgba(30, 45, 75, 0.35), rgba(15, 25, 45, 0.40), rgba(20, 30, 50, 0.25).
 * 
 * 3. Memphis Technical Anchors (Harmonizing with Hero.jsx):
 *    - Top-Left: Precision zigzag chevrons + coordinate crosshair in slate-700/800.
 *    - Top-Right: 7x7 dot matrix grid + corner bracket.
 *    - Bottom-Left: Diagonal technical hatch lines + striped circle.
 *    - Bottom-Right: Directional chevrons + corner bracket.
 * 
 * 4. Precision Hairline Grid:
 *    - Technical dot matrix (radial-gradient(rgba(255, 255, 255, 0.20) 1px, transparent 1px) 24px x 24px).
 * 
 * 5. Performance & Safety:
 *    - Single-path batched canvas draw calls for Tier 1 & Tier 2.
 *    - Automatic ResizeObserver with DPR capping (Math.min(devicePixelRatio, 2)).
 *    - Visibilitychange listener: halts requestAnimationFrame when tab is hidden, resumes smoothly on focus.
 *    - Respects prefers-reduced-motion: reduce.
 *    - Complete cancelAnimationFrame and event listener cleanup on unmount.
 */
export default function SpaceGardenAtmosphere({ className = '', style = {} } = {}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId = null
    let isMounted = true
    let width = 300
    let height = 300
    let dpr = 1

    // Motion preference detection & live listener
    const mediaQuery =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null
    let prefersReducedMotion = mediaQuery ? mediaQuery.matches : false

    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches
      if (prefersReducedMotion) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        drawFrame(0)
      } else if (!animationFrameId && isMounted && document.visibilityState === 'visible') {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Particle Depth Tiers
    // ─────────────────────────────────────────────────────────────────────────

    // Tier 1: 120 distant cosmic dust particles (slow, gentle upward/sideways drift)
    const tier1Count = 120
    const tier1 = []
    for (let i = 0; i < tier1Count; i++) {
      tier1.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        radius: 0.35 + Math.random() * 0.45,
        vy: -(0.012 + Math.random() * 0.022),
        vx: (Math.random() - 0.5) * 0.014,
      })
    }

    // Tier 2: 60 mid-field star particles with subtle twinkle
    const tier2Count = 60
    const tier2 = []
    for (let i = 0; i < tier2Count; i++) {
      tier2.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        radius: 0.75 + Math.random() * 0.55,
        vy: -(0.03 + Math.random() * 0.045),
        vx: (Math.random() - 0.5) * 0.02,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0016 + Math.random() * 0.0022,
      })
    }

    // Tier 3: 25 prominent celestial glowing nodes with luminous soft halo aura
    const tier3Count = 25
    const tier3 = []
    for (let i = 0; i < tier3Count; i++) {
      tier3.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        radius: 1.4 + Math.random() * 0.8,
        glowRadius: 4.8 + Math.random() * 4.2,
        vy: -(0.05 + Math.random() * 0.06),
        vx: (Math.random() - 0.5) * 0.03,
        baseAlpha: 0.45 + Math.random() * 0.35,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0018 + Math.random() * 0.0025,
      })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Interactive Mouse Parallax (Lag-free smooth camera drift)
    // ─────────────────────────────────────────────────────────────────────────
    const mouse = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
    }

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return
      const halfW = window.innerWidth * 0.5 || 1
      const halfH = window.innerHeight * 0.5 || 1
      mouse.targetX = (e.clientX - halfW) / halfW
      mouse.targetY = (e.clientY - halfH) / halfH
    }

    const handlePointerLeave = () => {
      mouse.targetX = 0
      mouse.targetY = 0
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true })

    // ─────────────────────────────────────────────────────────────────────────
    // Resize Handling with DPR Capping
    // ─────────────────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!canvas || !isMounted) return
      const rect = canvas.getBoundingClientRect()
      width = Math.max(rect.width || canvas.offsetWidth || 300, 300)
      height = Math.max(rect.height || canvas.offsetHeight || 300, 300)
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (prefersReducedMotion) {
        drawFrame(0)
      }
    }

    const resizeObserver = new ResizeObserver(() => handleResize())
    resizeObserver.observe(canvas)
    handleResize()

    // ─────────────────────────────────────────────────────────────────────────
    // Frame Rendering
    // ─────────────────────────────────────────────────────────────────────────
    const drawFrame = (currentTime) => {
      ctx.clearRect(0, 0, width, height)

      // Smooth camera interpolation
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.05
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.05

      const pX = prefersReducedMotion ? 0 : mouse.currentX * 28
      const pY = prefersReducedMotion ? 0 : mouse.currentY * 28

      // ── 1. Tier 1: Batched single-path draw call (120 cosmic dust particles) ──
      ctx.fillStyle = 'rgba(215, 230, 255, 0.28)'
      ctx.beginPath()
      for (let i = 0; i < tier1.length; i++) {
        const p = tier1[i]
        if (!prefersReducedMotion) {
          p.y += p.vy
          p.x += p.vx
          if (p.y < 0) {
            p.y += height
            p.x = Math.random() * width
          } else if (p.y > height) {
            p.y -= height
            p.x = Math.random() * width
          }
          if (p.x < 0) p.x += width
          else if (p.x > width) p.x -= width
        }

        const rx = ((p.x + pX * 0.2) % width + width) % width
        const ry = ((p.y + pY * 0.2) % height + height) % height

        ctx.moveTo(rx + p.radius, ry)
        ctx.arc(rx, ry, p.radius, 0, Math.PI * 2)
      }
      ctx.fill()

      // ── 2. Tier 2: Batched single-path draw call (60 mid-field star particles) ──
      ctx.fillStyle = 'rgba(225, 238, 255, 0.48)'
      ctx.beginPath()
      for (let i = 0; i < tier2.length; i++) {
        const p = tier2[i]
        if (!prefersReducedMotion) {
          p.y += p.vy
          p.x += p.vx
          if (p.y < 0) {
            p.y += height
            p.x = Math.random() * width
          } else if (p.y > height) {
            p.y -= height
            p.x = Math.random() * width
          }
          if (p.x < 0) p.x += width
          else if (p.x > width) p.x -= width
        }

        const rx = ((p.x + pX * 0.45) % width + width) % width
        const ry = ((p.y + pY * 0.45) % height + height) % height

        const twinkle = prefersReducedMotion
          ? 0
          : Math.sin(currentTime * p.twinkleSpeed + p.twinkleOffset)
        const currentRadius = Math.max(0.25, p.radius * (1 + twinkle * 0.35))

        ctx.moveTo(rx + currentRadius, ry)
        ctx.arc(rx, ry, currentRadius, 0, Math.PI * 2)
      }
      ctx.fill()

      // ── 3. Tier 3: 25 prominent celestial glowing nodes (luminous soft halo aura) ──
      for (let i = 0; i < tier3.length; i++) {
        const p = tier3[i]
        if (!prefersReducedMotion) {
          p.y += p.vy
          p.x += p.vx
          if (p.y < 0) {
            p.y += height
            p.x = Math.random() * width
          } else if (p.y > height) {
            p.y -= height
            p.x = Math.random() * width
          }
          if (p.x < 0) p.x += width
          else if (p.x > width) p.x -= width
        }

        const rx = ((p.x + pX * 0.85) % width + width) % width
        const ry = ((p.y + pY * 0.85) % height + height) % height

        const twinkle = prefersReducedMotion
          ? 0
          : Math.sin(currentTime * p.twinkleSpeed + p.twinkleOffset)
        const currentAlpha = Math.max(0.18, Math.min(0.95, p.baseAlpha + twinkle * 0.28))
        const haloAlpha = currentAlpha * 0.22

        // Outer soft halo aura: rgba(220, 235, 255, alpha)
        ctx.beginPath()
        ctx.arc(rx, ry, p.glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 235, 255, ${haloAlpha.toFixed(3)})`
        ctx.fill()

        // Inner radiant core
        ctx.beginPath()
        ctx.arc(rx, ry, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240, 248, 255, ${currentAlpha.toFixed(3)})`
        ctx.fill()
      }
    }

    const render = (currentTime) => {
      if (!isMounted) return
      drawFrame(currentTime)
      animationFrameId = requestAnimationFrame(render)
    }

    if (prefersReducedMotion) {
      drawFrame(0)
    } else {
      animationFrameId = requestAnimationFrame(render)
    }

    // Pause when tab is inactive to preserve CPU & battery
    const handleVisibilityChange = () => {
      if (prefersReducedMotion) return
      if (document.visibilityState === 'hidden') {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
      } else if (document.visibilityState === 'visible' && isMounted) {
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(render)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#050505] ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* ── Dynamic Keyframes for Volumetric Breathing ────────────────────────── */}
      <style>{`
        @keyframes nebulaPulseA {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: translate3d(-24px, 16px, 0) scale(1.06);
            opacity: 1;
          }
        }
        @keyframes nebulaPulseB {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1.05);
            opacity: 0.9;
          }
          50% {
            transform: translate3d(20px, -24px, 0) scale(0.95);
            opacity: 0.72;
          }
        }
        @keyframes nebulaPulseC {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.78;
          }
          50% {
            transform: translate3d(-18px, -16px, 0) scale(1.08);
            opacity: 0.96;
          }
        }
        .animate-nebula-a {
          animation: nebulaPulseA 18s ease-in-out infinite alternate;
        }
        .animate-nebula-b {
          animation: nebulaPulseB 24s ease-in-out infinite alternate;
        }
        .animate-nebula-c {
          animation: nebulaPulseC 28s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-nebula-a,
          .animate-nebula-b,
          .animate-nebula-c {
            animation: none !important;
          }
        }
      `}</style>

      {/* ── Dynamic Volumetric Nebulae (Multi-layered Radial Gradients with Breathing) ─ */}
      {/* Layer 1: rgba(30, 45, 75, 0.35) top-right focal glow */}
      <div
        className="absolute inset-0 animate-nebula-a will-change-transform"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 85% 15%, rgba(30, 45, 75, 0.35) 0%, rgba(30, 45, 75, 0.12) 50%, transparent 75%)',
        }}
      />

      {/* Layer 2: rgba(15, 25, 45, 0.40) bottom-left deep cosmic anchor */}
      <div
        className="absolute inset-0 animate-nebula-b will-change-transform"
        style={{
          background:
            'radial-gradient(ellipse 65% 50% at 15% 85%, rgba(15, 25, 45, 0.40) 0%, rgba(15, 25, 45, 0.14) 55%, transparent 75%)',
        }}
      />

      {/* Layer 3: rgba(20, 30, 50, 0.25) center ambient volumetric drift */}
      <div
        className="absolute inset-0 animate-nebula-c will-change-transform"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 45%, rgba(20, 30, 50, 0.25) 0%, rgba(20, 30, 50, 0.08) 55%, transparent 75%),
            radial-gradient(circle at 75% 75%, rgba(30, 45, 75, 0.22) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Precision Hairline Grid: Technical Dot Matrix ────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.20]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.20) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Deep Space Cosmic Starfield Canvas (3-tier depth, twinkle & mouse parallax) ─ */}
      <canvas ref={canvasRef} className="w-full h-full block opacity-90" />

      {/* ── Memphis Technical Anchors (Harmonizing with Hero.jsx in slate-700/800) ─── */}

      {/* Top-Left: Precision zigzag chevrons + coordinate crosshair in slate-700/800 */}
      <svg
        width="210"
        height="170"
        viewBox="0 0 210 170"
        fill="none"
        className="absolute left-0 top-0 opacity-[0.38]"
        aria-hidden="true"
      >
        {/* Precision zigzag chevrons radiating from corner (echoing DecoTopLeft from Hero) */}
        {[0, 26, 52, 78, 104, 130].map((y) => (
          <polyline
            key={y}
            points={`-10,${y + 26} 26,${y} 62,${y + 26} 98,${y} 134,${y + 26} 170,${y} 206,${y + 26} 242,${y}`}
            stroke="#334155"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
        ))}

        {/* Technical Coordinate Crosshair Reticle */}
        <line x1="0" y1="0" x2="36" y2="0" stroke="#64748b" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="0" y2="36" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="36" cy="36" r="2.5" fill="#64748b" />
        <circle cx="68" cy="68" r="9" stroke="#475569" strokeWidth="1" strokeDasharray="3 2" fill="none" />
        <line x1="55" y1="68" x2="81" y2="68" stroke="#64748b" strokeWidth="1" />
        <line x1="68" y1="55" x2="68" y2="81" stroke="#64748b" strokeWidth="1" />
        <text
          x="84"
          y="72"
          fill="#64748b"
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="0.16em"
          opacity="0.8"
        >
          SYS // 01.TL
        </text>
      </svg>

      {/* Top-Right: 7x7 dot matrix grid + corner bracket */}
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        className="absolute right-0 top-0 opacity-[0.40]"
        aria-hidden="true"
      >
        {/* 7x7 Dot Matrix (echoing DecoTopRight from Hero) */}
        {Array.from({ length: 7 }, (_, row) =>
          Array.from({ length: 7 }, (_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 20 + 10}
              cy={row * 20 + 10}
              r={2.2}
              fill="#334155"
            />
          ))
        )}

        {/* Precision Corner Bracket */}
        <line x1="158" y1="2" x2="118" y2="2" stroke="#64748b" strokeWidth="1.5" />
        <line x1="158" y1="2" x2="158" y2="42" stroke="#64748b" strokeWidth="1.5" />
        <rect x="146" y="8" width="6" height="6" fill="#475569" />
        <text
          x="62"
          y="152"
          fill="#475569"
          fontSize="7.5"
          fontFamily="monospace"
          letterSpacing="0.18em"
          opacity="0.75"
        >
          GRID // 7x7.TR
        </text>
      </svg>

      {/* Bottom-Left: Diagonal technical hatch lines + striped circle */}
      <svg
        width="240"
        height="220"
        viewBox="0 0 240 220"
        fill="none"
        className="absolute bottom-0 left-0 opacity-[0.35]"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="tcn-dashboard-stripe-clip">
            <circle cx="158" cy="152" r="46" />
          </clipPath>
        </defs>

        {/* Diagonal technical hatch lines at ~45° (echoing DecoBottomLeft from Hero) */}
        {[-50, -28, -6, 16, 38, 60, 82, 104].map((x0) => (
          <line
            key={x0}
            x1={x0}
            y1={220}
            x2={x0 + 130}
            y2={90}
            stroke="#334155"
            strokeWidth="1.8"
          />
        ))}

        {/* Technical Striped Circle with horizontal fill lines */}
        {Array.from({ length: 18 }, (_, i) => {
          const y = 152 - 46 + (i * (46 * 2)) / 17
          return (
            <line
              key={`stripe-${i}`}
              x1={158 - 46 - 2}
              y1={y}
              x2={158 + 46 + 2}
              y2={y}
              stroke="#334155"
              strokeWidth="2.5"
              clipPath="url(#tcn-dashboard-stripe-clip)"
            />
          )
        })}

        {/* Striped circle outer boundary */}
        <circle cx="158" cy="152" r="46" stroke="#475569" strokeWidth="2" />

        {/* Hollow overlapping circle (offset left-up) */}
        <circle
          cx="122"
          cy="122"
          r="32"
          stroke="#334155"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Precision Corner Bracket */}
        <line x1="2" y1="218" x2="38" y2="218" stroke="#64748b" strokeWidth="1.5" />
        <line x1="2" y1="218" x2="2" y2="182" stroke="#64748b" strokeWidth="1.5" />
      </svg>

      {/* Bottom-Right: Directional chevrons + corner bracket */}
      <svg
        width="200"
        height="180"
        viewBox="0 0 200 180"
        fill="none"
        className="absolute bottom-0 right-0 opacity-[0.38]"
        aria-hidden="true"
      >
        {/* 4 bold directional right-pointing chevrons in slate-700/800 (echoing DecoBottomRight from Hero) */}
        {[0, 30, 60, 90].map((offset) => (
          <polyline
            key={offset}
            points={`${offset + 18},22 ${offset + 58},90 ${offset + 18},158`}
            stroke="#334155"
            strokeWidth="16"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />
        ))}

        {/* Memphis Geometric Accents */}
        <rect x="10" y="10" width="14" height="14" fill="#334155" />
        <rect x="30" y="14" width="8" height="8" fill="#475569" opacity="0.6" />
        <polygon points="2,178 32,140 2,140" fill="#334155" opacity="0.6" />

        {/* Precision Corner Bracket */}
        <line x1="198" y1="178" x2="160" y2="178" stroke="#64748b" strokeWidth="1.5" />
        <line x1="198" y1="178" x2="198" y2="140" stroke="#64748b" strokeWidth="1.5" />
      </svg>

      {/* ── Subtle Depth Vignette ────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 160px rgba(0, 0, 0, 0.88)',
        }}
      />
    </div>
  )
}
