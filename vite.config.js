import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /api → backend จริง (siam-u-line-welcome-production.up.railway.app)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://siam-u-line-welcome-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
