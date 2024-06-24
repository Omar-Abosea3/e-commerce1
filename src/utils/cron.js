import {scheduleJob} from 'node-schedule';
import moment from 'moment';
import couponModel from '../../DB/models/couponModel.js';
import userModel from "../../DB/models/userModel.js";
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

export const removeNonConfirmedAccount = () => {
    scheduleJob('*/5 * * * *', async () => {
        try {
            const users = await userModel.find({ isConfirmEmail: false });
            const deletedUsers = [];
            const now = new Date();
            const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000); // Date 30 minutes ago

            for (const user of users) {
                if (new Date(user.createdAt) < thirtyMinutesAgo) { // Compare with the date 30 minutes ago
                    await userModel.findByIdAndDelete(user._id);
                    deletedUsers.push(user._id);
                }
            }

            console.log(`${deletedUsers.length} non-confirmed accounts deleted.`);
        } catch (error) {
            console.log('No non-confirmed accounts found.');
        }
    });
};