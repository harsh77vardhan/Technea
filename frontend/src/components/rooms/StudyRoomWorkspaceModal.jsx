import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Users,
  MessageSquare,
  HelpCircle,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Link as LinkIcon,
  FileDown,
  Clock,
  Send,
  Plus,
  Share2,
  Check,
  Lock,
  Globe,
  Radio,
  LogOut,
  ExternalLink,
  Bell,
  History,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Code,
  PenTool,
  Eraser,
  Download,
  Compass,
  ShieldCheck,
  Award,
  Crown,
  Copy,
} from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'
import {
  getAvatarUrl,
  getRoomMessagesApi,
  sendRoomMessageApi,
  getRoomQuestionsApi,
  createRoomQuestionApi,
  replyRoomQuestionApi,
  resolveRoomQuestionApi,
  getRoomResourcesApi,
  createRoomResourceApi,
  getRoomMembersApi,
  updateStudyStatusApi,
  startStudySessionApi,
  endStudySessionApi,
  toggleRoomJoinApi,
  getRoomSessionHistoryApi,
  getRoomSharedNotesApi,
  updateRoomSharedNotesApi,
  shareRoomContentApi,
  getRoomNotificationsApi,
  markRoomNotificationsReadApi,
  updateMemberRoleApi,
  getSyncContentApi,
  updateSyncContentApi,
  getCodeSnippetApi,
  updateCodeSnippetApi,
  getWhiteboardApi,
  updateWhiteboardApi,
  joinWebRTCCallApi,
  leaveWebRTCCallApi,
  updateWebRTCStatusApi,
  getWebRTCActivePeersApi,
} from '../../services/api'

