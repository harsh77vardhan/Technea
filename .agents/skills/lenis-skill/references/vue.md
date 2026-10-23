# Lenis in Vue 3 & Nuxt (`lenis/vue`)

`lenis/vue` provides components and composables for seamless smooth scrolling in Vue 3 and Nuxt applications.

## Installation

```bash
npm install lenis
```

Import recommended CSS:
```js
import 'lenis/dist/lenis.css'
```

---

## Vue 3 Setup

### 1. Register Global Plugin (`main.js`)
```js
import { createApp } from 'vue'
import LenisVue from 'lenis/vue'
import App from './App.vue'
import 'lenis/dist/lenis.css'

const app = createApp(App)
app.use(LenisVue)
app.mount('#app')
```

### 2. Component Usage (`App.vue`)
```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/vue'

const lenisOptions = {
  lerp: 0.1,
  duration: 1.2,
  smoothWheel: true,
}

const lenis = useLenis((event) => {
  // called on every scroll
  console.log('Scroll position:', event.scroll)
})
</script>

<template>
  <VueLenis root :options="lenisOptions">
    <main>
      <router-view />
    </main>
  </VueLenis>
</template>
```

---

## Nuxt 3 Integration

Add `lenis/nuxt` to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['lenis/nuxt'],
  css: ['lenis/dist/lenis.css'],
})
```

The `<VueLenis>` and `useLenis` composables are automatically auto-imported across your Nuxt application.
