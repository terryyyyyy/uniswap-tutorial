import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages 项目站挂在 /uniswap-tutorial/ 下；本地开发仍用根路径
const base = process.env.GITHUB_PAGES === 'true' ? '/uniswap-tutorial/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  worker: { format: 'es' },
  server: { port: 5174, open: true },
})
