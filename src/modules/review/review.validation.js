import Joi from "joi";


//=================================== Add Review validation ===================================// 
const addReviewValidation = {
    body: Joi.object({
        reviewRate: Joi.number().min(1).max(5).required(),
        reviewComment: Joi.string().min(2).max(500).optional(),
    }),
    params: Joi.object({
        productId: Joi.string().hex().max(24).required()
    }).required()
};

//=================================== update Review validation ===================================//
const updateReviewValidation = Joi.object({
    body: Joi.object({
        reviewRate: Joi.number().min(1).max(5).optional(),
        reviewComment: Joi.string().min(2).max(500).optional(),
    }),
    params: Joi.object({
        productId: Joi.string().hex().max(24).required()
    }).required()
});

//=================================== Review id params validation ===================================//
const ReviewIdParams = Joi.object({
    productId: Joi.object({
        id: Joi.string().hex().max(24).required()
    })
});


export {
    addReviewValidation,
    updateReviewValidation,
    ReviewIdParams
}