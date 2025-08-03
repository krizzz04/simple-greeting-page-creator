import React, { useContext, useEffect, useState } from "react";

import MyListItems from "./myListItems";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

const MyList = () => {

  const context = useContext(MyContext);

  useEffect(()=>{
    window.scrollTo(0,0);
  },[]);

  return (
    <section className="py-4 lg:py-6 pb-20 w-full">
      <div className="container flex flex-col md:flex-row gap-5">
        <div className="col1 w-full md:w-[20%] hidden lg:block">
          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:w-[70%]">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-5 px-3 border-b border-[rgba(0,0,0,0.1)]">
              <h2>My List</h2>
              <p className="mt-0 mb-0">
                There are <span className="font-bold text-primary">{context?.myListData?.length}</span>{" "}
                products in your My List
              </p>
            </div>


            {
              context?.myListData?.length !== 0 ? context?.myListData?.map((item, index) => {
                return (
                  <MyListItems item={item} />
                )
              })

                :

                <div className="flex items-center justify-center flex-col py-10 px-3 gap-5">
                  <img src="/mylistempty.png" className="w-[100px]" />
                  <h3>My List is currently empty</h3>
                  <Link to="/"><Button className="btn-org btn-sm">Continue Shopping</Button></Link>
                </div>

            }


          </div>
        </div>
      </div>
    </section>
  );
};

export default MyList;
