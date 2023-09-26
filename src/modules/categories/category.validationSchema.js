import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const createCategorySchema = {
    body:joi.object({
        name:generalFields.name,
    }).required().options({presence:'required'})
}

export const updateCategorySchema = {
    body:joi.object({
        name:generalFields.name,
    }).required().options({presence:'required'}),

    params:joi.object({
        categoryId:generalFields._id,
    }).required().options({presence:'required'})
}

export const deleteCategorySchema = {
    params:joi.object({
        categoryId:generalFields._id,
    }).required().options({presence:'required'})
}

export const getOneCategorySchema = {
    params:joi.object({
        id:generalFields._id,
    }).required().options({presence:'required'})
}

export const searchCategorySchema = {
    query:joi.object({
        searchKey:generalFields.searchKey,
    }).required().options({presence:'required'})
}