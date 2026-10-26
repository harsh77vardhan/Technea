import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Home,
  LayoutDashboard,
} from 'lucide-react'
import TechneaLogo from '../components/layout/TechneaLogo'
import { useAuth } from '../context/useAuth'

/**
 * 404 Route Not Found Page
 * Sleek, authoritative Technea dark branded 404 state.
 */
export default function NotFoundPage({ onBackToHome }) {
  const { openDashboard } = useAuth()

  const handleReturnHome = () => {
    if (onBackToHome) {
      onBackToHome()
    } else {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  const handleOpenDashboard = () => {
    handleReturnHome()
    setTimeout(() => {
      openDashboard()
    }, 150)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] antialiased selection:bg-[#333333] selection:text-white relative overflow-x-clip flex flex-col justify-between">
      {/* Ambient Lighting & Technical Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,255,255,0.04),transparent)]"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />

      {/* Top Header Command Bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <TechneaLogo href="/" textClassName="text-white group-hover:text-slate-200" />

          <button
            type="button"
            onClick={handleReturnHome}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0E0E0E] px-3.5 py-1.5 text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] hover:border-white/[0.18] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Home</span>
          </button>
        </div>
      </header>

      {/* Main 404 Centerpiece */}
      <main className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 py-16 flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 backdrop-blur-xl p-8 sm:p-12 text-center space-y-7 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Studio Lighting */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 h-52 w-52 rounded-full bg-white/[0.04] blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* 404 Monogram Badge */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.12] bg-[#141416] text-white shadow-[0_0_40px_rgba(255,255,255,0.06)] relative">
            <span className="font-mono text-2xl font-black tracking-tight text-white/90">
              404
            </span>
          </div>

          <div className="space-y-2.5 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/30 px-3 py-1 text-[11px] font-mono text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>ROUTE NOT LOCATED</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EDEDED] font-sans">
              Page Does Not Exist
            </h1>

            <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed">
              The path you requested (<code className="text-white/80 font-mono text-xs px-1 py-0.5 rounded bg-white/[0.06]">{typeof window !== 'undefined' ? window.location.pathname : ''}</code>) does not match any route in the Technea platform.
            </p>
          </div>

          {/* Action Navigation Options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReturnHome}
              className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </button>

            <button
              type="button"
              onClick={handleOpenDashboard}
              className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Open Dashboard</span>
            </button>
          </div>

          {/* Technical Diagnostics */}
          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-[11px] font-mono text-neutral-500">
              TECHNEA NAVIGATION SYSTEM • POPSTATE ACTIVE
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer hairlines */}
      <footer className="border-t border-white/[0.06] py-4 text-center text-xs font-mono text-neutral-600">
        &copy; {new Date().getFullYear()} Technea Inc. All rights reserved.
      </footer>
    </div>
  )
}
