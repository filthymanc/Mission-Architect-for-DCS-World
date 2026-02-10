import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Critical for GitHub Pages
  server: {
    port: 3000,
    open: true // Opens browser automatically
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});