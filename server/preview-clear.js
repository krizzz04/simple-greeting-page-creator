import dotenv from 'dotenv';
import mongoose from 'mongoose';
import OrderModel from './models/order.model.js';
import AddressModel from './models/address.model.js';
import CartProductModel from './models/cartProduct.modal.js';
import MyListModel from './models/myList.modal.js';
import ReviewsModel from './models/reviews.model.js.js';

dotenv.config();

async function previewClear() {
    try {
        console.log('👀 Previewing database cleanup (NO DELETION PERFORMED)...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Get counts and sample data
        const ordersCount = await OrderModel.countDocuments();
        const addressesCount = await AddressModel.countDocuments();
        const cartCount = await CartProductModel.countDocuments();
        const myListCount = await MyListModel.countDocuments();
        const reviewsCount = await ReviewsModel.countDocuments();
        
        console.log('\n📊 Collections Overview:');
        console.log('=' .repeat(60));
        console.log(`📦 Orders: ${ordersCount} documents`);
        console.log(`📍 Addresses: ${addressesCount} documents`);
        console.log(`🛒 Cart Items: ${cartCount} documents`);
        console.log(`❤️ My List Items: ${myListCount} documents`);
        console.log(`⭐ Reviews: ${reviewsCount} documents`);
        console.log('=' .repeat(60));
        
        // Show sample data from each collection
        if (ordersCount > 0) {
            console.log('\n📦 Sample Orders:');
            const sampleOrders = await OrderModel.find().limit(3).select('_id userId totalAmt createdAt');
            sampleOrders.forEach(order => {
                console.log(`  - ${order._id} | User: ${order.userId} | Amount: ₹${order.totalAmt} | Date: ${order.createdAt}`);
            });
        }
        
        if (addressesCount > 0) {
            console.log('\n📍 Sample Addresses:');
            const sampleAddresses = await AddressModel.find().limit(3).select('_id name city pincode');
            sampleAddresses.forEach(address => {
                console.log(`  - ${address._id} | ${address.name} | ${address.city} - ${address.pincode}`);
            });
        }
        
        if (cartCount > 0) {
            console.log('\n🛒 Sample Cart Items:');
            const sampleCart = await CartProductModel.find().limit(3).select('_id productTitle quantity userId');
            sampleCart.forEach(item => {
                console.log(`  - ${item._id} | ${item.productTitle} | Qty: ${item.quantity} | User: ${item.userId}`);
            });
        }
        
        if (myListCount > 0) {
            console.log('\n❤️ Sample My List Items:');
            const sampleMyList = await MyListModel.find().limit(3).select('_id productTitle userId');
            sampleMyList.forEach(item => {
                console.log(`  - ${item._id} | ${item.productTitle} | User: ${item.userId}`);
            });
        }
        
        if (reviewsCount > 0) {
            console.log('\n⭐ Sample Reviews:');
            const sampleReviews = await ReviewsModel.find().limit(3).select('_id userName rating productId');
            sampleReviews.forEach(review => {
                console.log(`  - ${review._id} | ${review.userName} | Rating: ${review.rating}/5 | Product: ${review.productId}`);
            });
        }
        
        console.log('\n⚠️ This is a PREVIEW only. No data has been deleted.');
        console.log('To actually delete the data, run: node clear-database.js');
        
    } catch (error) {
        console.error('❌ Error during preview:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

// Run the preview
previewClear();

