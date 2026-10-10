import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Play,
  Check,
  CheckCircle2,
  Circle,
  RotateCcw,
  AlertCircle,
  ListVideo,
  MonitorPlay,
  ExternalLink,
  BookOpen,
  Share2,
} from 'lucide-react'
import { getCourseById, getCourseLessons, getRelatedCourses, getCourses } from '../services/api'

/**
 * Validates whether an ID is a valid database numeric ID
 */
function isNumericId(val) {
  if (val === null || val === undefined || typeof val === 'boolean' || val === '') return false
  const num = Number(val)
  return Number.isInteger(num) && num > 0
}

export default function CoursePlayerPage({
  course = null,
  path = null,
  onBack = () => {},
  onSelectCourse = () => {},
}) {
  const [courseData, setCourseData] = useState(course)
  const [lessons, setLessons] = useState(course?.lessons || [])
  const [relatedCourses, setRelatedCourses] = useState([])
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)

  const courseId = course?.id
  const pathId = path?.id
  const learningPathId = course?.learning_path_id
  const pathTitle = path?.title || course?.title || ''

  // Completed lessons tracker persisted in localStorage
  const storageKey = useMemo(
    () => `technea_completed_lessons_${courseData?.id || 'unknown'}`,
    [courseData?.id]
  )

  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      if (!course?.id) return []
      const saved = localStorage.getItem(`technea_completed_lessons_${course.id}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Synchronize localStorage when completed lessons change
  useEffect(() => {
    if (!courseData?.id) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedLessonIds))
    } catch (e) {
      console.warn('Failed to save lesson progress:', e)
    }
  }, [completedLessonIds, storageKey, courseData?.id])

  // Resolve active learning path and fetch corresponding first course & lessons
  useEffect(() => {
    let isMounted = true

    const resolveAndLoadCourse = async () => {
      setLoading(true)
      setError(null)
      setActiveLessonIndex(0)

      try {
        let targetCourseId = courseId
        let resolvedCourse = course

        // 1. If target course ID is missing or not a database integer, resolve using active learning path ID
        const activePathId = pathId || learningPathId
        if (!isNumericId(targetCourseId) && isNumericId(activePathId)) {
          const pathCourses = await getCourses({ learning_path_id: activePathId })
          if (pathCourses && pathCourses.length > 0) {
            targetCourseId = pathCourses[0].id
            resolvedCourse = pathCourses[0]
          }
        }

        // 2. If still no valid numeric course ID, attempt fallback matching by path title or skill
        if (!isNumericId(targetCourseId)) {
          if (pathTitle) {
            const allCourses = await getCourses()
            const lowerTitle = pathTitle.toLowerCase()
            const matched = (allCourses || []).find((c) => {
              const cTitle = (c.title || '').toLowerCase()
              return cTitle.includes(lowerTitle) || lowerTitle.includes(cTitle)
            })
            if (matched) {
              targetCourseId = matched.id
              resolvedCourse = matched
            } else if (allCourses && allCourses.length > 0) {
              targetCourseId = allCourses[0].id
              resolvedCourse = allCourses[0]
            }
          }
        }

        if (!isNumericId(targetCourseId)) {
          if (isMounted) {
            setError('No courses found for this learning track.')
            setLoading(false)
          }
          return
        }

        // 3. Fetch full course details, lessons, and related courses for this specific course
        const [fullCourse, courseLessons, related] = await Promise.all([
          getCourseById(targetCourseId),
          getCourseLessons(targetCourseId).catch(() => []),
          getRelatedCourses(targetCourseId, 4).catch(() => []),
        ])

        if (!isMounted) return

        const finalCourse = fullCourse || resolvedCourse
        setCourseData(finalCourse)
        const combinedLessons =
          courseLessons && courseLessons.length > 0
            ? courseLessons
            : finalCourse?.lessons || []

        setLessons(combinedLessons)
        setRelatedCourses(related || [])
        setError(null)
        setLoading(false)

        // Load saved progress for this resolved course
        try {
          const saved = localStorage.getItem(`technea_completed_lessons_${finalCourse.id}`)
          if (saved) {
            setCompletedLessonIds(JSON.parse(saved))
          }
        } catch {
          // Ignore
        }
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load course player data:', err)
        setError(err.message || 'Unable to load course learning content.')
        setLoading(false)
      }
    }

    resolveAndLoadCourse()

    return () => {
      isMounted = false
    }
  }, [course, courseId, pathId, learningPathId, pathTitle, retryKey])

  // Active lesson and YouTube video ID without any hardcoded fallback
  const activeLesson = lessons[activeLessonIndex] || null
  const currentVideoId =
    activeLesson?.youtube_video_id ||
    courseData?.youtube_video_id ||
    null

  const embedUrl = useMemo(() => {
    if (!currentVideoId) return ''
    return `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
  }, [currentVideoId])

  // Toggle lesson completed status
  const handleToggleComplete = useCallback((lessonId) => {
    setCompletedLessonIds((prev) => {
      if (prev.includes(lessonId)) {
        return prev.filter((id) => id !== lessonId)
      } else {
        return [...prev, lessonId]
      }
    })
  }, [])

  // Navigation handlers
  const hasPrevious = activeLessonIndex > 0
  const hasNext = activeLessonIndex < lessons.length - 1

  const handlePreviousLesson = useCallback(() => {
    if (hasPrevious) {
      setActiveLessonIndex((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [hasPrevious])

  const handleNextLesson = useCallback(() => {
    if (hasNext) {
      if (activeLesson?.id) {
        setCompletedLessonIds((prev) =>
          prev.includes(activeLesson.id) ? prev : [...prev, activeLesson.id]
        )
      }
      setActiveLessonIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [hasNext, activeLesson])

  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }, [])

  // Completion calculation
  const completedCount = useMemo(() => {
    return lessons.filter((l) => completedLessonIds.includes(l.id)).length
  }, [lessons, completedLessonIds])

  const progressPercent = useMemo(() => {
    if (!lessons.length) return 0
    return Math.round((completedCount / lessons.length) * 100)
  }, [completedCount, lessons.length])

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded" />
          <div className="h-10 w-2/3 bg-white/10 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 aspect-video bg-white/5 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 w-32 bg-white/10 rounded" />
              <div className="h-20 bg-white/5 rounded-xl" />
              <div className="h-20 bg-white/5 rounded-xl" />
              <div className="h-20 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !courseData) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 text-red-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-white">Error Loading Course Player</h2>
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
              onClick={() => {
                setLoading(true)
                setError(null)
                setRetryKey((k) => k + 1)
              }}
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

  const courseTitle = courseData?.title || 'Interactive Course'
  const instructor = courseData?.instructor || 'Technea Faculty'
  const platform = courseData?.platform || 'YouTube'
  const duration = courseData?.duration || 'Course'
  const category = courseData?.category || path?.category || 'Programming'
  const difficulty = courseData?.level || path?.level || 'Beginner'

  return (
    <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black">
      {/* ── HEADER NAVIGATION & BREADCRUMBS ──────────────────────────────── */}
      <header className="border-b border-white/[0.08] bg-[#08090d]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer shrink-0"
              title="Return to learning path"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to Roadmap</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 truncate">
              {path?.title && (
                <>
                  <span className="truncate max-w-[140px] sm:max-w-[200px] hover:text-neutral-200 transition-colors">
                    {path.title}
                  </span>
                  <ChevronRight className="h-3 w-3 text-neutral-600 shrink-0" />
                </>
              )}
              <span className="text-white font-medium truncate max-w-[180px] sm:max-w-[280px]">
                {courseTitle}
              </span>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {courseData?.playlist_url && (
              <a
                href={courseData.playlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="View full playlist on YouTube"
              >
                <span>Full Playlist</span>
                <ExternalLink className="h-3 w-3 text-neutral-400" />
              </a>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Copy share link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT GRID ────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Top Course Metadata Card */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                {platform}
              </span>
              <span className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-neutral-300">
                {category}
              </span>
              <span className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-neutral-400">
                {difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>{duration}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <MonitorPlay className="h-3.5 w-3.5" />
                <span>Embedded Player</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              {courseTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400">
              <User className="h-3.5 w-3.5 text-neutral-500" />
              <span>Taught by <strong className="text-neutral-200">{instructor}</strong></span>
            </div>
          </div>

          {courseData?.description && (
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-4xl font-light">
              {courseData.description}
            </p>
          )}
        </section>

        {/* ── PLAYER & PLAYLIST SIDEBAR ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Middle: Embedded YouTube Player (2 Cols on Desktop) */}
          <section className="lg:col-span-2 space-y-4">
            {/* 16:9 Video Player Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group">
              {currentVideoId ? (
                <iframe
                  title={activeLesson?.title || courseTitle}
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 absolute inset-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-neutral-950">
                  <Play className="h-12 w-12 text-neutral-600 mb-3" />
                  <p className="text-sm font-medium text-neutral-300">No video stream available for this course</p>
                  <p className="text-xs text-neutral-500 mt-1">Please select another course or lesson.</p>
                </div>
              )}
            </div>

            {/* Active Lesson Context & Controls */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Lesson {activeLessonIndex + 1} of {lessons.length || 1}
                  </span>
                  {activeLesson?.duration && (
                    <span className="text-[10px] font-mono text-neutral-500">
                      • {activeLesson.duration}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
                  {activeLesson?.title || courseTitle}
                </h2>
                {activeLesson?.description && (
                  <p className="text-xs text-neutral-400 font-light line-clamp-2">
                    {activeLesson.description}
                  </p>
                )}
              </div>

              {/* Completion & Next Controls */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                {activeLesson && (
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(activeLesson.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                      completedLessonIds.includes(activeLesson.id)
                        ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'border border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {completedLessonIds.includes(activeLesson.id) ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-3.5 w-3.5 text-neutral-500" />
                        <span>Mark Done</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextLesson}
                  disabled={!hasNext}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                    hasNext
                      ? 'bg-white text-black hover:bg-neutral-200 active:scale-95'
                      : 'bg-white/10 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Previous & Next bottom navigation controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handlePreviousLesson}
                disabled={!hasPrevious}
                className={`inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium transition-all ${
                  hasPrevious
                    ? 'text-neutral-300 hover:text-white hover:bg-white/[0.06] cursor-pointer'
                    : 'text-neutral-600 border-white/[0.04] cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous Lesson</span>
              </button>

              <div className="font-mono text-xs text-neutral-500">
                {completedCount} / {lessons.length} Completed ({progressPercent}%)
              </div>

              <button
                type="button"
                onClick={handleNextLesson}
                disabled={!hasNext}
                className={`inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium transition-all ${
                  hasNext
                    ? 'text-neutral-300 hover:text-white hover:bg-white/[0.06] cursor-pointer'
                    : 'text-neutral-600 border-white/[0.04] cursor-not-allowed opacity-50'
                }`}
              >
                <span>Next Lesson</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          {/* ── RIGHT SIDEBAR: PLAYLIST & LESSON LIST ──────────────────────── */}
          <aside className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 space-y-4 lg:sticky lg:top-20">
            {/* Playlist Header & Progress Bar */}
            <div className="space-y-3 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListVideo className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Course Curriculum
                  </h3>
                </div>
                <span className="font-mono text-[11px] text-neutral-400">
                  {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>Track Progress</span>
                  <span className="text-emerald-400 font-semibold">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Lesson Items */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {lessons.map((lesson, idx) => {
                const isActive = idx === activeLessonIndex
                const isCompleted = completedLessonIds.includes(lesson.id)
                const thumb =
                  lesson.thumbnail_url ||
                  `https://img.youtube.com/vi/${lesson.youtube_video_id}/mqdefault.jpg`

                return (
                  <div
                    key={lesson.id || idx}
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`group relative rounded-xl border p-2.5 sm:p-3 flex items-center gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'border-emerald-500/40 bg-emerald-500/[0.08] shadow-lg shadow-emerald-950/20'
                        : 'border-white/[0.06] bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Thumbnail Preview with Play Overlay */}
                    <div className="relative h-12 w-20 sm:h-14 sm:w-24 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                      <img
                        src={thumb}
                        alt={lesson.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4 fill-white text-white" />
                      </div>
                      {/* Active Playing Indicator */}
                      {isActive && (
                        <div className="absolute inset-0 bg-emerald-900/50 flex items-center justify-center">
                          <Play className="h-4 w-4 fill-emerald-400 text-emerald-400 animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Lesson Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-neutral-500 font-medium">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {isActive && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 font-mono text-[9px] text-emerald-400 font-semibold">
                            NOW PLAYING
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-xs font-medium line-clamp-2 leading-snug transition-colors ${
                          isActive ? 'text-white font-semibold' : 'text-neutral-300 group-hover:text-white'
                        }`}
                      >
                        {lesson.title}
                      </h4>
                      {lesson.duration && (
                        <span className="font-mono text-[10px] text-neutral-500 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{lesson.duration}</span>
                        </span>
                      )}
                    </div>

                    {/* Checkmark Completion Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleComplete(lesson.id)
                      }}
                      className="p-1 rounded text-neutral-500 hover:text-white transition-colors cursor-pointer shrink-0"
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-neutral-600 group-hover:text-neutral-400" />
                      )}
                    </button>
                  </div>
                )
              })}

              {lessons.length === 0 && (
                <div className="rounded-xl border border-white/[0.06] p-6 text-center space-y-2 text-neutral-400">
                  <BookOpen className="h-6 w-6 mx-auto text-neutral-500" />
                  <p className="text-xs">No multi-part modules loaded for this course.</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ── BOTTOM SECTION: RELATED COURSES RECOMMENDATION ───────────────── */}
        {relatedCourses.length > 0 && (
          <section className="pt-8 border-t border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Related Courses in this Track
                </h3>
                <p className="text-xs text-neutral-400 font-light">
                  Continue learning with complementary video courses from top educators.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedCourses.map((rel) => {
                const relThumb =
                  rel.thumbnail_url ||
                  (rel.youtube_video_id
                    ? `https://img.youtube.com/vi/${rel.youtube_video_id}/hqdefault.jpg`
                    : null)

                return (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectCourse(rel)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer space-y-3"
                  >
                    <div className="space-y-3">
                      {relThumb && (
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/10 relative">
                          <img
                            src={relThumb}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="h-6 w-6 fill-white text-white" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                        <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-neutral-300">
                          {rel.platform || 'YouTube'}
                        </span>
                        {rel.duration && <span>{rel.duration}</span>}
                      </div>

                      <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-neutral-100 transition-colors line-clamp-2">
                        {rel.title}
                      </h4>

                      {rel.instructor && (
                        <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <User className="h-3 w-3 text-neutral-500" />
                          <span className="truncate">{rel.instructor}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-emerald-400">
                      <span>Watch Course</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
