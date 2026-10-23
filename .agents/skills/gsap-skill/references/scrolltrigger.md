# GSAP ScrollTrigger Reference Guide

`ScrollTrigger` triggers and drives GSAP tweens and timelines based on the scroll position of the window or a custom scrollable container.

```javascript
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
```

---

## 1. Anatomy of a ScrollTrigger

```javascript
gsap.to('.animated-element', {
  x: 200,
  opacity: 1,
  scrollTrigger: {
    trigger: '.section-container', // Element that triggers the animation
    start: 'top 80%',              // When top of trigger hits 80% down the viewport
    end: 'bottom 20%',             // When bottom of trigger hits 20% down the viewport
    scrub: 1,                      // Smooth scrub (number = seconds of smoothing catchup)
    pin: true,                     // Pin the trigger element while active
    pinSpacing: true,              // Add padding below pinned element to preserve flow
    markers: false,                // Set to true in dev for visual debugging guides
    toggleActions: 'play pause resume reset',
  },
})
```

---

## 2. Trigger Positions (`start` & `end`)

Positions are defined as a two-token string:
`'[trigger-point] [viewport-point]'`

- `trigger-point`: `'top'`, `'center'`, `'bottom'`, or pixel/percent offset (`'top+=100px'`, `'top 30%'`).
- `viewport-point`: `'top'`, `'center'`, `'bottom'`, or percentage down the screen (`'80%'`).

Common Examples:
- `'top bottom'`: Element enters from bottom of viewport (default).
- `'top center'`: Trigger's top reaches center of viewport.
- `'top top'`: Trigger's top reaches top of viewport (common for pinning).
- `'bottom top'`: Trigger's bottom reaches top of viewport (element completely scrolled out).

---

## 3. `toggleActions` Syntax

When `scrub` is **not** used, `toggleActions` controls playback across 4 scroll events:

```
toggleActions: "onEnter onLeave onEnterBack onLeaveBack"
```

Keywords available for each slot:
`play`, `pause`, `resume`, `reverse`, `restart`, `reset`, `complete`, `none`

Canonical Combinations:
- `'play none none none'`: Play once when entered, never re-trigger.
- `'play none none reverse'`: Play when entering forward, reverse when scrolling back past start.
- `'play pause resume reset'`: Perfect for playing videos or loops only while in view.

---

## 4. Pinning & Sticky Panels

Pinning holds an element in place in the viewport while the scroll continues:

```javascript
gsap.timeline({
  scrollTrigger: {
    trigger: '#hero-showcase',
    start: 'top top',
    end: '+=1500', // Pin for 1500px of scroll distance
    pin: true,
    scrub: 1.2,
    anticipatePin: 1, // Eliminates visual stutter right before pin activates
  },
})
.to('.slide-1', { opacity: 0 })
.from('.slide-2', { opacity: 0 })
```

> **Important**: When pinning elements with sticky headers or dynamic margins, always set `anticipatePin: 1` to prevent jitter on initial latch.

---

## 5. Responsive Scroll Animations (`gsap.matchMedia()`)

Handle desktop vs mobile breakpoints cleanly with automatic cleanup:

```javascript
const mm = gsap.matchMedia()

mm.add('(min-width: 1024px)', () => {
  // Desktop-only pinning and horizontal parallax
  gsap.to('.horizontal-strip', {
    xPercent: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: '.horizontal-container',
      start: 'top top',
      end: '+=2000',
      pin: true,
      scrub: 1,
    },
  })
})

mm.add('(max-width: 1023px)', () => {
  // Mobile fallback: simple fade in
  gsap.from('.horizontal-strip .item', {
    opacity: 0,
    y: 40,
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.horizontal-container',
      start: 'top 85%',
    },
  })
})
```

---

## 6. High-Performance Batching (`ScrollTrigger.batch`)

When you have tens or hundreds of cards (e.g. product catalog or masonry grid), individual ScrollTriggers can degrade performance. Use `ScrollTrigger.batch()`:

```javascript
ScrollTrigger.batch('.catalog-card', {
  start: 'top 90%',
  onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, overwrite: true }),
  onLeave: (batch) => gsap.set(batch, { opacity: 0, y: -40, overwrite: true }),
  onEnterBack: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, overwrite: true }),
  onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 40, overwrite: true }),
})
```
