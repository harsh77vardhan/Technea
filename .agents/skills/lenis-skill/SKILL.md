---
name: lenis-skill
description: >-
  Comprehensive guide and integration workflows for Lenis (smooth scroll library by darkroom.engineering).
  Use this skill whenever the user asks to implement, configure, debug, or optimize smooth scrolling,
  install or use Lenis, React Lenis (lenis/react), Vue Lenis (lenis/vue), GSAP ScrollTrigger sync,
  scroll snapping (lenis/snap), nested scrolling, anchor navigation, or parallax effects.
---

# Lenis Smooth Scrolling Skill

[Lenis](https://github.com/darkroomengineering/lenis) by darkroom.engineering is a lightweight, robust, and performant smooth scroll library that wraps the browser's native scroll engine rather than hijacking it. It maintains accessibility, `position: sticky`, keyboard navigation, and browser anchors while providing fluid, hardware-accelerated inertia.

## When to Use This Skill

Activate this skill when:
- Adding smooth scrolling to a website, web app, or portfolio.
- Integrating Lenis with **React** (`lenis/react`), **Next.js**, **Vite**, **Vue 3**, or **Nuxt**.
- Synchronizing smooth scrolling with **GSAP ScrollTrigger**, timelines, or WebGL scenes.
- Setting up CSS-like scroll snapping with the `lenis/snap` plugin.
- Handling modals, nested scrollable containers, or fixing scroll jumping/stutter issues.

---

## Quick Reference & Subdocs

For detailed guides and code recipes, refer to the subdocumentation:

- **Core API & Settings**: [references/core-api.md](./references/core-api.md)
- **React Integration (`lenis/react`)**: [references/react.md](./references/react.md)
- **GSAP & ScrollTrigger Sync**: [references/gsap.md](./references/gsap.md)
- **Scroll Snapping (`lenis/snap`)**: [references/snap.md](./references/snap.md)
- **Vue 3 & Nuxt (`lenis/vue`)**: [references/vue.md](./references/vue.md)
- **Troubleshooting & Pitfalls**: [references/troubleshooting.md](./references/troubleshooting.md)

---

## 1. Installation

Install the package via your project package manager:

```bash
npm install lenis
# or
yarn add lenis
# or
pnpm add lenis
# or
bun add lenis
```

Always import the recommended stylesheet:
```js
import 'lenis/dist/lenis.css'
```
*(Or use the local copy in [resources/lenis.css](./resources/lenis.css))*

---

## 2. Quick Integration Patterns

### A. React & Next.js (`lenis/react`)

```jsx
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

export default function Layout({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
```

To listen to scroll progress or trigger programmatic scrolling from any child component:
```jsx
import { useLenis } from 'lenis/react'

function Component() {
  const lenis = useLenis(({ scroll, progress }) => {
    // Called on every scroll frame
  })

  const scrollToHero = () => {
    lenis?.scrollTo('#hero', { offset: -60, duration: 1.2 })
  }

  return <button onClick={scrollToHero}>Scroll to Top</button>
}
```

*See full React example in [examples/react-app-example.jsx](./examples/react-app-example.jsx).*

---

### B. Vanilla JS (Auto-RAF)

```js
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const lenis = new Lenis({
  autoRaf: true,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  anchors: true,
})

lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
  // console.log({ scroll, progress })
})
```

*See standalone HTML file in [examples/vanilla-basic.html](./examples/vanilla-basic.html).*

---

### C. GSAP ScrollTrigger Synchronization

When pairing with GSAP, disable Lenis's `autoRaf` and let GSAP's ticker drive the loop:

```js
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({ autoRaf: false })

// 1. Sync Lenis scroll with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)

// 2. Drive Lenis with GSAP ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

// 3. Disable lag smoothing to prevent jumps
gsap.ticker.lagSmoothing(0)
```

*See full React + GSAP component in [examples/react-gsap-scrolltrigger.jsx](./examples/react-gsap-scrolltrigger.jsx).*

---

### D. Scroll Snapping (`lenis/snap`)

```js
import Lenis from 'lenis'
import Snap from 'lenis/snap'
import 'lenis/dist/lenis.css'

const lenis = new Lenis({ autoRaf: true })
const snap = new Snap(lenis, { type: 'mandatory', debounce: 300 })

// Snap to all full-page sections
snap.addElements(document.querySelectorAll('.snap-section'), { align: 'start' })
```

*See full example in [examples/react-snap-sections.jsx](./examples/react-snap-sections.jsx).*

---

## 3. Essential Troubleshooting & Rules

1. **Remove CSS smooth scroll**: Never use `html { scroll-behavior: smooth; }` in CSS alongside Lenis. It causes severe stutter.
2. **Modals and nested scroll**: Always add `data-lenis-prevent` to scrollable modal bodies or inner overflow containers so Lenis does not intercept them.
3. **Pausing on open modal**: Call `lenis.stop()` when a modal opens, and `lenis.start()` when it closes.
4. **Anchor links**: Pass `anchors: true` in options, or use `lenis.scrollTo(hash, { offset: -navbarHeight })`.
5. **Accessibility**: Lenis automatically respects `prefers-reduced-motion` unless disabled with `respectReducedMotion: false`.
