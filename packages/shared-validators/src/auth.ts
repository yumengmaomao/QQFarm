// packages/shared-validators/src/auth.ts
import * as z from "zod"

export const userSignUpParamValidate = z.object({
    email: z.email({
        error: (issue) => (issue.code == "invalid_type" ? "email字段不能为空" : "请输入有效的邮箱地址")
    }),
    nickName: z
        .string({
            error: (issue) => (issue.code == "invalid_type" ? "昵称不能为空" : "昵称只能是string类型")
        })
        .min(4, { error: "昵称长度应该在4-6位" })
        .max(8, { error: "昵称长度应该在4-8位" }),
    password: z
        .string({
            error: (issue) => (issue.code == "invalid_type" ? "密码不能为空" : "密码只能是string类型")
        })
        .min(8, { error: "密码长度应该大于8位" })
})

export const userLoginParamValidate = z.object({
    email: z.email({
        error: (issue) => (issue.code === "invalid_type" ? "email字段不能为空" : "请输入有效的邮箱地址")
    }),
    password: z
        .string({
            error: (issue) => (issue.code === "invalid_type" ? "密码不能为空" : "密码只能是string类型")
        })
        .min(8, {
            error: "密码必须要大于8位"
        })
})

export const refreshTokenParamValidate = z.object({
    refreshToken: z
        .string({
            error: (issue) => (issue.code === "invalid_type" ? "refreshToken不能为空" : "refreshToken只能是string类型")
        })
        .min(16, {
            error: "非法的refreshToken"
        })
})
