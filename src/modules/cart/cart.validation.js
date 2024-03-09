import Joi from "joi";
export const addCartValidation = {
    body: Joi.object({
        productId: Joi.string().hex().max(24).required(),
        quantity: Joi.number().min(1).required(),
    })
}

export const removeProductCartValidation = {
    params: Joi.object({
        productId: Joi.string().hex().max(24).required(),
    })
}

