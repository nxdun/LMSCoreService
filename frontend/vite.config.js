import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  GOOGLE: {
    ReCaptcha : "6Leca74pAAAAALKX8Ze8i7OvxtOmrWyoRc6WS8vE",
  },
})