import { useState, useEffect } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

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

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-transform duration-300 ease-in-out ${
        isVisible || mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M4 5.5C4 4.67157 4.67157 4 5.5 4H18.5C19.3284 4 20 4.67157 20 5.5V6.5C20 7.32843 19.3284 8 18.5 8H13.75V18.5C13.75 19.3284 13.0784 20 12.25 20H11.75C10.9216 20 10.25 19.3284 10.25 18.5V8H5.5C4.67157 8 4 7.32843 4 6.5V5.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Technea
          </span>
        </a>

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

        {/* Action Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="#curriculum"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            Sign in
          </a>
          <a
            href="#hero-search"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </a>
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
            <div className="pt-2">
              <a
                href="#hero-search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
