import { Router } from "express";
import * as orderController from './order.controller.js';
import * as authController from '../auth/auth.controller.js';
import { endPointRoles } from "./order.endPoint.js";
import * as validators from './order.validation.js';

import { validationMiddleware } from "../../middleware/validation.middleware.js";



const router = Router();


//=================================== Add order router router ===================================//
router.post('/',
    authController.protectedRoute(endPointRoles.USER_ROLE),
    validationMiddleware(validators.addOrderValidation),
    orderController.createOrder
)

//=================================== convert cart to order router ===================================//
router.post('/CartToOrder',
    authController.protectedRoute(endPointRoles.USER_ROLE),
    validationMiddleware(validators.CartToOrderValidation),
    orderController.convertCartToOrder
)

//=================================== delivery order router ===================================//
router.put('/:orderId',
    authController.protectedRoute(endPointRoles.DELIVER_ORDER),
    validationMiddleware(validators.paramsOrderValidation),
    orderController.orderDelivered
)

//============================== cancel order router ==============================//
router.put('/cancelOrder/:orderId',
    authController.protectedRoute(endPointRoles.USER_ROLE),
    validationMiddleware(validators.paramsOrderValidation),
    orderController.orderCanceled
)

//=================================== get all delivery order router ===================================//
router.get('/deliveryOrder',
    authController.protectedRoute(endPointRoles.All_ORDER),
    orderController.orderDelivered
)

//=================================== get all order router ===================================//
router.get('/',
    authController.protectedRoute(endPointRoles.All_ORDER),
    orderController.getAllOrder
)

//=================================== get specific order router ===================================//
router.get('/:orderId',
    authController.protectedRoute(endPointRoles.All_ORDER),
    orderController.getSpecificOrder
)

//=================================== pay with stripe router ===================================//
router.post('/pay/:orderId',
    authController.protectedRoute(endPointRoles.USER_ROLE),
    orderController.payWithStripe
)

//=================================== webhook stripe router ===================================//
router.post('/webhook',
    // authController.protectedRoute(endPointRoles.USER_ROLE),
    orderController.stripeWebhook
)

//=================================== webhook stripe router ===================================//
router.post('/refund/:orderId',
    authController.protectedRoute(endPointRoles.All_ORDER),
    orderController.refundOrder
)


export default router;