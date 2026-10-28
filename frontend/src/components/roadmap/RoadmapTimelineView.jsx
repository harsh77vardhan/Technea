import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ExternalLink,
  Check,
  Share2,
  Bookmark,
  BookmarkCheck,
  Edit3,
  Plus,
  Trash2,
  BookOpen,
  Terminal,
  HelpCircle,
  FolderGit2,
  Clock,
  RotateCcw,
  Award,
  Sparkles,
  X,
} from 'lucide-react'

// Curated official documentation lookup by skill/keyword
const OFFICIAL_DOCS_CATALOG = [
  { keyword: 'react', title: 'React Official Documentation', url: 'https://react.dev', provider: 'react.dev' },
  { keyword: 'html', title: 'MDN Web Docs: HTML5 Standards', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', provider: 'Mozilla MDN' },
  { keyword: 'css', title: 'MDN Web Docs: Modern CSS Layouts', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', provider: 'Mozilla MDN' },
  { keyword: 'javascript', title: 'MDN Web Docs: Modern JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', provider: 'Mozilla MDN' },
  { keyword: 'typescript', title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/', provider: 'Microsoft' },
  { keyword: 'python', title: 'Python 3 Standard Documentation', url: 'https://docs.python.org/3/', provider: 'Python.org' },
  { keyword: 'fastapi', title: 'FastAPI High-Performance Guide', url: 'https://fastapi.tiangolo.com/', provider: 'FastAPI' },
  { keyword: 'postgres', title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/', provider: 'PostgreSQL' },
  { keyword: 'sql', title: 'Use The Index, Luke: SQL Indexing', url: 'https://use-the-index-luke.com/', provider: 'SQL Guide' },
  { keyword: 'docker', title: 'Docker Official Documentation', url: 'https://docs.docker.com/', provider: 'Docker Inc' },
  { keyword: 'kubernetes', title: 'Kubernetes Production Concepts', url: 'https://kubernetes.io/docs/concepts/', provider: 'CNCF' },
  { keyword: 'git', title: 'Pro Git Book (Official)', url: 'https://git-scm.com/book/en/v2', provider: 'Git-SCM' },
  { keyword: 'ai', title: 'PyTorch Deep Learning Guides', url: 'https://pytorch.org/tutorials/', provider: 'PyTorch' },
  { keyword: 'machine learning', title: 'Scikit-Learn Machine Learning Docs', url: 'https://scikit-learn.org/stable/', provider: 'Scikit-Learn' },
  { keyword: 'cloud', title: 'AWS Well-Architected Framework', url: 'https://aws.amazon.com/architecture/well-architected/', provider: 'Amazon AWS' },
  { keyword: 'security', title: 'OWASP Top 10 Security Risks', url: 'https://owasp.org/www-project-top-ten/', provider: 'OWASP' },
  { keyword: 'go', title: 'The Go Programming Language Tour', url: 'https://go.dev/tour/', provider: 'Google Go' },
  { keyword: 'rust', title: 'The Rust Programming Language Book', url: 'https://doc.rust-lang.org/book/', provider: 'Rust Foundation' },
]

function getOfficialDocsForMilestone(milestone) {
  const text = `${milestone.title} ${milestone.category} ${(milestone.key_skills || []).join(' ')}`.toLowerCase()
  const matched = OFFICIAL_DOCS_CATALOG.filter((doc) => text.includes(doc.keyword))
  if (matched.length > 0) return matched.slice(0, 3)
  return [
    { title: 'MDN Developer Reference', url: 'https://developer.mozilla.org', provider: 'MDN Web' },
    { title: 'DevDocs Fast API & Reference', url: 'https://devdocs.io', provider: 'DevDocs' },
  ]
}

function getInterviewQuestionsForMilestone(milestone) {
  const title = milestone.title || 'Technical Milestone'
  const skills = (milestone.key_skills || []).slice(0, 2).join(', ') || 'core principles'

  return [
    {
      question: `How do the core architectural principles of ${title} ensure scalability and maintainability?`,
      hint: `Focus on modular separation of concerns, deterministic data flow, and avoiding unintended side-effects in ${skills}.`,
    },
    {
      question: `What are the most common performance bottlenecks or memory pitfalls when implementing ${skills}?`,
      hint: `Address latency overhead, resource lifecycle management, unindexed queries or unbounded listeners, and profiling strategies.`,
    },
    {
      question: `In a production incident involving ${title}, what telemetry and debugging steps would you execute first?`,
      hint: `Explain log tracing, correlation IDs, isolating reproduction steps, and applying safe zero-downtime hotfixes.`,
    },
  ]
}

function getLessonsBreakdown(milestone) {
  if (milestone.lessons && Array.isArray(milestone.lessons) && milestone.lessons.length > 0) {
    return milestone.lessons
  }

  const actions = milestone.action_items || []
  if (actions.length >= 3) {
    return actions.map((act, i) => ({
      title: `Lesson ${i + 1}: ${act.split(/[:,.]/)[0] || act.slice(0, 40)}`,
      detail: act,
      duration: '45 mins',
    }))
  }

  const skills = milestone.key_skills || ['Foundational Theory', 'Implementation Architecture', 'Testing & Profiling']
  return skills.map((skill, i) => ({
    title: `Lesson ${i + 1}: ${skill} Core Concepts`,
    detail: `Deep dive into ${skill} syntax, standard library abstractions, and real-world execution.`,
    duration: '45 mins',
  }))
}

export default function RoadmapTimelineView({
  generatedData,
  completedMilestones = [],
  onToggleMilestone,
  onSaveRoadmap,
  onShareRoadmap,
  onRegenerate,
  onUpdateRoadmap,
  onResetGoal,
  isSaving = false,
  savedRoadmapId = null,
  onSelectPath,
}) {
  const roadmapDetails = generatedData?.roadmap_data || generatedData || {}
  const rawPhases = useMemo(() => roadmapDetails.phases || [], [roadmapDetails.phases])

  // Local state for interactive editing mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedTitle, setEditedTitle] = useState(() => generatedData?.title || 'Personalized Career Roadmap')
  const [localPhases, setLocalPhases] = useState(rawPhases)

  // Track expanded phases
  const [expandedPhases, setExpandedPhases] = useState(() => {
    const initial = {}
    rawPhases.forEach((p) => {
      initial[p.phase_number] = true
    })
    return initial
  })

  // Track active detail tab for each milestone: 'curriculum' | 'docs' | 'project' | 'tasks' | 'interview'
  const [milestoneTabs, setMilestoneTabs] = useState({})

  // Track expanded milestone drilldowns
  const [expandedMilestones, setExpandedMilestones] = useState({})

  // Track interview question hint toggles: { `${milestoneId}-${qIdx}`: boolean }
  const [revealedHints, setRevealedHints] = useState({})

  // Add milestone form modal / popover state: { phaseNumber: number } | null
  const [addingToPhase, setAddingToPhase] = useState(null)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newMilestoneDuration, setNewMilestoneDuration] = useState('2 Weeks')
  const [newMilestoneSkills, setNewMilestoneSkills] = useState('')

  // Inline editing for milestone titles: { [milestoneId]: string }
  const [editingMilestoneId, setEditingMilestoneId] = useState(null)
  const [tempMilestoneTitle, setTempMilestoneTitle] = useState('')

  // Sync when generatedData changes externally
  const phases = isEditMode ? localPhases : rawPhases

  // Total milestones calculation
  const totalMilestonesCount = useMemo(() => {
    return phases.reduce((acc, p) => acc + (p.milestones?.length || 0), 0) || 8
  }, [phases])

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

  const toggleMilestoneExpand = (milestoneId) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [milestoneId]: !prev[milestoneId],
    }))
  }

  const setTabForMilestone = (milestoneId, tabName) => {
    setMilestoneTabs((prev) => ({
      ...prev,
      [milestoneId]: tabName,
    }))
  }

  const toggleHint = (key) => {
    setRevealedHints((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Edit Mode actions
  const handleSaveEdits = () => {
    setIsEditMode(false)
    const updatedData = {
      ...generatedData,
      title: editedTitle,
      roadmap_data: {
        ...roadmapDetails,
        phases: localPhases,
        total_milestones: totalMilestonesCount,
      },
    }
    onUpdateRoadmap?.(updatedData)
  }

  const handleStartRenameMilestone = (milestone) => {
    setEditingMilestoneId(milestone.id)
    setTempMilestoneTitle(milestone.title)
  }

  const handleSaveRenameMilestone = (phaseNumber, milestoneId) => {
    if (!tempMilestoneTitle.trim()) return
    setLocalPhases((prevPhases) =>
      prevPhases.map((phase) => {
        if (phase.phase_number !== phaseNumber) return phase
        return {
          ...phase,
          milestones: (phase.milestones || []).map((m) =>
            m.id === milestoneId ? { ...m, title: tempMilestoneTitle.trim() } : m
          ),
        }
      })
    )
    setEditingMilestoneId(null)
  }

  const handleDeleteMilestone = (phaseNumber, milestoneId) => {
    setLocalPhases((prevPhases) =>
      prevPhases.map((phase) => {
        if (phase.phase_number !== phaseNumber) return phase
        return {
          ...phase,
          milestones: (phase.milestones || []).filter((m) => m.id !== milestoneId),
        }
      })
    )
  }

  const handleAddMilestoneSubmit = (e) => {
    e?.preventDefault()
    if (!newMilestoneTitle.trim() || addingToPhase === null) return

    const newId = `m-${addingToPhase}-${Date.now().toString(36)}`
    const skillsArray = newMilestoneSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const newMilestone = {
      id: newId,
      step_number: 99,
      title: newMilestoneTitle.trim(),
      description: 'Custom milestone added to tailor your personal engineering trajectory.',
      estimated_weeks: newMilestoneDuration.trim() || '2 Weeks',
      category: 'Custom Topic',
      key_skills: skillsArray.length > 0 ? skillsArray : ['Specialized Skills'],
      action_items: [
        'Explore official core documentation and syntax specifications',
        'Build targeted proof-of-concept project validating architecture',
        'Complete coding drills and benchmark performance',
      ],
      courses: [],
      project: {
        title: `${newMilestoneTitle.trim()} Lab Prototype`,
        description: 'Hands-on project verifying practical competency in this milestone.',
        tech_stack: skillsArray.length > 0 ? skillsArray : ['Modern Stack'],
        key_features: ['Clean modular architecture', 'End-to-end testing suite'],
        difficulty: 'Intermediate',
      },
    }

    setLocalPhases((prevPhases) =>
      prevPhases.map((phase) => {
        if (phase.phase_number !== addingToPhase) return phase
        return {
          ...phase,
          milestones: [...(phase.milestones || []), newMilestone],
        }
      })
    )

    setNewMilestoneTitle('')
    setNewMilestoneDuration('2 Weeks')
    setNewMilestoneSkills('')
    setAddingToPhase(null)
  }

  const capstone = roadmapDetails.capstone_project || generatedData?.capstone_project

  return (
    <div data-lenis-prevent className="w-full text-left space-y-6">
      {/* ── TOP ACTION BAR & METADATA ──────────────────────── */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditMode ? (
            <div className="max-w-md">
              <label
                htmlFor="roadmap-title-edit"
                className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1"
              >
                Roadmap Title
              </label>
              <input
                id="roadmap-title-edit"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/[0.2] rounded-lg px-3 py-1.5 text-base font-semibold text-white focus:outline-none focus:border-white"
              />
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-300">
                  {generatedData?.target_role || roadmapDetails.target_role || 'Synthesized Track'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {generatedData?.title || 'Personalized Career Roadmap'}
              </h1>
              <p className="text-xs text-neutral-400 font-mono mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                <span>
                  ⏱ {generatedData?.estimated_duration || roadmapDetails.estimated_total_duration || '16 Weeks'}
                </span>
                <span>•</span>
                <span>Tier: {generatedData?.experience_level || 'Beginner'}</span>
                <span>•</span>
                <span>{totalMilestonesCount} Milestones</span>
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit toggle */}
          {isEditMode ? (
            <button
              type="button"
              onClick={handleSaveEdits}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Done Editing</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setLocalPhases(rawPhases)
                setEditedTitle(generatedData?.title || 'Personalized Career Roadmap')
                setIsEditMode(true)
              }}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-white/[0.1] bg-[#0a0a0a]/90 text-neutral-300 hover:text-white hover:border-white/[0.25] transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Roadmap</span>
            </button>
          )}

          {/* Regenerate button */}
          <button
            type="button"
            onClick={onRegenerate || onResetGoal}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-white/[0.1] bg-[#0a0a0a]/90 text-neutral-300 hover:text-white hover:border-white/[0.25] transition-all cursor-pointer"
            title="Modify parameters and regenerate"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          {/* Save button */}
          <button
            type="button"
            onClick={onSaveRoadmap}
            disabled={isSaving || Boolean(savedRoadmapId)}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              savedRoadmapId
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-white/[0.1] bg-[#0a0a0a]/90 text-neutral-300 hover:text-white hover:border-white/[0.25]'
            }`}
          >
            {savedRoadmapId ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : isSaving ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save to Account</span>
              </>
            )}
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={onShareRoadmap}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-white/[0.1] bg-[#0a0a0a]/90 text-neutral-300 hover:text-white hover:border-white/[0.25] transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ── REAL-TIME PROGRESS & CHECKPOINTS BAR ─────────────── */}
      <div className="p-4 rounded-2xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/[0.08] shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-neutral-300" />
            <span className="text-xs font-mono text-neutral-300 font-medium">
              Progress: {completedMilestones.length} of {totalMilestonesCount} Milestones Completed
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-white tracking-widest">
            {progressPercent}%
          </span>
        </div>
        <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-neutral-200 via-white to-neutral-200 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.7)]"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[11px] text-neutral-500 font-mono mt-2">
          Check off completed milestones below to recalculate your real-time progress.
        </p>
      </div>

      {/* ── PHASES LIST & RICH MILESTONES ──────────────────── */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const isPhaseExpanded = expandedPhases[phase.phase_number] !== false
          const phaseMilestones = phase.milestones || []
          const phaseCompletedCount = phaseMilestones.filter((m) =>
            completedMilestones.includes(m.id)
          ).length

          return (
            <div
              key={phase.phase_number}
              className="rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/[0.08] overflow-hidden transition-all"
            >
              {/* Phase Header Accordion */}
              <button
                type="button"
                onClick={() => togglePhase(phase.phase_number)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg border border-white/[0.1] bg-white/[0.04] flex items-center justify-center font-mono text-xs font-bold text-white flex-shrink-0">
                    0{phase.phase_number}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-white group-hover:text-neutral-100 transition-colors truncate">
                      {phase.title}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                      {phase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded border border-white/[0.06] bg-neutral-900/50">
                    {phaseCompletedCount}/{phaseMilestones.length} done
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                    {phase.estimated_duration}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                      isPhaseExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Milestones Container */}
              <AnimatePresence initial={false}>
                {isPhaseExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-white/[0.06] px-3 sm:px-5 py-4 space-y-3"
                  >
                    {phaseMilestones.map((milestone, idx) => {
                      const isChecked = completedMilestones.includes(milestone.id)
                      const isDetailExpanded = expandedMilestones[milestone.id] ?? (idx === 0)
                      const activeTab = milestoneTabs[milestone.id] || 'curriculum'
                      const isEditingThis = editingMilestoneId === milestone.id

                      const officialDocs = getOfficialDocsForMilestone(milestone)
                      const interviewQuestions = getInterviewQuestionsForMilestone(milestone)
                      const lessons = getLessonsBreakdown(milestone)
                      const project = milestone.project

                      return (
                        <div
                          key={milestone.id}
                          className={`rounded-xl border transition-all ${
                            isChecked
                              ? 'border-white/[0.06] bg-white/[0.01]'
                              : 'border-white/[0.09] bg-[#0d0d0d]/90 hover:border-white/[0.18]'
                          }`}
                        >
                          {/* Milestone Summary Header Row */}
                          <div className="p-3.5 sm:p-4 flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => onToggleMilestone?.(milestone.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                                isChecked
                                  ? 'border-white bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                                  : 'border-white/[0.2] bg-neutral-900/60 hover:border-white/[0.4]'
                              }`}
                              aria-label={`Mark ${milestone.title} as completed`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                            </button>

                            {/* Title & metadata */}
                            <div className="flex-1 min-w-0">
                              {isEditingThis ? (
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={tempMilestoneTitle}
                                    onChange={(e) => setTempMilestoneTitle(e.target.value)}
                                    className="flex-1 bg-black border border-white/30 rounded px-2 py-1 text-sm text-white focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveRenameMilestone(phase.phase_number, milestone.id)}
                                    className="px-2 py-1 bg-white text-black text-xs font-semibold rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingMilestoneId(null)}
                                    className="px-2 py-1 text-xs text-neutral-400"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h3
                                    className={`text-sm font-semibold transition-colors ${
                                      isChecked ? 'line-through text-neutral-500' : 'text-white'
                                    }`}
                                  >
                                    {milestone.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-neutral-400 border border-white/[0.08] px-1.5 py-0.5 rounded">
                                      {milestone.estimated_weeks || milestone.duration || '2 Weeks'}
                                    </span>
                                    {isEditMode && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleStartRenameMilestone(milestone)}
                                          className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                                          title="Rename milestone"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMilestone(phase.phase_number, milestone.id)}
                                          className="text-red-400/70 hover:text-red-400 p-1 cursor-pointer"
                                          title="Delete milestone"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                                {milestone.description}
                              </p>

                              {/* Skills chips */}
                              {milestone.key_skills?.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  {milestone.key_skills.map((skill, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="text-[10px] font-mono text-neutral-400 border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Toggle expand drilldown details */}
                              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/[0.04]">
                                <button
                                  type="button"
                                  onClick={() => toggleMilestoneExpand(milestone.id)}
                                  className="text-[11px] font-mono text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>{isDetailExpanded ? 'Hide Details' : 'View Curriculum & Resources'}</span>
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${
                                      isDetailExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>

                                {milestone.learning_path_id && onSelectPath && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectPath(milestone.learning_path_id)}
                                    className="text-[11px] font-mono text-neutral-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Explore Catalog Path</span>
                                    <span>→</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* ── EXPANDABLE RICH DETAIL TABS ────── */}
                          <AnimatePresence>
                            {isDetailExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-white/[0.06] bg-black/40 p-3.5 sm:p-4 rounded-b-xl"
                              >
                                {/* Tab selector */}
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-4 pb-2 border-b border-white/[0.06]">
                                  {[
                                    { id: 'curriculum', label: 'Lessons Breakdown', icon: BookOpen },
                                    { id: 'docs', label: 'Official Docs', icon: ExternalLink },
                                    { id: 'project', label: 'Hands-on Project', icon: FolderGit2 },
                                    { id: 'tasks', label: 'Practice Tasks', icon: Terminal },
                                    { id: 'interview', label: 'Interview Prep', icon: HelpCircle },
                                  ].map((tab) => {
                                    const TabIcon = tab.icon
                                    const isTabActive = activeTab === tab.id
                                    return (
                                      <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setTabForMilestone(milestone.id, tab.id)}
                                        className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                          isTabActive
                                            ? 'bg-white text-black font-semibold'
                                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                                        }`}
                                      >
                                        <TabIcon className="w-3 h-3" />
                                        <span>{tab.label}</span>
                                      </button>
                                    )
                                  })}
                                </div>

                                {/* TAB 1: CURRICULUM & LESSONS BREAKDOWN */}
                                {activeTab === 'curriculum' && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                                      Curriculum Topics & Lessons
                                    </p>
                                    {lessons.map((lesson, lIdx) => (
                                      <div
                                        key={lIdx}
                                        className="p-2.5 rounded-lg bg-neutral-900/40 border border-white/[0.04] flex items-start justify-between gap-3"
                                      >
                                        <div className="flex items-start gap-2">
                                          <span className="text-neutral-500 font-mono text-xs mt-0.5">
                                            {lIdx + 1}.
                                          </span>
                                          <div>
                                            <h4 className="text-xs font-medium text-white">{lesson.title}</h4>
                                            <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                                              {lesson.detail}
                                            </p>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-mono text-neutral-500 flex-shrink-0">
                                          {lesson.duration || '45m'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* TAB 2: OFFICIAL RESOURCES & DOCUMENTATION */}
                                {activeTab === 'docs' && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                                      Official Standards & Documentation
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {officialDocs.map((doc, dIdx) => (
                                        <a
                                          key={dIdx}
                                          href={doc.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-2.5 rounded-lg bg-neutral-900/40 border border-white/[0.06] hover:border-white/[0.2] hover:bg-white/[0.02] transition-all flex items-center justify-between gap-2 group cursor-pointer"
                                        >
                                          <div className="min-w-0">
                                            <h4 className="text-xs font-medium text-white group-hover:text-neutral-200 truncate">
                                              {doc.title}
                                            </h4>
                                            <span className="text-[10px] font-mono text-neutral-400">
                                              {doc.provider}
                                            </span>
                                          </div>
                                          <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white flex-shrink-0" />
                                        </a>
                                      ))}

                                      {/* Catalog course references if available */}
                                      {milestone.courses?.map((course, cIdx) => (
                                        <a
                                          key={`c-${cIdx}`}
                                          href={course.url || '#'}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-2.5 rounded-lg bg-neutral-900/40 border border-white/[0.06] hover:border-white/[0.2] hover:bg-white/[0.02] transition-all flex items-center justify-between gap-2 group cursor-pointer"
                                        >
                                          <div className="min-w-0">
                                            <h4 className="text-xs font-medium text-white group-hover:text-neutral-200 truncate">
                                              {course.title}
                                            </h4>
                                            <span className="text-[10px] font-mono text-neutral-400">
                                              {course.platform || 'Verified Course'} · {course.duration || 'Self-paced'}
                                            </span>
                                          </div>
                                          <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white flex-shrink-0" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* TAB 3: HANDS-ON PROJECTS */}
                                {activeTab === 'project' && (
                                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-neutral-950/60">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                                        Milestone Project Blueprint
                                      </p>
                                      <span className="text-[10px] font-mono text-neutral-300 border border-white/[0.1] px-2 py-0.5 rounded">
                                        {project?.difficulty || 'Intermediate'} Tier
                                      </span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-white">
                                      {project?.title || `${milestone.title} Practical Lab`}
                                    </h4>
                                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                                      {project?.description ||
                                        'Construct an end-to-end working implementation proving mastery of this milestone.'}
                                    </p>

                                    {/* Tech stack */}
                                    {project?.tech_stack?.length > 0 && (
                                      <div className="mt-3">
                                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                                          Architecture & Stack:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {project.tech_stack.map((t, tIdx) => (
                                            <span
                                              key={tIdx}
                                              className="text-[10px] font-mono text-neutral-300 border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 rounded"
                                            >
                                              {t}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Key deliverables */}
                                    {project?.key_features?.length > 0 && (
                                      <div className="mt-3 pt-2 border-t border-white/[0.04]">
                                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                                          Core Deliverables:
                                        </span>
                                        <ul className="space-y-1">
                                          {project.key_features.map((feat, fIdx) => (
                                            <li key={fIdx} className="text-xs text-neutral-400 flex items-start gap-1.5">
                                              <span className="text-neutral-500">›</span>
                                              <span>{feat}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* TAB 4: PRACTICE TASKS (CODING DRILLS) */}
                                {activeTab === 'tasks' && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                                      Targeted Practice Tasks & Coding Drills
                                    </p>
                                    {(milestone.action_items || []).map((task, tIdx) => (
                                      <div
                                        key={tIdx}
                                        className="p-2.5 rounded-lg bg-neutral-900/40 border border-white/[0.04] flex items-start gap-2.5"
                                      >
                                        <Terminal className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-neutral-300 leading-relaxed">
                                          {task}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* TAB 5: INTERVIEW PREPARATION */}
                                {activeTab === 'interview' && (
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                                      Targeted Technical Interview Questions
                                    </p>
                                    {interviewQuestions.map((iq, qIdx) => {
                                      const hintKey = `${milestone.id}-${qIdx}`
                                      const isRevealed = revealedHints[hintKey]
                                      return (
                                        <div
                                          key={qIdx}
                                          className="p-3 rounded-lg bg-neutral-900/40 border border-white/[0.04] space-y-2"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-2">
                                              <span className="text-xs font-mono text-neutral-500 font-bold">
                                                Q{qIdx + 1}:
                                              </span>
                                              <h4 className="text-xs font-medium text-white leading-relaxed">
                                                {iq.question}
                                              </h4>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => toggleHint(hintKey)}
                                              className="text-[10px] font-mono text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-white/[0.08] flex-shrink-0 cursor-pointer"
                                            >
                                              {isRevealed ? 'Hide Answer Guide' : 'Reveal Answer Guide'}
                                            </button>
                                          </div>
                                          {isRevealed && (
                                            <motion.div
                                              initial={{ opacity: 0, y: 4 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              className="pl-5 pt-1 text-[11px] text-neutral-400 border-l border-white/[0.1] leading-relaxed"
                                            >
                                              <span className="font-semibold text-neutral-300 font-mono text-[10px] block mb-0.5">
                                                KEY CONCEPTS TO ADDRESS:
                                              </span>
                                              {iq.hint}
                                            </motion.div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}

                    {/* Add Milestone to Phase button (in Edit Mode) */}
                    {isEditMode && (
                      <div className="pt-2">
                        {addingToPhase === phase.phase_number ? (
                          <div className="p-4 rounded-xl border border-white/[0.2] bg-black space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                                Add Custom Milestone to Phase {phase.phase_number}
                              </h4>
                              <button
                                type="button"
                                onClick={() => setAddingToPhase(null)}
                                className="text-neutral-500 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={newMilestoneTitle}
                              onChange={(e) => setNewMilestoneTitle(e.target.value)}
                              placeholder="Milestone Title (e.g. Distributed Caching with Redis)"
                              className="w-full bg-neutral-900 border border-white/[0.15] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={newMilestoneDuration}
                                onChange={(e) => setNewMilestoneDuration(e.target.value)}
                                placeholder="Duration (e.g. 2 Weeks)"
                                className="bg-neutral-900 border border-white/[0.15] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                              />
                              <input
                                type="text"
                                value={newMilestoneSkills}
                                onChange={(e) => setNewMilestoneSkills(e.target.value)}
                                placeholder="Skills (comma separated)"
                                className="bg-neutral-900 border border-white/[0.15] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setAddingToPhase(null)}
                                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleAddMilestoneSubmit}
                                className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200"
                              >
                                Add Milestone
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAddingToPhase(phase.phase_number)}
                            className="w-full py-2.5 rounded-xl border border-dashed border-white/[0.15] hover:border-white/[0.3] text-neutral-400 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Milestone to Phase {phase.phase_number}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* ── CAPSTONE PROJECT BLUEPRINT ─────────────────────── */}
      {capstone && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/[0.12] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
              Grand Capstone Portfolio Project
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {capstone.title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed max-w-2xl">
            {capstone.description}
          </p>

          {/* Tech stack */}
          {capstone.tech_stack?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {capstone.tech_stack.map((tech, i) => (
                <span
                  key={i}
                  className="text-xs font-mono text-neutral-300 border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 rounded-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Key deliverables */}
          {capstone.key_features?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.08]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                Production Deliverables:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {capstone.key_features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                    <Check className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
