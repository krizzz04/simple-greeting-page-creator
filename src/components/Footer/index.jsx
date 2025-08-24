import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { MdEmail, MdPhone } from "react-icons/md";

import Drawer from "@mui/material/Drawer";
import CartPanel from "../CartPanel";
import { MyContext } from "../../App";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { ProductZoom } from "../ProductZoom";
import { IoCloseSharp } from "react-icons/io5";
import { ProductDetailsComponent } from "../ProductDetails";
import AddAddress from "../../Pages/MyAccount/addAddress";

const Footer = () => {
  const context = useContext(MyContext);

  return (
    <>
      {/* Minimal Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Brand & Contact */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">RoarOfSouth</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MdEmail className="text-gray-400 text-sm" />
                  <Link to="mailto:roarofsouth2025@gmail.com" className="hover:text-gray-900 transition-colors">
                    roarofsouth2025@gmail.com
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <MdPhone className="text-gray-400 text-sm" />
                  <span>+91 9876-543-210</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link to="/products" className="hover:text-gray-900 transition-colors">Products</Link></li>
                <li><Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link></li>
                <li><Link to="/help" className="hover:text-gray-900 transition-colors">Help</Link></li>
              </ul>
            </div>

            {/* Social & Newsletter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Stay Connected</h3>
              <div className="flex space-x-3 mb-4">
                {[
                  { 
                    Icon: FaFacebookF, 
                    href: "https://facebook.com",
                    color: "hover:text-blue-600",
                    bgColor: "hover:bg-blue-50",
                    borderColor: "hover:border-blue-200"
                  },
                  { 
                    Icon: FaInstagram, 
                    href: "https://instagram.com",
                    color: "hover:text-pink-600",
                    bgColor: "hover:bg-pink-50",
                    borderColor: "hover:border-pink-200"
                  },
                  { 
                    Icon: FaTwitter, 
                    href: "https://twitter.com",
                    color: "hover:text-sky-500",
                    bgColor: "hover:bg-sky-50",
                    borderColor: "hover:border-sky-200"
                  },
                  { 
                    Icon: AiOutlineYoutube, 
                    href: "https://youtube.com",
                    color: "hover:text-red-600",
                    bgColor: "hover:bg-red-50",
                    borderColor: "hover:border-red-200"
                  }
                ].map(({ Icon, href, color, bgColor, borderColor }, index) => (
                  <Link
                    key={index}
                    to={href}
                    target="_blank"
                    className={`w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center transition-all duration-300 ${bgColor} ${borderColor} group`}
                  >
                    <Icon className={`text-sm text-gray-500 transition-colors duration-300 ${color}`} />
                  </Link>
                ))}
              </div>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-l focus:outline-none focus:border-gray-300 text-sm"
                />
                <Button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-r text-xs">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-4 pb-16 lg:pb-4">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()}Roar Of South. All rights reserved.
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>Payments:</span>
                  <div className="flex space-x-1 opacity-60">
                    <img src="/visa.png" alt="Visa" className="h-4 grayscale" />
                    <img src="/master_card.png" alt="Mastercard" className="h-4 grayscale" />
                    <img src="/paypal.png" alt="PayPal" className="h-4 grayscale" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Existing Drawers and Modals - keeping your functionality */}
      <Drawer
        open={context.openCartPanel}
        onClose={context.toggleCartPanel(false)}
        anchor={"right"}
        className="cartPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4>Shopping Cart ({context?.cartData?.length})</h4>
          <IoCloseSharp className="text-[20px] cursor-pointer" onClick={context.toggleCartPanel(false)} />
        </div>

        {context?.cartData?.length !== 0 ? (
          <CartPanel data={context?.cartData} />
        ) : (
          <div className="flex items-center justify-center flex-col pt-[100px] gap-5">
            <img src="/empty-cart.png" className="w-[150px]" />
            <h4>Your Cart is currently empty</h4>
            <Button className="btn-org btn-sm" onClick={context.toggleCartPanel(false)}>
              Continue Shopping
            </Button>
          </div>
        )}
      </Drawer>

      <Drawer
        open={context.openAddressPanel}
        onClose={context.toggleAddressPanel(false)}
        anchor={"right"}
        className="addressPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4>{context?.addressMode === "add" ? 'Add' : 'Edit'} Delivery Address</h4>
          <IoCloseSharp className="text-[20px] cursor-pointer" onClick={context.toggleCartPanel(false)} />
        </div>

        <div className="w-full max-h-[100vh] overflow-auto">
          <AddAddress />
        </div>
      </Drawer>

      <Dialog
        open={context?.openProductDetailsModal.open}
        fullWidth={context?.fullWidth}
        maxWidth={context?.maxWidth}
        onClose={context?.handleCloseProductDetailsModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="productDetailsModal"
      >
        <DialogContent>
          <div className="flex items-center w-full productDetailsModalContainer relative">
            <Button
              className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
              onClick={context?.handleCloseProductDetailsModal}
            >
              <IoCloseSharp className="text-[20px]" />
            </Button>
            {context?.openProductDetailsModal?.item?.length !== 0 && (
              <>
                <div className="col1 w-[40%] px-3 py-8">
                  <ProductZoom images={context?.openProductDetailsModal?.item?.images} />
                </div>

                <div className="col2 w-[60%] py-8 px-8 pr-16 productContent">
                  <ProductDetailsComponent item={context?.openProductDetailsModal?.item} />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
