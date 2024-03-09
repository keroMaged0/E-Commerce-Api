import coupon_userModel from "../../../../DB/models/coupon_user.model.js"
import userModel from "../../../../DB/models/user.model.js"


export const createCouponToUsers = async (users,couponExit) => {

    // to push all id users in array
    const userIds = []

    // loop array push userId in array userIds 
    for (const user of users) {
        userIds.push(user.userId)
    }   

    // check user exist
    const isUser = await userModel.find({ _id: { $in: userIds } })

    // if not found user id in db
    if (isUser.length != users.length) return next(new appError('!not found user', 404))

    // create coupon to users 
    const userCoupon = await coupon_userModel.create(
        users.map(ele => ({ ...ele, couponId: couponExit}))
    )
    return userCoupon

}