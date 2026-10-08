const SPATIAL_KEYWORDS = [
  // ── Layer 1: Foreground (Sharp, closer, larger presence) ────────────────────
  {
    text: 'Python',
    depth: 'foreground',
    size: 'text-lg sm:text-2xl font-bold tracking-tight',
    style: { top: '14%', left: '11%' },
    blur: 'blur-0',
    opacity: 'opacity-70',
    anim: 'animate-float-1',
    parallaxSpeed: 24,
  },
  {
    text: 'Machine Learning',
    depth: 'foreground',
    size: 'text-sm sm:text-base font-semibold tracking-normal',
    style: { top: '16%', right: '12%' },
    blur: 'blur-0',
    opacity: 'opacity-65',
    anim: 'animate-float-2',
    parallaxSpeed: 20,
  },
  {
    text: 'React',
    depth: 'foreground',
    size: 'text-xl sm:text-3xl font-extrabold tracking-tight',
    style: { top: '48%', left: '6%' },
    blur: 'blur-0',
    opacity: 'opacity-75',
    anim: 'animate-float-3',
    parallaxSpeed: 26,
  },
  {
    text: 'AI Agents',
    depth: 'foreground',
    size: 'text-xs sm:text-sm font-mono uppercase tracking-widest font-semibold',
    style: { top: '46%', right: '7%' },
    blur: 'blur-0',
    opacity: 'opacity-70',
    anim: 'animate-float-4',
    parallaxSpeed: 22,
  },
  {
    text: 'Artificial Intelligence',
    depth: 'foreground',
    size: 'text-sm sm:text-base font-semibold tracking-tight',
    style: { top: '5%', right: '28%' },
    blur: 'blur-0',
    opacity: 'opacity-60',
    anim: 'animate-float-1',
    parallaxSpeed: 22,
  },
  {
    text: 'JavaScript',
    depth: 'foreground',
    size: 'text-base sm:text-lg font-bold tracking-tight',
    style: { bottom: '40%', left: '4%' },
    blur: 'blur-0',
    opacity: 'opacity-70',
    anim: 'animate-float-3',
    parallaxSpeed: 25,
  },
  {
    text: 'DevOps',
    depth: 'foreground',
    size: 'text-xs sm:text-sm font-mono uppercase tracking-widest font-semibold',
    style: { top: '58%', right: '5%' },
    blur: 'blur-0',
    opacity: 'opacity-65',
    anim: 'animate-float-2',
    parallaxSpeed: 21,
  },
  {
    text: 'LLMs',
    depth: 'foreground',
    size: 'text-xs sm:text-sm font-mono font-bold tracking-wider',
    style: { top: '25%', right: '32%' },
    blur: 'blur-0',
    opacity: 'opacity-65',
    anim: 'animate-float-3',
    parallaxSpeed: 23,
  },
  {
    text: 'Flutter',
    depth: 'foreground',
    size: 'text-sm sm:text-base font-semibold',
    style: { bottom: '8%', right: '12%' },
    blur: 'blur-0',
    opacity: 'opacity-65',
    anim: 'animate-float-4',
    parallaxSpeed: 20,
  },
  {
    text: 'APIs',
    depth: 'foreground',
    size: 'text-xs sm:text-sm font-mono font-bold tracking-widest',
    style: { bottom: '36%', right: '18%' },
    blur: 'blur-0',
    opacity: 'opacity-60',
    anim: 'animate-float-1',
    parallaxSpeed: 19,
  },

  // ── Layer 2: Midground (Soft depth, balanced scale) ─────────────────────────
  {
    text: 'Data Science',
    depth: 'midground',
    size: 'text-sm sm:text-base font-medium',
    style: { bottom: '26%', left: '12%' },
    blur: 'blur-[0.6px]',
    opacity: 'opacity-45',
    anim: 'animate-float-2',
    parallaxSpeed: 14,
  },
  {
    text: 'Cyber Security',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-mono uppercase tracking-wider',
    style: { bottom: '28%', right: '13%' },
    blur: 'blur-[0.6px]',
    opacity: 'opacity-45',
    anim: 'animate-float-1',
    parallaxSpeed: 15,
  },
  {
    text: 'UI Design',
    depth: 'midground',
    size: 'text-base sm:text-lg font-medium',
    style: { bottom: '11%', left: '22%' },
    blur: 'blur-[0.5px]',
    opacity: 'opacity-50',
    anim: 'animate-float-4',
    parallaxSpeed: 16,
  },
  {
    text: 'Cloud Computing',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-mono uppercase tracking-wider',
    style: { bottom: '12%', right: '22%' },
    blur: 'blur-[0.6px]',
    opacity: 'opacity-45',
    anim: 'animate-float-3',
    parallaxSpeed: 13,
  },
  {
    text: 'Deep Learning',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-medium',
    style: { top: '24%', right: '8%' },
    blur: 'blur-[0.5px]',
    opacity: 'opacity-50',
    anim: 'animate-float-4',
    parallaxSpeed: 16,
  },
  {
    text: 'Node.js',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-mono',
    style: { top: '22%', left: '5%' },
    blur: 'blur-[0.6px]',
    opacity: 'opacity-45',
    anim: 'animate-float-2',
    parallaxSpeed: 15,
  },
  {
    text: 'Java',
    depth: 'midground',
    size: 'text-sm sm:text-base font-semibold',
    style: { bottom: '48%', left: '12%' },
    blur: 'blur-[0.5px]',
    opacity: 'opacity-55',
    anim: 'animate-float-1',
    parallaxSpeed: 17,
  },
  {
    text: 'Data Analytics',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-medium',
    style: { bottom: '20%', left: '26%' },
    blur: 'blur-[0.6px]',
    opacity: 'opacity-40',
    anim: 'animate-float-4',
    parallaxSpeed: 14,
  },
  {
    text: 'UX Design',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-medium',
    style: { bottom: '7%', left: '36%' },
    blur: 'blur-[0.5px]',
    opacity: 'opacity-50',
    anim: 'animate-float-1',
    parallaxSpeed: 15,
  },
  {
    text: 'Figma',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-semibold',
    style: { bottom: '22%', right: '6%' },
    blur: 'blur-[0.5px]',
    opacity: 'opacity-50',
    anim: 'animate-float-2',
    parallaxSpeed: 16,
  },
  {
    text: 'Mobile Development',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-medium',
    style: { bottom: '19%', right: '28%' },
    blur: 'blur-[0.6px]',
    opacity: 'opacity-40',
    anim: 'animate-float-3',
    parallaxSpeed: 14,
  },
  {
    text: 'Backend',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-mono uppercase tracking-wider',
    style: { top: '7%', left: '28%' },
    blur: 'blur-[0.5px]',
    opacity: 'opacity-45',
    anim: 'animate-float-2',
    parallaxSpeed: 15,
  },
  {
    text: 'Git',
    depth: 'midground',
    size: 'text-xs font-mono font-medium',
    style: { top: '36%', left: '17%' },
    blur: 'blur-[0.5px]',
    opacity: 'opacity-40',
    anim: 'animate-float-3',
    parallaxSpeed: 13,
  },
  {
    text: 'GitHub',
    depth: 'midground',
    size: 'text-xs sm:text-sm font-medium',
    style: { bottom: '38%', left: '20%' },
    blur: 'blur-[0.6px]',
    opacity: 'opacity-45',
    anim: 'animate-float-4',
    parallaxSpeed: 14,
  },

  // ── Layer 3: Background (Deep, blurred, distant ideas in space) ─────────────
  {
    text: 'Prompt Engineering',
    depth: 'deep',
    size: 'text-sm font-normal tracking-wide',
    style: { top: '8%', left: '46%' },
    blur: 'blur-[2px]',
    opacity: 'opacity-25',
    anim: 'animate-float-2',
    parallaxSpeed: 7,
  },
  {
    text: 'Generative AI',
    depth: 'deep',
    size: 'text-xs font-mono uppercase tracking-widest',
    style: { bottom: '18%', left: '44%' },
    blur: 'blur-[1.8px]',
    opacity: 'opacity-25',
    anim: 'animate-float-1',
    parallaxSpeed: 8,
  },
  {
    text: 'Next.js',
    depth: 'deep',
    size: 'text-xs font-mono',
    style: { top: '30%', left: '26%' },
    blur: 'blur-[2.2px]',
    opacity: 'opacity-20',
    anim: 'animate-float-3',
    parallaxSpeed: 6,
  },
  {
    text: 'System Design',
    depth: 'deep',
    size: 'text-xs font-mono tracking-wider',
    style: { top: '32%', right: '24%' },
    blur: 'blur-[2.2px]',
    opacity: 'opacity-20',
    anim: 'animate-float-4',
    parallaxSpeed: 6,
  },
  {
    text: 'Open Source',
    depth: 'deep',
    size: 'text-xs font-mono tracking-wider',
    style: { bottom: '6%', left: '10%' },
    blur: 'blur-[1.8px]',
    opacity: 'opacity-25',
    anim: 'animate-float-2',
    parallaxSpeed: 7,
  },
  {
    text: 'Automation',
    depth: 'deep',
    size: 'text-xs font-normal tracking-wide',
    style: { bottom: '6%', right: '36%' },
    blur: 'blur-[1.8px]',
    opacity: 'opacity-30',
    anim: 'animate-float-1',
    parallaxSpeed: 8,
  },
  {
    text: 'Robotics',
    depth: 'deep',
    size: 'text-xs font-mono tracking-wider',
    style: { top: '10%', right: '5%' },
    blur: 'blur-[2px]',
    opacity: 'opacity-25',
    anim: 'animate-float-3',
    parallaxSpeed: 7,
  },
  {
    text: 'Computer Vision',
    depth: 'deep',
    size: 'text-xs sm:text-sm font-light',
    style: { top: '4%', left: '18%' },
    blur: 'blur-[1.8px]',
    opacity: 'opacity-25',
    anim: 'animate-float-4',
    parallaxSpeed: 8,
  },
  {
    text: 'Natural Language Processing',
    depth: 'deep',
    size: 'text-[11px] sm:text-xs font-mono tracking-wide',
    style: { bottom: '4%', left: '52%' },
    blur: 'blur-[2px]',
    opacity: 'opacity-20',
    anim: 'animate-float-2',
    parallaxSpeed: 6,
  },
]

export default function FloatingKeywords({ onSelectKeyword, mousePos = { x: 0, y: 0 } }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {SPATIAL_KEYWORDS.map((item) => {
        // Subtle optical parallax offset based on layer depth
        const offsetX = mousePos.x * item.parallaxSpeed
        const offsetY = mousePos.y * item.parallaxSpeed

        return (
          <div
            key={item.text}
            style={{
              ...item.style,
              transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="absolute"
          >
            <button
              type="button"
              onClick={() => onSelectKeyword(item.text)}
              className={`
                group relative pointer-events-auto cursor-pointer
                inline-block px-3 py-1.5 rounded-full
                text-white transition-all duration-300 ease-out
                hover:opacity-100 hover:filter-none hover:scale-110
                hover:text-white hover:bg-white/[0.08] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                hover:border hover:border-white/20
                ${item.size}
                ${item.blur}
                ${item.opacity}
                ${item.anim}
              `}
              title={`Explore ${item.text}`}
            >
              <span className="relative z-10 transition-colors">
                {item.text}
              </span>
              <span className="absolute inset-0 rounded-full bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
