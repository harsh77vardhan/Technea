import { memo, useMemo, useCallback } from 'react'
import { Check, Star, Compass, ArrowRight } from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'

function DashboardReferenceOverview({
  onContinueLesson,
  onResumeMilestone,
  onNavigateTab = () => {},
  onInspectRoadmap = () => {},
}) {
  const {
    user,
    activeRoadmap,
    todayMission,
    dailyActivity,
    summaryData,
    achievements,
    myProjects,
    recommendedProjects,
    continueLearningData,
    isLoading,
    theme,
  } = useDashboard()

  const isLight = theme === 'light'
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Developer'
  const firstName = fullName.split(' ')[0]

  // Direct lesson navigator
  const handleContinue = useCallback(
    (item) => {
      const target = item || todayMission || continueLearningData
      if (typeof onContinueLesson === 'function') {
        onContinueLesson(target)
        return
      }
      if (typeof onResumeMilestone === 'function') {
        onResumeMilestone(target)
        return
      }
      const courseId =
        target?.course_id ||
        continueLearningData?.course_id ||
        activeRoadmap?.course_id ||
        null
      const lessonId = target?.lesson_id || continueLearningData?.lesson_id || 1
      const targetUrl = courseId
        ? `/courses/${courseId}?lesson=${lessonId}`
        : activeRoadmap?.id
        ? `/courses?path=${activeRoadmap.id}`
        : '/courses'
      window.history.pushState({}, '', targetUrl)
      window.dispatchEvent(new PopStateEvent('popstate'))
    },
    [onContinueLesson, onResumeMilestone, todayMission, continueLearningData, activeRoadmap]
  )

  // Dynamic time-aware greeting
  const currentHour = new Date().getHours()
  let greetingTime = 'evening'
  if (currentHour >= 5 && currentHour < 12) {
    greetingTime = 'morning'
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingTime = 'afternoon'
  }

  // Stats computation and circular SVG ring math (properly memoized)
  const ringStats = useMemo(() => {
    const xpPoints = summaryData?.xp_points ?? user?.total_xp ?? 0
    const computedLevel =
      summaryData?.developer_level ||
      (xpPoints > 0 ? `Level ${Math.floor(xpPoints / 400) + 1}` : 'Code Initiate')
    const streakCount = dailyActivity?.streak_count ?? 0

    // Active roadmap progress and steps
    const totalStages = activeRoadmap?.total_steps_count || activeRoadmap?.milestones?.length || 1
    const completedStages =
      activeRoadmap?.completed_steps_count ||
      activeRoadmap?.milestones?.filter((m) => m.completed)?.length ||
      0
    const currentStage = Math.min(totalStages, Math.max(1, completedStages + 1))

    // Mission progress percent and steps for SVG ring
    const displayProgress = todayMission?.progress_percent ?? activeRoadmap?.progress_percent ?? 0
    const totalSteps = Math.max(1, totalStages)
    const completedSteps = Math.min(totalSteps, completedStages)

    // Circular SVG ring math
    const radius = 52
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, displayProgress)) / 100)

    // Indicator dot coordinate on circular perimeter
    const angleDeg = -90 + (Math.min(100, Math.max(0, displayProgress)) / 100) * 360
    const angleRad = (angleDeg * Math.PI) / 180
    const dotX = 70 + radius * Math.cos(angleRad)
    const dotY = 70 + radius * Math.sin(angleRad)

    return {
      xpPoints,
      computedLevel,
      streakCount,
      totalStages,
      completedStages,
      currentStage,
      displayProgress,
      totalSteps,
      completedSteps,
      radius,
      circumference,
      strokeDashoffset,
      dotX,
      dotY,
    }
  }, [summaryData, user, dailyActivity, activeRoadmap, todayMission])

  const {
    xpPoints,
    computedLevel,
    streakCount,
    totalStages,
    currentStage,
    displayProgress,
    totalSteps,
    completedSteps,
    radius,
    circumference,
    strokeDashoffset,
    dotX,
    dotY,
  } = ringStats

  // Continue learning courses derived from active roadmap curriculum / real courses
  const continueCourses = useMemo(() => {
    const list = []
    const activeId = String(activeRoadmap?.id || '')
    const activeTitle = (activeRoadmap?.title || '').toLowerCase()
    const clRoadmapId = String(continueLearningData?.roadmap_id || '')
    const clRoadmapTitle = (continueLearningData?.roadmap_title || '').toLowerCase()
    const clMatches =
      (activeId && clRoadmapId && activeId === clRoadmapId) ||
      (activeTitle && clRoadmapTitle && activeTitle === clRoadmapTitle)

    if (continueLearningData?.course_id && clMatches) {
      list.push({
        id: continueLearningData.course_id,
        title: continueLearningData.course_title || continueLearningData.lesson_title || 'Core Foundations',
        progress: continueLearningData.progress_percent || 0,
        subtitle: `${continueLearningData.milestone_title || 'Module 1'} · ${continueLearningData.duration || '25 min left'}`,
        course_id: continueLearningData.course_id,
        lesson_id: continueLearningData.lesson_id || 1,
      })
    }

    if (Array.isArray(activeRoadmap?.milestones)) {
      for (const ms of activeRoadmap.milestones) {
        if (!list.some((item) => item.title === ms.title)) {
          list.push({
            id: ms.course_id || ms.id,
            title: ms.title,
            progress: ms.completed ? 100 : ms.current ? (activeRoadmap.progress_percent || 0) : 0,
            subtitle: `${ms.estimated_time || '25 min left'} · Practical Lab`,
            course_id: ms.course_id || activeRoadmap.id || 1,
            lesson_id: ms.lesson_id || 1,
          })
        }
        if (list.length >= 3) break
      }
    }

    if (list.length < 3 && Array.isArray(activeRoadmap?.roadmap_steps)) {
      for (const step of activeRoadmap.roadmap_steps) {
        if (!list.some((item) => item.title === step.title)) {
          list.push({
            id: step.id,
            title: step.title,
            progress: 0,
            subtitle: `${step.duration || '25 min left'} · Step ${step.step_number || 1}`,
            course_id: step.course_id || activeRoadmap.id || 1,
            lesson_id: step.id || 1,
          })
        }
        if (list.length >= 3) break
      }
    }

    if (list.length < 3 && activeRoadmap?.roadmap_data?.phases) {
      for (const phase of activeRoadmap.roadmap_data.phases) {
        for (const ms of phase.milestones || []) {
          for (const c of ms.courses || []) {
            if (!list.some((item) => item.id === c.id)) {
              list.push({
                id: c.id,
                title: c.title,
                progress: ms.completed ? 100 : (activeRoadmap.progress_percent || 0),
                subtitle: `${c.instructor || ms.title} · ${c.duration || '25 min left'}`,
                course_id: c.id,
                lesson_id: ms.lesson_id || 1,
              })
            }
            if (list.length >= 3) break
          }
          if (list.length >= 3) break
        }
        if (list.length >= 3) break
      }
    }

    if (list.length === 0 && activeRoadmap) {
      list.push({
        id: activeRoadmap.id,
        title: activeRoadmap.title,
        progress: activeRoadmap.progress_percent || 0,
        subtitle: `${activeRoadmap.target_role || 'Core Track'} · In Progress`,
        course_id: 1,
        lesson_id: 1,
      })
    }
    return list
  }, [continueLearningData, activeRoadmap])

  // Roadmap stages progress derived from active roadmap's real milestones/phases
  const roadmapStages = useMemo(() => {
    if (activeRoadmap?.milestones && activeRoadmap.milestones.length > 0) {
      return activeRoadmap.milestones.slice(0, 3).map((m) => ({
        label: m.completed ? m.title : m.current ? `${m.title} · current` : m.title,
        percent: m.completed ? 100 : m.current ? (activeRoadmap.progress_percent || 0) : 0,
      }))
    }
    if (activeRoadmap?.roadmap_steps && activeRoadmap.roadmap_steps.length > 0) {
      return activeRoadmap.roadmap_steps.slice(0, 3).map((step, idx) => ({
        label: idx === 0 ? `${step.title} · current` : step.title,
        percent: idx === 0 ? (activeRoadmap.progress_percent || 0) : 0,
      }))
    }
    if (activeRoadmap?.roadmap_data?.phases && activeRoadmap.roadmap_data.phases.length > 0) {
      return activeRoadmap.roadmap_data.phases.slice(0, 3).map((ph, idx) => {
        const isCurrent = idx === 0
        const rawTitle = typeof ph?.title === 'string' ? ph.title : `Phase ${idx + 1}`
        const cleanTitle = rawTitle.includes(':') ? rawTitle.split(':')[1]?.trim() || rawTitle : rawTitle
        return {
          label: isCurrent ? `${cleanTitle} · current` : cleanTitle,
          percent: isCurrent ? (activeRoadmap.progress_percent || 0) : 0,
        }
      })
    }
    return []
  }, [activeRoadmap])

  // Connected projects derived from real user projects and roadmap recommendations
  const projectsList = useMemo(() => {
    const list = []
    if (Array.isArray(myProjects) && myProjects.length > 0) {
      myProjects.forEach((p) => {
        const stepsCount = p.milestones?.length || 4
        const completedCount =
          p.status === 'completed'
            ? stepsCount
            : p.status === 'in_progress'
            ? Math.round(stepsCount * 0.5)
            : 0
        list.push({
          title: p.title,
          steps: `${completedCount} of ${stepsCount}`,
          subtitle: p.technologies?.slice(0, 3)?.join(' · ') || 'Practical Deliverable',
          progress: p.status === 'completed' ? 100 : p.status === 'in_progress' ? 50 : 0,
        })
      })
    }
    if (list.length < 2 && Array.isArray(recommendedProjects)) {
      recommendedProjects.forEach((p) => {
        if (list.length >= 2) return
        list.push({
          title: p.title,
          steps: `0 of ${p.milestones?.length || 4}`,
          subtitle: p.technologies?.slice(0, 3)?.join(' · ') || 'Recommended Lab',
          progress: 0,
        })
      })
    }
    return list
  }, [myProjects, recommendedProjects])

  // Platform achievements derived from real backend achievements
  const achievementsList = useMemo(() => {
    if (!Array.isArray(achievements) || achievements.length === 0) {
      return []
    }
    const sorted = [...achievements].sort(
      (a, b) => (b.earned || b.unlocked ? 1 : 0) - (a.earned || a.unlocked ? 1 : 0)
    )
    return sorted.slice(0, 3).map((ach) => {
      let type = 'check'
      if (ach.achievement_id === 'streak_master' || ach.id === 'streak_master' || ach.icon === 'flame') {
        type = 'number'
      } else if (ach.icon === 'star' || ach.icon === 'sparkles') {
        type = 'star'
      }
      return {
        type,
        badgeText: `${streakCount}`,
        title: ach.title,
        subtitle: ach.earned || ach.unlocked ? 'Unlocked' : (ach.category || 'Milestone'),
      }
    })
  }, [achievements, streakCount])

  if (isLoading && !activeRoadmap) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className={`h-10 w-72 rounded-xl ${isLight ? 'bg-[#e8e0d4]' : 'bg-[#111]'}`} />
        <div className={`h-64 w-full rounded-3xl ${isLight ? 'bg-[#e8e0d4]' : 'bg-[#111]'}`} />
        <div className={`h-32 w-full rounded-2xl ${isLight ? 'bg-[#e8e0d4]' : 'bg-[#111]'}`} />
      </div>
    )
  }

  return (
    <div className={`space-y-8 pb-8 select-none transition-colors duration-300 ${isLight ? 'text-[#181614]' : 'text-[#e8e3db]'}`}>
      {/* ──────────────── 1. HEADER ROW: GREETING & METRICS ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-1">
        {/* Left: Greeting */}
        <div>
          <h1 className={`text-3xl sm:text-4xl font-light tracking-tight [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
            Good {greetingTime}, {firstName}
          </h1>
          <p className={`text-sm mt-1.5 font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#777]'}`}>
            Continue building your future.
          </p>
        </div>

        {/* Right: Metrics */}
        <div className={`flex items-center gap-6 shrink-0 rounded-2xl border px-6 py-3 ${
          isLight ? 'border-[#e0d8cc] bg-white' : 'border-[#1c1c1c] bg-[#0a0a0a]'
        }`}>
          {/* Roadmap */}
          <div className="flex flex-col text-left">
            <span className={`text-[10px] uppercase tracking-widest font-medium ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>Roadmap</span>
            <div className={`text-sm font-semibold tracking-tight mt-0.5 ${isLight ? 'text-[#181614]' : 'text-white'}`}>
              <span className="[text-wrap:pretty]">{activeRoadmap?.title ? activeRoadmap.title.split(' ').slice(0, 3).join(' ') : 'None'}</span>
            </div>
            <span className={`text-[11px] mt-0.5 ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>
              {activeRoadmap ? `Stage ${currentStage} of ${totalStages}` : 'Choose path →'}
            </span>
          </div>

          <div className={`w-px h-10 ${isLight ? 'bg-[#e0d8cc]' : 'bg-[#1c1c1c]'}`} />

          {/* XP */}
          <div className="flex flex-col text-left">
            <span className={`text-[10px] uppercase tracking-widest font-medium ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>XP</span>
            <div className={`text-sm font-semibold tracking-tight mt-0.5 ${isLight ? 'text-[#181614]' : 'text-white'}`}>
              {xpPoints.toLocaleString()}
            </div>
            <span className={`text-[11px] mt-0.5 ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>{computedLevel}</span>
          </div>

          <div className={`w-px h-10 ${isLight ? 'bg-[#e0d8cc]' : 'bg-[#1c1c1c]'}`} />

          {/* Streak */}
          <div className="flex flex-col text-left">
            <span className={`text-[10px] uppercase tracking-widest font-medium ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>Streak</span>
            <div className="text-sm font-semibold text-[#f0875a] tracking-tight mt-0.5">
              {streakCount} days
            </div>
            <span className={`text-[11px] mt-0.5 ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>active</span>
          </div>
        </div>
      </div>

      {/* ──────────────── 2. TODAY'S MISSION HERO CARD ──────────────── */}
      <section aria-label="Today's Mission">
        {!activeRoadmap ? (
          <div className={`rounded-[28px] border p-8 sm:p-9 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 ${
            isLight
              ? 'border-[#e0d8cc] bg-white text-[#181614]'
              : 'border-[#1c1c1c] bg-[#0a0a0a] text-white'
          }`}>
            <div className="flex-1 max-w-2xl space-y-4">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#f0875a] font-semibold flex items-center gap-2">
                <Compass className="w-3.5 h-3.5" />
                GET STARTED
              </span>

              <h2 className={`text-2xl sm:text-3xl font-normal tracking-tight leading-snug [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                No active roadmap selected yet
              </h2>

              <p className={`text-sm font-normal leading-relaxed [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#888]'}`}>
                Choose a structured learning path from 330+ curated engineering roadmaps. Your active roadmap will become your single source of truth for daily missions, milestone projects, and AI mentoring.
              </p>

              <div className="flex items-center gap-5 pt-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('roadmaps')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#c25e2e] text-white font-medium px-6 py-2.5 text-sm hover:bg-[#d96a35] active:scale-[0.98] active:translate-y-[0.5px] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/60 focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <span>Explore Roadmaps</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-center md:pr-4">
              <div className={`w-[140px] h-[140px] rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-4 ${
                isLight ? 'border-[#d8ccb6] bg-[#f8f4ee]' : 'border-[#2a2a2a] bg-[#111]'
              }`}>
                <Compass className="w-8 h-8 text-[#c25e2e] stroke-[1.5] mb-2 animate-pulse" />
                <span className={`text-[11px] font-normal uppercase tracking-wider ${isLight ? 'text-[#786f66]' : 'text-[#555]'}`}>
                  Select Track
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`rounded-[28px] border p-8 sm:p-9 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 ${
            isLight
              ? 'border-[#e0d8cc] bg-white text-[#181614]'
              : 'border-[#1c1c1c] bg-[#0a0a0a] text-white'
          }`}>
            {/* Subtle glow in dark mode */}
            {!isLight && (
              <div className="absolute top-0 left-0 w-72 h-32 bg-[#c25e2e]/5 rounded-full blur-3xl pointer-events-none" />
            )}

            {/* Left Column: Mission Content */}
            <div className="flex-1 max-w-2xl space-y-4 relative">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#f0875a] font-semibold">
                TODAY&apos;S MISSION
              </span>

              <h2 className={`text-2xl sm:text-3xl font-normal tracking-tight leading-snug [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                {todayMission?.lesson_title || 'Introduction to Technea Learning Workspace'}
              </h2>

            {/* Milestone & Time Left Metadata */}
            <div className={`flex items-center gap-2 text-sm font-normal pt-1 ${isLight ? 'text-[#665e56]' : 'text-[#888]'}`}>
              <span>Milestone</span>
              <span className={`font-semibold [text-wrap:pretty] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                {todayMission?.milestone_title || activeRoadmap?.current_milestone?.title || activeRoadmap?.next_step_title || 'Core Foundations'}
              </span>
              <span className={isLight ? 'text-[#c8c0b4]' : 'text-[#333]'}>·</span>
              <span>Time left</span>
              <span className={`font-semibold ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                {todayMission?.estimated_time ? todayMission.estimated_time.replace(' remaining', '') : '25 min'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5 pt-3">
              <button
                type="button"
                onClick={() => handleContinue(todayMission)}
                className="rounded-full bg-[#c25e2e] text-white font-semibold px-6 py-2.5 text-sm hover:bg-[#d96a35] active:scale-[0.98] active:translate-y-[0.5px] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/60 focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-lg hover:shadow-xl cursor-pointer"
              >
                Resume learning →
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof onInspectRoadmap === 'function' && activeRoadmap) {
                    onInspectRoadmap(activeRoadmap)
                  } else {
                    onNavigateTab('roadmaps')
                  }
                }}
                className={`text-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none rounded-md px-1 py-0.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                  isLight ? 'text-[#665e56] hover:text-[#181614]' : 'text-[#555] hover:text-[#aaa]'
                }`}
              >
                View mission steps
              </button>
            </div>
          </div>

          {/* Right Column: Circular Progress Ring */}
          <div className="shrink-0 flex items-center justify-center md:pr-4">
            <div className="relative w-[140px] h-[140px] flex items-center justify-center">
              <svg width="140" height="140" className="transform -rotate-90">
                {/* Background Ring Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={isLight ? '#e8e0d4' : '#1a1a1a'}
                  strokeWidth="4"
                />
                {/* Foreground Active Progress Arc */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#c25e2e"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Progress Indicator Dot */}
              <div
                className="absolute w-3 h-3 rounded-full bg-[#f0875a] shadow-[0_0_10px_rgba(240,135,90,0.7)] pointer-events-none"
                style={{
                  left: `${dotX}px`,
                  top: `${dotY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              />

              {/* Inside Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="flex items-baseline">
                  <span className={`text-3xl font-light tracking-tight ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                    {displayProgress}
                  </span>
                  <span className={`text-base font-light ml-0.5 ${isLight ? 'text-[#181614]' : 'text-white'}`}>%</span>
                </div>
                <span className={`text-[11px] font-normal mt-0.5 ${isLight ? 'text-[#786f66]' : 'text-[#555]'}`}>
                  {completedSteps} of {totalSteps} steps
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

      {/* ──────────────── 3. CONTINUE LEARNING ──────────────── */}
      <section aria-label="Continue Learning" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-semibold uppercase tracking-widest [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-[#555]'}`}>Continue learning</h3>
          <button
            type="button"
            onClick={() => onNavigateTab('courses')}
            className={`text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none rounded-md px-1 py-0.5 ${
              isLight ? 'text-[#9a9189] hover:text-[#c25e2e]' : 'text-[#444] hover:text-[#f0875a]'
            }`}
          >
            All courses →
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b ${
          isLight ? 'border-[#e0d8cc]' : 'border-[#111]'
        }`}>
          {continueCourses.map((c) => (
            <div
              key={c.id}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleContinue(c)
                }
              }}
              onClick={() => handleContinue(c)}
              className={`space-y-2.5 cursor-pointer group p-4 rounded-2xl border transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                isLight
                  ? 'border-[#e0d8cc] hover:border-[#c25e2e]/30 hover:bg-[#faf8f4]'
                  : 'border-[#1a1a1a] hover:border-[#c25e2e]/30 hover:bg-[#0a0a0a]'
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium transition-colors duration-200 [text-wrap:pretty] ${
                  isLight ? 'text-[#181614] group-hover:text-[#c25e2e]' : 'text-[#e8e3db] group-hover:text-[#f0875a]'
                }`}>{c.title}</span>
                <span className="text-xs text-[#f0875a] font-bold shrink-0 ml-2">{c.progress}%</span>
              </div>
              <p className={`text-xs font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#555]'}`}>
                {c.subtitle}
              </p>
              {/* Progress bar */}
              <div className={`h-[3px] w-full rounded-full overflow-hidden ${isLight ? 'bg-[#e8e0d4]' : 'bg-[#1a1a1a]'}`}>
                <div
                  className="h-full bg-[#c25e2e] rounded-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── 4. BOTTOM 3 COLUMNS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
        {/* Column 1: Roadmap progress */}
        <section aria-label="Roadmap Progress" className="space-y-4">
          <div className={`flex items-center justify-between text-xs font-semibold uppercase tracking-widest ${
            isLight ? 'text-[#9a9189]' : 'text-[#444]'
          }`}>
            <span className="[text-wrap:balance]">Roadmap progress</span>
            <span className="text-[#f0875a]">
              {activeRoadmap?.progress_percent ?? summaryData?.overall_progress_percent ?? 0}%
            </span>
          </div>

          <div className="space-y-4">
            {roadmapStages.map((stage, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-normal [text-wrap:pretty] ${isLight ? 'text-[#181614]' : 'text-[#e8e3db]'}`}>{stage.label}</span>
                  <span className={`shrink-0 ml-2 ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>{stage.percent}%</span>
                </div>
                <div className={`h-[3px] w-full rounded-full overflow-hidden ${isLight ? 'bg-[#e8e0d4]' : 'bg-[#111]'}`}>
                  <div
                    className="h-full bg-[#c25e2e] rounded-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Column 2: Projects */}
        <section aria-label="Projects" className="space-y-4">
          <div className={`flex items-center justify-between text-xs font-semibold uppercase tracking-widest ${
            isLight ? 'text-[#9a9189]' : 'text-[#444]'
          }`}>
            <span className="[text-wrap:balance]">Projects</span>
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className={`normal-case tracking-normal font-normal transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none rounded-md px-1 py-0.5 ${
                isLight ? 'text-[#9a9189] hover:text-[#c25e2e]' : 'text-[#444] hover:text-[#f0875a]'
              }`}
            >
              All →
            </button>
          </div>

          <div className="space-y-4">
            {projectsList.map((p, idx) => (
              <div key={idx} className="space-y-2 group">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-normal [text-wrap:pretty] transition-colors duration-200 ${isLight ? 'text-[#181614]' : 'text-[#e8e3db]'}`}>{p.title}</span>
                  <span className={`shrink-0 ml-2 ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>{p.steps}</span>
                </div>
                <p className={`text-[11px] font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#555]'}`}>
                  {p.subtitle}
                </p>
                <div className={`h-[3px] w-full rounded-full overflow-hidden ${isLight ? 'bg-[#e8e0d4]' : 'bg-[#111]'}`}>
                  <div
                    className="h-full bg-[#c25e2e] rounded-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Column 3: Achievements */}
        <section aria-label="Achievements" className="space-y-4">
          <div className={`flex items-center justify-between text-xs font-semibold uppercase tracking-widest ${
            isLight ? 'text-[#9a9189]' : 'text-[#444]'
          }`}>
            <span className="[text-wrap:balance]">Achievements</span>
            <button
              type="button"
              onClick={() => onNavigateTab('portfolio')}
              className={`normal-case tracking-normal font-normal transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none rounded-md px-1 py-0.5 ${
                isLight ? 'text-[#9a9189] hover:text-[#c25e2e]' : 'text-[#444] hover:text-[#f0875a]'
              }`}
            >
              View all →
            </button>
          </div>

          <div className="space-y-4">
            {achievementsList.map((ach, idx) => (
              <div key={idx} className="flex items-center gap-3.5 group transition-transform duration-200 hover:translate-x-0.5">
                {/* Badge */}
                <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 text-[#f0875a] text-xs font-bold group-hover:scale-105 transition-all duration-200 ${
                  isLight
                    ? 'border-[#c25e2e]/30 bg-[#c25e2e]/8'
                    : 'border-[#c25e2e]/20 bg-[#1a0e08]'
                }`}>
                  {ach.type === 'number' && <span>{ach.badgeText}</span>}
                  {ach.type === 'check' && <Check className="h-4 w-4 stroke-[2.5]" />}
                  {ach.type === 'star' && <Star className="h-4 w-4 fill-current" />}
                </div>

                <div className="flex flex-col">
                  <span className={`text-xs font-medium [text-wrap:pretty] ${isLight ? 'text-[#181614]' : 'text-[#e8e3db]'}`}>{ach.title}</span>
                  <span className={`text-[11px] font-normal mt-0.5 [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#555]'}`}>
                    {ach.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default memo(DashboardReferenceOverview)
