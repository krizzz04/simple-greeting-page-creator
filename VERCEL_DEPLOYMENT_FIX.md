# Vercel Deployment Fix Guide

## Issue: Blank Page on maskshop.vercel.app

The blank page issue is likely caused by missing environment variables and configuration problems. Here's how to fix it:

## 1. Environment Variables Setup

You need to add these environment variables in your Vercel project settings:

### Go to Vercel Dashboard:
1. Navigate to your project on Vercel
2. Go to Settings → Environment Variables
3. Add the following variables:

### Required Environment Variables:

```
VITE_API_URL=https://your-backend-domain.com
VITE_FIREBASE_APP_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_APP_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_APP_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_APP_ID=your_app_id
VITE_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
VITE_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Important Notes:
- Replace `https://your-backend-domain.com` with your actual backend API URL
- Make sure all Firebase variables are properly set
- Set these for all environments (Production, Preview, Development)

## 2. Backend API Configuration

Make sure your backend is deployed and accessible. The API URL should point to your live backend, not localhost.

## 3. Firebase Configuration

Ensure your Firebase project is properly configured:
1. Go to Firebase Console
2. Select your project
3. Go to Project Settings → General
4. Copy the configuration values

## 4. Build Configuration

The project now includes:
- Updated `vite.config.js` with proper build settings
- `vercel.json` for deployment configuration
- Error handling in Firebase initialization
- Better API error handling

## 5. Deployment Steps

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment issues"
   git push
   ```

2. **Redeploy on Vercel:**
   - Go to your Vercel dashboard
   - Trigger a new deployment
   - Or push to your main branch to auto-deploy

## 6. Debugging Steps

If you still see a blank page:

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check Vercel Logs:**
   - Go to your Vercel project
   - Check the deployment logs for build errors

3. **Verify Environment Variables:**
   - Make sure all variables are set correctly
   - Check for typos in variable names

## 7. Common Issues and Solutions

### Issue: "Cannot read property of undefined"
- **Solution:** Check if all environment variables are set

### Issue: API calls failing
- **Solution:** Verify VITE_API_URL points to your live backend

### Issue: Firebase initialization errors
- **Solution:** Ensure all Firebase environment variables are correct

### Issue: Build fails
- **Solution:** Check Vercel build logs for specific error messages

## 8. Testing Locally

Before deploying, test locally:
```bash
npm run build
npm run preview
```

This will help identify any build issues before deployment.

## 9. Additional Configuration

The project now includes:
- Error boundaries to prevent crashes
- Fallback values for missing environment variables
- Better error handling in API calls
- Proper routing configuration for SPA

## 10. Support

If issues persist:
1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure your backend API is accessible
4. Check Vercel deployment logs for build errors 