# GSAP in React & Next.js (`@gsap/react`)

Using GSAP in modern React (React 18 and React 19) requires strict adherence to component lifecycle and teardown. React StrictMode mounts, unmounts, and re-mounts components in development to detect side-effects.

Without proper cleanup, tweens will conflict, animations will jump, and memory leaks will accumulate.

---

## 1. Installation

```bash
npm install gsap @gsap/react
```

Register the hook once:
```javascript
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)
```

---

## 2. Basic Setup with `useGSAP` and Scope

The `useGSAP` hook automatically creates a `gsap.context()` under the hood, scopes all selector strings (like `'.box'`) to your container element, and automatically reverts all tweens/timelines on unmount.

```jsx
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function FeatureCards() {
  const containerRef = useRef(null)

  useGSAP(() => {
    // Selector '.card' is scoped ONLY to children of containerRef
    gsap.from('.card', {
      opacity: 0,
      y: 40,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out',
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="features-grid">
      <div className="card">Card 1</div>
      <div className="card">Card 2</div>
      <div className="card">Card 3</div>
    </div>
  )
}
```

---

## 3. Event Handlers & Callbacks: `contextSafe()`

Any animations triggered **after** initial render (e.g., button clicks, hovers, asynchronous API responses) must be wrapped with `contextSafe()` to ensure they belong to the component's GSAP context for automatic cleanup:

```jsx
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function InteractiveButton() {
  const containerRef = useRef(null)

  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleClick = contextSafe(() => {
    gsap.to('.button-glow', {
      scale: 1.4,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => gsap.set('.button-glow', { scale: 1, opacity: 1 }),
    })
  })

  return (
    <div ref={containerRef}>
      <button onClick={handleClick} className="relative">
        <span className="button-glow absolute inset-0 bg-cyan-500 rounded" />
        Click Me
      </button>
    </div>
  )
}
```

---

## 4. Reactive Dependency Array

Like React's `useEffect`, `useGSAP` accepts a dependencies array:

```jsx
useGSAP(() => {
  gsap.to('.active-tab-indicator', {
    x: activeTabIndex * 120,
    duration: 0.4,
    ease: 'power2.out',
  })
}, { dependencies: [activeTabIndex], scope: containerRef, revertOnUpdate: true })
```

> **Note**: Setting `revertOnUpdate: true` ensures the previous animation is reverted back to its pre-animation state before running the updated tween.

---

## 5. Next.js App Router Integration

In Next.js 13+ (App Router), components are Server Components by default. GSAP operates directly on the browser DOM and window objects, so GSAP components must be declared as Client Components:

```jsx
'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function ClientHero() {
  const root = useRef(null)

  useGSAP(() => {
    gsap.from('.headline', { opacity: 0, y: 50, duration: 1 })
  }, { scope: root })

  return <section ref={root}><h1 className="headline">Title</h1></section>
}
```
