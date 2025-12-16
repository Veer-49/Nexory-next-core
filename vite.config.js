import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index-3.html'
    }
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true
  }
})
