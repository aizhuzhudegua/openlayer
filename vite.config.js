import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/geoserver': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geoserver/, '')
      },
      '/api': {
        target: 'https://gitee.com/flamingoooo/models/raw/master',  // 设置你想要代理的目标主机
        changeOrigin: true,  // 设置 changeOrigin 为 true 以支持代理跨域请求
        rewrite: (path) => path.replace(/^\/api/, '')  // 可选的 URL 重写规则
      },
      '/req': {
        target: 'http://localhost:8081',
        changeOrigin: true,  
        rewrite: (path) => path.replace(/^\/req/, '')  // 可选的 URL 重写规则
      }
    }
  }
})
