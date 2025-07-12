import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { QtyBox } from "../QtyBox";
import Rating from "@mui/material/Rating";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { postData } from "../../utils/api";
import { FaCheckDouble } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";



export const ProductDetailsComponent = (props) => {
  const [productActionIndex, setProductActionIndex] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTabName, setSelectedTabName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tabError, setTabError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);

  const context = useContext(MyContext);

  const handleSelecteQty = (qty) => {
    setQuantity(qty);
  }



  const handleClickActiveTab = (index, name) => {
    setProductActionIndex(index)
    setSelectedTabName(name)
  }


  useEffect(() => {
    const item = context?.cartData?.filter((cartItem) =>
      cartItem.productId.includes(props?.item?._id)
    )

    if (item?.length !== 0) {
      setIsAdded(true)
    } else {
      setIsAdded(false)
    }

  }, [isAdded])


  useEffect(() => {
    const myListItem = context?.myListData?.filter((item) =>
      item.productId.includes(props?.item?._id)
    )


    if (myListItem?.length !== 0) {
      setIsAddedInMyList(true);
    } else {
      setIsAddedInMyList(false)
    }

  }, [context?.myListData])

  const addToCart = (product, userId, quantity) => {


    if (userId === undefined) {
      context?.alertBox("error", "you are not login please login first");
      return false;
    }

    const productItem = {
      _id: product?._id,
      productTitle: product?.name,
      image: product?.images[0],
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt(product?.price * quantity),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: product?.brand,
      size: props?.item?.size?.length !== 0 ? selectedTabName : '',
      weight: props?.item?.productWeight?.length !== 0 ? selectedTabName : '',
      ram: props?.item?.productRam?.length !== 0 ? selectedTabName : ''

    }



    if (props?.item?.size?.length !== 0 || props?.item?.productWeight?.length !== 0 || props?.item?.productRam?.length !== 0) {
      if (selectedTabName !== null) {
        setIsLoading(true);

        postData("/api/cart/add", productItem).then((res) => {
          if (res?.error === false) {
            context?.alertBox("success", res?.message);

            context?.getCartItems();
            setTimeout(() => {
              setIsLoading(false);
              setIsAdded(true)
            }, 500);

          } else {
            context?.alertBox("error", res?.message);
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
          }

        })

      } else {
        setTabError(true);
      }
    } else {
      setIsLoading(true);
      postData("/api/cart/add", productItem).then((res) => {
        if (res?.error === false) {
          context?.alertBox("success", res?.message);

          context?.getCartItems();
          setTimeout(() => {
            setIsLoading(false);
            setIsAdded(true)
          }, 500);

        } else {
          context?.alertBox("error", res?.message);
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }

      })
    }
  }


  const handleAddToMyList = (item) => {
    if (context?.userData === null) {
      context?.alertBox("error", "you are not login please login first");
      return false
    }

    else {
      const obj = {
        productId: item?._id,
        userId: context?.userData?._id,
        productTitle: item?.name,
        image: item?.images[0],
        rating: item?.rating,
        price: item?.price,
        oldPrice: item?.oldPrice,
        brand: item?.brand,
        discount: item?.discount
      }


      postData("/api/myList/add", obj).then((res) => {
        if (res?.error === false) {
          context?.alertBox("success", res?.message);
          setIsAddedInMyList(true);
          context?.getMyListData();
        } else {
          context?.alertBox("error", res?.message);
        }
      })

    }
  }


  return (
    <>
      <h1 className="text-[18px] sm:text-[22px] font-[600] mb-2">
        {props?.item?.name}
      </h1>
      <div className="flex items-start sm:items-center lg:items-center flex-col sm:flex-row md:flex-row lg:flex-row gap-3 justify-start">
        <span className="text-gray-400 text-[13px]">
          Brands :{" "}
          <span className="font-[500] text-black opacity-75">
            {props?.item?.brand}
          </span>
        </span>

        <Rating name="size-small" value={props?.item?.rating} size="small" readOnly />
        <span className="text-[13px] cursor-pointer" onClick={props.gotoReviews}>Review ({props.reviewsCount})</span>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row items-start sm:items-center gap-4 mt-4">
        <div className="flex items-center gap-4">
          <span className="oldPrice line-through text-gray-500 text-[20px] font-[500]">
            &#x20b9;{props?.item?.price}
          </span>
          <span className="price text-primary text-[20px]  font-[600]">
            &#x20b9;{props?.item?.oldPrice}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[14px]">
            Available In Stock:{" "}
            <span className="text-green-600 text-[14px] font-bold">
              {props?.item?.countInStock} Items
            </span>
          </span>
        </div>
      </div>

      <p className="mt-3 pr-10 mb-5">
        {props?.item?.description}
      </p>


      {
        props?.item?.productRam?.length !== 0 &&
        <div className="flex items-center gap-3">
          <span className="text-[16px]">RAM:</span>
          <div className="flex items-center gap-1 actions">
            {
              props?.item?.productRam?.map((item, index) => {
                return (
                  <Button
                    key={index}
                    className={`${productActionIndex === index ?
                      "!bg-primary !text-white" : ""
                      }  ${tabError === true && 'error'}`}
                    onClick={() => handleClickActiveTab(index, item)}
                  >
                    {item}
                  </Button>
                )
              })
            }


          </div>
        </div>
      }



      {
        props?.item?.size?.length !== 0 &&
        <div className="flex items-center gap-3">
          <span className="text-[16px]">SIZE:</span>
          <div className="flex items-center gap-1 actions">
            {
              props?.item?.size?.map((item, index) => {
                return (
                  <Button
                    key={index}
                    className={`${productActionIndex === index ?
                      "!bg-primary !text-white" : ""
                      } ${tabError === true && 'error'}`}
                    onClick={() => handleClickActiveTab(index, item)}
                  >
                    {item}
                  </Button>
                )
              })
            }


          </div>
        </div>
      }



      {
        props?.item?.productWeight?.length !== 0 &&
        <div className="flex items-center gap-3">
          <span className="text-[16px]">WEIGHT:</span>
          <div className="flex items-center gap-1 actions">
            {
              props?.item?.productWeight?.map((item, index) => {
                return (
                  <Button
                    key={index}
                    className={`${productActionIndex === index ?
                      "!bg-primary !text-white" : ""
                      }  ${tabError === true && 'error'}`}
                    onClick={() => handleClickActiveTab(index, item)}
                  >
                    {item}
                  </Button>
                )
              })
            }


          </div>
        </div>
      }



      <p className="text-[14px] mt-5 mb-2 text-[#000]">
        Free Shipping (Est. Delivery Time 2-3 Days)
      </p>
      <div className="flex items-center gap-4 py-4">
        <div className="qtyBoxWrapper w-[70px]">
          <QtyBox handleSelecteQty={handleSelecteQty} />
        </div>

        <Button className="btn-org flex gap-2 !min-w-[150px]" onClick={() => addToCart(props?.item, context?.userData?._id, quantity)}>
          {
            isLoading === true ? <CircularProgress /> :
              <>
                {
                  isAdded === true ? <><FaCheckDouble /> Added</> :
                    <>
                      <MdOutlineShoppingCart className="text-[22px]" /> Add to Cart
                    </>
                }

              </>
          }

        </Button>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <span className="flex items-center gap-2 text-[14px] sm:text-[15px] link cursor-pointer font-[500]" onClick={() => handleAddToMyList(props?.item)}>
          {
            isAddedInMyList === true ? <IoMdHeart className="text-[18px] !text-primary group-hover:text-white hover:!text-white" /> :
              <FaRegHeart className="text-[18px] !text-black group-hover:text-white hover:!text-white" />

          }
          Add to Wishlist
        </span>

        <span className="flex items-center gap-2  text-[14px] sm:text-[15px] link cursor-pointer font-[500]">
          <IoGitCompareOutline className="text-[18px]" /> Add to Compare
        </span>
      </div>
    </>
  );
};
