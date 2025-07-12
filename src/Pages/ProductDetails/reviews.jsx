import React, { useContext, useEffect, useState } from 'react'
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
export const Reviews = (props) => {

    const [reviews, setReviews] = useState({
        image: '',
        userName: '',
        review: '',
        rating: 1,
        userId: '',
        productId: ''
    });

    const [loading, setLoading] = useState(false);

    const [reviewsData, setReviewsData] = useState([])

    const context = useContext(MyContext);

    useEffect(() => {
        setReviews(() => ({
            ...reviews,
            image: context?.userData?.avatar,
            userName: context?.userData?.name,
            userId: context?.userData?._id,
            productId: props?.productId
        }))

        getReviews();
    }, [context?.userData, props]);


    const onChangeInput = (e) => {
        setReviews(() => ({
            ...reviews,
            review: e.target.value
        }))
    }


    const addReview = (e) => {
        e.preventDefault();

        if (reviews?.review !== "") {
            setLoading(true);
            postData("/api/user/addReview", reviews).then((res) => {
                if (res?.error === false) {
                    context.alertBox("success", res?.message);
                    setReviews(() => ({
                        ...reviews,
                        review: '',
                        rating: 1
                    }))

                    setLoading(false);
                    getReviews();

                } else {
                    context.alertBox("error", res?.message);
                }
            })
        }
        else {
            context.alertBox("error", "Please add review");
        }


    }



    const getReviews = () => {
        fetchDataFromApi(`/api/user/getReviews?productId=${props?.productId}`).then((res) => {
            if (res?.error === false) {
                setReviewsData(res.reviews)
                props.setReviewsCount(res.reviews.length)
            }
        })
    }

    return (
        <div className="w-full productReviewsContainer">
            <h2 className="text-[16px] lg:text-[18px]">Customer questions & answers</h2>

            {
                reviewsData?.length !== 0 &&
                <div className="reviewScroll w-full max-h-[300px] overflow-y-scroll overflow-x-hidden mt-5 pr-5">
                    {
                        reviewsData?.map((review, index) => {
                            return (
                                <div key={index} className="review pt-5 pb-5 border-b border-[rgba(0,0,0,0.1)] w-full flex items-center justify-between">
                                    <div className="info w-[80%] flex items-center gap-3">
                                        <div className="img w-[60px] h-[60px] overflow-hidden rounded-full">

                                            {
                                                review?.image !== "" && review?.image !== null ?
                                                    <img
                                                        src={review?.image}
                                                        className="w-full"
                                                    />

                                                    :
                                                    <img
                                                        src={"/user.jpg"}
                                                        className="w-full"
                                                    />
                                            }

                                        </div>

                                        <div className="w-[80%]">
                                            <h4 className="text-[16px]">{review?.userName}</h4>
                                            <h5 className="text-[13px] mb-0">{review?.createdAt?.split("T")[0]}</h5>
                                            <p className="mt-0 mb-0 text-[13px]">
                                                {review?.review}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="">
                                        <Rating name="size-small" size="small" value={review?.rating} readOnly />
                                    </div>
                                </div>)
                        })
                    }
                </div>
            }


            <br />

            <div className="reviewForm bg-[#fafafa] p-4 rounded-md">
                <h2 className="text-[18px]">Add a review</h2>

                <form className="w-full mt-5" onSubmit={addReview}>
                    <TextField
                        id="outlined-multiline-flexible"
                        label="Write a review..."
                        className="w-full"
                        onChange={onChangeInput}
                        name="review"
                        multiline
                        rows={5}
                        value={reviews.review}
                    />

                    <br />
                    <br />
                    <Rating name="size-small" value={reviews.rating} onChange={(event, newValue) => {
                        setReviews(() => ({
                            ...reviews,
                            rating: newValue
                        }))
                    }} />

                    <div className="flex items-center mt-5">


                        <Button type="submit" className="btn-org flex gap-2">
                       
                            {
                                loading === true && <CircularProgress size={15}/> 
                            }
                            Submit Review</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

