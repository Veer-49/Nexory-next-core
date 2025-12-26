import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index-3.html',
        header: './header.html',
        footer: './footer.html'
      }
    },
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true
  },
  plugins: [
    {
      name: 'copy-assets',
      writeBundle() {
        const copyDir = (src, dest) => {
          if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true })
          }
          // Simple copy for now - in a real scenario you'd want recursive copy
          try {
            const fs = require('fs')
            const path = require('path')
            if (existsSync(src)) {
              const files = fs.readdirSync(src)
              files.forEach(file => {
                const srcPath = path.join(src, file)
                const destPath = path.join(dest, file)
                if (fs.statSync(srcPath).isDirectory()) {
                  copyDir(srcPath, destPath)
                } else {
                  fs.copyFileSync(srcPath, destPath)
                }
              })
            }
          } catch (err) {
            console.log('Copy assets warning:', err.message)
          }
        }
        
        copyDir('assets/vendors', 'dist/assets/vendors')
        copyDir('assets/js', 'dist/assets/js')
      }
    }
  ]
})
