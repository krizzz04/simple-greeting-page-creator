import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { BsFillBagCheckFill } from "react-icons/bs";
import { MyContext } from '../../App';
import { FaPlus } from "react-icons/fa6";
import { FaGooglePay } from "react-icons/fa";
import { SiPaytm, SiPhonepe } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import Radio from '@mui/material/Radio';
import { deleteData, fetchDataFromApi, postData, API_BASE_URL } from "../../utils/api";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import DelhiveryTracking from '../../components/DelhiveryTracking';

const VITE_APP_RAZORPAY_KEY_ID = import.meta.env.VITE_APP_RAZORPAY_KEY_ID;
const VITE_APP_PAYPAL_CLIENT_ID = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;
const VITE_API_URL = API_BASE_URL;
const WASENDER_API_KEY = import.meta.env.VITE_APP_WASENDER_API_KEY;

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [totalAmount, setTotalAmount] = useState();
  const [isLoading, setIsloading] = useState(false);
  const [messagingInProgress, setMessagingInProgress] = useState(false);
  const [orderInProgress, setOrderInProgress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" or "cod"
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const context = useContext(MyContext);

  const history = useNavigate();

  // Function to remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      console.log("🗑️ Attempting to remove cart item:", itemId);
      
      if (!itemId) {
        context?.alertBox("error", "Invalid item ID");
        return;
      }

      const response = await deleteData(`/api/cart/delete-cart-item/${itemId}`);
      console.log("🗑️ Remove response:", response);
      
      if (response?.error === false || response?.success === true) {
        context?.alertBox("success", "Item removed from cart");
        context?.getCartItems(); // Refresh cart data
      } else {
        console.error("🗑️ Remove failed:", response);
        context?.alertBox("error", response?.message || "Failed to remove item from cart");
      }
    } catch (error) {
      console.error("🗑️ Error removing item from cart:", error);
      context?.alertBox("error", "Failed to remove item from cart");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Add a small delay to ensure context is fully loaded
    const checkAuth = () => {
      console.log("🔍 Checkout Auth Check:", {
        isLogin: context?.isLogin,
        hasUserData: !!context?.userData,
        userId: context?.userData?._id,
        token: !!localStorage.getItem('accessToken')
      });
      
      // Check if user is authenticated - be more lenient
      const token = localStorage.getItem('accessToken');
      if (!token) {
        context?.alertBox("error", "Please login first to access checkout");
        history("/login");
        return;
      }
      
      // If we have a token but no user data yet, wait a bit more
      if (token && (!context?.userData || !context?.userData._id)) {
        console.log("⏳ Waiting for user data to load...");
        return;
      }
      
      // If we have both token and user data, proceed
      if (token && context?.userData && context?.userData._id) {
        console.log("✅ Authentication successful, proceeding to checkout");
        setUserData(context?.userData)
        if (context?.userData?.address_details && context?.userData?.address_details.length > 0) {
            setSelectedAddress(context?.userData?.address_details[0]?._id);
        }
      }
    };

    // Check immediately
    checkAuth();
    
    // Also check after delays to handle async loading
    const timeoutId1 = setTimeout(checkAuth, 500);
    const timeoutId2 = setTimeout(checkAuth, 2000);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [context?.userData, context?.isLogin])

  useEffect(() => {
    const subtotal = context.cartData?.length !== 0 ?
      context.cartData?.map(item => parseInt(item.price) * item.quantity)
        .reduce((total, value) => total + value, 0) : 0;
    
    // Apply ₹200 discount for online payment
    const onlineDiscount = paymentMethod === "online" ? 200 : 0;
    const finalTotal = subtotal - onlineDiscount;
    
    setTotalAmount(finalTotal);
  }, [context.cartData, paymentMethod])

  useEffect(() => {
    if (!VITE_APP_PAYPAL_CLIENT_ID || paymentMethod !== "online") return;
    
    // Clean up existing PayPal script
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Load the PayPal JavaScript SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${VITE_APP_PAYPAL_CLIENT_ID}&disable-funding=card`;
    script.async = true;
    script.onload = () => {
      if(window.paypal) {
        window.paypal
        .Buttons(
          {
            createOrder: async () => {
              // Create order on the server
              try {
                const resp = await fetch(
                    "https://v6.exchangerate-api.com/v6/8f85eea95dae9336b9ea3ce9/latest/INR"
                );

                const respData = await resp.json();
                let convertedAmount = 0;

                if (respData.result === "success") {
                    const usdToInrRate = respData.conversion_rates.USD;
                    convertedAmount = (totalAmount * usdToInrRate).toFixed(2);
                }

                const headers = {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                }

                const data = {
                    userId: context?.userData?._id,
                    totalAmount: convertedAmount
                }

                const response = await axios.get(
                    `${VITE_API_URL}/api/order/create-order-paypal?userId=${data?.userId}&totalAmount=${data?.totalAmount}`, { headers }
                );

                return response?.data?.id; // Return order ID to PayPal
              } catch (error) {
                  console.error("Error creating PayPal order:", error);
                  history("/order/failed");
              }
            },
            onApprove: async (data) => {
              onApprovePayment(data);
            },
            onError: (err) => {
              history("/order/failed");
              console.error("PayPal Checkout onError:", err);
            },
          })
        .render("#paypal-button-container").catch((error) => {
            console.error("Failed to render PayPal buttons", error);
        });
      }
    };
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [context?.cartData, context?.userData, selectedAddress, totalAmount, paymentMethod]);

  // Helper function to add delay between API calls
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to format phone number to E.164 format
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    
    let formattedNumber = phoneNumber.toString().trim();
    
    // Remove any non-digit characters except +
    formattedNumber = formattedNumber.replace(/[^\d+]/g, '');
    
    // Remove leading zeros
    formattedNumber = formattedNumber.replace(/^0+/, '');
    
    // If it doesn't start with +, add +91 (India country code)
    if (!formattedNumber.startsWith('+')) {
        // Ensure it's a valid 10-digit number before adding country code
        if (formattedNumber.length === 10) {
            formattedNumber = `+91${formattedNumber}`;
        } else if (formattedNumber.length === 11 && formattedNumber.startsWith('91')) {
            formattedNumber = `+${formattedNumber}`;
        } else if (formattedNumber.length === 12 && formattedNumber.startsWith('91')) {
            formattedNumber = `+${formattedNumber}`;
        } else {
            console.warn("Invalid phone number format:", phoneNumber);
            return null; // Invalid number
        }
    }
    
    // Final validation - should be between +9110xxxxxxxx format
    if (formattedNumber.length < 13 || formattedNumber.length > 15) {
        console.warn("Phone number length invalid:", formattedNumber);
        return null;
    }
    
    return formattedNumber;
  };

  // Helper function to make API call to WaSender with retry logic
  const callWasenderAPI = async (phoneNumber, message, messageType = "SMS", retryCount = 0) => {
    if (!WASENDER_API_KEY) {
        console.error("WaSender API key is not configured. Please check your .env file.");
        return false;
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    if (!formattedNumber) {
        console.error(`Cannot send ${messageType}. Invalid phone number:`, phoneNumber);
        return false;
    }

    // Validate message
    if (!message || message.trim().length === 0) {
        console.error(`Empty message for ${messageType}`);
        return false;
    }

    if (message.length > 4096) {
        console.error(`Message too long for ${messageType}:`, message.length);
        message = message.substring(0, 4093) + "...";
    }

    try {
        console.log(`Attempting to send ${messageType} to:`, formattedNumber);
        
        const requestData = { 
            to: formattedNumber, 
            text: message.trim()
        };

        console.log(`${messageType} Request data:`, requestData);
        
        const response = await axios.post(
            "https://www.wasenderapi.com/api/send-message",
            requestData,
            { 
                headers: { 
                    Authorization: `Bearer ${WASENDER_API_KEY}`,
                    "Content-Type": "application/json" 
                },
                timeout: 20000 // 20 seconds timeout
            }
        );

        console.log(`✅ ${messageType} via WaSender sent successfully:`, response.data);
        return response.data;
    } catch (error) {
        const errorDetails = {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            phoneNumber: formattedNumber,
            messageType: messageType,
            retryCount: retryCount
        };
        
        console.error(`❌ Error sending ${messageType} via WaSender:`, errorDetails);

        // Handle rate limiting (429) with exponential backoff
        if (error.response?.status === 429 && retryCount < 3) {
            const waitTime = Math.pow(2, retryCount + 1) * 3000; // 6s, 12s, 24s
            console.log(`⏳ Rate limited. Retrying ${messageType} in ${waitTime/1000} seconds... (attempt ${retryCount + 1}/3)`);
            await delay(waitTime);
            return callWasenderAPI(phoneNumber, message, messageType, retryCount + 1);
        }

        // Handle validation errors (422)
        if (error.response?.status === 422) {
            console.error("🔍 Validation error details:", error.response.data);
        }

        // Handle authentication errors (401)
        if (error.response?.status === 401) {
            console.error("🔑 Authentication failed. Please check your API key.");
        }

        return false;
    }
  };

  // SMS Message Template
  const sendSmsMessage = async (user, orderDetails, deliveryAddress, fullOrderId) => {
    const mobileNumber = deliveryAddress?.mobile || user?.mobile;
    
    if (!mobileNumber) {
        console.error("Cannot send SMS. Mobile number is missing.");
        return false;
    }

    const shortOrderId = fullOrderId ? fullOrderId.slice(-8) : '';
    const orderIdString = shortOrderId ? ` #${shortOrderId}` : '';
    const totalAmt = orderDetails.totalAmt || orderDetails.totalAmount || 0;
    
    // Prioritize address name/email over user account data (especially for phone login users)
    const customerName = deliveryAddress?.name || 
                        (user?.name && !user.name.includes('user_') && !user.name.includes('User_') ? user.name : null) || 
                        'Customer';
    
    const message = `Hello ${customerName}, your order${orderIdString} has been placed successfully! Total: ₹${totalAmt}. Payment: ${orderDetails.payment_status}.`;

    console.log("📱 Preparing to send SMS:", { customer: customerName, phone: mobileNumber, orderId: shortOrderId });
    
    const result = await callWasenderAPI(mobileNumber, message, "SMS");
    return result !== false;
  };

  // Enhanced WhatsApp Order Message Template
  const sendWhatsAppMessage = async (user, orderDetails, deliveryAddress, fullOrderId) => {
    const mobileNumber = deliveryAddress?.mobile || user?.mobile;
    
    if (!mobileNumber) {
        console.error("Cannot send WhatsApp order message. Mobile number is missing.");
        return false;
    }

    const shortOrderId = fullOrderId ? fullOrderId.slice(-8) : 'N/A';
    const totalAmt = orderDetails.totalAmt || orderDetails.totalAmount || 0;
    const paymentMethod = orderDetails.payment_status;
    const orderDate = new Date().toLocaleDateString('en-IN');
    const deliveryAddr = deliveryAddress?.address_line1 || 'Your registered address';
    
    // Prioritize address name/email over user account data (especially for phone login users)
    const customerName = deliveryAddress?.name || 
                        (user?.name && !user.name.includes('user_') && !user.name.includes('User_') ? user.name : null) || 
                        'Customer';
    
    // 🎨 Enhanced WhatsApp Order Template
    const message = `🎉 *ORDER CONFIRMED* 🎉

Hello *${customerName}*! 

Your order has been successfully placed! 🛒

📋 *Order Details:*
🔢 Order ID: #${shortOrderId}
📅 Date: ${orderDate}
💰 Amount: ₹${totalAmt}
💳 Payment: ${paymentMethod}
📍 Delivery: ${deliveryAddr}

📦 *What's Next?*
• We'll prepare your order
• You'll receive shipping updates
• Expected delivery: 3-5 business days

Thank you for choosing us! 💚
*Advanced UI Techniques*`;

    console.log("💬 Sending WhatsApp order message:", { user: user.name, phone: mobileNumber });

    const result = await callWasenderAPI(mobileNumber, message, "WhatsApp Order");
    return result !== false;
  };

  // WhatsApp Confirmation Message Template
  const sendWhatsAppConfirmationMessage = async (user, deliveryAddress) => {
    const mobileNumber = deliveryAddress?.mobile || user?.mobile;
    
    if (!mobileNumber) {
        console.error("Cannot send WhatsApp confirmation. Mobile number is missing.");
        return false;
    }

    // Prioritize address name/email over user account data (especially for phone login users)
    const customerName = deliveryAddress?.name || 
                        (user?.name && !user.name.includes('user_') && !user.name.includes('User_') ? user.name : null) || 
                        'Customer';

    const message = `✅ *ORDER PROCESSING* ✅

Hi *${customerName}*! 

Your order is now being processed by our team! 🚀

📱 *Track Your Order:*
Visit: www.test.com

🚚 *Delivery Updates:*
• Order confirmed ✅
• Preparing for dispatch 🏭
• Out for delivery 🚛
• Delivered 📦

💬 *Need Help?*
Reply to this message or visit our website

*Thank you for your business!* 🙏
Advanced UI Techniques`;

    console.log("✅ Sending WhatsApp confirmation:", { customer: customerName, phone: mobileNumber });

    const result = await callWasenderAPI(mobileNumber, message, "WhatsApp Confirmation");
    return result !== false;
  };

  // Enhanced notification sending function with better rate limiting
  const sendAllNotifications = async (user, orderDetails, deliveryAddress, fullOrderId) => {
    console.log("🚀 Starting notification sending process...");
    setMessagingInProgress(true);
    
    const results = {
      sms: false,
      whatsapp: false,
      confirmation: false
    };

    // Create a unique order key to prevent duplicate sends
    const orderKey = `notifications_${fullOrderId}_${user._id}`;
    
    // Check if notifications were already sent for this order
    if (localStorage.getItem(orderKey)) {
      console.log("⚠️ Notifications already sent for this order, skipping...");
      setMessagingInProgress(false);
      return results;
    }

    try {
      // Send SMS
      console.log("1️⃣ Sending SMS...");
      results.sms = await sendSmsMessage(user, orderDetails, deliveryAddress, fullOrderId);
      
      // Wait longer between messages to avoid rate limiting
      await delay(8000); // 8 seconds
      
      // Send WhatsApp order message
      console.log("2️⃣ Sending WhatsApp order message...");
      results.whatsapp = await sendWhatsAppMessage(user, orderDetails, deliveryAddress, fullOrderId);
      
      // Wait longer before confirmation
      await delay(12000); // 12 seconds
      
      // Send WhatsApp confirmation
      console.log("3️⃣ Sending WhatsApp confirmation...");
      results.confirmation = await sendWhatsAppConfirmationMessage(user, deliveryAddress);
      
      console.log("📊 Notification results:", results);
      
      // Mark notifications as sent
      localStorage.setItem(orderKey, JSON.stringify({
        timestamp: Date.now(),
        results: results
      }));
      
      // Show success/error messages based on results
      const successCount = Object.values(results).filter(r => r === true).length;
      const totalCount = Object.keys(results).length;
      
      if (successCount === totalCount) {
        console.log("✅ All notifications sent successfully!");
        context.alertBox("success", "Order confirmed! Notifications sent via SMS and WhatsApp.");
      } else if (successCount > 0) {
        console.log(`⚠️ ${successCount}/${totalCount} notifications sent successfully`);
        context.alertBox("warning", `Order confirmed! ${successCount} of ${totalCount} notifications sent.`);
      } else {
        console.log("❌ All notifications failed to send");
        context.alertBox("error", "Order confirmed, but notifications failed to send.");
      }
      
    } catch (error) {
      console.error("🔥 Error in notification sending process:", error);
    } finally {
      setMessagingInProgress(false);
    }
    
    return results;
  };

  const onApprovePayment = async (data) => {
    if (orderInProgress) {
      context?.alertBox("warning", "Order is already being processed...");
      return;
    }
    
    setOrderInProgress(true);
    const user = context?.userData;

    const info = {
      userId: user?._id,
      products: context?.cartData,
      payment_status: "COMPLETE",
      delivery_address: selectedAddress,
      totalAmount: totalAmount,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    };

    // Capture order on the server
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    }

    try {
        const response = await axios.post(
            `${VITE_API_URL}/api/order/capture-order-paypal`,
            {
              ...info,
              paymentId: data.orderID
            }, { headers }
          );

        if (response.data.success) {
            context.alertBox("success", "Order completed and saved to database!");
            
            const newOrder = response.data.order || response.data;
            const fullOrderId = newOrder?._id;
            
            // Get the delivery address object
            const deliveryAddressObject = userData.address_details.find(addr => addr._id === selectedAddress);
            
            // Send all notifications
            await sendAllNotifications(user, info, deliveryAddressObject, fullOrderId);
            
                          // 🚚 Store order data for tracking display
              const orderWithTracking = {
                ...newOrder,
                delivery_address: deliveryAddressObject
              };
              localStorage.setItem(`order_${fullOrderId}`, JSON.stringify(orderWithTracking));
              
              // 🚚 Show tracking information on checkout page
              setOrderData(orderWithTracking);
              setOrderPlaced(true);
            deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then(() => {
                context?.getCartItems();
            })
        } else {
            context.alertBox("error", response.data.message || "Failed to capture payment.");
            history("/order/failed");
        }
    } catch(error) {
        console.error("Error capturing payment", error);
        context.alertBox("error", "An error occurred while capturing the payment.");
        history("/order/failed");
    } finally {
        setOrderInProgress(false);
    }
  }

  const editAddress = (id) => {
    context?.setOpenAddressPanel(true);
    context?.setAddressMode("edit");
    context?.setAddressId(id);
  }

  const handleChange = (e, index) => {
    if (e.target.checked) {
      setIsChecked(index);
      setSelectedAddress(e.target.value)
    }
  }

  const checkout = (e) => {
    e.preventDefault();

    if (orderInProgress || messagingInProgress) {
      context?.alertBox("warning", "Order is already being processed...");
      return;
    }

    // Only allow online payment checkout when online payment is selected
    if (paymentMethod !== "online") {
      context?.alertBox("error", "Please select online payment method for this checkout option.");
      return;
    }

    if (userData?.address_details?.length !== 0) {
      setOrderInProgress(true);
      
      var options = {
        key: VITE_APP_RAZORPAY_KEY_ID,
        amount: parseInt(totalAmount * 100),
        currency: "INR",
        order_receipt: context?.userData?.name,
        name: "Advanced UI Techniques",
        description: "for testing purpose",
        handler: function (response) {
          const paymentId = response.razorpay_payment_id;
          const user = context?.userData

          const payLoad = {
            userId: user?._id,
            products: context?.cartData,
            paymentId: paymentId,
            payment_status: "COMPLETED",
            delivery_address: selectedAddress,
            totalAmt: totalAmount,
            date: new Date().toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          };

          postData(`/api/order/create`, payLoad).then(async (res) => {
            if (res?.error === false) {
              context.alertBox("success", res?.message);
              
              const newOrder = res?.data || res?.order || res;
              const fullOrderId = newOrder?._id;
              
              // Get the delivery address object
              const deliveryAddressObject = userData.address_details.find(addr => addr._id === selectedAddress);
              
              // Send all notifications
              await sendAllNotifications(user, payLoad, deliveryAddressObject, fullOrderId);
              
              // 🚚 Store order data for tracking display
              const orderWithTracking = {
                ...newOrder,
                delivery_address: deliveryAddressObject
              };
              localStorage.setItem(`order_${fullOrderId}`, JSON.stringify(orderWithTracking));
              
              // 🚚 Show tracking information on checkout page
              setOrderData(orderWithTracking);
              setOrderPlaced(true);
              
              deleteData(`/api/cart/emptyCart/${user?._id}`).then(() => {
                context?.getCartItems();
              })
            } else {
              context.alertBox("error", res?.message);
              history("/order/failed");
            }
          }).finally(() => {
            setOrderInProgress(false);
          });
        },
        theme: {
          color: "#ff5252",
        },
      };

      var pay = new window.Razorpay(options);
      pay.open();
    }
    else {
      context.alertBox("error", "Please add address");
      setOrderInProgress(false);
    }
  }

  const cashOnDelivery = async () => {
    if (orderInProgress || messagingInProgress) {
      context?.alertBox("warning", "Order is already being processed...");
      return;
    }

    const user = context?.userData;
    setIsloading(true);
    setOrderInProgress(true);

    if (!userData?.address_details || userData.address_details.length === 0) {
        context.alertBox("error", "Please add a delivery address first.");
        setIsloading(false);
        setOrderInProgress(false);
        return;
    }

    const deliveryAddressObject = userData.address_details.find(addr => addr._id === selectedAddress);

    const payLoad = {
        userId: user?._id,
        products: context?.cartData,
        paymentId: '',
        payment_status: "CASH ON DELIVERY",
        delivery_address: selectedAddress,
        totalAmt: totalAmount,
        date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        })
    };

    postData(`/api/order/create`, payLoad).then(async (res) => {
        if (res?.error === false) {
            context.alertBox("success", res?.message);
            
            const newOrder = res?.data || res?.order || res;
            const fullOrderId = newOrder?._id;

            // Send all notifications
            await sendAllNotifications(user, payLoad, deliveryAddressObject, fullOrderId);

            // 🚚 Store order data for tracking display
            const orderWithTracking = {
                ...newOrder,
                delivery_address: deliveryAddressObject
            };
            localStorage.setItem(`order_${fullOrderId}`, JSON.stringify(orderWithTracking));

            // 🚚 Show tracking information on checkout page
            setOrderData(orderWithTracking);
            setOrderPlaced(true);

            deleteData(`/api/cart/emptyCart/${user?._id}`).then(() => {
                context?.getCartItems();
            });
        } else {
            context.alertBox("error", res?.message);
            history("/order/failed");
        }
    }).finally(() => {
        setIsloading(false);
        setOrderInProgress(false);
    });
  }

  // Test function for debugging
  const testWasenderAPI = async (testPhone = null) => {
    const testNumber = testPhone || "+919876543210";
    const testMessage = "🧪 Test message from React checkout app - " + new Date().toLocaleString();
    
    console.log("🧪 Testing WaSender API with:", { 
      testNumber, 
      testMessage, 
      apiKey: WASENDER_API_KEY ? "✅ Present" : "❌ Missing" 
    });
    
    const result = await callWasenderAPI(testNumber, testMessage, "Test");
    
    if (result) {
        console.log("✅ Test successful!", result);
        return true;
    } else {
        console.log("❌ Test failed!");
        return false;
    }
  };

  // Expose test function to window for debugging
  if (typeof window !== 'undefined') {
    window.testWasenderAPI = testWasenderAPI;
  }

  // 🚚 Show tracking information if order was just placed
  if (orderPlaced && orderData) {
    return (
      <section className="py-6 lg:py-8 w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-3xl">✅</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-600">Your order has been confirmed and is being processed.</p>
              </div>

              {/* 🚚 Delhivery Tracking Section */}
              {orderData?.delhiveryWaybill && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                  <h2 className="font-semibold text-blue-900 mb-4 text-lg">🚚 Track Your Package</h2>
                  <DelhiveryTracking 
                    waybill={orderData.delhiveryWaybill} 
                    orderId={orderData._id} 
                  />
                </div>
              )}

              {/* 🚚 No Tracking Yet - Show Processing Status */}
              {!orderData?.delhiveryWaybill && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                  <h2 className="font-semibold text-gray-900 mb-4 text-lg">📦 Order Status</h2>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-500 text-2xl">⏳</span>
                    </div>
                    <p className="font-medium text-gray-900 mb-2">Order Processing</p>
                    <p className="text-sm text-gray-600">Your order is being prepared for shipping. You'll receive tracking information via email once the package is shipped.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    setOrderPlaced(false);
                    setOrderData(null);
                  }}
                  className="btn-org btn-border"
                >
                  Place Another Order
                </Button>
                <Link to="/orders">
                  <Button className="btn-org btn-border">View All Orders</Button>
                </Link>
                <Link to="/">
                  <Button className="btn-org btn-border">Back to Home</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-3 lg:py-10 px-3">
      {messagingInProgress && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded-md shadow-lg z-50">
          <div className="flex items-center gap-2">
            <CircularProgress size={16} color="inherit" />
            <span>Sending notifications...</span>
          </div>
        </div>
      )}
      
      <form onSubmit={checkout}>
        <div className="w-full lg:w-[70%] m-auto flex flex-col md:flex-row gap-5">
          <div className="leftCol w-full md:w-[60%]">
            <div className="card bg-white shadow-md p-5 rounded-md w-full">
              <div className="flex items-center justify-between">
                <h2>Select Delivery Address</h2>
                {
                  userData?.address_details?.length !== 0 &&
                  <Button variant="outlined"
                    onClick={() => {
                      context?.setOpenAddressPanel(true);
                      context?.setAddressMode("add");
                    }} className="btn">
                    <FaPlus />
                    ADD {context?.windowWidth < 767 ? '' : 'NEW ADDRESS'}
                  </Button>
                }
              </div>

              <br />

              <div className="flex flex-col gap-4">
                {
                  userData?.address_details?.length !== 0 ? userData?.address_details?.map((address, index) => {
                    return (
                      <label className={`flex gap-3 p-4 border border-[rgba(0,0,0,0.1)] rounded-md relative ${isChecked === index && 'bg-[#fff2f2]'}`} key={index}>
                        <div>
                          <Radio size="small" onChange={(e) => handleChange(e, index)}
                            checked={isChecked === index} value={address?._id} />
                        </div>
                        <div className="info">
                          <span className="inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md">{address?.addressType}</span>
                          <h3>{userData?.name}</h3>
                          <p className="mt-0 mb-0">
                            {address?.address_line1 + " " + address?.city + " " + address?.country + " " + address?.state + " " + address?.landmark + ' ' + '+ ' + address?.mobile}
                          </p>
                          <p className="mb-0 font-[500]">{userData?.mobile ? '+' + userData.mobile : (address?.mobile ? '+' + address.mobile : '')}</p>
                        </div>

                        <Button variant="text" className="!absolute top-[15px] right-[15px]" size="small"
                          onClick={() => editAddress(address?._id)}
                        >EDIT</Button>
                      </label>
                    )
                  })
                  :
                  <>
                    <div className="flex items-center mt-5 justify-between flex-col p-5">
                      <img src="/map.png" width="100" />
                      <h2 className="text-center">No Addresses found in your account!</h2>
                      <p className="mt-0">Add a delivery address.</p>
                      <Button className="btn-org"
                        onClick={() => {
                          context?.setOpenAddressPanel(true);
                          context?.setAddressMode("add");
                        }}>ADD ADDRESS</Button>
                    </div>
                  </>
                }
              </div>
            </div>
          </div>

          <div className="rightCol w-full md:w-[40%]">
            <div className="card shadow-md bg-white p-5 rounded-md">
              <h2 className="mb-4">Your Order</h2>

              <div className="flex items-center justify-between py-3 border-t border-b border-[rgba(0,0,0,0.1)]">
                <span className="text-[14px] font-[600]">Product</span>
                <span className="text-[14px] font-">Subtotal</span>
              </div>

              <div className="mb-5 scroll max-h-[250px] overflow-y-scroll overflow-x-hidden pr-2">
                {
                  context?.cartData?.length !== 0 && context?.cartData?.map((item, index) => {
                    return (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0" key={index}>
                        <div className="part1 flex items-center gap-3 flex-1">
                          <div className="img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer">
                            <img
                              src={item?.image}
                              alt={item?.productTitle}
                              className="w-full transition-all group-hover:scale-105"
                            />
                          </div>

                          <div className="info flex-1">
                            <h4 className="text-[14px]" title={item?.productTitle}>{item?.productTitle?.substr(0, 20) + '...'} </h4>
                            <span className="text-[13px] text-gray-600">Qty : {item?.quantity}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-[500] text-green-600">{`₹${(item?.quantity * item?.price)}`}</span>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("🗑️ Cart item structure:", item);
                              removeFromCart(item._id);
                            }}
                            className="!min-w-[30px] !w-[30px] !h-[30px] !rounded-full !bg-red-50 hover:!bg-red-100 !text-red-500 hover:!text-red-600 transition-all duration-200"
                            title="Remove from cart"
                          >
                            <MdDelete className="text-[16px]" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="text-[18px] font-[700] mb-4 text-gray-800">Choose Payment Method</h3>
                
                {/* Online Payment Option with Offer */}
                <div className={`relative mb-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  paymentMethod === "online" 
                    ? "border-green-500 bg-green-50 shadow-lg" 
                    : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-25"
                }`} onClick={() => setPaymentMethod("online")}>
                  {/* Offer Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-[12px] font-bold shadow-lg animate-pulse">
                    🎉 INSTANT ₹200 OFF
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Radio
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      name="payment-method"
                      color="success"
                      className="!text-green-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[16px] font-[600] text-gray-800">Digital Payment</span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[12px] font-bold">
                          RECOMMENDED
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-600 mb-3">Pay securely with your favorite apps</p>
                      
                      {/* Payment Icons */}
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <img src="https://developers.google.com/static/pay/api/images/brand-guidelines/google-pay-mark.png" alt="Google Pay" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <SiPhonepe className="text-[32px] text-purple-600" />
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="w-8 h-8 object-contain" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  paymentMethod === "cod" 
                    ? "border-orange-500 bg-orange-50 shadow-lg" 
                    : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-25"
                }`} onClick={() => setPaymentMethod("cod")}>
                  <div className="flex items-center gap-3">
                    <Radio
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      name="payment-method"
                      color="warning"
                      className="!text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[16px] font-[600] text-gray-800">Cash on Delivery</span>
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-[12px] font-bold">
                          PAY LATER
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 mb-4">
                <h4 className="text-[16px] font-[700] mb-3 text-gray-800">Order Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{context.cartData?.length !== 0 ? 
                      context.cartData?.map(item => parseInt(item.price) * item.quantity)
                        .reduce((total, value) => total + value, 0) : 0}</span>
                  </div>
                  
                  {paymentMethod === "online" && (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">🎉</span>
                        <span className="text-[14px] text-green-700 font-medium">Digital Payment Discount</span>
                      </div>
                      <span className="text-[14px] text-green-700 font-bold">-₹200</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-3 border-t border-gray-200 font-[700] text-[18px]">
                    <span className="text-gray-800">Total Amount:</span>
                    <span className="text-green-600">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center flex-col gap-3 mb-2">
                {/* Digital Payment Button - Only show when online payment is selected */}
                {paymentMethod === "online" && (
                  <>
                    <Button 
                      type="submit" 
                      className="btn-org btn-lg w-full flex gap-2 items-center" 
                      disabled={!userData?.address_details || userData.address_details.length === 0 || isLoading || messagingInProgress || orderInProgress}
                    >
                      <FaGooglePay className="text-[28px] text-white" /> 
                      {(messagingInProgress || orderInProgress) ? "Processing..." : "Pay now (₹200 OFF)"}
                    </Button>

                    <div 
                      id="paypal-button-container" 
                      className={(!userData?.address_details || userData.address_details.length === 0 || isLoading || messagingInProgress || orderInProgress) ? 'pointer-events-none opacity-50' : ''}
                    ></div>
                  </>
                )}

                {/* Cash on Delivery Button - Only show when COD is selected */}
                {paymentMethod === "cod" && (
                  <Button 
                    type="button" 
                    className="btn-dark btn-lg w-full flex gap-2 items-center" 
                    onClick={cashOnDelivery} 
                    disabled={isLoading || messagingInProgress || orderInProgress || !userData?.address_details || userData.address_details.length === 0}
                  >
                    {
                      (isLoading || messagingInProgress || orderInProgress) ? <CircularProgress size={24} color="inherit" /> :
                        <>
                          <BsFillBagCheckFill className="text-[20px]" />
                          Cash on Delivery
                        </>
                    }
                  </Button>
                )}
              </div>

              {/* Debug section - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
                  <div className="font-semibold mb-2">Debug Info:</div>
                  <div>WaSender API Key: {WASENDER_API_KEY ? "✅ Present" : "❌ Missing"}</div>
                  <div>Selected Address: {selectedAddress || "None"}</div>
                  <div>Payment Method: {paymentMethod}</div>
                  <div>Total Amount: ₹{totalAmount || 0}</div>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => testWasenderAPI()}
                    className="mt-2"
                  >
                    Test WaSender API
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Checkout;
