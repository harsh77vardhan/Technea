import { Component, useState } from 'react'
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Terminal,
  ChevronDown,
  Copy,
  Check,
} from 'lucide-react'
import { TechneaIcon } from '../layout/TechneaLogo'

/**
 * Technical details collapsible block with copy button
 */
function TechnicalDetails({ error, errorInfo }) {
  const [copied, setCopied] = useState(false)

  const errorText = [
    error?.toString() || 'Unknown error',
    error?.stack ? `\nStack trace:\n${error.stack}` : '',
    errorInfo?.componentStack ? `\nComponent stack:\n${errorInfo.componentStack}` : '',
  ].filter(Boolean).join('\n')

  const handleCopy = () => {
    if (!navigator?.clipboard) return
    navigator.clipboard.writeText(errorText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <details className="group w-full rounded-xl border border-white/[0.08] bg-black/40 text-left overflow-hidden transition-all">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/[0.03] transition-colors select-none">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-rose-400" />
          <span>Diagnostic Telemetry & Trace</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180 text-neutral-500" />
      </summary>

      <div className="border-t border-white/[0.06] p-4 bg-[#0a0c10]/95 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Error Signature
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Trace</span>
              </>
            )}
          </button>
        </div>

        <pre className="max-h-56 overflow-auto rounded-lg bg-black/80 p-3 font-mono text-[11px] leading-relaxed text-rose-300/90 whitespace-pre-wrap break-all border border-rose-500/10">
          {errorText}
        </pre>
      </div>
    </details>
  )
}

/**
 * Sleek Technea Dark Branded Error Boundary
 * Catches unhandled rendering errors and displays a recovery interface.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, errorInfo)
      } catch (cbErr) {
        console.error('[Technea ErrorBoundary] onError callback error:', cbErr)
      }
    }
    console.error('[Technea ErrorBoundary] Caught render error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (typeof this.props.onReset === 'function') {
      this.props.onReset()
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, compact = false, title, subtitle } = this.props

    if (!hasError) {
      return children
    }

    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback({
          error,
          errorInfo,
          resetErrorBoundary: this.handleReset,
        })
      }
      return fallback
    }

    // Compact layout for contained sections or modals
    if (compact) {
      return (
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-[#0A0C10] p-6 text-center shadow-xl space-y-4 my-4 max-w-lg mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              {title || 'Component encountered an issue'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              {subtitle || 'An unexpected rendering error occurred in this module.'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>

          <div className="w-full pt-2">
            <TechnicalDetails error={error} errorInfo={errorInfo} />
          </div>
        </div>
      )
    }

    // Full-screen Technea dark branded recovery UI
    return (
      <div className="min-h-screen w-full bg-[#050505] text-[#EDEDED] antialiased flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden selection:bg-[#333333] selection:text-white">
        {/* Futuristic Technea Ambient Lighting */}
        <div
          className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(99,102,241,0.14),transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(255,0,85,0.08),transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"
          aria-hidden="true"
        />

        {/* Content Card */}
        <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.09] bg-[#090b10]/95 backdrop-blur-2xl p-6 sm:p-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.85)] space-y-6">
          {/* Header Monogram & Alert Lockup */}
          <div className="flex items-center justify-center gap-3">
            <TechneaIcon size={44} />
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-rose-500/30 bg-rose-950/40 text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.2)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-950/30 px-3 py-0.5 text-[10px] font-mono font-medium text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>UNEXPECTED STATE DETECTED</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              {title || 'Application encountered an unexpected state'}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
              {subtitle ||
                'The Technea runtime intercepted an unhandled rendering condition. You can safely reload the application or return to home without losing account progress.'}
            </p>
          </div>

          {/* Primary Recovery Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg shadow-white/5 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload Application</span>
            </button>

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95"
            >
              <span>Try Again</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-transparent px-4 py-2.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </button>
          </div>

          {/* Collapsible Technical Details for Developers */}
          <div className="pt-2">
            <TechnicalDetails error={error} errorInfo={errorInfo} />
          </div>

          {/* Footer Telemetry Stamp */}
          <p className="text-[10px] font-mono text-neutral-600">
            TECHNEA PLATFORM RECOVERY SUBSYSTEM • 2026
          </p>
        </div>
      </div>
    )
  }
}
