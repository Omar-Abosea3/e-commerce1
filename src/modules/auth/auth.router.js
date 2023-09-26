import { Router } from "express";
import * as auth from './auth.controller.js'
import { validationCoreFunction } from "../../middleware/validation.js";
import { confirmOTPSchema, generateOTPSchema, resetPasswordSchema, signInSchema, signUpSchema } from "./auth.validationSchema.js";
const router = Router();


router.post('/signup' , validationCoreFunction(signUpSchema) , auth.signUp);
router.post('/signin' , validationCoreFunction(signInSchema) , auth.signIn);
router.post('/generateotp' , validationCoreFunction(generateOTPSchema) , auth.generateOTP);
router.post('/confirmemail' , validationCoreFunction(confirmOTPSchema) , auth.confirmEmail);
router.post('/unsubscribe' , validationCoreFunction(confirmOTPSchema) , auth.unsupscribeEmail);
router.post('/forgetpassword' , validationCoreFunction(confirmOTPSchema) , auth.forgetPassword);
router.post('/forgetpassword/:id' , validationCoreFunction(resetPasswordSchema) , auth.resetPassword);
router.post('/loginWithGmail' , auth.loginWithGmail)


export default router;