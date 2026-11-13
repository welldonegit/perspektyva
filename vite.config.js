import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Multi-page: index.html (лендинг) + styleguide.html (дизайн-система для Figma).
export default defineConfig({
  root: '.',
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
