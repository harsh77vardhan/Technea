# Lenis Troubleshooting & Best Practices

Common issues and their verified solutions when implementing Lenis smooth scroll.

---

## 1. Jitter, Stutter, or Double-Smoothing

### Symptom
Scrolling feels sluggish, lags behind, or jerks violently.

### Cause
CSS `scroll-behavior: smooth` is defined in your CSS (`html { scroll-behavior: smooth }`).

### Fix
Remove `scroll-behavior: smooth` from your stylesheets. Lenis handles its own physics-based smoothing; having CSS smooth scroll enabled causes both engines to fight each other.

```css
/* ❌ DO NOT DO THIS */
html {
  scroll-behavior: smooth;
}

/* ✅ LET LENIS MANAGE SMOOTHING */
```

---

## 2. Modals, Drawers, or Dropdowns Can't Scroll

### Symptom
When opening a modal or drawer with internal overflow, scrolling is blocked or scrolls the background page instead.

### Fix: Use `data-lenis-prevent`
Add the `data-lenis-prevent` HTML attribute to your scrollable modal or drawer container:

```html
<div class="modal-dialog overflow-y-auto" data-lenis-prevent>
  <!-- Modal contents scroll independently without interference -->
</div>
```

Or pause Lenis while the modal is open:
```js
// When modal opens
lenis.stop()

// When modal closes
lenis.start()
```

---

## 3. Fixed Headers or Floating Buttons Shaking During Scroll

### Symptom
Fixed position navigation headers jitter or lag when scrolling.

### Cause
Placing fixed elements inside an ancestor that has a CSS `transform`, `filter`, or `perspective` creates a new stacking context and breaks `position: fixed`.

### Fix
- Ensure fixed elements are direct children of `<body>` or outside any transformed wrappers.
- Add hardware acceleration to fixed elements:
```css
.fixed-navbar {
  position: fixed;
  top: 0;
  left: 0;
  transform: translateZ(0);
  will-change: transform;
}
```

---

## 4. Missing Styles / Layout Collapsing

### Symptom
Page cannot scroll at all, or height calculates as 0.

### Cause
The official Lenis stylesheet was not imported.

### Fix
Always import `lenis/dist/lenis.css`:
```js
import 'lenis/dist/lenis.css'
```
Or include the stylesheet in HTML:
```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.27/dist/lenis.css">
```

---

## 5. Next.js / Nuxt SSR `window is not defined`

### Symptom
Build errors or hydration errors referencing `window` or `document`.

### Fix
Lenis requires browser APIs. In React / Next.js, add `'use client'` at the top of your smooth scroll component and mount inside `useEffect` or `<ReactLenis root>`.

---

## 6. Accessibility & Reduced Motion

Lenis respects user accessibility preferences by default (`respectReducedMotion: true`). When a user has enabled "Reduce Motion" in their OS:
- Smoothing is automatically bypassed.
- Programmatic `scrollTo` jumps immediately.
- Scrolling stays 100% native on the browser main thread.
