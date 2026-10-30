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
} from 'lucide-react'
import { getAvatarUrl } from '../../services/api'

/**
 * DashboardLeftSidebar
 *
 * Implements the exact left navigation sidebar from `techneadashboardfinal1.png`:
 * - Clean light background #f0f4f9 with subtle border-r #e2e8f0
 * - Black rounded square 'T' icon + 'Technea' typography in #0f172a
 * - Navigation links with active soft lavender pill #ded4f4 and purple dot indicator
 * - Bottom user profile: avatar thumbnail, Harsh, "Lv 4 • 1,240 XP", and Logout
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
      className="flex flex-col h-full justify-between gap-6 bg-[#f0f4f9] text-[#0f172a] select-none p-1"
    >
      {/* ──────────────── Brand Logo & Header ──────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          {/* Black rounded square 'T' */}
          <div className="h-8 w-8 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0 font-sans">
            T
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#0f172a] font-sans">
            Technea
          </span>
        </div>

        {/* ──────────────── Nav Menu List ──────────────── */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id || (item.id === 'portfolio' && activeTab === 'profile')
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#ded4f4] text-[#1e1b4b] font-semibold shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0]/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-[#7c3aed]' : 'text-[#64748b]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Active Purple Indicator Dot */}
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ──────────────── Bottom User Profile Card ──────────────── */}
      <div className="pt-4 border-t border-[#e2e8f0] px-2 space-y-3 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Avatar Thumbnail */}
          <div className="h-9 w-9 rounded-full overflow-hidden border border-[#cbd5e1] bg-white flex items-center justify-center shrink-0 shadow-xs">
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
              <span className="text-xs font-mono font-bold text-[#0f172a]">
                {firstName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* User Name & Level */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0f172a] truncate">{firstName}</p>
            <p className="text-[11px] font-mono text-[#64748b]">
              Lv {computedLevel} • {displayXp} XP
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-1 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default memo(DashboardLeftSidebar)
