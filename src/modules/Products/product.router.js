import { Router } from "express";
import multerFunction, { multerFunction2 } from "../../services/multerCloudinary.js";
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
router.get('/product/:id' , validationCoreFunction(getOneProductSchema) , product.getOneProduct);
router.get('/search' , validationCoreFunction(searchProductSchema) , product.searchProduct);
router.post('/search' , multerFunction2(allowedEstensions.Images).single('image') , product.searchProductWithTextFromImage);
router.post('/search-image' , multerFunction2(allowedEstensions.Images).single('image') , product.searchProductsWithImage);
router.get('/filter' , product.filterProducts);



export default router ;