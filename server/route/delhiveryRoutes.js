import express from "express";
import delhiveryService from "../config/delhiveryService.js";
import OrderModel from "../models/order.model.js";
import authToken from "../middlewares/auth.js";

const router = express.Router();

// 🚚 Track order by waybill number
router.get("/track/:waybill", async (req, res) => {
  try {
    console.log('📦 Tracking order:', req.params.waybill);
    const result = await delhiveryService.trackOrder(req.params.waybill);
    
    if (result.success) {
      res.json({ 
        success: true, 
        data: result.data,
        message: "Tracking data retrieved successfully" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error,
        message: "Failed to retrieve tracking data" 
      });
    }
  } catch (error) {
    console.error('❌ Tracking route error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Internal server error while tracking" 
    });
  }
});

// 💰 Get shipping rates
router.get("/shipping-rates/:pincode", async (req, res) => {
  try {
    const { pincode } = req.params;
    const fromPincode = req.query.from || '110001'; // Default Delhi pincode
    const weight = parseFloat(req.query.weight) || 1;
    const codAmount = parseFloat(req.query.codAmount) || 0;
    
    console.log('💰 Getting shipping rates for:', { fromPincode, pincode, weight, codAmount });
    
    const result = await delhiveryService.getShippingRates(fromPincode, pincode, weight, codAmount);
    
    if (result.success) {
      res.json({ 
        success: true, 
        rates: result.rates,
        message: "Shipping rates retrieved successfully" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error,
        message: "Failed to retrieve shipping rates" 
      });
    }
  } catch (error) {
    console.error('❌ Shipping rates route error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Internal server error while getting shipping rates" 
    });
  }
});

// 🚫 Cancel order
router.post("/cancel/:waybill", authToken, async (req, res) => {
  try {
    const { waybill } = req.params;
    
    console.log('🚫 Canceling order:', waybill);
    
    // Check if order exists and belongs to user
    const order = await OrderModel.findOne({ 
      delhiveryWaybill: waybill,
      userId: req.userId 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have permission to cancel this order"
      });
    }
    
    const result = await delhiveryService.cancelOrder(waybill);
    
    if (result.success) {
      // Update order status in database
      await OrderModel.findByIdAndUpdate(order._id, {
        shippingStatus: 'Cancelled',
        order_status: 'cancelled'
      });
      
      res.json({ 
        success: true, 
        data: result.data,
        message: "Order cancelled successfully" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error,
        message: "Failed to cancel order" 
      });
    }
  } catch (error) {
    console.error('❌ Cancel order route error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Internal server error while canceling order" 
    });
  }
});

// 📋 Get order tracking info by order ID
router.get("/order-tracking/:orderId", authToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('📋 Getting order tracking info:', orderId);
    
    const order = await OrderModel.findOne({ 
      _id: orderId,
      userId: req.userId 
    }).populate('delivery_address');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have permission to view this order"
      });
    }
    
    if (!order.delhiveryWaybill) {
      return res.json({
        success: true,
        order: {
          _id: order._id,
          shippingStatus: order.shippingStatus || 'Pending',
          delhiveryWaybill: null,
          trackingUrl: null
        },
        message: "Order not yet shipped or tracking not available"
      });
    }
    
    // Get live tracking info from Delhivery
    const trackingResult = await delhiveryService.trackOrder(order.delhiveryWaybill);
    
    res.json({ 
      success: true,
      order: {
        _id: order._id,
        shippingStatus: order.shippingStatus,
        delhiveryWaybill: order.delhiveryWaybill,
        trackingUrl: order.delhiveryTrackingUrl,
        estimatedDelivery: order.estimatedDelivery,
        shippingDate: order.shippingDate
      },
      liveTracking: trackingResult.success ? trackingResult.data : null,
      message: "Order tracking info retrieved successfully" 
    });
    
  } catch (error) {
    console.error('❌ Order tracking route error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Internal server error while getting order tracking" 
    });
  }
});

// 🔄 Manually sync order with Delhivery (for admin use)
router.post("/sync-order/:orderId", authToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('🔄 Syncing order with Delhivery:', orderId);
    
    const order = await OrderModel.findById(orderId).populate('delivery_address userId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    if (order.delhiveryWaybill) {
      return res.json({
        success: true,
        message: "Order already synced with Delhivery",
        waybill: order.delhiveryWaybill
      });
    }
    
    // Prepare order data for Delhivery
    const delhiveryOrderData = {
      orderId: order._id.toString(),
      customerName: order.delivery_address?.name || order.userId?.name || 'Customer',
      customerPhone: order.delivery_address?.mobile || order.userId?.mobile,
      customerEmail: order.delivery_address?.email || order.userId?.email,
      deliveryAddress: order.delivery_address,
      paymentMethod: order.payment_status === 'paid' ? 'online' : 'cod',
      totalAmount: order.totalAmt,
      products: order.products
    };
    
    const result = await delhiveryService.createOrder(delhiveryOrderData);
    
    if (result.success || result.fallback) {
      // Update order with Delhivery info
      await OrderModel.findByIdAndUpdate(order._id, {
        delhiveryWaybill: result.waybill,
        delhiveryTrackingUrl: result.trackingUrl || null,
        shippingStatus: result.success ? 'Order Created in Delhivery' : 'Pending - Delhivery API Unavailable'
      });
      
      res.json({ 
        success: true,
        waybill: result.waybill,
        trackingUrl: result.trackingUrl,
        message: result.success ? "Order successfully synced with Delhivery" : "Order synced with fallback waybill" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error,
        message: "Failed to sync order with Delhivery" 
      });
    }
  } catch (error) {
    console.error('❌ Sync order route error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Internal server error while syncing order" 
    });
  }
});

export default router;
