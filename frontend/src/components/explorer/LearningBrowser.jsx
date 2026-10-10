import { useState, useEffect, useMemo, useCallback } from 'react'
import { ArrowRight, RotateCcw, AlertCircle, Loader2 } from 'lucide-react'
import { getLearningPaths } from '../../services/api'
import { COMPACT_FILTERS } from '../../constants/filters'

export default function LearningBrowser({
  submittedQuery,
  onSelectPath,
  selectedPathId,
}) {
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [activeFilters, setActiveFilters] = useState({
    level: null,
    duration: null,
    goal: null,
    style: null,
    language: null,
  })

  // Fetch learning paths asynchronously
  useEffect(() => {
    let isMounted = true

    getLearningPaths()
      .then((data) => {
        if (isMounted) {
          setPaths(Array.isArray(data) ? data : [])
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load learning paths from API:', err)
          setError(err.message || 'Unable to load learning paths from server.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const handleRetry = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadKey((k) => k + 1)
  }, [])

  // Resolve search query matches against API data
  const allPathsForQuery = useMemo(() => {
    const q = (submittedQuery || '').trim().toLowerCase()
    if (!q) return paths

    return paths.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(q)
      const catMatch = item.category?.toLowerCase().includes(q)
      const descMatch = item.description?.toLowerCase().includes(q)
      const stepsMatch = item.roadmap_steps?.some(
        (step) =>
          step.title?.toLowerCase().includes(q) ||
          step.description?.toLowerCase().includes(q)
      )
      const topicsMatch = item.keyTopics?.some((t) =>
        t.toLowerCase().includes(q)
      )
      return titleMatch || catMatch || descMatch || stepsMatch || topicsMatch
    })
  }, [paths, submittedQuery])

  // Apply active compact filters
  const filteredPaths = useMemo(() => {
    return allPathsForQuery.filter((item) => {
      // Level filter
      if (activeFilters.level) {
        if (!item.level || item.level.toLowerCase() !== activeFilters.level.toLowerCase()) {
          return false
        }
      }

      // Duration filter
      if (activeFilters.duration) {
        const itemDur = (item.duration || '').toLowerCase()
        const filterDur = activeFilters.duration.toLowerCase()
        const numInFilter = filterDur.match(/\d+/)?.[0]
        const numInItem = itemDur.match(/\d+/)?.[0]

        if (numInFilter && numInItem) {
          if (filterDur.includes('+')) {
            if (parseInt(numInItem, 10) < parseInt(numInFilter, 10)) return false
          } else if (numInFilter !== numInItem) {
            return false
          }
        } else if (itemDur !== filterDur) {
          return false
        }
      }

      // Metadata filters (for paths that specify goal, style, language)
      if (activeFilters.goal && item.goal && item.goal !== activeFilters.goal) {
        return false
      }
      if (activeFilters.style && item.style && item.style !== activeFilters.style) {
        return false
      }
      if (activeFilters.language && item.language && item.language !== activeFilters.language) {
        return false
      }

      return true
    })
  }, [allPathsForQuery, activeFilters])

  const handleFilterToggle = (groupId, option) => {
    setActiveFilters((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === option ? null : option,
    }))
  }

  const handleResetFilters = () => {
    setActiveFilters({
      level: null,
      duration: null,
      goal: null,
      style: null,
      language: null,
    })
  }

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== null)

  const displayTitle = submittedQuery
    ? submittedQuery.charAt(0).toUpperCase() + submittedQuery.slice(1)
    : 'Learning Paths'

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden animate-in fade-in duration-200">
      {/* ── FIXED TOP HEADER ──────────────────────────────────────────────── */}
      <div className="shrink-0 pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          {displayTitle}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-400 font-light">
          Explore learning paths, courses and projects
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="font-mono text-xs text-neutral-400 tracking-wider">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-neutral-400">
                <Loader2 className="h-3 w-3 animate-spin text-neutral-300" />
                Fetching paths...
              </span>
            ) : (
              `${filteredPaths.length} ${filteredPaths.length === 1 ? 'learning path' : 'learning paths'} found`
            )}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── INDEPENDENT SPLIT SCROLLING ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden pt-4">
        {/* LEFT FILTER PANEL (Fixed with its own vertical scroll) */}
        <aside className="w-full lg:w-56 shrink-0 h-auto lg:h-full lg:overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2 space-y-4">
          {/* Level Filter */}
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Level
            </span>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {COMPACT_FILTERS.level.map((lvl) => {
                const isSelected = activeFilters.level === lvl
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleFilterToggle('level', lvl)}
                    className={`text-left rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'border border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {lvl}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Duration
            </span>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {COMPACT_FILTERS.duration.map((dur) => {
                const isSelected = activeFilters.duration === dur
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleFilterToggle('duration', dur)}
                    className={`text-left rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'border border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {dur}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Goal Filter */}
          <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Goal
            </span>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {COMPACT_FILTERS.goal.map((g) => {
                const isSelected = activeFilters.goal === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleFilterToggle('goal', g)}
                    className={`text-left rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'border border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Style Filter */}
          <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Style
            </span>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {COMPACT_FILTERS.style.map((st) => {
                const isSelected = activeFilters.style === st
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleFilterToggle('style', st)}
                    className={`text-left rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'border border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {st}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Language Filter */}
          <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Language
            </span>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {COMPACT_FILTERS.language.map((lang) => {
                const isSelected = activeFilters.language === lang
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleFilterToggle('language', lang)}
                    className={`text-left rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'border border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {lang}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT RESULTS SECTION (Own separate vertical scroll) */}
        <main className="flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1 space-y-3 pb-6">
          {/* Loading State Skeleton */}
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-3 w-20 bg-white/10 rounded" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-16 bg-white/10 rounded" />
                      <div className="h-4 w-16 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-2/3 bg-white/10 rounded mt-2" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-3 w-24 bg-white/5 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-end">
                    <div className="h-7 w-28 bg-white/10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-500/10 text-red-400 mb-1">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-red-300">
                {error}
              </p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Unable to retrieve data from FastAPI backend. Verify the backend server is active at http://127.0.0.1:8000.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-sm"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPaths.length === 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <p className="text-sm text-neutral-400 font-normal">
                {paths.length === 0
                  ? 'No learning paths available from database.'
                  : 'No learning paths match these specific filters.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 text-xs text-white underline hover:text-neutral-300 cursor-pointer"
                >
                  Reset active filters
                </button>
              )}
            </div>
          )}

          {/* Populated Results List */}
          {!loading && !error && filteredPaths.length > 0 && (
            filteredPaths.map((path) => {
              const isSelected = selectedPathId === path.id
              // Derive key topics from roadmap_steps or fallback
              const topics = path.keyTopics && path.keyTopics.length > 0
                ? path.keyTopics
                : path.roadmap_steps && path.roadmap_steps.length > 0
                ? path.roadmap_steps.map((s) => s.title).slice(0, 4)
                : []

              return (
                <div
                  key={path.id}
                  className={`
                    rounded-xl border p-4 sm:p-5 transition-all duration-150
                    bg-white/[0.02] hover:bg-white/[0.04]
                    ${
                      isSelected
                        ? 'border-white ring-1 ring-white/60 bg-white/[0.06] shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                        : 'border-white/[0.08] hover:border-white/20'
                    }
                  `}
                >
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                      {path.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                        {path.level}
                      </span>
                      <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                        {path.duration}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="mt-2 text-base sm:text-lg font-semibold tracking-tight text-white">
                    {path.title}
                  </h2>

                  {/* Description if present */}
                  {path.description && (
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-2 font-light">
                      {path.description}
                    </p>
                  )}

                  {/* Key Topics (Derived from backend roadmap steps or topics) */}
                  {topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 font-light">
                      {topics.map((topic) => (
                        <span key={topic} className="inline-flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-white/40" />
                          <span>{topic}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Action */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectPath(path)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>Explore Path</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </main>
      </div>
    </div>
  )
}
