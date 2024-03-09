import mongoose, { Schema, model } from "mongoose";

//============================== Create the subcategory schema ==============================//
const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true, 'name is required'],
        trim: true,
        required: true,
        minlength: [2, 'too short subCategory name'],
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
    }


}, {
    timestamps: true,
    toJSON: { virtuals: true }
})

subCategorySchema.virtual('Brand',
    {
        ref: 'Brand',
        localField: '_id',
        foreignField: 'subCategoryId'
    }
)



export default mongoose.models.SubCategory || mongoose.model('SubCategory', subCategorySchema)