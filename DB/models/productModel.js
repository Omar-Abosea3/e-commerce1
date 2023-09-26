import { Schema, model } from "mongoose";

const productSchema = new Schema({
    title:{
        type:String,
        required:true,
        lowercase:true
    },
    desc:{
        type:String,
    },
    slug:{
        type:String,
        required:true,
        lowercase:true
    },
    colors:[String],
    sizes:[String],
    price:{
        type:Number,
        required:true,
        default:0
    },
    appliedDiscount:{
        type:Number,
        default:0
    },
    priceAfterDiscount:{
        type:Number,
        default:0
    },
    stok:{
        type:Number,
        required:true,
        default:0
    },
    customId:String,
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
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
    subCategoryId:{
        type:Schema.Types.ObjectId,
        ref:'Subcategory',
        required:true
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    brandId:{
        type:Schema.Types.ObjectId,
        ref:'Brand',
        required:true
    },
    images:[{
        secure_url:{
            type : String ,
            required:true
        },
        public_id:{
            type : String ,
            required:true
        }
    }],
    rate:{
        type:Number,
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

productSchema.virtual('Reviews' , {
    ref:'Review',
    foreignField:'productId',
    localField:'_id'
});

const productModel = model('Product' , productSchema);
export default productModel;