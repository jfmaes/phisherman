import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 443,
    https: {
      key: fs.readFileSync("/app/certs/key.pem"),
      cert: fs.readFileSync("/app/certs/cert.pem"),
    },
    proxy: {
      "/api": {
        target: "https://backend:3000",
        changeOrigin: true,
        secure: false
      },
    },
  }
});
