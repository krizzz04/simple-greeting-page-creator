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

const VITE_APP_RAZORPAY_KEY_ID = import.meta.env.VITE_APP_RAZORPAY_KEY_ID;
const VITE_APP_RAZORPAY_KEY_SECRET = import.meta.env.VITE_APP_RAZORPAY_KEY_SECRET;

const VITE_APP_PAYPAL_CLIENT_ID = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;
const VITE_API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {

  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [totalAmount, setTotalAmount] = useState();
  const [isLoading, setIsloading] = useState(false);
  const context = useContext(MyContext);

  const history = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is authenticated
    if (!context?.userData) {
      context?.alertBox("error", "Please login first to access checkout");
      history("/login");
      return;
    }
    
    setUserData(context?.userData)
    if (context?.userData?.address_details && context?.userData?.address_details.length > 0) {
        setSelectedAddress(context?.userData?.address_details[0]?._id);
    }
  }, [context?.userData])


  useEffect(() => {
    setTotalAmount(
      context.cartData?.length !== 0 ?
        context.cartData?.map(item => parseInt(item.price) * item.quantity)
          .reduce((total, value) => total + value, 0) : 0)
  }, [context.cartData])





  useEffect(() => {
    if (!VITE_APP_PAYPAL_CLIENT_ID) return;
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
  }, [context?.cartData, context?.userData, selectedAddress, totalAmount]);




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
            
            // Send all three notifications
            sendSmsMessage(user, info, deliveryAddressObject, fullOrderId);
            sendWhatsAppMessage(user, info, deliveryAddressObject, fullOrderId);
            sendWhatsAppConfirmationMessage(user, deliveryAddressObject);
            
            history("/order/success");
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

    if (userData?.address_details?.length !== 0) {
      var options = {
        key: VITE_APP_RAZORPAY_KEY_ID,
        key_secret: VITE_APP_RAZORPAY_KEY_SECRET,
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


          postData(`/api/order/create`, payLoad).then((res) => {
            if (res?.error === false) {
              context.alertBox("success", res?.message);
              
              const newOrder = res?.data || res?.order || res;
              const fullOrderId = newOrder?._id;
              
              // Get the delivery address object
              const deliveryAddressObject = userData.address_details.find(addr => addr._id === selectedAddress);
              
              // Send all three notifications
              sendSmsMessage(user, payLoad, deliveryAddressObject, fullOrderId);
              sendWhatsAppMessage(user, payLoad, deliveryAddressObject, fullOrderId);
              sendWhatsAppConfirmationMessage(user, deliveryAddressObject);
              
              deleteData(`/api/cart/emptyCart/${user?._id}`).then(() => {
                context?.getCartItems();
              })
              history("/order/success");
            } else {
              context.alertBox("error", res?.message);
              history("/order/failed");
            }
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
    }

  }



  const cashOnDelivery = () => {
    const user = context?.userData;
    setIsloading(true);

    if (!userData?.address_details || userData.address_details.length === 0) {
        context.alertBox("error", "Please add a delivery address first.");
        setIsloading(false);
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

    postData(`/api/order/create`, payLoad).then((res) => {
        if (res?.error === false) {
            context.alertBox("success", res?.message);
            
            const newOrder = res?.data || res?.order || res;
            const fullOrderId = newOrder?._id;

            // Send all three notifications
            sendSmsMessage(user, payLoad, deliveryAddressObject, fullOrderId);
            sendWhatsAppMessage(user, payLoad, deliveryAddressObject, fullOrderId);
            sendWhatsAppConfirmationMessage(user, deliveryAddressObject);

            deleteData(`/api/cart/emptyCart/${user?._id}`).then(() => {
                context?.getCartItems();
            });
            history("/order/success");
        } else {
            context.alertBox("error", res?.message);
            history("/order/failed");
        }
    }).finally(() => {
        setIsloading(false);
    });
  }

  const sendSmsMessage = (user, orderDetails, deliveryAddress, fullOrderId) => {
      const mobileNumber = deliveryAddress?.mobile || user?.mobile;

      if (!mobileNumber) {
          console.error("Cannot send SMS. Mobile number is missing.");
          return;
      }

      const accountSid = 'ACf74e64cff1951f00979bd00c78d44cba';
      const authToken = '496fb1f1959ff3d6ce5a82cdcc7a157e';
      const twilioPhoneNumber = '+17692012048';

      // Format phone number properly - handle various formats
      let recipientPhoneNumber = mobileNumber.toString().trim();
      
      // If it already has a country code (starts with +), use as is
      if (recipientPhoneNumber.startsWith('+')) {
          // Already formatted, use as is
      } else if (recipientPhoneNumber.startsWith('91') && recipientPhoneNumber.length === 12) {
          // Number starts with 91 and is 12 digits (91 + 10 digits), add + prefix
          recipientPhoneNumber = `+${recipientPhoneNumber}`;
      } else {
          // Remove any leading zeros and add +91 for India
          const cleanPhone = recipientPhoneNumber.replace(/^0+/, '');
          recipientPhoneNumber = `+91${cleanPhone}`;
      }

      const shortOrderId = fullOrderId ? fullOrderId.slice(-8) : '';
      const orderIdString = shortOrderId ? ` #${shortOrderId}` : '';

      const messageBody = `Hello ${user.name}, your order${orderIdString} has been placed successfully! Total: ₹${orderDetails.totalAmt}. Payment: ${orderDetails.payment_status}.`;

      const messageData = new URLSearchParams();
      messageData.append('To', recipientPhoneNumber);
      messageData.append('From', twilioPhoneNumber);
      messageData.append('Body', messageBody);

      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const headers = {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      axios.post(url, messageData, { headers })
        .then(response => {
          console.log('SMS message sent successfully! SID:', response.data.sid);
        })
        .catch(error => {
          console.error('Error sending SMS message:', error.response ? error.response.data : error.message);
        });
  };

  const sendWhatsAppMessage = (user, orderDetails, deliveryAddress, fullOrderId) => {
    const mobileNumber = deliveryAddress?.mobile || user?.mobile;

    if (!mobileNumber) {
        console.error("Cannot send WhatsApp. Mobile number is missing.");
        return;
    }

    const accountSid = 'ACf74e64cff1951f00979bd00c78d44cba';
    const authToken = '496fb1f1959ff3d6ce5a82cdcc7a157e';
    const contentSid = 'HX350d429d32e64a552466cafecbe95f3c';

    // Format phone number properly - handle various formats
    let recipientPhoneNumber = mobileNumber.toString().trim();
    
    // If it already has a country code (starts with +), use as is
    if (recipientPhoneNumber.startsWith('+')) {
        // Already formatted, use as is
    } else if (recipientPhoneNumber.startsWith('91') && recipientPhoneNumber.length === 12) {
        // Number starts with 91 and is 12 digits (91 + 10 digits), add + prefix
        recipientPhoneNumber = `+${recipientPhoneNumber}`;
    } else {
        // Remove any leading zeros and add +91 for India
        const cleanPhone = recipientPhoneNumber.replace(/^0+/, '');
        recipientPhoneNumber = `+91${cleanPhone}`;
    }

    const shortOrderId = fullOrderId ? fullOrderId.slice(-8) : 'N/A';
    const contentVariables = JSON.stringify({
        '1': user.name,
        '2': shortOrderId
    });

    const messageData = new URLSearchParams();
    messageData.append('From', 'whatsapp:+14155238886');
    messageData.append('To', `whatsapp:${recipientPhoneNumber}`);
    messageData.append('ContentSid', contentSid);
    messageData.append('ContentVariables', contentVariables);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const headers = {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    axios.post(url, messageData, { headers })
        .then(response => {
            console.log('WhatsApp template message sent successfully! SID:', response.data.sid);
        })
        .catch(error => {
            console.error('Error sending WhatsApp template message:', error.response ? error.response.data : error.message);
        });
  };

  const sendWhatsAppConfirmationMessage = (user, deliveryAddress) => {
    const mobileNumber = deliveryAddress?.mobile || user?.mobile;

    if (!mobileNumber) {
        console.error("Cannot send WhatsApp confirmation. Mobile number is missing.");
        return;
    }

    const accountSid = 'ACf74e64cff1951f00979bd00c78d44cba';
    const authToken = '496fb1f1959ff3d6ce5a82cdcc7a157e';

    // Format phone number properly - handle various formats
    let recipientPhoneNumber = mobileNumber.toString().trim();
    
    // If it already has a country code (starts with +), use as is
    if (recipientPhoneNumber.startsWith('+')) {
        // Already formatted, use as is
    } else if (recipientPhoneNumber.startsWith('91') && recipientPhoneNumber.length === 12) {
        // Number starts with 91 and is 12 digits (91 + 10 digits), add + prefix
        recipientPhoneNumber = `+${recipientPhoneNumber}`;
    } else {
        // Remove any leading zeros and add +91 for India
        const cleanPhone = recipientPhoneNumber.replace(/^0+/, '');
        recipientPhoneNumber = `+91${cleanPhone}`;
    }

    const messageBody = 'Your Order Is Confirmed, Check Our Website To Track Your Order www.test.com';

    const messageData = new URLSearchParams();
    messageData.append('From', 'whatsapp:+14155238886');
    messageData.append('To', `whatsapp:${recipientPhoneNumber}`);
    messageData.append('Body', messageBody);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const headers = {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    axios.post(url, messageData, { headers })
        .then(response => {
            console.log('WhatsApp confirmation message sent successfully! SID:', response.data.sid);
        })
        .catch(error => {
            console.error('Error sending WhatsApp confirmation message:', error.response ? error.response.data : error.message);
            // Check for the specific error related to the 24-hour window
            if (error.response && error.response.data && error.response.data.code === 63016) {
                 console.warn("Twilio Warning: The free-form WhatsApp message failed, likely because the 24-hour window to reply to the user has closed. Only template messages can be sent outside this window.");
            }
        });
  };

  return (
    <section className="py-3 lg:py-10 px-3">
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
                              alt={item?.productTitle}
                              className="w-full transition-all group-hover:scale-105"
                            />
                          </div>

                          <div className="info">
                            <h4 className="text-[14px]" title={item?.productTitle}>{item?.productTitle?.substr(0, 20) + '...'} </h4>
                            <span className="text-[13px]">Qty : {item?.quantity}</span>
                          </div>
                        </div>

                        <span className="text-[14px] font-[500]">{`₹${(item?.quantity * item?.price)}`}</span>
                      </div>
                    )
                  })
                }



              </div>

              <div className="flex items-center flex-col gap-3 mb-2">
                <Button type="submit" className="btn-org btn-lg w-full flex gap-2 items-center" disabled={!userData?.address_details || userData.address_details.length === 0}><BsFillBagCheckFill className="text-[20px]" /> Checkout</Button>

                <div id="paypal-button-container" className={(!userData?.address_details || userData.address_details.length === 0) ? 'pointer-events-none' : ''}></div>

                <Button type="button" className="btn-dark btn-lg w-full flex gap-2 items-center" onClick={cashOnDelivery} disabled={isLoading}>
                  {
                    isLoading ? <CircularProgress size={24} color="inherit" /> :
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