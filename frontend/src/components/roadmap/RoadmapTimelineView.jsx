import { useState } from 'react'
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
} from 'lucide-react'

export default function RoadmapTimelineView({
  generatedData,
  completedMilestones,
  onToggleMilestone,
  onSaveRoadmap,
  onShareRoadmap,
  onResetGoal,
  isSaving,
  savedRoadmapId,
}) {
  const [expandedPhases, setExpandedPhases] = useState({ 1: true, 2: true })

  const roadmapDetails = generatedData?.roadmap_data || null
  const totalMilestonesCount = roadmapDetails?.total_milestones || 8
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

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto pr-1 sm:pr-2 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent select-none">
      {/* ── Top Bar with Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#0084FF]">
            AUTONOMOUS CURRICULUM
          </span>
          <span className="text-white/20">•</span>
          <span className="text-xs font-mono text-neutral-400">
            {generatedData.target_role || generatedData.goal}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetGoal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:border-[#0084FF]/40 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>New Roadmap</span>
          </button>

          <button
            type="button"
            onClick={onShareRoadmap}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:border-[#0084FF]/40 transition-colors cursor-pointer"
          >
            <Share2 className="h-3 w-3" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={onSaveRoadmap}
            disabled={isSaving || savedRoadmapId}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer border ${
              savedRoadmapId
                ? 'border-[#00A3FF]/50 bg-[#00A3FF]/10 text-[#00A3FF]'
                : 'border-[#FF0055]/30 bg-[#FF0055] text-white hover:bg-[#ff1a6b] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_15px_rgba(255,0,85,0.3)]'
            }`}
          >
            {savedRoadmapId ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5" />
                <span>Saved to Profile</span>
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
        className="relative rounded-2xl border border-white/[0.08] bg-[#070709]/85 backdrop-blur-2xl p-5 sm:p-7 space-y-6 overflow-hidden shadow-2xl"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#0084FF]/30 bg-[#0084FF]/10 px-2.5 py-0.5 text-[10px] font-mono text-[#0084FF] uppercase tracking-wider">
                {generatedData.target_role || 'Specialization'}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-400">
                {generatedData.experience_level || 'Beginner'} Baseline
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-neutral-500" />
                {generatedData.estimated_duration || '18 Weeks'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {generatedData.title}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {roadmapDetails?.summary ||
                'Tailored progression architected from fundamental core paradigms to production systems, capstone deployment, and interview mastery.'}
            </p>
          </div>

          {/* Progress Box */}
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-black/60 p-4 shrink-0">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 block">
                COMPLETION
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {completedMilestones.length} / {totalMilestonesCount} Done
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-[#0084FF]">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Laser Progress Bar */}
        <div className="h-[3px] w-full rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0084FF] to-[#FF0055] transition-all duration-500"
            style={{ width: `${Math.max(progressPercent, 4)}%` }}
          />
        </div>

        {/* Architecture Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/[0.06] text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-[#0084FF]" />
            <span>{roadmapDetails?.phases?.length || 4} Tiers</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#0084FF]" />
            <span>{roadmapDetails?.total_courses || 8} Verified Courses</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-3.5 w-3.5 text-[#FF0055]" />
            <span>{roadmapDetails?.total_projects || 5} Repos & Labs</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-[#FF0055]" />
            <span>Capstone Spec</span>
          </div>
        </div>
      </div>

      {/* ── Progressive Phases Breakdown ── */}
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
              className="rounded-2xl border border-white/[0.08] bg-[#070709]/70 overflow-hidden transition-all duration-200 hover:border-white/20"
            >
              {/* Phase Header Accordion Button */}
              <button
                type="button"
                onClick={() => togglePhase(phase.phase_number)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white/[0.015] hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black text-xs font-mono font-bold text-white shrink-0">
                    {phase.phase_number}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                        {phase.title}
                      </h3>
                      <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-neutral-400 shrink-0">
                        {phase.estimated_duration}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {phase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                    {phaseCompletedCount} / {phaseMilestones.length} done
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Milestones Content */}
              {isExpanded && (
                <div className="p-4 sm:p-6 space-y-4 border-t border-white/[0.06]">
                  {phaseMilestones.map((milestone) => {
                    const isChecked = completedMilestones.includes(milestone.id)

                    return (
                      <div
                        key={milestone.id}
                        className={`rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
                          isChecked
                            ? 'border-white/[0.05] bg-black/40 opacity-70'
                            : 'border-white/[0.07] bg-[#070709]/80 hover:border-[#0084FF]/30'
                        }`}
                      >
                        {/* Milestone Top Row: Checkbox + Title + Duration */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => onToggleMilestone(milestone.id)}
                              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-all cursor-pointer shrink-0 ${
                                isChecked
                                  ? 'border-[#0084FF] bg-[#0084FF] text-black shadow-[0_0_10px_rgba(0,132,255,0.4)]'
                                  : 'border-white/20 bg-white/[0.02] hover:border-[#0084FF]'
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>

                            <div className="min-w-0">
                              <h4
                                className={`text-sm font-semibold tracking-tight ${
                                  isChecked
                                    ? 'line-through text-neutral-500'
                                    : 'text-white'
                                }`}
                              >
                                {milestone.title}
                              </h4>
                              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                                {milestone.description}
                              </p>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                            {milestone.duration}
                          </span>
                        </div>

                        {/* Skills Badges */}
                        {milestone.skills && milestone.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-3 pl-8">
                            {milestone.skills.map((skillName, sIdx) => (
                              <span
                                key={sIdx}
                                className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                              >
                                {skillName}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Items */}
                        {milestone.action_items && milestone.action_items.length > 0 && (
                          <div className="mt-3 pl-8 space-y-1.5 border-t border-white/[0.04] pt-3">
                            {milestone.action_items.map((item, aIdx) => (
                              <div
                                key={aIdx}
                                className="flex items-start gap-2 text-xs text-neutral-400"
                              >
                                <span className="text-[#0084FF] font-mono shrink-0">›</span>
                                <span className="leading-snug">{item}</span>
                              </div>
                            ))}
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
    </div>
  )
}
