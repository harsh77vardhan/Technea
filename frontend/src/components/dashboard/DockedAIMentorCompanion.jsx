import { useState, useRef, useEffect, memo } from 'react'
import {
  Minus,
  Maximize2,
  ArrowUp,
  Sparkles,
  ChevronRight,
  RotateCcw,
  MessageSquare,
  FileText,
} from 'lucide-react'
import AIMessageRenderer from './AIMessageRenderer'
import { useDashboard } from '../../context/useDashboard'

function DockedAIMentorCompanion({
  onMinimize = () => {},
  onExpand = () => {},
}) {
  const {
    activeRoadmap,
    todayMission,
    mentorMessages,
    isMentorTyping,
    sendMentorMessage,
    resetMentorSession,
  } = useDashboard()

  const [inputText, setInputText] = useState('')
  const [activeView, setActiveView] = useState('context') // 'context' | 'chat'
  const chatScrollRef = useRef(null)

  // Auto-scroll chat when in chat view
  useEffect(() => {
    if (activeView === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [mentorMessages, isMentorTyping, activeView])

  const handleSend = () => {
    const trimmed = inputText.trim()
    if (!trimmed || isMentorTyping) return
    setActiveView('chat')
    sendMentorMessage(trimmed)
    setInputText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (label, prompt) => {
    setActiveView('chat')
    sendMentorMessage(prompt || `Can you help me with: ${label} for ${todayMission.lesson_title}?`)
  }

  const quickActions = [
    {
      id: 'recap',
      label: 'Recap this lesson',
      prompt: `Provide a concise architectural recap of "${todayMission.lesson_title}". Highlight key patterns and code considerations.`,
    },
    {
      id: 'review',
      label: 'Review my code',
      prompt: `Please review my implementation approach for "${todayMission.lesson_title}". What security and performance aspects should I watch for?`,
    },
    {
      id: 'quiz',
      label: 'Quiz me',
      prompt: `Quiz me with 3 rapid questions on "${todayMission.lesson_title}" to test my mastery.`,
    },
    {
      id: 'plan',
      label: 'Plan my week',
      prompt: `Based on my current progress in "${activeRoadmap?.title || 'Full-Stack AI Engineer'}", suggest an optimal 5-day learning schedule.`,
    },
  ]

  return (
    <aside
      aria-label="AI Technical Mentor"
      className="flex flex-col h-full justify-between bg-[#141312] border-l border-[#262320] text-[#faf6ee] select-none p-6 relative overflow-hidden"
    >
      {/* ──────────────── TOP HEADER ──────────────── */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* 3D Warm Bronze & Burnt Orange Metallic Orb */}
            <div
              className="relative h-8 w-8 rounded-full shrink-0 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.6)]"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #fbf8f2 0%, #e0c8b0 18%, #8c5332 50%, #3d2315 80%, #170d07 100%)',
                boxShadow: '0 0 14px rgba(194, 94, 46, 0.25)',
              }}
            >
              <div className="absolute inset-0 rounded-full border border-[#fbf8f2]/25 pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#faf6ee] tracking-tight">
                  AI Mentor
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#c25e2e]/15 border border-[#c25e2e]/30 text-[#e87a48]">
                  2.0
                </span>
              </div>
              <p className="text-xs text-[#a8a199] font-normal mt-0.5">
                Aware of your current lesson
              </p>
            </div>
          </div>

          {/* Top Right Controls: Minimize & Expand */}
          <div className="flex items-center gap-1 text-[#a8a199] pt-0.5">
            <button
              type="button"
              onClick={onMinimize}
              className="p-1 rounded-md hover:text-[#faf6ee] hover:bg-[#faf6ee]/5 transition-colors cursor-pointer"
              title="Minimize panel"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onExpand}
              className="p-1 rounded-md hover:text-[#faf6ee] hover:bg-[#faf6ee]/5 transition-colors cursor-pointer"
              title="Expand to Fullscreen Studio"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* View Toggle (Context vs Chat) if user has messages */}
        {mentorMessages.length > 1 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1c1a18] border border-[#262320] text-xs">
            <button
              type="button"
              onClick={() => setActiveView('context')}
              className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeView === 'context'
                  ? 'bg-[#c25e2e]/15 text-[#e87a48] font-medium border border-[#c25e2e]/30'
                  : 'text-[#a8a199] hover:text-[#faf6ee]'
              }`}
            >
              <FileText className="h-3 w-3" />
              <span>Context</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('chat')}
              className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeView === 'chat'
                  ? 'bg-[#c25e2e]/15 text-[#e87a48] font-medium border border-[#c25e2e]/30'
                  : 'text-[#a8a199] hover:text-[#faf6ee]'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>Chat</span>
            </button>
          </div>
        )}

        {/* ──────────────── VIEW A: CONTEXT VIEW (EXACT REFERENCE REPLICA) ──────────────── */}
        {activeView === 'context' && (
          <div className="space-y-6 pt-1">
            {/* Learning Context Section */}
            <div>
              <h4 className="text-xs text-[#a8a199] font-normal mb-3">
                Learning context
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#a8a199]">Lesson</span>
                  <span className="text-[#faf6ee] font-normal truncate max-w-[170px]">
                    {todayMission?.lesson_title || 'JWT authentication'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a8a199]">Project</span>
                  <span className="text-[#faf6ee] font-normal truncate max-w-[170px]">
                    {activeRoadmap?.current_milestone?.title || 'Task API'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a8a199]">· Focus area</span>
                  <span className="text-[#faf6ee] font-normal truncate max-w-[170px]">
                    Token expiry &amp; security
                  </span>
                </div>
              </div>

              {/* Thin hairline divider */}
              <div className="border-b border-[#262320] my-5" />

              {/* Context Note matching reference */}
              <p className="text-sm leading-relaxed text-[#faf6ee]">
                <span className="text-[#faf6ee] font-normal">
                  You&apos;re two steps from finishing today&apos;s mission.{' '}
                </span>
                <span className="text-[#a8a199] font-normal">
                  Want a short recap of token verification before you continue?
                </span>
              </p>
            </div>

            {/* Quick Actions List */}
            <div>
              <h4 className="text-xs text-[#a8a199] font-normal mb-2.5">
                Quick actions
              </h4>

              <div className="space-y-1">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleQuickAction(action.label, action.prompt)}
                    className="w-full flex items-center justify-between py-2 text-xs text-[#faf6ee] hover:text-[#e87a48] transition-colors cursor-pointer group"
                  >
                    <span>{action.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#a8a199] group-hover:text-[#e87a48] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── VIEW B: LIVE CHAT STREAM ──────────────── */}
        {activeView === 'chat' && (
          <div className="flex flex-col h-[380px] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#262320] text-[11px] text-[#a8a199]">
              <span>Synchronized Session</span>
              <button
                type="button"
                onClick={resetMentorSession}
                className="hover:text-[#faf6ee] transition-colors cursor-pointer flex items-center gap-1"
                title="Reset conversation"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs"
            >
              {mentorMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-[#c25e2e] text-[#faf6ee] font-medium'
                        : 'bg-[#1c1a18] border border-[#2e2a26] text-[#faf6ee]'
                    }`}
                  >
                    {msg.sender === 'mentor' ? (
                      <AIMessageRenderer content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {isMentorTyping && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#1c1a18] border border-[#2e2a26] text-[#a8a199] text-xs w-fit">
                  <Sparkles className="h-3.5 w-3.5 text-[#e87a48] animate-spin" />
                  <span className="font-mono text-[11px]">Synthesizing...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ──────────────── BOTTOM INPUT PILL IN BURNT ORANGE PALETTE ──────────────── */}
      <div className="pt-4">
        <div className="flex items-center justify-between gap-2 rounded-full bg-[#1c1a18] border border-[#2e2a26] px-4 py-2 focus-within:border-[#c25e2e]/50 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your lesson, code, or plan..."
            className="flex-1 bg-transparent text-xs text-[#faf6ee] placeholder-[#8c8378] outline-none font-normal"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isMentorTyping}
            className="h-7 w-7 rounded-full bg-[#c25e2e] text-[#faf6ee] flex items-center justify-center shrink-0 hover:bg-[#ad4f22] disabled:opacity-40 transition-all cursor-pointer shadow-md"
            title="Send"
          >
            <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default memo(DockedAIMentorCompanion)
