import { Router } from "express";
import auth from "../middlewares/auth.js";
import { 
    captureOrderPaypalController, 
    createOrderController, 
    createOrderPaypalController, 
    deleteOrder, 
    getOrderDetailsController, 
    getTotalOrdersCountController, 
    getUserOrderDetailsController, 
    totalSalesController, 
    totalUsersController, 
    updateOrderStatusController 
} from "../controllers/order.controller.js";

const orderRouter = Router();

// Existing routes
orderRouter.post('/create', auth, createOrderController);
orderRouter.get("/order-list", auth, getOrderDetailsController);
orderRouter.get('/create-order-paypal', auth, createOrderPaypalController);
orderRouter.post('/capture-order-paypal', auth, captureOrderPaypalController);
orderRouter.put('/order-status/:id', auth, updateOrderStatusController);
orderRouter.get('/count', auth, getTotalOrdersCountController);
orderRouter.get('/sales', auth, totalSalesController);
orderRouter.get('/users', auth, totalUsersController);
orderRouter.get('/order-list/orders', auth, getUserOrderDetailsController);
orderRouter.delete('/deleteOrder/:id', auth, deleteOrder);

// 🚚 Delhivery Tracking Route
orderRouter.get('/track/:waybill', async (req, res) => {
    try {
        const { waybill } = req.params;
        
        console.log('🔍 Tracking request for waybill:', waybill);
        
        // Import delhiveryService here to avoid circular dependency
        const delhiveryService = (await import('../config/delhiveryService.js')).default;
        
        const trackingResult = await delhiveryService.trackOrder(waybill);
        
        if (trackingResult.success) {
            res.json({
                success: true,
                data: trackingResult.data
            });
        } else {
            res.status(400).json({
                success: false,
                error: trackingResult.error
            });
        }
    } catch (error) {
        console.error('❌ Tracking error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 🚚 Get Shipping Rates Route
orderRouter.get('/shipping-rates/:fromPin/:toPin', async (req, res) => {
    try {
        const { fromPin, toPin } = req.params;
        const { weight = 1, codAmount = 0 } = req.query;
        
        console.log('💰 Shipping rates request:', { fromPin, toPin, weight, codAmount });
        
        // Import delhiveryService here to avoid circular dependency
        const delhiveryService = (await import('../config/delhiveryService.js')).default;
        
        const ratesResult = await delhiveryService.getShippingRates(fromPin, toPin, weight, codAmount);
        
        if (ratesResult.success) {
            res.json({
                success: true,
                data: ratesResult.rates
            });
        } else {
            res.status(400).json({
                success: false,
                error: ratesResult.error
            });
        }
    } catch (error) {
        console.error('❌ Shipping rates error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 🚚 Manual Delhivery Integration Route (for existing orders)
orderRouter.post('/create-delhivery-shipment/:orderId', auth, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        console.log('🚚 Manual Delhivery integration for order:', orderId);
        
        // Import your order model and get order details
        // Replace with your actual order model import
        const order = await OrderModel.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Import delhiveryService
        const delhiveryService = (await import('../config/delhiveryService.js')).default;
        
        // Create Delhivery shipment
        const delhiveryResult = await delhiveryService.createOrder({
            orderId: order._id,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            deliveryAddress: order.deliveryAddress,
            products: order.products,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod
        });

        if (delhiveryResult.success || delhiveryResult.fallback) {
            // Update order with waybill
            await OrderModel.findByIdAndUpdate(orderId, {
                waybill: delhiveryResult.waybill,
                trackingUrl: delhiveryResult.trackingUrl,
                shippingStatus: delhiveryResult.success ? 'Created' : 'Pending',
                shippingNote: delhiveryResult.success ? null : delhiveryResult.error,
                updatedAt: new Date()
            });
        }

        res.json({
            success: delhiveryResult.success,
            fallback: delhiveryResult.fallback,
            data: {
                waybill: delhiveryResult.waybill,
                trackingUrl: delhiveryResult.trackingUrl,
                error: delhiveryResult.error
            }
        });

    } catch (error) {
        console.error('❌ Manual Delhivery integration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 🚚 Test Delhivery Connection Route
orderRouter.get('/test-delhivery-connection', auth, async (req, res) => {
    try {
        console.log('🧪 Testing Delhivery connection...');
        
        const delhiveryService = (await import('../config/delhiveryService.js')).default;
        const connectionResult = await delhiveryService.testConnection();
        
        res.json({
            success: connectionResult.success,
            message: connectionResult.success ? 'Delhivery connection successful' : 'Delhivery connection failed',
            data: connectionResult
        });
        
    } catch (error) {
        console.error('❌ Connection test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default orderRouter;
