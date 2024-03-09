import { Router } from "express";

import * as authController from '../auth/auth.controller.js'
import * as userValidation from './user.validation.js'

import userController from './user.controller.js';
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { endPointRoles } from "./user.endPoint.js";

const router = Router();

//=================================== Get User Profile Data router ===================================//
router.get('/',
    authController.protectedRoute(endPointRoles.GET_USER_PROFILE_DATA),
    userController.getUserProfile
)

//=================================== Get All User Profile Data router ===================================//
router.get('/allUsers',
    authController.protectedRoute(endPointRoles.GET_ALL_USER),
    userController.getAllUserProfile
)

//=================================== Get All Deleted User router ===================================//
router.get('/AllDeletedUser',
    authController.protectedRoute(endPointRoles.GET_ALL_USER_DELETED),
    userController.getAllDeletedUser
)

//=================================== update User Data router ===================================//
router.put('/',
    authController.protectedRoute(endPointRoles.UPDATE_USER_PROFILE_DATA),
    validationMiddleware(userValidation.updateUserValidation),
    userController.updateUserData
)

//=================================== changePassword router ===================================//
router.put('/changePassword',
    authController.protectedRoute(endPointRoles.CHANGE_PASSWORD),
    validationMiddleware(userValidation.changePasswordValidation),
    userController.changePassword
)

//=================================== delete User Account router ===================================//
router.put('/:id',
    authController.protectedRoute(endPointRoles.DELETE_USER_ACCOUNT),
    validationMiddleware(userValidation.deleteUserValidation),
    userController.deleteUserAccount
)

//=================================== Forget Password Router  ===================================//
router.post('/forgetPassword',
    authController.protectedRoute(endPointRoles.FORGET_PASSWORD),
    validationMiddleware(userValidation.forgetPasswordValidation),
    userController.forgetPassword
)

//=================================== Password Reset router ===================================//
router.get('/resetPassword/:token',
    authController.protectedRoute(endPointRoles.FORGET_PASSWORD),
    validationMiddleware(userValidation.resetPasswordValidation),
    userController.resetPassword
)









export default router;