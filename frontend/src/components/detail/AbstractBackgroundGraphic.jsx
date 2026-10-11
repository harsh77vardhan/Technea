import { motion } from 'framer-motion'

export default function AbstractBackgroundGraphic() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-8 sm:top-12 lg:top-14 inset-x-0 w-full h-[260px] sm:h-[360px] md:h-[420px] lg:h-[480px] opacity-[0.20] select-none -z-0 overflow-hidden"
    >
      <motion.div
        className="w-[300%] h-full flex"
        style={{ willChange: 'transform' }}
        animate={{
          x: ['-33.333333%', '0%'],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg
          viewBox="0 0 4200 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Seamless 3-cycle VIBGYOR flowing gradient */}
            <linearGradient
              id="vibgyorEndlessFlowGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              {/* Cycle 1 (0% to 33.33%) */}
              <stop offset="0.00%" stopColor="#8B5CF6" />
              <stop offset="4.76%" stopColor="#6366F1" />
              <stop offset="9.52%" stopColor="#38BDF8" />
              <stop offset="14.29%" stopColor="#34D399" />
              <stop offset="19.05%" stopColor="#FBBF24" />
              <stop offset="23.81%" stopColor="#FB923C" />
              <stop offset="28.57%" stopColor="#F87171" />
              <stop offset="33.33%" stopColor="#8B5CF6" />

              {/* Cycle 2 (33.33% to 66.67%) */}
              <stop offset="33.33%" stopColor="#8B5CF6" />
              <stop offset="38.10%" stopColor="#6366F1" />
              <stop offset="42.86%" stopColor="#38BDF8" />
              <stop offset="47.62%" stopColor="#34D399" />
              <stop offset="52.38%" stopColor="#FBBF24" />
              <stop offset="57.14%" stopColor="#FB923C" />
              <stop offset="61.90%" stopColor="#F87171" />
              <stop offset="66.67%" stopColor="#8B5CF6" />

              {/* Cycle 3 (66.67% to 100.00%) */}
              <stop offset="66.67%" stopColor="#8B5CF6" />
              <stop offset="71.43%" stopColor="#6366F1" />
              <stop offset="76.19%" stopColor="#38BDF8" />
              <stop offset="80.95%" stopColor="#34D399" />
              <stop offset="85.71%" stopColor="#FBBF24" />
              <stop offset="90.48%" stopColor="#FB923C" />
              <stop offset="95.24%" stopColor="#F87171" />
              <stop offset="100.00%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Endless unbroken continuous organic wave ribbon across 3 identical periods */}
          <path
            d="M 0 85 C 266 85, 434 315, 700 315 C 966 315, 1134 85, 1400 85 C 1666 85, 1834 315, 2100 315 C 2366 315, 2534 85, 2800 85 C 3066 85, 3234 315, 3500 315 C 3766 315, 3934 85, 4200 85"
            stroke="url(#vibgyorEndlessFlowGrad)"
            strokeWidth="52"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  )
}
