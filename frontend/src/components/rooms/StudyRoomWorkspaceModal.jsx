import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Users,
  MessageSquare,
  HelpCircle,
  FileText,
  Play,
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
} from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'
import { getAvatarUrl } from '../../services/api'
import {
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
} from '../../services/api'

export default function StudyRoomWorkspaceModal({
  room,
  user,
  isOpen,
  onClose,
  onRoomUpdated,
}) {
  const { theme, showToast } = useDashboard()
  const isLight = theme === 'light'

  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'questions' | 'resources' | 'members'
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

  // Resources State
  const [resources, setResources] = useState([])
  const [resourceFilter, setResourceFilter] = useState('all') // 'all' | 'video' | 'link' | 'note' | 'pdf'
  const [isSharingResource, setIsSharingResource] = useState(false)
  const [resTitle, setResTitle] = useState('')
  const [resType, setResType] = useState('link')
  const [resUrl, setResUrl] = useState('')
  const [resDesc, setResDesc] = useState('')
  const [isSubmittingResource, setIsSubmittingResource] = useState(false)

  // Members State
  const [members, setMembers] = useState([])
  const [userStudyStatus, setUserStudyStatus] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Study Session State
  const [isStartingSession, setIsStartingSession] = useState(false)
  const [sessionTopic, setSessionTopic] = useState('')
  const [sessionTimer, setSessionTimer] = useState('00:00:00')

  // Invite code copy feedback
  const [copiedCode, setCopiedCode] = useState(false)

  // Fetch data on room open
  const fetchRoomData = useCallback(async () => {
    const targetId = currentRoom?.id
    if (!targetId) return
    try {
      const [msgs, qlist, rlist, mlist] = await Promise.all([
        getRoomMessagesApi(targetId).catch(() => []),
        getRoomQuestionsApi(targetId).catch(() => []),
        getRoomResourcesApi(targetId).catch(() => []),
        getRoomMembersApi(targetId).catch(() => []),
      ])
      setMessages(msgs || [])
      setQuestions(qlist || [])
      setResources(rlist || [])
      setMembers(mlist || [])

      if (user?.id && Array.isArray(mlist)) {
        const myMembership = mlist.find((m) => m.user_id === user.id)
        if (myMembership?.study_status) {
          setUserStudyStatus(myMembership.study_status)
        }
      }
    } catch {
      // Fallback gracefully
    }
  }, [currentRoom, user])

  useEffect(() => {
    let isMounted = true
    const targetId = currentRoom?.id
    if (!isOpen || !targetId) return

    const loadData = async () => {
      try {
        const [msgs, qlist, rlist, mlist] = await Promise.all([
          getRoomMessagesApi(targetId).catch(() => []),
          getRoomQuestionsApi(targetId).catch(() => []),
          getRoomResourcesApi(targetId).catch(() => []),
          getRoomMembersApi(targetId).catch(() => []),
        ])
        if (isMounted) {
          setMessages(msgs || [])
          setQuestions(qlist || [])
          setResources(rlist || [])
          setMembers(mlist || [])
          if (user?.id && Array.isArray(mlist)) {
            const myMembership = mlist.find((m) => m.user_id === user.id)
            if (myMembership?.study_status) {
              setUserStudyStatus(myMembership.study_status)
            }
          }
        }
      } catch {
        // Fallback
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [isOpen, currentRoom?.id, user?.id])

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, activeTab])

  // Study Session Live Stopwatch Timer
  useEffect(() => {
    const isSessionActive = Boolean(currentRoom?.study_session_active && currentRoom?.study_session_started_at)
    if (!isSessionActive) {
      return
    }

    const updateTimer = () => {
      const start = new Date(currentRoom.study_session_started_at).getTime()
      const now = Date.now()
      const diffSecs = Math.max(0, Math.floor((now - start) / 1000))
      const h = String(Math.floor(diffSecs / 3600)).padStart(2, '0')
      const m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0')
      const s = String(diffSecs % 60).padStart(2, '0')
      setSessionTimer(`${h}:${m}:${s}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentRoom?.study_session_active, currentRoom?.study_session_started_at])

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

  // Handle Share Resource
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

  // Handle Update Study Status
  const handleUpdateStatus = async (e) => {
    e?.preventDefault()
    if (!userStudyStatus.trim() || isUpdatingStatus) return

    setIsUpdatingStatus(true)
    try {
      await updateStudyStatusApi(currentRoom.id, userStudyStatus.trim())
      showToast?.('Study status updated!')
      fetchRoomData()
    } catch (err) {
      showToast?.(err?.message || 'Failed to update study status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle Start Study Session
  const handleStartSession = async (e) => {
    e?.preventDefault()
    if (!sessionTopic.trim()) return

    try {
      const updated = await startStudySessionApi(currentRoom.id, sessionTopic.trim())
      setRoomOverride(updated)
      onRoomUpdated?.(updated)
      setIsStartingSession(false)
      setSessionTopic('')
      showToast?.('Study session started! Timer is running.')
      fetchRoomData()
    } catch (err) {
      showToast?.(err?.message || 'Failed to start study session.')
    }
  }

  // Handle End Study Session
  const handleEndSession = async () => {
    try {
      const updated = await endStudySessionApi(currentRoom.id)
      setRoomOverride(updated)
      setSessionTimer('00:00:00')
      onRoomUpdated?.(updated)
      showToast?.('Study session ended.')
      fetchRoomData()
    } catch (err) {
      showToast?.(err?.message || 'Failed to end study session.')
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

  const filteredResources =
    resourceFilter === 'all'
      ? resources
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
          <header className={`shrink-0 px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isLight ? 'border-[#ded4be] bg-[#f7f2e8]' : 'border-[#262320] bg-[#171514]'
          }`}>
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
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    currentRoom.is_private
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-[#c25e2e]/30 bg-[#c25e2e]/10 text-[#e87a48]'
                  }`}>
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

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
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

          {/* ──────────────── 2. STUDY SESSION BANNER (MVP) ──────────────── */}
          <div className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
            currentRoom.study_session_active
              ? 'bg-[#c25e2e]/12 border-[#c25e2e]/30 text-[#e87a48]'
              : isLight
              ? 'bg-[#eadecc]/40 border-[#ded4be] text-[#7a7268]'
              : 'bg-[#1b1917] border-[#262320] text-[#a8a199]'
          }`}>
            <div className="flex items-center gap-3">
              {currentRoom.study_session_active ? (
                <>
                  <div className="flex items-center gap-1.5 font-semibold text-[#e87a48]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e87a48] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e87a48]"></span>
                    </span>
                    <span>STUDY SESSION ACTIVE</span>
                  </div>
                  <span className="opacity-40">•</span>
                  <span className="font-medium text-inherit truncate">
                    Focus Topic: {currentRoom.study_session_topic || 'Deep Work Sprint'}
                  </span>
                  <span className="opacity-40">•</span>
                  <span className="font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/20 text-[#faf6ee]">
                    {sessionTimer}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>No active study session right now.</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentRoom.study_session_active ? (
                <button
                  type="button"
                  onClick={handleEndSession}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-colors cursor-pointer"
                >
                  End Session
                </button>
              ) : isStartingSession ? (
                <form onSubmit={handleStartSession} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="Focus topic (e.g. 45 min Chapter 2)"
                    autoFocus
                    required
                    className={`px-2.5 py-1 rounded-lg border text-xs outline-hidden ${
                      isLight ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614]' : 'border-[#262320] bg-[#141312] text-[#faf6ee]'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer"
                  >
                    Start
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
                  className={`px-3 py-1 rounded-lg font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isLight
                      ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] hover:border-[#c25e2e]'
                      : 'border-[#262320] bg-[#141312] text-[#faf6ee] hover:border-[#c25e2e]'
                  }`}
                >
                  <Radio className="h-3 w-3 text-[#e87a48]" />
                  <span>Start Study Session</span>
                </button>
              )}
            </div>
          </div>

          {/* ──────────────── 3. SUB-NAVIGATION TABS ──────────────── */}
          <div className={`px-5 border-b flex items-center gap-1 shrink-0 ${
            isLight ? 'border-[#ded4be] bg-[#f7f2e8]' : 'border-[#262320] bg-[#171514]'
          }`}>
            {[
              { id: 'chat', label: 'Discussion Chat', icon: MessageSquare, badge: messages.length },
              { id: 'questions', label: 'Questions (Q&A)', icon: HelpCircle, badge: questions.length },
              { id: 'resources', label: 'Resources', icon: FileText, badge: resources.length },
              { id: 'members', label: 'Members', icon: Users, badge: members.length },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'border-[#c25e2e] text-[#e87a48]'
                      : isLight
                      ? 'border-transparent text-[#7a7268] hover:text-[#181614]'
                      : 'border-transparent text-[#a8a199] hover:text-[#faf6ee]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-[#c25e2e]/20 text-[#e87a48]'
                        : isLight
                        ? 'bg-black/5 text-[#7a7268]'
                        : 'bg-white/10 text-[#a8a199]'
                    }`}>
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
                {/* Chat Scroll Thread */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar"
                >
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
                            <span className={`px-3 py-1 rounded-full text-[11px] font-medium border ${
                              isLight
                                ? 'border-[#ded4be] bg-[#faf6ee] text-[#7a7268]'
                                : 'border-[#262320] bg-[#1a1816] text-[#a8a199]'
                            }`}>
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
                          <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-semibold overflow-hidden ${
                            isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                          }`}>
                            {m.user_avatar ? (
                              <img src={getAvatarUrl(m.user_avatar)} alt={m.user_name} className="h-full w-full object-cover" />
                            ) : (
                              <span>{m.user_name?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                          </div>

                          <div>
                            <div className={`flex items-center gap-2 mb-1 text-[11px] ${
                              isMe ? 'justify-end' : ''
                            }`}>
                              <span className="font-semibold">{isMe ? 'You' : m.user_name}</span>
                              <span className="opacity-60 text-[10px]">
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[#c25e2e] text-white rounded-tr-xs'
                                : isLight
                                ? 'bg-[#faf6ee] border border-[#ded4be] text-[#181614] rounded-tl-xs'
                                : 'bg-[#1a1816] border border-[#262320] text-[#faf6ee] rounded-tl-xs'
                            }`}>
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
                {/* Header Actions */}
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

                {/* Ask Question Form */}
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

                {/* Questions Feed */}
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
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              q.is_resolved
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : 'border-[#c25e2e]/30 bg-[#c25e2e]/10 text-[#e87a48]'
                            }`}>
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

                      {/* Replies List */}
                      {q.replies && q.replies.length > 0 && (
                        <div className="pt-2 pl-3 border-l-2 border-[#c25e2e]/30 space-y-2 mt-2">
                          {q.replies.map((rep) => (
                            <div key={rep.id} className="text-xs space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[11px] text-[#e87a48]">{rep.user_name}</span>
                                <span className="opacity-50 text-[10px]">
                                  {new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="opacity-90">{rep.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
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

            {/* TAB 3: RESOURCES */}
            {activeTab === 'resources' && (
              <div className="h-full overflow-y-auto p-5 space-y-4 no-scrollbar">
                {/* Header Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                  <div className="flex items-center gap-1.5">
                    {['all', 'video', 'link', 'note', 'pdf'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setResourceFilter(type)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                          resourceFilter === type
                            ? 'bg-[#c25e2e]/20 text-[#e87a48] border border-[#c25e2e]/40'
                            : isLight
                            ? 'border border-[#ded4be] text-[#7a7268]'
                            : 'border border-[#262320] text-[#a8a199]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSharingResource(!isSharingResource)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Share Resource</span>
                  </button>
                </div>

                {/* Share Resource Form */}
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

                {/* Resource Cards */}
                {filteredResources.length === 0 ? (
                  <div className="py-12 text-center opacity-60">
                    <FileText className="h-10 w-10 text-[#c25e2e] mx-auto mb-2" />
                    <p className="text-sm font-medium">No resources shared yet</p>
                    <p className="text-xs max-w-sm mx-auto mt-1">
                      Share videos, documentation links, notes, or PDFs with everyone in this room!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredResources.map((r) => {
                      const isLink = r.url_or_content.startsWith('http')
                      return (
                        <div
                          key={r.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#c25e2e]/10 text-[#e87a48] border border-[#c25e2e]/20">
                                {r.resource_type === 'video' && <Play className="h-3 w-3" />}
                                {r.resource_type === 'link' && <LinkIcon className="h-3 w-3" />}
                                {r.resource_type === 'note' && <FileText className="h-3 w-3" />}
                                {r.resource_type === 'pdf' && <FileDown className="h-3 w-3" />}
                                <span>{r.resource_type}</span>
                              </span>
                              <span className="text-[10px] opacity-60">Shared by {r.user_name}</span>
                            </div>

                            <h4 className="text-sm font-bold tracking-tight mb-1">{r.title}</h4>
                            {r.description && <p className="text-xs opacity-75 mb-3">{r.description}</p>}
                          </div>

                          <div className="pt-2 border-t border-inherit flex items-center justify-between">
                            {isLink ? (
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

            {/* TAB 4: MEMBERS */}
            {activeTab === 'members' && (
              <div className="h-full overflow-y-auto p-5 space-y-4 no-scrollbar">
                {/* My Study Status Updater */}
                <form
                  onSubmit={handleUpdateStatus}
                  className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                    isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                  }`}
                >
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium mb-1">My Current Study Status</label>
                    <input
                      type="text"
                      value={userStudyStatus}
                      onChange={(e) => setUserStudyStatus(e.target.value)}
                      placeholder="e.g. Currently tackling Step 2 - Async Tasks"
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-hidden ${
                        isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="self-end px-4 py-2 rounded-lg text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Saving...' : 'Update Status'}
                  </button>
                </form>

                {/* Members List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider opacity-60">
                    Active Room Members ({members.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {members.map((m) => (
                      <div
                        key={m.user_id}
                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                          isLight ? 'border-[#ded4be] bg-[#faf6ee]' : 'border-[#262320] bg-[#1a1816]'
                        }`}
                      >
                        <div className={`h-9 w-9 rounded-full border flex items-center justify-center shrink-0 font-semibold text-xs overflow-hidden ${
                          isLight ? 'border-[#ded4be] bg-white' : 'border-[#262320] bg-[#141312]'
                        }`}>
                          {m.avatar_url ? (
                            <img src={getAvatarUrl(m.avatar_url)} alt={m.full_name || m.email} className="h-full w-full object-cover" />
                          ) : (
                            <span>{(m.full_name || m.email)?.[0]?.toUpperCase()}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate">{m.full_name || m.email}</span>
                            {m.user_id === user?.id && (
                              <span className="text-[10px] px-1.5 rounded-sm bg-[#c25e2e]/20 text-[#e87a48] font-mono">You</span>
                            )}
                          </div>
                          <p className="text-[11px] opacity-75 truncate">
                            {m.study_status || 'Studying with peers'}
                          </p>
                        </div>
                      </div>
                    ))}
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
