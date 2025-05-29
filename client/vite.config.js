import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // adresse du serveur Express
        changeOrigin: true,
        // rewrite n'est pas nu00e9cessaire si le backend inclut du00e9ju00e0 '/api' dans ses routes
        // rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
