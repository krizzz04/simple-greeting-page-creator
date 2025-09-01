# 🚚 Delhivery Integration Guide

## Overview
This integration automatically sends orders to Delhivery when they are placed in your e-commerce application. Orders are created in Delhivery's system with tracking information, and customers can track their shipments in real-time.

## 🔑 API Configuration

### API Key
- **Key**: `eb20a6d1c7451bf344645cbe25fb176a0328547f`
- **Base URL**: `https://track.delhivery.com/api/v1`

### Environment Variables
Add these to your `.env` file:
```env
DELHIVERY_API_KEY=98af64ba1beb5f81c51de8089ddf4630ac248ff3
DELHIVERY_BASE_URL=https://track.delhivery.com/api/v1
```

## 🏗️ Architecture

### Backend Integration
1. **Delhivery Service** (`server/config/delhiveryService.js`)
   - Handles all Delhivery API calls
   - Creates orders, tracks shipments, gets shipping rates
   - Generates unique waybill numbers

2. **Order Controller** (`server/controllers/order.controller.js`)
   - Automatically sends orders to Delhivery when created
   - Updates order model with tracking information
   - Handles both regular orders and PayPal orders

3. **Order Model** (`server/models/order.model.js`)
   - New fields for Delhivery integration:
     - `delhiveryWaybill`: Unique tracking number
     - `delhiveryTrackingUrl`: Direct tracking link
     - `shippingStatus`: Current shipping status
     - `shippingDate`: When order was shipped
     - `estimatedDelivery`: Expected delivery date

4. **API Routes** (`server/route/order.route.js`)
   - `/order/track/:waybill` - Track shipment status
   - `/order/shipping-rates/:pincode` - Get shipping rates

### Frontend Components
1. **DelhiveryTracking** (`src/components/DelhiveryTracking/index.jsx`)
   - Displays real-time tracking information
   - Shows shipment details and timeline
   - Links to Delhivery's official tracking page

## 🚀 How It Works

### 1. Order Creation Flow
```
Customer Places Order → Order Saved → Delhivery API Called → Tracking Info Updated
```

### 2. Automatic Integration
- **Regular Orders**: Integrated in `createOrderController`
- **PayPal Orders**: Integrated in `captureOrderPaypalController`
- **No Manual Intervention**: Orders are automatically sent to Delhivery

### 3. Data Sent to Delhivery
```javascript
{
  waybill: "DLV1234567890123",
  order: "order_id_from_database",
  shipment_details: {
    name: "Customer Name",
    phone: "Customer Phone",
    email: "Customer Email",
    address: "Delivery Address",
    city: "City",
    state: "State",
    pincode: "Pincode",
    country: "India"
  },
  payment_mode: "COD" | "Prepaid",
  cod_amount: 0 | total_amount,
  order_type: "Prepaid",
  total_amount: order_total,
  weight: calculated_weight,
  dimensions: package_dimensions,
  quantity: number_of_products,
  product_details: [...]
}
```

## 📱 Frontend Usage

### Basic Tracking Component
```jsx
import DelhiveryTracking from '../components/DelhiveryTracking';

// In your order details page
<DelhiveryTracking 
  waybill={order.delhiveryWaybill} 
  orderId={order._id} 
/>
```

### Display Tracking Info
```jsx
// Show waybill number
{order.delhiveryWaybill && (
  <div className="tracking-info">
    <p>Tracking Number: {order.delhiveryWaybill}</p>
    <a 
      href={order.delhiveryTrackingUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Track Package
    </a>
  </div>
)}
```

## 🔍 API Endpoints

### Create Order
- **Method**: `POST`
- **Endpoint**: `https://track.delhivery.com/api/v1/order/create`
- **Headers**: `Authorization: Token {API_KEY}`

### Track Order
- **Method**: `GET`
- **Endpoint**: `https://track.delhivery.com/api/v1/track/{waybill}`
- **Headers**: `Authorization: Token {API_KEY}`

