import React, { useState, useEffect } from 'react';
import { getData } from '../../utils/api';
import { FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';

const DelhiveryTracking = ({ waybill, orderId }) => {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (waybill) {
            fetchTrackingData();
        }
    }, [waybill]);

    const fetchTrackingData = async () => {
        if (!waybill) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await getData(`/delhivery/track/${waybill}`);
            
            if (response.success) {
                setTrackingData(response.data);
            } else {
                setError(response.error || 'Failed to fetch tracking data');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Tracking fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'Delivered': 'text-green-600',
            'Out for Delivery': 'text-blue-600',
            'In Transit': 'text-yellow-600',
            'Pending': 'text-gray-600',
            'Cancelled': 'text-red-600'
        };
        return statusColors[status] || 'text-gray-600';
    };

    const getStatusIcon = (status) => {
        const statusIcons = {
            'Delivered': '🎉',
            'Out for Delivery': '🚚',
            'In Transit': '📦',
            'Pending': '⏳',
            'Cancelled': '❌'
        };
        return statusIcons[status] || '📋';
    };

    if (!waybill) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">No tracking information available</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
                <CircularProgress size={24} className="mb-2" />
                <p className="text-gray-600 text-sm">Fetching tracking information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                    <FaInfoCircle />
                    <span className="font-medium">Tracking Error</span>
                </div>
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                    onClick={fetchTrackingData}
                    className="mt-2 text-red-600 text-sm underline hover:no-underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!trackingData) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">No tracking data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <FaTruck className="text-blue-600 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delhivery Tracking</h3>
                        <p className="text-sm text-gray-600">Waybill: {waybill}</p>
                    </div>
                </div>
                <a 
                    href={`https://www.delhivery.com/track/${waybill}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                    Track on Delhivery
                </a>
            </div>

            {/* Current Status */}
            {trackingData.status && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{getStatusIcon(trackingData.status)}</span>
                        <div>
                            <p className={`font-semibold ${getStatusColor(trackingData.status)}`}>
                                {trackingData.status}
                            </p>
                            {trackingData.status_details && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {trackingData.status_details}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Shipment Details */}
            {trackingData.shipment_details && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                            <FaMapMarkerAlt className="text-gray-500" />
                            <span className="font-medium">Delivery Address</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {trackingData.shipment_details.address}<br />
                            {trackingData.shipment_details.city}, {trackingData.shipment_details.state}<br />
                            {trackingData.shipment_details.pincode}
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                            <FaCalendarAlt className="text-gray-500" />
                            <span className="font-medium">Shipment Info</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            <strong>Weight:</strong> {trackingData.weight || 'N/A'} kg<br />
                            <strong>Payment:</strong> {trackingData.payment_mode || 'N/A'}<br />
                            <strong>Order Type:</strong> {trackingData.order_type || 'N/A'}
                        </p>
                    </div>
                </div>
            )}

            {/* Tracking Timeline */}
            {trackingData.timeline && trackingData.timeline.length > 0 && (
                <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Tracking Timeline</h4>
                    <div className="space-y-4">
                        {trackingData.timeline.map((event, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {event.status}
                                    </p>
                                    {event.location && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            📍 {event.location}
                                        </p>
                                    )}
                                    {event.timestamp && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            🕒 {new Date(event.timestamp).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Additional Info */}
            {trackingData.additional_info && (
                <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Additional Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(trackingData.additional_info, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DelhiveryTracking;
