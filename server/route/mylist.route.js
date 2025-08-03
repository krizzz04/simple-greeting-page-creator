import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addToMyListController, deleteToMyListController, getMyListController } from "../controllers/mylist.controller.js";

const myListRouter = Router();

myListRouter.post('/add',auth,addToMyListController)
myListRouter.get('/',auth,getMyListController)
myListRouter.delete('/:id',auth,deleteToMyListController)

export default myListRouter;