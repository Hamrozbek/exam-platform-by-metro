import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Kutubxonalarni alohida chunklarga bo'lish
          if (id.includes('node_modules')) {
            if (id.includes('antd')) {
              return 'antd';
            }
            if (id.includes('@ant-design')) {
              return 'ant-icons';
            }
            return 'vendor'; // qolgan barcha kutubxonalar uchun
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Ogohlantirish limitini 1MB ga ko'tarish
  },
})