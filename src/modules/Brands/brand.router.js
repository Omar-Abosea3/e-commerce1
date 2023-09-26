import { Router } from "express";
import multerFunction from "../../services/multerCloudinary.js";
import allowedEstensions from "../../utils/allowedExtensions.js";
import * as brand from './brand.controller.js'
import authentication from "../../middleware/authentication.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { addBrandSchema, deleteBrandSchema, getOneBrandSchema, searchBrandSchema, updateBrandSchema } from "./brand.validationSchema.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { roleSecurity } from "../../utils/systemRoles.js";
const router = Router();

router.post('/' , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).single('image') , validationCoreFunction(addBrandSchema) , brand.addBrand);
router.put('/' , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).single('image') , validationCoreFunction(updateBrandSchema) , brand.updateBrand);
router.delete('/:brandId' , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(deleteBrandSchema) , brand.deleteBrand);
router.get('/' , brand.getAllBrands);
router.get('/brand/:id' , validationCoreFunction(getOneBrandSchema) , brand.getOneBrand);
router.get('/search' , validationCoreFunction(searchBrandSchema) , brand.searchBrand);




export default router ;