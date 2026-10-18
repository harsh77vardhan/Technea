import { useState, useEffect, useRef } from 'react'
import { Menu, X, ArrowRight, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import TechneaLogo from './TechneaLogo'

export default function Navbar() {
  const { user, openAuthModal, openDashboard, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const menuRef = useRef(null)

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

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-transform duration-300 ease-in-out ${
        isVisible || mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <TechneaLogo href="#" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
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
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1.5 pr-2.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 text-[11px] font-bold text-white shadow-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate font-semibold text-slate-900">
                    {displayName}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl animate-in fade-in z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{user.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        openDashboard()
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400" />
                      <span>Learning Dashboard</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
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

            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-xs font-semibold text-slate-900">{displayName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openDashboard()
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout()
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
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

