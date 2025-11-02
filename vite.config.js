import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// Helper to strip trailing /api or /api/vX from a base URL
const stripApiSuffix = (baseUrl) => {
  if (!baseUrl) return '';
  try {
    return baseUrl.replace(/\/api(\/v\d+)?\/?$/i, '');
  } catch {
    return baseUrl;
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || '';
  const staticBase = env.VITE_STATIC_BASE_URL || '';
  const backendOrigin = staticBase || stripApiSuffix(apiBase);

  return {
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
      ],
      // Proxy uploads to backend origin so `src="/uploads/..."` works in dev
      proxy: backendOrigin
        ? {
            '/uploads': {
              target: backendOrigin,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  }
})
