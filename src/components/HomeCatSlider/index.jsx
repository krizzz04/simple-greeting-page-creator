
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
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border border-gray-100">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                      
                      <div className="relative py-6 lg:py-8 px-4 text-center flex items-center justify-center flex-col z-10">
                        {/* Image container with enhanced styling */}
                        <div className="relative mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-full p-3 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                            <img
                              src={cat?.images[0]}
                              className="w-[40px] lg:w-[60px] transition-all duration-300 group-hover:brightness-110"
                              alt={cat?.name}
                            />
                          </div>
                        </div>
                        
                        {/* Category name with enhanced typography */}
                        <h3 className="text-[12px] lg:text-[15px] font-[600] text-gray-800 group-hover:text-gray-900 transition-all duration-300 group-hover:scale-105">
                          {cat?.name}
                        </h3>
                        
                        {/* Subtle accent line */}
                        <div className="mt-2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-8 transition-all duration-500 rounded-full"></div>
                      </div>
                      
                      {/* Corner accent */}
                      <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
