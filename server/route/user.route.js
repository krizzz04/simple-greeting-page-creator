import { Router } from 'express'
import {addReview, authWithGoogle, authWithPhone, changePasswordController, deleteMultiple, deleteUser, forgotPasswordController, getAllReviews, getAllUsers, getReviews, loginUserController, logoutController, refreshToken, registerUserController, removeImageFromCloudinary, resetpassword, sendPhoneOTP, updateUserDetails, userAvatarController, userDetails, verifyEmailController, verifyForgotPasswordOtp, verifyPhoneOTP} from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const userRouter = Router()
userRouter.post('/register',registerUserController)
userRouter.post('/verifyEmail',verifyEmailController)
userRouter.post('/login',loginUserController)
userRouter.post('/authWithGoogle',authWithGoogle)
userRouter.post('/sendPhoneOTP',sendPhoneOTP)
userRouter.post('/verifyPhoneOTP',verifyPhoneOTP)
userRouter.post('/authWithPhone',authWithPhone)
userRouter.get('/logout',auth,logoutController);
userRouter.put('/user-avatar',auth,upload.array('avatar'),userAvatarController);
userRouter.delete('/deteleImage',auth,removeImageFromCloudinary);
userRouter.put('/:id',auth,updateUserDetails);
userRouter.post('/forgot-password',forgotPasswordController)
userRouter.post('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.post('/reset-password',resetpassword)
userRouter.post('/forgot-password/change-password',changePasswordController)
userRouter.post('/refresh-token',refreshToken)
userRouter.get('/user-details',auth,userDetails);
userRouter.post('/addReview',auth,addReview);
userRouter.get('/getReviews',getReviews);
userRouter.get('/getAllReviews',getAllReviews);
userRouter.get('/getAllUsers',getAllUsers);
userRouter.delete('/deleteMultiple',deleteMultiple);
userRouter.delete('/deleteUser/:id',deleteUser);


export default userRouter