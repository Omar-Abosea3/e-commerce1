import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const addToCartSchema = {
    body:joi.object({
        productId:generalFields._id.required(),
        quantity:joi.number().positive().optional(),
    }).required()
};

export const removeFromCartSchema = {
    body:joi.object({
        productId:generalFields._id.required(),
    }).required()
};

export const increamentCounterSchema = {
    body:joi.object({
        productId:generalFields._id.required(),
        quantity:joi.number().positive().optional(),
    }).required()
};

export const dicreamentCounterSchema = {
    body:joi.object({
        productId:generalFields._id.required(),
        quantity:joi.number().positive().optional(),
    }).required()
};