import React, { useContext, useEffect, useState } from "react";
import HomeSlider from "../../components/HomeSlider";
import HomeCatSlider from "../../components/HomeCatSlider";
import { LiaShippingFastSolid } from "react-icons/lia";
import AdsBannerSlider from "../../components/AdsBannerSlider";
import AdsBannerSliderV2 from "../../components/AdsBannerSliderV2";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ProductsSlider from "../../components/ProductsSlider";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation, FreeMode } from "swiper/modules";
import BlogItem from "../../components/BlogItem";
import HomeBannerV2 from "../../components/HomeSliderV2";
import BannerBoxV2 from "../../components/bannerBoxV2";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";
import ProductLoading from "../../components/ProductLoading";
import BannerLoading from "../../components/LoadingSkeleton/bannerLoading";
import AnimatedHero from "../../components/AnimatedHero";
import FloatingElements from "../../components/FloatingElements";
import GlassCard from "../../components/GlassCard";

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

      // Add the number to the set (automatically ensures uniqueness)
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
    <div className={`relative overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <FloatingElements />
      
      {/* Animated Hero Section */}
      <AnimatedHero />

      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 animate-gradient-shift"></div>

      {homeSlidesData?.length === 0 && <BannerLoading />}

      {homeSlidesData?.length !== 0 && (
        <div className="transform transition-all duration-700 hover:scale-[1.02]">
          <HomeSlider data={homeSlidesData} />
        </div>
      )}

      {context?.catData?.length !== 0 && (
        <div className="transform transition-all duration-700 animate-slide-up">
          <HomeCatSlider data={context?.catData} />
        </div>
      )}

      {/* Popular Products with Glass Effect */}
      <section className="bg-transparent py-3 lg:py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 backdrop-blur-sm"></div>
        <div className="container relative z-10">
          <GlassCard>
            <div className="flex items-center justify-between flex-col lg:flex-row p-6">
              <div className="leftSec w-full lg:w-[40%] transform transition-all duration-500 hover:translate-x-2">
                <h2 className="text-[14px] sm:text-[14px] md:text-[16px] lg:text-[20px] font-[600] bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Popular Products</h2>
                <p className="text-[12px] sm:text-[14px] md:text-[13px] lg:text-[14px] font-[400] mt-0 mb-0 animate-pulse">
                  Do not miss the current offers until the end of March.
                </p>
              </div>

              <div className="rightSec w-full lg:w-[60%]">
                <div className="transform transition-all duration-300 hover:scale-105">
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                    className="animated-tabs"
                  >
                    {context?.catData?.length !== 0 && context?.catData?.map((cat, index) => {
                      return (
                        <Tab 
                          label={cat?.name} 
                          key={index} 
                          onClick={() => filterByCatId(cat?._id)}
                          className="transform transition-all duration-300 hover:scale-110 hover:text-primary"
                        />
                      )
                    })}
                  </Tabs>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="min-h-max lg:min-h-[60vh] mt-8">
            {popularProductsData?.length === 0 && <ProductLoading />}
            {popularProductsData?.length !== 0 && (
              <div className="transform transition-all duration-700 animate-fade-in">
                <ProductsSlider items={6} data={popularProductsData} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Banner Section */}
      <section className="py-6 pt-0 bg-transparent relative">
        <div className="container flex flex-col lg:flex-row gap-5">
          <div className="part1 w-full lg:w-[70%] transform transition-all duration-700 hover:scale-[1.02]">
            {productsData?.length !== 0 && <HomeBannerV2 data={productsData} />}
          </div>

          <div className="part2 scrollableBox w-full lg:w-[30%] flex items-center gap-5 justify-between flex-row lg:flex-col">
            <div className="transform transition-all duration-500 hover:scale-105 hover:rotate-1">
              <BannerBoxV2 info={bannerV1Data[bannerV1Data?.length - 1]?.alignInfo} image={bannerV1Data[bannerV1Data?.length - 1]?.images[0]} item={bannerV1Data[bannerV1Data?.length - 1]} />
            </div>
            <div className="transform transition-all duration-500 hover:scale-105 hover:-rotate-1">
              <BannerBoxV2 info={bannerV1Data[bannerV1Data?.length - 2]?.alignInfo} image={bannerV1Data[bannerV1Data?.length - 2]?.images[0]} item={bannerV1Data[bannerV1Data?.length - 2]} />
            </div>
          </div>
        </div>
      </section>

      {/* Animated Shipping Section */}
      <section className="py-0 lg:py-4 pt-0 lg:pt-8 pb-0 bg-transparent relative">
        <div className="container">
          <GlassCard className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
            <div className="freeShipping w-full md:w-[80%] m-auto py-4 p-4 border-2 border-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center lg:justify-between flex-col lg:flex-row rounded-xl mb-7 backdrop-blur-lg bg-white/10">
              <div className="col1 flex items-center gap-4 transform transition-all duration-300 hover:scale-110">
                <div className="animate-bounce">
                  <LiaShippingFastSolid className="text-[30px] lg:text-[50px] text-primary animate-pulse" />
                </div>
                <span className="text-[16px] lg:text-[20px] font-[600] uppercase bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Free Shipping
                </span>
              </div>

              <div className="col2 transform transition-all duration-300 hover:translate-y-1">
                <p className="mb-0 mt-0 font-[500] text-center animate-pulse">
                  Free Delivery Now On Your First Order and over ₹200
                </p>
              </div>

              <p className="font-bold text-[20px] lg:text-[25px] bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-pulse">- Only ₹200*</p>
            </div>
          </GlassCard>

          {bannerV1Data?.length !== 0 && (
            <div className="transform transition-all duration-700 animate-slide-up">
              <AdsBannerSliderV2 items={4} data={bannerV1Data} />
            </div>
          )}
        </div>
      </section>

      {/* Animated Product Sections */}
      <section className="py-3 lg:py-2 pt-0 bg-transparent">
        <div className="container">
          <div className="transform transition-all duration-500 hover:translate-x-2">
            <h2 className="text-[20px] font-[600] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Latest Products</h2>
          </div>

          {productsData?.length === 0 && <ProductLoading />}
          {productsData?.length !== 0 && (
            <div className="transform transition-all duration-700 animate-fade-in">
              <ProductsSlider items={6} data={productsData} />
            </div>
          )}
        </div>
      </section>

      <section className="py-2 lg:py-0 pt-0 bg-transparent">
        <div className="container">
          <div className="transform transition-all duration-500 hover:translate-x-2">
            <h2 className="text-[20px] font-[600] bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Featured Products</h2>
          </div>

          {featuredProducts?.length === 0 && <ProductLoading />}
          {featuredProducts?.length !== 0 && (
            <div className="transform transition-all duration-700 animate-fade-in">
              <ProductsSlider items={6} data={featuredProducts} />
            </div>
          )}

          {bannerList2Data?.length !== 0 && (
            <div className="transform transition-all duration-700 animate-slide-up">
              <AdsBannerSlider items={4} data={bannerList2Data} />
            </div>
          )}
        </div>
      </section>

      {/* Animated Category Products */}
      {randomCatProducts?.length !== 0 && randomCatProducts?.map((productRow, index) => {
        if (productRow?.catName !== undefined && productRow?.data?.length !== 0)
          return (
            <section className="py-5 pt-0 bg-transparent" key={index}>
              <div className="container">
                <div className="transform transition-all duration-500 hover:translate-x-2">
                  <h2 className="text-[20px] font-[600] bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">{productRow?.catName}</h2>
                </div>

                {productRow?.data?.length === 0 && <ProductLoading />}
                {productRow?.data?.length !== 0 && (
                  <div className="transform transition-all duration-700 animate-fade-in">
                    <ProductsSlider items={6} data={productRow?.data} />
                  </div>
                )}
              </div>
            </section>)
      })}

      {/* Animated Blog Section */}
      {blogData?.length !== 0 && (
        <section className="py-5 pb-8 pt-0 bg-transparent blogSection">
          <div className="container">
            <div className="transform transition-all duration-500 hover:translate-x-2">
              <h2 className="text-[20px] font-[600] mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">From The Blog</h2>
            </div>
            <div className="transform transition-all duration-700 animate-slide-up">
              <Swiper
                slidesPerView={4}
                spaceBetween={30}
                navigation={context?.windowWidth < 992 ? false : true}
                modules={[Navigation, FreeMode]}
                freeMode={true}
                breakpoints={{
                  250: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                  },
                  330: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                  },
                  500: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  700: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                  },
                  1100: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                  },
                }}
                className="blogSlider"
              >
                {blogData?.slice()?.reverse()?.map((item, index) => {
                  return (
                    <SwiperSlide key={index}>
                      <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                        <BlogItem item={item} />
                      </div>
                    </SwiperSlide>
                  )
                })}
              </Swiper>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
