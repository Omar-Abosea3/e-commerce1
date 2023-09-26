import Router from "express";
import authentication from "../../middleware/authentication.js";
import {roleSecurity} from "../../utils/systemRoles.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import * as review from './review.controller.js';
import { validationCoreFunction } from "../../middleware/validation.js";
import { addReviewSchema, deleteReviewSchema, updateReviewSchema } from "./review.validationSchema.js";
const router = Router();

router.post('/' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(addReviewSchema) , review.addReview);
router.put('/:reviewId', authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(updateReviewSchema),review.updateReview);
router.delete('/:reviewId', authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(deleteReviewSchema),review.deleteReview); 

export default router;