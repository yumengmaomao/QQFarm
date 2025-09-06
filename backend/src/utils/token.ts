import jwt from "jsonwebtoken"
import type { AuthJwtPayload } from "../types/jwt.js"
const secret: jwt.Secret = process.env.JWT_Secret || "flow"
export function createToken(data: any, expiresIn: number) {
    return jwt.sign({ ...data }, secret, {
        expiresIn: expiresIn ? expiresIn : 60 * 60
    })
}
export function validateToken(token: string) {
    return jwt.verify(token, secret) as AuthJwtPayload
}
