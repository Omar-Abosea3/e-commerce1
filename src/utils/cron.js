import {scheduleJob} from 'node-schedule';
import moment from 'moment';
import couponModel from '../../DB/models/couponModel.js'
export const changeCouponStatus = () => {
    scheduleJob('* */60 * * * * *' , async function(){
        console.log('hello');
        const validCoupons = await couponModel.find({couponStatus:'Valid'});
        console.log(validCoupons);
        for (const coupon of validCoupons) {
            console.log({momentToDeat:moment(coupon.toDate) , now:moment() , cron:moment(coupon.toDate).isBefore(moment())});
            if(moment(coupon.toDate).isBefore(moment())){
                coupon.couponStatus = 'Expired';
            }
            await coupon.save();
        }
        console.log(`cron changeCouponStatusCron() is Running...`);
    })
};