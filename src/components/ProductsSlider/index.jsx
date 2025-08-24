import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import { Navigation, FreeMode, Autoplay, Pagination } from "swiper/modules";
import ProductItem from "../ProductItem";
import { MyContext } from "../../App";

const ProductsSlider = (props) => {
  const context = useContext(MyContext);
  const isMobile = context?.windowWidth < 992;

  return (
    <div className="productsSlider pt-1 lg:pt-3 pb-2 relative">
      <Swiper
        slidesPerView={context?.windowWidth < 500 ? 1.15 : props.items}
        spaceBetween={12}
        slidesPerGroup={1}
        navigation={!isMobile}
        modules={[Navigation, FreeMode, Autoplay, Pagination]}
        freeMode={true}
        loop={props?.data?.length > 6}
        autoplay={
          isMobile
            ? {
                delay: 2000, // subtle teaser
                disableOnInteraction: true,
              }
            : false
        }
        pagination={isMobile ? { clickable: true, type: "bullets" } : false}
        breakpoints={{
          250: { slidesPerView: 1.1, spaceBetween: 10 },
          330: { slidesPerView: 2, spaceBetween: 10 },
          500: { slidesPerView: 3, spaceBetween: 12 },
          1100: { slidesPerView: 6, spaceBetween: 15 },
        }}
        className="mySwiper productSlider"
      >
        {props?.data?.map((item, index) => (
          <SwiperSlide
            key={index}
            className="transition-transform transform hover:scale-105"
          >
            <ProductItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Right gradient overlay (only on mobile) */}
      {isMobile && (
        <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white/90 to-transparent dark:from-gray-900/90 z-10"></div>
      )}

      {/* Optional "View All" CTA */}
      {props?.showViewAll && (
        <div className="text-center mt-3">
          <button className="text-blue-600 dark:text-blue-400 underline text-sm font-medium">
            View All Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsSlider;
