import cloudinary from "./cloudinaryConfigration.js";

export const asyncHandeller =(fn) => {
    return (req , res , next) => {
        return fn(req , res , next)
        .catch(async(err) => {
            console.log(err);
            if(req.imagePath){
                await cloudinary.api.delete_resources_by_prefix(req.imagePath);
                await cloudinary.api.delete_folder(req.imagePath);
            }
            return next(new Error('request Error' , {cause : 500}));
        })
    }
}


export const glopalErrorHandelling = (err , req , res , next) => {
    if(err){
        if(req.validationErrors){
            return res.status(err.cause || 500).json({message:"validation Errors" , Errors:req.validationErrors})
        }
        console.log(err);
        return res.status(err.cause || 500).json({message:err.message})
    }
}