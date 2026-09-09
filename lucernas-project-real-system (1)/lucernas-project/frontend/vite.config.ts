import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),react()],
  server: {
    // Proxy API calls to the backend so the browser sees them as
    // same-origin — this lets the httpOnly session cookie set by
    // /api/auth/login round-trip without extra CORS/cookie config.
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
