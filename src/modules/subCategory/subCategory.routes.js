import { Router } from "express";

import * as subCategoryController from './subCategory.controller.js';
import * as subCategoryValidation from './subCategory.validation.js';
import * as authController from '../auth/auth.controller.js';

import { multerMiddleHost } from "../../middleware/multer.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { endPointRoles } from "./subCategory.endPoint.js";


const router = Router();


//=================================== Add subCategory router ===================================//
router.post('/',
    authController.protectedRoute(endPointRoles.ADD_SUBCATEGORY),
    multerMiddleHost(
        { extensions: allowedExtensions.image }
    ).single('image'),
    validationMiddleware(subCategoryValidation.addSubCategoryValidation),
    subCategoryController.addSubCategory)

//=================================== update subCategory router ===================================//
router.put('/:id',
    authController.protectedRoute(endPointRoles.UPDATE_SUBCATEGORY),
    multerMiddleHost(
        { extensions: allowedExtensions.image }
    ).single('img'),
    validationMiddleware(subCategoryValidation.updateSubCategoryValidation),
    subCategoryController.updateSubCategory)

//=================================== delete subCategory router ===================================//
router.delete('/:id',
    authController.protectedRoute(endPointRoles.DELETE_SUBCATEGORY),
    validationMiddleware(subCategoryValidation.subCategoryIdParams),
    subCategoryController.deleteSubCategory
)

//=================================== get All subCategory router ===================================//
router.get('/',
    subCategoryController.getAllSubCategory
)

//===================================  get specific subCategory router ===================================//
router.get('/:id',
    validationMiddleware(subCategoryValidation.subCategoryIdParams),
    subCategoryController.getSpecificSubCategory
)



export default router;