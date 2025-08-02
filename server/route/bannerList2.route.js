import { Router } from 'express'
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { addBanner, deleteBanner, getBanner, getBanners, updatedBanner, uploadImages } from '../controllers/bannerList2.controller.js';
import { removeImageFromCloudinary } from '../controllers/category.controller.js';

const bannerList2Router = Router();

bannerList2Router.post('/uploadImages',auth,upload.array('images'),uploadImages);
bannerList2Router.post('/add',auth,addBanner);
bannerList2Router.get('/',getBanners);
bannerList2Router.get('/:id',getBanner);
bannerList2Router.delete('/deteleImage',auth,removeImageFromCloudinary);
bannerList2Router.delete('/:id',auth,deleteBanner);
bannerList2Router.put('/:id',auth,updatedBanner);

export default bannerList2Router;