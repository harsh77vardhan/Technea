import { memo, useMemo } from 'react'
import { Check, Star, Compass, ArrowRight } from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'

function DashboardReferenceOverview({
  onContinueLesson,
  onResumeMilestone,
  onExploreCatalog = () => {},
  onNavigateTab = () => {},
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
  const handleContinue = (item) => {
    const target = item || todayMission || continueLearningData
    if (typeof onContinueLesson === 'function') {
      onContinueLesson(target)
      return
    }
    if (typeof onResumeMilestone === 'function') {
      onResumeMilestone(target)
      return
    }
    const courseId = target?.course_id || continueLearningData?.course_id || 182
    const lessonId = target?.lesson_id || continueLearningData?.lesson_id || 241
    window.history.pushState({}, '', `/courses/${courseId}?lesson=${lessonId}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  // Dynamic time-aware greeting
  const currentHour = new Date().getHours()
  let greetingTime = 'evening'
  if (currentHour >= 5 && currentHour < 12) {
    greetingTime = 'morning'
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingTime = 'afternoon'
  }

  // Stats computation from real backend data (0 when fresh, never hardcoded dummy values)
  const xpPoints = summaryData?.xp_points ?? user?.total_xp ?? 0
  const computedLevel = summaryData?.developer_level || (xpPoints > 0 ? `Level ${Math.floor(xpPoints / 400) + 1}` : 'Code Initiate')
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

  // Continue learning courses derived from active roadmap curriculum / real courses
  const continueCourses = useMemo(() => {
    const list = []
    if (continueLearningData?.course_id) {
      list.push({
        id: continueLearningData.course_id,
        title: continueLearningData.course_title || 'Web Foundations',
        progress: continueLearningData.progress_percent || 0,
        subtitle: `${continueLearningData.milestone_title || 'Module 1'} · ${continueLearningData.duration || '25 min left'}`,
        course_id: continueLearningData.course_id,
        lesson_id: continueLearningData.lesson_id || 1,
      })
    }
    if (activeRoadmap?.milestones) {
      for (const ms of activeRoadmap.milestones) {
        if (ms.course_id && !list.some((item) => item.id === ms.course_id)) {
          list.push({
            id: ms.course_id,
            title: ms.title,
            progress: ms.completed ? 100 : (ms.current ? activeRoadmap.progress_percent || 0 : 0),
            subtitle: `${ms.estimated_time || '25 min left'} · Practical Lab`,
            course_id: ms.course_id,
            lesson_id: ms.lesson_id || 1,
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
    if (list.length === 0 && Array.isArray(summaryData?.enrolled_paths)) {
      summaryData.enrolled_paths.slice(0, 3).forEach((p) => {
        list.push({
          id: p.id,
          title: p.title,
          progress: p.progress_percent || 0,
          subtitle: `${p.category || 'Engineering'} · ${p.duration || 'Self-paced'}`,
          course_id: p.id,
          lesson_id: 1,
        })
      })
    }
    if (list.length === 0 && activeRoadmap) {
      list.push({
        id: activeRoadmap.id,
        title: activeRoadmap.title,
        progress: activeRoadmap.progress_percent || 0,
        subtitle: `${activeRoadmap.target_role || 'Core Track'} · In Progress`,
        course_id: 182,
        lesson_id: 241,
      })
    }
    return list
  }, [continueLearningData, activeRoadmap, summaryData])

  // Roadmap stages progress derived from active roadmap's real milestones/phases
  const roadmapStages = useMemo(() => {
    if (activeRoadmap?.milestones && activeRoadmap.milestones.length > 0) {
      return activeRoadmap.milestones.slice(0, 3).map((m) => ({
        label: m.completed ? m.title : m.current ? `${m.title} · current` : m.title,
        percent: m.completed ? 100 : m.current ? (activeRoadmap.progress_percent || 0) : 0,
      }))
    }
    if (activeRoadmap?.roadmap_data?.phases && activeRoadmap.roadmap_data.phases.length > 0) {
      return activeRoadmap.roadmap_data.phases.slice(0, 3).map((ph, idx) => {
        const isCurrent = idx === 0
        return {
          label: isCurrent
            ? `${ph.title.split(':')[1]?.trim() || ph.title} · current`
            : ph.title.split(':')[1]?.trim() || ph.title,
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
      <div className="space-y-8 animate-pulse text-[#faf6ee]">
        <div className="h-10 w-72 bg-[#1c1a18] rounded-xl" />
        <div className="h-64 w-full bg-[#1c1a18] rounded-3xl" />
        <div className="h-32 w-full bg-[#1c1a18] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className={`space-y-8 pb-8 select-none transition-colors duration-300 ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>
      {/* ──────────────── 1. HEADER ROW: GREETING & METRICS ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-1">
        {/* Left: Calm Typography Greeting in Warm Ivory / Soft Black */}
        <div>
          <h1 className={`text-3xl sm:text-4xl font-light tracking-tight ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>
            Good {greetingTime}, {firstName}
          </h1>
          <p className={`text-sm mt-1.5 font-normal ${isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'}`}>
            Continue building your future.
          </p>
        </div>

        {/* Right: Clean 3 Horizontal Metrics with Burnt Orange highlights */}
        <div className="flex items-center gap-8 sm:gap-12 shrink-0">
          {/* Roadmap */}
          <div className="flex flex-col text-left">
            <span className={`text-xs font-normal ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>Roadmap</span>
            <div className={`text-sm font-medium tracking-tight mt-0.5 flex items-center gap-1.5 ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>
              <span>{activeRoadmap?.title || 'None Selected'}</span>
              {activeRoadmap ? (
                <span className={`text-xs font-normal ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                  Stage {currentStage} of {totalStages}
                </span>
              ) : (
                <span className={`text-xs font-normal ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                  · Choose path
                </span>
              )}
            </div>
          </div>

          {/* XP */}
          <div className="flex flex-col text-left">
            <span className={`text-xs font-normal ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>XP</span>
            <div className={`text-sm font-medium tracking-tight mt-0.5 flex items-center gap-1.5 ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>
              <span>{xpPoints.toLocaleString()}</span>
              <span className={`text-xs font-normal ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                Level {computedLevel}
              </span>
            </div>
          </div>

          {/* Streak with Burnt Orange highlight */}
          <div className="flex flex-col text-left">
            <span className={`text-xs font-normal ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>Streak</span>
            <div className="text-sm font-medium text-[#e87a48] tracking-tight mt-0.5">
              <span>{streakCount} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── 2. TODAY'S LEARNING MISSION HERO CARD (WARM IVORY SURFACE) ──────────────── */}
      <section aria-label="Today's Mission">
        {!activeRoadmap ? (
          <div className="rounded-[28px] border border-[#e5decb] bg-[#faf6ee] p-8 sm:p-9 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 text-[#181614]">
            <div className="flex-1 max-w-2xl space-y-4">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#c25e2e] font-semibold flex items-center gap-2">
                <Compass className="w-3.5 h-3.5" />
                GET STARTED
              </span>

              <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#181614] leading-snug">
                No active roadmap selected yet
              </h2>

              <p className="text-sm text-[#665e56] font-normal leading-relaxed">
                Choose a structured learning path from 330+ curated engineering roadmaps. Your active roadmap will become your single source of truth for daily missions, milestone projects, and AI mentoring.
              </p>

              <div className="flex items-center gap-5 pt-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('roadmaps')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#c25e2e] text-[#faf6ee] font-medium px-6 py-2.5 text-sm hover:bg-[#ad4f22] transition-colors shadow-md cursor-pointer"
                >
                  Explore Roadmaps
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-center md:pr-4">
              <div className="w-[140px] h-[140px] rounded-full border border-dashed border-[#d5cbba] flex flex-col items-center justify-center text-center p-4 bg-[#f3ecdf]/50">
                <Compass className="w-8 h-8 text-[#c25e2e] stroke-[1.5] mb-2 animate-pulse" />
                <span className="text-[11px] text-[#786f66] font-normal uppercase tracking-wider">
                  Select Track
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#e5decb] bg-[#faf6ee] p-8 sm:p-9 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 text-[#181614]">
            {/* Left Column: Mission Content */}
            <div className="flex-1 max-w-2xl space-y-4">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#c25e2e] font-semibold">
                TODAY&apos;S MISSION
              </span>

              <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#181614] leading-snug">
                {todayMission?.lesson_title || 'Introduction to Technea Learning Workspace'}
              </h2>

            {/* Milestone & Time Left Metadata */}
            <div className="flex items-center gap-2 text-sm text-[#665e56] font-normal pt-1">
              <span>Milestone</span>
              <span className="text-[#181614] font-medium">
                {todayMission?.milestone_title || activeRoadmap?.current_milestone?.title || activeRoadmap?.next_step_title || 'Core Foundations'}
              </span>
              <span className="text-[#a8a199]">·</span>
              <span>Time left</span>
              <span className="text-[#181614] font-medium">
                {todayMission?.estimated_time ? todayMission.estimated_time.replace(' remaining', '') : '25 min'}
              </span>
            </div>

            {/* Actions: Burnt Orange Resume button & subtle link */}
            <div className="flex items-center gap-5 pt-3">
              <button
                type="button"
                onClick={() => handleContinue(todayMission)}
                className="rounded-full bg-[#c25e2e] text-[#faf6ee] font-medium px-6 py-2.5 text-sm hover:bg-[#ad4f22] transition-colors shadow-md cursor-pointer"
              >
                Resume learning →
              </button>

              <button
                type="button"
                onClick={onExploreCatalog}
                className="text-sm text-[#665e56] hover:text-[#181614] transition-colors cursor-pointer"
              >
                View mission steps
              </button>
            </div>
          </div>

          {/* Right Column: Burnt Orange SVG Circular Progress Ring */}
          <div className="shrink-0 flex items-center justify-center md:pr-4">
            <div className="relative w-[140px] h-[140px] flex items-center justify-center">
              <svg width="140" height="140" className="transform -rotate-90">
                {/* Background Ring Track in Warm Ivory Tone */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#e2d8c6"
                  strokeWidth="3"
                />
                {/* Foreground Active Progress Arc in Burnt Orange */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#c25e2e"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Progress Indicator Dot on Perimeter in Burnt Orange */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-[#c25e2e] shadow-[0_0_8px_rgba(194,94,46,0.6)] pointer-events-none"
                style={{
                  left: `${dotX}px`,
                  top: `${dotY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              />

              {/* Inside Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="flex items-baseline">
                  <span className="text-3xl font-light text-[#181614] tracking-tight">
                    {displayProgress}
                  </span>
                  <span className="text-base font-light text-[#181614] ml-0.5">%</span>
                </div>
                <span className="text-[11px] text-[#786f66] font-normal mt-0.5">
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
          <h3 className={`text-sm font-medium ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>Continue learning</h3>
          <button
            type="button"
            onClick={() => onNavigateTab('courses')}
            className={`text-xs transition-colors cursor-pointer ${
              isLight ? 'text-[#7a7268] hover:text-[#c25e2e]' : 'text-[#a8a199] hover:text-[#e87a48]'
            }`}
          >
            All courses
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b ${
          isLight ? 'border-[#ded4be]' : 'border-[#262320]'
        }`}>
          {continueCourses.map((c) => (
            <div
              key={c.id}
              onClick={() => handleContinue(c)}
              className="space-y-2.5 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-sm">
                <span className={`font-normal transition-colors ${
                  isLight ? 'text-[#181614] group-hover:text-[#c25e2e]' : 'text-[#faf6ee] group-hover:text-[#e87a48]'
                }`}>{c.title}</span>
                <span className="text-xs text-[#e87a48] font-medium">{c.progress}%</span>
              </div>
              <p className={`text-xs font-normal ${isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'}`}>
                {c.subtitle}
              </p>
              {/* Thin hairline progress bar in Burnt Orange */}
              <div className={`h-[2.5px] w-full rounded-full overflow-hidden ${isLight ? 'bg-[#ded4be]' : 'bg-[#262320]'}`}>
                <div
                  className="h-full bg-[#c25e2e] rounded-full transition-all duration-500"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── 4. BOTTOM 3 COLUMNS: ROADMAP, PROJECTS, ACHIEVEMENTS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
        {/* Column 1: Roadmap progress */}
        <section aria-label="Roadmap Progress" className="space-y-4">
          <div className={`flex items-center justify-between text-xs font-normal ${
            isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'
          }`}>
            <span>Roadmap progress</span>
            <span className="text-[#e87a48] font-medium">
              {activeRoadmap?.progress_percent ?? summaryData?.overall_progress_percent ?? 0}% overall
            </span>
          </div>

          <div className="space-y-4">
            {roadmapStages.map((stage, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-normal ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>{stage.label}</span>
                  <span className={isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}>{stage.percent}%</span>
                </div>
                <div className={`h-[2px] w-full rounded-full overflow-hidden ${isLight ? 'bg-[#ded4be]' : 'bg-[#262320]'}`}>
                  <div
                    className="h-full bg-[#c25e2e] rounded-full transition-all duration-500"
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Column 2: Projects */}
        <section aria-label="Projects" className="space-y-4">
          <div className={`flex items-center justify-between text-xs font-normal ${
            isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'
          }`}>
            <span>Projects</span>
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className={`transition-colors cursor-pointer ${
                isLight ? 'text-[#7a7268] hover:text-[#c25e2e]' : 'text-[#a8a199] hover:text-[#e87a48]'
              }`}
            >
              All projects
            </button>
          </div>

          <div className="space-y-4">
            {projectsList.map((p, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-normal ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>{p.title}</span>
                  <span className={isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}>{p.steps}</span>
                </div>
                <p className={`text-[11px] font-normal ${isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'}`}>
                  {p.subtitle}
                </p>
                <div className={`h-[2px] w-full rounded-full overflow-hidden ${isLight ? 'bg-[#ded4be]' : 'bg-[#262320]'}`}>
                  <div
                    className="h-full bg-[#c25e2e] rounded-full transition-all duration-500"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Column 3: Achievements */}
        <section aria-label="Achievements" className="space-y-4">
          <div className={`flex items-center justify-between text-xs font-normal ${
            isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'
          }`}>
            <span>Achievements</span>
            <button
              type="button"
              onClick={() => onNavigateTab('portfolio')}
              className={`transition-colors cursor-pointer ${
                isLight ? 'text-[#7a7268] hover:text-[#c25e2e]' : 'text-[#a8a199] hover:text-[#e87a48]'
              }`}
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            {achievementsList.map((ach, idx) => (
              <div key={idx} className="flex items-center gap-3.5">
                {/* Circular badge in Burnt Orange / Warm Ivory */}
                <div className="h-8 w-8 rounded-full border border-[#c25e2e]/40 bg-[#c25e2e]/10 flex items-center justify-center shrink-0 text-[#e87a48] text-xs font-normal">
                  {ach.type === 'number' && <span>{ach.badgeText}</span>}
                  {ach.type === 'check' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                  {ach.type === 'star' && <Star className="h-3.5 w-3.5 fill-current" />}
                </div>

                <div className="flex flex-col">
                  <span className={`text-xs font-normal ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>{ach.title}</span>
                  <span className={`text-[11px] font-normal mt-0.5 ${isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'}`}>
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
