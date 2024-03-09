import Joi from "joi";


//=================================== Add brand validation ===================================//
const addBrandValidation = ({
    body: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        categoryId: Joi.string().hex().max(24).required(),
        subCategoryId: Joi.string().hex().max(24).required(),
        image: Joi.string().optional()
    })
});

//=================================== update brand validation ===================================//
const updateBrandValidation = ({
    body: Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        oldPublicId: Joi.string().optional(),
        categoryId: Joi.string().hex().max(24).optional(),
        subCategoryId: Joi.string().hex().max(24).optional(),
        image: Joi.string().optional()
    }),
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    }).required()
});

//=================================== brand id params validation ===================================//
const brandIdParams = ({
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    })
});


export {
    addBrandValidation,
    updateBrandValidation,
    brandIdParams
}