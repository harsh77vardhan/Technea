import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Terminal,
  Database,
  Cloud,
  Shield,
  Award,
  FolderGit2,
  X,
} from 'lucide-react'

/**
 * Icons mapping for technical milestone categories
 */
const MILESTONE_ICONS = {
  foundations: Terminal,
  syntax: Code2,
  architecture: Layers,
  oop: Cpu,
  database: Database,
  api: Cloud,
  security: Shield,
  testing: CheckCircle2,
  capstone: Award,
}

function resolveNodeIcon(title = '', idx = 0) {
  const t = title.toLowerCase()
  if (t.includes('syntax') || t.includes('intro') || t.includes('foundations') || t.includes('setup')) return Terminal
  if (t.includes('loop') || t.includes('function') || t.includes('logic')) return Code2
  if (t.includes('oop') || t.includes('class') || t.includes('pattern') || t.includes('architecture')) return Cpu
  if (t.includes('data') || t.includes('sql') || t.includes('state') || t.includes('store')) return Database
  if (t.includes('api') || t.includes('web') || t.includes('network') || t.includes('cloud')) return Cloud
  if (t.includes('test') || t.includes('quality') || t.includes('debug')) return CheckCircle2
  if (t.includes('security') || t.includes('auth')) return Shield
  if (t.includes('project') || t.includes('capstone') || t.includes('deploy')) return Award
  const keys = Object.values(MILESTONE_ICONS)
  return keys[idx % keys.length] || Layers
}

