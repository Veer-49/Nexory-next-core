# Password Protection Setup

## How to Secure Your Password (Works on Vercel, Google Cloud, and Any Node.js Hosting)

This system uses a **backend API** to verify passwords. The password is stored securely on the server (NOT in your code).

### Steps to Deploy:

#### **Step 1: Push Code to GitHub**
```bash
git add .
git commit -m "Add secure password protection with API"
git push origin main
```

#### **Step 2: On Vercel Dashboard**

1. Go to your project settings
2. Go to **Settings > Environment Variables**
3. Add a new variable:
   - **Name:** `BILLING_PASSWORD`
   - **Value:** `your_secret_password_here`
4. Click "Save"

#### **Step 3: Redeploy**

1. Go to **Deployments**
2. Click the three dots on the latest deployment
3. Select "Redeploy"

### How It Works:

- ✅ Password is stored in Vercel environment (NOT visible to users)
- ✅ Frontend sends password to `/api/auth` endpoint
- ✅ Backend verifies and returns a token
- ✅ Token stored in browser localStorage for session
- ✅ User can't see the actual password in source code

### For Google Cloud or Other Hosting:

The API function stored in `/api/auth.js` is a standard Node.js function that works on:
- Vercel
- Google Cloud Functions
- Netlify Functions
- AWS Lambda
- Any Node.js hosting

Just set your `BILLING_PASSWORD` environment variable on your hosting platform.

### Default Password:

If not set, it defaults to `billing123` (change this immediately!)

### To Change Password Later:

Just update the environment variable in your hosting dashboard and redeploy.

---

**Security Benefits:**
- Password never exposed in source code
- Works offline (no third-party services)
- Token expires after 24 hours
- Can change password anytime without code changes
- Works on any platform that supports Node.js functions
