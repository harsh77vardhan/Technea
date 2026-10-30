import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

/**
 * Parses markdown-formatted text into structured blocks
 * (fenced code, headers, unordered/ordered lists, blockquotes, and paragraphs).
 * Zero external markdown library dependencies.
 */
function parseBlocks(markdown) {
  if (!markdown) return []
  const lines = String(markdown).split(/\r?\n/)
  const blocks = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // 1. Fenced code block (```lang ... ```)
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length) {
        if (lines[i].trim().startsWith('```')) {
          i++
          break
        }
        codeLines.push(lines[i])
        i++
      }
      blocks.push({
        type: 'code',
        language: language || 'code',
        code: codeLines.join('\n'),
      })
      continue
    }

    // 2. Empty / blank line
    if (!trimmed) {
      i++
      continue
    }

    // 3. Headers: #, ##, ###, ####
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (headerMatch) {
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        content: headerMatch[2].trim(),
      })
      i++
      continue
    }

    // 4. Blockquotes: > text
    if (line.startsWith('>')) {
      const quoteLines = []
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      blocks.push({
        type: 'blockquote',
        content: quoteLines.join('\n'),
      })
      continue
    }

    // 5. Unordered List items (- or *)
    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.+)$/)
    if (bulletMatch) {
      const items = []
      while (i < lines.length) {
        const itemMatch = lines[i].match(/^(\s*)([-*+])\s+(.+)$/)
        if (itemMatch) {
          items.push(itemMatch[3])
          i++
        } else if (lines[i].trim() === '') {
          if (i + 1 < lines.length && lines[i + 1].match(/^(\s*)([-*+])\s+/)) {
            i++
            continue
          }
          break
        } else if (lines[i].startsWith('   ') || lines[i].startsWith('\t')) {
          if (items.length > 0) {
            items[items.length - 1] += '\n' + lines[i].trim()
          }
          i++
        } else {
          break
        }
      }
      blocks.push({
        type: 'unordered-list',
        items,
      })
      continue
    }

    // 6. Ordered List items (1. 2. etc.)
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/)
    if (orderedMatch) {
      const items = []
      while (i < lines.length) {
        const itemMatch = lines[i].match(/^(\s*)(\d+)\.\s+(.+)$/)
        if (itemMatch) {
          items.push(itemMatch[3])
          i++
        } else if (lines[i].trim() === '') {
          if (i + 1 < lines.length && lines[i + 1].match(/^(\s*)(\d+)\.\s+/)) {
            i++
            continue
          }
          break
        } else {
          break
        }
      }
      blocks.push({
        type: 'ordered-list',
        items,
      })
      continue
    }

    // 7. Regular paragraph
    const pLines = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].match(/^#{1,4}\s+/) &&
      !lines[i].startsWith('>') &&
      !lines[i].match(/^(\s*)([-*+]|\d+\.)\s+/)
    ) {
      pLines.push(lines[i])
      i++
    }
    if (pLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: pLines.join('\n'),
      })
    }
  }

  return blocks
}

/**
 * Handles inline markdown formatting:
 * - `inline code`
 * - **bold** or __bold__
 * - [links](url)
 * - line breaks
 */
