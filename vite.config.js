import { defineConfig } from 'vite'

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
  }
})
