import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The API runs on :5000. Proxying /api and /uploads keeps every URL relative,
// so the same build works in development and behind one domain in production.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
