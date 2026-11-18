import { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Award,
  Sparkles,
  Play,
  ArrowRight,
  Search,
  User,
  Shield,
  LogOut,
  GitBranch,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useDashboard } from '../context/useDashboard'
import DashboardLeftSidebar from '../components/dashboard/DashboardLeftSidebar'
import DashboardReferenceOverview from '../components/dashboard/DashboardReferenceOverview'
import DockedAIMentorCompanion from '../components/dashboard/DockedAIMentorCompanion'
import RoadmapDetailModal from '../components/roadmap/RoadmapDetailModal'
import TechneaLogo from '../components/layout/TechneaLogo'
import StudyRoomsSection from '../components/rooms/StudyRoomsSection'


const FloatingAIMentorCompanion = lazy(() =>
  import('../components/dashboard/FloatingAIMentorCompanion')
)

function FloatingAIMentorFallback() {
  return null
}

export default function DashboardPage({
  onSelectPath = () => {},
  onOpenExplorer = () => {},
  onOpenRoadmapBuilder = () => {},
}) {
  const { user, logout } = useAuth()
  const {
    activeTab,
    setActiveTab,
    activeRoadmap,
    allRoadmaps,
    switchActiveRoadmap,
    achievements,
    catalogRoadmaps,
    continueLearningData,
    showToast,
    theme,
    toggleTheme,
    setTheme,
  } = useDashboard()

  const isLight = theme === 'light'

  const [roadmapSearch, setRoadmapSearch] = useState('')
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const searchContainerRef = useRef(null)

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [filterDifficulty, setFilterDifficulty] = useState('all') // 'all' | 'Beginner' | 'Intermediate' | 'Advanced'
  const [filterDuration, setFilterDuration] = useState('all') // 'all' | '< 4 weeks' | '4-8 weeks' | '8+ weeks'
  const [filterCategory, setFilterCategory] = useState('all') // 'all' | 'Frontend' | 'Backend' | 'Full Stack' | 'AI & ML' | 'Cloud & DevOps' | 'Data Engineering'
  const [filterTechnology, setFilterTechnology] = useState('all') // 'all' | 'Python' | 'JavaScript' | 'React' | 'Docker' | 'SQL' | 'Rust' | 'Go'
  const [selectedRoadmapForDetail, setSelectedRoadmapForDetail] = useState(null)

  const [isMentorDocked, setIsMentorDocked] = useState(true)
  const [isMentorFullscreen, setIsMentorFullscreen] = useState(false)
  const mainScrollRef = useRef(null)

  // Focus main container on mount for immediate native keyboard scrolling readiness
  useEffect(() => {
    mainScrollRef.current?.focus({ preventScroll: true })
  }, [])

  // Reset scroll to top smoothly when switching dashboard tabs
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0
    }
  }, [activeTab])

  // Support native keyboard scrolling (Page Up/Down, Space, Arrow Keys, Home/End)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeEl = document.activeElement
      const tagName = activeEl?.tagName?.toLowerCase()
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        activeEl?.isContentEditable
      ) {
        return
      }

      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']
      if (scrollKeys.includes(e.key) && mainScrollRef.current) {
        // If focus is currently on the outer document/body, perform native scroll and ensure main has focus
        if (activeEl === document.body || activeEl === document.documentElement) {
          e.preventDefault()
          const scrollMap = {
            ArrowDown: 60,
            ArrowUp: -60,
            PageDown: window.innerHeight * 0.75,
            PageUp: -window.innerHeight * 0.75,
            ' ': e.shiftKey ? -window.innerHeight * 0.75 : window.innerHeight * 0.75,
          }
          if (e.key === 'Home') {
            mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
          } else if (e.key === 'End') {
            mainScrollRef.current.scrollTo({
              top: mainScrollRef.current.scrollHeight,
              behavior: 'smooth',
            })
          } else if (scrollMap[e.key] !== undefined) {
            mainScrollRef.current.scrollBy({ top: scrollMap[e.key], behavior: 'auto' })
          }
          mainScrollRef.current.focus({ preventScroll: true })
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Direct lesson navigation
  const handleContinueLesson = useCallback((mission) => {
    const courseId =
      mission?.course_id ||
      continueLearningData?.course_id ||
      activeRoadmap?.course_id ||
      null
    const lessonId = mission?.lesson_id || continueLearningData?.lesson_id || 1
    const targetUrl = courseId
      ? `/courses/${courseId}?lesson=${lessonId}`
      : activeRoadmap?.id
      ? `/courses?path=${activeRoadmap.id}`
      : '/courses'
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', targetUrl)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [continueLearningData, activeRoadmap])

  // Filter catalog roadmaps with multi-faceted criteria
  const filteredCatalog = useMemo(() => {
    let list = catalogRoadmaps || []
    if (roadmapSearch.trim()) {
      const q = roadmapSearch.toLowerCase().trim()
      list = list.filter((rm) =>
        (typeof rm.title === 'string' && rm.title.toLowerCase().includes(q)) ||
        (typeof rm.description === 'string' && rm.description.toLowerCase().includes(q)) ||
        (typeof rm.category === 'string' && rm.category.toLowerCase().includes(q)) ||
        (typeof rm.target_role === 'string' && rm.target_role.toLowerCase().includes(q)) ||
        (Array.isArray(rm.skills_covered) && rm.skills_covered.some((s) => String(s || '').toLowerCase().includes(q))) ||
        (Array.isArray(rm.related_concepts) && rm.related_concepts.some((c) => String(c || '').toLowerCase().includes(q)))
      )
    }
    if (filterDifficulty !== 'all') {
      list = list.filter((rm) => (rm.difficulty || '').toLowerCase() === filterDifficulty.toLowerCase())
    }
    if (filterDuration !== 'all') {
      list = list.filter((rm) => {
        const dur = (rm.duration || rm.estimated_duration || '').toLowerCase()
        const weeksMatch = dur.match(/(\d+)\s*week/i)
        const weeks = weeksMatch ? parseInt(weeksMatch[1], 10) : 6
        if (filterDuration === '< 4 weeks') return weeks < 4
        if (filterDuration === '4-8 weeks') return weeks >= 4 && weeks <= 8
        if (filterDuration === '8+ weeks') return weeks > 8
        return true
      })
    }
    if (filterCategory !== 'all') {
      list = list.filter((rm) => {
        const cat = `${rm.category || ''} ${rm.target_role || ''} ${rm.title || ''}`.toLowerCase()
        if (filterCategory === 'AI' || filterCategory === 'AI & ML') {
          return /\b(ai|ml|machine learning|artificial intelligence|deep learning|llm|neural|data science)\b/i.test(cat)
        }
        return cat.includes(filterCategory.toLowerCase().replace('&', ''))
      })
    }
    if (filterTechnology !== 'all') {
      list = list.filter((rm) => {
        const techStr = `${rm.title || ''} ${rm.description || ''} ${(rm.skills_covered || []).join(' ')}`.toLowerCase()
        return techStr.includes(filterTechnology.toLowerCase())
      })
    }
    return list
  }, [catalogRoadmaps, roadmapSearch, filterDifficulty, filterDuration, filterCategory, filterTechnology])

  // High-precision case-insensitive partial search matcher for dropdown
  const matchingRoadmaps = useMemo(() => {
    const q = (roadmapSearch || '').toLowerCase().trim()
    if (!q) return []

    const pool = [...(catalogRoadmaps || []), ...(allRoadmaps || [])]
    const seen = new Set()
    const unique = []
    for (const rm of pool) {
      const key = rm.slug || rm.id || rm.title
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(rm)
      }
    }

    const matches = unique.filter((rm) => {
      const title = (rm.title || '').toLowerCase()
      const desc = (rm.description || '').toLowerCase()
      const cat = (rm.category || '').toLowerCase()
      const role = (rm.target_role || '').toLowerCase()
      const skills = Array.isArray(rm.skills_covered)
        ? rm.skills_covered.join(' ').toLowerCase()
        : ''
      const concepts = Array.isArray(rm.related_concepts)
        ? rm.related_concepts.join(' ').toLowerCase()
        : ''

      return (
        title.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        role.includes(q) ||
        skills.includes(q) ||
        concepts.includes(q)
      )
    })

    // Rank results: exact match > startsWith > contains
    return matches.sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase()
      const bTitle = (b.title || '').toLowerCase()
      if (aTitle === q && bTitle !== q) return -1
      if (bTitle === q && aTitle !== q) return 1
      if (aTitle.startsWith(q) && !bTitle.startsWith(q)) return -1
      if (bTitle.startsWith(q) && !aTitle.startsWith(q)) return 1
      return 0
    })
  }, [catalogRoadmaps, allRoadmaps, roadmapSearch])

  return (
    <div
      id="dashboard-root"
      data-theme={theme}
      data-lenis-prevent="true"
      className={`relative w-full h-screen min-h-screen flex flex-col lg:flex-row transition-colors duration-300 overflow-hidden ${
        isLight
          ? 'bg-[#f4efe5] text-[#181614]'
          : 'bg-black text-[#e8e3db]'
      }`}
    >
      {/* Background glows */}
      <div className={`pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full blur-[160px] transition-opacity duration-300 ${
        isLight ? 'bg-[#c25e2e]/6' : 'bg-[#c25e2e]/10'
      }`} />
      <div className={`pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-[160px] transition-opacity duration-300 ${
        isLight ? 'bg-[#d97b48]/4' : 'bg-[#c25e2e]/6'
      }`} />

      {/* ──────────────── 1. DESKTOP NAVIGATION SIDEBAR ──────────────── */}
      <aside
        aria-label="Dashboard Sidebar"
        data-lenis-prevent="true"
        className="hidden lg:block w-56 shrink-0 h-full z-20"
      >
        <DashboardLeftSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          user={user}
          onLogout={logout}
        />
      </aside>

      {/* ──────────────── 2. MOBILE TOP NAVIGATION BAR ──────────────── */}
      <header
        aria-label="Mobile Navigation"
        data-lenis-prevent="true"
        className={`lg:hidden shrink-0 flex items-center justify-between px-4 py-3 border-b z-30 transition-colors duration-300 ${
          isLight
            ? 'bg-[#f4efe5] border-[#e0d8cc]'
            : 'bg-black border-[#1c1c1c]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <TechneaLogo
            as="div"
            size={26}
            textSizeClassName="text-[17px]"
            textClassName={isLight ? 'text-[#181614]' : 'text-white'}
          />

          {/* Minimal premium theme toggle button in mobile top-left header */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
            className={`p-1.5 rounded-full border transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer flex items-center justify-center active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
              isLight
                ? 'border-[#e0d8cc] bg-white text-[#c25e2e] hover:bg-[#f4efe5]'
                : 'border-[#2a2a2a] bg-[#111] text-[#f0875a] hover:bg-[#1a1a1a]'
            }`}
          >
            {isLight ? (
              <Moon className="h-3.5 w-3.5" />
            ) : (
              <Sun className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Horizontal mobile tab scroller */}
        <div
          data-lenis-prevent="true"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar [touch-action:pan-x] overscroll-x-contain"
        >
          {['overview', 'roadmaps', 'courses', 'projects', 'rooms', 'portfolio', 'settings'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                activeTab === tab
                  ? isLight
                    ? 'bg-[#c25e2e]/10 text-[#c25e2e] font-semibold'
                    : 'bg-[#c25e2e]/15 text-[#f0875a] font-semibold'
                  : isLight
                  ? 'text-[#6e665d] hover:text-[#181614]'
                  : 'text-[#555] hover:text-[#e8e3db]'
              }`}
            >
              {tab === 'rooms' ? 'Study Rooms' : tab}
            </button>
          ))}
        </div>
      </header>

      {/* ──────────────── 3. MAIN OPERATING DECK (CENTER COLUMN) ──────────────── */}
      <main
        ref={mainScrollRef}
        id="dashboard-main-deck"
        data-lenis-prevent="true"
        tabIndex={0}
        aria-label="Dashboard Content Area"
        className="flex-1 h-full overflow-y-auto overflow-x-hidden overscroll-y-contain [touch-action:pan-y] [-webkit-overflow-scrolling:touch] outline-none focus:outline-none p-5 sm:p-7 lg:p-10 space-y-8 z-10 relative"
      >
        <AnimatePresence mode="wait">
          {/* ══════════════ TAB 1: OVERVIEW (SOURCE OF TRUTH DECK) ══════════════ */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <DashboardReferenceOverview
                onContinueLesson={handleContinueLesson}
                onExploreCatalog={onOpenExplorer}
                onNavigateTab={setActiveTab}
                onInspectRoadmap={(rm) => setSelectedRoadmapForDetail(rm || activeRoadmap)}
              />
            </motion.div>
          )}

          {/* ══════════════ TAB 2: ROADMAPS ══════════════ */}
          {activeTab === 'roadmaps' && (
            <motion.div
              key="roadmaps"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${
                isLight ? 'border-[#e0d8cc]' : 'border-[#1c1c1c]'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`text-2xl font-light tracking-tight [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                      Roadmap Discovery
                    </h1>
                    <span className="rounded-full border border-[#c25e2e]/30 bg-[#c25e2e]/10 px-2.5 py-0.5 text-xs text-[#f0875a]">
                      {allRoadmaps?.length || 1} Saved
                    </span>
                  </div>
                  <p className={`text-xs mt-1 font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#555]'}`}>
                    Search 330+ structured engineering roadmaps. The active roadmap guides your daily missions, milestone projects, and AI mentoring.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenRoadmapBuilder()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#c25e2e] text-white font-semibold px-5 py-2 text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer shadow-lg hover:bg-[#d96a35] hover:shadow-xl active:scale-[0.98] active:translate-y-[0.5px] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/60 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Build Custom Roadmap</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenExplorer}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-[0.98] active:translate-y-[0.5px] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/60 focus-visible:ring-offset-2 focus-visible:outline-none ${
                      isLight ? 'border-[#e0d8cc] bg-white text-[#181614] hover:border-[#c25e2e]/40' : 'border-[#1c1c1c] bg-[#0a0a0a] text-[#e8e3db] hover:border-[#c25e2e]/30'
                    }`}
                  >
                    <Compass className="h-3.5 w-3.5 text-[#f0875a]" />
                    <span>Catalog Explorer</span>
                  </button>
                </div>
              </div>

              {/* ──────────────── PROMINENT SEARCH & FILTER BAR ──────────────── */}
              <div className={`rounded-3xl border p-5 space-y-4 backdrop-blur-xl transition-colors duration-300 ${
                isLight
                  ? 'border-[#e0d8cc] bg-white/95 shadow-sm'
                  : 'border-[#1c1c1c] bg-[#060606]/95'
              }`}>
                <div ref={searchContainerRef} className="relative">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#e87a48]" />
                  <input
                    type="text"
                    placeholder="Search Roadmaps (e.g. Python, Full Stack, React, AI Engineer, Backend, DevOps)..."
                    value={roadmapSearch}
                    onChange={(e) => {
                      setRoadmapSearch(e.target.value)
                      if (e.target.value.trim().length > 0) {
                        setIsSearchDropdownOpen(true)
                      }
                    }}
                    onFocus={() => {
                      if (roadmapSearch.trim().length > 0) {
                        setIsSearchDropdownOpen(true)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (roadmapSearch.trim().length > 0) {
                          setIsSearchDropdownOpen(true)
                        }
                      } else if (e.key === 'Escape') {
                        setIsSearchDropdownOpen(false)
                      }
                    }}
                    className={`w-full pl-11 pr-24 py-3 rounded-2xl border text-sm outline-none focus:border-[#c25e2e] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/40 focus-visible:outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isLight
                        ? 'bg-[#f8f4ee] border-[#e0d8cc] text-[#181614] placeholder-[#9a9189]'
                        : 'bg-black border-[#1c1c1c] text-[#e8e3db] placeholder-[#444]'
                    }`}
                  />
                  {roadmapSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoadmapSearch('')
                        setIsSearchDropdownOpen(false)
                      }}
                      className={`absolute right-3 top-3 px-2 py-1 rounded-full text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                        isLight
                          ? 'text-[#7a7268] hover:text-[#181614] bg-[#f0e9dc]'
                          : 'text-[#a8a199] hover:text-[#faf6ee] bg-[#1c1a18]'
                      }`}
                    >
                      Clear
                    </button>
                  )}

                  {/* ──────────────── INSTANT MATCHING ROADMAPS DROPDOWN ──────────────── */}
                  <AnimatePresence>
                    {isSearchDropdownOpen && roadmapSearch.trim().length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.995 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.995 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden max-h-[440px] overflow-y-auto overscroll-y-contain [touch-action:pan-y] backdrop-blur-2xl ${
                          isLight
                            ? 'border-[#ded4be] bg-[#ffffff]/98 divide-y divide-[#f0e9dc]'
                            : 'border-[#262320] bg-[#141312]/98 divide-y divide-[#262320]'
                        }`}
                        data-lenis-prevent="true"
                      >
                        {/* Results count header */}
                        <div className={`px-4 py-2.5 text-[11px] font-mono flex items-center justify-between ${
                          isLight ? 'bg-[#f7f2e7] text-[#787067]' : 'bg-[#181614] text-[#8c8278]'
                        }`}>
                          <span>
                            {matchingRoadmaps.length > 0
                              ? `${matchingRoadmaps.length} Roadmap${matchingRoadmaps.length === 1 ? '' : 's'} matching "${roadmapSearch}"`
                              : `No matching roadmaps for "${roadmapSearch}"`}
                          </span>
                          <span className="text-[10px]">Press Esc to close</span>
                        </div>

                        {matchingRoadmaps.length > 0 ? (
                          matchingRoadmaps.slice(0, 8).map((rm) => (
                            <button
                              key={rm.id || rm.slug || rm.title}
                              type="button"
                              onClick={() => {
                                setSelectedRoadmapForDetail(rm)
                                setIsSearchDropdownOpen(false)
                              }}
                              className={`w-full text-left p-4 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer group flex flex-col gap-1.5 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                                isLight ? 'hover:bg-[#faf6ee]' : 'hover:bg-[#1c1a18]'
                              }`}
                            >
                              {/* Top row: Title + Difficulty & Duration badges */}
                              <div className="flex items-center justify-between gap-3">
                                <span className={`text-sm font-medium tracking-tight group-hover:text-[#e87a48] transition-colors duration-200 [text-wrap:pretty] ${
                                  isLight ? 'text-[#181614]' : 'text-[#faf6ee]'
                                }`}>
                                  {rm.title}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="rounded-full border border-[#c25e2e]/30 bg-[#c25e2e]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#e87a48]">
                                    {rm.difficulty || rm.level || 'Beginner'}
                                  </span>
                                  <span className={`text-[11px] ${
                                    isLight ? 'text-[#787067]' : 'text-[#a8a199]'
                                  }`}>
                                    {rm.duration || rm.estimated_duration || '8 Weeks'}
                                  </span>
                                </div>
                              </div>

                              {/* Description */}
                              <p className={`text-xs line-clamp-2 leading-relaxed [text-wrap:pretty] ${
                                isLight ? 'text-[#665e56]' : 'text-[#a8a199]'
                              }`}>
                                {rm.description || 'Comprehensive curriculum covering real-world workflows, architecture, and engineering practice.'}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="p-6 text-center space-y-3">
                            <p className={`text-xs [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#a8a199]'}`}>
                              No curated roadmaps found matching &ldquo;<span className="text-[#e87a48]">{roadmapSearch}</span>&rdquo;.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsSearchDropdownOpen(false)
                                onOpenRoadmapBuilder(roadmapSearch)
                              }}
                              className="inline-flex items-center gap-2 rounded-full bg-[#c25e2e] hover:bg-[#ad4f22] text-[#faf6ee] font-medium px-4 py-1.5 text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm hover:shadow-md active:scale-[0.98] active:translate-y-[0.5px] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/60 focus-visible:ring-offset-2 focus-visible:outline-none cursor-pointer"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Generate &ldquo;{roadmapSearch}&rdquo; with AI Architect</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick keyword chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className={`flex items-center gap-1 ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                    <Sparkles className="w-3 h-3 text-[#c25e2e]" />
                    Popular:
                  </span>
                  {['Python', 'Full Stack', 'React', 'AI', 'Backend', 'DevOps', 'Data'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setRoadmapSearch(term)
                        setIsSearchDropdownOpen(true)
                      }}
                      className={`px-2.5 py-1 rounded-full border text-[11px] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                        roadmapSearch.toLowerCase() === term.toLowerCase()
                          ? 'border-[#c25e2e] bg-[#c25e2e]/15 text-[#faf6ee]'
                          : isLight
                          ? 'border-[#ded4be] bg-[#fbf8f2] text-[#6e665d] hover:text-[#181614] hover:border-[#c25e2e]/40'
                          : 'border-[#262320] bg-[#181614] text-[#a8a199] hover:text-[#faf6ee] hover:border-[#38332e]'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {/* Multi-Faceted Filters */}
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t ${
                  isLight ? 'border-[#ded4be]' : 'border-[#262320]/80'
                }`}>
                  {/* Difficulty */}
                  <div>
                    <label className={`text-[11px] uppercase tracking-wider block mb-1 ${
                      isLight ? 'text-[#7a7268]' : 'text-[#8c8278]'
                    }`}>
                      Difficulty
                    </label>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none focus:border-[#c25e2e] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/40 focus-visible:outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                        isLight ? 'bg-[#fbf8f2] border-[#ded4be] text-[#181614]' : 'bg-[#0e0d0c] border-[#262320] text-[#faf6ee]'
                      }`}
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className={`text-[11px] uppercase tracking-wider block mb-1 ${
                      isLight ? 'text-[#7a7268]' : 'text-[#8c8278]'
                    }`}>
                      Duration
                    </label>
                    <select
                      value={filterDuration}
                      onChange={(e) => setFilterDuration(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none focus:border-[#c25e2e] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/40 focus-visible:outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                        isLight ? 'bg-[#fbf8f2] border-[#ded4be] text-[#181614]' : 'bg-[#0e0d0c] border-[#262320] text-[#faf6ee]'
                      }`}
                    >
                      <option value="all">Any Duration</option>
                      <option value="< 4 weeks">&lt; 4 weeks</option>
                      <option value="4-8 weeks">4 – 8 weeks</option>
                      <option value="8+ weeks">8+ weeks</option>
                    </select>
                  </div>

                  {/* Career Track */}
                  <div>
                    <label className={`text-[11px] uppercase tracking-wider block mb-1 ${
                      isLight ? 'text-[#7a7268]' : 'text-[#8c8278]'
                    }`}>
                      Career Goal
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none focus:border-[#c25e2e] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/40 focus-visible:outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                        isLight ? 'bg-[#fbf8f2] border-[#ded4be] text-[#181614]' : 'bg-[#0e0d0c] border-[#262320] text-[#faf6ee]'
                      }`}
                    >
                      <option value="all">All Career Goals</option>
                      <option value="Frontend">Frontend Engineer</option>
                      <option value="Backend">Backend Engineer</option>
                      <option value="Full Stack">Full Stack Developer</option>
                      <option value="AI">AI / Machine Learning</option>
                      <option value="DevOps">Cloud &amp; DevOps</option>
                      <option value="Data">Data Engineer</option>
                    </select>
                  </div>

                  {/* Technology */}
                  <div>
                    <label className={`text-[11px] uppercase tracking-wider block mb-1 ${
                      isLight ? 'text-[#7a7268]' : 'text-[#8c8278]'
                    }`}>
                      Technology
                    </label>
                    <select
                      value={filterTechnology}
                      onChange={(e) => setFilterTechnology(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none focus:border-[#c25e2e] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/40 focus-visible:outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                        isLight ? 'bg-[#fbf8f2] border-[#ded4be] text-[#181614]' : 'bg-[#0e0d0c] border-[#262320] text-[#faf6ee]'
                      }`}
                    >
                      <option value="all">All Technologies</option>
                      <option value="Python">Python</option>
                      <option value="JavaScript">JavaScript / TypeScript</option>
                      <option value="React">React</option>
                      <option value="Docker">Docker &amp; Containers</option>
                      <option value="SQL">SQL &amp; Databases</option>
                      <option value="Rust">Rust</option>
                      <option value="Go">Go</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ──────────────── YOUR SAVED ROADMAPS ──────────────── */}
              <div className="space-y-4">
                <div className={`flex items-center justify-between text-xs ${
                  isLight ? 'text-[#6e665d]' : 'text-[#555]'
                }`}>
                  <span className={`font-semibold uppercase tracking-widest [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-[#555]'}`}>Your Saved Roadmaps</span>
                  <span className="[text-wrap:pretty]">One roadmap is your active focus</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(allRoadmaps || []).map((rm) => {
                    const isFocus =
                      activeRoadmap &&
                      (String(rm.id) === String(activeRoadmap.id) ||
                        (rm.title && activeRoadmap.title && rm.title.toLowerCase() === activeRoadmap.title.toLowerCase()))

                    return (
                      <div
                        key={rm.id}
                        className={`relative rounded-3xl border p-6 backdrop-blur-xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between hover:-translate-y-0.5 ${
                          isFocus
                            ? isLight
                              ? 'border-[#c25e2e] bg-white text-[#181614] shadow-xl ring-1 ring-[#c25e2e]/30'
                              : 'border-[#c25e2e] bg-[#0a0a0a] text-[#e8e3db] shadow-[0_0_30px_rgba(194,94,46,0.12)] ring-1 ring-[#c25e2e]/20'
                            : isLight
                            ? 'border-[#e0d8cc] bg-white text-[#181614] hover:shadow-lg'
                            : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db] hover:border-[#2a2a2a] hover:shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                              isLight ? 'bg-[#f4efe5] border-[#e0d8cc] text-[#665e56]' : 'bg-[#111] border-[#1c1c1c] text-[#666]'
                            }`}>
                              {rm.target_role || 'Engineering Track'}
                            </span>
                            {isFocus ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-[#f0875a] bg-[#c25e2e]/12 px-2.5 py-0.5 rounded-full font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#f0875a] animate-ping" />
                                Active Focus
                              </span>
                            ) : (
                              <span className={`text-xs ${isLight ? 'text-[#9a9189]' : 'text-[#444]'}`}>
                                {rm.estimated_duration || 'Self-paced'}
                              </span>
                            )}
                          </div>

                          <h3 className={`text-base font-semibold tracking-tight [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                            {rm.title}
                          </h3>
                          <p className={`text-xs line-clamp-2 leading-relaxed font-normal [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#555]'}`}>
                            {rm.goal || rm.description || 'Targeted engineering curriculum.'}
                          </p>
                        </div>

                        <div className={`mt-6 pt-4 border-t flex items-center justify-between ${isLight ? 'border-[#e0d8cc]' : 'border-[#111]'}`}>
                          <div className={`text-xs ${isLight ? 'text-[#665e56]' : 'text-[#444]'}`}>
                            <span>{rm.progress_percent || 0}% complete</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRoadmapForDetail(rm)}
                              className={`px-3 py-1.5 rounded-full border text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer flex items-center gap-1 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                                isLight
                                  ? 'border-[#e0d8cc] text-[#181614] hover:border-[#c25e2e]'
                                  : 'border-[#1c1c1c] text-[#aaa] hover:border-[#c25e2e]/40 hover:text-[#f0875a]'
                              }`}
                            >
                              <GitBranch className="h-3 w-3 text-[#f0875a]" />
                              <span>Inspect</span>
                            </button>

                            {!isFocus && (
                              <button
                                type="button"
                                onClick={() => switchActiveRoadmap(rm)}
                                className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                                  isLight
                                    ? 'bg-[#e8e0d4] text-[#181614] hover:bg-[#c25e2e] hover:text-white'
                                    : 'bg-[#111] text-[#888] hover:bg-[#c25e2e] hover:text-white border border-[#1c1c1c]'
                                }`}
                              >
                                Set Active
                              </button>
                            )}

                            {isFocus && (
                              <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className="px-3 py-1.5 rounded-full bg-[#c25e2e] text-white font-semibold text-xs hover:bg-[#d96a35] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer flex items-center gap-1 shadow-lg active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/60 focus-visible:ring-offset-2 focus-visible:outline-none"
                              >
                                <span>Workspace</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ──────────────── ROADMAP CATALOG SEARCH RESULTS ──────────────── */}
              <div className={`pt-6 border-t space-y-4 ${
                isLight ? 'border-[#ded4be]' : 'border-[#262320]'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-base font-medium flex items-center gap-2 ${
                      isLight ? 'text-[#181614]' : 'text-[#faf6ee]'
                    }`}>
                      <Compass className="h-4 w-4 text-[#e87a48]" />
                      Roadmap Catalog ({filteredCatalog.length} paths available)
                    </h2>
                    <p className={`text-xs mt-0.5 font-normal ${
                      isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'
                    }`}>
                      Click any roadmap to inspect its branch-based skill tree, milestones, and unlockable projects before starting.
                    </p>
                  </div>
                </div>

                {filteredCatalog.length === 0 ? (
                  <div className={`p-12 text-center rounded-3xl border space-y-3 ${
                    isLight ? 'border-[#e0d8cc] bg-white text-[#181614]' : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db]'
                  }`}>
                    <Compass className="h-8 w-8 text-[#f0875a] mx-auto opacity-80" />
                    <h4 className={`text-base font-semibold ${isLight ? 'text-[#181614]' : 'text-white'}`}>No roadmaps matched your search</h4>
                    <p className={`text-xs max-w-sm mx-auto ${isLight ? 'text-[#665e56]' : 'text-[#888]'}`}>
                      Try adjusting your keywords or clearing the category filter to explore all available engineering tracks.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRoadmapSearch('')
                        setFilterCategory('all')
                        setFilterDifficulty('all')
                      }}
                      className="px-4 py-2 rounded-full bg-[#c25e2e] text-white text-xs font-semibold hover:bg-[#d96a35] transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCatalog.slice(0, 18).map((catRm) => {
                      const isAlreadyActive =
                        activeRoadmap &&
                        (String(catRm.id) === String(activeRoadmap.id) ||
                          (catRm.title && activeRoadmap.title && catRm.title.toLowerCase() === activeRoadmap.title.toLowerCase()))

                      return (
                        <div
                          key={catRm.id}
                          onClick={() => setSelectedRoadmapForDetail(catRm)}
                          className={`group p-5 rounded-3xl border hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between cursor-pointer relative ${
                            isLight
                              ? 'border-[#e0d8cc] bg-white text-[#181614]'
                              : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db] hover:border-[#2a2a2a]'
                          }`}
                        >
                          <div>
                            <div className={`flex items-center justify-between text-xs mb-2 ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>
                              <span className={`px-2 py-0.5 rounded-md font-medium ${isLight ? 'bg-[#f4efe5] text-[#665e56]' : 'bg-[#111] text-[#666]'}`}>
                                {catRm.category || 'Engineering'}
                              </span>
                              <span className="font-semibold text-[#f0875a]">{catRm.difficulty || 'Intermediate'}</span>
                            </div>

                            <h3 className={`text-base font-semibold mb-1.5 group-hover:text-[#f0875a] transition-colors duration-200 tracking-tight [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                              {catRm.title}
                            </h3>

                            <p className={`text-xs line-clamp-3 leading-relaxed mb-3 [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#555]'}`}>
                              {catRm.description}
                            </p>

                            {/* Quick skills tags */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {((catRm.skills_covered || ['Foundations', 'Patterns', 'Labs']).slice(0, 3)).map((sk) => (
                                <span
                                  key={sk}
                                  className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-[#f4efe5] text-[#786f66]' : 'bg-[#111] text-[#555]'}`}
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isLight ? 'border-[#e0d8cc]' : 'border-[#111]'}`}>
                            <span className={`text-xs ${isLight ? 'text-[#9a9189]' : 'text-[#444]'}`}>
                              {catRm.duration || '6 Weeks'}
                            </span>

                            <div className="flex items-center gap-2">
                              {isAlreadyActive ? (
                                <span className="inline-flex items-center gap-1 text-xs text-[#f0875a] font-semibold">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Active
                                </span>
                              ) : (
                                <span className="text-xs text-[#f0875a] group-hover:text-[#d96a35] font-semibold flex items-center gap-1 transition-colors duration-200">
                                  <span>Inspect Tree</span>
                                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 3: COURSES (WARM IVORY CARDS) ══════════════ */}
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className={`border-b pb-4 ${isLight ? 'border-[#e0d8cc]' : 'border-[#1c1c1c]'}`}>
                <h1 className={`text-2xl font-light tracking-tight [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                  Video &amp; Interactive Courses
                </h1>
                <p className={`text-xs mt-1 font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#555]'}`}>
                  Step-by-step curriculum units mapped to your active roadmap milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 1, title: 'Node.js & Express Architecture', lessons: 18, duration: '4h 20m', level: 'Intermediate' },
                  { id: 2, title: 'React Foundations & State Systems', lessons: 12, duration: '2h 45m', level: 'Beginner' },
                  { id: 3, title: 'Applied Machine Learning & Neural Nets', lessons: 24, duration: '6h 10m', level: 'Advanced' },
                  { id: 4, title: 'Full-Stack REST & GraphQL APIs', lessons: 16, duration: '3h 50m', level: 'Intermediate' },
                  { id: 5, title: 'TypeScript Production Engineering', lessons: 14, duration: '3h 15m', level: 'Intermediate' },
                  { id: 6, title: 'Docker, CI/CD & Cloud Deployment', lessons: 10, duration: '2h 30m', level: 'Beginner' },
                ].map((course) => (
                  <div
                    key={course.id}
                    className={`p-5 rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between ${
                      isLight
                        ? 'border-[#e0d8cc] bg-white text-[#181614]'
                        : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db] hover:border-[#2a2a2a]'
                    }`}
                  >
                    <div>
                      <div className={`flex items-center justify-between text-xs mb-2 ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>
                        <span>{course.level}</span>
                        <span>{course.duration}</span>
                      </div>
                      <h3 className={`text-sm font-semibold mb-1.5 [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>{course.title}</h3>
                      <p className={`text-xs font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#555]'}`}>{course.lessons} video lessons</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleContinueLesson({ course_id: course.id, lesson_id: 1 })}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2 rounded-full bg-[#c25e2e] hover:bg-[#ad4f22] text-[#faf6ee] font-medium text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] active:translate-y-[0.5px] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/60 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Start Course</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 4: PROJECTS (WARM IVORY CARDS) ══════════════ */}
          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className={`border-b pb-4 ${isLight ? 'border-[#ded4be]' : 'border-[#262320]'}`}>
                <h1 className={`text-2xl font-normal tracking-tight [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-[#faf6ee]'}`}>
                  Milestone Capstone Projects
                </h1>
                <p className={`text-xs mt-1 font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'}`}>
                  Production deliverables that unlock as you complete roadmap milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    title: 'Task API with JWT Authentication',
                    status: 'in_progress',
                    difficulty: 'Intermediate',
                    tech: ['Node.js', 'Express', 'PostgreSQL'],
                    desc: 'Build a production-ready REST API with secure authentication, token refresh, and Postgres migrations.',
                  },
                  {
                    id: 2,
                    title: 'Real-Time Chat Client with WebSockets',
                    status: 'unlocked',
                    difficulty: 'Intermediate',
                    tech: ['React', 'WebSockets', 'Tailwind'],
                    desc: 'A high-performance chat interface featuring WebSocket duplex channels, optimistic message rendering, and presence.',
                  },
                  {
                    id: 3,
                    title: 'Autonomous AI Workflow Orchestrator',
                    status: 'locked',
                    difficulty: 'Advanced',
                    tech: ['Python', 'FastAPI', 'LangChain'],
                    desc: 'Design a multi-agent system executing coordinated code audits and automated test execution.',
                  },
                  {
                    id: 4,
                    title: 'Distributed Telemetry & Analytics Dashboard',
                    status: 'locked',
                    difficulty: 'Advanced',
                    tech: ['Next.js', 'PostgreSQL', 'Redis'],
                    desc: 'Real-time telemetry ingestion and streaming metrics dashboard with sub-second queries.',
                  },
                ].map((proj) => (
                  <div
                    key={proj.id}
                    className={`p-6 rounded-3xl border backdrop-blur-xl flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isLight
                        ? 'border-[#e0d8cc] bg-white text-[#181614]'
                        : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db] hover:border-[#2a2a2a] hover:shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                            proj.status === 'in_progress'
                              ? 'bg-[#c25e2e]/12 text-[#f0875a] border-[#c25e2e]/30'
                              : proj.status === 'unlocked'
                              ? isLight ? 'bg-[#f4efe5] text-[#544d45] border-[#e0d8cc]' : 'bg-[#111] text-[#888] border-[#1c1c1c]'
                              : isLight ? 'bg-[#f4efe5]/60 text-[#9a9189] border-[#e0d8cc]/60' : 'bg-[#0a0a0a] text-[#444] border-[#111]'
                          }`}
                        >
                          {proj.status === 'in_progress'
                            ? '● In Progress'
                            : proj.status === 'unlocked'
                            ? '✓ Unlocked'
                            : '○ Locked (Complete Milestone 4)'}
                        </span>
                        <span className={`text-xs ${isLight ? 'text-[#9a9189]' : 'text-[#555]'}`}>{proj.difficulty}</span>
                      </div>

                      <h3 className={`text-base font-semibold mb-2 [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>{proj.title}</h3>
                      <p className={`text-xs leading-relaxed mb-4 font-normal [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#555]'}`}>{proj.desc}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className={`px-2 py-0.5 rounded-md border text-xs ${
                              isLight ? 'bg-[#f4efe5] border-[#e0d8cc] text-[#544d45]' : 'bg-[#111] border-[#1c1c1c] text-[#888]'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={proj.status === 'locked'}
                      onClick={() => showToast(`Project '${proj.title}' started!`, 'success')}
                      className={`w-full py-2.5 rounded-full text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-[0.98] active:translate-y-[0.5px] focus-visible:ring-2 focus-visible:ring-[#c25e2e]/60 focus-visible:ring-offset-2 focus-visible:outline-none ${
                        proj.status === 'locked'
                          ? isLight ? 'bg-[#f4efe5] text-[#9a9189] cursor-not-allowed' : 'bg-[#111] text-[#444] cursor-not-allowed'
                          : 'bg-[#c25e2e] hover:bg-[#d96a35] text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {proj.status === 'locked' ? 'Locked Milestone' : 'Start Deliverable →'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB: STUDY ROOMS ══════════════ */}
          {activeTab === 'rooms' && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <StudyRoomsSection />
            </motion.div>
          )}

          {/* ══════════════ TAB 5: PORTFOLIO & ACHIEVEMENTS (WARM IVORY CARDS) ══════════════ */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className={`border-b pb-4 ${isLight ? 'border-[#e0d8cc]' : 'border-[#1c1c1c]'}`}>
                <h1 className={`text-2xl font-light tracking-tight [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                  Developer Portfolio &amp; Proof of Work
                </h1>
                <p className={`text-xs mt-1 font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#555]'}`}>
                  Verified platform achievements, milestone credentials, and earned developer badges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(achievements && achievements.length > 0 ? achievements : [
                  { id: '1', title: '7-day streak', description: 'Maintained 7+ consecutive days of daily learning.', unlocked: true },
                  { id: '2', title: 'First API shipped', description: 'Built and verified REST endpoint authentication.', unlocked: true },
                  { id: '3', title: 'Quiz score 90% +', description: 'Scored 90%+ in React Foundations technical evaluation.', unlocked: true },
                  { id: '4', title: 'Roadmap Architect', description: 'Synthesized an AI career roadmap.', unlocked: true },
                  { id: '5', title: 'Hands-on Builder', description: 'Started an active software capstone project.', unlocked: false },
                ]).map((ach) => (
                  <div
                    key={ach.id || ach.achievement_id}
                    className={`p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 ${
                      ach.unlocked
                        ? isLight
                          ? 'border-[#e0d8cc] bg-white text-[#181614] shadow-sm hover:shadow-md'
                          : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db] shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
                        : 'border-[#111] bg-[#060606] text-[#444] opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Award className={`h-5 w-5 ${ach.unlocked ? 'text-[#f0875a]' : 'text-[#333]'}`} />
                      <span className={`text-xs ${isLight ? 'text-[#9a9189]' : 'text-[#444]'}`}>
                        {ach.unlocked ? '✓ Unlocked' : '○ In Progress'}
                      </span>
                    </div>
                    <h3 className={`text-sm font-semibold mb-1 [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>{ach.title}</h3>
                    <p className={`text-xs leading-relaxed font-normal [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#555]'}`}>{ach.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 6: SETTINGS ══════════════ */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 max-w-3xl"
            >
              <div className={`border-b pb-4 ${isLight ? 'border-[#e0d8cc]' : 'border-[#1c1c1c]'}`}>
                <h1 className={`text-2xl font-light tracking-tight [text-wrap:balance] ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                  Account &amp; Workspace Settings
                </h1>
                <p className={`text-xs mt-1 font-normal [text-wrap:pretty] ${isLight ? 'text-[#6e665d]' : 'text-[#555]'}`}>
                  Manage your platform credentials, learning preferences, and active session.
                </p>
              </div>

              <div className="space-y-4">
                {/* Visual Theme Appearance Card */}
                <div className={`p-6 rounded-3xl border space-y-4 shadow-sm hover:shadow-md transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isLight ? 'border-[#e0d8cc] bg-white text-[#181614]' : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 text-sm font-semibold ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                      {isLight ? <Sun className="h-4 w-4 text-[#c25e2e]" /> : <Moon className="h-4 w-4 text-[#f0875a]" />}
                      <span>Appearance &amp; Theme</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                      isLight ? 'bg-[#f4efe5] text-[#544d45]' : 'bg-[#111] text-[#888]'
                    }`}>
                      {theme} Theme Active
                    </span>
                  </div>
                  <p className={`text-xs [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#555]'}`}>
                    Switch between Pure Black (Dark Theme) and Warm Ivory (Light Theme) with Burnt Orange accents.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer flex items-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                        !isLight
                          ? 'border-[#c25e2e] bg-black text-white shadow-sm'
                          : 'border-[#e0d8cc] bg-[#f4efe5] text-[#544d45] hover:border-[#c25e2e]/40'
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      <span>Pure Black (Dark)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer flex items-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none ${
                        isLight
                          ? 'border-[#c25e2e] bg-white text-[#181614] shadow-sm'
                          : 'border-[#1c1c1c] bg-[#111] text-[#888] hover:border-[#c25e2e]/40'
                      }`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      <span>Warm Ivory (Light)</span>
                    </button>
                  </div>
                </div>

                {/* Profile Information */}
                <div className={`p-6 rounded-3xl border space-y-4 shadow-sm hover:shadow-md transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isLight ? 'border-[#e0d8cc] bg-white text-[#181614]' : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db]'
                }`}>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                    <User className="h-4 w-4 text-[#f0875a]" />
                    <span>User Identity</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className={`block mb-1 ${isLight ? 'text-[#665e56]' : 'text-[#888]'}`}>Full Name</span>
                      <div className={`p-3 rounded-xl border font-normal ${
                        isLight ? 'bg-[#f4efe5] border-[#e0d8cc] text-[#181614]' : 'bg-[#111] border-[#1c1c1c] text-[#e8e3db]'
                      }`}>
                        {user?.full_name || 'Harsh'}
                      </div>
                    </div>
                    <div>
                      <span className={`block mb-1 ${isLight ? 'text-[#665e56]' : 'text-[#888]'}`}>Email Address</span>
                      <div className={`p-3 rounded-xl border font-normal ${
                        isLight ? 'bg-[#f4efe5] border-[#e0d8cc] text-[#181614]' : 'bg-[#111] border-[#1c1c1c] text-[#e8e3db]'
                      }`}>
                        {user?.email || 'user@technea.dev'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className={`p-6 rounded-3xl border space-y-4 shadow-sm hover:shadow-md transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isLight ? 'border-[#e0d8cc] bg-white text-[#181614]' : 'border-[#1c1c1c] bg-[#060606] text-[#e8e3db]'
                }`}>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                    <Shield className="h-4 w-4 text-[#f0875a]" />
                    <span>Learning Configuration</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${
                      isLight ? 'bg-[#f4efe5] border-[#e0d8cc]' : 'bg-[#111] border-[#1c1c1c]'
                    }`}>
                      <div>
                        <div className={`font-semibold [text-wrap:pretty] ${isLight ? 'text-[#181614]' : 'text-white'}`}>Active Engineering Focus</div>
                        <div className={`text-[11px] [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#888]'}`}>
                          {activeRoadmap?.title || 'Full-Stack AI Engineer'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('roadmaps')}
                        className="text-xs text-[#f0875a] hover:text-[#d96a35] font-semibold cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none rounded-md px-1 py-0.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      >
                        Change Focus →
                      </button>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-xl border ${
                      isLight ? 'bg-[#f4efe5] border-[#e0d8cc]' : 'bg-[#111] border-[#1c1c1c]'
                    }`}>
                      <div>
                        <div className={`font-semibold [text-wrap:pretty] ${isLight ? 'text-[#181614]' : 'text-white'}`}>AI Mentor Telemetry</div>
                        <div className={`text-[11px] [text-wrap:pretty] ${isLight ? 'text-[#665e56]' : 'text-[#888]'}`}>
                          Real-time lesson context synchronization enabled
                        </div>
                      </div>
                      <span className="text-xs text-[#f0875a] font-semibold">Active</span>
                    </div>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c25e2e]/40 text-[#c25e2e] hover:bg-[#c25e2e]/10 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c25e2e]/50 focus-visible:outline-none"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out of Technea</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 5: AI MENTOR STUDIO ══════════════ */}
          {activeTab === 'mentor' && (
            <motion.div
              key="mentor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#c25e2e]/20 bg-[#c25e2e]/10 text-[#c25e2e] mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Learning OS</span>
                </div>
                <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${isLight ? 'text-[#181614]' : 'text-white'}`}>
                  AI Technical Mentor Studio
                </h1>
                <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-[#6e665d]' : 'text-[#888]'}`}>
                  Real-time architectural guidance, code reviews, and milestone explanations synchronized with {activeRoadmap?.title || 'your active roadmap'}.
                </p>
              </div>

              <div className={`rounded-3xl border overflow-hidden shadow-2xl h-[650px] flex flex-col ${
                isLight ? 'bg-white border-[#e0d8cc]' : 'bg-black border-[#1c1c1c]'
              }`}>
                <DockedAIMentorCompanion
                  onMinimize={() => setActiveTab('overview')}
                  onExpand={() => setIsMentorFullscreen(true)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ──────────────── 4. DOCKED AI MENTOR 2.0 PANEL (RIGHT COLUMN) ──────────────── */}
      {isMentorDocked && activeTab === 'overview' && (
        <aside
          aria-label="AI Technical Mentor Column"
          className={`hidden xl:block w-80 shrink-0 h-full border-l z-20 transition-colors duration-300 ${
            isLight ? 'border-[#ded4be] bg-white' : 'border-[#1c1c1c] bg-black'
          }`}
        >
          <DockedAIMentorCompanion
            onMinimize={() => setIsMentorDocked(false)}
            onExpand={() => setIsMentorFullscreen(true)}
          />
        </aside>
      )}

      {/* ──────────────── 5. FLOATING AI MENTOR PILL & FULLSCREEN STUDIO ──────────────── */}
      <Suspense fallback={<FloatingAIMentorFallback />}>
        <FloatingAIMentorCompanion
          isDocked={isMentorDocked && (activeTab === 'overview' || activeTab === 'mentor')}
          onRestoreDock={() => {
            setIsMentorDocked(true)
            if (activeTab !== 'overview' && activeTab !== 'mentor') {
              setActiveTab('overview')
            }
          }}
          isFullscreen={isMentorFullscreen}
          onCloseFullscreen={() => setIsMentorFullscreen(false)}
        />
      </Suspense>

      {/* ──────────────── 6. ROADMAP DETAIL & SKILL TREE MODAL ──────────────── */}
      {selectedRoadmapForDetail && (
        <RoadmapDetailModal
          roadmap={selectedRoadmapForDetail}
          isOpen={Boolean(selectedRoadmapForDetail)}
          onClose={() => setSelectedRoadmapForDetail(null)}
          onStartLearning={(rm) => {
            setSelectedRoadmapForDetail(null)
            if (rm) {
              switchActiveRoadmap(rm)
              handleContinueLesson(rm)
              if (typeof onSelectPath === 'function') onSelectPath(rm)
            }
          }}
        />
      )}
    </div>
  )
}
