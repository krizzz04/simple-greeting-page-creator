import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HomeSlider from "../../components/HomeSlider";
import HomeCatSlider from "../../components/HomeCatSlider";
import { LiaShippingFastSolid } from "react-icons/lia";
import { FiTrendingUp, FiStar, FiZap, FiGrid, FiHeart, FiShoppingCart } from "react-icons/fi";
import { IoFlashOutline, IoGiftOutline, IoDiamondOutline } from "react-icons/io5";
import AdsBannerSlider from "../../components/AdsBannerSlider";
import AdsBannerSliderV2 from "../../components/AdsBannerSliderV2";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ProductsSlider from "../../components/ProductsSlider";

import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination, Mousewheel, Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import 'swiper/css/free-mode';
import "swiper/css/navigation";

import BlogItem from "../../components/BlogItem";
import HomeBannerV2 from "../../components/HomeSliderV2";
import BannerBoxV2 from "../../components/bannerBoxV2";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductLoading from "../../components/ProductLoading";
import BannerLoading from "../../components/LoadingSkeleton/bannerLoading";
import ProductItem from "../../components/ProductItem";

const Home = () => {
  const [value, setValue] = useState(0);
  const [homeSlidesData, setHomeSlidesData] = useState([]);
  const [popularProductsData, setPopularProductsData] = useState([]);
  const [productsData, setAllProductsData] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bannerV1Data, setBannerV1Data] = useState([]);
  const [bannerList2Data, setBannerList2Data] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [randomCatProducts, setRandomCatProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const context = useContext(MyContext);
  const navigate = useNavigate();

  // Mobile-optimized animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoaded(true);

    fetchDataFromApi("/api/homeSlides").then((res) => {
      setHomeSlidesData(res?.data)
    })
    fetchDataFromApi("/api/product/getAllProducts").then((res) => {
      setAllProductsData(res?.products)
    })

    fetchDataFromApi("/api/product/getAllFeaturedProducts").then((res) => {
      setFeaturedProducts(res?.products)
    })

    fetchDataFromApi("/api/bannerV1").then((res) => {
      setBannerV1Data(res?.data);
    });

    fetchDataFromApi("/api/bannerList2").then((res) => {
      setBannerList2Data(res?.data);
    });

    fetchDataFromApi("/api/blog").then((res) => {
      setBlogData(res?.blogs);
    });
  }, [])

  useEffect(() => {
    if (context?.catData?.length !== 0) {
      fetchDataFromApi(`/api/product/getAllProductsByCatId/${context?.catData[0]?._id}`).then((res) => {
        if (res?.error === false) {
          setPopularProductsData(res?.products)
        }
      })
    }
  }, [context?.catData])

  useEffect(() => {
    if (context?.catData?.length !== 0) {
      const randomCats = context?.catData?.slice(0, 3);
      const promises = randomCats?.map((cat) =>
        fetchDataFromApi(`/api/product/getAllProductsByCatId/${cat?._id}`).then((res) => {
          if (res?.error === false) {
            return {
              catName: cat?.name,
              data: res?.products?.slice(0, 6)
            }
          }
          return null;
        })
      );

      Promise.all(promises).then((results) => {
        const validResults = results?.filter((result) => result !== null);
        setRandomCatProducts(validResults);
      });
    }
  }, [context?.catData])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const filterByCatId = (catId) => {
    fetchDataFromApi(`/api/product/getAllProductsByCatId/${catId}`).then((res) => {
      if (res?.error === false) {
        setPopularProductsData(res?.products)
      }
    })
  }

  const handleBuyNow = (item) => {
    // Check authentication more thoroughly
    const token = localStorage.getItem('accessToken');
    if (token && context?.isLogin && context?.userData && context?.userData._id) {
      // Show loading message
      context.alertBox("success", "Adding to cart and redirecting to checkout...");
      
      // Add to cart first
      const cartData = {
        productId: item._id,
        userId: context.userData._id,
        productTitle: item.name,
        image: item.images?.[0],
        price: item.price,
        oldPrice: item.oldPrice,
        discount: item.discount,
        rating: item.rating || 0,
        countInStock: item.stock || item.countInStock || 10,
        subTotal: item.price * 1
      };
      
      // Add to cart and then navigate after a longer delay
      context.addToCart(cartData, context.userData._id, 1);
      
      // Wait for cart to be updated (5 seconds should be enough)
      setTimeout(() => {
        navigate('/checkout');
      }, 5000);
    } else {
      context.alertBox("error", "Please login to purchase products");
    }
  }

  return (
    <>
      {/* MOBILE-FIRST STYLES */}
      <style jsx global>{`
        /* Mobile-first design system */
        .mobile-home {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }

        /* Hero Section */
        .mobile-hero {
          position: relative;
          margin-bottom: 20px;
        }

        .mobile-hero .swiper {
          border-radius: 0 0 20px 20px;
          overflow: hidden;
        }

        /* Categories Section */
        .mobile-categories {
          margin: 0 16px 20px 16px;
        }

        .mobile-categories .swiper {
          border-radius: 12px;
          overflow: hidden;
        }

        .mobile-categories .swiper-slide {
          border-radius: 12px;
          overflow: hidden;
        }

        /* Products Grid */
        .mobile-products-section {
          margin: 0 16px 20px 16px;
        }

        .mobile-products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 0;
        }

        .mobile-product-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }

        .mobile-product-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .mobile-product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #8b5cf6);
          transform: scaleX(0);
          transition: transform 0.4s ease;
          z-index: 3;
        }

        .mobile-product-card:hover::before {
          transform: scaleX(1);
        }

        .mobile-product-image {
          aspect-ratio: 1;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
          overflow: hidden;
        }

        .mobile-product-image::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .mobile-product-card:hover .mobile-product-image::after {
          transform: translateX(100%);
        }

        .mobile-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-product-card:hover .mobile-product-image img {
          transform: scale(1.1) rotate(2deg);
        }

        .mobile-product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 12px;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }

        .mobile-product-card:hover .mobile-product-badge {
          transform: scale(1.1);
        }

        .mobile-product-content {
          padding: 16px;
          position: relative;
        }

        .mobile-product-title {
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.4;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s ease;
        }

        .mobile-product-card:hover .mobile-product-title {
          color: #3b82f6;
        }

        .mobile-product-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .mobile-product-price .current {
          font-size: 18px;
          font-weight: 800;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mobile-product-price .old {
          font-size: 13px;
          color: #9ca3af;
          text-decoration: line-through;
          font-weight: 500;
        }

        .mobile-product-actions {
          display: flex;
          gap: 8px;
          opacity: 0.95;
          transition: opacity 0.3s ease;
          margin-top: 8px;
          width: 100%;
        }

        .mobile-product-card:hover .mobile-product-actions {
          opacity: 1;
        }

        .mobile-product-actions > * {
          flex: 1;
          min-width: 0;
        }

        .mobile-btn {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid transparent;
          border-radius: 25px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          font-family: inherit;
          outline: none;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .mobile-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
          pointer-events: none;
        }

        .mobile-btn:hover::before {
          left: 100%;
        }

        .mobile-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
        }

        .mobile-btn-primary:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
          color: white !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5) !important;
        }

        .mobile-btn-secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
          color: white !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 6px 20px rgba(240, 147, 251, 0.4) !important;
        }

        .mobile-btn-secondary:hover {
          background: linear-gradient(135deg, #e91e63 0%, #f44336 100%) !important;
          color: white !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(240, 147, 251, 0.5) !important;
        }

        .mobile-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .mobile-btn:active {
          transform: translateY(-1px);
          transition: transform 0.1s ease;
        }

        .mobile-btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }

        /* Ensure buttons are visible and properly styled */
        .mobile-product-actions .mobile-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          font-family: inherit;
          outline: none;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          background: transparent;
        }

        /* Force button visibility and styling */
        .mobile-product-actions button.mobile-btn {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 25px !important;
          padding: 12px 16px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          text-transform: uppercase !important;
          letter-spacing: 0.8px !important;
          min-height: 44px !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
        }

        .mobile-product-actions button.mobile-btn.mobile-btn-secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
          box-shadow: 0 6px 20px rgba(240, 147, 251, 0.4) !important;
        }

        /* Section Headers */
        .mobile-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding: 0 4px;
        }

        .mobile-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .mobile-section-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        .mobile-view-all {
          font-size: 13px;
          font-weight: 600;
          color: #2563eb;
          text-decoration: none;
        }

        /* Banner Sections */
        .mobile-banner {
          margin: 0 16px 20px 16px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        /* Desktop overrides */
        @media (min-width: 768px) {
          .mobile-home {
            background: white;
          }
          
          .mobile-categories,
          .mobile-products-section,
          .mobile-banner {
            margin: 0 0 30px 0;
          }
          
          .mobile-products-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }

          .mobile-btn {
            padding: 14px 18px;
            font-size: 13px;
            min-height: 48px;
          }

          .mobile-product-actions {
            gap: 10px;
          }
        }

        @media (min-width: 1024px) {
          .mobile-products-grid {
            grid-template-columns: repeat(5, 1fr);
          }

          .mobile-btn {
            padding: 16px 20px;
            font-size: 14px;
            min-height: 52px;
          }
        }

        /* Mobile specific improvements */
        @media (max-width: 767px) {
          .mobile-btn {
            padding: 10px 12px;
            font-size: 11px;
            min-height: 40px;
          }

          .mobile-product-actions {
            gap: 6px;
          }
        }
      `}</style>

      <div className="mobile-home">
        {/* Hero Section */}
        <motion.section 
          className="mobile-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {homeSlidesData?.length === 0 && <BannerLoading />}
          {homeSlidesData?.length !== 0 && <HomeSlider data={homeSlidesData} />}
        </motion.section>

        {/* All Products - First Section */}
        <motion.section 
          className="mobile-products-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div className="mobile-section-header" variants={fadeInUp}>
            <div>
              <h2 className="mobile-section-title">All Products</h2>
              <p className="mobile-section-subtitle">Explore our complete collection</p>
            </div>
            <a href="#" className="mobile-view-all">View All</a>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            {productsData?.length === 0 && <ProductLoading />}
            {productsData?.length !== 0 && (
              <div className="mobile-products-grid">
                {productsData?.slice(0, 8).map((item, index) => (
                  <motion.div 
                    key={index}
                    className="mobile-product-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                    onClick={() => navigate(`/product/${item._id}`)}
                  >
                    {item?.discount > 0 && (
                      <motion.div 
                        className="mobile-product-badge"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        -{item.discount}%
                      </motion.div>
                    )}
                    <div className="mobile-product-image">
                      <motion.img 
                        src={item?.images?.[0] || "/homeBannerPlaceholder.jpg"} 
                        alt={item?.name || "Product"}
                        loading="lazy"
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 2,
                          transition: { duration: 0.3 }
                        }}
                      />
                    </div>
                    <div className="mobile-product-content">
                      <motion.h3 
                        className="mobile-product-title"
                        whileHover={{ color: "#3b82f6" }}
                      >
                        {item?.name || "Product Name"}
                      </motion.h3>
                      <div className="mobile-product-price">
                        <span className="current">₹{item?.price || 0}</span>
                        {item?.oldPrice && item?.oldPrice > item?.price && (
                          <span className="old">₹{item.oldPrice}</span>
                        )}
                      </div>
                      <div className="mobile-product-actions" onClick={(e) => e.stopPropagation()}>
                        <motion.button 
                          className="mobile-btn mobile-btn-primary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (context?.isLogin && context?.userData) {
                              const cartData = {
                                productId: item._id,
                                userId: context.userData._id,
                                productTitle: item.name,
                                image: item.images?.[0],
                                price: item.price,
                                oldPrice: item.oldPrice,
                                discount: item.discount,
                                rating: item.rating || 0,
                                countInStock: item.stock || item.countInStock || 10,
                                subTotal: item.price * 1
                              };
                              context.addToCart(cartData, context.userData._id, 1);
                              context.alertBox("success", "Product added to cart!");
                            } else {
                              context.alertBox("error", "Please login to add products to cart");
                            }
                          }}
                        >
                          Add
                        </motion.button>
                        <motion.button 
                          className="mobile-btn mobile-btn-secondary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBuyNow(item)}
                        >
                          Buy
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Categories */}
        {context?.catData?.length !== 0 && (
          <motion.section 
            className="mobile-categories"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div className="mobile-section-header" variants={fadeInUp}>
              <div>
                <h2 className="mobile-section-title">Shop by Category</h2>
                <p className="mobile-section-subtitle">Discover our wide range of products</p>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <HomeCatSlider data={context?.catData} />
            </motion.div>
          </motion.section>
        )}

        {/* Popular Products */}
        <motion.section 
          className="mobile-products-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div className="mobile-section-header" variants={fadeInUp}>
            <div>
              <h2 className="mobile-section-title">Popular Products</h2>
              <p className="mobile-section-subtitle">Trending items loved by customers</p>
            </div>
            <a href="#" className="mobile-view-all">View All</a>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            {popularProductsData?.length === 0 && <ProductLoading />}
            {popularProductsData?.length !== 0 && (
              <div className="mobile-products-grid">
                {popularProductsData?.slice(0, 6).map((item, index) => (
                  <motion.div 
                    key={index}
                    className="mobile-product-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                    onClick={() => navigate(`/product/${item._id}`)}
                  >
                    {item?.discount > 0 && (
                      <motion.div 
                        className="mobile-product-badge"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        -{item.discount}%
                      </motion.div>
                    )}
                    <div className="mobile-product-image">
                      <motion.img 
                        src={item?.images?.[0] || "/homeBannerPlaceholder.jpg"} 
                        alt={item?.name || "Product"}
                        loading="lazy"
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 2,
                          transition: { duration: 0.3 }
                        }}
                      />
                    </div>
                    <div className="mobile-product-content">
                      <motion.h3 
                        className="mobile-product-title"
                        whileHover={{ color: "#3b82f6" }}
                      >
                        {item?.name || "Product Name"}
                      </motion.h3>
                      <div className="mobile-product-price">
                        <span className="current">₹{item?.price || 0}</span>
                        {item?.oldPrice && item?.oldPrice > item?.price && (
                          <span className="old">₹{item.oldPrice}</span>
                        )}
                      </div>
                      <div className="mobile-product-actions" onClick={(e) => e.stopPropagation()}>
                        <motion.button 
                          className="mobile-btn mobile-btn-primary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (context?.isLogin && context?.userData) {
                              const cartData = {
                                productId: item._id,
                                userId: context.userData._id,
                                productTitle: item.name,
                                image: item.images?.[0],
                                price: item.price,
                                oldPrice: item.oldPrice,
                                discount: item.discount,
                                rating: item.rating || 0,
                                countInStock: item.stock || item.countInStock || 10,
                                subTotal: item.price * 1
                              };
                              context.addToCart(cartData, context.userData._id, 1);
                              context.alertBox("success", "Product added to cart!");
                            } else {
                              context.alertBox("error", "Please login to add products to cart");
                            }
                          }}
                        >
                          Add
                        </motion.button>
                        <motion.button 
                          className="mobile-btn mobile-btn-secondary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBuyNow(item)}
                        >
                          Buy
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Banner Section */}
        {productsData?.length !== 0 && (
          <motion.section 
            className="mobile-banner"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <HomeBannerV2 data={productsData} />
            </motion.div>
          </motion.section>
        )}

        {/* Category Products */}
        {randomCatProducts?.map((productRow, index) => {
          if (productRow?.catName !== undefined && productRow?.data?.length !== 0)
            return (
              <motion.section 
                className="mobile-products-section"
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
              >
                <motion.div className="mobile-section-header" variants={fadeInUp}>
                  <div>
                    <h2 className="mobile-section-title">{productRow?.catName}</h2>
                    <p className="mobile-section-subtitle">Best products in this category</p>
                  </div>
                  <a href="#" className="mobile-view-all">View All</a>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  {productRow?.data?.length === 0 && <ProductLoading />}
                  {productRow?.data?.length !== 0 && (
                    <div className="mobile-products-grid">
                      {productRow?.data?.slice(0, 6).map((item, idx) => (
                        <motion.div 
                          key={idx}
                          className="mobile-product-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ 
                            scale: 0.98,
                            transition: { duration: 0.1 }
                          }}
                          onClick={() => navigate(`/product/${item._id}`)}
                        >
                          {item?.discount > 0 && (
                            <motion.div 
                              className="mobile-product-badge"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              -{item.discount}%
                            </motion.div>
                          )}
                          <div className="mobile-product-image">
                            <motion.img 
                              src={item?.images?.[0] || "/homeBannerPlaceholder.jpg"} 
                              alt={item?.name || "Product"}
                              loading="lazy"
                              whileHover={{ 
                                scale: 1.1,
                                rotate: 2,
                                transition: { duration: 0.3 }
                              }}
                            />
                          </div>
                          <div className="mobile-product-content">
                            <motion.h3 
                              className="mobile-product-title"
                              whileHover={{ color: "#3b82f6" }}
                            >
                              {item?.name || "Product Name"}
                            </motion.h3>
                            <div className="mobile-product-price">
                              <span className="current">₹{item?.price || 0}</span>
                              {item?.oldPrice && item?.oldPrice > item?.price && (
                                <span className="old">₹{item.oldPrice}</span>
                              )}
                            </div>
                            <div className="mobile-product-actions" onClick={(e) => e.stopPropagation()}>
                              <motion.button 
                                className="mobile-btn mobile-btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (context?.isLogin && context?.userData) {
                                    const cartData = {
                                      productId: item._id,
                                      userId: context.userData._id,
                                      productTitle: item.name,
                                      image: item.images?.[0],
                                      price: item.price,
                                      oldPrice: item.oldPrice,
                                      discount: item.discount,
                                      rating: item.rating || 0,
                                      countInStock: item.stock || item.countInStock || 10,
                                      subTotal: item.price * 1
                                    };
                                    context.addToCart(cartData, context.userData._id, 1);
                                    context.alertBox("success", "Product added to cart!");
                                  } else {
                                    context.alertBox("error", "Please login to add products to cart");
                                  }
                                }}
                              >
                                Add
                              </motion.button>
                              <motion.button 
                                className="mobile-btn mobile-btn-secondary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBuyNow(item)}
                              >
                                Buy
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.section>
            )
        })}

        {/* Blog Section */}
        {blogData?.length !== 0 && (
          <motion.section 
            className="mobile-products-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div className="mobile-section-header" variants={fadeInUp}>
              <div>
                <h2 className="mobile-section-title">Latest Blog Posts</h2>
                <p className="mobile-section-subtitle">Stay updated with our latest news</p>
              </div>
              <a href="#" className="mobile-view-all">View All</a>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Swiper
                slidesPerView={1.2}
                spaceBetween={16}
                modules={[FreeMode]}
                freeMode={true}
                className="mobile-blog-swiper"
              >
                {blogData?.slice(0, 4).map((item, index) => (
                  <SwiperSlide key={index}>
                    <BlogItem item={item} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          </motion.section>
        )}
      </div>
    </>
  );
};

export default Home;
