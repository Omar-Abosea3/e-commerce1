import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addToWishlistSchema = {
    query:joi.object({
        productId:generalFields._id,
        brandId:generalFields._id
    }).required()
};

export const removeProductFromWishlistSchema = {
    params:joi.object({
        productId:generalFields._id.required(),
    }).required()
};

export const removeBrandFromWishlistSchema = {
    params:joi.object({
        brandId:generalFields._id.required(),
    }).required()
};