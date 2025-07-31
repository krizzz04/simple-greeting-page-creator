import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { BsFillBagCheckFill } from "react-icons/bs";
import { MyContext } from '../../App';
import { FaPlus } from "react-icons/fa6";
import Radio from '@mui/material/Radio';
import { deleteData, fetchDataFromApi, postData } from "../../utils/api";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const VITE_APP_RAZORPAY_KEY_ID = import.meta.env.VITE_APP_RAZORPAY_KEY_ID;
const VITE_APP_RAZORPAY_KEY_SECRET = import.meta.env.VITE_APP_RAZORPAY_KEY_SECRET;

const VITE_APP_PAYPAL_CLIENT_ID = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;
const VITE_API_URL = import.meta.env.VITE_API_URL;

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

const createGuestOrder = async (orderData) => {
  try {
    // For guest orders, store locally instead of sending to backend
    const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
    const newOrder = {
      ...orderData,
      orderId: 'GUEST_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    guestOrders.push(newOrder);
    localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
    
    // Send invoice to WhatsApp via Ultramsg API
    const message = createWhatsAppInvoice(newOrder);
    const phoneNumber = newOrder.delivery_address.mobile.replace(/\D/g, ''); // Remove non-digits
    
    if (phoneNumber) {
      const whatsappResult = await sendWhatsAppViaAPI(phoneNumber, message);
      if (whatsappResult.error) {
        console.error('WhatsApp sending failed:', whatsappResult.message);
      }
    }
    
    return { error: false, message: 'Order placed successfully! Invoice sent to WhatsApp.' };
  } catch (error) {
    console.error('Error:', error);
    return { error: true, message: 'Failed to create order' };
  }
};

const Checkout = () => {

  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [totalAmount, setTotalAmount] = useState();
  const [isLoading, setIsloading] = useState(false);
  const context = useContext(MyContext);

  const history = useNavigate();

  const [guestAddress, setGuestAddress] = useState({
    address_line1: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    mobile: '',
    addressType: '',
    landmark: ''
  });
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddressType, setGuestAddressType] = useState('');
  const [guestAddressValid, setGuestAddressValid] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setUserData(context?.userData)
    setSelectedAddress(context?.userData?.address_details[0]?._id);

  }, [context?.userData, userData])


  useEffect(() => {
    setTotalAmount(
      context.cartData?.length !== 0 ?
        context.cartData?.map(item => parseInt(item.price) * item.quantity)
          .reduce((total, value) => total + value, 0) : 0)
      ?.toLocaleString('en-US', { style: 'currency', currency: 'INR' }
      );

    // localStorage.setItem("totalAmount", context.cartData?.length !== 0 ?
    //   context.cartData?.map(item => parseInt(item.price) * item.quantity)
    //     .reduce((total, value) => total + value, 0) : 0)
    //   ?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })

  }, [context.cartData])


  useEffect(() => {
    setGuestAddressValid(validateGuestAddress());
  }, [guestAddress, guestPhone, guestAddressType]);


  useEffect(() => {

    // Load the PayPal JavaScript SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${VITE_APP_PAYPAL_CLIENT_ID}&disable-funding=card`;
    script.async = true;
    script.onload = () => {
      window.paypal
        .Buttons(
          {
            createOrder: async () => {

              // Create order on the server

              const resp = await fetch(
                "https://v6.exchangerate-api.com/v6/8f85eea95dae9336b9ea3ce9/latest/INR"
              );

              const respData = await resp.json();
              var convertedAmount = 0;

              if (respData.result === "success") {
                const usdToInrRate = respData.conversion_rates.USD;
                convertedAmount = (totalAmount * usdToInrRate).toFixed(2);
              }

              const headers = {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              }

              const data = {
                userId: context?.userData?._id,
                totalAmount: convertedAmount
              }


              const response = await axios.get(
                VITE_API_URL + `/api/order/create-order-paypal?userId=${data?.userId}&totalAmount=${data?.totalAmount}`, { headers }
              );

              return response?.data?.id; // Return order ID to PayPal

            },
            onApprove: async (data) => {
              onApprovePayment(data);
            },
            onError: (err) => {
              history("/order/failed");
              console.error("PayPal Checkout onError:", err);
            },
          })
        .render("#paypal-button-container");
    };
    document.body.appendChild(script);
  }, [context?.cartData, context?.userData, selectedAddress]);




  const onApprovePayment = async (data) => {
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
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
      'Content-Type': 'application/json', // Adjust the content type as needed
    }

    const response = await axios.post(
      VITE_API_URL + "/api/order/capture-order-paypal",
      {
        ...info,
        paymentId: data.orderID
      }, { headers }
    ).then((res) => {
      context.alertBox("success", res?.data?.message);
      history("/order/success");
      deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then((res) => {
        context?.getCartItems();
      })
    });


    if (response.data.success) {
      context.alertBox("success", "Order completed and saved to database!");
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


  const handleGuestAddressInput = (e) => {
    const { name, value } = e.target;
    setGuestAddress((prev) => ({ ...prev, [name]: value }));
  };
  const handleGuestAddressType = (e) => {
    setGuestAddressType(e.target.value);
    setGuestAddress((prev) => ({ ...prev, addressType: e.target.value }));
  };

  const validateGuestAddress = () => {
    if (!guestAddress.address_line1) return false;
    if (!guestAddress.city) return false;
    if (!guestAddress.state) return false;
    if (!guestAddress.pincode) return false;
    if (!guestAddress.country) return false;
    if (!guestPhone || guestPhone.length < 5) return false;
    if (!guestAddress.landmark) return false;
    if (!guestAddress.addressType) return false;
    return true;
  };


  const checkout = (e) => {
    e.preventDefault();

    // Prepare cart and address data for both guests and logged-in users
    let isGuest = !context?.userData;
    let products = context.cartData;
    let delivery_address = isGuest ? guestAddress : selectedAddress;
    let userName = isGuest ? guestAddress?.address_line1 : context?.userData?.name;

    if (isGuest) {
      if (!validateGuestAddress()) {
        context.alertBox('error', 'Please fill all address fields');
        return;
      }
    } else {
      if (userData?.address_details?.length === 0) {
        context.alertBox("error", "Please add address");
        return;
      }
    }

    // Razorpay payment logic for both guests and logged-in users
    var options = {
      key: VITE_APP_RAZORPAY_KEY_ID,
      key_secret: VITE_APP_RAZORPAY_KEY_SECRET,
      amount: parseInt(totalAmount * 100),
      currency: "INR",
      order_receipt: userName,
      name: "Advanced UI Techniques",
      description: "for testing purpose",
      handler: function (response) {
        const paymentId = response.razorpay_payment_id;
        const payLoad = {
          userId: isGuest ? 'guest-user' : context?.userData?._id,
          products: products,
          paymentId: paymentId,
          payment_status: "COMPLETED",
          delivery_address: delivery_address,
          totalAmt: totalAmount,
          date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        };
        if (isGuest) {
          createGuestOrder(payLoad).then((res) => {
            context.alertBox("success", res?.message);
            if (res?.error === false) {
              localStorage.removeItem('guestCart');
              context.setCartData([]);
              history("/order/success");
            } else {
              history("/order/failed");
              context.alertBox("error", res?.message);
            }
          });
        } else {
          postData(`/api/order/create`, payLoad).then((res) => {
            context.alertBox("success", res?.message);
            if (res?.error === false) {
              deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then((res) => {
                context?.getCartItems();
              })
              history("/order/success");
            } else {
              history("/order/failed");
              context.alertBox("error", res?.message);
            }
          });
        }
      },
      theme: {
        color: "#ff5252",
      },
    };
    var pay = new window.Razorpay(options);
    pay.open();
  }


  const cashOnDelivery = () => {

    const user = context?.userData
    setIsloading(true);

    if (userData?.address_details?.length !== 0) {
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


      postData(`/api/order/create`, payLoad).then((res) => {
        context.alertBox("success", res?.message);

        if (isGuest) {
          createGuestOrder(payLoad).then((res) => {
            context.alertBox("success", res?.message);
            if (res?.error === false) {
              localStorage.removeItem('guestCart');
              context.setCartData([]);
              history("/order/success");
            } else {
              history("/order/failed");
              context.alertBox("error", res?.message);
            }
          });
        } else {
          postData(`/api/order/create`, payLoad).then((res) => {
            context.alertBox("success", res?.message);
            if (res?.error === false) {
              deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then((res) => {
                context?.getCartItems();
              })
              history("/order/success");
            } else {
              history("/order/failed");
              context.alertBox("error", res?.message);
            }
          });
        }
      });
    } else {
      context.alertBox("error", "Please add address");
      setIsloading(false);
    }



  }

  return (
    <section className="py-3 lg:py-10 px-3">
      <form onSubmit={checkout}>
        <div className="w-full lg:w-[70%] m-auto flex flex-col md:flex-row gap-5">
          <div className="leftCol w-full md:w-[60%]">
            <div className="card bg-white shadow-md p-5 rounded-md w-full">
              <div className="flex items-center justify-between">
                <h2>{context?.userData ? 'Select Delivery Address' : 'Enter Delivery Address'}</h2>
                {
                  userData?.address_details?.length !== 0 &&
                  <Button variant="outlined"
                    onClick={() => {
                      context?.setOpenAddressPanel(true);
                      context?.setAddressMode("add");
                    }} className="btn">
                    <FaPlus />
                    ADD {context?.windowWidth< 767 ? '' : 'NEW ADDRESS'}
                  </Button>
                }

              </div>

              <br />

              <div className="flex flex-col gap-4">


                {
                  context?.userData ? (
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

   
                            <p className="mb-0 font-[500]">{userData?.mobile !== null ? '+'+userData?.mobile : '+'+address?.mobile}</p>
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

                  ) : (
                    // Guest address form
                    <>
                      <TextField className="w-full" label="Address Line 1" variant="outlined" size="small" name="address_line1" onChange={handleGuestAddressInput} value={guestAddress.address_line1} />
                      <TextField className="w-full" label="City" variant="outlined" size="small" name="city" onChange={handleGuestAddressInput} value={guestAddress.city} />
                      <TextField className="w-full" label="State" variant="outlined" size="small" name="state" onChange={handleGuestAddressInput} value={guestAddress.state} />
                      <TextField className="w-full" label="Pincode" variant="outlined" size="small" name="pincode" onChange={handleGuestAddressInput} value={guestAddress.pincode} />
                      <TextField className="w-full" label="Country" variant="outlined" size="small" name="country" onChange={handleGuestAddressInput} value={guestAddress.country} />
                      <PhoneInput defaultCountry="in" value={guestPhone} onChange={(phone) => {
                        setGuestPhone(phone);
                        setGuestAddress((prev) => ({ ...prev, mobile: phone }));
                      }} />
                      <TextField className="w-full" label="Landmark" variant="outlined" size="small" name="landmark" onChange={handleGuestAddressInput} value={guestAddress.landmark} />
                      <div className="flex gap-5 pb-5 flex-col">
                        <FormControl>
                          <FormLabel>Address Type</FormLabel>
                          <RadioGroup row className="flex items-center gap-5" value={guestAddressType} onChange={handleGuestAddressType}>
                            <FormControlLabel value="Home" control={<Radio />} label="Home" />
                            <FormControlLabel value="Office" control={<Radio />} label="Office" />
                          </RadioGroup>
                        </FormControl>
                      </div>
                    </>
                  )
                }

              </div>


            </div>
          </div>

          <div className="rightCol w-full  md:w-[40%]">
            <div className="card shadow-md bg-white p-5 rounded-md">
              <h2 className="mb-4">Your Order</h2>

              <div className="flex items-center justify-between py-3 border-t border-b border-[rgba(0,0,0,0.1)]">
                <span className="text-[14px] font-[600]">Product</span>
                <span className="text-[14px] font-[600]">Subtotal</span>
              </div>

              <div className="mb-5 scroll max-h-[250px] overflow-y-scroll overflow-x-hidden pr-2">

                {
                  context?.cartData?.length !== 0 && context?.cartData?.map((item, index) => {
                    return (
                      <div className="flex items-center justify-between py-2" key={index}>
                        <div className="part1 flex items-center gap-3">
                          <div className="img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer">
                            <img
                              src={item?.image}
                              className="w-full transition-all group-hover:scale-105"
                            />
                          </div>

                          <div className="info">
                            <h4 className="text-[14px]" title={item?.productTitle}>{item?.productTitle?.substr(0, 20) + '...'} </h4>
                            <span className="text-[13px]">Qty : {item?.quantity}</span>
                          </div>
                        </div>

                        <span className="text-[14px] font-[500]">{(item?.quantity * item?.price)?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</span>
                      </div>
                    )
                  })
                }



              </div>

              <div className="flex items-center flex-col gap-3 mb-2">
                <Button type="submit" className="btn-org btn-lg w-full flex gap-2 items-center"><BsFillBagCheckFill className="text-[20px]" /> Checkout</Button>

                <div id="paypal-button-container" className={`${userData?.address_details?.length === 0 ? 'pointer-events-none' : ''}`}></div>

                <Button type="button" className="btn-dark btn-lg w-full flex gap-2 items-center" onClick={cashOnDelivery}>
                  {
                    isLoading === true ? <CircularProgress /> :
                      <>
                        <BsFillBagCheckFill className="text-[20px]" />
                        Cash on Delivery
                      </>
                  }
                </Button>
              </div>

            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Checkout;
