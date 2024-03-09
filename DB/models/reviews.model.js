import mongoose from "mongoose";


const schemaModel = mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    },
    reviewRate: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    reviewComment: {
        type: String,
        trim: true,
        minlength: [2, 'too short reviews comment'],
    },

}, { timestamps: true })

schemaModel.pre('find', function () {
    this.populate('userId')
    this.populate('productId')
})

export default mongoose.models.Review || mongoose.model('Reviews', schemaModel)