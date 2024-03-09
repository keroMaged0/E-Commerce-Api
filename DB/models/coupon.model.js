import mongoose from "mongoose";

//============================== Create the coupon schema ==============================//
const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    couponAmount: {
        type: Number,
        required: true,
        min: 1
    },
    couponStatus: {
        type: String,
        default: 'valid',
        enum: ['valid', 'expired']
    },
    isFixed: {
        type: Boolean,
        default: false
    },
    isPercentage: {
        type: Boolean,
        default: false
    },
    fromDate: {
        type: Date,
        required: true,
    },
    toDate: {
        type: Date,
        required: true,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    disabledAt: {
        type: Date
    },
    disabledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    enabledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    enabledAt: {
        type: Date
    }
}, { timestamps: true })

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);