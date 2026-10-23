# Lenis Core API Reference

Lenis is a lightweight, robust, performant smooth scroll library by [darkroom.engineering](https://github.com/darkroomengineering/lenis).

## Installation

```bash
npm install lenis
# or
yarn add lenis
# or
pnpm add lenis
# or
bun add lenis
```

CDN (script tag):
```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.27/dist/lenis.css">
<script src="https://unpkg.com/lenis@1.3.27/dist/lenis.min.js"></script>
```

---

## Initialization

### Modern Auto-RAF (Simplest)
```js
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const lenis = new Lenis({
  autoRaf: true,
})

lenis.on('scroll', (e) => {
  // e.scroll, e.velocity, e.direction, e.progress
})
```

### Manual RequestAnimationFrame Loop
```js
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const lenis = new Lenis()

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
```

---

## Configuration Settings

Passed to `new Lenis(options)`:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `wrapper` | `HTMLElement \| Window` | `window` | The scroll container element. |
| `content` | `HTMLElement` | `document.documentElement` | The content element that is scrolled. |
| `eventsTarget` | `HTMLElement \| Window` | `wrapper` | Element listening to wheel and touch events. |
| `duration` | `number` | `1.2` | Duration of scroll animation in seconds. Ignored if `lerp` is defined. |
| `lerp` | `number` | `0.1` | Linear interpolation intensity (between `0` and `1`). Smaller = smoother/slower. |
| `easing` | `function` | `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | Easing curve for animation. Ignored if `lerp` is defined. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Direction of the scroll. |
| `gestureOrientation` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Orientation of gesture input. |
| `smoothWheel` | `boolean` | `true` | Whether to smooth wheel scroll events. |
| `syncTouch` | `boolean` | `false` | Mimic touch device scroll while allowing scroll sync. |
| `syncTouchLerp` | `number` | `0.075` | Lerp value applied during `syncTouch` inertia. |
| `touchMultiplier` | `number` | `1` | Multiplier for touch events. |
| `touchInertiaExponent` | `number` | `1.7` | Strength of touch inertia. |
| `wheelMultiplier` | `number` | `1` | Multiplier for wheel events. |
| `infinite` | `boolean` | `false` | Enable infinite scrolling (`syncTouch: true` required on touch devices). |
| `autoRaf` | `boolean` | `false` | Automatically manage the `requestAnimationFrame` loop. |
| `autoResize` | `boolean` | `true` | Automatically resize based on `ResizeObserver`. |
| `autoToggle` | `boolean` | `false` | Automatically pause/resume based on wrapper overflow. Requires `lenis.css`. |
| `allowNestedScroll` | `boolean` | `false` | Automatically allow nested elements to scroll natively. (Note: checks DOM tree on scroll). |
| `prevent` | `function` | `undefined` | Callback `(node) => boolean`. Return `true` to disable smoothing for that element. |
| `virtualScroll` | `function` | `undefined` | Callback `({ event }) => boolean`. Return `false` to prevent smoothing. |
| `overscroll` | `boolean` | `true` | Mimic CSS overscroll-behavior. |
| `respectReducedMotion` | `boolean` | `true` | Disables smoothing when user prefers reduced motion. |
| `stopInertiaOnNavigate` | `boolean` | `false` | Stop momentum when internal links are clicked. |
| `anchors` | `boolean \| ScrollToOptions` | `false` | Automatically handle anchor link scrolling with Lenis. |

---

## Instance Properties

Access via `lenis.propertyName`:

- `actualScroll`: Current scroll position registered by browser (number).
- `animatedScroll`: Current smoothed scroll position (number).
- `velocity`: Current scroll speed/velocity.
- `direction`: Current direction: `1` for scrolling down/forward, `-1` for scrolling up/backward, `0` when stationary.
- `progress`: Scroll progress between `0` (top) and `1` (bottom).
- `limit`: Maximum scrollable distance (`dimensions.limit`).
- `isScrolling`: `false`, `'smooth'`, or `'native'`.
- `isStopped`: `true` if smooth scrolling is paused/stopped.
- `isHorizontal`: `true` if scrolling horizontally.
- `dimensions`: Dimensions manager instance.
- `rootElement`: DOM element on which Lenis is instanced.

---

## Instance Methods

### `lenis.scrollTo(target, options)`
Scroll programmatically to a target with precise easing or instant jump.

```js
lenis.scrollTo('#section-id', {
  offset: -80,         // Pixels offset (e.g. for fixed navbar)
  duration: 1.5,       // Duration in seconds
  easing: (t) => t,    // Custom easing
  immediate: false,    // Jump immediately without animation
  lock: true,          // Prevent user scrolling during animation
  onComplete: () => {
    console.log('Target reached!')
  }
})
```
**Target types:**
- `number`: Scroll to exact pixel offset (`500`).
- `string`: CSS selector (`'#hero'`) or keywords (`'top'`, `'bottom'`, `'left'`, `'right'`).
- `HTMLElement`: DOM element reference (`document.querySelector('.card')`).

### `lenis.start()`
Resume smooth scrolling after being stopped.

### `lenis.stop()`
Pause smooth scrolling (locks scroll position, useful for modals).

### `lenis.resize()`
Force dimensions recalculation (useful after dynamic DOM insertion / images load).

### `lenis.destroy()`
Tear down the Lenis instance, remove event listeners, and clean up.

### `lenis.on(event, callback)`
Listen to events:
```js
lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
  // update UI, HUD, or parallax elements
})
```

### `lenis.off(event, callback)`
Remove an event listener.
