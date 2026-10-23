import { useEffect, useRef } from 'react'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function GSAPLenisPage() {
  const lenisRef = useRef()
  const heroRef = useRef()
  const boxRef = useRef()

  // 1. Synchronize Lenis and GSAP Ticker
  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
    }
  }, [])

  // 2. Set up ScrollTrigger Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(boxRef.current, {
        rotate: 360,
        scale: 1.5,
        borderRadius: '50%',
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          pin: true,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      <div className="bg-black text-white">
        <section
          ref={heroRef}
          className="h-screen flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div
            ref={boxRef}
            className="w-40 h-40 bg-gradient-to-tr from-cyan-500 to-rose-500 rounded-3xl shadow-2xl flex items-center justify-center font-bold font-mono"
          >
            GSAP + LENIS
          </div>
          <span className="absolute bottom-10 font-mono text-sm text-neutral-400">
            Scroll down to scrub animation
          </span>
        </section>

        <section className="h-screen flex items-center justify-center bg-neutral-950">
          <h2 className="text-4xl font-bold">Pinning & Scrubbing in Perfect Sync</h2>
        </section>
      </div>
    </ReactLenis>
  )
}
