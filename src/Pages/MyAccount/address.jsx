import React from 'react'
import AccountSidebar from '../../components/AccountSidebar';
import { useContext } from 'react';
import { MyContext } from '../../App';

import { useState } from 'react';

import { useEffect } from 'react';
import { deleteData, fetchDataFromApi } from '../../utils/api';
import AddressBox from './addressBox';


const label = { inputProps: { 'aria-label': 'Radio demo' } };

const Address = () => {

    const [address, setAddress] = useState([]);

    const context = useContext(MyContext);

    useEffect(() => {
        if (context?.userData?._id !== "" && context?.userData?._id !== undefined) {

            setAddress(context?.userData?.address_details);

        }

    }, [context?.userData])


    const removeAddress = (id) => {
        deleteData(`/api/address/${id}`).then((res) => {
            fetchDataFromApi(`/api/address/get?userId=${context?.userData?._id}`).then((res) => {
                setAddress(res.data);
                context?.getUserDetails();

            })
        })
    }



    return (
        <>
            <section className="py-5 lg:py-10 w-full">
                <div className="container flex flex-col md:flex-row gap-5">
                    <div className="col1 w-full  md:w-[30%] lg:w-[20%]">
                        <AccountSidebar />
                    </div>

                    <div className="col2 w-full md:w-[70%] lg:w-[50%]">
                        <div className="card bg-white p-5 shadow-md rounded-md mb-5">
                            <div className="flex items-center pb-3">
                                <h2 className="pb-0">Address</h2>
                            </div>
                            <hr />


                            <div className='flex items-center justify-center p-5 rounded-md border border-dashed border-[rgba(0,0,0,0.2)] bg-[#f1faff] hover:bg-[#e7f3f9] cursor-pointer'
                                onClick={() => {
                                    context?.setOpenAddressPanel(true);
                                    context?.setAddressMode("add");
                                }}
                            >
                                <span className='text-[14px] font-[500]'>Add Address</span>
                            </div>


                            <div className="flex gap-2 flex-col mt-4">

                                {
                                    address?.length > 0 && address?.map((address, index) => {
                                        return (
                                            <AddressBox address={address} key={index} removeAddress={removeAddress} />
                                        )
                                    })
                                }

                            </div>

                        </div>



                    </div>
                </div>
            </section>

        </>
    )
}


export default Address;