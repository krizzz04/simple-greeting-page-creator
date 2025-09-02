import React from 'react';
import { FaTruck, FaExternalLinkAlt, FaCopy, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const OrderTrackingCard = ({ order }) => {
  const copyTrackingNumber = (waybill) => {
    navigator.clipboard.writeText(waybill);
    toast.success('Tracking number copied!');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Delivered': 'text-green-600 bg-green-50',
      'Out for Delivery': 'text-blue-600 bg-blue-50',
      'In Transit': 'text-yellow-600 bg-yellow-50',
      'Order Created in Delhivery': 'text-indigo-600 bg-indigo-50',
      'Pending': 'text-gray-600 bg-gray-50',
      'Cancelled': 'text-red-600 bg-red-50',
      'Pending - Delhivery API Unavailable': 'text-orange-600 bg-orange-50'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Delivered': '🎉',
      'Out for Delivery': '🚚',
      'In Transit': '📦',
      'Order Created in Delhivery': '✅',
      'Pending': '⏳',
      'Cancelled': '❌',
      'Pending - Delhivery API Unavailable': '⚠️'
    };
    return statusIcons[status] || '📋';
  };

  if (!order.delhiveryWaybill) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <FaInfoCircle />
          <span className="text-sm">Tracking not available yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <FaTruck className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Shipping Details</h4>
            <p className="text-sm text-gray-600">via Delhivery</p>
          </div>
        </div>
        
        {order.delhiveryTrackingUrl && (
          <a 
            href={order.delhiveryTrackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
          >
            <FaExternalLinkAlt className="text-xs" />
            Track Package
          </a>
        )}
      </div>

      {/* Tracking Number */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 uppercase tracking-wide">Tracking Number</label>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
            {order.delhiveryWaybill}
          </span>
          <button
            onClick={() => copyTrackingNumber(order.delhiveryWaybill)}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Copy tracking number"
          >
            <FaCopy className="text-xs" />
          </button>
        </div>
      </div>

      {/* Current Status */}
      {order.shippingStatus && (
        <div className={`p-3 rounded-lg ${getStatusColor(order.shippingStatus)} mb-4`}>
          <div className="flex items-center gap-2">
            <span>{getStatusIcon(order.shippingStatus)}</span>
            <span className="font-medium text-sm">{order.shippingStatus}</span>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        {order.shippingDate && (
          <div>
            <span className="text-gray-500">Shipped:</span>
            <div className="mt-1 text-gray-900">
              {new Date(order.shippingDate).toLocaleDateString()}
            </div>
          </div>
        )}
        {order.estimatedDelivery && (
          <div>
            <span className="text-gray-500">Est. Delivery:</span>
            <div className="mt-1 text-gray-900">
              {new Date(order.estimatedDelivery).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={() => window.open(`https://www.delhivery.com/track/package/${order.delhiveryWaybill}`, '_blank')}
          className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm hover:bg-blue-100 transition-colors"
        >
          Track on Delhivery
        </button>
        {order.delhiveryTrackingUrl && (
          <button
            onClick={() => window.open(order.delhiveryTrackingUrl, '_blank')}
            className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-100 transition-colors"
          >
            Official Tracking
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingCard;
