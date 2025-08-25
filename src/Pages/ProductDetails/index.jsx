import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import { ProductZoom } from "../../components/ProductZoom";
import ProductsSlider from '../../components/ProductsSlider';
import { ProductDetailsComponent } from "../../components/ProductDetails";

import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Reviews } from "./reviews";

export const ProductDetails = () => {

  const [activeTab, setActiveTab] = useState(0);
  const [productData, setProductData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [relatedProductData, setRelatedProductData] = useState([]);

  const { id } = useParams();

  const reviewSec = useRef();

  useEffect(() => {
    fetchDataFromApi(`/api/user/getReviews?productId=${id}`).then((res) => {
      if (res?.error === false) {
        setReviewsCount(res.reviews.length)
      }
    })

  }, [reviewsCount])

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromApi(`/api/product/${id}`).then((res) => {
      if (res?.error === false) {
        setProductData(res?.product);

        fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${res?.product?.subCatId}`).then((res) => {
          if (res?.error === false) {
           const filteredData = res?.products?.filter((item) => item._id !== id);
            setRelatedProductData(filteredData)
          }
        })

        setTimeout(() => {
          setIsLoading(false);
        }, 700);
      }
    })


    window.scrollTo(0, 0)
  }, [id])


  const gotoReviews = () => {
    window.scrollTo({
      top: reviewSec?.current.offsetTop - 170,
      behavior: 'smooth',
    })

    setActiveTab(1)

  }

  return (
    <>
      <div className="py-3 sm:py-5 hidden">
        <div className="container">
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              to="/"
              className="link transition !text-[14px]"
            >
              Home
            </Link>
            <Link
              underline="hover"
              color="inherit"
              to="/"
              className="link transition !text-[14px]"
            >
              Fashion
            </Link>

            <Link
              underline="hover"
              color="inherit"
              className="link transition !text-[14px]"
            >
              Cropped Satin Bomber Jacket
            </Link>
          </Breadcrumbs>
        </div>
      </div>

      <section className="bg-white py-3 sm:py-5">
        {
          isLoading === true ?
            <div className="flex items-center justify-center min-h-[300px]">
              <CircularProgress />
            </div>
            :
            <>
              <div className="container">
                <div className="flex gap-4 sm:gap-6 lg:gap-8 flex-col lg:flex-row items-start">
                  <div className="productZoomContainer w-full lg:w-[45%] xl:w-[40%]">
                    <ProductZoom images={productData?.images} />
                  </div>

                  <div className="productContent w-full lg:w-[55%] xl:w-[60%] px-4 sm:px-6 lg:px-8 xl:px-10">
                    <ProductDetailsComponent item={productData} reviewsCount={reviewsCount} gotoReviews={gotoReviews} />
                  </div>
                </div>

                <div className="mt-8 sm:mt-10 lg:mt-12">
                  <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 border-b border-gray-200">
                    <span
                      className={`link text-[15px] sm:text-[16px] lg:text-[17px] cursor-pointer font-[500] pb-3 px-2 transition-colors ${
                        activeTab === 0 
                          ? "text-primary border-b-2 border-primary" 
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setActiveTab(0)}
                    >
                      Description
                    </span>

                    <span
                      className={`link text-[15px] sm:text-[16px] lg:text-[17px] cursor-pointer font-[500] pb-3 px-2 transition-colors ${
                        activeTab === 1 
                          ? "text-primary border-b-2 border-primary" 
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setActiveTab(1)}
                      ref={reviewSec}
                    >
                      Reviews ({reviewsCount})
                    </span>
                  </div>

                  {activeTab === 0 && (
                    <div className="bg-gray-50 sm:shadow-md w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8 rounded-lg sm:rounded-md text-[14px] sm:text-[15px] leading-relaxed">
                      <div className="prose prose-sm sm:prose max-w-none">
                        {productData?.description}
                      </div>
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div className="w-full">
                      {productData?.length !== 0 && (
                        <Reviews productId={productData?._id} setReviewsCount={setReviewsCount} />
                      )}
                    </div>
                  )}
                </div>

                {relatedProductData?.length !== 0 && (
                  <div className="mt-8 sm:mt-10 lg:mt-12">
                    <h2 className="text-[18px] sm:text-[20px] lg:text-[22px] font-[600] pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-gray-200">
                      Related Products
                    </h2>
                    <ProductsSlider items={6} data={relatedProductData}/>
                  </div>
                )}
              </div>
            </>
        }
      </section>
    </>
  );
};
