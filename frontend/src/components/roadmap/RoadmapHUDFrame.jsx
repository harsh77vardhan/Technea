import { X } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import { TechneaIcon } from '../layout/TechneaLogo'

/**
 * RoadmapHUDFrame Component
 * Luxury AI Hardware & Brand Campaign Identity.
 * 
 * Adheres strictly to premium brand restraint:
 * - NO game-like HUD brackets or random futuristic decorations
 * - Clean, purposeful geometry: thin horizontal hairline dividers, subtle status circles, and minimal directional indicators (///)
 * - Pure Cerulean Cyan (#00A3FF) and Neon Rose (#FF0055) accents
 */
export default function RoadmapHUDFrame({ onClose }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden flex flex-col justify-between p-6 sm:p-9 lg:p-10">
      {/* ── Top Bar: Brand Mark, Telemetry & Minimal Machined Close ── */}
      <div className="w-full flex items-center justify-between relative">
        {/* Top-Left: Technea Brand & Precision Icon */}
        <div className="flex items-center gap-3">
          <div className="w-[26px] h-[22px] shrink-0 flex items-center justify-center">
            <ImageWithFallback
              src="/images/technea-neon-icon.png"
              alt="Technea Icon"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,163,255,0.45)]"
              fallback={<TechneaIcon size={22} />}
            />
          </div>
          <span
            className="text-xs sm:text-sm font-extrabold tracking-[0.32em] text-[#00A3FF]"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: '0 0 10px rgba(0, 163, 255, 0.4)',
            }}
          >
            TECHNEA
          </span>
        </div>

        {/* Top-Right: AI Autonomous Engine /// + Machined Close Button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.24em] uppercase text-[#FF0055]">
            <span
              className="font-semibold"
              style={{ textShadow: '0 0 8px rgba(255, 0, 85, 0.4)' }}
            >
              AI AUTONOMOUS ENGINE
            </span>
            <span
              className="font-black italic tracking-[0.16em] text-[#FF0055]"
              style={{ textShadow: '0 0 8px rgba(255, 0, 85, 0.5)' }}
            >
              ///
            </span>
          </div>

          {/* Minimal Machined Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto flex min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md text-white/50 hover:text-white hover:border-[#0084FF]/60 hover:bg-white/[0.06] hover:shadow-[0_0_15px_rgba(0,132,255,0.3)] transition-all cursor-pointer"
            aria-label="Close roadmap builder"
          >
            <X className="h-4 w-4 sm:h-3.5 sm:w-3.5 stroke-[2]" />
          </button>
        </div>

        {/* Subtle Horizontal Hairline Divider below Top Bar */}
        <div className="absolute -bottom-3 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00A3FF]/20 via-white/[0.04] to-[#FF0055]/20" />
      </div>

      {/* ── Bottom Bar: Minimal Directional Indicators & Engineering Telemetry ── */}
      <div className="w-full flex items-center justify-between relative pt-3">
        {/* Subtle Horizontal Hairline Divider above Bottom Bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00A3FF]/20 via-white/[0.04] to-[#FF0055]/20" />

        {/* Bottom-Left: Minimal Directional Indicator + Status Dot */}
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs font-black italic tracking-[0.18em] text-[#FF0055]"
            style={{ textShadow: '0 0 8px rgba(255, 0, 85, 0.45)' }}
          >
            ///
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#00A3FF]"
              style={{ boxShadow: '0 0 6px #00A3FF' }}
            />
            <span className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase">
              SYS.ACTIVE
            </span>
          </div>
        </div>

        {/* Bottom-Right: ENGINEER YOUR FUTURE */}
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase text-neutral-400"
          >
            ENGINEER YOUR FUTURE
          </span>
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#FF0055]"
            style={{ boxShadow: '0 0 6px #FF0055' }}
          />
        </div>
      </div>
    </div>
  )
}
