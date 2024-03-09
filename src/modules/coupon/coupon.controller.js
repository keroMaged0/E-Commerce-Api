import { DateTime } from "luxon";
import couponModel from "../../../DB/models/coupon.model.js";
import coupon_userModel from "../../../DB/models/coupon_user.model.js";

import { catchError } from "../../middleware/global-response.middleware.js";
import { appError } from "../../utils/app.Error.js";
import { createCouponToUsers } from "./utils/add_coupon_to_users.js";
import { apiFeature } from "../../service/api_feature.js";


//=================================== Add coupon controller ===================================// 
/* 
    * destruct required data
    * coupon check 
    * create coupon object
    * create coupon in db
*/
const addCoupon = catchError(
    async (req, res, next) => {
        // destruct required data
        const { couponCode, couponAmount, couponStatus, isFixed, isPercentage, fromDate, toDate, users } = req.body
        const { _id } = req.user

        // coupon check if exist
        const couponExit = await couponModel.findOne({ couponCode })
        if (couponExit) return next(new appError("coupon code is already exit", 409))

        if (DateTime.fromISO(fromDate) < DateTime.now() || (DateTime.fromISO(toDate) < DateTime.now()))
            return next(new appError("!not valid date",));

        // if send isFixed and isPercentage
        if (isFixed == isPercentage) return next(new appError("send isFixed or isPercentage", 409))

        // if send percentage
        if (isPercentage) {
            if (couponAmount > 100) return next(new appError("percentage should be less than 100 ", 409))
        }

        // create coupon object
        const couponObj = {
            couponCode,
            couponAmount,
            couponStatus,
            isFixed,
            isPercentage,
            fromDate,
            toDate,
            addedBy: _id
        }

        // create coupon in db
        const coupon = await couponModel.create(couponObj)

        if (users) {
            await createCouponToUsers(users, coupon._id)
        }

        res.json({ success: true, message: "coupon add successfully", data: coupon })

    }
)

//=================================== update coupon controller ===================================// 
/* 
    * destruct required data
   
*/
const updateCoupon = catchError(
    async (req, res, next) => {
        // destruct required data
        const { couponCode, couponAmount, couponStatus, isFixed, isPercentage, fromDate, toDate } = req.body
        const { _id } = req.user
        const { couponId } = req.params

        // coupon check if exist
        const couponExit = await couponModel.findOne({ _id: couponId })
        if (!couponExit) return next(new appError("coupon not found", 409))

        if (couponCode) {
            // check if coupon exist 
            if (couponExit.couponCode.toString() == couponCode) return next(new appError("this same old coupon code", 409))

            // coupon check if duplicate
            const couponDuplicated = await couponModel.findOne({ couponCode })
            if (couponDuplicated) return next(new appError("coupon code is already exit", 409))

            couponExit.couponCode = couponCode
        }

        // if update coupon amount
        if (couponAmount) couponExit.couponAmount = couponAmount

        // if update coupon status
        if (couponStatus) couponExit.couponStatus = couponStatus

        // if update isFixed
        if (isFixed) {
            if (isFixed == couponExit.isPercentage.toString()) return next(new appError("is isFixed equal isPercentage this not valid", 409))
            couponExit.isFixed = isFixed
        }
        // if update isPercentage
        if (isPercentage) {
            if (isPercentage == couponExit.isFixed.toString()) return next(new appError("is isFixed equal isPercentage this not valid", 409))
            couponExit.isPercentage = isPercentage
        }

        // if update fromDate
        if (fromDate) {
            if (couponExit.couponStatus === 'expired' || DateTime.fromISO(fromDate) > DateTime.fromJSDate(couponExit.toDate))
                return next(new appError("expired date can't update",));

            couponExit.fromDate = fromDate
        }

        // if update toDate
        if (toDate) {
            if (DateTime.fromJSDate(toDate) < DateTime.now())
                return next(new appError("can't update this date",));

            if (couponExit.couponStatus === 'expired') {
                couponExit.couponStatus = 'valid'
            }
            couponExit.toDate = toDate
        }

        couponExit.updatedBy = _id
        await couponExit.save()

        res.json({ success: true, message: "coupon update successfully", data: couponExit })

    }
)

//=================================== add coupon to user controller ===================================// 
/* 
    * destruct required data
    * coupon check if exist
    * create array to push all id users in array
    * loop array push userId in array userIds 
    * check user exist
    * if not found user id in db
    * create coupon to users 
*/
const addCouponToUsers = catchError(
    async (req, res, next) => {
        // destruct required data
        const { users } = req.body
        const { couponId } = req.params

        // coupon check if exist
        const couponExit = await couponModel.findOne({ _id: couponId })
        if (!couponExit) return next(new appError("coupon code is already exit", 409))

        let userCoupon = await createCouponToUsers(users, couponId)

        return res.json({ success: true, message: "coupon add successfully", data: couponExit, userCoupon })
    }
)


//=================================== get All coupons controller ===================================// (done)
/*
    * find category model
    * use Feature API to get category
*/
const getAllCoupons = catchError(
    async (req, res, next) => {
        // destruct required data
        const { page, size, sort, ...query } = req.query

        // find category model 
        const ApiFeature = new apiFeature(req.query, couponModel.find())
            .pagination() // pagination 
            .sort(sort) //sort
            .search(query) //search
            .filter(query) //filter


        const coupons = await ApiFeature.mongooseQuery
            .populate([
                { path: 'addedBy', select: 'name' },
                { path: 'updatedBy', select: 'name' }
            ])


        if (!coupons) return next(new appError('!not found coupons', 401))

        res.json({ success: true, message: "successfully", coupons })
    }
)

//=================================== get specific coupon controller ===================================// (done)
/*
    * destruct id to params
*/
const getSpecificCoupon = catchError(
    async (req, res, next) => {
        // destruct id to params
        const { couponId } = req.params

        // find coupon model 
        const coupon = await couponModel.findById(couponId)
            .populate([
                { path: 'addedBy', select: 'name' },
                { path: 'updatedBy', select: 'name' }
            ])
        console.log(coupon);
        if (!coupon) return next(new appError('!not found coupon', 401))

        res.json({ success: true, message: "successfully", coupon })
    }
)

// //=================================== Get All Disabled Coupons controller ===================================// (done)
// /*
//     * destruct id to params
// */
// const getAllDisabledCoupons = catchError(
//     async (req, res, next) => {
//         // destruct id to params
//         // const { page, size, sort,...query } = req.query

//         const couponUsers = await coupon_userModel.find()

//         let disabledCouponUser = [] 
//         for (const user of couponUsers) {
//             await coupon_userModel.find()
//             if (user.usageCount == user.maxUsage) {
//                 disabledCouponUser.push(user.couponId)
//             }
//         }

//         const coupons = 

//         console.log(disabledCouponUser);

//         res.json({ success: true, message: "successfully", data: couponUsers })
//     }
// )

export {
    addCoupon,
    updateCoupon,
    addCouponToUsers,
    getAllCoupons,
    getSpecificCoupon,
    // getAllDisabledCoupons
}



