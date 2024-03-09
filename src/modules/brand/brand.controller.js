
import generateUniqueString from "../../utils/generate-Unique-String.js";
import cloudinaryConnection from "../../utils/cloudinary.js";

import { catchError } from "../../middleware/global-response.middleware.js";
import { appError } from "../../utils/app.Error.js";

import slugify from "slugify";

import brandModel from "../../../DB/models/brand.model.js";
import subCategoryModel from "../../../DB/models/subCategory.model.js";
import productModel from "../../../DB/models/product.model.js";
import { apiFeature } from "../../service/api_feature.js";


//=================================== Add brand ===================================// (done)
/*
    * destruct required data 
    * find name if found  
    * generate slug with slugify 
    * check if send image
    * check if found category
    * check if found subCategory
    * generate unique folderId
    * upload image in cloudinary
    * store data brand in object 
    * create brand in bd 

*/
const addBrand = catchError(
    async (req, res, next) => {
        // destruct required data
        const { name, categoryId, subCategoryId } = req.body
        const { _id } = req.user

        // check unique name 
        const nameExit = await brandModel.findOne({ name })
        if (nameExit) return next(new appError('name must be unique', 409))

        // generate slug
        const slug = slugify(name)

        // if not found category id
        if (!categoryId) return next(new appError('categoryId must be ', 409))

        // if not found subCategory id
        if (!subCategoryId) return next(new appError('subCategoryId must be ', 409))

        // if not found image 
        if (!req.file) return next(new appError('must be send image', 400))

        // check if found subCategory
        const subCategory = await subCategoryModel.findById(subCategoryId)
        if (!subCategory) return next({ cause: 404, message: 'subCategory not found' })

        // unique folderId
        const folderId = generateUniqueString(4)

        // generate category path  
        let subCategoryPath = subCategory.Image.public_id.split(`${subCategory.folderId}`)[0]

        // upload image from cloudinary
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(
            req.file.path,
            {
                folder: subCategoryPath + `${subCategory.folderId}/brand/${folderId}`
            }
        )

        const subBrandObj = {
            name,
            slug,
            Image: { secure_url, public_id },
            folderId,
            addedBy: _id,
            categoryId,
            subCategoryId,
        }

        const brand = await brandModel.create(subBrandObj)
        res.json({ success: true, message: "add brand successfully", data: brand })
    }
)

//=================================== update brand ===================================// (done)
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
const updateBrand = catchError(
    async (req, res, next) => {
        // destruct required data
        const { name, oldPublicId, categoryId, subCategoryId } = req.body
        const { id } = req.params
        const { _id } = req.user

        // find in brand model
        const brand = await brandModel.findById(id)
        if (!brand) return next(new appError('!not found brand', 401))

        // // if need change in categoryId
        // if (categoryId) {
        //     if (!categoryId) return next(new appError('!not found categoryId ', 401))

        //     const category = await categoryModel.findById(categoryId)
        //     if (!category) return next(new appError('!not found category', 404))


        //     brand.categoryId = categoryId
        // }

        // // if need change in categoryId
        // if (subCategoryId) {
        //     if (!subCategoryId) return next(new appError('!not found subCategoryId ', 401))

        //     const subcategory = await subCategoryModel.findById(subCategoryId)
        //     if (!subcategory) return next(new appError('!not found subcategory', 404))

        //     brand.subCategoryId = subCategoryId
        // }

        // if need change in name
        if (name) {
            if (name == brand.name) return next(new appError('this same name ,please change name and  try agin', 401))

            const isNameDuplicated = await brandModel.findOne({ name })
            if (isNameDuplicated) return next(new appError('this name duplicated ,please change name and  try agin', 401))
            brand.name = name
            brand.slug = slugify(name)
        }

        // if need update image
        if (oldPublicId) {
            if (!req.file) return next({ cause: 400, message: 'Image is required' })

            const subCategory = await subCategoryModel.findById(brand.subCategoryId)
            if (!subCategory) return next(new appError('!not found subCategory', 404))
            if (!subCategory.categoryId) return next(new appError('!not found subCategory', 404))


            // generate subCategory path  
            let subCategoryPath = subCategory.Image.public_id.split(`${subCategory.folderId}`)[0]
            const newPublicId = oldPublicId.split(`${brand.folderId}/`)[1]

            const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
                folder: subCategoryPath + `${subCategory.folderId}/brand/${brand.folderId}`,
                public_id: newPublicId
            })

            brand.Image.secure_url = secure_url
        }

        brand.updatedBy = _id
        await brand.save()
        res.status(401).json({ success: true, message: "!brand update successfully", brand })
    }
)

//=================================== delete brand ===================================// (done)
/* 
    * destruct required data  
    * find subCategory and delete by id
    * find category  
    * path folder in cloudinary
    * delete folder to cloudinary
*/
const deleteBrand = catchError(
    async (req, res, next) => {
        // destruct required data
        const { _id } = req.user
        const { id } = req.params

        // find brand and delete by id 
        let brand = await brandModel.findByIdAndDelete(id)
        if (!brand) return next(new appError('!not found brand', 401))

        if (!brand.categoryId) return next(new appError('!not found category', 404))

        if (!brand.subCategoryId) return next(new appError('!not found subCategory', 404))

        // find product and delete
        let product = await productModel.deleteMany({ subCategory: id })
        if (!product) {
            console.log('!not found related product');
        }

        // path folder in cloudinary
        let folderDelete = brand.Image.public_id.split(`${brand.folderId}`)[0] + `${brand.folderId}`

        // delete folder to cloudinary
        await cloudinaryConnection().api.delete_resources_by_prefix(folderDelete);
        await cloudinaryConnection().api.delete_folder(folderDelete)


        return res.json({ success: true, message: "delete brand successfully" })

    }
)

//=================================== get All brand ===================================// (done)
/*
    * find category model

*/
const getAllBrand = catchError(
    async (req, res, next) => {

        // destruct required data
        const { page, size, sort, ...query } = req.query

        let ApiFeature = new apiFeature(req.query, brandModel.find())
            .pagination() // pagination 
            .sort(sort) //sort
            .search(query) //search
            .filter(query) //filter


        const brand = await ApiFeature.mongooseQuery
            .populate([
                { path: 'addedBy', select: 'name' },
                { path: 'updatedBy', select: 'name' },
                { path: 'categoryId' },
                { path: 'subCategoryId' },
                {
                    path: 'Product',
                    populate:
                    {
                        path: 'Product'
                    },
                }
            ])
        if (!brand) return next(new appError('!not found brand', 401))

        res.json({ success: true, message: "successfully", brand })
    }
)
//=================================== get Specific Brand ===================================// (done)
/*
    * find category model

*/
const getSpecificBrand = catchError(
    async (req, res, next) => {
        // destruct required data  
        const { id } = req.params
        const brand = await brandModel.findOne({ _id: id })
            .populate([
                { path: 'addedBy', select: 'name' },
                { path: 'updatedBy', select: 'name' },
                { path: 'categoryId' },
                { path: 'subCategoryId' },
                {
                    path: 'Product',
                    populate: [
                        {
                            path: 'Product'
                        },

                    ]
                }
            ])
        if (!brand) return next(new appError('!not found brand', 401))

        res.json({ success: true, message: "successfully", brand })
    }
)



export {
    addBrand,
    updateBrand,
    deleteBrand,
    getAllBrand,
    getSpecificBrand
}



