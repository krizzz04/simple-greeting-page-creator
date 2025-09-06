import dotenv from 'dotenv';
import mongoose from 'mongoose';
import OrderModel from './models/order.model.js';
import AddressModel from './models/address.model.js';
import CartProductModel from './models/cartProduct.modal.js';
import MyListModel from './models/myList.modal.js';
import ReviewsModel from './models/reviews.model.js.js';

dotenv.config();

async function clearDatabase() {
    try {
        console.log('🗑️ Starting database cleanup...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Get counts before deletion
        const ordersCount = await OrderModel.countDocuments();
        const addressesCount = await AddressModel.countDocuments();
        const cartCount = await CartProductModel.countDocuments();
        const myListCount = await MyListModel.countDocuments();
        const reviewsCount = await ReviewsModel.countDocuments();
        
        console.log('\n📊 Current Collection Counts:');
        console.log('=' .repeat(50));
        console.log(`Orders: ${ordersCount}`);
        console.log(`Addresses: ${addressesCount}`);
        console.log(`Cart Items: ${cartCount}`);
        console.log(`My List Items: ${myListCount}`);
        console.log(`Reviews: ${reviewsCount}`);
        console.log('=' .repeat(50));
        
        // Confirmation prompt
        console.log('\n⚠️ WARNING: This will permanently delete ALL data from the above collections!');
        console.log('This action cannot be undone.');
        
        // In a real scenario, you might want to add a confirmation prompt here
        // For now, we'll proceed with the deletion
        
        console.log('\n🗑️ Starting deletion process...');
        
        // Delete all documents from each collection
        const results = await Promise.all([
            OrderModel.deleteMany({}),
            AddressModel.deleteMany({}),
            CartProductModel.deleteMany({}),
            MyListModel.deleteMany({}),
            ReviewsModel.deleteMany({})
        ]);
        
        console.log('\n✅ Deletion Results:');
        console.log('=' .repeat(50));
        console.log(`Orders deleted: ${results[0].deletedCount}`);
        console.log(`Addresses deleted: ${results[1].deletedCount}`);
        console.log(`Cart items deleted: ${results[2].deletedCount}`);
        console.log(`My list items deleted: ${results[3].deletedCount}`);
        console.log(`Reviews deleted: ${results[4].deletedCount}`);
        console.log('=' .repeat(50));
        
        // Verify deletion
        const finalOrdersCount = await OrderModel.countDocuments();
        const finalAddressesCount = await AddressModel.countDocuments();
        const finalCartCount = await CartProductModel.countDocuments();
        const finalMyListCount = await MyListModel.countDocuments();
        const finalReviewsCount = await ReviewsModel.countDocuments();
        
        console.log('\n🔍 Verification - Final Counts:');
        console.log('=' .repeat(50));
        console.log(`Orders: ${finalOrdersCount}`);
        console.log(`Addresses: ${finalAddressesCount}`);
        console.log(`Cart Items: ${finalCartCount}`);
        console.log(`My List Items: ${finalMyListCount}`);
        console.log(`Reviews: ${finalReviewsCount}`);
        console.log('=' .repeat(50));
        
        if (finalOrdersCount === 0 && finalAddressesCount === 0 && 
            finalCartCount === 0 && finalMyListCount === 0 && finalReviewsCount === 0) {
            console.log('\n🎉 Database cleanup completed successfully!');
            console.log('All specified collections have been cleared.');
        } else {
            console.log('\n⚠️ Some collections may not have been fully cleared.');
        }
        
    } catch (error) {
        console.error('❌ Error during database cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

// Run the cleanup
clearDatabase();

