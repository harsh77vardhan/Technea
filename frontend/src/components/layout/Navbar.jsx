import { useState, useEffect, useRef } from 'react'
import { Menu, X, ArrowRight, LayoutDashboard, LogOut, ChevronDown, Sparkles, User, Edit3 } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useAuth } from '../../context/useAuth'
import TechneaLogo from './TechneaLogo'
import { getAvatarUrl } from '../../utils/avatar'

gsap.registerPlugin(useGSAP)

export default function Navbar() {
  const { user, openAuthModal, openDashboard, openRoadmapBuilder, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [avatarError, setAvatarError] = useState(false)
  const [prevUserAvatar, setPrevUserAvatar] = useState(user?.avatar_url)
  const menuRef = useRef(null)
  const navInnerRef = useRef(null)

  useGSAP(() => {
    gsap.from(navInnerRef.current, {
      opacity: 0,
      y: -18,
      duration: 0.85,
      ease: 'power3.out',
      delay: 0.1,
    })
  }, { scope: navInnerRef })

  if (user?.avatar_url !== prevUserAvatar) {
    setPrevUserAvatar(user?.avatar_url)
    setAvatarError(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let previousScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          // Always visible at the top of the page
          if (currentScrollY < 20) {
            setIsVisible(true)
          } else if (currentScrollY > previousScrollY && currentScrollY - previousScrollY > 6) {
            // Scrolling down -> hide navbar
            setIsVisible(false)
            setMobileMenuOpen(false)
          } else if (currentScrollY < previousScrollY && previousScrollY - currentScrollY > 6) {
            // Scrolling up -> show navbar
            setIsVisible(true)
          }

          previousScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const userHandle = user?.username
    ? `@${user.username}`
    : user?.full_name
    ? `@${user.full_name.toLowerCase().replace(/\s+/g, '')}`
    : user?.email
    ? `@${user.email.split('@')[0]}`
    : '@developer'

  const displayName = user?.full_name || (user?.username ? `@${user.username}` : user?.email?.split('@')[0] || 'User')
  const initialLetter = (user?.full_name || user?.username || user?.email || 'U').charAt(0).toUpperCase()

  const handleNavigate = (path) => {
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const profileUrl = user?.username ? `/profile/${user.username}` : '/profile'
  const editProfileUrl = user?.username ? `/profile/${user.username}?edit=true` : '/profile?edit=true'

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-transform duration-300 ease-in-out ${
        isVisible || mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        ref={navInnerRef}
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8"
      >
        {/* Brand Logo */}
        <TechneaLogo href="#" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            How It Works
          </a>
          <a
            href="#curriculum"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            Roadmaps
          </a>
          <button
            type="button"
            onClick={() => openRoadmapBuilder()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>AI Builder</span>
          </button>
        </nav>

        {/* Action Buttons & Auth State */}
        <div className="hidden items-center gap-3.5 md:flex">
          {user ? (
            <div className="flex items-center gap-3" ref={menuRef}>
              <button
                type="button"
                onClick={openDashboard}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition shadow-xs cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
                <span>Dashboard</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1.5 pr-2.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {user.avatar_url && !avatarError ? (
                    <img
                      src={getAvatarUrl(user.avatar_url)}
                      alt={userHandle}
                      onError={() => setAvatarError(true)}
                      className="h-7 w-7 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-[11px] font-bold text-white shadow-xs shrink-0">
                      {initialLetter}
                    </div>
                  )}
                  <span className="max-w-[110px] truncate font-semibold text-slate-900 font-mono text-[11px]">
                    {userHandle}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu - Refined Dark Glass Aesthetic */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[0.12] bg-[#0E1016]/95 backdrop-blur-xl py-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)] animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-3">
                      {user.avatar_url && !avatarError ? (
                        <img
                          src={getAvatarUrl(user.avatar_url)}
                          alt={userHandle}
                          onError={() => setAvatarError(true)}
                          className="h-9 w-9 rounded-xl object-cover border border-white/[0.12] shrink-0"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs shrink-0">
                          {initialLetter}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">
                          {user.full_name || displayName}
                        </p>
                        <p className="text-[11px] text-blue-400 truncate font-mono font-medium">
                          {userHandle}
                        </p>
                      </div>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {/* 1. View Profile */}
                      <button
                        type="button"
                        onClick={() => handleNavigate(profileUrl)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group"
                      >
                        <User className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        <span>View Profile</span>
                      </button>

                      {/* 2. Learning Dashboard */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          openDashboard()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group"
                      >
                        <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        <span>Learning Dashboard</span>
                      </button>

                      {/* 3. Edit Profile */}
                      <button
                        type="button"
                        onClick={() => handleNavigate(editProfileUrl)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group"
                      >
                        <Edit3 className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        <span>Edit Profile</span>
                      </button>

                      <div className="my-1 border-t border-white/[0.08]" />

                      {/* 4. Sign Out */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer group"
                      >
                        <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden shadow-lg">
          <nav className="flex flex-col gap-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            >
              How It Works
            </a>
            <a
              href="#curriculum"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            >
              Roadmaps
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                openRoadmapBuilder()
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 text-left"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>AI Roadmap Builder</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="space-y-3">
                  <div className="px-3 py-2.5 flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    {user.avatar_url && !avatarError ? (
                      <img
                        src={getAvatarUrl(user.avatar_url)}
                        alt={userHandle}
                        onError={() => setAvatarError(true)}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs shrink-0">
                        {initialLetter}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {user.full_name || displayName}
                      </p>
                      <p className="text-[11px] text-blue-600 font-mono truncate font-medium">
                        {userHandle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* 1. View Profile */}
                    <button
                      type="button"
                      onClick={() => handleNavigate(profileUrl)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      <span>View Profile</span>
                    </button>

                    {/* 2. Learning Dashboard */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        openDashboard()
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4 text-white" />
                      <span>Learning Dashboard</span>
                    </button>

                    {/* 3. Edit Profile */}
                    <button
                      type="button"
                      onClick={() => handleNavigate(editProfileUrl)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4 text-slate-500" />
                      <span>Edit Profile</span>
                    </button>

                    {/* 4. Sign Out */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-red-100 bg-red-50/60 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openAuthModal('login')
                    }}
                    className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openAuthModal('signup')
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

