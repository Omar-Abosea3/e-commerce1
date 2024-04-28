import { Router } from "express";
import authentication from "../../middleware/authentication.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import * as order from './order.controller.js';
import { roleSecurity } from "../../utils/systemRoles.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { cancelPaymentSchema, deliverOrderSchema, orderCartSchema, orderProductSchema, successPaymentSchema } from "./order.validationSchema.js";
const router = Router();

router.post('/:productId' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(orderProductSchema) , order.createOrder);
router.post('/orderallcartproducts/:cartId' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(orderCartSchema) , order.fromCartToOrder);
router.patch('/successorder' , validationCoreFunction(successPaymentSchema) , order.successPayment);
router.patch('/cancelorder' , validationCoreFunction(cancelPaymentSchema) , order.cancelPayment);
router.patch('/deliverorder' , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(deliverOrderSchema) , order.deliverOrder);
router.get('/' , authentication(roleSecurity.available) , logOutMiddleware , order.getAllUserProducts);

export default router;