import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react'
import {
  getCourseById,
  getCourseLessons,
  getRelatedCourses,
  getCourses,
  getCourseProgressApi,
  toggleLessonProgressApi,
  sendAiChatApi,
} from '../services/api'
import { useAuth } from '../context/useAuth'
import { useDashboard } from '../context/useDashboard'
import '../styles/learningWorkspace.css'

/**
 * Validates whether an ID is a valid database numeric ID
 */
function isNumericId(val) {
  if (val === null || val === undefined || typeof val === 'boolean' || val === '') return false
  const num = Number(val)
  return Number.isInteger(num) && num > 0
}

const COMMAND_ITEMS = [
  { id: 'toggle-play', title: 'Play / pause lesson video' },
  { id: 'next-lesson', title: 'Next lesson' },
  { id: 'prev-lesson', title: 'Previous lesson' },
  { id: 'mark-complete', title: 'Mark complete' },
  { id: 'toggle-focus', title: 'Toggle focus mode' },
  { id: 'toggle-theme', title: 'Toggle theme (Light / Dark)' },
  { id: 'explain-simply', title: 'Ask AI Mentor to explain simply' },
]

/**
 * Isolated StreakBanner component manages its own 1-second interval
 * to eliminate periodic re-renders across the entire CoursePlayerPage.
 */
const StreakBanner = memo(function StreakBanner({ todayCompleted }) {
  const [streakCountdown, setStreakCountdown] = useState('')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diffSec = Math.max(0, Math.floor((midnight - now) / 1000))
      const h = String(Math.floor(diffSec / 3600)).padStart(2, '0')
      const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0')
      const s = String(diffSec % 60).padStart(2, '0')
      setStreakCountdown(`${h}:${m}:${s}`)
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={`gl ${todayCompleted ? 'ok' : ''}`}>
      <i />
      <span>
        {todayCompleted
          ? '7-day streak locked in. Master another lesson or project!'
          : `Finish 1 lesson to lock in your streak · ${streakCountdown} left today`}
      </span>
    </div>
  )
})

/**
 * Memoized VideoIframe prevents iframe destruction / DOM reconciliation
 * on minor state changes such as seeking, note typing, or AI streaming.
 */
const VideoIframe = memo(function VideoIframe({
  videoId,
  title,
  embedUrl,
  onIframeLoad,
  iframeRef,
}) {
  return (
    <iframe
      ref={iframeRef}
      key={videoId}
      title={title}
      src={embedUrl}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="absolute inset-0 w-full h-full border-0 z-[2]"
      onLoad={onIframeLoad}
    />
  )
})

