import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const createSubCategorySchema = {
    body:joi.object({
        name:generalFields.name,
        arName:generalFields.name
    }).required().options({presence:'required'}),


    query:joi.object({
        categoryId:generalFields._id,
    }).required().options({presence:'required'})
}

export const updateSubCategorySchema = {
    body:joi.object({
        name:generalFields.name,
    }).required().options({presence:'required'}),

    query:joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id
    }).required().options({presence:'required'})
}

export const deleteSubCategorySchema = {
    params:joi.object({
        subCategoryId:generalFields._id,
    }).required().options({presence:'required'})
}

export const getOneSubCategorySchema = {
    params:joi.object({
        id:generalFields._id,
    }).required().options({presence:'required'})
}

export const searchSubCategorySchema = {
    query:joi.object({
        searchKey:generalFields.searchKey,
    }).required().options({presence:'required'})
}