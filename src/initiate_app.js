// to catch error
process.on('uncaughtException', ((err) =>
    console.log('error', err)
))

import * as routers from "./modules/index.routes.js"

import { globalResponse } from "./middleware/global-response.middleware.js"
import { appError } from "./utils/app.Error.js"
import { rollbackMiddleware } from "./middleware/rollback_upload_file.middleware copy.js"
import { rollbackDocumentMiddleware } from "./middleware/rollback_documents.middleware.js"
import { cronToChangeExpiredCoupons } from "./utils/crons.js"
import { gracefulShutdown } from "node-schedule"

export const initiateApp = (app, express) => {

    app.use(express.json())

    // router api
    app.use('/E-commerce/auth', routers.authRouter)
    app.use('/E-commerce/user', routers.userRouter)
    app.use('/E-commerce/category', routers.categoryRouter)
    app.use('/E-commerce/subcategory', routers.subCategoryRouter)
    app.use('/E-commerce/brand', routers.brandRouter)
    app.use('/E-commerce/product', routers.productRouter)
    app.use('/E-commerce/cart', routers.cartRouter)
    app.use('/E-commerce/coupon', routers.couponRouter)
    app.use('/E-commerce/order', routers.orderRouter)
    app.use('/E-commerce/review', routers.reviewRouter)
    // !not found end point
    app.use('*', (req, res, next) => {
        // next(new appError(`not found end point: ${req.originalUrl}`, 404))
        res.json({ message: "message not found " })
    })

    cronToChangeExpiredCoupons()
    gracefulShutdown()



    // global Error
    app.use(globalResponse, rollbackMiddleware, rollbackDocumentMiddleware)

    // to catch error
    process.on('unhandledRejection', (err =>
        console.log('error', err)
    ))

}