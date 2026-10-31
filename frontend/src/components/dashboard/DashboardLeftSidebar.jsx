import { memo } from 'react'
import {
  Activity,
  Compass,
  BookOpen,
  FolderGit2,
  Bot,
  Award,
  LogOut,
  Flame,
} from 'lucide-react'
import { getAvatarUrl } from '../../services/api'

function DashboardLeftSidebar({
  activeTab = 'overview',
  onSelectTab = () => {},
  user,
  xpPoints = 250,
  streakCount = 1,
  onLogout = () => {},
}) {
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Developer'
  const firstName = fullName.split(' ')[0]
  const avatarUrl = getAvatarUrl(user?.avatar_url)

  const computedLevel = Math.max(1, Math.floor(xpPoints / 250) + 1)
  const displayXp = xpPoints.toLocaleString()

  // 6 Essential Navigation items per specification
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'roadmaps', label: 'Roadmaps', icon: Compass },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'mentor', label: 'AI Mentor', icon: Bot },
    { id: 'portfolio', label: 'Portfolio', icon: Award },
  ]

  return (
    <nav
      aria-label="Dashboard Sidebar"
      className="flex flex-col h-full justify-between gap-6 bg-[#07090e] border-r border-white/[0.08] text-[#f8fafc] select-none p-4"
    >
      {/* ──────────────── Top Brand Header & Menu ──────────────── */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="h-8 w-8 rounded-xl bg-white text-black font-extrabold text-sm flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] shrink-0 font-sans">
            T
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white font-sans">
              Technea
            </span>
            <span className="text-[10px] font-mono text-violet-400 -mt-1 tracking-wider uppercase">
              Learning OS
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1 pt-2">
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id || (item.id === 'portfolio' && activeTab === 'profile')
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-violet-600/25 border border-violet-500/40 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-violet-400' : 'text-neutral-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Active Indicator Beacon */}
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_#a78bfa]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ──────────────── Bottom User Profile Section ──────────────── */}
      <div className="pt-4 border-t border-white/[0.08] space-y-3">
        {/* User Card: Avatar, Level, XP, Streak */}
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={firstName}
                className="h-9 w-9 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white border border-white/20">
                {firstName[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#07090e]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate font-sans">{firstName}</div>
            <div className="text-[10px] font-mono text-neutral-400 truncate">
              Lv {computedLevel} • {displayXp} XP
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 mt-0.5">
              <Flame className="h-3 w-3 fill-amber-400" />
              <span>{streakCount}-day streak</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-mono transition-colors cursor-pointer"
          title="Sign out of Technea"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  )
}

export default memo(DashboardLeftSidebar)
