// MongoDB Shell Script to Clear Collections
// Run this in MongoDB Compass or MongoDB shell

// Connect to your database (replace 'your-database-name' with actual database name)
use your-database-name;

// Clear all collections
db.orders.deleteMany({});
db.addresses.deleteMany({});
db.cartproducts.deleteMany({});
db.mylists.deleteMany({});
db.reviews.deleteMany({});

// Verify deletion
print("Orders count:", db.orders.countDocuments());
print("Addresses count:", db.addresses.countDocuments());
print("Cart products count:", db.cartproducts.countDocuments());
print("My lists count:", db.mylists.countDocuments());
print("Reviews count:", db.reviews.countDocuments());

print("✅ All collections cleared successfully!");

