import { Router } from "express";
import * as cart from './cart.controller.js'
import authentication from "../../middleware/authentication.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { addToCartSchema, dicreamentCounterSchema, increamentCounterSchema, removeFromCartSchema } from "./cart.validationSchema.js";
import { roleSecurity } from "../../utils/systemRoles.js";
const router = Router();

router.post('/' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(addToCartSchema) , cart.addToCart);
router.delete('/', authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(removeFromCartSchema) , cart.removeFromCart);
router.put('/increamentquantity' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(increamentCounterSchema) , cart.increamentCounter);
router.put('/dicreamentquantity' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(dicreamentCounterSchema) , cart.dicreamentCounter);
router.delete('/deletecart' , authentication(roleSecurity.available) , logOutMiddleware , cart.deleteCart);
router.get('/' , authentication(roleSecurity.available) , logOutMiddleware , cart.getUserCart);

export default router;