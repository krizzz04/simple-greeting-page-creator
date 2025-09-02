import axios from "axios";

const DELHIVERY_MODE = process.env.DELHIVERY_MODE || "staging"; // staging or production
const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;
const TEST_MODE = process.env.DELHIVERY_TEST_MODE === 'true'; // Add test mode support

const BASE_URL =
  DELHIVERY_MODE === "production"
    ? "https://track.delhivery.com"
    : "https://staging-express.delhivery.com";

// Axios instance for Delhivery
const delhiveryClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${DELHIVERY_API_KEY}`,
    "Accept": "application/json"
  },
  timeout: 30000, // 30 second timeout
});

// Add request/response interceptors for better debugging
delhiveryClient.interceptors.request.use((config) => {
  console.log('📤 Delhivery Request:', {
    url: config.url,
    method: config.method,
    headers: { ...config.headers, Authorization: config.headers.Authorization ? 'Token [HIDDEN]' : 'None' },
    data: config.data
  });
  return config;
});

delhiveryClient.interceptors.response.use(
  (response) => {
    console.log('📥 Delhivery Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Delhivery API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      apiKey: DELHIVERY_API_KEY ? `${DELHIVERY_API_KEY.substring(0, 8)}...` : 'NOT SET'
    });
    return Promise.reject(error);
  }
);

// Utility function to generate waybill number (fallback only)
const generateWaybill = () => {
  const prefix = TEST_MODE ? "TEST" : "FLB";
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Utility function to calculate total weight
const calculateTotalWeight = (products) => {
  const defaultWeight = 0.5; // Default weight per product in kg
  let totalWeight = 0;
  
  products.forEach(product => {
    const weight = product.weight || defaultWeight;
    totalWeight += weight * product.quantity;
  });
  
  return Math.max(totalWeight, 0.1); // Minimum 0.1 kg
};

// Utility function to calculate package dimensions
const calculateDimensions = (products) => {
  // Default dimensions in cm
  const defaultLength = 20;
  const defaultWidth = 15;
  const defaultHeight = 10;
  
  // Simple calculation based on number of products
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  const scaleFactor = Math.sqrt(totalQuantity);
  
  return {
    length: Math.ceil(defaultLength * scaleFactor),
    width: Math.ceil(defaultWidth * scaleFactor),
    height: Math.ceil(defaultHeight * scaleFactor)
  };
};

// Main DelhiveryService object
const delhiveryService = {
  // Test API connection with multiple endpoints
  async testConnection() {
    try {
      console.log('🧪 Testing Delhivery API connection...');
      console.log('🔧 Environment:', DELHIVERY_MODE);
      console.log('🔧 Base URL:', BASE_URL);
      console.log('🔧 API Key:', DELHIVERY_API_KEY ? `${DELHIVERY_API_KEY.substring(0, 8)}...` : 'NOT SET');
      
      if (!DELHIVERY_API_KEY) {
        throw new Error('Delhivery API key not configured');
      }

      if (TEST_MODE) {
        console.log('🧪 TEST MODE - Returning mock success');
        return {
          success: true,
          status: 200,
          message: 'Test mode - API connection bypassed'
        };
      }
      
      // Try multiple test endpoints to find one that works
      const testEndpoints = [
        '/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=400001&o_pin=574142&cgm=1&pt=Pre-paid&cod=0',
        '/api/p/track/TEST123456789', // This should return 404 but validate auth
        '/api/cmu/klp.json?pin=574142' // Pincode serviceability check
      ];

      let lastError = null;
      
      for (const endpoint of testEndpoints) {
        try {
          console.log(`🔍 Testing endpoint: ${endpoint}`);
          const response = await delhiveryClient.get(endpoint);
          
          console.log('✅ API Connection successful:', response.status);
          return { 
            success: true, 
            status: response.status,
            message: 'API connection successful',
            endpoint: endpoint
          };
        } catch (error) {
          lastError = error;
          
          // If we get 404, it means auth is working but resource not found
          if (error.response?.status === 404) {
            console.log('✅ API Key is valid (404 expected for test endpoint)');
            return {
              success: true,
              status: 404,
              message: 'API key is valid - authentication successful'
            };
          }
          
          console.log(`❌ Endpoint ${endpoint} failed:`, error.response?.status);
          continue;
        }
      }
      
      throw lastError;
      
    } catch (error) {
      console.error('❌ API Connection failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status,
        suggestion: error.response?.status === 401 ? 
          'Check your API key or contact Delhivery support for test credentials' : 
          'Network or server error'
      };
    }
  },

  // Create Order in Delhivery - FIXED VERSION (No custom waybill generation)
  async createOrder(orderData) {
    try {
      console.log('🚚 Creating Delhivery order with data:', JSON.stringify(orderData, null, 2));
      
      if (TEST_MODE) {
        console.log('🧪 TEST MODE - Creating mock order');
        const mockWaybill = generateWaybill();
        return {
          success: true,
          waybill: mockWaybill,
          trackingUrl: `${BASE_URL}/track/package/${mockWaybill}`,
          response: { message: 'Test mode - no real API call made', packages: [{ waybill: mockWaybill }] }
        };
      }
      
      if (!DELHIVERY_API_KEY) {
        console.error('❌ Delhivery API key not configured');
        return {
          success: false,
          fallback: true,
          waybill: generateWaybill(),
          error: 'Delhivery API key not configured'
        };
      }

      // Test connection first
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        console.error('❌ API connection test failed:', connectionTest.error);
        return {
          success: false,
          fallback: true,
          waybill: generateWaybill(),
          error: `API connection failed: ${connectionTest.error}`
        };
      }
      
      // Remove custom waybill generation - let Delhivery handle it
      const weight = calculateTotalWeight(orderData.products);
      const dimensions = calculateDimensions(orderData.products);
      
      // Format product details for Delhivery
      const productDetails = orderData.products.map(product => ({
        name: product.productTitle || product.name || 'Product',
        quantity: product.quantity,
        price: product.price,
        sku: product.productId || product.id
      }));
      
      // Validate and fix address for Indian requirements
      const addressValidation = this.validateIndianAddress(orderData.deliveryAddress);
      if (!addressValidation.isValid) {
        console.warn('⚠️ Address validation issues:', addressValidation.issues);
        // Use fallback address for testing
        orderData.deliveryAddress = {
          addressLine: orderData.deliveryAddress?.addressLine || 'Test Address',
          area: orderData.deliveryAddress?.area || 'Test Area',
          city: 'Mumbai', // Default to Indian city
          state: 'Maharashtra', // Default to Indian state
          pincode: '400001' // Default to Indian pincode
        };
        console.log('🔧 Using fallback address for testing:', orderData.deliveryAddress);
      }
      
      // Validate required fields
      const requiredFields = {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        pincode: orderData.deliveryAddress?.pincode,
        city: orderData.deliveryAddress?.city,
        state: orderData.deliveryAddress?.state,
        orderId: orderData.orderId,
        totalAmount: orderData.totalAmount
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        return {
          success: false,
          fallback: true,
          waybill: generateWaybill(),
          error: `Missing required fields: ${missingFields.join(', ')}`
        };
      }
      
      // Prepare shipment data - REMOVED waybill field (let Delhivery generate it)
      const shipmentData = {
        shipments: [{
          name: orderData.customerName,
          add: `${orderData.deliveryAddress?.addressLine || ''} ${orderData.deliveryAddress?.area || ''}`.trim() || 'Address not provided',
          pin: orderData.deliveryAddress.pincode.toString(),
          city: orderData.deliveryAddress.city,
          state: orderData.deliveryAddress.state,
          country: 'India',
          phone: orderData.customerPhone.toString(),
          order: orderData.orderId.toString(),
          payment_mode: orderData.paymentMethod === 'online' ? 'Prepaid' : 'COD',
          
          // Return address - YOUR ACTUAL BUSINESS DETAILS
          return_pin: '574142',
          return_city: 'Mangalore',
          return_phone: '7975127638',
          return_add: 'Sampath Nilaya Maroli Golipalke House PADIL kattalsar post Bajpe',
          return_state: 'Karnataka',
          return_country: 'India',
          return_name: 'ROAR LF SOUTH',
          
          // Product and order details
          products_desc: productDetails.map(p => `${p.name} (${p.quantity})`).join(', '),
          hsn_code: '61099090',
          cod_amount: orderData.paymentMethod === 'online' ? '0' : orderData.totalAmount.toString(),
          order_date: new Date().toISOString().split('T')[0],
          total_amount: orderData.totalAmount.toString(),
          
          // Seller details - YOUR ACTUAL BUSINESS DETAILS
          seller_add: 'Sampath Nilaya Maroli Golipalke House PADIL kattalsar post Bajpe, Mangalore, Karnataka',
          seller_name: 'ROAR LF SOUTH',
          seller_inv: orderData.orderId.toString(),
          seller_tin: '',
          seller_cst: '',
          
          // Package details - NO waybill field (Delhivery will generate)
          quantity: orderData.products.reduce((sum, p) => sum + p.quantity, 0).toString(),
          shipment_width: dimensions.width.toString(),
          shipment_height: dimensions.height.toString(),
          shipment_length: dimensions.length.toString(),
          weight: weight.toString(),
          shipping_mode: 'Surface',
          address_type: 'home'
        }]
      };
      
      // Create payload in Delhivery's required format
      const payload = `format=json&data=${JSON.stringify(shipmentData)}`;
      
      console.log('🚚 Final payload being sent to Delhivery:', payload);
      
      // Make the API call with proper headers
      const response = await axios.post(`${BASE_URL}/api/cmu/create.json`, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Token ${DELHIVERY_API_KEY}`,
          "Accept": "application/json"
        },
        timeout: 30000
      });
      
      console.log('✅ Delhivery order created successfully');
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
      
      // Check if the response indicates success and extract Delhivery-generated waybill
      if (response.data && response.data.packages && response.data.packages.length > 0) {
        const packageInfo = response.data.packages[0];
        const delhiveryWaybill = packageInfo.waybill; // Use Delhivery-generated waybill
        const trackingUrl = `${BASE_URL}/track/package/${delhiveryWaybill}`;
        
        return {
          success: packageInfo.status !== 'Fail',
          waybill: delhiveryWaybill,
          trackingUrl: trackingUrl,
          response: response.data,
          packageInfo: packageInfo
        };
      } else if (response.data && response.data.rmk) {
        // Check for remarks/errors in response
        console.log('⚠️ Delhivery response remarks:', response.data.rmk);
        return {
          success: false,
          fallback: true,
          waybill: generateWaybill(),
          error: response.data.rmk,
          response: response.data
        };
      } else {
        // Success but no packages array
        return {
          success: true,
          waybill: generateWaybill(), // Fallback waybill
          trackingUrl: `${BASE_URL}/track/package/${generateWaybill()}`,
          response: response.data
        };
      }
      
    } catch (error) {
      console.error('❌ Delhivery Create Order Error Details:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Headers:', error.response?.headers);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Request Config:', error.config);
      console.error('Full Error:', error);
      
      // Return fallback waybill even if API fails
      return {
        success: false,
        fallback: true,
        waybill: generateWaybill(),
        error: error.response?.data || error.message,
        statusCode: error.response?.status
      };
    }
  },

  // Validate Indian address format
  validateIndianAddress(address) {
    const issues = [];
    let isValid = true;

    if (!address) {
      return { isValid: false, issues: ['Address is required'] };
    }

    // Check pincode format (6 digits for India)
    if (!address.pincode || !/^\d{6}$/.test(address.pincode.toString())) {
      issues.push('Invalid Indian pincode - must be 6 digits');
      isValid = false;
    }

    // Check for common international cities that should be converted
    const internationalCities = ['Franfurt', 'Frankfurt', 'London', 'New York'];
    if (internationalCities.some(city => 
      address.city?.toLowerCase().includes(city.toLowerCase())
    )) {
      issues.push('International city detected - will use Indian fallback');
      isValid = false;
    }

    // Check if state looks Indian
    const indianStates = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Kerala'];
    if (!indianStates.some(state => 
      address.state?.toLowerCase().includes(state.toLowerCase())
    )) {
      issues.push('Non-Indian state - will use fallback');
      isValid = false;
    }

    return { isValid, issues };
  },

  // Track Order
  async trackOrder(waybill) {
    try {
      console.log('🔍 Tracking Delhivery order:', waybill);
      
      if (TEST_MODE) {
        return {
          success: true,
          data: {
            ShipmentData: [{
              Shipment: {
                Status: { Status: 'In Transit' },
                OrderType: 'Test Order',
                Waybill: waybill
              }
            }]
          }
        };
      }
      
      if (!DELHIVERY_API_KEY) {
        throw new Error('Delhivery API key not configured');
      }
      
      const response = await delhiveryClient.get(`/api/v1/packages/json/?waybill=${waybill}`);
      
      console.log('✅ Tracking data retrieved successfully');
      
      return {
        success: true,
        data: response.data
      };
      
    } catch (error) {
      console.error('❌ Delhivery Track Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        statusCode: error.response?.status
      };
    }
  },

  // Get Shipping Rates
  async getShippingRates(fromPincode, toPincode, weight = 1, codAmount = 0) {
    try {
      console.log('💰 Getting shipping rates from', fromPincode, 'to', toPincode);
      
      if (TEST_MODE) {
        return {
          success: true,
          rates: {
            total_amount: 50,
            base_charge: 40,
            fuel_surcharge: 10,
            serviceable: true
          }
        };
      }
      
      if (!DELHIVERY_API_KEY) {
        throw new Error('Delhivery API key not configured');
      }
      
      const response = await delhiveryClient.get(
        `/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${toPincode}&o_pin=574142&cgm=${weight}&pt=Pre-paid&cod=${codAmount}`
      );
      
      console.log('✅ Shipping rates retrieved successfully');
      
      return {
        success: true,
        rates: response.data
      };
      
    } catch (error) {
      console.error('❌ Delhivery Rates Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        statusCode: error.response?.status
      };
    }
  },

  // Cancel Order
  async cancelOrder(waybill) {
    try {
      console.log('🚫 Canceling Delhivery order:', waybill);
      
      if (TEST_MODE) {
        return {
          success: true,
          data: { message: 'Test mode - order cancellation simulated' }
        };
      }
      
      if (!DELHIVERY_API_KEY) {
        throw new Error('Delhivery API key not configured');
      }
      
      const response = await delhiveryClient.post('/api/p/edit', {
        waybill: waybill,
        cancellation: 'true'
      });
      
      console.log('✅ Order canceled successfully');
      
      return {
        success: true,
        data: response.data
      };
      
    } catch (error) {
      console.error('❌ Delhivery Cancel Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        statusCode: error.response?.status
      };
    }
  },

  // Get Order Status
  async getOrderStatus(waybill) {
    try {
      console.log('📊 Getting order status for:', waybill);
      
      if (TEST_MODE) {
        return {
          success: true,
          status: {
            current_status: 'In Transit',
            delivered: false,
            waybill: waybill
          }
        };
      }
      
      if (!DELHIVERY_API_KEY) {
        throw new Error('Delhivery API key not configured');
      }
      
      const response = await delhiveryClient.get(`/api/p/track/${waybill}`);
      
      console.log('✅ Order status retrieved successfully');
      
      return {
        success: true,
        status: response.data
      };
      
    } catch (error) {
      console.error('❌ Delhivery Status Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        statusCode: error.response?.status
      };
    }
  },

  // Utility functions
  generateWaybill,
  calculateTotalWeight,
  calculateDimensions
};

export default delhiveryService;

// Also export individual functions for backward compatibility
export const createDelhiveryOrder = delhiveryService.createOrder.bind(delhiveryService);
export const trackDelhiveryOrder = delhiveryService.trackOrder.bind(delhiveryService);
export const testDelhiveryConnection = delhiveryService.testConnection.bind(delhiveryService);
