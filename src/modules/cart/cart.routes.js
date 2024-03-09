import { Router } from "express";

import * as cartController from './cart.controller.js';
import * as authController from '../auth/auth.controller.js';
import * as orderValidation from './cart.validation.js';
import { endPointRoles } from "./cart.endPoint.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";

const router = Router();

//=================================== Add to cart router ===================================//
router.post('/',
    authController.protectedRoute(endPointRoles.ADD_CART),
    validationMiddleware(orderValidation.addCartValidation),
    cartController.addToCart
)

//=================================== remove product from cart router ===================================//
router.put('/:productId',
    authController.protectedRoute(endPointRoles.REMOVE_PRODUCT_CART),
    validationMiddleware(orderValidation.removeProductCartValidation),
    cartController.removeFromCart
)


export default router;