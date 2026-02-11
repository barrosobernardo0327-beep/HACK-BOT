
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
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
