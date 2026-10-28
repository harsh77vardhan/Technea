import { useEffect, useRef } from 'react'

/**
 * SpaceGardenAtmosphere
 * 
 * Provides an authentic futuristic OS visual atmosphere for the Technea
 * Engineering Workspace:
 * - Deep black canvas (#050505)
 * - Subtle ambient volumetric lighting (monochrome/deep slate radial gradients with ultra-low opacity)
 * - High-performance HTML5 canvas starfield / micro-particles (3 depth tiers: cosmic dust, mid-field, subtle glowing nodes with gentle twinkle and drift)
 * - Technical precision matrix: subtle hairline dot grid and technical corner accents echoing the Hero page's Memphis/technical linework in monochrome/slate-800
 * - Subtle depth vignette (box-shadow: inset 0 0 140px rgba(0,0,0,0.85))
 * - High performance, uses ResizeObserver, and cancels requestAnimationFrame on cleanup.
 */
export default function SpaceGardenAtmosphere() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let isMounted = true
    let width = 300
    let height = 300
    let dpr = 1

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Tier 1: 90 distant micro-particles / cosmic dust (batched draw)
    const tier1 = []
    for (let i = 0; i < 90; i++) {
      tier1.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        radius: 0.4 + Math.random() * 0.4,
        vy: -(0.015 + Math.random() * 0.025),
        vx: (Math.random() - 0.5) * 0.012,
      })
    }

    // Tier 2: 50 mid-field particles (batched draw)
    const tier2 = []
    for (let i = 0; i < 50; i++) {
      tier2.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        radius: 0.8 + Math.random() * 0.5,
        vy: -(0.035 + Math.random() * 0.05),
        vx: (Math.random() - 0.5) * 0.02,
      })
    }

    // Tier 3: 18 subtle glowing nodes with gentle twinkle and drift
    const tier3 = []
    for (let i = 0; i < 18; i++) {
      tier3.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        radius: 1.3 + Math.random() * 0.6,
        baseAlpha: 0.35 + Math.random() * 0.25,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.008 + Math.random() * 0.014,
        vy: -(0.06 + Math.random() * 0.06),
        vx: (Math.random() - 0.5) * 0.03,
        glowRadius: 3.5 + Math.random() * 3.0,
      })
    }

    // High performance ResizeObserver with bounds and DPR check
    const handleResize = () => {
      if (!canvas || !isMounted) return
      const rect = canvas.getBoundingClientRect()
      width = rect.width || canvas.offsetWidth || 300
      height = rect.height || canvas.offsetHeight || 300
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

    const drawFrame = (currentTime) => {
      ctx.clearRect(0, 0, width, height)

      // 1. Batch render Tier 1 cosmic dust in single draw call
      ctx.fillStyle = 'rgba(235, 242, 255, 0.25)'
      ctx.beginPath()
      for (let i = 0; i < tier1.length; i++) {
        const p = tier1[i]
        if (!prefersReducedMotion) {
          p.y += p.vy
          p.x += p.vx
          if (p.y < 0) {
            p.y = height
            p.x = Math.random() * width
          }
          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
        }
        ctx.moveTo(p.x + p.radius, p.y)
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      }
      ctx.fill()

      // 2. Batch render Tier 2 mid-field particles in single draw call
      ctx.fillStyle = 'rgba(235, 242, 255, 0.42)'
      ctx.beginPath()
      for (let i = 0; i < tier2.length; i++) {
        const p = tier2[i]
        if (!prefersReducedMotion) {
          p.y += p.vy
          p.x += p.vx
          if (p.y < 0) {
            p.y = height
            p.x = Math.random() * width
          }
          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
        }
        ctx.moveTo(p.x + p.radius, p.y)
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      }
      ctx.fill()

      // 3. Render Tier 3 glowing nodes (halo + core)
      for (let i = 0; i < tier3.length; i++) {
        const p = tier3[i]
        if (!prefersReducedMotion) {
          p.y += p.vy
          p.x += p.vx
          if (p.y < 0) {
            p.y = height
            p.x = Math.random() * width
          }
          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
        }

        const twinkle = prefersReducedMotion ? 0 : Math.sin(currentTime * p.twinkleSpeed + p.twinkleOffset)
        const currentAlpha = Math.max(0.15, Math.min(0.85, p.baseAlpha + twinkle * 0.16))

        // Glow halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 225, 255, ${currentAlpha * 0.14})`
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240, 246, 255, ${currentAlpha})`
        ctx.fill()
      }
    }

    const render = (currentTime) => {
      if (!isMounted) return
      drawFrame(currentTime)
      animationFrameId = requestAnimationFrame(render)
    }

    // If user prefers reduced motion, draw once and don't animate
    if (prefersReducedMotion) {
      drawFrame(0)
    } else {
      animationFrameId = requestAnimationFrame(render)
    }

    // Pause when tab is inactive to preserve CPU / battery
    const handleVisibilityChange = () => {
      if (prefersReducedMotion) return
      if (document.visibilityState === 'hidden') {
        cancelAnimationFrame(animationFrameId)
      } else if (document.visibilityState === 'visible' && isMounted) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#050505]"
      aria-hidden="true"
    >
      {/* Subtle Ambient Volumetric Lighting (Monochrome / Deep Slate Radial Gradients) */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 85% 15%, rgba(30, 41, 59, 0.3) 0%, transparent 70%),
            radial-gradient(ellipse 65% 50% at 15% 85%, rgba(15, 23, 42, 0.35) 0%, transparent 65%),
            radial-gradient(ellipse 80% 60% at 50% 45%, rgba(30, 41, 59, 0.18) 0%, transparent 75%),
            radial-gradient(circle at 75% 75%, rgba(51, 65, 85, 0.14) 0%, transparent 60%)
          `,
        }}
      />

      {/* Technical Precision Matrix: Subtle Hairline Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* HTML5 Starfield Canvas with 3-tier Parallax Particles */}
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />

      {/* Technical Precision Matrix: Corner Accents Echoing Hero Page's Memphis/Technical Linework in Slate-800 */}

      {/* Top-Left: Hairline chevrons & precision crosshair */}
      <svg
        width="160"
        height="120"
        viewBox="0 0 160 120"
        fill="none"
        className="absolute top-0 left-0 opacity-[0.22]"
        aria-hidden="true"
      >
        {[0, 24, 48, 72].map((y) => (
          <polyline
            key={y}
            points={`-8,${y + 20} 20,${y} 48,${y + 20} 76,${y} 104,${y + 20} 132,${y} 160,${y + 20}`}
            stroke="#334155"
            strokeWidth="1.2"
            strokeLinejoin="miter"
          />
        ))}
        <line x1="0" y1="0" x2="28" y2="0" stroke="#64748b" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="0" y2="28" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="28" cy="28" r="2" fill="#64748b" />
      </svg>

      {/* Top-Right: Hairline dot matrix (6x6) & corner bracket */}
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
        className="absolute top-2 right-2 opacity-[0.25]"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }, (_, row) =>
          Array.from({ length: 6 }, (_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 20 + 15}
              cy={row * 20 + 15}
              r={1.6}
              fill="#475569"
            />
          ))
        )}
        <line x1="138" y1="2" x2="110" y2="2" stroke="#64748b" strokeWidth="1.5" />
        <line x1="138" y1="2" x2="138" y2="30" stroke="#64748b" strokeWidth="1.5" />
      </svg>

      {/* Bottom-Left: Diagonal technical hatch lines & corner bracket */}
      <svg
        width="180"
        height="150"
        viewBox="0 0 180 150"
        fill="none"
        className="absolute bottom-0 left-0 opacity-[0.20]"
        aria-hidden="true"
      >
        {[-40, -18, 4, 26, 48, 70, 92].map((x0) => (
          <line
            key={x0}
            x1={x0}
            y1={150}
            x2={x0 + 105}
            y2={45}
            stroke="#334155"
            strokeWidth="1.2"
          />
        ))}
        <line x1="2" y1="148" x2="30" y2="148" stroke="#64748b" strokeWidth="1.5" />
        <line x1="2" y1="148" x2="2" y2="120" stroke="#64748b" strokeWidth="1.5" />
      </svg>

      {/* Bottom-Right: Technical right-pointing chevrons & corner bracket */}
      <svg
        width="160"
        height="130"
        viewBox="0 0 160 130"
        fill="none"
        className="absolute bottom-0 right-0 opacity-[0.22]"
        aria-hidden="true"
      >
        {[0, 24, 48].map((offset) => (
          <polyline
            key={offset}
            points={`${offset + 60},25 ${offset + 90},65 ${offset + 60},105`}
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
        ))}
        <line x1="158" y1="128" x2="130" y2="128" stroke="#64748b" strokeWidth="1.5" />
        <line x1="158" y1="128" x2="158" y2="100" stroke="#64748b" strokeWidth="1.5" />
      </svg>

      {/* Subtle Depth Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 140px rgba(0, 0, 0, 0.85)',
        }}
      />
    </div>
  )
}
