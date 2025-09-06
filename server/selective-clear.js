import dotenv from 'dotenv';
import mongoose from 'mongoose';
import OrderModel from './models/order.model.js';
import AddressModel from './models/address.model.js';
import CartProductModel from './models/cartProduct.modal.js';
import MyListModel from './models/myList.modal.js';
import ReviewsModel from './models/reviews.model.js.js';

dotenv.config();

// Command line arguments
const args = process.argv.slice(2);
const collectionsToClear = args.length > 0 ? args : ['orders', 'addresses', 'cart', 'mylist', 'reviews'];

async function selectiveClear() {
    try {
        console.log('🗑️ Starting selective database cleanup...');
        console.log('Collections to clear:', collectionsToClear.join(', '));
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const results = {};
        
        // Clear Orders
        if (collectionsToClear.includes('orders')) {
            const count = await OrderModel.countDocuments();
            console.log(`\n📦 Orders: ${count} documents found`);
            if (count > 0) {
                const result = await OrderModel.deleteMany({});
                results.orders = result.deletedCount;
                console.log(`✅ Deleted ${result.deletedCount} orders`);
            } else {
                results.orders = 0;
                console.log('ℹ️ No orders to delete');
            }
        }
        
        // Clear Addresses
        if (collectionsToClear.includes('addresses')) {
            const count = await AddressModel.countDocuments();
            console.log(`\n📍 Addresses: ${count} documents found`);
            if (count > 0) {
                const result = await AddressModel.deleteMany({});
                results.addresses = result.deletedCount;
                console.log(`✅ Deleted ${result.deletedCount} addresses`);
            } else {
                results.addresses = 0;
                console.log('ℹ️ No addresses to delete');
            }
        }
        
        // Clear Cart Items
        if (collectionsToClear.includes('cart')) {
            const count = await CartProductModel.countDocuments();
            console.log(`\n🛒 Cart Items: ${count} documents found`);
            if (count > 0) {
                const result = await CartProductModel.deleteMany({});
                results.cart = result.deletedCount;
                console.log(`✅ Deleted ${result.deletedCount} cart items`);
            } else {
                results.cart = 0;
                console.log('ℹ️ No cart items to delete');
            }
        }
        
        // Clear My List Items
        if (collectionsToClear.includes('mylist')) {
            const count = await MyListModel.countDocuments();
            console.log(`\n❤️ My List Items: ${count} documents found`);
            if (count > 0) {
                const result = await MyListModel.deleteMany({});
                results.mylist = result.deletedCount;
                console.log(`✅ Deleted ${result.deletedCount} my list items`);
            } else {
                results.mylist = 0;
                console.log('ℹ️ No my list items to delete');
            }
        }
        
        // Clear Reviews
        if (collectionsToClear.includes('reviews')) {
            const count = await ReviewsModel.countDocuments();
            console.log(`\n⭐ Reviews: ${count} documents found`);
            if (count > 0) {
                const result = await ReviewsModel.deleteMany({});
                results.reviews = result.deletedCount;
                console.log(`✅ Deleted ${result.deletedCount} reviews`);
            } else {
                results.reviews = 0;
                console.log('ℹ️ No reviews to delete');
            }
        }
        
        console.log('\n📊 Summary:');
        console.log('=' .repeat(50));
        Object.entries(results).forEach(([collection, count]) => {
            console.log(`${collection}: ${count} documents deleted`);
        });
        console.log('=' .repeat(50));
        
        console.log('\n🎉 Selective cleanup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during selective cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

// Run the selective cleanup
selectiveClear();

