
import subCategoryModel from "../../../DB/models/subCategory.model.js";
import categoryModel from "../../../DB/models/category.model.js";
import brandModel from "../../../DB/models/brand.model.js";
import productModel from "../../../DB/models/product.model.js";

import generateUniqueString from "../../utils/generate-Unique-String.js";
import cloudinaryConnection from "../../utils/cloudinary.js";

import { catchError } from "../../middleware/global-response.middleware.js";
import { appError } from "../../utils/app.Error.js";

import slugify from "slugify";

import { apiFeature } from "../../service/api_feature.js";

//=================================== Add subCategory ===================================// (done)
/*
    * destruct required data 
    * find name if found  
    * generate slug with slugify 
    * generate unique folderId
    * upload image in cloudinary
    * stor data subCategory in object 
    * create subCategory in bd 

*/
const addSubCategory = catchError(
    async (req, res, next) => {
        // destruct required data
        const { name, categoryId } = req.body
        const { _id } = req.user

        // if not send category id in body
        if (!categoryId) return next(new appError('categoryId must be ', 409))

        // check if name exit
        const nameExit = await subCategoryModel.findOne({ name })
        if (nameExit) return next(new appError('name must be unique', 409))

        // generate slug
        const slug = slugify(name)

        // check category 
        const category = await categoryModel.findById(categoryId)
        if (!category) return next(new appError('Category not found', 404))

        // if not send imag
        if (!req.file) return next(new appError('must be send image', 400))

        // generate unique folderId
        const folderId = generateUniqueString(4)

        // generate category path  
        let categoryPath = category.Image.public_id.split(`${category.folderId}`)[0]

        // upload image in cloudinary
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(
            req.file.path,
            {
                folder: categoryPath + `${category.folderId}` + `/subCategories/${folderId}`
            }
        )

        // generate object subCategory
        const subCategoryObj = {
            name,
            slug,
            Image: { secure_url, public_id },
            folderId,
            addedBy: _id,
            categoryId
        }

        // create subCategory in bd
        const subCategory = await subCategoryModel.create(subCategoryObj)
        res.json({ success: true, message: "add subCategory successfully", data: subCategory })
    }
)

//=================================== update subCategory ===================================// (done)
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
const updateSubCategory = catchError(
    async (req, res, next) => {
        // destruct required data
        const { name, oldPublicId, categoryId } = req.body
        const { id } = req.params
        const { _id } = req.user

        // check subCategory 
        const subCategory = await subCategoryModel.findById(id)
        if (!subCategory) return next(new appError('!not found subCategory', 401))

        // // if need update category id
        // if (categoryId) {
        //     if (!oldPublicId) return next(new appError('please send old public id', 401))

        //     const category = await categoryModel.findById(categoryId)
        //     if (!category) return next(new appError('!not found category', 404))

        //     // let categoryPath = category.Image.public_id.split(`${category.folderId}`)[0]
        //     // const imagePath = oldPublicId.split(`${subCategory.folderId}/`)[1]
        //     // let finalPath = categoryPath + `${category.folderId}` + `/subCategories/${subCategory.folderId}` + imagePath


        //     // const { secure_url } = await cloudinaryConnection().uploader.upload(
        //     //     req.oldPublicId,
        //     //     {
        //     //         folder: finalPath,
        //     //     }
        //     // )

        //     // subCategory.Image.secure_url = secure_url

        //     // // path folder in cloudinary
        //     // let folderDelete = categoryPath + `${category.folderId}` + `/subCategories/${subCategory.folderId}`

        //     // // delete folder to cloudinary
        //     // await cloudinaryConnection().api.delete_resources_by_prefix(folderDelete);
        //     // await cloudinaryConnection().api.delete_folder(folderDelete)

        //     subCategory.categoryId = categoryId
        // }

        // if need update name
        if (name) {
            if (name == subCategory.name) return next(new appError('this same name ,please change name and  try agin', 401))

            const isNameDuplicated = await subCategoryModel.findOne({ name })
            if (isNameDuplicated) return next(new appError('this name duplicated ,please change name and  try agin', 401))
            subCategory.name = name
            subCategory.slug = slugify(name)
            console.log(subCategory.name);

        }

        // if need update image
        if (oldPublicId) {
            if (!req.file) return next({ cause: 400, message: 'Image is required' })

            const category = await categoryModel.findById(subCategory.categoryId)
            if (!category) return next(new appError('!not found category', 404))


            const newPublicId = oldPublicId.split(`${subCategory.folderId}/`)[1]
            const { secure_url } = await cloudinaryConnection().uploader.upload(
                req.file.path, {
                folder: `${process.env.MAIN_FOLDER}/categories/${category.folderId}/subCategories/${subCategory.folderId}`,
                public_id: newPublicId
            })


            subCategory.Image.secure_url = secure_url
        }

        subCategory.updatedBy = _id
        await subCategory.save()
        res.status(401).json({ success: true, message: "!subCategory update successfully", subCategory })
    }
)

