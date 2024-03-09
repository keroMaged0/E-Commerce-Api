import Joi from "joi";


//=================================== Add category validation ===================================//
const addCategoryValidation = {
    body: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        image: Joi.string().optional()
    })
};

//=================================== update category validation ===================================//
const updateCategoryValidation = {
    body: Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        oldPublicId: Joi.string().optional(),
        image: Joi.string().optional()
    }),
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    })
};

//=================================== category id params validation ===================================//
const categoryIdParams = {
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    })
};


export {
    addCategoryValidation,
    updateCategoryValidation,
    categoryIdParams
}