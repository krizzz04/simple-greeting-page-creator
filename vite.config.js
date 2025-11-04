
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    // Proxy removed - using full API URLs instead of relative paths
    // proxy: {
    //   '/api': {
    //     target: 'https://tara-g1nf.onrender.com',
    //     changeOrigin: true,
    //     secure: false,
    //     ws: true,
    //   }
    // }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth'],
          router: ['react-router-dom']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  }
})
