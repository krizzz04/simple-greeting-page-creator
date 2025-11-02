import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Check if Razorpay credentials are available
const hasRazorpayCredentials = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

// Initialize Razorpay instance only if credentials are available
let razorpay = null;

if (hasRazorpayCredentials) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log('✅ Razorpay initialized successfully');
    } catch (error) {
        console.error('❌ Razorpay initialization failed:', error.message);
        razorpay = null;
    }
} else {
    console.warn('⚠️ Razorpay credentials not found in environment variables');
    console.warn('   Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file');
    console.warn('   Razorpay payment capture will be disabled until credentials are added');
}

export default razorpay;
