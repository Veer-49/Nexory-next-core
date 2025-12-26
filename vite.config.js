import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: './index.html',
        about: './about.html',
        contact: './contact.html',
        apps: './apps-development.html',
        digital: './digital-marketing.html',
        faq: './faq.html',
        graphic: './graphic-designing.html',
        privacy: './privacy-policy.html',
        projects: './projects.html',
        services: './services-carousel-2.html',
        terms: './terms&condition.html',
        webApplication: './web-application.html',
        webDesigning: './web-designing.html',
        webDevelopment: './web-development.html',
        websiteDevelopment: './website-development.html'
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
        
        // Copy assets directories
        copyDir('assets/vendors', 'dist/assets/vendors')
        copyDir('assets/js', 'dist/assets/js')
        
        // Copy header and footer files
        if (fs.existsSync('header.html')) {
          fs.copyFileSync('header.html', 'dist/header.html')
        }
        if (fs.existsSync('footer.html')) {
          fs.copyFileSync('footer.html', 'dist/footer.html')
        }
      }
    }
  ]
})
