import { Router } from "express";
import * as brandController from './brand.controller.js';
import * as brandValidation from './brand.validation.js';
import * as authController from '../auth/auth.controller.js';
import { multerMiddleHost } from "../../middleware/multer.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { endPointRoles } from "./brand.endPoint.js";


const router = Router();


//=================================== Add brand router ===================================//
router.post('/',
    authController.protectedRoute(endPointRoles.ADD_BRAND),
    multerMiddleHost(
        { extensions: allowedExtensions.image }
    ).single('image'),
    validationMiddleware(brandValidation.addBrandValidation),
    brandController.addBrand
)

//=================================== update brand router ===================================//
router.put('/:id',
    authController.protectedRoute(endPointRoles.UPDATE_BRAND),
    multerMiddleHost(
        { extensions: allowedExtensions.image }
    ).single('image'),
    validationMiddleware(brandValidation.updateBrandValidation),
    brandController.updateBrand
)

//=================================== delete brand router ===================================//
router.delete('/:id',
    authController.protectedRoute(endPointRoles.DELETE_BRAND),
    validationMiddleware(brandValidation.brandIdParams),

    brandController.deleteBrand
)

//=================================== get All brand router ===================================//
router.get('/',
    brandController.getAllBrand
)

//=================================== get Specific Brand router ===================================//
router.get('/:id',
    validationMiddleware(brandValidation.brandIdParams),
    brandController.getSpecificBrand
)

export default router;