# 🚀 Quick Razorpay Setup

## The Error You're Seeing
```
Error: `key_id` or `oauthToken` is mandatory
```

This happens because Razorpay credentials are missing from your environment variables.

## ✅ Fixed!
I've updated the code to handle missing credentials gracefully. Your server will now start even without Razorpay credentials, but payment capture won't work until you add them.

## 🔧 To Enable Payment Capture:

### 1. Add to your `server/.env` file:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### 2. Get your Razorpay credentials:
- Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Go to Settings → API Keys
- Copy your Key ID and Key Secret

### 3. Restart your server:
```bash
cd server
npm start
```

## 🎯 What Happens Now:

### Without Credentials (Current):
- ✅ Server starts successfully
- ⚠️ Razorpay payments won't be captured (stay "authorized")
- ✅ Orders still get created
- ⚠️ You'll see warnings in console

### With Credentials (After setup):
- ✅ Server starts successfully
- ✅ Razorpay payments get captured automatically
- ✅ Payments show as "captured" in Razorpay dashboard
- ✅ Orders created with capture IDs

## 🧪 Test It:
1. Start server without credentials → Should work
2. Add credentials → Restart server
3. Make a test payment → Should capture automatically

The fix is ready - just add your Razorpay credentials when you're ready to enable payment capture!
