import bcrypt from "bcrypt"
import prisma from "../utils/prisma.js"
import tokenServer from "./token.js"
import gameServer from "./game.js"
import { getLogger } from "../utils/logger.js"
import { ApiError } from "../utils/ApiError.js" // 导入 ApiError
import { AppErrorCodes } from "../utils/errorCodes.js"
const logger = getLogger("AuthService")
async function findUserAuthDataByEmail(email: string) {
    return await prisma.userAuth.findUnique({
        where: {
            email: email
        }
    })
}

async function loginUser(email: string, password: string) {
    try {
        const userAuth = await findUserAuthDataByEmail(email)

        if (!userAuth) {
            throw new ApiError(401, AppErrorCodes.INVALID_CREDENTIALS, "用户名或密码无效")
        }

        const isMatch = await bcrypt.compare(password, userAuth.password)

        if (!isMatch) {
            throw new ApiError(401, AppErrorCodes.INVALID_CREDENTIALS, "用户名或密码无效")
        }
        return await tokenServer.generateTokens(userAuth)
    } catch (error) {
        throw error
    }
}
async function signUpUser(userSignUpData: any) {
    try {
        const { email, nickName, password } = userSignUpData
        const currentUser = await prisma.userAuth.findFirst({
            where: {
                email: email
            }
        })

        if (currentUser) {
            throw new ApiError(409, AppErrorCodes.EMAIL_ALREADY_EXISTS, "此邮箱已注册")
        }

        logger.info(`开始为账号 ${userSignUpData.email} 创建 userAuth, user `)
        const newUser = await prisma.$transaction(async (tx) => {
            const salt = await bcrypt.genSalt(10)
            const passwordHash = await bcrypt.hash(password, salt)

            const userAuth = await tx.userAuth.create({
                data: {
                    email: email,
                    nickName: nickName,
                    password: passwordHash
                }
            })
            const user = await tx.user.create({
                data: {
                    nickName,
                    authId: userAuth.id
                }
            })

            logger.info(`账号 ${userSignUpData.email} 已创建 user: ${user.id} `)
            return user
        })
        await gameServer.initializeNewUserGameData(newUser.id)
        return newUser
    } catch (error) {
        logger.error(`账号 ${userSignUpData.email} 创建过程出现错误 `, error)
        throw error
    }
}
const userAuthServer = {
    findUserAuthDataByEmail,
    loginUser,
    signUpUser
}

export default userAuthServer
