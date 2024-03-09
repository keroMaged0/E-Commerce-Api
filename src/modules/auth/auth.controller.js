import userModel from "../../../DB/models/user.model.js";
import { catchError } from "../../middleware/global-response.middleware.js";
import { sendEmail } from "../../service/Email/sendEmail.js";
import { appError } from "../../utils/app.Error.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//=================================== SignUp controller ===================================//   (done)
/*
    * destruct data to body
    * check unique email 
    * verify email
    * create user object
    * save user object in database
*/
const SignUp = catchError(
    async (req, res, next) => {
        // destruct data to body
        const { name, email, password, phonNumbers, age, address, role } = req.body

        // check unique email
        const userExist = await userModel.findOne({ email })
        if (userExist) return next(new appError(' email already exit Please try another email ', 404))

        // verify email
        sendEmail(email)

        // create user object
        const user = new userModel(
            { name, email, password, phonNumbers, age, address, role }
        )

        // save user in db
        await user.save()

        res.json({ success: true, message: "user SignUp successfully", data: user })
    }
)

//=================================== SignIn controller ===================================// (done)
/*
    * destruct data to body
    * find if found user by email
    * check is valid email password
    * create token
    * change loggedIn true in db
*/
const SignIn = catchError(
    async (req, res, next) => {
        // destruct data to body
        const { email, password } = req.body

        // check if user exists and verify email
        let user = await userModel.findOne({ email })
        if (!user) return next(new appError('!not found user', 404))
        if (!user.EmailVerified) return next(new appError('please verify your email and tray again', 404))
        if (user.isDeleted) return next(new appError('user not found ', 404))

        // if found id and password in body match password in user token
        if (user && bcrypt.compareSync(password, user.password)) {

            // create token
            let token = jwt.sign({ userId: user._id, password, role: user.role, email, loggedIn: true }, process.env.LOGIN_SIGNATURE)

            // change loggedIn true in db
            await userModel.findByIdAndUpdate(user._id, {
                loggedIn: true
            }, { new: true })

            return res.status(200).json({ success: true, message: "SingIn successfully", data: token })
        }
        res.status(401).json({ success: false, message: "!not valid email or password pleas try again" })
    }
)

//=================================== verifyEmail controller ===================================// (done)
/*
    * destruct data from query
    * decode token
    * find by email
    * find user and update 
*/
const verifyEmail = catchError(
    async (req, res, next) => {
        // destruct data from query
        const { token } = req.params

        // decode token and check
        jwt.verify(token, process.env.JWT_SECRET_LOGIN, async (err, decoded) => {

            if (err) return next(new appError(err, 400))

            // find user model and update
            await userModel.findOneAndUpdate({
                email: decoded.email, EmailVerified: false
            }, { EmailVerified: true }, { new: true })

            res.json({ success: true, message: "Email verified successfully, please try to login" })
        })

    }
)

//=================================== protected route controller ===================================// (done)
/*
    * destruct token from header
    * verify token
    * find by userId
    * if change password 
    * store in req.user user
*/
const protectedRoute = (accessRoles) => catchError(
    async (req, res, next) => {
        // destruct token to header
        const { token } = req.headers
        if (!token) return next(new appError('!not found token', 401))

        // verify token
        const decoded = jwt.verify(token, process.env.LOGIN_SIGNATURE)
        if (!decoded) return next(new appError('!error in token', 401))

        // find user by id to token
        const user = await userModel.findById(decoded.userId)
        if (!user) return next(new appError('!not found user', 401))

        // authorization
        if (!accessRoles.includes(user.role)) return next(new appError('unauthorized', 401));

        // if change password
        if (user?.changePasswordTime) {
            let time = parseInt(user?.changePasswordTime.getTime() / 1000)
            if (time > decoded.iat) return next(new appError('!this user not authorization ', 401))
        }

        // store in req.user user
        req.user = user
        next()
    }
)

export {
    SignUp,
    SignIn,
    verifyEmail,
    protectedRoute
}