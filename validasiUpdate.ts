import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateItem = (req: Request, res: Response, next: NextFunction) => {
    // Definisikan schema menggunakan Joi
    const schema = Joi.object({
        name: Joi.string().trim().optional().messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name is required',
            'any.required': 'Name is required'
        }),
        category: Joi.string().trim().optional().messages({
            'string.base': 'Category must be a string',
            'string.empty': 'Category is required',
            'any.required': 'Category is required'
        }),
        location: Joi.string().trim().optional().messages({
            'string.base': 'Location must be a string',
            'string.empty': 'Location is required',
            'any.required': 'Location is required'
        }),
        quantity: Joi.number().integer().min(1).optional().messages({
            'number.base': 'Quantity must be a number',
            'number.min': 'Quantity cannot be less than 1',
            'any.required': 'Quantity is required'
        }),
        user: Joi.optional()
    });

    // Validasi data request body dengan schema Joi
    const { error } = schema.validate(req.body, { abortEarly: false });

    // Jika ada error validasi, kirimkan respons error
    if (error) {
        const errors: Record<string, string> = {};
        error.details.forEach((err) => {
            errors[err.path[0]] = err.message;
        });

        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors,
        });
    }

    // Jika validasi berhasil, lanjutkan ke controller
    next();
};
