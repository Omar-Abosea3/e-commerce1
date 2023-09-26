import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const createCouponSchema = {
  body: joi.object({
    couponCode:generalFields.couponCode.required(),
    couponAmount:generalFields.couponAmount.required(),
    fromDate:generalFields.fromDate.required(),
    toDate:joi.date().greater(joi.ref('fromDate')).required(),
    isPercentage:generalFields.isPercentage,
    isFixedAmount:generalFields.isFixedAmount,
  }).required(),
};

export const updateCouponSchema = {
  body: joi.object({
    couponCode:generalFields.couponCode,
    couponAmount:generalFields.couponAmount,
    fromDate:generalFields.fromDate,
    toDate:joi.date().greater(Date.now()),
  }).required(),

  params: joi.object({
    id:generalFields._id.required(),
  }).required()
};

export const deleteCouponSchema = {
  params:joi.object({
      id:generalFields._id.required(),
  }).required(),
};