import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'three-vendor'
            }
            if (id.includes('gsap') || id.includes('@gsap/react')) {
              return 'gsap-vendor'
            }
            if (id.includes('lenis')) {
              return 'lenis-vendor'
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons'
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion'
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'framework-vendor'
            }
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
