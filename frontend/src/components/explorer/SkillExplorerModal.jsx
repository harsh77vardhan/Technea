import { useState, useEffect, useRef, useMemo } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import ExplorerSearchBar from './ExplorerSearchBar'
import FloatingKeywords from './FloatingKeywords'
import LearningBrowser from './LearningBrowser'
import ExplorerStickyFooter from './ExplorerStickyFooter'
import LearningPathDetailPage from '../../pages/LearningPathDetailPage'
import CoursePlayerPage from '../../pages/CoursePlayerPage'
import { SKILLS } from '../../data/skills'
import { getSkills } from '../../services/api'

export default function SkillExplorerModal({ isOpen, onClose, onSelectPath }) {
  const [stage, setStage] = useState('discover') // 'discover' | 'explore' | 'detail' | 'player'
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState(null)
  const [selectedPathObject, setSelectedPathObject] = useState(null)
  const [selectedCourseObject, setSelectedCourseObject] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(isOpen)
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [roadmapSuccessMessage, setRoadmapSuccessMessage] = useState(null)
  const [apiSkills, setApiSkills] = useState([])

  const searchInputRef = useRef(null)
  const panelRef = useRef(null)

  // Fetch skills from API for modal resolving
  useEffect(() => {
    let active = true
    getSkills()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setApiSkills(data)
        }
      })
      .catch((err) => {
        console.warn('Could not fetch skills from API:', err.message)
      })
    return () => {
      active = false
    }
  }, [])


  // Handle smooth entrance and exit animations of the slide
  useEffect(() => {
    let timeoutId
    let rafId

    if (isOpen) {
      rafId = requestAnimationFrame(() => {
        setIsMounted(true)
        setIsPanelVisible(true)
      })
    } else {
      rafId = requestAnimationFrame(() => {
        setIsPanelVisible(false)
      })
      timeoutId = setTimeout(() => {
        setIsMounted(false)
        setStage('discover')
        setSearchQuery('')
        setSubmittedQuery('')
        setSelectedSkillId(null)
        setSelectedPathObject(null)
        setSelectedCourseObject(null)
        setRoadmapSuccessMessage(null)
      }, 250)
    }

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
    }
  }, [isOpen])

  // Mouse move handler for spatial parallax
  const handleMouseMove = (e) => {
    if (stage === 'detail' || stage === 'player' || !panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1
    setMousePos({ x: normX, y: normY })
  }

  // Keyboard navigation (ESC to close) & background scroll lock
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (stage === 'player') {
          setStage('detail')
        } else if (stage === 'detail') {
          setStage('explore')
        } else if (stage === 'explore') {
          setStage('discover')
          setSelectedSkillId(null)
          setSelectedPathObject(null)
        } else {
          onClose()
        }
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    const focusTimer = setTimeout(() => {
      if (stage !== 'detail' && stage !== 'player') {
        searchInputRef.current?.focus()
      }
    }, 120)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      clearTimeout(focusTimer)
    }
  }, [isOpen, stage, onClose])

  // Handle Enter submission
  const handleSubmitQuery = (queryText) => {
    const cleanQuery = queryText.trim()
    if (!cleanQuery) return
    setSubmittedQuery(cleanQuery)
    setStage('explore')
    setSelectedSkillId(null)
    setSelectedPathObject(null)
  }

  // Handle clicking a floating keyword directly
  const handleSelectKeyword = (keywordText) => {
    setSearchQuery(keywordText)
    handleSubmitQuery(keywordText)
  }

  // Selected skill or path resolution for the footer CTA
  const selectedSkill = useMemo(() => {
    if (selectedPathObject) {
      return {
        id: selectedPathObject.id,
        title: selectedPathObject.title,
        category: selectedPathObject.category,
        duration: selectedPathObject.duration,
        level: selectedPathObject.level || selectedPathObject.difficulty || 'Beginner',
      }
    }

    if (selectedSkillId) {
      const allSkills = apiSkills.length > 0 ? apiSkills : SKILLS
      const found = allSkills.find(
        (s) => s.id === selectedSkillId || String(s.id) === String(selectedSkillId)
      )
      if (found) {
        return {
          id: found.id,
          title: found.name || found.title,
          category: found.category,
          duration: found.duration || '4 weeks',
          level: found.level || 'Beginner',
        }
      }
    }

    if (submittedQuery) {
      return {
        id: 'query-path',
        title: submittedQuery.charAt(0).toUpperCase() + submittedQuery.slice(1),
        category: 'Learning Path',
        duration: '2-4 weeks',
        level: 'Beginner',
      }
    }

    return null
  }, [selectedPathObject, selectedSkillId, submittedQuery, apiSkills])


  const handleSelectLearningPath = (path) => {
    if (!path) return
    setSelectedSkillId(path.id)
    setSelectedPathObject(path)
    setStage('detail')
    if (typeof onSelectPath === 'function') {
      onSelectPath(path)
    }
  }

  const handleBackToResults = () => {
    setStage('explore')
  }

  const handleBuildRoadmap = () => {
    if (!selectedSkill) return
    const targetPath = selectedPathObject || selectedSkill
    handleSelectLearningPath(targetPath)
  }

  if (!isMounted) return null

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Build Your Roadmap"
        className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8 ${
          stage === 'detail' || stage === 'player' ? 'hidden' : ''
        }`}
      >
        {/* ── Deep Cinematic Backdrop (Landing page visible behind with blur) ── */}
        <div
          onClick={onClose}
          className={`fixed inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-300 ease-out cursor-pointer ${
            isPanelVisible ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* ── Precision Rectangular Slide Panel (Linear / Vercel / Apple Inspired) ─ */}
        <div
          ref={panelRef}
          onMouseMove={handleMouseMove}
          className={`
            relative z-10 flex flex-col w-full
            rounded-none
            bg-[#08090d]/95 sm:bg-[#08090c]/90
            backdrop-blur-2xl
            border border-white/[0.08]
            shadow-[0_30px_100px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]
            overflow-hidden
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              stage === 'discover'
                ? 'max-w-3xl lg:max-w-4xl min-h-[480px] sm:min-h-[540px] max-h-[85vh]'
                : 'max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[88vh] max-h-[90vh]'
            }
            ${
              isPanelVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-12 sm:translate-y-16 scale-[0.98]'
            }
          `}
        >
          {/* Soft Noise Grain Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />

          {/* Minimal Faint Radial Ambient Glow */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
            aria-hidden="true"
          />

          {/* ────────────────────────────────────────────────────────── */}
          {/* FIRST STATE: DISCOVER (Before searching / pressing ENTER)  */}
          {/* ────────────────────────────────────────────────────────── */}
          {stage === 'discover' ? (
            <div className="relative flex flex-col justify-center items-center flex-1 px-6 sm:px-12 py-16 overflow-hidden">
              {/* Top Right Minimal Close Button */}
              <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              {/* Spatial Multi-Depth Floating Skill Keywords with Parallax */}
              <FloatingKeywords
                onSelectKeyword={handleSelectKeyword}
                mousePos={mousePos}
              />

              {/* Centered Cinematic Command Search Bar */}
              <div className="relative z-10 w-full max-w-xl mx-auto text-center space-y-4">
                <ExplorerSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSubmit={handleSubmitQuery}
                  inputRef={searchInputRef}
                  isCentered={true}
                />
              </div>
            </div>
          ) : (
            /* ────────────────────────────────────────────────────────── */
            /* SECOND STATE: EXPLORE (Skillshare-inspired Discovery)     */
            /* ────────────────────────────────────────────────────────── */
            <>
              {/* Stage 2 Header Navigation Bar */}
              <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/[0.07] px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={() => {
                    setStage('discover')
                    setSelectedSkillId(null)
                    setSelectedPathObject(null)
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 py-1.5 px-2.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/10"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Discover</span>
                </button>

                <div className="flex-1 max-w-md mx-2">
                  <ExplorerSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSubmit={handleSubmitQuery}
                    inputRef={searchInputRef}
                    isCentered={false}
                  />
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              {/* Stage 2 Body: Skillshare-inspired Learning Browser */}
              <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden px-6 pt-5 pb-2 sm:px-8">
                <LearningBrowser
                  submittedQuery={submittedQuery}
                  selectedPathId={selectedSkillId}
                  onSelectPath={handleSelectLearningPath}
                />

                {/* Success Notification on Build Roadmap */}
                {roadmapSuccessMessage && (
                  <div className="rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-xl p-4 text-white text-xs sm:text-sm font-medium shadow-xl transition-all animate-in fade-in">
                    <p className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                      {roadmapSuccessMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Sticky Action Footer inside panel */}
              <ExplorerStickyFooter
                selectedSkill={selectedSkill}
                durationOverride={selectedSkill?.duration}
                onBuildRoadmap={handleBuildRoadmap}
                onCancel={() => {
                  setStage('discover')
                  setSelectedSkillId(null)
                  setSelectedPathObject(null)
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* THIRD STATE: LEARNING PATH DETAIL                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {stage === 'detail' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Learning Path Detail"
          className="fixed inset-0 z-50 overflow-y-auto bg-[#08090d]"
        >
          <LearningPathDetailPage
            path={selectedPathObject}
            onBack={handleBackToResults}
            onStartLearning={(course) => {
              setSelectedCourseObject(course)
              setStage('player')
            }}
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* FOURTH STATE: COURSE PLAYER                                */}
      {/* ────────────────────────────────────────────────────────── */}
      {stage === 'player' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Course Player"
          className="fixed inset-0 z-50 overflow-y-auto bg-[#08090d]"
        >
          <CoursePlayerPage
            course={selectedCourseObject}
            path={selectedPathObject}
            onBack={() => setStage('detail')}
            onSelectCourse={(newCourse) => setSelectedCourseObject(newCourse)}
          />
        </div>
      )}
    </>
  )
}
