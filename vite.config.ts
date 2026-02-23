// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Разрешаем все хосты (для теста с Pinggy/localtunnel/ngrok)
    // В production это опасно, но для dev — ок
    allowedHosts: true,

    // Опционально: слушаем на всех интерфейсах (если нужно)
    host: true,

    // HMR работает через туннель (важно для Hot Module Replacement)
    hmr: {
      clientPort: 443,  // поскольку Pinggy даёт HTTPS (порт 443)
      protocol: 'wss'   // secure websocket
    }
  }
})