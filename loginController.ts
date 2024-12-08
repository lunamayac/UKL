import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { SECRET_KEY } from '../global'

const prisma = new PrismaClient()

export const loginController = async (req: Request, res: Response): Promise<any> => {
    try {
        // Validate request body
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required'
            })
        }

        const { username, password } = req.body

        const user = await prisma.user.findFirst({
            where: {
                username
            }
        })
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid password'
            })
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            SECRET_KEY,
            { expiresIn: '1d' }
        )

        return res.status(200).json({
            status: 'success',
            message: 'login berhasil',
            token
        })
        
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
            error
        })
    }
}