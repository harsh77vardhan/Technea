// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Career Showcase Section
// Full-bleed edge-to-edge vertical panels with continuous filmic marquee motion.
// ─────────────────────────────────────────────────────────────────────────────

const CAREERS = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    image:
      'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    image:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'cybersecurity-specialist',
    title: 'Cybersecurity Specialist',
    image:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    image:
      'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=1200&q=85',
  },
]

export default function CareerShowcase() {
  // Render two identical 5-panel sets to create an uninterrupted infinite film loop
  const filmPanels = [...CAREERS, ...CAREERS]

  return (
    <section className="relative w-full overflow-hidden bg-[#f2f3f5] pt-16 sm:pt-24 pb-0">
      {/* ── Editorial Header with intentional whitespace ─────────────────── */}
      <div className="mx-auto max-w-4xl px-6 text-center mb-12 sm:mb-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Career Directions
        </p>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#0f172a]">
          Where Technology Takes You
        </h2>
        <div className="mx-auto mt-6 h-px w-10 bg-slate-300" />
        <p className="mx-auto mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-slate-500">
          Curated learning pathways engineered for complete beginners. Move from fundamental concepts to building verified portfolio projects in high-impact domains.
        </p>
      </div>

      {/* ── Top edge Memphis diagonal ribbon accents ──────────────────────── */}
      <div className="relative w-full">
        {/* Left diagonal ribbon pair */}
        <div
          className="pointer-events-none absolute -top-4 left-6 sm:left-12 z-20 select-none"
          aria-hidden="true"
        >
          <svg width="84" height="28" viewBox="0 0 84 28" fill="none">
            <polygon points="10,28 22,0 36,0 24,28" fill="#8B5CF6" />
            <polygon points="40,28 52,0 66,0 54,28" fill="#2563EB" />
          </svg>
        </div>

        {/* Right diagonal ribbon trio: Purple (#8B5CF6), Blue (#2563EB), Cyan (#06B6D4) */}
        <div
          className="pointer-events-none absolute -top-4 right-6 sm:right-12 z-20 select-none"
          aria-hidden="true"
        >
          <svg width="128" height="28" viewBox="0 0 128 28" fill="none">
            <polygon points="10,28 22,0 36,0 24,28" fill="#8B5CF6" />
            <polygon points="42,28 54,0 68,0 56,28" fill="#2563EB" />
            <polygon points="74,28 86,0 100,0 88,28" fill="#06B6D4" />
          </svg>
        </div>

        {/* ── Full-width, seamless, edge-to-edge cinematic strip ──────────── */}
        {/* Reduced height by ~1/3; continuous non-stopping marquee */}
        <div className="marquee-container relative w-full overflow-hidden select-none">
          <div className="animate-marquee flex gap-0">
            {filmPanels.map((panel, idx) => (
              <div
                key={`${panel.id}-${idx}`}
                className="group relative h-[350px] sm:h-[400px] lg:h-[450px] w-[240px] sm:w-[280px] lg:w-[20vw] shrink-0 overflow-hidden cursor-pointer"
              >
                {/* Full-bleed authentic photography */}
                <img
                  src={panel.image}
                  alt={panel.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />

                {/* Top-left dark gradient scrim for crystal clear white typography */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/20 to-transparent"
                  aria-hidden="true"
                />

                {/* Subtle cinematic overall film tint, slightly brightens on hover */}
                <div
                  className="pointer-events-none absolute inset-0 bg-slate-950/10 transition-opacity duration-700 group-hover:opacity-0"
                  aria-hidden="true"
                />

                {/* Profession Name: Top-Left, Large Bold Modern Sans-serif, White */}
                <div className="absolute top-0 left-0 p-5 sm:p-6 z-10 max-w-[210px] sm:max-w-[240px]">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-tight text-white leading-[1.1] drop-shadow-sm">
                    {panel.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
