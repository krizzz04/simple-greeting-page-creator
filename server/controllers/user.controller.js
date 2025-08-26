import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmailFun from '../config/sendEmail.js';
import VerificationEmail from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ReviewModel from '../models/reviews.model.js.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});


export async function registerUserController(request, response) {
    try {
        let user;

        const { name, email, password } = request.body;
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email, name, password",
                error: true,
                success: false
            })
        }

        user = await UserModel.findOne({ email: email });

        if (user) {
            return response.json({
                message: "User already Registered with this email",
                error: true,
                success: false
            })
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();


        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            email: email,
            password: hashPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + 600000,

        });

        await user.save();

        // Send verification email
        await sendEmailFun({
            sendTo: email,
            subject: "Verify email from Ecommerce App",
            text: "",
            html: VerificationEmail(name, verifyCode)
        })


        // Create a JWT token for verification purposes
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );


        return response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! ",
            token: token, // Optional: include this if needed for verification
        });



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { email, otp } = request.body;

        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return response.status(400).json({ error: true, success: false, message: "User not found" });
        }

        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires > Date.now();

        if (isCodeValid && isNotExpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return response.status(200).json({ error: false, success: true, message: "Email verified successfully" });
        } else if (!isCodeValid) {
            return response.status(400).json({ error: true, success: false, message: "Invalid OTP" });
        } else {
            return response.status(400).json({ error: true, success: false, message: "OTP expired" });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function authWithGoogle(request, response) {
    const { name, email, password, avatar, mobile, role } = request.body;

    try {
        const existingUser = await UserModel.findOne({ email: email });

        if (!existingUser) {
            const user = await UserModel.create({
                name: name,
                mobile: mobile,
                email: email,
                password: "null",
                avatar: avatar,
                role: role,
                verify_email: true,
                signUpWithGoogle: true
            });

            await user.save();

            const accesstoken = await generatedAccessToken(user._id);
            const refreshToken = await genertedRefreshToken(user._id);

            await UserModel.findByIdAndUpdate(user?._id, {
                last_login_date: new Date()
            })


            const cookiesOption = {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            }
            response.cookie('accessToken', accesstoken, cookiesOption)
            response.cookie('refreshToken', refreshToken, cookiesOption)


            return response.json({
                message: "Login successfully",
                error: false,
                success: true,
                data: {
                    accesstoken,
                    refreshToken
                }
            })

        } else {
            const accesstoken = await generatedAccessToken(existingUser._id);
            const refreshToken = await genertedRefreshToken(existingUser._id);

            await UserModel.findByIdAndUpdate(existingUser?._id, {
                last_login_date: new Date()
            })


            const cookiesOption = {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            }
            response.cookie('accessToken', accesstoken, cookiesOption)
            response.cookie('refreshToken', refreshToken, cookiesOption)


            return response.json({
                message: "Login successfully",
                error: false,
                success: true,
                data: {
                    accesstoken,
                    refreshToken
                }
            })
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}


export async function loginUserController(request, response) {
    try {
        const { email, password } = request.body;

        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return response.status(400).json({
                message: "User not register",
                error: true,
                success: false
            })
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact to admin",
                error: true,
                success: false
            })
        }

        if (user.verify_email !== true) {
            return response.status(400).json({
                message: "Your Email is not verify yet please verify your email first",
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password);

        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }


        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

        const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
            last_login_date: new Date()
        })


        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.cookie('accessToken', accesstoken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)


        return response.json({
            message: "Login successfully",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}



//logout controller
export async function logoutController(request, response) {
    try {
        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.clearCookie("accessToken", cookiesOption)
        response.clearCookie("refreshToken", cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "Logout successfully",
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


//image upload
var imagesArr = [];
export async function userAvatarController(request, response) {
    try {
        imagesArr = [];

        const userId = request.userId;  //auth middleware
        const image = request.files;


        const user = await UserModel.findOne({ _id: userId });

        if (!user) {
            return response.status(500).json({
                message: "User not found",
                error: true,
                success: false
            })
        }




        //first remove image from cloudinary
        const imgUrl = user.avatar;

        const urlArr = imgUrl.split("/");
        const avatar_image = urlArr[urlArr.length - 1];

        const imageName = avatar_image.split(".")[0];

        if (imageName) {
            const res = await cloudinary.uploader.destroy(
                imageName,
                (error, result) => {
                    // console.log(error, res)
                }
            );
        }

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

        user.avatar = imagesArr[0];
        await user.save();

        return response.status(200).json({
            _id: userId,
            avtar: imagesArr[0]
        });

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

//update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body;

        console.log('🔧 Update User Details - Request Data:', {
            userId,
            name,
            email,
            mobile
        });

        const userExist = await UserModel.findById(userId);
        if (!userExist) {
            console.log('❌ User not found:', userId);
            return response.status(400).json({
                message: 'The user cannot be Updated!',
                error: true,
                success: false
            });
        }

        console.log('🔧 Current User Data:', {
            currentName: userExist.name,
            currentEmail: userExist.email,
            currentMobile: userExist.mobile
        });

        // Check if email is being changed and if it already exists
        if (email && email !== userExist.email) {
            const existingUserWithEmail = await UserModel.findOne({ email: email, _id: { $ne: userId } });
            if (existingUserWithEmail) {
                console.log('❌ Email already exists:', email);
                return response.status(400).json({
                    message: 'Email already exists with another account',
                    error: true,
                    success: false
                });
            }
        }

        // Format phone number if provided
        let formattedMobile = mobile;
        if (mobile && !mobile.startsWith('+')) {
            // If no country code, assume India (+91)
            formattedMobile = `+91${mobile.replace(/^0+/, '')}`;
        }

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (mobile !== undefined) updateData.mobile = formattedMobile;

        console.log('🔧 Updating User with:', updateData);

        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: false }
        )

        console.log('✅ User Updated Successfully:', {
            name: updateUser?.name,
            email: updateUser?.email,
            mobile: updateUser?.mobile
        });

        return response.json({
            message: "User Updated successfully",
            error: false,
            success: true,
            user: {
                name: updateUser?.name,
                _id: updateUser?._id,
                email: updateUser?.email,
                mobile: updateUser?.mobile,
                avatar: updateUser?.avatar
            }
        })

    } catch (error) {
        console.error('❌ Update User Details Error:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//forgot password
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body

        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        else {
            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            user.otp = verifyCode;
            user.otpExpires = Date.now() + 600000;

            await user.save();

            await sendEmailFun({
                sendTo: email,
                subject: "Verify OTP from Ecommerce App",
                text: "",
                html: VerificationEmail(user.name, verifyCode)
            })


            return response.json({
                message: "check your email",
                error: false,
                success: true
            })

        }



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body;

        const user = await UserModel.findOne({ email: email })

        console.log(user)

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide required field email, otp.",
                error: true,
                success: false
            })
        }

        if (otp !== user.otp) {
            return response.status(400).json({
                message: "Invailid OTP",
                error: true,
                success: false
            })
        }


        const currentTime = new Date().toISOString()

        if (user.otpExpires < currentTime) {
            return response.status(400).json({
                message: "Otp is expired",
                error: true,
                success: false
            })
        }


        user.otp = "";
        user.otpExpires = "";

        await user.save();

        return response.status(200).json({
            message: "Verify OTP successfully",
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


//reset password
export async function resetpassword(request, response) {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }


        if (user?.signUpWithGoogle === false) {
            const checkPassword = await bcryptjs.compare(oldPassword, user.password);
            if (!checkPassword) {
                return response.status(400).json({
                    message: "your old password is wrong",
                    error: true,
                    success: false,
                })
            }
        }


        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same.",
                error: true,
                success: false,
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false;
        await user.save();

        return response.json({
            message: "Password updated successfully.",
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



//change password
export async function changePasswordController(request, response) {
    try {
        const { email, newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }


        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same.",
                error: true,
                success: false,
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false;
        await user.save();

        return response.json({
            message: "Password updated successfully.",
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


//refresh token controler
export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }


        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }

        const userId = verifyToken?._id;
        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', newAccessToken, cookiesOption)

        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId

        const user = await UserModel.findById(userId).select('-password -refresh_token').populate('address_details')

        return response.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}


//review controller
export async function addReview(request, response) {
    try {

        const {image, userName, review, rating, userId, productId} = request.body;

        const userReview = new ReviewModel({
            image:image,
            userName:userName,
            review:review,
            rating:rating,
            userId:userId,
            productId:productId
        })


        await userReview.save();

        return response.json({
            message: "Review added successfully",
            error: false,
            success: true
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}

//get reviews
export async function getReviews(request, response) {
    try {

        const productId = request.query.productId;
       

        const reviews = await ReviewModel.find({productId:productId});
        console.log(reviews)

        if(!reviews){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            reviews:reviews
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}




//get all reviews
export async function getAllReviews(request, response) {
    try {      

        const reviews = await ReviewModel.find();

        if(!reviews){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            reviews:reviews
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}


//get all users
export async function getAllUsers(request, response) {
    try {
        const { page, limit } = request.query;

        const totalUsers = await UserModel.find();

        const users = await UserModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

        const total = await UserModel.countDocuments(users);

        if(!users){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            users:users,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalUsersCount:totalUsers?.length,
            totalUsers:totalUsers
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}



export async function deleteUser(request, response) {
    const user = await UserModel.findById(request.params.id);

    if (!user) {
        return response.status(404).json({
            message: "User Not found",
            error: true,
            success: false
        })
    }


    const deletedUser = await UserModel.findByIdAndDelete(request.params.id);

    if (!deletedUser) {
        response.status(404).json({
            message: "User not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "User Deleted!",
    });
}


//delete multiple products
export async function deleteMultiple(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }


    try {
        await UserModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Users delete successfully",
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

// Phone authentication controllers
export async function sendPhoneOTP(request, response) {
    try {
        const { phone } = request.body;

        if (!phone) {
            return response.status(400).json({
                message: "Phone number is required",
                error: true,
                success: false
            });
        }

        // Check if user exists with this phone number
        const existingUser = await UserModel.findOne({ mobile: phone });
        
        if (!existingUser) {
            return response.status(400).json({
                message: "No user found with this phone number. Please register first.",
                error: true,
                success: false
            });
        }

        // Generate OTP
        const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP to user
        existingUser.phone_otp = phoneOTP;
        existingUser.phone_otp_expires = Date.now() + 600000; // 10 minutes
        await existingUser.save();

        // In a real application, you would integrate with SMS service here
        // For now, we'll just return the OTP (in production, remove this)
        console.log(`OTP for ${phone}: ${phoneOTP}`);

        return response.status(200).json({
            message: "OTP sent successfully",
            error: false,
            success: true,
            phone: phone
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function verifyPhoneOTP(request, response) {
    try {
        const { phone, otp } = request.body;

        if (!phone || !otp) {
            return response.status(400).json({
                message: "Phone number and OTP are required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ mobile: phone });

        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        if (user.phone_otp !== otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            });
        }

        if (user.phone_otp_expires < Date.now()) {
            return response.status(400).json({
                message: "OTP expired",
                error: true,
                success: false
            });
        }

        // Clear OTP
        user.phone_otp = null;
        user.phone_otp_expires = null;
        user.verify_phone = true;
        await user.save();

        return response.status(200).json({
            message: "Phone verified successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function authWithPhone(request, response) {
    try {
        const { phone, name, firebaseUid } = request.body;

        if (!phone) {
            return response.status(400).json({
                message: "Phone number is required",
                error: true,
                success: false
            });
        }

        // Validate and format phone number
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
            // If no country code, assume India (+91)
            formattedPhone = `+91${phone.replace(/^0+/, '')}`;
        }

        console.log('Processing phone:', { original: phone, formatted: formattedPhone });

        let user = await UserModel.findOne({ mobile: formattedPhone });

        if (!user) {
            // Create new user if doesn't exist
            user = new UserModel({
                name: name || `User_${formattedPhone.slice(-4)}`,
                mobile: formattedPhone,
                email: `${formattedPhone}@phone.user`, // Temporary email for phone users
                password: "null",
                verify_phone: true,
                verify_email: true, // Auto verify for phone users
                signUpWithPhone: true
            });
            await user.save();
            console.log('Created new user with phone:', formattedPhone);
        } else {
            // Update existing user
            user.verify_phone = true;
            user.last_login_date = new Date();
            await user.save();
            console.log('Updated existing user with phone:', formattedPhone);
        }

        // Generate tokens
        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

        console.log('Generated tokens:', { accesstoken: accesstoken ? 'present' : 'missing', refreshToken: refreshToken ? 'present' : 'missing' });

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };
        response.cookie('accessToken', accesstoken, cookiesOption);
        response.cookie('refreshToken', refreshToken, cookiesOption);

        const responseData = {
            message: "Login successfully",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    mobile: user.mobile,
                    email: user.email
                }
            }
        };

        console.log('Sending response:', { ...responseData, data: { ...responseData.data, accesstoken: responseData.data.accesstoken ? 'present' : 'missing' } });

        return response.json(responseData);

    } catch (error) {
        console.error('Error in authWithPhone:', error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}