import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const deleteUserSchema = {
    query: joi.object({
        id:generalFields._id.optional(),
    }).required()
};

export const updateUserSchema = {
    body: joi.object({
        age : generalFields.age,
        phone : generalFields.phone, 
        firstName : generalFields.firstName, 
        lastName : generalFields.lastName
    }).required()
}