//=================================== delete subCategory ===================================// (done)
/* 
    * destruct required data  
    * find subCategory and delete by id
    * find category  
    * path folder in cloudinary
    * delete folder to cloudinary
*/
const deleteSubCategory = catchError(
    async (req, res, next) => {
        // destruct required data
        const { _id } = req.user
        const { id } = req.params

        // find subCategory and delete by id 
        let subCategory = await subCategoryModel.findByIdAndDelete(id)
        if (!subCategory) return next(new appError('!not found subCategory', 401))

        // find category  
        const category = await categoryModel.findById(subCategory.categoryId)
        if (!category) return next(new appError('!not found category', 404))

        // find brand and delete
        let brand = await brandModel.deleteMany({ subCategory: id })
        if (!brand) {
            console.log('!not found related brand');
        }

        // find product and delete
        let product = await productModel.deleteMany({ subCategory: id })
        if (!product) {
            console.log('!not found related product');
        }

        let categoryPath = category.Image.public_id.split(`${category.folderId}`)[0]

        // path folder in cloudinary
        let folderDelete = categoryPath + `${category.folderId}/subCategories/${subCategory.folderId}`

        // delete folder to cloudinary
        await cloudinaryConnection().api.delete_resources_by_prefix(folderDelete);
        await cloudinaryConnection().api.delete_folder(folderDelete)


        return res.json({ success: true, message: "delete subCategory successfully" })

    }
)

//=================================== get All subCategory ===================================// (done)
/*
    * find category model
    
*/
const getAllSubCategory = catchError(
    async (req, res, next) => {
        // destruct required data
        const { page, size, sort, ...query } = req.query

        let ApiFeature = new apiFeature(req.query, subCategoryModel.find())
            .pagination() // pagination 
            .sort(sort) //sort
            .search(query) //search
            .filter(query) //filter

        const subCategory = await ApiFeature.mongooseQuery
            .populate([
                { path: 'addedBy', select: 'name', },
                { path: 'updatedBy', select: 'name' },
                { path: 'categoryId' },

                {
                    path: 'Brand',
                    populate: [
                        {
                            path: 'Product'
                        },

                    ]
                }

            ])

        if (!subCategory) return next(new appError('!not found categories', 401))

        res.json({ success: true, message: "successfully", subCategory })
    }
)

//=================================== get specific subCategory ===================================// (done)
/*
    * destruct id to params
*/
const getSpecificSubCategory = catchError(
    async (req, res, next) => {
        // destruct id to params
        const { id } = req.params

        // find category model 
        const subCategory = await subCategoryModel.findById(id)
            .populate([
                { path: 'addedBy', select: 'name', },
                { path: 'updatedBy', select: 'name' },
                { path: 'categoryId' },

                {
                    path: 'Brand',
                    populate: [
                        {
                            path: 'Product'
                        },

                    ]
                }
            ])
        if (!subCategory) return next(new appError('!not found subCategory', 401))

        res.json({ success: true, message: "successfully", subCategory })
    }
)




export {
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getAllSubCategory,
    getSpecificSubCategory
}