export default function CoursePlayerPage({
  course = null,
  path = null,
  onBack = () => {},
  onSelectCourse = () => {},
}) {
  const { user } = useAuth()
  const {
    activeRoadmap,
    completeLesson,
    toggleMilestone,
    theme: dashboardTheme,
    toggleTheme: dashboardToggleTheme,
    summaryData,
    dailyActivity,
  } = useDashboard()

  const [courseData, setCourseData] = useState(course)
  const [lessons, setLessons] = useState(course?.lessons || [])
  const [relatedCourses, setRelatedCourses] = useState([])
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  // Local UI & interactive FX states
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const handleIframeLoad = useCallback(() => setIsVideoPlaying(true), [])
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [seekProgress, setSeekProgress] = useState(0)
  const [toastMessage, setToastMessage] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [levelUpNumber, setLevelUpNumber] = useState(null)
  const [isLevelUpActive, setIsLevelUpActive] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')
  const [paletteSelectedIdx, setPaletteSelectedIdx] = useState(0)
  const paletteInputRef = useRef(null)

  // Animated XP state (Strict real data with live telemetry synchronization)
  const realXp = summaryData?.xp_points ?? user?.total_xp ?? 0
  const [earnedXpDelta, setEarnedXpDelta] = useState(0)
  const currentXp = realXp + earnedXpDelta

  // Streak state synchronized with daily activity
  const streakCount = dailyActivity?.streak_count ?? (user?.streak_count || 0)
  const isTodayLessonDone = Boolean(
    dailyActivity?.completed_tasks?.includes('lesson') ||
    (dailyActivity?.earned_today_xp && dailyActivity.earned_today_xp > 0)
  )
  const [localCompleted, setLocalCompleted] = useState(false)
  const todayCompleted = isTodayLessonDone || localCompleted

  // Canvas and animation refs
  const bgCanvasRef = useRef(null)
  const fxCanvasRef = useRef(null)
  const particlesRef = useRef([])
  const fxAnimIdRef = useRef(null)
  const isFxRunningRef = useRef(false)
  const flashTimeoutRef = useRef(null)
  const toastTimeoutRef = useRef(null)
  const levelUpTimer1Ref = useRef(null)
  const levelUpTimer2Ref = useRef(null)
  const aiStreamTimerRef = useRef(null)
  const notesDebounceRef = useRef(null)

  // Practice & Quiz state
  const [practiceCode, setPracticeCode] = useState(
    '# Write your solution here\nname = "Technea"\nage = 21\nis_learning = True\n\nprint(name, age)'
  )
  const [practiceOutput, setPracticeOutput] = useState('Store a value and print it.')
  const [isPracticeSolved, setIsPracticeSolved] = useState(false)
  const [quizAnswerStates, setQuizAnswerStates] = useState({}) // { [optionIndex]: 'good' | 'bad' }

  // Notes state (auto-saved per lesson)
  const [notesStore, setNotesStore] = useState({})

  // AI Chat state
  const [aiFeed, setAiFeed] = useState([
    {
      role: 'assistant',
      content: 'I am your AI Mentor for this session. Ask me questions, request examples, or explore how this fits into your active roadmap.',
    },
  ])
  const [aiInput, setAiInput] = useState('')
  const [isAiStreaming, setIsAiStreaming] = useState(false)
  const aiFeedRef = useRef(null)
  const iframeRef = useRef(null)

  const sendPlayerCommand = useCallback((func, args = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        )
      }
    } catch (e) {
      console.warn('YouTube postMessage error:', e)
    }
  }, [])

  // Auto-scroll AI feed as messages and tokens arrive
  useEffect(() => {
    if (aiFeedRef.current) {
      aiFeedRef.current.scrollTop = aiFeedRef.current.scrollHeight
    }
  }, [aiFeed, isAiStreaming])

  const courseId = course?.id
  const pathId = path?.id
  const learningPathId = course?.learning_path_id
  const pathTitle = path?.title || course?.title || ''
  const courseTitle = courseData?.title || course?.title || 'Interactive Course'
  const instructor = courseData?.instructor || 'Technea Faculty'
  const platform = courseData?.platform || 'YouTube'
  const duration = courseData?.duration || '12 Hours'
  const category = courseData?.category || path?.category || 'Programming'
  const difficulty = courseData?.level || path?.level || 'Beginner'

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

  // Synchronize completed lessons with server when user is authenticated
  useEffect(() => {
    if (!user || !courseData?.id || !isNumericId(courseData.id)) return
    let isMounted = true

    getCourseProgressApi(courseData.id)
      .then((data) => {
        if (isMounted && data?.completed_lesson_ids) {
          setCompletedLessonIds(data.completed_lesson_ids)
          try {
            localStorage.setItem(storageKey, JSON.stringify(data.completed_lesson_ids))
          } catch (e) {
            console.warn('Failed to cache lesson progress locally:', e)
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load course progress from server:', err)
      })

    return () => {
      isMounted = false
    }
  }, [user, courseData?.id, storageKey])

  // Resolve active learning path and fetch corresponding first course & lessons
  useEffect(() => {
    let isMounted = true

    const resolveAndLoadCourse = async () => {
      setLoading(true)
      setError(null)

      try {
        let targetCourseId = courseId
        let finalCourse = null

        // 1. If explicit numeric courseId is provided, attempt to load it
        if (isNumericId(targetCourseId)) {
          try {
            finalCourse = await getCourseById(targetCourseId)
          } catch (err) {
            console.warn(`Course ID ${targetCourseId} not found, checking active roadmap/track:`, err.message)
            finalCourse = null
          }
        }

        // 2. If no valid course loaded yet, attempt resolution via learning path (from props or activeRoadmap)
        const activePathId = pathId || learningPathId || activeRoadmap?.id
        if (!finalCourse && isNumericId(activePathId)) {
          try {
            const pathCourses = await getCourses({ learning_path_id: activePathId })
            if (pathCourses && pathCourses.length > 0) {
              targetCourseId = pathCourses[0].id
              finalCourse = pathCourses[0]
            }
          } catch (err) {
            console.warn('Could not load courses for path ID:', activePathId, err)
          }
        }

        // 3. Fallback: match by activeRoadmap title or pathTitle
        const titleToMatch = pathTitle || activeRoadmap?.title || ''
        if (!finalCourse && titleToMatch) {
          try {
            const allCourses = await getCourses()
            const lowerTitle = titleToMatch.toLowerCase()
            const matched = (allCourses || []).find((c) => {
              const cTitle = (c.title || '').toLowerCase()
              return cTitle.includes(lowerTitle) || lowerTitle.includes(cTitle)
            })
            if (matched) {
              targetCourseId = matched.id
              finalCourse = matched
            } else if (allCourses && allCourses.length > 0) {
              targetCourseId = allCourses[0].id
              finalCourse = allCourses[0]
            }
          } catch (err) {
            console.warn('Could not query catalog courses fallback:', err)
          }
        }

        // 4. Absolute fallback: load first available course
        if (!finalCourse) {
          try {
            const allCourses = await getCourses()
            if (allCourses && allCourses.length > 0) {
              targetCourseId = allCourses[0].id
              finalCourse = allCourses[0]
            }
          } catch (err) {
            console.warn('Catalog course fallback failed:', err)
          }
        }

        if (!finalCourse) {
          if (isMounted) {
            setError('No courses found for this learning track.')
            setLoading(false)
          }
          return
        }

        const [courseLessons, related] = await Promise.all([
          getCourseLessons(finalCourse.id).catch(() => []),
          getRelatedCourses(finalCourse.id, 4).catch(() => []),
        ])

        if (!isMounted) return

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
        let currentCompleted = []
        try {
          const saved = localStorage.getItem(`technea_completed_lessons_${finalCourse.id}`)
          if (saved) {
            currentCompleted = JSON.parse(saved)
            setCompletedLessonIds(currentCompleted)
          }
        } catch {
          // Ignore
        }

        // Resolve target lesson index from URL parameter ?lesson= or first uncompleted lesson
        const searchParams = new URLSearchParams(window.location.search)
        const targetLessonParam = searchParams.get('lesson')
        let matchedIndex = -1

        if (targetLessonParam) {
          matchedIndex = combinedLessons.findIndex(
            (l) =>
              String(l.id) === String(targetLessonParam) ||
              String(l.lesson_order) === String(targetLessonParam)
          )
        }

        if (matchedIndex === -1 && currentCompleted.length > 0) {
          const completedSet = new Set(currentCompleted.map(String))
          matchedIndex = combinedLessons.findIndex(
            (l) => !completedSet.has(String(l.id))
          )
        }

        if (matchedIndex !== -1) {
          setActiveLessonIndex(matchedIndex)
        } else {
          setActiveLessonIndex(0)
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
  }, [course, courseId, pathId, learningPathId, pathTitle, activeRoadmap?.id, activeRoadmap?.title, retryKey])

  // Active lesson and YouTube video ID
  const activeLesson = lessons[activeLessonIndex] || null
  const currentVideoId =
    activeLesson?.youtube_video_id ||
    courseData?.youtube_video_id ||
    null

  const embedUrl = useMemo(() => {
    if (!currentVideoId) return ''
    return `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
  }, [currentVideoId])

  // Normalized Set of completed lesson IDs for bulletproof string/number ID type matching
  const completedLessonSet = useMemo(
    () => new Set((completedLessonIds || []).map((id) => String(id))),
    [completedLessonIds]
  )

  // Completion calculation
  const completedCount = useMemo(() => {
    return lessons.filter((l) => completedLessonSet.has(String(l.id))).length
  }, [lessons, completedLessonSet])

  const progressPercent = useMemo(() => {
    if (!lessons.length) return 0
    return Math.round((completedCount / lessons.length) * 100)
  }, [completedCount, lessons.length])

  // Group lessons into structured modules for the Journey Timeline
  const modules = useMemo(() => {
    if (!lessons.length) {
      return [
        {
          title: 'Getting Started',
          lessons: [
            { id: 1, title: 'Introduction & Setup', duration: '14 min', order: 1 },
            { id: 2, title: 'Core Environment Configuration', duration: '18 min', order: 2 },
          ],
        },
      ]
    }

    const chunkSize = Math.max(2, Math.ceil(lessons.length / 4))
    const list = []
    const titles = [
      'Foundations & Core Principles',
      'Architecture & Applied Patterns',
      'Data Modeling & State Transitions',
      'Integration & Production Deliverables',
    ]

    for (let i = 0; i < lessons.length; i += chunkSize) {
      const chunk = lessons.slice(i, i + chunkSize)
      const moduleIndex = Math.floor(i / chunkSize)
      list.push({
        title: titles[moduleIndex % titles.length] || `Module ${moduleIndex + 1}`,
        lessons: chunk,
        startIndex: i,
      })
    }
    return list
  }, [lessons])

  // Level & Ring calculation (250 XP per level, memoized)
  const { currentLevel, ringOffset } = useMemo(() => {
    const lvl = Math.floor(currentXp / 250) + 1
    const ratio = (currentXp % 250) / 250
    return {
      currentLevel: lvl,
      ringOffset: 119.4 * (1 - ratio),
    }
  }, [currentXp])

  // Floating Toast notification
  const triggerToast = useCallback((msg) => {
    setToastMessage(msg)
    setIsToastVisible(true)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setIsToastVisible(false)
    }, 2400)
  }, [])

  // Confetti Particle Explosion with Single RAF Guard & Tab Visibility Check
  const triggerBurst = useCallback(() => {
    const canvas = fxCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    document.body.classList.add('flash')
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
    flashTimeoutRef.current = setTimeout(() => {
      document.body.classList.remove('flash')
    }, 800)

    const isDark = dashboardTheme !== 'light'
    const colors = isDark
      ? ['255,255,255', '255,90,31', '77,255,180']
      : ['0,0,0', '255,90,31', '22,163,74']

    for (let i = 0; i < 90; i++) {
      particlesRef.current.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.55,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 14 - 3,
        l: 70,
        c: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Do not spawn concurrent animation loops if particles are already animating
    if (isFxRunningRef.current) return
    isFxRunningRef.current = true

    const animateParticles = () => {
      if (document.hidden) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particlesRef.current = []
        isFxRunningRef.current = false
        fxAnimIdRef.current = null
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter((p) => p.l > 0)
      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.35
        p.l--
        ctx.fillStyle = `rgba(${p.c},${p.l / 70})`
        ctx.fillRect(p.x, p.y, 3, 3)
      })

      if (particlesRef.current.length > 0) {
        fxAnimIdRef.current = requestAnimationFrame(animateParticles)
      } else {
        // Halt requestAnimationFrame when all particles finish
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        isFxRunningRef.current = false
        fxAnimIdRef.current = null
      }
    }

    fxAnimIdRef.current = requestAnimationFrame(animateParticles)
  }, [dashboardTheme])

  // XP addition with level up check
  const addXp = useCallback(
    (points) => {
      setEarnedXpDelta((prev) => {
        const next = prev + points
        const newLvl = Math.floor((realXp + next) / 250) + 1
        const oldLvl = Math.floor((realXp + prev) / 250) + 1
        if (newLvl > oldLvl) {
          setLevelUpNumber(newLvl)
          setIsLevelUpActive(true)
          if (levelUpTimer1Ref.current) clearTimeout(levelUpTimer1Ref.current)
          levelUpTimer1Ref.current = setTimeout(() => {
            triggerBurst()
          }, 300)
          if (levelUpTimer2Ref.current) clearTimeout(levelUpTimer2Ref.current)
          levelUpTimer2Ref.current = setTimeout(() => {
            setIsLevelUpActive(false)
          }, 2600)
        }
        return next
      })

      // Floating XP popup
      const chipEl = document.getElementById('xp-chip')
      if (chipEl) {
        const r = chipEl.getBoundingClientRect()
        const f = document.createElement('div')
        f.className = 'fxp'
        f.textContent = `+${points} XP`
        f.style.left = `${r.left + 10}px`
        f.style.top = `${r.bottom + 6}px`
        document.body.appendChild(f)
        setTimeout(() => {
          f.remove()
        }, 1200)
      }
    },
    [realXp, triggerBurst]
  )

  // Toggle Lesson Completion
  const handleToggleComplete = useCallback(
    async (lessonId) => {
      const strId = String(lessonId)
      const isCompleted = !completedLessonSet.has(strId)
      const next = isCompleted
        ? [...completedLessonIds.filter((id) => String(id) !== strId), lessonId]
        : completedLessonIds.filter((id) => String(id) !== strId)

      setCompletedLessonIds(next)

      if (isCompleted) {
        addXp(20)
        triggerBurst()
        triggerToast('+20 XP · Lesson Completed!')
        setLocalCompleted(true)
      }

      // Check if this completes the course or current module/milestone
      if (isCompleted && activeRoadmap?.id && toggleMilestone) {
        const nextSet = new Set(next.map((id) => String(id)))
        const isAllDone = lessons.length > 0 && lessons.every((l) => nextSet.has(String(l.id)))
        if (isAllDone) {
          const currentMsId = activeRoadmap.current_milestone?.id || activeRoadmap.milestones?.[0]?.id
          if (currentMsId) {
            toggleMilestone(activeRoadmap.id, currentMsId, true).catch(() => {})
          }
        }
      }

      if (user && isNumericId(courseData?.id) && isNumericId(lessonId)) {
        try {
          if (completeLesson) {
            await completeLesson(courseData.id, lessonId, isCompleted)
          } else {
            await toggleLessonProgressApi({
              course_id: courseData.id,
              lesson_id: lessonId,
              is_completed: isCompleted,
            })
          }
        } catch (err) {
          console.warn('Failed to save lesson progress to server:', err)
        }
      }
    },
    [completedLessonIds, completedLessonSet, user, courseData, completeLesson, toggleMilestone, activeRoadmap, lessons, addXp, triggerBurst, triggerToast]
  )

  // Lesson switching
  const goToLesson = useCallback(
    (index) => {
      const validIndex = Math.max(0, Math.min(lessons.length - 1, index))
      setActiveLessonIndex(validIndex)
      setSeekProgress(0)
      setQuizAnswerStates({})
      setIsPracticeSolved(false)

      // Update URL search param ?lesson= with pushState for history navigation
      const nextLesson = lessons[validIndex]
      if (nextLesson?.id) {
        const url = new URL(window.location.href)
        if (url.searchParams.get('lesson') !== String(nextLesson.id)) {
          url.searchParams.set('lesson', String(nextLesson.id))
          window.history.pushState({}, '', url.toString())
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [lessons]
  )

  // Sync active lesson with browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const lessonParam = searchParams.get('lesson')
      if (lessonParam && lessons.length > 0) {
        const idx = lessons.findIndex(
          (l) =>
            String(l.id) === String(lessonParam) ||
            String(l.lesson_order) === String(lessonParam)
        )
        if (idx !== -1) {
          setActiveLessonIndex(idx)
          setSeekProgress(0)
          setQuizAnswerStates({})
          setIsPracticeSolved(false)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [lessons])

  const hasNext = activeLessonIndex < lessons.length - 1
  const hasPrevious = activeLessonIndex > 0

  const handleNextLesson = useCallback(() => {
    if (hasNext) {
      if (activeLesson?.id && !completedLessonSet.has(String(activeLesson.id))) {
        handleToggleComplete(activeLesson.id)
      }
      goToLesson(activeLessonIndex + 1)
    }
  }, [hasNext, activeLesson, completedLessonSet, handleToggleComplete, goToLesson, activeLessonIndex])

  const handlePreviousLesson = useCallback(() => {
    if (hasPrevious) {
      goToLesson(activeLessonIndex - 1)
    }
  }, [hasPrevious, goToLesson, activeLessonIndex])

  // Notes persistence per lesson
  const currentLessonKey = activeLesson?.id ? String(activeLesson.id) : 'default'
  const personalNotes =
    notesStore[currentLessonKey] ??
    (typeof window !== 'undefined'
      ? localStorage.getItem(`technea_notes_${currentLessonKey}`) || ''
      : '')

  const handleNotesChange = useCallback((text) => {
    setNotesStore((prev) => ({ ...prev, [currentLessonKey]: text }))
    if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current)
    notesDebounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`technea_notes_${currentLessonKey}`, text)
      } catch (e) {
        console.warn(e)
      }
    }, 400)
  }, [currentLessonKey])

  // Practice Challenge evaluation
  const handleRunPractice = () => {
    const hasPrint = practiceCode.includes('print(')
    if (!hasPrint) {
      setPracticeOutput('> Nothing printed. Add a print() call to test.')
      return
    }

    const match = practiceCode.match(/print\((.+)\)/)
    const varName = match ? match[1].trim() : ''
    setPracticeOutput(`> ${varName || 'Technea'}\n> Execution finished with status 0.`)

    if (!isPracticeSolved) {
      setIsPracticeSolved(true)
      addXp(25)
      triggerBurst()
      triggerToast('+25 XP · Challenge Solved!')
    }
  }

  // Diagnostic Quiz Questions for current lesson
  const currentQuiz = useMemo(() => {
    const title = (activeLesson?.title || courseTitle || '').toLowerCase()
    if (title.includes('variable') || title.includes('syntax') || title.includes('start') || title.includes('begin')) {
      return {
        q: 'Which characteristic best describes immutable data structures in robust software systems?',
        options: [
          'Values cannot be changed after creation, preventing accidental mutation bugs.',
          'They execute with O(n^2) space overhead.',
          'They can only be declared inside the global scope.',
        ],
        correct: 0,
      }
    }
    if (title.includes('function') || title.includes('method') || title.includes('logic')) {
      return {
        q: 'In clean code architecture, why are pure functions preferred?',
        options: [
          'They mutate global storage directly.',
          'Same inputs always produce identical outputs with zero hidden side effects.',
          'They bypass memory allocation completely.',
        ],
        correct: 1,
      }
    }
    return {
      q: 'What is the primary benefit of modular architectural boundaries?',
      options: [
        'Arbitrarily increasing line counts.',
        'Isolating responsibilities so modules can be independently tested and maintained.',
        'Forcing synchronous execution across all threads.',
      ],
      correct: 1,
    }
  }, [activeLesson, courseTitle])

  const handleSelectQuizOption = (optIndex) => {
    const isCorrect = optIndex === currentQuiz.correct
    setQuizAnswerStates((prev) => ({
      ...prev,
      [optIndex]: isCorrect ? 'good' : 'bad',
    }))

    if (isCorrect && quizAnswerStates[optIndex] !== 'good') {
      addXp(10)
      triggerBurst()
      triggerToast('+10 XP · Correct Answer!')
    }
  }

  // AI Mentor Chat stream
  const handleSendAiMessage = useCallback(
    async (overridePrompt) => {
      const text = overridePrompt || aiInput
      if (!text.trim() || isAiStreaming) return

      const newMessages = [...aiFeed, { role: 'user', content: text }]
      setAiFeed(newMessages)
      setAiInput('')
      setIsAiStreaming(true)

      try {
        const res = await sendAiChatApi({
          message: text,
          context: {
            course_title: courseTitle,
            lesson_title: activeLesson?.title || courseTitle,
            active_roadmap: activeRoadmap?.title || 'Python Developer Roadmap',
            current_milestone: activeRoadmap?.current_milestone?.title || 'Core Foundations',
          },
        })
        const reply =
          res?.response ||
          res?.reply ||
          res?.message ||
          res?.answer ||
          `In ${activeLesson?.title || courseTitle}, focus on clean separation of concerns and predictable state transitions. Try implementing the pattern in the practice workspace!`

        // Typewriter streaming effect
        let charIdx = 0
        const placeholder = { role: 'assistant', content: '', streaming: true }
        setAiFeed([...newMessages, placeholder])

        if (aiStreamTimerRef.current) clearInterval(aiStreamTimerRef.current)
        aiStreamTimerRef.current = setInterval(() => {
          charIdx += 2
          if (charIdx >= reply.length) {
            if (aiStreamTimerRef.current) clearInterval(aiStreamTimerRef.current)
            aiStreamTimerRef.current = null
            setIsAiStreaming(false)
            setAiFeed([...newMessages, { role: 'assistant', content: reply, streaming: false }])
          } else {
            setAiFeed([
              ...newMessages,
              { role: 'assistant', content: reply.slice(0, charIdx), streaming: true },
            ])
          }
        }, 16)
      } catch {
        if (aiStreamTimerRef.current) clearInterval(aiStreamTimerRef.current)
        aiStreamTimerRef.current = null
        setIsAiStreaming(false)
        setAiFeed([
          ...newMessages,
          {
            role: 'assistant',
            content: `In ${activeLesson?.title || courseTitle}, isolate side effects in dedicated boundaries. Let me know if you would like a code walkthrough!`,
            streaming: false,
          },
        ])
      }
    },
    [aiInput, isAiStreaming, aiFeed, courseTitle, activeLesson, activeRoadmap]
  )

  // Master unmount cleanup for all animation loops and timers
  useEffect(() => {
    return () => {
      if (fxAnimIdRef.current) cancelAnimationFrame(fxAnimIdRef.current)
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      if (levelUpTimer1Ref.current) clearTimeout(levelUpTimer1Ref.current)
      if (levelUpTimer2Ref.current) clearTimeout(levelUpTimer2Ref.current)
      if (aiStreamTimerRef.current) clearInterval(aiStreamTimerRef.current)
      if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current)
      document.body.classList.remove('flash')
    }
  }, [])

  // Background Constellation Canvas Effect (Pauses on visibilitychange / hidden tab)
  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    let resizeTimer = null
    const handleResize = () => {
      if (resizeTimer) return
      resizeTimer = requestAnimationFrame(() => {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
        resizeTimer = null
      })
    }
    window.addEventListener('resize', handleResize, { passive: true })

    const particleCount = 70
    const nodes = []
    for (let i = 0; i < particleCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      })
    }

    let mouseX = -999
    let mouseY = -999

    const handlePointerMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    let animId = null
    let isRunning = false

    const render = () => {
      if (document.hidden) {
        isRunning = false
        animId = null
        return
      }

      ctx.clearRect(0, 0, width, height)
      const isDark = dashboardTheme !== 'light'
      const nodeColor = isDark ? '255,255,255' : '0,0,0'

      nodes.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const dx = mouseX - p.x
        const dy = mouseY - p.y
        // Fast AABB rejection before sqrt
        if (Math.abs(dx) < 160 && Math.abs(dy) < 160) {
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 160) {
            p.x += dx * 0.004
            p.y += dy * 0.004
          }
        }

        ctx.fillStyle = `rgba(${nodeColor}, 0.35)`
        ctx.fillRect(p.x, p.y, 1.6, 1.6)

        for (let j = i + 1; j < particleCount; j++) {
          const q = nodes[j]
          const pdx = p.x - q.x
          // Fast AABB rejection before distance squaring: sqrt(14000) ~ 118.3
          if (Math.abs(pdx) > 118.3) continue
          const pdy = p.y - q.y
          if (Math.abs(pdy) > 118.3) continue

          const distSq = pdx * pdx + pdy * pdy
          if (distSq < 14000) {
            ctx.strokeStyle = `rgba(${nodeColor}, ${0.09 * (1 - distSq / 14000)})`
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
      })

      animId = requestAnimationFrame(render)
    }

    const startAnimation = () => {
      if (!isRunning && !document.hidden) {
        isRunning = true
        animId = requestAnimationFrame(render)
      }
    }

    const stopAnimation = () => {
      if (animId) {
        cancelAnimationFrame(animId)
        animId = null
      }
      isRunning = false
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation()
      } else {
        startAnimation()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    startAnimation()

    return () => {
      stopAnimation()
      if (resizeTimer) cancelAnimationFrame(resizeTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [dashboardTheme])

  // Mouse Follower Dot & 3D Card Tilt Physics (Throttled via requestAnimationFrame)
  useEffect(() => {
    const dot = document.getElementById('cd')
    let rafId = null
    let latestEvent = null

    const processPointerMove = () => {
      if (!latestEvent) {
        rafId = null
        return
      }

      const { clientX, clientY, target } = latestEvent
      latestEvent = null

      if (dot) {
        dot.style.transform = `translate(${clientX}px, ${clientY}px)`
      }

      const el = target?.closest ? target : document.body
      const card = el.closest ? el.closest('.card, .rc') : null
      if (card) {
        const rect = card.getBoundingClientRect()
        const px = (clientX - rect.left) / rect.width
        const py = (clientY - rect.top) / rect.height
        card.style.setProperty('--x', `${clientX - rect.left}px`)
        card.style.setProperty('--y', `${clientY - rect.top}px`)
        card.style.setProperty('--ry', `${(px - 0.5) * 8}deg`)
        card.style.setProperty('--rx', `${(0.5 - py) * 8}deg`)
      }

      const btn = el.closest ? el.closest('.btn') : null
      if (btn) {
        const q = btn.getBoundingClientRect()
        btn.style.transform = `translate(${(clientX - q.left - q.width / 2) * 0.12}px, ${
          (clientY - q.top - q.height / 2) * 0.2
        }px)`
      }

      rafId = null
    }

    const handlePointerMove = (e) => {
      latestEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
      }
      if (!rafId) {
        rafId = requestAnimationFrame(processPointerMove)
      }
    }

    const handlePointerOut = (e) => {
      const target = e.target.closest && e.target.closest('.card, .rc, .btn')
      if (target && !target.contains(e.relatedTarget)) {
        target.style.setProperty('--rx', '0deg')
        target.style.setProperty('--ry', '0deg')
        if (target.classList.contains('btn')) {
          target.style.transform = ''
        }
      }
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerout', handlePointerOut, { passive: true })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerout', handlePointerOut)
    }
  }, [])

  // Command Palette actions
  const handleExecuteCommand = useCallback(
    (cmdId) => {
      setIsPaletteOpen(false)
      switch (cmdId) {
        case 'toggle-play':
          setIsVideoPlaying((p) => {
            const next = !p
            sendPlayerCommand(next ? 'playVideo' : 'pauseVideo')
            return next
          })
          break
        case 'next-lesson':
          handleNextLesson()
          break
        case 'prev-lesson':
          handlePreviousLesson()
          break
        case 'mark-complete':
          if (activeLesson?.id) handleToggleComplete(activeLesson.id)
          break
        case 'toggle-focus':
          setIsFocusMode((f) => {
            const next = !f
            triggerToast(next ? 'Focus mode on' : 'Focus mode off')
            return next
          })
          break
        case 'toggle-theme':
          dashboardToggleTheme()
          break
        case 'explain-simply':
          handleSendAiMessage('Explain this lesson in simple terms')
          break
        default:
          break
      }
    },
    [
      handleNextLesson,
      handlePreviousLesson,
      activeLesson,
      handleToggleComplete,
      triggerToast,
      dashboardToggleTheme,
      handleSendAiMessage,
      sendPlayerCommand,
    ]
  )

  const filteredCommands = useMemo(() => {
    if (!paletteQuery.trim()) return COMMAND_ITEMS
    const q = paletteQuery.toLowerCase()
    return COMMAND_ITEMS.filter((c) => c.title.toLowerCase().includes(q))
  }, [paletteQuery])

  // Command Palette Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsPaletteOpen((prev) => {
          const next = !prev
          if (next) {
            setPaletteQuery('')
            setPaletteSelectedIdx(0)
            setTimeout(() => paletteInputRef.current?.focus(), 50)
          }
          return next
        })
      } else if (e.key === 'Escape' && isPaletteOpen) {
        setIsPaletteOpen(false)
      } else if (isPaletteOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setPaletteSelectedIdx((prev) => (prev + 1) % Math.max(1, filteredCommands.length))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setPaletteSelectedIdx(
            (prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length)
          )
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (filteredCommands[paletteSelectedIdx]) {
            handleExecuteCommand(filteredCommands[paletteSelectedIdx].id)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaletteOpen, filteredCommands, paletteSelectedIdx, handleExecuteCommand])

  const userInitials = useMemo(() => {
    if (user?.full_name) {
      const parts = user.full_name.trim().split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return user.full_name.slice(0, 2).toUpperCase()
    }
    return 'HS'
  }, [user])

  // Loading state
  if (loading) {
    return (
      <div className="technea-learning-workspace min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--lw-hot)] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wider text-[var(--lw-mu)]">
            INITIALIZING WORKSPACE...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && (!courseData || !courseData.title || !lessons.length)) {
    return (
      <div className="technea-learning-workspace min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 mx-auto grid place-items-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--lw-tx)]">Unable to load course track</h2>
          <p className="text-xs text-[var(--lw-mu)]">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-lg border border-[var(--lw-line)] text-xs font-semibold hover:border-[var(--lw-tx)] transition-all cursor-pointer"
            >
              Back to Roadmap
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setError(null)
                setRetryKey((k) => k + 1)
              }}
              className="px-4 py-2 rounded-lg bg-[var(--lw-ac)] text-[var(--lw-ink)] text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isCurrentLessonDone = activeLesson?.id && completedLessonSet.has(String(activeLesson.id))

  return (
    <div
      className={`technea-learning-workspace ${isFocusMode ? 'focus' : ''}`}
      data-theme={dashboardTheme}
    >
      {/* SVG Symbol Definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <symbol id="back" viewBox="0 0 24 24">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </symbol>
          <symbol id="sun" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </symbol>
          <symbol id="check" viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </symbol>
          <symbol id="arrow" viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </symbol>
          <symbol id="clock" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </symbol>
          <symbol id="level" viewBox="0 0 24 24">
            <path d="M5 20v-5M12 20V9M19 20V4" />
          </symbol>
          <symbol id="code" viewBox="0 0 24 24">
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
          </symbol>
          <symbol id="spark" viewBox="0 0 24 24">
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
          </symbol>
          <symbol id="bulb" viewBox="0 0 24 24">
            <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />
          </symbol>
          <symbol id="bug" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-5-5" />
          </symbol>
          <symbol id="map" viewBox="0 0 24 24">
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="6" r="2" />
            <path d="M8 18h6a4 4 0 000-8h-4a4 4 0 010-8h6" />
          </symbol>
          <symbol id="note" viewBox="0 0 24 24">
            <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5" />
          </symbol>
          <symbol id="target" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1" />
          </symbol>
          <symbol id="quiz" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17h.01" />
          </symbol>
          <symbol id="full" viewBox="0 0 24 24">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </symbol>
          <symbol id="send" viewBox="0 0 24 24">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </symbol>
          <symbol id="play" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />
          </symbol>
          <symbol id="pause" viewBox="0 0 24 24">
            <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" stroke="none" />
          </symbol>
          <symbol id="flame" viewBox="0 0 24 24">
            <path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z" />
          </symbol>
        </defs>
      </svg>

      {/* Visual Canvas Background & Overlays */}
      <canvas id="bg" ref={bgCanvasRef} />
      <div className="cur-dot" id="cd" />
      <canvas id="fx" ref={fxCanvasRef} />

      {/* Toast Notification */}
      <div className={`lw-toast ${isToastVisible ? 'show' : ''}`}>{toastMessage}</div>

      {/* Level Up Banner Overlay */}
      <div className={`lu ${isLevelUpActive ? 'on' : ''}`}>
        <div>
          <small>Level up</small>
          <strong>{levelUpNumber || currentLevel}</strong>
          <span>You are on fire. Keep the streak alive.</span>
        </div>
      </div>

      {/* Command Palette Modal */}
      <div
        className={`pal ${isPaletteOpen ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target.classList.contains('pal')) setIsPaletteOpen(false)
        }}
      >
        <div>
          <input
            ref={paletteInputRef}
            placeholder="Type a command (e.g. Next lesson, Focus mode...)"
            value={paletteQuery}
            onChange={(e) => {
              setPaletteQuery(e.target.value)
              setPaletteSelectedIdx(0)
            }}
          />
          <div className="space-y-1 mt-2">
            {filteredCommands.map((cmd, i) => (
              <button
                key={cmd.id}
                type="button"
                className={i === paletteSelectedIdx ? 'sel' : ''}
                onClick={() => handleExecuteCommand(cmd.id)}
              >
                {cmd.title}
              </button>
            ))}
            {filteredCommands.length === 0 && (
              <div className="p-3 text-xs text-[var(--lw-mu)]">No matching command found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Header Navigation */}
      <div className="wrap">
        <header>
          <button type="button" className="back" onClick={onBack}>
            <svg>
              <use href="#back" />
            </svg>
            <span>Back to Roadmap</span>
          </button>

          <div className="path">
            <b>{activeRoadmap?.title || pathTitle || courseTitle}</b>
            <div className="prog">
              <div className="bar">
                <i style={{ width: `${progressPercent}%` }} />
              </div>
              <span>{progressPercent}% complete</span>
            </div>
          </div>

          <div className="tools">
            <span className="chip">
              <svg id="fl">
                <use href="#flame" />
              </svg>
              <span>{streakCount}</span> day streak
              <span className="wk">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i className={todayCompleted ? '' : 't'} />
              </span>
            </span>

            <span className="chip" id="xp-chip">
              <svg>
                <use href="#spark" />
              </svg>
              <span>{currentXp.toLocaleString()}</span> XP
            </span>

            <button
              type="button"
              className="ib kbd"
              onClick={() => {
                setIsPaletteOpen(true)
                setTimeout(() => paletteInputRef.current?.focus(), 50)
              }}
              title="Open command palette (⌘K / Ctrl+K)"
            >
              ⌘K
            </button>

            <button
              type="button"
              className="ib"
              onClick={dashboardToggleTheme}
              title="Toggle theme (Light / Dark)"
            >
              <svg>
                <use href="#sun" />
              </svg>
            </button>

            <div className="lv" title={`Level ${currentLevel} Developer`}>
              <svg viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="19" className="t" />
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  className="p"
                  style={{ strokeDashoffset: ringOffset }}
                />
              </svg>
              <div className="av">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name || 'User'} />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <b>{currentLevel}</b>
            </div>
          </div>
        </header>

        {/* ── MAIN WORKSPACE CONTENT ── */}
        <main>
          {/* Top Hero: Video Player + AI Mentor Companion */}
          <div className="hero">
            <div>
              {/* Live Streak Reminder Pill */}
              <StreakBanner todayCompleted={todayCompleted} />

              {/* Title with staggered words animation */}
              <h1>
                {courseTitle.split(' ').map((word, i) => (
                  <span
                    key={i}
                    className="w"
                    style={{ animationDelay: `${i * 90 + 100}ms` }}
                  >
                    {word}{' '}
                  </span>
                ))}
              </h1>

              <p className="crumb">
                Lesson {activeLessonIndex + 1} of {lessons.length || 1} ·{' '}
                {activeLesson?.title || 'Course Overview'} · Taught by {instructor}
              </p>

              {/* 16:9 Video Player Container with Conic Border & Scanlines */}
              <div className={`player ${isVideoPlaying ? 'playing' : ''}`}>
                {/* Floating "Up Next" pill */}
                <div className="up">
                  {hasNext ? (
                    <>
                      <svg style={{ width: 14, height: 14 }}>
                        <use href="#arrow" />
                      </svg>
                      <span>Up next · {lessons[activeLessonIndex + 1]?.title}</span>
                    </>
                  ) : (
                    <span>Final lesson</span>
                  )}
                </div>

                {/* Video Player */}
                {currentVideoId ? (
                  <VideoIframe
                    iframeRef={iframeRef}
                    videoId={currentVideoId}
                    title={activeLesson?.title || courseTitle}
                    embedUrl={embedUrl}
                    onIframeLoad={handleIframeLoad}
                  />
                ) : (
                  <>
                    <div className="player-grid" />
                    <div className="player-code">
                      <span className="on">name = "Technea"</span>
                      <span className="on">track = "{pathTitle || 'Python'}"</span>
                      <span className="on">lesson = "{activeLesson?.title || 'Interactive Lesson'}"</span>
                      <span>&nbsp;</span>
                      <span className="on">print("Ready for deep learning.")</span>
                    </div>
                    <div className="play-btn">
                      <svg>
                        <use href="#play" />
                      </svg>
                    </div>
                  </>
                )}

                {/* Floating Controls Bar */}
                <div className="ctrl" onClick={(e) => e.stopPropagation()}>
                  <div
                    className="seek"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                      setSeekProgress(pct)
                      sendPlayerCommand('seekTo', [pct * 1200, true])
                    }}
                  >
                    <div>
                      <i style={{ width: `${seekProgress * 100}%` }} />
                    </div>
                  </div>

                  <div className="row">
                    <button
                      type="button"
                      aria-label="Play or pause"
                      onClick={() => {
                        setIsVideoPlaying((p) => {
                          const next = !p
                          sendPlayerCommand(next ? 'playVideo' : 'pauseVideo')
                          return next
                        })
                      }}
                    >
                      <svg style={{ width: 16 }}>
                        <use href={isVideoPlaying ? '#pause' : '#play'} />
                      </svg>
                    </button>
                    <span>
                      {activeLesson?.duration
                        ? `Playing · ${activeLesson.duration}`
                        : '00:00 / 22:00'}
                    </span>
                    <span className="sp" />
                    <button
                      type="button"
                      onClick={() => {
                        const speeds = [1.0, 1.25, 1.5, 2.0]
                        const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length]
                        setPlaybackSpeed(next)
                        sendPlayerCommand('setPlaybackRate', [next])
                        triggerToast(`Playback speed: ${next}×`)
                      }}
                    >
                      {playbackSpeed.toFixed(1)}×
                    </button>
                    <button
                      type="button"
                      aria-label="Focus mode"
                      onClick={() => {
                        setIsFocusMode((f) => !f)
                        triggerToast(isFocusMode ? 'Focus mode off' : 'Focus mode on')
                      }}
                    >
                      <svg style={{ width: 16 }}>
                        <use href="#full" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Metadata tags & Lesson Action buttons */}
              <div className="meta">
                <div className="tags">
                  <span>
                    <svg>
                      <use href="#level" />
                    </svg>
                    {difficulty}
                  </span>
                  <span>
                    <svg>
                      <use href="#clock" />
                    </svg>
                    {duration}
                  </span>
                  <span>
                    <svg>
                      <use href="#code" />
                    </svg>
                    {platform} · {category}
                  </span>
                </div>

                <div className="acts">
                  <button
                    type="button"
                    className="btn b2"
                    onClick={handlePreviousLesson}
                    disabled={!hasPrevious}
                    style={{ opacity: hasPrevious ? 1 : 0.4 }}
                  >
                    <svg style={{ transform: 'rotate(180deg)' }}>
                      <use href="#arrow" />
                    </svg>
                    <span>Previous Lesson</span>
                  </button>

                  <button
                    type="button"
                    className={`btn b1 ${isCurrentLessonDone ? 'done' : ''}`}
                    onClick={() => activeLesson?.id && handleToggleComplete(activeLesson.id)}
                  >
                    <svg>
                      <use href="#check" />
                    </svg>
                    <span>{isCurrentLessonDone ? 'Completed' : 'Mark Complete'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn b2"
                    onClick={handleNextLesson}
                    disabled={!hasNext}
                  >
                    <span>Next Lesson</span>
                    <svg>
                      <use href="#arrow" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Mentor Companion Panel */}
            <aside className="ai">
              <div className="ai-h">
                <div className="orb" />
                <div>
                  <b>AI Mentor</b>
                  <small>Your learning companion</small>
                </div>
              </div>

              <div className="ctx">
                <div>
                  <span>Learning</span>
                  <b>{activeRoadmap?.title || pathTitle || 'Python Fundamentals'}</b>
                </div>
                <div>
                  <span>Current lesson</span>
                  <b>{activeLesson?.title || 'Lesson 1'}</b>
                </div>
              </div>

              {/* 4 Quick Action Prompt Cards */}
              <div className="qa">
                <button
                  type="button"
                  onClick={() =>
                    handleSendAiMessage('Explain the core concept in simple terms with an analogy')
                  }
                >
                  <svg>
                    <use href="#spark" />
                  </svg>
                  <span>Explain simply</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendAiMessage('Give me a production-ready real-world code example')
                  }
                >
                  <svg>
                    <use href="#bulb" />
                  </svg>
                  <span>Give example</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendAiMessage('What are the most common mistakes and anti-patterns to avoid?')
                  }
                >
                  <svg>
                    <use href="#bug" />
                  </svg>
                  <span>Find mistakes</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendAiMessage('How does this lesson connect to my active roadmap milestone?')
                  }
                >
                  <svg>
                    <use href="#map" />
                  </svg>
                  <span>Relate to roadmap</span>
                </button>
              </div>

              {/* Live Chat Feed */}
              <div ref={aiFeedRef} className="feed" aria-live="polite">
                {aiFeed.map((msg, i) => (
                  <div
                    key={i}
                    className={`msg ${msg.role === 'user' ? 'me' : ''} ${
                      msg.streaming ? 'caret' : ''
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>

              {/* Input pill */}
              <div className="input-pill">
                <input
                  placeholder="Ask about this lesson..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendAiMessage()
                  }}
                />
                <button
                  type="button"
                  className="send"
                  onClick={() => handleSendAiMessage()}
                  disabled={!aiInput.trim() || isAiStreaming}
                  aria-label="Send message to mentor"
                >
                  <svg style={{ width: 16 }}>
                    <use href="#send" />
                  </svg>
                </button>
              </div>
            </aside>
          </div>

          {/* ── COURSE JOURNEY TIMELINE SECTION ── */}
          <section>
            <h2>Course Journey</h2>
            <p className="sub">Pick any lesson. Your path updates as you go.</p>

            <div className="journey">
              {modules.map((mod, modIdx) => {
                const modLessons = mod.lessons || []
                const isAllCompleted =
                  modLessons.length > 0 &&
                  modLessons.every((l) => completedLessonSet.has(String(l.id)))
                const containsCurrent = modLessons.some(
                  (l, idx) => (mod.startIndex || 0) + idx === activeLessonIndex
                )

                return (
                  <div
                    key={modIdx}
                    className={`mod ${isAllCompleted ? 'done' : ''} ${
                      containsCurrent ? 'cur' : ''
                    }`}
                  >
                    <div className="node">
                      <svg>
                        <use href="#check" />
                      </svg>
                    </div>

                    <div className="mt">
                      <b>
                        Module {modIdx + 1} · {mod.title}
                      </b>
                      {containsCurrent && <small>You are here</small>}
                    </div>

                    <div className="space-y-1">
                      {modLessons.map((les, lIdx) => {
                        const globalIndex = (mod.startIndex || 0) + lIdx
                        const isDone = completedLessonSet.has(String(les.id))
                        const isCurrent = globalIndex === activeLessonIndex

                        return (
                          <button
                            key={les.id || lIdx}
                            type="button"
                            className={`les ${isDone ? 'ok ' : ''}${isCurrent ? 'on' : ''}`}
                            onClick={() => goToLesson(globalIndex)}
                          >
                            <svg>
                              <use href={isDone ? '#check' : isCurrent ? '#play' : '#clock'} />
                            </svg>
                            <b>{les.title}</b>
                            <small>{les.duration || '12 min'}</small>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── PRACTICE WORKSPACE CARDS SECTION ── */}
          <section>
            <h2>Practice Workspace</h2>
            <p className="sub">Every lesson earns XP. Try them.</p>

            <div className="cards3">
              {/* Card 1: Lesson Notes */}
              <div className="card">
                <div className="ico">
                  <svg>
                    <use href="#note" />
                  </svg>
                </div>
                <b>Lesson Notes</b>
                <p>
                  Architectural takeaway: Maintain pure deterministic functions, isolate external
                  side-effects in boundary layers, and write explicit type assertions.
                </p>
                <textarea
                  value={personalNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Your personal notes for this lesson (auto-saved locally)..."
                  aria-label="Notes"
                />
                <span className="go">
                  Auto-saved
                  <svg>
                    <use href="#check" />
                  </svg>
                </span>
              </div>

              {/* Card 2: Practice Challenge */}
              <div className="card">
                <div className="ico">
                  <svg>
                    <use href="#target" />
                  </svg>
                </div>
                <b>Practice Challenge</b>
                <textarea
                  value={practiceCode}
                  onChange={(e) => setPracticeCode(e.target.value)}
                  spellCheck={false}
                  aria-label="Practice Code"
                />
                <div className="out">{practiceOutput}</div>
                <button type="button" className="go" onClick={handleRunPractice}>
                  <span>Run code</span>
                  <svg>
                    <use href="#arrow" />
                  </svg>
                </button>
              </div>

              {/* Card 3: Quick Quiz */}
              <div className="card">
                <div className="ico">
                  <svg>
                    <use href="#quiz" />
                  </svg>
                </div>
                <b>Quick quiz</b>
                <p className="text-xs text-[var(--lw-tx)] font-medium">{currentQuiz.q}</p>
                <div className="space-y-1">
                  {currentQuiz.options.map((opt, i) => {
                    const status = quizAnswerStates[i]
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`opt ${status === 'good' ? 'good' : ''} ${
                          status === 'bad' ? 'bad' : ''
                        }`}
                        onClick={() => handleSelectQuizOption(i)}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── CONTINUE YOUR LEARNING PATH SECTION ── */}
          <section>
            <h2>Continue Your Learning Path</h2>
            <p className="sub">
              Curated to accelerate your journey through {pathTitle || courseTitle}.
            </p>

            <div className="cards4">
              {(relatedCourses.length > 0
                ? relatedCourses
                : [
                    {
                      id: 'rec-1',
                      title: 'Object-Oriented Architecture & Clean Design',
                      instructor: 'Meera Rao',
                      duration: '6h 20m',
                      skill: 'Builds on Foundations',
                    },
                    {
                      id: 'rec-2',
                      title: 'Automate Pipelines & Distributed Microservices',
                      instructor: 'Daniel Shaw',
                      duration: '4h 45m',
                      skill: 'Production Engineering',
                    },
                    {
                      id: 'rec-3',
                      title: 'Data Structures, Algorithms & Scalability',
                      instructor: 'Priya Nair',
                      duration: '8h 10m',
                      skill: 'Next on Roadmap',
                    },
                  ]
              ).map((rel) => {
                const authorInitials = (rel.instructor || 'Technea Faculty')
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <div
                    key={rel.id}
                    className="rc"
                    onClick={() => {
                      if (onSelectCourse) {
                        onSelectCourse(rel)
                      } else if (rel.id && !String(rel.id).startsWith('rec-')) {
                        window.history.pushState({}, '', `/courses/${rel.id}`)
                        window.dispatchEvent(new PopStateEvent('popstate'))
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <b>{rel.title}</b>
                    <div className="by">
                      <i>{authorInitials}</i>
                      <span>{rel.instructor || 'Technea Faculty'}</span>
                    </div>
                    <div className="f">
                      <span className="skill">
                        <svg>
                          <use href="#map" />
                        </svg>
                        <span>{rel.skill || 'Recommended Next'}</span>
                      </span>
                      <span>{rel.duration || '5h 30m'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
