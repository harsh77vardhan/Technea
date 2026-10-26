import { X, Cpu } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import { TechneaIcon } from '../layout/TechneaLogo'

/**
 * RoadmapHUDFrame Component
 * Premium AI Developer Tool & Hardware Command Telemetry Frame.
 * 
 * Provides:
 * - Brand telemetry badge with pulse indicator
 * - Sleek minimal close button with ESC key badge
 * - Precision hairline dividers (0.5px gradient)
 * - Bottom system telemetry markers
 */
export default function RoadmapHUDFrame({ onClose, stage = 'entry' }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden flex flex-col justify-between p-4 sm:p-7 lg:p-8">
      {/* ── Top Bar: Brand, Status Telemetry & Close Action ── */}
      <div className="w-full flex items-center justify-between relative pb-3">
        {/* Top-Left: Technea Brand & System Status Pill */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/10 p-1 shrink-0 flex items-center justify-center">
            <ImageWithFallback
              src="/images/technea-neon-icon.png"
              alt="Technea Icon"
              className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,163,255,0.45)]"
              fallback={<TechneaIcon size={18} />}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className="text-xs sm:text-sm font-black tracking-[0.24em] text-white"
              style={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                textShadow: '0 0 12px rgba(0, 163, 255, 0.4)',
              }}
            >
              TECHNEA
            </span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#00A3FF]/25 bg-[#00A3FF]/[0.06] px-2.5 py-0.5 text-[10px] font-mono tracking-wider text-[#00A3FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A3FF] animate-pulse" />
              <span>SYS_ONLINE // NEURAL_ROADMAP_v2</span>
            </div>
          </div>
        </div>

        {/* Top-Right: Stage Badge + Machined Close Button with ESC Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {stage === 'view' && (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[10px] font-mono text-neutral-400">
              <Cpu className="h-3 w-3 text-[#00A3FF]" />
              <span>INTERACTIVE TIMELINE</span>
            </span>
          )}

          <div className="hidden sm:inline-flex items-center rounded-md border border-white/10 bg-white/[0.02] px-1.5 py-0.5 text-[9px] font-mono text-neutral-500">
            ESC
          </div>

          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white hover:border-[#00A3FF]/50 hover:bg-[#00A3FF]/10 hover:shadow-[0_0_15px_rgba(0,163,255,0.25)] transition-all cursor-pointer"
            aria-label="Close roadmap builder"
          >
            <X className="h-4 w-4 stroke-[2]" />
          </button>
        </div>

        {/* Subtle Horizontal Hairline Divider below Top Bar */}
        <div className="absolute -bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00A3FF]/30 via-white/[0.06] to-[#FF0055]/30" />
      </div>

      {/* ── Bottom Bar: Engineering Telemetry ── */}
      <div className="w-full flex items-center justify-between relative pt-3">
        {/* Subtle Horizontal Hairline Divider above Bottom Bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00A3FF]/30 via-white/[0.06] to-[#FF0055]/30" />

        {/* Bottom-Left: Engine Diagnostic Indicator */}
        <div className="flex items-center gap-2.5">
          <span
            className="font-mono text-[10px] font-black italic tracking-[0.16em] text-[#FF0055]"
            style={{ textShadow: '0 0 6px rgba(255, 0, 85, 0.45)' }}
          >
            ///
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
            AUTONOMOUS_SYNTHESIS_PIPELINE
          </span>
        </div>

        {/* Bottom-Right: Latency / Ready Status */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="font-mono text-[9px] sm:text-[10px] font-medium tracking-widest uppercase text-neutral-400">
            ENGINE READY
          </span>
        </div>
      </div>
    </div>
  )
}
