import mongoose, { Schema, model } from "mongoose";
import { enums } from "../../src/utils/project-enums.js";


//============================== Create the order schema ==============================//
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [{
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
    }],
    shippingAddress: [
        {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true }
        }
    ],
    phoneNumbers: [
        {
            phNumber: { type: String, required: true }
        }
    ],

    shippingPrice: { type: Number, required: true }, // array subtotal
    couponCode: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    totalPrice: { type: Number, required: true }, // shipping price - coupon is exits , not  = shipping price

    paymentMethod: {
        type: String,
        enum: enums.paymentMethod,
        required: true
    },
    orderStatus: {
        type: String,
        enum: enums.orderStatus,
        required: true, default: 'Pending'
    },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: String },

    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: String },
    deliveredBy: { type: Schema.Types.ObjectId, ref: 'User' },

    cancelledAt: { type: String },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },

    payment_intent: String
}, { timestamps: true });




export default mongoose.models.Order || model('Order', orderSchema);