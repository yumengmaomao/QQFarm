import * as z from "zod"
import { LeaderboardType } from "@qqfarm/shared-types"
export const LeaderboardQueryValidate = z.object({
    type: z.enum(LeaderboardType, {
        error: (issue) =>
            issue.code === "invalid_value" ? "无效的排行榜类型，只能是 'wealth' 或 'level'" : "排行榜类型不能为空"
    }),
    limit: z.coerce
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "limit不能为空" : "limit必须是数字")
        })
        .int({
            error: "限制数量必须是整数"
        })
        .positive({
            error: "限制数量必须是正整数"
        })
        .max(50, {
            error: "每次最多获取50条记录"
        })
        .optional()
        .default(10),
    offset: z.coerce
        .number({
            error: (issue) => (issue.code === "invalid_type" ? "offset不能为空" : "offset必须是数字")
        })
        .int({
            error: "偏移量必须是整数"
        })
        .min(0, {
            error: "偏移量不能为负数"
        })
        .optional()
        .default(0)
})
