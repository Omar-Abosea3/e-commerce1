import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const signUpSchema = {
    body:joi.object({
        firstName : generalFields.firstName,
        lastName : generalFields.lastName,
        email : generalFields.email,
        password : generalFields.password,
        repassword : generalFields.repassword,
        gender : joi.string().messages({
            'any.required':"gender is required",
            "string.base" : "this must be a string"
        }),
        phone : generalFields.phone,
        age : generalFields.age,
        role : joi.string().max(15).optional(),
    }).required().options({presence:'required'})
};

export const signInSchema = {
    body:joi.object({
        email:generalFields.email,
        password:generalFields.password,
    }).required().options({presence:'required'})
};

export const generateOTPSchema = {
    body:joi.object({
        email:generalFields.email,
    }).required().options({presence:'required'})
};

export const confirmOTPSchema = {
    body: joi.object({
        OTP:generalFields.OTP,
        id:generalFields._id,
    }).required().options({presence:'required'})
};

export const resetPasswordSchema = {
    params : joi.object({
        id:generalFields._id.required(),
    }).required(),

    body : joi.object({
        OTP:generalFields.OTP,
        password:generalFields.password,
        repassword:generalFields.repassword
    }).required().options({presence:'required'})
};