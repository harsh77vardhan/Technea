import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { DashboardContext } from './DashboardContextDef'
import { useAuth } from './useAuth'
import {
  getDashboardWorkspaceApi,
  getDashboardSummaryApi,
  getMyRoadmapsApi,
  getRoadmapCatalogApi,
  getRecommendedProjectsApi,
  getMyProjectsApi,
  getDailyActivityApi,
  toggleDailyTaskApi,
  getAchievementsApi,
  setActiveRoadmapApi,
  setActiveLearningPathApi,
  toggleLessonProgressApi,
  toggleRoadmapMilestoneApi,
  updateProjectStatusApi,
  sendAiChatApi,
} from '../services/api'

export function DashboardProvider({ children }) {
  const { user, logout } = useAuth()

  // Tab State: 'overview' | 'roadmaps' | 'courses' | 'projects' | 'mentor' | 'portfolio' | 'settings'
  const [activeTab, setActiveTab] = useState('overview')

  // Visual Theme: 'dark' | 'light' (remembered across page reloads via localStorage)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('technea_dashboard_theme') || 'dark'
    }
    return 'dark'
  })

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        localStorage.setItem('technea_dashboard_theme', next)
      }
      return next
    })
  }, [])

  const setExplicitTheme = useCallback((newTheme) => {
    const valid = newTheme === 'light' ? 'light' : 'dark'
    setTheme(valid)
    if (typeof window !== 'undefined') {
      localStorage.setItem('technea_dashboard_theme', valid)
    }
  }, [])

  // Telemetry & Metrics (Strict real data from backend/database)
  const [summaryData, setSummaryData] = useState(null)
  const [dailyActivity, setDailyActivity] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [catalogRoadmaps, setCatalogRoadmaps] = useState([])
  const [recommendedProjects, setRecommendedProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Active Roadmap Selection (Single Source of Truth, persisted in localStorage & backend)
  const [activeRoadmap, setActiveRoadmap] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('technea_active_roadmap')
        if (stored) return JSON.parse(stored)
      } catch (err) {
        console.warn('Could not parse stored active roadmap:', err)
      }
    }
    return null
  })
  const [continueLearningData, setContinueLearningData] = useState(null)

  // Toast notification system
  const [toast, setToast] = useState(null)
  const showToast = useCallback((message, type = 'info') => {
    setToast({ id: Date.now(), message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }, [])

  // Mentor Chat State
  const [mentorMessages, setMentorMessages] = useState([
    {
      id: 'init-1',
      sender: 'mentor',
      content:
        "Greetings, engineer. I am your Technea AI Mentor. I am continuously synchronized with your active roadmap, milestone goals, and code deliverables. What concept or architectural challenge shall we tackle today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [isMentorTyping, setIsMentorTyping] = useState(false)

  // In-memory workspace cache to eliminate redundant network roundtrips
  const workspaceCacheRef = useRef({ data: null, timestamp: 0 })

  // Helper to unpack workspace payload into state
  const applyWorkspaceData = useCallback((ws) => {
    if (!ws) return
    if (ws.summary) setSummaryData(ws.summary)
    if (ws.daily_activity) setDailyActivity(ws.daily_activity)
    if (Array.isArray(ws.achievements)) setAchievements(ws.achievements)
    if (Array.isArray(ws.recommended_projects)) {
      setRecommendedProjects(ws.recommended_projects)
    }
    if (Array.isArray(ws.my_projects)) {
      setMyProjects(ws.my_projects)
    }

    if (Array.isArray(ws.saved_roadmaps)) {
      setSavedRoadmaps(ws.saved_roadmaps)

      // Preferred active roadmap ID from localStorage
      let preferredActiveId = null
      let preferredActiveTitle = null
      if (typeof window !== 'undefined') {
        preferredActiveId = localStorage.getItem('technea_active_roadmap_id')
        try {
          const stored = localStorage.getItem('technea_active_roadmap')
          if (stored) {
            const parsed = JSON.parse(stored)
            preferredActiveId = preferredActiveId || String(parsed.id || '')
            preferredActiveTitle = (parsed.title || '').toLowerCase()
          }
        } catch {
          // ignore
        }
      }

      // Find active roadmap in returned workspace
      const matchedWsActive =
        (preferredActiveId && ws.saved_roadmaps.find((r) => String(r.id) === String(preferredActiveId))) ||
        (preferredActiveTitle && ws.saved_roadmaps.find((r) => (r.title || '').toLowerCase() === preferredActiveTitle)) ||
        ws.saved_roadmaps.find((r) => r.is_active) ||
        ws.saved_roadmaps[0] ||
        null

      if (matchedWsActive) {
        setActiveRoadmap((prev) => {
          // If user explicitly has an active roadmap stored in localStorage, preserve it unless matched
          if (preferredActiveTitle && prev && (prev.title || '').toLowerCase() === preferredActiveTitle) {
            return { ...prev, ...matchedWsActive, is_active: true }
          }
          if (prev && preferredActiveId && String(prev.id) === String(preferredActiveId)) {
            return { ...prev, ...matchedWsActive, is_active: true }
          }
          return matchedWsActive
        })
      }
    }

    if (ws.continue_learning) {
      setContinueLearningData(ws.continue_learning)
    }
  }, [])

  // Consolidated data refresh function
  const refreshDashboard = useCallback(async (force = true) => {
    if (!user) return

    // Serve from cache if fresh and not forced
    const now = Date.now()
    if (!force && workspaceCacheRef.current.data && now - workspaceCacheRef.current.timestamp < 45000) {
      applyWorkspaceData(workspaceCacheRef.current.data)
      setIsLoading(false)
      return
    }

    try {
      // 1. Try single consolidated endpoint first
      const wsData = await getDashboardWorkspaceApi()
      if (wsData && wsData.summary) {
        applyWorkspaceData(wsData)
        workspaceCacheRef.current = { data: wsData, timestamp: now }
        return
      }
    } catch {
      // 2. Fallback to parallel multi-endpoint requests if consolidated endpoint is unavailable
      try {
        const [summaryRes, dailyRes, achRes, roadmapsRes, recProjRes, myProjRes] =
          await Promise.allSettled([
            getDashboardSummaryApi(),
            getDailyActivityApi(),
            getAchievementsApi(),
            getMyRoadmapsApi(),
            getRecommendedProjectsApi(),
            getMyProjectsApi(),
          ])

        if (summaryRes.status === 'fulfilled' && summaryRes.value) {
          setSummaryData(summaryRes.value)
        }
        if (dailyRes.status === 'fulfilled' && dailyRes.value) {
          setDailyActivity(dailyRes.value)
        }
        if (achRes.status === 'fulfilled' && Array.isArray(achRes.value)) {
          setAchievements(achRes.value)
        }
        if (roadmapsRes.status === 'fulfilled' && Array.isArray(roadmapsRes.value)) {
          const roadmaps = roadmapsRes.value
          setSavedRoadmaps(roadmaps)
          const active = roadmaps.find((r) => r.is_active) || roadmaps[0] || null
          if (active) setActiveRoadmap(active)
        }
        if (recProjRes.status === 'fulfilled' && Array.isArray(recProjRes.value)) {
          setRecommendedProjects(recProjRes.value)
        }
        if (myProjRes.status === 'fulfilled' && Array.isArray(myProjRes.value)) {
          setMyProjects(myProjRes.value)
        }
      } catch (fallbackErr) {
        console.warn('Dashboard data refresh partial error:', fallbackErr)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, applyWorkspaceData])

  // Initial load
  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      if (!user) {
        if (isMounted) setIsLoading(false)
        return
      }

      // Check cache for instant 0ms paint
      const now = Date.now()
      if (workspaceCacheRef.current.data && now - workspaceCacheRef.current.timestamp < 45000) {
        applyWorkspaceData(workspaceCacheRef.current.data)
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        const wsData = await getDashboardWorkspaceApi()
        if (!isMounted) return
        if (wsData && wsData.summary) {
          applyWorkspaceData(wsData)
          workspaceCacheRef.current = { data: wsData, timestamp: now }
        }
      } catch {
        // Fallback to parallel fetching
        if (!isMounted) return
        await refreshDashboard(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [user, applyWorkspaceData, refreshDashboard])

  // Pre-load roadmap catalog for instant search and roadmaps discovery
  useEffect(() => {
    if (catalogRoadmaps.length > 0) return
    let isSubscribed = true
    getRoadmapCatalogApi({ limit: 250 })
      .then((catVal) => {
        if (!isSubscribed) return
        if (Array.isArray(catVal)) setCatalogRoadmaps(catVal)
        else if (catVal?.items) setCatalogRoadmaps(catVal.items)
      })
      .catch((err) => console.warn('Could not load catalog roadmaps:', err))
    return () => {
      isSubscribed = false
    }
  }, [catalogRoadmaps.length])


  // Switch Active Roadmap (Centralized Single Source of Truth)
  const switchActiveRoadmap = useCallback(
    async (target) => {
      if (!target) return

      // Construct immediate active roadmap state
      const newActive = {
        ...target,
        is_active: true,
        progress_percent: target.progress_percent ?? 0,
      }

      // 1. Immediately update centralized active roadmap state
      setActiveRoadmap(newActive)

      // 2. Persist in localStorage for instant reload & offline resilience
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('technea_active_roadmap', JSON.stringify(newActive))
          localStorage.setItem('technea_active_roadmap_id', String(newActive.id))
        } catch (e) {
          console.warn('Failed to persist active roadmap to localStorage:', e)
        }
      }

      // 3. Mark active in savedRoadmaps list immediately
      setSavedRoadmaps((prev) => {
        const exists = prev.some(
          (r) => String(r.id) === String(newActive.id) || (r.title && r.title === newActive.title)
        )
        if (!exists) {
          return [{ ...newActive, is_active: true }, ...prev.map((r) => ({ ...r, is_active: false }))]
        }
        return prev.map((r) => ({
          ...r,
          is_active: String(r.id) === String(newActive.id) || (r.title && r.title === newActive.title),
        }))
      })

      // 4. Invalidate workspace cache to prevent stale paints
      workspaceCacheRef.current = { data: null, timestamp: 0 }

      // 5. Derive optimistic continueLearningData matching the new active roadmap
      const firstStep =
        (Array.isArray(newActive.roadmap_steps) && newActive.roadmap_steps[0]) ||
        newActive.roadmap_data?.phases?.[0]?.milestones?.[0] ||
        (Array.isArray(newActive.milestones) && newActive.milestones[0]) ||
        newActive.current_milestone

      const firstMilestoneTitle = firstStep?.title || 'Core Foundations'
      const firstEstimatedTime = firstStep?.duration || firstStep?.estimated_time || '25 min'

      setContinueLearningData({
        roadmap_id: newActive.id,
        roadmap_title: newActive.title,
        milestone_id: String(firstStep?.id || '1'),
        milestone_title: firstMilestoneTitle,
        phase_title: newActive.roadmap_data?.phases?.[0]?.title || `${newActive.title} Modules`,
        lesson_id: firstStep?.id || 1,
        lesson_title: firstStep?.title || `Foundations of ${newActive.title}`,
        course_id: firstStep?.course_id || newActive.id || 1,
        course_title: newActive.title,
        duration: firstEstimatedTime,
        progress_percent: newActive.progress_percent || 0,
      })

      showToast(`Active roadmap switched to: ${newActive.title}`, 'success')

      // 6. Synchronize with backend API
      try {
        if (newActive.is_generated === true) {
          await setActiveRoadmapApi(newActive.id)
        } else {
          try {
            await setActiveLearningPathApi(newActive.id)
          } catch {
            await setActiveRoadmapApi(newActive.id)
          }
        }
      } catch (err) {
        console.warn('Backend active roadmap sync notice:', err)
      }

      // 7. Refresh background telemetry
      try {
        await refreshDashboard(true)
      } catch (err) {
        console.warn('Dashboard telemetry refresh error:', err)
      }
    },
    [refreshDashboard, showToast]
  )

  // Toggle Daily Task Checklist
  const toggleDailyTask = useCallback(
    async (taskId, isCompleted) => {
      try {
        const updated = await toggleDailyTaskApi({ task_id: taskId, is_completed: isCompleted })
        setDailyActivity(updated)
        if (isCompleted) {
          showToast('Daily task checked off! +10 XP', 'success')
        }
        await refreshDashboard()
      } catch (err) {
        console.warn('Could not toggle daily task via API, using optimistic update:', err)
        setDailyActivity((prev) => {
          const currentTasks = new Set(prev?.completed_tasks || [])
          if (isCompleted) currentTasks.add(taskId)
          else currentTasks.delete(taskId)
          return {
            ...prev,
            completed_tasks: Array.from(currentTasks),
            earned_today_xp: Math.max(0, (prev?.earned_today_xp || 0) + (isCompleted ? 10 : -10)),
          }
        })
        if (isCompleted) {
          showToast('Daily task checked off! +10 XP', 'success')
        }
      }
    },
    [refreshDashboard, showToast]
  )

  // Toggle Lesson Progress with Automatic Cascading
  const completeLesson = useCallback(
    async (courseId, lessonId, isCompleted = true) => {
      try {
        const res = await toggleLessonProgressApi({
          course_id: courseId,
          lesson_id: lessonId,
          is_completed: isCompleted,
        })
        if (isCompleted) {
          showToast('Lesson completed! Progress synchronized • +20 XP', 'success')
        }
        await refreshDashboard()
        return res
      } catch (err) {
        console.error('Failed to toggle lesson progress:', err)
        throw err
      }
    },
    [refreshDashboard, showToast]
  )

  // Toggle Milestone Progress
  const toggleMilestone = useCallback(
    async (roadmapId, milestoneId, isCompleted) => {
      try {
        const updated = await toggleRoadmapMilestoneApi(roadmapId, {
          milestone_id: milestoneId,
          is_completed: isCompleted,
        })
        if (isCompleted) {
          showToast('Milestone achieved! Next mission unlocked • +50 XP', 'success')
        }
        await refreshDashboard()
        return updated
      } catch (err) {
        console.error('Failed to toggle milestone:', err)
        throw err
      }
    },
    [refreshDashboard, showToast]
  )

  // Update Project Status
  const updateProject = useCallback(
    async (projectId, status, githubUrl) => {
      try {
        const payload = { status }
        if (githubUrl !== undefined) payload.github_url = githubUrl
        const updated = await updateProjectStatusApi(projectId, payload)
        showToast(`Project updated: ${status.replace('_', ' ')}`, 'success')
        await refreshDashboard()
        return updated
      } catch (err) {
        console.error('Failed to update project status:', err)
        throw err
      }
    },
    [refreshDashboard, showToast]
  )

  // Normalized Active Roadmap Computations (Single Source of Truth)
  const activeRoadmapNormalized = useMemo(() => {
    if (!activeRoadmap) {
      const firstEnrolled = summaryData?.enrolled_paths?.[0]
      if (firstEnrolled) {
        return {
          id: firstEnrolled.id,
          title: firstEnrolled.title,
          category: firstEnrolled.category,
          progress_percent: firstEnrolled.progress_percent || 0,
          completed_steps_count: firstEnrolled.completed_steps_count || 0,
          total_steps_count: firstEnrolled.total_steps_count || 4,
          next_step_title: firstEnrolled.next_step_title || 'Core Foundations',
          is_generated: false,
          milestones: [],
          current_milestone: {
            id: '1',
            title: firstEnrolled.next_step_title || 'Core Foundations',
            estimated_time: '25 min',
          },
        }
      }
      return null
    }

    const completedSet = new Set(
      (activeRoadmap.completed_milestone_ids || []).map((id) => String(id))
    )

    // CASE 1: Curated catalog roadmap with sequential roadmap_steps
    if (Array.isArray(activeRoadmap.roadmap_steps) && activeRoadmap.roadmap_steps.length > 0) {
      const flatMilestones = []
      let nextUncompletedFound = false
      let currentMilestoneObj = null

      activeRoadmap.roadmap_steps.forEach((step, idx) => {
        const stepId = String(step.id || `step-${idx + 1}`)
        const isDone = completedSet.has(stepId)
        let isCurrent = false

        if (!isDone && !nextUncompletedFound) {
          isCurrent = true
          nextUncompletedFound = true
          currentMilestoneObj = {
            id: stepId,
            title: step.title,
            description: step.description,
            estimated_time: step.duration || '25 min',
            skills: step.topics || [],
            course_id: step.course_id || activeRoadmap.id || 1,
            lesson_id: step.id || idx + 1,
          }
        }

        flatMilestones.push({
          id: stepId,
          title: step.title,
          description: step.description,
          completed: isDone,
          current: isCurrent,
          locked: !isDone && !isCurrent,
          estimated_time: step.duration || '25 min',
          skills: step.topics || [],
          course_id: step.course_id || activeRoadmap.id || 1,
          lesson_id: step.id || idx + 1,
        })
      })

      if (!currentMilestoneObj && flatMilestones.length > 0) {
        currentMilestoneObj = flatMilestones[0]
      }

      const totalCount = Math.max(1, flatMilestones.length)
      const completedCount = completedSet.size
      const computedPercent = Math.min(100, Math.round((completedCount / totalCount) * 100))

      return {
        id: activeRoadmap.id,
        title: activeRoadmap.title,
        goal: activeRoadmap.goal,
        target_role: activeRoadmap.target_role || activeRoadmap.category || 'Engineering Track',
        progress_percent: activeRoadmap.progress_percent ?? computedPercent,
        completed_steps_count: completedCount,
        total_steps_count: totalCount,
        next_step_title: currentMilestoneObj?.title || 'Core Foundations',
        current_milestone: currentMilestoneObj,
        milestones: flatMilestones,
        roadmap_steps: activeRoadmap.roadmap_steps,
        is_generated: false,
      }
    }

    // CASE 2: AI Generated Roadmap or Enrolled Path with phases
    if (activeRoadmap.roadmap_data && Array.isArray(activeRoadmap.roadmap_data.phases)) {
      const phases = activeRoadmap.roadmap_data.phases || []
      const flatMilestones = []
      let nextUncompletedFound = false
      let currentMilestoneObj = null

      phases.forEach((ph, pIdx) => {
        ;(ph.milestones || []).forEach((ms, mIdx) => {
          const msId = String(ms.id || `ph-${pIdx}-ms-${mIdx}`)
          const isDone = completedSet.has(msId)
          let isCurrent = false

          if (!isDone && !nextUncompletedFound) {
            isCurrent = true
            nextUncompletedFound = true
            currentMilestoneObj = { ...ms, id: msId, phase_title: ph.title }
          }

          flatMilestones.push({
            id: msId,
            title: ms.title,
            description: ms.description,
            completed: isDone,
            current: isCurrent,
            locked: !isDone && !isCurrent,
            estimated_time: ms.estimated_time || '35 mins',
            skills: ms.skills || ms.key_skills || [],
            course_id: ms.courses?.[0]?.id || ms.course_id || 1,
            lesson_id: ms.courses?.[0]?.lesson_id || ms.lesson_id || 1,
          })
        })
      })

      if (!currentMilestoneObj && flatMilestones.length > 0) {
        currentMilestoneObj = flatMilestones[0]
      }

      const totalCount = Math.max(1, flatMilestones.length)
      const completedCount = completedSet.size
      const computedPercent = Math.min(100, Math.round((completedCount / totalCount) * 100))

      return {
        id: activeRoadmap.id,
        title: activeRoadmap.title,
        goal: activeRoadmap.goal,
        target_role: activeRoadmap.target_role || 'Full Stack Engineer',
        progress_percent: activeRoadmap.progress_percent ?? computedPercent,
        completed_steps_count: completedCount,
        total_steps_count: totalCount,
        next_step_title: currentMilestoneObj?.title || 'Review & Capstone Practice',
        current_milestone: currentMilestoneObj || flatMilestones[0] || null,
        milestones: flatMilestones,
        is_generated: activeRoadmap.is_generated !== false,
      }
    }

    // CASE 3: Direct array of milestones
    const rawMilestones = Array.isArray(activeRoadmap.milestones) ? activeRoadmap.milestones : []
    const flatMilestones = rawMilestones.map((m, idx) => ({
      ...m,
      id: String(m.id || `m-${idx + 1}`),
      current: idx === 0,
    }))
    const currentMs = flatMilestones.find((m) => m.current) || flatMilestones[0] || null

    return {
      id: activeRoadmap.id,
      title: activeRoadmap.title,
      category: activeRoadmap.category || 'Engineering',
      progress_percent: activeRoadmap.progress_percent || 0,
      completed_steps_count: activeRoadmap.completed_steps_count || 0,
      total_steps_count: activeRoadmap.total_steps_count || Math.max(1, flatMilestones.length),
      next_step_title: currentMs?.title || activeRoadmap.next_step_title || 'Foundations',
      current_milestone: currentMs,
      milestones: flatMilestones,
      is_generated: false,
    }
  }, [activeRoadmap, summaryData])

  // Today's Learning Mission (Derived single source of truth from active roadmap)
  const todayMission = useMemo(() => {
    if (!activeRoadmapNormalized) {
      return {
        sequence_label: '01 / Getting Started',
        skill_name: 'Technea Learning Workspace',
        lesson_title: 'Introduction to Technea Learning Workspace',
        milestone_title: 'Orientation',
        progress_percent: 0,
        estimated_time: '20 minutes remaining',
        reward_xp: 20,
        course_id: 1,
        lesson_id: 1,
      }
    }

    // Check if continueLearningData matches our current active roadmap
    const activeId = String(activeRoadmapNormalized.id || '')
    const activeTitle = (activeRoadmapNormalized.title || '').toLowerCase()
    const clRoadmapId = String(continueLearningData?.roadmap_id || '')
    const clRoadmapTitle = (continueLearningData?.roadmap_title || '').toLowerCase()
    const clMatches =
      (activeId && clRoadmapId && activeId === clRoadmapId) ||
      (activeTitle && clRoadmapTitle && activeTitle === clRoadmapTitle)

    if (continueLearningData && clMatches) {
      const completedCount = activeRoadmapNormalized.completed_steps_count || 0
      const seqNum = String(completedCount + 1).padStart(2, '0')
      return {
        sequence_label: `${seqNum} / ${continueLearningData.milestone_title || 'Core Foundations'}`,
        skill_name: continueLearningData.roadmap_title || activeRoadmapNormalized.title,
        lesson_title: continueLearningData.lesson_title || continueLearningData.milestone_title || 'Next Lesson',
        milestone_title: continueLearningData.milestone_title || 'Core Foundations',
        progress_percent: continueLearningData.progress_percent ?? activeRoadmapNormalized.progress_percent ?? 0,
        estimated_time: continueLearningData.duration ? `${continueLearningData.duration} remaining` : '25 minutes remaining',
        reward_xp: 20,
        course_id: continueLearningData.course_id || 1,
        lesson_id: continueLearningData.lesson_id || 1,
      }
    }

    // Derive directly from the active roadmap single source of truth
    const currentMs =
      activeRoadmapNormalized.current_milestone ||
      activeRoadmapNormalized.milestones?.find((m) => m.current) ||
      activeRoadmapNormalized.milestones?.[0]

    const completedCount = activeRoadmapNormalized.completed_steps_count || 0
    const seqNum = String(completedCount + 1).padStart(2, '0')
    const msTitle = currentMs?.title || activeRoadmapNormalized.next_step_title || 'Core Foundations'

    return {
      sequence_label: `${seqNum} / ${msTitle}`,
      skill_name: activeRoadmapNormalized.title,
      lesson_title: msTitle,
      milestone_title: msTitle,
      progress_percent: activeRoadmapNormalized.progress_percent || 0,
      estimated_time: currentMs?.estimated_time ? `${currentMs.estimated_time} remaining` : '25 minutes remaining',
      reward_xp: 20,
      course_id: currentMs?.course_id || activeRoadmapNormalized.id || 1,
      lesson_id: currentMs?.lesson_id || 1,
    }
  }, [continueLearningData, activeRoadmapNormalized])

  // Context for AI Mentor 2.0
  const aiMentorContext = useMemo(() => {
    return {
      active_roadmap: activeRoadmapNormalized?.title || 'General Engineering',
      current_milestone: todayMission?.milestone_title || todayMission?.lesson_title || 'Core Foundations',
      current_lesson: todayMission?.lesson_title || 'Core Foundations',
      progress_percent: activeRoadmapNormalized?.progress_percent || 0,
      streak_count: dailyActivity?.streak_count || 0,
      xp_points: summaryData?.xp_points ?? user?.total_xp ?? 0,
      developer_level: summaryData?.developer_level || 'Code Initiate',
    }
  }, [activeRoadmapNormalized, todayMission, dailyActivity, summaryData, user])

  // Send AI Mentor Message with injected context
  const sendMentorMessage = useCallback(
    async (text) => {
      if (!text || !text.trim()) return

      const userMsg = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMentorMessages((prev) => [...prev, userMsg])
      setIsMentorTyping(true)

      try {
        const historyPayload = mentorMessages
          .filter((m) => m.id !== 'init-1')
          .map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
          }))

        const res = await sendAiChatApi({
          message: text.trim(),
          conversation_history: historyPayload,
          context: aiMentorContext,
        })

        const aiMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'mentor',
          content: res?.response || 'I am analyzing your active milestone and curriculum. Please ask another question.',
          suggestions: res?.suggestions || [],
          related_actions: res?.related_actions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }

        setMentorMessages((prev) => [...prev, aiMsg])
      } catch (err) {
        console.error('AI Mentor chat failure:', err)
        const errMsg = {
          id: `msg-${Date.now() + 2}`,
          sender: 'mentor',
          content:
            `I am synchronized with your active roadmap "${activeRoadmapNormalized?.title || 'Technea Workspace'}" and milestone "${todayMission?.milestone_title || todayMission?.lesson_title || 'Core Foundations'}". How would you like to proceed with your practice today?`,
          suggestions: ['Explain current concept', 'Give me a code challenge', 'Review my progress'],
          related_actions: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMentorMessages((prev) => [...prev, errMsg])
      } finally {
        setIsMentorTyping(false)
      }
    },
    [mentorMessages, aiMentorContext, activeRoadmapNormalized?.title, todayMission]
  )

  const resetMentorSession = useCallback(() => {
    setMentorMessages([
      {
        id: 'init-1',
        sender: 'mentor',
        content: `Workspace context re-synchronized with active track: ${activeRoadmapNormalized?.title || 'Technea'}. How may I guide your next step?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [activeRoadmapNormalized])

  const value = useMemo(
    () => ({
      user,
      logout,
      activeTab,
      setActiveTab,
      isLoading,
      summaryData,
      dailyActivity,
      achievements,
      savedRoadmaps,
      catalogRoadmaps,
      recommendedProjects,
      myProjects,
      activeRoadmap: activeRoadmapNormalized,
      rawActiveRoadmap: activeRoadmap,
      allRoadmaps: savedRoadmaps,
      continueLearningData,
      switchActiveRoadmap,
      todayMission,
      aiMentorContext,
      mentorMessages,
      isMentorTyping,
      sendMentorMessage,
      resetMentorSession,
      completeLesson,
      toggleMilestone,
      toggleDailyTask,
      updateProject,
      refreshDashboard,
      toast,
      showToast,
      theme,
      setTheme: setExplicitTheme,
      toggleTheme,
    }),
    [
      user,
      logout,
      activeTab,
      isLoading,
      summaryData,
      dailyActivity,
      achievements,
      savedRoadmaps,
      catalogRoadmaps,
      recommendedProjects,
      myProjects,
      activeRoadmapNormalized,
      activeRoadmap,
      continueLearningData,
      switchActiveRoadmap,
      todayMission,
      aiMentorContext,
      mentorMessages,
      isMentorTyping,
      sendMentorMessage,
      resetMentorSession,
      completeLesson,
      toggleMilestone,
      toggleDailyTask,
      updateProject,
      refreshDashboard,
      toast,
      showToast,
      theme,
      setExplicitTheme,
      toggleTheme,
    ]
  )

  return (
    <DashboardContext.Provider value={value}>
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-violet-500/30 bg-[#0f111a]/95 text-white shadow-2xl backdrop-blur-xl text-xs font-mono tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span>{toast.message}</span>
        </div>
      )}
    </DashboardContext.Provider>
  )
}
