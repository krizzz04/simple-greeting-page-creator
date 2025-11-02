# Razorpay Payment Capture Setup

## Problem Fixed
Previously, Razorpay payments were showing as "authorized" but not "captured" in the Razorpay dashboard. This has been fixed by implementing proper payment capture functionality.

## What Was Added

### 1. Razorpay Node.js SDK
- Added `razorpay: ^2.9.2` to `server/package.json`

### 2. Razorpay Configuration
- Created `server/config/razorpay.js` for Razorpay initialization
- Added proper error handling for missing credentials

### 3. Payment Capture Logic
- Modified `server/controllers/order.controller.js` to capture payments
- Added `captureRazorpayPayment()` helper function
- Integrated capture logic into order creation flow

### 4. Database Schema Update
- Added `razorpayCaptureId` field to order model
- Stores the capture ID for reference

## Environment Variables Required

Add these to your `server/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## How It Works Now

1. **User pays with Razorpay** → Payment gets authorized
2. **Frontend calls `/api/order/create`** → With paymentId and payment_status: "COMPLETED"
3. **Server captures payment** → Calls Razorpay capture API
4. **Payment becomes captured** → Shows as "captured" in Razorpay dashboard
5. **Order is created** → With capture ID stored

## Installation

1. Install the new dependency:
```bash
cd server
npm install
```

2. Add Razorpay credentials to your `.env` file

3. Restart your server

## Testing

After setup, test a payment:
1. Make a test payment with Razorpay
2. Check Razorpay dashboard - payment should show as "captured"
3. Check order in database - should have `razorpayCaptureId` field populated

## Error Handling

- If capture fails, order creation is aborted
- Proper error messages are returned to frontend
- All errors are logged for debugging
