import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  Code2,
} from 'lucide-react'

/**
 * Basic syntax token colorizer for code lines
 */
function renderHighlightedLine(line) {
  // If comment
  if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
    return <span className="text-neutral-500 italic">{line}</span>
  }

  // Keywords across python / js / cpp / java
  const keywords = [
    'def', 'return', 'import', 'from', 'as', 'for', 'in', 'while', 'if', 'else',
    'elif', 'class', 'const', 'let', 'function', 'async', 'await', 'export',
    'public', 'static', 'void', 'int', 'double', 'include', 'using', 'namespace',
    'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY'
  ]

  // Split line by words/symbols while preserving delimiters
  const tokens = line.split(/(\s+|[(),.:;[\]{}="'])/)

  return tokens.map((token, i) => {
    if (keywords.includes(token)) {
      return (
        <span key={i} className="text-sky-400 font-semibold">
          {token}
        </span>
      )
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      return (
        <span key={i} className="text-amber-300">
          {token}
        </span>
      )
    }
    if (token === 'print' || token === 'console' || token === 'System' || token === 'std') {
      return (
        <span key={i} className="text-emerald-400 font-medium">
          {token}
        </span>
      )
    }
    if (token === 'sum' || token === 'len' || token === 'log' || token === 'out') {
      return (
        <span key={i} className="text-purple-300">
          {token}
        </span>
      )
    }
    return <span key={i}>{token}</span>
  })
}

export default function InteractiveCodeShowcase({ theme }) {
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [outputVisible, setOutputVisible] = useState(true)
  const [runCount, setRunCount] = useState(1)

  const filename = theme.filename || 'main.py'
  const code = theme.codeSnippet || ''
  const output = theme.executionOutput || theme.terminalOutput || 'Process finished with exit code 0'
  const lines = code.split('\n')

  const handleCopy = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [code])

  const handleRun = useCallback(() => {
    setIsRunning(true)
    setOutputVisible(false)
    setTimeout(() => {
      setIsRunning(false)
      setOutputVisible(true)
      setRunCount((c) => c + 1)
    }, 450)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/15 bg-[#0a0c10] shadow-2xl overflow-hidden group flex flex-col backdrop-blur-xl"
    >
      {/* ── WINDOW HEADER (macOS Dots + Tab + Run / Copy CTAs) ─────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.08]">
        {/* Left: Window Controls + Active File Tab */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>

          <div className="h-3.5 w-px bg-white/10 mx-0.5" />

          {/* Active File Tab */}
          <div className="flex items-center gap-1.5 rounded-md bg-white/[0.06] border border-white/10 px-2.5 py-1 text-xs font-mono text-white">
            <Code2 className="h-3 w-3 text-sky-400" />
            <span className="font-medium text-[11px]">{filename}</span>
          </div>
        </div>

        {/* Right: Interactive Actions (Run Code & Copy) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Copy snippet"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-2.5 py-1 text-[11px] font-mono font-semibold text-black hover:bg-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            title="Execute code in interactive sandbox"
          >
            {isRunning ? (
              <>
                <RotateCcw className="h-3 w-3 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-black" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── CODE EDITOR WORKSPACE (Line Numbers + Formatted Tokens) ────────── */}
      <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed text-neutral-300 bg-[#07080b] overflow-x-auto min-h-[160px]">
        <div className="table w-full">
          {lines.map((lineText, idx) => (
            <div key={idx} className="table-row group/line hover:bg-white/[0.02]">
              {/* Line number gutter */}
              <span className="table-cell pr-4 text-right select-none text-neutral-600 group-hover/line:text-neutral-500 w-6 text-[11px]">
                {idx + 1}
              </span>
              {/* Code line */}
              <span className="table-cell whitespace-pre font-mono">
                {renderHighlightedLine(lineText, theme.type)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE INTERACTIVE TERMINAL OUTPUT DRAWER ────────────────────────── */}
      <div className="border-t border-white/[0.08] bg-black/60 p-3 sm:px-4 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[10px] text-neutral-500 pb-1 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-neutral-400" />
            <span className="uppercase tracking-wider font-semibold text-neutral-400">
              Interactive Output Console
            </span>
          </div>

          <span className="text-[10px] text-emerald-400/90 font-mono">
            ● Executed in 0.04s (Run #{runCount})
          </span>
        </div>

        <AnimatePresence mode="wait">
          {outputVisible ? (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-neutral-200 font-mono space-y-0.5 pt-0.5 leading-relaxed"
            >
              <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs text-emerald-300/90">
                {output}
              </pre>
            </motion.div>
          ) : (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-1 text-xs text-neutral-400 font-mono flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Executing snippet in sandbox...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
