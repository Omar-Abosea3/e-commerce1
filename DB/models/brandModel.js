import { Schema, model } from "mongoose";

const brandSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    logo:{
        secure_url:{
            type:String,
            required:true
        },
        public_id:{
            type:String,
            required:true
        }
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    customId:String,
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },updatedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    deletedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
brandSchema.virtual('Products',{
    ref:"Product",
    localField:"_id",
    foreignField : 'brandId',
})

const brandModel = model('Brand' , brandSchema);
export default brandModel ;