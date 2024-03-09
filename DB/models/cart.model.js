import mongoose, { Schema } from "mongoose";

//============================== Create the cart schema ==============================//
const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        basePrice: {
            type: Number,
            required: true,
            default: 0
        },
        finalPrice: {  //basePrice * quantity
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    }],
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },
    totalPriceAfterDiscount: Number,
    discountCode: Number

}, { timestamps: true })



export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);