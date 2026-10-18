import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  Compass,
  Award,
  LogOut,
  Sparkles,
  Bot,
  Flame,
  Check,
  Target,
  Layers,
  Send,
  Share2,
  Bookmark,
  Trophy,
  FolderGit2,
  Users,
  ExternalLink,
  Zap,
  Copy,
  CheckCheck,
  Edit3,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
  getDashboardSummaryApi,
  getMyRoadmapsApi,
  toggleDailyTaskApi,
  getProjectsApi,
  getRecommendedProjectsApi,
  getMyProjectsApi,
  updateProjectStatusApi,
  getCommunityRoomsApi,
  toggleRoomJoinApi,
  sendAiMentorChatApi,
  getUserProfileApi,
  getAvatarUrl,
} from '../../services/api'
import SpaceGardenAtmosphere from './SpaceGardenAtmosphere'

let messageCounter = 1000
function getNextMentorMsgId() {
  messageCounter += 1
  return `msg-${messageCounter}`
}

function getMentorTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function GithubIcon({ className = 'h-3 w-3' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}


/* ─────────────────────────────────────────
   Animated counter component
───────────────────────────────────────── */
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const from = 0

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}

function AnimatedStat({ value, suffix = '' }) {
  const animated = useAnimatedNumber(value)
  return <span>{animated}{suffix}</span>
}

