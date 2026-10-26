/**
 * CinematicBackground Component
 * Pure Near-Black OLED Studio Canvas with Engineering Grid & Volumetric Lighting.
 * 
 * Provides high-contrast backdrop for the Technea AI Command Center:
 * - Precision engineering grid with radial vignette mask
 * - Volumetric cerulean cyan (#00A3FF) and neon rose (#FF0055) ambient glows
 * - Anti-reflective dark studio finish
 */
export default function CinematicBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl bg-[#060709]">
      {/* ── Precision Engineering Grid Pattern with Radial Vignette ── */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 40%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 40%, black 20%, transparent 85%)',
        }}
      />

      {/* ── Volumetric Cerulean Cyan Key Light (Top-Center & Horizon) ── */}
      <div
        className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(0, 163, 255, 0.09) 0%, rgba(0, 240, 255, 0.03) 45%, transparent 75%)',
        }}
      />

      {/* ── Subtle Neon Rose Accent Light (Bottom-Right) ── */}
      <div
        className="absolute -bottom-[20%] right-[10%] w-[550px] h-[450px] rounded-full blur-[150px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 0, 85, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* ── Optical Vignette Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(5, 6, 8, 0.8) 100%)',
        }}
      />
    </div>
  )
}
