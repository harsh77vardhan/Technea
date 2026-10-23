# GSAP & ScrollTrigger with Lenis

Lenis and GSAP's `ScrollTrigger` are the industry standard combination for award-winning interactive websites (Awwwards, FWA).

## Why Synchronize?
By default, GSAP uses its own internal ticker, and Lenis runs its own animation loop. If not synchronized off the same clock, ScrollTrigger pins and parallax scrubbers will experience micro-stutter (jitter).

Binding Lenis to GSAP's ticker guarantees frame-perfect alignment.

---

## The Canonical Setup (Vanilla JS)

```js
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 1. Initialize Lenis (disable autoRaf since GSAP ticker handles it)
const lenis = new Lenis({
  autoRaf: false,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})

// 2. Update ScrollTrigger whenever Lenis scrolls
lenis.on('scroll', ScrollTrigger.update)

// 3. Drive Lenis's raf off the GSAP ticker (convert seconds to milliseconds)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

// 4. Critical: Disable GSAP lag smoothing to eliminate scroll jumps
gsap.ticker.lagSmoothing(0)
```

---

## Canonical Setup in React (`lenis/react` + GSAP)

```jsx
import { useEffect, useRef } from 'react'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function App({ children }) {
  const lenisRef = useRef()

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    // Add to GSAP ticker
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
    }
  }, [])

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  )
}
```

---

## ScrollTrigger Scrubbing & Parallax Recipe

Once synchronized, write standard ScrollTrigger animations as usual:

```jsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function ParallaxHero() {
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background image
      gsap.to(imageRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Pinned title fade
      gsap.to(textRef.current, {
        opacity: 0,
        scale: 0.9,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '50% top',
          scrub: 1,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      <div ref={imageRef} className="absolute inset-0 bg-cover bg-center" />
      <div ref={textRef} className="relative z-10 flex h-full items-center justify-center">
        <h1 className="text-6xl font-bold text-white">Cinematic Scroll</h1>
      </div>
    </section>
  )
}
```

---

## Best Practices Checklist

1. `autoRaf: false`: Always set when hooking into `gsap.ticker`.
2. `gsap.ticker.lagSmoothing(0)`: Eliminates rubber-banding or frame-skipping when resuming interaction.
3. `lenis.on('scroll', ScrollTrigger.update)`: Informs ScrollTrigger immediately on sub-pixel updates.
4. Clean up tickers when unmounting in single-page apps.
