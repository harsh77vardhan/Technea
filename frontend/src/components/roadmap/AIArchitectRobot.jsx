import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AIArchitectRobot Component
 * World-Class AI Product Campaign & Cinematics.
 * 
 * Features:
 * - Pristine cybernetic humanoid architecture with zero cutouts
 * - Organic human face + precision-engineered mechanical chassis
 * - Physically modeled dual-tone cinematic lighting:
 *     * Cerulean Cyan: front of face, eyes, throat, front mechanical collar
 *     * Neon Magenta: back of head, hair edges, lower neck, rim light
 * - Micro-interactive response: console key light softly reflects on her face during input
 * - Natural 7.2s organic breathing physics
 */
export default function AIArchitectRobot({
  isFocused = false,
  isTyping = false,
  isGenerating = false,
  isCompleted = false,
}) {
  const [hasAwakened, setHasAwakened] = useState(false)
  const [showCompletionGlow, setShowCompletionGlow] = useState(false)

  // Calibrated entrance lighting
  useEffect(() => {
    const timer = setTimeout(() => setHasAwakened(true), 150)
    return () => clearTimeout(timer)
  }, [])

  // Controlled completion reflection (<1s natural light shift)
  useEffect(() => {
    let flashTimer
    let rafId
    if (isCompleted) {
      rafId = requestAnimationFrame(() => {
        setShowCompletionGlow(true)
      })
      flashTimer = setTimeout(() => {
        setShowCompletionGlow(false)
      }, 850)
    }
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (flashTimer) clearTimeout(flashTimer)
    }
  }, [isCompleted])

  // Subtle natural posture shift toward user console
  const postureTransform = useMemo(() => {
    if (isGenerating) {
      return {
        rotateY: [0, -1.2, 0.6, 0],
        rotateX: [0, 0.4, -0.4, 0],
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
      }
    }
    if (isFocused || isTyping) {
      return {
        rotateY: -1.5,
        rotateX: 0.3,
        scale: 1.008,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      }
    }
    return {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
    }
  }, [isFocused, isTyping, isGenerating])

  return (
    <div className="relative w-full h-full flex items-end justify-start select-none overflow-hidden pointer-events-none">
      {/* ── Volumetric Dual-Tone Studio Halo (Casting against rear jet-black surface) ── */}
      {/* 1. Magenta Rim Halo (Rear / Left) */}
      <motion.div
        animate={{
          opacity: isGenerating ? [0.25, 0.45, 0.25] : isFocused ? 0.35 : 0.25,
        }}
        transition={{ duration: isGenerating ? 3 : 1.2, repeat: isGenerating ? Infinity : 0, ease: 'easeInOut' }}
        className="absolute top-[35%] left-[18%] -translate-x-1/2 -translate-y-1/2 w-[380px] h-[480px] rounded-full pointer-events-none blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 0, 85, 0.14) 0%, rgba(255, 0, 85, 0.03) 55%, transparent 75%)',
        }}
      />

      {/* 2. Cerulean Cyan Key Light Spill (Front / Right) */}
      <motion.div
        animate={{
          opacity: showCompletionGlow
            ? 0.7
            : isGenerating
            ? [0.35, 0.6, 0.35]
            : isFocused || isTyping
            ? 0.55
            : 0.3,
        }}
        transition={{ duration: isGenerating ? 2.5 : 0.6, repeat: isGenerating ? Infinity : 0, ease: 'easeInOut' }}
        className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[460px] h-[520px] rounded-full pointer-events-none blur-[130px]"
        style={{
          background: showCompletionGlow
            ? 'radial-gradient(circle, rgba(0, 163, 255, 0.22) 0%, rgba(255, 0, 85, 0.1) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(0, 163, 255, 0.16) 0%, rgba(0, 132, 255, 0.04) 55%, transparent 75%)',
        }}
      />

      {/* ── Precision Cybernetic Human with Organic Breathing ── */}
      <motion.div
        animate={{
          y: isGenerating ? [0, -2, 0] : [0, -3.2, 0],
        }}
        transition={{
          duration: isGenerating ? 4 : 7.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-full h-full max-h-[100%] flex items-end justify-start"
        style={{ perspective: 1400 }}
      >
        <motion.div
          animate={postureTransform}
          className="relative w-auto h-full max-h-[96%] flex items-end justify-start"
        >
          {/* ── High-Fidelity Character Render (Pure Black Blending) ── */}
          <motion.img
            src="/images/ai-architect-character.png"
            alt="Technea AI Architect"
            initial={{ opacity: 0 }}
            animate={{
              opacity: hasAwakened ? 1 : 0.3,
            }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-auto max-h-[96vh] object-contain object-bottom-left"
            style={{
              filter: showCompletionGlow
                ? 'contrast(1.06) brightness(1.04) saturate(1.05)'
                : isGenerating
                ? 'contrast(1.05) brightness(1.03) saturate(1.03)'
                : isFocused || isTyping
                ? 'contrast(1.04) brightness(1.02) saturate(1.02)'
                : 'contrast(1.03) brightness(1.01) saturate(1.01)',
              transition: 'filter 0.5s ease',
            }}
          />

          {/* ── Dual-Tone Cinematic Lighting Layers (Emitted Light Physics) ── */}

          {/* 1. Cyan Light: Front of Face, Eyes, Throat Area, Front Mechanical Details */}
          <motion.div
            animate={{
              opacity: showCompletionGlow
                ? 0.75
                : isGenerating
                ? [0.35, 0.65, 0.35]
                : isFocused || isTyping
                ? 0.6
                : 0.35,
            }}
            transition={{ duration: isGenerating ? 2.5 : 0.5, repeat: isGenerating ? Infinity : 0, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 45% 36% at 75% 30%, rgba(0, 163, 255, 0.28) 0%, rgba(0, 132, 255, 0.1) 40%, transparent 68%), radial-gradient(ellipse 35% 26% at 66% 45%, rgba(0, 163, 255, 0.22) 0%, transparent 58%)',
              mixBlendMode: 'screen',
            }}
          />

          {/* 2. Magenta Light: Back of Head, Hair Edges, Lower Neck, Silhouette Rim */}
          <motion.div
            animate={{
              opacity: isGenerating ? [0.3, 0.5, 0.3] : 0.35,
            }}
            transition={{ duration: 3, repeat: isGenerating ? Infinity : 0, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 36% 30% at 20% 24%, rgba(255, 0, 85, 0.26) 0%, rgba(255, 0, 85, 0.08) 45%, transparent 70%), radial-gradient(ellipse 26% 36% at 24% 60%, rgba(255, 0, 85, 0.22) 0%, transparent 55%)',
              mixBlendMode: 'screen',
            }}
          />

          {/* ── Optical Specular Sheen on Completion ── */}
          <AnimatePresence>
            {showCompletionGlow && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 65% 30%, rgba(0, 163, 255, 0.3) 0%, rgba(255, 0, 85, 0.15) 40%, transparent 65%)',
                  mixBlendMode: 'screen',
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
