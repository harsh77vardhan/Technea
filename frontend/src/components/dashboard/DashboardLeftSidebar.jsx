import { memo } from 'react'
import {
  LayoutGrid,
  Compass,
  BookOpen,
  Folder,
  Award,
  Settings,
  LogOut,
} from 'lucide-react'
import { getAvatarUrl } from '../../services/api'

function DashboardLeftSidebar({
  activeTab = 'overview',
  onSelectTab = () => {},
  user,
  onLogout = () => {},
}) {
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]
  const avatarUrl = getAvatarUrl(user?.avatar_url)

  // 6 Clean Nav Items matching source of truth reference
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'roadmaps', label: 'Roadmaps', icon: Compass },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'portfolio', label: 'Portfolio', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav
      aria-label="Dashboard Sidebar"
      className="flex flex-col h-full justify-between bg-[#141312] border-r border-[#262320] text-[#faf6ee] select-none px-4 py-6"
    >
      {/* ──────────────── Top Logo & Navigation ──────────────── */}
      <div className="space-y-8">
        {/* Brand Header matching reference: circular (T) + Technea */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="h-7 w-7 rounded-full border border-[#c25e2e]/50 bg-[#c25e2e]/10 flex items-center justify-center text-xs font-semibold text-[#faf6ee]">
            T
          </div>
          <span className="text-sm font-medium tracking-tight text-[#faf6ee]">
            Technea
          </span>
        </div>

        {/* Nav Items */}
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-normal transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#c25e2e]/15 text-[#e87a48] font-medium border border-[#c25e2e]/30'
                    : 'text-[#a8a199] hover:text-[#faf6ee] hover:bg-[#faf6ee]/5'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#e87a48]' : 'text-[#a8a199]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ──────────────── Bottom User Profile matching reference ──────────────── */}
      <div className="pt-4 border-t border-[#262320]">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={firstName}
                className="h-7 w-7 rounded-full object-cover border border-[#c25e2e]/40"
              />
            ) : (
              <div className="h-7 w-7 rounded-full border border-[#e5decb]/30 bg-[#faf6ee]/10 flex items-center justify-center text-xs font-medium text-[#faf6ee]">
                {firstName[0]?.toUpperCase() || 'H'}
              </div>
            )}
            <span className="text-sm text-[#faf6ee] font-normal">
              {firstName}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-[#a8a199] hover:text-[#e87a48] hover:bg-[#c25e2e]/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default memo(DashboardLeftSidebar)
