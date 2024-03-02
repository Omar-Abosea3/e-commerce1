import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const orderProductSchema = {
    body:joi.object({
        quantity:joi.number(),
        address:generalFields.address,
        phoneNumbers:generalFields.phoneNumbers,
        paymentMethod:generalFields.paymentMethod,
        couponCode:generalFields.couponCode.optional(),
        city:generalFields.city,
        state:generalFields.state
    }).required().options({presence:'required'}),

    params:joi.object({
        productId:generalFields._id.required()
    }).required(),
}

export const orderCartSchema = {
    body:joi.object({
        address:generalFields.address,
        phoneNumbers:generalFields.phoneNumbers,
        paymentMethod:generalFields.paymentMethod,
        couponCode:generalFields.couponCode.optional(),
        city:generalFields.city,
        state:generalFields.state
    }).required().options({presence:'required'}),

    params:joi.object({
        cartId:generalFields._id.required()
    }).required(),
}

export const successPaymentSchema = {
    query:joi.object({
        token:generalFields.token,
    }).required()
};

export const cancelPaymentSchema = {
    query:joi.object({
        token:generalFields.token,
    }).required()
};                 

export const deliverOrderSchema = {
    query:joi.object({
        orderId : generalFields._id.required(),
    }).required() 
};