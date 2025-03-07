import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/

//you will need to change cert and key path if you want to undockerize this.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
    proxy: {
      "/api": {
        target: "https://backend:3000",
        changeOrigin: true,
        secure: false
      },
    },
  }
);
