import { Router } from "express"; 
import * as wishlist from './wishlist.controller.js'
import authentication from "../../middleware/authentication.js";
import { roleSecurity } from "../../utils/systemRoles.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { addToWishlistSchema, removeBrandFromWishlistSchema, removeProductFromWishlistSchema } from "./wishlist.validationSchema.js";
const router = Router();

router.post('/' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(addToWishlistSchema) , wishlist.addtoWishlist);
router.patch('/removeproduct/:productId' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(removeProductFromWishlistSchema) , wishlist.removeProductFromWishlist);
router.patch('/removebrand/:brandId' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(removeBrandFromWishlistSchema) , wishlist.removeBrandFromWishlist);
router.patch('/removeallbrands' , authentication(roleSecurity.available) , logOutMiddleware , wishlist.removeAllWishlistBrands);
router.patch('/removeallproducts' , authentication(roleSecurity.available) , logOutMiddleware , wishlist.removeAllWishlistProducts);
router.get('/products' , authentication(roleSecurity.available) , logOutMiddleware , wishlist.getAllWishlistProducts);
router.get('/brands' , authentication(roleSecurity.available) , logOutMiddleware , wishlist.getAllWishlistBrands);



export default router;