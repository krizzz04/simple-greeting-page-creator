import { Router } from 'express'
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { addBanner, deleteBanner, getBanner, getBanners, updatedBanner, uploadImages } from '../controllers/bannerV1.controller.js';
import { removeImageFromCloudinary } from '../controllers/category.controller.js';

const bannerV1Router = Router();

bannerV1Router.post('/uploadImages',auth,upload.array('images'),uploadImages);
bannerV1Router.post('/add',auth,addBanner);
bannerV1Router.get('/',getBanners);
bannerV1Router.get('/:id',getBanner);
bannerV1Router.delete('/deteleImage',auth,removeImageFromCloudinary);
bannerV1Router.delete('/:id',auth,deleteBanner);
bannerV1Router.put('/:id',auth,updatedBanner);

export default bannerV1Router;