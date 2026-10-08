import { Clock, Check, Sparkles } from 'lucide-react'

export default function SkillCard({ skill, isSelected, onSelect }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(skill)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(skill)
        }
      }}
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-200 text-left select-none cursor-pointer ${
        isSelected
          ? 'border-white ring-1 ring-white/70 bg-white/[0.08] shadow-[0_0_35px_rgba(255,255,255,0.08),0_12px_36px_rgba(0,0,0,0.6)]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
      }`}
    >
      <div>
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              {skill.category}
            </span>

            {skill.beginnerFriendly && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-neutral-300">
                <Sparkles className="h-2.5 w-2.5 text-neutral-400" />
                Beginner Friendly
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-400">
              <Clock className="h-3 w-3 stroke-[1.8]" />
              {skill.duration}
            </span>

            <div
              className={`flex h-4 w-4 items-center justify-center rounded-full transition-all ${
                isSelected
                  ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                  : 'border border-white/20 group-hover:border-white/40'
              }`}
            >
              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </div>
          </div>
        </div>

        {/* Skill Title */}
        <h3 className="mt-3 text-base sm:text-lg font-semibold tracking-tight text-white group-hover:text-white">
          {skill.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
          {skill.description}
        </p>
      </div>

      {/* Subtopics */}
      {skill.topics && skill.topics.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-1.5">
            {skill.topics.map((topic) => (
              <span
                key={topic}
                className="rounded bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-neutral-400"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
