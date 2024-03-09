import { Router } from "express";

import * as authController from '../auth/auth.controller.js';
import * as reviewController from './review.controller.js';
import * as reviewValidation from './review.validation.js';
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { endPointRoles } from "./review.endPoint.js";


const router = Router();


//=================================== Add Review router ===================================//
router.post('/:productId',
    authController.protectedRoute(endPointRoles.ADD_REVIEW),
    validationMiddleware(reviewValidation.addReviewValidation),
    reviewController.addReview
)

//=================================== update Review router ===================================//
router.put('/:productId',
    authController.protectedRoute(endPointRoles.UPDATE_REVIEW),
    validationMiddleware(reviewValidation.updateReviewValidation),
    reviewController.updateReview
)

//=================================== delete Review router ===================================//
router.delete('/:productId',
    authController.protectedRoute(endPointRoles.DELETE_REVIEW),
    validationMiddleware(reviewValidation.ReviewIdParams),
    reviewController.deleteReview
)

//=================================== get All Review router ===================================//
router.get('/',
    authController.protectedRoute(endPointRoles.GET_ALL_REVIEW),
    reviewController.getAllReview
)



export default router; 