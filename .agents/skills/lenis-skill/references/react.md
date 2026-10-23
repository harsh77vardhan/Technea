# Lenis in React (`lenis/react`)

`lenis/react` provides first-class React components and hooks for Lenis smooth scrolling.

## Installation

```bash
npm install lenis
```

Always import the stylesheet at your root layout or entry point (`App.jsx`, `layout.jsx`, or `main.jsx`):
```js
import 'lenis/dist/lenis.css'
```

---

## Basic Root Setup

Wrapping with `<ReactLenis root>` binds Lenis to the browser window and provides context throughout your component tree:

```jsx
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

export default function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <main>
        <Header />
        <Content />
      </main>
    </ReactLenis>
  )
}
```

---

## The `useLenis` Hook

Access the global or context Lenis instance from any descendant component:

### 1. Scroll Listener Callback
```jsx
import { useLenis } from 'lenis/react'

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useLenis(({ progress }) => {
    setProgress(progress)
  })

  return (
    <div
      className="fixed top-0 left-0 h-1 bg-cyan-500 z-50 transition-transform origin-left"
      style={{ transform: `scaleX(${progress})` }}
    />
  )
}
```

### 2. Programmatic Scroll (`scrollTo`)
```jsx
import { useLenis } from 'lenis/react'

export function ScrollToTopButton() {
  const lenis = useLenis()

  const handleScrollTop = () => {
    lenis?.scrollTo(0, {
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  }

  return (
    <button onClick={handleScrollTop} className="fixed bottom-6 right-6">
      Back to Top
    </button>
  )
}
```

---

## Next.js (App Router) Integration

In Next.js App Router, Lenis requires browser APIs and must be initialized inside a client component:

### Step 1: Create `components/SmoothScroll.jsx`
```jsx
'use client'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        autoRaf: true,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
```

### Step 2: Use in `app/layout.jsx`
```jsx
import SmoothScroll from '@/components/SmoothScroll'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
```

---

## Modal / Drawer Integration (Stopping Scroll)

When opening a full-screen modal or drawer, pause the background smooth scroll so the modal can scroll independently:

```jsx
import { useEffect } from 'react'
import { useLenis } from 'lenis/react'

export function Modal({ isOpen, onClose, children }) {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    if (isOpen) {
      lenis.stop()
    } else {
      lenis.start()
    }
    return () => {
      lenis.start()
    }
  }, [isOpen, lenis])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      {/* Add data-lenis-prevent so inner scroll does not fight Lenis */}
      <div data-lenis-prevent className="bg-neutral-900 p-6 max-h-[80vh] overflow-y-auto rounded-2xl">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
```

---

## Nested Scroll Containers

To create an independent smooth scrolling container (not the entire window):

```jsx
import { ReactLenis } from 'lenis/react'

export function CustomScrollBox() {
  return (
    <ReactLenis
      options={{ lerp: 0.1 }}
      className="h-[400px] overflow-y-auto border border-neutral-800 rounded-xl"
    >
      <div className="h-[1200px] p-4">
        Long container content here...
      </div>
    </ReactLenis>
  )
}
```
