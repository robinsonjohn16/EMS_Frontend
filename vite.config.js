import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Allow external connections
    port: 5173,
    // Allow subdomain access in development
    allowedHosts: [
      'localhost',
      '.localhost', // Allow any subdomain of localhost
      '127.0.0.1'
    ]
  }
})
