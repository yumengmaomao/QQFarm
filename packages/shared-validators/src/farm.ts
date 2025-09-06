// packages/shared-validators/src/farm.ts
import * as z from "zod"

export const plotIndexParamValidate = z.object({
    plotIndex: z.coerce
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "地块序号不能为空" : "地块序号必须是数字")
        })
        .int({
            error: "地块序号必须是整数"
        })
        .min(1, {
            error: "无效的地块序号"
        })
        .max(25, {
            error: "无效的地块序号"
        })
})

export const plantIdBodyValidate = z.object({
    plantId: z
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "plantId 不能为空" : "plantId 必须是数字")
        })
        .int({
            error: "plantId 必须是整数"
        })
        .min(1, {
            error: "无效的种子ID"
        })
        .max(2000, {
            error: "无效的种子ID"
        })
})

export const fertilizeBodyValidate = z.object({
    reduction: z.object({
        type: z.enum(["PERCENTAGE", "SECONDS"], {
            error: (issue) => (issue.code === "invalid_value" ? "类型只能是PERCENTAGE或SECONDS" : "类型不能为空")
        }),
        value: z
            .number({
                error: (issue) => (issue.code === "invalid_type" ? "值不能为空" : "值必须是数字")
            })
            .positive({
                error: "减少的时间或百分比必须是正数"
            })
    })
})

export const addFriendBodyValidate = z.object({
    friendEmail: z.email({
        error: (issue) => (issue.code == "invalid_type" ? "email字段不能为空" : "请输入有效的邮箱地址")
    })
})

export const friendIdParamValidate = z.object({
    friendId: z.coerce
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "好友ID不能为空" : "好友ID必须是数字")
        })
        .int({
            error: "好友ID必须是整数"
        })
        .positive({
            error: "无效的好友ID"
        })
})

export const friendPlotParamsValidate = z.object({
    friendId: z.coerce
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "好友ID不能为空" : "好友ID必须是数字")
        })
        .int({
            error: "好友ID必须是整数"
        })
        .positive({
            error: "无效的好友ID"
        }),
    plotIndex: z.coerce
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "地块序号不能为空" : "地块序号必须是数字")
        })
        .int({
            error: "地块序号必须是整数"
        })
        .min(1, {
            error: "无效的地块序号"
        })
        .max(25, {
            error: "无效的地块序号"
        })
})
