import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    couponCode: {
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    couponAmount:{
        type:Number,
        type:String,
        required:true,
        min:1,
        default:1,
        max:100
    },
    isPercentage:{
        type:Boolean,
        required:true,
        default:false
    },
    isFixedAmount:{
        type:Boolean,
        required:true,
        default:false
    },
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
    couponAssignedtoUsers:[
        {
            userId:{
                type:Schema.Types.ObjectId,
                ref:'User'
            },
            maxUsage: {
                type:Number,
                required:true,
                default:1
            },
            usageCount:{
                type:Number,
                default:0
            }
        }
    ],
    fromDate:{
        type:Date,
        required:true,
    },
    toDate:{
        type:Date,
        required:true,
    },
    couponStatus:{
        type:String,
        required:true,
        enum:['Expired' , 'Valid'],
        default:'Valid'
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);




const couponModel = model('Coupon' , couponSchema);
export default couponModel ;
