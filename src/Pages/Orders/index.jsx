
import React, { useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { Button } from "@mui/material";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../components/Badge";
import { FaAngleUp } from "react-icons/fa6";
import { fetchDataFromApi } from "../../utils/api";
import Pagination from "@mui/material/Pagination";
import DelhiveryTracking from "../../components/DelhiveryTracking";

const Orders = () => {
  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);

  const isShowOrderdProduct = (index) => {
    if (isOpenOrderdProduct === index) {
      setIsOpenOrderdProduct(null);
    } else {
      setIsOpenOrderdProduct(index);
    }
  };

  useEffect(() => {
    fetchDataFromApi(`/api/order/order-list/orders?page=${page}&limit=5`).then((res) => {
      if (res?.error === false) {
        setOrders(res)
      }
    })
  }, [page])

  return (
    <section className="py-6 lg:py-8 w-full bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 hidden lg:block">
            <AccountSidebar />
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
                  <div className="text-xs text-gray-500">
                    Page {page} of {orders?.totalPages || 1}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  You have <span className="font-semibold text-primary">{orders?.data?.length || 0}</span> orders
                </p>
              </div>

              {/* Orders List */}
              <div className="p-4 space-y-3">
                {orders?.data?.length !== 0 ? (
                  orders?.data?.map((order, index) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                      {/* Order Header */}
                      <div className="bg-gray-50 p-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              className="!w-8 !h-8 !min-w-8 !rounded-full !bg-white !shadow-sm !border !border-gray-200"
                              onClick={() => isShowOrderdProduct(index)}
                            >
                              {isOpenOrderdProduct === index ? 
                                <FaAngleUp className="text-gray-600 text-sm" /> : 
                                <FaAngleDown className="text-gray-600 text-sm" />
                              }
                            </Button>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">Order #{order?._id?.slice(-8)}</h3>
                              <p className="text-xs text-gray-500">{order?.createdAt?.split("T")[0]}</p>
                              {/* 🚚 Quick Tracking Info */}
                              {order?.delhiveryWaybill && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-blue-600 text-xs">🚚</span>
                                  <span className="text-blue-600 text-xs font-medium">Track: {order.delhiveryWaybill}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-base text-gray-900">₹{order?.totalAmt}</p>
                              <p className="text-xs text-gray-500">{order?.products?.length} items</p>
                            </div>
                            <Badge status={order?.order_status} />
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Customer</p>
                            <p className="text-gray-600">{order?.userId?.name}</p>
                            <p className="text-gray-500 truncate">{order?.userId?.email}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Contact</p>
                            <p className="text-gray-600">{order?.delivery_address?.mobile}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Payment</p>
                            <p className="text-gray-600 text-xs truncate">
                              {order?.paymentId ? order?.paymentId : 'Cash on Delivery'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="font-medium text-gray-700 mb-1 text-xs">Delivery Address</p>
                          <div className="bg-gray-50 p-2 rounded-md">
                            <span className="inline-block text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded mb-1">
                              {order?.delivery_address?.addressType}
                            </span>
                            <p className="text-gray-600 text-xs leading-relaxed">
                              {order?.delivery_address?.address_line1}, {order?.delivery_address?.city}, {order?.delivery_address?.state}, {order?.delivery_address?.country} - {order?.delivery_address?.pincode}
                              {order?.delivery_address?.landmark && (
                                <span className="block text-gray-500">Near: {order?.delivery_address?.landmark}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items (Expandable) */}
                      {isOpenOrderdProduct === index && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Order Items</h4>
                            <div className="space-y-2">
                              {order?.products?.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center gap-3 p-2 bg-white rounded-md border border-gray-100">
                                  <img
                                    src={item?.image}
                                    alt={item?.productTitle}
                                    className="w-12 h-12 object-cover rounded-md"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 text-sm line-clamp-1">{item?.productTitle}</h5>
                                    <p className="text-xs text-gray-500">ID: {item?._id?.slice(-8)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-medium text-gray-900 text-sm">Qty: {item?.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-sm">₹{item?.price}</p>
                                    <p className="text-xs text-gray-500">₹{(item?.price * item?.quantity)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 🚚 Delhivery Tracking Section */}
                      {isOpenOrderdProduct === index && order?.delhiveryWaybill && (
                        <div className="border-t border-gray-200 bg-blue-50">
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                              <span className="text-blue-600">🚚</span>
                              Shipment Tracking
                            </h4>
                            <DelhiveryTracking 
                              waybill={order.delhiveryWaybill} 
                              orderId={order._id} 
                            />
                          </div>
                        </div>
                      )}

                      {/* 🚚 Delhivery Tracking Section - No Waybill Yet */}
                      {isOpenOrderdProduct === index && !order?.delhiveryWaybill && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                              <span className="text-gray-500">📦</span>
                              Shipment Status
                            </h4>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-gray-500 text-lg">⏳</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">Order Processing</p>
                                  <p className="text-xs text-gray-600">Your order is being prepared for shipping. Tracking information will appear here once the package is shipped.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">No orders yet</h3>
                    <p className="text-sm text-gray-500">Your orders will appear here once you make a purchase.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {orders?.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex justify-center">
                    <Pagination
                      showFirstButton
                      showLastButton
                      count={orders?.totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                      size="medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Orders;
