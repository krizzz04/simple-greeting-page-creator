import axios from 'axios';

const DELHIVERY_API_KEY = 'eb20a6d1c7451bf344645cbe25fb176a0328547f';
const DELHIVERY_BASE_URL = 'https://track.delhivery.com/api/v1';

// Validate API key
if (!DELHIVERY_API_KEY) {
    console.error('❌ DELHIVERY_API_KEY is not configured');
}

class DelhiveryService {
    constructor() {
        this.apiKey = DELHIVERY_API_KEY;
        this.baseURL = DELHIVERY_BASE_URL;
    }

    // Create a new order in Delhivery
    async createOrder(orderData) {
        try {
            // Validate required data
            if (!orderData.orderId || !orderData.customerName || !orderData.deliveryAddress) {
                throw new Error('Missing required order data');
            }

            const payload = {
                waybill: this.generateWaybill(),
                order: orderData.orderId,
                shipment_details: {
                    name: orderData.customerName,
                    phone: orderData.customerPhone,
                    email: orderData.customerEmail,
                    address: orderData.deliveryAddress.address_line1,
                    city: orderData.deliveryAddress.city,
                    state: orderData.deliveryAddress.state,
                    pincode: orderData.deliveryAddress.pincode,
                    country: orderData.deliveryAddress.country || 'India'
                },
                payment_mode: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
                cod_amount: orderData.paymentMethod === 'cod' ? orderData.totalAmount : 0,
                order_type: 'Prepaid',
                total_amount: orderData.totalAmount,
                weight: this.calculateTotalWeight(orderData.products),
                dimensions: this.calculateDimensions(orderData.products),
                quantity: orderData.products.length,
                product_details: orderData.products.map(product => ({
                    name: product.productTitle,
                    sku: product.productId,
                    quantity: product.quantity,
                    price: product.price
                }))
            };

            console.log('🚚 Delhivery Order Payload:', payload);

            const response = await axios.post(
                `${this.baseURL}/order/create`,
                payload,
                {
                    headers: {
                        'Authorization': `Token ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Delhivery Order Created:', response.data);
            return {
                success: true,
                waybill: payload.waybill,
                trackingUrl: `https://www.delhivery.com/track/${payload.waybill}`,
                data: response.data
            };

        } catch (error) {
            console.error('❌ Delhivery Order Creation Failed:', error.response?.data || error.message);
            
            // Return a fallback response to prevent order creation failure
            return {
                success: false,
                error: error.response?.data || error.message,
                waybill: this.generateWaybill(), // Still generate waybill for fallback
                trackingUrl: null,
                fallback: true
            };
        }
    }

    // Track order status
    async trackOrder(waybill) {
        try {
            const response = await axios.get(
                `${this.baseURL}/track/${waybill}`,
                {
                    headers: {
                        'Authorization': `Token ${this.apiKey}`
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('❌ Delhivery Tracking Failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Get shipping rates
    async getShippingRates(pincode) {
        try {
            const response = await axios.get(
                `${this.baseURL}/rates?from_pincode=110001&to_pincode=${pincode}&weight=1&cod=0`,
                {
                    headers: {
                        'Authorization': `Token ${this.apiKey}`
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('❌ Delhivery Rates Failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Generate unique waybill number
    generateWaybill() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `DLV${timestamp}${random}`;
    }

    // Calculate total weight of products
    calculateTotalWeight(products) {
        // Default weight per product if not specified
        const defaultWeight = 0.5; // kg
        return products.reduce((total, product) => {
            const weight = product.weight || defaultWeight;
            return total + (weight * product.quantity);
        }, 0);
    }

    // Calculate package dimensions
    calculateDimensions(products) {
        // Default dimensions if not specified
        const defaultLength = 20; // cm
        const defaultWidth = 15;  // cm
        const defaultHeight = 10; // cm

        return {
            length: defaultLength,
            width: defaultWidth,
            height: defaultHeight
        };
    }

    // Cancel order
    async cancelOrder(waybill) {
        try {
            const response = await axios.post(
                `${this.baseURL}/order/cancel`,
                { waybill },
                {
                    headers: {
                        'Authorization': `Token ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('❌ Delhivery Order Cancellation Failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }
}

export default new DelhiveryService();
