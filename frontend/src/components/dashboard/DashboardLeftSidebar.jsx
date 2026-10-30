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
 * - Cool ice/slate background: #edf2f7
 * - Brand logo: "T Technea" in bold black
 * - Vertical nav links: Overview, Roadmaps, Courses, Projects, AI Mentor, Portfolio, Settings
 *   (Overview has soft lavender capsule #ded4f4 / #e0e7ff with glowing purple dot on right)
 * - User Profile Footer: Avatar, Name "Harsh", "Lv 4 • 1,240 XP", Logout
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
      {/* ──────────────── Brand Logo ──────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          {/* Technea 'T' Icon Mark */}
          <div className="h-7 w-7 rounded-lg bg-[#111827] text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
            T
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#0f172a] font-sans">
            Technea
          </span>
        </div>

        {/* ──────────────── Nav Menu List ──────────────── */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'portfolio' && activeTab === 'profile')
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#ded4f4] text-[#1e1b4b] font-semibold border border-[#c7d2fe] shadow-xs'
                    : 'text-[#475569] hover:text-[#0f172a] hover:bg-black/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-[#4338ca]' : 'text-[#64748b]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Active Purple Indicator Dot matching reference image */}
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-[#7c3aed] shadow-[0_0_6px_#7c3aed]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ──────────────── Bottom User Profile Card ──────────────── */}
      <div className="border-t border-[#cbd5e1]/60 pt-4 px-1 space-y-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar Thumbnail */}
          <div className="h-9 w-9 rounded-full overflow-hidden border border-[#cbd5e1] bg-white shrink-0 flex items-center justify-center shadow-xs">
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
              <span className="text-xs font-mono font-bold text-[#1e293b]">
                {firstName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* User Name & Level/XP */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0f172a] truncate">{firstName}</p>
            <p className="text-[11px] font-mono text-[#64748b] truncate">
              Lv {computedLevel} • {displayXp} XP
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-mono text-[#64748b] hover:text-[#0f172a] hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default memo(DashboardLeftSidebar)
