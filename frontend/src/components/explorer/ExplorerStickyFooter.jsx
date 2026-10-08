import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ExplorerStickyFooter({
  selectedSkill,
  durationOverride,
  onBuildRoadmap,
  onCancel,
}) {
  if (!selectedSkill) return null

  const effectiveDuration = durationOverride || selectedSkill.duration

  return (
    <div className="sticky bottom-0 z-30 border-t border-white/10 bg-[#090a0e]/95 backdrop-blur-xl px-6 py-3.5 sm:px-8 sm:py-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Selected Skill Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]">
            <CheckCircle2 className="h-4 w-4" />
          </div>

          <div className="text-left">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                Selected:
              </span>
              <span className="text-sm font-bold text-white tracking-tight">
                {selectedSkill.title}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                Estimated Roadmap:
              </span>
              <span className="text-xs font-semibold text-neutral-300">
                {effectiveDuration}
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onBuildRoadmap}
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:bg-neutral-200 active:scale-[0.98] cursor-pointer"
          >
            <span>Build My Roadmap</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
