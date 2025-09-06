import crypto from "crypto"
import bcrypt from "bcrypt"
import prisma from "../utils/prisma.js"
import { createToken, validateToken } from "../utils/token.js"
import { ApiError } from "../utils/ApiError.js" // 导入 ApiError
import { AppErrorCodes } from "../utils/errorCodes.js" // 导入错误码

async function refreshToken(token: string) {
    const { sub, email } = validateToken(token)
    const userAuth = await prisma.userAuth.findUnique({
        where: {
            id: parseInt(sub, 10)
        }
    })
    if (!userAuth || !userAuth.refreshToken || userAuth.refreshToken !== token) {
        throw new ApiError(401, AppErrorCodes.INVALID_REFRESH_TOKEN, "非法的或已过期的刷新令牌")
    }
    const { accessToken, refreshToken } = await generateTokens(userAuth)

    await prisma.userAuth.update({
        data: {
            refreshToken: refreshToken
        },
        where: {
            id: userAuth.id
        }
    })
    return {
        accessToken,
        refreshToken
    }
}

async function generateTokens(userAuth: any) {
    const accessToken = createToken(
        {
            sub: userAuth.id,
            email: userAuth.email
        },
        60 * 60
    )
    const rawToken = crypto.randomBytes(40).toString("hex")
    const salt = await bcrypt.genSalt(10)
    const refreshToken = await bcrypt.hash(rawToken, salt)
    return {
        accessToken,
        refreshToken
    }
}

const tokenServer = {
    refreshToken,
    generateTokens
}
export default tokenServer
