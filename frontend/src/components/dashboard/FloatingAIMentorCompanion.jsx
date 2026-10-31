import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Sparkles,
  Send,
  Minimize2,
  Maximize2,
  X,
  RotateCcw,
  Code2,
  Lightbulb,
  Target,
  FileText,
  Compass,
} from 'lucide-react'
import AIMessageRenderer from './AIMessageRenderer'
import { useDashboard } from '../../context/useDashboard'

export default function FloatingAIMentorCompanion() {
  const {
    activeRoadmap,
    todayMission,
    mentorMessages,
    isMentorTyping,
    sendMentorMessage,
    resetMentorSession,
  } = useDashboard()

  // State: 'minimized' | 'expanded' | 'fullscreen'
  const [viewState, setViewState] = useState('minimized')
  const [inputText, setInputText] = useState('')
  const [scratchpadCode, setScratchpadCode] = useState(
    '// Technea AI Scratchpad\n// Experiment with code or test solutions here\n\nfunction solution() {\n  return "Ready to build";\n}\n'
  )
  const chatScrollRef = useRef(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [mentorMessages, isMentorTyping])

  // Contextual quick chips
  const quickActions = [
    {
      id: 'explain',
      label: 'Explain concept',
      icon: Lightbulb,
      prompt: `Can you explain the core architectural principles of "${todayMission.lesson_title}" in clear, practical terms with a concise code example?`,
    },
    {
      id: 'challenge',
      label: 'Practice challenge',
      icon: Target,
      prompt: `Give me a targeted 15-minute coding challenge based on "${todayMission.lesson_title}" with requirements and hints.`,
    },
    {
      id: 'code-review',
      label: 'Review my code',
      icon: Code2,
      prompt: `Please review my current implementation for "${todayMission.lesson_title}". What are the performance, security, and edge-case considerations?`,
    },
    {
      id: 'summary',
      label: 'Summarize lesson',
      icon: FileText,
      prompt: `Provide an executive summary of "${todayMission.lesson_title}" with the 3 most crucial takeaways for production engineers.`,
    },
  ]

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

  const handleQuickAction = (prompt) => {
    if (viewState === 'minimized') {
      setViewState('expanded')
    }
    sendMentorMessage(prompt)
  }

  return (
    <AnimatePresence>
      {/* ──────────────── 1. MINIMIZED FLOATING BUTTON ──────────────── */}
      {viewState === 'minimized' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
        >
          {/* Quick Prompt Pill visible on hover */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a0d14]/90 border border-white/10 shadow-lg text-xs font-mono text-neutral-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] truncate max-w-[140px]">
              {todayMission.lesson_title}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setViewState('expanded')}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-xs shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
            title="Open AI Technical Mentor 2.0"
          >
            {/* Ambient Pulse Ring */}
            <span className="absolute -inset-1 rounded-full bg-violet-500/20 animate-ping pointer-events-none" />

            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-mono tracking-wide">AI Mentor</span>
            <span className="inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-mono uppercase tracking-wider font-bold">
              2.0
            </span>
          </button>
        </motion.div>
      )}

      {/* ──────────────── 2. EXPANDED FLOATING WINDOW / DRAWER ──────────────── */}
      {viewState === 'expanded' && (
        <motion.aside
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          aria-label="AI Technical Mentor Assistant"
          className="fixed bottom-6 right-6 z-40 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl bg-[#07090e]/95 border border-white/10 shadow-[0_12px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col overflow-hidden text-[#f8fafc]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
                <Bot className="h-4 w-4 text-violet-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold font-mono tracking-wide text-white">
                  <span>AI Mentor 2.0</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[190px]">
                  {activeRoadmap?.title || 'Technea OS'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-neutral-400">
              <button
                type="button"
                onClick={resetMentorSession}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Reset conversation context"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewState('fullscreen')}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Expand to Fullscreen Studio"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewState('minimized')}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Minimize Mentor"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Context Ribbon */}
          <div className="px-4 py-1.5 bg-violet-950/20 border-b border-violet-900/20 flex items-center justify-between text-[10px] font-mono text-violet-300">
            <span className="truncate max-w-[240px]">
              Target: {todayMission.lesson_title}
            </span>
            <span className="shrink-0">{todayMission.progress_percent}% synced</span>
          </div>

          {/* Messages Feed */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed"
          >
            {mentorMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white/[0.04] border border-white/10 text-neutral-200 rounded-tl-xs'
                  }`}
                >
                  {msg.sender === 'mentor' ? (
                    <AIMessageRenderer content={msg.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isMentorTyping && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-neutral-400 text-xs w-fit">
                <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-spin" />
                <span className="font-mono text-[11px]">Synthesizing guidance...</span>
              </div>
            )}
          </div>

          {/* Quick Action Chips */}
          <div className="p-2 border-t border-white/5 bg-black/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickActions.map((act) => {
              const Icon = act.icon
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleQuickAction(act.prompt)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[10px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{act.label}</span>
                </button>
              )
            })}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-3 py-2 focus-within:border-violet-500/60 transition-colors">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about active milestone or paste code..."
                className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 outline-none font-sans"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() || isMentorTyping}
                className="p-1.5 rounded-lg bg-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors cursor-pointer"
                title="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}

      {/* ──────────────── 3. FULLSCREEN IMMERSIVE DEEP-FOCUS STUDIO ──────────────── */}
      {viewState === 'fullscreen' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#050508]/98 backdrop-blur-3xl flex flex-col p-4 sm:p-6 text-[#f8fafc]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
                <Bot className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <h2 className="text-base font-extrabold font-mono tracking-tight text-white flex items-center gap-2">
                  <span>AI Learning Studio 2.0</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Deep Focus Mode
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 font-mono">
                  Active Track: {activeRoadmap?.title} • Milestone: {todayMission.lesson_title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetMentorSession}
                className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setViewState('expanded')}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-mono text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
              </button>
              <button
                type="button"
                onClick={() => setViewState('minimized')}
                className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Minimize"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3-Column Studio Body */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 overflow-hidden">
            {/* Left Column: Roadmap Context & Milestones (3 Cols) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col rounded-2xl bg-white/[0.02] border border-white/10 p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                <Compass className="h-4 w-4 text-violet-400" />
                <span>Curriculum Milestones</span>
              </div>
              <div className="space-y-2">
                {activeRoadmap?.milestones?.map((ms, idx) => (
                  <div
                    key={ms.id || idx}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                      ms.current
                        ? 'border-violet-500/50 bg-violet-950/20 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                        : ms.completed
                        ? 'border-emerald-500/30 bg-emerald-950/10 text-neutral-300'
                        : 'border-white/5 bg-white/[0.01] text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                      <span>Node {String(idx + 1).padStart(2, '0')}</span>
                      <span>{ms.completed ? '✓ Completed' : ms.current ? '● In Focus' : '○ Locked'}</span>
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
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white/[0.04] border border-white/10 text-neutral-200 rounded-tl-xs'
                      }`}
                    >
                      {msg.sender === 'mentor' ? (
                        <AIMessageRenderer content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isMentorTyping && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-neutral-400 text-xs w-fit">
                    <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-spin" />
                    <span className="font-mono text-[11px]">Synthesizing technical response...</span>
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
                    className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim() || isMentorTyping}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-mono hover:bg-violet-500 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Send ↵
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Code Scratchpad & Live Notes (4 Cols) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-indigo-400" />
                  <span>Developer Scratchpad</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-normal">JavaScript / Pseudo</span>
              </div>
              <textarea
                value={scratchpadCode}
                onChange={(e) => setScratchpadCode(e.target.value)}
                className="flex-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-emerald-300 leading-relaxed outline-none resize-none focus:border-indigo-500/50 transition-colors"
                spellCheck="false"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Code is saved to local session</span>
                <button
                  type="button"
                  onClick={() => handleQuickAction(`Here is code from my scratchpad for review:\n\`\`\`javascript\n${scratchpadCode}\n\`\`\``)}
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
