import { Button } from '@mui/material'
import React, { useContext, useEffect } from 'react';
import { IoHomeOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { LuHeart } from "react-icons/lu";
import { BsBagCheck } from "react-icons/bs";
import { FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineFilterAlt } from "react-icons/md";
import { MyContext } from '../../../App';
import { useLocation } from "react-router-dom";

const MobileNav = () => {

    const context = useContext(MyContext)
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
       
        if (location.pathname === "/products" || location.pathname === "/search") {
            context?.setisFilterBtnShow(true)
            // Perform your action here
        } else {
            context?.setisFilterBtnShow(false)
        }
    }, [location]);

    const openFilters = () => {
        context?.setOpenFilter(true);
        context?.setOpenSearchPanel(false)
    }

    const handleNavigation = (path) => {
        console.log("🚀 Navigating to:", path);
        context?.setOpenSearchPanel(false);
        
        // Use window.location.href for immediate navigation
        window.location.href = path;
    }


    return (
        <div className='mobileNav bg-white p-1 px-3 w-full flex items-center justify-between fixed bottom-0 left-0 gap-0 z-[51]'>
            <Button 
                className={`flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700 ${location.pathname === "/" ? "!text-primary" : ""}`}
                onClick={() => handleNavigation("/")}
            >
                <IoHomeOutline size={18} />
                <span className='text-[12px]'>Home</span>
            </Button>

            {
                context?.isFilterBtnShow === true &&
                <Button className="flex-col !w-[40px] !h-[40px] !min-w-[40px] !capitalize !text-gray-700 !bg-primary !rounded-full" onClick={openFilters}>
                    <MdOutlineFilterAlt size={18} className='text-white' />
                </Button>
            }

            <Button className="flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700"
            onClick={()=>context?.setOpenSearchPanel(true)}>
                <IoSearch size={18} />
                <span className='text-[12px]'>Search</span>
            </Button>

            <Button 
                className={`flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700 ${location.pathname === "/my-list" ? "!text-primary" : ""}`}
                onClick={() => handleNavigation("/my-list")}
            >
                <LuHeart size={18} />
                <span className='text-[12px]'>Wishlist</span>
            </Button>

            <Button 
                className={`flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700 ${location.pathname === "/my-orders" ? "!text-primary" : ""}`}
                onClick={() => handleNavigation("/my-orders")}
            >
                <BsBagCheck size={18} />
                <span className='text-[12px]'>Orders</span>
            </Button>

            <Button 
                className={`flex-col !w-[40px] !min-w-[40px] !capitalize !text-gray-700 ${location.pathname === "/my-account" ? "!text-primary" : ""}`}
                onClick={() => handleNavigation("/my-account")}
            >
                <FiUser size={18} />
                <span className='text-[12px]'>Account</span>
            </Button>
        </div>
    )
}

export default MobileNav