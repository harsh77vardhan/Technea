import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import FOG from 'vanta/dist/vanta.fog.min'

// Ensure Three.js is bound globally to window for Vanta plugins
if (typeof window !== 'undefined') {
  window.THREE = THREE
}

// Resolve the Vanta FOG factory once at module scope
const fogFactory =
  typeof FOG === 'function'
    ? FOG
    : FOG?.default || (typeof window !== 'undefined' && window.VANTA?.FOG)

/**
 * Check whether WebGL rendering context is supported in the current browser.
 * @returns {boolean}
 */
function isWebGLAvailable() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Check whether the user has requested reduced motion in their OS / browser preferences.
 * @returns {boolean}
 */
function checkPrefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Detect whether current client is a touch or mobile device.
 * Used to disable pointer controls on mobile to prevent gesture interception,
 * eliminate touch event thrashing, and ensure silky smooth scrolling.
 * @returns {boolean}
 */
function isMobileOrTouchDevice() {
  if (typeof window === 'undefined') return false
  return Boolean(
    'ontouchstart' in window ||
      (navigator?.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      window.innerWidth < 768
  )
}

/**
 * Top-Left: Hairline technical chevrons & precision coordinate crosshair
 */
function TechnicalCornerTopLeft() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      className="pointer-events-none absolute top-0 left-0 opacity-[0.22] select-none"
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
  )
}

/**
 * Top-Right: Hairline dot matrix (6x6) & technical corner bracket
 */
function TechnicalCornerTopRight() {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      className="pointer-events-none absolute top-2 right-2 opacity-[0.25] select-none"
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
  )
}

/**
 * Bottom-Left: Diagonal technical hatch lines & corner bracket
 */
function TechnicalCornerBottomLeft() {
  return (
    <svg
      width="180"
      height="150"
      viewBox="0 0 180 150"
      fill="none"
      className="pointer-events-none absolute bottom-0 left-0 opacity-[0.20] select-none"
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
  )
}

/**
 * Bottom-Right: Technical right-pointing chevrons & corner bracket
 */
function TechnicalCornerBottomRight() {
  return (
    <svg
      width="160"
      height="130"
      viewBox="0 0 160 130"
      fill="none"
      className="pointer-events-none absolute bottom-0 right-0 opacity-[0.22] select-none"
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
  )
}

/**
 * VantaAtmosphere
 *
 * High-end 3D Vanta background component engineered for the Technea Learning Dashboard:
 * - Effect: Vanta FOG (Three.js WebGL fluid shader mist)
 * - Aesthetic Target: Apple Vision Pro + Interstellar + Luxury AI OS + Deep Black Futuristic OS
 * - Palette: True Black (#050505), Obsidian Navy (#080c16), Slate-900 mist (#0f172a), Slate-800 glow (#1e293b)
 * - Precision Technical Layering:
 *   - Hairline dot matrix (radial-gradient 24px x 24px)
 *   - Slate technical coordinate corner brackets (chevrons, 6x6 dot grid, diagonal hatch)
 *   - Deep atmospheric vignette (box-shadow inset 140px)
 * - Robust Fallback & Reduced Motion:
 *   - Prefers-reduced-motion detection skips WebGL animation loop and displays high-contrast static gradient.
 *   - Automatic graceful fallback if WebGL is unavailable or initialization fails.
 * - Mobile GPU optimized: scale 1.0 on desktop, scaleMobile 3.0 on mobile devices.
 * - Pointer Control Optimization: mouseControls disabled on touch/mobile screens to prevent gesture interception.
 * - Tab Visibility Throttling: cancels animation loop on background tabs (0% GPU/CPU), resumes smoothly on tab focus.
 * - WebGL Memory & Context Safety: forces WebGL context release and renderer disposal on modal close to eliminate leaks.
 */
