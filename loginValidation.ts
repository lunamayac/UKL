import { NextFunction, Request, Response } from "express"
import joi from "joi"

const loginSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
    role: joi.string().valid('ADMIN', 'USER')
})

export const loginValidate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const validate = loginSchema.validate(req.body)
    if (validate.error) {
        return res.status(400).json({
            status: 'error',
            message: validate.error.details.map(err => err.message).join(', ')
        })
    }
    next()
}