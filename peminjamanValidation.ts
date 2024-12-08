import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const validasiPinjamSchema = Joi.object({
    userId: Joi.number().required(),
    itemId: Joi.number().required(),
    borrowDate: Joi.date().iso().required(),
    returnDate: Joi.date().iso().greater(Joi.ref('borrowDate')).required(),
    user: Joi.optional()
});


export const validasiPeminjaman = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const validate = validasiPinjamSchema.validate(req.body)
    if (validate.error) {
        return res.status(400).json({
            status: 'error',
            message: validate.error.details.map(err => err.message).join(', ')
        })
    }
    next()
}


const validasianalisisSchema = Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required().greater(Joi.ref("start_date")),
    group_by: Joi.string().valid("category","location").required(),
    user: Joi.optional(),
});


export const validasiAnalisis = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const validate = validasianalisisSchema.validate(req.body)
    if (validate.error) {
        return res.status(400).json({
            status: 'error',
            message: validate.error.details.map(err => err.message).join(', ')
        })
    }
    next()
}
