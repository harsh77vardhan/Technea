import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  Check,
  Clock,
  Terminal,
  Layers,
  Code2,
  FolderGit2,
  Briefcase,
  BookOpen,
  HelpCircle,
} from 'lucide-react'
import RoadmapTreeVisualization from './RoadmapTreeVisualization'
import { useDashboard } from '../../context/useDashboard'

export default function RoadmapDetailModal({
  roadmap,
  isOpen = false,
  onClose = () => {},
  onStartLearning = () => {},
}) {
  const {
    activeRoadmap,
    switchActiveRoadmap,
    showToast,
  } = useDashboard()

  const [activeTab, setActiveTab] = useState('tree') // 'tree' | 'overview' | 'projects' | 'structure'
  const [isActivating, setIsActivating] = useState(false)

  const isActive = useMemo(() => {
    if (!activeRoadmap || !roadmap) return false
    return (
      String(activeRoadmap.id) === String(roadmap.id) ||
      (activeRoadmap.title && roadmap.title && activeRoadmap.title.toLowerCase() === roadmap.title.toLowerCase())
    )
  }, [activeRoadmap, roadmap])

  const handleSetActive = useCallback(async () => {
    if (!roadmap || isActive || isActivating) return
    setIsActivating(true)
    try {
      await switchActiveRoadmap(roadmap)
      if (showToast) {
        showToast(`Active roadmap set to: ${roadmap.title}! Workspace synchronized.`, 'success')
      }
    } catch (err) {
      console.error('Failed to set active roadmap:', err)
      if (showToast) {
        showToast('Failed to set active roadmap. Please try again.', 'error')
      }
    } finally {
      setIsActivating(false)
    }
  }, [roadmap, isActive, isActivating, switchActiveRoadmap, showToast])

  // Extract skills covered
  const skillsCovered = useMemo(() => {
    const set = new Set()
    if (Array.isArray(roadmap?.skills_covered)) {
      roadmap.skills_covered.forEach((s) => set.add(s))
    }
    if (Array.isArray(roadmap?.related_concepts)) {
      roadmap.related_concepts.forEach((c) => set.add(c))
    }
    if (roadmap?.roadmap_data?.phases) {
      for (const ph of roadmap.roadmap_data.phases) {
        for (const ms of ph.milestones || []) {
          for (const s of ms.skills || ms.key_skills || []) {
            set.add(s)
          }
        }
      }
    }
    if (Array.isArray(roadmap?.roadmap_steps)) {
      for (const st of roadmap.roadmap_steps) {
        for (const top of st.topics || []) {
          set.add(top)
        }
      }
    }
    if (set.size === 0) {
      const title = (roadmap?.title || '').toLowerCase()
      if (title.includes('python')) return ['Python 3', 'OOP', 'Data Structures', 'AsyncIO', 'FastAPI', 'PyTest']
      if (title.includes('react')) return ['React 19', 'Next.js', 'TypeScript', 'State Management', 'Tailwind CSS']
      if (title.includes('cloud') || title.includes('devops')) return ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform']
      return ['Core Syntax', 'Architecture Patterns', 'REST APIs', 'Unit Testing', 'Production Systems']
    }
    return Array.from(set).slice(0, 10)
  }, [roadmap])

  // Career outcomes
  const careerOutcomes = useMemo(() => {
    if (Array.isArray(roadmap?.career_outcomes) && roadmap.career_outcomes.length > 0) {
      return roadmap.career_outcomes
    }
    const role = roadmap?.target_role || roadmap?.category || 'Software Engineer'
    return [
      `Junior to Senior ${role}`,
      'Full Stack Software Developer',
      'API & Backend Systems Engineer',
      'Production Architecture Specialist',
    ]
  }, [roadmap])

  // Roadmap projects with unlock criteria
  const roadmapProjects = useMemo(() => {
    const list = []
    if (Array.isArray(roadmap?.projects) && roadmap.projects.length > 0) {
      return roadmap.projects.map((p, idx) => ({
        id: p.id || idx + 1,
        title: p.title,
        description: p.description || 'Hands-on practical deliverable verifying curriculum milestones.',
        difficulty: p.difficulty || (idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : 'Advanced'),
        estimatedTime: p.estimated_time || p.buildTime || '2-4 days',
        technologies: p.technologies || skillsCovered.slice(0, 3),
        unlockMilestone: idx === 0 ? 1 : idx === 1 ? 3 : 5,
        unlockCriteria: `Complete Milestone ${idx === 0 ? 1 : idx === 1 ? 3 : 5}`,
      }))
    }

    // AI generated projects
    if (roadmap?.roadmap_data?.phases) {
      roadmap.roadmap_data.phases.forEach((ph, pIdx) => {
        ph.milestones?.forEach((ms, mIdx) => {
          if (ms.project_ideas && ms.project_ideas.length > 0) {
            list.push({
              id: `proj-${pIdx}-${mIdx}`,
              title: ms.project_ideas[0],
              description: `Portfolio project testing ${ms.title}.`,
              difficulty: pIdx === 0 ? 'Beginner' : pIdx === 1 ? 'Intermediate' : 'Advanced',
              estimatedTime: '3-5 days',
              technologies: ms.skills || skillsCovered.slice(0, 3),
              unlockMilestone: (pIdx * 2) + mIdx + 1,
              unlockCriteria: `Complete Milestone ${(pIdx * 2) + mIdx + 1}: ${ms.title}`,
            })
          }
        })
      })
    }

    if (list.length === 0) {
      list.push(
        {
          id: 1,
          title: 'CLI Task & Resource Manager',
          description: 'Build a modular command line utility with persistent storage and robust error boundaries.',
          difficulty: 'Beginner',
          estimatedTime: '2 days',
          technologies: skillsCovered.slice(0, 2),
          unlockMilestone: 1,
          unlockCriteria: 'Complete Milestone 1: Foundations',
        },
        {
          id: 2,
          title: 'Production REST API Service',
          description: 'Architect a containerized microservice with schema validation, authentication, and database integration.',
          difficulty: 'Intermediate',
          estimatedTime: '4 days',
          technologies: skillsCovered.slice(1, 4),
          unlockMilestone: 3,
          unlockCriteria: 'Complete Milestone 3: Object-Oriented Architecture',
        },
        {
          id: 3,
          title: 'Full Stack End-to-End Platform',
          description: 'Production capstone with telemetry, caching, automated testing, and CI/CD deployment.',
          difficulty: 'Advanced',
          estimatedTime: '1-2 weeks',
          technologies: skillsCovered.slice(0, 5),
          unlockMilestone: 6,
          unlockCriteria: 'Complete Milestone 6: Capstone & Deployment',
        }
      )
    }

    return list.slice(0, 4)
  }, [roadmap, skillsCovered])

  if (!isOpen || !roadmap) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={roadmap.title}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-6xl h-[94vh] max-h-[960px] rounded-3xl bg-[#0e0d0c] border border-[#262320] shadow-[0_32px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col text-[#faf6ee]"
          data-lenis-prevent
        >
          {/* Subtle Burnt Orange ambient background glows */}
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#c25e2e]/10 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#d97b48]/8 blur-[140px]" />

          {/* ── TOP HEADER BAR ─────────────────────────────────────────────── */}
          <header className="shrink-0 px-6 sm:px-8 py-5 border-b border-[#262320] flex items-center justify-between gap-4 bg-[#141312]/80 backdrop-blur-md relative z-20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full border border-[#c25e2e]/40 bg-[#c25e2e]/10 flex items-center justify-center text-xs font-semibold text-[#faf6ee] shrink-0">
                T
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#e87a48] font-semibold block">
                  Roadmap Blueprint Engine 2.0
                </span>
                <h2 className="text-base sm:text-lg font-medium text-[#faf6ee] truncate tracking-tight">
                  {roadmap.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Set as Active Roadmap Primary Button */}
              {isActive ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>✓ Main Active Roadmap</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSetActive}
                  disabled={isActivating}
                  className="inline-flex items-center gap-2 rounded-full bg-[#c25e2e] hover:bg-[#ad4f22] text-[#faf6ee] font-medium px-5 py-2 text-xs transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isActivating ? 'Activating...' : 'Set as Active Roadmap'}</span>
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full border border-[#262320] flex items-center justify-center text-[#a8a199] hover:text-[#faf6ee] hover:bg-[#1f1d1b] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* ── SEGMENTED SUB-NAVIGATION ───────────────────────────────────── */}
          <div
            data-lenis-prevent="true"
            className="shrink-0 px-6 sm:px-8 border-b border-[#262320] bg-[#121110] flex items-center gap-2 py-2 overflow-x-auto no-scrollbar [touch-action:pan-x] overscroll-x-contain z-10"
          >
            {[
              { id: 'tree', label: 'Visual Skill Tree', icon: Layers },
              { id: 'overview', label: 'Curriculum & Outcomes', icon: Briefcase },
              { id: 'projects', label: `Projects (${roadmapProjects.length})`, icon: FolderGit2 },
              { id: 'structure', label: 'Learning Structure', icon: BookOpen },
            ].map((tab) => {
              const IconC = tab.icon
              const isSel = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSel
                      ? 'bg-[#c25e2e] text-[#faf6ee] shadow-sm'
                      : 'text-[#a8a199] hover:text-[#faf6ee] hover:bg-[#1a1817]'
                  }`}
                >
                  <IconC className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* ── SCROLLABLE BODY CONTENT ────────────────────────────────────── */}
          <div
            data-lenis-prevent="true"
            tabIndex={0}
            className="flex-1 overflow-y-auto overscroll-y-contain [touch-action:pan-y] [-webkit-overflow-scrolling:touch] outline-none p-6 sm:p-8 space-y-8 z-10 relative"
          >
            {/* ══════════ TAB 1: VISUAL SKILL TREE ══════════ */}
            {activeTab === 'tree' && (
              <RoadmapTreeVisualization
                roadmap={roadmap}
                completedMilestoneIds={roadmap.completed_milestone_ids || []}
                onStartLesson={(mission) => {
                  onClose()
                  onStartLearning(mission)
                }}
              />
            )}

            {/* ══════════ TAB 2: OVERVIEW & OUTCOMES ══════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-8 max-w-4xl">
                {/* Hero Summary Card (Warm Ivory) */}
                <div className="rounded-3xl border border-[#e5decb] bg-[#faf6ee] p-7 text-[#181614] shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#c25e2e] font-bold">
                      {roadmap.category || 'Specialization Track'}
                    </span>
                    <span className="text-[#a8a199]">·</span>
                    <span className="text-xs text-[#665e56] font-medium">
                      {roadmap.level || roadmap.difficulty || 'All Experience Levels'}
                    </span>
                    <span className="text-[#a8a199]">·</span>
                    <span className="text-xs text-[#665e56] font-medium">
                      {roadmap.duration || roadmap.estimated_duration || '8-12 Weeks'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-light text-[#181614] tracking-tight">
                    {roadmap.title}
                  </h3>

                  <p className="text-sm text-[#665e56] leading-relaxed font-normal">
                    {roadmap.description || roadmap.goal || 'Comprehensive engineering curriculum.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#ded3bf]">
                    <div>
                      <span className="text-[10px] font-mono text-[#8c8278] uppercase">Time Commitment</span>
                      <p className="text-xs font-medium text-[#181614] mt-0.5">5-7 hours / week</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#8c8278] uppercase">Pace</span>
                      <p className="text-xs font-medium text-[#181614] mt-0.5">Self-paced + Milestones</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#8c8278] uppercase">Milestones</span>
                      <p className="text-xs font-medium text-[#181614] mt-0.5">
                        {roadmap.roadmap_steps?.length || roadmap.roadmap_data?.phases?.length || 6} Checkpoints
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#8c8278] uppercase">Certificate</span>
                      <p className="text-xs font-medium text-[#181614] mt-0.5">Portfolio Verified</p>
                    </div>
                  </div>
                </div>

                {/* Skills Covered */}
                <div className="rounded-2xl border border-[#262320] bg-[#141312] p-6 space-y-3">
                  <h4 className="text-sm font-medium text-[#faf6ee] flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-[#e87a48]" />
                    <span>Skills Covered</span>
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skillsCovered.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full border border-[#262320] bg-[#1e1c1a] text-xs text-[#faf6ee] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Career Outcomes */}
                <div className="rounded-2xl border border-[#262320] bg-[#141312] p-6 space-y-3">
                  <h4 className="text-sm font-medium text-[#faf6ee] flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#e87a48]" />
                    <span>Career &amp; Industry Outcomes</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {careerOutcomes.map((co, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-[#262320] bg-[#181614] text-xs text-[#faf6ee] flex items-center gap-2"
                      >
                        <Check className="h-3.5 w-3.5 text-[#e87a48] shrink-0" />
                        <span>{co}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ TAB 3: PROJECTS WITH UNLOCK STATUS ══════════ */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#faf6ee]">Connected Milestone Projects</h3>
                  <p className="text-xs text-[#a8a199] mt-0.5 font-normal">
                    Projects belong to this roadmap. Completing prerequisite milestones unlocks the corresponding deliverables.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {roadmapProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="rounded-3xl border border-[#e5decb] bg-[#faf6ee] p-6 text-[#181614] shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#ede5d5] text-[#665e56] font-medium border border-[#ded3bf]">
                            {proj.difficulty}
                          </span>
                          <span className="text-[11px] font-mono text-[#c25e2e] font-semibold">
                            {proj.unlockCriteria}
                          </span>
                        </div>

                        <h4 className="text-base font-medium text-[#181614] tracking-tight">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-[#665e56] line-clamp-3 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#ded3bf] flex items-center justify-between">
                        <span className="text-xs text-[#665e56] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{proj.estimatedTime}</span>
                        </span>

                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.slice(0, 2).map((tech, idx) => (
                            <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ede5d5] text-[#181614]">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════ TAB 4: LEARNING STRUCTURE ══════════ */}
            {activeTab === 'structure' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-lg font-medium text-[#faf6ee]">Pedagogical Learning Structure</h3>
                  <p className="text-xs text-[#a8a199] mt-0.5 font-normal">
                    Structured cadence of Milestones, Lessons, Verified Resources, Practice Challenges, and Diagnostic Quizzes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl border border-[#262320] bg-[#141312] space-y-2">
                    <Terminal className="h-4 w-4 text-[#e87a48]" />
                    <h4 className="text-sm font-medium text-[#faf6ee]">Milestones</h4>
                    <p className="text-xs text-[#a8a199] leading-relaxed">
                      Sequential checkpoints verifying mastery of key architectural principles.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-[#262320] bg-[#141312] space-y-2">
                    <BookOpen className="h-4 w-4 text-[#e87a48]" />
                    <h4 className="text-sm font-medium text-[#faf6ee]">Video &amp; Notes</h4>
                    <p className="text-xs text-[#a8a199] leading-relaxed">
                      Curated video instruction paired with technical notes and reference syntax.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-[#262320] bg-[#141312] space-y-2">
                    <Code2 className="h-4 w-4 text-[#e87a48]" />
                    <h4 className="text-sm font-medium text-[#faf6ee]">Code Practice</h4>
                    <p className="text-xs text-[#a8a199] leading-relaxed">
                      Hands-on programming challenges to build muscle memory with zero helper libraries.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-[#262320] bg-[#141312] space-y-2">
                    <HelpCircle className="h-4 w-4 text-[#e87a48]" />
                    <h4 className="text-sm font-medium text-[#faf6ee]">Quizzes &amp; AI</h4>
                    <p className="text-xs text-[#a8a199] leading-relaxed">
                      Diagnostic assessments and AI Mentor assistance grounded in your journey.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
