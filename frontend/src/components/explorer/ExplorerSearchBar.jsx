import { Search, X } from 'lucide-react'

export default function ExplorerSearchBar({
  searchQuery,
  onSearchChange,
  onSubmit,
  inputRef,
  isCentered = false,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchQuery.trim()) {
        onSubmit(searchQuery.trim())
      }
    }
  }

  // ── Large Centered Cinematic Command Interface (Stage 1: Discover) ───────
  if (isCentered) {
    return (
      <div className="relative w-full max-w-xl mx-auto">
        {/* Soft Ambient Glow Halo behind the command input */}
        <div
          className="pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100"
          aria-hidden="true"
        />

        <div className="relative flex items-center group">
          {/* Left Command Indicator */}
          <div className="pointer-events-none absolute left-5 sm:left-6 flex items-center gap-2 text-neutral-500 group-focus-within:text-white transition-colors duration-200">
            <span className="font-mono text-xs sm:text-sm font-semibold opacity-60">
              &gt;
            </span>
            <Search className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.8] opacity-80" />
          </div>

          {/* Precision Glass Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your skill..."
            className="
              w-full rounded-2xl
              border border-white/15 hover:border-white/25
              focus:border-white/40 focus:outline-none
              bg-white/[0.05] hover:bg-white/[0.07] focus:bg-white/[0.08]
              backdrop-blur-2xl
              py-4 sm:py-5 pl-14 sm:pl-16 pr-12 sm:pr-14
              text-base sm:text-xl font-light sm:font-normal tracking-[-0.015em] text-white
              placeholder:text-neutral-500 placeholder:font-light
              shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]
              focus:shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2)]
              transition-all duration-300 ease-out
            "
          />

          {/* Right Action: Clear Input when typing */}
          {searchQuery && (
            <div className="absolute right-3.5 sm:right-4 flex items-center">
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1.5 text-neutral-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Compact Command Bar (Stage 2: Explore) ────────────────────────────────
  return (
    <div className="relative flex items-center group w-full">
      <div className="pointer-events-none absolute left-3.5 flex items-center gap-1.5 text-neutral-500 group-focus-within:text-white transition-colors duration-200">
        <span className="font-mono text-[11px] opacity-60">&gt;</span>
        <Search className="h-3.5 w-3.5 stroke-[1.8]" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search your skill..."
        className="
          w-full rounded-xl
          border border-white/10 hover:border-white/20
          focus:border-white/35 focus:outline-none
          bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08]
          backdrop-blur-xl
          py-2 pl-9 pr-9
          text-sm font-light text-white
          placeholder:text-neutral-500
          shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
          transition-all duration-200
        "
      />

      {searchQuery && (
        <div className="absolute right-2 flex items-center">
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="p-1 text-neutral-500 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Clear input"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
