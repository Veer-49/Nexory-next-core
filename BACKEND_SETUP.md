# Backend API Setup Guide

Your contact form now uses a backend server to handle submissions to both Google Sheets and Email. This eliminates CORS issues and improves security.

## Installation

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- `express` - Backend server framework
- `cors` - Handle cross-origin requests
- `nodemailer` - Send emails via Gmail
- `node-fetch` - Make HTTP requests to Google Sheets
- `concurrently` - Run multiple services at once

### 2. Configure Environment Variables

Create a `.env` file in the root directory with your credentials:

```env
PORT=3001

# Option A: Gmail (Recommended)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Option B: EmailJS (Fallback)
EMAILJS_API_KEY=your-emailjs-api-key
```

#### For Gmail Setup:
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sign in and select:
   - **App**: Mail
   - **Device**: Windows/Mac/Linux
3. Copy the generated 16-character password
4. Paste it in `.env` as `GMAIL_PASSWORD`

#### For EmailJS Setup (Optional):
1. Get your API key from [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Add it to `.env` as `EMAILJS_API_KEY`

## Running the Application

### Development Mode (Both Backend & Frontend)
```bash
npm run dev:full
```

This will start:
- ✅ Backend API on `http://localhost:3001`
- ✅ Frontend (Vite) on `http://localhost:3000`

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
npm run dev
```

## How It Works

### 1. Form Submission Flow
```
User Form (Frontend)
        ↓
     POST http://localhost:3001/api/contact
        ↓
     Backend Server (Express)
        ↓
     ├→ Google Sheets API (Appends data)
     └→ Email Service
        ├→ Business Email (Gmail/EmailJS)
        └→ Auto-reply to Customer
        ↓
     Success Response to Frontend
```

### 2. Backend Endpoints

#### Health Check
```
GET http://localhost:3001/health
```
Returns: `{ status: 'Backend server is running' }`

#### Submit Contact Form
```
POST http://localhost:3001/api/contact
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "service": "web-development",
  "message": "I need a new website"
}

Response:
{
  "success": true,
  "message": "Your message has been submitted successfully!",
  "details": {
    "googleSheets": { "success": true, "data": {...} },
    "email": { "success": true, "data": {...} }
  }
}
```

## Troubleshooting

### CORS Error Still Occurs
- Make sure backend is running on port 3001
- Frontend should POST to `http://localhost:3001/api/contact`
- Check browser console for error messages

### Emails Not Sending
**Option 1: Gmail**
- Verify the 16-character App Password is correct
- Check "Allow less secure apps" is enabled
- Verify email address in `GMAIL_USER` is correct

**Option 2: EmailJS**
- Verify API key is correct
- Check EmailJS account has remaining credits
- Test at [EmailJS Dashboard](https://dashboard.emailjs.com/)

### Google Sheets Not Updating
- Verify Google Apps Script URL in `server.js`
- Ensure script has CORS headers
- Check script is deployed as "Web app" with "Execute as: Me"
- Check Google Sheet is accessible

## Security Notes

✅ All sensitive credentials are stored in `.env` (not committed to Git)
✅ CORS is enabled for development (can be restricted in production)
✅ Email addresses are validated server-side
✅ Input sanitization helps prevent injection attacks

## Production Deployment

When deploying to production:

1. **Update Frontend URL**
   - Change `BACKEND_API_URL` in `contact-overlay.js` to your production domain
   - Example: `https://api.yoursite.com/api/contact`

2. **Update Backend URL**
   - Deploy backend to your server
   - Update CORS settings to allow only your domain
   - Keep `.env` secrets secure (never commit)

3. **Frontend Changes**
```javascript
// In contact-overlay.js
const BACKEND_API_URL = 'https://api.yoursite.com/api/contact';
```

4. **Backend Deployment**
```bash
npm install
npm run build  # if using build process
npm run server  # start the server
```

## Support
For issues or questions, check the console logs while running `npm run dev:full`
