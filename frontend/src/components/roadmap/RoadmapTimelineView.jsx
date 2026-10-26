import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Layers,
  BookOpen,
  FolderGit2,
  Award,
  ChevronDown,
  Check,
  Bookmark,
  BookmarkCheck,
  Share2,
  RefreshCw,
  ExternalLink,
  Target,
  Sparkles,
  Play,
  CheckCircle2,
} from 'lucide-react'

export default function RoadmapTimelineView({
  generatedData,
  completedMilestones = [],
  onToggleMilestone,
  onSaveRoadmap,
  onShareRoadmap,
  onResetGoal,
  isSaving = false,
  savedRoadmapId = null,
  onSelectPath,
}) {
  const roadmapDetails = generatedData?.roadmap_data || generatedData || {}
  const phases = useMemo(() => roadmapDetails.phases || [], [roadmapDetails.phases])

  // Count total milestones across all phases
  const totalMilestonesCount = useMemo(() => {
    if (roadmapDetails.total_milestones) return roadmapDetails.total_milestones
    return phases.reduce((acc, p) => acc + (p.milestones?.length || 0), 0) || 8
  }, [roadmapDetails.total_milestones, phases])

  // Expand all phases by default for immediate clarity
  const [expandedPhases, setExpandedPhases] = useState(() => {
    const initial = {}
    phases.forEach((p) => {
      initial[p.phase_number] = true
    })
    return initial
  })

  // Selected phase tab for quick navigation
  const [activeTabPhase, setActiveTabPhase] = useState(null)

  const progressPercent = Math.min(
    100,
    Math.round(((completedMilestones.length || 0) / (totalMilestonesCount || 1)) * 100)
  )

  const togglePhase = (phaseNum) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }))
  }

  const handlePhaseTabClick = (phaseNum) => {
    setActiveTabPhase(phaseNum)
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseNum]: true,
    }))
    const element = document.getElementById(`phase-section-${phaseNum}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const capstone = roadmapDetails.capstone_project || generatedData.capstone_project

  return (
    <div
      data-lenis-prevent
      className="w-full max-h-[82vh] overflow-y-auto px-4 sm:px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent select-none"
    >
      {/* ── Top Bar with Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00A3FF]/15 border border-[#00A3FF]/30">
            <Sparkles className="h-3.5 w-3.5 text-[#00A3FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#00A3FF] font-bold">
                AUTONOMOUS BLUEPRINT
              </span>
              <span className="text-white/20">•</span>
              <span className="text-xs font-mono text-neutral-300 font-semibold truncate max-w-xs sm:max-w-md">
                {generatedData.target_role || generatedData.goal}
              </span>
            </div>
          </div>
        </div>

        {/* Action Deck Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetGoal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:border-[#00A3FF]/50 hover:bg-white/[0.05] transition-all cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">New Trajectory</span>
          </button>

          <button
            type="button"
            onClick={onShareRoadmap}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:border-[#00A3FF]/50 hover:bg-white/[0.05] transition-all cursor-pointer"
          >
            <Share2 className="h-3 w-3" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={onSaveRoadmap}
            disabled={isSaving || savedRoadmapId}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer border ${
              savedRoadmapId
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                : 'border-[#FF0055]/40 bg-gradient-to-r from-[#FF0055] to-[#ff2a7a] text-white hover:brightness-110 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_20px_rgba(255,0,85,0.35)]'
            }`}
          >
            {savedRoadmapId ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Saved to Account</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                <span>{isSaving ? 'Saving…' : 'Save Roadmap'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Executive Overview Card (Apple Pro Precision) ── */}
      <div
        className="relative rounded-3xl border border-white/[0.1] bg-[#07080d]/90 backdrop-blur-2xl p-5 sm:p-7 space-y-6 overflow-hidden shadow-2xl"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 20px 50px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#00A3FF]/40 bg-[#00A3FF]/10 px-3 py-0.5 text-[11px] font-mono text-[#00A3FF] uppercase tracking-wider font-semibold">
                {generatedData.target_role || 'Target Specialization'}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 text-[11px] font-mono text-neutral-400">
                {generatedData.experience_level || 'Beginner'} Baseline
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-neutral-500" />
                {generatedData.estimated_duration || roadmapDetails.estimated_total_duration || '16-18 Weeks'}
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {generatedData.title}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {roadmapDetails.summary ||
                'Tailored curriculum synthesized from fundamental computing paradigms to distributed production systems, enterprise tooling, and interview-ready capstones.'}
            </p>
          </div>

          {/* Completion Score Ring Box */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/60 p-4 shrink-0 shadow-lg">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">
                COMPLETION SCORE
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {completedMilestones.length} / {totalMilestonesCount} Milestones
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-[#00A3FF] pl-2 border-l border-white/10">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Dynamic Glowing Laser Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>OVERALL MILESTONE PROGRESS</span>
            <span className="text-[#00A3FF] font-semibold">{progressPercent}% COMPLETED</span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#00A3FF] via-[#0084FF] to-[#FF0055]"
              style={{
                boxShadow:
                  '0 0 12px rgba(0, 163, 255, 0.6), 0 0 18px rgba(255, 0, 85, 0.3)',
              }}
              animate={{ width: `${Math.max(progressPercent, 3)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Architecture Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.08] text-xs font-mono text-neutral-300">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#00A3FF]" />
            <span>{phases.length || 4} Progressive Tiers</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#00A3FF]" />
            <span>{roadmapDetails.total_courses || 8} Verified Courses</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-[#FF0055]" />
            <span>{roadmapDetails.total_projects || 5} Repos & Labs</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#FF0055]" />
            <span>Production Capstone</span>
          </div>
        </div>
      </div>

      {/* ── Phase Navigation Ribbon Tabs ── */}
      {phases.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase shrink-0 pr-1">
            TIERS:
          </span>
          {phases.map((phase) => {
            const phaseDone = (phase.milestones || []).filter((m) =>
              completedMilestones.includes(m.id)
            ).length
            const isTabActive = activeTabPhase === phase.phase_number
            return (
              <button
                key={phase.phase_number}
                type="button"
                onClick={() => handlePhaseTabClick(phase.phase_number)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-mono transition-all cursor-pointer shrink-0 border ${
                  isTabActive
                    ? 'border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-[0_0_12px_rgba(0,163,255,0.25)]'
                    : 'border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="font-bold text-[#00A3FF]">0{phase.phase_number}</span>
                <span className="truncate max-w-[120px] sm:max-w-none">{phase.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-neutral-400">
                  {phaseDone}/{(phase.milestones || []).length}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Progressive Node Timeline ── */}
      <div className="space-y-6">
        {phases.map((phase) => {
          const isExpanded = expandedPhases[phase.phase_number] !== false
          const phaseMilestones = phase.milestones || []
          const phaseCompletedCount = phaseMilestones.filter((m) =>
            completedMilestones.includes(m.id)
          ).length

          return (
            <div
              key={phase.phase_number}
              id={`phase-section-${phase.phase_number}`}
              className="rounded-3xl border border-white/[0.08] bg-[#06070b]/80 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/20 shadow-xl"
            >
              {/* Phase Header Accordion Strip */}
              <button
                type="button"
                onClick={() => togglePhase(phase.phase_number)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left bg-white/[0.015] hover:bg-white/[0.035] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#00A3FF]/40 bg-[#00A3FF]/10 text-sm font-mono font-bold text-[#00A3FF] shrink-0">
                    0{phase.phase_number}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                        {phase.title}
                      </h2>
                      <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-neutral-400 shrink-0">
                        {phase.estimated_duration}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate mt-1">
                      {phase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-mono text-neutral-400 font-semibold block">
                      {phaseCompletedCount} / {phaseMilestones.length} done
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      {phaseCompletedCount === phaseMilestones.length && phaseMilestones.length > 0
                        ? 'PHASE COMPLETED'
                        : 'IN PROGRESS'}
                    </span>
                  </div>
                  <div className="p-1 rounded-lg border border-white/10 bg-white/[0.02]">
                    <ChevronDown
                      className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Milestones Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 sm:p-6 space-y-6 border-t border-white/[0.06]"
                  >
                    {phaseMilestones.map((milestone, mIdx) => {
                      const isChecked = completedMilestones.includes(milestone.id)

                      return (
                        <div
                          key={milestone.id}
                          className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                            isChecked
                              ? 'border-white/[0.05] bg-black/40 opacity-75'
                              : 'border-white/[0.08] bg-[#07080e]/90 hover:border-[#00A3FF]/40 shadow-lg'
                          }`}
                        >
                          {/* Top Row: Milestone Checkbox, Title, Duration */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5 min-w-0">
                              <button
                                type="button"
                                onClick={() => onToggleMilestone(milestone.id)}
                                className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border transition-all cursor-pointer shrink-0 ${
                                  isChecked
                                    ? 'border-emerald-500 bg-emerald-500 text-black shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                                    : 'border-white/20 bg-white/[0.02] hover:border-[#00A3FF] hover:bg-[#00A3FF]/10'
                                }`}
                                aria-label={`Toggle milestone ${milestone.title}`}
                              >
                                {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </button>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3
                                    className={`text-sm sm:text-base font-bold tracking-tight ${
                                      isChecked
                                        ? 'line-through text-neutral-400'
                                        : 'text-white'
                                    }`}
                                  >
                                    {milestone.title}
                                  </h3>
                                  {milestone.category && (
                                    <span className="rounded border border-[#00A3FF]/30 bg-[#00A3FF]/10 px-2 py-0.5 text-[10px] font-mono text-[#00A3FF]">
                                      {milestone.category}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                                  {milestone.description}
                                </p>
                              </div>
                            </div>

                            <span className="text-[11px] font-mono text-neutral-400 shrink-0 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5">
                              {milestone.estimated_weeks || milestone.duration || `Step ${mIdx + 1}`}
                            </span>
                          </div>

                          {/* Key Skills Badges */}
                          {milestone.key_skills && milestone.key_skills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-3 pl-9">
                              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mr-1">
                                SKILLS:
                              </span>
                              {milestone.key_skills.map((skillName, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-200"
                                >
                                  {skillName}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action Items List */}
                          {milestone.action_items && milestone.action_items.length > 0 && (
                            <div className="mt-3.5 pl-9 space-y-1.5 border-t border-white/[0.05] pt-3">
                              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                                DELIVERABLE CHECKLIST:
                              </span>
                              {milestone.action_items.map((item, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="flex items-start gap-2 text-xs text-neutral-300 font-mono"
                                >
                                  <span className="text-[#00A3FF] shrink-0 font-bold">›</span>
                                  <span className="leading-snug">{item}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Verified Courses Attached to Milestone */}
                          {milestone.courses && milestone.courses.length > 0 && (
                            <div className="mt-4 pl-9 space-y-2 border-t border-white/[0.05] pt-3">
                              <span className="text-[10px] font-mono text-[#00A3FF] uppercase tracking-wider flex items-center gap-1.5">
                                <BookOpen className="h-3 w-3" />
                                <span>VERIFIED CURRICULUM MODULES</span>
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {milestone.courses.map((course, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="rounded-xl border border-white/[0.08] bg-black/50 p-3 flex flex-col justify-between hover:border-white/20 transition-all"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-300 uppercase">
                                          {course.platform || 'Online Course'}
                                        </span>
                                        {course.duration && (
                                          <span className="text-[9px] font-mono text-neutral-400">
                                            {course.duration}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs font-semibold text-white line-clamp-1">
                                        {course.title}
                                      </div>
                                      {course.instructor && (
                                        <div className="text-[10px] text-neutral-400 mt-0.5">
                                          By {course.instructor}
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center justify-between">
                                      <span className="text-[10px] font-mono text-neutral-400">
                                        {course.lesson_count ? `${course.lesson_count} lessons` : 'Comprehensive'}
                                      </span>
                                      {course.url ? (
                                        <a
                                          href={course.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00A3FF] hover:underline"
                                        >
                                          <span>Open Course</span>
                                          <ExternalLink className="h-2.5 w-2.5" />
                                        </a>
                                      ) : onSelectPath && milestone.learning_path_id ? (
                                        <button
                                          type="button"
                                          onClick={() => onSelectPath(milestone.learning_path_id)}
                                          className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00A3FF] hover:underline cursor-pointer"
                                        >
                                          <span>Explore Path</span>
                                          <Play className="h-2.5 w-2.5" />
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Hands-On Project Blueprint attached to Milestone */}
                          {milestone.project && (
                            <div className="mt-4 pl-9">
                              <div className="rounded-2xl border border-[#FF0055]/30 bg-[#FF0055]/[0.04] p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FolderGit2 className="h-4 w-4 text-[#FF0055]" />
                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF0055]">
                                      PRACTICAL REPO SPEC: {milestone.project.title}
                                    </span>
                                  </div>
                                  <span className="rounded bg-[#FF0055]/15 border border-[#FF0055]/30 px-2 py-0.5 text-[9px] font-mono text-[#FF0055] uppercase">
                                    {milestone.project.difficulty || 'Lab Spec'}
                                  </span>
                                </div>

                                <p className="text-xs text-neutral-300 leading-relaxed">
                                  {milestone.project.description}
                                </p>

                                {milestone.project.tech_stack && milestone.project.tech_stack.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {milestone.project.tech_stack.map((tech, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className="rounded bg-black/60 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-neutral-200"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {milestone.project.key_features && milestone.project.key_features.length > 0 && (
                                  <div className="space-y-1 pt-2 border-t border-white/[0.06]">
                                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                                      CORE DELIVERABLES:
                                    </span>
                                    {milestone.project.key_features.map((feat, fIdx) => (
                                      <div key={fIdx} className="flex items-start gap-1.5 text-xs text-neutral-300 font-mono">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                                        <span>{feat}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* ── Production Capstone System Blueprint Card ── */}
      {capstone && (
        <div
          className="relative rounded-3xl border border-[#FF0055]/40 bg-gradient-to-b from-[#0a0508] to-[#040407] p-6 sm:p-8 space-y-5 overflow-hidden shadow-2xl"
          style={{
            boxShadow:
              '0 0 30px rgba(255, 0, 85, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF0055]/40 bg-[#FF0055]/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#FF0055] font-bold">
                <Award className="h-3.5 w-3.5" />
                <span>FINAL CAPSTONE ARCHITECTURE BLUEPRINT</span>
              </div>
              <h2
                className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {capstone.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                {capstone.description}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-right shrink-0">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block">COMPLEXITY</span>
              <span className="text-xs font-mono font-bold text-[#FF0055]">
                {capstone.difficulty || 'Production Grade'}
              </span>
            </div>
          </div>

          {/* Capstone Tech Stack */}
          {capstone.tech_stack && capstone.tech_stack.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                TECHNOLOGY STACK:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {capstone.tech_stack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-white font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Capstone Key Features */}
          {capstone.key_features && capstone.key_features.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                KEY SYSTEM DELIVERABLES & EVALUATION CRITERIA:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {capstone.key_features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/[0.06] bg-black/40 p-2.5 flex items-start gap-2 text-xs font-mono text-neutral-300"
                  >
                    <Target className="h-3.5 w-3.5 text-[#00A3FF] mt-0.5 shrink-0" />
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Action Deck ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#07080d]/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white tracking-tight">
            Ready to build your roadmap?
          </div>
          <div className="text-xs text-neutral-400">
            Check off milestones as you master skills and deploy projects.
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onResetGoal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-mono text-neutral-300 hover:text-white hover:border-[#00A3FF]/50 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>New Trajectory</span>
          </button>

          <button
            type="button"
            onClick={onSaveRoadmap}
            disabled={isSaving || savedRoadmapId}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer border ${
              savedRoadmapId
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-[#FF0055]/40 bg-gradient-to-r from-[#FF0055] to-[#ff2a7a] text-white hover:brightness-110 shadow-[0_0_20px_rgba(255,0,85,0.35)]'
            }`}
          >
            {savedRoadmapId ? (
              <>
                <BookmarkCheck className="h-4 w-4 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                <span>{isSaving ? 'Saving…' : 'Save Roadmap'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
