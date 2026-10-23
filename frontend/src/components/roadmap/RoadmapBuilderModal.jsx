import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
  generateRoadmapApi,
  saveRoadmapApi,
  toggleRoadmapMilestoneApi,
} from '../../services/api'
import AIArchitectRobot from './AIArchitectRobot'
import RoadmapHUDFrame from './RoadmapHUDFrame'
import CinematicBackground from './CinematicBackground'
import AIArchitectConversation from './AIArchitectConversation'
import RoadmapGenerationScreen from './RoadmapGenerationScreen'
import RoadmapTimelineView from './RoadmapTimelineView'

const SEARCH_EXAMPLES = [
  'AI Engineer',
  'Cybersecurity',
  'Cloud Architect',
  'Full Stack Developer',
  'Machine Learning',
  'Data Scientist',
]

export default function RoadmapBuilderModal({
  isOpen,
  onClose,
  initialGoal = '',
}) {
  const { user } = useAuth()

  // Stages: 'initial' (Reference Screen) | 'conversation' (AI Onboarding) | 'generating' (Thinking Screen) | 'view' (Roadmap View)
  const [stage, setStage] = useState(() => (initialGoal ? 'conversation' : 'initial'))
  const [goal, setGoal] = useState(() => initialGoal || '')
  const [prevGoalProp, setPrevGoalProp] = useState(initialGoal)

  // Robot micro-interaction states
  const [isFocused, setIsFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Rotating placeholder in search hero
  const [exampleIdx, setExampleIdx] = useState(0)

  // Generation data & UI state
  const [generatedData, setGeneratedData] = useState(null)
  const [savedRoadmapId, setSavedRoadmapId] = useState(null)
  const [completedMilestones, setCompletedMilestones] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [error, setError] = useState(null)

  const typingTimeoutRef = useRef(null)
  const toastTimeoutRef = useRef(null)
  const searchInputRef = useRef(null)

  // Handle prop updates
  if (initialGoal !== prevGoalProp) {
    setPrevGoalProp(initialGoal)
    if (initialGoal) {
      setGoal(initialGoal)
      setStage('conversation')
    }
  }

  // Rotate placeholder examples periodically in initial stage
  useEffect(() => {
    if (stage !== 'initial') return
    const interval = setInterval(() => {
      setExampleIdx((prev) => (prev + 1) % SEARCH_EXAMPLES.length)
    }, 3600)
    return () => clearInterval(interval)
  }, [stage])

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Clean up timers
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Handle typing detection for robot micro-interactions
  const handleInputChange = (e) => {
    setGoal(e.target.value)
    setIsTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 450)
  }

  // Submit search query -> open natural AI conversation
  const handleSubmitSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const cleanGoal = (goal || '').trim() || SEARCH_EXAMPLES[exampleIdx]
    setGoal(cleanGoal)
    setIsFocused(false)
    setIsTyping(false)
    setStage('conversation')
  }

  // Triggered when all 4 questions in conversation are answered
  const handleStartSynthesis = async (onboardingPayload) => {
    setError(null)
    setStage('generating')
    setIsGenerating(true)
    setIsCompleted(false)

    try {
      const response = await generateRoadmapApi({
        goal: onboardingPayload.goal || goal,
        experience_level: onboardingPayload.experience_level || 'Beginner',
        current_level: onboardingPayload.current_level || 'basic_knowledge',
        available_time: onboardingPayload.available_time || '1_hour',
        main_goal: onboardingPayload.main_goal || 'get_job',
        preferred_style: onboardingPayload.preferred_style || 'projects',
      })

      setGeneratedData(response)
      setSavedRoadmapId(null)
      setCompletedMilestones([])
    } catch (err) {
      console.error('Failed to generate roadmap:', err)
      setError(err.message || 'Unable to generate roadmap. Please try again.')
      setIsGenerating(false)
      setStage('conversation')
    }
  }

  // Called when RoadmapGenerationScreen finishes its sequence
  const handleGenerationAnimationComplete = () => {
    setIsGenerating(false)
    setIsCompleted(true)
    setStage('view')
  }

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneId) => {
    const isAlreadyDone = completedMilestones.includes(milestoneId)
    const nextCompleted = isAlreadyDone
      ? completedMilestones.filter((id) => id !== milestoneId)
      : [...completedMilestones, milestoneId]

    setCompletedMilestones(nextCompleted)

    if (savedRoadmapId && user) {
      try {
        await toggleRoadmapMilestoneApi(savedRoadmapId, {
          milestone_id: milestoneId,
          is_completed: !isAlreadyDone,
        })
      } catch (err) {
        console.warn('Could not sync milestone toggle to server:', err)
      }
    }
  }

  // Save Roadmap
  const handleSaveRoadmap = async () => {
    if (!generatedData) return

    if (!user) {
      try {
        const guestRoadmaps = JSON.parse(
          localStorage.getItem('technea_guest_saved_roadmaps') || '[]'
        )
        const guestItem = {
          id: `guest-${Date.now()}`,
          title: generatedData.title,
          goal: generatedData.goal,
          target_role: generatedData.target_role,
          experience_level: generatedData.experience_level,
          estimated_duration: generatedData.estimated_duration,
          roadmap_data: generatedData.roadmap_data,
          completed_milestone_ids: completedMilestones,
          created_at: new Date().toISOString(),
        }
        guestRoadmaps.unshift(guestItem)
        localStorage.setItem(
          'technea_guest_saved_roadmaps',
          JSON.stringify(guestRoadmaps.slice(0, 10))
        )
        showToast('Saved locally in your browser. Sign in to sync across devices.')
      } catch (e) {
        console.warn('Failed to save roadmap to localStorage:', e)
      }
      return
    }

    setIsSaving(true)
    try {
      const saved = await saveRoadmapApi({
        title: generatedData.title,
        goal: generatedData.goal,
        target_role: generatedData.target_role,
        experience_level: generatedData.experience_level,
        estimated_duration: generatedData.estimated_duration,
        roadmap_data: generatedData.roadmap_data,
      })
      setSavedRoadmapId(saved.id)
      showToast('Roadmap saved to your Technea account.')
    } catch (err) {
      console.error('Failed to save roadmap:', err)
      showToast('Failed to save roadmap. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Share / Copy Link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Roadmap URL copied to clipboard.')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Technea AI Career Roadmap Builder"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 lg:p-7 overflow-hidden select-none"
      >
        {/* ── Optical Studio Backdrop Blur ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-2xl cursor-pointer"
          aria-hidden="true"
        />

        {/* ── Precision Hardware Viewport Bezel (Apple Pro Display / Tesla Aesthetic) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[1536px] h-[92vh] max-h-[960px] rounded-3xl bg-[#000000] border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.95),0_10px_30px_rgba(0,0,0,0.8),0_0_60px_rgba(0,132,255,0.06)] overflow-hidden flex flex-col"
          data-lenis-prevent
          style={{
            boxShadow:
              '0 30px 100px rgba(0, 0, 0, 0.95), 0 10px 30px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* ── OLED Studio Canvas & Lighting ── */}
          <CinematicBackground />

          {/* ── Authentic Telemetry Frame (Corner Glyphs & Brand Marks) ── */}
          <RoadmapHUDFrame onClose={onClose} />

          {/* ── Subtle Toast Notification Pill ── */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/10 bg-[#0c0c0e]/95 backdrop-blur-xl px-5 py-2 text-xs font-mono text-white shadow-2xl flex items-center gap-2.5"
                style={{
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 163, 255, 0.15)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#00A3FF]" />
                <span className="tracking-wide text-neutral-200">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Master Split-Screen Layout ── */}
          <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-between overflow-hidden">
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* LEFT SIDE (≈ 42-45%): PHYSICAL AI ARCHITECT CHARACTER          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[44%] h-[40vh] sm:h-[46vh] lg:h-full flex items-end justify-start relative shrink-0 overflow-hidden pl-2 sm:pl-6 lg:pl-10">
              <AIArchitectRobot
                isFocused={isFocused}
                isTyping={isTyping}
                isGenerating={isGenerating}
                isCompleted={isCompleted}
              />
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* RIGHT SIDE (≈ 55-58%): RESTICK TYPOGRAPHY & PRECISION SEARCH   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[56%] h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8 relative z-10 overflow-y-auto">
              {/* ──── STAGE 1: KEYNOTE HERO SEARCH SCREEN ──── */}
              {stage === 'initial' && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6 max-w-[620px] relative"
                >
                  {/* 3 Machined Status Indicators with Metallic Concentric Bezels */}
                  <div className="absolute -right-8 sm:-right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <span
                        className="h-2 w-2 rounded-full bg-[#FF0055]"
                        style={{ boxShadow: '0 0 8px #FF0055, 0 0 16px rgba(255, 0, 85, 0.4)' }}
                      />
                    </div>
                    <div className="relative flex items-center justify-center">
                      <span
                        className="h-2 w-2 rounded-full bg-[#00A3FF]"
                        style={{ boxShadow: '0 0 8px #00A3FF, 0 0 16px rgba(0, 163, 255, 0.4)' }}
                      />
                    </div>
                    <div className="relative flex items-center justify-center">
                      <span
                        className="h-2 w-2 rounded-full bg-[#00A3FF]"
                        style={{ boxShadow: '0 0 8px #00A3FF, 0 0 16px rgba(0, 163, 255, 0.4)' }}
                      />
                    </div>
                  </div>

                  {/* Top Category Tag */}
                  <div className="space-y-1">
                    <span
                      className="text-xs sm:text-sm font-extrabold tracking-[0.32em] uppercase text-[#00A3FF] block"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        textShadow: '0 0 10px rgba(0, 163, 255, 0.4)',
                      }}
                    >
                      TECHNEA
                    </span>

                    {/* Razor-Sharp Stacked Title (Apple Keynote Clarity & Wide Engineering Stance) */}
                    <div className="space-y-0.5 select-none pt-1 pb-1">
                      <h1
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black uppercase tracking-[0.03em] leading-[0.92] text-[#00A3FF]"
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          textShadow:
                            '0 0 14px rgba(0, 163, 255, 0.45), 0 0 30px rgba(0, 163, 255, 0.15)',
                        }}
                      >
                        ROADMAP
                      </h1>

                      <h1
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black uppercase tracking-[0.03em] leading-[0.92] text-[#FF0055]"
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          textShadow:
                            '0 0 14px rgba(255, 0, 85, 0.45), 0 0 30px rgba(255, 0, 85, 0.15)',
                        }}
                      >
                        BUILDER
                      </h1>
                    </div>
                  </div>

                  {/* Subtitle Strip with Precision Divider and Minimal Directional Indicator */}
                  <div className="flex items-center gap-3 pt-1">
                    <span
                      className="text-[10px] sm:text-xs font-mono font-semibold tracking-[0.26em] uppercase text-[#FF0055] shrink-0"
                      style={{ textShadow: '0 0 8px rgba(255, 0, 85, 0.4)' }}
                    >
                      AI AUTONOMOUS ENGINE
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#FF0055]/40 via-[#FF0055]/15 to-transparent" />
                    <span
                      className="font-mono text-[10px] sm:text-xs font-black italic tracking-[0.18em] text-[#FF0055] shrink-0"
                      style={{ textShadow: '0 0 8px rgba(255, 0, 85, 0.5)' }}
                    >
                      ///
                    </span>
                  </div>

                  {/* ── Machined Obsidian Glass Search Console ── */}
                  <form onSubmit={handleSubmitSearch} className="pt-3">
                    <div
                      className={`relative rounded-2xl border transition-all duration-300 ${
                        isFocused
                          ? 'border-[#00A3FF]/60 bg-[#06070a]/95 shadow-[0_0_30px_rgba(0,163,255,0.18),0_15px_40px_rgba(0,0,0,0.9)]'
                          : 'border-white/[0.09] hover:border-white/[0.2] bg-[#060709]/85 shadow-[0_10px_30px_rgba(0,0,0,0.7)]'
                      }`}
                      style={{
                        boxShadow: isFocused
                          ? 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 30px rgba(0, 163, 255, 0.18), 0 15px 40px rgba(0, 0, 0, 0.9)'
                          : 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 10px 30px rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      <div className="relative flex items-center px-4 py-3 sm:py-3.5 gap-3">
                        {/* Subtle Cyan Pulse Telemetry Dot */}
                        <div className="flex items-center justify-center shrink-0 pl-1">
                          <span
                            className="h-2 w-2 rounded-full bg-[#00A3FF]"
                            style={{ boxShadow: '0 0 8px #00A3FF' }}
                          />
                        </div>

                        {/* Monospace Engineered Input */}
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={goal}
                          onChange={handleInputChange}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => {
                            setIsFocused(false)
                            setIsTyping(false)
                          }}
                          placeholder="Search your dream career or technology..."
                          className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none font-mono tracking-wide"
                          autoFocus
                        />

                        {/* Precision Machined Action Pill Button */}
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF0055] text-white hover:bg-[#ff1a6b] active:scale-95 transition-all duration-200 cursor-pointer shrink-0 shadow-[0_0_15px_rgba(255,0,85,0.35)]"
                          aria-label="Submit career search"
                        >
                          <span className="font-mono text-xs font-bold tracking-wider hidden sm:inline">
                            INITIALIZE
                          </span>
                          <Search className="h-4 w-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ──── STAGE 2: CONVERSATIONAL ONBOARDING ──── */}
              {stage === 'conversation' && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-xl"
                >
                  {error && (
                    <div className="mb-4 rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs font-mono text-red-400">
                      {error}
                    </div>
                  )}

                  <AIArchitectConversation
                    initialGoal={goal || 'Full Stack Developer'}
                    onStartSynthesis={handleStartSynthesis}
                    onResetGoal={() => {
                      setStage('initial')
                      setGoal('')
                    }}
                    onUserInteracting={(type) => {
                      if (type === 'typing') {
                        setIsTyping(true)
                        setTimeout(() => setIsTyping(false), 350)
                      } else if (type === 'focus') {
                        setIsFocused(true)
                        setTimeout(() => setIsFocused(false), 450)
                      }
                    }}
                  />
                </motion.div>
              )}

              {/* ──── STAGE 3: SYNTHESIS GENERATION SCREEN ──── */}
              {stage === 'generating' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-xl"
                >
                  <RoadmapGenerationScreen
                    goal={goal}
                    onCompleteAnimation={handleGenerationAnimationComplete}
                  />
                </motion.div>
              )}

              {/* ──── STAGE 4: ROADMAP TIMELINE VIEW ──── */}
              {stage === 'view' && generatedData && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-3xl"
                >
                  <RoadmapTimelineView
                    generatedData={generatedData}
                    completedMilestones={completedMilestones}
                    onToggleMilestone={handleToggleMilestone}
                    onSaveRoadmap={handleSaveRoadmap}
                    onShareRoadmap={handleShare}
                    onResetGoal={() => {
                      setStage('initial')
                      setGoal('')
                      setGeneratedData(null)
                    }}
                    isSaving={isSaving}
                    savedRoadmapId={savedRoadmapId}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
