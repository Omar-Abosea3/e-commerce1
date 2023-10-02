import userModel from "../../../DB/models/userModel.js";
import sendEmail from "../../utils/email.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';
import generateOTPFunction from "../../utils/generateOTP.js";
import {OAuth2Client} from 'google-auth-library';
import { nanoid } from "nanoid";



export const signUp = asyncHandeller(async(req , res , next) => {
    const {firstName , lastName , email , password , repassword , phone , age , gender , role} =req.body;
    if(password !== repassword){
        return next(new Error('password and repassword not matched', {cause:400}));
    }
    if(age < 14){
        return next(new Error('You are so young' , {cause : 400}));
    }
    const findUser = await userModel.findOne({$or:[{email} , {phone}]});
    if(findUser){
        return next(new Error('user already exists or have the same phone number' , {cause:409}));
    }
    const userName = firstName + ' ' + lastName;
    const hashPassword = bcryptjs.hashSync(password , parseInt(process.env.NUMOFHASH));
    const user = await userModel.create({firstName , lastName , userName , email , password:hashPassword ,  phone , age , gender , role });
    sendEmail({to:user.email , subject:"e-commerce" ,text:'success signUp , please virefy your email with otp'})
    return res.status(200).json({message:'success' , user});
});

export const generateOTP = asyncHandeller(async(req , res , next) => {
    const { email } = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return next(new Error('this user is not found' , {cause:404}));
    }
    const OTP = await generateOTPFunction();
    user.OTP = OTP;
    await user.save();
    sendEmail({to:user.email , subject:"e-commerce" , text : `your OTP code is ${OTP}`});
    return res.status(201).json({message:'email founded and your OTP is generated' , userId : user._id});
});

export const confirmEmail = asyncHandeller(async (req , res , next) => {
    const {OTP , id} = req.body;
    if(!OTP){
        return next(new Error('OTP is required' , {cause:400}))
    }
    const user = await userModel.findOne({_id:id , OTP});
    if(!user){
        return next(new Error('invalid OTP' , {cause:404}))
    }
    if(user.isConfirmEmail){
        return next(new Error('you are already confirmed' , {cause:400}))
    }
    user.isConfirmEmail = true;
    user.OTP=null;
    await user.save();
    return res.status(200).json({message:'success'});
});

export const unsupscribeEmail = asyncHandeller(async(req , res , next) => {
    const {OTP , id} = req.body;
    if(!OTP){
        return next(new Error('OTP is required' , {cause:400}))
    }
    if((await userModel.findById(id)).isConfirmEmail){
        return next(new Error('you are already confirmed , if you want to delete your account enter to your personal setting' , {cause:400}))
    }
    const user = await userModel.findOneAndDelete({ _id:id , OTP});
    if(!user){
        return next(new Error('invalid OTP' , {cause:404}))
    }
    return res.status(200).json({message:'success'});
});

export const forgetPassword = asyncHandeller(async(req , res , next) => {
    const {OTP , id} = req.body;
    if(!OTP){
        return next(new Error('OTP is required' , {cause:400}))
    }
    const user = await userModel.findOne({_id:id ,OTP});
    if(!user){
        return next(new Error('invalid OTP' , {cause:404}))
    }
    if(user.isConfirmEmail == false){
        return next(new Error('you must confirm your email first' , {cause:400}))
    }
    await user.save();
    return res.status(200).json({message:'success' , user});
});

export const resetPassword = asyncHandeller(async(req , res , next) => {
    const {id} = req.params;
    const { password , repassword , OTP } = req.body;
    if(password != repassword){
        return next(new Error('password and repassword is not matched' , {cause:400}));
    }
    const user = await userModel.findOne({_id:id, OTP});
    if(!user){
        return next(new Error('this user is not found or not have this OTP Code' , {cause:404}));
    }
    const hashPassword = bcryptjs.hashSync(password , parseInt(process.env.NUMOFHASH));
    user.password = hashPassword;
    user.OTP = null;
    await user.save();
    return res.status(200).json({message:'success'});
});

export const signIn = asyncHandeller(async(req , res , next) => {
    const {email , password } = req.body;
    const user = await userModel.findOneAndUpdate({email} ,{isLoggedIn:true} , {new:true});
    if(!user){
        return next(new Error('user dosn’t exists' , {cause:404}));
    }
    const hashPassword = bcryptjs.compareSync(password , user.password);
    if(!hashPassword){
        return next(new Error('in-valid user data' , {cause:400}))
    }
    if(user.isDeleted){
        return next(new Error("this account has been deleted" ,{ cause : 400}))
    }
    if(!user.isConfirmEmail){
        return next(new Error('you must confirm new account first' , {cause:400}))
    }
    const token = jwt.sign({email:user.email , id:user._id , isLoggedIn:true} , process.env.TOKEN_SECRET , {expiresIn:'24h'});
    user.token = token;
    user.status = 'online';
    await user.save();
    const bearerToken = process.env.BEARERKEY + token ;
    return res.status(201).json({message:'success' , user , bearerToken});
});

export const loginWithGmail = asyncHandeller(async (req, res, next) => {
    const {idToken} = req.body;
    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        return payload;
    }
    // verify().catch(console.error);
    const { email_verified , name , lastName , firstName , email} = await verify();
    if(!email_verified){
        return next(new Error('invalid email' , { cause : 400}));
    }
    // login.
    const user = await userModel.findOne({email , provider :'GOOGLE'});
    if(user){
        const token = jwt.sign({email , id:user._id , isLoggedIn:true } , process.env.TOKEN_SECRET , {expiresIn:'24h'});
        const userUpdated = await userModel.findOneAndUpdate({email} , {
            token,
            status:"online",
            isLoggedIn:true
        },{
            new:true
        });
        const bearerToken = process.env.BEARERKEY + token ;
        return res.status(201).json({message:'login done' , userUpdated , bearerToken});
    }

    // signUp 
    const userObject = {
        firstName,
        lastName,
        userName:name,
        email,
        password:nanoid(6), // mesh ba7tagoh fe 7agah bas ba3meloh generate 3alashan required.
        provider:'GOOGLE',
        isConfirmEmail:true,
        phone:' ',
        role:'User'
    };
    const newUser = await userModel.create(userObject);
    const token = jwt.sign({email , id:newUser._id , isLoggedIn:true } , process.env.TOKEN_SECRET , {expiresIn:'24h'});
    const bearerToken = process.env.BEARERKEY + token ;
    newUser.token = token;
    newUser.isLoggedIn = true;
    newUser.status = 'online',
    await newUser.save();
    return res.status(200).json({message:'signed up and verified' , newUser , bearerToken});
});