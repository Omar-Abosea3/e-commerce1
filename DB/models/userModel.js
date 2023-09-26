import { Schema , model } from "mongoose";
import systemRoles from "../../src/utils/systemRoles.js";

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        lowercase:true
    },
    lastName:{
        type:String,
        required:true,
        lowercase:true
    },
    userName:{
        type:String,
        required:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        // required:true,
        min:14,
    },
    gender:{
        type:String,
        // required:true,
        enum:['male' , 'female' , 'not selected'],
        default:'not selected'
    },
    isLoggedIn:{
        type:Boolean,
        default:false
    },
    isConfirmEmail:{
        type:Boolean,
        required:true,
        default: false
    },
    role:{
        type:String,
        default:"User",
        enum:[systemRoles.USER , systemRoles.ADMIN , systemRoles.SUPER_ADMIN]
    },
    profile_pic:{
        secure_url:String, 
        public_id:String
    },
    customId:String,
    status:{
        type:String,
        default:'offline',
        enum:['online' , 'offline']
    },
    OTP:Number,
    token:String,
    provider:{
        type:String,
        enum:['GOOGLE']
    }
},{
    timestamps:true,
});

const userModel = model('User' , userSchema);
export default userModel;