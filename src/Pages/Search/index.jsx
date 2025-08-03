import React, { useContext, useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import Button from "@mui/material/Button";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu } from "react-icons/lu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import ProductLoadingGrid from "../../components/ProductLoading/productLoadingGrid";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";

const SearchPage = () => {
  const [itemView, setItemView] = useState("grid");
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [productsData, setProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedSortVal, setSelectedSortVal] = useState("Name, A to Z");

  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])


  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };



  const handleSortBy = (name, order, products, value) => {
    setSelectedSortVal(value);
    postData(`/api/product/sortBy`, {
      products: products,
      sortBy: name,
      order: order
    }).then((res) => {
      setProductsData(res);
      setAnchorEl(null);
    })
  }

  return (
    <section className=" pb-0">

      <div className="bg-white p-2">
        <div className="container flex gap-3">
          <div className={`sidebarWrapper fixed -bottom-[100%] left-0 w-fulllg:h-full lg:static lg:w-[20%] bg-white z-[102] lg:z-[100] p-3 lg:p-0  transition-all lg:opacity-100 opacity-0 ${context?.openFilter === true ? 'open' : ''}`}>
            <Sidebar
              productsData={productsData}
              setProductsData={setProductsData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              page={page}
              setTotalPages={setTotalPages}
            />
          </div>

          {
            context?.windowWidth < 992 &&
            <div className={`filter_overlay w-full h-full bg-[rgba(0,0,0,0.5)] fixed top-0 left-0 z-[101]  ${context?.openFilter === true ? 'block' : 'hidden'}`}
              onClick={()=>context?.setOpenFilter(false)}
            ></div>
          }


          <div className="rightContent w-full lg:w-[80%] py-3">
            <div className="bg-[#f1f1f1] p-2 w-full mb-4 rounded-md flex items-center justify-between sticky top-[135px] z-[99]">
              <div className="col1 flex items-center itemViewActions">
                <Button
                  className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full 
                    !text-[#000] ${itemView === "list" && "active !bg-[#dfdfdf]"}`}
                  onClick={() => setItemView("list")}
                >
                  <LuMenu className="text-[rgba(0,0,0,0.7)] text-[16px]" />
                </Button>
                <Button
                  className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full 
                    !text-[#000] ${itemView === "grid" && "active !bg-[#dfdfdf]"}`}
                  onClick={() => setItemView("grid")}
                >
                  <IoGridSharp className="text-[rgba(0,0,0,0.7)] text-[14px]" />
                </Button>

                <span className="text-[14px] hidden sm:block md:block lg:block font-[500] pl-3 text-[rgba(0,0,0,0.7)]">
                  There are {productsData?.products?.length !== 0 ? productsData?.products?.length : 0}  products.
                </span>
              </div>

              <div className="col2 ml-auto flex items-center justify-end gap-3 pr-4">
                <span className="text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]">
                  Sort By
                </span>

                <Button
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  className="!bg-white !text-[12px] !text-[#000] !capitalize !border-2 
                  !border-[#000]"
                >
                  {selectedSortVal}
                </Button>

                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <MenuItem
                    onClick={() => handleSortBy('name', 'asc', productsData, 'Name, A to Z')}
                    className="!text-[13px] !text-[#000] !capitalize"
                  >
                    Name, A to Z
                  </MenuItem>


                  <MenuItem
                    onClick={() => handleSortBy('name', 'desc', productsData, 'Name, Z to A')}
                    className="!text-[13px] !text-[#000] !capitalize"
                  >
                    Name, Z to A
                  </MenuItem>


                  <MenuItem
                    onClick={() => handleSortBy('price', 'asc', productsData, 'Price, low to high')}
                    className="!text-[13px] !text-[#000] !capitalize"
                  >
                    Price, low to high
                  </MenuItem>


                  <MenuItem
                    onClick={() => handleSortBy('price', 'desc', productsData, ' Price, high to low')}
                    className="!text-[13px] !text-[#000] !capitalize"
                  >
                    Price, high to low
                  </MenuItem>

                </Menu>
              </div>
            </div>

            <div
              className={`grid ${itemView === "grid"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1"
                } gap-4`}
            >
              {itemView === "grid" ? (
                <>

                  {
                    isLoading === true ? <ProductLoadingGrid view={itemView} />
                      :

                      productsData?.products?.length !== 0 && productsData?.products?.map((item, index) => {
                        return (
                          <ProductItem key={index} item={item} />
                        )
                      })

                  }


                </>
              ) : (
                <>
                  {
                    isLoading === true ? <ProductLoadingGrid view={itemView} />
                      :

                      productsData?.products?.length !== 0 && productsData?.products?.map((item, index) => {
                        return (
                          <ProductItemListView key={index} item={item} />
                        )
                      })

                  }

                </>
              )}
            </div>

            {
              totalPages > 1 &&
              <div className="flex items-center justify-center mt-10">
                <Pagination
                  showFirstButton showLastButton
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                />
              </div>
            }


          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchPage;
