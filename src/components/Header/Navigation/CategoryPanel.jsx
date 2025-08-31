import React, { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { IoCloseSharp } from "react-icons/io5";
import { CategoryCollapse } from "../../CategoryCollapse";
import { Button } from "@mui/material";
import { MyContext } from "../../../App";
import { Link, useNavigate } from "react-router-dom";
import { fetchDataFromApi } from "../../../utils/api";
import { MdCategory, MdShoppingCart, MdPerson } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";

const CategoryPanel = (props) => {

  const context = useContext(MyContext);
  const history = useNavigate();

  const toggleDrawer = (newOpen) => () => {
    props.setIsOpenCatPanel(newOpen);
    props.propsSetIsOpenCatPanel(newOpen)
  };

  const DrawerList = (
    <Box sx={{ width: 320 }} role="presentation" className="categoryPanel bg-gradient-to-b from-gray-50 to-white">

      {/* Header with Logo and Close */}
      <div className="bg-gradient-to-r from-primary to-orange-500 p-4 relative">
        <div className="flex items-center justify-between">
          <img src={localStorage.getItem('logo') || "/logo.jpg"} className="w-[140px] brightness-0 invert" alt="Logo" />
          <button
            onClick={toggleDrawer(false)}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
          >
            <IoCloseSharp className="text-white text-lg" />
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      {/* Profile Section */}
      {context?.isLogin && context?.userData && (
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-5">
          <div className="mb-4 pb-3 border-b border-gray-200">
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Welcome back!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-gradient-to-br from-primary to-orange-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <img
                  src={context?.userData?.avatar || "/user.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-[700] text-gray-800 mb-1 truncate">{context?.userData?.name}</h4>
              <p className="text-[13px] text-gray-600 mb-1 truncate">{context?.userData?.email}</p>
              {context?.userData?.mobile && (
                <p className="text-[13px] text-primary font-medium">{context?.userData?.mobile}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MdCategory className="text-primary text-xl" />
          Shop By Categories
        </h3>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link 
            to="/products" 
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            onClick={() => {
              props.setIsOpenCatPanel(false);
              props.propsSetIsOpenCatPanel(false);
            }}
          >
            <div className="flex items-center gap-2">
              <MdShoppingCart className="text-primary text-lg group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">All Products</span>
            </div>
          </Link>
          
          <Link 
            to="/my-list" 
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            onClick={() => {
              props.setIsOpenCatPanel(false);
              props.propsSetIsOpenCatPanel(false);
            }}
          >
            <div className="flex items-center gap-2">
              <FaRegHeart className="text-primary text-lg group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Wishlist</span>
            </div>
          </Link>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {
            props?.data?.length !== 0 && <CategoryCollapse data={props?.data} />
          }
        </div>

        {/* User Actions */}
        <div className="mt-6 space-y-3">
          {
            context?.windowWidth < 992 && context?.isLogin === false &&
            <Link 
              to="/login" 
              className="block" 
              onClick={() => {
                props.setIsOpenCatPanel(false);
                props.propsSetIsOpenCatPanel(false)
              }}
            >
              <Button className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <MdPerson className="mr-2" />
                Login to Your Account
              </Button>
            </Link>
          }

          {
            context?.windowWidth < 992 && context?.isLogin === true &&
            <div 
              className="block" 
              onClick={() => {
                props.setIsOpenCatPanel(false);
                props.propsSetIsOpenCatPanel(false)
                fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`, { withCredentials: true }).then((res) => {
                  if (res?.error === false) {
                    context.handleLogout();
                    history("/");
                  }
                })
              }}
            >
              <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <MdPerson className="mr-2" />
                Logout
              </Button>
            </div>
          }
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Discover our handcrafted tiger-head decor inspired by Mangalore's iconic Pilivesha
          </p>
        </div>
      </div>

    </Box>
  );

  return (
    <>
      <Drawer 
        open={props.isOpenCatPanel} 
        onClose={toggleDrawer(false)}
        anchor="left"
        className="category-drawer"
      >
        {DrawerList}
      </Drawer>
    </>
  );
};

export default CategoryPanel;
