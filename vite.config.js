import { defineConfig } from 'vite'
import { copyFileSync } from 'fs'

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
        terms: './terms&condition.html',
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
      name: 'copy-header-footer',
      writeBundle() {
        // Copy header and footer files to dist root
        copyFileSync('header.html', 'dist/header.html')
        copyFileSync('footer.html', 'dist/footer.html')
      }
    }
  ]
})
