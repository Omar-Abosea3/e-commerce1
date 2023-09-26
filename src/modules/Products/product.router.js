import { Router } from "express";
import multerFunction from "../../services/multerCloudinary.js";
import allowedEstensions from "../../utils/allowedExtensions.js";
import * as product from './product.controller.js'
import authentication from "../../middleware/authentication.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { addProductSchema, deleteProductSchema, getOneProductSchema, searchProductSchema, updateProductSchema } from "./product.validationSchema.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { roleSecurity } from "../../utils/systemRoles.js";
const router = Router();

router.post('/'  , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).array('image' , 3) , validationCoreFunction(addProductSchema) , product.addProduct);
router.put('/' , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).array('image' , 3) , validationCoreFunction(updateProductSchema)  , product.updateProduct);
router.delete('/:id', authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(deleteProductSchema) , product.deleteProduct);
router.get('/' , product.getAllProducts);
router.get('/product/:id', authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(getOneProductSchema) , product.getOneProduct);
router.get('/search' , validationCoreFunction(searchProductSchema) , product.searchProduct);
router.get('/filter' , product.filterProducts);



export default router ;