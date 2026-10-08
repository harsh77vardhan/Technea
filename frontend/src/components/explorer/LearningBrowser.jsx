import { useState, useMemo } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { COMPACT_FILTERS, getPathsForQuery } from '../../data/learningPaths'

export default function LearningBrowser({
  submittedQuery,
  onSelectPath,
  selectedPathId,
}) {
  const [activeFilters, setActiveFilters] = useState({
    level: null,
    duration: null,
    goal: null,
    style: null,
    language: null,
  })

  // Resolve base paths for the query
  const allPathsForQuery = useMemo(() => {
    return getPathsForQuery(submittedQuery)
  }, [submittedQuery])

  // Apply active compact filters
  const filteredPaths = useMemo(() => {
    return allPathsForQuery.filter((item) => {
      if (activeFilters.level && item.level !== activeFilters.level) {
        return false
      }
      if (activeFilters.duration && item.duration !== activeFilters.duration) {
        return false
      }
      if (activeFilters.goal && item.goal !== activeFilters.goal) {
        return false
      }
      if (activeFilters.style && item.style !== activeFilters.style) {
        return false
      }
      if (activeFilters.language && (item.language || 'English') !== activeFilters.language) {
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
            {filteredPaths.length} {filteredPaths.length === 1 ? 'learning path' : 'learning paths'} found
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
          {filteredPaths.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <p className="text-sm text-neutral-400 font-normal">
                No learning paths match these specific filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 text-xs text-white underline hover:text-neutral-300 cursor-pointer"
              >
                Reset active filters
              </button>
            </div>
          ) : (
            filteredPaths.map((path) => {
              const isSelected = selectedPathId === path.id

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

                  {/* Key Topics (Bullet tags - No paragraphs) */}
                  {path.keyTopics && path.keyTopics.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 font-light">
                      {path.keyTopics.map((topic) => (
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
