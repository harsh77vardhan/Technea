import { useState } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

function ProgressBar() {
  const [progress, setProgress] = useState(0)

  useLenis(({ progress }) => {
    setProgress(progress)
  })

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-rose-500 z-50 origin-left"
      style={{ transform: `scaleX(${progress})` }}
    />
  )
}

function Navigation() {
  const lenis = useLenis()

  const scrollToSection = (id) => {
    lenis?.scrollTo(id, {
      offset: -80,
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  }

  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-black/70 backdrop-blur-xl border-b border-white/10 z-40 flex items-center justify-between px-8">
      <span className="font-mono font-bold tracking-widest text-cyan-400">
        TECHNEA // LENIS
      </span>
      <nav className="flex items-center gap-6 text-sm font-mono text-neutral-300">
        <button onClick={() => scrollToSection('#hero')} className="hover:text-white transition">
          Hero
        </button>
        <button onClick={() => scrollToSection('#features')} className="hover:text-white transition">
          Features
        </button>
        <button onClick={() => scrollToSection('#cta')} className="hover:text-white transition">
          CTA
        </button>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        anchors: true,
      }}
    >
      <div className="min-h-screen bg-[#050505] text-white">
        <ProgressBar />
        <Navigation />

        <section id="hero" className="min-h-screen flex flex-col justify-center items-center px-6 pt-16">
          <h1 className="text-6xl font-black tracking-tight mb-4 text-center">
            Smooth Native Scrolling
          </h1>
          <p className="text-neutral-400 max-w-xl text-center leading-relaxed">
            Running on darkroom.engineering Lenis with hardware-accelerated physics,
            responsive viewport calculations, and seamless React integration.
          </p>
        </section>

        <section id="features" className="min-h-screen flex flex-col justify-center items-center px-6">
          <h2 className="text-4xl font-bold mb-4">Zero Compromises</h2>
          <p className="text-neutral-400 max-w-xl text-center leading-relaxed">
            Preserves native browser accessibility, position sticky, keyboard navigation,
            and anchors while providing silky smooth velocity curves.
          </p>
        </section>

        <section id="cta" className="min-h-screen flex flex-col justify-center items-center px-6">
          <h2 className="text-4xl font-bold mb-4">Production Ready</h2>
          <p className="text-neutral-400 max-w-xl text-center leading-relaxed">
            Integrate effortlessly with TailwindCSS, Framer Motion, and GSAP.
          </p>
        </section>
      </div>
    </ReactLenis>
  )
}
