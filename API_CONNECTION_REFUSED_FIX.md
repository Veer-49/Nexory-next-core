# Form Submission Error Fix Report

## Error Identified
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
TypeError: Failed to fetch
```

## Root Cause Analysis

The error occurred because the **Vite dev server middleware was hanging/crashing** when trying to parse the request body, causing the connection to be refused before the API handler could respond.

### The Problem Breakdown:

```javascript
// BROKEN CODE - This was causing the hang
function jsonBodyParser(req, res, next) {
  // This middleware was separate from apiMiddleware
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    next(); // Problem: next is called HERE
  });
}

// Then apiMiddleware was registered after
function apiMiddleware(req, res, next) {
  // Handle API routes
  // Problem: By the time this middleware ran, 
  // the request stream was already consumed and ended
}

// In plugin:
server.middlewares.use(jsonBodyParser);  // Run first
server.middlewares.use(apiMiddleware);   // Run second (too late!)
```

**What was happening:**
1. Request arrives → jsonBodyParser starts reading stream
2. jsonBodyParser waits for 'end' event
3. When 'end' fires → calls next() → passes to apiMiddleware
4. **BUT**: The request stream is now consumed and closed
5. apiMiddleware couldn't re-read the body or read from the closed stream
6. The request handler would hang indefinitely
7. Browser times out → "ERR_CONNECTION_REFUSED"

## Solution Implemented

**Integrated body parsing directly into the API middleware** so that:
1. The middleware detects it's an API request
2. Immediately reads the body stream if needed
3. Parses it once
4. Calls the handler with the parsed body
5. No stream re-consumption issues

```javascript
// FIXED CODE - Integrated approach
function apiMiddleware(req, res, next) {
  if (req.url.startsWith('/api/')) {
    if (route === '/api/submit-form' && req.method === 'POST') {
      // Parse body BEFORE calling handler
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        // Parse based on content-type
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          req.body = body ? JSON.parse(body) : {};
        }
        
        // NOW call the handler with parsed body
        import('./api/submit-form.js').then(module => {
          handler(req, res);
        });
      });
      return; // IMPORTANT: Don't call next()
    }
  }
  
  next(); // Only call next for non-API routes
}

// In plugin:
server.middlewares.use(apiMiddleware); // Single middleware handles all
```

## Files Fixed

### 1. `/vite.config.js`
**Changes:**
- ❌ Removed separate `jsonBodyParser` middleware function
- ✅ Moved body parsing into `apiMiddleware`
- ✅ Body is now parsed before the handler is called
- ✅ Added error handlers for stream errors
- ✅ Added payload size limit (1MB) to prevent DoS
- ✅ Simplified plugin configuration

### 2. `/api/submit-form.js`
**Changes:**
- ✅ Simplified to assume `req.body` is already parsed
- ✅ Removed redundant body parsing logic
- ✅ Added debugging logs to show body type and content
- ✅ Better error responses with proper headers

## How It Works Now

### Request Flow (FIXED)
```
Browser sends POST to /api/submit-form
         ↓
apiMiddleware detects API route
         ↓
Reads request stream in full
         ↓
Parses JSON body
         ↓
Sets req.body = parsed JSON
         ↓
Loads submit-form handler
         ↓
Handler processes req.body (already parsed)
         ↓
Sends response back to browser
         ↓
✅ Success! Form submitted to Google Sheets
         ↓✅ Also falls back to EmailJS/Gmail if needed
```

## Testing Steps

1. **Check Server is Running:**
   ```
   Terminal should show: VITE v7.3.0 ready in XXXX ms
   Local: http://localhost:3000/
   ```

2. **Open Browser Console:**
   - Go to http://localhost:3000/
   - Press F12 → Console tab
   - Keep it open while testing

3. **Fill and Submit Contact Form:**
   - Click "Get in Touch" button
   - Fill out the form
   - Click Submit
   - Watch the console for logs:
     ```
     Submitting to backend API: {...}
     Request body type: object
     Request body: {name: "...", email: "...", ...}
     Backend API response status: 200
     Form submission successful: {success: true, ...}
     ✓ Message Sent!
     ```

4. **Verify No Errors:**
   - Should see ✅ "Form submission successful"
   - Should NOT see ❌ "net::ERR_CONNECTION_REFUSED"
   - Should NOT see ❌ "Failed to fetch"

5. **Check Google Sheets:**
   - Your submission should appear in the Google Sheet
   - Check the timestamp

6. **Check Gmail:**
   - Check the email account configured in EmailJS
   - You should receive the form submission email

## Common Signs the Fix Worked

✅ **Good Signs:**
- Console shows: `Form submission successful`
- New row appears in Google Sheets
- Email received in Gmail inbox
- "✓ Message Sent!" message appears
- No red errors in console

❌ **Bad Signs (Would indicate remaining issues):**
- `net::ERR_CONNECTION_REFUSED` - Middleware still hanging
- `Failed to fetch` - Connection refused
- `Missing required fields` - Body parsing issue
- `Request timeout` - Google Sheets is slow

## Rollback Instructions (If Needed)

If any new issues appear after this fix:

```bash
cd "e:\Git hub\web"
git diff api/submit-form.js vite.config.js  # Review changes
git checkout -- vite.config.js              # Revert vite config
git checkout -- api/submit-form.js          # Revert submit-form
npm run dev                                 # Restart with old code
```

## Important Notes

1. **This fix is for development (npm run dev)**
   - Vercel deployment uses different code path
   - Vercel has its own serverless runtime with built-in body parsing
   - The logic in `/api/submit-form.js` handle both scenarios

2. **The body is now parsed at the right time**
   - Before calling the handler (in middleware)
   - Stream consumed once (no double-consumption issues)
   - Proper error handling for malformed JSON

3. **Stream errors are handled**
   - Large payloads rejected (>1MB)
   - Malformed requests get proper error responses
   - Timeouts/disconnects are logged

## Debugging if Issues Persist

Add this to browser console to test API directly:
```javascript
fetch('/api/submit-form', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test',
    email: 'test@test.com',
    phone: '',
    service: '',
    message: 'Test message'
  })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e))
```

If this works and shows success, the backend is fixed.
If it still shows connection refused, check:
- Is the dev server actually running?
- Are there console errors in the Vite terminal window?
- Did you restart the server after the code changes?

## Summary

The "net::ERR_CONNECTION_REFUSED" with "Failed to fetch" was caused by **improper request stream handling in the middleware pipeline**. The fix **integrates body parsing directly into the API middleware** so the stream is consumed exactly once at the right time, eliminating hangs and timeouts.

**Expected Result:** Forms now submit successfully to both Google Sheets and Gmail without any "connection refused" errors.
