import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill para process.env para que o código do SDK funcione corretamente
    'process.env': process.env
  },
  server: {
    host: true
  },
  base: '/'
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});