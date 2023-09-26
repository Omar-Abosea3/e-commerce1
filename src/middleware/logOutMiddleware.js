import userModel from "../../DB/models/userModel.js";
import { asyncHandeller } from "../utils/errorHandlig.js";

const logOutMiddleware = asyncHandeller(async( req , res , next) => {
    const user = await userModel.findById(req.user._id);
    if(!user.isLoggedIn || user.status == 'offline'){
        return next(new Error('this user has been logedOut' , {cause:400}));
    }
    next();
});

export default logOutMiddleware;