import React, { useContext } from 'react';
import { MyContext } from '../App'; // Adjust the path to your App.js if needed
import ProductLoading from './ProductLoading'; // Adjust path if needed


const MobileVerticalProductsSlider = ({ data, items = 8 }) => {
  const context = useContext(MyContext);

  if (!data || data.length === 0) {
    return <ProductLoading />;
  }

  return (
    <>
      <style jsx>{`
        @media (max-width: 767px) {
          .mobile-product-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            padding: 20px 0;
          }
          
          .mobile-product-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #f3f4f6;
            padding: 12px;
            transition: all 0.3s ease;
            transform: translateY(0);
            
            /* --- CSS FIX APPLIED HERE --- */
            position: relative; 
            z-index: 10;        
          }
          
          .mobile-product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          
          .mobile-product-image {
            aspect-ratio: 1;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 10px;
            overflow: hidden;
          }
          
          .mobile-product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          
          .mobile-product-card:hover .mobile-product-image img {
            transform: scale(1.05);
          }
          
          .mobile-product-title {
            font-size: 12px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 6px;
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .mobile-product-price {
            font-size: 14px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 8px;
          }
          
          .mobile-product-actions {
            display: flex;
            gap: 6px;
          }
          
          .mobile-btn {
            flex: 1;
            padding: 6px 8px;
            border: none;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
          }
          
          .mobile-btn-cart {
            background: linear-gradient(45deg, #3b82f6, #2563eb);
            color: white;
          }
          
          .mobile-btn-buy {
            background: linear-gradient(45deg, #10b981, #059669);
            color: white;
          }
          
          .mobile-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
        
        @media (min-width: 768px) {
          .mobile-product-grid {
            display: none;
          }
        }
      `}</style>

      <div className="mobile-product-grid">
        {data.slice(0, items).map((item, index) => (
          <div key={index} className="mobile-product-card">
            <div className="mobile-product-image">
              <img 
                src={item?.images?.[0] || item?.image || '/placeholder.jpg'} 
                alt={item?.name || item?.productTitle || 'Product'}
                loading="lazy"
                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
              />
            </div>
            
            <h3 className="mobile-product-title">
              {item?.name || item?.productTitle || 'Product'}
            </h3>
            
            <div className="mobile-product-price">
              ₹{item?.price || 0}
            </div>

            <div className="mobile-product-actions">
              <button 
                className="mobile-btn mobile-btn-cart"
                onClick={() => {
                  if (context?.userData) {
                    const cartData = {
                      productId: item._id,
                      userId: context.userData._id,
                      quantity: 1,
                      productTitle: item.name || item.productTitle,
                      image: item.images?.[0] || item.image,
                      price: item.price,
                      oldPrice: item.oldPrice,
                      discount: item.discount,
                      rating: item.rating,
                      stock: item.stock,
                      subTotal: item.price * 1
                    };
                    context.addToCart(cartData);
                    context.alertBox("success", "Product added to cart successfully!");
                  } else {
                    context.alertBox("error", "Please login to add products to cart");
                  }
                }}
              >
                Add
              </button>
              
              <button 
                className="mobile-btn mobile-btn-buy"
                onClick={() => {
                  if (context?.userData) {
                    const cartData = {
                      productId: item._id,
                      userId: context.userData._id,
                      quantity: 1,
                      productTitle: item.name || item.productTitle,
                      image: item.images?.[0] || item.image,
                      price: item.price,
                      stock: item.stock,
                      subTotal: item.price * 1
                    };
                    context.addToCart(cartData);
                    context.alertBox("success", "Product added to cart!");
                    setTimeout(() => {
                      window.location.href = "/checkout";
                    }, 500);
                  } else {
                    context.alertBox("error", "Please login to proceed with purchase");
                  }
                }}
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MobileVerticalProductsSlider;