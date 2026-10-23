# GSAP Core API & Methods Reference

## 1. Tweens (The Atomic Units of GSAP)

### `gsap.to(targets, vars)`
Animates properties from their current values to the target values:
```javascript
gsap.to('.card', {
  x: 100,
  opacity: 1,
  duration: 0.8,
  ease: 'power3.out',
})
```

### `gsap.from(targets, vars)`
Animates properties from the specified starting values to their current CSS/inline values:
```javascript
gsap.from('.card', {
  y: 50,
  opacity: 0,
  duration: 0.6,
  ease: 'power2.out',
})
```

### `gsap.fromTo(targets, fromVars, toVars)`
Explicitly defines both start and end states:
```javascript
gsap.fromTo(
  '.badge',
  { opacity: 0, scale: 0.8 },
  { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
)
```

### `gsap.set(targets, vars)`
Immediately applies properties without tweening (0 duration):
```javascript
gsap.set('.modal', { autoAlpha: 0, scale: 0.95 })
```
> **Tip**: Use `autoAlpha` instead of `opacity`. `autoAlpha: 0` automatically sets `visibility: hidden` when opacity hits 0, preventing phantom clicks on transparent elements.

---

## 2. Timelines (Choreography & Sequencing)

Timelines allow you to chain and position tweens with precision without calculating manual delay math.

```javascript
const tl = gsap.timeline({
  defaults: {
    duration: 0.7,
    ease: 'power3.out',
  },
  onComplete: () => console.log('Timeline finished'),
})

tl.from('.header', { y: -30, opacity: 0 })
  .from('.hero-text', { y: 40, opacity: 0 }, '-=0.3') // overlap by 0.3s
  .from('.cta-btn', { scale: 0.8, opacity: 0, ease: 'back.out(2)' }, '<0.2') // 0.2s after hero-text starts
```

### The Position Parameter Cheat Sheet
The 3rd argument in `.to()` / `.from()` on a timeline defines where it lands on the timeline:

Value | Description
:--- | :---
*(omitted)* | Directly at the end of the timeline (sequential).
`0` | At the absolute beginning (0 seconds).
`2.5` | At an absolute timestamp of 2.5 seconds.
`'+=0.5'` | 0.5 seconds after the previous animation ends (gap).
`'-=0.5'` | 0.5 seconds before the previous animation ends (overlap).
`'<'` | At the start of the previous animation (concurrent).
`'>'` | At the end of the previous animation (same as omitted).
`'<0.2'` | 0.2 seconds after the start of the previous animation.
`'<-0.2'` | 0.2 seconds before the start of the previous animation.
`'label'` | At a named label defined by `tl.addLabel('label')`.

---

## 3. Stagger Animations

Animate multiple targets with sequential offsets:

```javascript
gsap.from('.grid-card', {
  opacity: 0,
  y: 60,
  duration: 0.8,
  stagger: {
    each: 0.1, // or amount: 0.8 (total duration spread across all items)
    from: 'center', // 'start', 'end', 'center', 'edges', or [rowIndex, colIndex]
    grid: [3, 4], // [rows, cols] for 2D spatial staggers
    ease: 'power2.inOut',
  },
})
```

---

## 4. Easing System

GSAP offers a comprehensive easing palette. Common formats include `type.direction`:
- `power1`, `power2`, `power3`, `power4`: Exponential deceleration/acceleration.
- `expo`, `circ`, `sine`: Geometric curves.
- `back.out(overshoot)`: Overshoots and settles (great for buttons, popups).
- `elastic.out(amplitude, period)`: Rubber-band physics.
- `bounce.out`: Realistic gravity bounce.
- `none`: Linear motion (essential for continuous scrubbers, marquees).

```javascript
gsap.to('.box', { x: 200, ease: 'back.out(1.7)' })
```

---

## 5. High Performance: `quickTo` and `quickSetter`

For high-frequency events like `mousemove`, `pointermove`, or real-time physics, avoid instantiating new tweens on every tick. Use `gsap.quickTo()`:

```javascript
const cursorX = gsap.quickTo('.custom-cursor', 'x', { duration: 0.2, ease: 'power3' })
const cursorY = gsap.quickTo('.custom-cursor', 'y', { duration: 0.2, ease: 'power3' })

window.addEventListener('mousemove', (e) => {
  cursorX(e.clientX)
  cursorY(e.clientY)
})
```
