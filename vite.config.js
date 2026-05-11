import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config - sets up the React dev server
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to backend during development
    // So /api/... in React → http://localhost:5000/api/...
    // This avoids CORS issues in development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
