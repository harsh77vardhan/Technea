import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Compass,
  Trophy,
  LogIn,
  Layers,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import PublicProfilePage from './PublicProfilePage'

export default function ProfilePage({
  username: initialUsername,
  initialEditOpen = false,
  onBackToHome,
}) {
  const { user, openAuthModal } = useAuth()

  // Extract username from props, URL path, or authenticated user
  const effectiveUsername = useMemo(() => {
    if (initialUsername) return initialUsername
    const path = window.location.pathname
    if (path.startsWith('/profile/')) {
      const seg = path.slice('/profile/'.length).split('/')[0].split('?')[0]
      if (seg) return seg
    }

    return user?.username || ''
  }, [initialUsername, user?.username])

  // If a username is available (either viewing another developer or own profile), render PublicProfilePage
  if (effectiveUsername) {
    return (
      <PublicProfilePage
        username={effectiveUsername}
        initialEditOpen={initialEditOpen}
        onBackToHome={onBackToHome}
      />
    )
  }

  // If visiting /profile while not authenticated
  const handleReturnHome = () => {
    if (onBackToHome) {
      onBackToHome()
    } else {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] antialiased selection:bg-[#333333] selection:text-white relative overflow-x-clip flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <button
            type="button"
            onClick={handleReturnHome}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0E0E0E] px-3.5 py-2 text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] hover:border-white/[0.18] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Technea</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#555555]">TECHNEA //</span>
            <span className="text-xs font-mono font-medium text-[#A1A1A1]">
              DEVELOPER IDENTITY
            </span>
          </div>
        </div>
      </header>

      {/* Hero Unauthenticated Command Center State */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-16 flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 backdrop-blur-xl p-8 sm:p-12 text-center space-y-7 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Halo */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-52 w-52 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-amber-500/20 blur-3xl pointer-events-none" />

          {/* Central Command Center Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.12] bg-[#141416] text-white shadow-[0_0_35px_rgba(255,255,255,0.08)]">
            <Sparkles className="h-8 w-8 text-amber-400" />
          </div>

          <div className="space-y-2.5 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[11px] font-mono text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified Developer Network</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EDEDED] font-sans">
              Technea Developer Command Center
            </h1>

            <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed">
              Authenticate to track your engineering progression, verified skill graphs, active AI roadmaps, and public portfolio deliverables.
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-left">
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4.5 space-y-2 hover:border-white/[0.18] transition-all group">
              <Trophy className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold font-mono text-[#EDEDED]">
                XP & Tier Rankings
              </h3>
              <p className="text-[11px] text-[#8A8F98] leading-relaxed">
                Advance from Code Initiate to Staff Platform Engineer as you master milestones.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4.5 space-y-2 hover:border-white/[0.18] transition-all group">
              <Compass className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold font-mono text-[#EDEDED]">
                AI Roadmaps
              </h3>
              <p className="text-[11px] text-[#8A8F98] leading-relaxed">
                Personalized role curricula with milestone tracking and course recommendations.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0E] p-4.5 space-y-2 hover:border-white/[0.18] transition-all group">
              <Layers className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold font-mono text-[#EDEDED]">
                Skill Mastery
              </h3>
              <p className="text-[11px] text-[#8A8F98] leading-relaxed">
                Showcase verified competencies and real GitHub project deliverables.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/[0.06]">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openAuthModal?.('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#EDEDED] px-6 py-2.5 text-xs font-mono font-bold text-[#050505] hover:bg-white transition-all cursor-pointer shadow-md"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In / Create Developer Account</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReturnHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-[#141416] px-5 py-2.5 text-xs font-mono font-medium text-[#8A8F98] hover:text-[#EDEDED] hover:bg-[#1C1C20] transition-all cursor-pointer"
            >
              <span>Explore Platform Catalog</span>
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer minimal info */}
      <footer className="relative z-10 border-t border-white/[0.06] py-4 text-center text-xs font-mono text-[#52525B]">
        Technea Autonomous Developer Identity Platform
      </footer>
    </div>
  )
}
