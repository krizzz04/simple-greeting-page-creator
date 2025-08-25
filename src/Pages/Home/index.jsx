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

        /* Category Cards */
        .category-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .category-card .category-image {
          transition: all 0.3s ease;
        }

        .category-card:hover .category-image {
          transform: scale(1.1);
        }

        /* Products Grid */
        .mobile-products-section {
          margin: 0 16px 20px 16px;
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {productsData?.slice(0, 8).map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductItem item={item} />
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
              <a href="#" className="mobile-view-all">View All Categories</a>
            </motion.div>
            <motion.div variants={fadeInUp}>
              {context?.catData?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Categories Available</h3>
                  <p className="text-gray-500">Categories will appear here once they are added to the system.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {context?.catData?.slice(0, 12).map((cat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      transition: { duration: 0.1 }
                    }}
                  >
                    <div 
                      className="category-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 cursor-pointer"
                      onClick={() => {
                        // Navigate to category page with products
                        navigate(`/products?category=${cat._id}&name=${cat.name}`);
                      }}
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/40 to-pink-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative py-4 lg:py-6 px-3 text-center flex items-center justify-center flex-col z-10">
                        {/* Image container with better visibility */}
                        <div className="category-image relative mb-3 w-16 h-16 lg:w-20 lg:h-20 transform group-hover:scale-110 transition-transform duration-300">
                          {/* Background circle for image */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300"></div>
                          
                          {/* Image with proper sizing and object-fit */}
                          <img
                            src={cat?.images?.[0] || "/homeBannerPlaceholder.jpg"}
                            className="relative w-full h-full object-cover rounded-full p-2 transition-all duration-300 group-hover:brightness-110 group-hover:p-1"
                            alt={cat?.name || "Category"}
                          />
                          
                          {/* Subtle glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                        </div>
                        
                        {/* Category name with better readability */}
                        <h3 className="text-[11px] lg:text-[13px] font-[600] text-gray-700 group-hover:text-gray-900 transition-colors duration-300 leading-tight">
                          {cat?.name}
                        </h3>
                        
                        {/* Enhanced accent line */}
                        <div className="mt-2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-6 transition-all duration-500 rounded-full"></div>
                                              </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {popularProductsData?.slice(0, 6).map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductItem item={item} />
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {productRow?.data?.slice(0, 6).map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <ProductItem item={item} />
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
