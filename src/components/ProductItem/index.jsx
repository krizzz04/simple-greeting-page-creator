import React, { useContext, useEffect, useState } from "react";
import "../ProductItem/style.css";
import { Link, useNavigate } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdZoomOutMap } from "react-icons/md";
import { MyContext } from "../../App";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { deleteData, editData, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { MdClose } from "react-icons/md";
import { IoMdHeart } from "react-icons/io";
import { BsLightningCharge } from "react-icons/bs";


const ProductItem = (props) => {

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
  const [isAddedToCompare, setIsAddedToCompare] = useState(false);
  const [cartItem, setCartItem] = useState([]);

  const [activeTab, setActiveTab] = useState(null);
  const [isShowTabs, setIsShowTabs] = useState(false);
  const [selectedTabName, setSelectedTabName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const context = useContext(MyContext);
  const navigate = useNavigate();

  const addToCart = (product, userId, quantity) => {

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


    setIsLoading(true);

    if (props?.item?.size?.length !== 0 || props?.item?.productRam?.length !== 0 || props?.item?.productWeight
      ?.length !== 0) {
      setIsShowTabs(true)
    } else {
      setIsAdded(true);

      setIsShowTabs(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      context?.addToCart(productItem, userId, quantity);

    }



    if (activeTab !== null) {
      context?.addToCart(productItem, userId, quantity);
      setIsAdded(true);
      setIsShowTabs(false)
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }


  }

  const buyNow = (product, userId) => {
    if (!context?.userData) {
      context?.alertBox("error", "Please login first to buy this product");
      return;
    }

    const productItem = {
      _id: product?._id,
      productTitle: product?.name,
      image: product?.images[0],
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity: 1,
      subTotal: parseInt(product?.price * 1),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: product?.brand,
      size: props?.item?.size?.length !== 0 ? selectedTabName : '',
      weight: props?.item?.productWeight?.length !== 0 ? selectedTabName : '',
      ram: props?.item?.productRam?.length !== 0 ? selectedTabName : ''
    }

    setIsLoading(true);

    // Check if product has variants that need selection
    if (props?.item?.size?.length !== 0 || props?.item?.productRam?.length !== 0 || props?.item?.productWeight?.length !== 0) {
      setIsShowTabs(true);
      setIsLoading(false);
      context?.alertBox("info", "Please select a variant first");
      return;
    }

    // Add to cart and redirect to checkout
    context?.addToCart(productItem, userId, 1);
    context?.alertBox("success", "Product added to cart! Redirecting to checkout...");
    
    setTimeout(() => {
      setIsLoading(false);
      navigate('/checkout');
    }, 1000);
  }

  const handleAddToCompare = (item) => {
    if (!context?.userData) {
      context?.alertBox("error", "Please login first to add products to compare");
      return;
    }

    try {
      const compareItem = {
        _id: item?._id,
        productTitle: item?.name,
        image: item?.images[0],
        brand: item?.brand,
        price: item?.price,
        oldPrice: item?.oldPrice,
        discount: item?.discount,
        rating: item?.rating
      };

      // Get existing compare items from localStorage
      const existingCompareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
      
      // Check if item is already in compare list
      const isAlreadyAdded = existingCompareItems.some(compareItem => compareItem._id === item._id);
      
      if (isAlreadyAdded) {
        context?.alertBox("warning", "Product is already in your compare list");
        return;
      }

      // Check if compare list has reached maximum limit (4 items)
      if (existingCompareItems.length >= 4) {
        context?.alertBox("warning", "You can compare up to 4 products at a time. Please remove some items first.");
        return;
      }

      // Add new item to compare list
      const updatedCompareItems = [...existingCompareItems, compareItem];
      localStorage.setItem('compareItems', JSON.stringify(updatedCompareItems));
      
      // Update context state
      if (context?.setCompareData) {
        context.setCompareData(updatedCompareItems);
      }
      
      setIsAddedToCompare(true);
      context?.alertBox("success", "Product added to compare list successfully");
      
    } catch (error) {
      console.error('Error adding to compare:', error);
      context?.alertBox("error", "Failed to add product to compare list");
    }
  };


  const handleClickActiveTab = (index, name) => {
    setActiveTab(index)
    setSelectedTabName(name)
  }

  const handleBuyNowWithVariant = () => {
    if (activeTab === null) {
      context?.alertBox("error", "Please select a variant first");
      return;
    }
    
    buyNow(props?.item, context?.userData?._id);
  }

  useEffect(() => {
    const item = context?.cartData?.filter((cartItem) =>
      cartItem.productId.includes(props?.item?._id)
    )

    const myListItem = context?.myListData?.filter((item) =>
      item.productId.includes(props?.item?._id)
    )

    if (item?.length !== 0) {
      setCartItem(item)
      setIsAdded(true);
      setQuantity(item[0]?.quantity)
    } else {
      setQuantity(1)
    }


    if (myListItem?.length !== 0) {
      setIsAddedInMyList(true);
    } else {
      setIsAddedInMyList(false)
    }

  }, [context?.cartData]);

  // Check if item is already in compare list on component mount
  useEffect(() => {
    try {
      const existingCompareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
      const isAlreadyAdded = existingCompareItems.some(compareItem => compareItem._id === props?.item?._id);
      setIsAddedToCompare(isAlreadyAdded);
    } catch (error) {
      console.error('Error checking compare status:', error);
    }
  }, [props?.item?._id]);


  const minusQty = () => {
    if (quantity !== 1 && quantity > 1) {
      setQuantity(quantity - 1)
    } else {
      setQuantity(1)
    }


    if (quantity === 1) {
      deleteData(`/api/cart/delete-cart-item/${cartItem[0]?._id}`).then((res) => {
        setIsAdded(false);
        context.alertBox("success", "Item Removed ");
        context?.getCartItems();
        setIsShowTabs(false);
        setActiveTab(null);
      })
    } else {
      const obj = {
        _id: cartItem[0]?._id,
        qty: quantity - 1,
        subTotal: props?.item?.price * (quantity - 1)
      }

      editData(`/api/cart/update-qty`, obj).then((res) => {
        context.alertBox("success", res?.data?.message);
        context?.getCartItems();
      })
    }

  }


  const addQty = () => {

    setQuantity(quantity + 1);

    const obj = {
      _id: cartItem[0]?._id,
      qty: quantity + 1,
      subTotal: props?.item?.price * (quantity + 1)
    }

    editData(`/api/cart/update-qty`, obj).then((res) => {
      context.alertBox("success", res?.data?.message);
      context?.getCartItems();
    })



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
    <div 
      className="productItem shadow-lg rounded-md overflow-hidden border-1 border-[rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
      onClick={() => navigate(`/product/${props?.item?._id}`)}
    >
      <div className="group imgWrapper w-[100%]  overflow-hidden  rounded-md rounded-bl-none rounded-br-none relative">
        <div className="img h-[280px] overflow-hidden">
          <img
            src={props?.item?.images?.[0] || "/homeBannerPlaceholder.jpg"}
            className="w-full"
            alt={props?.item?.name || "Product"}
          />

          {
            props?.item?.images?.length > 1 &&
            <img
              src={props?.item?.images?.[1] || "/homeBannerPlaceholder.jpg"}
              className="w-full transition-all duration-700 absolute top-0 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
              alt={props?.item?.name || "Product"}
            />
          }


        </div>



        {
          isShowTabs === true &&
          <div className="flex items-center justify-center absolute top-0 left-0 w-full h-full 
      bg-[rgba(0,0,0,0.7)] z-[60] p-3 gap-2">

            <Button 
              className="!absolute top-[10px] right-[10px] !min-w-[30px] !min-h-[30px] !w-[30px] !h-[30px] !rounded-full !bg-[rgba(255,255,255,1)] text-black"
              onClick={(e) => {
                e.stopPropagation();
                setIsShowTabs(false);
              }}
            > 
              <MdClose className=" text-black z-[90] text-[25px]" />
            </Button>

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {
                  props?.item?.size?.length !== 0 && props?.item?.size?.map((item, index) => {
                    return (
                      <span 
                        key={index} 
                        className={`flex items-center justify-center p-1 px-2 bg-[rgba(255,555,255,0.8)] max-w-[35px] h-[25px]  
          rounded-sm cursor-pointer hover:bg-white 
          ${activeTab === index && '!bg-primary text-white'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickActiveTab(index, item);
                        }}
                      >
                        {item}
                      </span>
                    )
                  })
                }

                {
                  props?.item?.productRam?.length !== 0 && props?.item?.productRam?.map((item, index) => {
                    return (
                      <span 
                        key={index} 
                        className={`flex items-center justify-center p-1 px-2 bg-[rgba(255,555,255,0.8)] max-w-[45px] h-[25px]  
          rounded-sm cursor-pointer hover:bg-white 
          ${activeTab === index && '!bg-primary text-white'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickActiveTab(index, item);
                        }}
                      >
                        {item}
                      </span>
                    )
                  })
                }


                {
                  props?.item?.productWeight?.length !== 0 && props?.item?.productWeight?.map((item, index) => {
                    return (
                      <span 
                        key={index} 
                        className={`flex items-center justify-center p-1 px-2 bg-[rgba(255,555,255,0.8)] max-w-[35px] h-[25px]  
          rounded-sm cursor-pointer hover:bg-white 
          ${activeTab === index && '!bg-primary text-white'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickActiveTab(index, item);
                        }}
                      >
                        {item}
                      </span>
                    )
                  })
                }
              </div>

              {activeTab !== null && (
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <Button 
                    className="btn-org btn-sm gap-2" 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(props?.item, context?.userData?._id, quantity);
                    }}
                  >
                    <MdOutlineShoppingCart className="text-[18px]" /> Add to Cart
                  </Button>
                  
                  <Button 
                    className="btn-dark btn-sm gap-2" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNowWithVariant();
                    }}
                  >
                    <BsLightningCharge className="text-[18px]" /> Buy Now
                  </Button>
                </div>
              )}
            </div>

          </div>
        }


        <span className="discount flex items-center absolute top-[10px] left-[10px] z-50 bg-gradient-to-r from-primary to-orange-500 text-white rounded-lg p-1 text-[12px] font-[500] shadow-md">
          {props?.item?.discount}%
        </span>

        <div className="actions absolute top-[-20px] right-[5px] z-50 flex items-center gap-2 flex-col w-[50px] transition-all duration-300 group-hover:top-[15px] opacity-0 group-hover:opacity-100">

          <Button 
            className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white  text-black hover:!bg-primary hover:text-white group" 
            onClick={(e) => {
              e.stopPropagation();
              context.handleOpenProductDetailsModal(true, props?.item);
            }}
          >
            <MdZoomOutMap className="text-[18px] !text-black group-hover:text-white hover:!text-white" />
          </Button>

          <Button 
            className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white  text-black hover:!bg-primary hover:text-white group"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCompare(props?.item);
            }}
          >
            <IoGitCompareOutline className={`text-[18px] ${isAddedToCompare ? '!text-primary' : '!text-black'} group-hover:text-white hover:!text-white`} />
          </Button>

          <Button 
            className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white  text-black hover:!bg-primary hover:text-white group`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToMyList(props?.item);
            }}
          >
            {
              isAddedInMyList === true ? <IoMdHeart className="text-[18px] !text-primary group-hover:text-white hover:!text-white" /> :
                <FaRegHeart className="text-[18px] !text-black group-hover:text-white hover:!text-white" />

            }

          </Button>
        </div>
      </div>

      <div className="info p-3 py-5 relative pb-[80px] h-[220px]">
        <h6 className="text-[13px] !font-[400]">
          <span className="link transition-all">
            {props?.item?.brand}
          </span>
        </h6>
        <h3 className="text-[12px] lg:text-[13px] title mt-1 font-[500] mb-1 text-[#000]">
          <Link to={`/product/${props?.item?._id}`} className="link transition-all">
            {props?.item?.name?.substr(0, 25) + '...'}
          </Link>
        </h3>

        <Rating name="size-small" defaultValue={props?.item?.rating} size="small" readOnly />

        <div className="flex items-center gap-4 justify-between">
          <span className="oldPrice line-through text-gray-500 text-[12px] lg:text-[14px] font-[500]">
            {props?.item?.oldPrice?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
          </span>
          <span className="price bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent text-[12px] lg:text-[14px] font-[600]">
            {props?.item?.price?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
          </span>
        </div>


        <div className="!absolute bottom-[15px] left-0 pl-3 pr-3 w-full">

          {
            isAdded === false ?

              <div className="flex flex-col gap-2">
                <Button 
                  className="btn-org addToCartBtn btn-border flex w-full btn-sm gap-2 " 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(props?.item, context?.userData?._id, quantity);
                  }}
                >
                  <MdOutlineShoppingCart className="text-[18px]" /> Add to Cart
                </Button>
                
                <Button 
                  className="btn-dark buyNowBtn btn-border flex w-full btn-sm gap-2" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    buyNow(props?.item, context?.userData?._id);
                  }}
                >
                  <BsLightningCharge className="text-[18px]" /> Buy Now
                </Button>
              </div>

              :

              <>
                {
                  isLoading === true ?
                    <Button className="addtocart btn-org btn-border flex w-full btn-sm gap-2 " size="small">
                      <CircularProgress />
                    </Button>

                    :


                    <div className="flex items-center justify-between overflow-hidden rounded-full border border-[rgba(0,0,0,0.1)]">
                      <Button 
                        className="!min-w-[35px] !w-[35px] !h-[30px] !bg-[#f1f1f1]  !rounded-none" 
                        onClick={(e) => {
                          e.stopPropagation();
                          minusQty();
                        }}
                      >
                        <FaMinus className="text-[rgba(0,0,0,0.7)]" />
                      </Button>
                      <span>{quantity}</span>
                      <Button 
                        className="!min-w-[35px] !w-[35px] !h-[30px] !bg-gray-800 !rounded-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          addQty();
                        }}
                      >
                        <FaPlus className="text-white" />
                      </Button>
                    </div>

                }
              </>

          }

        </div>



      </div>
    </div>
  );
};

export default ProductItem;
