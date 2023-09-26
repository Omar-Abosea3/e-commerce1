import { Router } from "express";
import * as coupon from './coupon.controller.js'
import { createCouponSchema, deleteCouponSchema, updateCouponSchema } from "./coupon.validationSchema.js";
import  {validationCoreFunction}  from '../../middleware/validation.js';
import authentication from "../../middleware/authentication.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { roleSecurity } from "../../utils/systemRoles.js";
const router = Router();

router.post('/' , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(createCouponSchema) ,coupon.createCoupon );
router.put('/:id' , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(updateCouponSchema) ,coupon.updateCoupon );
router.delete('/:id' , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(deleteCouponSchema) , coupon.deleteCoupon);
router.get('/' , authentication(roleSecurity.available) , logOutMiddleware , coupon.getAllAssignedCoupons);
router.get('/allcoupons' , authentication(roleSecurity.private) , logOutMiddleware , coupon.getAllCoupons)


export default router;