import mongoose from "mongoose";

//============================== Create the brand schema ==============================//
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true, 'name is required'],
        trim: true,
        required: true,
        minlength: [2, 'too short brand name'],
    },
    slug: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true
    },
    Image: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    },
    folderId: {
        type: String,
        required: true,
        unique: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },  // superAdmin
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, // superAdmin
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true }
})
 
brandSchema.virtual('Product',
    {
        ref: "Product",
        localField: "_id",
        foreignField: "brandId"
    })

export default mongoose.models.brand || mongoose.model('Brand', brandSchema)