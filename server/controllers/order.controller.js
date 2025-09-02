import OrderModel from "../models/order.model.js";
import ProductModel from '../models/product.modal.js';
import UserModel from '../models/user.model.js';
import AddressModel from "../models/address.model.js";
import delhiveryService from "../config/delhiveryService.js";

export const createOrderController = async (request, response) => {
    console.log('\n🚀 === ORDER CREATION STARTED ===');
    console.log('📅 Time:', new Date().toISOString());
    console.log('📝 Request body keys:', Object.keys(request.body));
    
    try {
        // 1. Basic validation
        const { userId, products, totalAmt } = request.body;
        
        console.log('🔍 Validating required fields...');
        console.log('  - userId:', userId);
        console.log('  - products count:', products ? products.length : 'undefined');
        console.log('  - totalAmt:', totalAmt);
        
        if (!userId) {
            console.log('❌ Missing userId');
            return response.status(400).json({
                error: true,
                success: false,
                message: 'User ID is required'
            });
        }
        
        if (!products || !Array.isArray(products) || products.length === 0) {
            console.log('❌ Invalid products array');
            return response.status(400).json({
                error: true,
                success: false,
                message: 'Products array is required and cannot be empty'
            });
        }
        
        if (!totalAmt || totalAmt <= 0) {
            console.log('❌ Invalid total amount');
            return response.status(400).json({
                error: true,
                success: false,
                message: 'Valid total amount is required'
            });
        }
        
        console.log('✅ Basic validation passed');
        
        // 2. Create order data
        const orderData = {
            userId: userId,
            products: products,
            paymentId: request.body.paymentId || '',
            payment_status: request.body.payment_status || 'pending',
            delivery_address: request.body.delivery_address || null,
            totalAmt: totalAmt,
            date: request.body.date || new Date()
        };
        
        console.log('📦 Creating order...');
        
        // 3. Save to database
        const order = new OrderModel(orderData);
        const savedOrder = await order.save();
        
        console.log('💾 Order saved successfully! ID:', savedOrder._id);
        
        // 4. Update product inventory (with error handling)
        console.log('📦 Updating product inventory...');
        for (let i = 0; i < products.length; i++) {
            try {
                const productItem = products[i];
                const product = await ProductModel.findById(productItem.productId);
                
                if (product && productItem.quantity) {
                    const newStock = (product.countInStock || 0) - (productItem.quantity || 0);
                    const newSales = (product.sale || 0) + (productItem.quantity || 0);
                    
                    await ProductModel.findByIdAndUpdate(
                        productItem.productId,
                        {
                            countInStock: Math.max(0, newStock),
                            sale: newSales
                        },
                        { new: true }
                    );
                    
                    console.log(`  ✅ Updated product ${productItem.productId}: stock=${newStock}, sales=${newSales}`);
                } else {
                    console.log(`  ⚠️ Product ${productItem.productId} not found or no quantity specified`);
                }
            } catch (productError) {
                console.error(`  ❌ Failed to update product ${products[i].productId}:`, productError.message);
                // Continue with order creation even if product update fails
            }
        }
        
        // 5. Get user and address info (safely)
        let user = null;
        let deliveryAddress = null;
        
        console.log('👤 Fetching user and address info...');
        
        try {
            user = await UserModel.findById(userId);
            if (user) {
                console.log(`  ✅ User found: ${user.name} (${user.email})`);
            } else {
                console.log('  ⚠️ User not found');
            }
        } catch (userError) {
            console.warn('  ❌ User lookup failed:', userError.message);
        }
        
        try {
            if (request.body.delivery_address) {
                deliveryAddress = await AddressModel.findById(request.body.delivery_address);
                if (deliveryAddress) {
                    console.log(`  ✅ Address found: ${deliveryAddress.name} - ${deliveryAddress.city}`);
                } else {
                    console.log('  ⚠️ Address not found');
                }
            } else {
                console.log('  ℹ️ No delivery address ID provided');
            }
        } catch (addressError) {
            console.warn('  ❌ Address lookup failed:', addressError.message);
        }
        
        // 6. Determine customer info
        const customerName = deliveryAddress?.name || user?.name || 'Customer';
        const customerEmail = deliveryAddress?.email || 
                             (user?.email && !user.email.includes('.phone_user@mail') ? user.email : null);
        const customerPhone = deliveryAddress?.mobile || user?.mobile || null;
        
        console.log('👤 Customer info:', {
            name: customerName,
            email: customerEmail ? 'Present' : 'Not available',
            phone: customerPhone ? 'Present' : 'Not available'
        });
        
        // 7. IMPROVED Delhivery integration
        console.log('🚚 === DELHIVERY INTEGRATION START ===');
        let delhiveryResult = null;
        
        try {
            // Validate required fields for Delhivery
            if (!customerPhone) {
                console.log('⚠️ No phone number available - Delhivery requires phone number');
                throw new Error('Customer phone number is required for Delhivery integration');
            }
            
            if (!deliveryAddress || !deliveryAddress.pincode) {
                console.log('⚠️ No address or pincode available - Delhivery requires address');
                throw new Error('Delivery address with pincode is required for Delhivery integration');
            }
            
            // Prepare Delhivery order data with correct field mapping
            const delhiveryOrderData = {
                orderId: savedOrder._id.toString(),
                customerName: customerName,
                customerPhone: customerPhone.toString(),
                customerEmail: customerEmail,
                deliveryAddress: {
                    addressLine: deliveryAddress.address || deliveryAddress.addressLine || '',
                    area: deliveryAddress.area || '',
                    city: deliveryAddress.city || '',
                    state: deliveryAddress.state || '',
                    pincode: deliveryAddress.pincode.toString()
                },
                paymentMethod: request.body.payment_status === 'paid' ? 'online' : 'cod',
                totalAmount: totalAmt,
                products: products.map(product => ({
                    productId: product.productId,
                    productTitle: product.productTitle || product.name || 'Product',
                    quantity: product.quantity || 1,
                    price: product.price || 0,
                    weight: product.weight || 0.5 // Default weight in kg
                }))
            };
            
            console.log('🚚 Delhivery order data prepared:', JSON.stringify(delhiveryOrderData, null, 2));
            
            // Call Delhivery service
            delhiveryResult = await delhiveryService.createOrder(delhiveryOrderData);
            
            console.log('🚚 Delhivery result:', {
                success: delhiveryResult.success,
                fallback: delhiveryResult.fallback,
                waybill: delhiveryResult.waybill,
                error: delhiveryResult.error
            });
            
            // Update order with Delhivery info
            if (delhiveryResult.success) {
                await OrderModel.findByIdAndUpdate(savedOrder._id, {
                    delhiveryWaybill: delhiveryResult.waybill,
                    delhiveryTrackingUrl: delhiveryResult.trackingUrl,
                    shippingStatus: 'Order Created in Delhivery',
                    shippingDate: new Date(),
                    delhiveryResponse: delhiveryResult.response
                });
                console.log('✅ Delhivery integration successful:', delhiveryResult.waybill);
            } else if (delhiveryResult.fallback) {
                await OrderModel.findByIdAndUpdate(savedOrder._id, {
                    delhiveryWaybill: delhiveryResult.waybill,
                    shippingStatus: 'Pending - Delhivery API Unavailable',
                    shippingNote: delhiveryResult.error
                });
                console.log('⚠️ Using Delhivery fallback waybill:', delhiveryResult.waybill);
            } else {
                console.warn('❌ Delhivery integration failed:', delhiveryResult.error);
                await OrderModel.findByIdAndUpdate(savedOrder._id, {
                    shippingStatus: 'Failed - Manual Processing Required',
                    shippingNote: delhiveryResult.error
                });
            }
            
        } catch (delhiveryError) {
            console.error('❌ Delhivery error (creating fallback):', delhiveryError.message);
            
            // Create a fallback waybill even if Delhivery completely fails
            const fallbackWaybill = `FLB${Date.now()}${Math.floor(Math.random() * 1000)}`;
            await OrderModel.findByIdAndUpdate(savedOrder._id, {
                delhiveryWaybill: fallbackWaybill,
                shippingStatus: 'Pending - Manual Processing Required',
                shippingNote: delhiveryError.message
            });
            console.log('⚠️ Created fallback waybill:', fallbackWaybill);
        }
        
        console.log('🚚 === DELHIVERY INTEGRATION END ===');
        
        // 8. Try sending email (if possible)
        console.log('📧 Attempting to send confirmation email...');
        try {
            if (customerEmail) {
                // Dynamically import email functions
                const { default: OrderConfirmationEmail } = await import("../utils/orderEmailTemplate.js");
                const { default: sendEmailFun } = await import("../config/sendEmail.js");
                
                await sendEmailFun({
                    sendTo: [customerEmail],
                    subject: "Order Confirmation - RoarOfSouth",
                    text: "",
                    html: OrderConfirmationEmail(customerName, savedOrder)
                });
                console.log('  ✅ Confirmation email sent');
            } else {
                console.log('  ℹ️ No email address available for confirmation');
            }
        } catch (emailError) {
            console.warn('  ⚠️ Email sending failed (non-critical):', emailError.message);
        }
        
        // 9. Return success with Delhivery info
        console.log('🎉 Order creation completed successfully!');
        console.log('=== ORDER CREATION FINISHED ===\n');
        
        return response.status(200).json({
            error: false,
            success: true,
            message: "Order placed successfully",
            order: {
                _id: savedOrder._id,
                userId: savedOrder.userId,
                totalAmt: savedOrder.totalAmt,
                payment_status: savedOrder.payment_status,
                order_status: savedOrder.order_status,
                createdAt: savedOrder.createdAt
            },
            shipping: delhiveryResult ? {
                waybill: delhiveryResult.waybill,
                trackingUrl: delhiveryResult.trackingUrl,
                status: delhiveryResult.success ? 'Created' : 'Pending',
                delhiverySuccess: delhiveryResult.success
            } : null
        });
        
    } catch (error) {
        console.error('❌ ORDER CREATION FAILED:');
        console.error('❌ Error:', error.message);
        console.error('❌ Stack:', error.stack);
        console.log('=== ORDER CREATION FAILED ===\n');
        
        return response.status(500).json({
            error: true,
            success: false,
            message: 'Internal server error: ' + error.message,
            details: process.env.NODE_ENV === 'development' ? {
                error: error.message,
                stack: error.stack
            } : undefined
        });
    }
};

