import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { FILTER_SECTIONS } from '../../data/skills'

export default function ExplorerFilters({
  activeFilters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-md">
      {/* Filters Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-neutral-400 stroke-[1.8]" />
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">
            Customize Learning Preferences
          </h4>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter Rows */}
      <div className="mt-4 space-y-4">
        {FILTER_SECTIONS.map((section) => {
          const activeValue = activeFilters[section.id]

          return (
            <div
              key={section.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 shrink-0 sm:w-36">
                {section.label}
              </span>

              <div className="flex flex-wrap items-center gap-1.5 sm:justify-end flex-1">
                {section.options.map((option) => {
                  const isSelected = activeValue === option

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        onFilterChange(
                          section.id,
                          isSelected ? null : option
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-white'
                          : 'border border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