/* ─────────────────────────────────────────
   Minimal Progress Bar
───────────────────────────────────────── */
function MinimalProgressBar({ percent = 0, delay = 0, height = 4 }) {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100)
  return (
    <div
      className="w-full overflow-hidden"
      style={{ height, background: '#1A1A1A', borderRadius: height / 2 }}
    >
      <motion.div
        style={{ height: '100%', background: '#EDEDED', borderRadius: height / 2 }}
        initial={{ width: 0 }}
        animate={{ width: `${safePercent}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────
   Weekly Activity 7-Day Component (Clean & Minimal)
───────────────────────────────────────── */
function WeeklyActivityStrip({ weeklyHistory = [], streakCount = 1 }) {
  const defaultDays = [
    { day_name: 'Mon', is_active: true, completed_tasks_count: 2 },
    { day_name: 'Tue', is_active: true, completed_tasks_count: 3 },
    { day_name: 'Wed', is_active: true, completed_tasks_count: 1 },
    { day_name: 'Thu', is_active: true, completed_tasks_count: 2 },
    { day_name: 'Fri', is_active: true, completed_tasks_count: 3 },
    { day_name: 'Sat', is_active: true, completed_tasks_count: 2 },
    { day_name: 'Sun', is_active: false, completed_tasks_count: 0 },
  ]
  const days = weeklyHistory.length === 7 ? weeklyHistory : defaultDays

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
        <span>Weekly Progress</span>
        <span className="text-[#EDEDED] font-medium">{streakCount} Days Active</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          const isToday = idx === days.length - 1
          return (
            <div
              key={day.date || idx}
              className={`rounded-[7px] border p-2.5 text-center flex flex-col items-center justify-between gap-2 transition-colors ${
                isToday
                  ? 'border-white/20 bg-[#161822]'
                  : 'border-white/[0.06] bg-[#0E1015]'
              }`}
            >
              <span className="text-[10px] font-mono text-[#8A8F98] uppercase">
                {day.day_name?.slice(0, 3)}
              </span>
              <div
                className={`h-7 w-full rounded-[3px] transition-colors ${
                  day.is_active
                    ? 'bg-[#EDEDED]'
                    : 'bg-[#181A22]'
                }`}
                title={day.is_active ? `${day.completed_tasks_count || 1} tasks completed` : 'Inactive'}
              />
              <span className="text-[9px] font-mono text-[#6B7280]">
                {day.completed_tasks_count > 0 ? `${day.completed_tasks_count}` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main Dashboard Modal Component
───────────────────────────────────────── */
export default function LearningDashboardModal({
  isOpen,
  onClose,
  onSelectPath = () => {},
  onOpenExplorer = () => {},
}) {
  const { user, logout, openRoadmapBuilder } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'projects' | 'mentor' | 'community' | 'roadmaps' | 'profile'
  const [toastMessage, setToastMessage] = useState(null)
  const [headerAvatarError, setHeaderAvatarError] = useState(false)
  const [profileAvatarError, setProfileAvatarError] = useState(false)
  const [shareAvatarError, setShareAvatarError] = useState(false)
  const [prevDashboardAvatar, setPrevDashboardAvatar] = useState(user?.avatar_url)
  const toastTimeoutRef = useRef(null)

  if (user?.avatar_url !== prevDashboardAvatar) {
    setPrevDashboardAvatar(user?.avatar_url)
    setHeaderAvatarError(false)
    setProfileAvatarError(false)
    setShareAvatarError(false)
  }

  // Projects State (Phase 1)
  const [projectsList, setProjectsList] = useState([])
  const [recommendedProjects, setRecommendedProjects] = useState([])
  const [userProjectsMap, setUserProjectsMap] = useState({})
  const [projectFilter, setProjectFilter] = useState('all') // 'all' | 'recommended' | 'Beginner' | 'Intermediate' | 'Advanced'
  const [editingGithubProject, setEditingGithubProject] = useState(null)
  const [githubUrlInput, setGithubUrlInput] = useState('')

  // AI Mentor Chat State
  const [mentorMessages, setMentorMessages] = useState(() => [
    {
      id: 1,
      sender: 'mentor',
      text: `Hello ${user?.full_name ? user.full_name.split(' ')[0] : 'Harsh'}, how can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [mentorInput, setMentorInput] = useState('')
  const [isMentorTyping, setIsMentorTyping] = useState(false)
  const chatBottomRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'mentor') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeTab, mentorMessages, isMentorTyping])

  // Community Rooms State (Phase 4)
  const [communityRooms, setCommunityRooms] = useState([])
  const [joinedRoomIds, setJoinedRoomIds] = useState(new Set())
  const [roomFilter, setRoomFilter] = useState('all') // 'all' | 'joined'

  // User Profile & Portfolio Details (Phase 5 & 6)
  const [profileData, setProfileData] = useState(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Interactive Checklist State
  const [tasks, setTasks] = useState([
    { id: 'lesson', text: 'Complete one lesson', done: true },
    { id: 'milestone', text: 'Finish one milestone', done: false },
    { id: 'build', text: 'Build something', done: false },
  ])


  const showToast = (msg) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Toggle Daily Goal Task
  const toggleTask = async (id) => {
    const targetTask = tasks.find((t) => t.id === id)
    if (!targetTask) return
    const nextDone = !targetTask.done

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t))
    )

    try {
      const updated = await toggleDailyTaskApi({
        task_id: String(id),
        is_completed: nextDone,
      })
      if (updated?.today_checklist) {
        setTasks(
          updated.today_checklist.map((item) => ({
            id: item.id,
            text: item.label,
            done: item.completed,
          }))
        )
      }
    } catch (e) {
      console.warn('Failed to sync daily task toggle:', e)
    }
  }

  // Project Actions (Phase 1)
  const handleStartProject = async (projectId) => {
    setUserProjectsMap((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), status: 'in_progress' },
    }))
    showToast('Project initialized! Track your progress and push code.')
    try {
      await updateProjectStatusApi(projectId, { status: 'in_progress' })
    } catch (e) {
      console.warn('Failed to start project:', e)
    }
  }

  const handleCompleteProject = async (projectId) => {
    setUserProjectsMap((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), status: 'completed' },
    }))
    showToast('Project marked as completed! +150 XP awarded to your developer profile.')
    try {
      await updateProjectStatusApi(projectId, { status: 'completed' })
    } catch (e) {
      console.warn('Failed to complete project:', e)
    }
  }

  const handleSaveGithubUrl = async (projectId, url) => {
    const currentStatus = userProjectsMap[projectId]?.status || 'in_progress'
    setUserProjectsMap((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), github_url: url, status: currentStatus },
    }))
    setEditingGithubProject(null)
    setGithubUrlInput('')
    showToast('GitHub repository URL saved to your portfolio!')
    try {
      await updateProjectStatusApi(projectId, { status: currentStatus, github_url: url })
    } catch (e) {
      console.warn('Failed to update github url:', e)
    }
  }

  // AI Mentor Chat Action (Phase 3)
  const handleSendMentorMessage = async (msgText) => {
    const textToSend = (msgText || mentorInput || '').trim()
    if (!textToSend || isMentorTyping) return

    const userMsg = {
      id: getNextMentorMsgId(),
      sender: 'user',
      text: textToSend,
      timestamp: getMentorTimeString(),
    }

    setMentorMessages((prev) => [...prev, userMsg])
    setMentorInput('')
    setIsMentorTyping(true)

    try {
      const response = await sendAiMentorChatApi({
        message: textToSend,
        context_skill: dashboardData?.current_path?.category || null,
        context_milestone: dashboardData?.current_path?.next_step_title || null,
      })

      const mentorMsg = {
        id: getNextMentorMsgId(),
        sender: 'mentor',
        text: response.reply,
        warning: response.prerequisite_warning,
        action_items: response.action_items,
        quick_prompts: response.quick_prompts,
        recommended_project: response.recommended_project,
        suggested_next_step: response.suggested_next_step,
        timestamp: getMentorTimeString(),
      }

      setMentorMessages((prev) => [...prev, mentorMsg])
    } catch (err) {
      console.error('Failed to get AI mentor response:', err)
      const errorMsg = {
        id: getNextMentorMsgId(),
        sender: 'mentor',
        text: 'I encountered an issue connecting to the technical mentorship database. Please try again.',
        warning: null,
        action_items: [],
        quick_prompts: ['Am I ready for advanced full-stack projects?'],
        timestamp: getMentorTimeString(),
      }
      setMentorMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsMentorTyping(false)
    }
  }

  // Community Room Action (Phase 4)
  const handleToggleRoom = async (roomId) => {
    const isCurrentlyJoined = joinedRoomIds.has(roomId)
    const nextSet = new Set(joinedRoomIds)
    if (isCurrentlyJoined) {
      nextSet.delete(roomId)
    } else {
      nextSet.add(roomId)
    }
    setJoinedRoomIds(nextSet)

    setCommunityRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            is_joined: !isCurrentlyJoined,
            active_learners_count: r.active_learners_count + (!isCurrentlyJoined ? 1 : -1),
          }
        }
        return r
      })
    )

    try {
      const res = await toggleRoomJoinApi(roomId)
      showToast(res.message || (!isCurrentlyJoined ? 'Joined learning room!' : 'Left room.'))
    } catch (e) {
      console.warn('Failed to toggle room join:', e)
    }
  }

  // Fetch Dashboard & Ecosystem data
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    const fetchAllData = async () => {
      if (isMounted) {
        setLoading(true)
        setError(null)
      }
      try {
        const [
          dashData,
          roadmapsData,
          projsData,
          recProjsData,
          myProjsData,
          roomsData,
          profileRes,
        ] = await Promise.allSettled([
          getDashboardSummaryApi(),
          getMyRoadmapsApi(),
          getProjectsApi(),
          getRecommendedProjectsApi(),
          getMyProjectsApi(),
          getCommunityRoomsApi(),
          getUserProfileApi(),
        ])

        if (isMounted) {
          if (dashData.status === 'fulfilled') {
            setDashboardData(dashData.value)
            if (dashData.value.daily_activity?.today_checklist?.length > 0) {
              setTasks(
                dashData.value.daily_activity.today_checklist.map((item) => ({
                  id: item.id,
                  text: item.label,
                  done: item.completed,
                }))
              )
            }
          }
          if (roadmapsData.status === 'fulfilled' && Array.isArray(roadmapsData.value)) {
            setSavedRoadmaps(roadmapsData.value)
          } else {
            try {
              const localGuest = JSON.parse(
                localStorage.getItem('technea_guest_saved_roadmaps') || '[]'
              )
              setSavedRoadmaps(localGuest)
            } catch {
              setSavedRoadmaps([])
            }
          }
          if (projsData.status === 'fulfilled' && Array.isArray(projsData.value)) {
            setProjectsList(projsData.value)
          }
          if (recProjsData.status === 'fulfilled' && Array.isArray(recProjsData.value)) {
            setRecommendedProjects(recProjsData.value)
          }
          if (myProjsData.status === 'fulfilled' && Array.isArray(myProjsData.value)) {
            const map = {}
            myProjsData.value.forEach((p) => {
              map[p.project_id] = { status: p.status, github_url: p.github_url }
            })
            setUserProjectsMap(map)
          }
          if (roomsData.status === 'fulfilled' && Array.isArray(roomsData.value)) {
            setCommunityRooms(roomsData.value)
            setJoinedRoomIds(new Set(roomsData.value.filter((r) => r.is_joined).map((r) => r.id)))
          }
          if (profileRes.status === 'fulfilled') {
            setProfileData(profileRes.value)
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load dashboard ecosystem:', err)
          setError(err.message || 'Unable to load dashboard details.')
          setLoading(false)
        }
      }
    }

    fetchAllData()

    return () => {
      isMounted = false
    }
  }, [isOpen])


  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // User details
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]
  const initials = fullName.slice(0, 2).toUpperCase()
  const userEmail = user?.email || 'harshvsvardhan22@gmail.com'

  const currentPath = dashboardData?.current_path || null
  const enrolledPaths = dashboardData?.enrolled_paths || []
  const skillsOverview = dashboardData?.skills_overview || []
  const dailyActivity = dashboardData?.daily_activity || null

  // Core metrics & Gamification Progression
  const overallPercent = dashboardData?.overall_progress_percent || 0
  const completedMilestones = dashboardData?.total_completed_milestones || 0
  const completedLessons = dashboardData?.total_completed_lessons || 0
  const activePathsCount = dashboardData?.total_active_paths || (currentPath ? 1 : 0)
  const streakCount = dailyActivity?.streak_count || dashboardData?.streak_count || 1
  const developerLevel = dashboardData?.developer_level || profileData?.developer_level || 'Code Initiate'
  const xpPoints = dashboardData?.xp_points ?? profileData?.xp_points ?? 50
  const nextLevelXp = dashboardData?.next_level_xp ?? profileData?.next_level_xp ?? 250
  const levelProgressPercent = dashboardData?.level_progress_percent ?? profileData?.level_progress_percent ?? 20
  const completedProjectsCount = dashboardData?.completed_projects_count ?? 0
  const activeProjectsCount = dashboardData?.active_projects_count ?? 0
  const joinedRoomsCount = dashboardData?.joined_rooms_count ?? joinedRoomIds.size ?? 0



  const handleCopyProfileLink = () => {
    if (navigator.clipboard) {
      const url = `https://technea.dev/@${firstName.toLowerCase()}`
      navigator.clipboard.writeText(url)
      showToast('Public profile link copied to clipboard!')
    }
  }

  const completedTasksCount = tasks.filter((t) => t.done).length

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Personal AI Engineering Workspace"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      >
        {/* Deep Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Shell — Deep Black #050505 canvas with #1F1F1F subtle borders */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col w-full max-w-6xl h-[92vh] max-h-[940px] rounded-[10px] border border-[#1F1F1F] bg-[#050505] shadow-[0_30px_100px_rgba(0,0,0,0.98)] overflow-hidden"
        >
          {/* Futuristic Space-Garden Atmospheric Background */}
          <SpaceGardenAtmosphere />

          {/* ──────────────── Top Header Bar ──────────────── */}
          <header className="relative z-20 flex items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-5 py-3 shrink-0">
            {/* Left: Premium Profile Section */}
            <div className="flex items-center gap-3">
              {user?.avatar_url && !headerAvatarError ? (
                <img
                  src={getAvatarUrl(user.avatar_url)}
                  alt={fullName}
                  onError={() => setHeaderAvatarError(true)}
                  className="h-8 w-8 rounded-[7px] object-cover border border-[#242424] shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#242424] bg-[#141414] text-xs font-bold text-[#EDEDED] font-mono shadow-sm shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#EDEDED] tracking-tight">
                    {fullName}
                  </span>
                  <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-1.5 py-0.5 text-[9px] font-mono font-medium text-amber-400 uppercase tracking-wider">
                    {developerLevel}
                  </span>
                </div>
                <p className="text-[10px] text-[#666666] font-mono truncate hidden sm:block">
                  {userEmail} • {xpPoints} XP
                </p>
              </div>
            </div>

            {/* Middle: 6-Tab Switcher (Overview • Projects • AI Mentor • Community • Roadmaps • Portfolio) */}
            <nav className="flex items-center rounded-[6px] border border-[#1F1F1F] bg-[#0D0D0D] p-0.5 text-xs font-mono overflow-x-auto max-w-[50vw]">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-[#1C1C1C] text-[#EDEDED] font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                Overview
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'projects'
                    ? 'bg-[#1C1C1C] text-[#EDEDED] font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                <span>Projects</span>
                {recommendedProjects.length > 0 && (
                  <span className="rounded-full bg-amber-500/20 text-amber-400 px-1 text-[9px]">
                    {recommendedProjects.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mentor')}
                className={`rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'mentor'
                    ? 'bg-[#1C1C1C] text-[#EDEDED] font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                <Bot className="h-3 w-3 text-[#A1A1A1]" />
                <span>AI Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('community')}
                className={`rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'community'
                    ? 'bg-[#1C1C1C] text-emerald-300 font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                <Users className="h-3 w-3 text-emerald-400" />
                <span>Community</span>
                {joinedRoomIds.size > 0 && (
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-1 text-[9px]">
                    {joinedRoomIds.size}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('roadmaps')}
                className={`rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'roadmaps'
                    ? 'bg-[#1C1C1C] text-[#EDEDED] font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                <span>Roadmaps</span>
                {savedRoadmaps.length > 0 && (
                  <span className="rounded-full bg-[#262626] px-1 text-[9px] text-[#A1A1A1]">
                    {savedRoadmaps.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-[#1C1C1C] text-[#EDEDED] font-semibold shadow-xs'
                    : 'text-[#737373] hover:text-[#EDEDED]'
                }`}
              >
                Portfolio
              </button>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 rounded-[6px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-xs font-mono text-[#D4D4D4]">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>{xpPoints} XP</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 rounded-[6px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-xs font-mono text-[#D4D4D4]">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>{streakCount}d</span>
              </div>


              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-[6px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-xs font-medium text-[#737373] hover:text-[#EDEDED] hover:bg-[#171717] hover:border-[#333333] transition-colors cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#222222] bg-[#111111] text-[#737373] hover:text-[#EDEDED] hover:bg-[#171717] hover:border-[#333333] transition-colors cursor-pointer"
                aria-label="Close dashboard"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* Toast Banner */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 rounded-[6px] border border-[#2E2E2E] bg-[#141414] px-3.5 py-1.5 text-xs font-mono text-[#EDEDED] shadow-xl"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────── Scrollable Dashboard Canvas (#050505 Canvas with Atmosphere) ──────────────── */}
          <div className="relative z-10 flex-1 overflow-y-auto bg-transparent p-5 sm:p-8 space-y-7">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#222222] border-t-[#EDEDED]" />
                <p className="text-xs text-[#737373] font-mono">
                  Loading your engineering workspace…
                </p>
              </div>
            ) : error ? (
              <div className="rounded-[8px] border border-red-900/40 bg-[#0E0E0E] p-6 text-center text-xs text-red-400">
                <p>{error}</p>
              </div>
            ) : (
              <>
                {/* ══════════════ TAB 1: OVERVIEW (AI ENGINEERING COMMAND CENTER) ══════════════ */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* ── SECTION 1: Premium Welcome Header ── */}
                    <div className="rounded-[14px] border border-white/[0.08] bg-[#0E1016]/92 backdrop-blur-xl p-6 sm:p-7 shadow-[0_10px_32px_rgba(0,0,0,0.55)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-semibold">
                            Engineering Workspace
                          </span>
                          <span className="text-[#3A3D48]">•</span>
                          <span className="text-[10px] font-mono text-[#8A8F98]">{developerLevel}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDEDED]">
                          Welcome back, {firstName}
                        </h1>
                        <p className="text-xs sm:text-sm font-mono text-[#8A8F98]">
                          Current Focus:{' '}
                          <span className="text-[#EDEDED] font-medium">
                            {currentPath?.title || 'Python Developer Roadmap'}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            openRoadmapBuilder()
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-[7px] border border-white/[0.12] bg-[#14161E] px-4 py-2.5 text-xs font-semibold text-[#D4D4D8] hover:bg-[#1C1F2B] hover:text-white transition-all cursor-pointer shadow-xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          <span>Build My Roadmap</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onOpenExplorer()
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-[7px] border border-white/[0.12] bg-[#14161E] px-4 py-2.5 text-xs font-semibold text-[#D4D4D4] hover:bg-[#1C1F2B] hover:text-white transition-all cursor-pointer shadow-xs"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>Browse Catalog</span>
                        </button>
                      </div>
                    </div>

                    {/* ── SECTION 2: Learning Overview ── */}
                    <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1117]/92 backdrop-blur-xl p-7 sm:p-8 space-y-6 shadow-[0_14px_40px_rgba(0,0,0,0.65)]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-[#EDEDED] tracking-tight">
                            Learning Overview
                          </h2>
                          <p className="text-xs text-[#8A8F98] mt-0.5">
                            Key progression metrics and validated milestones across your curriculum.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('roadmaps')}
                          className="self-start sm:self-auto text-xs font-mono text-[#8A8F98] hover:text-[#EDEDED] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Track roadmaps</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-[10px] border border-white/[0.06] bg-[#0A0C11]/85 p-5 hover:border-white/[0.12] transition-colors">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#8A8F98] block mb-2">
                            Learning Progress
                          </span>
                          <div className="text-2xl sm:text-3xl font-black font-mono text-[#F4F4F5] tracking-tight">
                            <AnimatedStat value={overallPercent} suffix="%" />
                          </div>
                          <span className="text-[11px] font-mono text-[#6B7280] mt-1.5 block">
                            Overall mastery
                          </span>
                        </div>

                        <div className="rounded-[10px] border border-white/[0.06] bg-[#0A0C11]/85 p-5 hover:border-white/[0.12] transition-colors">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#8A8F98] block mb-2">
                            Completed Milestones
                          </span>
                          <div className="text-2xl sm:text-3xl font-black font-mono text-[#F4F4F5] tracking-tight">
                            <AnimatedStat value={completedMilestones} />
                          </div>
                          <span className="text-[11px] font-mono text-[#6B7280] mt-1.5 block">
                            Verified competencies
                          </span>
                        </div>

                        <div className="rounded-[10px] border border-white/[0.06] bg-[#0A0C11]/85 p-5 hover:border-white/[0.12] transition-colors">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#8A8F98] block mb-2">
                            Lessons Completed
                          </span>
                          <div className="text-2xl sm:text-3xl font-black font-mono text-[#F4F4F5] tracking-tight">
                            <AnimatedStat value={completedLessons} />
                          </div>
                          <span className="text-[11px] font-mono text-[#6B7280] mt-1.5 block">
                            Knowledge modules
                          </span>
                        </div>

                        <div className="rounded-[10px] border border-white/[0.06] bg-[#0A0C11]/85 p-5 hover:border-white/[0.12] transition-colors">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#8A8F98] block mb-2">
                            Projects Built
                          </span>
                          <div className="text-2xl sm:text-3xl font-black font-mono text-[#F4F4F5] tracking-tight">
                            <AnimatedStat value={completedProjectsCount || (completedProjectsCount + activeProjectsCount)} />
                          </div>
                          <span className="text-[11px] font-mono text-[#6B7280] mt-1.5 block">
                            Production builds
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── SECTION 3: Continue Learning (Hero Focus Card - Main Focus) ── */}
                    <div className="rounded-[14px] border border-white/[0.1] bg-[#10131A]/95 backdrop-blur-xl p-7 sm:p-9 space-y-6 shadow-[0_18px_50px_rgba(0,0,0,0.72)] relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-5">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-semibold block mb-1">
                            Active Learning Focus
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold text-[#EDEDED] tracking-tight">
                            Continue {currentPath?.title || 'Python Fundamentals'}
                          </h2>
                          <p className="text-xs text-[#8A8F98] mt-0.5">
                            Resume your active milestone and hands-on coding curriculum.
                          </p>
                        </div>
                        {currentPath?.category && (
                          <span className="self-start sm:self-auto rounded-[5px] border border-white/[0.1] bg-[#14161F] px-3 py-1 text-[10px] font-mono text-[#D4D4D8]">
                            {currentPath.category}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-8 space-y-3.5">
                          <div className="rounded-[10px] border border-white/[0.06] bg-[#0A0C11]/85 p-5 space-y-3">
                            <div>
                              <span className="text-xs font-mono text-[#8A8F98] block mb-1">
                                Current milestone:
                              </span>
                              <h3 className="text-base sm:text-lg font-semibold text-[#EDEDED]">
                                {currentPath?.next_step_title || 'Object Oriented Programming'}
                              </h3>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between text-xs font-mono text-[#8A8F98]">
                                <span>Progress</span>
                                <span className="text-[#EDEDED] font-medium">
                                  {currentPath?.progress_percent ?? 80}%
                                </span>
                              </div>
                              <MinimalProgressBar
                                percent={currentPath?.progress_percent ?? 80}
                                height={6}
                                delay={0.1}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-4 flex md:justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onClose()
                              if (currentPath) {
                                onSelectPath(currentPath)
                              } else {
                                openRoadmapBuilder()
                              }
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[7px] bg-[#EDEDED] px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#050505] hover:bg-white transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,255,255,0.08)]"
                          >
                            <span>Continue Learning</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── SECTION 4: AI Mentor (Minimal Query Bar) ── */}
                    <div className="rounded-[14px] border border-white/[0.08] bg-[#0E1016]/92 backdrop-blur-xl p-6 sm:p-7 shadow-[0_14px_40px_rgba(0,0,0,0.65)] space-y-3.5">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
                          Ask Technea AI anything...
                        </h3>
                        <p className="text-xs text-[#8A8F98]">
                          Your AI learning companion • Ask about roadmaps, skills, projects, or doubts
                        </p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const q = mentorInput.trim()
                          if (!q || isMentorTyping) return
                          handleSendMentorMessage(q)
                          setActiveTab('mentor')
                        }}
                        className="flex flex-col sm:flex-row items-center gap-2.5 pt-0.5"
                      >
                        <div className="relative flex-1 w-full">
                          <input
                            type="text"
                            value={mentorInput}
                            onChange={(e) => setMentorInput(e.target.value)}
                            placeholder="Ask Technea AI anything..."
                            className="w-full rounded-[8px] border border-white/[0.08] bg-[#07080B] px-4 py-3.5 text-xs sm:text-sm text-[#EDEDED] placeholder-[#555555] focus:border-white/20 focus:outline-none font-mono transition-colors"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!mentorInput.trim() || isMentorTyping}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[8px] px-6 py-3.5 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                            mentorInput.trim() && !isMentorTyping
                              ? 'bg-[#EDEDED] text-[#050505] hover:bg-white shadow-[0_2px_12px_rgba(255,255,255,0.08)]'
                              : 'bg-[#14151B] text-[#555555] border border-white/[0.05] cursor-not-allowed'
                          }`}
                        >
                          <span>Send</span>
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>


                    {/* ── SECTION 5: Daily Learning Tracker ── */}
                    <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1117]/92 backdrop-blur-xl p-7 sm:p-8 space-y-6 shadow-[0_14px_40px_rgba(0,0,0,0.65)]">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
                            Daily Learning Tracker
                          </h3>
                          <p className="text-xs text-[#8A8F98]">
                            Build daily engineering consistency and track task velocity.
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8F98] block">
                            Learning Streak
                          </span>
                          <span className="text-base sm:text-lg font-bold font-mono text-[#EDEDED]">
                            {streakCount} Days
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left: Today's Goals (7 cols) */}
                        <div className="lg:col-span-7 space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8A8F98] mb-1">
                            <span>Today&apos;s Goals</span>
                            <span>
                              {completedTasksCount} / {tasks.length} Completed
                            </span>
                          </div>

                          <div className="space-y-2">
                            {tasks.map((task) => (
                              <button
                                key={task.id}
                                type="button"
                                onClick={() => toggleTask(task.id)}
                                className={`w-full flex items-center gap-3 rounded-[8px] border px-4 py-3 text-left text-xs transition-colors cursor-pointer ${
                                  task.done
                                    ? 'border-white/[0.04] bg-[#090A0E]/60 text-[#6B7280]'
                                    : 'border-white/[0.07] bg-[#0A0C11]/85 text-[#EDEDED] hover:border-white/[0.14]'
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                                    task.done
                                      ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400'
                                      : 'border-[#333333] bg-[#141414]'
                                  }`}
                                >
                                  {task.done && <Check className="h-2.5 w-2.5 stroke-[2.5]" />}
                                </span>
                                <span className={`truncate ${task.done ? 'line-through text-[#6B7280]' : ''}`}>
                                  {task.text}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Right: Weekly Progress Visualization (5 cols) */}
                        <div className="lg:col-span-5 rounded-[10px] border border-white/[0.06] bg-[#0A0C11]/85 p-5">
                          <WeeklyActivityStrip
                            weeklyHistory={dailyActivity?.weekly_history || []}
                            streakCount={streakCount}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* ══════════════ TAB: PROJECTS (PHASE 1) ══════════════ */}
                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    {/* Projects Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-[#EDEDED]">
                            Engineering Project Catalog
                          </h2>
                          <span className="rounded-[4px] border border-[#262626] bg-[#141414] px-2 py-0.5 text-[10px] font-mono text-amber-400">
                            {projectsList.length} Real-World Builds
                          </span>
                        </div>
                        <p className="text-xs text-[#737373] mt-0.5">
                          Bridge theory into production deliverables. Connect code repositories to your developer portfolio.
                        </p>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { id: 'all', label: 'All Projects' },
                          { id: 'recommended', label: `Recommended (${recommendedProjects.length})` },
                          { id: 'Beginner', label: 'Beginner' },
                          { id: 'Intermediate', label: 'Intermediate' },
                          { id: 'Advanced', label: 'Advanced' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setProjectFilter(f.id)}
                            className={`rounded-[6px] border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                              projectFilter === f.id
                                ? 'border-[#EDEDED] bg-[#171717] text-[#EDEDED] font-semibold'
                                : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#737373] hover:text-[#D4D4D4]'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(projectFilter === 'all'
                        ? projectsList
                        : projectFilter === 'recommended'
                        ? recommendedProjects
                        : projectsList.filter((p) => p.difficulty === projectFilter)
                      ).map((proj) => {
                        const userStatus = userProjectsMap[proj.id]?.status || 'not_started'
                        const githubUrl = userProjectsMap[proj.id]?.github_url
                        const isRec = recommendedProjects.some((r) => r.id === proj.id)

                        return (
                          <div
                            key={proj.id}
                            className={`rounded-[10px] border p-5 flex flex-col justify-between gap-4 transition-all ${
                              userStatus === 'completed'
                                ? 'border-emerald-500/30 bg-[#070D09]'
                                : userStatus === 'in_progress'
                                ? 'border-amber-500/30 bg-[#0E0C09]'
                                : 'border-[#1F1F1F] bg-[#0D0D0D] hover:border-[#2E2E2E]'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-[4px] border px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${
                                      proj.difficulty === 'Beginner'
                                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                                        : proj.difficulty === 'Intermediate'
                                        ? 'border-blue-500/30 bg-blue-950/20 text-blue-400'
                                        : 'border-purple-500/30 bg-purple-950/20 text-purple-400'
                                    }`}
                                  >
                                    {proj.difficulty}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#666666]">
                                    {proj.duration_weeks || '2 Weeks'}
                                  </span>
                                  {isRec && (
                                    <span className="rounded-[4px] border border-amber-500/30 bg-amber-950/20 px-1.5 py-0.5 text-[9px] font-mono text-amber-300">
                                      ★ Recommended
                                    </span>
                                  )}
                                </div>

                                {/* Status Badge */}
                                <span
                                  className={`text-[10px] font-mono font-semibold ${
                                    userStatus === 'completed'
                                      ? 'text-emerald-400 flex items-center gap-1'
                                      : userStatus === 'in_progress'
                                      ? 'text-amber-400'
                                      : 'text-[#666666]'
                                  }`}
                                >
                                  {userStatus === 'completed' && <Check className="h-3 w-3" />}
                                  {userStatus === 'completed'
                                    ? 'Completed'
                                    : userStatus === 'in_progress'
                                    ? 'In Progress'
                                    : 'Not Started'}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-[#EDEDED]">{proj.title}</h3>
                                <p className="text-xs text-[#888888] leading-relaxed mt-1">
                                  {proj.description}
                                </p>
                              </div>

                              {/* Tech stack */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {(proj.tech_stack || []).map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded-[4px] border border-[#222222] bg-[#121212] px-2 py-0.5 text-[10px] font-mono text-[#A1A1A1]"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>

                              {/* Architectural requirements */}
                              {proj.architecture_spec?.length > 0 && (
                                <div className="rounded-[6px] border border-[#1C1C1C] bg-[#080808] p-2.5 text-[11px] font-mono text-[#777777] space-y-1">
                                  <span className="text-[9px] uppercase tracking-wider text-[#555555] block font-bold">
                                    Key Architectural Specifications:
                                  </span>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {proj.architecture_spec.slice(0, 2).map((spec, sIdx) => (
                                      <li key={sIdx} className="truncate">{spec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Bottom Actions */}
                            <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {githubUrl ? (
                                  <a
                                    href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 hover:underline truncate"
                                  >
                                    <GithubIcon className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingGithubProject(proj)
                                      setGithubUrlInput('')
                                    }}
                                    className="text-[11px] font-mono text-[#666666] hover:text-[#EDEDED] flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <GithubIcon className="h-3 w-3" />
                                    <span>Link GitHub Repo</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {userStatus === 'not_started' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartProject(proj.id)}
                                    className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#EDEDED] px-3.5 py-1.5 text-xs font-bold text-[#050505] hover:bg-white transition-colors cursor-pointer"
                                  >
                                    <span>Start Project</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                                {userStatus === 'in_progress' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingGithubProject(proj)
                                        setGithubUrlInput(githubUrl || '')
                                      }}
                                      className="rounded-[6px] border border-[#2A2A2A] bg-[#141414] px-2.5 py-1.5 text-xs font-mono text-[#D4D4D4] hover:text-white transition-colors cursor-pointer"
                                      title="Update repo URL"
                                    >
                                      <GithubIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCompleteProject(proj.id)}
                                      className="inline-flex items-center gap-1 rounded-[6px] border border-emerald-500/40 bg-emerald-950/20 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-900/30 transition-colors cursor-pointer"
                                    >
                                      <Check className="h-3 w-3" />
                                      <span>Complete (+150 XP)</span>
                                    </button>
                                  </>
                                )}
                                {userStatus === 'completed' && (
                                  <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                                    ✓ Verified (+150 XP)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ══════════════ TAB: AI MENTOR (MINIMAL CHAT INTERFACE) ══════════════ */}
                {activeTab === 'mentor' && (
                  <div className="max-w-3xl mx-auto w-full flex flex-col min-h-[580px] sm:min-h-[640px]">
                    {/* Top: Simple Heading & Subtitle */}
                    <div className="border-b border-white/[0.08] pb-4 mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-[#EDEDED] tracking-tight">
                        Technea AI Mentor
                      </h2>
                      <p className="text-xs sm:text-sm text-[#8A8F98] mt-1">
                        Your personal engineering companion
                      </p>
                    </div>

                    {/* Middle: Only the Conversation Area */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-6 max-h-[480px] min-h-[360px]">
                      {mentorMessages.map((msg) =>
                        msg.sender === 'user' ? (
                          <div key={msg.id} className="flex justify-end ml-auto">
                            <div className="max-w-xl rounded-[12px] bg-[#161822] border border-white/[0.08] px-4 py-3 text-xs sm:text-sm text-[#EDEDED] leading-relaxed whitespace-pre-wrap break-words">
                              {msg.text}
                            </div>
                          </div>
                        ) : (
                          <div key={msg.id} className="flex items-start gap-3.5 max-w-2xl mr-auto">
                            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/[0.08] bg-[#12131A] text-[#EDEDED] shrink-0 mt-0.5">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <span className="text-[11px] font-semibold text-[#8A8F98] block">
                                AI Mentor
                              </span>
                              <div className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed whitespace-pre-wrap break-words">
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        )
                      )}

                      {isMentorTyping && (
                        <div className="flex items-start gap-3.5 max-w-2xl mr-auto">
                          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/[0.08] bg-[#12131A] text-[#EDEDED] shrink-0 mt-0.5">
                            <Bot className="h-4 w-4 animate-pulse" />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#8A8F98] pt-1.5 font-mono">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8A8F98] animate-bounce" />
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8A8F98] animate-bounce [animation-delay:0.2s]" />
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8A8F98] animate-bounce [animation-delay:0.4s]" />
                            <span className="ml-1 text-[11px] text-[#8A8F98]">Thinking…</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Bottom: Only One Input Bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMentorMessage()
                      }}
                      className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center gap-2.5 mt-6"
                    >
                      <div className="relative flex-1 w-full">
                        <input
                          type="text"
                          value={mentorInput}
                          onChange={(e) => setMentorInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMentorMessage()
                            }
                          }}
                          placeholder="Ask Technea AI anything..."
                          className="w-full rounded-[8px] border border-white/[0.08] bg-[#07080B] px-4 py-3.5 text-xs sm:text-sm text-[#EDEDED] placeholder-[#555555] focus:border-white/20 focus:outline-none transition-colors"
                          disabled={isMentorTyping}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!mentorInput.trim() || isMentorTyping}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[8px] px-6 py-3.5 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                          mentorInput.trim() && !isMentorTyping
                            ? 'bg-[#EDEDED] text-[#050505] hover:bg-white shadow-[0_2px_12px_rgba(255,255,255,0.08)]'
                            : 'bg-[#14151B] text-[#555555] border border-white/[0.05] cursor-not-allowed'
                        }`}
                      >
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                )}

                {/* ══════════════ TAB: COMMUNITY (PHASE 4) ══════════════ */}
                {activeTab === 'community' && (
                  <div className="space-y-6">
                    {/* Community Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-[#EDEDED]">
                            Peer Learning Rooms
                          </h2>
                          <span className="rounded-[4px] border border-emerald-500/30 bg-emerald-950/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                            {communityRooms.length} Active Guilds
                          </span>
                        </div>
                        <p className="text-xs text-[#737373] mt-0.5">
                          Join focused engineering circles. Ask questions, compare code implementations, and stay accountable with peers.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRoomFilter('all')}
                          className={`rounded-[6px] border px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                            roomFilter === 'all'
                              ? 'border-[#EDEDED] bg-[#171717] text-[#EDEDED] font-semibold'
                              : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#737373]'
                          }`}
                        >
                          All Rooms ({communityRooms.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoomFilter('joined')}
                          className={`rounded-[6px] border px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                            roomFilter === 'joined'
                              ? 'border-[#EDEDED] bg-[#171717] text-[#EDEDED] font-semibold'
                              : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#737373]'
                          }`}
                        >
                          My Joined ({joinedRoomIds.size})
                        </button>
                      </div>
                    </div>

                    {/* Rooms Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {communityRooms
                        .filter((r) => (roomFilter === 'joined' ? joinedRoomIds.has(r.id) : true))
                        .map((room) => {
                          const isJoined = joinedRoomIds.has(room.id)
                          return (
                            <div
                              key={room.id}
                              className={`rounded-[10px] border p-5 flex flex-col justify-between gap-4 transition-all ${
                                isJoined
                                  ? 'border-emerald-500/30 bg-[#070D09]'
                                  : 'border-[#1F1F1F] bg-[#0D0D0D] hover:border-[#2E2E2E]'
                              }`}
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="rounded-[4px] border border-[#262626] bg-[#121212] px-2 py-0.5 text-[9px] font-mono text-[#A1A1A1] uppercase">
                                    {room.category}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    {room.active_learners_count} peers
                                  </span>
                                </div>

                                <div>
                                  <h3 className="text-sm font-bold text-[#EDEDED]">{room.title}</h3>
                                  <p className="text-xs text-[#888888] leading-relaxed mt-1">
                                    {room.description}
                                  </p>
                                </div>

                                {/* Weekly Topics */}
                                {room.topics_covered?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {room.topics_covered.map((t, idx) => (
                                      <span
                                        key={idx}
                                        className="rounded-[3px] border border-[#222222] bg-[#111111] px-1.5 py-0.5 text-[10px] font-mono text-[#888888]"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                                <span className="text-[10px] font-mono text-[#666666]">
                                  {isJoined ? 'Connected Room' : 'Public Room'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRoom(room.id)}
                                  className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                    isJoined
                                      ? 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
                                      : 'bg-[#EDEDED] text-[#050505] hover:bg-white'
                                  }`}
                                >
                                  {isJoined ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span>Joined Room</span>
                                    </>
                                  ) : (
                                    <>
                                      <Users className="h-3 w-3" />
                                      <span>Join Room</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* ══════════════ TAB: AI ROADMAPS ══════════════ */}
                {activeTab === 'roadmaps' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#EDEDED]">
                          Your Career Roadmaps
                        </h2>
                        <p className="text-xs text-[#737373]">
                          AI-generated blueprints and enrolled catalog journeys.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          openRoadmapBuilder()
                        }}
                        className="inline-flex items-center gap-2 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer shadow-sm"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>Build New Roadmap</span>
                      </button>
                    </div>

                    {/* Saved AI Roadmaps List */}
                    {savedRoadmaps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedRoadmaps.map((roadmap) => {
                          const progress = roadmap.progress_percent || 0
                          const completedCount =
                            roadmap.completed_milestone_ids?.length || 0

                          return (
                            <div
                              key={roadmap.id}
                              className="rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 flex flex-col justify-between hover:border-[#2D2D2D] transition-colors"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="rounded-[4px] border border-[#242424] bg-[#121212] px-2 py-0.5 text-[9px] font-mono text-amber-400 uppercase">
                                    {roadmap.target_role || 'Career Blueprint'}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#737373]">
                                    {roadmap.estimated_duration || '18 Weeks'}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-[#EDEDED]">
                                  {roadmap.title}
                                </h4>
                                <p className="text-xs text-[#737373] line-clamp-2">
                                  Goal: &quot;{roadmap.goal}&quot;
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-[#1C1C1C] space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
                                  <span>{completedCount} milestones completed</span>
                                  <span className="text-[#EDEDED] font-bold">
                                    {progress}%
                                  </span>
                                </div>
                                <MinimalProgressBar percent={progress} height={4} />

                                <div className="pt-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose()
                                      openRoadmapBuilder(roadmap.goal)
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#2B2B2B] bg-[#141414] px-3 py-1.5 text-xs font-mono text-[#EDEDED] hover:bg-white hover:text-black transition-colors cursor-pointer"
                                  >
                                    <span>Open Roadmap</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0A0A0A] p-8 text-center space-y-3">
                        <Bookmark className="h-8 w-8 text-[#555555] mx-auto" />
                        <h4 className="text-sm font-bold text-[#EDEDED]">
                          No AI Career Roadmaps Generated Yet
                        </h4>
                        <p className="text-xs text-[#737373] max-w-sm mx-auto">
                          Tell Technea what you want to become (e.g. Full Stack Developer, DevOps Engineer) and synthesize your personalized curriculum.
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose()
                              openRoadmapBuilder()
                            }}
                            className="inline-flex items-center gap-2 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-semibold text-[#050505] hover:bg-white transition-colors cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>Launch Roadmap Builder</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Catalog Enrolled Journeys */}
                    {enrolledPaths.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-[#1C1C1C]">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#737373] flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" />
                          <span>Catalog Enrolled Journeys ({enrolledPaths.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {enrolledPaths.map((path) => (
                            <div
                              key={path.id}
                              className="flex items-center justify-between rounded-[8px] border border-[#1F1F1F] bg-[#0D0D0D] p-3.5 hover:border-[#2D2D2D] transition-colors cursor-pointer"
                              onClick={() => {
                                onClose()
                                onSelectPath(path)
                              }}
                            >
                              <div className="min-w-0 pr-3">
                                <span className="text-[10px] font-mono text-[#737373] block">
                                  {path.category}
                                </span>
                                <h5 className="text-xs font-bold text-[#EDEDED] truncate">
                                  {path.title}
                                </h5>
                                <span className="text-[10px] text-[#555555] font-mono">
                                  {path.completed_steps_count} / {path.total_steps_count} milestones
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-mono font-bold text-[#EDEDED]">
                                  {path.progress_percent}%
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-[#555555]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════ TAB 6: DEVELOPER PORTFOLIO & MASTERY ══════════════ */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Profile Header Identity Card with Level & XP Meter */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {user?.avatar_url && !profileAvatarError ? (
                            <img
                              src={getAvatarUrl(user.avatar_url)}
                              alt={fullName}
                              onError={() => setProfileAvatarError(true)}
                              className="h-14 w-14 rounded-[10px] object-cover border border-[#262626] shadow-inner shrink-0"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-[10px] border border-[#262626] bg-[#141414] text-xl font-bold text-[#EDEDED] font-mono shadow-inner shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-[#EDEDED]">{fullName}</h3>
                              <span className="rounded-[4px] border border-amber-500/30 bg-amber-950/20 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                                {developerLevel}
                              </span>
                              <span className="rounded-[4px] border border-emerald-500/30 bg-emerald-950/20 px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                                Verified Developer
                              </span>
                            </div>
                            <p className="text-xs text-[#737373] font-mono mt-0.5">
                              {userEmail} • Technea Developer ID: #{user?.id ? String(user.id).slice(0, 8) : 'eng-core'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsShareModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#2B2B2B] bg-[#141414] px-3.5 py-2 text-xs font-mono text-[#EDEDED] hover:bg-white hover:text-black transition-colors cursor-pointer shadow-xs"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share Portfolio</span>
                          </button>
                        </div>
                      </div>

                      {/* Developer XP & Tier Progression Bar */}
                      <div className="pt-4 border-t border-[#1A1A1A] space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#888888] flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            <span>Developer Level Progress</span>
                          </span>
                          <span className="text-[#EDEDED] font-bold">
                            {xpPoints} / {nextLevelXp} XP ({Math.max(0, nextLevelXp - xpPoints)} XP to next tier)
                          </span>
                        </div>
                        <MinimalProgressBar percent={levelProgressPercent} height={4} />
                      </div>
                    </div>

                    {/* Developer Metrics Quick Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="rounded-[8px] border border-[#1A1A1A] bg-[#0A0A0A] p-3 space-y-1">
                        <span className="text-[10px] font-mono text-[#666666] uppercase block">Milestones</span>
                        <div className="text-base font-bold text-[#EDEDED] font-mono">{completedMilestones}</div>
                        <span className="text-[9px] font-mono text-emerald-500/80 block">Verified mastery</span>
                      </div>
                      <div className="rounded-[8px] border border-[#1A1A1A] bg-[#0A0A0A] p-3 space-y-1">
                        <span className="text-[10px] font-mono text-[#666666] uppercase block">Lessons</span>
                        <div className="text-base font-bold text-[#EDEDED] font-mono">{completedLessons}</div>
                        <span className="text-[9px] font-mono text-[#737373] block">Completed units</span>
                      </div>
                      <div className="rounded-[8px] border border-[#1A1A1A] bg-[#0A0A0A] p-3 space-y-1">
                        <span className="text-[10px] font-mono text-[#666666] uppercase block">Projects</span>
                        <div className="text-base font-bold text-amber-400 font-mono">{completedProjectsCount}</div>
                        <span className="text-[9px] font-mono text-[#737373] block">{activeProjectsCount} in progress</span>
                      </div>
                      <div className="rounded-[8px] border border-[#1A1A1A] bg-[#0A0A0A] p-3 space-y-1">
                        <span className="text-[10px] font-mono text-[#666666] uppercase block">Coding Streak</span>
                        <div className="text-base font-bold text-[#EDEDED] font-mono">{streakCount}d</div>
                        <span className="text-[9px] font-mono text-amber-500/80 block">Active velocity</span>
                      </div>
                      <div className="rounded-[8px] border border-[#1A1A1A] bg-[#0A0A0A] p-3 space-y-1">
                        <span className="text-[10px] font-mono text-[#666666] uppercase block">Active Paths</span>
                        <div className="text-base font-bold text-[#EDEDED] font-mono">{activePathsCount}</div>
                        <span className="text-[9px] font-mono text-[#737373] block">Enrolled curricula</span>
                      </div>
                      <div className="rounded-[8px] border border-[#1A1A1A] bg-[#0A0A0A] p-3 space-y-1">
                        <span className="text-[10px] font-mono text-[#666666] uppercase block">Guilds Joined</span>
                        <div className="text-base font-bold text-emerald-400 font-mono">{joinedRoomsCount}</div>
                        <span className="text-[9px] font-mono text-[#737373] block">Peer study rooms</span>
                      </div>
                    </div>

                    {/* Verified Hands-on Engineering Projects Portfolio */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                        <div className="flex items-center gap-2">
                          <FolderGit2 className="h-4 w-4 text-[#EDEDED]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#EDEDED] font-mono">
                            Hands-On Engineering Projects & Deliverables
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('projects')}
                          className="text-xs font-mono text-[#737373] hover:text-[#EDEDED] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Explore project catalog</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      {(() => {
                        const activeOrCompletedProjects = projectsList.filter(
                          (p) =>
                            userProjectsMap[p.id]?.status === 'completed' ||
                            userProjectsMap[p.id]?.status === 'in_progress'
                        )

                        if (activeOrCompletedProjects.length === 0) {
                          const topProj = recommendedProjects[0] || projectsList[0]
                          return (
                            <div className="rounded-[8px] border border-[#1C1C1C] bg-[#090909] p-5 space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-[#EDEDED]">
                                  No hands-on projects linked to your portfolio yet
                                </h5>
                                <p className="text-[11px] text-[#737373] max-w-md">
                                  Engineering recruiters evaluate production artifacts. Start building hands-on projects to showcase live code and linked GitHub repos.
                                </p>
                              </div>
                              {topProj && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleStartProject(topProj.id)
                                    setActiveTab('projects')
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#EDEDED] px-3.5 py-1.5 text-xs font-bold text-[#050505] hover:bg-white transition-colors cursor-pointer shrink-0 mt-3 sm:mt-0"
                                >
                                  <span>Start {topProj.title}</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeOrCompletedProjects.map((proj) => {
                              const uData = userProjectsMap[proj.id] || {}
                              const isComplete = uData.status === 'completed'
                              const repoUrl = uData.github_url

                              return (
                                <div
                                  key={proj.id}
                                  className="rounded-[8px] border border-[#1C1C1C] bg-[#090909] p-4 flex flex-col justify-between space-y-3"
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <h5 className="text-xs font-bold text-[#EDEDED] truncate">
                                        {proj.title}
                                      </h5>
                                      <span
                                        className={`rounded-[3px] px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase shrink-0 ${
                                          isComplete
                                            ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-400'
                                            : 'bg-amber-950/30 border border-amber-500/40 text-amber-400'
                                        }`}
                                      >
                                        {isComplete ? '✓ Completed' : 'In Progress'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[#737373] line-clamp-2">
                                      {proj.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {(proj.tech_stack || []).map((tech) => (
                                        <span
                                          key={tech}
                                          className="rounded-[3px] border border-[#222222] bg-[#121212] px-1.5 py-0.2 text-[9px] font-mono text-[#A1A1A1]"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-[#171717] flex items-center justify-between text-xs font-mono">
                                    <span className="text-[10px] text-[#555555]">
                                      {proj.difficulty} • +150 XP
                                    </span>

                                    {repoUrl ? (
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={repoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                          <GithubIcon className="h-3 w-3" />
                                          <span className="truncate max-w-[140px]">
                                            {repoUrl.replace('https://github.com/', '')}
                                          </span>
                                          <ExternalLink className="h-2.5 w-2.5" />
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingGithubProject(proj)
                                            setGithubUrlInput(repoUrl)
                                          }}
                                          title="Update repository URL"
                                          className="text-[#666666] hover:text-[#EDEDED] transition-colors cursor-pointer"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingGithubProject(proj)
                                          setGithubUrlInput('')
                                        }}
                                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#737373] hover:text-[#EDEDED] transition-colors cursor-pointer"
                                      >
                                        <GithubIcon className="h-3 w-3" />
                                        <span>Link GitHub Repo</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>

                    {/* Skill Mastery Breakdown */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#EDEDED] font-mono flex items-center gap-2">
                          <Award className="h-4 w-4 text-[#A1A1A1]" />
                          Engineering Skill Mastery Breakdown
                        </span>
                        <span className="text-[10px] font-mono text-[#666666]">
                          Continuous Evaluation
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {skillsOverview.map((skill, i) => (
                          <div
                            key={i}
                            className="rounded-[6px] border border-[#1C1C1C] bg-[#090909] p-3 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-[#EDEDED] font-bold">
                                {skill.skill_name}
                              </span>
                              <span className="text-emerald-400 font-bold">
                                {skill.mastery_percent}%
                              </span>
                            </div>
                            <MinimalProgressBar
                              percent={skill.mastery_percent}
                              height={3}
                              delay={0.05 * i}
                            />
                            <span className="text-[9px] font-mono text-[#555555] block">
                              {skill.completed_milestones} milestones validated
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Achievements & Badges Earned */}
                    <div className="rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#EDEDED] font-mono flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-400" />
                          Earned Developer Achievements
                        </span>
                        <span className="text-[10px] font-mono text-[#666666]">
                          6 Badges Available
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="rounded-[8px] border border-emerald-900/30 bg-[#0A100C] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">
                              Early Adopter
                            </span>
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Joined Technea during autonomous developer release.
                          </p>
                          <span className="text-[9px] font-mono text-emerald-500/80 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-[8px] border border-amber-900/30 bg-[#120D08] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400">
                              Consistent Coder
                            </span>
                            <Flame className="h-3.5 w-3.5 text-amber-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Maintained active study streak for consecutive days.
                          </p>
                          <span className="text-[9px] font-mono text-amber-500/80 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-[8px] border border-purple-900/30 bg-[#0F0B14] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-400">
                              Milestone Conqueror
                            </span>
                            <Target className="h-3.5 w-3.5 text-purple-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Completed verified hands-on engineering milestones.
                          </p>
                          <span className="text-[9px] font-mono text-purple-500/80 block pt-1">
                            ✓ Unlocked
                          </span>
                        </div>

                        <div className="rounded-[8px] border border-blue-900/30 bg-[#090D14] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-400">
                              Roadmap Architect
                            </span>
                            <Layers className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Synthesized personalized career roadmap with AI.
                          </p>
                          <span className="text-[9px] font-mono text-blue-500/80 block pt-1">
                            {savedRoadmaps.length > 0 ? '✓ Unlocked' : 'In Progress'}
                          </span>
                        </div>

                        <div className="rounded-[8px] border border-cyan-900/30 bg-[#081114] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-400">
                              Project Deliverable
                            </span>
                            <FolderGit2 className="h-3.5 w-3.5 text-cyan-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Started and shipped hands-on technical projects.
                          </p>
                          <span className="text-[9px] font-mono text-cyan-500/80 block pt-1">
                            {completedProjectsCount > 0 || activeProjectsCount > 0
                              ? '✓ Unlocked'
                              : 'Locked (Start a project)'}
                          </span>
                        </div>

                        <div className="rounded-[8px] border border-emerald-900/30 bg-[#09140E] p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">
                              Guild Contributor
                            </span>
                            <Users className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <p className="text-[10px] text-[#A1A1A1]">
                            Joined peer learning community rooms on Technea.
                          </p>
                          <span className="text-[9px] font-mono text-emerald-500/80 block pt-1">
                            {joinedRoomsCount > 0 ? '✓ Unlocked' : 'Locked (Join a room)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ══════════════ MODAL: LINK GITHUB REPOSITORY ══════════════ */}
          {editingGithubProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-[10px] border border-[#2B2B2B] bg-[#0E0E0E] p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                  <div className="flex items-center gap-2">
                    <GithubIcon className="h-4 w-4 text-[#EDEDED]" />
                    <h4 className="text-sm font-bold text-[#EDEDED]">Link GitHub Repository</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingGithubProject(null)}
                    className="text-[#666666] hover:text-[#EDEDED] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#888888]">
                    Project:{' '}
                    <span className="text-[#EDEDED] font-semibold">
                      {editingGithubProject.title}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#666666]">
                    Connect your repository to showcase your code deliverables on your developer portfolio.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-[#888888] block">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={githubUrlInput}
                    onChange={(e) => setGithubUrlInput(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full rounded-[6px] border border-[#2B2B2B] bg-[#080808] px-3 py-2 text-xs text-[#EDEDED] placeholder-[#444444] focus:border-[#555555] focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1C1C1C]">
                  <button
                    type="button"
                    onClick={() => setEditingGithubProject(null)}
                    className="rounded-[6px] border border-[#262626] bg-[#141414] px-3 py-1.5 text-xs font-mono text-[#888888] hover:text-[#EDEDED] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveGithubUrl(editingGithubProject.id, githubUrlInput)
                    }
                    className="rounded-[6px] bg-[#EDEDED] px-4 py-1.5 text-xs font-bold text-[#050505] hover:bg-white transition-colors cursor-pointer"
                  >
                    Save to Portfolio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ MODAL: SHARE DEVELOPER PORTFOLIO ══════════════ */}
          {isShareModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-[10px] border border-[#2B2B2B] bg-[#0E0E0E] p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-[#EDEDED]" />
                    <h4 className="text-sm font-bold text-[#EDEDED]">Share Developer Portfolio</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="text-[#666666] hover:text-[#EDEDED] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-[#888888] leading-relaxed">
                  Your verified engineering portfolio showcases your developer tier, completed milestones, and hands-on GitHub projects to engineering teams and recruiters.
                </p>

                {/* Live Portfolio Card Preview */}
                <div className="rounded-[8px] border border-[#222222] bg-[#080808] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user?.avatar_url && !shareAvatarError ? (
                        <img
                          src={getAvatarUrl(user.avatar_url)}
                          alt={fullName}
                          onError={() => setShareAvatarError(true)}
                          className="h-10 w-10 rounded-[8px] object-cover border border-[#282828] shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#282828] bg-[#141414] text-sm font-bold text-[#EDEDED] font-mono shrink-0">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#EDEDED]">{fullName}</span>
                          <span className="rounded-[3px] border border-amber-500/30 bg-amber-950/20 px-1.5 py-0.5 text-[9px] font-mono text-amber-400">
                            {developerLevel}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#666666]">
                          {xpPoints} XP • Verified Learner
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 border border-emerald-900/40 bg-emerald-950/20 px-2 py-0.5 rounded-[4px]">
                      Public Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1C1C1C] text-center">
                    <div className="p-1.5 rounded-[4px] bg-[#111111]">
                      <span className="text-xs font-bold text-[#EDEDED] font-mono block">
                        {completedMilestones}
                      </span>
                      <span className="text-[9px] font-mono text-[#666666]">Milestones</span>
                    </div>
                    <div className="p-1.5 rounded-[4px] bg-[#111111]">
                      <span className="text-xs font-bold text-[#EDEDED] font-mono block">
                        {completedProjectsCount}
                      </span>
                      <span className="text-[9px] font-mono text-[#666666]">Projects</span>
                    </div>
                    <div className="p-1.5 rounded-[4px] bg-[#111111]">
                      <span className="text-xs font-bold text-[#EDEDED] font-mono block">
                        {streakCount}d
                      </span>
                      <span className="text-[9px] font-mono text-[#666666]">Streak</span>
                    </div>
                  </div>
                </div>

                {/* Share Link Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-[#737373] block">
                    Public Portfolio URL
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-[6px] border border-[#262626] bg-[#060606] px-3 py-2 text-xs font-mono text-[#A1A1A1] truncate">
                      https://technea.dev/@{(firstName || 'developer').toLowerCase()}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleCopyProfileLink()
                        setCopiedLink(true)
                        setTimeout(() => setCopiedLink(false), 2000)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#EDEDED] px-3.5 py-2 text-xs font-bold text-[#050505] hover:bg-white transition-colors cursor-pointer shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[#1C1C1C]">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="rounded-[6px] border border-[#262626] bg-[#141414] px-4 py-1.5 text-xs font-mono text-[#EDEDED] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
