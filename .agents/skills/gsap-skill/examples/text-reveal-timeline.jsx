import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function TextRevealTimeline() {
  const container = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1 } })

    // Cinematic editorial mask reveal
    tl.from('.mask-line span', {
      yPercent: 120,
      stagger: 0.12,
      skewY: 4,
    })
    .from('.editorial-sub', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.5')
  }, { scope: container })

  return (
    <div ref={container} className="py-20 px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-neutral-900 leading-[1.05]">
        <div className="mask-line overflow-hidden inline-block mr-3">
          <span className="inline-block will-change-transform">Precision</span>
        </div>
        <div className="mask-line overflow-hidden inline-block mr-3">
          <span className="inline-block will-change-transform">Engineered</span>
        </div>
        <br />
        <div className="mask-line overflow-hidden inline-block">
          <span className="inline-block will-change-transform text-blue-600">Motion Systems</span>
        </div>
      </h1>

      <p className="editorial-sub mt-6 text-lg text-neutral-500 max-w-lg leading-relaxed">
        Building fluid, hardware-accelerated animations using GSAP timelines and seamless responsive layouts.
      </p>
    </div>
  )
}
