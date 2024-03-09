
import generateUniqueString from "../../utils/generate-Unique-String.js";
import cloudinaryConnection from "../../utils/cloudinary.js";

import { catchError } from "../../middleware/global-response.middleware.js";
import { appError } from "../../utils/app.Error.js";

import slugify from "slugify";

import brandModel from "../../../DB/models/brand.model.js";
import productModel from "../../../DB/models/product.model.js";

import { apiFeature } from "../../service/api_feature.js";



//=================================== Add product ===================================//
/*
    * destruct required data
    * check if found brand
    * check if found category 
    * check if found subCategory
    * check if user allowedTo
    * check unique title
    * generate slug
    * loop images 
    * upload image in cloudinary
    * store data product in object 
    * create product in bd 

*/
const addProduct = catchError(
    async (req, res, next) => {
        // destruct required data
        const { title, description, basePrice, discount, stock, rate, specs } = req.body
        const { brandId, categoryId, subCategoryId } = req.query
        const { _id } = req.user

        // generate slug
        const slug = slugify(title)

        // check if found brand
        const brand = await brandModel.findById(brandId)
        if (!brand) return next({ cause: 404, message: 'brand not found' })

        // check if found category
        if (brand.categoryId.toString() !== categoryId) return next({ cause: 404, message: 'Category not found' })

        // check if found subCategory
        if (brand.subCategoryId.toString() !== subCategoryId) return next({ cause: 404, message: 'subCategory not found' })

        // check if user allowedTo
        if (brand.addedBy.toString() !== _id.toString()) return next({ cause: 404, message: 'you are not allowedTo' })

        // generate appliedPrice
        const appliedPrice = basePrice - (basePrice * (discount || 0) / 100)

        // if not found image 
        if (!req.files?.length) return next(new appError('must be send image', 400))

        let Images = []

        // unique folderId
        const folderId = generateUniqueString(4)

        // loop images 
        for (const file of req.files) {
            // upload image from cloudinary
            const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(
                file.path,
                {
                    folder: brand.Image.public_id.split(`${brand.folderId}/`)[0] + `${brand.folderId}` + `/product/${folderId}`
                })
            Images.push({ secure_url, public_id })
        }

        // if error rollback upload file 
        req.folder = brand.Image.public_id.split(`${brand.folderId}/`)[0] + `${process.env.MAIN_FOLDER}` + `/product/${folderId}`


        const productObj = {
            title,
            slug,
            description,
            basePrice,
            appliedPrice,
            discount,
            stock,
            rate,
            specs,
            Images,
            folderId,
            addedBy: _id,
            categoryId,
            subCategoryId,
            brandId
        }

        const newProduct = await productModel.create(productObj)

        // if error rollback document to remove to db 
        req.document = { model: productModel, modelId: newProduct._id }
        res.json({ success: true, message: "add brand successfully", data: newProduct })
    }
)


