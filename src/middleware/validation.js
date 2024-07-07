import joi from "joi";
import { Types } from "mongoose";

const validationObjectId = ( value , helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message('invalid id');
}

export const validationCoreFunction = (schema) => {
    return (req , res , next) => {
        const reqMethods = ['body' , 'headers' , 'query' , 'params' , 'file' , 'files'];
        const validationErrors = [];
        for (const key of reqMethods) {
            if(schema[key]){
                const validationResult = schema[key].validate(req[key] , {abortEarly:false});
                if(validationResult.error){
                    validationErrors.push(validationResult.error.details);
                }
            }
        }
        if(validationErrors.length){
            req.validationErrors = validationErrors;
            return next(new Error('' , { cause : 400}));
        }
        next();
    }
}

export const generalFields = {
    _id:joi.string().custom(validationObjectId),
    name:joi.string().max(100),
    searchKey:joi.string(),
    email : joi.string().email({tlds:{allow:['com']}}).messages({
        'any.required':"emaile is required",
        "string.base" : "this must be a string",
        "string.email" : "enter a valid email structure"
    }),
    password : joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/).messages({
        'any.required':"password is required",
        "string.base" : "this must be a string",
        "string.pattern.base" : "password must have at least one lowerCase charachter and 1 upperCase charachter and 1 special charachters and 1 number and at least consist of 8 charachters"
    }),
    repassword : joi.string().valid(joi.ref('password')).messages({
        'any.required':"repassword is required",
        "string.base" : "this must be a string",
        "any.only": "password and repassword must be matched"
    }),
    OTP:joi.string().max(6),
    firstName : joi.string().min(4).max(20).messages({
        'any.required':"firstName is required",
        "string.min" : "at least 4 charachters required",
        "string.max" : "at most 20 charachters required",
        "string.base" : "this must be a string"
    }),
    lastName : joi.string().min(4).max(20).messages({
        'any.required':"lastName is required",
        "string.min" : "at least 4 charachters required",
        "string.max" : "at most 20 charachters required",
        "string.base" : "this must be a string"
    }),
    phone : joi.string().regex(/^01[0-2,5]{1}[0-9]{8}$/).messages({
        'any.required':"phone is required",
        "string.base" : "this must be a string",
        "string.pattern.base" : "this is not complete or not correct phone number"
    }),
    age : joi.number().min(14).messages({
        'any.required':"age is required",
        "number.base" : "this must be a number",
        "number.min" : "at least 14 years old",
    }),
    couponCode:joi.string().min(5).max(55),
    couponAmount:joi.number().positive().min(1).max(100),
    fromDate:joi.date().greater(Date.now()-(24*60*60*1000)),
    isPercentage:joi.boolean(),
    isFixedAmount:joi.boolean(),
    address:joi.string(),
    phoneNumbers:joi.array().items(joi.string()),
    paymentMethod:joi.string(),
    couponCode:joi.string(),
    city:joi.string().min(3).max(20),
    state:joi.string().min(3).max(20),
    token:joi.string().required(),
    reviewRate:joi.number().min(1).max(5),
    reviewComment:joi.string().min(5).max(255),
    title:joi.string().min(2).max(200),
    desc:joi.string().min(10),
    appliedDiscount:joi.number().positive().min(1).max(100), 
    price:joi.number().positive().min(1), 
    colors:joi.array().items(joi.string().required()), 
    sizes:joi.array().items(joi.string().required()),  
    stok:joi.number().integer().positive().min(1),
}