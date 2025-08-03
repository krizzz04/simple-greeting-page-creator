import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "./responsive.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import { ProductDetails } from "./Pages/ProductDetails";
import { createContext } from "react";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CartPage from "./Pages/Cart";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import Checkout from "./Pages/Checkout";
import MyAccount from "./Pages/MyAccount";
import MyList from "./Pages/MyList";
import Orders from "./Pages/Orders";

import toast, { Toaster } from 'react-hot-toast';
import { fetchDataFromApi, postData } from "./utils/api";
import Address from "./Pages/MyAccount/address";
import { OrderSuccess } from "./Pages/Orders/success";
import { OrderFailed } from "./Pages/Orders/failed";
import SearchPage from "./Pages/Search";


const MyContext = createContext();

function App() {
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState({
    open: false,
    item: {}
  });
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [catData, setCatData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [myListData, setMyListData] = useState([]);

  const [openCartPanel, setOpenCartPanel] = useState(false);
  const [openAddressPanel, setOpenAddressPanel] = useState(false);

  const [addressMode, setAddressMode] = useState("add");
  const [addressId, setAddressId] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [openFilter, setOpenFilter] = useState(false);
  const [isFilterBtnShow, setisFilterBtnShow] = useState(false);

  const [openSearchPanel, setOpenSearchPanel] = useState(false);

  const handleOpenProductDetailsModal = (status, item) => {
    setOpenProductDetailsModal({
      open: status,
      item: item
    });
  }

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal({
      open: false,
      item: {}
    });
  };

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  const toggleAddressPanel = (newOpen) => () => {
    if (newOpen == false) {
      setAddressMode("add");
    }

    setOpenAddressPanel(newOpen);
  };




  useEffect(() => {
    try {
      localStorage.removeItem("userEmail")
      const token = localStorage.getItem('accessToken');

      if (token !== undefined && token !== null && token !== "" && token !== "undefined" && token !== "null") {
        setIsLogin(true);
        // Add a small delay to ensure tokens are properly set
        setTimeout(() => {
          // Double check token is still valid
          const currentToken = localStorage.getItem('accessToken');
          if (currentToken && currentToken !== "undefined" && currentToken !== "null") {
            getCartItems();
            getMyListData();
            getUserDetails();
          } else {
            setIsLogin(false);
          }
        }, 100);
      } else {
        setIsLogin(false);
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
    try {
      fetchDataFromApi("/api/category").then((res) => {
        if (res?.error === false) {
          setCatData(res?.data)
        }
      }).catch((error) => {
        console.error('Error fetching categories:', error);
      });
    } catch (error) {
      console.error('Error in category fetch:', error);
    }
  }, []);

  const getUserDetails = () => {
    try {
      fetchDataFromApi("/api/user/profile").then((res) => {
        if (res?.error === false) {
          setUserData(res?.data)
        }
      }).catch((error) => {
        console.error('Error fetching user details:', error);
      });
    } catch (error) {
      console.error('Error in getUserDetails:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const alertBox = (type, msg) => {
    if (type === "success") {
      toast.success(msg);
    } else if (type === "error") {
      toast.error(msg);
    } else if (type === "warning") {
      toast(msg, {
        icon: '⚠️',
      });
    }
  };

  const addToCart = (product, userId, quantity) => {
    try {
      const formData = {
        productId: product._id,
        userId: userId,
        quantity: quantity
      };

      postData("/api/cart/add", formData).then((res) => {
        if (res?.error === false) {
          alertBox("success", "Product added to cart successfully");
          getCartItems();
        } else {
          alertBox("error", res?.message || "Failed to add product to cart");
        }
      }).catch((error) => {
        console.error('Error adding to cart:', error);
        alertBox("error", "Failed to add product to cart");
      });
    } catch (error) {
      console.error('Error in addToCart:', error);
      alertBox("error", "Failed to add product to cart");
    }
  };

  const getCartItems = () => {
    try {
      fetchDataFromApi("/api/cart").then((res) => {
        if (res?.error === false) {
          setCartData(res?.data)
        }
      }).catch((error) => {
        console.error('Error fetching cart items:', error);
      });
    } catch (error) {
      console.error('Error in getCartItems:', error);
    }
  };

  const getMyListData = () => {
    try {
      fetchDataFromApi("/api/myList").then((res) => {
        if (res?.error === false) {
          setMyListData(res?.data)
        }
      }).catch((error) => {
        console.error('Error fetching my list data:', error);
      });
    } catch (error) {
      console.error('Error in getMyListData:', error);
    }
  }

  const values = {
    openProductDetailsModal,
    setOpenProductDetailsModal,
    handleOpenProductDetailsModal,
    handleCloseProductDetailsModal,
    setOpenCartPanel,
    toggleCartPanel,
    openCartPanel,
    setOpenAddressPanel,
    toggleAddressPanel,
    openAddressPanel,
    isLogin,
    setIsLogin,
    alertBox,
    setUserData,
    userData,
    setCatData,
    catData,
    addToCart,
    cartData,
    setCartData,
    getCartItems,
    myListData,
    setMyListData,
    getMyListData,
    getUserDetails,
    setAddressMode,
    addressMode,
    addressId,
    setAddressId,
    setSearchData,
    searchData,
    windowWidth,
    setOpenFilter,
    openFilter,
    setisFilterBtnShow,
    isFilterBtnShow,
    setOpenSearchPanel,
    openSearchPanel
  };

  return (
    <>
      <BrowserRouter>
        <MyContext.Provider value={values}>
          <Header />
          <Routes>
            <Route path={"/"} exact={true} element={<Home />} />
            <Route
              path={"/products"}
              exact={true}
              element={<ProductListing />}
            />
            <Route
              path={"/product/:id"}
              exact={true}
              element={<ProductDetails />}
            />
            <Route path={"/login"} exact={true} element={<Login />} />
            <Route path={"/register"} exact={true} element={<Register />} />
            <Route path={"/cart"} exact={true} element={<CartPage />} />
            <Route path={"/verify"} exact={true} element={<Verify />} />
            <Route path={"/forgot-password"} exact={true} element={<ForgotPassword />} />
            <Route path={"/checkout"} exact={true} element={<Checkout />} />
            <Route path={"/my-account"} exact={true} element={<MyAccount />} />
            <Route path={"/my-list"} exact={true} element={<MyList />} />
            <Route path={"/my-orders"} exact={true} element={<Orders />} />
            <Route path={"/order/success"} exact={true} element={<OrderSuccess />} />
            <Route path={"/order/failed"} exact={true} element={<OrderFailed />} />
            <Route path={"/address"} exact={true} element={<Address />} />
            <Route path={"/search"} exact={true} element={<SearchPage />} />
          </Routes>
          <Footer />
        </MyContext.Provider>
      </BrowserRouter>





      <Toaster />


    </>
  );
}

export default App;

export { MyContext };
