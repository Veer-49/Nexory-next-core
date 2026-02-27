import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// Custom middleware for API routes
function apiMiddleware(req, res, next) {
  // Handle API routes
  if (req.url.startsWith('/api/')) {
    const route = req.url.split('?')[0]; // Remove query string
    
    if (route === '/api/submit-form' && req.method === 'POST') {
      // Parse body for POST request
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
        // Prevent large payloads
        if (body.length > 1e6) {
          req.connection.destroy();
          res.statusCode = 413;
          res.end('Payload too large');
          return;
        }
      });
      
      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'] || '';
          
          // Parse body based on content type
          if (contentType.includes('application/json')) {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch (e) {
              req.body = body;
            }
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            req.body = body;
          } else {
            req.body = body;
          }
          
          // Now load and call the handler
          import('./api/submit-form.js').then(module => {
            const handler = module.default;
            handler(req, res);
          }).catch(error => {
            console.error('Error loading submit-form handler:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
          });
        } catch (error) {
          console.error('Error processing request body:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to process request', details: error.message }));
        }
      });
      
      req.on('error', (error) => {
        console.error('Request stream error:', error);
        if (!res.headersSent) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Request error', details: error.message }));
        }
      });
      
      return;
    }
    
    // Handle billing auth
    if (route === '/api/auth' && req.method === 'POST') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
        if (body.length > 1e6) {
          req.connection.destroy();
          res.statusCode = 413;
          res.end('Payload too large');
          return;
        }
      });
      
      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'] || '';
          
          let parsedBody = {};
          if (contentType.includes('application/json')) {
            try {
              parsedBody = body ? JSON.parse(body) : {};
            } catch (e) {
              parsedBody = {};
            }
          }
          
          const { password } = parsedBody;
          
          if (!password) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Password is required' }));
            return;
          }
          
          const correctPassword = 'Billing@123'; // Default password
          
          if (password === correctPassword) {
            // Create a simple token (expires in 24 hours)
            const token = Buffer.from(JSON.stringify({
              authenticated: true,
              exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            })).toString('base64');
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, token: token, message: 'Authentication successful' }));
          } else {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Invalid password' }));
          }
        } catch (error) {
          console.error('Auth error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Authentication failed' }));
        }
      });
      
      req.on('error', (error) => {
        console.error('Auth request error:', error);
        if (!res.headersSent) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Request error', details: error.message }));
        }
      });
      
      return;
    }
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      res.statusCode = 200;
      res.end();
      return;
    }
  }
  
  next();
}

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: './index.html',
        about: './about.html',
        billing: './billing.html',
        leads: './leads.html',
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
    historyApiFallback: true,
    middlewareMode: false
  },
  plugins: [
    {
      name: 'api-middleware',
      configResolved(config) {
        // Store config for use in middleware
      },
      configureServer(server) {
        return () => {
          // Register API middleware (handles both body parsing and routing)
          server.middlewares.use(apiMiddleware);
        };
      }
    },
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
        copyDir('assets/images', 'dist/assets/images')
        copyDir('assets/css', 'dist/assets/css')
        
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
