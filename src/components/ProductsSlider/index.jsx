import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation, FreeMode } from "swiper/modules";
import ProductItem from "../ProductItem";
import { MyContext } from "../../App";

const ProductsSlider = (props) => {

  const context = useContext(MyContext);

  return (
    <div className="productsSlider pt-1 lg:pt-3 pb-0">
      <Swiper
        slidesPerView={props.items}
        spaceBetween={10}
        slidesPerGroup={4}
        navigation={context?.windowWidth<992 ? false : true}
        modules={[Navigation, FreeMode]}
        freeMode={true}
        breakpoints={{
          250: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          330: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          500: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          1100: {
            slidesPerView: 6,
            spaceBetween: 10,
          },
        }}
        className="mySwiper"
      >
        {
          props?.data?.map((item, index) => {
            return (
              <SwiperSlide key={index}>
                <ProductItem item={item} />
              </SwiperSlide>
            )
          })
        }


      </Swiper>
    </div>
  );
};

export default ProductsSlider;
