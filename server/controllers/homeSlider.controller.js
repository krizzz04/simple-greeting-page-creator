import HomeSliderModel from "../models/homeSlider.modal.js";

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});


//image upload
var imagesArr = [];
export async function uploadImages(request, response) {
    try {
        imagesArr = [];

        const image = request.files;


        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {

            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        return response.status(200).json({
            images: imagesArr
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function addHomeSlide(request, response) {
    try {

        let slide = new HomeSliderModel({
            images: imagesArr,
        });

        if (!slide) {
            return response.status(500).json({
                message: "slide not created",
                error: true,
                success: false
            })
        }


        slide = await slide.save();

        imagesArr = [];

        return response.status(200).json({
            message: "Slide created",
            error: false,
            success: true,
            slide: slide
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export async function getHomeSlides(request, response) {
    try {

        const slides = await HomeSliderModel.find();

        if (!slides) {
            return response.status(404).json({
                message: "slides not found",
                error: true,
                success: false
            })
        }


        return response.status(200).json({
            error: false,
            success: true,
            data:slides
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getSlide(request, response) {
    try {
        const slide = await HomeSliderModel.findById(request.params.id);


        if (!slide) {
            response.status(500)
                .json(
                    {
                        message: "The slide with the given ID was not found.",
                        error: true,
                        success: false
                    }
                );
        }


        return response.status(200).json({
            error: false,
            success: true,
            slide: slide
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function removeImageFromCloudinary(request, response) {
  
    const imgUrl = request.query.img;

      
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
    
        const imageName = image.split(".")[0];

    
        if (imageName) {
            const res = await cloudinary.uploader.destroy(
                imageName,
                (error, result) => {
                    // console.log(error, res)
                }
            );
    
            if (res) {
                response.status(200).send(res);
            }
        }
}



export async function deleteSlide(request, response) {
    const slide = await HomeSliderModel.findById(request.params.id);
    const images = slide.images;
    let img="";
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(error, result);
            });
        }

    }



    const deletedSlide = await HomeSliderModel.findByIdAndDelete(request.params.id);
    if (!deletedSlide) {
        response.status(404).json({
            message: "slide not found!",
            success: false,
            error: true
        });
    }

  return  response.status(200).json({
        success: true,
        error: false,
        message: "slide Deleted!",
    });
}



export async function updatedSlide(request, response){
 
    const slide = await HomeSliderModel.findByIdAndUpdate(
        request.params.id,
        {
          images: imagesArr.length>0 ? imagesArr[0] : request.body.images,
        },
        { new: true }
      );

      if (!slide) {
        return response.status(500).json({
          message: "slide cannot be updated!",
          success: false,
          error:true
        });
      }


      imagesArr = [];
      
      response.status(200).json({
        error:false,
        success:true,
        slide:slide,
        message:"slide updated successfully"
      })
    
}





//delete multiple 
export async function deleteMultipleSlides(request, response) {
    const { ids } = request.body;


    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }


    for(let i=0; i<ids?.length; i++){
        const slide = await HomeSliderModel.findById(ids[i]);

        const images = slide.images;

        let img = "";
        for (img of images) {
            const imgUrl = img;
            const urlArr = imgUrl.split("/");
            const image = urlArr[urlArr.length - 1];
    
            const imageName = image.split(".")[0];
    
            if (imageName) {
                cloudinary.uploader.destroy(imageName, (error, result) => {
                    // console.log(error, result);
                });
            }
    
    
        }
        
    }

    try {
        await HomeSliderModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "slide delete successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}
