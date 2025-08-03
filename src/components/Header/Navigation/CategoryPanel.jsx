import React, { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { IoCloseSharp } from "react-icons/io5";
import { CategoryCollapse } from "../../CategoryCollapse";
import { Button } from "@mui/material";
import { MyContext } from "../../../App";
import { Link } from "react-router-dom";
import { fetchDataFromApi } from "../../../utils/api";

const CategoryPanel = (props) => {

  const context = useContext(MyContext);

  const toggleDrawer = (newOpen) => () => {
    props.setIsOpenCatPanel(newOpen);
    props.propsSetIsOpenCatPanel(newOpen)
  };


  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" className="categoryPanel">

      <div className="p-3">
        <img src={localStorage.getItem('logo')} className="w-[170px]" />
      </div>

      <h3 className="p-3 text-[16px] font-[500] flex items-center justify-between">
        Shop By Categories{" "}
        <IoCloseSharp
          onClick={toggleDrawer(false)}
          className="cursor-pointer text-[20px]"
        />
      </h3>

      {
        props?.data?.length !== 0 && <CategoryCollapse data={props?.data} />
      }

      {
        context?.windowWidth < 992 && context?.isLogin === false &&
        <Link to="/login" className="p-3 block" onClick={() => {
          props.setIsOpenCatPanel(false);
          props.propsSetIsOpenCatPanel(false)
        }}>
          <Button className="btn-org w-full">Login</Button>
        </Link>
      }


      {
        context?.windowWidth < 992 && context?.isLogin === true &&
        <div className="p-3 block" onClick={() => {
          props.setIsOpenCatPanel(false);
          props.propsSetIsOpenCatPanel(false)
          fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`, { withCredentials: true }).then((res) => {
            if (res?.error === false) {
              context.setIsLogin(false);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              context.setUserData(null);
              context?.setCartData([]);
              context?.setMyListData([]);
              history("/");
            }


          })
        }}>
          <Button className="btn-org w-full">Logout</Button>
        </div>
      }


    </Box>
  );

  return (
    <>
      <Drawer open={props.isOpenCatPanel} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
};

export default CategoryPanel;
