import { Router } from "express";
import auth from "../middlewares/auth.js";
import {  captureOrderPaypalController, createOrderController, createOrderPaypalController, deleteOrder, getOrderDetailsController, getTotalOrdersCountController, getUserOrderDetailsController, totalSalesController, totalUsersController, updateOrderStatusController } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post('/create',auth,createOrderController)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/create-order-paypal',auth,createOrderPaypalController)
orderRouter.post('/capture-order-paypal',auth,captureOrderPaypalController)
orderRouter.put('/order-status/:id',auth,updateOrderStatusController)
orderRouter.get('/count',auth,getTotalOrdersCountController)
orderRouter.get('/sales',auth,totalSalesController)
orderRouter.get('/users',auth,totalUsersController)
orderRouter.get('/order-list/orders',auth,getUserOrderDetailsController)
orderRouter.delete('/deleteOrder/:id',auth,deleteOrder)

// 🚚 Delhivery Tracking Route
orderRouter.get('/track/:waybill', async (req, res) => {
    try {
        const { waybill } = req.params;
        
        // Import delhiveryService here to avoid circular dependency
        const delhiveryService = (await import('../config/delhiveryService.js')).default;
        
        console.log('🚚 Tracking waybill:', waybill);
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 🚚 Get Shipping Rates Route
orderRouter.get('/shipping-rates/:pincode', async (req, res) => {
    try {
        const { pincode } = req.params;
        
        // Import delhiveryService here to avoid circular dependency
        const delhiveryService = (await import('../config/delhiveryService.js')).default;
        
        const ratesResult = await delhiveryService.getShippingRates(pincode);
        
        if (ratesResult.success) {
            res.json({
                success: true,
                data: ratesResult.data
            });
        } else {
            res.status(400).json({
                success: false,
                error: ratesResult.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default orderRouter;