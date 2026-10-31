import { memo, useMemo } from 'react'
import { Check, Star } from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'

function DashboardReferenceOverview({
  onContinueLesson = () => {},
  onExploreCatalog = () => {},
  onNavigateTab = () => {},
}) {
  const {
    user,
    activeRoadmap,
    todayMission,
    dailyActivity,
    achievements,
    myProjects,
    isLoading,
  } = useDashboard()

  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]

  // Dynamic time-aware greeting
  const currentHour = new Date().getHours()
  let greetingTime = 'evening'
  if (currentHour >= 5 && currentHour < 12) {
    greetingTime = 'morning'
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingTime = 'afternoon'
  }

  // Stats computation
  const xpPoints = user?.total_xp ?? 4820
  const computedLevel = Math.max(1, Math.floor(xpPoints / 400) + 1)
  const streakCount = dailyActivity?.streak_count ?? 12

  // Active roadmap progress and steps
  const totalStages = activeRoadmap?.milestones?.length || 6
  const completedStages =
    activeRoadmap?.milestones?.filter((m) => m.completed)?.length ||
    Math.round((activeRoadmap?.progress_percent || 68) * totalStages / 100) ||
    3
  const currentStage = Math.min(totalStages, Math.max(1, completedStages + 1))

  // Mission progress percent and steps for SVG ring
  const displayProgress = todayMission?.progress_percent ?? activeRoadmap?.progress_percent ?? 68
  const totalSteps = 6
  const completedSteps = Math.min(
    totalSteps,
    Math.max(1, Math.round((displayProgress / 100) * totalSteps) || 4)
  )

  // Circular SVG ring math
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, displayProgress)) / 100)

  // Indicator dot coordinate on circular perimeter
  const angleDeg = -90 + (Math.min(100, Math.max(0, displayProgress)) / 100) * 360
  const angleRad = (angleDeg * Math.PI) / 180
  const dotX = 70 + radius * Math.cos(angleRad)
  const dotY = 70 + radius * Math.sin(angleRad)

  // Continue learning courses matching source of truth reference
  const continueCourses = useMemo(() => [
    {
      id: 'course-node',
      title: 'Node.js & Express',
      progress: 64,
      subtitle: 'Middleware and routing · 35 min left',
    },
    {
      id: 'course-react',
      title: 'React Foundations',
      progress: 82,
      subtitle: 'State management · 20 min left',
    },
    {
      id: 'course-ml',
      title: 'Applied Machine Learning',
      progress: 31,
      subtitle: 'Linear regression · 1h 10m left',
    },
  ], [])

  // Roadmap stages progress matching source of truth reference
  const roadmapStages = useMemo(() => {
    if (activeRoadmap?.milestones && activeRoadmap.milestones.length >= 3) {
      return activeRoadmap.milestones.slice(0, 3).map((m, idx) => ({
        label: m.completed ? m.title : idx === 1 ? `${m.title} · current` : m.title,
        percent: m.completed ? 100 : idx === 1 ? (activeRoadmap.progress_percent || 58) : 12,
      }))
    }
    return [
      { label: 'Frontend', percent: 100 },
      { label: 'Backend · current', percent: 58 },
      { label: 'APIs & Auth', percent: 12 },
    ]
  }, [activeRoadmap])

  // Connected projects matching source of truth reference
  const projectsList = useMemo(() => {
    if (myProjects && myProjects.length >= 2) {
      return myProjects.slice(0, 2).map((p, idx) => ({
        title: p.title,
        steps: idx === 0 ? '3 of 5' : '2 of 6',
        subtitle: p.technologies?.join(' · ') || 'React · APIs',
        progress: idx === 0 ? 60 : 33,
      }))
    }
    return [
      {
        title: 'Task API',
        steps: '3 of 5',
        subtitle: 'Node.js · Express · PostgreSQL',
        progress: 60,
      },
      {
        title: 'Chat Client',
        steps: '2 of 6',
        subtitle: 'React · WebSockets · Paused',
        progress: 33,
      },
    ]
  }, [myProjects])

  // Platform achievements matching source of truth reference
  const achievementsList = useMemo(() => {
    if (achievements && achievements.length >= 3) {
      return [
        {
          type: 'number',
          badgeText: `${streakCount}`,
          title: `${streakCount}-day streak`,
          subtitle: 'Recent',
        },
        {
          type: 'check',
          title: achievements[0]?.title || 'First API shipped',
          subtitle: 'Milestone v1',
        },
        {
          type: 'star',
          title: achievements[1]?.title || 'Quiz score 90% +',
          subtitle: 'Foundations',
        },
      ]
    }
    return [
      {
        type: 'number',
        badgeText: '7',
        title: '7-day streak',
        subtitle: 'Oct 24',
      },
      {
        type: 'check',
        title: 'First API shipped',
        subtitle: 'Task API v1',
      },
      {
        type: 'star',
        title: 'Quiz score 90% +',
        subtitle: 'React Foundations',
      },
    ]
  }, [achievements, streakCount])

  if (isLoading && !activeRoadmap) {
    return (
      <div className="space-y-8 animate-pulse text-[#f8fafc]">
        <div className="h-10 w-72 bg-white/5 rounded-xl" />
        <div className="h-64 w-full bg-white/5 rounded-3xl" />
        <div className="h-32 w-full bg-white/5 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8 select-none text-[#f8fafc]">
      {/* ──────────────── 1. HEADER ROW: GREETING & METRICS ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-1">
        {/* Left: Calm Typography Greeting */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Good {greetingTime}, {firstName}
          </h1>
          <p className="text-sm text-neutral-400 mt-1.5 font-normal">
            Continue building your future.
          </p>
        </div>

        {/* Right: Clean 3 Horizontal Metrics matching reference */}
        <div className="flex items-center gap-8 sm:gap-12 shrink-0">
          {/* Roadmap */}
          <div className="flex flex-col text-left">
            <span className="text-xs text-neutral-400 font-normal">Roadmap</span>
            <div className="text-sm font-medium text-white tracking-tight mt-0.5 flex items-center gap-1.5">
              <span>{activeRoadmap?.title || 'Full-Stack AI Engineer'}</span>
              <span className="text-xs font-normal text-neutral-400">
                Stage {currentStage} of {totalStages}
              </span>
            </div>
          </div>

          {/* XP */}
          <div className="flex flex-col text-left">
            <span className="text-xs text-neutral-400 font-normal">XP</span>
            <div className="text-sm font-medium text-white tracking-tight mt-0.5 flex items-center gap-1.5">
              <span>{xpPoints.toLocaleString()}</span>
              <span className="text-xs font-normal text-neutral-400">
                Level {computedLevel}
              </span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex flex-col text-left">
            <span className="text-xs text-neutral-400 font-normal">Streak</span>
            <div className="text-sm font-medium text-white tracking-tight mt-0.5">
              <span>{streakCount} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── 2. TODAY'S LEARNING MISSION HERO CARD ──────────────── */}
      <section aria-label="Today's Mission">
        <div className="rounded-[28px] border border-white/[0.08] bg-[#0c0e14]/70 p-8 sm:p-9 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl">
          {/* Left Column: Mission Content */}
          <div className="flex-1 max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 font-medium">
              TODAY&apos;S MISSION
            </span>

            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white leading-snug">
              {todayMission?.lesson_title || 'Add secure authentication to your REST API'}
            </h2>

            {/* Milestone & Time Left Metadata */}
            <div className="flex items-center gap-2 text-sm text-neutral-400 font-normal pt-1">
              <span>Milestone</span>
              <span className="text-white font-medium">
                {activeRoadmap?.current_milestone?.title || 'Secure the Task API'}
              </span>
              <span className="text-neutral-500">·</span>
              <span>Time left</span>
              <span className="text-white font-medium">
                {todayMission?.estimated_time ? todayMission.estimated_time.replace(' remaining', '') : '45 min'}
              </span>
            </div>

            {/* Actions: Resume learning & View mission steps */}
            <div className="flex items-center gap-5 pt-3">
              <button
                type="button"
                onClick={() => onContinueLesson(todayMission)}
                className="rounded-full bg-white text-black font-medium px-6 py-2.5 text-sm hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
              >
                Resume learning →
              </button>

              <button
                type="button"
                onClick={onExploreCatalog}
                className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                View mission steps
              </button>
            </div>
          </div>

          {/* Right Column: SVG Circular Progress Ring */}
          <div className="shrink-0 flex items-center justify-center md:pr-4">
            <div className="relative w-[140px] h-[140px] flex items-center justify-center">
              <svg width="140" height="140" className="transform -rotate-90">
                {/* Background Ring Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3"
                />
                {/* Foreground Active Progress Arc */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Progress Indicator Dot on Perimeter */}
              <div
                className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] pointer-events-none"
                style={{
                  left: `${dotX}px`,
                  top: `${dotY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              />

              {/* Inside Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="flex items-baseline">
                  <span className="text-3xl font-light text-white tracking-tight">
                    {displayProgress}
                  </span>
                  <span className="text-base font-light text-white ml-0.5">%</span>
                </div>
                <span className="text-[11px] text-neutral-400 font-normal mt-0.5">
                  {completedSteps} of {totalSteps} steps
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 3. CONTINUE LEARNING ──────────────── */}
      <section aria-label="Continue Learning" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Continue learning</h3>
          <button
            type="button"
            onClick={() => onNavigateTab('courses')}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            All courses
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/[0.08]">
          {continueCourses.map((c) => (
            <div key={c.id} className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-normal text-white">{c.title}</span>
                <span className="text-xs text-neutral-400">{c.progress}%</span>
              </div>
              <p className="text-xs text-neutral-400 font-normal">
                {c.subtitle}
              </p>
              {/* Thin hairline progress bar */}
              <div className="h-[2.5px] w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
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
          <div className="flex items-center justify-between text-xs text-neutral-400 font-normal">
            <span>Roadmap progress</span>
            <span>47% overall</span>
          </div>

          <div className="space-y-4">
            {roadmapStages.map((stage, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-normal">{stage.label}</span>
                  <span className="text-neutral-400">{stage.percent}%</span>
                </div>
                <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Column 2: Projects */}
        <section aria-label="Projects" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-normal">
            <span>Projects</span>
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              All projects
            </button>
          </div>

          <div className="space-y-4">
            {projectsList.map((p, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-normal">{p.title}</span>
                  <span className="text-neutral-400">{p.steps}</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-normal">
                  {p.subtitle}
                </p>
                <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Column 3: Achievements */}
        <section aria-label="Achievements" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-normal">
            <span>Achievements</span>
            <button
              type="button"
              onClick={() => onNavigateTab('portfolio')}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            {achievementsList.map((ach, idx) => (
              <div key={idx} className="flex items-center gap-3.5">
                {/* Circular badge */}
                <div className="h-8 w-8 rounded-full border border-white/20 bg-white/[0.04] flex items-center justify-center shrink-0 text-white text-xs font-normal">
                  {ach.type === 'number' && <span>{ach.badgeText}</span>}
                  {ach.type === 'check' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                  {ach.type === 'star' && <Star className="h-3.5 w-3.5 fill-white" />}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-white font-normal">{ach.title}</span>
                  <span className="text-[11px] text-neutral-400 font-normal mt-0.5">
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
