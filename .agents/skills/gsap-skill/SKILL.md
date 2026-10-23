---
name: gsap-skill
description: >-
  Comprehensive guide and production workflows for GSAP (GreenSock Animation Platform) and its ecosystem.
  Use this skill whenever the user asks to implement, configure, debug, or optimize GSAP animations,
  ScrollTrigger, Timelines, tweens (gsap.to, gsap.from, gsap.fromTo), React GSAP (@gsap/react, useGSAP),
  Lenis + GSAP ScrollTrigger synchronization, Flip plugin, Observer, SplitText, or complex UI choreography.
---

# GSAP (GreenSock Animation Platform) Skill

[GSAP](https://gsap.com) is the industry standard JavaScript animation library engineered for ultra-high performance, rock-solid cross-browser reliability, and unmatched sequencing capabilities. It powers the world's most awarded interactive experiences (Awwwards, FWA).

---

## When to Use This Skill

Activate this skill when:
- Creating complex, sequenced UI animations, page transitions, or SVG motion.
- Building scroll-driven animations with **ScrollTrigger** (scrubbing, pinning, parallax, snapping).
- Integrating GSAP in **React** or **Next.js** using `@gsap/react` (`useGSAP` hook) with clean component lifecycle and automatic teardown.
- Synchronizing GSAP ScrollTrigger with **Lenis** smooth scrolling.
- Using specialized GSAP plugins: **Flip**, **Observer**, **SplitText**, **MotionPath**, **ScrollTo**, **Draggable**.
- Troubleshooting common GSAP pitfalls (React StrictMode double-invocations, scroll jitter, lag smoothing, stacking context issues).

---

## Quick Reference & Subdocumentation

Explore the dedicated reference guides for full architecture, code patterns, and recipes:

- **Core API & Tweens**: [references/core-api.md](./references/core-api.md) — `gsap.to()`, `gsap.from()`, `gsap.fromTo()`, timelines, staggers, and easing.
- **ScrollTrigger**: [references/scrolltrigger.md](./references/scrolltrigger.md) — Pinning, scrubbing, triggers, start/end markers, and batching.
- **React & Next.js (`@gsap/react`)**: [references/react.md](./references/react.md) — The `useGSAP` hook, scoping refs, server components, and React 19 safety.
- **Lenis + GSAP Sync**: [references/lenis-sync.md](./references/lenis-sync.md) — Canonical, stutter-free synchronization recipe for smooth scroll and ScrollTrigger.
- **Plugins Suite**: [references/plugins.md](./references/plugins.md) — Flip, Observer, SplitText, MotionPath, ScrollTo, and Draggable.
- **Troubleshooting & Best Practices**: [references/troubleshooting.md](./references/troubleshooting.md) — Lag smoothing, memory leaks, CSS conflicts, and layout shifts.

---

## 1. Installation

Install GSAP and its React companion:

```bash
npm install gsap @gsap/react
# or
yarn add gsap @gsap/react
# or
pnpm add gsap @gsap/react
```

### Essential Plugin Registration
Always register plugins once at your module root or entry file before invoking them:

```javascript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, Flip)
```

---

## 2. Core Patterns

### A. Basic Tweens & Timeline Sequencing
```javascript
import gsap from 'gsap'

// Create a master timeline
const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } })

tl.from('.hero-badge', { opacity: 0, y: -20 })
  .from('.hero-title', { opacity: 0, y: 40 }, '-=0.4')
  .from('.hero-card', { opacity: 0, scale: 0.95, stagger: 0.1 }, '-=0.2')
```

### B. React with `@gsap/react` (`useGSAP`)
```jsx
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function AnimatedCard() {
  const containerRef = useRef(null)

  useGSAP(() => {
    // Automatically scoped to containerRef and safely cleaned up on unmount
    gsap.from('.feature-item', {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power2.out',
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="card-container">
      <div className="feature-item">01</div>
      <div className="feature-item">02</div>
    </div>
  )
}
```

### C. ScrollTrigger Scrubbing & Pinning
```javascript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

gsap.to('.pinned-graphic', {
  scrollTrigger: {
    trigger: '.pin-section',
    start: 'top top',
    end: '+=1000',
    scrub: 1, // 1s smooth scrub lag
    pin: true,
    anticipatePin: 1,
  },
  rotation: 360,
  scale: 1.5,
  ease: 'none',
})
```

### D. Lenis + GSAP ScrollTrigger Synchronization
```javascript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({ autoRaf: false })

// 1. Tell ScrollTrigger to update whenever Lenis scrolls
lenis.on('scroll', ScrollTrigger.update)

// 2. Drive Lenis's RAF directly from GSAP's central ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

// 3. Disable GSAP lag smoothing to prevent scroll jumps
gsap.ticker.lagSmoothing(0)
```

---

## 3. Golden Rules of GSAP

1. **Always clean up in React**: Use `@gsap/react`'s `useGSAP()` hook or `gsap.context()` inside `useEffect`. Never create un-scoped tweens inside React components.
2. **Never animate layout properties**: Avoid animating `width`, `height`, `top`, `left`, `margin`, or `padding`. Always animate GPU-accelerated transforms (`x`, `y`, `scale`, `rotation`, `opacity`).
3. **Register plugins explicitly**: Call `gsap.registerPlugin(...)` once before referencing plugins to prevent tree-shaking failures.
4. **Synchronize tickers**: When combining GSAP with external smooth scrollers (like Lenis) or WebGL (like Three.js), drive all animation off a single ticker to prevent micro-jitter.
