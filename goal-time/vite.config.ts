import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built app runs from any path — GitHub Pages
// subdirectory, a file:// copy, or a local static server.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // One JS file keeps the offline story simple: the service worker
    // precaches a short, predictable list.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
