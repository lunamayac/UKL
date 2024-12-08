import { NextFunction, Request, Response} from "express"
import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "../global";

interface JwtPayload {
    id   : string
    name : string
    email: string
    role : string
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        res.status(403).json({
            message: 'Access denied. No token provided.'
        })
        return
    }

    try {
        const secretKey = SECRET_KEY || ''
        const decoded = verify(token, secretKey)
        req.body.user = decoded as JwtPayload
        next()
    } catch (error) {
        res.status(401).json({
            message: 'Invalid Token'
        })
        return
    }
}

export const verifyRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.body.user

        if (!user) {
            res.status(403).json({
                message: 'No user information available.'
            })
            return
        }


        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({
                message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
            })
            return
        }

        next()
    }
}