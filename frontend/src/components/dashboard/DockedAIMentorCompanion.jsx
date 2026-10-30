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
      className="flex flex-col h-full justify-between gap-4 overflow-hidden text-[#0f172a]"
    >
      {/* ──────────────── Header: AI Mentor 2.0 + Synced Status ──────────────── */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-[#ded4f4] border border-[#c7d2fe] flex items-center justify-center text-[#7c3aed]">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-extrabold text-[#0f172a] tracking-tight">AI Mentor 2.0</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-mono text-emerald-700 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Synced</span>
          </div>

          <button
            type="button"
            onClick={onResetSession}
            title="Reset conversation session"
            className="h-6 w-6 rounded-md border border-[#cbd5e1] bg-white text-[#64748b] hover:text-[#0f172a] hover:bg-neutral-50 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ──────────────── Middle: Prompt Area + Chat Stream ──────────────── */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        <label
          htmlFor="docked-mentor-input"
          className="text-xs font-mono text-[#64748b] font-medium tracking-wide"
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
                      ? 'bg-[#ded4f4] border border-[#c7d2fe] text-[#1e1b4b] font-mono font-medium shadow-xs'
                      : 'bg-white border border-[#e2e8f0] text-[#1e293b] shadow-xs'
                  }`}
                >
                  <AIMessageRenderer content={msg.text} theme={isUser ? 'light' : 'light'} />
                </div>
              </div>
            )
          })}

          {isMentorTyping && (
            <div className="flex items-center gap-2 rounded-xl bg-white border border-[#e2e8f0] px-3 py-2 text-xs text-[#64748b] font-mono shadow-xs">
              <Sparkles className="h-3 w-3 text-[#7c3aed] animate-spin" />
              <span>Mentor is analyzing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Box */}
        <form onSubmit={handleSubmit} className="relative mt-2 shrink-0">
          <div className="relative rounded-xl border border-[#cbd5e1] bg-white focus-within:border-[#7c3aed] focus-within:ring-2 focus-within:ring-[#7c3aed]/20 transition-all shadow-xs">
            <textarea
              id="docked-mentor-input"
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="how do I use flex-direction: column?"
              className="w-full bg-transparent px-3 py-2 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none resize-none font-mono"
            />
            <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5">
              <span className="text-[10px] font-mono text-[#94a3b8]">Press Enter ↵</span>
              <button
                type="submit"
                disabled={!inputValue.trim() || isMentorTyping}
                className="h-6 w-6 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 disabled:hover:bg-[#7c3aed] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Send message to AI Mentor"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ──────────────── Bottom: Quick Action Pills ──────────────── */}
      <div className="space-y-2 shrink-0 pt-2 border-t border-[#e2e8f0]">
        {quickActionPills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => handlePillClick(pill)}
            disabled={isMentorTyping}
            className="w-full rounded-xl border border-[#c7d2fe] bg-[#ded4f4] hover:bg-[#c7d2fe] text-[#3730a3] hover:text-[#1e1b4b] py-2 px-3 text-xs font-mono font-medium text-center transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
          >
            {pill}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default memo(DockedAIMentorCompanion)
