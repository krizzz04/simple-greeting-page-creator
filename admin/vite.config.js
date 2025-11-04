import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy removed - using full API URLs instead of relative paths
    // proxy: {
    //   '/api': {
    //     target: 'https://tara-g1nf.onrender.com',
    //     changeOrigin: true,
    //     secure: false,
    //     ws: true,
    //   }
    // }
  }
})