export default function StudyRoomWorkspaceModal({
  room,
  user,
  isOpen,
  onClose,
  onRoomUpdated,
  activeRoadmap,
  continueLearningData,
}) {
  const { theme, showToast } = useDashboard()
  const isLight = theme === 'light'

  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'questions' | 'notes' | 'resources' | 'history' | 'members'
  const [roomOverride, setRoomOverride] = useState(null)
  const currentRoom = roomOverride || room

  // Chat State
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const chatScrollRef = useRef(null)

  // Questions State
  const [questions, setQuestions] = useState([])
  const [isAskingQuestion, setIsAskingQuestion] = useState(false)
  const [newQuestionTitle, setNewQuestionTitle] = useState('')
  const [newQuestionContent, setNewQuestionContent] = useState('')
  const [replyInputs, setReplyInputs] = useState({})
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)

  // Resources & Learning Content State
  const [resources, setResources] = useState([])
  const [resourceFilter, setResourceFilter] = useState('all') // 'all' | 'content' | 'video' | 'link' | 'note' | 'pdf'
  const [isSharingResource, setIsSharingResource] = useState(false)
  const [isSharingContent, setIsSharingContent] = useState(false)
  const [resTitle, setResTitle] = useState('')
  const [resType, setResType] = useState('link')
  const [resUrl, setResUrl] = useState('')
  const [resDesc, setResDesc] = useState('')
  const [isSubmittingResource, setIsSubmittingResource] = useState(false)

  // Technea Content Sharing state
  const [contentTitle, setContentTitle] = useState('')
  const [contentType, setContentType] = useState('lesson')
  const [contentBadge, setContentBadge] = useState('Lesson')
  const [contentDesc, setContentDesc] = useState('')
  const [contentUrl, setContentUrl] = useState('')
  const [isSubmittingContent, setIsSubmittingContent] = useState(false)

  // Members & Study Status State
  const [members, setMembers] = useState([])
  const [userStudyStatus, setUserStudyStatus] = useState('')
  const [userStudyState, setUserStudyState] = useState('studying') // 'studying' | 'break' | 'away'
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Shared Notes State
  const [sharedNotes, setSharedNotes] = useState('')
  const [notesMeta, setNotesMeta] = useState(null)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [notesSaveSuccess, setNotesSaveSuccess] = useState(false)
  const notesTextareaRef = useRef(null)

  // Session History State
  const [sessionHistory, setSessionHistory] = useState([])

  // Room Notifications State
  const [notifications, setNotifications] = useState([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  // Study Session & Pomodoro Timer State
  const [isStartingSession, setIsStartingSession] = useState(false)
  const [sessionTopic, setSessionTopic] = useState('')
  const [sessionTimerType, setSessionTimerType] = useState('pomodoro') // 'pomodoro' | 'stopwatch'
  const sessionDurationMinutes = 25
  const [isSubmittingSession, setIsSubmittingSession] = useState(false)

  // Focus Timer local running state
  const [pomodoroMode, setPomodoroMode] = useState('study') // 'study' (25m) | 'break' (5m)
  const [pomodoroSecsRemaining, setPomodoroSecsRemaining] = useState(25 * 60)
  const [pomodoroIsRunning, setPomodoroIsRunning] = useState(false)
  const [stopwatchSecs, setStopwatchSecs] = useState(0)

  // Invite code copy feedback
  const [copiedCode, setCopiedCode] = useState(false)

  // Derived unread count
  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Phase 3: WebRTC / Live Audio & Video
  const [isVoiceJoined, setIsVoiceJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [activePeers, setActivePeers] = useState([])
  const localStreamRef = useRef(null)
  const screenStreamRef = useRef(null)
  const localVideoRef = useRef(null)
  const screenVideoRef = useRef(null)

  // Phase 3: Synchronized Content
  const [syncContent, setSyncContent] = useState({
    sync_content_title: 'Python Concurrency & Asyncio Deep Dive',
    sync_content_url: 'https://www.youtube.com/watch?v=Xbl7XjFYsN4',
    sync_content_type: 'video',
    sync_is_playing: false,
    sync_playback_time: 0,
    sync_playback_speed: 1.0,
    host_name: '',
  })
  const [syncInputUrl, setSyncInputUrl] = useState('')
  const [syncInputTitle, setSyncInputTitle] = useState('')
  const [isUpdatingSync, setIsUpdatingSync] = useState(false)
  const [studyMode, setStudyMode] = useState('sync') // 'sync' | 'independent'

  // Phase 3: Collaborative Code Space
  const [codeContent, setCodeContent] = useState(
    '# Technea Collaborative Code Space\n# Practice DSA problems and review code together.\n\ndef two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nif __name__ == "__main__":\n    print("Two Sum Solution:", two_sum([2, 7, 11, 15], 9))\n'
  )
  const [codeLanguage, setCodeLanguage] = useState('python')
  const [codeTitle, setCodeTitle] = useState('DSA Practice: Two Sum')
  const [codeMeta, setCodeMeta] = useState(null)
  const [isSavingCode, setIsSavingCode] = useState(false)
  const [copiedCodeText, setCopiedCodeText] = useState(false)

  // Phase 3: Collaborative Whiteboard
  const [whiteboardTool, setWhiteboardTool] = useState('pen') // 'pen' | 'eraser'
  const [whiteboardColor, setWhiteboardColor] = useState('#e87a48')
  const [whiteboardSize, setWhiteboardSize] = useState(3)
  const [isSavingWhiteboard, setIsSavingWhiteboard] = useState(false)
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const [whiteboardMeta, setWhiteboardMeta] = useState(null)

  // Phase 3: Role Management
  const [isChangingRole, setIsChangingRole] = useState(false)

  // Helper to safely format timestamps
  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Derived user roles
  const currentMember = members.find((m) => String(m.user_id) === String(user?.id))
  const isRoomOwner =
    String(currentRoom?.created_by_id) === String(user?.id) ||
    currentMember?.role === 'owner' ||
    Boolean(currentRoom?.is_owner)
  const isHost = isRoomOwner || currentMember?.role === 'host'

  // Helper to re-fetch room data after actions
  const reloadRoomData = async () => {
    const targetId = currentRoom?.id
    if (!targetId) return
    try {
      const [msgs, qlist, rlist, mlist, noteRes, notifRes, histRes, syncRes, codeRes, wbRes, peersRes] = await Promise.all([
        getRoomMessagesApi(targetId).catch(() => []),
        getRoomQuestionsApi(targetId).catch(() => []),
        getRoomResourcesApi(targetId).catch(() => []),
        getRoomMembersApi(targetId).catch(() => []),
        getRoomSharedNotesApi(targetId).catch(() => null),
        getRoomNotificationsApi(targetId).catch(() => []),
        getRoomSessionHistoryApi(targetId).catch(() => []),
        getSyncContentApi(targetId).catch(() => null),
        getCodeSnippetApi(targetId).catch(() => null),
        getWhiteboardApi(targetId).catch(() => null),
        getWebRTCActivePeersApi(targetId).catch(() => []),
      ])

      setMessages(msgs || [])
      setQuestions(qlist || [])
      setResources(rlist || [])
      setMembers(mlist || [])
      setNotifications(notifRes || [])
      setSessionHistory(histRes || [])

      if (noteRes) {
        setSharedNotes(noteRes.content || '')
        setNotesMeta(noteRes)
      }
      if (syncRes) {
        setSyncContent(syncRes)
        if (syncRes.sync_content_url) setSyncInputUrl(syncRes.sync_content_url)
        if (syncRes.sync_content_title) setSyncInputTitle(syncRes.sync_content_title)
      }
      if (codeRes) {
        if (codeRes.code_content) setCodeContent(codeRes.code_content)
        if (codeRes.language) setCodeLanguage(codeRes.language)
        if (codeRes.title) setCodeTitle(codeRes.title)
        setCodeMeta(codeRes)
      }
      if (wbRes) {
        setWhiteboardMeta(wbRes)
      }
      if (Array.isArray(peersRes)) {
        setActivePeers(peersRes)
      }

      if (user?.id && Array.isArray(mlist)) {
        const myMembership = mlist.find((m) => String(m.user_id) === String(user.id))
        if (myMembership) {
          if (myMembership.study_status) setUserStudyStatus(myMembership.study_status)
          if (myMembership.study_state) setUserStudyState(myMembership.study_state)
        }
      }
    } catch {
      // Fallback gracefully
    }
  }

  // Initial load on mount or room change
  useEffect(() => {
    let isMounted = true
    const targetId = currentRoom?.id
    if (!isOpen || !targetId) return

    const loadData = async () => {
      try {
        const [msgs, qlist, rlist, mlist, noteRes, notifRes, histRes, syncRes, codeRes, wbRes, peersRes] = await Promise.all([
          getRoomMessagesApi(targetId).catch(() => []),
          getRoomQuestionsApi(targetId).catch(() => []),
          getRoomResourcesApi(targetId).catch(() => []),
          getRoomMembersApi(targetId).catch(() => []),
          getRoomSharedNotesApi(targetId).catch(() => null),
          getRoomNotificationsApi(targetId).catch(() => []),
          getRoomSessionHistoryApi(targetId).catch(() => []),
          getSyncContentApi(targetId).catch(() => null),
          getCodeSnippetApi(targetId).catch(() => null),
          getWhiteboardApi(targetId).catch(() => null),
          getWebRTCActivePeersApi(targetId).catch(() => []),
        ])

        if (isMounted) {
          setMessages(msgs || [])
          setQuestions(qlist || [])
          setResources(rlist || [])
          setMembers(mlist || [])
          setNotifications(notifRes || [])
          setSessionHistory(histRes || [])

          if (noteRes) {
            setSharedNotes(noteRes.content || '')
            setNotesMeta(noteRes)
          }
          if (syncRes) {
            setSyncContent(syncRes)
            if (syncRes.sync_content_url) setSyncInputUrl(syncRes.sync_content_url)
            if (syncRes.sync_content_title) setSyncInputTitle(syncRes.sync_content_title)
          }
          if (codeRes) {
            if (codeRes.code_content) setCodeContent(codeRes.code_content)
            if (codeRes.language) setCodeLanguage(codeRes.language)
            if (codeRes.title) setCodeTitle(codeRes.title)
            setCodeMeta(codeRes)
          }
          if (wbRes) {
            setWhiteboardMeta(wbRes)
          }
          if (Array.isArray(peersRes)) {
            setActivePeers(peersRes)
            const myPeer = peersRes.find((p) => p.user_id === user?.id)
            if (myPeer) {
              setIsVoiceJoined(true)
              setIsMuted(myPeer.is_muted)
              setIsVideoActive(myPeer.is_video_active)
              setIsScreenSharing(myPeer.is_screen_sharing)
            }
          }

          if (user?.id && Array.isArray(mlist)) {
            const myMembership = mlist.find((m) => String(m.user_id) === String(user.id))
            if (myMembership) {
              if (myMembership.study_status) setUserStudyStatus(myMembership.study_status)
              if (myMembership.study_state) setUserStudyState(myMembership.study_state)
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    loadData()

    // Poll notifications & members periodically
    const pollInterval = setInterval(() => {
      if (isMounted && targetId) {
        getRoomNotificationsApi(targetId)
          .then((data) => isMounted && setNotifications(data || []))
          .catch(() => {})
        getRoomMembersApi(targetId)
          .then((data) => isMounted && setMembers(data || []))
          .catch(() => {})
      }
    }, 12000)

    // Poll discussion chat messages in real time so new messages arrive automatically
    const chatPoll = setInterval(() => {
      if (isMounted && targetId) {
        getRoomMessagesApi(targetId)
          .then((data) => {
            if (isMounted && Array.isArray(data)) {
              setMessages((prev) => {
                if (
                  data.length !== prev.length ||
                  (data.length > 0 &&
                    prev.length > 0 &&
                    data[data.length - 1]?.id !== prev[prev.length - 1]?.id)
                ) {
                  return data
                }
                return prev
              })
            }
          })
          .catch(() => {})
      }
    }, 3500)

    // Poll sync content & voice peers for real-time coordination
    const syncPoll = setInterval(() => {
      if (isMounted && targetId) {
        getSyncContentApi(targetId)
          .then((data) => isMounted && data && setSyncContent((prev) => ({ ...prev, ...data })))
          .catch(() => {})
        getWebRTCActivePeersApi(targetId)
          .then((data) => isMounted && Array.isArray(data) && setActivePeers(data))
          .catch(() => {})
      }
    }, 4000)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
      clearInterval(chatPoll)
      clearInterval(syncPoll)
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
        screenStreamRef.current = null
      }
    }
  }, [isOpen, currentRoom?.id, user?.id])

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      const el = chatScrollRef.current
      requestAnimationFrame(() => {
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    }
  }, [messages, activeTab])

  // Refresh session history when history tab is clicked
  useEffect(() => {
    let isMounted = true
    if (activeTab === 'history' && currentRoom?.id) {
      getRoomSessionHistoryApi(currentRoom.id)
        .then((hist) => {
          if (isMounted) setSessionHistory(hist || [])
        })
        .catch(() => {})
    }
    return () => {
      isMounted = false
    }
  }, [activeTab, currentRoom?.id])

  // Sync Focus Timer when room session status changes
  useEffect(() => {
    const isSessionActive = Boolean(currentRoom?.study_session_active && currentRoom?.study_session_started_at)
    if (!isSessionActive) {
      const timeout = setTimeout(() => {
        setPomodoroIsRunning(false)
        setStopwatchSecs(0)
      }, 0)
      return () => clearTimeout(timeout)
    }

    const timerType = currentRoom?.study_session_timer_type || 'pomodoro'
    const timerMode = currentRoom?.study_session_timer_mode || 'study'
    const startedAtRaw = currentRoom.study_session_started_at
    const normalizedStartedAt =
      typeof startedAtRaw === 'string' &&
      startedAtRaw.includes('T') &&
      !startedAtRaw.endsWith('Z') &&
      !/[+-]\d{2}:\d{2}$/.test(startedAtRaw)
        ? `${startedAtRaw}Z`
        : startedAtRaw
    const parsedDate = new Date(normalizedStartedAt)
    const startMs = parsedDate.getTime()
    const targetDurationSecs =
      (currentRoom.study_session_duration_minutes || (timerMode === 'break' ? 5 : 25)) * 60

    const syncTick = () => {
      setPomodoroMode(timerMode)
      const nowMs = Date.now()
      const elapsedSecs = Math.max(0, Math.floor((nowMs - (isNaN(startMs) ? nowMs : startMs)) / 1000))

      if (timerType === 'stopwatch') {
        setStopwatchSecs(elapsedSecs)
        setPomodoroIsRunning(true)
      } else {
        const remaining = Math.max(0, targetDurationSecs - elapsedSecs)
        setPomodoroSecsRemaining(remaining)
        setPomodoroIsRunning(remaining > 0)
      }
    }

    const timeout = setTimeout(syncTick, 0)
    return () => clearTimeout(timeout)
  }, [
    currentRoom?.study_session_active,
    currentRoom?.study_session_started_at,
    currentRoom?.study_session_timer_type,
    currentRoom?.study_session_timer_mode,
    currentRoom?.study_session_duration_minutes,
  ])

  // Focus Timer interval ticker
  useEffect(() => {
    if (!pomodoroIsRunning) return

    const interval = setInterval(() => {
      if (currentRoom?.study_session_timer_type === 'stopwatch') {
        setStopwatchSecs((prev) => prev + 1)
      } else {
        setPomodoroSecsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setPomodoroIsRunning(false)
            showToast?.(
              pomodoroMode === 'study'
                ? '🎉 25-minute study sprint complete! Time for a well-deserved break.'
                : '⚡ Break concluded! Ready to resume learning.'
            )
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [pomodoroIsRunning, currentRoom?.study_session_timer_type, pomodoroMode, showToast])

  // Format time helpers
  const formatPomodoro = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const formatStopwatch = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0')
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  // Handle Send Chat Message
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!newMessage.trim() || isSendingMessage) return

    const content = newMessage.trim()
    setNewMessage('')
    setIsSendingMessage(true)

    try {
      const msg = await sendRoomMessageApi(currentRoom.id, content)
      setMessages((prev) => [...prev, msg])
    } catch (err) {
      showToast?.(err?.message || 'Failed to send message.')
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Handle Ask Question
  const handleCreateQuestion = async (e) => {
    e?.preventDefault()
    if (!newQuestionTitle.trim() || !newQuestionContent.trim() || isSubmittingQuestion) return

    setIsSubmittingQuestion(true)
    try {
      const newQ = await createRoomQuestionApi(currentRoom.id, {
        title: newQuestionTitle.trim(),
        content: newQuestionContent.trim(),
      })
      setQuestions((prev) => [newQ, ...prev])
      setNewQuestionTitle('')
      setNewQuestionContent('')
      setIsAskingQuestion(false)
      showToast?.('Question posted to study room.')
    } catch (err) {
      showToast?.(err?.message || 'Failed to post question.')
    } finally {
      setIsSubmittingQuestion(false)
    }
  }

  // Handle Reply to Question
  const handleReplyQuestion = async (questionId) => {
    const text = replyInputs[questionId]?.trim()
    if (!text) return

    try {
      const newReply = await replyRoomQuestionApi(currentRoom.id, questionId, text)
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              replies_count: (q.replies_count || 0) + 1,
              replies: [...(q.replies || []), newReply],
            }
          }
          return q
        })
      )
      setReplyInputs((prev) => ({ ...prev, [questionId]: '' }))
      showToast?.('Reply posted.')
    } catch (err) {
      showToast?.(err?.message || 'Failed to post reply.')
    }
  }

  // Handle Resolve Question
  const handleResolveQuestion = async (questionId) => {
    try {
      const updated = await resolveRoomQuestionApi(currentRoom.id, questionId)
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)))
      showToast?.(updated.is_resolved ? 'Question marked as resolved!' : 'Question reopened.')
    } catch (err) {
      showToast?.(err?.message || 'Failed to update question status.')
    }
  }

  // Handle Share Generic Resource
  const handleCreateResource = async (e) => {
    e?.preventDefault()
    if (!resTitle.trim() || !resUrl.trim() || isSubmittingResource) return

    setIsSubmittingResource(true)
    try {
      const newRes = await createRoomResourceApi(currentRoom.id, {
        title: resTitle.trim(),
        resource_type: resType,
        url_or_content: resUrl.trim(),
        description: resDesc.trim() || null,
      })
      setResources((prev) => [newRes, ...prev])
      setResTitle('')
      setResUrl('')
      setResDesc('')
      setIsSharingResource(false)
      showToast?.('Resource shared with the room!')
    } catch (err) {
      showToast?.(err?.message || 'Failed to share resource.')
    } finally {
      setIsSubmittingResource(false)
    }
  }

  // Handle Share Technea Content (Course / Lesson / Roadmap Step)
  const handleShareTechneaContent = async (e) => {
    e?.preventDefault()
    if (!contentTitle.trim() || isSubmittingContent) return

    setIsSubmittingContent(true)
    try {
      const newContent = await shareRoomContentApi(currentRoom.id, {
        title: contentTitle.trim(),
        content_type: contentType,
        content_badge: contentBadge || 'Lesson',
        description: contentDesc.trim() || `Technea ${contentBadge || 'Learning Module'}`,
        action_url: contentUrl.trim() || '/dashboard',
      })
      setResources((prev) => [newContent, ...prev])
      setContentTitle('')
      setContentDesc('')
      setContentUrl('')
      setIsSharingContent(false)
      showToast?.(`Shared ${contentBadge || 'Content'} with room!`)
      reloadRoomData()
    } catch (err) {
      showToast?.(err?.message || 'Failed to share content.')
    } finally {
      setIsSubmittingContent(false)
    }
  }

  // 1-Click Prefills for Technea Content Sharing
  const prefillCurrentLesson = () => {
    const lessonTitle =
      continueLearningData?.step_title ||
      continueLearningData?.milestone_title ||
      continueLearningData?.lesson_title ||
      'Interactive Learning Module'
    setContentTitle(lessonTitle)
    setContentType('lesson')
    setContentBadge('Lesson')
    setContentDesc(`From ${activeRoadmap?.title || 'Current Learning Milestone'}`)
    setContentUrl('/learning')
  }

  const prefillActiveRoadmap = () => {
    const roadmapTitle = activeRoadmap?.title || 'Full Stack Roadmap'
    setContentTitle(roadmapTitle)
    setContentType('roadmap_step')
    setContentBadge('Roadmap step')
    setContentDesc(activeRoadmap?.description || 'Active roadmap path on Technea')
    setContentUrl('/dashboard')
  }

  // Handle Save Shared Notes
  const handleSaveNotes = async () => {
    if (isSavingNotes) return
    setIsSavingNotes(true)
    try {
      const updated = await updateRoomSharedNotesApi(currentRoom.id, { content: sharedNotes })
      setNotesMeta(updated)
      setNotesSaveSuccess(true)
      setTimeout(() => setNotesSaveSuccess(false), 2500)
      showToast?.('Shared notes saved.')
    } catch (err) {
      showToast?.(err?.message || 'Failed to save notes.')
    } finally {
      setIsSavingNotes(false)
    }
  }

  // Insert markdown helpers into shared notes
  const insertMarkdownSnippet = (prefix, suffix = '') => {
    const textarea = notesTextareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = sharedNotes.substring(start, end)
    const replacement = `${prefix}${selected || 'text'}${suffix}`
    const updated = sharedNotes.substring(0, start) + replacement + sharedNotes.substring(end)
    setSharedNotes(updated)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4))
    }, 10)
  }

  // Handle Update Study Status & Presence
  const handleUpdateStatusAndPresence = async (e) => {
    e?.preventDefault()
    if (isUpdatingStatus) return

    setIsUpdatingStatus(true)
    try {
      await updateStudyStatusApi(currentRoom.id, {
        study_status: userStudyStatus.trim() || 'Studying with peers',
        study_state: userStudyState,
      })
      showToast?.('Study status & presence updated!')
      reloadRoomData()
    } catch (err) {
      showToast?.(err?.message || 'Failed to update study status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle Start Study Session
  const handleStartSession = async (e) => {
    e?.preventDefault()
    if (!sessionTopic.trim() || isSubmittingSession) return

    setIsSubmittingSession(true)
    try {
      const updated = await startStudySessionApi(currentRoom.id, {
        topic: sessionTopic.trim(),
        timer_type: sessionTimerType,
        timer_mode: 'study',
        duration_minutes: sessionTimerType === 'pomodoro' ? sessionDurationMinutes : 45,
      })
      setRoomOverride(updated)
      onRoomUpdated?.(updated)
      setIsStartingSession(false)
      setSessionTopic('')
      showToast?.('Study session started! Focus timer running.')
      reloadRoomData()
    } catch (err) {
      showToast?.(err?.message || 'Failed to start study session.')
    } finally {
      setIsSubmittingSession(false)
    }
  }

  // Handle End Study Session
  const handleEndSession = async () => {
    try {
      const updated = await endStudySessionApi(currentRoom.id)
      setRoomOverride(updated)
      setPomodoroIsRunning(false)
      onRoomUpdated?.(updated)
      showToast?.('Study session ended and logged to Session History.')
      reloadRoomData()
    } catch (err) {
      showToast?.(err?.message || 'Failed to end study session.')
    }
  }

  // Pomodoro local controls
  const togglePomodoroMode = (mode) => {
    setPomodoroMode(mode)
    const newSecs = mode === 'study' ? 25 * 60 : 5 * 60
    setPomodoroSecsRemaining(newSecs)
    setPomodoroIsRunning(false)
  }

  const resetPomodoro = () => {
    const newSecs = pomodoroMode === 'study' ? 25 * 60 : 5 * 60
    setPomodoroSecsRemaining(newSecs)
    setPomodoroIsRunning(false)
  }

  // Mark all notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      await markRoomNotificationsReadApi(currentRoom.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      showToast?.('All notifications marked as read.')
    } catch {
      // Fallback
    }
  }

  // Copy Invite Code or Link
  const handleCopyInvite = () => {
    const code = currentRoom.invite_code || currentRoom.slug
    const textToCopy = code.startsWith('TECH-') ? code : `${window.location.origin}/rooms/${code}`
    navigator.clipboard?.writeText(textToCopy)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2200)
    showToast?.(`Invite code ${code} copied to clipboard!`)
  }

  // Handle Leave Room
  const handleLeaveRoom = async () => {
    if (!window.confirm(`Are you sure you want to leave ${currentRoom.name}?`)) return
    try {
      await toggleRoomJoinApi(currentRoom.id)
      showToast?.(`You left ${currentRoom.name}.`)
      onRoomUpdated?.({ ...currentRoom, is_joined: false })
      onClose()
    } catch (err) {
      showToast?.(err?.message || 'Failed to leave room.')
    }
  }

  // ==========================================
  // Phase 3: Advanced Collaborative Helpers
  // ==========================================

  const CODE_PRESETS = [
    {
      title: 'Two Sum (Hash Map)',
      language: 'python',
      code: `def two_sum(nums: list[int], target: int) -> list[int]:
    """Find two indices whose values add up to target."""
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []

if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    print("Result:", two_sum(nums, target))  # [0, 1]
`,
    },
    {
      title: 'Binary Search (Iterative)',
      language: 'python',
      code: `def binary_search(arr: list[int], target: int) -> int:
    """Standard iterative binary search (O(log n))."""
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

if __name__ == "__main__":
    print(binary_search([1, 3, 5, 7, 9, 11], 7))  # 3
`,
    },
    {
      title: 'Reverse Linked List',
      language: 'python',
      code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head: ListNode | None) -> ListNode | None:
    """Reverse a singly linked list in-place (O(n) time, O(1) space)."""
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev
`,
    },
    {
      title: 'React Custom Hook (TypeScript)',
      language: 'typescript',
      code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debounced;
}
`,
    },
    {
      title: 'FastAPI Async Endpoint',
      language: 'python',
      code: `from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(prefix="/v1/study", tags=["Study"])

class GoalRequest(BaseModel):
    goal_name: str
    target_hours: int = 10

@router.post("/goal", status_code=status.HTTP_201_CREATED)
async def create_goal(payload: GoalRequest):
    return {"status": "success", "goal": payload.goal_name}
`,
    },
  ]

  const getEmbedUrl = (url) => {
    if (!url) return null
    if (url.includes('youtube.com/watch?v=')) {
      const vid = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${vid}?enablejsapi=1`
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${vid}?enablejsapi=1`
    }
    return url
  }

  // WebRTC / Voice & Video Handlers
  const handleJoinVoice = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          localStreamRef.current = stream
        } catch (err) {
          console.warn('Microphone permission not granted:', err)
          showToast?.('Microphone not detected or permission denied. Joined in listening mode.')
        }
      }
      const peer = await joinWebRTCCallApi(currentRoom.id)
      setIsVoiceJoined(true)
      setIsMuted(false)
      setActivePeers((prev) => {
        const without = prev.filter((p) => p.user_id !== user?.id)
        return [...without, peer]
      })
      showToast?.('Connected to Live Audio Room.')
    } catch (err) {
      showToast?.(err?.message || 'Failed to connect to voice room.')
    }
  }

  const handleLeaveVoice = async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
        screenStreamRef.current = null
      }
      await leaveWebRTCCallApi(currentRoom.id)
      setIsVoiceJoined(false)
      setIsMuted(true)
      setIsVideoActive(false)
      setIsScreenSharing(false)
      setActivePeers((prev) => prev.filter((p) => p.user_id !== user?.id))
      showToast?.('Disconnected from Voice Room.')
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleMute = async () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextMuted
      })
    }
    await updateWebRTCStatusApi(currentRoom.id, {
      is_audio_active: true,
      is_muted: nextMuted,
      is_video_active: isVideoActive,
      is_screen_sharing: isScreenSharing,
    }).catch(() => {})
    setActivePeers((prev) =>
      prev.map((p) => (p.user_id === user?.id ? { ...p, is_muted: nextMuted } : p))
    )
  }

  const handleToggleCamera = async () => {
    const nextVideo = !isVideoActive
    try {
      if (nextVideo) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMuted })
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        setIsVideoActive(true)
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach((t) => t.stop())
        }
        setIsVideoActive(false)
      }
      await updateWebRTCStatusApi(currentRoom.id, {
        is_audio_active: true,
        is_muted: isMuted,
        is_video_active: nextVideo,
        is_screen_sharing: isScreenSharing,
      }).catch(() => {})
      setActivePeers((prev) =>
        prev.map((p) => (p.user_id === user?.id ? { ...p, is_video_active: nextVideo } : p))
      )
    } catch {
      showToast?.('Camera device unavailable or permission denied.')
    }
  }

  const handleToggleScreenShare = async () => {
    const nextScreen = !isScreenSharing
    try {
      if (nextScreen) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = stream
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream
        }
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          updateWebRTCStatusApi(currentRoom.id, {
            is_audio_active: isVoiceJoined,
            is_muted: isMuted,
            is_video_active: isVideoActive,
            is_screen_sharing: false,
          }).catch(() => {})
          setActivePeers((prev) =>
            prev.map((p) => (p.user_id === user?.id ? { ...p, is_screen_sharing: false } : p))
          )
        }
        setIsScreenSharing(true)
      } else {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((t) => t.stop())
          screenStreamRef.current = null
        }
        setIsScreenSharing(false)
      }
      await updateWebRTCStatusApi(currentRoom.id, {
        is_audio_active: isVoiceJoined,
        is_muted: isMuted,
        is_video_active: isVideoActive,
        is_screen_sharing: nextScreen,
      }).catch(() => {})
      setActivePeers((prev) =>
        prev.map((p) => (p.user_id === user?.id ? { ...p, is_screen_sharing: nextScreen } : p))
      )
    } catch (err) {
      console.warn('Screen share cancelled:', err)
    }
  }

  // Synchronized Content Playback Handlers
  const handleUpdateSyncState = async (updates) => {
    setIsUpdatingSync(true)
    try {
      const next = { ...syncContent, ...updates }
      const res = await updateSyncContentApi(currentRoom.id, {
        title: next.sync_content_title,
        url: next.sync_content_url,
        content_type: next.sync_content_type,
        is_playing: next.sync_is_playing,
        playback_time: next.sync_playback_time,
        playback_speed: next.sync_playback_speed,
      })
      setSyncContent(res)
    } catch {
      showToast?.('Failed to update sync playback.')
    } finally {
      setIsUpdatingSync(false)
    }
  }

  const handleSaveSyncUrl = async (e) => {
    e?.preventDefault()
    if (!syncInputUrl.trim()) return
    await handleUpdateSyncState({
      sync_content_url: syncInputUrl.trim(),
      sync_content_title: syncInputTitle.trim() || 'Synchronized Learning Video',
      sync_playback_time: 0,
      sync_is_playing: true,
    })
    showToast?.('Updated synchronized room content.')
  }

  // Code Space Handlers
  const handleSaveCode = async () => {
    setIsSavingCode(true)
    try {
      const res = await updateCodeSnippetApi(currentRoom.id, {
        code_content: codeContent,
        language: codeLanguage,
        title: codeTitle,
      })
      setCodeMeta(res)
      showToast?.('Collaborative code snippet saved.')
    } catch (err) {
      showToast?.(err?.message || 'Failed to save code snippet.')
    } finally {
      setIsSavingCode(false)
    }
  }

  const handleCopyCode = () => {
    if (!codeContent) return
    navigator.clipboard?.writeText(codeContent)
    setCopiedCodeText(true)
    setTimeout(() => setCopiedCodeText(false), 2000)
    showToast?.('Code snippet copied to clipboard.')
  }

  const handlePresetSelect = (preset) => {
    setCodeTitle(preset.title)
    setCodeLanguage(preset.language)
    setCodeContent(preset.code)
  }

  // Whiteboard Canvas Handlers
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const handleStartDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    isDrawingRef.current = true
    const { x, y } = getCanvasCoords(e)
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleDraw = (e) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getCanvasCoords(e)

    ctx.lineWidth = whiteboardSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (whiteboardTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = whiteboardColor
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handleStopDrawing = () => {
    isDrawingRef.current = false
  }

  const handleClearWhiteboard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleExportWhiteboard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${currentRoom.name.replace(/\s+/g, '_')}_whiteboard.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleSaveWhiteboard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsSavingWhiteboard(true)
    try {
      const dataUrl = canvas.toDataURL('image/png')
      const res = await updateWhiteboardApi(currentRoom.id, { whiteboard_data: dataUrl })
      setWhiteboardMeta(res)
      showToast?.('Whiteboard saved.')
    } catch (err) {
      showToast?.(err?.message || 'Failed to save whiteboard.')
    } finally {
      setIsSavingWhiteboard(false)
    }
  }

  // Draw saved whiteboard onto canvas when tab opens
  useEffect(() => {
    if (activeTab === 'whiteboard' && canvasRef.current && whiteboardMeta?.whiteboard_data) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = whiteboardMeta.whiteboard_data
    }
  }, [activeTab, whiteboardMeta?.whiteboard_data])

  // Member Role Management Handler
  const handleUpdateMemberRole = async (targetUserId, newRole) => {
    setIsChangingRole(true)
    try {
      const res = await updateMemberRoleApi(currentRoom.id, targetUserId, newRole)
      setMembers((prev) =>
        prev.map((m) => (m.user_id === targetUserId ? { ...m, role: res.role } : m))
      )
      showToast?.(`Role updated to ${newRole.toUpperCase()}.`)
    } catch (err) {
      showToast?.(err?.message || 'Failed to update role.')
    } finally {
      setIsChangingRole(false)
    }
  }

  if (!isOpen || !currentRoom) return null

  // Filtered resources
  const filteredResources =
    resourceFilter === 'all'
      ? resources
      : resourceFilter === 'content'
      ? resources.filter((r) => Boolean(r.content_badge))
      : resources.filter((r) => r.resource_type === resourceFilter)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-xs"
        />

        {/* Full Workspace Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22 }}
          className={`relative w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden z-10 transition-colors duration-200 ${
            isLight
              ? 'bg-[#f0e9dc] border-[#ded4be] text-[#181614]'
              : 'bg-[#141312] border-[#262320] text-[#faf6ee]'
          }`}
        >
          {/* ──────────────── 1. WORKSPACE HEADER ──────────────── */}
          <header
            className={`shrink-0 px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 relative ${
              isLight ? 'border-[#ded4be] bg-[#f7f2e8]' : 'border-[#262320] bg-[#171514]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                  isLight
                    ? 'border-[#ded4be] bg-[#faf6ee] text-[#7a7268] hover:text-[#181614]'
                    : 'border-[#262320] bg-[#1a1816] text-[#a8a199] hover:text-[#faf6ee]'
                }`}
                title="Return to Study Rooms"
              >
                <span>← Back</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight truncate">
                    {currentRoom.name}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                      currentRoom.is_private
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-[#c25e2e]/30 bg-[#c25e2e]/10 text-[#e87a48]'
                    }`}
                  >
                    {currentRoom.is_private ? (
                      <>
                        <Lock className="h-3 w-3" />
                        <span>Private</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3" />
                        <span>Public</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs opacity-75 mt-0.5">
                  <span className="font-medium text-[#e87a48]">{currentRoom.topic}</span>
                  {currentRoom.roadmap_name && (
                    <>
                      <span>•</span>
                      <span className="truncate">{currentRoom.roadmap_name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{members.length || currentRoom.active_learners_count} members</span>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Copy Invite Code */}
              {currentRoom.invite_code && (
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedCode
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : isLight
                      ? 'border-[#ded4be] bg-[#faf6ee] text-[#7a7268] hover:border-[#c25e2e]'
                      : 'border-[#262320] bg-[#1a1816] text-[#a8a199] hover:border-[#c25e2e]'
                  }`}
                  title="Copy room invite code"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{currentRoom.invite_code}</span>
                </button>
              )}

              {/* Feature 8: Room Notifications Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2 rounded-xl border text-xs relative transition-colors cursor-pointer ${
                    isNotificationsOpen
                      ? 'border-[#c25e2e] text-[#e87a48] bg-[#c25e2e]/10'
                      : isLight
                      ? 'border-[#ded4be] hover:bg-black/5 text-[#7a7268]'
                      : 'border-[#262320] hover:bg-white/5 text-[#a8a199]'
                  }`}
                  title="Room Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#c25e2e] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Floating Dropdown */}
                {isNotificationsOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-80 max-h-96 rounded-xl border shadow-xl z-50 flex flex-col overflow-hidden backdrop-blur-md ${
                      isLight
                        ? 'bg-[#faf6ee]/95 border-[#ded4be] text-[#181614]'
                        : 'bg-[#181614]/95 border-[#262320] text-[#faf6ee]'
                    }`}
                  >
                    <div className="p-3 border-b border-inherit flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Bell className="h-3.5 w-3.5 text-[#e87a48]" />
                        <span className="text-xs font-bold">Room Activity</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkNotificationsRead}
                          className="text-[11px] font-semibold text-[#e87a48] hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-72 p-2 space-y-1.5 divide-y divide-inherit">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center opacity-60 text-xs">
                          No notifications in this room yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-lg text-xs transition-colors ${
                              !notif.is_read
                                ? isLight
                                  ? 'bg-[#c25e2e]/8 font-medium'
                                  : 'bg-[#c25e2e]/12 font-medium'
                                : 'opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-semibold text-[11px] text-[#e87a48] truncate">
                                {notif.title}
                              </span>
                              <span className="text-[10px] opacity-60 shrink-0">
                                {new Date(notif.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] opacity-90 leading-snug">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Leave Room Button */}
              <button
                type="button"
                onClick={handleLeaveRoom}
                className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                  isLight
                    ? 'border-[#ded4be] hover:bg-red-500/10 hover:text-red-600 text-[#7a7268]'
                    : 'border-[#262320] hover:bg-red-500/10 hover:text-red-400 text-[#a8a199]'
                }`}
                title="Leave Study Room"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Close Modal */}
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-black/5 text-[#7a7268]' : 'hover:bg-white/5 text-[#a8a199]'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* ──────────────── 2. LIVE STUDY SESSION & FOCUS TIMER BAR (Features 1 & 3) ──────────────── */}
          <div
            className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
              currentRoom.study_session_active
                ? 'bg-[#c25e2e]/12 border-[#c25e2e]/30 text-[#e87a48]'
                : isLight
                ? 'bg-[#eadecc]/40 border-[#ded4be] text-[#7a7268]'
                : 'bg-[#1b1917] border-[#262320] text-[#a8a199]'
            }`}
          >
            {/* Left: Session Status & Host Info */}
            <div className="flex flex-wrap items-center gap-3">
              {currentRoom.study_session_active ? (
                <>
                  <div className="flex items-center gap-2 font-bold text-[#e87a48]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e87a48] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e87a48]"></span>
                    </span>
                    <span className="tracking-wide">LIVE SESSION</span>
                  </div>

                  <span className="opacity-40">•</span>

                  <span className="font-semibold text-inherit">
                    {currentRoom.study_session_host_name || 'Host'} is hosting
                  </span>

                  <span className="opacity-40">•</span>

                  <span className="font-medium text-inherit truncate max-w-xs sm:max-w-md">
                    Goal: {currentRoom.study_session_topic || 'Deep Work Sprint'}
                  </span>

                  <span className="opacity-40">•</span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {members.filter((m) => m.study_state === 'studying').length || members.length} studying
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#e87a48]" />
                  <span>No active study session right now. Start one to focus with room peers.</span>
                </div>
              )}
            </div>

            {/* Right: Focus Pomodoro Timer Controls & Session Trigger */}
            <div className="flex items-center gap-2">
              {currentRoom.study_session_active ? (
                <div className="flex items-center gap-2">
                  {/* Timer Mode Switcher (25m Study / 5m Break) */}
                  <div
                    className={`inline-flex items-center p-0.5 rounded-lg border text-[11px] ${
                      isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#141312]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => togglePomodoroMode('study')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        pomodoroMode === 'study'
                          ? 'bg-[#c25e2e] text-white'
                          : isLight
                          ? 'text-[#7a7268] hover:text-[#181614]'
                          : 'text-[#a8a199] hover:text-[#faf6ee]'
                      }`}
                    >
                      25m Study
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePomodoroMode('break')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        pomodoroMode === 'break'
                          ? 'bg-amber-500 text-white'
                          : isLight
                          ? 'text-[#7a7268] hover:text-[#181614]'
                          : 'text-[#a8a199] hover:text-[#faf6ee]'
                      }`}
                    >
                      5m Break
                    </button>
                  </div>

                  {/* Timer Display */}
                  <span className="font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-black/25 text-[#faf6ee] text-xs">
                    {currentRoom.study_session_timer_type === 'stopwatch'
                      ? formatStopwatch(stopwatchSecs)
                      : formatPomodoro(pomodoroSecsRemaining)}
                  </span>

                  {/* Play / Pause Toggle */}
                  <button
                    type="button"
                    onClick={() => setPomodoroIsRunning(!pomodoroIsRunning)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      isLight
                        ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] hover:border-[#c25e2e]'
                        : 'border-[#262320] bg-[#141312] text-[#faf6ee] hover:border-[#c25e2e]'
                    }`}
                    title={pomodoroIsRunning ? 'Pause Focus Timer' : 'Resume Focus Timer'}
                  >
                    {pomodoroIsRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>

                  {/* Reset Timer */}
                  <button
                    type="button"
                    onClick={resetPomodoro}
                    className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      isLight
                        ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] hover:border-[#c25e2e]'
                        : 'border-[#262320] bg-[#141312] text-[#faf6ee] hover:border-[#c25e2e]'
                    }`}
                    title="Reset Timer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>

                  {/* End Session Button */}
                  <button
                    type="button"
                    onClick={handleEndSession}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-colors cursor-pointer"
                  >
                    End Session
                  </button>
                </div>
              ) : isStartingSession ? (
                /* Start Session Form */
                <form onSubmit={handleStartSession} className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="Focus goal (e.g. Complete Functions Module)"
                    autoFocus
                    required
                    className={`px-2.5 py-1 rounded-lg border text-xs outline-hidden min-w-[200px] ${
                      isLight
                        ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614]'
                        : 'border-[#262320] bg-[#141312] text-[#faf6ee]'
                    }`}
                  />

                  <select
                    value={sessionTimerType}
                    onChange={(e) => setSessionTimerType(e.target.value)}
                    className={`px-2 py-1 rounded-lg border text-xs outline-hidden ${
                      isLight
                        ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614]'
                        : 'border-[#262320] bg-[#141312] text-[#faf6ee]'
                    }`}
                  >
                    <option value="pomodoro">Pomodoro (25m)</option>
                    <option value="stopwatch">Open Stopwatch</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isSubmittingSession}
                    className="px-3 py-1 rounded-lg font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingSession ? 'Starting...' : 'Start'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsStartingSession(false)}
                    className="px-2 py-1 opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsStartingSession(true)}
                  className={`px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isLight
                      ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] hover:border-[#c25e2e]'
                      : 'border-[#262320] bg-[#141312] text-[#faf6ee] hover:border-[#c25e2e]'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5 text-[#e87a48]" />
                  <span>Start Study Session</span>
                </button>
              )}
            </div>
          </div>

          {/* ──────────────── 2.5 LIVE AUDIO & VIDEO BAR ──────────────── */}
          <div
            className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs transition-colors shrink-0 ${
              isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
            }`}
          >
            {/* Left: Live Audio / Voice Connection Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {!isVoiceJoined ? (
                <button
                  type="button"
                  onClick={handleJoinVoice}
                  className="px-3.5 py-1.5 rounded-xl font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white flex items-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.02]"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Join Voice</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Voice Connected</span>
                  </div>

                  {/* Mic Mute / Unmute Button */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      isMuted
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                        : isLight
                        ? 'border-[#ded4be] bg-white text-emerald-600 hover:border-[#c25e2e]'
                        : 'border-[#262320] bg-[#141312] text-emerald-400 hover:border-[#c25e2e]'
                    }`}
                    title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </button>

                  {/* Camera On / Off Button */}
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      isVideoActive
                        ? 'border-[#e87a48]/40 bg-[#e87a48]/15 text-[#e87a48]'
                        : isLight
                        ? 'border-[#ded4be] bg-white text-[#7a7268] hover:border-[#c25e2e]'
                        : 'border-[#262320] bg-[#141312] text-[#a8a199] hover:border-[#c25e2e]'
                    }`}
                    title={isVideoActive ? 'Turn Camera Off' : 'Turn Camera On'}
                  >
                    {isVideoActive ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                  </button>

                  {/* Screen Share Button */}
                  <button
                    type="button"
                    onClick={handleToggleScreenShare}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      isScreenSharing
                        ? 'border-sky-500/40 bg-sky-500/15 text-sky-400'
                        : isLight
                        ? 'border-[#ded4be] bg-white text-[#7a7268] hover:border-[#c25e2e]'
                        : 'border-[#262320] bg-[#141312] text-[#a8a199] hover:border-[#c25e2e]'
                    }`}
                    title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
                  >
                    {isScreenSharing ? <Monitor className="h-3.5 w-3.5" /> : <MonitorOff className="h-3.5 w-3.5" />}
                  </button>

                  {/* Leave Voice Button */}
                  <button
                    type="button"
                    onClick={handleLeaveVoice}
                    className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15 cursor-pointer transition-colors"
                    title="Leave Voice Room"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Small Participant Voice Indicators (Harsh 🎤, Rahul 🎤, Aman muted) */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-inherit overflow-x-auto no-scrollbar max-w-xs sm:max-w-md">
                {activePeers.length === 0 ? (
                  <span className="text-[11px] opacity-60 italic">Voice channel idle</span>
                ) : (
                  activePeers.map((p) => {
                    const isMe = p.user_id === user?.id
                    return (
                      <span
                        key={p.user_id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          !p.is_muted
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : isLight
                            ? 'border-[#ded4be] bg-white text-[#7a7268]'
                            : 'border-[#262320] bg-[#141312] text-[#a8a199]'
                        }`}
                        title={`${p.user_name} (${p.is_muted ? 'Muted' : 'Speaking'})`}
                      >
                        <span className="truncate max-w-[80px]">
                          {isMe ? 'You' : p.user_name?.split(' ')?.[0] || 'Learner'}
                        </span>
                        <span>{p.is_muted ? '🔇' : '🎤'}</span>
                        {p.is_video_active && <span>📹</span>}
                        {p.is_screen_sharing && <span>🖥️</span>}
                      </span>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right: Study Mode Toggle (Sync vs Independent) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] opacity-60 font-medium hidden sm:inline">Mode:</span>
              <div
                className={`inline-flex items-center p-0.5 rounded-lg border ${
                  isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStudyMode('sync')
                    setActiveTab('sync')
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    studyMode === 'sync'
                      ? 'bg-[#c25e2e] text-white shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Play className="h-3 w-3" />
                  <span>Sync Watch</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudyMode('independent')
                    setActiveTab('sync')
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    studyMode === 'independent'
                      ? 'bg-[#c25e2e] text-white shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Compass className="h-3 w-3" />
                  <span>Independent</span>
                </button>
              </div>
            </div>
          </div>

          {/* ──────────────── 3. SUB-NAVIGATION TABS ──────────────── */}
          <div
            className={`px-5 border-b flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar ${
              isLight ? 'border-[#ded4be] bg-[#f7f2e8]' : 'border-[#262320] bg-[#171514]'
            }`}
          >
            {[
              { id: 'chat', label: 'Discussion Chat', icon: MessageSquare, badge: messages.length },
              { id: 'sync', label: studyMode === 'sync' ? 'Synchronized Content' : 'Independent Study', icon: Play, badge: syncContent?.sync_is_playing ? 'Live ▶' : 0 },
              { id: 'code', label: 'Collaborative Code Space', icon: Code, badge: codeLanguage },
              { id: 'whiteboard', label: 'Whiteboard', icon: PenTool, badge: 0 },
              { id: 'notes', label: 'Shared Notes', icon: FileText, badge: sharedNotes ? 'Live' : 0 },
              { id: 'questions', label: 'Questions (Q&A)', icon: HelpCircle, badge: questions.length },
              { id: 'resources', label: 'Resources & Content', icon: LinkIcon, badge: resources.length },
              { id: 'history', label: 'Previous Sessions', icon: History, badge: sessionHistory.length },
              { id: 'members', label: 'Members & Roles', icon: Users, badge: members.length },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#c25e2e] text-[#e87a48]'
                      : isLight
                      ? 'border-transparent text-[#7a7268] hover:text-[#181614]'
                      : 'border-transparent text-[#a8a199] hover:text-[#faf6ee]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {Boolean(tab.badge) && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive
                          ? 'bg-[#c25e2e]/20 text-[#e87a48]'
                          : isLight
                          ? 'bg-black/5 text-[#7a7268]'
                          : 'bg-white/10 text-[#a8a199]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ──────────────── 4. TAB CONTENTS ──────────────── */}
          <div className="flex-1 overflow-hidden relative">
            {/* TAB 1: DISCUSSION CHAT */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col justify-between">
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                      <MessageSquare className="h-10 w-10 text-[#c25e2e] mb-2" />
                      <p className="text-sm font-medium">No messages yet</p>
                      <p className="text-xs max-w-sm mt-1">
                        Say hello to your peers and start discussing learning topics!
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = String(m.user_id) === String(user?.id)
                      const isSystem = m.message_type === 'system'

                      if (isSystem) {
                        return (
                          <div key={m.id} className="flex justify-center my-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-medium border ${
                                isLight
                                  ? 'border-[#ded4be] bg-[#faf6ee] text-[#7a7268]'
                                  : 'border-[#262320] bg-[#1a1816] text-[#a8a199]'
                              }`}
                            >
                              {m.content}
                            </span>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={m.id}
                          className={`flex items-start gap-2.5 max-w-[85%] ${
                            isMe ? 'ml-auto flex-row-reverse' : ''
                          }`}
                        >
                          <div
                            className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-semibold overflow-hidden ${
                              isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                            }`}
                          >
                            {m.user_avatar ? (
                              <img
                                src={getAvatarUrl(m.user_avatar)}
                                alt={m.user_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{m.user_name?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                          </div>

                          <div>
                            <div
                              className={`flex items-center gap-2 mb-1 text-[11px] ${
                                isMe ? 'justify-end' : ''
                              }`}
                            >
                              <span className="font-semibold">{isMe ? 'You' : m.user_name}</span>
                              <span className="opacity-60 text-[10px]">
                                {formatTime(m.created_at)}
                              </span>
                            </div>

                            <div
                              className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-[#c25e2e] text-white rounded-tr-xs'
                                  : isLight
                                  ? 'bg-[#faf6ee] border border-[#ded4be] text-[#181614] rounded-tl-xs'
                                  : 'bg-[#1a1816] border border-[#262320] text-[#faf6ee] rounded-tl-xs'
                              }`}
                            >
                              {m.content}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className={`p-3 border-t flex items-center gap-2 ${
                    isLight ? 'border-[#ded4be] bg-[#f7f2e8]' : 'border-[#262320] bg-[#171514]'
                  }`}
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message to peers..."
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-hidden transition-all ${
                      isLight
                        ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] focus:border-[#c25e2e]'
                        : 'border-[#262320] bg-[#1a1816] text-[#faf6ee] focus:border-[#c25e2e]'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="p-2.5 rounded-xl bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all disabled:opacity-40 cursor-pointer"
                    title="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB: SYNCHRONIZED TECHNEA CONTENT / INDEPENDENT STUDY */}
            {activeTab === 'sync' && (
              <div className="h-full flex flex-col p-5 overflow-y-auto no-scrollbar space-y-4">
                {studyMode === 'sync' ? (
                  <>
                    {/* Header & Host Synchronization Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-inherit shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold tracking-tight">
                            {syncContent.sync_content_title || 'Synchronized Learning Session'}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                              syncContent.sync_is_playing
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                syncContent.sync_is_playing ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                              }`}
                            ></span>
                            <span>{syncContent.sync_is_playing ? 'Playing' : 'Paused'}</span>
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                          {isHost
                            ? 'You are managing playback controls for all learners in this room.'
                            : `Playback synchronized with ${syncContent.host_name || 'Host'} (${syncContent.sync_playback_speed || 1}x speed)`}
                        </p>
                      </div>

                      {/* Host Quick Controls */}
                      {isHost && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSyncState({
                                sync_is_playing: !syncContent.sync_is_playing,
                              })
                            }
                            disabled={isUpdatingSync}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              syncContent.sync_is_playing
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-[#c25e2e] hover:bg-[#d97b48] text-white'
                            }`}
                          >
                            {syncContent.sync_is_playing ? (
                              <>
                                <Pause className="h-3.5 w-3.5" />
                                <span>Pause Room</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" />
                                <span>Play for Room</span>
                              </>
                            )}
                          </button>

                          {/* Speed Selector */}
                          <select
                            value={syncContent.sync_playback_speed || 1.0}
                            onChange={(e) =>
                              handleUpdateSyncState({
                                sync_playback_speed: parseFloat(e.target.value),
                              })
                            }
                            className={`px-2 py-1.5 rounded-xl border text-xs font-mono outline-hidden cursor-pointer ${
                              isLight ? 'border-[#ded4be] bg-white text-[#181614]' : 'border-[#262320] bg-[#141312] text-[#faf6ee]'
                            }`}
                          >
                            <option value={1.0}>1.0x</option>
                            <option value={1.25}>1.25x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2.0}>2.0x</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Change URL Input for Host */}
                    {isHost && (
                      <form onSubmit={handleSaveSyncUrl} className="flex flex-wrap items-center gap-2 shrink-0">
                        <input
                          type="text"
                          value={syncInputTitle}
                          onChange={(e) => setSyncInputTitle(e.target.value)}
                          placeholder="Video/Topic Title"
                          className={`w-44 px-3 py-1.5 rounded-xl border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        />
                        <input
                          type="url"
                          value={syncInputUrl}
                          onChange={(e) => setSyncInputUrl(e.target.value)}
                          placeholder="Paste YouTube or video URL..."
                          className={`flex-1 min-w-[200px] px-3 py-1.5 rounded-xl border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer"
                        >
                          Load & Sync
                        </button>
                      </form>
                    )}

                    {/* Synchronized Video Display Area */}
                    <div className="flex-1 min-h-[320px] rounded-2xl overflow-hidden border border-inherit relative bg-black flex flex-col justify-center items-center">
                      {syncContent.sync_content_url ? (
                        <iframe
                          src={getEmbedUrl(syncContent.sync_content_url)}
                          title={syncContent.sync_content_title || 'Synchronized Content'}
                          className="w-full h-full min-h-[340px] border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="text-center p-8 text-white/70">
                          <Play className="h-12 w-12 text-[#c25e2e] mx-auto mb-3 opacity-80" />
                          <p className="text-sm font-semibold">No Content Loaded Yet</p>
                          <p className="text-xs text-white/50 mt-1 max-w-sm">
                            Paste a YouTube lecture or Technea lesson URL above to watch and learn in sync with your group.
                          </p>
                        </div>
                      )}

                      {/* Screen Share Overlay (If someone is presenting screen) */}
                      {isScreenSharing && (
                        <div className="absolute inset-0 bg-black/95 z-20 flex flex-col">
                          <div className="p-2.5 bg-black/80 border-b border-white/10 flex items-center justify-between text-xs text-white">
                            <span className="flex items-center gap-2 font-medium">
                              <Monitor className="h-4 w-4 text-sky-400" />
                              <span>Live Screen Share Presenting</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleToggleScreenShare}
                              className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[11px] font-semibold cursor-pointer"
                            >
                              Stop Share
                            </button>
                          </div>
                          <video
                            ref={screenVideoRef}
                            autoPlay
                            playsInline
                            className="flex-1 w-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Host Playback Scrubber */}
                    {isHost && (
                      <div
                        className={`p-3 rounded-xl border flex items-center gap-3 text-xs shrink-0 ${
                          isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                        }`}
                      >
                        <span className="font-mono text-[11px] opacity-75">
                          {formatPomodoro(Math.floor(syncContent.sync_playback_time || 0))}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={3600}
                          step={5}
                          value={syncContent.sync_playback_time || 0}
                          onChange={(e) =>
                            handleUpdateSyncState({
                              sync_playback_time: parseFloat(e.target.value),
                            })
                          }
                          className="flex-1 accent-[#c25e2e] cursor-pointer"
                        />
                        <span className="text-[11px] opacity-60">Seek & Sync</span>
                      </div>
                    )}
                  </>
                ) : (
                  /* Independent Study Mode */
                  <div className="h-full flex flex-col space-y-4">
                    <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400 flex items-start gap-3">
                      <Compass className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-xs text-inherit">Independent Study Mode Active</h4>
                        <p className="text-[11px] opacity-90 mt-0.5">
                          You are studying your own curriculum independently while remaining connected to your room peers through live voice, presence, and chat.
                        </p>
                      </div>
                    </div>

                    {/* Active Roadmap Progress Box */}
                    <div
                      className={`p-5 rounded-xl border space-y-3 ${
                        isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#1a1816]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#e87a48]">
                            Active Roadmap
                          </span>
                          <h3 className="text-base font-bold tracking-tight mt-0.5">
                            {activeRoadmap?.title || currentRoom.roadmap_name || 'Full-Stack Developer Path'}
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#c25e2e]/10 text-[#e87a48] border border-[#c25e2e]/20">
                          {activeRoadmap?.progress || 35}% Complete
                        </span>
                      </div>

                      <p className={`text-xs ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                        Current focus milestone: {activeRoadmap?.current_milestone || 'Module 2: Advanced Functions & Scope'}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <a
                          href="/learning"
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white inline-flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Open Technea Learning Page</span>
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setActiveTab('chat')}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isLight
                              ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614]'
                              : 'border-[#262320] bg-[#141312] text-[#faf6ee]'
                          }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#e87a48]" />
                          <span>Open Side Chat with Peers</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Independent Study Notepad */}
                    <div
                      className={`flex-1 p-4 rounded-xl border flex flex-col space-y-2 ${
                        isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#1a1816]'
                      }`}
                    >
                      <span className="text-xs font-semibold">Your Session Scratchpad & Personal Log</span>
                      <textarea
                        placeholder="Write down quick notes, code snippets, or thoughts as you learn independently..."
                        className={`flex-1 p-3 rounded-lg border text-xs outline-hidden resize-none font-mono ${
                          isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#141312]'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: COLLABORATIVE CODE SPACE */}
            {activeTab === 'code' && (
              <div className="h-full flex flex-col p-5 overflow-hidden">
                {/* Code Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-inherit shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={codeTitle}
                      onChange={(e) => setCodeTitle(e.target.value)}
                      placeholder="Snippet Title..."
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-hidden min-w-[180px] ${
                        isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                      }`}
                    />

                    {/* Language Selector */}
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono outline-hidden cursor-pointer ${
                        isLight ? 'border-[#ded4be] bg-white text-[#181614]' : 'border-[#262320] bg-[#141312] text-[#faf6ee]'
                      }`}
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="sql">SQL</option>
                    </select>

                    {/* Algorithm Presets Dropdown */}
                    <select
                      onChange={(e) => {
                        const sel = CODE_PRESETS.find((p) => p.title === e.target.value)
                        if (sel) handlePresetSelect(sel)
                      }}
                      defaultValue=""
                      className={`px-3 py-1.5 rounded-xl border text-xs outline-hidden cursor-pointer ${
                        isLight ? 'border-[#ded4be] bg-white text-[#7a7268]' : 'border-[#262320] bg-[#141312] text-[#a8a199]'
                      }`}
                    >
                      <option value="" disabled>Load Algorithm Template...</option>
                      {CODE_PRESETS.map((preset) => (
                        <option key={preset.title} value={preset.title}>
                          {preset.title} ({preset.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        copiedCodeText
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : isLight
                          ? 'border-[#ded4be] bg-white text-[#7a7268] hover:border-[#c25e2e]'
                          : 'border-[#262320] bg-[#141312] text-[#a8a199] hover:border-[#c25e2e]'
                      }`}
                    >
                      {copiedCodeText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedCodeText ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCode}
                      disabled={isSavingCode}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                    >
                      <Code className="h-3.5 w-3.5" />
                      <span>{isSavingCode ? 'Saving...' : 'Save Snippet'}</span>
                    </button>
                  </div>
                </div>

                {/* Code Textarea Editor */}
                <div className="flex-1 mt-3 rounded-2xl overflow-hidden border border-inherit bg-[#0c0b0a] flex flex-col relative font-mono text-xs sm:text-sm">
                  <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-[#a8a199]">
                    <span className="font-semibold text-[#e87a48] uppercase tracking-wider">{codeLanguage}</span>
                    <span>
                      {codeMeta?.last_edited_by_name
                        ? `Last saved by ${codeMeta.last_edited_by_name}`
                        : 'Collaborative Live Editor'}
                    </span>
                  </div>
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    spellCheck="false"
                    className="flex-1 w-full p-4 bg-transparent text-[#e6edf3] font-mono text-xs sm:text-sm outline-hidden resize-none leading-relaxed overflow-y-auto"
                    placeholder="Type or paste code here..."
                  />
                </div>
              </div>
            )}

            {/* TAB: COLLABORATIVE WHITEBOARD */}
            {activeTab === 'whiteboard' && (
              <div className="h-full flex flex-col p-5 overflow-hidden">
                {/* Whiteboard Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-inherit shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tool Select (Pen / Eraser) */}
                    <div
                      className={`inline-flex items-center p-0.5 rounded-lg border ${
                        isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setWhiteboardTool('pen')}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                          whiteboardTool === 'pen'
                            ? 'bg-[#c25e2e] text-white'
                            : isLight
                            ? 'text-[#7a7268]'
                            : 'text-[#a8a199]'
                        }`}
                        title="Pen Tool"
                      >
                        <PenTool className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setWhiteboardTool('eraser')}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                          whiteboardTool === 'eraser'
                            ? 'bg-[#c25e2e] text-white'
                            : isLight
                            ? 'text-[#7a7268]'
                            : 'text-[#a8a199]'
                        }`}
                        title="Eraser Tool"
                      >
                        <Eraser className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Color Palette */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-inherit">
                      {['#e87a48', '#f59e0b', '#38bdf8', '#10b981', '#a855f7', '#ffffff'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setWhiteboardColor(color)
                            setWhiteboardTool('pen')
                          }}
                          className={`h-5 w-5 rounded-full border-2 transition-transform cursor-pointer ${
                            whiteboardColor === color && whiteboardTool === 'pen'
                              ? 'scale-125 border-white ring-2 ring-[#c25e2e]'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          title={`Color: ${color}`}
                        />
                      ))}
                    </div>

                    {/* Stroke Size Selector */}
                    <div className="flex items-center gap-1 pl-2 border-l border-inherit">
                      {[
                        { size: 2, label: 'Thin' },
                        { size: 4, label: 'Med' },
                        { size: 8, label: 'Bold' },
                        { size: 16, label: 'Marker' },
                      ].map((item) => (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => setWhiteboardSize(item.size)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium border cursor-pointer ${
                            whiteboardSize === item.size
                              ? 'border-[#c25e2e] bg-[#c25e2e]/10 text-[#e87a48]'
                              : isLight
                              ? 'border-[#ded4be] bg-white text-[#7a7268]'
                              : 'border-[#262320] bg-[#141312] text-[#a8a199]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearWhiteboard}
                      className={`p-1.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isLight
                          ? 'border-[#ded4be] bg-white text-[#7a7268] hover:border-rose-400'
                          : 'border-[#262320] bg-[#141312] text-[#a8a199] hover:border-rose-400'
                      }`}
                      title="Clear Canvas"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleExportWhiteboard}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                        isLight
                          ? 'border-[#ded4be] bg-white text-[#7a7268] hover:border-[#c25e2e]'
                          : 'border-[#262320] bg-[#141312] text-[#a8a199] hover:border-[#c25e2e]'
                      }`}
                      title="Download as PNG"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveWhiteboard}
                      disabled={isSavingWhiteboard}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{isSavingWhiteboard ? 'Saving...' : 'Save Whiteboard'}</span>
                    </button>
                  </div>
                </div>

                {/* Whiteboard HTML5 Canvas */}
                <div className="flex-1 mt-3 rounded-2xl overflow-hidden border border-inherit bg-[#141312] relative cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={900}
                    height={550}
                    onMouseDown={handleStartDrawing}
                    onMouseMove={handleDraw}
                    onMouseUp={handleStopDrawing}
                    onMouseLeave={handleStopDrawing}
                    onTouchStart={handleStartDrawing}
                    onTouchMove={handleDraw}
                    onTouchEnd={handleStopDrawing}
                    className="w-full h-full block touch-none"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] text-white/60 pointer-events-none">
                    Collaborative Canvas • Draw diagrams, flowcharts, and system architectures
                  </div>
                </div>
              </div>
            )}

            {/* TAB: QUESTIONS (Q&A) */}
            {activeTab === 'questions' && (
              <div className="h-full overflow-y-auto p-5 space-y-4 no-scrollbar">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h3 className="text-sm font-semibold">Learning Questions</h3>
                    <p className={`text-xs ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                      Ask doubts, discuss concepts, and collaborate with peers
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAskingQuestion(!isAskingQuestion)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Ask Question</span>
                  </button>
                </div>

                {isAskingQuestion && (
                  <form
                    onSubmit={handleCreateQuestion}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                    }`}
                  >
                    <div>
                      <label className="block text-xs font-medium mb-1">Question Title</label>
                      <input
                        type="text"
                        value={newQuestionTitle}
                        onChange={(e) => setNewQuestionTitle(e.target.value)}
                        placeholder="e.g. How does async/await work in FastAPI?"
                        required
                        className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                          isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Details & Context</label>
                      <textarea
                        value={newQuestionContent}
                        onChange={(e) => setNewQuestionContent(e.target.value)}
                        placeholder="Provide details, code snippets, or error messages..."
                        rows={3}
                        required
                        className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden resize-none ${
                          isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                        }`}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAskingQuestion(false)}
                        className="px-3 py-1.5 text-xs opacity-75 hover:opacity-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingQuestion}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer"
                      >
                        {isSubmittingQuestion ? 'Posting...' : 'Post Question'}
                      </button>
                    </div>
                  </form>
                )}

                {questions.length === 0 ? (
                  <div className="py-12 text-center opacity-60">
                    <HelpCircle className="h-10 w-10 text-[#c25e2e] mx-auto mb-2" />
                    <p className="text-sm font-medium">No questions asked yet</p>
                    <p className="text-xs max-w-sm mx-auto mt-1">
                      Be the first to ask a study question or seek clarification on a topic!
                    </p>
                  </div>
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border space-y-3 ${
                        isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                q.is_resolved
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                  : 'border-[#c25e2e]/30 bg-[#c25e2e]/10 text-[#e87a48]'
                              }`}
                            >
                              {q.is_resolved ? 'Resolved' : 'Open Question'}
                            </span>
                            <span className="text-[11px] opacity-60">• asked by {q.user_name}</span>
                          </div>
                          <h4 className="text-sm font-bold tracking-tight">{q.title}</h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleResolveQuestion(q.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer shrink-0 ${
                            q.is_resolved
                              ? 'border-emerald-500/30 text-emerald-400 hover:border-emerald-500'
                              : isLight
                              ? 'border-[#ded4be] hover:border-[#c25e2e] text-[#7a7268]'
                              : 'border-[#262320] hover:border-[#c25e2e] text-[#a8a199]'
                          }`}
                        >
                          {q.is_resolved ? 'Reopen' : 'Mark Resolved'}
                        </button>
                      </div>

                      <p className="text-xs leading-relaxed whitespace-pre-wrap opacity-90">{q.content}</p>

                      {q.replies && q.replies.length > 0 && (
                        <div className="pt-2 pl-3 border-l-2 border-[#c25e2e]/30 space-y-2 mt-2">
                          {q.replies.map((rep) => (
                            <div key={rep.id} className="text-xs space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[11px] text-[#e87a48]">
                                  {rep.user_name}
                                </span>
                                <span className="opacity-50 text-[10px]">
                                  {formatTime(rep.created_at)}
                                </span>
                              </div>
                              <p className="opacity-90">{rep.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleReplyQuestion(q.id)
                        }}
                        className="flex items-center gap-2 pt-2 border-t border-inherit"
                      >
                        <input
                          type="text"
                          value={replyInputs[q.id] || ''}
                          onChange={(e) => setReplyInputs({ ...replyInputs, [q.id]: e.target.value })}
                          placeholder="Write an answer or reply..."
                          className={`flex-1 px-3 py-1.5 rounded-lg border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer"
                        >
                          Reply
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: SHARED NOTES (Feature 4) */}
            {activeTab === 'notes' && (
              <div className="h-full flex flex-col justify-between p-5 overflow-hidden">
                {/* Notes Top Toolbar */}
                <div className="pb-3 border-b border-inherit shrink-0 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Collaborative Shared Notes</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#c25e2e]/10 text-[#e87a48] border border-[#c25e2e]/20">
                        Live Sync
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'} mt-0.5`}>
                      {notesMeta?.last_edited_by_name
                        ? `Last saved by ${notesMeta.last_edited_by_name} • ${new Date(
                            notesMeta.updated_at
                          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Write notes, key takeaways, and code snippets together with peers.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] opacity-60 font-mono">
                      {sharedNotes.split(/\s+/).filter(Boolean).length} words • {sharedNotes.length} chars
                    </span>

                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        notesSaveSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#c25e2e] hover:bg-[#d97b48] text-white'
                      }`}
                    >
                      {notesSaveSuccess ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Markdown Formatting Helpers */}
                <div
                  className={`py-2 px-1 flex flex-wrap items-center gap-1.5 text-xs border-b border-inherit shrink-0 ${
                    isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'
                  }`}
                >
                  <span className="text-[11px] opacity-60 mr-1">Insert:</span>
                  {[
                    { label: 'H1', prefix: '# ' },
                    { label: 'H2', prefix: '## ' },
                    { label: '• Bullet', prefix: '- ' },
                    { label: '✓ Task', prefix: '- [ ] ' },
                    { label: '**Bold**', prefix: '**', suffix: '**' },
                    { label: '`Code`', prefix: '`', suffix: '`' },
                    { label: 'CodeBlock', prefix: '```python\n', suffix: '\n```' },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => insertMarkdownSnippet(btn.prefix, btn.suffix)}
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-mono transition-colors cursor-pointer ${
                        isLight
                          ? 'border-[#ded4be] bg-[#faf6ee] hover:border-[#c25e2e]'
                          : 'border-[#262320] bg-[#1a1816] hover:border-[#c25e2e]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Shared Notes Textarea */}
                <div className="flex-1 py-3 overflow-hidden">
                  <textarea
                    ref={notesTextareaRef}
                    value={sharedNotes}
                    onChange={(e) => setSharedNotes(e.target.value)}
                    placeholder="# Meeting / Sprint Notes&#10;&#10;Key Takeaways:&#10;- Important concept from Lesson 3&#10;- Code pattern for asynchronous workers&#10;&#10;Todo:&#10;- [ ] Implement unit tests&#10;- [ ] Review milestone submission"
                    className={`w-full h-full p-4 rounded-xl border text-xs font-mono leading-relaxed outline-hidden resize-none transition-colors ${
                      isLight
                        ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] focus:border-[#c25e2e]'
                        : 'border-[#262320] bg-[#141312] text-[#faf6ee] focus:border-[#c25e2e]'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: RESOURCES & TECHNEA CONTENT SHARING (Feature 5) */}
            {activeTab === 'resources' && (
              <div className="h-full overflow-y-auto p-5 space-y-4 no-scrollbar">
                {/* Actions & Filters Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-inherit">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'content', label: 'Technea Content' },
                      { id: 'video', label: 'Videos' },
                      { id: 'link', label: 'Links' },
                      { id: 'note', label: 'Notes' },
                      { id: 'pdf', label: 'PDFs' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setResourceFilter(type.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                          resourceFilter === type.id
                            ? 'bg-[#c25e2e]/20 text-[#e87a48] border border-[#c25e2e]/40'
                            : isLight
                            ? 'border border-[#ded4be] text-[#7a7268]'
                            : 'border border-[#262320] text-[#a8a199]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Feature 5: Share Technea Content Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSharingContent(!isSharingContent)
                        setIsSharingResource(false)
                        if (!contentTitle) prefillCurrentLesson()
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>+ Share Technea Content</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSharingResource(!isSharingResource)
                        setIsSharingContent(false)
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isLight
                          ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] hover:border-[#c25e2e]'
                          : 'border-[#262320] bg-[#1a1816] text-[#faf6ee] hover:border-[#c25e2e]'
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>External Resource</span>
                    </button>
                  </div>
                </div>

                {/* Form: Share Technea Learning Content (Course, Lesson, Roadmap step) */}
                {isSharingContent && (
                  <form
                    onSubmit={handleShareTechneaContent}
                    className={`p-4 rounded-xl border space-y-3 relative ${
                      isLight ? 'border-[#c25e2e]/40 bg-[#faf6ee]' : 'border-[#c25e2e]/40 bg-[#1a1816]'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#e87a48]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#e87a48]">
                          Share Technea Learning Content
                        </h4>
                      </div>

                      {/* 1-Click Quick Prefill Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={prefillCurrentLesson}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#c25e2e]/10 text-[#e87a48] border border-[#c25e2e]/20 hover:bg-[#c25e2e]/20 cursor-pointer"
                        >
                          ⚡ Use Current Lesson
                        </button>
                        <button
                          type="button"
                          onClick={prefillActiveRoadmap}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#c25e2e]/10 text-[#e87a48] border border-[#c25e2e]/20 hover:bg-[#c25e2e]/20 cursor-pointer"
                        >
                          🗺️ Use Active Roadmap
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Content Title</label>
                        <input
                          type="text"
                          value={contentTitle}
                          onChange={(e) => setContentTitle(e.target.value)}
                          placeholder="e.g. Python Functions Deep Dive"
                          required
                          className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Content Badge / Type</label>
                        <select
                          value={contentBadge}
                          onChange={(e) => {
                            setContentBadge(e.target.value)
                            if (e.target.value.toLowerCase().includes('roadmap')) {
                              setContentType('roadmap_step')
                            } else if (e.target.value.toLowerCase().includes('course')) {
                              setContentType('course')
                            } else {
                              setContentType('lesson')
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        >
                          <option value="Lesson">Lesson</option>
                          <option value="Course">Course</option>
                          <option value="Roadmap step">Roadmap Step</option>
                          <option value="Documentation">Documentation</option>
                          <option value="Project">Project Guide</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Context / Why Study This?</label>
                        <input
                          type="text"
                          value={contentDesc}
                          onChange={(e) => setContentDesc(e.target.value)}
                          placeholder="Crucial for understanding asynchronous handlers"
                          className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Action URL (Target Destination)</label>
                        <input
                          type="text"
                          value={contentUrl}
                          onChange={(e) => setContentUrl(e.target.value)}
                          placeholder="/learning or /dashboard"
                          className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsSharingContent(false)}
                        className="px-3 py-1.5 text-xs opacity-75 hover:opacity-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingContent}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer"
                      >
                        {isSubmittingContent ? 'Sharing...' : 'Share Content Card'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Form: Share External Resource */}
                {isSharingResource && (
                  <form
                    onSubmit={handleCreateResource}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                    }`}
                  >
                    <div>
                      <label className="block text-xs font-medium mb-1">Resource Title</label>
                      <input
                        type="text"
                        value={resTitle}
                        onChange={(e) => setResTitle(e.target.value)}
                        placeholder="e.g. Async Programming in Python (Full Talk)"
                        required
                        className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                          isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Type</label>
                        <select
                          value={resType}
                          onChange={(e) => setResType(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        >
                          <option value="link">Web Link</option>
                          <option value="video">Video</option>
                          <option value="note">Study Note</option>
                          <option value="pdf">PDF Document</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">URL or Note Content</label>
                        <input
                          type="text"
                          value={resUrl}
                          onChange={(e) => setResUrl(e.target.value)}
                          placeholder="https://... or summary text"
                          required
                          className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                            isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Brief Description (Optional)</label>
                      <input
                        type="text"
                        value={resDesc}
                        onChange={(e) => setResDesc(e.target.value)}
                        placeholder="Why is this useful for peers?"
                        className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden ${
                          isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                        }`}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSharingResource(false)}
                        className="px-3 py-1.5 text-xs opacity-75 hover:opacity-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingResource}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer"
                      >
                        {isSubmittingResource ? 'Sharing...' : 'Share'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Resource Cards Feed */}
                {filteredResources.length === 0 ? (
                  <div className="py-12 text-center opacity-60">
                    <FileText className="h-10 w-10 text-[#c25e2e] mx-auto mb-2" />
                    <p className="text-sm font-medium">No resources shared yet</p>
                    <p className="text-xs max-w-sm mx-auto mt-1">
                      Share videos, documentation links, notes, or Technea learning modules with everyone in
                      this room!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredResources.map((r) => {
                      const isTechneaContent = Boolean(r.content_badge)
                      const rawUrl = (r.url_or_content || r.action_url || '').trim()
                      const isHttpUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
                      const isLikelyUrl =
                        isHttpUrl ||
                        /^www\./i.test(rawUrl) ||
                        (/\.[a-z]{2,}(\/.*)?$/i.test(rawUrl) && !rawUrl.includes('\n') && !rawUrl.includes(' '))
                      const externalUrl = isHttpUrl ? rawUrl : `https://${rawUrl}`

                      return (
                        <div
                          key={r.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isTechneaContent
                              ? isLight
                                ? 'border-[#c25e2e]/30 bg-gradient-to-br from-[#faf6ee] to-[#f4ede0] shadow-xs'
                                : 'border-[#c25e2e]/30 bg-gradient-to-br from-[#1a1816] to-[#201c19] shadow-xs'
                              : isLight
                              ? 'border-[#ded4be] bg-[#faf6ee]'
                              : 'border-[#262320] bg-[#1a1816]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              {isTechneaContent ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#c25e2e] text-white">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{r.content_badge}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#c25e2e]/10 text-[#e87a48] border border-[#c25e2e]/20">
                                  {r.resource_type === 'video' && <Play className="h-3 w-3" />}
                                  {r.resource_type === 'link' && <LinkIcon className="h-3 w-3" />}
                                  {r.resource_type === 'note' && <FileText className="h-3 w-3" />}
                                  {r.resource_type === 'pdf' && <FileDown className="h-3 w-3" />}
                                  <span>{r.resource_type}</span>
                                </span>
                              )}
                              <span className="text-[10px] opacity-60">Shared by {r.user_name}</span>
                            </div>

                            <h4 className="text-sm font-bold tracking-tight mb-1">{r.title}</h4>
                            {r.description && <p className="text-xs opacity-75 mb-3">{r.description}</p>}

                            {r.resource_type === 'note' && !isLikelyUrl && r.url_or_content && (
                              <p className={`text-xs font-mono leading-relaxed opacity-90 whitespace-pre-wrap p-2.5 rounded-lg border mb-3 ${
                                isLight ? 'bg-black/3 border-[#ded4be]' : 'bg-white/3 border-[#262320]'
                              }`}>
                                {r.url_or_content}
                              </p>
                            )}
                          </div>

                          <div className={`pt-2.5 border-t flex items-center justify-between mt-auto ${
                            isLight ? 'border-[#ded4be]' : 'border-[#262320]'
                          }`}>
                            {isTechneaContent ? (
                              <a
                                href={r.action_url || r.url_or_content || '/learning'}
                                className="text-xs font-semibold text-[#e87a48] hover:text-[#d97b48] flex items-center gap-1.5 group cursor-pointer"
                              >
                                <span>Continue Learning</span>
                                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                              </a>
                            ) : isLikelyUrl ? (
                              <a
                                href={externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-[#e87a48] hover:underline flex items-center gap-1"
                              >
                                <span>
                                  {r.resource_type === 'video'
                                    ? 'Watch Video'
                                    : r.resource_type === 'pdf'
                                    ? 'Open PDF'
                                    : 'Open Resource'}
                                </span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs font-mono opacity-80 truncate">{r.url_or_content}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: STUDY SESSION HISTORY (Feature 6) */}
            {activeTab === 'history' && (
              <div className="h-full overflow-y-auto p-5 space-y-4 no-scrollbar">
                <div className="pb-2 border-b border-inherit">
                  <h3 className="text-sm font-semibold">Previous Study Sessions</h3>
                  <p className={`text-xs ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                    Historical log of focus sessions and learning milestones completed in this room
                  </p>
                </div>

                {sessionHistory.length === 0 ? (
                  <div className="py-12 text-center opacity-60">
                    <History className="h-10 w-10 text-[#c25e2e] mx-auto mb-2" />
                    <p className="text-sm font-medium">No previous study sessions yet</p>
                    <p className="text-xs max-w-sm mx-auto mt-1">
                      Start a study session above to study together and record collaborative learning logs!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessionHistory.map((s) => (
                      <div
                        key={s.id}
                        className={`p-4 rounded-xl border flex flex-col gap-3 ${
                          isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm tracking-tight">{s.topic}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Completed
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs opacity-75">
                              <span>Hosted by {s.host_name || 'Room Peer'}</span>
                              <span>•</span>
                              <span>
                                {new Date(s.ended_at || s.created_at).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#e87a48]" />
                              <span>
                                {s.duration_minutes >= 60
                                  ? `${Math.floor(s.duration_minutes / 60)}h ${s.duration_minutes % 60}m`
                                  : `${s.duration_minutes} minutes`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-80">
                              <Users className="h-3.5 w-3.5" />
                              <span>{s.participants_count || 1} participants</span>
                            </div>
                          </div>
                        </div>

                        {/* Phase 3 Feature 8: AI Study Session Summary Card */}
                        {s.ai_summary ? (
                          <div
                            className={`p-3.5 rounded-xl border text-xs space-y-2 mt-0.5 ${
                              isLight
                                ? 'bg-white/80 border-[#ded4be] text-[#181614]'
                                : 'bg-black/30 border-white/10 text-[#faf6ee]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-[#e87a48]">
                              <Sparkles className="h-4 w-4" />
                              <span>Technea AI Session Summary</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                              <div>
                                <span className="opacity-60 block">Session Duration:</span>
                                <span className="font-semibold font-mono">
                                  {s.duration_minutes >= 60
                                    ? `${Math.floor(s.duration_minutes / 60)} hours`
                                    : `${s.duration_minutes} mins`}{' '}
                                  • {s.questions_discussed_count || 0} questions discussed
                                </span>
                              </div>
                              {s.recommended_next_step && (
                                <div>
                                  <span className="opacity-60 block">Recommended Next Step:</span>
                                  <span className="font-semibold text-emerald-400">
                                    {s.recommended_next_step}
                                  </span>
                                </div>
                              )}
                            </div>

                            {s.topics_covered && (
                              <div className="pt-1.5 border-t border-inherit">
                                <span className="opacity-60 block text-[11px] mb-1">Topics covered:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {s.topics_covered.split(',').map((topicItem, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                                        isLight
                                          ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614]'
                                          : 'border-[#262320] bg-[#141312] text-[#faf6ee]'
                                      }`}
                                    >
                                      ✓ {topicItem.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: MEMBERS & STUDY STATUS (Feature 2) */}
            {activeTab === 'members' && (
              <div className="h-full overflow-y-auto p-5 space-y-4 no-scrollbar">
                {/* Feature 2: My Study Status & Presence Updater */}
                <form
                  onSubmit={handleUpdateStatusAndPresence}
                  className={`p-4 rounded-xl border space-y-3 ${
                    isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold">Your Study Status & Presence</label>

                    {/* 3 Presence States: 🟢 Studying, 🟡 Taking Break, 🔴 Away */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'studying', label: 'Studying', dot: 'bg-emerald-500', color: 'emerald' },
                        { id: 'break', label: 'Taking Break', dot: 'bg-amber-500', color: 'amber' },
                        { id: 'away', label: 'Away', dot: 'bg-rose-500', color: 'rose' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setUserStudyState(st.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                            userStudyState === st.id
                              ? 'border-[#c25e2e] bg-[#c25e2e]/10 text-[#e87a48]'
                              : isLight
                              ? 'border-[#ded4be] bg-white text-[#7a7268]'
                              : 'border-[#262320] bg-[#141312] text-[#a8a199]'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${st.dot}`}></span>
                          <span>{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={userStudyStatus}
                      onChange={(e) => setUserStudyStatus(e.target.value)}
                      placeholder="e.g. Tackling Step 2 — Asynchronous Fast API routes"
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs outline-hidden ${
                        isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingStatus}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingStatus ? 'Saving...' : 'Update Status'}
                    </button>
                  </div>
                </form>

                {/* Members List with Presence Status */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider opacity-60">
                    Active Room Members ({members.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {members.map((m, idx) => {
                      const isMe = String(m.user_id) === String(user?.id)
                      const isOwner =
                        m.role === 'owner' ||
                        String(m.user_id) === String(currentRoom?.created_by_id)
                      const state = m.study_state || 'studying'

                      return (
                        <div
                          key={`${m.user_id}-${idx}`}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
                            isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div
                              className={`h-10 w-10 rounded-full border flex items-center justify-center font-semibold text-xs overflow-hidden ${
                                isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                              }`}
                            >
                              {m.avatar_url ? (
                                <img
                                  src={getAvatarUrl(m.avatar_url)}
                                  alt={m.full_name || m.email}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>{(m.full_name || m.email)?.[0]?.toUpperCase()}</span>
                              )}
                            </div>

                            {/* Presence Indicator Dot */}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${
                                isLight ? 'border-[#faf6ee]' : 'border-[#1a1816]'
                              } ${
                                state === 'studying'
                                  ? 'bg-emerald-500'
                                  : state === 'break'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              title={`Status: ${state}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-semibold truncate">
                                {m.full_name || m.email}
                              </span>
                              {isMe && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-[#c25e2e]/20 text-[#e87a48] font-mono">
                                  You
                                </span>
                              )}

                              {/* Phase 3 Feature 9: Member Role Badges */}
                              {isOwner ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-sm font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                  <Crown className="h-2.5 w-2.5" />
                                  <span>Owner</span>
                                </span>
                              ) : m.role === 'host' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-sm font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <Award className="h-2.5 w-2.5" />
                                  <span>Host</span>
                                </span>
                              ) : m.role === 'moderator' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-sm font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                                  <ShieldCheck className="h-2.5 w-2.5" />
                                  <span>Moderator</span>
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-sm font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
                                  Member
                                </span>
                              )}

                              <span
                                className={`text-[10px] px-1.5 rounded-sm capitalize font-medium ${
                                  state === 'studying'
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : state === 'break'
                                    ? 'text-amber-400 bg-amber-500/10'
                                    : 'text-rose-400 bg-rose-500/10'
                                }`}
                              >
                                {state === 'studying' ? 'Studying' : state === 'break' ? 'On Break' : 'Away'}
                              </span>
                            </div>

                            <p className="text-[11px] opacity-75 truncate mb-1">
                              {m.study_status || 'Studying with peers'}
                            </p>

                            {/* Phase 3 Feature 9: Owner Role Manager */}
                            {isRoomOwner && !isMe && (
                              <div className="flex items-center gap-1.5 pt-1 border-t border-inherit/40 text-[11px]">
                                <span className="opacity-60 text-[10px]">Assign Role:</span>
                                <select
                                  value={m.role || 'member'}
                                  onChange={(e) => handleUpdateMemberRole(m.user_id, e.target.value)}
                                  disabled={isChangingRole}
                                  className={`px-1.5 py-0.5 rounded-md border text-[10px] outline-hidden cursor-pointer ${
                                    isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                                  }`}
                                >
                                  <option value="member">Member</option>
                                  <option value="moderator">Moderator</option>
                                  <option value="host">Host</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
