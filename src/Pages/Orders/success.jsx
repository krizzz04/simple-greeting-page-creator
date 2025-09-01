import React, { useContext, useEffect, useState } from 'react';
import Button from "@mui/material/Button";
import { Link, useLocation } from "react-router-dom";
import { MyContext } from '../../App';
import DelhiveryTracking from '../../components/DelhiveryTracking';

export const OrderSuccess = () => {
    const context = useContext(MyContext);
    const location = useLocation();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Get order data from URL params or localStorage
        const params = new URLSearchParams(location.search);
        const orderId = params.get('orderId');
        
        if (orderId) {
            // Try to get order data from localStorage (set during checkout)
            const storedOrder = localStorage.getItem(`order_${orderId}`);
            if (storedOrder) {
                setOrderData(JSON.parse(storedOrder));
            }
        }
    }, [location]);

    return (
        <section className='w-full p-10 py-8 lg:py-20 flex items-center justify-center flex-col gap-2'>
            <img src="/checked.png" className="w-[80px] sm:w-[120px]" />
            <h3 className='mb-0 text-[20px] sm:text-[25px]'>Your order is placed</h3>
            <p className='mt-0 mb-0'>Thank you for your payment.</p>
            <p className='mt-0 text-center'>Order Invoice send to your email <b>{context?.userData?.email}</b></p>
            
            {/* 🚚 Delhivery Tracking Section */}
            {orderData?.delhiveryWaybill && (
                <div className="w-full max-w-2xl mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-3 text-center">🚚 Track Your Package</h4>
                        <DelhiveryTracking 
                            waybill={orderData.delhiveryWaybill} 
                            orderId={orderData._id} 
                        />
                    </div>
                </div>
            )}

            {/* 🚚 No Tracking Yet - Show Processing Status */}
            {!orderData?.delhiveryWaybill && (
                <div className="w-full max-w-2xl mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 text-center">📦 Order Status</h4>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-gray-500 text-2xl">⏳</span>
                            </div>
                            <p className="font-medium text-gray-900 mb-2">Order Processing</p>
                            <p className="text-sm text-gray-600">Your order is being prepared for shipping. You'll receive tracking information via email once the package is shipped.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3 mt-6">
                <Link to="/orders">
                    <Button className="btn-org btn-border">View All Orders</Button>
                </Link>
                <Link to="/">
                    <Button className="btn-org btn-border">Back to Home</Button>
                </Link>
            </div>
        </section>
    )
}