//=================================== update product ===================================//
/*
    * destruct required data  
    * find product 
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
const updateProduct = catchError(
    async (req, res, next) => {
        // destruct required data
        const { title, description, basePrice, discount, stock, rate, specs, oldPublicId } = req.body
        const { id } = req.params
        const { _id } = req.user

        // find in brand model
        const product = await productModel.findById(id)
        if (!product) return next(new appError('!not found product', 401))

        // check if user allowedTo
        if (product.addedBy.toString() !== _id.toString()) return next({ cause: 404, message: 'you are not allowedTo' })

        // if need change in title
        if (title) {
            // if title same old
            if (title == product.title) return next(new appError('this same old title ,please change title and  try agin', 401))

            // if title duplicated
            const isTitleDuplicated = await productModel.findOne({ title })
            if (isTitleDuplicated) return next(new appError('this title duplicated ,please change title and  try agin', 401))

            // change old title from new title
            product.title = title
            product.slug = slugify(title)
        }

        // if need change in description
        if (description) product.description = description

        // if need change in stock
        if (stock) product.stock = stock

        // if need change in rate
        if (rate) product.rate = rate

        // if need change in specs
        if (specs) product.specs = JSON.parse(specs)

        if (basePrice) product.basePrice = basePrice
        if (discount) product.discount = discount


        // if need change in basePrice or discount
        const appliedPrice = (basePrice || product.basePrice) - ((basePrice || product.basePrice) * ((discount || product.discount) / 100))
        product.appliedPrice = appliedPrice



        // if need update image
        if (oldPublicId) {
            if (!req.file) return next({ cause: 400, message: 'Image is required' })

            const endFolder = oldPublicId.split(`${product.folderId}/`)[1]
            const startFolder = oldPublicId.split(`${product.folderId}/`)[0]

            const newPublicId = startFolder + `${product.folderId}/` + endFolder

            const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {

                public_id: newPublicId
            })

            product.Images.map(img => {
                if (img.public_id == oldPublicId) img.secure_url = secure_url
            })
            console.log("{ secure_url ,public_id}  : ", { secure_url, public_id });
        }

        product.updatedBy = _id
        await product.save()

        res.status(401).json({ success: true, message: "product update successfully", product })
    }
)

//=================================== delete product ===================================//
/* 
    * destruct required data  
    * find product and delete by id 
    * check if user allowedTo  
    * loop Images find public_id
    * path folder in cloudinary
    * delete folder to cloudinary
*/
const deleteProduct = catchError(
    async (req, res, next) => {
        // destruct required data
        const { _id } = req.user
        const { id } = req.params

        // find product and delete by id 
        let product = await productModel.findByIdAndDelete(id)
        if (!product) return next(new appError('!not found product', 401))

        // check if user allowedTo
        if (product.addedBy.toString() !== _id.toString()) return next({ cause: 404, message: 'you are not allowedTo' })

        // loop Images find public_id
        const srcFolderId = product.Images.map(img => {
            let image = img.public_id
            return image
        })

        // split before product
        let startUrl = srcFolderId[1].split('/product/')[0]

        // split before product
        let endUrl = srcFolderId[1].split('/product/')[1].split('/')[0]

        // folder path delete
        const folderDelete = startUrl + "/product/" + endUrl

        // delete folder to cloudinary
        await cloudinaryConnection().api.delete_resources_by_prefix(folderDelete);
        await cloudinaryConnection().api.delete_folder(folderDelete)


        return res.json({ success: true, message: "delete product successfully" })

    }
)

//=================================== get All product ===================================//
/*
    * find product model

*/
const getAllProduct = catchError(
    async (req, res, next) => {
        const { page, size, sort, ...query } = req.query

        const ApiFeature = new apiFeature(req.query, productModel.find())
            .pagination()
            .sort()
            .search(query)
            .filter(query)

        const product = await ApiFeature.mongooseQuery
            .populate([
                { path: 'addedBy', select: 'name' },
                { path: 'updatedBy', select: 'name' },
                { path: 'brandId' },
                { path: 'categoryId' },
                { path: 'subCategoryId' },
            ])
        if (!product) return next(new appError('!not found product', 401))

        res.json({ success: true, message: "successfully", product })
    }
)

//=================================== get Specific product ===================================//
/*
    * find product model

*/
const getSpecificProduct = catchError(
    async (req, res, next) => {
        // destruct required data  
        const { id } = req.params

        const brand = await productModel.findOne({ _id: id })
            .populate([
                { path: 'addedBy', select: 'name' },
                { path: 'updatedBy', select: 'name' },
                { path: 'brandId' },
                { path: 'categoryId' },
                { path: 'subCategoryId' },
            ])
        if (!brand) return next(new appError('!not found brand', 401))

        res.json({ success: true, message: "successfully", brand })
    }
)



export {
    addProduct,
    updateProduct,
    deleteProduct,
    getAllProduct,
    getSpecificProduct
}



