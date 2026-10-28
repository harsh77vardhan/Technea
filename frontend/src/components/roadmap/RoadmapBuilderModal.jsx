import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/useAuth'
import {
  generateRoadmapApi,
  saveRoadmapApi,
  updateRoadmapApi,
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

  // Stages: 'entry' | 'generating' | 'view'
  const [stage, setStage] = useState('entry')
  const [goal, setGoal] = useState(() => initialGoal || '')
  const [prevGoalProp, setPrevGoalProp] = useState(initialGoal)

  // 6 Onboarding parameters state
  const [preferences, setPreferences] = useState({
    goal: initialGoal || '',
    experience_level: 'Complete Beginner',
    available_time: '1-2 hours/day',
    preferred_language: 'TypeScript / JavaScript',
    current_skills: ['HTML/CSS', 'JavaScript'],
    target_role: 'Full-Stack Developer',
  })

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
      setPreferences((prev) => ({ ...prev, goal: initialGoal }))
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
    }, 3800)
  }

  // Triggered when user completes the 6-step configurator
  const handleStartSynthesis = async (onboardingPayload) => {
    setError(null)
    const targetGoal = onboardingPayload.goal || goal || 'Full Stack Developer'
    setGoal(targetGoal)
    setPreferences(onboardingPayload)
    setStage('generating')

    try {
      const response = await generateRoadmapApi({
        goal: targetGoal,
        experience_level: onboardingPayload.experience_level || 'Complete Beginner',
        available_time: onboardingPayload.available_time || '1-2 hours/day',
        preferred_language: onboardingPayload.preferred_language || 'TypeScript / JavaScript',
        current_skills: onboardingPayload.current_skills || ['HTML/CSS', 'JavaScript'],
        target_role: onboardingPayload.target_role || 'Full-Stack Developer',
        current_level: onboardingPayload.current_level || onboardingPayload.experience_level || 'Complete Beginner',
        main_goal: onboardingPayload.main_goal || 'Job',
        preferred_style: onboardingPayload.preferred_style || 'Projects',
      })

      setGeneratedData(response)
      setSavedRoadmapId(null)
      setCompletedMilestones([])
    } catch (err) {
      console.error('Failed to generate roadmap:', err)
      setError(
        err.message || 'Unable to generate roadmap. Please check backend connection and try again.'
      )
      setStage('entry')
    }
  }

  // Called when RoadmapGenerationScreen finishes its sequence
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

  // Update roadmap after edits
  const handleUpdateRoadmap = async (updatedData) => {
    setGeneratedData(updatedData)
    if (savedRoadmapId && user) {
      try {
        await updateRoadmapApi(savedRoadmapId, {
          title: updatedData.title,
          target_role: updatedData.target_role,
          roadmap_data: updatedData.roadmap_data,
          completed_milestone_ids: completedMilestones,
        })
        showToast('Changes saved to your account.')
      } catch (err) {
        console.warn('Failed to sync roadmap updates to server:', err)
        showToast('Roadmap updated locally.')
      }
    } else {
      showToast('Roadmap updated locally.')
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
        showToast('Saved locally in browser. Sign in to sync across devices.')
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

  // Share Roadmap: format summary & copy to clipboard
  const handleShare = () => {
    if (!generatedData) return
    const title = generatedData.title || 'Technea AI Roadmap'
    const role = generatedData.target_role || 'Software Engineer'
    const duration = generatedData.estimated_duration || '16 Weeks'
    const phasesCount = generatedData.roadmap_data?.phases?.length || 4

    const shareText = `🚀 Check out my AI Career Roadmap for ${role} on Technea!\n\n📌 Title: ${title}\n⏱ Estimated Duration: ${duration}\n🗺 Phases: ${phasesCount} progressive learning phases\n🔗 Built on Technea: ${window.location.origin}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
      showToast('Roadmap summary & link copied to clipboard!')
    }
  }

  // Regenerate: back to configurator with preferences preserved
  const handleRegenerate = () => {
    setStage('entry')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Roadmap Builder"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[1240px] h-[92vh] max-h-[920px] rounded-3xl bg-[#050505]/95 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
          data-lenis-prevent
        >
          <CinematicBackground />
          <RoadmapHUDFrame onClose={onClose} />

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#111]/90 backdrop-blur-xl border border-white/[0.15] text-white text-xs font-mono px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Content Container */}
          <div
            data-lenis-prevent
            className="relative z-20 flex-1 overflow-y-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-14 sm:pb-16"
          >
            <div className="mx-auto max-h-full">
              {/* ENTRY STAGE: 6-STEP CONFIGURATOR */}
              {stage === 'entry' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-2xl mx-auto"
                >
                  {error && (
                    <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono">
                      {error}
                    </div>
                  )}
                  <AIArchitectConversation
                    initialGoal={goal}
                    initialPreferences={preferences}
                    onStartSynthesis={handleStartSynthesis}
                    onResetGoal={() => setGoal('')}
                    onUserInteracting={() => {}}
                  />
                </motion.div>
              )}

              {/* GENERATING STAGE */}
              {stage === 'generating' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-lg mx-auto"
                >
                  <RoadmapGenerationScreen
                    goal={goal}
                    onCompleteAnimation={handleGenerationAnimationComplete}
                  />
                </motion.div>
              )}

              {/* VIEW STAGE: RICH TIMELINE & SYNTHESIS */}
              {stage === 'view' && generatedData && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-3xl mx-auto"
                >
                  <RoadmapTimelineView
                    generatedData={generatedData}
                    completedMilestones={completedMilestones}
                    onToggleMilestone={handleToggleMilestone}
                    onSaveRoadmap={handleSaveRoadmap}
                    onShareRoadmap={handleShare}
                    onRegenerate={handleRegenerate}
                    onUpdateRoadmap={handleUpdateRoadmap}
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
