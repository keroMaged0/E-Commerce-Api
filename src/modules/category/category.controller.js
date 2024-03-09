import categoryModel from "../../../DB/models/category.model.js";
import subCategoryModel from "../../../DB/models/subCategory.model.js";
import brandModel from "../../../DB/models/brand.model.js";
import productModel from "../../../DB/models/product.model.js";

import generateUniqueString from "../../utils/generate-Unique-String.js";
import cloudinaryConnection from "../../utils/cloudinary.js";

import { catchError } from "../../middleware/global-response.middleware.js";
import { appError } from "../../utils/app.Error.js";

import slugify from "slugify";
import { apiFeature } from "../../service/api_feature.js";


//=================================== Add category ===================================// (done)
/*
    * destruct required data 
    * find name if found  
    * generate slug with slugify 
    * generate unique folderId
    * upload image in cloudinary
    * stor data category in object 
    * create category in bd 

*/
const addCategory = catchError(
    async (req, res, next) => {
        // destruct required data
        const { name } = req.body
        const { _id } = req.user

        console.log(name);
        // if name already exit
        const nameExit = await categoryModel.findOne({ name })
        if (nameExit) return next(new appError('name must be unique', 409))

        // generate slug
        const slug = slugify(name)

        // if not found file in body
        if (!req.file) return next(new appError('must be send image', 400))

        // uniq folder id
        const folderId = generateUniqueString(4)

        // upload image in cloudinary
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(
            req.file.path,
            {
                folder: `${process.env.MAIN_FOLDER}/categories/${folderId}`
            }
        )

        req.folder = `${process.env.MAIN_FOLDER}/categories/${folderId}`

        // create object category
        const categoryObj = {
            name,
            slug,
            Image: { secure_url, public_id },
            folderId,
            addedBy: _id
        }

        // create category in bd
        const category = await categoryModel.create(categoryObj)

        // req.documents = { model: categoryModel, modelId: category._id }
        res.json({ success: true, message: "add category successfully", data: category })
    }
)

//=================================== update category ===================================// (done)
/*
    * destruct required data  
    * find category addBy id category
    * if send name in body
    * if name same old name 
    * if name duplicated
    * change category name to new name
    * change category slug to new name
    * check if user update image
    * check send image
    * get publicId from oldPublicId by split
    * save public_id from oldPublicId to newPublicId
    * convert old secure_url from new secure_url
    * save addBy
*/
const updateCategory = catchError(
    async (req, res, next) => {
        // destruct required data
        const { name, oldPublicId } = req.body
        const { id } = req.params
        const { _id } = req.user

        // check if found category
        const category = await categoryModel.findById(id)
        if (!category) return next(new appError('!not found category', 401))

        // if update name
        if (name) {
            // if name already exit
            if (name == category.name) return next(new appError('this same name ,please change name and  try agin', 401))

            // if name duplicated
            const isNameDuplicated = await categoryModel.findOne({ name })
            if (isNameDuplicated) return next(new appError('this name duplicated ,please change name and  try agin', 401))

            category.name = name
            category.slug = slugify(name)
        }

        // if update image
        if (oldPublicId) {
            // if not found file in body
            if (!req.file) return next({ cause: 400, message: 'Image is required' })

            // get publicId from oldPublicId by split
            const newPublicId = oldPublicId.split(`${category.folderId}/`)[1]

            // upload new image
            const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
                folder: `${process.env.MAIN_FOLDER}/categories/${category.folderId}`,
                public_id: newPublicId
            })

            // update url image with new in db
            category.Image.secure_url = secure_url
        }

        // save updatedBy
        category.updatedBy = _id
        await category.save()
        res.status(401).json({ success: false, message: "!not valid email or password pleas try again", category })
    }
)

//=================================== delete category ===================================// (done)
/* 
    * destruct required data  
    * find in category model and deleted
    * delete subCategory related category
    * delete brand related category
    * delete product related category
    * delete image to cloudinary 
    * 
*/
const deleteCategory = catchError(
    async (req, res, next) => {
        const { _id } = req.user
        const { id } = req.params

        //find category model and delete  
        let category = await categoryModel.findByIdAndDelete(id)
        if (!category) return next(new appError('!not found category', 401))

        // find subCategory and delete
        let subCategory = await subCategoryModel.deleteMany({ categoryId: id })
        if (!subCategory) {
            console.log('!not found related subCategory');
        }

        // find brand and delete
        let brand = await brandModel.deleteMany({ categoryId: id })
        if (!brand) {
            console.log('!not found related brand');
        }

        // find product and delete
        let product = await productModel.deleteMany({ categoryId: id })
        if (!product) {
            console.log('!not found related product');
        }

        // path folder in cloudinary
        let folderDelete = `${process.env.MAIN_FOLDER}/categories/${category.folderId}`

        // delete folder from cloudinary
        await cloudinaryConnection().api.delete_resources_by_prefix(folderDelete)
        await cloudinaryConnection().api.delete_folder(folderDelete)


        return res.json({ success: true, message: "delete category successfully" })


    }
)

//=================================== get All category ===================================// (done)
/*
    * find category model
    * use Feature API to get category
*/
const getAllCategory = catchError(
    async (req, res, next) => {
        // destruct required data
        const { page, size, sort, ...query } = req.query
        // find category model 
        const ApiFeature = new apiFeature(req.query, categoryModel.find())
            .pagination() // pagination 
            .sort(sort) //sort
        .search(query) //search
        .filter(query) //filter


        const categories = await ApiFeature.mongooseQuery
            .populate([
                {
                    path: 'subCategory',
                    populate:
                    {
                        path: 'Brand',
                        populate: {
                            path: 'Product'
                        }
                    }

                },
                { path: 'addedBy', select: 'name' }
            ])


        if (!categories) return next(new appError('!not found categories', 401))

        res.json({ success: true, message: "successfully", categories })
    }
)

//=================================== get specific category ===================================// (done)
/*
    * destruct id to params
*/
const getSpecificCategory = catchError(
    async (req, res, next) => {
        // destruct id to params
        const { id } = req.params

        // find category model 
        const category = await categoryModel.findById(id)
            .populate([
                {
                    path: 'subCategory',
                    populate:
                    {
                        path: 'Brand',
                        populate: {
                            path: 'Product'
                        }
                    }
                }
            ])
        console.log(category);
        if (!category) return next(new appError('!not found category', 401))

        res.json({ success: true, message: "successfully", category })
    }
)


export {
    addCategory,
    updateCategory,
    deleteCategory,
    getAllCategory,
    getSpecificCategory
}