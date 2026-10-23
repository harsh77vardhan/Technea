# Lenis Scroll Snapping (`lenis/snap`)

`lenis/snap` adds smooth CSS-like scroll snapping to Lenis without hijacking or breaking native browser behavior.

## Installation

Included directly within the `lenis` package:
```bash
npm install lenis
```

---

## Basic Initialization

```js
import Lenis from 'lenis'
import Snap from 'lenis/snap'
import 'lenis/dist/lenis.css'

const lenis = new Lenis({ autoRaf: true })

// Initialize Snap instance connected to Lenis
const snap = new Snap(lenis, {
  type: 'proximity', // 'proximity' | 'mandatory' | 'lock'
  debounce: 500,     // Debounce time in ms
})

// Snap to specific pixel values
snap.add(0)
snap.add(800)
snap.add(1600)
```

---

## Snapping to DOM Elements

Instead of hardcoded numbers, snap directly to DOM sections:

```js
// Snap to all sections
const sections = document.querySelectorAll('.snap-section')

snap.addElements(sections, {
  align: 'start', // 'start' | 'center' | 'end' | ['start', 'end']
})
```

---

## Slideshow / Page-by-Page Locking

For full-screen locked slides where each scroll gesture advances one full section:

```js
const snap = new Snap(lenis, {
  type: 'lock',
  distanceThreshold: '100%',
  debounce: 0,
})

// Add full screen slides
snap.addElements(document.querySelectorAll('.full-slide'), {
  align: 'start',
})
```

---

## Programmatic Navigation

```js
// Jump to next or previous snap point
buttonNext.addEventListener('click', () => snap.next())
buttonPrev.addEventListener('click', () => snap.previous())

// Go to specific index
navItems.forEach((btn, index) => {
  btn.addEventListener('click', () => snap.goTo(index))
})
```

---

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `'proximity' \| 'mandatory' \| 'lock'` | `'proximity'` | Snap behavior type. |
| `distanceThreshold` | `string \| number` | `'50%'` | Threshold to trigger snap. Percent is relative to viewport. |
| `debounce` | `number` | `500` | Debounce time in ms before snapping activates. |
| `lerp` | `number` | `lenis.lerp` | Custom lerp for snapping motion. |
| `duration` | `number` | `lenis.duration` | Custom duration for snap animation. |
| `easing` | `function` | `lenis.easing` | Custom easing function for snap. |
| `onSnapStart` | `(snap) => void` | `undefined` | Callback fired when snapping begins. |
| `onSnapComplete` | `(snap) => void` | `undefined` | Callback fired when snap settling finishes. |
