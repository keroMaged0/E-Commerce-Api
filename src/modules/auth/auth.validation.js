import Joi from "joi"

const SignUpValidations = {
    body: Joi.object({
        name: Joi.string().trim().min(2).max(20).lowercase().required(),
        email: Joi.string().trim().lowercase().email().required(),
        password: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
        phonNumbers: Joi.array().items(
            Joi.string().regex(/^\+20\d{10}$/).required(),
        ).optional(),
        age: Joi.number().min(18).max(80).required(),
        address: Joi.array().items({
            street: Joi.string().required,
            city: Joi.string().required,
            homeName: Joi.string().required,
        }).optional(),
        role: Joi.string()
    })
}

const SignInValidations = {
    body: Joi.object({
        email: Joi.string().trim().lowercase().email().required(),
        password: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),

    })
}


export {
    SignUpValidations,
    SignInValidations
}