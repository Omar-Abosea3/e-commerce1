import moment from "moment";
import couponModel from "../../DB/models/couponModel.js"

const isCouponValid = async ({couponCode , userId } = {}) => {
    const coupon = await couponModel.findOne({couponCode});
    if(!coupon){
        return{
            msg:'please enter a valid coupon',
        };
    }
    // expiration
    if(coupon.couponStatus == 'Expired' || moment(coupon.toDate).isBefore(moment())){
        return {
            msg:"coupon has expired",
        }
    }
    if(coupon.couponStatus == 'Valid' && moment().isBefore(moment(coupon.fromDate))){
        return {
            msg:"coupon dosn’t started yet",
        }
    }
     let notAssigntUsers = [];
     let exceedMaxUsage = false;
    for (const user of coupon.couponAssignedtoUsers) {
        notAssigntUsers.push(user.userId.toString());

        if(userId.toString() == user.userId.toString()){
            // exceed the max usage 
            if(user.maxUsage <= user.usageCount){
                exceedMaxUsage= true ;
            }
        }
    }
    // coupon not assigned to user.
    if(!notAssigntUsers.includes(userId.toString())){
        return {
            msg:'this user not assigned for this coupon',
            notAssigned:true
        }
    }

    if(exceedMaxUsage){
        return {
            msg:"exceed the max usage for this coupon"
        }
    }

    return true;
}

export default isCouponValid;