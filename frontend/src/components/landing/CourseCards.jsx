import { useState, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Creative Agency Spatial Course Showcase
// Inspired by Cactus Digital (cactus.is), Apple Vision Pro, Locomotive.
// Suspended architectural glass panels floating in an asymmetric spatial
// composition with large abstract floating image planes and slow parallax.
// ─────────────────────────────────────────────────────────────────────────────

const COURSES = [
  {
    number: '01',
    category: 'AI & Machine Learning',
    title: 'Prompt Engineering',
    description: 'Learn how AI actually works and build useful prompts with confidence.',
    meta: 'Beginner · 3 weeks',
    baseTilt: { rx: 2.2, ry: -2.0, rz: -1.2 },
    depthFactor: 1.2,
  },
  {
    number: '02',
    category: 'Core Programming',
    title: 'Python for Beginners',
    description: 'Write real, readable code from scratch and build programming logic without the confusion.',
    meta: 'Beginner · 4 weeks',
    baseTilt: { rx: 1.8, ry: 2.8, rz: 1.4 },
    depthFactor: 1.4,
  },
  {
    number: '03',
    category: 'Web Development',
    title: 'Modern Web & React',
    description: 'Understand how the web is built and create clean, interactive interfaces component by component.',
    meta: 'Beginner · 5 weeks',
    baseTilt: { rx: -1.6, ry: -2.8, rz: -1.5 },
    depthFactor: 1.1,
  },
  {
    number: '04',
    category: 'Data & Automation',
    title: 'Data & Automation',
    description: 'Make sense of raw data, spot meaningful patterns, and automate repetitive everyday tasks.',
    meta: 'Beginner · 3 weeks',
    baseTilt: { rx: -2.0, ry: 2.0, rz: 0.9 },
    depthFactor: 1.3,
  },
]

// ── Dark 3D Spatial Planes ──────────────────────────────────────────────────
// Creative studio spatial planes: monochromatic architectural surfaces
// suspended in 3D depth with gentle blur, low opacity, and soft shadow.
const SPATIAL_PLANES = [
  {
    id: 'plane-1',
    className: 'top-[-2%] -left-8 sm:left-[1%] lg:left-[3%] w-[340px] sm:w-[420px] lg:w-[480px] h-[420px] sm:h-[500px] lg:h-[580px]',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    depth: 0.038,
    baseTilt: 'rotate(-5deg) translateZ(-95px)',
    phase: 0,
    speed: 0.35,
  },
  {
    id: 'plane-2',
    className: 'top-[2%] -right-10 sm:right-[0%] lg:right-[2%] w-[360px] sm:w-[440px] lg:w-[500px] h-[340px] sm:h-[400px] lg:h-[460px]',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    depth: 0.055,
    baseTilt: 'rotate(4deg) translateZ(-135px)',
    phase: 2.1,
    speed: 0.28,
  },
  {
    id: 'plane-3',
    className: 'top-[24%] left-[22%] lg:left-[28%] w-[300px] sm:w-[380px] lg:w-[440px] h-[380px] sm:h-[460px] lg:h-[520px]',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    depth: 0.024,
    baseTilt: 'rotate(-2deg) translateZ(-160px)',
    phase: 4.3,
    speed: 0.32,
  },
  {
    id: 'plane-4',
    className: 'top-[48%] -left-12 sm:left-[-2%] lg:left-[0%] w-[340px] sm:w-[420px] lg:w-[480px] h-[400px] sm:h-[480px] lg:h-[540px]',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
    depth: 0.046,
    baseTilt: 'rotate(3.5deg) translateZ(-105px)',
    phase: 1.4,
    speed: 0.3,
  },
  {
    id: 'plane-5',
    className: 'top-[44%] -right-12 sm:right-[-1%] lg:right-[1%] w-[340px] sm:w-[430px] lg:w-[490px] h-[380px] sm:h-[460px] lg:h-[520px]',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    depth: 0.052,
    baseTilt: 'rotate(-3.5deg) translateZ(-120px)',
    phase: 3.6,
    speed: 0.34,
  },
  {
    id: 'plane-6',
    className: 'bottom-[-2%] left-[16%] lg:left-[20%] w-[360px] sm:w-[460px] lg:w-[540px] h-[280px] sm:h-[340px] lg:h-[400px]',
    image: 'https://images.unsplash.com/photo-1492551557933-34265f7af79e?auto=format&fit=crop&w=1000&q=80',
    depth: 0.032,
    baseTilt: 'rotate(2deg) translateZ(-85px)',
    phase: 5.2,
    speed: 0.26,
  },
]

// ── Blurry Glass Geometric Shapes ───────────────────────────────────────────
// Suspended translucent frosted dark-glass shapes adding spatial studio depth
const GLASS_SHAPES = [
  {
    id: 'glass-1',
    className: 'top-[8%] right-[8%] lg:right-[14%] w-[190px] sm:w-[250px] h-[140px] sm:h-[180px] rounded-3xl',
    depth: 0.042,
    baseTilt: 'rotate(-8deg) translateZ(-110px)',
    phase: 1.5,
    speed: 0.26,
  },
  {
    id: 'glass-2',
    className: 'top-[36%] left-[-2%] sm:left-[2%] lg:left-[4%] w-[170px] sm:w-[210px] h-[220px] sm:h-[280px] rounded-2xl',
    depth: 0.036,
    baseTilt: 'rotate(6deg) translateZ(-130px)',
    phase: 3.4,
    speed: 0.22,
  },
  {
    id: 'glass-3',
    className: 'top-[42%] left-[40%] lg:left-[44%] w-[200px] sm:w-[260px] h-[120px] sm:h-[150px] rounded-full',
    depth: 0.022,
    baseTilt: 'rotate(-4deg) translateZ(-170px)',
    phase: 4.8,
    speed: 0.29,
  },
  {
    id: 'glass-4',
    className: 'bottom-[4%] right-[4%] lg:right-[9%] w-[210px] sm:w-[270px] h-[150px] sm:h-[190px] rounded-3xl',
    depth: 0.048,
    baseTilt: 'rotate(5deg) translateZ(-95px)',
    phase: 2.7,
    speed: 0.31,
  },
]

// ── Minimal Floating Studio Particles ───────────────────────────────────────
// Subtle silver/white spatial dust motes suspended in 3D depth
const STUDIO_PARTICLES = [
  { id: 'p1', left: '12%', top: '14%', size: 2, depth: 0.045, speed: 0.28, phase: 0.5, baseOpacity: 0.25 },
  { id: 'p2', left: '26%', top: '28%', size: 1.5, depth: 0.03, speed: 0.22, phase: 1.9, baseOpacity: 0.18 },
  { id: 'p3', left: '42%', top: '10%', size: 2.5, depth: 0.05, speed: 0.34, phase: 3.2, baseOpacity: 0.3 },
  { id: 'p4', left: '68%', top: '18%', size: 1.5, depth: 0.025, speed: 0.25, phase: 4.1, baseOpacity: 0.2 },
  { id: 'p5', left: '84%', top: '24%', size: 2, depth: 0.04, speed: 0.31, phase: 2.4, baseOpacity: 0.28 },
  { id: 'p6', left: '8%', top: '48%', size: 2, depth: 0.055, speed: 0.27, phase: 5.0, baseOpacity: 0.22 },
  { id: 'p7', left: '22%', top: '62%', size: 1.5, depth: 0.035, speed: 0.33, phase: 0.8, baseOpacity: 0.2 },
  { id: 'p8', left: '48%', top: '52%', size: 2.5, depth: 0.02, speed: 0.2, phase: 2.2, baseOpacity: 0.24 },
  { id: 'p9', left: '76%', top: '58%', size: 2, depth: 0.048, speed: 0.3, phase: 3.8, baseOpacity: 0.26 },
  { id: 'p10', left: '92%', top: '50%', size: 1.5, depth: 0.03, speed: 0.24, phase: 1.3, baseOpacity: 0.18 },
  { id: 'p11', left: '18%', top: '82%', size: 2, depth: 0.042, speed: 0.32, phase: 4.6, baseOpacity: 0.22 },
  { id: 'p12', left: '38%', top: '88%', size: 1.5, depth: 0.028, speed: 0.26, phase: 2.9, baseOpacity: 0.19 },
  { id: 'p13', left: '64%', top: '80%', size: 2.5, depth: 0.052, speed: 0.35, phase: 0.3, baseOpacity: 0.28 },
  { id: 'p14', left: '82%', top: '86%', size: 2, depth: 0.038, speed: 0.29, phase: 5.4, baseOpacity: 0.24 },
]

export default function CourseCards() {
  const containerRef = useRef(null)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0, t: 0 })

  // ── Physics-damped Mouse Parallax & Continuous Floating Loop ───────────────
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
      currentX += (targetX - currentX) * 0.045
      currentY += (targetY - currentY) * 0.045
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

  return (
    <div
      ref={containerRef}
      className="relative w-full py-6 lg:py-10 [perspective:1400px] select-none"
    >
      {/* ── 3D Spatial Background: Dark Studio Environment Elements ─────────── */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden [transform-style:preserve-3d]"
        aria-hidden="true"
      >
        {/* 1. Dark 3D Architectural Spatial Planes */}
        {SPATIAL_PLANES.map((plane) => {
          const shiftX = parallax.x * plane.depth * 45
          const floatY = Math.sin(parallax.t * plane.speed + plane.phase) * 10
          const floatRot = Math.cos(parallax.t * plane.speed * 0.8 + plane.phase) * 0.4
          const shiftY = parallax.y * plane.depth * 38 + floatY

          return (
            <div
              key={plane.id}
              className={`absolute rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_28px_70px_rgba(0,0,0,0.75)] bg-[#070707] will-change-transform ${plane.className}`}
              style={{
                transform: `${plane.baseTilt} translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0px) rotate(${floatRot.toFixed(2)}deg)`,
              }}
            >
              <img
                src={plane.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover grayscale contrast-[1.1] brightness-[0.45] blur-[1px] opacity-[0.22] select-none pointer-events-none"
              />
              {/* Monochromatic Dark Studio Glaze */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/[0.05] pointer-events-none"
              />
              {/* Hairline Specular Top Highlight */}
              <div
                className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
              />
            </div>
          )
        })}

        {/* 2. Blurry Glass Geometric Shapes (Apple Vision Pro spatial depth) */}
        {GLASS_SHAPES.map((shape) => {
          const shiftX = parallax.x * shape.depth * 42
          const floatY = Math.sin(parallax.t * shape.speed + shape.phase) * 8
          const floatRot = Math.cos(parallax.t * shape.speed * 0.8 + shape.phase) * 0.35
          const shiftY = parallax.y * shape.depth * 36 + floatY

          return (
            <div
              key={shape.id}
              className={`absolute overflow-hidden border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md bg-white/[0.02] will-change-transform ${shape.className}`}
              style={{
                transform: `${shape.baseTilt} translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0px) rotate(${floatRot.toFixed(2)}deg)`,
              }}
            >
              {/* Diagonal subtle specular reflection streak */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-white/[0.01] pointer-events-none"
              />
              <div
                className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              />
            </div>
          )
        })}

        {/* 3. Minimal Floating Studio Particles */}
        {STUDIO_PARTICLES.map((p) => {
          const shiftX = parallax.x * p.depth * 50
          const floatY = Math.sin(parallax.t * p.speed + p.phase) * 7
          const shiftY = parallax.y * p.depth * 40 + floatY
          const dynamicOpacity = p.baseOpacity + Math.sin(parallax.t * p.speed * 0.9 + p.phase) * 0.05

          return (
            <div
              key={p.id}
              className="absolute rounded-full bg-white will-change-transform pointer-events-none"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: dynamicOpacity.toFixed(3),
                boxShadow: '0 0 5px rgba(255, 255, 255, 0.65)',
                transform: `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0px)`,
              }}
            />
          )
        })}

        {/* 4. Soft Ambient Studio Lighting Variations */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% 42%, rgba(255, 255, 255, 0.035) 0%, rgba(200, 200, 200, 0.01) 50%, transparent 80%)',
          }}
        />

        {/* 5. Soft Specular Studio Reflection Stream */}
        <div
          className="absolute -top-[15%] left-[22%] w-[580px] h-[900px] pointer-events-none rotate-[28deg] opacity-[0.03] bg-gradient-to-b from-white via-white/30 to-transparent blur-3xl select-none"
        />
      </div>

      {/* ── Asymmetric Artistic Composition ──────────────────────────────────── */}
      {/*
              [Card 01]
          [Card 02]      [Card 03]
              [Card 04]
      */}
      <div className="relative z-10 mx-auto max-w-6xl space-y-8 sm:space-y-10 lg:space-y-0">

        {/* ── Tier 1: Card 01 (Prompt Engineering) — Top, subtle left offset ── */}
        <div className="w-full flex justify-center lg:justify-start lg:pl-[14%]">
          {renderCard(0)}
        </div>

        {/* ── Tier 2: Card 02 (Left) & Card 03 (Right) — Asymmetric flanks ──── */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 lg:gap-12 lg:-mt-10">
          {/* Card 02 (Python) — Left flank, staggered */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-start lg:pl-[2%] lg:pt-8">
            {renderCard(1)}
          </div>

          {/* Card 03 (React) — Right flank, vertically offset higher */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-end lg:pr-[2%] lg:-pt-4">
            {renderCard(2)}
          </div>
        </div>

        {/* ── Tier 3: Card 04 (Data) — Bottom, subtle right offset ──────────── */}
        <div className="w-full flex justify-center lg:justify-end lg:pr-[15%] lg:-mt-10">
          {renderCard(3)}
        </div>

      </div>
    </div>
  )

  // ── Render Individual Glass Panel ──────────────────────────────────────────
  function renderCard(idx) {
    const course = COURSES[idx]
    const isHovered = hoveredIdx === idx

    // Subtle 3D mouse parallax transform on cards
    const dynamicRx = course.baseTilt.rx - parallax.y * 1.4 * course.depthFactor
    const dynamicRy = course.baseTilt.ry + parallax.x * 1.6 * course.depthFactor
    const dynamicRz = course.baseTilt.rz
    const dynamicTx = parallax.x * 6 * course.depthFactor
    const dynamicTy = parallax.y * 5 * course.depthFactor

    const transformStyle = isHovered
      ? 'perspective(1200px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(0px, -5px, 20px)'
      : `perspective(1200px) rotateX(${dynamicRx.toFixed(2)}deg) rotateY(${dynamicRy.toFixed(2)}deg) rotateZ(${dynamicRz.toFixed(2)}deg) translate3d(${dynamicTx.toFixed(1)}px, ${dynamicTy.toFixed(1)}px, 0px)`

    return (
      <a
        key={course.number}
        href="#hero-search"
        onMouseEnter={() => setHoveredIdx(idx)}
        onMouseLeave={() => setHoveredIdx(null)}
        className="group relative flex w-full max-w-[440px] sm:max-w-[460px] flex-col justify-between p-8 sm:p-9 lg:p-10 text-left cursor-pointer select-none [transform-style:preserve-3d]"
        style={{
          borderRadius: '18px',
          backgroundColor: isHovered
            ? 'rgba(255, 255, 255, 0.94)'
            : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: isHovered
            ? '1px solid rgba(255, 255, 255, 0.55)'
            : '1px solid rgba(255, 255, 255, 0.32)',
          boxShadow: isHovered
            ? '0 24px 50px -10px rgba(0, 0, 0, 0.75), 0 0 32px rgba(255, 255, 255, 0.09), inset 0 1px 0 0 rgba(255, 255, 255, 1.0), inset 0 0 0 1px rgba(255, 255, 255, 0.65)'
            : '0 14px 38px -10px rgba(0, 0, 0, 0.65), 0 0 20px rgba(255, 255, 255, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.95), inset 0 0 0 1px rgba(255, 255, 255, 0.45)',
          transform: transformStyle,
          willChange: 'transform, box-shadow, border-color, background-color',
          transition:
            'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease, border-color 0.45s ease, background-color 0.45s ease',
        }}
      >
        {/* ── Realistic Architectural Glass Reflections ──────────────────────── */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 ease-out"
          style={{
            borderRadius: '18px',
            opacity: isHovered ? 0.95 : 0.65,
          }}
          aria-hidden="true"
        >
          {/* Diagonal Ambient Light Streak */}
          <div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
            style={{
              background:
                'linear-gradient(132deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 24%, transparent 48%)',
            }}
          />
          {/* Beveled Top-Edge Light Catch */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 4%, rgba(255, 255, 255, 0.95) 20%, rgba(255, 255, 255, 0.95) 80%, transparent 96%)',
            }}
          />
        </div>

        {/* ── Card Header: Category & Number ─────────────────────────────────── */}
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              {course.category}
            </span>
            <span className="font-mono text-[11px] font-light tracking-widest text-neutral-400">
              {course.number}
            </span>
          </div>

          {/* ── Main Typography: Bold Title + Human Description ──────────────── */}
          <h3 className="mt-5 text-2xl sm:text-[27px] font-bold tracking-tight text-neutral-950 leading-[1.18]">
            {course.title}
          </h3>

          <p className="mt-3.5 text-sm sm:text-[15px] font-normal leading-relaxed text-neutral-500">
            {course.description}
          </p>
        </div>

        {/* ── Card Footer: Minimal Metadata + Clean Arrow ────────────────────── */}
        <div className="relative z-10 mt-12 sm:mt-14 flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="font-mono text-[11px] font-normal uppercase tracking-wider text-neutral-400">
            {course.meta}
          </span>
          <span
            className="text-base text-neutral-950 font-light transition-transform duration-300 group-hover:translate-x-1.5 select-none"
            aria-hidden="true"
          >
            &rarr;
          </span>
        </div>
      </a>
    )
  }
}