function renderInline(text) {
  if (!text) return null

  const pattern = /(`[^`\n]+`)|(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\[([^\]]+)\]\(([^)]+)\))/g
  const elements = []
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(renderPlainText(text.slice(lastIndex, match.index), `txt-${lastIndex}`))
    }

    const key = `el-${match.index}`
    if (match[1]) {
      // Inline code
      const codeContent = match[1].slice(1, -1)
      elements.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded-[4px] bg-[#14151D] border border-white/[0.08] text-[11px] sm:text-[12px] font-mono text-[#EDEDED] break-words"
        >
          {codeContent}
        </code>
      )
    } else if (match[2]) {
      // Bold **
      elements.push(
        <strong key={key} className="font-semibold text-white">
          {match[3]}
        </strong>
      )
    } else if (match[4]) {
      // Bold __
      elements.push(
        <strong key={key} className="font-semibold text-white">
          {match[5]}
        </strong>
      )
    } else if (match[6]) {
      // Link [text](url)
      elements.push(
        <a
          key={key}
          href={match[8]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-200 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors font-medium"
        >
          {match[7]}
        </a>
      )
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    elements.push(renderPlainText(text.slice(lastIndex), `txt-${lastIndex}`))
  }

  return elements
}

function renderPlainText(text, keyPrefix) {
  if (!text.includes('\n')) {
    return <span key={keyPrefix}>{text}</span>
  }
  const lines = text.split('\n')
  return (
    <span key={keyPrefix}>
      {lines.map((line, idx) => (
        <span key={`${keyPrefix}-${idx}`}>
          {line}
          {idx < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  )
}

/**
 * Fenced Code Block with Dark Header, Language Badge, and One-Click Copy
 */
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = code
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('Failed to copy code to clipboard:', err)
    }
  }

  const langLabel = language ? language.toLowerCase().trim() : 'code'

  return (
    <div
      role="region"
      aria-label={`Code snippet (${langLabel})`}
      className="my-3 rounded-[8px] border border-white/[0.08] bg-[#0A0B0E] overflow-hidden text-left shadow-sm"
    >
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#12131A] border-b border-white/[0.06]">
        <span className="text-[11px] font-mono font-medium text-[#A1A1AA] tracking-wider uppercase">
          {langLabel}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-[36px] sm:min-h-[28px] items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Copy code to clipboard"
          aria-label={copied ? "Code copied to clipboard" : `Copy ${langLabel} code to clipboard`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono text-[10px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px]">Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div
        data-lenis-prevent
        className="relative overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <pre className="p-3.5 sm:p-4 text-[12px] sm:text-[13px] font-mono text-[#EDEDED] leading-relaxed selection:bg-white/20 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

/**
 * Lightweight, robust React 19 component to render AI messages
 * with markdown formatting, syntax code blocks, copy-to-clipboard,
 * lists, headers, and clean paragraph spacing.
 */
export default function AIMessageRenderer({ content, className = '', theme = 'dark' }) {
  const rawText = typeof content === 'string' ? content : content?.text || ''
  if (!rawText) return null

  const isLight = theme === 'light'
  const blocks = parseBlocks(rawText)

  const header1Color = isLight ? 'text-[#0f172a]' : 'text-white'
  const header23Color = isLight ? 'text-[#1e293b]' : 'text-[#EDEDED]'
  const textColor = isLight ? 'text-[#334155]' : 'text-[#EDEDED]'
  const bulletColor = isLight ? 'bg-[#94a3b8]' : 'bg-[#A1A1AA]'
  const quoteColor = isLight ? 'text-[#475569] border-[#cbd5e1]' : 'text-[#A1A1AA] border-white/20'

  return (
    <div className={`ai-message-content space-y-2 text-left ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'code':
            return <CodeBlock key={idx} language={block.language} code={block.code} />

          case 'header': {
            if (block.level === 1) {
              return (
                <h1 key={idx} className={`text-base sm:text-lg font-bold ${header1Color} mt-4 mb-2 tracking-tight`}>
                  {renderInline(block.content)}
                </h1>
              )
            }
            if (block.level === 2) {
              return (
                <h2 key={idx} className={`text-sm sm:text-base font-bold ${header23Color} mt-3.5 mb-1.5 tracking-tight`}>
                  {renderInline(block.content)}
                </h2>
              )
            }
            if (block.level === 3) {
              return (
                <h3 key={idx} className={`text-xs sm:text-sm font-semibold ${header23Color} mt-3 mb-1`}>
                  {renderInline(block.content)}
                </h3>
              )
            }
            return (
              <h4 key={idx} className={`text-xs font-semibold ${header23Color} mt-2 mb-1`}>
                {renderInline(block.content)}
              </h4>
            )
          }

          case 'unordered-list':
            return (
              <ul key={idx} className="my-2 space-y-1.5 pl-0.5">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className={`flex items-start gap-2 text-xs sm:text-sm ${textColor} leading-relaxed`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${bulletColor} shrink-0 mt-2`} aria-hidden="true" />
                    <span className="flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            )

          case 'ordered-list':
            return (
              <ol key={idx} className="my-2 space-y-1.5 pl-0.5">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className={`flex items-start gap-2 text-xs sm:text-sm ${textColor} leading-relaxed`}>
                    <span className={`font-mono text-[11px] font-semibold ${isLight ? 'text-[#64748b]' : 'text-[#A1A1AA]'} shrink-0 min-w-[16px] text-right mt-0.5`}>
                      {itemIdx + 1}.
                    </span>
                    <span className="flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            )

          case 'blockquote':
            return (
              <blockquote key={idx} className={`my-2.5 border-l-2 pl-3 py-1 text-xs sm:text-sm italic ${quoteColor}`}>
                {renderInline(block.content)}
              </blockquote>
            )

          case 'paragraph':
          default:
            return (
              <p key={idx} className={`text-xs sm:text-sm ${textColor} leading-relaxed my-2 first:mt-0 last:mb-0`}>
                {renderInline(block.content)}
              </p>
            )
        }
      })}
    </div>
  )
}
