import { useEffect, useRef } from 'react'

/**
 * SpaceGardenAtmosphere
 * 
 * Provides an atmospheric, calm, space-inspired backdrop for the Technea
 * Engineering Workspace:
 * - Deep black environment (#050505) with multi-layered cosmic nebulae
 * - Three depth tiers of star particles (distant dust, mid-field, small glowing stars)
 * - Subtle parallax drift (foreground stars move slightly faster than distant micro-particles)
 * - Subtle dark organic botanical silhouettes framing the corners
 * - Strictly non-intrusive, calm, and professional
 */
export default function SpaceGardenAtmosphere() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = canvas.offsetWidth || 300)
    let height = (canvas.height = canvas.offsetHeight || 300)

    // Generate 175 stars across 3 distinct depth tiers for subtle parallax & richness
    const stars = []

    // Tier 1: 95 tiny distant micro-stars / cosmic dust
    for (let i = 0; i < 95; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.35 + Math.random() * 0.45,
        baseAlpha: 0.1 + Math.random() * 0.28,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.005 + Math.random() * 0.01,
        vy: -(0.02 + Math.random() * 0.04), // slowest distant drift
        vx: (Math.random() - 0.5) * 0.012,
        hasGlow: false,
      })
    }

    // Tier 2: 55 mid-field stars
    for (let i = 0; i < 55; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 0.55,
        baseAlpha: 0.25 + Math.random() * 0.35,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.008 + Math.random() * 0.014,
        vy: -(0.06 + Math.random() * 0.07), // moderate drift
        vx: (Math.random() - 0.5) * 0.025,
        hasGlow: false,
      })
    }

    // Tier 3: 25 slightly brighter stars with soft halo glow
    for (let i = 0; i < 25; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.4 + Math.random() * 0.8,
        baseAlpha: 0.45 + Math.random() * 0.35,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.016,
        vy: -(0.09 + Math.random() * 0.08), // gentle parallax foreground
        vx: (Math.random() - 0.5) * 0.035,
        hasGlow: true,
        glowRadius: 4.0 + Math.random() * 3.5,
      })
    }

    // Resize observer
    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth || 300
      height = canvas.height = canvas.offsetHeight || 300
    }

    const resizeObserver = new ResizeObserver(() => handleResize())
    resizeObserver.observe(canvas)

    const render = (currentTime) => {
      ctx.clearRect(0, 0, width, height)

      // Draw each star
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        s.y += s.vy
        s.x += s.vx

        // Wrap around borders
        if (s.y < 0) {
          s.y = height
          s.x = Math.random() * width
        }
        if (s.x < 0) s.x = width
        if (s.x > width) s.x = 0

        const twinkle = Math.sin(currentTime * s.twinkleSpeed + s.twinkleOffset)
        const currentAlpha = Math.max(0.08, Math.min(0.85, s.baseAlpha + twinkle * 0.18))

        // Draw soft halo aura for glowing stars
        if (s.hasGlow) {
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.glowRadius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(215, 230, 255, ${currentAlpha * 0.14})`
          ctx.fill()
        }

        // Star core
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(235, 242, 255, ${currentAlpha})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Richer Deep Space Gradients (Atmospheric Nebulae) */}
      <div
        className="absolute inset-0 opacity-55"
        style={{
          background: `
            radial-gradient(ellipse 75% 55% at 85% 15%, rgba(26, 38, 64, 0.4) 0%, transparent 70%),
            radial-gradient(ellipse 65% 50% at 15% 85%, rgba(18, 32, 50, 0.32) 0%, transparent 65%),
            radial-gradient(ellipse 80% 60% at 45% 45%, rgba(22, 28, 46, 0.25) 0%, transparent 75%),
            radial-gradient(circle at 75% 75%, rgba(28, 36, 58, 0.22) 0%, transparent 60%)
          `,
        }}
      />

      {/* HTML5 Starfield Canvas with High Particle Density & Parallax */}
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />

      {/* Corner Space-Garden Botanical Silhouettes (Dark Obsidian / Charcoal) */}
      {/* Bottom-Left Botanical Silhouette */}
      <svg
        className="absolute -bottom-6 -left-8 w-64 h-64 sm:w-80 sm:h-80 opacity-[0.24] text-[#0C1118] transition-opacity duration-1000"
        viewBox="0 0 320 320"
        fill="currentColor"
      >
        <path d="M0 320C30 270 70 230 110 200C125 188 140 180 155 170C158 145 142 120 120 105C98 90 68 85 45 92C62 108 72 130 70 152C50 148 30 155 18 170C8 182 2 200 0 220V320Z" />
        <path d="M40 320C75 250 130 195 190 155C198 125 182 92 155 75C130 60 98 62 75 75C95 90 108 115 105 140C85 142 65 155 52 175C40 210 38 260 40 320Z" />
        <path d="M90 320C125 260 180 215 240 180C255 155 248 120 228 100C205 80 172 82 150 98C168 112 178 135 172 158C145 168 122 190 108 220C96 248 92 282 90 320Z" />
        <path d="M0 260C20 230 50 205 82 192C92 165 80 132 58 118C38 105 15 110 0 125V260Z" />
      </svg>

      {/* Bottom-Right Botanical Silhouette */}
      <svg
        className="absolute -bottom-8 -right-8 w-64 h-64 sm:w-72 sm:h-72 opacity-[0.22] text-[#0A0E14] transition-opacity duration-1000"
        viewBox="0 0 320 320"
        fill="currentColor"
      >
        <path d="M320 320C285 265 240 220 190 190C170 178 150 170 130 162C128 135 146 110 170 95C195 80 228 82 250 95C232 110 222 132 225 155C248 155 270 165 285 182C302 202 314 235 320 270V320Z" />
        <path d="M275 320C240 250 182 195 120 158C110 128 128 95 155 78C182 62 216 65 240 80C218 95 205 120 208 145C230 148 252 162 265 185C278 220 278 270 275 320Z" />
        <path d="M320 240C295 210 260 185 225 172C215 145 228 115 252 100C275 88 300 95 320 110V240Z" />
      </svg>

      {/* Top-Right Soft Botanical Canopy Silhouette */}
      <svg
        className="absolute -top-12 -right-12 w-48 h-48 sm:w-56 sm:h-56 opacity-[0.16] text-[#0B1017] transition-opacity duration-1000"
        viewBox="0 0 240 240"
        fill="currentColor"
      >
        <path d="M240 0C200 15 165 45 140 85C130 102 125 120 122 140C100 135 80 118 72 95C65 72 75 45 95 28C108 48 128 62 152 62C162 40 180 22 205 10C216 5 228 2 240 0Z" />
        <path d="M240 60C210 80 185 110 170 145C158 135 142 120 135 100C130 80 138 60 152 45C170 48 190 40 205 25C218 35 230 48 240 60Z" />
      </svg>

      {/* Subtle Depth Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.8)',
        }}
      />
    </div>
  )
}
