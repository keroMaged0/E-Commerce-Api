import productModel from "../../../../DB/models/product.model.js";
import reviewsModel from "../../../../DB/models/reviews.model.js";

export const updateRateProduct = async (productId) => {

    const product = await productModel.findById(productId)
    const reviews = await reviewsModel.find({ productId })
    console.log(reviews);

    let sumOfRate = 0
    for (const review of reviews) {
        sumOfRate += review.reviewRate
    }
    product.rate = Number(sumOfRate / reviews.length).toFixed(2)

    await product.save()

}