import couponModel from "../../DB/models/coupon.model.js";
import couponUserModel from "../../DB/models/coupon_user.model.js";
import { DateTime } from "luxon";

//============================== coupon validation ==============================//
/*
    * checks if coupon valid
    * if!not found return 
    * return coupon if found
    * check if coupon expired
    * check if coupon start
    * check if coupon allowed to user
    * check how many user used  coupon
*/
export async function applyCouponValidation(couponCode, userId) {
    // check if coupon found
    const coupons = await couponModel.findOne({ _id: couponCode })
    if (!coupons) return { success: false, message: "Coupon not valid first", cause: 400 };

    // if coupon expired
    if (coupons.couponStatus === 'expired' || DateTime.fromISO(coupons.toDate) > DateTime.now())
        return { success: false, message: "Coupon expired" ,cause: 400 };

    // if coupon start
    if (DateTime.now() < DateTime.fromISO(coupons.fromDate))
        return { success: false, message: "Coupon not valid" ,cause: 400 };

    // if coupon allowed to user
    const userCoupons = await couponUserModel.findOne({ userId, couponId: coupons._id })
    if (!userCoupons) return { success: false, message: "this coupon not assign to" ,cause: 400 };

    // check if coupon maxUsed
    if (userCoupons.usageCount >= userCoupons.maxUsage)
        return { success: false, message: "you used max using this coupon" ,cause: 400};

    return coupons;
    

}

