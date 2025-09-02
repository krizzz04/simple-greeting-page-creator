import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Environment Variables Check:');
console.log('================================');
console.log('DELHIVERY_MODE:', process.env.DELHIVERY_MODE);
console.log('DELHIVERY_API_KEY:', process.env.DELHIVERY_API_KEY ? 'SET' : 'NOT SET');
console.log('DELHIVERY_TEST_MODE:', process.env.DELHIVERY_TEST_MODE);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EMAIL:', process.env.EMAIL ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('================================');
