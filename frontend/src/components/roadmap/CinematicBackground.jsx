/**
 * CinematicBackground Component
 * Pure Near-Black OLED Studio Canvas (#000000).
 * 
 * Provides maximum visual contrast for the AI Architect and engineered typography.
 * Stripped of all arcade particles, noisy textures, and artificial glow discs.
 */
export default function CinematicBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[27px] bg-[#000000]">
      {/* ── Subtle Volumetric Key Light (Cyan - Right Horizon) ── */}
      <div
        className="absolute top-1/2 right-[12%] -translate-y-1/2 w-[650px] h-[750px] rounded-full blur-[160px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(0, 163, 255, 0.035) 0%, rgba(0, 132, 255, 0.01) 50%, transparent 75%)',
        }}
      />

      {/* ── Subtle Volumetric Rim Light (Magenta - Left/Rear) ── */}
      <div
        className="absolute bottom-[15%] left-[10%] w-[500px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 0, 85, 0.025) 0%, transparent 70%)',
        }}
      />

      {/* ── Pure Optical Contrast Gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.6) 100%)',
        }}
      />
    </div>
  )
}
