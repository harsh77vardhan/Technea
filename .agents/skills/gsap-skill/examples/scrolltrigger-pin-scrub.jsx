import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function PinnedScrubShowcase() {
  const container = useRef(null)

  useGSAP(() => {
    // Pinned scrub timeline: scrubs 3 panels across 2000px of scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top top',
        end: '+=2000',
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
      },
    })

    tl.to('.panel-1', { opacity: 0, scale: 0.9, y: -50 })
      .from('.panel-2', { opacity: 0, scale: 1.1, y: 50 }, '<')
      .to('.panel-2', { opacity: 0, scale: 0.9, y: -50 }, '+=0.5')
      .from('.panel-3', { opacity: 0, scale: 1.1, y: 50 }, '<')
  }, { scope: container })

  return (
    <section ref={container} className="relative h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
      {/* Panel 1 */}
      <div className="panel-1 absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-5xl font-black uppercase tracking-tight">Phase 01</h2>
        <p className="mt-4 text-neutral-400 max-w-md">Discover foundational architectures through interactive sandbox experiments.</p>
      </div>

      {/* Panel 2 */}
      <div className="panel-2 absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0">
        <h2 className="text-5xl font-black uppercase tracking-tight text-cyan-400">Phase 02</h2>
        <p className="mt-4 text-neutral-400 max-w-md">Refine mental models with AI-guided mentor breakdowns.</p>
      </div>

      {/* Panel 3 */}
      <div className="panel-3 absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0">
        <h2 className="text-5xl font-black uppercase tracking-tight text-emerald-400">Phase 03</h2>
        <p className="mt-4 text-neutral-400 max-w-md">Deploy production-ready portfolio artifacts.</p>
      </div>
    </section>
  )
}
