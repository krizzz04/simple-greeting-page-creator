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
import { BsLightningCharge } from "react-icons/bs";
import { useNavigate } from "react-router-dom";



export const ProductDetailsComponent = (props) => {
  const [productActionIndex, setProductActionIndex] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTabName, setSelectedTabName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const [tabError, setTabError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [isAddedToCompare, setIsAddedToCompare] = useState(false);

  const context = useContext(MyContext);
  const navigate = useNavigate();

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

  useEffect(() => {
    // Check if product is already in compare list
    const existingCompareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
    const isAlreadyInCompare = existingCompareItems.some(compareItem => compareItem.productId === props?.item?._id);
    setIsAddedToCompare(isAlreadyInCompare);
  }, [props?.item?._id]);

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
      price: product?.price, // Current selling price
      oldPrice: product?.oldPrice, // Original price
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt(product?.price * quantity), // Use current selling price
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

  const buyNow = (product, userId, quantity) => {
    if (userId === undefined) {
      context?.alertBox("error", "you are not login please login first");
      return false;
    }

    const productItem = {
      _id: product?._id,
      productTitle: product?.name,
      image: product?.images[0],
      rating: product?.rating,
      price: product?.price, // Current selling price
      oldPrice: product?.oldPrice, // Original price
      discount: product?.discount,
      quantity: quantity,
      subTotal: parseInt(product?.price * quantity), // Use current selling price
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: product?.brand,
      size: props?.item?.size?.length !== 0 ? selectedTabName : '',
      weight: props?.item?.productWeight?.length !== 0 ? selectedTabName : '',
      ram: props?.item?.productRam?.length !== 0 ? selectedTabName : ''
    }

    if (props?.item?.size?.length !== 0 || props?.item?.productWeight?.length !== 0 || props?.item?.productRam?.length !== 0) {
      if (selectedTabName !== null) {
        setIsBuyNowLoading(true);

        postData("/api/cart/add", productItem).then((res) => {
          if (res?.error === false) {
            context?.getCartItems();
            setTimeout(() => {
              setIsBuyNowLoading(false);
              navigate('/checkout');
            }, 500);
          } else {
            context?.alertBox("error", res?.message);
            setTimeout(() => {
              setIsBuyNowLoading(false);
            }, 500);
          }
        })
      } else {
        setTabError(true);
      }
    } else {
      setIsBuyNowLoading(true);
      postData("/api/cart/add", productItem).then((res) => {
        if (res?.error === false) {
          context?.getCartItems();
          setTimeout(() => {
            setIsBuyNowLoading(false);
            navigate('/checkout');
          }, 500);
        } else {
          context?.alertBox("error", res?.message);
          setTimeout(() => {
            setIsBuyNowLoading(false);
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
        price: item?.price, // Current selling price
        oldPrice: item?.oldPrice, // Original price
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

  const handleAddToCompare = (item) => {
    if (context?.userData === null) {
      context?.alertBox("error", "you are not login please login first");
      return false;
    }

    // Check if product is already in compare list
    const existingCompareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
    const isAlreadyInCompare = existingCompareItems.some(compareItem => compareItem.productId === item._id);

    if (isAlreadyInCompare) {
      context?.alertBox("info", "Product is already in compare list");
      return;
    }

    // Limit compare list to 4 items
    if (existingCompareItems.length >= 4) {
      context?.alertBox("info", "You can compare up to 4 products at a time. Please remove an item from compare list first.");
      return;
    }

    const compareItem = {
      productId: item._id,
      productTitle: item.name,
      image: item.images[0],
      rating: item.rating,
      price: item.price,
      oldPrice: item.oldPrice,
      brand: item.brand,
      discount: item.discount,
      description: item.description
    };

    existingCompareItems.push(compareItem);
    localStorage.setItem('compareItems', JSON.stringify(existingCompareItems));
    
    setIsAddedToCompare(true);
    context?.alertBox("success", "Product added to compare list successfully!");
    
    // Update context if compare data exists
    if (context?.setCompareData) {
      context.setCompareData(existingCompareItems);
    }
  }


  return (
    <div className="w-full">
      <h1 className="text-[18px] sm:text-[22px] lg:text-[24px] font-[600] mb-3 leading-tight">
        {props?.item?.name}
      </h1>
      
      <div className="flex items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <span className="text-gray-400 text-[13px] sm:text-[14px]">
          Brand:{" "}
          <span className="font-[500] text-black opacity-75">
            {props?.item?.brand}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <Rating name="size-small" value={props?.item?.rating} size="small" readOnly />
          <span className="text-[13px] sm:text-[14px] cursor-pointer text-primary hover:underline" onClick={props.gotoReviews}>
            Reviews ({props.reviewsCount})
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="oldPrice line-through text-gray-500 text-[18px] sm:text-[20px] font-[500]">
            &#x20b9;{props?.item?.oldPrice}
          </span>
          <span className="price text-primary text-[18px] sm:text-[20px] lg:text-[22px] font-[600]">
            &#x20b9;{props?.item?.price}
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-[13px] sm:text-[14px]">
            In Stock:{" "}
            <span className="text-green-600 text-[13px] sm:text-[14px] font-bold">
              {props?.item?.countInStock} Items
            </span>
          </span>
        </div>
      </div>

      {
        props?.item?.productRam?.length !== 0 &&
        <div className="mb-4">
          <span className="text-[15px] sm:text-[16px] font-medium mb-2 block">RAM:</span>
          <div className="flex flex-wrap items-center gap-2">
            {
              props?.item?.productRam?.map((item, index) => {
                return (
                  <Button
                    key={index}
                    className={`${productActionIndex === index ?
                      "!bg-primary !text-white" : "!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
                      }  ${tabError === true && '!border-red-500 !border-2'} !min-w-0 !px-3 !py-2 !text-[13px] sm:!text-[14px]`}
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
        <div className="mb-4">
          <span className="text-[15px] sm:text-[16px] font-medium mb-2 block">Size:</span>
          <div className="flex flex-wrap items-center gap-2">
            {
              props?.item?.size?.map((item, index) => {
                return (
                  <Button
                    key={index}
                    className={`${productActionIndex === index ?
                      "!bg-primary !text-white" : "!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
                      } ${tabError === true && '!border-red-500 !border-2'} !min-w-0 !px-3 !py-2 !text-[13px] sm:!text-[14px]`}
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
        <div className="mb-4">
          <span className="text-[15px] sm:text-[16px] font-medium mb-2 block">Weight:</span>
          <div className="flex flex-wrap items-center gap-2">
            {
              props?.item?.productWeight?.map((item, index) => {
                return (
                  <Button
                    key={index}
                    className={`${productActionIndex === index ?
                      "!bg-primary !text-white" : "!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
                      }  ${tabError === true && '!border-red-500 !border-2'} !min-w-0 !px-3 !py-2 !text-[13px] sm:!text-[14px]`}
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

      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <p className="text-[13px] sm:text-[14px] text-blue-800 font-medium">
          🚚 Free Shipping (Est. Delivery: 10-15 Days)
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="qtyBoxWrapper w-[80px] sm:w-[70px]">
          <QtyBox handleSelecteQty={handleSelecteQty} />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            className="btn-org flex gap-2 !min-w-[140px] sm:!min-w-[150px] !h-[40px] sm:!h-[44px] !text-[14px] sm:!text-[15px]" 
            onClick={() => addToCart(props?.item, context?.userData?._id, quantity)}
          >
            {
              isLoading === true ? <CircularProgress size={20} /> :
                <>
                  {
                    isAdded === true ? <><FaCheckDouble /> Added</> :
                      <>
                        <MdOutlineShoppingCart className="text-[18px] sm:text-[20px]" /> Add to Cart
                      </>
                  }
                </>
            }
          </Button>

          <Button 
            className="btn-dark flex gap-2 !min-w-[140px] sm:!min-w-[150px] !h-[40px] sm:!h-[44px] !text-[14px] sm:!text-[15px] !bg-green-600 hover:!bg-green-700" 
            onClick={() => buyNow(props?.item, context?.userData?._id, quantity)}
          >
            {
              isBuyNowLoading === true ? <CircularProgress size={20} /> :
                <>
                  <BsLightningCharge className="text-[18px] sm:text-[20px]" /> Buy Now
                </>
            }
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200">
        <span 
          className="flex items-center gap-2 text-[13px] sm:text-[14px] link cursor-pointer font-[500] hover:text-primary transition-colors" 
          onClick={() => handleAddToMyList(props?.item)}
        >
          {
            isAddedInMyList === true ? 
              <IoMdHeart className="text-[16px] sm:text-[18px] !text-primary" /> :
              <FaRegHeart className="text-[16px] sm:text-[18px] !text-gray-600 hover:!text-primary" />
          }
          Add to Wishlist
        </span>

        <span 
          className="flex items-center gap-2 text-[13px] sm:text-[14px] link cursor-pointer font-[500] hover:text-primary transition-colors"
          onClick={() => handleAddToCompare(props?.item)}
        >
          {
            isAddedToCompare === true ? 
              <IoGitCompareOutline className="text-[16px] sm:text-[18px] !text-primary" /> :
              <IoGitCompareOutline className="text-[16px] sm:text-[18px] !text-gray-600 hover:!text-primary" />
          }
          {isAddedToCompare ? 'Added to Compare' : 'Add to Compare'}
        </span>
      </div>
    </div>
  );
};
