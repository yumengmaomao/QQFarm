import express from "express"
import { userLoginParamValidate, userSignUpParamValidate, refreshTokenParamValidate } from "@qqfarm/shared-validators"
import userAuthServer from "../services/auth.js"
import tokenServer from "../services/token.js"
const router: express.Router = express.Router()

router.post("/signup", async (req, res, next) => {
    try {
        const { email, nickName, password } = userSignUpParamValidate.parse(req.body)
        const user = await userAuthServer.signUpUser({
            email,
            nickName,
            password
        })
        res.success<typeof user>(user, "账号注册成功")
    } catch (error) {
        next(error)
    }
})
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = userLoginParamValidate.parse(req.body)
        const token = await userAuthServer.loginUser(email, password)
        res.success<Record<string, string>>({ ...token }, "账号登录成功")
    } catch (error) {
        next(error)
    }
})

router.post("/refresh", async (req, res, next) => {
    try {
        const { refreshToken } = refreshTokenParamValidate.parse(req.body)
        const token = await tokenServer.refreshToken(refreshToken)
        res.success<Record<string, string>>({ ...token }, "token刷新成功")
    } catch (error) {
        next(error)
    }
})
router.get("/auth", () => {
    console.log("222")
})
export default router
