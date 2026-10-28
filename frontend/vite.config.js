import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.VITE_BACKEND_URL ||
    (env.VITE_API_URL ? env.VITE_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '') : '') ||
    'http://127.0.0.1:8000'

  return {
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
            if (id.includes('vanta')) {
              return 'vanta-vendor'
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
        target: backendTarget,
        changeOrigin: true,
      },
      '/static': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  }
})
