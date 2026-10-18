import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Code2,
  FolderGit2,
  ExternalLink,
  Layers,
  Bookmark,
  BookmarkCheck,
  Share2,
  RefreshCw,
  Award,
  BookOpen,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
  generateRoadmapApi,
  saveRoadmapApi,
  toggleRoadmapMilestoneApi,
} from '../../services/api'

const QUICK_GOALS = [
  'Full Stack Developer',
  'AI & Machine Learning Engineer',
  'DevOps & Cloud Architect',
  'Cybersecurity Specialist',
  'Data Scientist',
]

const GENERATION_STEPS = [
  'Analyzing career target and required market competencies…',
  'Synthesizing foundational prerequisites and progression tiers…',
  'Matching verified catalog courses and architectural projects…',
  'Calibrating milestone timelines and capstone specifications…',
]

export default function RoadmapBuilderModal({
  isOpen,
  onClose,
  initialGoal = '',
}) {
  const { user } = useAuth()

  // Generation & View States
  const [stage, setStage] = useState('input') // 'input' | 'generating' | 'view'
  const [goal, setGoal] = useState(() => initialGoal || '')
  const [prevGoalProp, setPrevGoalProp] = useState(initialGoal)
  const [experienceLevel, setExperienceLevel] = useState('Beginner')
  const [generationStep, setGenerationStep] = useState(0)
  const [generatedData, setGeneratedData] = useState(null)
  const [savedRoadmapId, setSavedRoadmapId] = useState(null)
  const [completedMilestones, setCompletedMilestones] = useState([])
  const [expandedPhases, setExpandedPhases] = useState({ 1: true, 2: true })
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [error, setError] = useState(null)
  const toastTimeoutRef = useRef(null)

  // Adjust state when initialGoal prop changes (official React pattern)
  if (initialGoal !== prevGoalProp) {
    setPrevGoalProp(initialGoal)
    if (stage === 'input') {
      setGoal(initialGoal)
    }
  }

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const showToast = (msg) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Handle Generate Request
  const handleGenerate = async (targetGoal) => {
    const finalGoal = (targetGoal || goal || '').trim()
    if (!finalGoal) return

    setStage('generating')
    setGenerationStep(0)
    setError(null)

    // Progressive animation steps
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < GENERATION_STEPS.length - 1) return prev + 1
        return prev
      })
    }, 600)

    try {
      const response = await generateRoadmapApi({
        goal: finalGoal,
        experience_level: experienceLevel,
      })

      clearInterval(stepInterval)
      setGeneratedData(response)
      setSavedRoadmapId(null)
      setCompletedMilestones([])
      setExpandedPhases({ 1: true, 2: true, 3: false, 4: false })
      setStage('view')
    } catch (err) {
      clearInterval(stepInterval)
      console.error('Failed to generate roadmap:', err)
      setError(err.message || 'Unable to generate roadmap. Please try again.')
      setStage('input')
    }
  }

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneId) => {
    const isAlreadyDone = completedMilestones.includes(milestoneId)
    const nextCompleted = isAlreadyDone
      ? completedMilestones.filter((id) => id !== milestoneId)
      : [...completedMilestones, milestoneId]

    setCompletedMilestones(nextCompleted)

    // If already saved on backend, sync progress
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

  // Toggle Phase accordion
  const togglePhase = (phaseNum) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }))
  }

  // Save Roadmap
  const handleSaveRoadmap = async () => {
    if (!generatedData) return

    if (!user) {
      // Save to localStorage for guest
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
        showToast('Saved locally in your browser! Sign in to sync across devices.')
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
      showToast('Roadmap saved to your Technea account!')
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
      showToast('Roadmap URL copied to clipboard!')
    }
  }

  if (!isOpen) return null

  const roadmapDetails = generatedData?.roadmap_data || null
  const totalMilestonesCount = roadmapDetails?.total_milestones || 8
  const progressPercent = Math.min(
    100,
    roundPercent(completedMilestones.length, totalMilestonesCount)
  )

  function roundPercent(completed, total) {
    if (!total || total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Technea AI Career Roadmap Builder"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window Canvas (#050505 Linear Theme) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col w-full max-w-5xl h-[92vh] max-h-[920px] rounded-[10px] border border-[#1F1F1F] bg-[#050505] shadow-[0_30px_100px_rgba(0,0,0,0.98)] overflow-hidden"
        >
          {/* ──────────────── Top Navigation Bar ──────────────── */}
          <header className="relative z-20 flex items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-5 py-3.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#242424] bg-[#141414] text-[#EDEDED]">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#EDEDED] tracking-tight">
                  Technea Roadmap Builder
                </span>
                <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-2 py-0.5 text-[9px] font-mono text-[#A1A1A1] uppercase tracking-wider">
                  AI Autonomous Engine
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {stage === 'view' && (
                <>
                  <button
                    type="button"
                    onClick={() => setStage('input')}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-[6px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] hover:bg-[#171717] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>New Goal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-[6px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] hover:bg-[#171717] transition-colors cursor-pointer"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Share</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRoadmap}
                    disabled={isSaving || savedRoadmapId}
                    className={`inline-flex items-center gap-1.5 rounded-[6px] border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      savedRoadmapId
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                        : 'border-[#333333] bg-[#EDEDED] text-[#050505] hover:bg-white'
                    }`}
                  >
                    {savedRoadmapId ? (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-3.5 w-3.5" />
                        <span>{isSaving ? 'Saving…' : 'Save Roadmap'}</span>
                      </>
                    )}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#222222] bg-[#111111] text-[#737373] hover:text-[#EDEDED] hover:bg-[#171717] transition-colors cursor-pointer"
                aria-label="Close roadmap builder"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 rounded-[6px] border border-[#2D2D2D] bg-[#121212] px-3.5 py-1.5 text-xs font-mono text-[#EDEDED] shadow-xl"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────── Modal Body Canvas ──────────────── */}
          <div className="relative z-10 flex-1 overflow-y-auto bg-[#050505] p-5 sm:p-8">
            {/* ──────── STAGE 1: INPUT GOAL FORM ──────── */}
            {stage === 'input' && (
              <div className="mx-auto max-w-2xl py-6 sm:py-12 space-y-8">
                {/* Header Copy */}
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#222222] bg-[#0E0E0E] px-3 py-1 text-[11px] font-mono text-[#A1A1A1]">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Personalized Curriculum Synthesis</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EDEDED]">
                    What is your engineering career goal?
                  </h2>
                  <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-lg mx-auto">
                    Describe any role, domain, or technology ambition. Technea will synthesize a multi-phase curriculum connecting verified catalog courses, milestone timelines, and hands-on projects.
                  </p>
                </div>

                {error && (
                  <div className="rounded-[6px] border border-red-900/50 bg-[#120808] p-3 text-center text-xs text-red-400 font-mono">
                    {error}
                  </div>
                )}

                {/* Main Input Box */}
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGenerate()
                      }}
                      placeholder="e.g. I want to become a Full Stack Developer"
                      className="w-full rounded-[8px] border border-[#262626] bg-[#0D0D0D] px-4 py-3.5 text-sm text-[#EDEDED] placeholder-[#555555] focus:border-[#444444] focus:outline-none font-mono shadow-inner"
                      autoFocus
                    />
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                      Popular Career Blueprints:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_GOALS.map((qGoal) => (
                        <button
                          key={qGoal}
                          type="button"
                          onClick={() => {
                            setGoal(qGoal)
                            handleGenerate(qGoal)
                          }}
                          className="rounded-[6px] border border-[#1F1F1F] bg-[#0C0C0C] px-2.5 py-1.5 text-xs font-mono text-[#888888] hover:text-[#EDEDED] hover:border-[#333333] hover:bg-[#141414] transition-colors cursor-pointer"
                        >
                          {qGoal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level Selector */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                      Target Experience Baseline:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setExperienceLevel(lvl)}
                          className={`rounded-[6px] border py-2 text-xs font-mono transition-colors cursor-pointer ${
                            experienceLevel === lvl
                              ? 'border-[#EDEDED] bg-[#141414] text-[#EDEDED] font-bold'
                              : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#737373] hover:border-[#2E2E2E]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Submit CTA */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => handleGenerate()}
                      disabled={!goal.trim()}
                      className={`w-full flex items-center justify-center gap-2 rounded-[6px] py-3 text-xs font-bold transition-all shadow-md cursor-pointer ${
                        goal.trim()
                          ? 'bg-[#EDEDED] text-[#050505] hover:bg-white'
                          : 'bg-[#181818] text-[#555555] cursor-not-allowed border border-[#222222]'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate Personalized Roadmap</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ──────── STAGE 2: GENERATING ANIMATION ──────── */}
            {stage === 'generating' && (
              <div className="mx-auto max-w-md py-16 sm:py-24 text-center space-y-8">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#1A1A1A] border-t-[#EDEDED] animate-spin" />
                  <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
                    Synthesizing Curriculum Architecture…
                  </h3>
                  <p className="text-xs text-[#737373] font-mono">
                    Target: {goal} ({experienceLevel})
                  </p>
                </div>

                {/* Progressive status list */}
                <div className="rounded-[8px] border border-[#1A1A1A] bg-[#0A0A0A] p-4 text-left font-mono text-[11px] space-y-2.5">
                  {GENERATION_STEPS.map((stepText, idx) => {
                    const isDone = idx < generationStep
                    const isCurrent = idx === generationStep
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 transition-opacity ${
                          isDone
                            ? 'text-emerald-400'
                            : isCurrent
                            ? 'text-[#EDEDED] font-semibold'
                            : 'text-[#444444] opacity-50'
                        }`}
                      >
                        <span className="flex h-3.5 w-3.5 items-center justify-center">
                          {isDone ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : isCurrent ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                          ) : (
                            <span className="h-1 w-1 rounded-full bg-[#333333]" />
                          )}
                        </span>
                        <span className="truncate">{stepText}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ──────── STAGE 3: ROADMAP TIMELINE VIEW ──────── */}
            {stage === 'view' && generatedData && (
              <div className="space-y-6 max-w-5xl mx-auto">
                {/* ──── Hero Overview Header ──── */}
                <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-[4px] border border-[#242424] bg-[#141414] px-2 py-0.5 text-[9px] font-mono text-amber-400 uppercase tracking-wider">
                          {generatedData.target_role || 'Target Specialization'}
                        </span>
                        <span className="rounded-[4px] border border-[#242424] bg-[#141414] px-2 py-0.5 text-[9px] font-mono text-[#A1A1A1]">
                          {generatedData.experience_level || 'Beginner'} Baseline
                        </span>
                        <span className="rounded-[4px] border border-[#242424] bg-[#141414] px-2 py-0.5 text-[9px] font-mono text-[#A1A1A1] flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 text-[#737373]" />
                          {generatedData.estimated_duration || '18 Weeks'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
                        {generatedData.title}
                      </h2>
                      <p className="text-xs text-[#737373] max-w-3xl leading-relaxed">
                        {roadmapDetails?.summary ||
                          'Comprehensive progression from core architecture to distributed systems and capstones.'}
                      </p>
                    </div>

                    {/* Progress Ring / Percentage */}
                    <div className="flex items-center gap-3 shrink-0 rounded-[6px] border border-[#1F1F1F] bg-[#080808] px-4 py-2.5 self-start">
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                          Milestones
                        </span>
                        <span className="text-xs font-mono font-bold text-[#EDEDED]">
                          {completedMilestones.length} / {totalMilestonesCount} Done
                        </span>
                      </div>
                      <div className="text-lg font-black font-mono text-emerald-400">
                        {progressPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-[#181818] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.max(progressPercent, 4)}%` }}
                    />
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#181818] text-[11px] font-mono text-[#737373]">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-[#A1A1A1]" />
                      <span>{roadmapDetails?.phases?.length || 4} Tiers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-[#A1A1A1]" />
                      <span>{roadmapDetails?.total_courses || 8} Courses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FolderGit2 className="h-3 w-3 text-[#A1A1A1]" />
                      <span>{roadmapDetails?.total_projects || 5} Labs & Projects</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3 w-3 text-[#A1A1A1]" />
                      <span>Production Capstone</span>
                    </div>
                  </div>
                </div>

                {/* ──── Interactive Phases Progression ──── */}
                <div className="space-y-4">
                  {roadmapDetails?.phases?.map((phase) => {
                    const isExpanded = expandedPhases[phase.phase_number] !== false
                    const phaseMilestones = phase.milestones || []
                    const phaseCompletedCount = phaseMilestones.filter((m) =>
                      completedMilestones.includes(m.id)
                    ).length

                    return (
                      <div
                        key={phase.phase_number}
                        className="rounded-[8px] border border-[#1C1C1C] bg-[#0B0B0B] overflow-hidden transition-colors hover:border-[#262626]"
                      >
                        {/* Phase Header */}
                        <button
                          type="button"
                          onClick={() => togglePhase(phase.phase_number)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-[#0E0E0E] hover:bg-[#121212] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-[#262626] bg-[#141414] text-[11px] font-mono font-bold text-[#EDEDED] shrink-0">
                              {phase.phase_number}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-[#EDEDED] tracking-tight truncate">
                                  {phase.title}
                                </h3>
                                <span className="rounded-[4px] border border-[#222222] bg-[#0A0A0A] px-2 py-0.5 text-[9px] font-mono text-[#888888] shrink-0">
                                  {phase.estimated_duration}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#737373] truncate mt-0.5">
                                {phase.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="text-[10px] font-mono text-[#666666] hidden sm:inline">
                              {phaseCompletedCount} / {phaseMilestones.length} done
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-[#737373] transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-[#EDEDED]' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Milestones Content */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 space-y-4 border-t border-[#181818]">
                            {phaseMilestones.map((milestone) => {
                              const isChecked = completedMilestones.includes(milestone.id)

                              return (
                                <div
                                  key={milestone.id}
                                  className={`rounded-[8px] border p-4 transition-all ${
                                    isChecked
                                      ? 'border-[#222222] bg-[#090909] opacity-80'
                                      : 'border-[#1A1A1A] bg-[#0D0D0D] hover:border-[#292929]'
                                  }`}
                                >
                                  {/* Milestone Top Row: Checkbox + Title + Duration */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleMilestone(milestone.id)}
                                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors cursor-pointer ${
                                          isChecked
                                            ? 'border-emerald-500/80 bg-emerald-500/20 text-emerald-400'
                                            : 'border-[#383838] bg-[#141414] hover:border-[#EDEDED]'
                                        }`}
                                        aria-label={`Mark milestone ${milestone.title} as completed`}
                                      >
                                        {isChecked && <Check className="h-3 w-3" />}
                                      </button>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4
                                            className={`text-xs font-bold tracking-tight ${
                                              isChecked
                                                ? 'line-through text-[#737373]'
                                                : 'text-[#EDEDED]'
                                            }`}
                                          >
                                            {milestone.title}
                                          </h4>
                                          <span className="text-[10px] font-mono text-[#666666]">
                                            • {milestone.estimated_weeks}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-[#888888] mt-1 leading-relaxed">
                                          {milestone.description}
                                        </p>
                                      </div>
                                    </div>

                                    <span className="rounded-[4px] border border-[#222222] bg-[#111111] px-2 py-0.5 text-[9px] font-mono text-[#A1A1A1] shrink-0">
                                      {milestone.category}
                                    </span>
                                  </div>

                                  {/* Action Checklist */}
                                  {milestone.action_items?.length > 0 && (
                                    <div className="mt-3 pl-7 space-y-1">
                                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#555555] block">
                                        Action Items:
                                      </span>
                                      <ul className="space-y-1 text-[11px] text-[#A1A1A1]">
                                        {milestone.action_items.map((item, i) => (
                                          <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-[#555555] select-none">•</span>
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Skills Tags */}
                                  {milestone.key_skills?.length > 0 && (
                                    <div className="mt-3 pl-7 flex flex-wrap gap-1">
                                      {milestone.key_skills.map((skill) => (
                                        <span
                                          key={skill}
                                          className="rounded-[3px] border border-[#222222] bg-[#121212] px-1.5 py-0.5 text-[10px] font-mono text-[#A1A1A1]"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Linked Technea Catalog Courses */}
                                  {milestone.courses?.length > 0 && (
                                    <div className="mt-4 pl-7 pt-3 border-t border-[#181818] space-y-2">
                                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] flex items-center gap-1.5">
                                        <BookOpen className="h-3 w-3 text-[#888888]" />
                                        Curated Catalog Courses:
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {milestone.courses.map((course) => (
                                          <div
                                            key={course.id || course.title}
                                            className="rounded-[6px] border border-[#202020] bg-[#101010] p-2.5 flex items-center justify-between gap-2"
                                          >
                                            <div className="min-w-0">
                                              <span className="text-xs font-semibold text-[#EDEDED] block truncate">
                                                {course.title}
                                              </span>
                                              <span className="text-[10px] font-mono text-[#666666]">
                                                {course.instructor || 'Technea Academy'} • {course.duration || '4 hours'}
                                              </span>
                                            </div>
                                            {course.url ? (
                                              <a
                                                href={course.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="shrink-0 flex items-center gap-1 rounded-[4px] border border-[#2D2D2D] bg-[#171717] px-2 py-1 text-[10px] font-mono text-[#EDEDED] hover:bg-white hover:text-black transition-colors"
                                              >
                                                <span>Watch</span>
                                                <ExternalLink className="h-2.5 w-2.5" />
                                              </a>
                                            ) : (
                                              <span className="text-[10px] font-mono text-[#555555]">
                                                Included
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Hands-On Practice Lab Spec Card */}
                                  {milestone.project && (
                                    <div className="mt-3 pl-7">
                                      <div className="rounded-[6px] border border-[#242424] bg-[#0E0E0E] p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
                                            <Code2 className="h-3 w-3 text-amber-400" />
                                            Practice Lab: {milestone.project.title}
                                          </span>
                                          <span className="rounded-[3px] border border-[#282828] bg-[#121212] px-1.5 py-0.5 text-[9px] font-mono text-[#888888]">
                                            {milestone.project.difficulty}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-[#A1A1A1] leading-relaxed">
                                          {milestone.project.description}
                                        </p>
                                        {milestone.project.tech_stack?.length > 0 && (
                                          <div className="flex flex-wrap gap-1 pt-1">
                                            {milestone.project.tech_stack.map((t) => (
                                              <span
                                                key={t}
                                                className="text-[9px] font-mono text-[#737373] bg-[#161616] px-1.5 py-0.5 rounded-[2px]"
                                              >
                                                #{t}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* ──── Capstone Project Blueprint Card ──── */}
                {roadmapDetails?.capstone_project && (
                  <div className="rounded-[10px] border border-amber-900/30 bg-[#0E0B08] p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                          Final Capstone Project
                        </span>
                      </div>
                      <span className="rounded-[4px] border border-amber-800/40 bg-amber-950/20 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                        Portfolio Deliverable
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
                      {roadmapDetails.capstone_project.title}
                    </h3>
                    <p className="text-xs text-[#A1A1A1] leading-relaxed">
                      {roadmapDetails.capstone_project.description}
                    </p>

                    {roadmapDetails.capstone_project.key_features?.length > 0 && (
                      <div className="pt-2 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                          Key Deliverable Requirements:
                        </span>
                        <ul className="space-y-1 text-xs text-[#CCCCCC]">
                          {roadmapDetails.capstone_project.key_features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
