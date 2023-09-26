import { Schema, model } from "mongoose";


const wishlistSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products:[
        {
            type:Schema.Types.ObjectId,
            ref:'Product',
            required:true
        }
    ],
    brands:[
        {
            type:Schema.Types.ObjectId,
            ref:'Brand',
            required:true
        }
    ]
},{
    timestamps:true,
});

const wishlistModel = model('Wishlist' , wishlistSchema );

export default wishlistModel;