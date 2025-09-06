import * as z from "zod"

/**
 * 验证发送好友请求的请求体。
 */
export const sendFriendRequestValidate = z.object({
    addresseeEmail: z.email({
        error: (issue) => (issue.code == "invalid_type" ? "email字段不能为空" : "请输入有效的邮箱地址")
    })
})

/**
 * 验证响应好友请求的请求体和URL参数。
 */
export const respondToRequestValidate = z.object({
    requesterId: z.coerce
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "请求者ID不能为空" : "请求者ID必须是数字")
        })
        .int({
            error: "请求者ID必须是整数"
        })
        .positive({
            error: "无效的请求者ID。"
        }),
    action: z.enum(["accept", "reject"], {
        error: (issue) => (issue.code === "invalid_value" ? "操作只能是 'accept' 或 'reject'" : "操作不能为空")
    })
})

/**
 * 验证删除好友的URL参数。
 */
export const deleteFriendValidate = z.object({
    friendId: z.coerce
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "好友ID不能为空" : "好友ID必须是数字")
        })
        .int({
            error: "好友ID必须是整数"
        })
        .positive({
            error: "无效的好友ID。"
        })
})