// Rest of your controller functions remain the same...
export const getOrderDetailsController = async (request, response) => {
    try {
        const { page = 1, limit = 10 } = request.query;
        
        const orders = await OrderModel.find()
            .sort({ createdAt: -1 })
            .populate('delivery_address userId')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await OrderModel.countDocuments();

        return response.json({
            message: "Order list",
            data: orders,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('❌ Get orders error:', error);
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

export const getUserOrderDetailsController = async (request, response) => {
    try {
        const userId = request.userId;
        const { page = 1, limit = 10 } = request.query;

        const orders = await OrderModel.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate('delivery_address userId')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await OrderModel.countDocuments({ userId: userId });

        return response.json({
            message: "User orders",
            data: orders,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('❌ Get user orders error:', error);
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

export const getTotalOrdersCountController = async (request, response) => {
    try {
        const count = await OrderModel.countDocuments();
        return response.json({
            error: false,
            success: true,
            count: count
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

export const updateOrderStatusController = async (request, response) => {
    try {
        const { id, order_status } = request.body;
        
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            id,
            { order_status: order_status },
            { new: true }
        );

        return response.json({
            message: "Order status updated",
            success: true,
            error: false,
            data: updatedOrder
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

export const deleteOrder = async (request, response) => {
    try {
        const order = await OrderModel.findById(request.params.id);
        
        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        await OrderModel.findByIdAndDelete(request.params.id);

        return response.json({
            success: true,
            error: false,
            message: "Order deleted"
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

// Simplified implementations for other functions
export const totalSalesController = async (request, response) => {
    try {
        const orders = await OrderModel.find();
        const total = orders.reduce((sum, order) => sum + (order.totalAmt || 0), 0);
        
        return response.json({
            totalSales: total,
            monthlySales: [],
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

export const totalUsersController = async (request, response) => {
    try {
        return response.json({
            TotalUsers: [],
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
};

export const createOrderPaypalController = async (request, response) => {
    return response.status(501).json({
        message: "PayPal temporarily unavailable",
        error: true,
        success: false
    });
};

export const captureOrderPaypalController = async (request, response) => {
    return response.status(501).json({
        message: "PayPal temporarily unavailable", 
        error: true,
        success: false
    });
};
