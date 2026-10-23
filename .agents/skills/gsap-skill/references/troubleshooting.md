# GSAP Troubleshooting & Common Pitfalls

---

## 1. Pinned Elements Jitter or Jump During Scroll

### Cause A: Parent Element Has a CSS `transform`
When an element or any of its ancestors has `transform: translate(...)` or `will-change: transform`, the browser creates a new stacking and containing context. This breaks `position: fixed` used by `ScrollTrigger.pin`, causing pinned elements to jitter or jump wildly.

**Solution**: Ensure no ancestor container of the pinned element has CSS transforms applied. If animations are needed on the container, animate the children instead.

### Cause B: `lagSmoothing` is Enabled
GSAP's default lag smoothing automatically skips frames when heavy processing occurs to keep time accurate. In scroll situations, this causes visual jumps.

**Solution**:
```javascript
gsap.ticker.lagSmoothing(0)
```

### Cause C: Sudden Pin Transition Jitter
When the scroll reaches the pinning start point, the browser might calculate the switch from static to fixed with a 1-frame latency.

**Solution**:
```javascript
scrollTrigger: {
  trigger: '.section',
  pin: true,
  anticipatePin: 1, // Latch 1 frame earlier to eliminate hitch
}
```

---

## 2. Flash of Unstyled Content (FOUC)

### Problem
Elements animated with `gsap.from()` start visible in their natural HTML/CSS state, then jump to their "from" state once JavaScript executes.

### Solution
Use `autoAlpha` instead of `opacity`. In your CSS:
```css
.reveal-element {
  visibility: hidden;
}
```
In your JavaScript:
```javascript
gsap.fromTo(
  '.reveal-element',
  { autoAlpha: 0, y: 30 },
  { autoAlpha: 1, y: 0, duration: 0.8 }
)
```

---

## 3. React Component Unmount Memory Leaks & Glitches

### Problem
Tweens created inside standard `useEffect` without proper cleanup continue running in the background, holding memory references to unmounted DOM nodes and causing errors in React StrictMode.

### Solution
Always use `@gsap/react`'s `useGSAP` hook:
```jsx
useGSAP(() => {
  gsap.to('.item', { x: 100 })
}, { scope: containerRef })
```

---

## 4. `ScrollTrigger.refresh()` Timing Issues

### Problem
ScrollTrigger triggers calculate positions based on the initial DOM height. If images, fonts, or asynchronous components load afterwards, the trigger markers will be out of alignment.

### Solution
Trigger a refresh once dynamic content has finished rendering:
```javascript
// Image loaded or API call resolved:
ScrollTrigger.refresh()
```
Or for web fonts:
```javascript
document.fonts.ready.then(() => {
  ScrollTrigger.refresh()
})
```
