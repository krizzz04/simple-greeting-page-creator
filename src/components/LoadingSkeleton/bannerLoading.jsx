import React from 'react'

const BannerLoading = () => {
    return (
        <div className="homeSlider pb-2 pt-3 lg:pb-5 lg:pt-5 top-0 left-0 z-50 w-full">
            <div className="container">
                <div className="flex items-center gap-2 animate-pulse relative w-full">
                    <img src="/homeBannerPlaceholder.jpg" className='opacity-0' />
                    <div className="flex items-center mb-3 justify-center w-full h-full bg-gray-300 rounded-lg  dark:bg-gray-700 absolute top-0 left-0 z-50">
                        <svg className="w-10 h-10 lg:w-20 lg:h-20 text-gray-400 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default BannerLoading;