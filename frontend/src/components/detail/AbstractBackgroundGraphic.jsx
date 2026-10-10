export default function AbstractBackgroundGraphic() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-8 sm:top-12 lg:top-14 inset-x-0 w-full h-[260px] sm:h-[360px] md:h-[420px] lg:h-[480px] opacity-[0.08] select-none -z-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Continuous horizontal gradient along the stroke: Left to Right */}
          <linearGradient
            id="horizontalBackboneGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            {/* Start (Left): Bright Green */}
            <stop offset="0%" stopColor="#32FF6A" />
            {/* Middle (Center): Teal / Cyan */}
            <stop offset="50%" stopColor="#20D9D2" />
            {/* End (Right): Bright Blue */}
            <stop offset="100%" stopColor="#4DA8FF" />
          </linearGradient>
        </defs>

        {/* Flat 2D geometric shape: horizontal stylized wavy cursive "Z" / "3" with two smooth directional bends */}
        <path
          d="M -80 290 C 140 290 250 95 460 95 C 670 95 930 315 1140 315 C 1350 315 1460 110 1680 110"
          stroke="url(#horizontalBackboneGrad)"
          strokeWidth="56"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
