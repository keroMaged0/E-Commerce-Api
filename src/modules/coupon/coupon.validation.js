import Joi from "joi";

const addCouponValidation = {
    body: Joi.object({
        couponCode: Joi.string().required().min(3).max(10).alphanum(),
        couponAmount: Joi.number().required().min(1),
        isFixed: Joi.boolean(),
        isPercentage: Joi.boolean(),
        fromDate: Joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)).required(),
        toDate: Joi.date().greater(Joi.ref('fromDate')).required(),
        users: Joi.array().items({
            userId: Joi.string().required(),
            maxUsage: Joi.string().required().min(1)
        }).optional()
    })
}

const updateCouponValidation = {    
    body: Joi.object({
        couponCode: Joi.string().optional().min(3).max(10).alphanum(),
        couponAmount: Joi.number().optional().min(1),
        isFixed: Joi.boolean().optional(),
        isPercentage: Joi.boolean().optional(), 
        couponStatus: Joi.string().optional(), 
        fromDate: Joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)).optional(),
        toDate: Joi.date().greater(Joi.ref('fromDate')).optional(),
        users: Joi.array().items({
            userId: Joi.string().required(),
            maxUsage: Joi.string().required().min(1)
        }).optional()
    })
}

const addCouponToUserValidation = {    
    body: Joi.object({
        couponCode: Joi.string().optional().min(3).max(10).alphanum(),
        couponAmount: Joi.number().optional().min(1),
        isFixed: Joi.boolean().optional(),
        isPercentage: Joi.boolean().optional(), 
        couponStatus: Joi.string().optional(), 
        fromDate: Joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)).optional(),
        toDate: Joi.date().greater(Joi.ref('fromDate')).optional(),
        users: Joi.array().items({
            userId: Joi.string().required(),
            maxUsage: Joi.string().required().min(1)
        }).optional()
    })
}


export{
    addCouponValidation,
    updateCouponValidation,
    addCouponToUserValidation
}