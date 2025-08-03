import mongoose from 'mongoose';
import UserModel from '../models/user.model.js';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database');
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Update phone numbers to include country code
const updatePhoneNumbers = async () => {
    try {
        console.log('Starting phone number migration...');
        
        // Find users with phone numbers that don't start with +
        const users = await UserModel.find({
            mobile: { $exists: true, $ne: null },
            $or: [
                { mobile: { $not: /^\+/ } }, // Doesn't start with +
                { mobile: { $regex: /^[0-9]{10}$/ } } // Exactly 10 digits (Indian format)
            ]
        });

        console.log(`Found ${users.length} users with phone numbers to update`);

        let updatedCount = 0;
        for (const user of users) {
            const originalPhone = user.mobile;
            
            // Format phone number
            let formattedPhone = originalPhone;
            if (!originalPhone.startsWith('+')) {
                // Remove leading zeros and add +91
                const cleanPhone = originalPhone.replace(/^0+/, '');
                formattedPhone = `+91${cleanPhone}`;
            }

            // Update user
            await UserModel.findByIdAndUpdate(user._id, {
                mobile: formattedPhone
            });

            console.log(`Updated user ${user._id}: ${originalPhone} -> ${formattedPhone}`);
            updatedCount++;
        }

        console.log(`Migration completed! Updated ${updatedCount} users.`);
        
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
    connectDB().then(() => {
        updatePhoneNumbers();
    });
}

export default updatePhoneNumbers; 