### Get Shipping Rates
- **Method**: `GET`
- **Endpoint**: `https://track.delhivery.com/api/v1/rates?from_pincode=110001&to_pincode={pincode}&weight=1&cod=0`
- **Headers**: `Authorization: Token {API_KEY}`

### Cancel Order
- **Method**: `POST`
- **Endpoint**: `https://track.delhivery.com/api/v1/order/cancel`
- **Headers**: `Authorization: Token {API_KEY}`

## 📊 Tracking Statuses

### Common Statuses
- **Pending**: Order created, awaiting pickup
- **In Transit**: Package is moving between locations
- **Out for Delivery**: Package is out for final delivery
- **Delivered**: Package successfully delivered
- **Cancelled**: Order cancelled

### Status Colors
- 🟢 **Delivered**: Green
- 🔵 **Out for Delivery**: Blue
- 🟡 **In Transit**: Yellow
- ⚫ **Pending**: Gray
- 🔴 **Cancelled**: Red

## 🛠️ Customization

### Modify Default Values
```javascript
// In delhiveryService.js
calculateTotalWeight(products) {
  const defaultWeight = 0.5; // Change default weight per product
  // ... rest of the function
}

calculateDimensions(products) {
  const defaultLength = 20; // Change default package dimensions
  const defaultWidth = 15;
  const defaultHeight = 10;
  // ... rest of the function
}
```

### Add Custom Fields
```javascript
// In delhiveryService.js - createOrder method
const payload = {
  // ... existing fields
  custom_field: "Your custom value",
  additional_info: {
    source: "Your Website",
    priority: "Standard"
  }
};
```

## 🚨 Error Handling

### API Failures
- Orders are still created in your database even if Delhivery fails
- Comprehensive error logging for debugging
- Graceful fallback to prevent order creation failures

### Common Issues
1. **Invalid API Key**: Check your API key in environment variables
2. **Network Issues**: Ensure your server can reach Delhivery's API
3. **Invalid Data**: Check that all required fields are provided

## 📝 Logging

### Console Logs
- 🚚 Order creation attempts
- ✅ Successful Delhivery integration
- ❌ Failed API calls
- 🔍 Debug information for troubleshooting

### Monitor These Logs
```bash
# Successful integration
✅ Order successfully sent to Delhivery: DLV1234567890123

# Failed integration
❌ Failed to send order to Delhivery: {error_details}

# Debug info
🚚 Sending order to Delhivery: {order_data}
```

## 🔒 Security Considerations

### API Key Protection
- Store API key in environment variables
- Never commit API keys to version control
- Use different keys for development and production

### Data Validation
- Validate all customer data before sending to Delhivery
- Sanitize addresses and contact information
- Ensure phone numbers are in correct format

## 🚀 Deployment Checklist

### Backend
- [ ] API key added to environment variables
- [ ] Delhivery service file created
- [ ] Order controller updated
- [ ] Order model updated with new fields
- [ ] API routes added

### Frontend
- [ ] DelhiveryTracking component created
- [ ] Component integrated into order pages
- [ ] Tracking links working correctly

### Testing
- [ ] Test order creation with Delhivery
- [ ] Verify tracking information display
- [ ] Check error handling scenarios
- [ ] Test with different payment methods

## 📞 Support

### Delhivery Support
- **Website**: https://www.delhivery.com
- **API Documentation**: https://track.delhivery.com/api/v1
- **Contact**: Check Delhivery's official support channels

### Technical Issues
- Check console logs for error details
- Verify API key and network connectivity
- Ensure all required fields are provided
- Test with sample data first

## 🔄 Future Enhancements

### Potential Improvements
1. **Webhook Integration**: Real-time status updates from Delhivery
2. **Bulk Order Processing**: Handle multiple orders efficiently
3. **Advanced Analytics**: Track delivery performance metrics
4. **Automated Notifications**: SMS/Email updates on status changes
5. **Return Management**: Handle return shipments through Delhivery

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Your Development Team
