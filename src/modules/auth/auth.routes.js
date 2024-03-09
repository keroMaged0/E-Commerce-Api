import { Router } from "express";

import * as authController from './auth.controller.js';
import * as authValidations from './auth.validation.js';
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { systemRoles } from "../../utils/system_roles.js";
import { endPointRoles } from "./auth.endPoint.js";


const router = Router();


//=================================== SignUp router ===================================//
router.post('/SignUp',
    validationMiddleware(authValidations.SignUpValidations),
    authController.SignUp
)

//=================================== SignIn router ===================================//
router.post('/SignIn',
    validationMiddleware(authValidations.SignInValidations),
    authController.SignIn
)

//=================================== verifyEmail router ===================================//
router.get('/verify/:token',
    authController.verifyEmail
)

export default router;