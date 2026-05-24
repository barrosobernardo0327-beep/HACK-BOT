
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injeta a API_KEY de forma segura como uma string para o código do cliente
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.GEMINI_API_KEY || ""),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || process.env.API_KEY || ""),
    // Define process.env como um objeto vazio para evitar erros de referência global
    'process.env': {}
  },
  server: {
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
