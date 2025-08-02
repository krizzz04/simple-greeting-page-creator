
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080
  },
  build: {
    outDir: 'dist'
  },
  preview: {
    port: 8080
  }
})
