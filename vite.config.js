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
        index: './index.html',
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
        const fs = require('fs')
        const path = require('path')
        
        const copyDir = (src, dest) => {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true })
          }
          if (fs.existsSync(src)) {
            const entries = fs.readdirSync(src, { withFileTypes: true })
            for (const entry of entries) {
              const srcPath = path.join(src, entry.name)
              const destPath = path.join(dest, entry.name)
              if (entry.isDirectory()) {
                copyDir(srcPath, destPath)
              } else {
                fs.copyFileSync(srcPath, destPath)
              }
            }
          }
        }
        
        copyDir('assets/vendors', 'dist/assets/vendors')
        copyDir('assets/js', 'dist/assets/js')
      }
    }
  ]
})
