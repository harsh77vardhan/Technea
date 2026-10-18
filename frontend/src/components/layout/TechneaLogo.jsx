/**
 * Technea Brand Identity - T+N Monogram Lockup
 * Fusing the letters T and N into a single, cohesive geometric abstract mark.
 * Minimalist, architectural, authoritative identity (Tesla / NVIDIA / Linear / Vercel grade).
 */

export function TechneaIcon({ size = 36, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`shrink-0 flex items-center justify-center rounded-[10px] bg-[#09090B] text-white shadow-sm ring-1 ring-black/10 transition-transform duration-200 group-hover:scale-[1.02] ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-[60%] h-[60%]"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="tn-catalyst-glow"
            x1="12.5"
            y1="9.5"
            x2="19"
            y2="24.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* T-Crossbar Canopy & Vertical N-Pillars (Crisp White) */}
        <path
          d="M6.5 7.5C6.5 6.94772 6.94772 6.5 7.5 6.5H24.5C25.0523 6.5 25.5 6.94772 25.5 7.5V8.5C25.5 9.05228 25.0523 9.5 24.5 9.5H22V24.5C22 25.0523 21.5523 25.5 21 25.5H19V9.5H12.5V24.5C12.5 25.0523 12.0523 25.5 11.5 25.5H9.5C8.94772 25.5 8.5 25.0523 8.5 24.5V9.5H7.5C6.94772 9.5 6.5 9.05228 6.5 8.5V7.5Z"
          fill="#FFFFFF"
        />

        {/* Diagonal Synthesis Vector of N (Electric Violet Catalyst) */}
        <path
          d="M12.5 9.5H15.5L19 16.5V24.5H16L12.5 17.5V9.5Z"
          fill="url(#tn-catalyst-glow)"
        />
      </svg>
    </div>
  )
}

export default function TechneaLogo({
  size = 36,
  textClassName = 'text-slate-900 group-hover:text-black',
  className = '',
  showText = true,
  href = '#',
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2.5 group transition-opacity select-none ${className}`}
    >
      <TechneaIcon size={size} />
      {showText && (
        <span
          className={`text-[19px] font-bold tracking-[-0.035em] transition-colors font-sans ${textClassName}`}
        >
          Technea
        </span>
      )}
    </a>
  )
}
