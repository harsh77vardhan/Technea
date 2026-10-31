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

  // Telemetry & Metrics
  const [summaryData, setSummaryData] = useState(null)
  const [dailyActivity, setDailyActivity] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [catalogRoadmaps, setCatalogRoadmaps] = useState([])
  const [recommendedProjects, setRecommendedProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Active Roadmap Selection (Single Source of Truth)
  const [activeRoadmap, setActiveRoadmap] = useState(null)

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
    if (Array.isArray(ws.saved_roadmaps)) {
      setSavedRoadmaps(ws.saved_roadmaps)
      const active = ws.saved_roadmaps.find((r) => r.is_active) || ws.saved_roadmaps[0] || null
      if (active) setActiveRoadmap(active)
    }
    if (Array.isArray(ws.recommended_projects)) {
      setRecommendedProjects(ws.recommended_projects)
    }
    if (Array.isArray(ws.my_projects)) {
      setMyProjects(ws.my_projects)
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

  // Lazy-load roadmap catalog only when user navigates to 'roadmaps' tab
  useEffect(() => {
    if (activeTab === 'roadmaps' && catalogRoadmaps.length === 0) {
      let isSubscribed = true
      getRoadmapCatalogApi({ limit: 12 })
        .then((catVal) => {
          if (!isSubscribed) return
          if (Array.isArray(catVal)) setCatalogRoadmaps(catVal)
          else if (catVal?.items) setCatalogRoadmaps(catVal.items)
        })
        .catch((err) => console.warn('Could not load catalog roadmaps:', err))
      return () => {
        isSubscribed = false
      }
    }
  }, [activeTab, catalogRoadmaps.length])


  // Switch Active Roadmap
  const switchActiveRoadmap = useCallback(
    async (target) => {
      if (!target) return
      try {
        if (target.roadmap_data !== undefined || target.goal !== undefined) {
          // AI Generated Roadmap
          await setActiveRoadmapApi(target.id)
        } else {
          // Curated Catalog Path
          await setActiveLearningPathApi(target.id)
        }
        setActiveRoadmap(target)
        showToast(`Active roadmap switched to: ${target.title}`, 'success')
        // Refresh telemetry and progress
        await refreshDashboard()
      } catch (err) {
        console.error('Failed to switch active roadmap:', err)
        // Optimistic switch anyway
        setActiveRoadmap(target)
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
      } catch (err) {
        console.warn('Could not toggle daily task:', err)
      }
    },
    [showToast]
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

  // Normalized Active Roadmap Computations
  const activeRoadmapNormalized = useMemo(() => {
    if (!activeRoadmap) {
      // Fallback to first enrolled path from summary if available
      const firstEnrolled = summaryData?.enrolled_paths?.[0]
      if (firstEnrolled) {
        return {
          id: firstEnrolled.id,
          title: firstEnrolled.title,
          category: firstEnrolled.category,
          progress_percent: firstEnrolled.progress_percent,
          completed_steps_count: firstEnrolled.completed_steps_count,
          total_steps_count: firstEnrolled.total_steps_count,
          next_step_title: firstEnrolled.next_step_title,
          is_generated: false,
          milestones: [
            { id: 'step-1', title: 'HTML & Semantic Architecture', completed: true },
            { id: 'step-2', title: 'Modern CSS & Responsive Systems', completed: true },
            { id: 'step-3', title: 'Core JavaScript & DOM APIs', completed: true },
            { id: 'step-4', title: firstEnrolled.next_step_title || 'CSS Flexbox & Layouts', current: true },
            { id: 'step-5', title: 'React & Component Architecture', locked: true },
          ],
        }
      }
      return null
    }

    // AI Generated Roadmap
    if (activeRoadmap.roadmap_data && activeRoadmap.roadmap_data.phases) {
      const phases = activeRoadmap.roadmap_data.phases || []
      const completedSet = new Set(
        (activeRoadmap.completed_milestone_ids || []).map((id) => String(id))
      )
      const flatMilestones = []
      let nextUncompletedFound = false
      let currentMilestoneObj = null

      phases.forEach((ph, pIdx) => {
        ;(ph.milestones || []).forEach((ms, mIdx) => {
          const msId = String(ms.id || `ph-${pIdx}-ms-${mIdx}`)
          const isDone = completedSet.has(msId)
          let isCurrent = false
          let isLocked = false

          if (isDone) {
            // Completed
          } else if (!nextUncompletedFound) {
            isCurrent = true
            nextUncompletedFound = true
            currentMilestoneObj = { ...ms, id: msId, phase_title: ph.title }
          } else {
            isLocked = true
          }

          flatMilestones.push({
            id: msId,
            title: ms.title,
            description: ms.description,
            completed: isDone,
            current: isCurrent,
            locked: isLocked,
            estimated_time: ms.estimated_time || '35 mins',
            skills: ms.skills || [],
            course_id: ms.course_id || (pIdx * 10 + mIdx + 1),
            lesson_id: ms.lesson_id || (pIdx * 100 + mIdx + 1),
          })
        })
      })

      const totalCount = Math.max(1, flatMilestones.length)
      const completedCount = completedSet.size
      const computedPercent = Math.min(100, Math.round((completedCount / totalCount) * 100))

      return {
        id: activeRoadmap.id,
        title: activeRoadmap.title,
        goal: activeRoadmap.goal,
        target_role: activeRoadmap.target_role || 'Full Stack Engineer',
        progress_percent: activeRoadmap.progress_percent || computedPercent,
        completed_steps_count: completedCount,
        total_steps_count: totalCount,
        next_step_title: currentMilestoneObj?.title || 'Review & Capstone Practice',
        current_milestone: currentMilestoneObj || flatMilestones[0] || null,
        milestones: flatMilestones,
        is_generated: true,
      }
    }

    // Default object for curated path
    return {
      id: activeRoadmap.id,
      title: activeRoadmap.title,
      category: activeRoadmap.category || 'Engineering',
      progress_percent: activeRoadmap.progress_percent || 0,
      completed_steps_count: activeRoadmap.completed_steps_count || 0,
      total_steps_count: activeRoadmap.total_steps_count || 5,
      next_step_title: activeRoadmap.next_step_title || 'Foundations',
      milestones: [
        { id: 'node-1', title: 'Core Syntax & Paradigm', completed: true },
        { id: 'node-2', title: 'Data Structures & Algorithms', completed: true },
        { id: 'node-3', title: 'Async Patterns & Concurrency', completed: true },
        { id: 'node-4', title: activeRoadmap.next_step_title || 'Framework Mastery', current: true },
        { id: 'node-5', title: 'Production Architecture', locked: true },
      ],
      is_generated: false,
    }
  }, [activeRoadmap, summaryData])

  // Today's Learning Mission (Derived single source of truth)
  const todayMission = useMemo(() => {
    if (!activeRoadmapNormalized) {
      return {
        sequence_label: '01 / Getting Started',
        skill_name: 'Python Fundamentals',
        lesson_title: 'Introduction to Technea Learning Workspace',
        progress_percent: 0,
        estimated_time: '20 minutes remaining',
        reward_xp: 50,
        course_id: 1,
        lesson_id: 1,
      }
    }

    const currentMs =
      activeRoadmapNormalized.current_milestone ||
      activeRoadmapNormalized.milestones?.find((m) => m.current) ||
      activeRoadmapNormalized.milestones?.[0]

    const completedCount = activeRoadmapNormalized.completed_steps_count || 0
    const seqNum = String(completedCount + 1).padStart(2, '0')

    return {
      sequence_label: `${seqNum} / ${currentMs?.title || activeRoadmapNormalized.next_step_title || 'Core Practice'}`,
      skill_name: activeRoadmapNormalized.title,
      lesson_title: currentMs?.title || activeRoadmapNormalized.next_step_title || 'Mastering Modern Architecture',
      progress_percent: activeRoadmapNormalized.progress_percent || 0,
      estimated_time: currentMs?.estimated_time ? `${currentMs.estimated_time} remaining` : '25 minutes remaining',
      reward_xp: 75,
      course_id: currentMs?.course_id || 1,
      lesson_id: currentMs?.lesson_id || 1,
    }
  }, [activeRoadmapNormalized])

  // Context for AI Mentor 2.0
  const aiMentorContext = useMemo(() => {
    return {
      active_roadmap: activeRoadmapNormalized?.title || 'General Engineering',
      current_milestone: todayMission.lesson_title,
      current_lesson: todayMission.lesson_title,
      progress_percent: activeRoadmapNormalized?.progress_percent || 0,
      streak_count: dailyActivity?.streak_count || 1,
      xp_points: summaryData?.gamification?.xp_points || 250,
      developer_level: summaryData?.gamification?.developer_level || 'Code Initiate',
    }
  }, [activeRoadmapNormalized, todayMission, dailyActivity, summaryData])

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
            "I encountered a momentary connection hiccup with the pedagogical engine. Your question regarding the active milestone has been noted. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMentorMessages((prev) => [...prev, errMsg])
      } finally {
        setIsMentorTyping(false)
      }
    },
    [mentorMessages, aiMentorContext]
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
