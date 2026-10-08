import { TrendingUp } from 'lucide-react'
import { POPULAR_SEARCHES } from '../../data/skills'

export default function PopularSearches({ currentQuery, onSelectQuery }) {
  return (
    <div className="pt-1">
      <div className="flex items-center gap-1.5 mb-2.5">
        <TrendingUp className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-400 font-medium">
          Popular right now
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {POPULAR_SEARCHES.map((item) => {
          const isSelected = currentQuery.toLowerCase().trim() === item.toLowerCase().trim()
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelectQuery(isSelected ? '' : item)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-sm ring-2 ring-neutral-900 ring-offset-1 ring-offset-white'
                  : 'border border-neutral-200/90 bg-neutral-50/60 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}
