import orderModel from "../../../DB/models/orderModel.js";
import productModel from "../../../DB/models/productModel.js";
import reviewModel from "../../../DB/models/reviewModel.js";
import userModel from "../../../DB/models/userModel.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import systemRoles from "../../utils/systemRoles.js";

export const addReview = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const { productId } = req.query;
    console.log(userId);
    console.log(productId);
    // ============= if have previuos review of this product ===========
    if(await reviewModel.findOne({productId , userId})){
        return next(new Error('you made review in this product' , {cause : 403}));
    }
    // ============= check product ================= .
    const isProductValidToBeReviewed = await orderModel.findOne({
        userId,
        'products.productId':productId,
        orderStatus:"deliverd"
    });
    console.log(isProductValidToBeReviewed);
    if(!isProductValidToBeReviewed){
        return next(new Error('you should buy product first' , {cause : 400}));
    }

    const {reviewRate , reviewComment} = req.body;
    const reviewObject = {
        userId,
        productId,
        reviewComment,
        reviewRate
    };

    const review = await reviewModel.create(reviewObject);
    if(!review){
        return next(new Error('review not created please try again' , {cause : 400}));
    }
    const product = await productModel.findById(productId);
    const reviews = await reviewModel.find({productId});
    let sumOfRates = 0;
    for (const review of reviews){
        sumOfRates += review.reviewRate;
    }
    product.rate = Number(sumOfRates / reviews.length).toFixed(2);
    await product.save();
    return res.status(201).json({message : 'review done success' , review , product});
});

export const updateReview = asyncHandeller(async(req , res , next) => {
    const { reviewId } = req.params
    const { reviewComment , reviewRate } = req.body;
    const review = await reviewModel.findOne({_id:reviewId , userId:req.user._id});
    if(!review){
        return next(new Error('not founded review' , { cause : 404}));
    };
    const product = await productModel.findById(review.productId);
    if(!product){
        return next(new Error('this product has been removed from data' , { cause : 404}));
    };
    if(reviewComment){
        if(review.reviewComment == reviewComment){
            return next(new Error('enter new comment' , { cause : 400}) );
        }
        review.reviewComment = reviewComment;
    };
    if(reviewRate){
        if(review.reviewRate == reviewRate){
            return next(new Error('enter new Rate' , { cause : 400}));
        }
        review.reviewRate = reviewRate;
    };
    await review.save();

    const reviews = await reviewModel.find({productId:review.productId});
    let sumOfRates = 0;
    for (const review of reviews) {
        sumOfRates += review.reviewRate;
    }
    product.rate = Number(sumOfRates / reviews.length).toFixed(2);
    await product.save();
    return res.status(200).json({message:'review updated success' , review});
});

export const deleteReview = asyncHandeller(async(req , res , next) => {
    const { reviewId } = req.params;
    const review = await reviewModel.findById(reviewId);
    if(!review){
        return next(new Error('this review not founded' , { cause : 404}));
    }
    const product = await productModel.findById(review.productId);
    if (!product ) {
        return next(new Error("this product is deleted" ,{cause : 400 }));
    }
    const user = await userModel.findById(req.user._id);
    let sumOfRates = 0;
    if(review.userId.toString() != user._id.toString() && user.role == systemRoles.SUPER_ADMIN){
        await reviewModel.findByIdAndDelete(reviewId , { new : true});
        const reviews = await reviewModel.find({productId:review.productId});
        for (const review of reviews) {
            sumOfRates += review.reviewRate;
        }
        product.rate = Number(sumOfRates / reviews.length).toFixed(2);
        await product.save();
        return res.status(200).json({message:"delete successfully"});
    }
    if(review.userId.toString() != user._id.toString()){
        return next(new Error('you not authorized to delete this' , {cause : 401}));
    }

    await reviewModel.findByIdAndDelete(reviewId , { new : true});
    const reviews = await reviewModel.find({productId:review.productId});
    for (const review of reviews) {
        sumOfRates += review.reviewRate;
    }
    product.rate = Number(sumOfRates / reviews.length).toFixed(2);
    await product.save();
    return res.status(200).json({message:"delete successfully"});
});