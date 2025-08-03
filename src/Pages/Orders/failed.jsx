import React from 'react';
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

export const OrderFailed = () => {
    return (
        <section className='w-full p-10 py-8 lg:py-20 flex items-center justify-center flex-col gap-2'>
            <img src="/delete.png"  className="w-[70px] sm:w-[120px]"  />
            <h3 className='mb-0 text-[20px] sm:text-[25px]'>Your order is failed</h3>
            <p className='mt-0 text-center'>your order is faild due to some reason</p>
            <Link to="/">
                <Button className="btn-org btn-border">Back to home</Button>
            </Link>
        </section>
    )
}
