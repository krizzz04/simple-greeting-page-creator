import React from "react";
import { Link } from "react-router-dom";

const BannerBox = (props) => {
  return (
    <div className="box bannerBox overflow-hidden rounded-lg group">
    {console.log(props?.item)}
      {
        props?.item?.subCatId !== undefined && props?.item?.subCatId !== null &&  props?.item?.subCatId !== ""  ?
          <Link to={`/products?subCatId=${props?.item?.subCatId}`} className="text-[16px] font-[600] link">
            <img src={props.img} className="w-full transition-all group-hover:scale-105 group-hover:rotate-1" alt="banner" />
          </Link>
          :

          <Link to={`/products?catId=${props?.item?.catId}`} className="text-[16px] font-[600] link">
        
            <img src={props.img} className="w-full transition-all group-hover:scale-105 group-hover:rotate-1" alt="banner" />
          </Link>

      }

    </div>
  );
};

export default BannerBox;
