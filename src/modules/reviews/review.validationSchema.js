import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const addReviewSchema = {
    body:joi.object({
        reviewRate:generalFields.reviewRate.required(),
        reviewComment:generalFields.reviewComment.optional()
    }).required(),

    query:joi.object({
        productId:generalFields._id.required(),
    }).required()
};

export const updateReviewSchema = {
    body:joi.object({
        reviewRate:generalFields.reviewRate,
        reviewComment:generalFields.reviewComment
    }).required(),

    params:joi.object({
        reviewId:generalFields._id.required(),
    }).required()
};

export const deleteReviewSchema = {
    params:joi.object({
        reviewId:generalFields._id.required(),
    }).required()
};