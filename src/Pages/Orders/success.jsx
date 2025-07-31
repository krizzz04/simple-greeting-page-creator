import React, { useContext } from 'react';
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { MyContext } from '../../App';
import { FaWhatsapp } from "react-icons/fa";

// Ultramsg API credentials
const VITE_ULTRAMSG_INSTANCE_ID = import.meta.env.VITE_ULTRAMSG_INSTANCE_ID;
const VITE_ULTRAMSG_TOKEN = import.meta.env.VITE_ULTRAMSG_TOKEN;

const sendWhatsAppViaAPI = async (phoneNumber, message) => {
  try {
    const response = await fetch('https://api.ultramsg.com/' + VITE_ULTRAMSG_INSTANCE_ID + '/messages/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: VITE_ULTRAMSG_TOKEN,
        to: phoneNumber,
        body: message,
        priority: 10,
        referenceId: '',
        msgId: '',
        delay: 1200,
        noCache: false,
      })
    });

    const data = await response.json();
    console.log('WhatsApp API Response:', data);
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { error: true, message: 'Failed to send WhatsApp message' };
  }
};

const createWhatsAppInvoice = (orderData) => {
  const orderItems = orderData.products.map(item => 
    `• ${item.productTitle} - Qty: ${item.quantity} - ₹${item.price}`
  ).join('\n');
  
  const message = `🛒 *Order Invoice*\n\n` +
    `*Order ID:* ${orderData.orderId}\n` +
    `*Date:* ${orderData.date}\n\n` +
    `*Items:*\n${orderItems}\n\n` +
    `*Delivery Address:*\n` +
    `${orderData.delivery_address.address_line1}\n` +
    `${orderData.delivery_address.city}, ${orderData.delivery_address.state}\n` +
    `${orderData.delivery_address.pincode}\n` +
    `Phone: ${orderData.delivery_address.mobile}\n\n` +
    `*Total Amount:* ₹${orderData.totalAmt}\n` +
    `*Payment Status:* ${orderData.payment_status}\n\n` +
    `Thank you for your order! 🎉`;
  
  return message;
};

export const OrderSuccess = () => {
    const context = useContext(MyContext);
    
    const handleWhatsAppShare = async () => {
        // Get the latest order from localStorage (for guest orders) or context
        const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        if (guestOrders.length > 0) {
            const latestOrder = guestOrders[guestOrders.length - 1];
            const message = createWhatsAppInvoice(latestOrder);
            const phoneNumber = latestOrder.delivery_address.mobile.replace(/\D/g, '');
            
            if (phoneNumber) {
                const result = await sendWhatsAppViaAPI(phoneNumber, message);
                if (result.error) {
                    context.alertBox('error', 'Failed to send WhatsApp message');
                } else {
                    context.alertBox('success', 'Invoice sent to WhatsApp successfully!');
                }
            } else {
                context.alertBox('error', 'Invalid phone number');
            }
        } else {
            // For logged-in users, you might want to get order from context
            context.alertBox('info', 'Order details not available for sharing');
        }
    };

    return (
        <section className='w-full p-10 py-8 lg:py-20 flex items-center justify-center flex-col gap-2'>
            <img src="/checked.png" className="w-[80px] sm:w-[120px]" />
            <h3 className='mb-0 text-[20px] sm:text-[25px]'>Your order is placed</h3>
            <p className='mt-0 mb-0'>Thank you for your payment.</p>
            <p className='mt-0 text-center'>Order Invoice sent to your email <b>{context?.userData?.email}</b></p>
            
            <div className="flex gap-3 mt-4">
                <Link to="/">
                    <Button className="btn-org btn-border">Back to home</Button>
                </Link>
                <Button 
                    className="btn-dark btn-border flex gap-2" 
                    onClick={handleWhatsAppShare}
                >
                    <FaWhatsapp className="text-[18px]" />
                    Share Invoice on WhatsApp
                </Button>
            </div>
        </section>
    )
}
