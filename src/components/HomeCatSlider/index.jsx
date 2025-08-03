
import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation, FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

const HomeCatSlider = (props) => {

  const context = useContext(MyContext);

  return (
    <div className="homeCatSlider pt-0 lg:pt-4 py-4 lg:py-8">
      <div className="container">
        <Swiper
          slidesPerView={8}
          spaceBetween={10}
          navigation={context?.windowWidth < 992 ? false : true}
          modules={[Navigation, FreeMode]}
          freeMode={true}
          breakpoints={{
            300: {
              slidesPerView: 4,
              spaceBetween: 5,
            },
            550: {
              slidesPerView: 5,
              spaceBetween: 5,
            },
            900: {
              slidesPerView: 5,
              spaceBetween: 5,
            },
            1100: {
              slidesPerView: 8,
              spaceBetween: 5,
            },
          }}
          className="mySwiper"
        >
          {
            props?.data?.map((cat, index) => {
              return (
                <SwiperSlide key={index}>
                  <Link to="/">
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border border-gray-100">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/40 to-pink-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative py-4 lg:py-6 px-3 text-center flex items-center justify-center flex-col z-10">
                        {/* Image container with better visibility */}
                        <div className="relative mb-3 w-16 h-16 lg:w-20 lg:h-20 transform group-hover:scale-110 transition-transform duration-300">
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
                  </Link>
                </SwiperSlide>
              )
            })
          }
        </Swiper>
      </div>
    </div>
  );
};

export default HomeCatSlider;
