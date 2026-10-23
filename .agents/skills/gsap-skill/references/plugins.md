# GSAP Plugins Reference

GSAP includes a powerful suite of official plugins for specialized animation tasks.

---

## 1. Flip Plugin (`gsap/Flip`)

The **FLIP** technique (**F**irst, **L**ast, **I**nvert, **P**lay) animates seamless layout changes that would otherwise cause heavy browser reflows (e.g. changing flex order, grid layouts, expanding modal cards, sorting/filtering lists).

```javascript
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

function toggleExpand(cardElement) {
  // 1. Capture current state (position, dimensions, rotation)
  const state = Flip.getState(cardElement)

  // 2. Change the DOM (toggle classes, change parent container, etc.)
  cardElement.classList.toggle('expanded')

  // 3. Animate smoothly from the old state to the new state
  Flip.from(state, {
    duration: 0.6,
    ease: 'power3.inOut',
    absolute: true, // Prevents sibling layout collapses during animation
    onComplete: () => console.log('Flip complete'),
  })
}
```

---

## 2. Observer Plugin (`gsap/Observer`)

Observer normalizes swipe, drag, mouse wheel, and pointer events across desktop and touch devices without hijacking native scrolling. Ideal for full-screen slide presentations or gesture drawers.

```javascript
import gsap from 'gsap'
import { Observer } from 'gsap/Observer'

gsap.registerPlugin(Observer)

Observer.create({
  target: window,
  type: 'wheel,touch,pointer',
  onUp: () => goToNextSlide(),
  onDown: () => goToPreviousSlide(),
  tolerance: 15, // Threshold in pixels before triggering
  preventDefault: false, // Set to true if overriding native scroll
})
```

---

## 3. SplitText Plugin (`gsap/SplitText`)

Splits text into characters, words, and lines for editorial kinetic typography:

```javascript
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

const split = new SplitText('.editorial-heading', { type: 'words,chars' })

gsap.from(split.chars, {
  opacity: 0,
  y: 50,
  rotateX: -90,
  stagger: 0.02,
  duration: 0.8,
  ease: 'back.out(2)',
})
```

---

## 4. ScrollToPlugin (`gsap/ScrollToPlugin`)

Smoothly animates the window or a container to an element, anchor, or coordinate:

```javascript
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

// Scroll to section with offset
gsap.to(window, {
  duration: 1.2,
  scrollTo: { y: '#features', offsetY: 70 },
  ease: 'power3.inOut',
})
```

---

## 5. MotionPathPlugin (`gsap/MotionPathPlugin`)

Animates any DOM element, SVG shape, or 3D object along a curved SVG path:

```javascript
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

gsap.to('.drone-icon', {
  duration: 5,
  repeat: -1,
  ease: 'power1.inOut',
  motionPath: {
    path: '#flight-trajectory-path',
    align: '#flight-trajectory-path',
    autoRotate: true,
    alignOrigin: [0.5, 0.5],
  },
})
```