export function VantaAtmosphere({
  className = '',
  children,
  speed = 0.60,
  blurFactor = 0.70,
  zoom = 0.85,
  scale = 1.0,
  scaleMobile = 3.0,
  ...restProps
}) {
  const vantaMountRef = useRef(null)
  const vantaEffectRef = useRef(null)

  // Track reduced motion state dynamically from browser media query
  const [reducedMotion, setReducedMotion] = useState(() => checkPrefersReducedMotion())
  // Track any runtime initialization failure
  const [runtimeError, setRuntimeError] = useState(false)

  // Static capability flag
  const isSupported = typeof fogFactory === 'function' && isWebGLAvailable()
  const shouldFallback = reducedMotion || !isSupported || runtimeError

  // Listen to prefers-reduced-motion media query changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMediaChange = (event) => {
      setReducedMotion(event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange)
      }
    }
  }, [])

  // Initialize and manage Vanta FOG lifecycle with complete resource cleanup
  useEffect(() => {
    const mountEl = vantaMountRef.current

    // Helper: Safely tear down and release WebGL resources
    const disposeVantaInstance = () => {
      const instance = vantaEffectRef.current
      if (!instance) return

      // 1. Cancel requestAnimationFrame immediately to stop loop
      if (instance.req) {
        window.cancelAnimationFrame(instance.req)
        instance.req = null
      }

      // 2. Safely capture references to renderer and canvas
      const renderer = instance.renderer
      const canvas = renderer?.domElement || (mountEl ? mountEl.querySelector('canvas') : null)

      // 3. Destroy Vanta instance (removes window listeners, clears scene geometries/materials)
      try {
        instance.destroy()
      } catch {
        // Ignore harmless race conditions during unmount
      }

      // 4. Force WebGL context release and dispose renderer to prevent context accumulation
      if (renderer) {
        try {
          if (typeof renderer.dispose === 'function') {
            renderer.dispose()
          }
          if (typeof renderer.forceContextLoss === 'function') {
            renderer.forceContextLoss()
          }
        } catch {
          // Ignore context disposal errors
        }
      }

      // 5. Remove canvas element if still in DOM
      if (canvas && canvas.parentNode) {
        try {
          canvas.parentNode.removeChild(canvas)
        } catch {
          // Ignore DOM removal errors
        }
      }

      // 6. Double-check no leftover canvases remain in mountEl
      if (mountEl) {
        const leftoverCanvases = mountEl.querySelectorAll('canvas, .vanta-canvas')
        leftoverCanvases.forEach((c) => c.remove())
      }

      vantaEffectRef.current = null
    }

    if (shouldFallback) {
      disposeVantaInstance()
      return
    }

    if (!mountEl) return

    // Guard against duplicate instances or canvases under React StrictMode double invocation
    disposeVantaInstance()

    // Clean any leftover canvas elements inside mountEl before mounting
    const existingCanvases = mountEl.querySelectorAll('canvas, .vanta-canvas')
    existingCanvases.forEach((canvas) => canvas.remove())

    let contextLostHandler = null

    try {
      // Ensure window.THREE is available for Vanta internals
      if (typeof window !== 'undefined') {
        window.THREE = THREE
      }

      const isMobileTouch = isMobileOrTouchDevice()

      const instance = fogFactory({
        el: mountEl,
        THREE: THREE,
        mouseControls: !isMobileTouch,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: scale,
        scaleMobile: scaleMobile,
        baseColor: 0x050505,
        lowlightColor: 0x080c16,
        midtoneColor: 0x0f172a,
        highlightColor: 0x1e293b,
        blurFactor: blurFactor,
        speed: speed,
        zoom: zoom,
      })

      vantaEffectRef.current = instance

      if (instance?.renderer?.domElement) {
        const canvas = instance.renderer.domElement
        canvas.style.pointerEvents = 'none'

        // Register clean handler for WebGL context loss to prevent uncaught browser exceptions
        contextLostHandler = (e) => {
          e.preventDefault()
          console.info('[VantaAtmosphere] WebGL context loss event handled cleanly.')
        }
        canvas.addEventListener('webglcontextlost', contextLostHandler, false)
      }
    } catch (err) {
      console.warn('[VantaAtmosphere] WebGL initialization encountered an error:', err)
      setTimeout(() => {
        setRuntimeError(true)
      }, 0)
    }

    // Tab Visibility Throttling: Pause render loop when tab is hidden, resume when focused
    const handleVisibilityChange = () => {
      const effect = vantaEffectRef.current
      if (!effect) return

      if (document.hidden) {
        // Tab backgrounded: Cancel RAF loop to drop CPU/GPU usage to 0%
        if (effect.req) {
          window.cancelAnimationFrame(effect.req)
          effect.req = null
        }
      } else {
        // Tab foregrounded: Resume animation loop cleanly if not already running
        if (!effect.req && typeof effect.animationLoop === 'function') {
          if (typeof effect.resize === 'function') {
            try {
              effect.resize()
            } catch {
              // Ignore resize race condition
            }
          }
          try {
            effect.req = window.requestAnimationFrame(effect.animationLoop)
          } catch (e) {
            console.warn('[VantaAtmosphere] Failed to resume animation loop:', e)
          }
        }
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Keep WebGL canvas dimensions synchronized on container resize (e.g. modal transitions)
    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined' && mountEl) {
      resizeObserver = new ResizeObserver(() => {
        if (vantaEffectRef.current && typeof vantaEffectRef.current.resize === 'function') {
          try {
            vantaEffectRef.current.resize()
          } catch {
            // Ignore potential teardown resize races
          }
        }
      })
      resizeObserver.observe(mountEl)
      if (mountEl.parentElement) {
        resizeObserver.observe(mountEl.parentElement)
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      if (contextLostHandler && vantaEffectRef.current?.renderer?.domElement) {
        try {
          vantaEffectRef.current.renderer.domElement.removeEventListener(
            'webglcontextlost',
            contextLostHandler
          )
        } catch {
          // ignore
        }
      }
      disposeVantaInstance()
    }
  }, [shouldFallback, speed, blurFactor, zoom, scale, scaleMobile])

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#050505] ${className}`}
      aria-hidden={!children}
      {...restProps}
    >
      {/* 1. Dynamic WebGL Vanta Canvas Mount */}
      {!shouldFallback && (
        <div
          ref={vantaMountRef}
          className="absolute inset-0 w-full h-full overflow-hidden"
          aria-hidden="true"
        />
      )}

      {/* 2. Static High-Contrast Fallback Gradient (Reduced Motion or WebGL Unavailable) */}
      {shouldFallback && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: '#050505',
            backgroundImage: `
              radial-gradient(ellipse 75% 55% at 50% 20%, rgba(30, 41, 59, 0.45) 0%, transparent 70%),
              radial-gradient(ellipse 65% 50% at 85% 75%, rgba(15, 23, 42, 0.55) 0%, transparent 65%),
              radial-gradient(ellipse 70% 60% at 15% 80%, rgba(8, 12, 22, 0.80) 0%, transparent 70%)
            `,
          }}
          aria-hidden="true"
        />
      )}

      {/* 3. Precision Technical Layer: Subtle Hairline Dot Matrix (24px x 24px) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* 4. Precision Technical Layer: Slate Coordinate Corner Brackets */}
      <TechnicalCornerTopLeft />
      <TechnicalCornerTopRight />
      <TechnicalCornerBottomLeft />
      <TechnicalCornerBottomRight />

      {/* 5. Precision Technical Layer: Depth Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 140px rgba(0, 0, 0, 0.85)',
        }}
        aria-hidden="true"
      />

      {/* Optional Foreground Content */}
      {children && (
        <div className="relative z-10 w-full h-full pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  )
}

export default VantaAtmosphere
