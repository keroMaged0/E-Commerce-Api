import { catchError } from "../../middleware/global-response.middleware.js";
import { appError } from "../../utils/app.Error.js";

import slugify from "slugify";

import { apiFeature } from "../../service/api_feature.js";
import productModel from "../../../DB/models/product.model.js";
import orderModel from "../../../DB/models/order.model.js";
import reviewsModel from "../../../DB/models/reviews.model.js";
import { updateRateProduct } from "./utils/update_rate_product.js";


//=================================== Add Review Controller ===================================//
/*
    * destruct required data
    * product in order check
    * check if user added review already to same product
    * add review in db  
    * update review rating in product 
*/
const addReview = catchError(
    async (req, res, next) => {
        // destruct required data
        const { productId } = req.params
        const { _id } = req.user
        const { reviewRate, reviewComment } = req.body

        // check product found
        const orderProduct = await orderModel.findOne({
            user: _id,
            'orderItems.product': productId,
        })
        if (!orderProduct) return next(new appError('not can add review by first and add review', 400))

        // check review 
        const getReview = await reviewsModel.findOne({
            userId: _id,
            productId
        })
        if (getReview) return next(new appError('already review this product', 400))

        // add review in database
        const addReview = new reviewsModel({
            reviewRate,
            reviewComment,
            userId: _id,
            productId,
        })

        if (!addReview) return next(new appError('fail to add review', 500))
        await addReview.save()

        // update rate product 
        updateRateProduct(productId)

        res.json({ success: true, message: "add review successfully", data: addReview })
    }
)

//=================================== update Review Controller ===================================//
/*
    * destruct required data
    * check review
    * update review in database
    * update rating product

*/
const updateReview = catchError(
    async (req, res, next) => {
        // destruct required data
        const { productId } = req.params
        const { _id } = req.user
        const { reviewRate, reviewComment } = req.body

        // check review 
        const review = await reviewsModel.findOne({
            userId: _id,
            productId
        })
        if (!review) return next(new appError('not authorized', 400))

        // update review in database
        if (review.reviewRate) review.reviewRate = reviewRate
        if (review.reviewComment) review.reviewComment = reviewComment

        await review.save()

        // update rate product 
        updateRateProduct(productId)

        res.json({ success: true, message: "add review successfully", data: review })
    }
)

//=================================== delete Review Controller ===================================//
/*
    * destruct required data
    * check review and delete review
    * update rate product
*/
const deleteReview = catchError(
    async (req, res, next) => {
        // destruct required data
        const { productId } = req.params
        const { _id } = req.user

        // check review and delete 
        const review = await reviewsModel.findOneAndDelete({
            userId: _id,
            productId
        })
        if (!review) return next(new appError('not authorized', 400))

        // update rate product
        updateRateProduct(productId)

        res.json({ success: true, message: "deleted review successfully", data: review })
    }
)

//=================================== get All Review Controller ===================================//
/*

*/
const getAllReview = catchError(
    async (req, res, next) => {

        // check review 
        const reviews = await reviewsModel.find()
        if (!reviews) return next(new appError('not found reviews', 400))

        res.json({ success: true, message: "add review successfully", data: reviews })
    }
)

export {
    addReview,
    updateReview,
    deleteReview,
    getAllReview
}



