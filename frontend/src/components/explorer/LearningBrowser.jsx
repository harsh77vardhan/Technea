import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, RotateCcw, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { getLearningPaths, searchCatalog, analyzeIntent } from '../../services/api'
import { COMPACT_FILTERS } from '../../constants/filters'

export default function LearningBrowser({
  submittedQuery,
  onSelectPath,
  selectedPathId,
}) {
  const [paths, setPaths] = useState([])
  const [relatedPaths, setRelatedPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [searchMeta, setSearchMeta] = useState({ fuzzy: [], synonyms: [] })
  const [aiIntent, setAiIntent] = useState(null)
  const [fallbackInfo, setFallbackInfo] = useState({ isFallback: false, message: null })
  const [activeFilters, setActiveFilters] = useState({
    level: null,
    duration: null,
  })

  // Fetch learning paths and process fuzzy/synonym/intent search with active filters
  useEffect(() => {
    let isMounted = true

    // Initialize state asynchronously to avoid React cascading render warnings
    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true)
        setError(null)
      }
    })

    const q = (submittedQuery || '').trim()

    const filterOptions = {
      level: activeFilters.level || undefined,
      duration: activeFilters.duration || undefined,
      limit: 250,
    }

    // Detect if the query looks like a natural language learning goal / question
    const isNaturalLanguage =
      q &&
      (q.split(/\s+/).length >= 3 ||
        /\b(never|want|build|start|learn|how|become|create|code|beginner|switch|path)\b/i.test(q))

    const promises = [
      searchCatalog(q, filterOptions).catch((err) => {
        console.warn('[Search] Catalog search error:', err.message)
        return null
      }),
    ]

    if (isNaturalLanguage) {
      promises.push(
        analyzeIntent(q).catch((err) => {
          console.warn('[Intent] Intent parsing error:', err.message)
          return null
        })
      )
    }

    Promise.all(promises)
      .then(([searchRes, intentRes]) => {
        if (!isMounted) return

        let resolvedPaths = []
        let resolvedRelated = []
        let fuzzy = []
        let synonyms = []
        let isFallback = false
        let fallbackMsg = null

        if (searchRes) {
          fuzzy = searchRes.fuzzy_corrections || []
          synonyms = searchRes.synonyms_expanded || []
          isFallback = Boolean(searchRes.is_fallback)
          fallbackMsg = searchRes.fallback_message || null

          if (Array.isArray(searchRes.learning_paths)) {
            resolvedPaths = searchRes.learning_paths
          }
          if (Array.isArray(searchRes.related_learning_paths)) {
            resolvedRelated = searchRes.related_learning_paths
          }
        }

        const hasActiveFilterSet = Object.values(activeFilters).some((v) => v !== null)

        if (intentRes && intentRes.intent) {
          setAiIntent(intentRes)
          if (
            Array.isArray(intentRes.recommended_learning_paths) &&
            intentRes.recommended_learning_paths.length > 0
          ) {
            const validRecs = intentRes.recommended_learning_paths.filter((p) => {
              if (activeFilters.level && !p.level?.toLowerCase().includes(activeFilters.level.toLowerCase())) return false
              if (activeFilters.duration && p.duration !== activeFilters.duration) return false
              return true
            })
            const intentIds = new Set(validRecs.map((p) => p.id))
            const nonDupes = resolvedPaths.filter((p) => !intentIds.has(p.id))
            resolvedPaths = [...validRecs, ...nonDupes]
          }
        } else {
          setAiIntent(null)
        }

        if (hasActiveFilterSet) {
          resolvedPaths = resolvedPaths.filter((p) => {
            if (activeFilters.level && !p.level?.toLowerCase().includes(activeFilters.level.toLowerCase())) return false
            if (activeFilters.duration && p.duration !== activeFilters.duration) return false
            return true
          })
        }

        setSearchMeta({ fuzzy, synonyms })
        setFallbackInfo({ isFallback, message: fallbackMsg })
        setRelatedPaths(resolvedRelated)

        if (searchRes && Array.isArray(searchRes.learning_paths)) {
          setPaths(resolvedPaths)
          setLoading(false)
        } else {
          // Direct fallback to learning-paths endpoint with the active filters
          getLearningPaths({ q, ...filterOptions })
            .then((data) => {
              if (isMounted) {
                setPaths(Array.isArray(data) ? data : [])
                setLoading(false)
              }
            })
            .catch((err) => {
              if (isMounted) {
                setError(err.message || 'Unable to load learning paths.')
                setLoading(false)
              }
            })
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load learning paths.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [
    submittedQuery,
    activeFilters,
    reloadKey,
  ])

  const handleRetry = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadKey((k) => k + 1)
  }, [])

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
          Explore curated learning paths, roadmaps and project milestones
        </p>

        {/* Search feedback: Typo corrections & Synonym expansion */}
        {searchMeta.fuzzy && searchMeta.fuzzy.length > 0 && (
          <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-neutral-300">
            <span className="font-mono text-[10px] uppercase text-neutral-500 font-semibold">Matched:</span>
            {searchMeta.fuzzy.map((c) => (
              <span key={c} className="font-medium text-white">{c}</span>
            ))}
          </div>
        )}

        {searchMeta.synonyms && searchMeta.synonyms.length > 0 && !aiIntent && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
            <span className="font-mono text-[10px] uppercase text-neutral-500">Related concepts:</span>
            {searchMeta.synonyms.slice(0, 6).map((syn) => (
              <span key={syn} className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[11px] text-neutral-400">
                {syn}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <p className="font-mono text-xs text-neutral-400 tracking-wider">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-neutral-400">
                <Loader2 className="h-3 w-3 animate-spin text-neutral-300" />
                Scanning catalog...
              </span>
            ) : (
              `${paths.length} ${paths.length === 1 ? 'learning path' : 'learning paths'} found`
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
        </aside>

        {/* RIGHT RESULTS SECTION (Own separate vertical scroll) */}
        <main className="flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1 space-y-3 pb-6">
          {/* ── AI Intent Blueprint Card ──────────────────────────────── */}
          {!loading && aiIntent && (
            <div className="rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 sm:p-6 mb-4 space-y-4 shadow-lg animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                    AI Learning Blueprint
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-neutral-300">
                    Level: {aiIntent.intent.experience_level}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-neutral-300">
                    Domain: {aiIntent.intent.domain}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                {aiIntent.intent.summary}
              </p>

              {/* Sequential Progression Roadmaps */}
              {aiIntent.recommended_progression && aiIntent.recommended_progression.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    Curated Step Progression
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {aiIntent.recommended_progression.map((step, idx) => (
                      <div key={step.step} className="flex items-center gap-2 shrink-0">
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left min-w-[150px]">
                          <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
                            <span>Step {step.step}</span>
                            <span className="text-neutral-500">{step.estimated_duration}</span>
                          </div>
                          <div className="text-xs font-semibold text-white mt-1">
                            {step.skill_name}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1 font-light">
                            {step.action}
                          </div>
                        </div>
                        {idx < aiIntent.recommended_progression.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-neutral-600 shrink-0 hidden sm:block" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Fallback alternatives banner (Requirement 3) */}
          {!loading && !error && fallbackInfo.isFallback && paths.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3.5 mb-3 flex items-start gap-2.5 text-xs text-amber-200/90 animate-in fade-in duration-200">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-200">
                  We couldn&apos;t find an exact match.
                </p>
                <p className="text-amber-300/80 text-[11px] mt-0.5">
                  {fallbackInfo.message || 'Showing the closest learning paths instead.'}
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && paths.length === 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <p className="text-sm text-neutral-400 font-normal">
                No learning paths match these specific filters.
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
          {!loading && !error && paths.length > 0 && (
            <div className="space-y-3">
              {submittedQuery && (
                <div className="pb-1">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                    Search Results
                  </h3>
                </div>
              )}
              {paths.map((path) => {
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
                          {path.level || path.difficulty || 'Beginner'}
                        </span>
                        <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                          {path.duration || '4 Weeks'}
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
              })}
            </div>
          )}

          {/* Related Learning Paths Section (Requirements 1 & 8) */}
          {!loading && !error && relatedPaths.length > 0 && (
            <div className="pt-6 mt-6 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-semibold">
                    Related Learning Paths
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5 font-light">
                    Nearby technologies and complementary skill roadmaps
                  </p>
                </div>
                <span className="font-mono text-[11px] text-neutral-500">
                  {relatedPaths.length} {relatedPaths.length === 1 ? 'path' : 'paths'}
                </span>
              </div>

              {relatedPaths.map((path) => {
                const isSelected = selectedPathId === path.id
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
                          {path.level || path.difficulty || 'Beginner'}
                        </span>
                        <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                          {path.duration || '4 Weeks'}
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

                    {/* Key Topics */}
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
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
