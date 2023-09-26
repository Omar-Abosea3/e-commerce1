import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addProductSchema = {
    body:joi.object({
        title:joi.string().min(5).max(200).required(),
        desc:joi.string().min(20).max(1000),
        appliedDiscount:joi.number().positive().min(1).max(100), 
        price:joi.number().positive().min(1).required(), 
        colors:joi.array().items(joi.string().required()), 
        sizes:joi.array().items(joi.string().required()),  
        stok:joi.number().integer().positive().min(1).required(),
    }).required(),

    query:joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id,
        brandId:generalFields._id
    }).required().options({presence:'required'})
}

export const updateProductSchema = {
    body:joi.object({
        title:joi.string().min(5).max(200),
        desc:joi.string().min(20).max(1000),
        appliedDiscount:joi.number().positive().min(1).max(100), 
        price:joi.number().positive().min(1), 
        colors:joi.array().items(joi.string().required()), 
        sizes:joi.array().items(joi.string().required()),  
        stok:joi.number().integer().positive().min(1),
    }).required().options({presence:'optional'}),

    query:joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id,
        brandId:generalFields._id,
        productId:generalFields._id.required(),
    }).required()
}

export const deleteProductSchema = {
    params:joi.object({
        id:generalFields._id,
    }).required().options({presence:'required'})
}

export const getOneProductSchema = {
    params:joi.object({
        id:generalFields._id,
    }).required().options({presence:'required'})
}

export const searchProductSchema = {
    query:joi.object({
        searchKey:generalFields.searchKey,
    }).required().options({presence:'required'})
}

export const getAllProductsSchema = {
    query:joi.object({
        page:joi.number().positive().min(1),
        size:joi.number().positive().min(1).max(40)
    }).required()
}