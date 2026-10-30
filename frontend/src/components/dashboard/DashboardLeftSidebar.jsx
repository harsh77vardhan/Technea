import { memo } from 'react'
import {
  Activity,
  Compass,
  BookOpen,
  FolderGit2,
  Bot,
  Award,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import { getAvatarUrl } from '../../services/api'

/**
 * DashboardLeftSidebar
 *
 * Implements the full-screen left navigation sidebar matching Technea Hero's cinematic dark design language:
 * - Deep black glass panel: #090B10 with border-r border-white/[0.08]
 * - Brand logo: Glowing Technea icon mark + "Technea" in crisp white + "OS v2.6" badge
 * - Vertical nav links: Overview, Roadmaps, Courses, Projects, AI Mentor, Portfolio
 *   (Active tab has glowing dark glass capsule with ambient violet glow dot)
 * - User Profile Footer: Avatar, Name, "Lv 4 • 1,240 XP" with mini progress bar, and Logout action
 */
function DashboardLeftSidebar({
  activeTab = 'overview',
  onSelectTab = () => {},
  user,
  xpPoints = 1240,
  onLogout = () => {},
}) {
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]
  const avatarUrl = getAvatarUrl(user?.avatar_url)

  // Calculate dynamic level from XP (e.g. 1240 XP => Lv 4)
  const computedLevel = Math.max(1, Math.floor(xpPoints / 300) + 1)
  const displayXp = xpPoints.toLocaleString()

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'roadmaps', label: 'Roadmaps', icon: Compass },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'mentor', label: 'AI Mentor', icon: Bot },
    { id: 'portfolio', label: 'Portfolio', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav
      aria-label="Dashboard Sidebar"
      className="flex flex-col h-full justify-between gap-6"
    >
      {/* ──────────────── Brand Logo & Header ──────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 pt-1">
          {/* Technea Glowing 'T' Mark */}
          <div className="relative">
            <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-60 blur-xs" />
            <div className="relative h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shrink-0">
              T
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white font-sans">
              Technea
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-400">
              AI LEARNING OS
            </span>
          </div>
        </div>

        {/* ──────────────── Nav Menu List ──────────────── */}
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id || (item.id === 'portfolio' && activeTab === 'profile')
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.14] shadow-[0_0_20px_rgba(99,102,241,0.20)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-neutral-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Active Glowing Violet Indicator Dot */}
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ──────────────── Bottom User Profile & XP Telemetry Card ──────────────── */}
      <div className="border-t border-white/[0.08] pt-4 px-1 space-y-3.5 shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar with Online Status */}
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full overflow-hidden border border-white/[0.14] bg-[#12151E] flex items-center justify-center shadow-xs">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-xs font-mono font-bold text-white">
                  {firstName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#090B10] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>

          {/* User Name & Level */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{firstName}</p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
              <span>Lv {computedLevel}</span>
              <span>•</span>
              <span className="text-indigo-300 flex items-center gap-0.5">
                <Zap className="h-2.5 w-2.5 fill-indigo-400 text-indigo-400" />
                {displayXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-3/4 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-neutral-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  )
}

export default memo(DashboardLeftSidebar)
