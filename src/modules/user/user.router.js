import { Router } from "express";
const router = Router();
import * as user from './user.controller.js';
import multerFunction from "../../services/multerCloudinary.js";
import allowedEstensions from "../../utils/allowedExtensions.js";
import authentication from "../../middleware/authentication.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { deleteUserSchema, updateUserSchema } from "./user.validationSchema.js";
import logOutMiddleware from "../../middleware/logOutMiddleware.js";
import { roleSecurity } from "../../utils/systemRoles.js";

router.post('/profile_pic' , authentication(roleSecurity.available) , logOutMiddleware  , multerFunction(allowedEstensions.Images).single('profile_pic') , user.addProfilePicture);
router.get('/' , authentication(roleSecurity.private) , logOutMiddleware , user.getAllUsers);
router.delete('/' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(deleteUserSchema) , user.deleteUser);
router.put('/' , authentication(roleSecurity.available) , logOutMiddleware , validationCoreFunction(updateUserSchema) , user.updateProfile);
router.get('/profile' , authentication(roleSecurity.available) , logOutMiddleware , user.getProfileInfo);
router.get('/search' , authentication(roleSecurity.private) , logOutMiddleware , user.searchForUsers);
router.get('/logout' , authentication(roleSecurity.available) , logOutMiddleware , user.logOutUser);


export default router;