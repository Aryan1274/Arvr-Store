import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: true,           // expose to all network interfaces
      allowedHosts: true,   // allow all hosts (needed for Cloudflare tunnel testing)
      proxy: {
        '/api': {
          // In dev: proxy to local Express server
          // In production (Vercel): this proxy is not used — api.js uses VITE_API_URL instead
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})

