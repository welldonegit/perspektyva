import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Multi-page: index.html (лендинг) + styleguide.html (дизайн-система для Figma).
export default defineConfig({
  root: '.',
  server: {
    host: true,        // слухати 0.0.0.0 — щоб працював проброс порту з dev-контейнера
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        styleguide: resolve(__dirname, 'styleguide.html'),
      },
    },
  },
})
