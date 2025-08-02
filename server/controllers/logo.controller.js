import LogoModel from '../models/logo.model.js';

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



//add logo
export async function addLogo(request, response) {
    try {
        let logoItem = new LogoModel({
            logo: imagesArr[0],
        });

        if (!logoItem) {
            return response.status(500).json({
                message: "Logo not added",
                error: true,
                success: false
            })
        }

        logoItem = await logoItem.save();

        imagesArr = [];

        return response.status(200).json({
            message: "logo added",
            error: false,
            success: true,
            logo: logoItem
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}





//get logo
export async function getLogo(request, response) {
    try {
        const logo = await LogoModel.find();

        if (!logo) {
            response.status(500).json({
                error: true,
                success: false
            })
        }


        return response.status(200).json({
            error: false,
            success: true,
            logo: logo
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getLogoById(request, response) {
    try {
        const logo = await LogoModel.findById(request.params.id);


        if (!logo) {
            response.status(500)
                .json(
                    {
                        message: "The logo with the given ID was not found.",
                        error: true,
                        success: false
                    }
                );
        }


        return response.status(200).json({
            error: false,
            success: true,
            logo: logo
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function updatedLogo(request, response) {
    const logo = await LogoModel.findByIdAndUpdate(
        request.params.id,
        {
            logo: imagesArr.length > 0 ? imagesArr[0] : request.body.logo,
        },
        { new: true }
    );

    if (!logo) {
        return response.status(500).json({
            message: "logo cannot be updated!",
            success: false,
            error: true
        });
    }


    imagesArr = [];

    response.status(200).json({
        error: false,
        success: true,
        logo: logo,
        message: "logo updated successfully"
    })

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
