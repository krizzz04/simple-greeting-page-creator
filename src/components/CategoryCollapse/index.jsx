import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { FiMinusSquare } from "react-icons/fi";
import { FaRegSquarePlus } from "react-icons/fa6";
import { MdKeyboardArrowRight } from "react-icons/md";

export const CategoryCollapse = (props) => {
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const [innerSubmenuIndex, setInnerSubmenuIndex] = useState(null);

  const openSubmenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };

  const openInnerSubmenu = (index) => {
    if (innerSubmenuIndex === index) {
      setInnerSubmenuIndex(null);
    } else {
      setInnerSubmenuIndex(index);
    }
  };

  return (
    <>
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        <ul className="w-full space-y-1">
          {
            props?.data?.length !== 0 && props?.data?.map((cat, index) => {
              return (
                <li className="list-none" key={index}>
                  
                  {/* Main Category */}
                  <div className="flex items-center justify-between group">
                    <Link 
                      to={`/products?catId=${cat?._id}`} 
                      className="flex-1 p-3 hover:bg-gray-50 transition-all duration-200 rounded-lg group-hover:shadow-sm"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                        {cat?.name}
                      </span>
                    </Link>
                    
                    {cat?.children?.length > 0 && (
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 mr-2"
                        onClick={() => openSubmenu(index)}
                      >
                        {submenuIndex === index ? (
                          <FiMinusSquare className="text-gray-500 text-sm" />
                        ) : (
                          <FaRegSquarePlus className="text-gray-500 text-sm" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Sub Categories */}
                  {submenuIndex === index && cat?.children?.length > 0 && (
                    <div className="ml-4 border-l-2 border-gray-100 pl-4 space-y-1">
                      {
                        cat?.children?.map((subCat, index_) => {
                          return (
                            <div key={index_} className="flex items-center justify-between group">
                              <Link 
                                to={`/products?subCatId=${subCat?._id}`} 
                                className="flex-1 p-2 hover:bg-gray-50 transition-all duration-200 rounded-lg group-hover:shadow-sm"
                              >
                                <span className="text-sm text-gray-600 group-hover:text-primary transition-colors flex items-center gap-2">
                                  <MdKeyboardArrowRight className="text-xs" />
                                  {subCat?.name}
                                </span>
                              </Link>
                              
                              {subCat?.children?.length > 0 && (
                                <button
                                  className="p-1 hover:bg-gray-100 rounded transition-all duration-200 mr-2"
                                  onClick={() => openInnerSubmenu(index_)}
                                >
                                  {innerSubmenuIndex === index_ ? (
                                    <FiMinusSquare className="text-gray-400 text-xs" />
                                  ) : (
                                    <FaRegSquarePlus className="text-gray-400 text-xs" />
                                  )}
                                </button>
                              )}
                            </div>
                          )
                        })
                      }
                    </div>
                  )}

                  {/* Third Level Categories */}
                  {submenuIndex === index && cat?.children?.length > 0 && (
                    <div className="ml-8 border-l border-gray-100 pl-4 space-y-1">
                      {
                        cat?.children?.map((subCat, index_) => {
                          return (
                            <div key={index_}>
                              {innerSubmenuIndex === index_ && subCat?.children?.length > 0 && (
                                <div className="space-y-1">
                                  {
                                    subCat?.children?.map((thirdLavelCat, index__) => {
                                      return (
                                        <Link
                                          key={index__}
                                          to={`/products?thirdLavelCatId=${thirdLavelCat?._id}`}
                                          className="block p-2 hover:bg-gray-50 transition-all duration-200 rounded-lg group"
                                        >
                                          <span className="text-xs text-gray-500 group-hover:text-primary transition-colors flex items-center gap-2">
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                            {thirdLavelCat?.name}
                                          </span>
                                        </Link>
                                      )
                                    })
                                  }
                                </div>
                              )}
                            </div>
                          )
                        })
                      }
                    </div>
                  )}
                </li>
              )
            })
          }
        </ul>
      </div>
    </>
  );
};
