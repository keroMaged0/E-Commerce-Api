import mongoose, { Schema, model } from "mongoose";


const productSchema = new Schema({
    /** String */
    title: {
        type: String,
        trim: true,
        required: true,
        minlength: [2, 'too short product name'],
        maxlength: [200, 'too short product name'],
    },
    slug: {
        type: String,
        lowercase: true,
        // required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
        minlength: [10, 'too short product name'],
        maxlength: [500, 'too short product name'],
    },
    folderId: {
        type: String,
        required: true,
        unique: true
    },


    /** Number */
    basePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        min: 0,
        default: 0
    },
    appliedPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    stock: {
        type: Number,
        min: 0,
        default: 0
    },
    rate: {
        type: Number,
        min: 0,
        min: 1,
        max: 5,
        default: 1,
    },


    /** Objects(Map)*/
    specs: {
        type: Map,
        of: [String | Number]
    },


    /** Arrays */
    Images: [{
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    }],


    /** ObjectIds */
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },

 
}, { timestamps: true })


// productSchema.pre('find', function () {
//     this.populate('category')
//     this.populate('brand')
//     this.populate('subCategory')
// })
export default mongoose.models.Product || model('Product', productSchema)