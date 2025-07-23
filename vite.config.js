import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 8080,
    // strictPort: true,
    allowedHosts: ["travelpro.whilter.ai"],
    hmr: {
      overlay: false,
    },
  },
})

