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
            className="group flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#07090e]/95 border border-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-xl"
            title="Open AI Technical Mentor"
          >
            {/* 3D Metallic Orb */}
            <div
              className="relative h-6 w-6 rounded-full shrink-0 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.8),0_2px_8px_rgba(0,0,0,0.6)]"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #ffffff 0%, #cbd5e1 15%, #64748b 45%, #1e293b 80%, #05070d 100%)',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.15)',
              }}
            >
              <div className="absolute inset-0 rounded-full border border-white/25 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span>AI Mentor</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-neutral-300">
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
          className="fixed inset-0 z-50 bg-[#050508]/98 backdrop-blur-3xl flex flex-col p-4 sm:p-6 text-[#f8fafc]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="relative h-8 w-8 rounded-full shrink-0 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.6)]"
                style={{
                  background:
                    'radial-gradient(circle at 35% 30%, #ffffff 0%, #cbd5e1 15%, #64748b 45%, #1e293b 80%, #05070d 100%)',
                }}
              />
              <div>
                <h2 className="text-base font-medium text-white flex items-center gap-2">
                  <span>AI Learning Studio 2.0</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                    Deep Focus Mode
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 font-normal">
                  Active Track: {activeRoadmap?.title || 'Full-Stack AI Engineer'} • Lesson:{' '}
                  {todayMission.lesson_title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetMentorSession}
                className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Chat</span>
              </button>
              <button
                type="button"
                onClick={onCloseFullscreen}
                className="px-3 py-1.5 rounded-xl bg-white text-black font-medium text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 hover:bg-neutral-200"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
              </button>
              <button
                type="button"
                onClick={onCloseFullscreen}
                className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3-Column Studio Body */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 overflow-hidden">
            {/* Left Column: Roadmap Context & Milestones (3 Cols) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col rounded-2xl bg-white/[0.02] border border-white/10 p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                <Compass className="h-4 w-4 text-white" />
                <span>Curriculum Milestones</span>
              </div>
              <div className="space-y-2">
                {activeRoadmap?.milestones?.map((ms, idx) => (
                  <div
                    key={ms.id || idx}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      ms.current
                        ? 'border-white/30 bg-white/[0.06] text-white font-medium'
                        : ms.completed
                        ? 'border-white/10 bg-white/[0.02] text-neutral-300'
                        : 'border-white/5 bg-transparent text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                      <span>Stage {String(idx + 1).padStart(2, '0')}</span>
                      <span>{ms.completed ? '✓ Completed' : ms.current ? '● In Focus' : '○ Upcoming'}</span>
                    </div>
                    <div className="text-xs line-clamp-2">{ms.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Column: Live Conversational Stream (5 Cols) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
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
                          ? 'bg-white text-black font-medium rounded-tr-xs'
                          : 'bg-white/[0.04] border border-white/10 text-neutral-200 rounded-tl-xs'
                      }`}
                    >
                      {msg.sender === 'mentor' ? (
                        <AIMessageRenderer content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isMentorTyping && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-neutral-400 text-xs w-fit">
                    <Sparkles className="h-3.5 w-3.5 text-white animate-spin" />
                    <span className="text-[11px]">Synthesizing technical response...</span>
                  </div>
                )}
              </div>

              {/* Center Input Bar */}
              <div className="p-3 border-t border-white/10 bg-white/[0.01]">
                <div className="flex items-center gap-2 rounded-xl bg-black/50 border border-white/10 px-3 py-2.5">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask architecture questions or test concepts..."
                    className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim() || isMentorTyping}
                    className="h-7 w-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Code Scratchpad & Live Notes (4 Cols) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-300 font-medium">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-white" />
                  <span>Developer Scratchpad</span>
                </div>
                <span className="text-[10px] text-neutral-500">JavaScript / TypeScript</span>
              </div>
              <textarea
                value={scratchpadCode}
                onChange={(e) => setScratchpadCode(e.target.value)}
                className="flex-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-emerald-300 leading-relaxed outline-none resize-none focus:border-white/30 transition-colors"
                spellCheck="false"
              />
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Code is saved to local session</span>
                <button
                  type="button"
                  onClick={() =>
                    sendMentorMessage(
                      `Here is code from my scratchpad for review:\n\`\`\`javascript\n${scratchpadCode}\n\`\`\``
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
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
