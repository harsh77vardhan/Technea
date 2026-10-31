import { useState, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Minimize2,
  X,
  RotateCcw,
  Code2,
  Compass,
  ArrowUp,
} from 'lucide-react'
import AIMessageRenderer from './AIMessageRenderer'
import { useDashboard } from '../../context/useDashboard'

function FloatingAIMentorCompanion({
  isDocked = true,
  onRestoreDock = () => {},
  isFullscreen = false,
  onCloseFullscreen = () => {},
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
  const [scratchpadCode, setScratchpadCode] = useState(
    '// Technea AI Scratchpad\n// Experiment with code or test solutions here\n\nfunction solution() {\n  return "Ready to build";\n}\n'
  )
  const chatScrollRef = useRef(null)

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [mentorMessages, isMentorTyping])

  const handleSend = () => {
    if (!inputText.trim() || isMentorTyping) return
    sendMentorMessage(inputText)
    setInputText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      {/* ──────────────── 1. MINIMIZED FLOATING ASSISTANT PILL ──────────────── */}
      {!isDocked && !isFullscreen && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            type="button"
            onClick={onRestoreDock}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#141312]/95 border border-[#c25e2e]/30 text-[#faf6ee] shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:border-[#c25e2e]/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-xl"
            title="Open AI Technical Mentor"
          >
            {/* 3D Warm Bronze & Burnt Orange Metallic Orb */}
            <div
              className="relative h-6 w-6 rounded-full shrink-0 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.8),0_2px_8px_rgba(0,0,0,0.6)]"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #fbf8f2 0%, #e0c8b0 18%, #8c5332 50%, #3d2315 80%, #170d07 100%)',
                boxShadow: '0 0 10px rgba(194, 94, 46, 0.25)',
              }}
            >
              <div className="absolute inset-0 rounded-full border border-[#fbf8f2]/25 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span>AI Mentor</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#c25e2e]/15 text-[#e87a48]">
                2.0
              </span>
            </div>
          </button>
        </motion.div>
      )}

      {/* ──────────────── 2. FULLSCREEN IMMERSIVE DEEP-FOCUS STUDIO ──────────────── */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#0e0d0c]/98 backdrop-blur-3xl flex flex-col p-4 sm:p-6 text-[#faf6ee]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#262320]">
            <div className="flex items-center gap-3">
              <div
                className="relative h-8 w-8 rounded-full shrink-0 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.6)]"
                style={{
                  background:
                    'radial-gradient(circle at 35% 30%, #fbf8f2 0%, #e0c8b0 18%, #8c5332 50%, #3d2315 80%, #170d07 100%)',
                }}
              />
              <div>
                <h2 className="text-base font-medium text-[#faf6ee] flex items-center gap-2">
                  <span>AI Learning Studio 2.0</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c25e2e]/15 text-[#e87a48] border border-[#c25e2e]/30">
                    Deep Focus Mode
                  </span>
                </h2>
                <p className="text-xs text-[#a8a199] font-normal">
                  Active Track: {activeRoadmap?.title || 'Full-Stack AI Engineer'} • Lesson:{' '}
                  {todayMission.lesson_title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetMentorSession}
                className="px-3 py-1.5 rounded-xl border border-[#262320] hover:bg-[#1c1a18] text-xs text-[#a8a199] hover:text-[#faf6ee] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Chat</span>
              </button>
              <button
                type="button"
                onClick={onCloseFullscreen}
                className="px-3 py-1.5 rounded-xl bg-[#c25e2e] text-[#faf6ee] font-medium text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 hover:bg-[#ad4f22]"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
              </button>
              <button
                type="button"
                onClick={onCloseFullscreen}
                className="p-2 rounded-xl border border-[#262320] hover:bg-[#1c1a18] text-[#a8a199] hover:text-[#faf6ee] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3-Column Studio Body */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 overflow-hidden">
            {/* Left Column: Roadmap Context & Milestones (3 Cols) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col rounded-2xl bg-[#141312] border border-[#262320] p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-medium text-[#faf6ee]">
                <Compass className="h-4 w-4 text-[#e87a48]" />
                <span>Curriculum Milestones</span>
              </div>
              <div className="space-y-2">
                {activeRoadmap?.milestones?.map((ms, idx) => (
                  <div
                    key={ms.id || idx}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      ms.current
                        ? 'border-[#c25e2e]/50 bg-[#c25e2e]/10 text-[#faf6ee] font-medium'
                        : ms.completed
                        ? 'border-[#262320] bg-[#1c1a18]/60 text-[#a8a199]'
                        : 'border-[#262320]/40 bg-transparent text-[#786f66]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#a8a199] mb-1">
                      <span>Stage {String(idx + 1).padStart(2, '0')}</span>
                      <span>{ms.completed ? '✓ Completed' : ms.current ? '● In Focus' : '○ Upcoming'}</span>
                    </div>
                    <div className="text-xs line-clamp-2">{ms.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Column: Live Conversational Stream (5 Cols) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col rounded-2xl bg-[#141312] border border-[#262320] overflow-hidden">
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {mentorMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                        msg.sender === 'user'
                          ? 'bg-[#c25e2e] text-[#faf6ee] font-medium rounded-tr-xs'
                          : 'bg-[#1c1a18] border border-[#2e2a26] text-[#faf6ee] rounded-tl-xs'
                      }`}
                    >
                      {msg.sender === 'mentor' ? (
                        <AIMessageRenderer content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                    <span className="text-[9px] text-[#a8a199] mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isMentorTyping && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#1c1a18] border border-[#2e2a26] text-[#a8a199] text-xs w-fit">
                    <Sparkles className="h-3.5 w-3.5 text-[#e87a48] animate-spin" />
                    <span className="text-[11px]">Synthesizing technical response...</span>
                  </div>
                )}
              </div>

              {/* Center Input Bar */}
              <div className="p-3 border-t border-[#262320] bg-[#141312]">
                <div className="flex items-center gap-2 rounded-xl bg-[#1c1a18] border border-[#2e2a26] px-3 py-2.5">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask architecture questions or test concepts..."
                    className="flex-1 bg-transparent text-xs text-[#faf6ee] placeholder-[#8c8378] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim() || isMentorTyping}
                    className="h-7 w-7 rounded-full bg-[#c25e2e] text-[#faf6ee] flex items-center justify-center hover:bg-[#ad4f22] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Code Scratchpad & Live Notes (4 Cols) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col rounded-2xl bg-[#141312] border border-[#262320] overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#faf6ee] font-medium">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#e87a48]" />
                  <span>Developer Scratchpad</span>
                </div>
                <span className="text-[10px] text-[#a8a199]">JavaScript / TypeScript</span>
              </div>
              <textarea
                value={scratchpadCode}
                onChange={(e) => setScratchpadCode(e.target.value)}
                className="flex-1 w-full bg-[#0e0d0c] border border-[#262320] rounded-xl p-3 font-mono text-xs text-[#f4eee2] leading-relaxed outline-none resize-none focus:border-[#c25e2e]/50 transition-colors"
                spellCheck="false"
              />
              <div className="flex items-center justify-between text-[11px] text-[#a8a199]">
                <span>Code is saved to local session</span>
                <button
                  type="button"
                  onClick={() =>
                    sendMentorMessage(
                      `Here is code from my scratchpad for review:\n\`\`\`javascript\n${scratchpadCode}\n\`\`\``
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-[#c25e2e] hover:bg-[#ad4f22] text-[#faf6ee] font-medium transition-colors cursor-pointer"
                >
                  Send to Mentor ⚡
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(FloatingAIMentorCompanion)
