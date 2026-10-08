import { Compass } from 'lucide-react'

export default function ClosestPathsNotice({ searchQuery }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white">
          <Compass className="h-4 w-4 stroke-[1.8]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Closest Learning Paths
            </h3>
            {searchQuery && (
              <span className="font-mono text-[11px] text-neutral-400">
                for &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
            We couldn&apos;t find an exact roadmap, but these learning paths are closely related.
          </p>
        </div>
      </div>
    </div>
  )
}
