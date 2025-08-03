import { Router } from "express";
import { addToCartItemController, deleteCartItemQtyController, emptyCartController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";
import auth from "../middlewares/auth.js";

const cartRouter = Router();

cartRouter.post('/add',auth,addToCartItemController)
cartRouter.get("/get",auth,getCartItemController)
cartRouter.put('/update-qty',auth,updateCartItemQtyController)
cartRouter.delete('/delete-cart-item/:id',auth,deleteCartItemQtyController)
cartRouter.delete('/emptyCart/:id',auth,emptyCartController)
export default cartRouter