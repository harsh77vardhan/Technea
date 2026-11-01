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

  // Helper to re-fetch room data after actions
  const reloadRoomData = async () => {
    const targetId = currentRoom?.id
    if (!targetId) return
    try {
      const [msgs, qlist, rlist, mlist, noteRes, notifRes, histRes] = await Promise.all([
        getRoomMessagesApi(targetId).catch(() => []),
        getRoomQuestionsApi(targetId).catch(() => []),
        getRoomResourcesApi(targetId).catch(() => []),
        getRoomMembersApi(targetId).catch(() => []),
        getRoomSharedNotesApi(targetId).catch(() => null),
        getRoomNotificationsApi(targetId).catch(() => []),
        getRoomSessionHistoryApi(targetId).catch(() => []),
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

      if (user?.id && Array.isArray(mlist)) {
        const myMembership = mlist.find((m) => m.user_id === user.id)
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
        const [msgs, qlist, rlist, mlist, noteRes, notifRes, histRes] = await Promise.all([
          getRoomMessagesApi(targetId).catch(() => []),
          getRoomQuestionsApi(targetId).catch(() => []),
          getRoomResourcesApi(targetId).catch(() => []),
          getRoomMembersApi(targetId).catch(() => []),
          getRoomSharedNotesApi(targetId).catch(() => null),
          getRoomNotificationsApi(targetId).catch(() => []),
          getRoomSessionHistoryApi(targetId).catch(() => []),
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

          if (user?.id && Array.isArray(mlist)) {
            const myMembership = mlist.find((m) => m.user_id === user.id)
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
    }, 15000)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
    }
  }, [isOpen, currentRoom?.id, user?.id])

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
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
    const startMs = new Date(currentRoom.study_session_started_at).getTime()
    const targetDurationSecs =
      (currentRoom.study_session_duration_minutes || (timerMode === 'break' ? 5 : 25)) * 60

    const syncTick = () => {
      setPomodoroMode(timerMode)
      const nowMs = Date.now()
      const elapsedSecs = Math.max(0, Math.floor((nowMs - startMs) / 1000))

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
    setContentType('roadmap')
    setContentBadge('Roadmap step')
    setContentDesc(activeRoadmap?.description || 'Active roadmap path on Technea')
    setContentUrl('/dashboard')
  }

  // Handle Save Shared Notes
  const handleSaveNotes = async () => {
    if (isSavingNotes) return
    setIsSavingNotes(true)
    try {
      const updated = await updateRoomSharedNotesApi(currentRoom.id, sharedNotes)
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

          {/* ──────────────── 3. SUB-NAVIGATION TABS ──────────────── */}
          <div
            className={`px-5 border-b flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar ${
              isLight ? 'border-[#ded4be] bg-[#f7f2e8]' : 'border-[#262320] bg-[#171514]'
            }`}
          >
            {[
              { id: 'chat', label: 'Discussion Chat', icon: MessageSquare, badge: messages.length },
              { id: 'questions', label: 'Questions (Q&A)', icon: HelpCircle, badge: questions.length },
              { id: 'notes', label: 'Shared Notes', icon: FileText, badge: sharedNotes ? 'Live' : 0 },
              { id: 'resources', label: 'Resources & Content', icon: LinkIcon, badge: resources.length },
              { id: 'history', label: 'Previous Sessions', icon: History, badge: sessionHistory.length },
              { id: 'members', label: 'Members & Status', icon: Users, badge: members.length },
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
                      const isMe = m.user_id === user?.id
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
                                {new Date(m.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
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

            {/* TAB 2: QUESTIONS (Q&A) */}
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
                                  {new Date(rep.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="opacity-90">{rep.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-inherit">
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
                          type="button"
                          onClick={() => handleReplyQuestion(q.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
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
                              setContentType('roadmap')
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
                      const isLink =
                        r.url_or_content?.startsWith('http') || r.action_url?.startsWith('http')

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
                          </div>

                          <div className="pt-2.5 border-t border-inherit flex items-center justify-between mt-auto">
                            {isTechneaContent ? (
                              <a
                                href={r.action_url || r.url_or_content || '/learning'}
                                className="text-xs font-semibold text-[#e87a48] hover:text-[#d97b48] flex items-center gap-1.5 group cursor-pointer"
                              >
                                <span>Continue Learning</span>
                                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                              </a>
                            ) : isLink ? (
                              <a
                                href={r.url_or_content}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-[#e87a48] hover:underline flex items-center gap-1"
                              >
                                <span>Open Resource</span>
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
                        className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                          isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                        }`}
                      >
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
                    {members.map((m) => {
                      const isMe = m.user_id === user?.id
                      const state = m.study_state || 'studying'

                      return (
                        <div
                          key={m.user_id}
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

                            <p className="text-[11px] opacity-75 truncate">
                              {m.study_status || 'Studying with peers'}
                            </p>
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
