import { Router } from "express";
import auth from "../middlewares/auth.js";
import {  captureOrderPaypalController, createOrderController, createOrderPaypalController, deleteOrder, getOrderDetailsController, getTotalOrdersCountController, getUserOrderDetailsController, totalSalesController, totalUsersController, updateOrderStatusController } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post('/create',auth,createOrderController)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/create-order-paypal',auth,createOrderPaypalController)
orderRouter.post('/capture-order-paypal',auth,captureOrderPaypalController)
orderRouter.put('/order-status/:id',auth,updateOrderStatusController)
orderRouter.get('/count',auth,getTotalOrdersCountController)
orderRouter.get('/sales',auth,totalSalesController)
orderRouter.get('/users',auth,totalUsersController)
orderRouter.get('/order-list/orders',auth,getUserOrderDetailsController)
orderRouter.delete('/deleteOrder/:id',auth,deleteOrder)

export default orderRouter;