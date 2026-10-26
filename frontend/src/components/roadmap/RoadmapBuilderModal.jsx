import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Terminal } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
  generateRoadmapApi,
  saveRoadmapApi,
  toggleRoadmapMilestoneApi,
} from '../../services/api'
import RoadmapHUDFrame from './RoadmapHUDFrame'
import CinematicBackground from './CinematicBackground'
import AIArchitectConversation from './AIArchitectConversation'
import RoadmapGenerationScreen from './RoadmapGenerationScreen'
import RoadmapTimelineView from './RoadmapTimelineView'

export default function RoadmapBuilderModal({
  isOpen,
  onClose,
  initialGoal = '',
  onSelectPath,
}) {
  const { user } = useAuth()

  // Stages: 'entry' (Hero & Configuration Deck) | 'generating' (Neural Synthesis) | 'view' (Interactive Roadmap Timeline)
  const [stage, setStage] = useState('entry')
  const [goal, setGoal] = useState(() => initialGoal || '')
  const [prevGoalProp, setPrevGoalProp] = useState(initialGoal)

  // Generation data & UI state
  const [generatedData, setGeneratedData] = useState(null)
  const [savedRoadmapId, setSavedRoadmapId] = useState(null)
  const [completedMilestones, setCompletedMilestones] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [error, setError] = useState(null)

  const toastTimeoutRef = useRef(null)

  // Handle prop updates
  if (initialGoal !== prevGoalProp) {
    setPrevGoalProp(initialGoal)
    if (initialGoal) {
      setGoal(initialGoal)
    }
  }

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

  // Triggered when user submits the configurator form
  const handleStartSynthesis = async (onboardingPayload) => {
    setError(null)
    const targetGoal = onboardingPayload.goal || goal || 'Full Stack Developer'
    setGoal(targetGoal)
    setStage('generating')

    try {
      const response = await generateRoadmapApi({
        goal: targetGoal,
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
      setError(err.message || 'Unable to generate roadmap. Please check backend connection and try again.')
      setStage('entry')
    }
  }

  // Called when RoadmapGenerationScreen finishes its 5-step sequence
  const handleGenerationAnimationComplete = () => {
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

  // Save Roadmap (Cloud or LocalStorage fallback)
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
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 lg:p-6 overflow-hidden select-none"
      >
        {/* ── Studio Backdrop Blur ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-2xl cursor-pointer"
          aria-hidden="true"
        />

        {/* ── Futuristic AI Command Center Modal Container ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[1240px] h-[92vh] max-h-[920px] rounded-3xl bg-[#060709] border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_60px_rgba(0,163,255,0.06)] overflow-hidden flex flex-col"
          data-lenis-prevent
          style={{
            boxShadow:
              '0 30px 100px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* ── Engineering Canvas & Grid Lighting ── */}
          <CinematicBackground />

          {/* ── Telemetry Hardware Frame (Top & Bottom Bars) ── */}
          <RoadmapHUDFrame onClose={onClose} stage={stage} />

          {/* ── Subtle Toast Notification Pill ── */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-50 rounded-full border border-[#00A3FF]/30 bg-[#0c0d14]/95 backdrop-blur-xl px-5 py-2 text-xs font-mono text-white shadow-2xl flex items-center gap-2.5"
                style={{
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 163, 255, 0.2)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#00A3FF]" />
                <span className="tracking-wide text-neutral-200">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Viewport Content ── */}
          <div
            data-lenis-prevent
            className="relative z-20 w-full h-full flex flex-col items-center justify-start overflow-y-auto px-4 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-12 sm:pb-16"
          >
            {/* ──── STAGE 1: CENTERED HERO & BUILDER CONFIGURATION DECK ──── */}
            {stage === 'entry' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-3xl mx-auto space-y-7 my-auto text-center"
              >
                {/* Error Banner */}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs font-mono text-red-400">
                    {error}
                  </div>
                )}

                {/* ── Centered High-Impact Entry Hero ── */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#00A3FF]/30 bg-[#00A3FF]/[0.06] px-3.5 py-1 text-[11px] font-mono tracking-[0.22em] uppercase text-[#00A3FF]">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>AUTONOMOUS ROADMAP SYNTHESIZER</span>
                  </div>

                  <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.04em] text-white"
                    style={{
                      fontFamily: "'Orbitron', system-ui, sans-serif",
                      textShadow: '0 0 24px rgba(0, 163, 255, 0.35)',
                    }}
                  >
                    Build Your Learning Path
                  </h1>

                  <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
                    Personalized AI-guided sequences engineered for complete beginners. Select your target domain, baseline knowledge, and weekly availability to generate a structured milestone roadmap.
                  </p>
                </div>

                {/* ── Integrated Command Center Configurator ── */}
                <AIArchitectConversation
                  initialGoal={goal}
                  onStartSynthesis={handleStartSynthesis}
                  onResetGoal={() => setGoal('')}
                />
              </motion.div>
            )}

            {/* ──── STAGE 2: NEURAL SYNTHESIS TERMINAL ──── */}
            {stage === 'generating' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-xl my-auto"
              >
                <RoadmapGenerationScreen
                  goal={goal}
                  onCompleteAnimation={handleGenerationAnimationComplete}
                />
              </motion.div>
            )}

            {/* ──── STAGE 3: INTERACTIVE HOLOGRAPHIC ROADMAP TIMELINE ──── */}
            {stage === 'view' && generatedData && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl"
              >
                <RoadmapTimelineView
                  generatedData={generatedData}
                  completedMilestones={completedMilestones}
                  onToggleMilestone={handleToggleMilestone}
                  onSaveRoadmap={handleSaveRoadmap}
                  onShareRoadmap={handleShare}
                  onResetGoal={() => {
                    setStage('entry')
                    setGeneratedData(null)
                  }}
                  isSaving={isSaving}
                  savedRoadmapId={savedRoadmapId}
                  onSelectPath={onSelectPath}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
