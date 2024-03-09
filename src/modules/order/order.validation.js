import Joi from "joi";

export const addOrderValidation = {
    body: Joi.object({
        product: Joi.string().hex().max(24).required(),
        quantity: Joi.number().required().min(1),
        couponCode: Joi.string().trim().optional(),
        shippingAddress: Joi.array().items({
            address: Joi.string().required(),
            city: Joi.string().required(),
            postalCode: Joi.string().required(),
            country: Joi.string().required(),
        }),
        phoneNumbers: Joi.array().items({
            phNumber: Joi.string().regex(/^\+20\d{10}$/).required(),
        }),
        paymentMethod: Joi.string().required(),
    })
}

export const CartToOrderValidation = {
    body: Joi.object({
        couponCode: Joi.string().trim().optional(),
        shippingAddress: Joi.array().items({
            address: Joi.string().required(),
            city: Joi.string().required(),
            postalCode: Joi.string().required(),
            country: Joi.string().required(),
        }),
        phoneNumbers: Joi.array().items({
            phNumber: Joi.string().regex(/^\+20\d{10}$/).required(),
        }),
        paymentMethod: Joi.string().required(),
    })
}

export const paramsOrderValidation = {
    params  : Joi.object({
        orderId: Joi.string().hex().max(24).required()
    })
} 