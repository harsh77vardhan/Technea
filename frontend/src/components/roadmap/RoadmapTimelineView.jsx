import { useState, useMemo } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'

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

  // Expand all phases by default
  const [expandedPhases, setExpandedPhases] = useState(() => {
    const initial = {}
    phases.forEach((p) => {
      initial[p.phase_number] = true
    })
    return initial
  })

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

  // Find first uncompleted milestone ID
  const firstUncompletedId = useMemo(() => {
    for (const phase of phases) {
      for (const milestone of phase.milestones || []) {
        if (!completedMilestones.includes(milestone.id)) {
          return milestone.id
        }
      }
    }
    return null
  }, [phases, completedMilestones])

  const capstone = roadmapDetails.capstone_project || generatedData?.capstone_project

  return (
    <div data-lenis-prevent className="w-full h-full overflow-y-auto text-left">
      {/* TOP ACTION BAR */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#111]">
        <div>
          <h2 className="text-base font-semibold text-white">{generatedData?.title}</h2>
          <p className="text-xs text-[#555] font-mono mt-0.5">
            {generatedData?.target_role} ·{' '}
            {generatedData?.estimated_duration ||
              generatedData?.roadmap_data?.estimated_total_duration}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Save button */}
          <button
            type="button"
            onClick={onSaveRoadmap}
            disabled={isSaving || !!savedRoadmapId}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              savedRoadmapId
                ? 'border-white text-white'
                : 'border-[#222] text-[#666] hover:border-[#444] hover:text-[#aaa]'
            }`}
          >
            {savedRoadmapId ? 'Saved' : isSaving ? 'Saving...' : 'Save'}
          </button>
          {/* Share button */}
          <button
            type="button"
            onClick={onShareRoadmap}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#222] text-[#666] hover:border-[#444] hover:text-[#aaa] transition-all cursor-pointer"
          >
            Share
          </button>
          {/* New roadmap button */}
          <button
            type="button"
            onClick={onResetGoal}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#222] text-[#666] hover:border-[#444] hover:text-[#aaa] transition-all cursor-pointer"
          >
            New roadmap
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="py-4 border-b border-[#111]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#555]">
            {completedMilestones.length} / {totalMilestonesCount} milestones
          </span>
          <div className="flex-1 h-px bg-[#1a1a1a] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono text-[#444]">{progressPercent}%</span>
        </div>
      </div>

      {/* PHASES */}
      <div className="py-4 space-y-1">
        {phases.map((phase) => {
          const isExpanded = expandedPhases[phase.phase_number] !== false
          const phaseMilestones = phase.milestones || []
          const phaseCompletedCount = phaseMilestones.filter((m) =>
            completedMilestones.includes(m.id)
          ).length
          return (
            <div key={phase.phase_number} id={`phase-section-${phase.phase_number}`}>
              {/* Phase header */}
              <button
                type="button"
                onClick={() => togglePhase(phase.phase_number)}
                className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-white/[0.01] rounded-lg transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#444] w-4">{phase.phase_number}</span>
                  <span className="text-sm font-medium text-white">{phase.title}</span>
                  <span className="text-xs font-mono text-[#444] ml-1">
                    {phase.estimated_duration}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#444]">
                    {phaseCompletedCount}/{phaseMilestones.length}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-[#444] transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Milestones */}
              {isExpanded && (
                <div className="ml-7 space-y-px mb-2">
                  {phaseMilestones.map((milestone) => {
                    const isChecked = completedMilestones.includes(milestone.id)
                    const isActive = !isChecked && milestone.id === firstUncompletedId
                    return (
                      <div
                        key={milestone.id}
                        className={`py-3 px-3 rounded-lg transition-colors ${
                          isActive ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                        }`}
                      >
                        {/* Milestone row */}
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => onToggleMilestone(milestone.id)}
                            className={`mt-0.5 h-4 w-4 rounded flex-shrink-0 border flex items-center justify-center transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-white border-white'
                                : 'border-[#333] hover:border-[#666]'
                            }`}
                            aria-label={`Toggle ${milestone.title}`}
                          >
                            {isChecked && (
                              <svg
                                className="h-2.5 w-2.5 text-black"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M2 6l3 3 5-5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <h4
                                className={`text-sm font-medium ${
                                  isChecked ? 'line-through text-[#444]' : 'text-white'
                                }`}
                              >
                                {milestone.title}
                              </h4>
                              {isActive && (
                                <span className="text-[10px] font-mono text-[#555] flex-shrink-0">
                                  current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#555] mt-0.5 leading-relaxed">
                              {milestone.description}
                            </p>
                            {/* Duration + skills */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {(milestone.estimated_weeks || milestone.duration) && (
                                <span className="text-[10px] font-mono text-[#444]">
                                  {milestone.estimated_weeks || milestone.duration}
                                </span>
                              )}
                              {milestone.key_skills?.slice(0, 4).map((s, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-mono text-[#444] border border-[#1a1a1a] px-1.5 py-px rounded"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                            {/* Action items */}
                            {milestone.action_items?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {milestone.action_items.slice(0, 3).map((item, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <span className="text-[#444] text-xs mt-px">›</span>
                                    <span className="text-xs text-[#555]">{item}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Courses */}
                            {milestone.courses?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {milestone.courses.slice(0, 2).map((course, i) => (
                                  <a
                                    key={i}
                                    href={course.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#888] transition-colors group/link"
                                  >
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{course.title}</span>
                                    {course.platform && (
                                      <span className="text-[10px] text-[#3a3a3a] flex-shrink-0">
                                        · {course.platform}
                                      </span>
                                    )}
                                  </a>
                                ))}
                              </div>
                            )}
                            {/* Project */}
                            {milestone.project && (
                              <div className="mt-2 pl-2 border-l border-[#222]">
                                <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-0.5">
                                  Lab project
                                </p>
                                <p className="text-xs text-[#666]">{milestone.project.title}</p>
                              </div>
                            )}
                            {/* Path details link if provided */}
                            {milestone.learning_path_id && onSelectPath && (
                              <button
                                type="button"
                                onClick={() => onSelectPath(milestone.learning_path_id)}
                                className="mt-2 text-xs text-[#555] hover:text-white transition-colors flex items-center gap-1 font-mono cursor-pointer"
                              >
                                <span>Explore Path</span>
                                <span>→</span>
                              </button>
                            )}
                          </div>
                          <span className="text-xs font-mono text-[#3a3a3a] flex-shrink-0 hidden sm:block">
                            {milestone.estimated_weeks || milestone.duration}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {/* Phase separator */}
              <div className="h-px bg-[#0f0f0f] mx-1" />
            </div>
          )
        })}
      </div>

      {/* CAPSTONE */}
      {capstone && (
        <div className="mt-4 pt-4 border-t border-[#111]">
          <p className="text-xs font-mono text-[#444] uppercase tracking-widest mb-3">
            Capstone Project
          </p>
          <div className="border border-[#1a1a1a] rounded-xl p-5">
            <h3 className="text-base font-semibold text-white">{capstone.title}</h3>
            <p className="text-sm text-[#666] mt-1.5 leading-relaxed">{capstone.description}</p>
            {capstone.tech_stack?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {capstone.tech_stack.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono border border-[#1a1a1a] text-[#555] px-2 py-px rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
