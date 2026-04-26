import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Import the new plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // <-- Add the Tailwind CSS plugin to the Vite configuration
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})