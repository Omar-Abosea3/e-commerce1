import { Router } from "express";
import multerFunction from "../../services/multerCloudinary.js";
import allowedEstensions from "../../utils/allowedExtensions.js";
import * as subCategory from './subCategory.controller.js'
import authentication from "../../middleware/authentication.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { createSubCategorySchema, deleteSubCategorySchema, getOneSubCategorySchema, searchSubCategorySchema, updateSubCategorySchema } from "./subCategory.validationSchema.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import  { roleSecurity } from "../../utils/systemRoles.js";
const router = Router();

router.post('/' , authentication(roleSecurity.private) , logOutMiddleware  , multerFunction(allowedEstensions.Images).single('image'), validationCoreFunction(createSubCategorySchema) , subCategory.createSubCategory);
router.put('/' , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).single('image') , validationCoreFunction(updateSubCategorySchema)  , subCategory.updateSubCategory);
router.delete('/:subCategoryId' , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(deleteSubCategorySchema) , subCategory.deleteSubCategory);
router.get('/' , subCategory.getSubCategories);
router.get('/subCategory/:id' , validationCoreFunction(getOneSubCategorySchema) , subCategory.getOneSubCategory);
router.get('/search' , validationCoreFunction(searchSubCategorySchema) , subCategory.searchSubCategory);



export default router ;