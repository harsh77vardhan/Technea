# Lenis + GSAP ScrollTrigger Synchronization

GSAP and Lenis are the gold standard pair for smooth scroll experiences with scroll-scrubbed animations, pinned viewports, and parallax.

---

## Why Synchronization is Essential

By default:
- **Lenis** runs its own animation frame loop (`requestAnimationFrame`) to compute smooth scroll inertia.
- **GSAP** runs its internal ticker (`gsap.ticker`) to update tweens and evaluate ScrollTrigger positions.

If both run independently on unaligned clocks, ScrollTrigger pins and scrubs will suffer from **micro-stutter (frame jitter)**. Binding Lenis directly to GSAP's ticker guarantees frame-perfect synchronization.

---

## 1. The Canonical Pattern (Vanilla JavaScript)

```javascript
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 1. Initialize Lenis with autoRaf disabled (GSAP ticker will drive it)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  autoRaf: false,
})

// 2. Update ScrollTrigger whenever Lenis scrolls
lenis.on('scroll', ScrollTrigger.update)

// 3. Drive Lenis's RAF from the GSAP ticker (convert seconds to milliseconds)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

// 4. Critical: Disable GSAP lag smoothing to eliminate scroll jumping
gsap.ticker.lagSmoothing(0)
```

---

## 2. React Integration (`lenis/react` + `@gsap/react`)

```jsx
import { useEffect, useRef } from 'react'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function SmoothScrollLayout({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    // Connect Lenis to ScrollTrigger
    const lenis = lenisRef.current?.lenis
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(update)
      gsap.ticker.lagSmoothing(0)
    }

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [])

  return (
    <ReactLenis ref={lenisRef} autoRaf={false} root>
      {children}
    </ReactLenis>
  )
}
```

---

## 3. Handling Route Changes & Dynamic Content

When routes change or asynchronous content loads (images, fonts, API data), the page height changes. You must notify ScrollTrigger to recalculate trigger positions:

```javascript
// On route change or image load:
ScrollTrigger.refresh()
```

If resetting scroll position to top:
```javascript
lenis.scrollTo(0, { immediate: true })
ScrollTrigger.refresh()
```
