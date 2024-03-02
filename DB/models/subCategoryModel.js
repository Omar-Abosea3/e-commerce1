import { Schema, model } from "mongoose";

const subCategorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    arName:{
        type:String,
        required:true,
        lowercase:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    arSlug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    image:{
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
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    deletedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    customId:String,
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

subCategorySchema.virtual('Brands',{
    ref:"Brand",
    localField:"_id",
    foreignField : 'subCategoryId',
});
subCategorySchema.virtual('Products',{
    ref:"Product",
    localField:"_id",
    foreignField : 'subCategoryId',
})

const subCategoryModel = model('Subcategory' , subCategorySchema);
export default subCategoryModel ;