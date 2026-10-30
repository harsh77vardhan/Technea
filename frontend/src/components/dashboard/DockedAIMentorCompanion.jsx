import { useState, useRef, useEffect, memo } from 'react'
import { Send, Bot, Sparkles, RefreshCw } from 'lucide-react'
import AIMessageRenderer from './AIMessageRenderer'

/**
 * DockedAIMentorCompanion
 *
 * Implements the right docked companion panel matching `techneadashboardfinal1.png`:
 * - Header: "AI Mentor 2.0" with "🟢 Synced" telemetry
 * - Prompt label: "Ask your AI Mentor..."
 * - Input text area / chat feed with live typing
 * - Bottom quick action pills: "Review my code", "Explain this concept", "Quiz me"
 */
function DockedAIMentorCompanion({
  messages = [],
  isMentorTyping = false,
  onSendMessage = () => {},
  onResetSession = () => {},
}) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  const quickActionPills = [
    'Review my code',
    'Explain this concept',
    'Quiz me',
  ]

  // Auto-scroll to bottom of recent conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isMentorTyping])

  const handleSubmit = (e) => {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed || isMentorTyping) return
    onSendMessage(trimmed)
    setInputValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handlePillClick = (prompt) => {
    if (isMentorTyping) return
    onSendMessage(prompt)
  }

  // Filter messages for compact docked display (last 4 messages for clean readability)
  const displayMessages = messages.slice(-4)

  return (
    <aside
      aria-label="AI Mentor Companion"
      className="flex flex-col h-full justify-between gap-4 overflow-hidden"
    >
      {/* ──────────────── Header: AI Mentor 2.0 + Synced Status ──────────────── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight">AI Mentor 2.0</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/20 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>Synced</span>
          </div>

          <button
            type="button"
            onClick={onResetSession}
            title="Reset conversation session"
            className="h-6 w-6 rounded-md border border-white/10 bg-white/[0.04] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ──────────────── Middle: Prompt Area + Chat Stream ──────────────── */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        <label
          htmlFor="docked-mentor-input"
          className="text-xs font-mono text-neutral-400 font-medium tracking-wide"
        >
          Ask your AI Mentor...
        </label>

        {/* Scrollable conversation stream preview */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
          {displayMessages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-violet-600/30 border border-violet-500/40 text-white font-mono'
                      : 'bg-white/[0.05] border border-white/[0.08] text-neutral-200'
                  }`}
                >
                  <AIMessageRenderer content={msg.text} />
                </div>
              </div>
            )
          })}

          {isMentorTyping && (
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-xs text-neutral-400 font-mono">
              <Sparkles className="h-3 w-3 text-violet-400 animate-spin" />
              <span>Mentor is analyzing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Box */}
        <form onSubmit={handleSubmit} className="relative mt-2 shrink-0">
          <div className="relative rounded-xl border border-white/[0.12] bg-[#0c101a]/90 backdrop-blur-xl focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all shadow-inner">
            <textarea
              id="docked-mentor-input"
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="how do I use flex-direction: column?"
              className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none resize-none font-mono"
            />
            <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5">
              <span className="text-[10px] font-mono text-neutral-400">Press Enter ↵</span>
              <button
                type="submit"
                disabled={!inputValue.trim() || isMentorTyping}
                className="h-6 w-6 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                aria-label="Send message to AI Mentor"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ──────────────── Bottom: Quick Action Pills ──────────────── */}
      <div className="space-y-2 shrink-0 pt-1 border-t border-white/[0.06]">
        {quickActionPills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => handlePillClick(pill)}
            disabled={isMentorTyping}
            className="w-full rounded-xl border border-violet-500/25 bg-[#171a2a]/70 hover:bg-violet-900/30 hover:border-violet-400/50 text-violet-200 hover:text-white py-2 px-3 text-xs font-mono font-medium text-center transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {pill}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default memo(DockedAIMentorCompanion)