export default function RoadmapTreeVisualization({
  roadmap,
  completedMilestoneIds = [],
  onStartLesson = () => {},
  onToggleMilestone = () => {},
  isReadOnly = false,
}) {
  const [selectedNode, setSelectedNode] = useState(null)
  const [activeTab, setActiveTab] = useState('tree') // 'tree' | 'list'

  const completedSet = useMemo(() => {
    return new Set((completedMilestoneIds || []).map((id) => String(id)))
  }, [completedMilestoneIds])

  // Normalizes roadmap steps / phases into a structured skill tree hierarchy
  const treeData = useMemo(() => {
    if (!roadmap) {
      return {
        rootTitle: 'Engineering Track',
        targetRole: 'Software Engineer',
        branches: [],
      }
    }

    const rootTitle = roadmap.title || 'Technical Roadmap'
    const targetRole = roadmap.target_role || roadmap.category || 'Specialist'

    // Case 1: AI Generated roadmap with structured phases
    if (roadmap.roadmap_data?.phases && Array.isArray(roadmap.roadmap_data.phases)) {
      let firstUncompletedFound = false
      const branches = roadmap.roadmap_data.phases.map((ph, pIdx) => {
        const milestones = (ph.milestones || []).map((ms, mIdx) => {
          const id = String(ms.id || `ph-${pIdx}-ms-${mIdx}`)
          const isDone = completedSet.has(id)
          let isCurrent = false
          let isLocked = false

          if (isDone) {
            // Already completed
          } else if (!firstUncompletedFound) {
            isCurrent = true
            firstUncompletedFound = true
          } else {
            isLocked = true
          }

          return {
            id,
            title: ms.title,
            description: ms.description || 'Master core architectural skills and practical implementation.',
            estimated_time: ms.estimated_time || '35 mins',
            skills: ms.skills || ms.key_skills || ['Syntax', 'Architecture'],
            course_id: ms.courses?.[0]?.id || ms.course_id || 182,
            lesson_id: ms.courses?.[0]?.lesson_id || ms.lesson_id || 241,
            isCompleted: isDone,
            isCurrent,
            isLocked,
            project: ms.project_ideas?.[0] || ms.project || null,
            quiz: ms.quizzes?.[0] || null,
            practice: ms.practice_tasks?.[0] || 'Implement practical exercise without external helpers.',
          }
        })

        return {
          id: `branch-${pIdx}`,
          name: ph.title.replace(/^Phase\s+\d+:\s*/i, ''),
          fullTitle: ph.title,
          description: ph.description || 'Progressive learning phase',
          milestones,
          branchProject: ph.milestones?.find((m) => m.project_ideas?.length)?.project_ideas?.[0] || null,
        }
      })

      return { rootTitle, targetRole, branches }
    }

    // Case 2: Curated LearningPath with roadmap_steps
    const rawSteps = Array.isArray(roadmap.roadmap_steps)
      ? roadmap.roadmap_steps
      : Array.isArray(roadmap.steps)
      ? roadmap.steps
      : []

    // Distribute flat steps into 3 to 4 progressive skill branches
    const total = rawSteps.length || 6
    const chunkSize = Math.max(2, Math.ceil(total / 3))
    const branchNames = [
      { name: 'Core Foundations', desc: 'Syntax, data types, control flow & memory layout' },
      { name: 'Architecture & Design', desc: 'Object-oriented patterns, modular design & clean code' },
      { name: 'Applied APIs & Data', desc: 'Networking, database integration, async & testing' },
      { name: 'Production & Capstone', desc: 'Deployment, CI/CD, telemetry & production deliverable' },
    ]

    let firstUncompletedFound = false
    const branches = []
    let stepCursor = 0

    branchNames.forEach((bMeta, bIdx) => {
      const slice = rawSteps.slice(stepCursor, stepCursor + chunkSize)
      if (slice.length === 0 && bIdx > 0) return

      const milestones = slice.map((st, sIdx) => {
        const id = String(st.id || `step-${st.step_number || stepCursor + sIdx + 1}`)
        const isDone = completedSet.has(id) || completedSet.has(String(st.step_number))
        let isCurrent = false
        let isLocked = false

        if (isDone) {
          // Completed
        } else if (!firstUncompletedFound) {
          isCurrent = true
          firstUncompletedFound = true
        } else {
          isLocked = true
        }

        const fallbackSkills = st.topics || ['Foundations', 'Implementation']

        return {
          id,
          title: st.title || `Milestone ${stepCursor + sIdx + 1}`,
          description: st.description || 'Master core architectural skills and practical implementation.',
          estimated_time: st.duration || '45 mins',
          skills: Array.isArray(fallbackSkills) ? fallbackSkills : [fallbackSkills],
          course_id: st.course_id || 182,
          lesson_id: st.lesson_id || 241,
          isCompleted: isDone,
          isCurrent,
          isLocked,
          project: st.project_idea || (bIdx >= 1 ? `Hands-on ${st.title} Micro-lab` : null),
          quiz: { question: `How does ${st.title} behave in high-concurrency systems?`, passed: isDone },
          practice: `Build an end-to-end prototype applying ${st.title}.`,
        }
      })

      branches.push({
        id: `branch-${bIdx}`,
        name: bMeta.name,
        fullTitle: `Phase ${bIdx + 1}: ${bMeta.name}`,
        description: bMeta.desc,
        milestones,
        branchProject: milestones.find((m) => m.project)?.project || null,
      })

      stepCursor += slice.length
    })

    return { rootTitle, targetRole, branches }
  }, [roadmap, completedSet])

  // Count overall progress
  const totalMilestonesCount = useMemo(() => {
    return treeData.branches.reduce((acc, b) => acc + b.milestones.length, 0)
  }, [treeData])

  const completedCount = useMemo(() => {
    return treeData.branches.reduce(
      (acc, b) => acc + b.milestones.filter((m) => m.isCompleted).length,
      0
    )
  }, [treeData])

  const progressPercent = totalMilestonesCount > 0 ? Math.round((completedCount / totalMilestonesCount) * 100) : 0

  const handleNodeClick = useCallback((node, branch) => {
    setSelectedNode({ ...node, branchName: branch.name, branchFullTitle: branch.fullTitle })
  }, [])

  return (
    <div className="relative w-full rounded-3xl border border-[#262320] bg-[#121110] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden text-[#faf6ee]">
      {/* Subtle ambient burnt orange background glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#c25e2e]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#d97b48]/8 blur-[100px]" />

      {/* ── HEADER / CONTROLS ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262320]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c25e2e] shadow-[0_0_10px_rgba(194,94,46,0.8)]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#e87a48] font-semibold">
              Interactive Skill Tree Engine
            </span>
            <span className="text-xs text-[#a8a199]">·</span>
            <span className="text-xs text-[#a8a199] font-normal">
              {completedCount} of {totalMilestonesCount} Nodes Unlocked ({progressPercent}%)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#faf6ee] mt-1.5">
            {treeData.rootTitle}
          </h2>
          <p className="text-xs text-[#a8a199] mt-1 max-w-2xl font-normal leading-relaxed">
            Branch-based mastery roadmap. Progress through nodes sequentially to unlock downstream specializations and capstone projects.
          </p>
        </div>

        {/* View switcher & legend */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-[#a8a199] border-r border-[#262320] pr-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#c25e2e]" />
              <span>Current</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Mastered</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3d3835]" />
              <span>Locked</span>
            </span>
          </div>

          <div className="flex items-center rounded-full border border-[#262320] bg-[#181614] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('tree')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'tree'
                  ? 'bg-[#c25e2e] text-[#faf6ee] shadow-sm'
                  : 'text-[#a8a199] hover:text-[#faf6ee]'
              }`}
            >
              Tree View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#c25e2e] text-[#faf6ee] shadow-sm'
                  : 'text-[#a8a199] hover:text-[#faf6ee]'
              }`}
            >
              Linear List
            </button>
          </div>
        </div>
      </div>

      {/* ── TREE VIEW RENDERING ──────────────────────────────────────────── */}
      {activeTab === 'tree' && (
        <div className="relative z-10 pt-10 pb-6 flex flex-col items-center">
          {/* 1. ROOT APEX NODE (Target Career Role / Specialization) */}
          <div className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative px-6 py-3.5 rounded-2xl border-2 border-[#c25e2e] bg-[#faf6ee] text-[#181614] shadow-[0_0_24px_rgba(194,94,46,0.35)] flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-xl bg-[#c25e2e] text-[#faf6ee] flex items-center justify-center font-bold text-sm shadow-inner">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#c25e2e] font-semibold block">
                  Root Objective
                </span>
                <span className="text-base font-medium tracking-tight text-[#181614]">
                  {treeData.rootTitle}
                </span>
              </div>
              <span className="ml-2 rounded-full bg-[#181614] text-[#faf6ee] text-[10px] font-mono px-2 py-0.5">
                {treeData.targetRole}
              </span>
            </motion.div>

            {/* Central Vertical Trunk Line */}
            <div className="w-0.5 h-10 bg-gradient-to-b from-[#c25e2e] to-[#c25e2e]/40" />
          </div>

          {/* 2. HORIZONTAL TRUNK CROSSBAR (Branch Splitting Conduit) */}
          <div className="w-full max-w-5xl relative hidden md:block">
            {/* Horizontal Bar */}
            <div className="h-0.5 w-full bg-[#3d3835] relative">
              <div
                className="h-0.5 bg-gradient-to-r from-[#c25e2e] via-[#e87a48] to-[#3d3835] transition-all duration-700"
                style={{ width: `${Math.max(20, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* 3. MULTI-BRANCH COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full max-w-6xl mt-2 sm:mt-0">
            {treeData.branches.map((branch, bIdx) => {
              const branchCompleted = branch.milestones.every((m) => m.isCompleted)
              const branchHasCurrent = branch.milestones.some((m) => m.isCurrent)

              return (
                <div key={branch.id} className="flex flex-col items-center">
                  {/* Vertical branch drop connector line */}
                  <div className="w-0.5 h-6 bg-[#3d3835] hidden md:block" />

                  {/* Branch Category Header Card */}
                  <div
                    className={`w-full rounded-2xl border p-4 mb-4 transition-all duration-200 ${
                      branchHasCurrent
                        ? 'border-[#c25e2e]/50 bg-[#1e1c1a] text-[#faf6ee]'
                        : branchCompleted
                        ? 'border-emerald-500/30 bg-[#161a17] text-[#faf6ee]'
                        : 'border-[#262320] bg-[#141312] text-[#a8a199]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#e87a48]">
                        Phase 0{bIdx + 1}
                      </span>
                      {branchCompleted ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Mastered</span>
                        </span>
                      ) : branchHasCurrent ? (
                        <span className="text-[10px] font-mono text-[#c25e2e] flex items-center gap-1 animate-pulse">
                          <span>● In Progress</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#786f66]">Upcoming</span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-[#faf6ee] tracking-tight">{branch.name}</h3>
                    <p className="text-[11px] text-[#a8a199] mt-0.5 line-clamp-1">{branch.description}</p>
                  </div>

                  {/* Sequential Skill Nodes within this Branch */}
                  <div className="w-full space-y-4 relative">
                    {branch.milestones.map((node, nIdx) => {
                      const IconComp = resolveNodeIcon(node.title, nIdx)

                      return (
                        <div key={node.id} className="relative flex flex-col items-center">
                          {/* Inter-node connecting line */}
                          {nIdx > 0 && (
                            <div
                              className={`w-0.5 h-4 -mt-2 mb-2 ${
                                node.isCompleted ? 'bg-emerald-500/50' : node.isCurrent ? 'bg-[#c25e2e]/60' : 'bg-[#262320]'
                              }`}
                            />
                          )}

                          {/* Individual Node Card */}
                          <motion.button
                            type="button"
                            whileHover={!node.isLocked ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!node.isLocked ? { scale: 0.98 } : {}}
                            onClick={() => handleNodeClick(node, branch)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                              node.isCurrent
                                ? 'border-2 border-[#c25e2e] bg-[#faf6ee] text-[#181614] shadow-[0_8px_24px_rgba(194,94,46,0.3)] ring-2 ring-[#c25e2e]/20'
                                : node.isCompleted
                                ? 'border-emerald-500/40 bg-[#151c17] text-[#faf6ee] hover:border-emerald-400'
                                : 'border-[#262320] bg-[#141312] text-[#8c8278] hover:border-[#3d3835]'
                            }`}
                          >
                            {/* Current Active Beacon */}
                            {node.isCurrent && (
                              <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#c25e2e] text-[#faf6ee] text-[9px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                <span>Active Node</span>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              {/* Status Icon Orb */}
                              <div
                                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                  node.isCurrent
                                    ? 'bg-[#c25e2e] text-[#faf6ee] shadow-sm'
                                    : node.isCompleted
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-[#1e1c1a] text-[#786f66] border border-[#262320]'
                                }`}
                              >
                                {node.isCompleted ? (
                                  <Check className="h-4 w-4 stroke-[2.5]" />
                                ) : node.isLocked ? (
                                  <Lock className="h-3.5 w-3.5 text-[#665e56]" />
                                ) : (
                                  <IconComp className="h-4 w-4" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4
                                  className={`text-xs sm:text-sm font-medium tracking-tight truncate ${
                                    node.isCurrent ? 'text-[#181614]' : node.isCompleted ? 'text-[#faf6ee]' : 'text-[#a8a199]'
                                  }`}
                                >
                                  {node.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-[10px] font-mono ${
                                      node.isCurrent ? 'text-[#665e56]' : 'text-[#786f66]'
                                    }`}
                                  >
                                    {node.estimated_time}
                                  </span>
                                  {node.isCompleted && (
                                    <span className="text-[10px] font-mono text-emerald-400 font-medium">
                                      +50 XP
                                    </span>
                                  )}
                                  {node.project && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#c25e2e]/10 text-[#e87a48] font-mono">
                                      Lab
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        </div>
                      )
                    })}

                    {/* Branch Project / Deliverable Capstone Node */}
                    {branch.branchProject && (
                      <div className="pt-2">
                        <div className="p-3 rounded-xl border border-dashed border-[#e87a48]/40 bg-[#c25e2e]/5 text-[#faf6ee] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FolderGit2 className="h-3.5 w-3.5 text-[#e87a48] shrink-0" />
                            <span className="text-[11px] truncate font-medium text-[#e87a48]">
                              {branch.branchProject}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-[#a8a199] shrink-0">
                            {branchCompleted ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── LINEAR LIST VIEW FALLBACK ───────────────────────────────────── */}
      {activeTab === 'list' && (
        <div className="relative z-10 pt-6 space-y-4">
          {treeData.branches.map((branch, bIdx) => (
            <div key={branch.id} className="rounded-2xl border border-[#262320] bg-[#141312] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[#e87a48]">Phase 0{bIdx + 1}</span>
                  <h3 className="text-base font-medium text-[#faf6ee]">{branch.name}</h3>
                </div>
                <span className="text-xs text-[#a8a199]">
                  {branch.milestones.filter((m) => m.isCompleted).length} / {branch.milestones.length} Done
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {branch.milestones.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => handleNodeClick(node, branch)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      node.isCurrent
                        ? 'border-[#c25e2e] bg-[#faf6ee] text-[#181614]'
                        : node.isCompleted
                        ? 'border-emerald-500/30 bg-[#161a17] text-[#faf6ee]'
                        : 'border-[#262320] bg-[#181614] text-[#a8a199]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-[10px]">{node.estimated_time}</span>
                      {node.isCompleted && <span className="text-emerald-400 font-bold">✓</span>}
                      {node.isCurrent && <span className="text-[#c25e2e] font-bold">● Active</span>}
                    </div>
                    <h4 className="text-xs font-medium truncate">{node.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── INTERACTIVE NODE DETAIL DRAWER / POPUP MODAL ────────────────── */}
      <AnimatePresence>
        {selectedNode && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedNode.title}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl rounded-3xl border border-[#e5decb] bg-[#faf6ee] p-6 sm:p-8 text-[#181614] shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="absolute top-5 right-5 h-8 w-8 rounded-full border border-[#ded3bf] flex items-center justify-center text-[#665e56] hover:text-[#181614] hover:bg-[#ede5d5] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4">
                {/* Meta Header */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#c25e2e] font-bold">
                    {selectedNode.branchFullTitle || 'Skill Tree Node'}
                  </span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-xs font-mono text-[#665e56]">
                    {selectedNode.estimated_time}
                  </span>
                  {selectedNode.isCompleted ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs text-emerald-800 font-medium">
                      <Check className="h-3 w-3 text-emerald-700" />
                      <span>Mastered (+50 XP)</span>
                    </span>
                  ) : selectedNode.isCurrent ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#c25e2e]/15 border border-[#c25e2e]/30 px-2.5 py-0.5 text-xs text-[#c25e2e] font-medium">
                      <span>Active Focus</span>
                    </span>
                  ) : (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#ede5d5] px-2.5 py-0.5 text-xs text-[#665e56]">
                      <Lock className="h-3 w-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-normal tracking-tight text-[#181614]">
                  {selectedNode.title}
                </h3>

                <p className="text-sm text-[#665e56] leading-relaxed font-normal">
                  {selectedNode.description}
                </p>

                {/* Skills Covered Pills */}
                {selectedNode.skills && selectedNode.skills.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-mono text-[#8c8278] uppercase tracking-wider block">
                      Skills &amp; Concepts Covered
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg border border-[#ded3bf] bg-[#ede5d5] text-xs text-[#181614] font-mono"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deliverables: Practice challenge & Lab Project */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  <div className="p-3.5 rounded-2xl border border-[#ded3bf] bg-[#ede5d5]/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#181614]">
                      <Code2 className="h-3.5 w-3.5 text-[#c25e2e]" />
                      <span>Practice Challenge</span>
                    </div>
                    <p className="text-[11px] text-[#665e56] leading-relaxed">
                      {selectedNode.practice || 'Complete code exercise testing core principles.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-[#ded3bf] bg-[#ede5d5]/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#181614]">
                      <FolderGit2 className="h-3.5 w-3.5 text-[#c25e2e]" />
                      <span>Portfolio Lab</span>
                    </div>
                    <p className="text-[11px] text-[#665e56] leading-relaxed">
                      {selectedNode.project || 'Milestone mini-project deliverable.'}
                    </p>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="pt-4 border-t border-[#ded3bf] flex flex-wrap items-center justify-between gap-3">
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleMilestone(roadmap?.id, selectedNode.id, !selectedNode.isCompleted)
                        setSelectedNode(null)
                      }}
                      className="text-xs text-[#665e56] hover:text-[#181614] font-medium transition-colors cursor-pointer"
                    >
                      {selectedNode.isCompleted ? 'Mark as Incomplete' : '✓ Mark Milestone Completed (+50 XP)'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onStartLesson({
                        course_id: selectedNode.course_id,
                        lesson_id: selectedNode.lesson_id,
                        milestone_title: selectedNode.title,
                      })
                      setSelectedNode(null)
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-[#c25e2e] text-[#faf6ee] font-medium px-6 py-2.5 text-xs hover:bg-[#ad4f22] transition-colors shadow-md ml-auto cursor-pointer"
                  >
                    <span>Start Learning Node</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
