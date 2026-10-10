import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  BookOpen,
  Layers,
  Code2,
} from 'lucide-react'
import { getLearningPathById, getCourses, getSkills } from '../services/api'
import { getTrackTheme, getTrackProjects, getTrackMetrics } from '../utils/trackThemes'

import PathDetailHero from '../components/detail/PathDetailHero'
import PathCommandCard from '../components/detail/PathCommandCard'
import InteractiveRoadmap from '../components/detail/InteractiveRoadmap'
import FeaturedCoursesSection from '../components/detail/FeaturedCoursesSection'
import CapstoneProjectsSection from '../components/detail/CapstoneProjectsSection'
import PathDetailSkeleton from '../components/detail/PathDetailSkeleton'
import LearningProgressDashboard from '../components/detail/LearningProgressDashboard'

/**
 * Safely check if an identifier is a valid positive numeric database ID
 * (e.g., 1, 42, "10", but NOT "query-path", "python-for-beginners", null, undefined)
 */
function isNumericId(val) {
  if (val === null || val === undefined || typeof val === 'boolean' || val === '') return false
  const num = Number(val)
  return Number.isInteger(num) && num > 0
}

export default function LearningPathDetailPage({
  path = null,
  onBack = () => {},
  onStartLearning = () => {},
}) {
  const [fetchedPath, setFetchedPath] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  // Active section tab for navigation
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'roadmap' | 'courses' | 'projects'

  // Courses state
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState(null)
  const [coursesRetryKey, setCoursesRetryKey] = useState(0)
  const [enrolledCourseId, setEnrolledCourseId] = useState(null)

  // Use fetched details if available, otherwise passed path prop
  const currentPath = fetchedPath || path
  const pathId = path?.id
  const hasSteps = Boolean(path?.roadmap_steps && path.roadmap_steps.length > 0)

  // Fetch full learning path with steps if path was provided without steps
  useEffect(() => {
    if (!pathId || !isNumericId(pathId) || hasSteps) return

    let isMounted = true

    getLearningPathById(pathId)
      .then((data) => {
        if (isMounted && data) {
          setFetchedPath(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch learning path detail:', err)
          setError(err.message || 'Unable to load learning path details.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [pathId, hasSteps, retryKey])

  // Fetch courses related to the current learning path
  useEffect(() => {
    let isMounted = true

    const fetchPathCourses = async () => {
      try {
        let relevant = []
        if (isNumericId(currentPath?.id)) {
          relevant = await getCourses({ learning_path_id: currentPath.id })
        }

        if ((!relevant || relevant.length === 0) && isNumericId(currentPath?.skill_id)) {
          relevant = await getCourses({ skill_id: currentPath.skill_id })
        }

        if (!relevant || relevant.length === 0) {
          const [allCourses, allSkills] = await Promise.all([getCourses(), getSkills()])
          const pathTitle = (currentPath?.title || '').toLowerCase()
          const pathCategory = (currentPath?.category || '').toLowerCase()

          const matchedSkill = (allSkills || []).find((s) => {
            const sName = (s.name || '').toLowerCase()
            const sCat = (s.category || '').toLowerCase()
            return (
              pathTitle.includes(sName) ||
              sName.includes(pathTitle) ||
              pathCategory.includes(sCat) ||
              sCat.includes(pathCategory)
            )
          })

          if (matchedSkill) {
            relevant = (allCourses || []).filter((c) => c.skill_id === matchedSkill.id)
          }

          if ((!relevant || relevant.length === 0) && pathTitle) {
            const keywords = pathTitle
              .split(/\s+/)
              .map((k) => k.trim().toLowerCase())
              .filter((k) => k.length > 3)

            relevant = (allCourses || []).filter((c) => {
              const cTitle = (c.title || '').toLowerCase()
              const cDesc = (c.description || '').toLowerCase()
              return keywords.some((kw) => cTitle.includes(kw) || cDesc.includes(kw))
            })
          }
        }

        if (isMounted) {
          setCourses(relevant || [])
          setCoursesError(null)
          setCoursesLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load courses:', err)
          setCoursesError(err.message || 'Unable to load courses for this learning path.')
          setCoursesLoading(false)
        }
      }
    }

    fetchPathCourses()

    return () => {
      isMounted = false
    }
  }, [currentPath?.id, currentPath?.skill_id, currentPath?.title, currentPath?.category, coursesRetryKey])

  // Map API roadmap_steps to timeline journeySteps
  const journeySteps = useMemo(() => {
    const roadmapSteps = currentPath?.roadmap_steps
    if (roadmapSteps && roadmapSteps.length > 0) {
      return roadmapSteps
        .slice()
        .sort((a, b) => (a.step_number || 0) - (b.step_number || 0))
        .map((step, idx) => ({
          id: step.id,
          num: String(step.step_number || idx + 1).padStart(2, '0'),
          title: step.title,
          topics: step.description || step.title,
        }))
    }

    // Default fallback steps
    return [
      {
        id: 'step-1',
        num: '01',
        title: 'Core Fundamentals & Syntax',
        topics: 'Variables, expressions, control flow, functions, and typing rules.',
      },
      {
        id: 'step-2',
        num: '02',
        title: 'Data Structures & Abstractions',
        topics: 'Key collections, algorithms, modular patterns, and memory layout.',
      },
      {
        id: 'step-3',
        num: '03',
        title: 'Applied Engineering & APIs',
        topics: 'Async workflows, integration clients, testing paradigms, and validation.',
      },
      {
        id: 'step-4',
        num: '04',
        title: 'Production Capstone & Deployment',
        topics: 'Containerization, telemetry, performance profiling, and shipping.',
      },
    ]
  }, [currentPath?.roadmap_steps])

  // Completed steps tracker persisted in localStorage
  const stepStorageKey = useMemo(
    () => `technea_completed_steps_${currentPath?.id || 'default'}`,
    [currentPath?.id]
  )

  const [completedStepIds, setCompletedStepIds] = useState(() => {
    try {
      if (!currentPath?.id) return []
      const saved = localStorage.getItem(`technea_completed_steps_${currentPath.id}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Synchronize localStorage when step progress changes
  const handleToggleStep = useCallback(
    (stepKey) => {
      setCompletedStepIds((prev) => {
        const next = prev.includes(stepKey)
          ? prev.filter((id) => id !== stepKey)
          : [...prev, stepKey]
        try {
          localStorage.setItem(stepStorageKey, JSON.stringify(next))
        } catch (e) {
          console.warn('Could not save step progress:', e)
        }
        return next
      })
    },
    [stepStorageKey]
  )

  const handleResetProgress = useCallback(() => {
    setCompletedStepIds([])
    try {
      localStorage.removeItem(stepStorageKey)
    } catch {
      // ignore
    }
  }, [stepStorageKey])

  // Theming & generative project models
  const theme = useMemo(() => getTrackTheme(currentPath), [currentPath])
  const projects = useMemo(() => getTrackProjects(currentPath), [currentPath])
  const metrics = useMemo(
    () => getTrackMetrics(currentPath, journeySteps.length, courses.length),
    [currentPath, journeySteps.length, courses.length]
  )

  const nextIncompleteStep = useMemo(() => {
    return (
      journeySteps.find((s) => !completedStepIds.includes(s.id || s.num)) || journeySteps[0]
    )
  }, [journeySteps, completedStepIds])

  const handleRetry = useCallback(() => {
    setLoading(true)
    setError(null)
    setRetryKey((k) => k + 1)
  }, [])

  const handleRetryCourses = useCallback(() => {
    setCoursesLoading(true)
    setCoursesError(null)
    setCoursesRetryKey((k) => k + 1)
  }, [])

  const handleStartCourse = useCallback(
    (course) => {
      if (!course) return
      setEnrolledCourseId(course.id)
      onStartLearning(course)
      setTimeout(() => {
        setEnrolledCourseId(null)
      }, 2500)
    },
    [onStartLearning]
  )

  // Start learning from path: opens the first course of this active learning path
  const handleStartPathLearning = useCallback(async () => {
    // 1. If courses already loaded, open the first course belonging to this path
    if (courses && courses.length > 0) {
      handleStartCourse(courses[0])
      return
    }

    // 2. Fetch courses associated with this learning_path_id from the backend
    const activePathId = currentPath?.id
    if (isNumericId(activePathId)) {
      try {
        const pathCourses = await getCourses({ learning_path_id: activePathId })
        if (pathCourses && pathCourses.length > 0) {
          handleStartCourse(pathCourses[0])
          return
        }
      } catch (err) {
        console.warn('Could not fetch first course for path:', err)
      }
    }

    // 3. Fallback: notify parent with active path info so CoursePlayerPage resolves it
    onStartLearning({
      learning_path_id: currentPath?.id,
      title: currentPath?.title,
      category: currentPath?.category,
    })
  }, [courses, currentPath, handleStartCourse, onStartLearning])

  const handleScrollToTimeline = useCallback(() => {
    const el = document.getElementById('roadmap-timeline')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // ── SKELETON LOADING STATE ──────────────────────────────────────────────
  if (loading && !currentPath) {
    return <PathDetailSkeleton />
  }

  // ── ERROR STATE ─────────────────────────────────────────────────────────
  if (error && !currentPath) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center space-y-4 backdrop-blur-xl">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 text-red-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-white">Error Loading Learning Path</h2>
          <p className="text-xs text-neutral-400">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── EMPTY STATE ─────────────────────────────────────────────────────────
  if (!currentPath && !loading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center space-y-4 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">No Learning Path Found</h2>
          <p className="text-xs text-neutral-400">
            The requested learning path is unavailable or could not be located.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Results</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black pb-24">
      {/* ── 1. WORLD-CLASS HERO SECTION ───────────────────────────────────── */}
      <PathDetailHero
        path={currentPath}
        theme={theme}
        metrics={metrics}
        onBack={onBack}
        onStartLearning={handleStartPathLearning}
        onExploreTimeline={handleScrollToTimeline}
      />

      {/* ── 2. SEGMENTED NAVIGATION TABS (Linear / Raycast Style) ─────────── */}
      <div className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#08090d]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              All Sections
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'roadmap'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Roadmap ({journeySteps.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'courses'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Courses ({courses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Capstones ({projects.length})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-400 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Progress: {completedStepIds.length}/{journeySteps.length} milestones</span>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT CONTAINER & STICKY SIDEBAR ─────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Executive Learning Progress Cockpit */}
        <LearningProgressDashboard
          completedCount={completedStepIds.length}
          totalSteps={journeySteps.length}
          activeMilestoneTitle={
            nextIncompleteStep
              ? `${nextIncompleteStep.num}: ${nextIncompleteStep.title}`
              : 'All Milestones Mastered'
          }
          onContinueLearning={handleStartPathLearning}
          onResetProgress={handleResetProgress}
          theme={theme}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN: Roadmap, Courses & Capstones (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Interactive Timeline Roadmap */}
            {(activeTab === 'all' || activeTab === 'roadmap') && (
              <InteractiveRoadmap
                steps={journeySteps}
                completedStepIds={completedStepIds}
                onToggleStep={handleToggleStep}
                theme={theme}
                trackTitle={currentPath?.title}
              />
            )}

            {/* Curated Masterclasses & Courses */}
            {(activeTab === 'all' || activeTab === 'courses') && (
              <FeaturedCoursesSection
                courses={courses}
                loading={coursesLoading}
                error={coursesError}
                onRetry={handleRetryCourses}
                onStartCourse={handleStartCourse}
                enrolledCourseId={enrolledCourseId}
                theme={theme}
              />
            )}

            {/* Real-World Capstone Projects */}
            {(activeTab === 'all' || activeTab === 'projects') && (
              <CapstoneProjectsSection
                projects={projects}
                theme={theme}
              />
            )}
          </div>

          {/* RIGHT COLUMN: Interactive Command Card / Sticky Hub (4 Cols) */}
          <PathCommandCard
            path={currentPath}
            theme={theme}
            metrics={metrics}
            completedStepCount={completedStepIds.length}
            totalSteps={journeySteps.length}
            projectsCount={projects.length}
            coursesCount={courses.length}
            onStartLearning={handleStartPathLearning}
            onResetProgress={handleResetProgress}
          />
        </div>
      </main>
    </div>
  )
}
