import moment from "moment";
import couponModel from "../../../DB/models/couponModel.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import userModel from "../../../DB/models/userModel.js";
import systemRoles from "../../utils/systemRoles.js";

export const createCoupon = asyncHandeller(async(req , res , next) => {
    const {couponCode , couponAmount , fromDate , toDate , isPercentage , isFixedAmount} = req.body;

    const findCoupon = await couponModel.findOne({couponCode});
    if(findCoupon){
        return next(new Error('duplicate couponeCode' , {cause:409}));
    }

    if((!isFixedAmount && !isPercentage)||(isFixedAmount&&isPercentage)){
        return next(new Error('select if the coupon is percentage or fixed amount' , {cause:400}))
    };
    if(!fromDate && !toDate){
        return  next ( new Error ('please select a valid date range for this coupon',{ cause :  400 }));
    }

    if(moment().isAfter(fromDate)){
        return next(new Error('enter a valid from date and' , { cause : 400}))
    }
    if(moment(toDate).isSameOrBefore(fromDate)){
        return next (new Error ('the end date should be greater than start date ',{cause:400})) ;
    }

    const couponObject = {
      couponCode,
      couponAmount,
      fromDate,
      toDate,
      isPercentage,
      isFixedAmount,
      couponAssignedtoUsers:[{userId:req.user._id , maxUsage:3}],
      createdBy:req.user._id
    };

    const coupon = await couponModel.create(couponObject);
    if(!coupon){
        return next(new Error('coupon not created' , {cause:400}))
    }
    return res.status(200).json({message:'success' , coupon });
});

export const updateCoupon = asyncHandeller(async(req , res , next) => {
    const { id } = req.params;
    const {couponCode , couponAmount , fromDate , toDate } = req.body;
    const findCoupon = await couponModel.findById(id);
    if(!findCoupon){
        return next(new Error('this coupon not founded' , {cause:404}))
    }
    if(couponCode){
        if(findCoupon.couponCode == couponCode || await couponModel.findOne(couponCode)){
            return next(new Error('duplicate couponeCode enter a different one' , {cause:400}));
        }
        findCoupon.couponCode = couponCode;
    }
    if(couponAmount){
        if(findCoupon.couponAmount == couponAmount){
            return next(new Error('enter a new coupon Amount' , { cause : 400}))
        }
        findCoupon.couponAmount = couponAmount;
    }
    if(fromDate && toDate){
        if(moment(findCoupon.fromDate).isSame(fromDate) || moment(findCoupon.toDate).isSame(toDate)){
            return next(new Error('enter a new or a valid from date and to date' , { cause : 400}))
        }
        if(moment(toDate).isBefore(fromDate)){
            return next (new Error ('the end date should be greater than start date ',{cause:400})) ;
        }
        if( moment().isSameOrAfter(toDate) || moment().isAfter(fromDate)){
            return next (new Error ('the end date and start date should be greater than this day',{cause:400})) ;
        }
        findCoupon.fromDate = fromDate;
        findCoupon.toDate = toDate;
    }
    if(fromDate){
        if(moment(findCoupon.fromDate).isSame(fromDate)){
            return next(new Error('enter a new from date' , { cause : 400}))
        }
        if(moment(findCoupon.toDate).isBefore(fromDate) ){
            return next (new Error ('the end date should be greater than start date and start date from this day',{cause:501})) ;
        }
        if( moment().isSameOrAfter(findCoupon.toDate) || moment().isAfter(fromDate)){
            return next (new Error ('the end date and start date should be greater than this day',{cause:400})) ;
        }
        findCoupon.fromDate = fromDate;
    }
    if(toDate){
        if( moment(findCoupon.toDate ) == moment(toDate) ){
            return next(new Error('enter a new or valid to date' , { cause : 400}))
        }
        if(moment(findCoupon.fromDate).isAfter(toDate)){
            return next (new Error ('the end date should be greater than start date and greater than this day and start date from this day',{cause:501})) ;
        }
        if( moment().isSameOrAfter(toDate)){
            return next (new Error ('the end date should be greater than this day',{cause:400})) ;
        }
        findCoupon.toDate = toDate;
    }
    await findCoupon.save();
    return res.status(200).json({message:'success' , findCoupon });
});

export const deleteCoupon = asyncHandeller(async(req , res , next) => {
        const { id } = req.params;
        const user = await userModel.findById(req.user._id)
        const findCoupon = await couponModel.findById(id);
        if(!findCoupon){
            return next(new Error('this coupon is not founded' , {cause : 404}));
        }
        if(user.role == systemRoles.ADMIN && user._id.toString() != findCoupon.createdBy.toString()){
            return next(new Error('this coupon do not created by this Admin' , {cause:400}));
        }
        await couponModel.findByIdAndDelete(id);
        return res.status(200).json({message:'deleted done'});
});

export const getAllAssignedCoupons = asyncHandeller(async(req , res , next) => {
    const coupons = await couponModel.find({"couponAssignedtoUsers.userId":req.user._id});
    if(coupons.length == 0){
        return next(new Error("this user not have a coupon" , { cause : 404}));
    }
    return res.status(200).json({message:'success' , coupons});
});

export const getAllCoupons = asyncHandeller(async(req , res , next) => {
    const user = await userModel.findById(req.user._id);
    if(user.role == systemRoles.ADMIN){
        const coupons = await couponModel.find({createdBy:user._id});
        if(coupons.length == 0){
            return next(new Error("no founded coupons for this Admin" , { cause : 404}));
        }
        return res.status(200).json({message:'success' , coupons});
    }
    const coupons = await couponModel.find();
    if(coupons.length == 0){
        return next(new Error("no founded coupons" , { cause : 404}));
    }
    return res.status(200).json({message:'success' , coupons});
});



