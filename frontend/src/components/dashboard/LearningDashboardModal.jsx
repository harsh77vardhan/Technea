import { useState, useEffect, useRef, useMemo } from 'react'
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
  ExternalLink,
  Zap,
  Copy,
  CheckCheck,
  Edit3,
  RotateCcw,
  Activity,
  BookOpen,
  Play,
  Code2,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import {
  getDashboardSummaryApi,
  getMyRoadmapsApi,
  getProjectsApi,
  getRecommendedProjectsApi,
  getMyProjectsApi,
  updateProjectStatusApi,
  sendAiChatApi,
  getUserProfileApi,
  getAvatarUrl,
  getCourses,
  getRoadmapCatalogApi,
} from '../../services/api'
import AIMessageRenderer from './AIMessageRenderer'
import MemphisCornerDecorations from './MemphisCornerDecorations'
import DashboardLeftSidebar from './DashboardLeftSidebar'
import DashboardReferenceOverview from './DashboardReferenceOverview'
import DockedAIMentorCompanion from './DockedAIMentorCompanion'

let messageCounter = 1000
function getNextMentorMsgId() {
  messageCounter += 1
  return `msg-${messageCounter}`
}

function getMentorTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const AI_MENTOR_SESSION_STORAGE_KEY = 'technea_ai_mentor_session_history_v1'

function createDefaultMentorGreeting(user, context) {
  const userName = user?.full_name ? user.full_name.split(' ')[0] : 'there'
  const roadmapName = context?.activeRoadmapTitle || 'Full-Stack Software Engineering'
  const milestone = context?.currentMilestone || 'Object-Oriented Architecture'
  return {
    id: 'msg-default-1',
    conversation_id: null,
    sender: 'mentor',
    text: `Greetings ${userName}. I am your **Technea AI Engineering Mentor 2.0**.

I have synchronized your active learning context:
- **Active Track:** ${roadmapName}
- **Target Milestone:** ${milestone}

How can I accelerate your technical mastery today? Select a prompt below or ask any architectural question.`,
    suggestions: [
      'What should I prioritize completing today?',
      'How do I build production-grade projects that get hired?',
      'Can you review my learning progression and velocity?',
    ],
    related_actions: [],
    timestamp: getMentorTimeString(),
  }
}

