import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";
import { MyContext } from "../../App";

const HomeSlider = (props) => {

  const context  = useContext(MyContext);

  return (
    <div className="homeSlider pb-3 pt-3 lg:pb-5 lg:pt-5 relative z-[99]">
      <div className="container">
        <Swiper
          loop={true}
          spaceBetween={10}
          navigation={context?.windowWidth < 992 ? false : true}
          modules={[Navigation, Autoplay]}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          className="sliderHome"
        >
          {
            props?.data?.length !== 0 && props?.data?.slice()?.reverse()?.map((item, index) => {
              return (
                <SwiperSlide key={index}>
                  <div className="item rounded-[10px] overflow-hidden">
                    <img
                      src={item?.images[0]}
                      alt="Banner slide"
                      className="w-full"
                    />
                  </div>
                </SwiperSlide>
              )
            })
          }

        </Swiper>
      </div>
    </div>
  );
};

export default HomeSlider;
