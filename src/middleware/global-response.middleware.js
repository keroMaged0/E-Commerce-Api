import { appError } from "../utils/app.Error.js";

//=================================== Global response middleware ===================================//
let MODE = 'dev'; // Assuming this is a global variable that determines the mode

export const globalResponse = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err); // If headers are already sent, pass the error to the next middleware
    }

    err.statusCode = err.statusCode || 500;

    if (MODE === 'prod') {
        res.status(err.statusCode).json({ success: false, error: err.message });
        next()
    } else {
        res.status(err.statusCode).json({ success: false, error: err.message, stack: err.stack });
        next()
    }
};

//=================================== catchError controller ===================================//
export function catchError(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(err => {
            next(new appError(err, 500))
        })
    }
}