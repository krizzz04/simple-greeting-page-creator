import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

import Drawer from "@mui/material/Drawer";
import CartPanel from "../CartPanel";
import { MyContext } from "../../App";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { ProductZoom } from "../ProductZoom";
import { IoCloseSharp } from "react-icons/io5";
import { ProductDetailsComponent } from "../ProductDetails";
import AddAddress from "../../Pages/MyAccount/addAddress";

const Footer = () => {
  const context = useContext(MyContext);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [openTermsConditions, setOpenTermsConditions] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);

  const handleOpenPrivacyPolicy = () => {
    setOpenPrivacyPolicy(true);
  };

  const handleClosePrivacyPolicy = () => {
    setOpenPrivacyPolicy(false);
  };

  const handleOpenTermsConditions = () => {
    setOpenTermsConditions(true);
  };

  const handleCloseTermsConditions = () => {
    setOpenTermsConditions(false);
  };

  const handleOpenHelp = () => {
    setOpenHelp(true);
  };

  const handleCloseHelp = () => {
    setOpenHelp(false);
  };

  const handleOpenAbout = () => {
    setOpenAbout(true);
  };

  const handleCloseAbout = () => {
    setOpenAbout(false);
  };

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
                  <span>+91 8073687598</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={handleOpenAbout} className="hover:text-gray-900 transition-colors text-left">About</button></li>
                <li><Link to="/products" className="hover:text-gray-900 transition-colors">Products</Link></li>
                <li><Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link></li>
                <li><button onClick={handleOpenHelp} className="hover:text-gray-900 transition-colors text-left">Help</button></li>
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
                    href: "https://instagram.com/roarofsouth",
                    color: "hover:text-pink-600",
                    bgColor: "hover:bg-pink-50",
                    borderColor: "hover:border-pink-200"
                  },
                  { 
                    Icon: FaWhatsapp, 
                    href: "https://wa.me/918073687598",
                    color: "hover:text-green-600",
                    bgColor: "hover:bg-green-50",
                    borderColor: "hover:border-green-200"
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
                © {new Date().getFullYear()} Roar Of South. All rights reserved.
              </p>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleOpenAbout}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  About
                </button>
                <span className="text-xs text-gray-400">|</span>
                <button 
                  onClick={handleOpenPrivacyPolicy}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Privacy Policy
                </button>
                <span className="text-xs text-gray-400">|</span>
                <button 
                  onClick={handleOpenTermsConditions}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Terms & Conditions
                </button>
                <span className="text-xs text-gray-400">|</span>
                <button 
                  onClick={handleOpenHelp}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Help
                </button>
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

      {/* About Modal */}
      <Dialog
        open={openAbout}
        onClose={handleCloseAbout}
        maxWidth="md"
        fullWidth
        className="about-modal"
      >
        <DialogTitle className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">About ROAR OF SOUTH</h2>
          <Button
            onClick={handleCloseAbout}
            className="!min-w-0 !p-1"
          >
            <IoCloseSharp className="text-xl" />
          </Button>
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ROAR OF SOUTH</h3>
              <p className="text-lg font-medium text-gray-600">Celebrating Heritage, Strength, and Pride</p>
            </div>

            <div className="space-y-6">
              {/* Main Story */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg">
                <p className="text-sm leading-relaxed mb-4">
                  At <strong>ROAR OF SOUTH</strong>, we believe that every piece of art carries a story and ours roars with power, tradition, and cultural pride. Inspired by Mangalore's iconic Pilivesha (Tiger Dance), this exquisite handcrafted tiger-head décor honors Karnataka's rich coastal legacy and fierce spirit.
                </p>
                <p className="text-sm leading-relaxed">
                  This limited-edition piece has even been presented to leaders like <strong>Hon. Prime Minister Narendra Modi</strong> and <strong>Sri Siddaramaiah</strong>, reflecting its cultural significance and timeless appeal. Each tiger head is sandcrafted, uniquely molded, and mounted on a premium teak wood or acrylic-glass base, blending bold artistry with refined craftsmanship.
                </p>
              </div>

              {/* Cultural Significance */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Cultural Significance & Symbolism
                </h4>
                <p className="text-sm leading-relaxed mb-3">
                  The tiger is a universal symbol of <strong>shakti (energy)</strong>, <strong>leadership</strong>, and <strong>protection</strong>. In Vastu, keeping a tiger idol or image is believed to bring courage, confidence, and progress while safeguarding spaces from negative influences.
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">Optimal Placement for Positive Energy:</h5>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <strong>North or East direction</strong> → Brings positive energy, courage, and progress
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <strong>Behind your office chair</strong> → Symbolizes authority and protection
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <strong>In your living room</strong> → Creates an impressive focal point
                    </li>
                  </ul>
                </div>
              </div>

              {/* Versatility */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Versatility & Perfect Gifting
                </h4>
                <p className="text-sm leading-relaxed">
                  Perfect as a <strong>personalized gift</strong>, <strong>corporate memento</strong>, or <strong>dashboard décor</strong>, the ROAR OF SOUTH is more than just a collectible—it's a statement of strength, culture, and identity. Whether on a desk, showcase, or workspace, it transforms any environment into one of bold aesthetics and cultural significance.
                </p>
              </div>

              {/* Craftsmanship */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Artisan Craftsmanship
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <strong>Sandcrafted</strong> and uniquely molded for authenticity
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <strong>Premium teak wood</strong> or <strong>acrylic-glass base</strong> for durability
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <strong>Limited-edition</strong> pieces with cultural significance
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <strong>Handcrafted</strong> with attention to detail and tradition
                  </li>
                </ul>
              </div>

              {/* Call to Action */}
              <div className="text-center p-6 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Bring home this exclusive symbol of heritage and strength
                </p>
                <p className="text-sm text-gray-700">
                  and let your space roar with pride. 🐯✨
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Modal */}
      <Dialog
        open={openHelp}
        onClose={handleCloseHelp}
        maxWidth="md"
        fullWidth
        className="help-modal"
      >
        <DialogTitle className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Help Center</h2>
          <Button
            onClick={handleCloseHelp}
            className="!min-w-0 !p-1"
          >
            <IoCloseSharp className="text-xl" />
          </Button>
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">HELP</h3>
              <p className="text-sm text-gray-600">Here you can find all the important information related to shipping, delivery, and returns.</p>
            </div>

            <div className="space-y-6">
              {/* Shipping and Delivery */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Shipping and Delivery
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Orders are usually shipped within <strong>0–7 days</strong> or as per the delivery date confirmed at the time of order.
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Domestic orders are typically delivered within <strong>1–15 working days</strong>.
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    We are not responsible for delays caused by courier companies or postal services, but we ensure timely handover of shipments.
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Orders are delivered to the address provided at checkout. Please double-check your details as we are not liable for incorrect addresses.
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    All orders are shipped via registered domestic courier services or speed post.
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <strong>Free shipping is available on all orders.</strong>
                  </li>
                </ul>
              </div>

              {/* Returns and Replacements */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Returns and Replacements
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Our products are not customized but go through strict quality checks.
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    If you receive a damaged or incorrect item, contact us within <strong>3 days</strong> of delivery.
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    We follow a <strong>no-refund policy</strong>. However, after verification, we will replace the damaged or incorrect item.
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Shipping charges for sending the replacement are to be paid by the customer, but the replacement product will be provided at no additional cost.
                  </li>
                </ul>
              </div>

              {/* Contact Us */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  Contact Us
                </h3>
                <p className="text-sm mb-3">For any queries, issues, or assistance regarding your order, you can reach out to us:</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MdEmail className="text-gray-500 text-sm" />
                    <span className="text-sm">
                      <strong>Email:</strong> 
                      <a href="mailto:roarofsouth2025@gmail.com" className="text-blue-600 hover:underline ml-1">
                        roarofsouth2025@gmail.com
                      </a>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MdPhone className="text-gray-500 text-sm" />
                    <span className="text-sm">
                      <strong>Phone/WhatsApp:</strong> 
                      <a href="tel:+918073687598" className="text-blue-600 hover:underline ml-1">
                        +91 8073687598
                      </a>
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <MdLocationOn className="text-gray-500 text-sm mt-0.5" />
                    <div className="text-sm">
                      <strong>Address:</strong>
                      <div className="mt-1 text-gray-600">
                        Roar of South Pvt Limited<br />
                        Building No./Flat No.: 1-65<br />
                        Rego Garden, Old Airport Road, Opp Rotary Park,<br />
                        Malavoor Bajpe, Mangaluru, Dakshina Kannada,<br />
                        Karnataka – 574142
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Closing Message */}
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">
                  We're here to help you! 🎯
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog
        open={openPrivacyPolicy}
        onClose={handleClosePrivacyPolicy}
        maxWidth="md"
        fullWidth
        className="privacy-policy-modal"
      >
        <DialogTitle className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Privacy Policy</h2>
          <Button
            onClick={handleClosePrivacyPolicy}
            className="!min-w-0 !p-1"
          >
            <IoCloseSharp className="text-xl" />
          </Button>
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <p className="text-sm leading-relaxed">
              <strong>ROAR OF SOUTH</strong>, whose registered/operational office is Building No./Flat No.: 1-65, Rego Garden, Old Airport Road, Opp Rotary Park, Malavoor Bajpe, Mangaluru, Karnataka – 574142 (hereinafter referred to as "ROAR OF SOUTH," "we," "us," or "our"), is committed to safeguarding the privacy of our customers and protecting personal information in accordance with applicable Indian laws.
            </p>
            
            <p className="text-sm leading-relaxed">
              Our products celebrate cultural heritage and craftsmanship, such as handcrafted tiger-head décor inspired by Mangalore's iconic Pilivesha (Tiger Dance). This Privacy Policy explains how we collect, use, and protect your information when you interact with our website or purchase our products.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Personal Information:</strong> We may collect your name, email address, phone number, and billing/shipping details when you place an order or contact us.</li>
                  <li><strong>Third-Party Applications:</strong> We may process order-related data in third-party systems (e.g., payment gateways, logistics partners). These services are governed by their own privacy policies.</li>
                  <li><strong>Website Data:</strong> We may collect non-personal information, such as browser type, device information, and website usage, to improve our user experience.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>To process and fulfill your orders.</li>
                  <li>To communicate updates, confirmations, and support.</li>
                  <li>To improve our offerings and website experience.</li>
                  <li>To showcase limited product designs (such as craftwork images) on our website or social media for promotional purposes. Any display will never include sensitive personal information like contact details or addresses.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">3. Data Security</h3>
                <p className="text-sm">We use reasonable and appropriate measures to protect your information against unauthorized access, alteration, disclosure, or destruction.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">4. Data Sharing</h3>
                <p className="text-sm">We do not sell or trade your information. However, we may share data with trusted partners like payment processors, delivery services, or technology platforms necessary to complete your order.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">5. Your Rights</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>You can access, update, or request deletion of your personal information.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">6. Cookies</h3>
                <p className="text-sm">Our website may use cookies to enhance your browsing experience. You can manage or disable cookies in your browser settings.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">7. Changes to This Privacy Policy</h3>
                <p className="text-sm">We may update this Privacy Policy occasionally. Significant changes will be highlighted on our website.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">8. Contact Information</h3>
                <p className="text-sm mb-2">If you have questions or concerns about this Privacy Policy or your information, please contact us:</p>
                <ul className="list-none space-y-1 text-sm">
                  <li><strong>Email:</strong> <a href="mailto:roarofsouth2025@gmail.com" className="text-blue-600 hover:underline">roarofsouth2025@gmail.com</a></li>
                  <li><strong>Phone:</strong> <a href="tel:+918073687598" className="text-blue-600 hover:underline">+91 8073687598</a></li>
                  <li><strong>Website:</strong> <a href="https://roarofsouth.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://roarofsouth.vercel.app/</a></li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Modal */}
      <Dialog
        open={openTermsConditions}
        onClose={handleCloseTermsConditions}
        maxWidth="md"
        fullWidth
        className="terms-conditions-modal"
      >
        <DialogTitle className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Terms & Conditions</h2>
          <Button
            onClick={handleCloseTermsConditions}
            className="!min-w-0 !p-1"
          >
            <IoCloseSharp className="text-xl" />
          </Button>
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              <strong>Effective Date:</strong> 24-08-2025
            </div>
            
            <p className="text-sm leading-relaxed">
              Welcome to <strong>ROAR OF SOUTH</strong>, operated by ROAR OF SOUTH (Building No./Flat No.: 1-65, Rego Garden, Old Airport Road, Opp Rotary Park, Malavoor Bajpe, Mangaluru, Karnataka – 574142). Please read these Terms and Conditions carefully before using our website and services. By accessing or using our website and purchasing our products, you agree to be bound by these Terms and Conditions.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p className="text-sm">By accessing our website or purchasing products from ROAR OF SOUTH, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with these terms, please do not use our website or services.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">2. Product Information</h3>
                <p className="text-sm mb-2">ROAR OF SOUTH specializes in handcrafted tiger-head décor inspired by Mangalore's iconic Pilivesha (Tiger Dance). Each piece embodies strength, tradition, and elegance, and is a symbol of:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Strength & Power:</strong> Represents shakti (energy) and authority, believed to instill courage and self-confidence.</li>
                  <li><strong>Protection:</strong> Tigers are protectors; placing the décor in the right direction can safeguard the house or office from negative energies.</li>
                  <li><strong>Victory & Leadership:</strong> Symbolizes dominance, leadership, career success, and overcoming obstacles.</li>
                  <li><strong>Divine Energy:</strong> As the vahana of Goddess Durga, it reflects divine strength, fearlessness, and the destruction of evil forces.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">3. Ordering and Payment</h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">3.1. Orders:</h4>
                    <p className="text-sm">When you place an order, you agree to provide accurate and complete information. We reserve the right to refuse or cancel orders at our discretion.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">3.2. Payment:</h4>
                    <p className="text-sm">Payments can be made through the methods provided on our website. All payments are processed securely. You agree to pay all applicable fees, taxes, and shipping costs associated with your order.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">4. Placement as per Vastu</h3>
                <p className="text-sm mb-2">To maximize the benefits of the tiger décor:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>North or East direction</strong> → Brings positive energy, courage, and progress.</li>
                  <li><strong>Office cabin / behind chair</strong> → Symbolizes authority and protection.</li>
                  <li><strong>Living room wall</strong> → Attracts admiration and gives a royal look.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">5. Intellectual Property</h3>
                <p className="text-sm">All content on the ROAR OF SOUTH website, including logos, product images, and designs, is the property of ROAR OF SOUTH and protected by intellectual property laws. You may not use or reproduce any content without our express permission.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">6. Privacy Policy</h3>
                <p className="text-sm">Please review our Privacy Policy to understand how we collect, use, and protect your personal information.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">7. Changes to Terms and Conditions</h3>
                <p className="text-sm">ROAR OF SOUTH reserves the right to update, modify, or change these Terms and Conditions at any time. Any changes will be effective upon posting on our website.</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">8. Contact Information</h3>
                <p className="text-sm mb-2">If you have any questions or concerns regarding these Terms and Conditions, please contact us:</p>
                <ul className="list-none space-y-1 text-sm">
                  <li><strong>Email:</strong> <a href="mailto:roarofsouth2025@gmail.com" className="text-blue-600 hover:underline">roarofsouth2025@gmail.com</a></li>
                  <li><strong>Phone:</strong> <a href="tel:+918073687598" className="text-blue-600 hover:underline">+91 8073687598</a></li>
                  <li><strong>Website:</strong> <a href="https://roarofsouth.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://roarofsouth.vercel.app/</a></li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  By using our website and services, you acknowledge that you have read, understood, and agreed to these Terms and Conditions. Thank you for choosing ROAR OF SOUTH.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
