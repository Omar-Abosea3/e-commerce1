import { Router } from "express";
import multerFunction from '../../services/multerCloudinary.js';
import allowedEstensions from "../../utils/allowedExtensions.js";
import * as category from './category.controller.js'
import authentication from "../../middleware/authentication.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { createCategorySchema, deleteCategorySchema, getOneCategorySchema, searchCategorySchema, updateCategorySchema } from "./category.validationSchema.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { roleSecurity } from "../../utils/systemRoles.js";
const router = Router();

router.post('/' , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).single('image') , validationCoreFunction(createCategorySchema) , category.createCategory);
router.get('/' ,  category.getAllCategories);
router.get('/category/:id' , validationCoreFunction(getOneCategorySchema) ,  category.getOneCategory);
router.delete('/:categoryId' , authentication(roleSecurity.private) , logOutMiddleware , validationCoreFunction(deleteCategorySchema) ,  category.deleteCategory);
router.put('/:categoryId' , authentication(roleSecurity.private) , logOutMiddleware , multerFunction(allowedEstensions.Images).single('image') , validationCoreFunction(updateCategorySchema) , category.updateCategory);
router.get('/search' , validationCoreFunction(searchCategorySchema) , category.searchCategory);


export default router ;