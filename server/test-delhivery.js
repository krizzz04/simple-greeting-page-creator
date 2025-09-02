import dotenv from 'dotenv';
dotenv.config();

import delhiveryService from './config/delhiveryService.js';

console.log('🧪 Testing Delhivery Integration...');
console.log('🔧 Environment Variables:');
console.log('- DELHIVERY_MODE:', process.env.DELHIVERY_MODE);
console.log('- DELHIVERY_API_KEY:', process.env.DELHIVERY_API_KEY ? `${process.env.DELHIVERY_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log('- DELHIVERY_TEST_MODE:', process.env.DELHIVERY_TEST_MODE);

async function testDelhivery() {
    try {
        console.log('\n🚚 Testing Delhivery API connection...');
        const connectionTest = await delhiveryService.testConnection();
        console.log('Connection test result:', connectionTest);

        console.log('\n📦 Testing order creation...');
        const testOrderData = {
            orderId: 'TEST_' + Date.now(),
            customerName: 'Test Customer',
            customerPhone: '9876543210',
            customerEmail: 'test@example.com',
            deliveryAddress: {
                addressLine: 'Test Address Line 1',
                area: 'Test Area',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001'
            },
            paymentMethod: 'cod',
            totalAmount: 1000,
            products: [{
                productId: 'TEST_PRODUCT_1',
                productTitle: 'Test Product',
                quantity: 1,
                price: 1000,
                weight: 0.5
            }]
        };

        const orderResult = await delhiveryService.createOrder(testOrderData);
        console.log('Order creation result:', orderResult);

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testDelhivery();
