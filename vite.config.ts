import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Для GitHub Pages: при переходе на /dibil-message/chat и т.д. сервер отдаёт 404.
// Если в корне сайта есть 404.html = копия index.html, отдаётся наше SPA и React Router открывает нужный маршрут.
function copyIndexTo404() {
  return {
    name: 'copy-index-to-404',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      const indexPath = path.join(outDir, 'index.html')
      const notFoundPath = path.join(outDir, '404.html')
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyIndexTo404()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  base: '/dibil-message/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
