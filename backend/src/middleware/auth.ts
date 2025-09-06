import type { Request, Response, NextFunction } from "express"
import prisma from "../utils/prisma.js"
import { ApiError } from "../utils/ApiError.js" // 导入 ApiError
import { AppErrorCodes } from "../utils/errorCodes.js"
import { validateToken } from "../utils/token.js"
export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, AppErrorCodes.UNAUTHORIZED, "Authorization 字段缺失或者非法")
        }

        const token = authHeader.split(" ")[1]
        if (!token) {
            throw new ApiError(401, AppErrorCodes.UNAUTHORIZED, "Authorization 字段无法解析")
        }

        const { sub, email } = validateToken(token)
        const user = await prisma.user.findUnique({
            where: {
                authId: parseInt(sub, 10)
            }
        })
        if (!user) {
            throw new ApiError(401, AppErrorCodes.UNAUTHORIZED, "token 解析错误")
        }
        const farm = await prisma.farm.findUnique({
            where: {
                userId: user.id
            }
        })
        if (!farm) throw new ApiError(500, AppErrorCodes.INTERNAL_SERVER_ERROR, `${user.id}的农场未初始化`)
        req.user = {
            userId: user.id,
            email: email,
            farmId: farm.id,
            nickName: user.nickName
        }
        next()
    } catch (error) {
        next(error)
    }
}