function loadSavedMentorSession() {
  if (typeof window === 'undefined' || !window.sessionStorage) return null
  try {
    const raw = window.sessionStorage.getItem(AI_MENTOR_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { conversation_id: null, messages: parsed }
    }
    if (parsed && typeof parsed === 'object') {
      const messages = Array.isArray(parsed.messages) ? parsed.messages : null
      if (messages && messages.length > 0) {
        return {
          conversation_id: typeof parsed.conversation_id === 'string' ? parsed.conversation_id : null,
          messages,
        }
      }
    }
    return null
  } catch (err) {
    console.warn('Failed to load mentor session from sessionStorage:', err)
    return null
  }
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
   Minimal Hairline Progress Bar
───────────────────────────────────────── */
function MinimalProgressBar({ percent = 0, delay = 0, height = 3, className = '' }) {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100)
  return (
    <div
      className={`w-full overflow-hidden bg-white/[0.06] rounded-full relative ${className}`}
      style={{ height }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-neutral-300 via-white to-neutral-200 rounded-full relative"
        initial={{ width: 0 }}
        animate={{ width: `${safePercent}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px] opacity-75" />
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Achievement Medallion Component (Luxury Monochrome)
───────────────────────────────────────── */
function AchievementMedallion({
  title,
  description,
  icon: IconComponent,
  isUnlocked,
  unlockDate,
  progressText,
  progressPercent = 0,
  rarity = 'RARE',
  xp = '+250 XP',
}) {
  const rarityColors = {
    INITIATE: 'border-white/20 bg-white/5 text-neutral-300',
    UNCOMMON: 'border-white/20 bg-white/5 text-neutral-200',
    RARE: 'border-white/30 bg-white/10 text-white',
    EPIC: 'border-white/40 bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]',
    LEGENDARY: 'border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.2)]',
  }

  return (
    <div
      className={`relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border p-5 sm:p-6 backdrop-blur-3xl transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)] group ${
        isUnlocked
          ? 'border-white/20 bg-[#070707]/95 hover:border-white/35 hover:shadow-[0_12px_44px_rgba(255,255,255,0.06)]'
          : 'border-white/[0.08] bg-[#030303]/90 opacity-75 hover:opacity-100 hover:border-white/20'
      }`}
    >
      <div>
        {/* Top telemetry: XP reward + Rarity badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono font-bold text-white flex items-center gap-1 shadow-inner">
            <Zap className="h-3 w-3 text-white" />
            <span>{xp}</span>
          </span>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase ${
              rarityColors[rarity] || rarityColors.RARE
            }`}
          >
            {rarity}
          </span>
        </div>

        {/* Center Medallion Emblem */}
        <div className="flex items-center gap-4 mb-3">
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Medallion outer specular ring */}
            <div
              className={`h-16 w-16 rounded-full flex items-center justify-center border transition-all duration-300 relative ${
                isUnlocked
                  ? 'border-white/30 bg-gradient-to-b from-neutral-800 to-black shadow-[0_0_24px_rgba(255,255,255,0.2)]'
                  : 'border-white/10 bg-black/60'
              }`}
            >
              {/* Concentric inner SVG medallion rim */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  fill="none"
                  stroke={isUnlocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />
              </svg>

              <IconComponent
                className={`h-7 w-7 transition-transform group-hover:scale-110 duration-300 ${
                  isUnlocked ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]' : 'text-neutral-500'
                }`}
              />
            </div>

            {isUnlocked && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-[10px] font-bold shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                ✓
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate group-hover:text-neutral-200 transition-colors">
              {title}
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed mt-1 line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Status / Unlock Date / Progress Bar */}
      <div className="pt-3.5 border-t border-white/[0.06] mt-2">
        {isUnlocked ? (
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-300 flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
              <span>UNLOCKED</span>
            </span>
            <span className="text-neutral-500 text-[10px]">
              {unlockDate || 'Verified Achievement'}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>IN PROGRESS</span>
              <span className="text-white font-bold">{progressText || `${progressPercent}%`}</span>
            </div>
            <MinimalProgressBar percent={progressPercent} height={3} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main Dashboard Modal Component (Spatial Learning OS)
───────────────────────────────────────── */
export default function LearningDashboardModal({
  isOpen = true,
  onClose,
  onSelectPath = () => {},
  onOpenExplorer = () => {},
  isFullScreen = true,
}) {
  const { user, logout, openRoadmapBuilder } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'roadmaps' | 'courses' | 'projects' | 'mentor' | 'achievements' | 'portfolio'
  const [toastMessage, setToastMessage] = useState(null)
  const [failedProfileAvatarUrl, setFailedProfileAvatarUrl] = useState(null)
  const [failedShareAvatarUrl, setFailedShareAvatarUrl] = useState(null)
  const toastTimeoutRef = useRef(null)
  const modalRef = useRef(null)
  const copilotInputRef = useRef(null)

  const profileAvatarError = failedProfileAvatarUrl === user?.avatar_url && Boolean(user?.avatar_url)
  const shareAvatarError = failedShareAvatarUrl === user?.avatar_url && Boolean(user?.avatar_url)

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  // Projects State
  const [projectsList, setProjectsList] = useState([])
  const [recommendedProjects, setRecommendedProjects] = useState([])
  const [userProjectsMap, setUserProjectsMap] = useState({})
  const [projectFilter, setProjectFilter] = useState('all') // 'all' | 'recommended' | 'Beginner' | 'Intermediate' | 'Advanced'
  const [courseFilter, setCourseFilter] = useState('all') // 'all' | 'in_progress' | 'completed' | 'catalog'
  const [editingGithubProject, setEditingGithubProject] = useState(null)
  const [githubUrlInput, setGithubUrlInput] = useState('')

  // Roadmap Catalog State (100+ Roadmaps)
  const [catalogRoadmaps, setCatalogRoadmaps] = useState([])
  const catalogLoading = loading && catalogRoadmaps.length === 0
  const [roadmapSearchQuery, setRoadmapSearchQuery] = useState('')
  const [roadmapCategoryFilter, setRoadmapCategoryFilter] = useState('All')
  const [roadmapDifficultyFilter, setRoadmapDifficultyFilter] = useState('All')

  // Derived user details & learning context
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]
  const initials = fullName.slice(0, 2).toUpperCase()
  const userEmail = user?.email || 'harshvsvardhan22@gmail.com'

  const currentPath = dashboardData?.current_path || null
  const enrolledPaths = useMemo(() => dashboardData?.enrolled_paths || [], [dashboardData?.enrolled_paths])
  const skillsOverview = useMemo(() => dashboardData?.skills_overview || [], [dashboardData?.skills_overview])
  const dailyActivity = dashboardData?.daily_activity || null

  const overallPercent = dashboardData?.overall_progress_percent || 0
  const completedMilestones = dashboardData?.total_completed_milestones || 0
  const completedLessons = dashboardData?.total_completed_lessons || 0
  const streakCount = dailyActivity?.streak_count || dashboardData?.streak_count || 1
  const developerLevel = dashboardData?.developer_level || 'Code Initiate'
  const xpPoints = dashboardData?.xp_points ?? 50
  const nextLevelXp = dashboardData?.next_level_xp ?? 250
  const levelProgressPercent = dashboardData?.level_progress_percent ?? 20
  const completedProjectsCount = dashboardData?.completed_projects_count ?? 0
  const activeProjectsCount = dashboardData?.active_projects_count ?? 0

  // Live Context for AI Mentor 2.0
  const activeRoadmapTitle = currentPath?.title || savedRoadmaps[0]?.title || 'Full-Stack Software Engineering'
  const currentMilestone = currentPath?.next_step_title || 'Object-Oriented Architecture & Design Patterns'
  const learningGoal = savedRoadmaps[0]?.goal || user?.target_role || 'Full-Stack Mastery'

  // AI Mentor Chat State
  const [mentorConversationId, setMentorConversationId] = useState(() => {
    const saved = loadSavedMentorSession()
    return saved?.conversation_id || null
  })
  const [mentorMessages, setMentorMessages] = useState(() => {
    const saved = loadSavedMentorSession()
    if (saved?.messages && saved.messages.length > 0) {
      return saved.messages
    }
    return [createDefaultMentorGreeting(user, { activeRoadmapTitle, currentMilestone })]
  })
  const [mentorInput, setMentorInput] = useState('')
  const [isMentorTyping, setIsMentorTyping] = useState(false)
  const isClearingChatRef = useRef(false)
  const chatBottomRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'mentor') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeTab, mentorMessages, isMentorTyping])

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    if (!isOpen) return
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (activeTab !== 'overview') {
          setActiveTab('overview')
        }
        setTimeout(() => {
          copilotInputRef.current?.focus()
        }, 50)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isOpen, activeTab])

  // Persist mentor conversation state to sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.sessionStorage) return

    if (isClearingChatRef.current) {
      isClearingChatRef.current = false
      return
    }

    const isSingleDefault =
      mentorMessages.length === 1 &&
      mentorMessages[0].id === 'msg-default-1' &&
      mentorMessages[0].sender === 'mentor'

    if (isSingleDefault) {
      return
    }

    try {
      const payload = {
        conversation_id: mentorConversationId || null,
        messages: mentorMessages,
      }
      window.sessionStorage.setItem(AI_MENTOR_SESSION_STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      console.warn('Failed to persist mentor session to sessionStorage:', err)
    }
  }, [mentorMessages, mentorConversationId])

  // User Profile & Share Details
  const [, setProfileData] = useState(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)


  const showToast = (msg) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Project Actions
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

  // AI Mentor Chat Action
  const handleSendMentorMessage = async (msgText) => {
    const textToSend = (msgText || mentorInput || '').trim()
    if (!textToSend || isMentorTyping) return

    const userMsg = {
      id: getNextMentorMsgId(),
      conversation_id: mentorConversationId || null,
      sender: 'user',
      text: textToSend,
      timestamp: getMentorTimeString(),
    }

    setMentorMessages((prev) => [...prev, userMsg])
    setMentorInput('')
    setIsMentorTyping(true)

    try {
      const conversationHistory = mentorMessages
        .filter((m) => m.text && !m.isError)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }))

      const response = await sendAiChatApi({
        message: textToSend,
        conversation_history: conversationHistory,
        context: {
          active_roadmap: activeRoadmapTitle,
          current_milestone: currentMilestone,
          learning_goal: learningGoal,
        },
      })

      if (response?.conversation_id) {
        setMentorConversationId(response.conversation_id)
      }

      const mentorMsg = {
        id: getNextMentorMsgId(),
        conversation_id: response?.conversation_id || mentorConversationId || null,
        sender: 'mentor',
        text: response?.response || response?.reply || 'Here to assist you on your engineering journey.',
        suggestions: Array.isArray(response?.suggestions)
          ? response.suggestions
          : (Array.isArray(response?.quick_prompts) ? response.quick_prompts : []),
        related_actions: Array.isArray(response?.related_actions) ? response.related_actions : [],
        provider_used: response?.provider_used,
        timestamp: getMentorTimeString(),
      }

      setMentorMessages((prev) => [...prev, mentorMsg])
    } catch (err) {
      console.error('Failed to get AI mentor response:', err)
      const errorMsg = {
        id: getNextMentorMsgId(),
        conversation_id: mentorConversationId || null,
        sender: 'mentor',
        text: 'I encountered an issue connecting to Technea AI. Please check your network or try again.',
        suggestions: [
          'What should I learn next based on my roadmaps?',
          'How do I build full-stack projects that get hired?',
        ],
        related_actions: [],
        timestamp: getMentorTimeString(),
        isError: true,
      }
      setMentorMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsMentorTyping(false)
    }
  }

  // Clear Chat and reset AI Mentor conversation
  const handleClearMentorChat = () => {
    isClearingChatRef.current = true
    const defaultGreeting = createDefaultMentorGreeting(user, { activeRoadmapTitle, currentMilestone })
    setMentorConversationId(null)
    setMentorMessages([defaultGreeting])
    setMentorInput('')
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(AI_MENTOR_SESSION_STORAGE_KEY)
      } catch (err) {
        console.warn('Failed to clear mentor session from sessionStorage:', err)
      }
    }
    showToast('Conversation reset')
  }

  // Handle Interactive Related Action Pills from AI responses
  const handleRelatedAction = (action) => {
    if (!action) return
    const { action_type, payload } = action

    if (action_type === 'view_roadmap') {
      if (payload?.path_id) {
        onSelectPath({ id: payload.path_id, title: payload.title, slug: payload.slug })
        onClose()
      } else {
        setActiveTab('roadmaps')
      }
    } else if (action_type === 'view_project') {
      setActiveTab('projects')
    } else if (action_type === 'explore_skill' || action_type === 'browse_catalog') {
      if (typeof onOpenExplorer === 'function') {
        onOpenExplorer(payload?.skill || payload?.skill_id)
        onClose()
      }
    } else if (action_type === 'external_link' && typeof payload === 'string') {
      window.open(payload, '_blank', 'noopener,noreferrer')
    } else {
      const titleLower = (action.title || '').toLowerCase()
      if (titleLower.includes('roadmap')) {
        setActiveTab('roadmaps')
      } else if (titleLower.includes('project')) {
        setActiveTab('projects')
      } else if (titleLower.includes('skill') || titleLower.includes('catalog')) {
        if (typeof onOpenExplorer === 'function') {
          onOpenExplorer()
          onClose()
        }
      }
    }
  }

  // Direct Course Player Navigation
  const handleContinueCourse = (course) => {
    onClose()
    if (course?.id) {
      window.history.pushState({}, '', `/courses/${course.id}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    } else if (currentPath) {
      onSelectPath(currentPath)
    } else {
      onOpenExplorer()
    }
  }

  // Quick Action Helpers
  const handleOpenRoadmapBuilder = (initialGoal = '') => {
    onClose()
    openRoadmapBuilder(initialGoal)
  }

  const handleExploreSkills = (skill) => {
    if (!isFullScreen && onClose) onClose()
    onOpenExplorer(skill)
  }

  const handleResumeMilestone = () => {
    if (currentPath) {
      if (currentPath.slug || currentPath.id) {
        window.history.pushState({}, '', `/learning-paths/${currentPath.slug || currentPath.id}`)
        window.dispatchEvent(new PopStateEvent('popstate'))
      } else {
        onSelectPath(currentPath)
      }
    } else {
      openRoadmapBuilder()
    }
  }

  // Fetch Dashboard, Courses & Ecosystem data
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
          profileRes,
          coursesRes,
          catalogRes,
        ] = await Promise.allSettled([
          getDashboardSummaryApi(),
          getMyRoadmapsApi(),
          getProjectsApi(),
          getRecommendedProjectsApi(),
          getMyProjectsApi(),
          getUserProfileApi(),
          getCourses(),
          getRoadmapCatalogApi({ limit: 250 }),
        ])

        if (isMounted) {
          if (dashData.status === 'fulfilled') {
            setDashboardData(dashData.value)
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
          if (profileRes.status === 'fulfilled') {
            setProfileData(profileRes.value)
          }
          if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) {
            setAllCourses(coursesRes.value)
          }
          if (catalogRes.status === 'fulfilled' && Array.isArray(catalogRes.value)) {
            setCatalogRoadmaps(catalogRes.value)
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

  // Body scroll lock and focus trap
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const modalEl = modalRef.current
    const focusableSelectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const timer = setTimeout(() => {
      if (!modalEl) return
      const activeTabEl = modalEl.querySelector('[role="tab"][aria-selected="true"]')
      if (activeTabEl) {
        activeTabEl.focus()
      } else {
        const first = modalEl.querySelector(focusableSelectors)
        first?.focus()
      }
    }, 50)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && modalEl) {
        const focusable = Array.from(modalEl.querySelectorAll(focusableSelectors))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleCopyProfileLink = () => {
    if (navigator.clipboard) {
      const url = `https://technea.dev/@${firstName.toLowerCase()}`
      navigator.clipboard.writeText(url)
      showToast('Public profile link copied to clipboard!')
    }
  }


  // Achievement Status Calculations
  const hasLinkedGithub = useMemo(() => {
    return Object.values(userProjectsMap).some((p) => Boolean(p.github_url))
  }, [userProjectsMap])

  const achievementsList = useMemo(() => {
    return [
      {
        id: 'first_commit',
        title: 'First Code Commit',
        description: 'Pushed verified code changes or initialized your first developer workspace.',
        icon: Code2,
        rarity: 'INITIATE',
        xp: '+100 XP',
        isUnlocked: completedLessons > 0 || completedMilestones > 0 || hasLinkedGithub,
        unlockDate: 'Verified System Init',
        progressPercent: completedLessons > 0 || completedMilestones > 0 || hasLinkedGithub ? 100 : 0,
        progressText: completedLessons > 0 || completedMilestones > 0 || hasLinkedGithub ? 'Complete' : '0/1 Pushed',
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Sustained active engineering momentum for 7 consecutive days.',
        icon: Flame,
        rarity: 'RARE',
        xp: '+250 XP',
        isUnlocked: streakCount >= 7,
        unlockDate: '7-Day Ignition',
        progressPercent: Math.min(Math.round((streakCount / 7) * 100), 100),
        progressText: `${Math.min(streakCount, 7)} / 7 Days`,
      },
      {
        id: 'fullstack_pioneer',
        title: 'Full-Stack Pioneer',
        description: 'Conquered 5 verified full-stack architecture milestones.',
        icon: Target,
        rarity: 'EPIC',
        xp: '+500 XP',
        isUnlocked: completedMilestones >= 5,
        unlockDate: '5 Milestones Mastered',
        progressPercent: Math.min(Math.round((completedMilestones / 5) * 100), 100),
        progressText: `${Math.min(completedMilestones, 5)} / 5 Milestones`,
      },
      {
        id: 'ai_architect',
        title: 'AI Architect',
        description: 'Synthesized a custom career roadmap using Technea Autonomous AI.',
        icon: Layers,
        rarity: 'RARE',
        xp: '+200 XP',
        isUnlocked: savedRoadmaps.length > 0,
        unlockDate: 'Roadmap Blueprint Synced',
        progressPercent: savedRoadmaps.length > 0 ? 100 : 0,
        progressText: savedRoadmaps.length > 0 ? 'Complete' : '0/1 Generated',
      },
      {
        id: 'speed_learner',
        title: 'Speed Learner',
        description: 'Completed 10 core technical curriculum lessons and interactive units.',
        icon: BookOpen,
        rarity: 'UNCOMMON',
        xp: '+150 XP',
        isUnlocked: completedLessons >= 10,
        unlockDate: '10 Lessons Complete',
        progressPercent: Math.min(Math.round((completedLessons / 10) * 100), 100),
        progressText: `${Math.min(completedLessons, 10)} / 10 Lessons`,
      },
      {
        id: 'opensource_builder',
        title: 'Open Source Builder',
        description: 'Linked public GitHub code repositories to your verified developer portfolio.',
        icon: FolderGit2,
        rarity: 'LEGENDARY',
        xp: '+300 XP',
        isUnlocked: hasLinkedGithub,
        unlockDate: 'GitHub Linked & Verified',
        progressPercent: hasLinkedGithub ? 100 : 0,
        progressText: hasLinkedGithub ? 'Complete' : '0/1 Repositories',
      },
    ]
  }, [completedLessons, completedMilestones, streakCount, savedRoadmaps, hasLinkedGithub])

  const unlockedAchievementsCount = achievementsList.filter((a) => a.isUnlocked).length

  // Combined enrolled courses / active courses
  const enrolledCoursesDisplay = useMemo(() => {
    if (enrolledPaths && enrolledPaths.length > 0) {
      return enrolledPaths
    }
    if (allCourses && allCourses.length > 0) {
      return allCourses.slice(0, 4).map((c, i) => ({
        id: c.id,
        title: c.title,
        category: c.category || 'CORE ENGINEERING',
        level: c.level || 'Intermediate',
        duration: c.duration || '6-8 WEEKS',
        progress_percent: i === 0 ? 65 : 20,
        completed_steps_count: i === 0 ? 8 : 2,
        total_steps_count: 14,
        next_step_title: c.description ? c.description.slice(0, 60) + '…' : 'Advanced Module Integration',
      }))
    }
    return []
  }, [enrolledPaths, allCourses])

  // Roadmap Categories & Difficulties presets
  const ROADMAP_CATEGORIES = [
    'All',
    'Programming',
    'Web Development',
    'AI / ML',
    'Data',
    'Cloud & DevOps',
    'Cybersecurity',
    'Mobile',
    'Career',
    'Design',
  ]

  const ROADMAP_DIFFICULTIES = [
    'All',
    'Beginner',
    'Intermediate',
    'Advanced',
  ]

  const matchesRoadmapCategory = (roadmapCategory, selected) => {
    if (selected === 'All') return true
    const cat = (roadmapCategory || '').toLowerCase()
    if (selected === 'AI / ML') {
      return (
        cat.includes('ai') ||
        cat.includes('ml') ||
        cat.includes('machine learning') ||
        cat.includes('intelligence') ||
        cat.includes('nlp') ||
        cat.includes('deep learning')
      )
    }
    if (selected === 'Web Development') {
      return (
        cat.includes('web') ||
        cat.includes('frontend') ||
        cat.includes('backend') ||
        cat.includes('full-stack') ||
        cat.includes('full stack') ||
        cat.includes('react')
      )
    }
    if (selected === 'Cloud & DevOps') {
      return (
        cat.includes('cloud') ||
        cat.includes('devops') ||
        cat.includes('docker') ||
        cat.includes('kubernetes') ||
        cat.includes('aws') ||
        cat.includes('azure') ||
        cat.includes('gcp') ||
        cat.includes('linux') ||
        cat.includes('infrastructure')
      )
    }
    if (selected === 'Data') {
      return (
        cat.includes('data') ||
        cat.includes('analytics') ||
        cat.includes('database') ||
        cat.includes('sql') ||
        cat.includes('pipeline')
      )
    }
    if (selected === 'Programming') {
      return (
        cat.includes('programming') ||
        cat.includes('python') ||
        cat.includes('javascript') ||
        cat.includes('typescript') ||
        cat.includes('c++') ||
        cat.includes('java') ||
        cat.includes('rust') ||
        cat.includes('golang') ||
        cat.includes('algorithms')
      )
    }
    if (selected === 'Cybersecurity') {
      return (
        cat.includes('cyber') ||
        cat.includes('security') ||
        cat.includes('pentest') ||
        cat.includes('ethical') ||
        cat.includes('infosec')
      )
    }
    if (selected === 'Mobile') {
      return (
        cat.includes('mobile') ||
        cat.includes('ios') ||
        cat.includes('android') ||
        cat.includes('flutter') ||
        cat.includes('react native') ||
        cat.includes('swift')
      )
    }
    if (selected === 'Design') {
      return (
        cat.includes('design') ||
        cat.includes('ui') ||
        cat.includes('ux') ||
        cat.includes('figma') ||
        cat.includes('product design')
      )
    }
    if (selected === 'Career') {
      return (
        cat.includes('career') ||
        cat.includes('business') ||
        cat.includes('product') ||
        cat.includes('interview') ||
        cat.includes('system design') ||
        cat.includes('management')
      )
    }
    return cat.includes(selected.toLowerCase())
  }

  // On-demand fetch if roadmaps tab opened and catalogRoadmaps is empty
  useEffect(() => {
    let active = true
    if (activeTab === 'roadmaps' && catalogRoadmaps.length === 0) {
      getRoadmapCatalogApi({ limit: 250 })
        .then((data) => {
          if (active && Array.isArray(data)) setCatalogRoadmaps(data)
        })
        .catch((err) => console.warn('Could not load roadmap catalog:', err))
    }
    return () => {
      active = false
    }
  }, [activeTab, catalogRoadmaps.length])

  const filteredCatalogRoadmaps = useMemo(() => {
    const q = (roadmapSearchQuery || '').trim().toLowerCase()
    return catalogRoadmaps.filter((rm) => {
      // Category filter
      if (!matchesRoadmapCategory(rm.category, roadmapCategoryFilter)) {
        return false
      }
      // Difficulty filter
      if (roadmapDifficultyFilter !== 'All') {
        const lvl = (rm.level || rm.difficulty || '').toLowerCase()
        if (!lvl.includes(roadmapDifficultyFilter.toLowerCase())) {
          return false
        }
      }
      // Search query
      if (q) {
        const titleMatch = (rm.title || '').toLowerCase().includes(q)
        const descMatch = (rm.description || '').toLowerCase().includes(q)
        const catMatch = (rm.category || '').toLowerCase().includes(q)
        const termsMatch =
          Array.isArray(rm.search_terms) &&
          rm.search_terms.some((t) => String(t).toLowerCase().includes(q))
        const conceptsMatch =
          Array.isArray(rm.related_concepts) &&
          rm.related_concepts.some((c) => String(c).toLowerCase().includes(q))
        if (!titleMatch && !descMatch && !catMatch && !termsMatch && !conceptsMatch) {
          return false
        }
      }
      return true
    })
  }, [catalogRoadmaps, roadmapCategoryFilter, roadmapDifficultyFilter, roadmapSearchQuery])

  const handleExploreCatalogRoadmap = (roadmap) => {
    onClose()
    onSelectPath(roadmap)
  }

  if (!isOpen) return null

  // 7 Tabs configuration for VisionOS Segmented Pill Bar
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: Activity, badge: null },
    { id: 'roadmaps', label: 'Roadmaps', icon: Compass, badge: savedRoadmaps.length > 0 ? savedRoadmaps.length : null },
    { id: 'courses', label: 'Courses', icon: BookOpen, badge: enrolledCoursesDisplay.length > 0 ? enrolledCoursesDisplay.length : null },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: recommendedProjects.length > 0 ? recommendedProjects.length : null },
    { id: 'mentor', label: 'AI Mentor 2.0', icon: Bot, badge: 'LIVE' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, badge: `${unlockedAchievementsCount}/6` },
    { id: 'portfolio', label: 'Portfolio', icon: Award, badge: null },
  ]

  return (
    <div
      role="main"
      aria-label="Technea Autonomous Spatial Learning OS"
      data-lenis-prevent
      className={
        isFullScreen
          ? 'fixed inset-0 z-50 w-full h-screen min-h-screen flex flex-col bg-[#f4f6f8] text-[#0f172a] overflow-hidden select-none'
          : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-md'
      }
    >
      {/* Soft Backdrop when in modal mode */}
      {!isFullScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />
      )}

      {/* Authentic 4-Corner Memphis Accents from Hero.jsx */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60" aria-hidden="true">
        <MemphisCornerDecorations />
      </div>

      {/* Dashboard Shell — Full screen application or floating card */}
      <div
        ref={modalRef}
        data-lenis-prevent
        className={
          isFullScreen
            ? 'relative z-10 flex flex-col w-full h-full bg-[#f4f6f8] overflow-hidden'
            : 'relative z-10 flex flex-col w-full max-w-[1520px] h-[95vh] max-h-[1050px] rounded-3xl border border-[#e2e8f0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden'
        }
      >
        {/* Mobile Navigation Header (only on screens < lg) */}
        <header className="relative z-20 flex lg:hidden items-center justify-between border-b border-[#e2e8f0] bg-white px-4 py-2.5 gap-2 shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-black text-white font-extrabold text-xs flex items-center justify-center font-sans">
              T
            </div>
            <span className="text-sm font-bold text-[#0f172a] font-sans">Technea</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-[55%] scrollbar-none py-1">
            {navTabs.map((tab) => {
              const isSelected = activeTab === tab.id || (tab.id === 'portfolio' && activeTab === 'profile')
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-sans shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#ded4f4] text-[#1e1b4b] font-bold shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-xs font-mono text-[#0f172a]">
              <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span>{streakCount}d</span>
            </div>

            {!isFullScreen && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                aria-label="Close dashboard"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </header>

        {/* Toast Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-mono text-[#0f172a] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──────────────── COCKPIT BODY ──────────────── */}
        <div className="relative z-10 flex-1 flex min-h-0 overflow-hidden bg-white">
          {/* 1. Left Navigation Sidebar (240px) */}
          <div className="w-56 xl:w-64 shrink-0 border-r border-[#e2e8f0] bg-[#f0f4f9] p-4 hidden lg:flex flex-col justify-between">
            <DashboardLeftSidebar
              activeTab={activeTab}
              onSelectTab={(tabId) => setActiveTab(tabId)}
              user={user}
              xpPoints={xpPoints}
              onLogout={logout}
            />
          </div>

          {/* 2. Main Operating Deck */}
          <main
            data-lenis-prevent
            className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-white p-4 sm:p-6 md:p-8 space-y-7 scrollbar-thin scrollbar-thumb-slate-200 text-[#0f172a]"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7c3aed]/20 border-t-[#7c3aed]" />
                <p className="text-xs text-[#64748b] font-mono">
                  Loading Technea workspace…
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-600 font-mono">
                <p>{error}</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* ══════════════ TAB 1: OVERVIEW (VERSION 1.1 REFINEMENT) ══════════════ */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <DashboardReferenceOverview
                      user={user}
                      currentPath={currentPath}
                      overallPercent={overallPercent}
                      streakCount={streakCount}
                      onResumeMilestone={handleResumeMilestone}
                      onLaunchWorkspace={() => handleExploreSkills(currentPath?.title)}
                      onShare={() => setIsShareModalOpen(true)}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                    />
                  </motion.div>
                )}

                {/* ══════════════ TAB 2: ROADMAPS (CAREER BLUEPRINTS & 100+ CATALOG) ══════════════ */}
                {activeTab === 'roadmaps' && (
                  <motion.div
                    key="roadmaps"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                  >
                    {/* ── 1. YOUR SAVED ROADMAPS (PRESERVED AT TOP) ── */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white tracking-tight">
                              Your Saved Roadmaps
                            </h2>
                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                              {savedRoadmaps.length} Custom Blueprints
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            AI-synthesized blueprints and personalized curriculum tailored to your specific career trajectory.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenRoadmapBuilder()}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)] shrink-0"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
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
                                className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#050505]/90 backdrop-blur-3xl p-5 sm:p-6 hover:border-white/[0.2] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between group"
                              >
                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono text-neutral-300 uppercase tracking-wider">
                                      {roadmap.target_role || 'Career Blueprint'}
                                    </span>
                                    <span className="text-[10px] font-mono text-neutral-400">
                                      {roadmap.estimated_duration || '18 Weeks'}
                                    </span>
                                  </div>

                                  <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-neutral-200 transition-colors">
                                    {roadmap.title}
                                  </h4>
                                  <p className="text-xs text-neutral-400 line-clamp-2">
                                    Goal: &quot;{roadmap.goal}&quot;
                                  </p>
                                </div>

                                <div className="mt-4 pt-3.5 border-t border-white/[0.06] space-y-2.5">
                                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                                    <span>{completedCount} milestones completed</span>
                                    <span className="text-white font-bold">
                                      {progress}%
                                    </span>
                                  </div>
                                  <MinimalProgressBar percent={progress} height={3} />

                                  <div className="pt-2 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRoadmapBuilder(roadmap.goal)}
                                      className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl bg-white text-black font-semibold px-4 py-1.5 text-xs hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
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
                        <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl border border-white/[0.08] bg-[#050505]/70 backdrop-blur-2xl p-6 text-center space-y-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                          <Bookmark className="h-6 w-6 text-neutral-500 mx-auto" />
                          <h4 className="text-xs font-bold text-white">
                            No AI Career Roadmaps Generated Yet
                          </h4>
                          <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                            Design a custom roadmap based on your current knowledge and target role.
                          </p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenRoadmapBuilder()}
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>Launch Roadmap Builder</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── 2. HERO-QUALITY TECHNEA ROADMAP CATALOG (100+ ROADMAPS) ── */}
                    <div className="space-y-5 pt-4 border-t border-white/[0.08]">
                      {/* Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-bold text-white tracking-tight">
                              Engineering Roadmaps & Career Blueprints
                            </h2>
                            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-mono text-sky-300">
                              {catalogRoadmaps.length > 0 ? `${catalogRoadmaps.length} Roadmaps` : '100+ Roadmaps'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Explore comprehensive step-by-step engineering curricula, career paths, and technical blueprints.
                          </p>
                        </div>
                      </div>

                      {/* Search Bar & Instant Filtering Controls */}
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                          <input
                            type="text"
                            value={roadmapSearchQuery}
                            onChange={(e) => setRoadmapSearchQuery(e.target.value)}
                            placeholder="Search 100+ roadmaps, domains, or skills (e.g. Python, Full-Stack, Docker, Machine Learning)..."
                            className="w-full min-h-[44px] rounded-xl border border-white/10 bg-[#0a0a0f]/90 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                          />
                          {roadmapSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setRoadmapSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                              aria-label="Clear search"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Category Filter Pills (Scrollable) */}
                        <div
                          data-lenis-prevent
                          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                          {ROADMAP_CATEGORIES.map((cat) => {
                            const isSelected = roadmapCategoryFilter === cat
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setRoadmapCategoryFilter(cat)}
                                className={`inline-flex min-h-[32px] items-center rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                  isSelected
                                    ? 'bg-white text-black font-semibold shadow-sm'
                                    : 'border border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                                }`}
                              >
                                {cat}
                              </button>
                            )
                          })}
                        </div>

                        {/* Difficulty & Status Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase text-neutral-500 font-semibold mr-1">
                              Difficulty:
                            </span>
                            {ROADMAP_DIFFICULTIES.map((diff) => {
                              const isSelected = roadmapDifficultyFilter === diff
                              return (
                                <button
                                  key={diff}
                                  type="button"
                                  onClick={() => setRoadmapDifficultyFilter(diff)}
                                  className={`rounded-md px-2.5 py-0.5 text-[11px] font-mono transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-white/20 text-white font-semibold border border-white/30'
                                      : 'border border-white/5 bg-white/[0.02] text-neutral-400 hover:text-neutral-200'
                                  }`}
                                >
                                  {diff}
                                </button>
                              )
                            })}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] text-neutral-400">
                              Showing {filteredCatalogRoadmaps.length} of {catalogRoadmaps.length || '100+'} roadmaps
                            </span>
                            {(roadmapSearchQuery || roadmapCategoryFilter !== 'All' || roadmapDifficultyFilter !== 'All') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRoadmapSearchQuery('')
                                  setRoadmapCategoryFilter('All')
                                  setRoadmapDifficultyFilter('All')
                                }}
                                className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Reset filters</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Grid of Roadmap Cards */}
                      {catalogLoading && catalogRoadmaps.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3, 4, 5, 6].map((idx) => (
                            <div
                              key={idx}
                              className="rounded-2xl border border-white/[0.08] bg-[#07080c]/60 p-5 space-y-3 animate-pulse"
                            >
                              <div className="flex justify-between items-center">
                                <div className="h-4 w-20 bg-white/10 rounded" />
                                <div className="h-4 w-14 bg-white/10 rounded" />
                              </div>
                              <div className="h-5 w-3/4 bg-white/10 rounded" />
                              <div className="h-10 w-full bg-white/5 rounded" />
                              <div className="h-8 w-full bg-white/10 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : filteredCatalogRoadmaps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredCatalogRoadmaps.map((roadmap) => {
                            const stepsCount =
                              roadmap.roadmap_steps?.length ||
                              (Array.isArray(roadmap.projects) ? roadmap.projects.length * 2 : 6)
                            const level = roadmap.level || roadmap.difficulty || 'Beginner'
                            const isBeginner = level.toLowerCase().includes('beginner')
                            const isAdvanced = level.toLowerCase().includes('advanced')
                            const skillsTags = (
                              roadmap.related_concepts ||
                              roadmap.search_terms ||
                              []
                            ).slice(0, 3)

                            return (
                              <div
                                key={roadmap.id}
                                className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl border border-white/[0.08] bg-[#07080c]/90 backdrop-blur-2xl p-5 hover:border-white/[0.22] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-300 flex flex-col justify-between group"
                              >
                                <div className="space-y-3">
                                  {/* Badge & Duration Row */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[9px] font-mono text-neutral-300 uppercase tracking-wider truncate">
                                      {roadmap.category || 'Engineering'}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span
                                        className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-medium ${
                                          isBeginner
                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                            : isAdvanced
                                            ? 'border-purple-500/20 bg-purple-500/10 text-purple-300'
                                            : 'border-sky-500/20 bg-sky-500/10 text-sky-300'
                                        }`}
                                      >
                                        {level}
                                      </span>
                                      <span className="text-[10px] font-mono text-neutral-400">
                                        {roadmap.duration || '4-6 Weeks'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Title & Description */}
                                  <div>
                                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-neutral-200 transition-colors line-clamp-1">
                                      {roadmap.title}
                                    </h4>
                                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                                      {roadmap.description || 'Comprehensive step-by-step curriculum and technical foundations.'}
                                    </p>
                                  </div>

                                  {/* Skills Tags */}
                                  {skillsTags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      {skillsTags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-400"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Footer & Action Button */}
                                <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-3">
                                  <span className="text-[11px] font-mono text-neutral-400">
                                    {stepsCount} Milestones
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleExploreCatalogRoadmap(roadmap)}
                                    className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl bg-white text-black font-semibold px-3.5 py-1.5 text-xs hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)] shrink-0"
                                  >
                                    <span>Explore Roadmap</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#07080c]/60 p-8 text-center space-y-3">
                          <Compass className="h-8 w-8 text-neutral-500 mx-auto" />
                          <h4 className="text-sm font-bold text-white">
                            No Roadmaps Found
                          </h4>
                          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                            No catalog blueprints match your current filter or search criteria.
                          </p>
                          <div className="pt-2 flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setRoadmapSearchQuery('')
                                setRoadmapCategoryFilter('All')
                                setRoadmapDifficultyFilter('All')
                              }}
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Reset Filters</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRoadmapBuilder(roadmapSearchQuery)}
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-white text-black px-4 py-1.5 text-xs font-semibold hover:bg-neutral-200 transition-all cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>Generate with AI</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ══════════════ TAB 3: COURSES (ENROLLED & ACTIVE COURSES) ══════════════ */}
                {activeTab === 'courses' && (
                  <motion.div
                    key="courses"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Enrolled & Active Engineering Courses
                          </h2>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                            {enrolledCoursesDisplay.length} Active Tracks
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Interactive lesson progression, core theory modules, and hands-on coding walkthroughs.
                        </p>
                      </div>

                      {/* Filter Pills */}
                      <div data-lenis-prevent className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                        {[
                          { id: 'all', label: 'All Tracks' },
                          { id: 'in_progress', label: 'In Progress' },
                          { id: 'catalog', label: `Catalog (${allCourses.length})` },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setCourseFilter(f.id)}
                            className={`rounded-xl border px-3 py-1.5 min-h-[44px] sm:min-h-[36px] flex items-center justify-center text-xs font-mono transition-all duration-300 cursor-pointer shrink-0 ${
                              courseFilter === f.id
                                ? 'border-white/20 bg-white text-black font-semibold shadow-[0_2px_10px_rgba(255,255,255,0.12)]'
                                : 'border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(courseFilter === 'catalog' && allCourses.length > 0 ? allCourses : enrolledCoursesDisplay).map((course) => {
                        const isEnrolled = enrolledCoursesDisplay.some((c) => c.id === course.id)
                        const progress = course.progress_percent ?? (isEnrolled ? 60 : 0)
                        const completedSteps = course.completed_steps_count ?? 6
                        const totalSteps = course.total_steps_count ?? 12
                        const nextLesson = course.next_step_title || course.current_lesson_title || 'Architectural System Patterns'

                        return (
                          <div
                            key={course.id}
                            className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#050505]/95 backdrop-blur-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between group hover:border-white/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-300"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono text-neutral-300 uppercase tracking-wider">
                                  {course.category || 'FULL-STACK ENGINEERING'}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-400">
                                  {course.duration || '8 Weeks'}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-base font-bold text-white tracking-tight group-hover:text-neutral-200 transition-colors">
                                  {course.title}
                                </h3>
                                <div className="mt-2 rounded-xl border border-white/[0.06] bg-black/40 p-3 space-y-1">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block">
                                    NEXT UP:
                                  </span>
                                  <p className="text-xs text-neutral-200 font-mono font-medium truncate">
                                    {nextLesson}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 pt-3.5 border-t border-white/[0.06] space-y-3">
                              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                                <span>{completedSteps} of {totalSteps} lessons</span>
                                <span className="text-white font-bold">{progress}%</span>
                              </div>
                              <MinimalProgressBar percent={progress} height={3} />

                              <div className="pt-2 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose()
                                    onSelectPath(course)
                                  }}
                                  className="min-h-[44px] sm:min-h-[36px] text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  View Outline
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleContinueCourse(course)}
                                  className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-2 rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.12)] hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]"
                                >
                                  <Play className="h-3 w-3 fill-current" />
                                  <span>Continue Lesson</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ══════════════ TAB 4: PROJECTS (ENGINEERING CAPSTONES) ══════════════ */}
                {activeTab === 'projects' && (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Projects Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Engineering Project Catalog
                          </h2>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                            {projectsList.length} Real-World Builds
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Bridge theory into production deliverables. Connect code repositories to your developer portfolio.
                        </p>
                      </div>

                      {/* Filter Pills */}
                      <div data-lenis-prevent className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
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
                            className={`rounded-xl border px-3 py-1.5 min-h-[44px] sm:min-h-[36px] flex items-center justify-center text-xs font-mono transition-all duration-300 cursor-pointer shrink-0 ${
                              projectFilter === f.id
                                ? 'border-white/20 bg-white text-black font-semibold shadow-[0_2px_10px_rgba(255,255,255,0.12)]'
                                : 'border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20'
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
                            className={`relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-300 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] ${
                              userStatus === 'completed'
                                ? 'border-emerald-500/30 bg-[#050505]/95 shadow-[0_8px_32px_rgba(16,185,129,0.08)]'
                                : userStatus === 'in_progress'
                                ? 'border-white/20 bg-[#050505]/95 hover:border-white/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
                                : 'border-white/[0.08] bg-[#050505]/90 hover:border-white/[0.18] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider ${
                                      proj.difficulty === 'Beginner'
                                        ? 'text-neutral-300'
                                        : proj.difficulty === 'Intermediate'
                                        ? 'text-neutral-200'
                                        : 'text-white'
                                    }`}
                                  >
                                    {proj.difficulty}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    {proj.duration_weeks || '2 Weeks'}
                                  </span>
                                  {isRec && (
                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono text-neutral-300">
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
                                      ? 'text-neutral-200'
                                      : 'text-neutral-400'
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
                                <h3 className="text-sm sm:text-base font-bold text-white break-words">{proj.title}</h3>
                                <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                                  {proj.description}
                                </p>
                              </div>

                              {/* Tech stack */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {(proj.tech_stack || []).map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>

                              {/* Architectural specifications */}
                              {proj.architecture_spec?.length > 0 && (
                                <div className="rounded-xl border border-white/[0.08] bg-black/60 p-3 text-[11px] font-mono text-neutral-400 space-y-1">
                                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">
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
                            <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {githubUrl ? (
                                  <a
                                    href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 hover:text-white hover:underline truncate"
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
                                    className="min-h-[44px] sm:min-h-[36px] text-[11px] font-mono text-neutral-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <GithubIcon className="h-3.5 w-3.5" />
                                    <span>Link GitHub Repo</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {userStatus === 'not_started' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartProject(proj.id)}
                                    className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
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
                                      className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] p-2 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                      title="Update repo URL"
                                      aria-label={`Update GitHub repository URL for ${proj.title}`}
                                    >
                                      <GithubIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCompleteProject(proj.id)}
                                      className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                                    >
                                      <Check className="h-3 w-3" />
                                      <span>Complete (+150 XP)</span>
                                    </button>
                                  </>
                                )}
                                {userStatus === 'completed' && (
                                  <span className="text-[11px] font-mono text-emerald-400 font-medium flex items-center gap-1">
                                    ✓ Verified (+150 XP)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ══════════════ TAB 5: AI MENTOR 2.0 (FLAGSHIP SYNCED CONTEXT) ══════════════ */}
                {activeTab === 'mentor' && (
                  <motion.div
                    key="mentor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#050505]/95 backdrop-blur-3xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-5xl mx-auto w-full flex flex-col min-h-[620px]"
                  >
                    {/* Top: Header with Engine Telemetry */}
                    <div className="border-b border-white/[0.08] pb-4 mb-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-white" />
                          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            Technea AI Mentor 2.0
                          </h2>
                          <span className="rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-mono text-neutral-300">
                            AUTONOMOUS
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          Flagship context-synced code coaching, architectural review, and trajectory planning.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleClearMentorChat}
                          className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 border border-white/[0.1] bg-white/[0.03] text-neutral-300 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-300 cursor-pointer"
                          title="Reset conversation"
                          aria-label="Clear chat conversation"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Clear Chat</span>
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                          <span className="text-[11px] font-mono text-neutral-300">Neural Engine Online</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Synced Context HUD Bar */}
                    <div className="mb-4 rounded-xl border border-white/[0.12] bg-white/[0.03] backdrop-blur-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
                      <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 truncate">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
                        </span>
                        <span className="text-white font-bold shrink-0">🧠 Synced Context:</span>
                        <span className="text-neutral-200 font-semibold truncate">{activeRoadmapTitle}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-neutral-400 shrink-0">Milestone:</span>
                        <span className="text-white font-medium truncate">{currentMilestone}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-neutral-400 shrink-0">Goal:</span>
                        <span className="text-neutral-200 truncate">{learningGoal}</span>
                      </div>

                      <span className="text-[10px] font-mono text-neutral-400 shrink-0 hidden md:inline">
                        HUD v2.0
                      </span>
                    </div>

                    {/* 6 Quick-Action Prompts */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        <Sparkles className="h-3 w-3 text-white" />
                        <span>6 Mission-Critical Quick Actions:</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {[
                          {
                            label: 'My Daily Goal',
                            emoji: '🎯',
                            prompt: `Analyze my current progress in ${activeRoadmapTitle} (Milestone: ${currentMilestone}) and define my high-impact daily engineering goals for today.`,
                          },
                          {
                            label: 'Plan My Week',
                            emoji: '📅',
                            prompt: `Create a structured 7-day study and build schedule for milestone "${currentMilestone}" toward my goal of ${learningGoal}.`,
                          },
                          {
                            label: 'Revision Quiz',
                            emoji: '🔄',
                            prompt: `Generate a quick 3-question conceptual and code revision quiz on "${currentMilestone}". Include explanations.`,
                          },
                          {
                            label: 'Interview Prep',
                            emoji: '💼',
                            prompt: `Give me a real-world senior software engineering interview question related to "${currentMilestone}" with key evaluation criteria.`,
                          },
                          {
                            label: 'Code Review / Debug',
                            emoji: '🛠️',
                            prompt: `How should I structure, test, and debug production code for "${currentMilestone}"? Provide best practices.`,
                          },
                          {
                            label: 'Next Milestone Guide',
                            emoji: '🚀',
                            prompt: `Provide a comprehensive technical guide for mastering my next milestone: "${currentMilestone}" in ${activeRoadmapTitle}.`,
                          },
                        ].map((qa, qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            disabled={isMentorTyping}
                            onClick={() => handleSendMentorMessage(qa.prompt)}
                            className="min-h-[44px] rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.08] p-2.5 text-left transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-xs disabled:opacity-50"
                          >
                            <span className="text-base mb-1 block">{qa.emoji}</span>
                            <span className="text-xs font-mono font-bold text-neutral-200 group-hover:text-white transition-colors leading-tight block">
                              {qa.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Middle: Conversation Area */}
                    <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-6 max-h-[460px] min-h-[320px]">
                      {mentorMessages.map((msg, idx) => {
                        const isLatestMentor =
                          msg.sender === 'mentor' &&
                          !mentorMessages.slice(idx + 1).some((m) => m.sender === 'mentor')

                        return msg.sender === 'user' ? (
                          <div key={msg.id} className="flex justify-end ml-auto">
                            <div className="max-w-xl rounded-2xl bg-white/[0.08] border border-white/[0.14] backdrop-blur-xl px-4 py-3 text-xs sm:text-sm text-white leading-relaxed whitespace-pre-wrap break-words shadow-sm">
                              {msg.text}
                            </div>
                          </div>
                        ) : (
                          <div key={msg.id} className="flex items-start gap-3.5 max-w-3xl mr-auto w-full">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white shrink-0 mt-0.5 shadow-sm">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 space-y-2 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-white font-mono">
                                  Technea AI Mentor 2.0
                                </span>
                                {msg.timestamp && (
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    {msg.timestamp}
                                  </span>
                                )}
                              </div>

                              {/* AI Markdown & Code Blocks */}
                              <AIMessageRenderer content={msg.text} />

                              {/* Interactive Related Action Pills */}
                              {Array.isArray(msg.related_actions) && msg.related_actions.length > 0 && (
                                <div className="pt-2">
                                  <div className="flex flex-wrap gap-2">
                                    {msg.related_actions.map((act, actIdx) => (
                                      <button
                                        key={actIdx}
                                        type="button"
                                        onClick={() => handleRelatedAction(act)}
                                        className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white transition-all duration-300 cursor-pointer shadow-xs group"
                                      >
                                        <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                                        <span>{act.title}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Follow-up Suggestion Chips */}
                              {Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && isLatestMentor && (
                                <div className="pt-2.5">
                                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                                    <Sparkles className="h-2.5 w-2.5 text-neutral-300" />
                                    <span>Follow-up Suggestions</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {msg.suggestions.map((suggestion, sIdx) => (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        disabled={isMentorTyping}
                                        onClick={() => handleSendMentorMessage(suggestion)}
                                        className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white transition-all duration-300 cursor-pointer text-left shadow-xs disabled:opacity-50 disabled:cursor-not-allowed group"
                                      >
                                        <span className="text-white">↳</span>
                                        <span>{suggestion}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {isMentorTyping && (
                        <div className="flex items-start gap-3.5 max-w-2xl mr-auto">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white shrink-0 mt-0.5">
                            <Bot className="h-4 w-4 animate-pulse text-white" />
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-neutral-400 pt-1.5">
                            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-duration:900ms]" />
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-duration:900ms] [animation-delay:200ms]" />
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-duration:900ms] [animation-delay:400ms]" />
                            </div>
                            <span className="text-xs text-neutral-400 font-mono">Technea AI is analyzing your code context…</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Bottom: Monospace Input Bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMentorMessage()
                      }}
                      className="pt-4 border-t border-white/[0.08] flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2.5 mt-4"
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
                          placeholder="Ask Technea AI anything... (e.g. debugging, system architecture, interview questions)"
                          className="w-full min-h-[44px] rounded-xl border border-white/[0.08] bg-black/60 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:outline-none transition-all duration-300 font-mono shadow-inner"
                          disabled={isMentorTyping}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!mentorInput.trim() || isMentorTyping}
                        className={`w-full min-[420px]:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold transition-all duration-300 shrink-0 cursor-pointer ${
                          mentorInput.trim() && !isMentorTyping
                            ? 'bg-white text-black hover:bg-neutral-200 shadow-[0_2px_12px_rgba(255,255,255,0.12)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]'
                            : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06] cursor-not-allowed'
                        }`}
                      >
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* ══════════════ TAB 6: ACHIEVEMENTS (LUXURY MONOCHROME MEDALLIONS) ══════════════ */}
                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Header Strip with XP summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-white" />
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            Developer Achievements & Mastery Medallions
                          </h2>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                            {unlockedAchievementsCount} / {achievementsList.length} Unlocked
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Verified proof of technical competence, consistency streaks, and engineering deliverables.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-white" />
                          <span className="text-xs font-mono font-bold text-white">
                            {unlockedAchievementsCount * 250} Achievement XP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 6 Luxury Monochrome Medallions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievementsList.map((ach) => (
                        <AchievementMedallion
                          key={ach.id}
                          title={ach.title}
                          description={ach.description}
                          icon={ach.icon}
                          isUnlocked={ach.isUnlocked}
                          unlockDate={ach.unlockDate}
                          progressText={ach.progressText}
                          progressPercent={ach.progressPercent}
                          rarity={ach.rarity}
                          xp={ach.xp}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ══════════════ TAB 7: PORTFOLIO (DEVELOPER IDENTITY & MASTERY) ══════════════ */}
                {(activeTab === 'portfolio' || activeTab === 'profile') && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Profile Header Identity Card with Level & XP Meter */}
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#050505]/95 backdrop-blur-3xl p-6 sm:p-7 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {user?.avatar_url && !profileAvatarError ? (
                            <img
                              src={getAvatarUrl(user.avatar_url)}
                              alt={fullName}
                              onError={() => setFailedProfileAvatarUrl(user?.avatar_url)}
                              className="h-14 w-14 rounded-2xl object-cover border border-white/10 shadow-inner shrink-0"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-bold text-white font-mono shadow-inner shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-white">{fullName}</h3>
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono font-medium text-neutral-300 uppercase tracking-wider">
                                {developerLevel}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-mono text-neutral-400">
                                Verified Developer
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate max-w-full">
                              {userEmail} • Technea Developer ID: #{user?.id ? String(user.id).slice(0, 8) : 'eng-core'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsShareModalOpen(true)}
                            className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-2 text-xs font-mono text-neutral-200 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer shadow-xs"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share Portfolio</span>
                          </button>
                        </div>
                      </div>

                      {/* Developer XP & Tier Progression Bar */}
                      <div className="pt-4 border-t border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-white" />
                            <span>Developer Level Progress</span>
                          </span>
                          <span className="text-white font-bold">
                            {xpPoints} / {nextLevelXp} XP ({Math.max(0, nextLevelXp - xpPoints)} XP to next tier)
                          </span>
                        </div>
                        <MinimalProgressBar percent={levelProgressPercent} height={4} />
                      </div>
                    </div>

                    {/* Developer Metrics Quick Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Milestones</span>
                        <div className="text-lg font-bold text-white font-mono">{completedMilestones}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Verified mastery</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Lessons</span>
                        <div className="text-lg font-bold text-white font-mono">{completedLessons}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Completed units</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Projects</span>
                        <div className="text-lg font-bold text-white font-mono">{completedProjectsCount}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">{activeProjectsCount} in progress</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Coding Streak</span>
                        <div className="text-lg font-bold text-white font-mono">{streakCount}d</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Active velocity</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Active Paths</span>
                        <div className="text-lg font-bold text-white font-mono">{currentPath ? 1 : 0}</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Enrolled curricula</span>
                      </div>
                      <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 space-y-1.5 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Medallions</span>
                        <div className="text-lg font-bold text-white font-mono">{unlockedAchievementsCount} / 6</div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Achievements</span>
                      </div>
                    </div>

                    {/* Verified Hands-on Engineering Projects Portfolio */}
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#050505]/95 backdrop-blur-3xl p-6 sm:p-7 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-2">
                          <FolderGit2 className="h-4 w-4 text-white" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                            Hands-On Engineering Projects & Deliverables
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('projects')}
                          className="min-h-[44px] sm:min-h-0 text-xs font-mono text-neutral-400 hover:text-white inline-flex items-center gap-1 cursor-pointer transition-colors"
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
                            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5 space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-white">
                                  No hands-on projects linked to your portfolio yet
                                </h5>
                                <p className="text-[11px] text-neutral-400 max-w-md">
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
                                  className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shrink-0 mt-3 sm:mt-0 shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
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
                                  className="rounded-xl border border-white/[0.08] bg-black/40 p-4.5 flex flex-col justify-between space-y-3 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300"
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <h5 className="text-xs font-bold text-white truncate">
                                        {proj.title}
                                      </h5>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-medium uppercase shrink-0 ${
                                          isComplete
                                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                            : 'bg-white/[0.03] border border-white/10 text-neutral-300'
                                        }`}
                                      >
                                        {isComplete ? '✓ Completed' : 'In Progress'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 line-clamp-2">
                                      {proj.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {(proj.tech_stack || []).map((tech) => (
                                        <span
                                          key={tech}
                                          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono text-neutral-300"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                                    <span className="text-[10px] text-neutral-400">
                                      {proj.difficulty} • +150 XP
                                    </span>

                                    {repoUrl ? (
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={repoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors"
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
                                          aria-label={`Update repository URL for ${proj.title}`}
                                          className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                          <Edit3 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingGithubProject(proj)
                                          setGithubUrlInput('')
                                        }}
                                        className="inline-flex min-h-[44px] sm:min-h-[32px] items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#050505]/95 backdrop-blur-3xl p-6 sm:p-7 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                          <Award className="h-4 w-4 text-white" />
                          Engineering Skill Mastery Breakdown
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Continuous Evaluation
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {skillsOverview.map((skill, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-2 hover:border-white/[0.18] hover:bg-black/60 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-white font-bold">
                                {skill.skill_name}
                              </span>
                              <span className="text-white font-bold">
                                {skill.mastery_percent}%
                              </span>
                            </div>
                            <MinimalProgressBar
                              percent={skill.mastery_percent}
                              height={3}
                              delay={0.05 * i}
                            />
                            <span className="text-[9px] font-mono text-neutral-400 block">
                              {skill.completed_milestones} milestones validated
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ══════════════ TAB 8: SETTINGS & ENVIRONMENT PREFERENCES ══════════════ */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#050505]/95 backdrop-blur-3xl p-6 sm:p-7 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">Developer Environment Settings</h3>
                          <p className="text-xs text-neutral-400 font-mono mt-0.5">
                            Configure telemetry, AI Mentor preferences, and account credentials.
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-950/20 px-3 py-1 text-xs font-mono text-emerald-400">
                          ● Environment Healthy
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-2">
                          <span className="text-xs font-bold text-white font-mono block">Account Profile</span>
                          <p className="text-xs text-neutral-300">Name: {fullName}</p>
                          <p className="text-xs text-neutral-400 font-mono">Email: {userEmail}</p>
                          <p className="text-xs text-neutral-400 font-mono">Tier: {developerLevel} ({xpPoints} XP)</p>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-2">
                          <span className="text-xs font-bold text-white font-mono block">AI Mentor 2.0 Engine</span>
                          <p className="text-xs text-neutral-300">Architecture: Intent Classification + Context Sync</p>
                          <p className="text-xs text-neutral-400 font-mono">Status: Connected to Gemini 2.5 Flash</p>
                          <button
                            type="button"
                            onClick={handleClearMentorChat}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset Mentor Context Cache</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setActiveTab('overview')}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-xs font-mono text-neutral-300 hover:text-white cursor-pointer transition-colors"
                        >
                          <ArrowRight className="h-3 w-3 rotate-180" />
                          <span>Return to Dashboard</span>
                        </button>

                        <button
                          type="button"
                          onClick={logout}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-2 text-xs font-mono text-red-300 hover:bg-red-900/30 cursor-pointer transition-colors"
                        >
                          <LogOut className="h-3 w-3" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>

          {/* 3. Right Column: Docked AI Mentor 2.0 Companion (320px) */}
          <div className="w-72 xl:w-80 shrink-0 border-l border-[#e2e8f0] bg-[#f8fafc] p-4 hidden lg:flex flex-col justify-between">
            <DockedAIMentorCompanion
              messages={mentorMessages}
              isMentorTyping={isMentorTyping}
              onSendMessage={handleSendMentorMessage}
              onResetSession={handleClearMentorChat}
            />
          </div>
        </div>

          {/* ══════════════ MODAL: LINK GITHUB REPOSITORY ══════════════ */}
          {editingGithubProject && (
            <div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Link GitHub Repository"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#050505]/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_32px_96px_rgba(0,0,0,0.85)] space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <GithubIcon className="h-4 w-4 text-white" />
                    <h4 className="text-sm font-bold text-white">Link GitHub Repository</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingGithubProject(null)}
                    className="flex min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06] cursor-pointer transition-all duration-300"
                    aria-label="Close dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-neutral-400">
                    Project:{' '}
                    <span className="text-white font-semibold">
                      {editingGithubProject.title}
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Connect your repository to showcase your code deliverables on your developer portfolio.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-neutral-400 block">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={githubUrlInput}
                    onChange={(e) => setGithubUrlInput(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full min-h-[44px] rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:outline-none font-mono transition-all duration-300 shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setEditingGithubProject(null)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveGithubUrl(editingGithubProject.id, githubUrlInput)
                    }
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                  >
                    Save to Portfolio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ MODAL: SHARE DEVELOPER PORTFOLIO ══════════════ */}
          {isShareModalOpen && (
            <div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Share Developer Portfolio"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <div className="relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#050505]/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_32px_96px_rgba(0,0,0,0.85)] space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-white" />
                    <h4 className="text-sm font-bold text-white">Share Developer Portfolio</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="flex min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06] cursor-pointer transition-all duration-300"
                    aria-label="Close share modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your verified engineering portfolio showcases your developer tier, completed milestones, and hands-on GitHub projects to engineering teams and recruiters.
                </p>

                {/* Live Portfolio Card Preview */}
                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user?.avatar_url && !shareAvatarError ? (
                        <img
                          src={getAvatarUrl(user.avatar_url)}
                          alt={fullName}
                          onError={() => setFailedShareAvatarUrl(user?.avatar_url)}
                          className="h-10 w-10 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold text-white font-mono shrink-0">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">{fullName}</span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono text-neutral-300">
                            {developerLevel}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400 truncate">
                          {xpPoints} XP • Verified Learner
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-300 border border-white/10 bg-white/[0.03] px-2.5 py-0.5 rounded-full">
                      Public Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center">
                    <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06]">
                      <span className="text-xs font-bold text-white font-mono block">
                        {completedMilestones}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">Milestones</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06]">
                      <span className="text-xs font-bold text-white font-mono block">
                        {completedProjectsCount}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">Projects</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06]">
                      <span className="text-xs font-bold text-white font-mono block">
                        {streakCount}d
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">Streak</span>
                    </div>
                  </div>
                </div>

                {/* Share Link Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 block">
                    Public Portfolio URL
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs font-mono text-neutral-300 truncate shadow-inner">
                      https://technea.dev/@{(firstName || 'developer').toLowerCase()}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleCopyProfileLink()
                        setCopiedLink(true)
                        setTimeout(() => setCopiedLink(false), 2000)
                      }}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-all duration-300 cursor-pointer shrink-0 shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                      aria-label={copiedLink ? "Public portfolio link copied" : "Copy public portfolio link"}
                    >
                      {copiedLink ? (
                        <>
                          <CheckCheck className="h-3.5 w-3.5 text-black" />
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

                <div className="flex justify-end pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] px-5 py-2 text-xs font-mono text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
