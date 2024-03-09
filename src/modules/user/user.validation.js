import Joi from "joi"


const updateUserValidation = ({
    body: Joi.object({
        name: Joi.string().trim().min(2).max(20).lowercase().optional(),
        email: Joi.string().trim().lowercase().email().optional(),
        phonNumbers: Joi.array().items(
            Joi.string().regex(/^\+20\d{10}$/).required(),
        ).optional(),
        age: Joi.number().min(18).max(80).optional(),
        address: Joi.array().items({
            street: Joi.string().required,
            city: Joi.string().required,
            homeName: Joi.string().required,
        }).optional(),
    })
})

const changePasswordValidation = ({
    body: Joi.object({
        oldPassword: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
        newPassword: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    })
})


const deleteUserValidation = ({
    params: Joi.object({
        id: Joi.string().hex().max(24).required()
    })
})

const forgetPasswordValidation = ({
    body: Joi.object({
        email: Joi.string().trim().lowercase().email().required(),
    })
})

const resetPasswordValidation = Joi.object({
    params: Joi.object({
        token: Joi.string().required(),
    }),
    body: Joi.object({
        newPassword: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    })
})


export {
    updateUserValidation,
    changePasswordValidation,
    deleteUserValidation,
    forgetPasswordValidation,
    resetPasswordValidation
}