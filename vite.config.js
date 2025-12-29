import { defineConfig } from 'vite'
import { readFileSync, writeFileSync } from 'fs'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: './index.html',
        about: './about.html',
        contact: './contact.html',
        faq: './faq.html',
        privacy: './privacy-policy.html',
        projects: './projects.html',
        services: './services.html',
        terms: './terms&condition.html'
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
      name: 'embed-header-footer',
      writeBundle() {
        const fs = require('fs')
        const path = require('path')
        
        // Read header and footer content
        const headerContent = fs.readFileSync('header.html', 'utf8')
        const footerContent = fs.readFileSync('footer.html', 'utf8')
        
        // List of HTML files to process
        const htmlFiles = [
          'index.html', 'about.html', 'contact.html', 'faq.html',
          'privacy-policy.html', 'projects.html', 'services.html', 
          'terms&condition.html'
        ]
        
        htmlFiles.forEach(file => {
          const filePath = path.join('dist', file)
          if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8')
            
            // Replace header container with actual header content
            content = content.replace(
              /<div id="header-container"><\/div>[\s\S]*?<\/script>/,
              headerContent
            )
            
            // Replace footer container with actual footer content
            content = content.replace(
              /<div id="footer-container"><\/div>[\s\S]*?<\/script>/,
              footerContent
            )
            
            // Write the modified content back
            fs.writeFileSync(filePath, content)
            console.log(`Embedded header/footer in ${file}`)
          }
        })
      }
    }
  ]
})
