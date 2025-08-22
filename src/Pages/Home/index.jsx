import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import HomeSlider from "../../components/HomeSlider";
import HomeCatSlider from "../../components/HomeCatSlider";
import { LiaShippingFastSolid } from "react-icons/lia";
import { FiTrendingUp, FiStar, FiZap } from "react-icons/fi";
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

  const context = useContext(MyContext);

  // Simple, clean animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
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

    const numbers = new Set();
    while (numbers.size < context?.catData?.length - 1) {
      const number = Math.floor(1 + Math.random() * 8);
      numbers.add(number);
    }

    getRendomProducts(Array.from(numbers), context?.catData)
  }, [context?.catData])

  const getRendomProducts = (arr, catArr) => {
    const filterData = [];

    for (let i = 0; i < arr.length; i++) {
      let catId = catArr[arr[i]]?._id;

      fetchDataFromApi(`/api/product/getAllProductsByCatId/${catId}`).then((res) => {
        filterData.push({
          catName: catArr[arr[i]]?.name,
          data: res?.products
        })

        setRandomCatProducts(filterData)
      })
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const filterByCatId = (id) => {
    setPopularProductsData([])
    fetchDataFromApi(`/api/product/getAllProductsByCatId/${id}`).then((res) => {
      if (res?.error === false) {
        setPopularProductsData(res?.products)
      }
    })
  }

  return (
    <>
      {/* ONLY CHANGE MOBILE LAYOUT TO VERTICAL - KEEP ALL ORIGINAL BUTTON FUNCTIONS */}
      <style jsx global>{`
        /* Mobile: Show products in vertical scrolling 2x2 grid */
        @media (max-width: 767px) {
          .productSlider {
            height: 500px;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            padding: 20px 0;
          }

          .productSlider .swiper-wrapper {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 15px !important;
            width: 100% !important;
            height: auto !important;
            transform: none !important;
            transition: none !important;
          }

          .productSlider .swiper-slide {
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            transform: none !important;
            position: relative !important;
          }

          .productSlider .swiper-container,
          .productSlider .swiper {
            overflow: visible !important;
            height: auto !important;
          }

          /* Hide swiper controls on mobile */
          .productSlider .swiper-button-next,
          .productSlider .swiper-button-prev,
          .productSlider .swiper-pagination,
          .productSlider .swiper-scrollbar {
            display: none !important;
          }

          /* Ensure no horizontal scrolling */
          .productSlider {
            overflow-x: hidden !important;
          }

          /* Enhanced product styling for mobile grid */
          .productSlider .item {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border: 1px solid #f1f5f9;
            padding: 14px;
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
            margin-bottom: 0;
          }

          .productSlider .item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          }

          .productSlider .item .productImg {
            aspect-ratio: 1;
            border-radius: 8px;
            margin-bottom: 10px;
            overflow: hidden;
            background: #f8fafc;
          }

          .productSlider .item .productImg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .productSlider .item:hover .productImg img {
            transform: scale(1.05);
          }

          .productSlider .item .info {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .productSlider .item .info h4 {
            font-size: 13px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.3;
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .productSlider .item .info .price {
            margin-bottom: 10px;
            margin-top: auto;
          }

          .productSlider .item .info .price .text-red {
            font-size: 15px;
            font-weight: 700;
            color: #2563eb;
          }

          .productSlider .item .info .price .oldPrice {
            font-size: 11px;
            color: #9ca3af;
            text-decoration: line-through;
            margin-left: 6px;
          }

          /* KEEP ORIGINAL BUTTON FUNCTIONALITY - Just make them always visible */
          .productSlider .item .actions {
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            background: transparent !important;
            padding: 0 !important;
            display: flex !important;
            gap: 8px;
            margin-top: 10px;
          }

          /* KEEP YOUR ORIGINAL BUTTON STYLES AND FUNCTIONALITY */
          .productSlider .item .actions button {
            flex: 1;
            padding: 8px 10px;
            border: none;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Style first button (Add to Cart) */
          .productSlider .item .actions button:first-child {
            background: linear-gradient(45deg, #3b82f6, #2563eb);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          }

          .productSlider .item .actions button:first-child:hover {
            background: linear-gradient(45deg, #2563eb, #1d4ed8);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }

          /* Style second button (Buy Now) */
          .productSlider .item .actions button:last-child {
            background: linear-gradient(45deg, #10b981, #059669);
            color: white;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          }

          .productSlider .item .actions button:last-child:hover {
            background: linear-gradient(45deg, #059669, #047857);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          }

          .productSlider .item .actions button:active {
            transform: translateY(1px);
          }
        }

        /* Desktop: Keep original behavior completely unchanged */
        @media (min-width: 768px) {
          .productSlider .item {
            transition: all 0.3s ease;
          }
          
          .productSlider .item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        
        {/* Hero Section */}
        <motion.section 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {homeSlidesData?.length === 0 && <BannerLoading />}
          {homeSlidesData?.length !== 0 && (
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <HomeSlider data={homeSlidesData} />
            </motion.div>
          )}
        </motion.section>

        {/* Categories */}
        {context?.catData?.length !== 0 && (
          <motion.section 
            className="py-8 lg:py-12 bg-gray-50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <div className="container">
              <motion.div className="text-center mb-8" variants={fadeInUp}>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Shop by Category</h2>
                <p className="text-gray-600">Discover our wide range of premium products</p>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <HomeCatSlider data={context?.catData} />
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Popular Products - KEEPING YOUR ORIGINAL ProductsSlider WITH ALL BUTTON FUNCTIONS */}
        <motion.section 
          className="py-12 lg:py-16 bg-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="container">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 space-y-6 lg:space-y-0">
              <motion.div variants={fadeInUp}>
                <div className="flex items-center space-x-2 mb-2">
                  <FiTrendingUp className="text-blue-600 text-lg" />
                  <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Trending</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Popular Products</h2>
                <p className="text-gray-600 max-w-xl">Discover our most loved items chosen by thousands of customers</p>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-1">
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                      minHeight: 48,
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        minHeight: 48,
                        minWidth: { xs: 90, lg: 120 },
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: 'rgb(75, 85, 99)',
                        borderRadius: '10px',
                        margin: '2px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgb(239, 246, 255)',
                        },
                        '&.Mui-selected': {
                          color: 'white',
                          backgroundColor: 'rgb(59, 130, 246)',
                          fontWeight: 600,
                        }
                      },
                      '& .MuiTabs-indicator': {
                        display: 'none',
                      },
                    }}
                  >
                    {context?.catData?.map((cat, index) => (
                      <Tab 
                        label={cat?.name} 
                        key={index} 
                        onClick={() => filterByCatId(cat?._id)}
                      />
                    ))}
                  </Tabs>
                </div>
              </motion.div>
            </div>

            <motion.div className="min-h-[400px]" variants={fadeInUp}>
              {popularProductsData?.length === 0 && <ProductLoading />}
              {popularProductsData?.length !== 0 && <ProductsSlider items={6} data={popularProductsData} />}
            </motion.div>
          </div>
        </motion.section>

        {/* Banner Section */}
        <motion.section 
          className="py-12 lg:py-16 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <motion.div 
                className="lg:col-span-8"
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
              >
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  {productsData?.length !== 0 && <HomeBannerV2 data={productsData} />}
                </div>
              </motion.div>
              
              <motion.div className="lg:col-span-4 space-y-6" variants={fadeInUp}>
                <motion.div 
                  className="rounded-xl overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <BannerBoxV2 
                    info={bannerV1Data[bannerV1Data?.length - 1]?.alignInfo} 
                    image={bannerV1Data[bannerV1Data?.length - 1]?.images[0]} 
                    item={bannerV1Data[bannerV1Data?.length - 1]} 
                  />
                </motion.div>
                <motion.div 
                  className="rounded-xl overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <BannerBoxV2 
                    info={bannerV1Data[bannerV1Data?.length - 2]?.alignInfo} 
                    image={bannerV1Data[bannerV1Data?.length - 2]?.images[0]} 
                    item={bannerV1Data[bannerV1Data?.length - 2]} 
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="py-12 lg:py-16 bg-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="container">
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Why Choose Us</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">We're committed to providing you with the best shopping experience possible</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div 
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                  <LiaShippingFastSolid className="text-2xl text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Shipping</h3>
                <p className="text-gray-600 leading-relaxed">Free delivery on orders over ₹200. Fast and reliable shipping nationwide.</p>
              </motion.div>
              
              <motion.div 
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-xl mb-4 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-200">
                  <FiStar className="text-2xl text-yellow-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Quality</h3>
                <p className="text-gray-600 leading-relaxed">Carefully curated products with guaranteed quality and authenticity.</p>
              </motion.div>
              
              <motion.div 
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-4 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                  <FiZap className="text-2xl text-green-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
                <p className="text-gray-600 leading-relaxed">Round-the-clock customer support to assist you anytime, anywhere.</p>
              </motion.div>
            </div>

            {bannerV1Data?.length !== 0 && (
              <motion.div className="mt-12" variants={fadeInUp}>
                <AdsBannerSliderV2 items={4} data={bannerV1Data} />
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Latest Products */}
        <motion.section 
          className="py-12 lg:py-16 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="container">
            <motion.div className="flex items-center justify-between mb-10" variants={fadeInUp}>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-semibold text-sm uppercase tracking-wide">New Arrivals</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Latest Products</h2>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              {productsData?.length === 0 && <ProductLoading />}
              {productsData?.length !== 0 && <ProductsSlider items={6} data={productsData} />}
            </motion.div>
          </div>
        </motion.section>

        {/* Featured Products */}
        <motion.section 
          className="py-12 lg:py-16 bg-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="container">
            <motion.div className="flex items-center justify-between mb-10" variants={fadeInUp}>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FiStar className="text-yellow-500 text-lg" />
                  <span className="text-yellow-600 font-semibold text-sm uppercase tracking-wide">Editor's Choice</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Featured Products</h2>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              {featuredProducts?.length === 0 && <ProductLoading />}
              {featuredProducts?.length !== 0 && <ProductsSlider items={6} data={featuredProducts} />}
            </motion.div>

            {bannerList2Data?.length !== 0 && (
              <motion.div className="mt-12" variants={fadeInUp}>
                <AdsBannerSlider items={4} data={bannerList2Data} />
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Category Products */}
        {randomCatProducts?.map((productRow, index) => {
          if (productRow?.catName !== undefined && productRow?.data?.length !== 0)
            return (
              <motion.section 
                className={`py-12 lg:py-16 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} 
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
              >
                <div className="container">
                  <motion.div className="mb-10" variants={fadeInUp}>
                    <div className="inline-flex items-center space-x-2 mb-2">
                      <div className="w-8 h-0.5 bg-blue-500"></div>
                      <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Category</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{productRow?.catName}</h2>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp}>
                    {productRow?.data?.length === 0 && <ProductLoading />}
                    {productRow?.data?.length !== 0 && <ProductsSlider items={6} data={productRow?.data} />}
                  </motion.div>
                </div>
              </motion.section>)
        })}

        {/* Blog Section */}
        {blogData?.length !== 0 && (
          <motion.section 
            className="py-16 lg:py-20 bg-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <div className="container">
              <motion.div className="text-center mb-12" variants={fadeInUp}>
                <div className="inline-flex items-center space-x-2 mb-4">
                  <div className="w-8 h-0.5 bg-blue-400"></div>
                  <span className="text-blue-400 font-semibold text-sm uppercase tracking-wide">Our Blog</span>
                  <div className="w-8 h-0.5 bg-blue-400"></div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Latest Stories</h2>
                <p className="text-gray-300 max-w-2xl mx-auto">Stay updated with trends, tips, and insights from our experts</p>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Swiper
                  slidesPerView={4}
                  spaceBetween={30}
                  navigation={context?.windowWidth >= 992}
                  modules={[Navigation, FreeMode]}
                  loop={blogData?.length > 4}
                  breakpoints={{
                    320: { slidesPerView: 1, spaceBetween: 20 },
                    640: { slidesPerView: 2, spaceBetween: 25 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                    1280: { slidesPerView: 4, spaceBetween: 30 },
                  }}
                  className="blogSlider"
                >
                  {blogData?.slice().reverse().map((item, index) => (
                    <SwiperSlide key={index}>
                      <motion.div 
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BlogItem item={item} />
                      </motion.div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </motion.div>
            </div>
          </motion.section>
        )}
      </div>
    </>
  );
};

export default Home;
