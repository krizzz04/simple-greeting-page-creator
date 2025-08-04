# Firebase OAuth Domain Fix

## Problem
You're seeing this error:
```
The current domain is not authorized for OAuth operations. This will prevent signInWithPopup, signInWithRedirect, linkWithPopup and linkWithRedirect from working. Add your domain (roarofsouth.netlify.app) to the OAuth redirect domains list in the Firebase console -> Authentication -> Settings -> Authorized domains tab.
```

## Solution: Add Authorized Domains

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Sign in with your Google account
3. Select your project: `roarofsouth-56656`

### Step 2: Navigate to Authentication Settings
1. Click on **"Authentication"** in the left sidebar
2. Click on **"Settings"** tab
3. Scroll down to **"Authorized domains"** section

### Step 3: Add Your Domains
Click **"Add domain"** and add these domains one by one:

#### Production Domains:
- `roarofsouth.netlify.app`
- `maskshop.vercel.app`

#### Development Domains:
- `localhost`
- `127.0.0.1`

### Step 4: Save Changes
- Click **"Add"** for each domain
- The domains will appear in the list
- Changes are saved automatically

## What This Fixes

### ✅ Before (Broken):
- OAuth popup/redirect won't work
- Google sign-in fails
- Phone authentication may have issues
- Console shows OAuth domain warnings

### ✅ After (Fixed):
- OAuth popup/redirect works
- Google sign-in works properly
- Phone authentication works
- No more OAuth domain warnings

## Additional Firebase Settings

### Phone Authentication
Make sure Phone Authentication is enabled:
1. Go to **Authentication** → **Sign-in method**
2. Click on **"Phone"**
3. Enable it if not already enabled

### Google Sign-in
If you want Google sign-in:
1. Go to **Authentication** → **Sign-in method**
2. Click on **"Google"**
3. Enable it and configure

## Testing

After adding the domains:

1. **Clear browser cache**
2. **Refresh the page**
3. **Test authentication flows**:
   - Phone number login
   - Google sign-in (if enabled)
   - Email/password login

## Success Indicators

You should see:
- ✅ No OAuth domain warnings in console
- ✅ Authentication popups work
- ✅ Phone verification works
- ✅ No more "domain not authorized" errors

## Troubleshooting

### If Still Getting Errors:
1. **Wait a few minutes** - changes can take time to propagate
2. **Clear browser cache completely**
3. **Test in incognito/private mode**
4. **Check if domain is correctly added** in Firebase console

### Common Issues:
- **Domain format**: Make sure to add without `https://` or `http://`
- **Subdomains**: Add each subdomain separately if needed
- **Localhost**: Make sure `localhost` is added for development

## Security Note

Only add domains you own and control. Never add third-party domains to your Firebase authorized domains list. 