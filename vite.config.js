import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/IELTS_words/', // 替换为你的 GitHub 仓库名
  server: {
    port: 3000,
    proxy: {
      // 配置代理解决跨域问题
      '/api': {
        target: 'https://api.dictionaryapi.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
