import Joi from "joi";


//=================================== Add subCategory validation ===================================//
const addSubCategoryValidation = ({
    body: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        categoryId: Joi.string().hex().max(24).required(),
        image: Joi.string().optional()
    })
});

//=================================== update category validation ===================================//
const updateSubCategoryValidation = ({
    body: Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        oldPublicId: Joi.string().optional(),
        categoryId: Joi.string().hex().max(24).optional(),
        image: Joi.string().optional()
    }),
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    }).required()
});

//=================================== category id params validation ===================================//
const subCategoryIdParams = ({
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    })
});


export {
    addSubCategoryValidation,
    updateSubCategoryValidation,
    subCategoryIdParams
}