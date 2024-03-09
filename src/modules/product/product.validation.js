import Joi from "joi";


//=================================== Add product validation ===================================// (done)
const addProductValidation = {
    body: Joi.object({
        title: Joi.string().min(2).max(200).required(),
        description: Joi.string().min(2).max(500).required(),
        basePrice: Joi.number().min(0).required(),
        discount: Joi.number().min(0),
        stock: Joi.number().min(0).required(),
        rate: Joi.number().min(0).max(5),
        Images: Joi.string().optional()
    }),
    query: Joi.object({
        brandId: Joi.string().hex().max(24).required(),
        categoryId: Joi.string().hex().max(24).required(),
        subCategoryId: Joi.string().hex().max(24).required()
    })

};

//=================================== update product validation ===================================//
const updateProductValidation = Joi.object({
    body: Joi.object({
        title: Joi.string().min(2).max(200).optional(),
        description: Joi.string().min(2).max(500).optional(),
        basePrice: Joi.number().min(0).optional(),
        discount: Joi.number().min(0),
        stock: Joi.number().min(0).optional(),
        rate: Joi.number().min(0).max(5),
        Images: Joi.string().optional(),
        oldPublicId: Joi.string().optional()
    }),
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    }).required()
});

//=================================== product id params validation ===================================//
const productIdParams = Joi.object({
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    })
});


export {
    addProductValidation,
    updateProductValidation,
    productIdParams
}