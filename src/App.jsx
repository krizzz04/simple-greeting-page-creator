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
import About from "./Pages/About";


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
  const [openComparePanel, setOpenComparePanel] = useState(false);
  const [compareData, setCompareData] = useState([]);

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

  const toggleComparePanel = (newOpen) => () => {
    setOpenComparePanel(newOpen);
  };




  useEffect(() => {
    try {
      localStorage.removeItem("userEmail")
      const token = localStorage.getItem('accessToken');

      if (token !== undefined && token !== null && token !== "" && token !== "undefined" && token !== "null") {
        setIsLogin(true);
        // Fetch user data and cart items immediately
        getUserDetails();
        getCartItems();
        getMyListData();
        getCompareData();
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
      fetchDataFromApi("/api/user/user-details").then((res) => {
        if (res?.error === false) {
          setUserData(res?.data)
        } else {
          // If user details fetch fails, user might be logged out
          console.log('User details fetch failed, clearing auth state');
          handleLogout();
        }
      }).catch((error) => {
        console.error('Error fetching user details:', error);
        handleLogout();
      });
    } catch (error) {
      console.error('Error in getUserDetails:', error);
      handleLogout();
    }
  };

  const getCartItems = () => {
    try {
      fetchDataFromApi("/api/cart/get").then((res) => {
        console.log("🛒 Cart Items Response:", res);
        if (res?.error === false) {
          setCartData(res?.data)
          console.log("🛒 Cart Data Updated:", res?.data);
        }
      }).catch((error) => {
        console.error('Error fetching cart items:', error);
      });
    } catch (error) {
      console.error('Error in getCartItems:', error);
    }
  };

  const getMyListData = async () => {
    try {
      const response = await fetchDataFromApi('/api/myList/getMyList');
      if (response?.error === false) {
        setMyListData(response.data);
      }
    } catch (error) {
      console.error('Error fetching my list data:', error);
    }
  };

  const getCompareData = () => {
    try {
      const compareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
      setCompareData(compareItems);
    } catch (error) {
      console.error('Error loading compare data:', error);
      setCompareData([]);
    }
  };

  // Function to handle login and update all necessary state
  const handleLogin = (accessToken, refreshToken) => {
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setIsLogin(true);
      
      // Fetch user data and cart items
      getUserDetails();
      getCartItems();
      getMyListData();
    } catch (error) {
      console.error('Error in handleLogin:', error);
    }
  };

  // Function to handle logout and clear all state
  const handleLogout = () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      setIsLogin(false);
      setUserData(null);
      setCartData([]);
      setMyListData([]);
    } catch (error) {
      console.error('Error in handleLogout:', error);
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
      // Validate required fields
      if (!product.productTitle && !product.name) {
        alertBox("error", "Product title is missing");
        return;
      }
      if (!product.image) {
        alertBox("error", "Product image is missing");
        return;
      }
      if (product.rating === undefined || product.rating === null) {
        alertBox("error", "Product rating is missing");
        return;
      }
      if (!product.price) {
        alertBox("error", "Product price is missing");
        return;
      }
      if (product.countInStock === undefined || product.countInStock === null) {
        alertBox("error", "Product stock information is missing");
        return;
      }

      // Use the complete product object that contains all required fields
      const formData = {
        productId: product.productId || product._id,
        userId: userId,
        quantity: quantity,
        productTitle: product.productTitle || product.name,
        image: product.image,
        rating: product.rating || 0,
        price: product.price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        subTotal: product.subTotal,
        countInStock: product.countInStock,
        brand: product.brand,
        size: product.size,
        weight: product.weight,
        ram: product.ram
      };

      console.log("🛒 Adding to cart - Form data:", formData);

      postData("/api/cart/add", formData).then((res) => {
        console.log("🛒 Cart API Response:", res);
        if (res?.error === false) {
          alertBox("success", res?.message || "Product added to cart successfully");
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
    handleLogin,
    handleLogout,
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
    openSearchPanel,
    toggleComparePanel,
    openComparePanel,
    setOpenComparePanel,
    compareData,
    setCompareData,
    getCompareData
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
            <Route path={"/about"} exact={true} element={<About />} />
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
