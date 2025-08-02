import { Router } from 'express'
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { addLogo, getLogo, getLogoById, removeImageFromCloudinary, updatedLogo, uploadImages } from '../controllers/logo.controller.js';

const logoRouter = Router();

logoRouter.post('/uploadImages',auth,upload.array('images'),uploadImages);
logoRouter.post('/add',auth,addLogo);
logoRouter.get('/',getLogo);
logoRouter.get('/:id',getLogoById);
logoRouter.delete('/deteleImage',auth,removeImageFromCloudinary);
logoRouter.put('/:id',auth,updatedLogo);

export default logoRouter;