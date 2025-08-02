# Vercel Deployment Guide

## Overview

This guide helps resolve the common 404 error issue when refreshing pages on Vercel-hosted React applications.

## Problem

When you refresh the page on routes like `/login`, `/register`, `/checkout`, etc., you get a 404 "Not Found" error. This happens because:

- Vercel looks for a file at that path on the server
- React Router handles routing on the client-side
- The server doesn't know about client-side routes

## Solution

### 1. Vercel Configuration (`vercel.json`)

The `vercel.json` file in the root directory handles client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2. Redirects File (`public/_redirects`)

Backup solution for handling routes:

```
/*    /index.html   200
```

### 3. Updated Vite Configuration

Enhanced build configuration for better performance:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  preview: {
    port: 8080
  }
})
```

## Deployment Steps

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Add Vercel configuration for SPA routing"
git push origin main
```

### 2. Deploy to Vercel

- **Automatic Deployment**: If connected to GitHub, Vercel will automatically deploy
- **Manual Deployment**: Use Vercel CLI or dashboard

### 3. Verify Configuration

After deployment, test these scenarios:

- ✅ **Direct URL Access**: `https://maskshop.vercel.app/login`
- ✅ **Page Refresh**: Refresh on any route
- ✅ **Browser Navigation**: Back/forward buttons
- ✅ **Deep Linking**: Direct access to any route

## Testing Checklist

### ✅ Route Testing:
- [ ] `/` - Home page
- [ ] `/login` - Login page
- [ ] `/register` - Register page
- [ ] `/checkout` - Checkout page
- [ ] `/product/[id]` - Product details
- [ ] `/my-account` - User account
- [ ] `/cart` - Shopping cart
- [ ] `/orders` - Order history

### ✅ Functionality Testing:
- [ ] Page refresh works on all routes
- [ ] Direct URL access works
- [ ] Browser back/forward buttons work
- [ ] Deep linking works
- [ ] No 404 errors on refresh

## Troubleshooting

### If Still Getting 404 Errors:

1. **Check Vercel Dashboard**:
   - Go to your project in Vercel
   - Check "Functions" tab for any errors
   - Verify deployment status

2. **Clear Cache**:
   - Clear browser cache
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)

3. **Check Build Logs**:
   - Review Vercel build logs
   - Ensure `vercel.json` is being read

4. **Alternative Solution**:
   If `vercel.json` doesn't work, try adding this to your `package.json`:

   ```json
   {
     "vercel": {
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

## Environment Variables

Make sure to set these in Vercel dashboard:

### Frontend Variables:
```env
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_APP_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_APP_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_APP_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_APP_ID=your_app_id
VITE_APP_RAZORPAY_KEY_ID=your_razorpay_key
VITE_APP_RAZORPAY_KEY_SECRET=your_razorpay_secret
VITE_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Twilio Variables (if using):
```env
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number
VITE_TWILIO_WHATSAPP_FROM=your_twilio_whatsapp_number
VITE_TWILIO_CONTENT_SID=your_twilio_content_sid
```

## Performance Optimization

### 1. Code Splitting
The updated Vite config includes manual chunks for better performance.

### 2. Caching
Static assets are cached for 1 year for better performance.

### 3. Security Headers
Added security headers for better protection.

## Support

If you continue to experience issues:

1. **Check Vercel Documentation**: https://vercel.com/docs
2. **Review Build Logs**: Look for any errors in deployment
3. **Test Locally**: Ensure it works with `npm run build && npm run preview`
4. **Contact Vercel Support**: If configuration issues persist

## Success Indicators

After successful deployment, you should see:

- ✅ No 404 errors on page refresh
- ✅ Direct URL access works for all routes
- ✅ Smooth navigation between pages
- ✅ All functionality working as expected 