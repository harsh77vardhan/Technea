import { memo } from 'react'
import {
  LayoutGrid,
  Compass,
  BookOpen,
  Folder,
  Users,
  Award,
  Settings,
  Sparkles,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'
import { getAvatarUrl } from '../../services/api'
import TechneaLogo from '../layout/TechneaLogo'

function DashboardLeftSidebar({
  activeTab = 'overview',
  onSelectTab = () => {},
  user,
  onLogout = () => {},
}) {
  const { theme, toggleTheme } = useDashboard()
  const isLight = theme === 'light'
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]
  const avatarUrl = getAvatarUrl(user?.avatar_url)

  // Clean Nav Items matching source of truth reference
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'roadmaps', label: 'Roadmaps', icon: Compass },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'rooms', label: 'Study Rooms', icon: Users },
    { id: 'mentor', label: 'AI Mentor', icon: Sparkles },
    { id: 'portfolio', label: 'Portfolio', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav
      aria-label="Dashboard Sidebar"
      className={`flex flex-col h-full justify-between border-r select-none px-4 py-6 transition-colors duration-300 ${
        isLight
          ? 'bg-[#f5f0e8] border-[#e0d8cc] text-[#181614]'
          : 'bg-black border-[#1c1c1c] text-[#e8e3db]'
      }`}
    >
      {/* ──────────────── Top Logo & Navigation ──────────────── */}
      <div className="space-y-8">
        {/* Brand Header: Technea Logo + Theme Switch */}
        <div className="flex items-center justify-between px-2 pt-1">
          <TechneaLogo
            as="div"
            size={28}
            textSizeClassName="text-[17px]"
            textClassName={isLight ? 'text-[#181614]' : 'text-[#f0ebe3]'}
          />

          {/* Minimal, premium Theme Switch Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
            className={`p-1.5 rounded-full border transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer flex items-center justify-center active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
              isLight
                ? 'border-[#d8ccb6] bg-white text-[#c25e2e] hover:bg-[#f5f0e8] shadow-sm'
                : 'border-[#2a2a2a] bg-[#111] text-[#e87a48] hover:bg-[#1a1a1a] hover:border-[#c25e2e]/50'
            }`}
          >
            {isLight ? (
              <Moon className="h-3.5 w-3.5 transition-transform duration-300 hover:-rotate-12" />
            ) : (
              <Sun className="h-3.5 w-3.5 transition-transform duration-300 hover:rotate-45" />
            )}
          </button>
        </div>

        {/* Nav Items */}
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id || (item.id === 'portfolio' && activeTab === 'profile')
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                  isActive
                    ? isLight
                      ? 'bg-[#c25e2e]/10 text-[#c25e2e] font-semibold'
                      : 'bg-[#c25e2e]/15 text-[#f0875a] font-semibold'
                    : isLight
                    ? 'font-normal text-[#5c5650] hover:text-[#181614] hover:bg-black/5'
                    : 'font-normal text-[#666] hover:text-[#e8e3db] hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                    isActive
                      ? isLight ? 'text-[#c25e2e]' : 'text-[#f0875a]'
                      : isLight
                      ? 'text-[#7a7268]'
                      : 'text-[#555]'
                  }`}
                />
                <span className="[text-wrap:pretty]">{item.label}</span>
                {isActive && (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isLight ? 'bg-[#c25e2e]' : 'bg-[#f0875a]'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ──────────────── Bottom User Profile matching reference ──────────────── */}
      <div className={`pt-4 border-t ${isLight ? 'border-[#e0d8cc]' : 'border-[#1c1c1c]'}`}>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={firstName}
                className="h-7 w-7 rounded-full object-cover border border-[#c25e2e]/40"
              />
            ) : (
              <div className={`h-7 w-7 rounded-full border flex items-center justify-center text-xs font-semibold ${
                isLight
                  ? 'border-[#c25e2e]/50 bg-[#c25e2e]/10 text-[#c25e2e]'
                  : 'border-[#c25e2e]/40 bg-[#c25e2e]/15 text-[#f0875a]'
              }`}>
                {firstName[0]?.toUpperCase() || 'H'}
              </div>
            )}
            <span className={`text-sm font-medium ${isLight ? 'text-[#181614]' : 'text-[#e8e3db]'}`}>
              {firstName}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={`p-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
              isLight
                ? 'text-[#7a7268] hover:text-[#c25e2e] hover:bg-[#c25e2e]/8'
                : 'text-[#555] hover:text-[#f0875a] hover:bg-[#c25e2e]/10'
            }`}
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
