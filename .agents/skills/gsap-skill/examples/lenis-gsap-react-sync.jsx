import { useEffect, useRef } from 'react'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LenisGsapSyncWrapper({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    function update(time) {
      // Pass time in milliseconds to lenis.raf
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    const lenis = lenisRef.current?.lenis
    if (lenis) {
      // 1. Hook ScrollTrigger update to Lenis scroll event
      lenis.on('scroll', ScrollTrigger.update)

      // 2. Drive Lenis RAF loop from GSAP's central ticker
      gsap.ticker.add(update)

      // 3. Disable lagSmoothing to prevent scroll jumps during animation
      gsap.ticker.lagSmoothing(0)
    }

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [])

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false, // GSAP ticker handles RAF
        lerp: 0.09,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
