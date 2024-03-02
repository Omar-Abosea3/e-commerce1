import { Schema, model } from "mongoose";

const categorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    arName:{
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
    customId:String,
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User'
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

categorySchema.virtual('subCategories',{
    ref:"Subcategory",
    localField:"_id",
    foreignField : 'categoryId',
});
categorySchema.virtual('Products',{
    ref:"Product",
    localField:"_id",
    foreignField : 'categoryId',
});
categorySchema.virtual('Brands',{
    ref:"Brand",
    localField:"_id",
    foreignField : 'categoryId',
});

const categoryModel = model('Category' , categorySchema);
export default categoryModel ;
