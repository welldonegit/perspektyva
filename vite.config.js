import { defineConfig } from 'vite'

// Односторінковий лендинг: точка входу — index.html.
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
  },
})
