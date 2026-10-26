import { X } from 'lucide-react'

/**
 * RoadmapHUDFrame Component
 * Premium minimal chrome.
 */
export default function RoadmapHUDFrame({ onClose }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex flex-col justify-between">
      {/* Top bar */}
      <div className="relative p-5 sm:p-7 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#333] rounded-full flex-shrink-0" />
          <span className="text-sm font-semibold tracking-tight text-white">Technea</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#555] border border-[#222] px-1.5 py-0.5 rounded hidden sm:flex">
            ESC
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close roadmap builder"
            className="pointer-events-auto w-8 h-8 rounded-xl border border-[#222] text-[#555] hover:text-white hover:border-[#555] transition-all flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom hairline */}
        <div className="absolute -bottom-0 left-5 right-5 h-px bg-[#111]" />
      </div>

      {/* Bottom bar */}
      <div className="relative p-5 sm:p-7 flex items-center justify-between">
        {/* Top hairline */}
        <div className="absolute top-0 left-5 right-5 h-px bg-[#111]" />

        {/* Left */}
        <span className="text-[11px] text-[#444] font-mono">Powered by Technea AI</span>

        {/* Right */}
        <div />
      </div>
    </div>
  )
}
