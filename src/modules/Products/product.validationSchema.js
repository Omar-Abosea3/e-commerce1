import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addProductSchema = {
    body:joi.object({
        title:generalFields.title.required(),
        desc:generalFields.desc.required(),
        appliedDiscount:generalFields.appliedDiscount, 
        price:generalFields.price.required(), 
        colors:generalFields.colors, 
        sizes:generalFields.sizes,  
        stok:generalFields.stok.required(),
    }).required(),

    query:joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id,
        brandId:generalFields._id
    }).required().options({presence:'required'})
}

export const updateProductSchema = {
    body:joi.object({
        title:generalFields.title,
        desc:generalFields.desc,
        appliedDiscount:generalFields.appliedDiscount, 
        price:generalFields.price, 
        colors:generalFields.colors, 
        sizes:generalFields.sizes,  
        stok:generalFields.stok,
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