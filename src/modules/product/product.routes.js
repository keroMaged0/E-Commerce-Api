import { Router } from "express";
import * as productController from './product.controller.js';
import * as productValidation from './product.validation.js';
import * as authController from '../auth/auth.controller.js';
import { multerMiddleHost } from "../../middleware/multer.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { endPointRoles } from "./product.endPoint.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";


const router = Router();


//=================================== Add product router ===================================//
router.post('/',
    authController.protectedRoute(endPointRoles.ADD_product),
    multerMiddleHost(
        { extensions: allowedExtensions.image }
    ).array('Images'),
    validationMiddleware(productValidation.addProductValidation),
    productController.addProduct
)

//=================================== update product router ===================================//
router.put('/:id',
    authController.protectedRoute(endPointRoles.UPDATE_product),
    multerMiddleHost(
        { extensions: allowedExtensions.image }
    ).single('image'),
    validationMiddleware(productValidation.updateProductValidation),
    productController.updateProduct
)

//=================================== delete product router ===================================//
router.delete('/:id',
    authController.protectedRoute(endPointRoles.DELETE_product),
    validationMiddleware(productValidation.productIdParams),
    productController.deleteProduct
)

//=================================== get All product router ===================================//
router.get('/',
    productController.getAllProduct
)

//=================================== get Specific product router ===================================//
router.get('/:id',
    productController.getSpecificProduct
)

export default router;