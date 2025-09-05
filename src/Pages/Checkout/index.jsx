import React, { useContext, useEffect, useState, useCallback } from "react";
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
import { useNavigate, Link, useLocation } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import DelhiveryTracking from '../../components/DelhiveryTracking';
import OrderProcessingPopup from '../../components/OrderProcessingPopup';

const VITE_APP_RAZORPAY_KEY_ID = import.meta.env.VITE_APP_RAZORPAY_KEY_ID;
const VITE_APP_PAYPAL_CLIENT_ID = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;
const VITE_API_URL = API_BASE_URL;
const WASENDER_API_KEY = import.meta.env.VITE_APP_WASENDER_API_KEY;

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [totalAmount, setTotalAmount] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [messagingInProgress, setMessagingInProgress] = useState(false);
  const [orderInProgress, setOrderInProgress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" or "cod"
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [showProcessingPopup, setShowProcessingPopup] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
  const [popupStepUpdater, setPopupStepUpdater] = useState(null);
  const [showCodConfirmation, setShowCodConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Order Summary, 2: Delivery Address, 3: Payment
  const context = useContext(MyContext);
  const history = useNavigate();
  const location = useLocation();

  // Reset checkout state when route changes
  useEffect(() => {
    console.log("🔄 Route changed to:", location.pathname);
    
    // If we're not on checkout page, reset all state
    if (location.pathname !== "/checkout") {
      console.log("🔄 Resetting checkout state - navigating away from checkout");
      setOrderPlaced(false);
      setOrderData(null);
      setShowProcessingPopup(false);
      setCurrentOrderDetails(null);
      setPopupStepUpdater(null);
      setUserData(null);
      setSelectedAddress("");
      setTotalAmount(0);
    }
  }, [location.pathname]);

  // Cleanup effect to handle component unmounting
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setUserData(null);
      setSelectedAddress("");
      setTotalAmount(0);
      setOrderPlaced(false);
      setOrderData(null);
      setShowProcessingPopup(false);
      setCurrentOrderDetails(null);
      setPopupStepUpdater(null);
    };
  }, []);

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

  // Ensure Razorpay is loaded
  useEffect(() => {
    const checkRazorpay = () => {
      if (typeof window.Razorpay === 'undefined') {
        console.log("⏳ Waiting for Razorpay to load...");
        setTimeout(checkRazorpay, 100);
      } else {
        console.log("✅ Razorpay loaded successfully");
      }
    };
    checkRazorpay();
  }, []);

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
  }, [context?.userData?._id, context?.isLogin]) // Only depend on specific user ID, not entire userData object

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

  // SMS Message Template with Product Summary
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
    
    // Add product summary for SMS
    const products = orderDetails.products || [];
    let productSummary = '';
    
    if (products.length > 0) {
        const itemCount = products.reduce((total, product) => total + (product.quantity || 1), 0);
        const productNames = products.slice(0, 2).map(p => p.product_name || p.name || 'Product').join(', ');
        productSummary = ` Items: ${itemCount} (${productNames}${products.length > 2 ? ' + more' : ''})`;
    }
    
    const message = `Hello ${customerName}, your order${orderIdString} has been placed successfully!${productSummary} Total: ₹${totalAmt}. Payment: ${orderDetails.payment_status}.`;

    console.log("📱 Preparing to send SMS:", { 
        customer: customerName, 
        phone: mobileNumber, 
        orderId: shortOrderId,
        productCount: products.length 
    });
    
    const result = await callWasenderAPI(mobileNumber, message, "SMS");
    return result !== false;
  };

  // Enhanced WhatsApp Order Message Template with Product Details
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
    
    // Generate product list
    let productList = '';
    const products = orderDetails.products || [];
    
    if (products.length > 0) {
        productList = '\n🛍️ *Items Ordered:*\n';
        products.forEach((product, index) => {
            const productName = product.product_name || product.name || 'Product';
            const quantity = product.quantity || 1;
            const price = product.price || product.product_price || 0;
            const totalPrice = quantity * price;
            
            productList += `• ${productName}\n`;
            productList += `  Qty: ${quantity} × ₹${price} = ₹${totalPrice}\n`;
        });
    }
    
    // 🎨 Enhanced WhatsApp Order Template with Product Details
    const message = `🎉 *ORDER CONFIRMED* 🎉

Hello *${customerName}*! 

Your order has been successfully placed! 🛒

📋 *Order Details:*
🔢 Order ID: #${shortOrderId}
📅 Date: ${orderDate}
💰 Total Amount: ₹${totalAmt}
💳 Payment: ${paymentMethod}
📍 Delivery: ${deliveryAddr}${productList}

📦 *What's Next?*
• We'll prepare your order
• You'll receive shipping updates
• Expected delivery: 3-5 business days

Thank you for choosing us! 💚
*Roar of South*`;

    console.log("💬 Sending WhatsApp order message with products:", { 
        user: user.name, 
        phone: mobileNumber, 
        productCount: products.length 
    });

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
Visit: www.roarofsouth.in

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
      // Update popup to show order processing
      if (popupStepUpdater) {
        popupStepUpdater('order', 'completed');
      }

      // Send SMS
      console.log("1️⃣ Sending SMS...");
      if (popupStepUpdater) {
        popupStepUpdater('sms', 'processing');
      }
      results.sms = await sendSmsMessage(user, orderDetails, deliveryAddress, fullOrderId);
      if (popupStepUpdater) {
        popupStepUpdater('sms', 'completed');
      }
      
      // Wait longer between messages to avoid rate limiting
      await delay(8000); // 8 seconds
      
      // Send WhatsApp order message
      console.log("2️⃣ Sending WhatsApp order message...");
      if (popupStepUpdater) {
        popupStepUpdater('whatsapp', 'processing');
      }
      results.whatsapp = await sendWhatsAppMessage(user, orderDetails, deliveryAddress, fullOrderId);
      if (popupStepUpdater) {
        popupStepUpdater('whatsapp', 'completed');
      }
      
      // Wait longer before confirmation
      await delay(12000); // 12 seconds
      
      // Send WhatsApp confirmation
      console.log("3️⃣ Sending WhatsApp confirmation...");
      if (popupStepUpdater) {
        popupStepUpdater('confirmation', 'processing');
      }
      results.confirmation = await sendWhatsAppConfirmationMessage(user, deliveryAddress);
      if (popupStepUpdater) {
        popupStepUpdater('confirmation', 'completed');
      }

      // Wait a moment before completing the popup
      setTimeout(() => {
        if (popupStepUpdater) {
          popupStepUpdater('all', 'completed');
        }
      }, 2000);
      
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
            // Show processing popup
            setCurrentOrderDetails(info);
            setShowProcessingPopup(true);
            
            const newOrder = response.data.order || response.data;
            const fullOrderId = newOrder?._id;
            
            // Get the delivery address object
            const deliveryAddressObject = userData.address_details.find(addr => addr._id === selectedAddress);
            
            // Send all notifications (popup will show progress)
            await sendAllNotifications(user, info, deliveryAddressObject, fullOrderId);
            
                          // 🚚 Store order data for tracking display
              const orderWithTracking = {
                ...newOrder,
                products: context?.cartData, // Include the cart data
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
              // Show processing popup
              setCurrentOrderDetails(payLoad);
              setShowProcessingPopup(true);
              
              const newOrder = res?.data || res?.order || res;
              const fullOrderId = newOrder?._id;
              
              // Get the delivery address object
              const deliveryAddressObject = userData.address_details.find(addr => addr._id === selectedAddress);
              
              // Send all notifications (popup will show progress)
              await sendAllNotifications(user, payLoad, deliveryAddressObject, fullOrderId);
              
              // 🚚 Store order data for tracking display
              const orderWithTracking = {
                ...newOrder,
                products: context?.cartData, // Include the cart data
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

      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        context?.alertBox("error", "Payment gateway is not loaded. Please refresh the page and try again.");
        setOrderInProgress(false);
        return;
      }

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

    if (!userData?.address_details || userData.address_details.length === 0) {
        context.alertBox("error", "Please add a delivery address first.");
        return;
    }

    if (!selectedAddress) {
        context.alertBox("error", "Please select a delivery address.");
        return;
    }

    // Show custom confirmation popup
    setShowCodConfirmation(true);
    return; // Wait for user confirmation
  }

  // Handle popup completion
  const handleProcessingComplete = () => {
    setShowProcessingPopup(false);
    setCurrentOrderDetails(null);
    setPopupStepUpdater(null);
  };

  // Handle COD confirmation
  const handleCodConfirm = async () => {
    setShowCodConfirmation(false);
    
    const user = context?.userData;
    setIsLoading(true);
    setOrderInProgress(true);

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
            // Show processing popup
            setCurrentOrderDetails(payLoad);
            setShowProcessingPopup(true);
            
            const newOrder = res?.data || res?.order || res;
            const fullOrderId = newOrder?._id;

            // Send all notifications (popup will show progress)
            await sendAllNotifications(user, payLoad, deliveryAddressObject, fullOrderId);

            // 🚚 Store order data for tracking display
            const orderWithTracking = {
                ...newOrder,
                products: context?.cartData, // Include the cart data
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
        setIsLoading(false);
        setOrderInProgress(false);
    });
  };

  const handleCodCancel = () => {
    setShowCodConfirmation(false);
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Handle place order based on payment method
  const handlePlaceOrder = () => {
    if (orderInProgress || messagingInProgress) {
      context?.alertBox("warning", "Order is already being processed...");
      return;
    }

    if (!userData?.address_details || userData.address_details.length === 0) {
      context?.alertBox("error", "Please add a delivery address first.");
      return;
    }

    if (!selectedAddress) {
      context?.alertBox("error", "Please select a delivery address.");
      return;
    }

    // Route to appropriate payment method
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else if (paymentMethod === 'paypal') {
      // PayPal is handled by the PayPal button container
      context?.alertBox("info", "Please use the PayPal button below to complete your payment.");
    } else if (paymentMethod === 'cod') {
      cashOnDelivery();
    } else {
      context?.alertBox("error", "Please select a payment method.");
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = () => {
    if (orderInProgress || messagingInProgress) {
      context?.alertBox("warning", "Order is already being processed...");
      return;
    }

    if (!userData?.address_details || userData.address_details.length === 0) {
      context?.alertBox("error", "Please add a delivery address first.");
      return;
    }

    if (!selectedAddress) {
      context?.alertBox("error", "Please select a delivery address.");
      return;
    }

    setOrderInProgress(true);
    
    var options = {
      key: VITE_APP_RAZORPAY_KEY_ID,
      amount: parseInt(totalAmount * 100),
      currency: "INR",
      order_receipt: context?.userData?.name,
      name: "Roar of South",
      description: "Order Payment",
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
            // Show processing popup
            setCurrentOrderDetails(payLoad);
            setShowProcessingPopup(true);
            
            const newOrder = res?.data || res?.order || res;
            const fullOrderId = newOrder?._id;
            
            // Get the delivery address object
            const deliveryAddressObject = userData.address_details.find(addr => addr._id === selectedAddress);
            
            // Send all notifications (popup will show progress)
            await sendAllNotifications(user, payLoad, deliveryAddressObject, fullOrderId);
            
            // 🚚 Store order data for tracking display
            const orderWithTracking = {
              ...newOrder,
              products: context?.cartData, // Include the cart data
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

    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
      context?.alertBox("error", "Payment gateway is not loaded. Please refresh the page and try again.");
      setOrderInProgress(false);
      return;
    }

    var pay = new window.Razorpay(options);
    pay.open();
  };

  // Handle popup step updates
  const handleStepUpdate = useCallback((updater) => {
    setPopupStepUpdater(() => updater);
  }, []);

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
      <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        <div className="relative z-10 py-8 lg:py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Success Card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary to-orange-500 p-8 text-center text-white relative">
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/30">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-3">Order Confirmed!</h1>
                  <p className="text-lg text-white/90 max-w-md mx-auto">
                    Your order has been successfully placed and is being processed
                  </p>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl border border-orange-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-orange-100">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-mono text-sm bg-orange-100 px-2 py-1 rounded text-primary">
                          #{orderData._id?.slice(-8) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-orange-100">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-primary text-lg">
                          ₹{orderData.totalAmt || orderData.totalAmount || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-orange-100">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium text-primary">
                          {orderData.products?.length || 0} products
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Payment:</span>
                        <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                          {orderData.payment_status || 'Completed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl border border-orange-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Address
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-gray-800">
                        {orderData.delivery_address?.name || 'Customer'}
                      </p>
                      <p className="text-gray-600">
                        {orderData.delivery_address?.address_line1 || 'Address not available'}
                      </p>
                      {orderData.delivery_address?.city && (
                        <p className="text-gray-600">
                          {orderData.delivery_address.city}, {orderData.delivery_address.state}
                        </p>
                      )}
                      <p className="text-gray-600">
                        {orderData.delivery_address?.mobile || 'Phone not available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking Section */}
                {orderData?.delhiveryWaybill ? (
                  <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl border border-orange-200 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      Track Your Package
                    </h3>
                    <DelhiveryTracking 
                      waybill={orderData.delhiveryWaybill} 
                      orderId={orderData._id} 
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl border border-orange-200 mb-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Order Processing</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Your order is being prepared for shipping. We'll send you tracking information via email and WhatsApp once the package is shipped.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row gap-4 justify-center mt-8">
                  <Button 
                    onClick={() => {
                      setOrderPlaced(false);
                      setOrderData(null);
                    }}
                    className="btn-org btn-lg !min-w-[200px] !px-6 !py-3 !rounded-xl !font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Place Another Order
                  </Button>
                  
                  <Link to="/my-orders" className="!block">
                    <Button className="btn-org btn-border btn-lg !min-w-[200px] !px-6 !py-3 !rounded-xl !font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      View All Orders
                    </Button>
                  </Link>
                  
                  <Link to="/" className="!block">
                    <Button className="btn-org btn-border btn-lg !min-w-[200px] !px-6 !py-3 !rounded-xl !font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Back to Home
                    </Button>
                  </Link>
                </div>

                {/* Success Message */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thank you for your purchase! We'll keep you updated on your order status.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => history(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
                <p className="text-gray-600">Complete your purchase</p>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="/logo.jpg" alt="Logo" className="h-12 w-auto" />
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="hidden sm:block font-medium">Order Summary</span>
              </div>
              <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="hidden sm:block font-medium">Delivery Address</span>
              </div>
              <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className="hidden sm:block font-medium">Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Step 1: Order Summary */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {context?.cartData?.map((item, index) => (
                  <div key={item._id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={item?.image || "/homeBannerPlaceholder.jpg"}
                      alt={item?.productTitle}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item?.productTitle}</h3>
                      <p className="text-gray-600 text-sm">Quantity: {item?.quantity}</p>
                      <p className="text-primary font-bold">₹{item?.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{context.cartData?.length !== 0 ? 
                      context.cartData?.map(item => parseInt(item.price) * item.quantity)
                        .reduce((total, value) => total + value, 0) : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-lg font-bold text-primary">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full btn-org py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                >
                  Continue to Delivery Address
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Address */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Delivery Address
              </h2>
              
              {userData?.address_details?.length > 0 ? (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Select Delivery Address</h3>
                    <button
                      onClick={() => history("/my-account/add-address")}
                      className="text-primary hover:text-orange-600 font-medium text-sm"
                    >
                      + Add New Address
                    </button>
                  </div>
                  
                  <div className="grid gap-4">
                    {userData.address_details.map((address) => (
                      <div
                        key={address._id}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedAddress === address._id
                            ? 'border-primary bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddress(address._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-800">{address.name}</span>
                              {address.isDefault && (
                                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                            <p className="text-gray-600 text-sm">
                              {address.street}, {address.city}, {address.state} {address.pincode}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddress === address._id
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}>
                            {selectedAddress === address._id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Address Found</h3>
                  <p className="text-gray-600 mb-4">Please add a delivery address to continue</p>
                  <button
                    onClick={() => history("/my-account/add-address")}
                    className="btn-org px-6 py-3 rounded-xl font-semibold"
                  >
                    Add Address
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold py-4 rounded-xl transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selectedAddress}
                  className="flex-1 btn-org py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Options */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </h2>
              
              <div className="space-y-4 mb-6">
                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Online Payment</h3>
                        <p className="text-gray-600 text-sm">Credit/Debit Card, UPI, Net Banking</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'razorpay'
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'razorpay' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'paypal'
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <img src="/paypal.png" alt="PayPal" className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">PayPal</h3>
                        <p className="text-gray-600 text-sm">Pay with PayPal account</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'paypal'
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'paypal' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Cash on Delivery</h3>
                        <p className="text-gray-600 text-sm">Pay when you receive your order</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cod' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{context.cartData?.length !== 0 ? 
                      context.cartData?.map(item => parseInt(item.price) * item.quantity)
                        .reduce((total, value) => total + value, 0) : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-lg font-bold text-primary">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-4">
                  {paymentMethod === 'razorpay' && (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!selectedAddress || isLoading || orderInProgress}
                      className="w-full btn-org py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isLoading || orderInProgress ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Pay with Razorpay
                        </>
                      )}
                    </button>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div 
                      id="paypal-button-container" 
                      className={(!userData?.address_details || userData.address_details.length === 0 || isLoading || messagingInProgress || orderInProgress) ? 'pointer-events-none opacity-50' : ''}
                    ></div>
                  )}

                  {paymentMethod === 'cod' && (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!selectedAddress || isLoading || orderInProgress}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isLoading || orderInProgress ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Cash on Delivery
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold py-4 rounded-xl transition-all duration-300"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Processing Popup */}
      <OrderProcessingPopup 
        isOpen={showProcessingPopup}
        onComplete={handleProcessingComplete}
        orderDetails={currentOrderDetails}
        onStepUpdate={handleStepUpdate}
      />

      {/* COD Confirmation Popup */}
      {showCodConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-orange-500 p-6 rounded-t-2xl text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Confirm Order</h2>
                <p className="text-white/90">Cash on Delivery</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Cash on Delivery</h3>
                <p className="text-gray-600 mb-4">
                  You will pay <span className="font-bold text-primary">₹{totalAmount}</span> when you receive your order.
                </p>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-orange-800">Important</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Please ensure you have the exact amount ready when the delivery person arrives.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleCodCancel}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold py-3 rounded-xl transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCodConfirm}
                  className="flex-1 btn-org font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Confirm Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Checkout;
