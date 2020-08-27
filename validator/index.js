const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

    return res.status(422).json({
        errors: extractedErrors,
    })
}


const userValidationRules = () => {
    return [
        body("name", "name is required").notEmpty(),
        body("is_public", "account type is required").isBoolean().notEmpty(),

    body("email", "email must be between 3 to 32")
        .matches(/.+\@.+\..+/ )
        .withMessage("email must contain @ character").isLength({
        min: 4,
        max:100
    }),

    body("password", "password is required").notEmpty(),
    body("password").isLength({
        min: 6
    })
        .withMessage("Password must be atlest 6 chracrters long")
        .matches(/\d/)
        .withMessage("Password must contain atleast one digit"),

]
}


const passwordlidationRules = () => {
    return [
        body("newPassword", "password is required").notEmpty(),
        body("newPassword").isLength({
            min: 6
        })
            .withMessage("Password must be atlest 6 chracrters long")
            .matches(/\d/)
            .withMessage("Password must contain atleast one digit"),

    ]
}



const securityvalidationRules = () => {
    return [
        body("security_answer", "answer is required").notEmpty()
    ]
}

module.exports = {
    userValidationRules,
    passwordlidationRules,
    securityvalidationRules,
    validate,
}