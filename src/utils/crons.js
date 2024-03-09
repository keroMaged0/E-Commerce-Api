import { scheduleJob } from "node-schedule";

// import moment from "moment";
import moment from 'moment'
import couponModel from "../../DB/models/coupon.model.js";


export function cronToChangeExpiredCoupons() {
    scheduleJob('*/5 * * * * *', async () => {
        console.log('cronToChangeExpiredCoupons()  is running every 5 seconds');
        const coupons = await couponModel.find({ couponStatus: 'valid' })
        for (const coupon of coupons) {
            if (moment().isAfter(moment(coupon.toDate))) {
                coupon.couponStatus = 'expired'

            }
            await coupon.save()
        }

    })
}
