
import React, { useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { Button } from "@mui/material";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../components/Badge";
import { FaAngleUp } from "react-icons/fa6";
import { fetchDataFromApi } from "../../utils/api";
import Pagination from "@mui/material/Pagination";

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
    <section className="py-8 lg:py-12 w-full bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 hidden lg:block">
            <AccountSidebar />
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                  <div className="text-sm text-gray-500">
                    Page {page} of {orders?.totalPages || 1}
                  </div>
                </div>
                <p className="text-gray-600">
                  You have <span className="font-semibold text-primary">{orders?.data?.length || 0}</span> orders
                </p>
              </div>

              {/* Orders List */}
              <div className="p-6 space-y-6">
                {orders?.data?.length !== 0 ? (
                  orders?.data?.map((order, index) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                      {/* Order Header */}
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              className="!w-10 !h-10 !min-w-10 !rounded-full !bg-white !shadow-sm !border !border-gray-200"
                              onClick={() => isShowOrderdProduct(index)}
                            >
                              {isOpenOrderdProduct === index ? 
                                <FaAngleUp className="text-gray-600" /> : 
                                <FaAngleDown className="text-gray-600" />
                              }
                            </Button>
                            <div>
                              <h3 className="font-semibold text-gray-900">Order #{order?._id?.slice(-8)}</h3>
                              <p className="text-sm text-gray-500">{order?.createdAt?.split("T")[0]}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-lg text-gray-900">₹{order?.totalAmt}</p>
                              <p className="text-sm text-gray-500">{order?.products?.length} items</p>
                            </div>
                            <Badge status={order?.order_status} />
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Customer</p>
                            <p className="text-gray-600">{order?.userId?.name}</p>
                            <p className="text-gray-500">{order?.userId?.email}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Contact</p>
                            <p className="text-gray-600">{order?.delivery_address?.mobile}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Payment</p>
                            <p className="text-gray-600 text-xs">
                              {order?.paymentId ? order?.paymentId : 'Cash on Delivery'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="font-medium text-gray-700 mb-2">Delivery Address</p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="inline-block text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded mb-2">
                              {order?.delivery_address?.addressType}
                            </span>
                            <p className="text-gray-600 text-sm leading-relaxed">
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
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                            <div className="space-y-3">
                              {order?.products?.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100">
                                  <img
                                    src={item?.image}
                                    alt={item?.productTitle}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 line-clamp-2">{item?.productTitle}</h5>
                                    <p className="text-sm text-gray-500">ID: {item?._id?.slice(-8)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-medium text-gray-900">Qty: {item?.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">₹{item?.price}</p>
                                    <p className="text-sm text-gray-500">₹{(item?.price * item?.quantity)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                    <p className="text-gray-500">Your orders will appear here once you make a purchase.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {orders?.totalPages > 1 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex justify-center">
                    <Pagination
                      showFirstButton
                      showLastButton
                      count={orders?.totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                      size="large"
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
