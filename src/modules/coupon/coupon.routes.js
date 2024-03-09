import { Router } from "express";

import * as couponController from './coupon.controller.js';
import * as authController from '../auth/auth.controller.js';
import * as validators from './coupon.validation.js';
import { endPointRoles } from "./coupon.endPoint.js";

import { validationMiddleware } from "../../middleware/validation.middleware.js";

const router = Router();

//=================================== Add coupon router ===================================// 
router.post('/',
    authController.protectedRoute(endPointRoles.ADD_COUPON),
    validationMiddleware(validators.addCouponValidation),
    couponController.addCoupon
)

//=================================== Update coupon router ===================================// 
router.put('/:couponId',
    authController.protectedRoute(endPointRoles.UPDATE_COUPON),
    validationMiddleware(validators.updateCouponValidation),
    couponController.updateCoupon
)

//=================================== Update coupon router ===================================// 
router.post('/:couponId',
    authController.protectedRoute(endPointRoles.UPDATE_COUPON),
    validationMiddleware(validators.addCouponToUserValidation),
    couponController.addCouponToUsers
)

//=================================== get All coupon router ===================================// 
router.get('/AllCoupon',
    authController.protectedRoute(endPointRoles.UPDATE_COUPON),
    couponController.getAllCoupons
)

//=================================== get specific coupon router ===================================// 
router.get('/:couponId',
    authController.protectedRoute(endPointRoles.UPDATE_COUPON),
    couponController.getSpecificCoupon
)

// //=================================== get All disabled coupon router ===================================// 
// router.get('/',
//     authController.protectedRoute(endPointRoles.GET_DISABLED),
//     couponController.getAllDisabledCoupons
// )


//===================================add Coupon To User router ===================================// 

router.get('/:couponId',
    authController.protectedRoute(endPointRoles.UPDATE_COUPON),
    validationMiddleware(validators.addCouponToUserValidation),
    couponController.addCouponToUsers
)


export default router;