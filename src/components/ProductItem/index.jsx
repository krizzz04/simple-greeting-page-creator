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



const ProductItem = (props) => {

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isAddedInMyList, setIsAddedInMyList] = useState(false);
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
      name: product?.name,
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


  const handleClickActiveTab = (index, name) => {
    setActiveTab(index)
    setSelectedTabName(name)
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
    <div className="product-card flex flex-col rounded-lg shadow-md bg-white overflow-hidden h-full">
      <div className="relative">
        <img
          src={props?.item?.images?.[0]}
          alt={props?.item?.name}
          className="w-full h-40 object-cover"
        />
        <span className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold rounded px-2 py-1">
          {props?.item?.discount}%
        </span>
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white group" onClick={() => context.handleOpenProductDetailsModal(true, props?.item)}>
            <MdZoomOutMap className="text-[18px] !text-black group-hover:text-white hover:!text-white" />
          </Button>
          <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white group">
            <IoGitCompareOutline className="text-[18px] !text-black group-hover:text-white hover:!text-white" />
          </Button>
          <Button className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white group`}
            onClick={() => handleAddToMyList(props?.item)}
          >
            {isAddedInMyList === true ? <IoMdHeart className="text-[18px] !text-primary group-hover:text-white hover:!text-white" /> :
              <FaRegHeart className="text-[18px] !text-black group-hover:text-white hover:!text-white" />}
          </Button>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-3">
        <span className="text-xs text-gray-500">{props?.item?.brand}</span>
        <Link to={`/product/${props?.item?._id}`} className="font-semibold text-sm text-gray-900 truncate mb-1">
          {props?.item?.name}
        </Link>
        <Rating name="size-small" defaultValue={props?.item?.rating} size="small" readOnly />
        <div className="flex items-center gap-2 mt-1">
          <span className="line-through text-xs text-gray-400">
            {props?.item?.oldPrice?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
          </span>
          <span className="text-primary font-bold text-sm">
            {props?.item?.price?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex flex-col gap-2 mt-3 sm:flex-row">
          <Button
            className="btn-org btn-border w-full btn-sm"
            size="small"
            onClick={() => addToCart(props?.item, context?.userData?._id, quantity)}
          >
            <MdOutlineShoppingCart className="text-[18px]" /> Add to Cart
          </Button>
          <Button
            className="btn-dark btn-border w-full btn-sm"
            size="small"
            onClick={() => {
              addToCart(props?.item, context?.userData?._id, 1);
              setTimeout(() => {
                navigate('/checkout');
              }, 300);
            }}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
