import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const addBrandSchema = {
    body:joi.object({
        name:generalFields.name,
    }).required().options({presence:'required'}),


    query:joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id
    }).required().options({presence:'required'})
}

export const updateBrandSchema = {
    body:joi.object({
        name:generalFields.name,
    }).required().options({presence:'required'}),

    query:joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id,
        brandId:generalFields._id.required(),
    }).required()
}

export const deleteBrandSchema = {
    params:joi.object({
        brandId:generalFields._id,
    }).required().options({presence:'required'})
}

export const getOneBrandSchema = {
    params:joi.object({
        id:generalFields._id,
    }).required().options({presence:'required'})
}

export const searchBrandSchema = {
    query:joi.object({
        searchKey:generalFields.searchKey,
    }).required().options({presence:'required'})
}